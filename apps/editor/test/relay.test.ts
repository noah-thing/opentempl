import { afterEach, describe, expect, it } from 'vitest';
import * as Y from 'yjs';
import { Code, decodeUp, encodeAck, encodeError, encodeGone, encodeReady, encodeRow, encodeSnapped } from '../../../sync/src/protocol';
import { deriveRoom, open, seal } from '../src/collab/relayCrypto';
import { PIECE_BYTES, Reassembler, split } from '../src/collab/relayChunks';
import { RelayProvider, type SocketLike } from '../src/collab/relayProvider';

const text = (s: string) => new TextEncoder().encode(s);
const until = async (test: () => boolean, ms = 4000) => {
  const end = Date.now() + ms;
  while (!test()) {
    if (Date.now() > end) throw new Error('timed out');
    await new Promise((r) => setTimeout(r, 15));
  }
};

describe('relay crypto', () => {
  it('derives a stable 64 character room id that does not contain the key', async () => {
    const a = await deriveRoom('secret-room-key');
    const b = await deriveRoom('secret-room-key');
    expect(a.roomId).toMatch(/^[0-9a-f]{64}$/);
    expect(a.roomId).toBe(b.roomId);
    expect(a.roomId).not.toContain('secret');
    expect((await deriveRoom('another-key')).roomId).not.toBe(a.roomId);
  });

  it('seals and opens, with a fresh IV every time', async () => {
    const keys = await deriveRoom('k1');
    const plain = text('{"hello":"world"}');
    const one = await seal(keys, plain);
    const two = await seal(keys, plain);
    expect(one).not.toEqual(two);
    expect(await open(keys, one)).toEqual(plain);
    expect(Buffer.from(one).includes(Buffer.from('hello'))).toBe(false);
  });

  it('refuses a wrong key, a tampered blob, another room and an unknown version', async () => {
    const keys = await deriveRoom('k1');
    const sealed = await seal(keys, text('data'));
    expect(await open(await deriveRoom('k2'), sealed)).toBeNull();
    const flipped = sealed.slice();
    flipped[flipped.length - 1] ^= 1;
    expect(await open(keys, flipped)).toBeNull();
    expect(await open({ ...keys, roomId: 'f'.repeat(64) }, sealed)).toBeNull();
    const v2 = sealed.slice();
    v2[0] = 2;
    expect(await open(keys, v2)).toBeNull();
    expect(await open(keys, new Uint8Array(5))).toBeNull();
  });
});

describe('chunks', () => {
  const data = (n: number) => Uint8Array.from({ length: n }, (_, i) => i % 251);

  it('sends small payloads as one blob', () => {
    const blobs = split(data(100));
    expect(blobs).toHaveLength(1);
    expect(new Reassembler().add(1, blobs[0])).toEqual(data(100));
  });

  it('splits big payloads below the piece size and puts them back', () => {
    const big = data(PIECE_BYTES * 2 + 123);
    const blobs = split(big);
    expect(blobs.length).toBeGreaterThan(2);
    expect(blobs.every((b) => b.length <= PIECE_BYTES)).toBe(true);
    const r = new Reassembler();
    const out = blobs.map((b, i) => r.add(i + 1, b));
    expect(out.slice(0, -1).every((x) => x === null)).toBe(true);
    expect(out.at(-1)).toEqual(big);
  });

  it('reassembles interleaved groups, in any order, and tracks the earliest open row', () => {
    const a = split(data(500), 200);
    const b = split(data(450).reverse(), 200);
    const r = new Reassembler();
    expect(r.earliestOpenSeq).toBeNull();
    expect(r.add(10, a[0])).toBeNull();
    expect(r.add(11, b[1])).toBeNull();
    expect(r.earliestOpenSeq).toBe(10);
    expect(r.add(12, a[2])).toBeNull();
    for (let i = 0; i < b.length; i++) if (i !== 1) r.add(13 + i, b[i]);
    expect(r.earliestOpenSeq).toBe(10);
    const done = r.add(20, a[1]);
    expect(done).toEqual(data(500));
    expect(r.earliestOpenSeq).toBeNull();
  });

  it('ignores duplicate and malformed pieces', () => {
    const blobs = split(data(500), 200);
    const r = new Reassembler();
    r.add(1, blobs[0]);
    expect(r.add(2, blobs[0])).toBeNull();
    expect(r.add(3, Uint8Array.from([9, 9]))).toBeNull();
    expect(r.add(4, Uint8Array.from([1, 0]))).toBeNull();
  });
});

