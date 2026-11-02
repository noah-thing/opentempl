import { useSyncExternalStore } from 'react';
import type { PeerProvider } from './peerProvider';
import type { RelayProvider, RelayStatus } from './relayProvider';
import type { Editor } from '../editor/Editor';
import type { Id } from '../doc/types';
import { COBALT } from '../doc/colors';

// Sharing without accounts, in two layers. Live: peers are introduced by the free
// PeerJS broker and then talk directly over encrypted WebRTC, which is fast and
// carries cursors. Always on: every update is also sealed with a key derived from
// the room key and kept on the OpenTempl relay, so edits arrive when nobody else
// is online and when WebRTC can't connect. Neither the broker nor the relay ever
// sees the key or a readable design.

export interface Peer {
  id: number;
  name: string;
  color: string;
  cursor?: { pageId: Id; x: number; y: number } | null;
  selection?: Id[];
}

const COLORS = [COBALT, '#FF4B39', '#3EDD8A', '#FF3C8E', '#0AA0FF', '#9A5BFF', '#FF9F1A'];
const ANIMALS = ['Otter', 'Lynx', 'Puffin', 'Moose', 'Seal', 'Hare', 'Crane', 'Fox', 'Owl', 'Elk'];


let peers: Peer[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function usePeers() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => peers,
  );
}

const statusListeners = new Set<() => void>();
let syncStatus: RelayStatus | null = null;
function setSyncStatus(s: RelayStatus | null) {
  syncStatus = s;
  statusListeners.forEach((l) => l());
}

// Null when this design isn't shared.
export function useSyncStatus() {
  return useSyncExternalStore(
    (l) => {
      statusListeners.add(l);
      return () => statusListeners.delete(l);
    },
    () => syncStatus,
  );
}

export interface Collab {
  provider: PeerProvider | null; // null until the networking code has loaded
  relay: RelayProvider | null;
  relayReady: Promise<void>; // the relay's copy has been merged in, or it can't be reached
  stopSharing: () => Promise<boolean>; // deletes the room on the relay, then disconnects
  destroy: () => void;
  setCursor: (c: Peer['cursor']) => void;
}

let active: Collab | null = null;
export function activeCollab() {
  return active;
}

export function localName() {
  // Legacy 'tavla:' key kept on purpose so the saved display name survives.
  let n = localStorage.getItem('tavla:name');
  if (!n) {
    n = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    localStorage.setItem('tavla:name', n);
  }
  return n;
}

// Only a name the person typed; the random animal is just a fallback.
export function chosenName() {
  return localStorage.getItem('tavla:name-chosen') ?? '';
}

export function setLocalName(n: string) {
  localStorage.setItem('tavla:name', n);
  localStorage.setItem('tavla:name-chosen', n === 'Guest' ? '' : n);
  const aw = active?.provider?.awareness;
  aw?.setLocalStateField('user', { ...aw.getLocalState()?.user, name: n });
}

// PeerJS and the WebRTC shims load only when a session starts, so the editor
// opens without them.
export function connectCollab(editor: Editor, room: string): Collab {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  let cleanup = () => {};
  let closed = false;
  let last = 0;
  let markReady = () => {};
  const collab: Collab = {
    provider: null,
    relay: null,
    relayReady: new Promise<void>((r) => (markReady = r)),
    stopSharing: async () => {
      const deleted = (await collab.relay?.deleteRoom()) ?? false;
      collab.destroy();
      return deleted;
    },
    setCursor: (c) => {
      const now = performance.now();
      if (now - last < 40) return;
      last = now;
      collab.provider?.awareness.setLocalStateField('cursor', c);
    },
    destroy: () => {
      closed = true;
      cleanup();
      collab.provider?.destroy();
      collab.relay?.destroy();
      markReady();
      setSyncStatus(null);
      peers = [];
      emit();
      if (active === collab) active = null;
    },
  };
  active = collab;
  setSyncStatus('connecting');
  import('./relayProvider').then(({ RelayProvider }) => {
    if (closed) return;
    const relay = new RelayProvider(editor.doc.ydoc, room);
    collab.relay = relay;
    relay.onStatus = setSyncStatus;
    relay.ready.then(markReady);
  });
  import('./peerProvider').then(({ PeerProvider }) => {
    if (closed) return;
    const provider = new PeerProvider(editor.doc.ydoc, room);
    collab.provider = provider;
    const aw = provider.awareness;
    aw.setLocalStateField('user', { name: localName(), color });
    const sync = () => {
      const out: Peer[] = [];
      aw.getStates().forEach((st, id) => {
        if (id === aw.clientID || !st.user) return;
        out.push({ id, name: st.user.name, color: st.user.color, cursor: st.cursor ?? null, selection: st.selection ?? [] });
      });
      peers = out;
      emit();
    };
    aw.on('change', sync);
    const unsub = editor.ui.subscribe(() => {
      const sel = editor.state.selection;
      const prev = aw.getLocalState()?.selection;
      if (prev !== sel) aw.setLocalStateField('selection', sel);
    });
    cleanup = () => {
      unsub();
      aw.off('change', sync);
    };
  });
  return collab;
}

// 128 random bits as URL safe text. Older links carry shorter keys and still work,
// the key is just a string that both rooms are derived from.
export function newRoomKey() {
  const a = crypto.getRandomValues(new Uint8Array(16));
  return btoa(String.fromCharCode(...a)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
