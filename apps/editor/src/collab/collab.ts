import { useSyncExternalStore } from 'react';
import type { PeerProvider } from './peerProvider';
import type { Editor } from '../editor/Editor';
import type { Id } from '../doc/types';

// Live collaboration without accounts or a Tavla server: peers are introduced
// by the free PeerJS broker and then talk directly over encrypted WebRTC. The
// broker only ever sees a hash of the room key, never the design.

export interface Peer {
  id: number;
  name: string;
  color: string;
  cursor?: { pageId: Id; x: number; y: number } | null;
  selection?: Id[];
}

const COLORS = ['#2B3BFF', '#FF4B39', '#3EDD8A', '#FF3C8E', '#0AA0FF', '#9A5BFF', '#FF9F1A'];
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

export interface Collab {
  provider: PeerProvider | null; // null until the networking code has loaded
  destroy: () => void;
  setCursor: (c: Peer['cursor']) => void;
}

let active: Collab | null = null;
export function activeCollab() {
  return active;
}

export function localName() {
  let n = localStorage.getItem('tavla:name');
  if (!n) {
    n = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    localStorage.setItem('tavla:name', n);
  }
  return n;
}

export function setLocalName(n: string) {
  localStorage.setItem('tavla:name', n);
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
  const collab: Collab = {
    provider: null,
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
      peers = [];
      emit();
      if (active === collab) active = null;
    },
  };
  active = collab;
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

export function newRoomKey() {
  const a = new Uint8Array(12);
  crypto.getRandomValues(a);
  return [...a].map((b) => b.toString(36).padStart(2, '0')).join('').slice(0, 18);
}
