import * as Y from 'yjs';
import { Code, decodeDown, encodeDestroy, encodePush, encodeSnap, type DownFrame } from '../../../../sync/src/protocol';
import { deriveRoom, open, seal, type RoomKeys } from './relayCrypto';
import { Reassembler, split } from './relayChunks';

// A Yjs provider that keeps a design in step through the OpenTempl relay, a
// Cloudflare Durable Object per room. Every update is sealed with AES-GCM under
// a key derived from the share link before it leaves this device, so the relay
// stores and forwards ciphertext it cannot read. It works next to the WebRTC
// provider: WebRTC is quicker, the relay still delivers when nobody else is online.
//
// Convergence rests on one idea: we track which part of the document the relay
// already holds (a state vector built from the rows it sends us), and whatever
// the document has beyond that is what we push. After a reconnect that is exactly
// the edits made while offline, with no queue to persist.

export type RelayStatus = 'connecting' | 'syncing' | 'synced' | 'offline' | 'gone' | 'full';

export const RELAY_URL = 'wss://opentempl-sync.opencursor.workers.dev';

export interface SocketLike {
  readyState: number;
  binaryType: string;
  send(data: string | Uint8Array): void;
  close(code?: number, reason?: string): void;
  onopen: ((e: unknown) => void) | null;
  onmessage: ((e: { data: unknown }) => void) | null;
  onclose: ((e: { code: number }) => void) | null;
  onerror: ((e: unknown) => void) | null;
}

export interface RelayOptions {
  url?: string;
  createSocket?: (url: string) => SocketLike;
  compactRows?: number; // log length that triggers a snapshot, for tests
}

const OPEN = 1;
const FLUSH_DELAY_MS = 120;
const COMPACT_ROWS = 150;
const COMPACT_BYTES = 6 * 1024 * 1024;
const COMPACT_EVERY_MS = 20_000;
const PING_EVERY_MS = 25_000;
const DEAD_AFTER_MS = 70_000;

function relayUrl(): string {
  // Local development and the browser tests can point at a worker on this machine.
  if (import.meta.env?.DEV) {
    try {
      const o = localStorage.getItem('opentempl:relay');
      if (o) return o;
    } catch {
      /* fall through */
    }
  }
  return RELAY_URL;
}

function mergeClocks(into: Map<number, number>, update: Uint8Array) {
  for (const [client, clock] of Y.decodeStateVector(Y.encodeStateVectorFromUpdate(update))) if ((into.get(client) ?? 0) < clock) into.set(client, clock);
}

export class RelayProvider {
  status: RelayStatus = 'connecting';
  lastError = '';
  onStatus?: (s: RelayStatus) => void;
  // Resolves once the relay's stored log has been merged in (or the room is gone).
  readonly ready: Promise<void>;

  private resolveReady!: () => void;
  private keys: RoomKeys | null = null;
  private ws: SocketLike | null = null;
  private destroyed = false;
  private gone = false;
  private full = false;
  private everOpened = false;
  private caughtUp = false;
  private attempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | undefined;
  private flushTimer: ReturnType<typeof setTimeout> | undefined;
  private pingTimer: ReturnType<typeof setInterval> | undefined;
  private holdOffUntil = 0;
  private lastHeard = 0;

  private serverClocks = new Map<number, number>();
  private sentClocks = new Map<number, number>();
  private reassembler = new Reassembler();
  private chain: Promise<void> = Promise.resolve();
  private lastSeq = 0;
  private logRows = 0;
  private logBytes = 0;
  private outstanding = 0;
  private dirty = false;
  private compacting = false;
  private lastCompact = 0;
  private snapWaiter: (() => void) | null = null;
  private goneWaiter: ((ok: boolean) => void) | null = null;
  private destroyOnOpen = false;

  constructor(
    readonly doc: Y.Doc,
    roomKey: string,
    private opts: RelayOptions = {},
  ) {
    this.ready = new Promise((r) => (this.resolveReady = r));
    doc.on('update', this.onDocUpdate);
    globalThis.addEventListener?.('online', this.onOnline);
    deriveRoom(roomKey).then((k) => {
      this.keys = k;
      this.dirty = this.unsynced;
      this.connect();
    });
  }

  private get unsynced() {
    try {
      return !!this.keys && localStorage.getItem(`opentempl:unsynced:${this.keys.roomId}`) === '1';
    } catch {
      return false;
    }
  }

  private setUnsynced(v: boolean) {
    if (!this.keys) return;
    try {
      const k = `opentempl:unsynced:${this.keys.roomId}`;
      if (v) localStorage.setItem(k, '1');
      else localStorage.removeItem(k);
    } catch {
      /* the flag only saves a redundant push */
    }
  }

