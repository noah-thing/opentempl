import { DurableObject } from 'cloudflare:workers';
import {
  CLOSE_GONE,
  CLOSE_PROTOCOL,
  Code,
  MAX_MESSAGE,
  MAX_ROOM_BYTES,
  ROOM_TTL_MS,
  decodeUp,
  encodeAck,
  encodeError,
  encodeGone,
  encodeReady,
  encodeRow,
  encodeSnapped,
} from './protocol';
import { newBucket, take, type Bucket } from './limits';

// One room per shared design. It keeps an append only log of encrypted Yjs
// updates, fans new ones out to the other sockets, and lets a client replace the
// log with a full encrypted snapshot. It cannot merge updates itself because it
// cannot read them, and it never inspects a blob.

const TOUCH_EVERY_MS = 60 * 60 * 1000;

interface Attachment {
  conn: string;
}

export class Room extends DurableObject<Env> {
  private sql = this.ctx.storage.sql;
  private bytes = 0;
  private deleted = false;
  private lastActive = 0;
  private buckets = new WeakMap<WebSocket, Bucket>();

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.blockConcurrencyWhile(async () => this.load());
    ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping', 'pong'));
  }

  private load() {
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS log (seq INTEGER PRIMARY KEY AUTOINCREMENT, blob BLOB NOT NULL);
      CREATE TABLE IF NOT EXISTS pending (conn TEXT NOT NULL, part INTEGER NOT NULL, blob BLOB NOT NULL, PRIMARY KEY (conn, part));
      CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v INTEGER NOT NULL);
    `);
    this.bytes = this.sql.exec<{ n: number }>('SELECT COALESCE(SUM(LENGTH(blob)), 0) AS n FROM log').one().n;
    const meta = Object.fromEntries(this.sql.exec<{ k: string; v: number }>('SELECT k, v FROM meta').toArray().map((r) => [r.k, r.v]));
    this.deleted = meta.deleted === 1;
    this.lastActive = meta.lastActive ?? 0;
  }

  async fetch(): Promise<Response> {
    const pair = new WebSocketPair();
    const [client, server] = [pair[0], pair[1]];
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({ conn: crypto.randomUUID() } satisfies Attachment);
    this.buckets.set(server, newBucket());
    if (this.deleted) {
      server.send(encodeGone());
      server.close(CLOSE_GONE, 'deleted');
    } else this.replay(server);
    return new Response(null, { status: 101, webSocket: client });
  }

  private replay(ws: WebSocket) {
    let max = 0;
    let rows = 0;
    for (const r of this.sql.exec<{ seq: number; blob: ArrayBuffer }>('SELECT seq, blob FROM log ORDER BY seq')) {
      ws.send(encodeRow(r.seq, new Uint8Array(r.blob)));
      max = r.seq;
      rows++;
    }
    ws.send(encodeReady(max, rows, this.bytes));
    if (rows) this.touch();
  }

  webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    if (typeof message === 'string') return;
    const bucket = this.buckets.get(ws) ?? newBucket();
    this.buckets.set(ws, bucket);
    if (message.byteLength > MAX_MESSAGE + 10) return this.fail(ws, Code.TooLarge, 'That change is too large for one message.');
    if (!take(bucket, message.byteLength)) return this.fail(ws, Code.RateLimited, 'Slow down, sending too fast.');
    if (this.deleted) return; // sockets were closed when the room was deleted
    const f = decodeUp(new Uint8Array(message));
    if (!f) return this.fail(ws, Code.BadFrame, 'Unknown message.', CLOSE_PROTOCOL);
    if (f.kind !== 'destroy' && f.blob.length > MAX_MESSAGE) return this.fail(ws, Code.TooLarge, 'That change is too large for one message.');

    switch (f.kind) {
      case 'push':
        return this.push(ws, f.blob);
      case 'snap':
        return this.snap(ws, f.upTo, f.last, f.blob);
      case 'destroy':
        return this.destroy();
    }
  }

  webSocketClose(ws: WebSocket) {
    this.dropPending(ws);
    ws.close();
  }

  webSocketError(ws: WebSocket) {
    this.dropPending(ws);
  }

  async alarm() {
    if (Date.now() - this.lastActive < ROOM_TTL_MS) {
      await this.ctx.storage.setAlarm(this.lastActive + ROOM_TTL_MS);
      return;
    }
    this.closeAll(1000, 'expired');
    await this.ctx.storage.deleteAll();
    this.load();
  }

  private push(ws: WebSocket, blob: Uint8Array) {
    if (!blob.length) return;
    if (this.bytes + blob.length > MAX_ROOM_BYTES) return this.fail(ws, Code.RoomFull, 'This design is too big to sync. Remove large images and try again.');
    const seq = this.sql.exec<{ seq: number }>('INSERT INTO log (blob) VALUES (?) RETURNING seq', blob).one().seq;
    this.bytes += blob.length;
    this.touch();
    ws.send(encodeAck(seq));
    const row = encodeRow(seq, blob);
    for (const peer of this.ctx.getWebSockets()) if (peer !== ws) peer.send(row);
  }

  private snap(ws: WebSocket, upTo: number, last: boolean, blob: Uint8Array) {
    const conn = (ws.deserializeAttachment() as Attachment).conn;
    const held = this.sql.exec<{ n: number; b: number }>('SELECT COUNT(*) AS n, COALESCE(SUM(LENGTH(blob)), 0) AS b FROM pending WHERE conn = ?', conn).one();
    if (held.b + blob.length > MAX_ROOM_BYTES) {
      this.dropPending(ws);
      return this.fail(ws, Code.RoomFull, 'This design is too big to sync. Remove large images and try again.');
    }
    this.sql.exec('INSERT INTO pending (conn, part, blob) VALUES (?, ?, ?)', conn, held.n, blob);
    if (!last) return;

    const keepBytes = this.sql.exec<{ n: number }>('SELECT COALESCE(SUM(LENGTH(blob)), 0) AS n FROM log WHERE seq > ?', upTo).one().n;
    if (keepBytes + held.b + blob.length > MAX_ROOM_BYTES) {
      this.dropPending(ws);
      return this.fail(ws, Code.RoomFull, 'This design is too big to sync. Remove large images and try again.');
    }
    this.ctx.storage.transactionSync(() => {
      this.sql.exec('DELETE FROM log WHERE seq <= ?', upTo);
      this.sql.exec('INSERT INTO log (blob) SELECT blob FROM pending WHERE conn = ? ORDER BY part', conn);
      this.sql.exec('DELETE FROM pending WHERE conn = ?', conn);
    });
    const after = this.sql.exec<{ n: number; b: number }>('SELECT COUNT(*) AS n, COALESCE(SUM(LENGTH(blob)), 0) AS b FROM log').one();
    this.bytes = after.b;
    this.touch();
    ws.send(encodeSnapped(after.n));
  }

  private destroy() {
    this.ctx.storage.transactionSync(() => {
      this.sql.exec('DELETE FROM log');
      this.sql.exec('DELETE FROM pending');
      this.sql.exec("INSERT OR REPLACE INTO meta (k, v) VALUES ('deleted', 1)");
    });
    this.deleted = true;
    this.bytes = 0;
    // The tombstone stops stale copies of the link from refilling the room; it goes with the rest after the idle period.
    this.lastActive = Date.now();
    this.sql.exec("INSERT OR REPLACE INTO meta (k, v) VALUES ('lastActive', ?)", this.lastActive);
    void this.ctx.storage.setAlarm(this.lastActive + ROOM_TTL_MS);
    for (const ws of this.ctx.getWebSockets()) {
      ws.send(encodeGone());
      ws.close(CLOSE_GONE, 'deleted');
    }
  }

  private touch() {
    const now = Date.now();
    if (this.lastActive && now - this.lastActive < TOUCH_EVERY_MS) return;
    this.lastActive = now;
    this.sql.exec("INSERT OR REPLACE INTO meta (k, v) VALUES ('lastActive', ?)", now);
    void this.ctx.storage.setAlarm(now + ROOM_TTL_MS);
  }

  private dropPending(ws: WebSocket) {
    const att = ws.deserializeAttachment() as Attachment | null;
    if (att) this.sql.exec('DELETE FROM pending WHERE conn = ?', att.conn);
  }

  private closeAll(code: number, reason: string) {
    for (const ws of this.ctx.getWebSockets()) ws.close(code, reason);
  }

  private fail(ws: WebSocket, code: Code, message: string, close?: number) {
    ws.send(encodeError(code, message));
    if (close) ws.close(close, message);
  }
}
