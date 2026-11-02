import { useEffect, useLayoutEffect, useRef } from 'react';
import type { TextElement, TextRun } from '../doc/types';
import { useEditor } from '../editor/Editor';
import { safeColor } from '../render/safe';

// Editing happens in a contenteditable styled exactly like the SVG text, so the
// words do not jump when you start or stop typing. It is rich: select a word
// and make it bold or another colour, and the change is stored as a run.

let savedRange: Range | null = null;

function editorNode() {
  return document.querySelector('.text-editor') as HTMLElement | null;
}

// Remember the last selection inside the editor, so toolbar and panel clicks
// (which move focus) can still format exactly what was selected.
document.addEventListener('selectionchange', () => {
  const node = editorNode();
  const sel = window.getSelection();
  if (!node || !sel || !sel.rangeCount) return;
  const r = sel.getRangeAt(0);
  if (node.contains(r.commonAncestorContainer)) savedRange = r.cloneRange();
});

// Run a formatting command on the selected part of the text being edited.
// Returns false when nothing is selected, so callers style the whole box.
export function richCommand(cmd: 'bold' | 'italic' | 'underline' | 'strikeThrough' | 'foreColor', value?: string) {
  const node = editorNode();
  const sel = window.getSelection();
  // The live selection wins when it is in the editor; the saved one covers
  // toolbar clicks that moved focus away.
  const live = sel?.rangeCount ? sel.getRangeAt(0) : null;
  if (live && !live.collapsed && node?.contains(live.commonAncestorContainer)) savedRange = live.cloneRange();
  if (!node || !savedRange || savedRange.collapsed || !node.contains(savedRange.commonAncestorContainer)) return false;
  node.focus();
  sel?.removeAllRanges();
  sel?.addRange(savedRange);
  document.execCommand('styleWithCSS', false, 'true');
  document.execCommand(cmd, false, value);
  // execCommand replaces nodes; keep the range it left so a second command lands too.
  if (sel?.rangeCount) savedRange = sel.getRangeAt(0).cloneRange();
  node.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
}

// The colour at the start of the selected words, as #RRGGBB, so the colour
// panel can show what the selection is rather than the whole box.
export function richSelectionColor(): string | null {
  if (!hasRichSelection()) return null;
  let n: Node | null = savedRange!.startContainer;
  if (n.nodeType === Node.TEXT_NODE && savedRange!.startOffset >= (n.textContent?.length ?? 0) && n.nextSibling) n = n.nextSibling;
  const el = n.nodeType === Node.ELEMENT_NODE ? (n as HTMLElement) : n.parentElement;
  if (!el) return null;
  const m = getComputedStyle(el).color.match(/\d+(\.\d+)?/g);
  if (!m || m.length < 3) return null;
  return '#' + m.slice(0, 3).map((v) => Math.round(+v).toString(16).padStart(2, '0')).join('').toUpperCase();
}

export function hasRichSelection() {
  const node = editorNode();
  return !!(node && savedRange && !savedRange.collapsed && node.contains(savedRange.commonAncestorContainer));
}

function esc(t: string) {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Runs to HTML for the editor: one span per styled stretch, newlines as <br>.
function toHtml(el: TextElement) {
  const text = el.text;
  if (!el.runs?.length) return esc(text).replace(/\n/g, '<br>') + (text.endsWith('\n') ? '<br>' : '');
  // Boundaries where any run starts or ends.
  const cuts = new Set([0, text.length]);
  for (const r of el.runs) {
    cuts.add(Math.max(0, Math.min(text.length, r.start)));
    cuts.add(Math.max(0, Math.min(text.length, r.end)));
  }
  const pts = [...cuts].sort((a, b) => a - b);
  let html = '';
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const part = esc(text.slice(a, b)).replace(/\n/g, '<br>');
    const st: string[] = [];
    for (const r of el.runs) {
      if (r.start <= a && r.end >= b) {
        if (r.fontWeight !== undefined && /^\d{3}$|^(normal|bold)$/.test(String(r.fontWeight))) st.push(`font-weight:${r.fontWeight}`);
        if (r.italic !== undefined) st.push(`font-style:${r.italic ? 'italic' : 'normal'}`);
        const deco = [r.underline ? 'underline' : '', r.strike ? 'line-through' : ''].filter(Boolean).join(' ');
        if (r.underline !== undefined || r.strike !== undefined) st.push(`text-decoration:${deco || 'none'}`);
        const color = safeColor(r.color);
        if (color) st.push(`color:${color}`);
      }
    }
    html += st.length ? `<span style="${st.join(';')}">${part}</span>` : part;
  }
  return html;
}

function rgbToHex(c: string) {
  const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return c.toUpperCase();
  return '#' + [m[1], m[2], m[3]].map((v) => Number(v).toString(16).padStart(2, '0')).join('').toUpperCase();
}

