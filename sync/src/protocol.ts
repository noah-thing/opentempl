// Wire format shared by the relay and the editor. Every WebSocket message is
// binary: one tag byte, then a fixed header, then an opaque blob. The relay
// never looks inside a blob; it is ciphertext made by the clients.

export const MAX_MESSAGE = 2 * 1024 * 1024; // blob bytes in one frame, also SQLite's row limit
export const MAX_ROOM_BYTES = 50 * 1024 * 1024;
export const ROOM_TTL_MS = 90 * 24 * 60 * 60 * 1000;
export const ROOM_ID_PATTERN = /^[0-9a-f]{64}$/;

export const Up = {
  Push: 1, // [tag][blob] append to the log
  Snap: 2, // [tag][last u8][upTo f64][blob] one part of a snapshot that replaces rows up to upTo
  Destroy: 3, // [tag] delete the room
} as const;

export const Down = {
  Row: 0x10, // [tag][seq f64][blob]
  Ready: 0x11, // [tag][maxSeq f64][rows u32][bytes u32] the stored log has been sent
  Ack: 0x12, // [tag][seq f64] your push was stored
  Error: 0x13, // [tag][code u8][utf8 text]
  Snapped: 0x14, // [tag][rows u32] your snapshot replaced the log
  Gone: 0x15, // [tag] the room was deleted
} as const;

export const Code = {
  TooLarge: 1,
  RoomFull: 2,
  RateLimited: 3,
  BadFrame: 4,
} as const;
export type Code = (typeof Code)[keyof typeof Code];

export const CLOSE_GONE = 4001;
export const CLOSE_PROTOCOL = 4002;

const text = new TextEncoder();
const utf8 = new TextDecoder();

function frame(tag: number, header: number, blob?: Uint8Array): { out: Uint8Array; view: DataView } {
  const out = new Uint8Array(1 + header + (blob?.length ?? 0));
  out[0] = tag;
  if (blob) out.set(blob, 1 + header);
  return { out, view: new DataView(out.buffer) };
}

export const encodePush = (blob: Uint8Array) => frame(Up.Push, 0, blob).out;
export const encodeDestroy = () => frame(Up.Destroy, 0).out;

export function encodeSnap(last: boolean, upTo: number, blob: Uint8Array) {
  const { out, view } = frame(Up.Snap, 9, blob);
  out[1] = last ? 1 : 0;
  view.setFloat64(2, upTo);
  return out;
}

export function encodeRow(seq: number, blob: Uint8Array) {
  const { out, view } = frame(Down.Row, 8, blob);
  view.setFloat64(1, seq);
  return out;
}

export function encodeReady(maxSeq: number, rows: number, bytes: number) {
  const { out, view } = frame(Down.Ready, 16);
  view.setFloat64(1, maxSeq);
  view.setUint32(9, rows);
  view.setUint32(13, Math.min(bytes, 0xffffffff));
  return out;
}

export function encodeAck(seq: number) {
  const { out, view } = frame(Down.Ack, 8);
  view.setFloat64(1, seq);
  return out;
}

export function encodeError(code: Code, message: string) {
  const { out } = frame(Down.Error, 1, text.encode(message));
  out[1] = code;
  return out;
}

export function encodeSnapped(rows: number) {
  const { out, view } = frame(Down.Snapped, 4);
  view.setUint32(1, rows);
  return out;
}

export const encodeGone = () => frame(Down.Gone, 0).out;

export type UpFrame =
  | { kind: 'push'; blob: Uint8Array }
  | { kind: 'snap'; last: boolean; upTo: number; blob: Uint8Array }
  | { kind: 'destroy' };

export function decodeUp(data: Uint8Array): UpFrame | null {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  switch (data[0]) {
    case Up.Push:
      return { kind: 'push', blob: data.subarray(1) };
    case Up.Snap:
      if (data.length < 10) return null;
      return { kind: 'snap', last: data[1] === 1, upTo: view.getFloat64(2), blob: data.subarray(10) };
    case Up.Destroy:
      return { kind: 'destroy' };
    default:
      return null;
  }
}

export type DownFrame =
  | { kind: 'row'; seq: number; blob: Uint8Array }
  | { kind: 'ready'; maxSeq: number; rows: number; bytes: number }
  | { kind: 'ack'; seq: number }
  | { kind: 'error'; code: Code; message: string }
  | { kind: 'snapped'; rows: number }
  | { kind: 'gone' };

export function decodeDown(data: Uint8Array): DownFrame | null {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  switch (data[0]) {
    case Down.Row:
      return data.length < 9 ? null : { kind: 'row', seq: view.getFloat64(1), blob: data.subarray(9) };
    case Down.Ready:
      return data.length < 17 ? null : { kind: 'ready', maxSeq: view.getFloat64(1), rows: view.getUint32(9), bytes: view.getUint32(13) };
    case Down.Ack:
      return data.length < 9 ? null : { kind: 'ack', seq: view.getFloat64(1) };
    case Down.Error:
      return data.length < 2 ? null : { kind: 'error', code: data[1] as Code, message: utf8.decode(data.subarray(2)) };
    case Down.Snapped:
      return data.length < 5 ? null : { kind: 'snapped', rows: view.getUint32(1) };
    case Down.Gone:
      return { kind: 'gone' };
    default:
      return null;
  }
}
