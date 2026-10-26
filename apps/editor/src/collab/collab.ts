import { useSyncExternalStore } from 'react';
import { WebrtcProvider } from 'y-webrtc';
import type { Editor } from '../editor/Editor';
import type { Id } from '../doc/types';

// Live collaboration without accounts or a Tavla server: peers find each other
// through public y-webrtc signalling and then talk directly. The room key is
// also the encryption password, so signalling servers never see the design.

export interface Peer {
  id: number;
  name: string;
  color: string;
  cursor?: { pageId: Id; x: number; y: number } | null;
  selection?: Id[];
}

const COLORS = ['#2B3BFF', '#FF4B39', '#3EDD8A', '#FF3C8E', '#0AA0FF', '#9A5BFF', '#FF9F1A'];
const ANIMALS = ['Otter', 'Lynx', 'Puffin', 'Moose', 'Seal', 'Hare', 'Crane', 'Fox', 'Owl', 'Elk'];

export const SIGNALING = ['wss://signaling.yjs.dev', 'wss://y-webrtc-signaling-eu.herokuapp.com', 'wss://y-webrtc-signaling-us.herokuapp.com'];

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
  provider: WebrtcProvider;
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
  active?.provider.awareness.setLocalStateField('user', { ...active.provider.awareness.getLocalState()?.user, name: n });
}

export function connectCollab(editor: Editor, room: string): Collab {
  const provider = new WebrtcProvider(`tavla-${room}`, editor.doc.ydoc, { signaling: SIGNALING, password: room });
  const aw = provider.awareness;
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
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
  let last = 0;
  const collab: Collab = {
    provider,
    setCursor: (c) => {
      const now = performance.now();
      if (now - last < 40) return;
      last = now;
      aw.setLocalStateField('cursor', c);
    },
    destroy: () => {
      unsub();
      aw.off('change', sync);
      provider.destroy();
      peers = [];
      emit();
      active = null;
    },
  };
  active = collab;
  return collab;
}

export function newRoomKey() {
  const a = new Uint8Array(12);
  crypto.getRandomValues(a);
  return [...a].map((b) => b.toString(36).padStart(2, '0')).join('').slice(0, 18);
}
