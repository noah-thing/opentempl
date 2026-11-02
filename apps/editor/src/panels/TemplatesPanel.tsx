import { useEffect, useState } from 'react';
import { blended, byScore, loadPackTemplate, loadTemplateIndex, thumbUrl, type TemplateIndex } from '../templates/packs';
import { useEditor } from '../editor/Editor';
import { useDoc } from '../editor/hooks';
import { TEMPLATES, type Template } from '../templates';
import { TemplatePreview } from '../templates/Preview';
import { resizeSnapshot } from './ResizePanel';
import { Search } from './controls';
import { ensureFont } from '../fonts/fonts';
import { Icon } from '../ui/icons';
import { Menu, Popover, usePopover } from '../ui/Popover';

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
  const [index, setIndex] = useState<TemplateIndex | null>(null);
  const [vibe, setVibe] = useState('all');
  const vibeMenu = usePopover();
  useEffect(() => {
    loadTemplateIndex().then(setIndex);
  }, []);
  const ratio = meta.width / meta.height;
  const vibes = Object.entries(index?.vibes ?? {})
    .filter(([id]) => index?.templates.some((t) => t.vibe === id))
    .sort((a, b) => (a[1].order ?? 99) - (b[1].order ?? 99));
  const libRaw = (index?.templates ?? []).filter(
    (t) =>
      (vibe === 'all' || t.vibe === vibe) &&
      (!q || `${t.name} ${t.category} ${t.tags.join(' ')} ${index?.vibes[t.vibe]?.name ?? ''}`.toLowerCase().includes(q.toLowerCase())) &&
      (!onlyFit || Math.abs(t.width / t.height - ratio) < 0.05),
  );
  const lib = vibe === 'all' && !q ? blended(libRaw) : byScore(libRaw);
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
      {vibes.length ? (
        <>
          <div className="panel-section">
            <h3>Library</h3>
          </div>
          <button className="select-btn" aria-haspopup="listbox" onClick={vibeMenu.toggle}>
            <span>{vibe === 'all' ? 'Every vibe' : index?.vibes[vibe]?.name ?? 'Every vibe'}</span>
            <Icon name="chevron-down" size={12} />
          </button>
          {vibeMenu.anchor ? (
            <Popover anchor={vibeMenu.anchor} onClose={vibeMenu.close} className="menu menu-scroll" width={vibeMenu.anchor.width}>
              <Menu
                onClose={vibeMenu.close}
                items={[
                  { label: 'Every vibe', checked: vibe === 'all', onClick: () => setVibe('all') },
                  ...vibes.map(([id, v]) => ({ label: v.name, checked: vibe === id, onClick: () => setVibe(id) })),
                ]}
              />
            </Popover>
          ) : null}
          <div className="grid-2">
            {lib.slice(0, vibe === 'all' && !q ? 60 : 400).map((t) => (
              <button
                key={t.id}
                className="tile"
                style={{ display: 'grid', placeItems: 'center', padding: 8, aspectRatio: '1', cursor: 'pointer' }}
                title={`${t.name}${t.pages > 1 ? `, ${t.pages} pages` : ''}`}
                onClick={async () => {
                  const tpl = await loadPackTemplate(t.id, t.vibe);
                  if (tpl) applyTemplate(editor, tpl);
                }}
              >
                <img src={thumbUrl(t.id)} alt={t.name} loading="lazy" style={{ maxWidth: '100%', maxHeight: '100%', boxShadow: 'var(--shadow-1)' }} />
              </button>
            ))}
          </div>
          {vibe === 'all' && !q && lib.length > 60 ? <p className="hint">Pick a vibe or search to see all {lib.length}.</p> : null}
          <div className="panel-section">
            <h3>Classics</h3>
          </div>
        </>
      ) : null}
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
