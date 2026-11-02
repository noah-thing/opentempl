import { useMemo, useState } from 'react';
import { useEditor } from '../editor/Editor';
import { useDoc, useFontsVersion, useUI } from '../editor/hooks';
import type { Element } from '../doc/types';
import { Icon } from '../ui/icons';
import { ElementView } from '../render/ElementView';
import { RenderContext, type RenderEnv } from '../render/RenderContext';

function describe(el: Element) {
  if (el.name) return el.name;
  switch (el.type) {
    case 'text':
      return el.text.replace(/\s+/g, ' ').trim().slice(0, 80) || 'Empty text';
    case 'shape':
      return el.shape[0].toUpperCase() + el.shape.slice(1);
    case 'image':
      return el.assetId ? 'Photo' : 'Empty frame';
    case 'line':
      return el.end !== 'none' ? 'Arrow' : 'Line';
    case 'svg':
      return el.source?.split(':').pop() ?? 'Graphic';
    case 'draw':
      return 'Drawing';
    case 'chart':
      return `${el.kind[0].toUpperCase() + el.kind.slice(1)} chart`;
    case 'qr':
      return 'QR code';
    case 'table':
      return `Table ${el.rows} × ${el.cols}`;
  }
}

export default function LayersPanel() {
  const editor = useEditor();
  const pageId = useUI((s) => s.activePageId);
  const sel = useUI((s) => s.selection);
  const ids = useDoc((s) => (pageId ? s.pages[pageId]?.elementIds ?? [] : []));
  const elements = useDoc((s) => s.elements);
  const fontsVersion = useFontsVersion();
  const [drag, setDrag] = useState<{ id: string; over: number; pos: 'above' | 'below' } | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const top = [...ids].reverse();
  const env: RenderEnv = useMemo(() => ({ assetUrl: (id) => editor.doc.assetUrl(id), assetSize: () => undefined, fontsVersion, mode: 'thumb', idPrefix: 'layer-' }), [editor, fontsVersion]);

  if (!ids.length)
    return (
      <div className="empty">
        <h4>This page is empty</h4>
        <span className="hint">Everything you add shows up here, top layer first.</span>
      </div>
    );

  return (
    <RenderContext.Provider value={env}>
      <p className="hint" style={{ margin: '0 0 8px' }}>
        Top of the list sits in front. Drag to restack.
      </p>
      {top.map((id, i) => {
        const el = elements[id];
        if (!el) return null;
        const on = sel.includes(id);
        return (
          <div
            key={id}
            className={`layer-row ${on ? 'is-on' : ''} ${drag?.id === id ? 'is-dragging' : ''} ${drag && drag.over === i && drag.id !== id ? `drop-${drag.pos}` : ''}`}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = 'move';
              setDrag({ id, over: i, pos: 'above' });
            }}
            onDragOver={(e) => {
              e.preventDefault();
              const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
              const pos = e.clientY < r.top + r.height / 2 ? 'above' : 'below';
              if (drag && (drag.over !== i || drag.pos !== pos)) setDrag({ ...drag, over: i, pos });
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (!drag) return;
              // List is top first; stacking order is bottom first. Dropping above a row
              // puts the layer in front of it, below puts it behind.
              const stack = top.length - 1 - drag.over;
              let target = drag.pos === 'above' ? stack + 1 : stack;
              if (ids.indexOf(drag.id) < target) target -= 1;
              editor.doc.setPageOrderForElement(drag.id, Math.max(0, target));
              setDrag(null);
            }}
            onDragEnd={() => setDrag(null)}
            onClick={(e) => editor.select([id], { additive: e.shiftKey, expandGroups: false })}
            onDoubleClick={() => setRenaming(id)}
          >
            <span className="thumb">
              <svg viewBox={`${el.x - 4} ${el.y - 4} ${el.w + 8} ${el.h + 8}`} width="30" height="30" preserveAspectRatio="xMidYMid meet">
                <ElementView el={{ ...el, hidden: false, anim: null }} />
              </svg>
            </span>
            {renaming === id ? (
              <input
                autoFocus
                className="num"
                style={{ flex: 1, width: 'auto' }}
                defaultValue={describe(el)}
                onBlur={(e) => {
                  editor.update(id, { name: e.target.value.trim() || undefined });
                  setRenaming(null);
                }}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                  if (e.key === 'Escape') setRenaming(null);
                }}
              />
            ) : (
              <span className="name" title={describe(el)} style={{ opacity: el.hidden ? 0.45 : 1 }}>
                {describe(el)}
                {el.groupId ? <span className="muted"> · group</span> : null}
              </span>
            )}
            <button
              className={`icon-btn ${el.locked ? 'is-on' : ''}`}
              title={el.locked ? 'Unlock' : 'Lock'}
              onClick={(e) => {
                e.stopPropagation();
                editor.update(id, { locked: !el.locked });
              }}
            >
              <Icon name={el.locked ? 'lock' : 'unlock'} size={14} />
            </button>
            <button
              className={`icon-btn ${el.hidden ? 'is-on' : ''}`}
              title={el.hidden ? 'Show' : 'Hide'}
              onClick={(e) => {
                e.stopPropagation();
                editor.update(id, { hidden: !el.hidden });
              }}
            >
              <Icon name={el.hidden ? 'eye-off' : 'eye'} size={14} />
            </button>
          </div>
        );
      })}
    </RenderContext.Provider>
  );
}
