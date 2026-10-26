import { useEffect } from 'react';
import { useEditor, type Editor } from './Editor';
import { isTyping, ZOOM_MAX, ZOOM_MIN } from '../canvas/Viewport';
import { makeLine, makeShape, makeText, TEXT_PRESETS } from '../doc/factory';
import { importFiles } from '../io/upload';
import { prepareImage } from '../io/upload';
import { addUpload } from '../io/uploads';

export interface Shortcut {
  keys: string; // display form
  label: string;
  group: 'Edit' | 'Arrange' | 'View' | 'Tools' | 'Text';
}

export const SHORTCUTS: Shortcut[] = [
  { keys: '⌘ Z', label: 'Undo', group: 'Edit' },
  { keys: '⌘ ⇧ Z', label: 'Redo', group: 'Edit' },
  { keys: '⌘ C / X / V', label: 'Copy, cut, paste', group: 'Edit' },
  { keys: '⌘ D', label: 'Duplicate', group: 'Edit' },
  { keys: '⌘ A', label: 'Select everything on the page', group: 'Edit' },
  { keys: 'Delete', label: 'Delete', group: 'Edit' },
  { keys: '⌥ drag', label: 'Duplicate while dragging', group: 'Edit' },
  { keys: '⌘ K', label: 'Command palette', group: 'Edit' },
  { keys: '⌥ ⌘ C / V', label: 'Copy or paste style', group: 'Edit' },
  { keys: '⌘ F', label: 'Find and replace', group: 'Edit' },
  { keys: '⌘ G', label: 'Group', group: 'Arrange' },
  { keys: '⌘ ⇧ G', label: 'Ungroup', group: 'Arrange' },
  { keys: '⌘ ]', label: 'Bring forward', group: 'Arrange' },
  { keys: '⌘ [', label: 'Send backward', group: 'Arrange' },
  { keys: '⌘ ⌥ ]', label: 'Bring to front', group: 'Arrange' },
  { keys: '⌘ ⌥ [', label: 'Send to back', group: 'Arrange' },
  { keys: '⌘ ⇧ L', label: 'Lock or unlock', group: 'Arrange' },
  { keys: 'Arrows', label: 'Nudge 1 px, with ⇧ 10 px', group: 'Arrange' },
  { keys: '⌥ ⇧ H / V', label: 'Flip horizontal or vertical', group: 'Arrange' },
  { keys: 'T', label: 'Text box', group: 'Tools' },
  { keys: 'R', label: 'Rectangle', group: 'Tools' },
  { keys: 'C', label: 'Circle', group: 'Tools' },
  { keys: 'L', label: 'Line', group: 'Tools' },
  { keys: 'S', label: 'Sticky note', group: 'Tools' },
  { keys: 'P', label: 'Draw', group: 'Tools' },
  { keys: 'H or Space', label: 'Hand, pan the canvas', group: 'Tools' },
  { keys: 'V or Esc', label: 'Select', group: 'Tools' },
  { keys: '⌘ B / I / U', label: 'Bold, italic, underline', group: 'Text' },
  { keys: '⌘ ⇧ K', label: 'Uppercase', group: 'Text' },
  { keys: '⌘ ⇧ + / −', label: 'Bigger or smaller text', group: 'Text' },
  { keys: '⌘ + / −', label: 'Zoom in or out', group: 'View' },
  { keys: '⌘ 0', label: 'Fit page', group: 'View' },
  { keys: '⌘ 1', label: 'Actual size', group: 'View' },
  { keys: '⌘ ⌥ P', label: 'Present', group: 'View' },
  { keys: '⌘ ⇧ R', label: 'Rulers and guides', group: 'View' },
  { keys: "⌘ '", label: 'Layout grid', group: 'View' },
  { keys: 'Page up / down', label: 'Previous or next page', group: 'View' },
  { keys: '?', label: 'This list', group: 'View' },
];

function zoomBy(editor: Editor, f: number) {
  editor.ui.set({ zoom: Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, editor.state.zoom * f)), autoFit: false });
}

