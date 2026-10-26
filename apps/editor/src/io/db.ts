// A small promise wrapper around IndexedDB for Tavla's app level data. Each
// design's content lives in its own y-indexeddb database; this one holds the
// index of designs, thumbnails, the uploads library, brand kits and versions.

const DB_NAME = 'tavla';
const VERSION = 1;
export type StoreName = 'designs' | 'thumbs' | 'uploads' | 'brand' | 'versions' | 'settings';

let dbp: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  if (!dbp) {
    dbp = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        for (const s of ['designs', 'thumbs', 'uploads', 'brand', 'versions', 'settings'] as StoreName[])
          if (!db.objectStoreNames.contains(s)) db.createObjectStore(s);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbp;
}

function tx<T>(store: StoreName, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T> | void): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(store, mode);
        const s = t.objectStore(store);
        const req = fn(s);
        t.oncomplete = () => resolve(req ? (req.result as T) : (undefined as T));
        t.onerror = () => reject(t.error);
      }),
  );
}

export const db = {
  get: <T>(store: StoreName, key: string) => tx<T>(store, 'readonly', (s) => s.get(key)),
  set: (store: StoreName, key: string, value: unknown) => tx(store, 'readwrite', (s) => s.put(value, key)),
  del: (store: StoreName, key: string) => tx(store, 'readwrite', (s) => s.delete(key)),
  all: <T>(store: StoreName) =>
    open().then(
      (d) =>
        new Promise<{ key: string; value: T }[]>((resolve, reject) => {
          const out: { key: string; value: T }[] = [];
          const req = d.transaction(store).objectStore(store).openCursor();
          req.onsuccess = () => {
            const c = req.result;
            if (c) {
              out.push({ key: String(c.key), value: c.value as T });
              c.continue();
            } else resolve(out);
          };
          req.onerror = () => reject(req.error);
        }),
    ),
};
