import { env, exports } from 'cloudflare:workers';
import { runDurableObjectAlarm, runInDurableObject } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import { MAX_MESSAGE, MAX_ROOM_BYTES, encodeDestroy, encodePush, encodeSnap, Code } from '../src/protocol';
import { bytes, connect, roomId } from './helpers';

const stub = (room: string) => env.ROOMS.get(env.ROOMS.idFromName(room));
type Tweakable = { bytes: number; lastActive: number };
const tweak = (room: string, fn: (o: Tweakable, s: DurableObjectState) => void) => runInDurableObject(stub(room), (o, s) => fn(o as unknown as Tweakable, s));
const rowsOf = (room: string) => runInDurableObject(stub(room), (_o, s) => s.storage.sql.exec<{ n: number }>('SELECT COUNT(*) AS n FROM log').one().n);

describe('front door', () => {
  const open = (path: string, headers: Record<string, string>) => exports.default.fetch(`https://sync.test${path}`, { headers });

  it('answers a plain GET on the root', async () => {
    expect((await open('/', {})).status).toBe(200);
  });
  it('wants a WebSocket', async () => {
    expect((await open(`/v1/room/${roomId()}`, {})).status).toBe(426);
  });
  it('refuses unknown origins and missing ones', async () => {
    expect((await open(`/v1/room/${roomId()}`, { Upgrade: 'websocket', Origin: 'https://evil.example' })).status).toBe(403);
    expect((await open(`/v1/room/${roomId()}`, { Upgrade: 'websocket' })).status).toBe(403);
  });
  it('accepts the site, the desktop app and localhost', async () => {
    for (const origin of ['https://opentempl.org', 'tavla://app', 'http://localhost:5181']) {
      const res = await open(`/v1/room/${roomId(9)}`, { Upgrade: 'websocket', Origin: origin });
      expect(res.status).toBe(101);
      res.webSocket?.accept();
      res.webSocket?.close();
    }
  });
  it('refuses a room id that is not a SHA-256 hex digest', async () => {
    expect((await open('/v1/room/hello', { Upgrade: 'websocket', Origin: 'https://opentempl.org' })).status).toBe(400);
  });
});