  private refresh() {
    let s: RelayStatus;
    if (this.gone) s = 'gone';
    else if (this.full) s = 'full';
    else if (!this.ws || this.ws.readyState !== OPEN) s = this.everOpened ? 'offline' : 'connecting';
    else if (!this.caughtUp || this.outstanding > 0 || this.dirty || this.flushTimer) s = 'syncing';
    else s = 'synced';
    if (s === this.status) return;
    this.status = s;
    this.onStatus?.(s);
  }

  private connect() {
    if (this.destroyed || this.gone || !this.keys) return;
    if (this.ws && this.ws.readyState <= OPEN) return;
    clearTimeout(this.reconnectTimer);
    const url = `${this.opts.url ?? relayUrl()}/v1/room/${this.keys.roomId}`;
    let ws: SocketLike;
    try {
      ws = (this.opts.createSocket ?? ((u) => new WebSocket(u) as unknown as SocketLike))(url);
    } catch {
      this.scheduleReconnect();
      return;
    }
    ws.binaryType = 'arraybuffer';
    this.ws = ws;
    this.caughtUp = false;
    this.outstanding = 0;
    this.reassembler = new Reassembler();
    this.serverClocks = new Map();
    this.logRows = 0;
    this.logBytes = 0;
    ws.onopen = () => {
      if (ws !== this.ws) return;
      this.everOpened = true;
      this.lastHeard = Date.now();
      this.startPing();
      if (this.destroyOnOpen) ws.send(encodeDestroy());
      this.refresh();
    };
    ws.onmessage = (e) => {
      if (ws !== this.ws) return;
      this.lastHeard = Date.now();
      if (typeof e.data === 'string') return;
      const f = decodeDown(new Uint8Array(e.data as ArrayBuffer));
      if (f) this.chain = this.chain.then(() => this.handle(f, ws)).catch(() => {});
    };
    ws.onclose = () => {
      if (ws !== this.ws) return;
      this.ws = null;
      clearInterval(this.pingTimer);
      this.caughtUp = false;
      this.goneWaiter?.(this.gone);
      this.refresh();
      this.scheduleReconnect();
    };
    ws.onerror = () => {};
    this.refresh();
  }

  private scheduleReconnect() {
    if (this.destroyed || this.gone) return;
    clearTimeout(this.reconnectTimer);
    const backoff = Math.min(30_000, 1000 * 2 ** this.attempt++) * (0.5 + Math.random() / 2);
    const wait = Math.max(backoff, this.holdOffUntil - Date.now());
    this.reconnectTimer = setTimeout(() => this.connect(), wait);
  }

  private onOnline = () => {
    if (this.ws && this.ws.readyState <= OPEN) return;
    this.attempt = 0;
    this.connect();
  };

  private startPing() {
    clearInterval(this.pingTimer);
    this.pingTimer = setInterval(() => {
      const ws = this.ws;
      if (!ws || ws.readyState !== OPEN) return;
      if (Date.now() - this.lastHeard > DEAD_AFTER_MS) ws.close();
      else ws.send('ping');
    }, PING_EVERY_MS);
  }

  private async handle(f: DownFrame, ws: SocketLike) {
    if (ws !== this.ws || !this.keys) return;
    switch (f.kind) {
      case 'row': {
        this.lastSeq = Math.max(this.lastSeq, f.seq);
        this.logRows++;
        this.logBytes += f.blob.length;
        const sealed = this.reassembler.add(f.seq, f.blob);
        if (!sealed) return;
        const update = await open(this.keys, sealed);
        if (!update || ws !== this.ws) return;
        Y.applyUpdate(this.doc, update, this);
        mergeClocks(this.serverClocks, update);
        mergeClocks(this.sentClocks, update);
        this.maybeCompact();
        return;
      }
      case 'ready':
        this.caughtUp = true;
        this.attempt = 0;
        this.sentClocks = new Map(this.serverClocks);
        this.resolveReady();
        // After a reconnect the document may hold edits the relay never saw.
        if (this.dirty || this.unsynced || this.serverClocksBehind()) await this.flush();
        this.maybeCompact();
        this.refresh();
        return;
      case 'ack':
        this.outstanding = Math.max(0, this.outstanding - 1);
        this.lastSeq = Math.max(this.lastSeq, f.seq);
        this.logRows++;
        if (!this.outstanding && !this.dirty && !this.flushTimer) this.setUnsynced(false);
        this.maybeCompact();
        this.refresh();
        return;
      case 'snapped':
        this.logRows = f.rows;
        this.full = false;
        this.lastCompact = Date.now();
        this.snapWaiter?.();
        this.refresh();
        return;
      case 'gone':
        this.gone = true;
        this.goneWaiter?.(true);
        this.resolveReady();
        this.refresh();
        return;
      case 'error':
        this.lastError = f.message;
        if (f.code === Code.RoomFull) {
          this.full = true;
          void this.compact(true);
        } else if (f.code === Code.RateLimited) {
          // Reconnecting re-derives what is missing, so dropped messages cost nothing.
          this.holdOffUntil = Date.now() + 2000;
          ws.close();
        }
        this.refresh();
        return;
    }
  }