// An in memory stand in for the Durable Object that follows the same protocol.
class FakeRelay {
  rows: { seq: number; blob: Uint8Array }[] = [];
  sockets = new Set<FakeSocket>();
  seq = 0;
  deleted = false;
  pending = new Map<FakeSocket, Uint8Array[]>();
  online = true;

  socket(): SocketLike {
    const s = new FakeSocket(this);
    queueMicrotask(() => {
      if (!this.online) return s.dead();
      s.readyState = 1;
      this.sockets.add(s);
      s.onopen?.({});
      if (this.deleted) return s.push(encodeGone());
      this.rows.forEach((r) => s.push(encodeRow(r.seq, r.blob)));
      s.push(encodeReady(this.seq, this.rows.length, 0));
    });
    return s;
  }

  receive(from: FakeSocket, data: Uint8Array) {
    const f = decodeUp(data)!;
    if (f.kind === 'push') {
      const seq = ++this.seq;
      this.rows.push({ seq, blob: f.blob.slice() });
      from.push(encodeAck(seq));
      this.sockets.forEach((s) => s !== from && s.push(encodeRow(seq, f.blob)));
    } else if (f.kind === 'snap') {
      const parts = this.pending.get(from) ?? [];
      parts.push(f.blob.slice());
      this.pending.set(from, parts);
      if (!f.last) return;
      this.pending.delete(from);
      this.rows = this.rows.filter((r) => r.seq > f.upTo);
      parts.forEach((blob) => this.rows.push({ seq: ++this.seq, blob }));
      from.push(encodeSnapped(this.rows.length));
    } else {
      this.deleted = true;
      this.rows = [];
      this.sockets.forEach((s) => s.push(encodeGone()));
    }
  }

  drop() {
    this.online = false;
    [...this.sockets].forEach((s) => s.dead());
  }
}

class FakeSocket implements SocketLike {
  readyState = 0;
  binaryType = '';
  onopen: SocketLike['onopen'] = null;
  onmessage: SocketLike['onmessage'] = null;
  onclose: SocketLike['onclose'] = null;
  onerror: SocketLike['onerror'] = null;
  constructor(private relay: FakeRelay) {}
  send(data: string | Uint8Array) {
    if (typeof data !== 'string' && this.readyState === 1) this.relay.receive(this, data);
  }
  push(b: Uint8Array) {
    queueMicrotask(() => this.readyState === 1 && this.onmessage?.({ data: b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) }));
  }
  close() {
    this.dead();
  }
  dead() {
    if (this.readyState === 3) return;
    this.readyState = 3;
    this.relay.sockets.delete(this);
    queueMicrotask(() => this.onclose?.({ code: 1006 }));
  }
}

const open_ = new Set<RelayProvider>();
afterEach(() => {
  open_.forEach((p) => p.destroy());
  open_.clear();
});

function join(relay: FakeRelay, doc: Y.Doc, key = 'room-key-1', compactRows?: number) {
  const p = new RelayProvider(doc, key, { url: 'wss://fake', createSocket: () => relay.socket(), compactRows });
  open_.add(p);
  return p;
}
const settled = (p: RelayProvider) => until(() => p.status === 'synced');