export function useShortcuts() {
  const editor = useEditor();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e) || editor.state.presenting) return;
      const mod = e.metaKey || e.ctrlKey;
      const k = e.key.toLowerCase();
      const sel = editor.state.selection;
      const stop = () => {
        e.preventDefault();
        e.stopPropagation();
      };

      if (mod && k === 'z') {
        stop();
        return e.shiftKey ? editor.redo() : editor.undo();
      }
      if (mod && k === 'y') return stop(), editor.redo();
      if (mod && k === 'k' && !e.shiftKey) return stop(), editor.ui.set({ commandOpen: true });
      if (mod && k === 'd') return stop(), editor.duplicateSelected();
      if (mod && k === 'a') return stop(), editor.selectAll();
      if (mod && e.altKey && (k === 'c' || e.code === 'KeyC')) return stop(), editor.copyStyle();
      if (mod && e.altKey && (k === 'v' || e.code === 'KeyV')) return stop(), editor.pasteStyle();
      if (mod && k === 'f') return stop(), editor.ui.set({ findOpen: true });
      if (mod && k === 'c') return editor.copy();
      if (mod && k === 'x') return editor.copy(true);
      if (mod && k === 'g') return stop(), e.shiftKey ? editor.ungroup() : editor.group();
      if (mod && k === 'l' && e.shiftKey) return stop(), editor.toggleLock();
      if (mod && (k === ']' || e.code === 'BracketRight')) return stop(), editor.reorder(e.altKey ? 'front' : 'forward');
      if (mod && (k === '[' || e.code === 'BracketLeft')) return stop(), editor.reorder(e.altKey ? 'back' : 'backward');
      if (mod && e.altKey && k === 'p') return stop(), editor.ui.set({ presenting: true });
      if (mod && e.shiftKey && k === 'r') return stop(), editor.ui.set({ showRulers: !editor.state.showRulers });
      if (mod && (k === "'" || e.code === 'Quote')) return stop(), editor.ui.set({ showGrid: !editor.state.showGrid });
      if (mod && e.shiftKey && (k === '=' || k === '+')) return stop(), editor.updateSelected((el) => (el.type === 'text' ? { fontSize: Math.round(el.fontSize * 1.1 + 1) } : null));
      if (mod && e.shiftKey && (k === '-' || k === '_')) return stop(), editor.updateSelected((el) => (el.type === 'text' ? { fontSize: Math.max(4, Math.round(el.fontSize / 1.1 - 1)) } : null));
      if (mod && e.shiftKey && k === 'k') return stop(), editor.updateSelected((el) => (el.type === 'text' ? { uppercase: !el.uppercase } : null));
      if (mod && (k === 'b' || k === 'i' || k === 'u') && sel.length) {
        stop();
        return editor.updateSelected((el) => {
          if (el.type !== 'text') return null;
          if (k === 'b') return { fontWeight: el.fontWeight >= 600 ? 400 : 700 };
          if (k === 'i') return { italic: !el.italic };
          return { underline: !el.underline };
        });
      }
      if (mod && (k === '=' || k === '+')) return stop(), zoomBy(editor, 1.25);
      if (mod && k === '-') return stop(), zoomBy(editor, 0.8);
      if (mod && k === '0') return stop(), window.dispatchEvent(new Event('tavla:fit'));
      if (mod && k === '1') return stop(), editor.ui.set({ zoom: 1, autoFit: false });
      if (mod && k === 'e') return stop(), editor.ui.set({ exportOpen: true });
      if (mod && k === 's') return stop(), editor.toast('Saved on this device. Tavla saves as you go.');
      if (e.altKey && e.shiftKey && k === 'h') return stop(), editor.flip('x');
      if (e.altKey && e.shiftKey && k === 'v') return stop(), editor.flip('y');

      if (k === 'escape') {
        if (editor.state.tool !== 'select') return editor.ui.set({ tool: 'select' });
        if (editor.state.cropId) return editor.ui.set({ cropId: null });
        if (editor.state.panel && ['font', 'color', 'effects', 'adjust', 'animate', 'position', 'chart', 'table'].includes(editor.state.panel))
          return editor.ui.set({ panel: null });
        return editor.clearSelection();
      }
      if ((k === 'backspace' || k === 'delete') && sel.length) return stop(), editor.deleteSelected();
      if (k.startsWith('arrow') && sel.length) {
        stop();
        const step = e.shiftKey ? 10 : 1;
        const dx = k === 'arrowleft' ? -step : k === 'arrowright' ? step : 0;
        const dy = k === 'arrowup' ? -step : k === 'arrowdown' ? step : 0;
        return editor.nudge(dx, dy);
      }
      if (k === 'enter' && sel.length === 1) {
        const el = editor.s.elements[sel[0]];
        if (el?.type === 'text') return stop(), editor.ui.set({ editingTextId: el.id });
        if (el?.type === 'image') return stop(), editor.ui.set({ cropId: el.id });
      }
      if (k === 'pagedown' || k === 'pageup') {
        stop();
        const order = editor.s.pageOrder;
        const i = order.indexOf(editor.state.activePageId ?? '');
        const n = order[Math.max(0, Math.min(order.length - 1, i + (k === 'pagedown' ? 1 : -1)))];
        if (n) editor.ui.set({ activePageId: n, selection: [] });
        return;
      }
      if (mod || e.altKey) return;
      const tools: Record<string, typeof editor.state.tool> = { v: 'select', h: 'hand', t: 'text', r: 'rect', c: 'ellipse', l: 'line', s: 'sticky', p: 'draw' };
      if (tools[k]) {
        stop();
        editor.ui.set({ tool: tools[k], selection: tools[k] === 'select' ? editor.state.selection : [] });
        if (tools[k] === 'draw') editor.ui.set({ panel: 'draw' });
        return;
      }
      if (k === '?') return stop(), editor.ui.set({ shortcutsOpen: true });
    };

    // Paste: Tavla elements, images from the clipboard, or plain text as a text box.
    const onPaste = async (e: ClipboardEvent) => {
      if (isTyping(e as unknown as KeyboardEvent) || editor.state.presenting) return;
      const dt = e.clipboardData;
      if (!dt) return;
      const files = [...dt.files].filter((f) => f.type.startsWith('image/'));
      e.preventDefault();
      if (files.length) {
        await importFiles(editor, files);
        return;
      }
      const text = dt.getData('text/plain');
      if (await editor.paste(text)) return;
      const html = dt.getData('text/html');
      const img = html.match(/<img[^>]+src="(data:image\/[^"]+)"/)?.[1];
      if (img) {
        const asset = await prepareImage(await (await fetch(img)).blob(), 'pasted');
        editor.doc.addAsset(asset);
        addUpload(asset);
        editor.addImageAsset(asset.id, asset.width, asset.height);
        return;
      }
      if (text.trim()) {
        if (/^#?[0-9a-f]{6}$/i.test(text.trim()) && editor.state.selection.length) {
          const color = '#' + text.trim().replace('#', '').toUpperCase();
          editor.updateSelected((el) => (el.type === 'shape' ? { fill: { type: 'solid', color } } : el.type === 'text' ? { color } : null));
          return;
        }
        const t = makeText({ ...TEXT_PRESETS.body, text: text.trim().slice(0, 4000), w: Math.min(editor.s.meta.width * 0.7, 900) });
        editor.add([t]);
      }
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('paste', onPaste);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('paste', onPaste);
    };
  }, [editor]);
}

// Quick add helpers used by the command palette and menus.
export const QUICK = {
  heading: (ed: Editor) => ed.add([makeText({ ...TEXT_PRESETS.heading, w: Math.min(ed.s.meta.width * 0.8, 1400) })]),
  subheading: (ed: Editor) => ed.add([makeText({ ...TEXT_PRESETS.subheading, w: Math.min(ed.s.meta.width * 0.7, 1100) })]),
  body: (ed: Editor) => ed.add([makeText({ ...TEXT_PRESETS.body, w: Math.min(ed.s.meta.width * 0.6, 900) })]),
  rect: (ed: Editor) => ed.add([makeShape('rect', { fill: { type: 'solid', color: '#2B3BFF' } })]),
  circle: (ed: Editor) => ed.add([makeShape('ellipse', { fill: { type: 'solid', color: '#FF4B39' } })]),
  line: (ed: Editor) => ed.add([makeLine({ w: Math.min(ed.s.meta.width * 0.4, 600) })]),
};