// Read the editor back into plain text plus runs, using computed styles so it
// works whatever tags the browser inserted while formatting.
function fromDom(node: HTMLElement, el: TextElement): { text: string; runs: TextRun[] } {
  let text = '';
  const marks: { start: number; end: number; weight: number; italic: boolean; underline: boolean; strike: boolean; color: string }[] = [];
  const baseColor = el.color.toUpperCase();
  const walk = (n: Node) => {
    if (n.nodeType === Node.TEXT_NODE) {
      const t = n.textContent ?? '';
      if (!t) return;
      const parent = n.parentElement!;
      const cs = getComputedStyle(parent);
      let deco = '';
      for (let p: HTMLElement | null = parent; p && p !== node.parentElement; p = p.parentElement) deco += ' ' + getComputedStyle(p).textDecorationLine;
      marks.push({
        start: text.length,
        end: text.length + t.length,
        weight: Number(cs.fontWeight) || el.fontWeight,
        italic: cs.fontStyle === 'italic',
        underline: deco.includes('underline'),
        strike: deco.includes('line-through'),
        color: rgbToHex(cs.color),
      });
      text += t;
      return;
    }
    if (n.nodeName === 'BR') {
      text += '\n';
      return;
    }
    const block = n !== node && (n.nodeName === 'DIV' || n.nodeName === 'P');
    if (block && text.length && !text.endsWith('\n')) text += '\n';
    n.childNodes.forEach(walk);
  };
  node.childNodes.forEach(walk);
  text = text.replace(/\n$/, '');
  const runs: TextRun[] = [];
  for (const m of marks) {
    const r: TextRun = { start: m.start, end: Math.min(m.end, text.length) };
    if (m.weight !== el.fontWeight) r.fontWeight = m.weight;
    if (m.italic !== el.italic) r.italic = m.italic;
    if (m.underline !== el.underline) r.underline = m.underline;
    if (m.strike !== el.strike) r.strike = m.strike;
    if (m.color !== baseColor && el.effect.kind !== 'hollow' && el.effect.kind !== 'splice') r.color = m.color;
    if (Object.keys(r).length > 2 && r.end > r.start) runs.push(r);
  }
  // Merge neighbours with identical styling.
  const merged: TextRun[] = [];
  for (const r of runs) {
    const last = merged[merged.length - 1];
    const same = last && last.end === r.start && JSON.stringify({ ...last, start: 0, end: 0 }) === JSON.stringify({ ...r, start: 0, end: 0 });
    if (same) last.end = r.end;
    else merged.push({ ...r });
  }
  return { text, runs: merged };
}

export function TextEditor({ el, zoom }: { el: TextElement; zoom: number }) {
  const editor = useEditor();
  const ref = useRef<HTMLDivElement>(null);
  const initial = useRef(el);

  useLayoutEffect(() => {
    const node = ref.current!;
    node.innerHTML = toHtml(initial.current);
    const selectAll = () => {
      const range = document.createRange();
      range.selectNodeContents(node);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    };
    node.focus();
    selectAll();
    // A second try after the pointer event settles, for boxes made with the text tool.
    requestAnimationFrame(() => {
      if (document.activeElement !== node) {
        node.focus();
        selectAll();
      }
    });
    editor.doc.undo.stopCapturing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [el.id]);

  useEffect(() => {
    const id = el.id;
    return () => {
      savedRange = null;
      // Leaving edit mode with an empty box removes it, like most editors.
      const cur = editor.s.elements[id] as TextElement | undefined;
      if (cur && !cur.text.trim()) editor.doc.deleteElements([id]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [el.id]);

  const onInput = () => {
    const cur = editor.s.elements[el.id] as TextElement | undefined;
    if (!cur) return;
    const { text, runs } = fromDom(ref.current!, cur);
    editor.update(el.id, { text, runs: runs.length ? runs : undefined } as Partial<TextElement>);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Escape') {
      e.preventDefault();
      editor.ui.set({ editingTextId: null });
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      document.execCommand('insertLineBreak');
      return;
    }
    const mod = e.metaKey || e.ctrlKey;
    if (mod && (e.key === 'b' || e.key === 'i' || e.key === 'u')) {
      e.preventDefault();
      const cmd = e.key === 'b' ? 'bold' : e.key === 'i' ? 'italic' : 'underline';
      if (!richCommand(cmd)) {
        if (e.key === 'b') editor.update(el.id, { fontWeight: el.fontWeight >= 600 ? 400 : 700, runs: undefined } as Partial<TextElement>);
        if (e.key === 'i') editor.update(el.id, { italic: !el.italic } as Partial<TextElement>);
        if (e.key === 'u') editor.update(el.id, { underline: !el.underline } as Partial<TextElement>);
      }
    }
  };

  const fs = el.fontSize * zoom;
  const indent = el.list !== 'none' ? Math.max(el.fontSize * 1.1, el.fontSize * 0.5 + el.fontSize * 0.6) * zoom : 0;
  return (
    <div
      ref={ref}
      data-overlay-control
      className="text-editor"
      contentEditable
      suppressContentEditableWarning
      spellCheck
      onInput={onInput}
      onKeyDown={onKeyDown}
      onPointerDown={(e) => e.stopPropagation()}
      onPaste={(e) => {
        e.preventDefault();
        document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
      }}
      style={{
        left: el.x * zoom,
        top: el.y * zoom,
        width: el.w * zoom,
        minHeight: el.h * zoom,
        transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
        fontFamily: `"${el.fontFamily}", "Host Grotesk", sans-serif`,
        fontSize: fs,
        fontWeight: el.fontWeight,
        fontStyle: el.italic ? 'italic' : 'normal',
        lineHeight: `${el.fontSize * el.lineHeight * zoom}px`,
        letterSpacing: `${(el.letterSpacing / 1000) * fs}px`,
        textAlign: el.align,
        textTransform: el.uppercase ? 'uppercase' : 'none',
        textDecoration: [el.underline ? 'underline' : '', el.strike ? 'line-through' : ''].join(' ').trim() || 'none',
        color: el.effect.kind === 'hollow' || el.effect.kind === 'splice' ? 'transparent' : el.color,
        WebkitTextStroke: el.effect.kind === 'hollow' || el.effect.kind === 'splice' ? `${Math.max(1, ((el.effect.amount / 100) * 8 * fs) / 100)}px ${el.color}` : undefined,
        paddingLeft: indent,
        opacity: el.opacity,
      }}
    />
  );
}
