import { useEffect, useMemo, useState } from 'react';
import { navigate } from '../App';
import { FORMATS, type Format } from '../doc/formats';
import { Icon } from '../ui/icons';
import { Wordmark } from '../ui/Logo';
import { Credit, GitHubLink } from '../ui/Credit';
import { byScore, loadTemplateIndex, thumbUrl, type TemplateIndex } from '../templates/packs';
import '../home/home.css';
import { Subscribe } from '../ui/Subscribe';
import './start.css';

// Start a design: every size, a custom size, templates for the chosen kind of thing,
// and what the editor can do. The Canva "Create a design" step, as a calm page.

const GROUPS = ['Social', 'Print', 'Slides', 'Video', 'Web', 'Personal'];

// What the editor does, in the order people reach for it. `panel` opens that rail
// panel in a fresh design; tools without one start a blank design.
const TOOLS: { icon: string; name: string; text: string; panel?: string }[] = [
  { icon: 'templates', name: 'Templates', text: '325 templates in 34 styles. Every part can be changed.', panel: 'templates' },
  { icon: 'text', name: 'Text', text: 'Headings, text styles and the whole Google Fonts library.', panel: 'text' },
  { icon: 'photos', name: 'Photos', text: 'A free photo library, and your own pictures.', panel: 'photos' },
  { icon: 'elements', name: 'Elements', text: 'Shapes, lines, icons, stickers and frames.', panel: 'elements' },
  { icon: 'draw', name: 'Draw', text: 'Pen, marker and highlighter, right on the page.', panel: 'draw' },
  { icon: 'chart', name: 'Charts and tables', text: 'Bar, line and pie charts and tables that stay editable.', panel: 'apps' },
  { icon: 'wand', name: 'Remove background', text: 'Cut people and objects out of photos.', panel: 'apps' },
  { icon: 'qr', name: 'QR codes', text: 'A code for any link, in your colours.', panel: 'apps' },
  { icon: 'brand', name: 'Brand kit', text: 'Your colours, fonts and logos in one place.', panel: 'brand' },
  { icon: 'video', name: 'Video and music', text: 'Clips, sound and a timeline for designs that move.', panel: 'audio' },
  { icon: 'bulk', name: 'Bulk create', text: 'One page per spreadsheet row: name tags, certificates.', panel: 'apps' },
  { icon: 'upload', name: 'Open PDF and PowerPoint', text: 'Bring in a file and keep editing it.', panel: 'uploads' },
  { icon: 'present', name: 'Present', text: 'Slides full screen, with speaker notes on a second screen.' },
  { icon: 'users', name: 'Work together', text: 'Edit live with others through a share link.' },
  { icon: 'download', name: 'Export', text: 'PNG, JPG, PDF, SVG, PowerPoint and GIF.' },
];

function size(f: Format) {
  return f.note && /mm|in/.test(f.note) ? f.note : `${f.width} × ${f.height} px`;
}

// The format drawn to its own proportions inside a fixed box, so sizes compare at a glance.
function Shape({ f }: { f: Format }) {
  const k = 64 / Math.max(f.width, f.height);
  return <i className="start-shape" style={{ width: Math.max(10, f.width * k), height: Math.max(10, f.height * k) }} />;
}

export function Start() {
  const [group, setGroup] = useState('Social');
  const [index, setIndex] = useState<TemplateIndex | null>(null);
  const [w, setW] = useState(1600);
  const [h, setH] = useState(900);

  useEffect(() => {
    document.title = 'Start a design · OpenTempl';
    loadTemplateIndex().then(setIndex);
  }, []);

  const formats = FORMATS.filter((f) => f.group === group);
  const ids = new Set(formats.map((f) => f.id));
  const templates = useMemo(() => byScore((index?.templates ?? []).filter((t) => t.formatId && ids.has(t.formatId))).slice(0, 12), [index, group]);

  const openTool = (panel?: string) => {
    try {
      if (panel) sessionStorage.setItem('opentempl:open-panel', panel);
    } catch {
      // Private windows may refuse storage; the design still opens.
    }
    navigate('/new?format=ig-post');
  };

  return (
    <div className="home start">
      <header className="home-top">
        <a className="home-brand" href="#/" aria-label="OpenTempl home">
          <Wordmark size={21} />
        </a>
        <nav className="home-nav">
          <a href="#/templates">Templates</a>
          <a href="#/generate">Generate</a>
        </nav>
      </header>

      <main>
        <section className="start-head">
          <h1>Start a design</h1>
          <p>Pick a size and you get a blank page. Every size can be changed later, and any template can start you off.</p>
        </section>

        <section className="start-block">
          <div className="start-tabs" role="tablist">
            {GROUPS.map((g) => (
              <button key={g} role="tab" aria-selected={group === g} className={`chip ${group === g ? 'is-on' : ''}`} onClick={() => setGroup(g)}>
                {g}
              </button>
            ))}
          </div>
          <div className="start-sizes">
            {formats.map((f) => (
              <button key={f.id} className="start-size" onClick={() => navigate(`/new?format=${f.id}`)}>
                <span className="start-frame">
                  <Shape f={f} />
                </span>
                <b>{f.name}</b>
                <span>{size(f)}</span>
              </button>
            ))}
            <form
              className="start-size start-custom"
              onSubmit={(e) => {
                e.preventDefault();
                if (w > 0 && h > 0) navigate(`/new?w=${w}&h=${h}`);
              }}
            >
              <b>Custom size</b>
              <div className="start-wh">
                <input value={w} inputMode="numeric" onChange={(e) => setW(Number(e.target.value.replace(/\D/g, '')) || 0)} aria-label="Width in pixels" />
                <span>×</span>
                <input value={h} inputMode="numeric" onChange={(e) => setH(Number(e.target.value.replace(/\D/g, '')) || 0)} aria-label="Height in pixels" />
                <span>px</span>
              </div>
              <button className="btn btn-primary">Create</button>
            </form>
          </div>
        </section>

        {templates.length ? (
          <section className="start-block">
            <div className="home-section-head">
              <h2>{group} templates</h2>
              <a className="text-link" href="#/templates">
                All templates
              </a>
            </div>
            <div className="start-templates">
              {templates.map((t) => (
                <button key={t.id} className="start-tpl" onClick={() => navigate(`/new?template=${t.id}`)} title={t.name}>
                  <img src={thumbUrl(t.id)} alt="" loading="lazy" style={{ aspectRatio: `${t.width} / ${t.height}` }} />
                  <span>{t.name}</span>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <section className="start-block">
          <div className="home-section-head">
            <h2>Everything in the editor</h2>
          </div>
          <div className="start-tools">
            {TOOLS.map((t) => (
              <button key={t.name} className="start-tool" onClick={() => openTool(t.panel)}>
                <Icon name={t.icon} size={20} />
                <span>
                  <b>{t.name}</b>
                  {t.text}
                </span>
              </button>
            ))}
          </div>
        </section>

        <footer className="home-foot">
          <div className="home-foot-sub">
            <Subscribe source="footer" />
          </div>
          <Wordmark size={15} />
          <span>Free and open source. Everything you make stays on this computer.</span>
          <span className="grow" />
          <GitHubLink label />
          <Credit />
        </footer>
      </main>
    </div>
  );
}
