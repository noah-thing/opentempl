import { describe, expect, it } from 'vitest';
import { Code, decodeDown, decodeUp, encodeAck, encodeDestroy, encodeError, encodeGone, encodePush, encodeReady, encodeRow, encodeSnap, encodeSnapped } from '../src/protocol';

const blob = Uint8Array.from([1, 2, 3, 250]);

describe('frames', () => {
  it('round trips client frames', () => {
    expect(decodeUp(encodePush(blob))).toEqual({ kind: 'push', blob });
    expect(decodeUp(encodeSnap(true, 41, blob))).toEqual({ kind: 'snap', last: true, upTo: 41, blob });
    expect(decodeUp(encodeSnap(false, 0, blob))).toMatchObject({ last: false, upTo: 0 });
    expect(decodeUp(encodeDestroy())).toEqual({ kind: 'destroy' });
  });

  it('round trips server frames', () => {
    expect(decodeDown(encodeRow(12, blob))).toEqual({ kind: 'row', seq: 12, blob });
    expect(decodeDown(encodeReady(9, 3, 1234))).toEqual({ kind: 'ready', maxSeq: 9, rows: 3, bytes: 1234 });
    expect(decodeDown(encodeAck(5))).toEqual({ kind: 'ack', seq: 5 });
    expect(decodeDown(encodeError(Code.RoomFull, 'Too big'))).toEqual({ kind: 'error', code: Code.RoomFull, message: 'Too big' });
    expect(decodeDown(encodeSnapped(2))).toEqual({ kind: 'snapped', rows: 2 });
    expect(decodeDown(encodeGone())).toEqual({ kind: 'gone' });
  });

  it('keeps sequence numbers beyond 32 bits exact', () => {
    expect(decodeDown(encodeAck(2 ** 40 + 3))).toEqual({ kind: 'ack', seq: 2 ** 40 + 3 });
  });

  it('rejects truncated and unknown frames', () => {
    expect(decodeUp(Uint8Array.from([99]))).toBeNull();
    expect(decodeUp(Uint8Array.from([2, 1, 0]))).toBeNull();
    expect(decodeDown(Uint8Array.from([0x10, 0]))).toBeNull();
    expect(decodeDown(Uint8Array.from([1]))).toBeNull();
  });

  it('decodes a frame that is a view into a larger buffer', () => {
    const wrapped = new Uint8Array(40);
    wrapped.set(encodeRow(77, blob), 11);
    expect(decodeDown(wrapped.subarray(11, 11 + 9 + blob.length))).toEqual({ kind: 'row', seq: 77, blob });
  });
});
