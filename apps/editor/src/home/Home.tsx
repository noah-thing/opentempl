import { useEffect, useMemo, useState } from 'react';
import { Mark } from '../ui/Logo';
import { Eyes } from '../ui/Logo';
import { Icon } from '../ui/icons';
import { navigate } from '../App';
import { FORMATS } from '../doc/formats';
import { deleteDesign, duplicateDesign, getThumb, importTavla, listDesigns, onDesignsChange, updateEntry, type DesignEntry } from '../io/designs';
import { pickFiles } from '../io/upload';
import { Menu, Popover, type MenuItem } from '../ui/Popover';
import { TEMPLATES } from '../templates';
import { TemplatePreview } from '../templates/Preview';
import './home.css';

const SHEETS = ['ig-post', 'story', 'slides', 'a3-poster', 'yt-thumb', 'logo', 'a5-flyer', 'whiteboard'];

function ago(t: number) {
  const s = (Date.now() - t) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)} d ago`;
  return new Date(t).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
}

export function Home() {
  const [designs, setDesigns] = useState<DesignEntry[] | null>(null);
  const [q, setQ] = useState('');
  const [custom, setCustom] = useState(false);
  const [cw, setCw] = useState(1600);
  const [ch, setCh] = useState(900);
  const [tplFilter, setTplFilter] = useState('All');
  const [starredOnly, setStarredOnly] = useState(false);
  const [drop, setDrop] = useState(false);

  useEffect(() => {
    document.title = 'Tavla';
    const load = () => listDesigns().then(setDesigns);
    load();
    return onDesignsChange(load) as () => void;
  }, []);

  const filtered = useMemo(() => (designs ?? []).filter((d) => (!q || d.title.toLowerCase().includes(q.toLowerCase())) && (!starredOnly || d.starred)), [designs, q, starredOnly]);
  const cats = ['All', ...new Set(TEMPLATES.map((t) => t.category))];
  const tpls = TEMPLATES.filter((t) => tplFilter === 'All' || t.category === tplFilter);

  return (
    <div
      className="home"
      onDragOver={(e) => {
        e.preventDefault();
        setDrop(true);
      }}
      onDragLeave={(e) => e.currentTarget === e.target && setDrop(false)}
      onDrop={async (e) => {
        e.preventDefault();
        setDrop(false);
        const f = [...e.dataTransfer.files].find((x) => x.name.endsWith('.tavla'));
        if (f) {
          const id = await importTavla(f);
          if (id) navigate(`/d/${id}`);
        }
      }}
    >
      <header className="home-top">
        <a className="home-brand" href="#/">
          <Mark size={34} />
          <span>tavla</span>
        </a>
        <div className="field home-search">
          <Icon name="search" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your designs" />
        </div>
        <button
          className="btn"
          onClick={async () => {
            const [f] = await pickFiles('.tavla');
            if (!f) return;
            const id = await importTavla(f);
            if (id) navigate(`/d/${id}`);
          }}
        >
          <Icon name="folder" /> Open file
        </button>
        <a className="btn" href="https://github.com/noah-thing/tavla" target="_blank" rel="noreferrer">
          Source
        </a>
      </header>

      <main className="home-main">
        <section className="home-hero">
          <img className="home-cursor" src={`${import.meta.env.BASE_URL}library/stickers/voxel-cursor.webp`} alt="" aria-hidden />
          <h1>Pick a sheet.</h1>
          <p>Everything you make stays on this machine. No account, no watermark, no paid tier.</p>
        </section>

        <section className="sheets" aria-label="Start a design">
          {SHEETS.map((id, i) => {
            const f = FORMATS.find((x) => x.id === id)!;
            const s = 102 / Math.max(f.width, f.height);
            return (
              <button key={id} className="sheet" onClick={() => navigate(`/new?format=${id}`)} style={{ ['--i' as string]: i }}>
                <span className="sheet-stage">
                  <span className="sheet-paper" style={{ width: f.width * s, height: f.height * s }}>
                    <span className="sheet-eyes">
                      <i />
                      <i />
                    </span>
                  </span>
                </span>
                <span className="sheet-name">{f.name}</span>
                <span className="sheet-size tabular">{f.note ?? `${f.width} × ${f.height}`}</span>
              </button>
            );
          })}
          <button className="sheet sheet-custom" onClick={() => setCustom((c) => !c)}>
            <span className="sheet-stage">
              <span className="sheet-paper is-dashed" style={{ width: 84, height: 84 }}>
                <Icon name="plus" size={16} />
              </span>
            </span>
            <span className="sheet-name">Custom size</span>
            <span className="sheet-size">Any width or height</span>
          </button>
        </section>
        {custom ? (
          <form
            className="custom-row"
            onSubmit={(e) => {
              e.preventDefault();
              navigate(`/new?w=${cw}&h=${ch}`);
            }}
          >
            <label className="field">
              <span className="muted">W</span>
              <input value={cw} onChange={(e) => setCw(Number(e.target.value) || 0)} />
              <span className="muted">px</span>
            </label>
            <label className="field">
              <span className="muted">H</span>
              <input value={ch} onChange={(e) => setCh(Number(e.target.value) || 0)} />
              <span className="muted">px</span>
            </label>
            <button className="btn btn-primary">Create</button>
          </form>
        ) : null}

        <section className="home-section">
          <div className="home-section-head">
            <h2>Your designs</h2>
            <div className="row">
              {designs?.some((d) => d.starred) ? (
                <div className="chips">
                  <button className={`chip ${!starredOnly ? 'is-on' : ''}`} onClick={() => setStarredOnly(false)}>
                    All
                  </button>
                  <button className={`chip ${starredOnly ? 'is-on' : ''}`} onClick={() => setStarredOnly(true)}>
                    Starred
                  </button>
                </div>
              ) : null}
              <span className="muted tabular">{designs ? `${designs.length} on this device` : ''}</span>
            </div>
          </div>
          {designs === null ? null : filtered.length ? (
            <div className="design-grid">
              {filtered.map((d) => (
                <DesignCard key={d.id} d={d} />
              ))}
            </div>
          ) : (
            <div className="home-empty">
              <Eyes size={96} />
              <div>
                <h3>{q ? `Nothing called “${q}”` : 'Nothing here yet'}</h3>
                <p className="muted">{q ? 'Try another word.' : 'Pick a sheet above or start from a template below. Drop a .tavla file anywhere on this page to open it.'}</p>
              </div>
            </div>
          )}
        </section>

        <section className="home-section">
          <div className="home-section-head">
            <h2>Start from a template</h2>
            <div className="chips">
              {cats.map((c) => (
                <button key={c} className={`chip ${tplFilter === c ? 'is-on' : ''}`} onClick={() => setTplFilter(c)}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="tpl-grid">
            {tpls.map((t) => (
              <button key={t.id} className="tpl-card" onClick={() => navigate(`/new?template=${t.id}`)}>
                <span className="tpl-frame">
                  <TemplatePreview template={t} height={220} />
                </span>
                <span className="tpl-meta">
                  <span className="tpl-num tabular">#{String(TEMPLATES.indexOf(t) + 1).padStart(3, '0')}</span>
                  <span>{t.name}</span>
                </span>
              </button>
            ))}
          </div>
        </section>
      </main>
      {drop ? (
        <div className="home-drop">
          <Eyes size={120} mood="wow" />
          <span>Drop a .tavla file to open it</span>
        </div>
      ) : null}
    </div>
  );
}

function DesignCard({ d }: { d: DesignEntry }) {
  const [thumb, setThumb] = useState<string | null>(null);
  const [menu, setMenu] = useState<DOMRect | null>(null);
  const [renaming, setRenaming] = useState(false);
  useEffect(() => {
    let url: string | null = null;
    getThumb(d.id).then((b) => {
      if (b) {
        url = URL.createObjectURL(b);
        setThumb(url);
      }
    });
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [d.id, d.updatedAt]);
  const items: MenuItem[] = [
    { label: 'Open', icon: 'file', onClick: () => navigate(`/d/${d.id}`) },
    { label: 'Rename', icon: 'text', onClick: () => setRenaming(true) },
    {
      label: 'Make a copy',
      icon: 'duplicate',
      onClick: () => duplicateDesign(d.id),
    },
    { label: d.starred ? 'Unstar' : 'Star', icon: 'star', onClick: () => updateEntry(d.id, { starred: !d.starred }) },
    { separator: true },
    {
      label: 'Delete',
      icon: 'trash',
      danger: true,
      onClick: () => {
        if (window.confirm(`Delete “${d.title}” from this device? This cannot be undone.`)) deleteDesign(d.id);
      },
    },
  ];
  const ratio = d.width / d.height;
  return (
    <div className="design-card">
      <button className="design-thumb" onClick={() => navigate(`/d/${d.id}`)}>
        <span className="design-paper" style={{ aspectRatio: `${ratio}`, width: ratio >= 1 ? '86%' : undefined, height: ratio < 1 ? '86%' : undefined }}>
          {thumb ? <img src={thumb} alt="" /> : null}
        </span>
        {d.starred ? (
          <span className="design-star">
            <Icon name="star" size={12} />
          </span>
        ) : null}
      </button>
      <div className="design-meta">
        <div style={{ minWidth: 0, flex: 1 }}>
          {renaming ? (
            <input
              autoFocus
              className="num"
              style={{ width: '100%' }}
              defaultValue={d.title}
              onBlur={async (e) => {
                setRenaming(false);
                const title = e.target.value.trim();
                if (title && title !== d.title) {
                  const { openDesign } = await import('../io/designs');
                  const o = await openDesign(d.id);
                  o?.doc.setMeta({ title });
                  await o?.close();
                }
              }}
              onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
            />
          ) : (
            <div className="design-title">{d.title}</div>
          )}
          <div className="design-sub tabular">
            {d.width} × {d.height} · {d.pages} {d.pages === 1 ? 'page' : 'pages'} · {ago(d.updatedAt)}
          </div>
        </div>
        <button className="icon-btn" onClick={(e) => setMenu((e.currentTarget as HTMLElement).getBoundingClientRect())} title="More">
          <Icon name="more" />
        </button>
      </div>
      {menu ? (
        <Popover anchor={menu} onClose={() => setMenu(null)} className="menu" placement="bottom-end">
          <Menu items={items} onClose={() => setMenu(null)} />
        </Popover>
      ) : null}
    </div>
  );
}
