import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Wordmark } from '../ui/Logo';
import { Credit, GitHubLink, SHOW_SOURCE } from '../ui/Credit';
import { REPO_URL } from '../links';
import { Icon } from '../ui/icons';
import { navigate } from '../App';
import { deleteDesign, duplicateDesign, getThumb, importDesign, listDesigns, onDesignsChange, updateEntry, type DesignEntry } from '../io/designs';
import { pickFiles } from '../io/upload';
import { Menu, Popover, type MenuItem } from '../ui/Popover';
import { TEMPLATES } from '../templates';
import { TemplatePreview } from '../templates/Preview';
import { blended, byScore, loadTemplateIndex, thumbUrl, type TemplateEntry, type TemplateIndex } from '../templates/packs';
import { loadLooks, sampleUrl, type Look } from '../generate/looks';
import { Subscribe } from '../ui/Subscribe';
import { SHOW_USAGE_FROM, useUsage } from '../stats/client';
import './home.css';

// Inside the desktop app the download page has nothing to offer.
const DESKTOP_LINK = !window.tavlaDesktop;

// Home: the hero poster (search, a blank format, or a template from the sentence),
// your designs, the Looks that lead into Generate, and the whole template wall.

// The hero picture: a Generate reference in the editor's selection box, its top corner
// breaking into soft pixels in its own inks. The pin is hotlinked (its credit shows in
// Generate, where it opens); only a small grid of its colours is stored (public/looks/hero-bloom.json).
type Bloom = { look: string; src: string; pin: string; author: string; width: number; height: number; crop: { left: number; top: number; width: number; height: number }; cols: number; rows: number; inks: string[]; grid: string };

const BLANKS = [
  ['a3-poster', 'Poster'],
  ['story', 'Story'],
  ['ig-post', 'Post'],
  ['slides', 'Slides'],
  ['a4', 'A4'],
];

