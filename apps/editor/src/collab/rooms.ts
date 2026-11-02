// Which design is shared through which room. The key is a secret like the design
// itself, so it stays on this device, next to the design.

const k = (designId: string) => `opentempl:room:${designId}`;

export function savedRoom(designId: string): string | null {
  try {
    return localStorage.getItem(k(designId));
  } catch {
    return null;
  }
}

export function saveRoom(designId: string, room: string) {
  try {
    localStorage.setItem(k(designId), room);
  } catch {
    /* private mode: the link still works, it just isn't remembered */
  }
}

export function forgetRoom(designId: string) {
  try {
    localStorage.removeItem(k(designId));
  } catch {
    /* nothing stored */
  }
}
