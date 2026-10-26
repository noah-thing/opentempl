import { useState } from 'react';
import { useEditor } from '../editor/Editor';
import { useDoc } from '../editor/hooks';
import { TEMPLATES, type Template } from '../templates';
import { TemplatePreview } from '../templates/Preview';
import { resizeSnapshot } from './ResizePanel';
import { Search } from './controls';
import { ensureFont } from '../fonts/fonts';

// Applying a template: the template is rescaled to this design's size, then its
// pages either replace an empty current page or are added after it.
async function applyTemplate(editor: ReturnType<typeof useEditor>, t: Template) {
  editor.toast('Laying out the template');
  const { snapshot, assets } = await t.build();
  const W = editor.s.meta.width;
  const H = editor.s.meta.height;
  const sized = snapshot.meta.width === W && snapshot.meta.height === H ? snapshot : resizeSnapshot(snapshot, W, H, (id) => assets.find((a) => a.id === id));
  for (const a of assets) if (!editor.doc.getAsset(a.id)) editor.doc.addAsset(a);
  const active = editor.state.activePageId!;
  const empty = editor.s.pages[active]?.elementIds.length === 0;
  let index = editor.s.pageOrder.indexOf(active) + 1;
  const fams = new Set<string>();
  editor.doc.transact(() => {
    sized.pageOrder.forEach((pid, i) => {
      const p = sized.pages[pid];
      let target: string;
      if (i === 0 && empty) {
        target = active;
        editor.doc.updatePage(active, { background: p.background, transition: p.transition });
      } else {
        target = editor.doc.addPage({ background: p.background, transition: p.transition, name: p.name }, index++);
      }
      for (const eid of p.elementIds) {
        const el = sized.elements[eid];
        if ('fontFamily' in el) fams.add(el.fontFamily);
        editor.doc.addElement(target, el);
      }
    });
  });
  editor.ui.set({ selection: [], toast: null });
  await Promise.all([...fams].map((f) => ensureFont(f)));
  editor.refitAllText();
}

export default function TemplatesPanel() {
  const editor = useEditor();
  const meta = useDoc((s) => s.meta);
  const [q, setQ] = useState('');
  const [onlyFit, setOnlyFit] = useState(false);
  const ratio = meta.width / meta.height;
  const list = TEMPLATES.filter((t) => (!q || `${t.name} ${t.category}`.toLowerCase().includes(q.toLowerCase())) && (!onlyFit || Math.abs(t.width / t.height - ratio) < 0.05));
  const cats = [...new Set(list.map((t) => t.category))];
  return (
    <>
      <Search value={q} onChange={setQ} placeholder="Search templates" />
      <div className="chips" style={{ margin: '10px 0 4px' }}>
        <button className={`chip ${!onlyFit ? 'is-on' : ''}`} onClick={() => setOnlyFit(false)}>
          All sizes
        </button>
        <button className={`chip ${onlyFit ? 'is-on' : ''}`} onClick={() => setOnlyFit(true)}>
          Fits this design
        </button>
      </div>
      <p className="hint" style={{ margin: '6px 0 0' }}>
        Any template adapts to your page size. Click to add it.
      </p>
      {cats.map((c) => (
        <div key={c}>
          <div className="panel-section">
            <h3>{c}</h3>
          </div>
          <div className="grid-2">
            {list
              .filter((t) => t.category === c)
              .map((t) => (
                <button
                  key={t.id}
                  className="tile"
                  style={{ display: 'grid', placeItems: 'center', padding: 10, aspectRatio: '1', cursor: 'pointer' }}
                  onClick={() => applyTemplate(editor, t)}
                  title={`${t.name}${t.pages.length > 1 ? `, ${t.pages.length} pages` : ''}`}
                >
                  <TemplatePreview template={t} height={130} />
                </button>
              ))}
          </div>
        </div>
      ))}
    </>
  );
}
