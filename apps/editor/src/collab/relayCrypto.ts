// Keys and sealing for the relay. Everything derives from the secret in the
// share link, so the relay only ever holds a room id and ciphertext.

const enc = new TextEncoder();
const SALT = enc.encode('opentempl-relay-v1');
const VERSION = 1;
const IV_BYTES = 12;

export interface RoomKeys {
  roomId: string; // 64 hex characters, safe to show to the relay
  key: CryptoKey; // AES-GCM, never leaves this device
}

const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');

export async function deriveRoom(roomKey: string): Promise<RoomKeys> {
  const ikm = await crypto.subtle.importKey('raw', enc.encode(roomKey), 'HKDF', false, ['deriveBits', 'deriveKey']);
  const params = (info: string) => ({ name: 'HKDF', hash: 'SHA-256', salt: SALT, info: enc.encode(info) });
  const roomId = hex(await crypto.subtle.deriveBits(params('room-id'), ikm, 256));
  const key = await crypto.subtle.deriveKey(params('update-key'), ikm, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  return { roomId, key };
}

// Layout: version, 12 byte random IV, ciphertext with its 16 byte tag. The room
// id is bound in as associated data so a blob can't be replayed into another room.
export async function seal({ roomId, key }: RoomKeys, plain: Uint8Array): Promise<Uint8Array> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: enc.encode(roomId) }, key, plain as Uint8Array<ArrayBuffer>));
  const out = new Uint8Array(1 + IV_BYTES + ct.length);
  out[0] = VERSION;
  out.set(iv, 1);
  out.set(ct, 1 + IV_BYTES);
  return out;
}

// Returns null for anything that doesn't authenticate: a wrong key, another
// room's blob, or tampering.
export async function open({ roomId, key }: RoomKeys, sealed: Uint8Array): Promise<Uint8Array | null> {
  if (sealed.length < 1 + IV_BYTES + 16 || sealed[0] !== VERSION) return null;
  try {
    const iv = sealed.subarray(1, 1 + IV_BYTES) as Uint8Array<ArrayBuffer>;
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv, additionalData: enc.encode(roomId) }, key, sealed.subarray(1 + IV_BYTES) as Uint8Array<ArrayBuffer>);
    return new Uint8Array(plain);
  } catch {
    return null;
  }
}