function ago(t: number) {
  const s = (Date.now() - t) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)} d ago`;
  return new Date(t).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
}

async function openFile(f: File) {
  const name = f.name.toLowerCase();
  if (name.endsWith('.pdf')) return navigate(`/d/${await (await import('../io/pdfImport')).importPdf(f)}`);
  if (name.endsWith('.pptx')) return navigate(`/d/${await (await import('../io/pptxImport')).importPptx(f)}`);
  if (name.endsWith('.opentempl') || name.endsWith('.tavla')) {
    const id = await importDesign(f);
    if (id) navigate(`/d/${id}`);
  }
}

export function Home({ jump }: { jump?: 'templates' } = {}) {
  const [designs, setDesigns] = useState<DesignEntry[] | null>(null);
  const [q, setQ] = useState('');
  const [tq, setTq] = useState('');
  const [custom, setCustom] = useState(false);
  const [cw, setCw] = useState(1600);
  const [ch, setCh] = useState(900);
  const [tplFilter, setTplFilter] = useState('All');
  const [starredOnly, setStarredOnly] = useState(false);
  const [drop, setDrop] = useState(false);
  const [index, setIndex] = useState<TemplateIndex | null>(null);
  const [looks, setLooks] = useState<Look[]>([]);
  const usage = useUsage();
  const wallRef = useRef<HTMLElement>(null);
  const [onHero, setOnHero] = useState(true);
  const [menu, setMenu] = useState(false);
  const openPicked = async () => {
    const [f] = await pickFiles('.opentempl,.tavla,.pdf,.pptx');
    if (f) openFile(f);
  };
  const homeRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLElement>(null);
  // #/templates lands on the wall; the address goes back to #/ so a reload starts at the top.
  useEffect(() => {
    if (jump !== 'templates' || !index) return;
    requestAnimationFrame(() => wallRef.current?.scrollIntoView());
    window.history.replaceState(null, '', '#/');
  }, [jump, index]);
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const ro = new ResizeObserver(() => homeRef.current?.style.setProperty('--bar', `${bar.offsetHeight}px`));
    ro.observe(bar);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    document.title = 'OpenTempl';
    const load = () =>
      listDesigns().then((list) => {
        setDesigns(list);
        // The Starred filter goes away with the last star; never leave it on with no way back.
        if (!list.some((d) => d.starred)) setStarredOnly(false);
      });
    load();
    loadTemplateIndex().then(setIndex);
    loadLooks().then(setLooks);
    return onDesignsChange(load) as () => void;
  }, []);

  const filtered = useMemo(() => (designs ?? []).filter((d) => (!q || d.title.toLowerCase().includes(q.toLowerCase())) && (!starredOnly || d.starred)), [designs, q, starredOnly]);
  const vibeOrder = Object.entries(index?.vibes ?? {})
    .filter(([id]) => index?.templates.some((t) => t.vibe === id))
    .sort((a, b) => (a[1].order ?? 99) - (b[1].order ?? 99));
  const cats = ['All', 'presentations', ...vibeOrder.map(([id]) => id), 'classics'];
  const catName = (c: string) => (c === 'All' ? 'Every vibe' : c === 'presentations' ? 'Presentations' : c === 'classics' ? 'Classics' : index?.vibes[c]?.name ?? c);
  const query = tq.trim().toLowerCase();
  const matching = (index?.templates ?? []).filter(
    (t) =>
      (tplFilter === 'All' || t.vibe === tplFilter || (tplFilter === 'presentations' && t.formatId === 'slides')) &&
      (!query || `${t.name} ${t.category} ${t.tags.join(' ')} ${index?.vibes[t.vibe]?.name ?? ''}`.toLowerCase().includes(query)),
  );
  const packTpls = useMemo(
    () => (tplFilter === 'All' ? blended(matching) : tplFilter === 'presentations' ? [...byScore(matching)].sort((a, b) => (b.pages >= 10 ? 1 : 0) - (a.pages >= 10 ? 1 : 0)) : byScore(matching)),
    [index, tplFilter, query],
  );
  const classics = tplFilter === 'classics' || (tplFilter === 'All' && !query) ? TEMPLATES : [];
  const total = index?.templates.length ?? 0;

  return (
    <div
      className="home"
      ref={homeRef}
      onDragOver={(e) => {
        e.preventDefault();
        setDrop(true);
      }}
      onDragLeave={(e) => e.currentTarget === e.target && setDrop(false)}
      onScroll={(e) => setOnHero(e.currentTarget.scrollTop < (document.querySelector('.hero')?.clientHeight ?? 600) - 64)}
      onDrop={(e) => {
        e.preventDefault();
        setDrop(false);
        const f = [...e.dataTransfer.files].find((x) => /\.(pdf|pptx|opentempl|tavla)$/i.test(x.name));
        if (f) openFile(f);
      }}
    >
      <header ref={barRef} className={`home-top ${onHero ? 'is-on-hero' : ''}`}>
        <a className="home-brand" href="#/" aria-label="OpenTempl home">
          <Wordmark size={21} />
        </a>
        <nav className="home-nav">
          <button onClick={() => wallRef.current?.scrollIntoView({ behavior: 'smooth' })}>Templates</button>
          <a href="#/generate">Generate</a>
          {DESKTOP_LINK ? <a href="/download">Desktop app</a> : null}
          <button onClick={() => document.getElementById('your-designs')?.scrollIntoView({ behavior: 'smooth' })}>Your designs</button>
        </nav>
        <div className="grow" />
        <span className="home-gh">
          <GitHubLink />
        </span>
        <button className="btn btn-outline home-open" onClick={openPicked}>
          <Icon name="folder" /> Open a file
        </button>
        <a className="btn btn-primary" href="#/start">
          Start designing
        </a>
        <button className="home-menu-btn" aria-label="Menu" aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
          <Icon name={menu ? 'close' : 'menu'} />
        </button>
        {menu ? (
          <nav className="home-sheet" onClick={() => setMenu(false)}>
            <button onClick={() => wallRef.current?.scrollIntoView({ behavior: 'smooth' })}>Templates</button>
            <a href="#/generate">Generate</a>
            <button onClick={() => document.getElementById('your-designs')?.scrollIntoView({ behavior: 'smooth' })}>Your designs</button>
            <button onClick={openPicked}>Open a file</button>
            {DESKTOP_LINK ? <a href="/download">Desktop app</a> : null}
            {SHOW_SOURCE ? (
              <a href={REPO_URL} target="_blank" rel="noreferrer">
                GitHub
              </a>
            ) : null}
          </nav>
        ) : null}

      </header>

      <section className="hero">
        <div className="hero-in">
          <div className="hero-top">
            <div className="hero-copy">
              <div className="hero-kinds" aria-hidden>
                <Icon name="page" size={22} />
                <Icon name="image" size={22} />
                <Icon name="present" size={22} />
              </div>
              <h1>Design that’s free, open and yours.</h1>
              <p>
                Posters, posts, slides and menus. {total || 'Hundreds of'} templates, an editor that runs on your computer, and nothing behind a paywall.
              </p>
              <div className="hero-actions">
                <a className="hero-btn" href="#/start">
                  Start designing
                </a>
                <button className="hero-btn is-ghost" onClick={() => wallRef.current?.scrollIntoView({ behavior: 'smooth' })}>
                  Browse templates
                </button>
              </div>
              {DESKTOP_LINK ? (
                <a className="hero-desktop" href="/download">
                  <Icon name="download" size={15} /> Desktop app for Mac, Windows and Linux
                </a>
              ) : null}
              <div className="hero-credit">
                <Credit />
              </div>
            </div>
            <PosterBloom looks={looks} />
          </div>
          <div className="hero-base">
            <form
              className="hero-ask"
              onSubmit={(e) => {
                e.preventDefault();
                setTplFilter('All');
                wallRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <label htmlFor="hero-q">What are you making?</label>
              <div className="hero-ask-row">
                <input id="hero-q" value={tq} onChange={(e) => setTq(e.target.value)} placeholder="A gig poster, a menu" autoComplete="off" />
                <button aria-label="Find templates">
                  <Step dir={1} />
                </button>
              </div>
            </form>
            <div className="hero-col">
              <span className="hero-n">01</span>
              <b>Start blank</b>
              <div className="hero-blanks">
                {BLANKS.map(([id, name]) => (
                  <button key={id} onClick={() => navigate(`/new?format=${id}`)}>
                    {name}
                  </button>
                ))}
                <button onClick={() => setCustom((c) => !c)}>Custom</button>
              </div>
              {custom ? (
                <form
                  className="custom-row"
                  onSubmit={(e) => {
                    e.preventDefault();
                    navigate(`/new?w=${cw}&h=${ch}`);
                  }}
                >
                  <input value={cw} onChange={(e) => setCw(Number(e.target.value) || 0)} aria-label="Width in pixels" />
                  <span>×</span>
                  <input value={ch} onChange={(e) => setCh(Number(e.target.value) || 0)} aria-label="Height in pixels" />
                  <button>Create</button>
                </form>
              ) : null}
            </div>
            <div className="hero-col">
              <span className="hero-n">02</span>
              <b>{total || 'Hundreds of'} templates</b>
              <span>In {vibeOrder.length || 'many'} vibes, from Swiss grids to pixel art. Every part can be changed.</span>
              {usage && usage.installs30d >= SHOW_USAGE_FROM ? <span>Used by {usage.installs30d.toLocaleString('en')} people this month.</span> : null}
            </div>
            <div className="hero-col">
              <span className="hero-n">03</span>
              <b>Yours, offline</b>
              <span>No account, no paywall. Open source, and what you make stays on this computer.</span>
            </div>
          </div>
        </div>
      </section>

      <main>
        <section className="home-section" id="your-designs">
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
              {designs?.length ? (
                <div className="field home-search">
                  <Icon name="search" />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your designs" />
                </div>
              ) : null}
            </div>
          </div>
          {designs === null ? null : filtered.length ? (
            <div className="design-grid">
              {filtered.map((d) => (
                <DesignCard key={d.id} d={d} />
              ))}
            </div>
          ) : (
            <p className="home-none">{q ? `Nothing called “${q}”.` : 'No designs yet. Start from a template below, or drop a file anywhere on this page.'}</p>
          )}
        </section>

        {looks.length ? (
          <section className="home-section looks-band">
            <div className="home-section-head">
              <div>
                <h2>Generate</h2>
                <p className="muted">Thirty two styles taken from real print work. Pick one, say what it is for, and it is made in that style with your own words.</p>
              </div>
              <a className="text-link" href="#/generate">
                All styles
              </a>
            </div>
            <div className="looks-strip">
              {looks.map((l) => (
                <a key={l.id} className="look-tile" href={`#/generate?look=${l.id}`}>
                  <img
                    src={l.refs?.[0]?.img ?? sampleUrl(l.id)}
                    alt=""
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const im = e.target as HTMLImageElement;
                      if (!im.src.endsWith(`${l.id}.jpg`)) im.src = sampleUrl(l.id);
                    }}
                  />
                  <span>{l.name}</span>
                </a>
              ))}
            </div>
          </section>
        ) : null}

        <section className="home-section" ref={wallRef}>
          <div className="home-section-head">
            <h2>Templates</h2>
            {query ? (
              <button className="chip is-on" onClick={() => setTq('')}>
                “{tq.trim()}” <Icon name="close" size={12} />
              </button>
            ) : null}
          </div>
          <div className="chips vibe-chips">
            {cats.map((c) => (
              <button key={c} className={`chip ${tplFilter === c ? 'is-on' : ''}`} onClick={() => setTplFilter(c)}>
                {catName(c)}
              </button>
            ))}
          </div>
          {tplFilter !== 'All' && tplFilter !== 'classics' && index?.vibes[tplFilter] ? <p className="muted tpl-blurb">{index.vibes[tplFilter].blurb}</p> : null}
          <Masonry items={tplFilter === 'classics' ? [] : packTpls} vibes={index?.vibes ?? {}} />
          <div className="wall">
            {classics.map((t) => (
              <button key={t.id} className="wall-card is-live" onClick={() => navigate(`/new?template=${t.id}`)}>
                <span className="wall-live">
                  <TemplatePreview template={t} height={300} />
                </span>
                <span className="wall-meta">
                  <b>{t.name}</b>
                  <span>Classics</span>
                </span>
              </button>
            ))}
          </div>
          {query && !packTpls.length ? <div className="home-empty"><p>No template matches “{tq.trim()}”. Try a simpler word, like menu or poster.</p></div> : null}
        </section>

        <footer className="home-foot">
          <div className="home-foot-sub">
            <Subscribe source="footer" />
          </div>
          <Wordmark size={15} />
          <span>Free and open source. Everything you make stays on this computer.</span>
          <span className="grow" />
          {DESKTOP_LINK ? (
            <a className="home-foot-link" href="/download">
              Desktop app
            </a>
          ) : null}
          <GitHubLink label />
          <Credit />
        </footer>
      </main>
      {drop ? (
        <div className="home-drop">
          <span>Drop an .opentempl file, PDF or PowerPoint file to open it</span>
        </div>
      ) : null}
    </div>
  );
}

