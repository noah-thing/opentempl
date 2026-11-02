import { useSyncExternalStore } from 'react';
import { db } from '../io/db';
import type { Asset } from '../doc/types';
import { UI_FONT } from '../doc/factory';
import { COBALT } from '../doc/colors';

// Brand kits live on this device and work across every design. Canva keeps
// these behind its paid plan; in OpenTempl you can have as many as you like.

export interface BrandKit {
  id: string;
  name: string;
  colors: string[];
  fonts: { heading: string; subheading: string; body: string };
  logos: Asset[];
}

export const DEFAULT_KIT: BrandKit = {
  id: 'default',
  name: 'My brand',
  colors: ['#0B0B0D', COBALT, '#FF4B39', '#FFE600', '#EDEDF0'],
  fonts: { heading: UI_FONT, subheading: UI_FONT, body: UI_FONT },
  logos: [],
};

interface BrandState {
  kits: BrandKit[];
  active: string;
}

let state: BrandState = { kits: [DEFAULT_KIT], active: 'default' };
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded) return;
  loaded = true;
  db.get<BrandState>('brand', 'state').then((s) => {
    if (s?.kits?.length) {
      state = s;
      listeners.forEach((l) => l());
    }
  });
}

function save() {
  db.set('brand', 'state', state);
  listeners.forEach((l) => l());
}

export function useBrandState() {
  load();
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
  );
}

export function useBrand(): BrandKit {
  const s = useBrandState();
  return s.kits.find((k) => k.id === s.active) ?? s.kits[0] ?? DEFAULT_KIT;
}

export function updateKit(id: string, patch: Partial<BrandKit>) {
  state = { ...state, kits: state.kits.map((k) => (k.id === id ? { ...k, ...patch } : k)) };
  save();
}

export function addKit() {
  const id = Math.random().toString(36).slice(2, 10);
  state = { kits: [...state.kits, { ...DEFAULT_KIT, id, name: `Brand ${state.kits.length + 1}`, logos: [] }], active: id };
  save();
}

export function removeKit(id: string) {
  if (state.kits.length <= 1) return;
  const kits = state.kits.filter((k) => k.id !== id);
  state = { kits, active: state.active === id ? kits[0].id : state.active };
  save();
}

export function setActiveKit(id: string) {
  state = { ...state, active: id };
  save();
}
