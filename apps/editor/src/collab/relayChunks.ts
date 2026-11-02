// A sealed update can be bigger than one relay message (a design with photos
// often is), so it travels as pieces. The relay stores each piece as an opaque
// blob; clients put them back together.
//
//   whole:  [0][sealed]
//   piece:  [1][group id: 8 bytes][index u16][count u16][slice]

export const PIECE_BYTES = 1024 * 1024;
const HEAD = 13;

export function split(sealed: Uint8Array, size = PIECE_BYTES): Uint8Array[] {
  if (sealed.length + 1 <= size) {
    const whole = new Uint8Array(sealed.length + 1);
    whole.set(sealed, 1);
    return [whole];
  }
  const room = size - HEAD;
  const count = Math.ceil(sealed.length / room);
  if (count > 0xffff) throw new Error('update too large to send');
  const gid = crypto.getRandomValues(new Uint8Array(8));
  const out: Uint8Array[] = [];
  for (let i = 0; i < count; i++) {
    const slice = sealed.subarray(i * room, (i + 1) * room);
    const b = new Uint8Array(HEAD + slice.length);
    b[0] = 1;
    b.set(gid, 1);
    new DataView(b.buffer).setUint16(9, i);
    new DataView(b.buffer).setUint16(11, count);
    b.set(slice, HEAD);
    out.push(b);
  }
  return out;
}

interface Group {
  count: number;
  firstSeq: number;
  got: number;
  parts: (Uint8Array | undefined)[];
}

export class Reassembler {
  private groups = new Map<string, Group>();

  // Feed one stored blob; returns the sealed update once all its pieces are in.
  add(seq: number, blob: Uint8Array): Uint8Array | null {
    if (blob[0] === 0) return blob.subarray(1);
    if (blob[0] !== 1 || blob.length < HEAD) return null;
    const view = new DataView(blob.buffer, blob.byteOffset, blob.byteLength);
    const idx = view.getUint16(9);
    const count = view.getUint16(11);
    if (idx >= count) return null;
    const gid = [...blob.subarray(1, 9)].join(',');
    let g = this.groups.get(gid);
    if (!g) this.groups.set(gid, (g = { count, firstSeq: seq, got: 0, parts: new Array(count) }));
    if (g.count !== count || g.parts[idx]) return null;
    g.parts[idx] = blob.subarray(HEAD);
    g.got++;
    if (g.got < g.count) return null;
    this.groups.delete(gid);
    const total = g.parts.reduce((n, p) => n + p!.length, 0);
    const out = new Uint8Array(total);
    let at = 0;
    for (const p of g.parts) {
      out.set(p!, at);
      at += p!.length;
    }
    return out;
  }

  // The earliest row of an update still waiting for pieces. A snapshot must not
  // replace rows from here on, or the half received update would be lost.
  get earliestOpenSeq(): number | null {
    let min: number | null = null;
    for (const g of this.groups.values()) if (min === null || g.firstSeq < min) min = g.firstSeq;
    return min;
  }
}