// Drawn in a 600 x 640 design space. Inside the bloom the picture is covered by
// large cells; outside the frame the cells carry on, taking the colour of their
// mirror point inside the picture, thinning out towards the rim. Seeded, so it is
// a composed picture and the same on every visit.
const BOX = { w: 600, h: 640 };
function PosterBloom({ looks }: { looks: Look[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [b, setB] = useState<Bloom | null>(null);
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}looks/hero-bloom.json`)
      .then((r) => r.json())
      .then(setB)
      .catch(() => {});
  }, []);
  const sheet = b ? { x: 40, y: 150, w: 352, h: Math.round((352 * b.crop.height) / b.crop.width) } : null;

  useEffect(() => {
    const c = ref.current;
    if (!c || !b || !sheet) return;
    const draw = () => {
      const k = c.clientWidth / BOX.w, dpr = window.devicePixelRatio || 1;
      c.width = Math.round(BOX.w * k * dpr);
      c.height = Math.round(BOX.h * k * dpr);
      const ctx = c.getContext('2d')!;
      ctx.setTransform(k * dpr, 0, 0, k * dpr, 0, 0);
      const ink = (x: number, y: number) => {
        const u = Math.min(b.cols - 1, Math.max(0, Math.floor(((x - sheet.x) / sheet.w) * b.cols)));
        const v = Math.min(b.rows - 1, Math.max(0, Math.floor(((y - sheet.y) / sheet.h) * b.rows)));
        return b.inks[Number(b.grid[v * b.cols + u])];
      };
      let seed = 11;
      const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      const corner = { x: sheet.x + sheet.w, y: sheet.y };
      const reach = (x: number, y: number) => {
        const a = Math.atan2(y - corner.y, x - corner.x);
        return 230 + 40 * Math.sin(a * 3 + 0.6) + 24 * Math.sin(a * 7 + 2);
      };
      // Cells line up with the picture's corner so the inside ones sit flush with its edges.
      const cell = sheet.w / b.cols;
      const x0 = corner.x - Math.ceil(corner.x / cell) * cell, y0 = corner.y - Math.ceil(corner.y / cell) * cell;
      for (let y = y0; y < BOX.h; y += cell)
        for (let x = x0; x < BOX.w; x += cell) {
          const cx = x + cell / 2, cy = y + cell / 2;
          const d = Math.hypot(cx - corner.x, cy - corner.y) / reach(cx, cy);
          const roll = rnd();
          if (d > 1) continue;
          const inside = cx > sheet.x && cx < sheet.x + sheet.w && cy > sheet.y && cy < sheet.y + sheet.h;
          if (inside ? d > 0.62 || roll < d * 0.5 : roll < d * d * 1.1) continue;
          ctx.fillStyle = ink(cx > corner.x ? 2 * corner.x - cx : cx, cy < corner.y ? 2 * corner.y - cy : cy);
          ctx.fillRect(x, y, cell + 0.6, cell + 0.6);
        }
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(c);
    return () => ro.disconnect();
  }, [b]);

  const pct = (v: number, of: number) => `${(v / of) * 100}%`;
  const name = looks.find((l) => l.id === b?.look)?.name;
  const at = sheet && { left: pct(sheet.x, BOX.w), top: pct(sheet.y, BOX.h), width: pct(sheet.w, BOX.w), height: pct(sheet.h, BOX.h) };
  return (
    <div className="bloom">
      {b && at ? <span className="bloom-img" style={at}>
          {/* The scan's white margin is cut away: the image is scaled so the crop box fills the frame. */}
          <img
            src={b.src}
            alt=""
            referrerPolicy="no-referrer"
            draggable={false}
            style={{
              width: `${(b.width / b.crop.width) * 100}%`,
              left: `${(-b.crop.left / b.crop.width) * 100}%`,
              top: `${(-b.crop.top / b.crop.height) * 100}%`,
            }}
          />
        </span> : null}
      <canvas ref={ref} aria-hidden />
      {b && at ? (
        <>
          <button className="bloom-pick" style={at} onClick={() => navigate(`/generate?look=${b.look}`)} aria-label={`Open the ${name ?? ''} look in Generate`}>
            <span className="bloom-size">{name ? `Generate: ${name}` : 'Generate'}</span>
            <i className="tl" />
            <i className="tr" />
            <i className="bl" />
            <i className="br" />
          </button>
        </>
      ) : null}
    </div>
  );
}

// The template wall: a masonry that fills row by row (each card goes into the
// shortest column), so the order of the list reads left to right from the top.
function Masonry({ items, vibes }: { items: TemplateEntry[]; vibes: TemplateIndex['vibes'] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(5);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setCols(Math.max(2, Math.min(6, Math.floor((el.clientWidth + 20) / 240)))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const columns = useMemo(() => {
    const out: TemplateEntry[][] = Array.from({ length: cols }, () => []);
    const h = new Array(cols).fill(0);
    for (const t of items) {
      const c = h.indexOf(Math.min(...h));
      out[c].push(t);
      h[c] += t.height / t.width + 0.18; // the caption under each card
    }
    return out;
  }, [items, cols]);
  return (
    <div className="masonry" ref={ref} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {columns.map((col, i) => (
        <div key={i}>
          {col.map((t) => (
            <button key={t.id} className="wall-card" onClick={() => navigate(`/new?template=${t.id}`)}>
              <img src={thumbUrl(t.id)} alt="" loading="lazy" width={240} height={Math.round((240 * t.height) / t.width)} />
              <span className="wall-meta">
                <b>{t.name}</b>
                <span>
                  {vibes[t.vibe]?.name}
                  {t.pages > 1 ? ` · ${t.pages} pages` : ''}
                </span>
              </span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

// A plain left or right arrow on the 16 px grid.
function Step({ dir }: { dir: 1 | -1 }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" shapeRendering="crispEdges" style={{ transform: dir < 0 ? 'scaleX(-1)' : undefined }} aria-hidden>
      <path d="M2 7h9V5h1v1h1v1h1v2h-1v1h-1v1h-1V9H2z" fill="currentColor" />
    </svg>
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
    { label: 'Make a copy', icon: 'duplicate', onClick: () => duplicateDesign(d.id) },
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
