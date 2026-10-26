import { useSyncExternalStore } from 'react';
import type { Snapshot } from '../doc/design';
import { fontsVersion, onFontsChange } from '../fonts/fonts';
import { useStore } from '../lib/store';
import type { EditorState } from './state';
import { useEditor } from './Editor';

export function useDoc<S>(selector: (s: Snapshot) => S): S {
  const editor = useEditor();
  return useStore(editor.doc, selector);
}

export function useUI<S>(selector: (s: EditorState) => S): S {
  const editor = useEditor();
  return useStore(editor.ui, selector);
}

export function useFontsVersion() {
  return useSyncExternalStore(onFontsChange, fontsVersion, fontsVersion);
}

// Read-only drag helper: calls move with pointer events until release.
export function startDrag(
  e: { pointerId: number; clientX: number; clientY: number },
  move: (ev: PointerEvent, dx: number, dy: number) => void,
  up?: (ev: PointerEvent, moved: boolean) => void,
  threshold = 3,
) {
  const sx = e.clientX;
  const sy = e.clientY;
  let moved = false;
  const onMove = (ev: PointerEvent) => {
    const dx = ev.clientX - sx;
    const dy = ev.clientY - sy;
    if (!moved && Math.hypot(dx, dy) < threshold) return;
    moved = true;
    move(ev, dx, dy);
  };
  const onUp = (ev: PointerEvent) => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
    up?.(ev, moved);
  };
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);
}