describe('room', () => {
  it('starts empty and says so', async () => {
    const c = await connect(roomId(10));
    await c.until(() => c.of('ready').length === 1);
    expect(c.of('ready')[0]).toMatchObject({ rows: 0, maxSeq: 0 });
  });

  it('stores a push, acks it, and shows it to the other sockets and to late joiners', async () => {
    const room = roomId(11);
    const a = await connect(room);
    const b = await connect(room);
    await a.until(() => a.of('ready').length === 1);
    await b.until(() => b.of('ready').length === 1);
    a.send(encodePush(bytes(100, 1)));
    await a.until(() => a.of('ack').length === 1);
    await b.until(() => b.of('row').length === 1);
    expect(b.of('row')[0].blob).toEqual(bytes(100, 1));
    expect(a.of('row')).toHaveLength(0);

    const late = await connect(room);
    await late.until(() => late.of('ready').length === 1);
    expect(late.of('row').map((r) => r.blob.length)).toEqual([100]);
    expect(late.of('ready')[0]).toMatchObject({ rows: 1, bytes: 100 });
  });

  it('keeps the log across hibernation', async () => {
    const room = roomId(12);
    const a = await connect(room);
    a.send(encodePush(bytes(10)));
    await a.until(() => a.of('ack').length === 1);
    await runInDurableObject(stub(room), () => {});
    const b = await connect(room);
    await b.until(() => b.of('ready').length === 1);
    expect(b.of('row')).toHaveLength(1);
  });

  it('refuses a message over the size limit', async () => {
    const c = await connect(roomId(13));
    c.send(encodePush(bytes(MAX_MESSAGE + 1)));
    await c.until(() => c.of('error').length === 1);
    expect(c.of('error')[0].code).toBe(Code.TooLarge);
    expect(await rowsOf(roomId(13))).toBe(0);
  });

  it('accepts a message exactly at the limit', async () => {
    const c = await connect(roomId(14));
    c.send(encodePush(bytes(MAX_MESSAGE)));
    await c.until(() => c.of('ack').length === 1);
  });

  it('refuses writes once the room is full, with a clear error', async () => {
    const room = roomId(15);
    const c = await connect(room);
    await c.until(() => c.of('ready').length === 1);
    await tweak(room, (o, s) => {
      s.storage.sql.exec('INSERT INTO log (blob) VALUES (?)', bytes(10));
      o.bytes = MAX_ROOM_BYTES - 5;
    });
    c.send(encodePush(bytes(10)));
    await c.until(() => c.of('error').length === 1);
    expect(c.of('error')[0]).toMatchObject({ code: Code.RoomFull });
    expect(c.of('error')[0].message).toMatch(/too big/i);
    c.send(encodePush(bytes(5)));
    await c.until(() => c.of('ack').length === 1);
  });

  it('rate limits a socket that floods', async () => {
    const c = await connect(roomId(16));
    for (let i = 0; i < 200; i++) c.send(encodePush(bytes(8)));
    await c.until(() => c.of('error').some((e) => e.code === Code.RateLimited));
    expect(c.of('ack').length).toBeLessThan(200);
  });

  it('replaces the log with a snapshot, keeping rows newer than upTo', async () => {
    const room = roomId(17);
    const a = await connect(room);
    for (const n of [1, 2, 3]) {
      a.send(encodePush(bytes(10, n)));
      await a.until(() => a.of('ack').length === n);
    }
    const [s1, s2, s3] = a.of('ack').map((x) => x.seq);
    a.send(encodeSnap(false, s2, bytes(20, 9)));
    a.send(encodeSnap(true, s2, bytes(30, 8)));
    await a.until(() => a.of('snapped').length === 1);
    expect(a.of('snapped')[0].rows).toBe(3);
    expect(s1 < s2 && s2 < s3).toBe(true);

    const late = await connect(room);
    await late.until(() => late.of('ready').length === 1);
    expect(late.of('row').map((r) => [...r.blob.subarray(0, 1)][0])).toEqual([3, 9, 8]);
  });

  it('does not touch the log when a snapshot never finishes', async () => {
    const room = roomId(18);
    const a = await connect(room);
    a.send(encodePush(bytes(10)));
    await a.until(() => a.of('ack').length === 1);
    a.send(encodeSnap(false, 99, bytes(10)));
    a.close();
    await new Promise((r) => setTimeout(r, 100));
    expect(await rowsOf(room)).toBe(1);
    const pending = await runInDurableObject(stub(room), (_o, s) => s.storage.sql.exec<{ n: number }>('SELECT COUNT(*) AS n FROM pending').one().n);
    expect(pending).toBe(0);
  });

  it('deletes everything on destroy and refuses the room afterwards', async () => {
    const room = roomId(19);
    const a = await connect(room);
    const b = await connect(room);
    a.send(encodePush(bytes(10)));
    await a.until(() => a.of('ack').length === 1);
    a.send(encodeDestroy());
    await b.until(() => b.of('gone').length === 1);
    expect(await rowsOf(room)).toBe(0);

    const late = await connect(room);
    await late.until(() => late.of('gone').length === 1);
    expect(late.of('row')).toHaveLength(0);
    late.send(encodePush(bytes(10)));
    await new Promise((r) => setTimeout(r, 50));
    expect(await rowsOf(room)).toBe(0);
  });

  it('wipes a room that has been idle for 90 days', async () => {
    const room = roomId(20);
    const a = await connect(room);
    a.send(encodePush(bytes(10)));
    await a.until(() => a.of('ack').length === 1);
    await tweak(room, (o) => {
      o.lastActive = Date.now() - 91 * 24 * 60 * 60 * 1000;
    });
    expect(await runDurableObjectAlarm(stub(room))).toBe(true);
    expect(await rowsOf(room)).toBe(0);
  });

  it('keeps a room that is still within its 90 days', async () => {
    const room = roomId(21);
    const a = await connect(room);
    a.send(encodePush(bytes(10)));
    await a.until(() => a.of('ack').length === 1);
    await tweak(room, (o) => {
      o.lastActive = Date.now() - 30 * 24 * 60 * 60 * 1000;
    });
    await runDurableObjectAlarm(stub(room));
    expect(await rowsOf(room)).toBe(1);
  });

  it('drops a connection that sends garbage', async () => {
    const c = await connect(roomId(22));
    c.send(Uint8Array.from([99, 1, 2]));
    await c.until(() => c.of('error').length === 1);
    expect(c.of('error')[0].code).toBe(Code.BadFrame);
  });
});
