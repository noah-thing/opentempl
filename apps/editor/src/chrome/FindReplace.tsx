import { useMemo, useState } from 'react';
import { useEditor } from '../editor/Editor';
import { useDoc } from '../editor/hooks';
import type { TextElement } from '../doc/types';
import { Icon } from '../ui/icons';
import { useEscape } from '../ui/useEscape';

// Find and replace across every text box in the design. Locked text is skipped.
export function FindReplace() {
  const editor = useEditor();
  const elements = useDoc((s) => s.elements);
  const order = useDoc((s) => s.pageOrder);
  const pages = useDoc((s) => s.pages);
  const [find, setFind] = useState('');
  const [replace, setReplace] = useState('');
  const [caseSensitive, setCase] = useState(false);
  const [index, setIndex] = useState(0);
  const close = () => editor.ui.set({ findOpen: false });
  useEscape(close);

  const re = useMemo(() => {
    if (!find) return null;
    return new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), caseSensitive ? 'g' : 'gi');
  }, [find, caseSensitive]);

  // Matching text boxes in page order, top to bottom.
  const hits = useMemo(() => {
    if (!re) return [] as { el: TextElement; count: number }[];
    const out: { el: TextElement; count: number }[] = [];
    for (const pid of order)
      for (const id of pages[pid]?.elementIds ?? []) {
        const el = elements[id];
        if (el?.type !== 'text' || el.locked) continue;
        const count = (el.text.match(re) ?? []).length;
        if (count) out.push({ el, count });
      }
    return out;
  }, [re, order, pages, elements]);
  const total = hits.reduce((a, h) => a + h.count, 0);

  const go = (i: number) => {
    if (!hits.length) return;
    const n = (i + hits.length) % hits.length;
    setIndex(n);
    editor.select([hits[n].el.id], { expandGroups: false });
  };
  const replaceOne = () => {
    const h = hits[index % Math.max(1, hits.length)];
    if (!h || !re) return;
    editor.update(h.el.id, { text: h.el.text.replace(new RegExp(re.source, re.flags.replace('g', '')), replace) } as Partial<TextElement>);
  };
  const replaceAll = () => {
    if (!re) return;
    editor.doc.transact(() => hits.forEach((h) => editor.update(h.el.id, { text: h.el.text.replace(re, replace) } as Partial<TextElement>)));
    editor.toast(`Replaced ${total} ${total === 1 ? 'match' : 'matches'}`);
  };

  return (
    <div className="popover find" style={{ right: 20, bottom: 56, width: 340 }} onKeyDown={(e) => e.stopPropagation()}>
      <div style={{ padding: 14 }} className="stack">
        <div className="row-between">
          <b>Find and replace</b>
          <button className="icon-btn" onClick={close} title="Close">
            <Icon name="close" />
          </button>
        </div>
        <div className="field">
          <Icon name="search" />
          <input
            autoFocus
            value={find}
            placeholder="Find"
            onChange={(e) => {
              setFind(e.target.value);
              setIndex(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') go(e.shiftKey ? index - 1 : index + 1);
              if (e.key === 'Escape') close();
            }}
          />
          <span className="muted tabular" style={{ whiteSpace: 'nowrap', fontSize: 12 }}>
            {find ? `${total} found` : ''}
          </span>
        </div>
        <div className="field">
          <input value={replace} placeholder="Replace with" onChange={(e) => setReplace(e.target.value)} onKeyDown={(e) => e.key === 'Escape' && close()} />
        </div>
        <div className="row-between">
          <label className="row" style={{ gap: 8, fontSize: 12 }}>
            <button className={`switch ${caseSensitive ? 'is-on' : ''}`} onClick={() => setCase((c) => !c)} aria-label="Match case" />
            Match case
          </label>
          <div className="row" style={{ gap: 4 }}>
            <button className="icon-btn" title="Previous" onClick={() => go(index - 1)} disabled={!hits.length}>
              <Icon name="chevron-up" />
            </button>
            <button className="icon-btn" title="Next" onClick={() => go(index + 1)} disabled={!hits.length}>
              <Icon name="chevron-down" />
            </button>
          </div>
        </div>
        <div className="grid-2">
          <button className="btn btn-outline btn-sm" disabled={!hits.length} onClick={replaceOne}>
            Replace
          </button>
          <button className="btn btn-ink btn-sm" disabled={!hits.length} onClick={replaceAll}>
            Replace all
          </button>
        </div>
      </div>
    </div>
  );
}
