import Peer, { type DataConnection } from 'peerjs';
import * as Y from 'yjs';
import { Awareness, applyAwarenessUpdate, encodeAwarenessUpdate } from 'y-protocols/awareness';

// A Yjs provider over WebRTC data channels, using the free PeerJS broker only to
// introduce peers. The first person in a room becomes its host under a peer id
// derived from the secret room key; everyone else connects to the host, which
// relays updates (a star). If the host leaves, the next peer takes over.
// Data channels are encrypted end to end by WebRTC (DTLS).

type Msg =
  | { t: 'sync1'; sv: Uint8Array } // here is my state vector, send what I miss
  | { t: 'sync2'; u: Uint8Array } // the updates you asked for
  | { t: 'up'; u: Uint8Array } // a live document update
  | { t: 'aw'; u: Uint8Array }; // an awareness update (cursors, names, selections)

const toU8 = (x: unknown) => (x instanceof Uint8Array ? x : new Uint8Array(x as ArrayBuffer));

async function roomHostId(room: string) {
  // Hash the key so the broker never sees it.
  // The 'tavla' room prefix stays on purpose: old share links must reach the same room.
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`tavla:${room}`));
  return 'tavla-' + [...new Uint8Array(digest)].slice(0, 12).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export class PeerProvider {
  readonly awareness: Awareness;
  private peer: Peer | null = null;
  private conns = new Map<string, DataConnection>();
  private isHost = false;
  private destroyed = false;
  private hostId = '';
  private retry = 0;
  status: 'connecting' | 'host' | 'guest' | 'offline' = 'connecting';
  onStatus?: (s: PeerProvider['status']) => void;

  constructor(
    readonly doc: Y.Doc,
    readonly room: string,
  ) {
    this.awareness = new Awareness(doc);
    doc.on('update', this.onDocUpdate);
    this.awareness.on('update', this.onAwarenessUpdate);
    roomHostId(room).then((id) => {
      this.hostId = id;
      this.becomeHostOrJoin();
    });
  }

  private setStatus(s: PeerProvider['status']) {
    this.status = s;
    this.onStatus?.(s);
  }

  private becomeHostOrJoin() {
    if (this.destroyed) return;
    const p = new Peer(this.hostId, { debug: 0 });
    p.on('open', () => {
      this.peer = p;
      this.isHost = true;
      this.retry = 0;
      this.setStatus('host');
      p.on('connection', (c) => this.attach(c));
    });
    p.on('error', (err: { type?: string }) => {
      if (err.type === 'unavailable-id') {
        // Someone already hosts this room: join them instead.
        p.destroy();
        this.joinAsGuest();
      } else this.scheduleRetry(p);
    });
    p.on('disconnected', () => {
      if (!this.destroyed && !p.destroyed && this.peer === p) p.reconnect();
    });
  }

  private joinAsGuest() {
    if (this.destroyed) return;
    const p = new Peer({ debug: 0 });
    this.peer = p;
    this.isHost = false;
    p.on('open', () => {
      const c = p.connect(this.hostId, { reliable: true, serialization: 'binary' });
      this.attach(c);
    });
    p.on('error', (err: { type?: string }) => {
      // The host vanished between our checks: try to host the room ourselves.
      if (err.type === 'peer-unavailable') this.scheduleRetry(p, true);
      else this.scheduleRetry(p);
    });
  }

  private scheduleRetry(p: Peer, now = false) {
    if (this.destroyed) return;
    p.destroy();
    this.setStatus('offline');
    const wait = now ? 300 + Math.random() * 700 : Math.min(15000, 1000 * 2 ** this.retry++);
    setTimeout(() => this.becomeHostOrJoin(), wait);
  }

  private attach(c: DataConnection) {
    c.on('open', () => {
      this.conns.set(c.peer, c);
      if (!this.isHost) {
        this.retry = 0;
        this.setStatus('guest');
      }
      this.send(c, { t: 'sync1', sv: Y.encodeStateVector(this.doc) });
      this.send(c, { t: 'aw', u: encodeAwarenessUpdate(this.awareness, [...this.awareness.getStates().keys()]) });
    });
    c.on('data', (raw) => this.onMessage(c, raw as Msg));
    const gone = () => {
      this.conns.delete(c.peer);
      // A guest that loses its host starts over and may become the new host.
      if (!this.isHost && !this.destroyed) this.scheduleRetry(this.peer!, true);
    };
    c.on('close', gone);
    c.on('error', gone);
  }

  private send(c: DataConnection, m: Msg) {
    if (c.open) c.send(m);
  }

  private broadcast(m: Msg, except?: DataConnection) {
    this.conns.forEach((c) => c !== except && this.send(c, m));
  }

  private onMessage(from: DataConnection, m: Msg) {
    switch (m.t) {
      case 'sync1':
        this.send(from, { t: 'sync2', u: Y.encodeStateAsUpdate(this.doc, toU8(m.sv)) });
        break;
      case 'sync2':
      case 'up':
        Y.applyUpdate(this.doc, toU8(m.u), this);
        if (this.isHost) this.broadcast({ t: 'up', u: toU8(m.u) }, from);
        break;
      case 'aw':
        applyAwarenessUpdate(this.awareness, toU8(m.u), this);
        if (this.isHost) this.broadcast({ t: 'aw', u: toU8(m.u) }, from);
        break;
    }
  }

  private onDocUpdate = (u: Uint8Array, origin: unknown) => {
    if (origin === this) return;
    this.broadcast({ t: 'up', u });
  };

  private onAwarenessUpdate = ({ added, updated, removed }: { added: number[]; updated: number[]; removed: number[] }, origin: unknown) => {
    if (origin === this) return;
    this.broadcast({ t: 'aw', u: encodeAwarenessUpdate(this.awareness, [...added, ...updated, ...removed]) });
  };

  get peerCount() {
    return this.conns.size;
  }

  destroy() {
    this.destroyed = true;
    this.doc.off('update', this.onDocUpdate);
    this.awareness.off('update', this.onAwarenessUpdate);
    this.awareness.destroy();
    this.conns.forEach((c) => c.close());
    this.peer?.destroy();
  }
}
