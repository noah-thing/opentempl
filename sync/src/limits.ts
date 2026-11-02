// A token bucket per connection. It lives in memory, so it resets when the room
// hibernates, which only happens after the socket has been idle anyway.

export interface Bucket {
  messages: number;
  bytes: number;
  at: number;
}

const MESSAGE_BURST = 60;
const MESSAGES_PER_SECOND = 30;
const BYTE_BURST = 16 * 1024 * 1024;
const BYTES_PER_SECOND = 4 * 1024 * 1024;

export const newBucket = (now = Date.now()): Bucket => ({ messages: MESSAGE_BURST, bytes: BYTE_BURST, at: now });

export function take(b: Bucket, size: number, now = Date.now()): boolean {
  const s = Math.max(0, now - b.at) / 1000;
  b.at = now;
  b.messages = Math.min(MESSAGE_BURST, b.messages + s * MESSAGES_PER_SECOND);
  b.bytes = Math.min(BYTE_BURST, b.bytes + s * BYTES_PER_SECOND);
  if (b.messages < 1 || b.bytes < size) return false;
  b.messages -= 1;
  b.bytes -= size;
  return true;
}
