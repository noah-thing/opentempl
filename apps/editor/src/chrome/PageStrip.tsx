import { useMemo, useState } from 'react';
import { useEditor } from '../editor/Editor';
import { useDoc, useFontsVersion, useUI } from '../editor/hooks';
import { PageView } from '../render/PageView';
import { RenderContext, type RenderEnv } from '../render/RenderContext';
import { Icon } from '../ui/icons';

export function PageStrip() {
  const editor = useEditor();
  const order = useDoc((s) => s.pageOrder);
  const pages = useDoc((s) => s.pages);
  const elements = useDoc((s) => s.elements);
  const meta = useDoc((s) => s.meta);
  const active = useUI((s) => s.activePageId);
  const fontsVersion = useFontsVersion();
  const [drag, setDrag] = useState<{ id: string; over: number } | null>(null);
  const h = 72;
  const w = (meta.width / meta.height) * h;
  const env: RenderEnv = useMemo(
    () => ({ assetUrl: (id) => editor.doc.assetUrl(id), assetSize: () => undefined, fontsVersion, mode: 'thumb', idPrefix: 'strip-' }),
    [editor, fontsVersion],
  );
  return (
    <div className="strip">
      <RenderContext.Provider value={env}>
        {order.map((id, i) => (
          <button
            key={id}
            className={`strip-page ${id === active ? 'is-on' : ''} ${drag && drag.over === i && drag.id !== id ? 'is-drop' : ''}`}
            style={{ width: w, height: h }}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = 'move';
              setDrag({ id, over: i });
            }}
            onDragOver={(e) => {
              e.preventDefault();
              if (drag && drag.over !== i) setDrag({ ...drag, over: i });
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (drag) editor.doc.movePage(drag.id, drag.over);
              setDrag(null);
            }}
            onDragEnd={() => setDrag(null)}
            onClick={() => editor.ui.set({ activePageId: id, selection: [] })}
          >
            {pages[id] ? <PageView page={pages[id]} elements={elements} width={meta.width} height={meta.height} displayWidth={w} displayHeight={h} /> : null}
            <span className="n">{i + 1}</span>
          </button>
        ))}
      </RenderContext.Provider>
      <button className="strip-add" title="Add page" onClick={() => editor.addPage(order[order.length - 1])}>
        <Icon name="plus" />
      </button>
    </div>
  );
}