describe('relay provider', () => {
  it('sends a design to a new device and keeps ciphertext only on the relay', async () => {
    const relay = new FakeRelay();
    const a = new Y.Doc();
    a.getMap('meta').set('title', 'Quarterly offsite poster');
    const pa = join(relay, a);
    await settled(pa);
    const b = new Y.Doc();
    const pb = join(relay, b);
    await pb.ready;
    await until(() => b.getMap('meta').get('title') === 'Quarterly offsite poster');

    const keys = await deriveRoom('room-key-1');
    expect(relay.rows.length).toBeGreaterThan(0);
    for (const r of relay.rows) {
      expect(Buffer.from(r.blob).includes(Buffer.from('Quarterly'))).toBe(false);
      expect(await open(keys, r.blob.subarray(1))).not.toBeNull();
    }
  });

  it('delivers an edit made while the other side was closed', async () => {
    const relay = new FakeRelay();
    const a = new Y.Doc();
    a.getMap('m').set('x', 1);
    const pa = join(relay, a);
    await settled(pa);
    const b = new Y.Doc();
    const pb = join(relay, b);
    await until(() => b.getMap('m').get('x') === 1);
    pa.destroy(); // A closes the tab

    b.getMap('m').set('y', 'from B');
    await settled(pb);

    const pa2 = join(relay, a); // A reopens with the document it kept
    await until(() => a.getMap('m').get('y') === 'from B');
    expect(pa2.status === 'synced' || pa2.status === 'syncing').toBe(true);
  });

  it('pushes edits made offline once it reconnects', async () => {
    const relay = new FakeRelay();
    const a = new Y.Doc();
    const pa = join(relay, a);
    await settled(pa);
    const b = new Y.Doc();
    join(relay, b);
    relay.drop();
    await until(() => pa.status === 'offline');
    a.getMap('m').set('offline', 'edit');
    relay.online = true;
    await until(() => pa.status === 'synced', 8000);
    await until(() => b.getMap('m').get('offline') === 'edit', 8000);
  }, 15000);

  it('splits an update bigger than one message and the other side rebuilds it', async () => {
    const relay = new FakeRelay();
    const a = new Y.Doc();
    const pa = join(relay, a);
    await settled(pa);
    const b = new Y.Doc();
    join(relay, b);
    const image = new Uint8Array(Math.floor(PIECE_BYTES * 2.5));
    for (let i = 0; i < image.length; i += 65536) crypto.getRandomValues(image.subarray(i, Math.min(i + 65536, image.length)));
    a.getMap('assets').set('photo', image);
    await until(() => (b.getMap('assets').get('photo') as Uint8Array | undefined)?.length === image.length);
    expect(b.getMap('assets').get('photo')).toEqual(image);
    expect(relay.rows.every((r) => r.blob.length <= PIECE_BYTES)).toBe(true);
    expect(relay.rows.length).toBeGreaterThan(2);
  });

  it('compacts a long log into a snapshot without losing anything', async () => {
    const relay = new FakeRelay();
    const a = new Y.Doc();
    const pa = join(relay, a, 'room-key-1', 12);
    await settled(pa);
    for (let i = 0; i < 40; i++) {
      a.getMap('m').set(`k${i}`, i);
      await new Promise((r) => setTimeout(r, 135)); // one flush per edit
    }
    await settled(pa);
    expect(relay.rows.length).toBeLessThan(20);
    const c = new Y.Doc();
    join(relay, c);
    await until(() => c.getMap('m').size === 40);
  }, 20000);

  it('reports the room as gone after the owner deletes it', async () => {
    const relay = new FakeRelay();
    const a = new Y.Doc();
    a.getMap('m').set('x', 1);
    const pa = join(relay, a);
    await settled(pa);
    const b = new Y.Doc();
    const pb = join(relay, b);
    await settled(pb);
    expect(await pa.deleteRoom()).toBe(true);
    await until(() => pb.status === 'gone');
    expect(relay.rows).toHaveLength(0);
  });

  it('surfaces a room full error and recovers by compacting', async () => {
    const relay = new FakeRelay();
    const a = new Y.Doc();
    const pa = join(relay, a);
    await settled(pa);
    a.getMap('m').set('a', 1);
    await settled(pa);
    const socket = [...relay.sockets][0];
    socket.push(encodeError(Code.RoomFull, 'This design is too big to sync.'));
    await until(() => pa.lastError.includes('too big'));
    await until(() => pa.status === 'synced');
  });
});