  // True when our document has structs the relay's log does not cover.
  private serverClocksBehind() {
    const mine = Y.decodeStateVector(Y.encodeStateVector(this.doc));
    for (const [client, clock] of mine) if ((this.sentClocks.get(client) ?? 0) < clock) return true;
    return false;
  }

  private onDocUpdate = (_u: Uint8Array, origin: unknown) => {
    if (origin === this) return;
    this.dirty = true;
    this.setUnsynced(true);
    if (!this.caughtUp || this.flushTimer) return;
    this.flushTimer = setTimeout(() => void this.flush(), FLUSH_DELAY_MS);
    this.refresh();
  };

  // Several quick edits (a drag, typing) become one sealed message.
  private async flush() {
    clearTimeout(this.flushTimer);
    this.flushTimer = undefined;
    const ws = this.ws;
    if (!ws || ws.readyState !== OPEN || !this.caughtUp || !this.keys) return;
    const diff = Y.encodeStateAsUpdate(this.doc, Y.encodeStateVector(this.sentClocks));
    this.sentClocks = Y.decodeStateVector(Y.encodeStateVector(this.doc));
    this.dirty = false;
    if (diff.length <= 2) {
      this.setUnsynced(false);
      this.refresh();
      return;
    }
    const blobs = split(await seal(this.keys, diff));
    for (const blob of blobs) {
      if (ws !== this.ws || ws.readyState !== OPEN) return;
      this.outstanding++;
      this.logBytes += blob.length;
      ws.send(encodePush(blob));
    }
    this.refresh();
  }

  private maybeCompact() {
    if (this.logRows >= (this.opts.compactRows ?? COMPACT_ROWS) || this.logBytes >= COMPACT_BYTES) void this.compact(false);
  }

  // Replace the log with one sealed snapshot. The relay cannot merge what it
  // cannot read, so a client does it. Only rows this client has fully merged are
  // replaced; anything newer stays in the log.
  private async compact(force: boolean) {
    const ws = this.ws;
    if (this.compacting || !ws || ws.readyState !== OPEN || !this.caughtUp || !this.keys) return;
    if (!force && Date.now() - this.lastCompact < (this.opts.compactRows ? 0 : COMPACT_EVERY_MS)) return;
    const open = this.reassembler.earliestOpenSeq;
    const upTo = open === null ? this.lastSeq : Math.min(this.lastSeq, open - 1);
    if (upTo < 1) return;
    this.compacting = true;
    this.lastCompact = Date.now();
    try {
      const snapshot = Y.encodeStateAsUpdate(this.doc);
      const blobs = split(await seal(this.keys, snapshot));
      const done = new Promise<void>((resolve) => {
        this.snapWaiter = resolve;
        setTimeout(resolve, 30_000);
      });
      blobs.forEach((blob, i) => ws.readyState === OPEN && ws.send(encodeSnap(i === blobs.length - 1, upTo, blob)));
      await done;
    } finally {
      this.snapWaiter = null;
      this.compacting = false;
    }
  }

  // Ask the relay to delete the room. Resolves true once it confirms.
  async deleteRoom(): Promise<boolean> {
    if (this.gone) return true;
    const confirmed = new Promise<boolean>((resolve) => {
      this.goneWaiter = resolve;
      setTimeout(() => resolve(this.gone), 6000);
    });
    this.destroyOnOpen = true;
    if (this.ws?.readyState === OPEN) this.ws.send(encodeDestroy());
    else {
      this.attempt = 0;
      this.connect();
    }
    const ok = await confirmed;
    this.goneWaiter = null;
    return ok;
  }

  destroy() {
    this.destroyed = true;
    this.doc.off('update', this.onDocUpdate);
    globalThis.removeEventListener?.('online', this.onOnline);
    clearTimeout(this.reconnectTimer);
    clearTimeout(this.flushTimer);
    clearInterval(this.pingTimer);
    const ws = this.ws;
    this.ws = null;
    ws?.close();
    this.resolveReady();
  }
}
