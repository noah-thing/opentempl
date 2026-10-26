import { useEffect, useLayoutEffect, useRef } from 'react';
import type { TextElement } from '../doc/types';
import { useEditor } from '../editor/Editor';

// Editing happens in a contenteditable that is styled exactly like the SVG text,
// so the words do not jump when you start or stop typing.
export function TextEditor({ el, zoom }: { el: TextElement; zoom: number }) {
  const editor = useEditor();
  const ref = useRef<HTMLDivElement>(null);
  const initial = useRef(el.text);

  useLayoutEffect(() => {
    const node = ref.current!;
    node.innerText = initial.current;
    node.focus();
    const range = document.createRange();
    range.selectNodeContents(node);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    editor.doc.undo.stopCapturing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [el.id]);

  useEffect(() => {
    const id = el.id;
    return () => {
      // Leaving edit mode with an empty box removes it, like most editors.
      const cur = editor.s.elements[id] as TextElement | undefined;
      if (cur && !cur.text.trim()) editor.doc.deleteElements([id]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [el.id]);

  const onInput = () => {
    const text = ref.current!.innerText.replace(/\n$/, '');
    editor.update(el.id, { text } as Partial<TextElement>);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Escape') {
      e.preventDefault();
      editor.ui.set({ editingTextId: null });
    }
    const mod = e.metaKey || e.ctrlKey;
    if (mod && (e.key === 'b' || e.key === 'i' || e.key === 'u')) {
      e.preventDefault();
      if (e.key === 'b') editor.update(el.id, { fontWeight: el.fontWeight >= 600 ? 400 : 700 } as Partial<TextElement>);
      if (e.key === 'i') editor.update(el.id, { italic: !el.italic } as Partial<TextElement>);
      if (e.key === 'u') editor.update(el.id, { underline: !el.underline } as Partial<TextElement>);
    }
  };

  const fs = el.fontSize * zoom;
  const indent = el.list !== 'none' ? Math.max(el.fontSize * 1.1, el.fontSize * 0.5 + el.fontSize * 0.6) * zoom : 0;
  return (
    <div
      ref={ref}
      data-overlay-control
      className="text-editor"
      contentEditable="plaintext-only"
      suppressContentEditableWarning
      spellCheck
      onInput={onInput}
      onKeyDown={onKeyDown}
      onPointerDown={(e) => e.stopPropagation()}
      onPaste={(e) => {
        e.preventDefault();
        const t = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, t);
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
        WebkitTextStroke: el.effect.kind === 'hollow' || el.effect.kind === 'splice' ? `${Math.max(1, (el.effect.amount / 100) * 8 * fs / 100)}px ${el.color}` : undefined,
        paddingLeft: indent,
        opacity: el.opacity,
      }}
    />
  );
}
