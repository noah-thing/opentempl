import { useEffect, useState } from 'react';
import { useEditor } from '../editor/Editor';
import { SHAPE_KINDS, shapePath } from '../render/shapes';
import { addLibraryItem, dragProps, type LibraryItem } from './library';
import { Search, Section } from './controls';
import { makeChart, makeImage, makeLine, makeQr, makeTable } from '../doc/factory';
import type { ChartElement, LineElement, ShapeKind } from '../doc/types';
import { Icon } from '../ui/icons';
import { STICKERS } from './stickers';
import { searchIcons, iconSvg } from './iconify';

// Collage layouts as fractions of a square: [x, y, w, h].
const GRIDS: [number, number, number, number][][] = [
  [[0, 0, 0.5, 1], [0.5, 0, 0.5, 1]],
  [[0, 0, 1, 0.5], [0, 0.5, 1, 0.5]],
  [[0, 0, 0.5, 0.5], [0.5, 0, 0.5, 0.5], [0, 0.5, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5]],
  [[0, 0, 0.62, 1], [0.62, 0, 0.38, 0.5], [0.62, 0.5, 0.38, 0.5]],
  [[0, 0, 1, 0.6], [0, 0.6, 0.333, 0.4], [0.333, 0.6, 0.334, 0.4], [0.667, 0.6, 0.333, 0.4]],
  [[0, 0, 0.333, 1], [0.333, 0, 0.334, 1], [0.667, 0, 0.333, 1]],
];

function gridElements(g: [number, number, number, number][]) {
  const S = 900;
  const gap = 12;
  const gid = Math.random().toString(36).slice(2, 10);
  return g.map(([x, y, w, h]) => makeImage({ x: x * S + gap / 2, y: y * S + gap / 2, w: w * S - gap, h: h * S - gap, groupId: gid, radius: 6 }));
}

const SHAPE_COLORS = ['#2B3BFF', '#FF4B39', '#FFE600', '#3EDD8A', '#FF3C8E', '#0B0B0D', '#9AA2EA', '#0AA0FF'];

export default function ElementsPanel() {
  const editor = useEditor();
  const [q, setQ] = useState('');
  const [all, setAll] = useState<string | null>(null);

  if (q.trim()) return <IconSearch q={q} setQ={setQ} />;
  if (all === 'shapes') return <AllShapes back={() => setAll(null)} />;

  const lines: { label: string; patch: Partial<LineElement> }[] = [
    { label: 'Line', patch: {} },
    { label: 'Arrow', patch: { end: 'arrow' } },
    { label: 'Pointer', patch: { end: 'triangle' } },
    { label: 'Dashed', patch: { dash: 'dash' } },
    { label: 'Dotted', patch: { dash: 'dot', width: 6 } },
    { label: 'Both ends', patch: { start: 'circle', end: 'circle' } },
    { label: 'Bend', patch: { curve: 40, end: 'arrow', h: 120 } },
    { label: 'Thick', patch: { width: 16 } },
  ];
  const frames: ShapeKind[] = ['rect', 'ellipse', 'arch', 'squircle', 'blob', 'heart', 'star', 'hexagon', 'flower', 'triangle', 'diamond', 'cloud'];
  const charts: ChartElement['kind'][] = ['column', 'bar', 'line', 'area', 'pie', 'donut', 'progress'];

  return (
    <>
      <Search value={q} onChange={setQ} placeholder="Search 200,000 icons and graphics" />
      <Section title="Shapes" action={<button onClick={() => setAll('shapes')}>See all</button>}>
        <div className="grid-4">
          {SHAPE_KINDS.slice(0, 8).map((s, i) => {
            const item: LibraryItem = { kind: 'shape', shape: s.kind, color: SHAPE_COLORS[i % SHAPE_COLORS.length] };
            return (
              <button key={s.kind} className="shape-tile" title={s.label} onClick={() => addLibraryItem(editor, item)} {...dragProps(item)}>
                <svg viewBox="0 0 40 40">
                  <path d={shapePath(s.kind, 40, 40, 4)} fill={item.color} />
                </svg>
              </button>
            );
          })}
        </div>
      </Section>
      <Section title="Lines and arrows">
        <div className="grid-4">
          {lines.map((l) => {
            const el = makeLine({ w: 400, ...l.patch });
            const item: LibraryItem = { kind: 'elements', elements: [el] };
            return (
              <button key={l.label} className="shape-tile" title={l.label} onClick={() => addLibraryItem(editor, item)} {...dragProps(item)}>
                <svg viewBox="0 0 40 40">
                  <path
                    d={l.patch.curve ? 'M6 30 Q20 4 34 30' : 'M6 20 H34'}
                    fill="none"
                    stroke="#0B0B0D"
                    strokeWidth={l.patch.width ? 5 : 2.4}
                    strokeDasharray={l.patch.dash === 'dash' ? '6 4' : l.patch.dash === 'dot' ? '0.1 5' : undefined}
                    strokeLinecap="round"
                  />
                  {l.patch.end === 'arrow' ? <path d={l.patch.curve ? 'M28 23 L34 30 L26 31' : 'M28 14 L34 20 L28 26'} fill="none" stroke="#0B0B0D" strokeWidth="2.4" strokeLinejoin="round" /> : null}
                  {l.patch.end === 'triangle' ? <path d="M28 14 L36 20 L28 26 Z" fill="#0B0B0D" /> : null}
                  {l.patch.start === 'circle' ? (
                    <>
                      <circle cx="6" cy="20" r="3.4" fill="#0B0B0D" />
                      <circle cx="34" cy="20" r="3.4" fill="#0B0B0D" />
                    </>
                  ) : null}
                </svg>
              </button>
            );
          })}
        </div>
      </Section>
      <Section title="Collage grids">
        <div className="grid-3">
          {GRIDS.map((g, i) => {
            const item = (): LibraryItem => ({ kind: 'elements', elements: gridElements(g) });
            return (
              <button key={i} className="shape-tile" title="Collage grid" onClick={() => addLibraryItem(editor, item())} {...dragProps(item)}>
                <svg viewBox="0 0 40 40">
                  {g.map(([x, y, w, h], j) => (
                    <rect key={j} x={4 + x * 32 + 1} y={4 + y * 32 + 1} width={w * 32 - 2} height={h * 32 - 2} rx="1.5" fill="#C9C9D3" />
                  ))}
                </svg>
              </button>
            );
          })}
        </div>
      </Section>
      <Section title="Photo frames">
        <p className="hint" style={{ margin: '-2px 0 8px' }}>
          Drop a photo onto a frame and it fills the shape.
        </p>
        <div className="grid-4">
          {frames.map((k) => {
            const item: LibraryItem = { kind: 'elements', elements: [makeImage({ w: 400, h: k === 'arch' ? 520 : 400, mask: k === 'rect' ? null : k, radius: k === 'rect' ? 24 : 0 })] };
            return (
              <button key={k} className="shape-tile" title="Frame" onClick={() => addLibraryItem(editor, item)} {...dragProps(item)}>
                <svg viewBox="0 0 40 40">
                  <path d={shapePath(k, 40, k === 'arch' ? 40 : 40, k === 'rect' ? 6 : 4)} fill="#D6D6DE" />
                  <path d="M10 28 l7 -8 l5 5 l4 -4 l6 7 z" fill="#A6A6B2" />
                </svg>
              </button>
            );
          })}
        </div>
      </Section>
      {(['Characters', 'Voxel', 'Glass'] as const).map((g) => (
      <Section key={g} title={g === 'Voxel' ? 'Voxel objects' : g === 'Glass' ? 'Glass shapes' : 'Characters'}>
        <div className="grid-3">
          {STICKERS.filter((s) => s.group === g).map((s) => {
            const item: LibraryItem = { kind: 'photo', url: s.url, name: s.name, w: s.w, h: s.h, credit: 'Tavla library' };
            return (
              <button key={s.url} className="shape-tile" title={s.name} onClick={() => addLibraryItem(editor, item)} {...dragProps(item)}>
                <img src={s.url} alt={s.name} style={{ width: '78%', height: '78%', objectFit: 'contain' }} loading="lazy" />
              </button>
            );
          })}
        </div>
      </Section>
      ))}
      <Section title="Graphics" action={<button onClick={() => setQ('sparkle')}>Search</button>}>
        <IconRow query="doodle" />
        <IconRow query="emoji face" collection="fluent-emoji-flat" />
        <IconRow query="arrow" collection="ph" />
      </Section>
      <Section title="Charts">
        <div className="grid-4">
          {charts.map((k) => {
            const item: LibraryItem = { kind: 'elements', elements: [makeChart(k)] };
            return (
              <button key={k} className="shape-tile" title={k} onClick={() => addLibraryItem(editor, item)} {...dragProps(item)}>
                <ChartGlyph kind={k} />
              </button>
            );
          })}
        </div>
      </Section>
      <Section title="Tables and codes">
        <div className="grid-2">
          <button className="btn btn-outline" onClick={() => addLibraryItem(editor, { kind: 'elements', elements: [makeTable()] })}>
            <Icon name="table" /> Table
          </button>
          <button className="btn btn-outline" onClick={() => addLibraryItem(editor, { kind: 'elements', elements: [makeQr('https://tavla.app')] })}>
            <Icon name="qr" /> QR code
          </button>
        </div>
      </Section>
    </>
  );
}

function ChartGlyph({ kind }: { kind: ChartElement['kind'] }) {
  const c = '#2B3BFF';
  const r = '#FF4B39';
  return (
    <svg viewBox="0 0 40 40">
      {kind === 'column' ? (
        <>
          <rect x="7" y="20" width="6" height="14" rx="1.5" fill={c} />
          <rect x="17" y="10" width="6" height="24" rx="1.5" fill={r} />
          <rect x="27" y="15" width="6" height="19" rx="1.5" fill={c} />
        </>
      ) : kind === 'bar' ? (
        <>
          <rect x="6" y="7" width="16" height="6" rx="1.5" fill={c} />
          <rect x="6" y="17" width="26" height="6" rx="1.5" fill={r} />
          <rect x="6" y="27" width="20" height="6" rx="1.5" fill={c} />
        </>
      ) : kind === 'line' || kind === 'area' ? (
        <>
          {kind === 'area' ? <path d="M5 30 L14 20 L22 24 L35 9 L35 34 L5 34 Z" fill={c} opacity=".25" /> : null}
          <path d="M5 30 L14 20 L22 24 L35 9" fill="none" stroke={c} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
        </>
      ) : kind === 'progress' ? (
        <>
          <circle cx="20" cy="20" r="12" fill="none" stroke="#D9D9DF" strokeWidth="5" />
          <circle cx="20" cy="20" r="12" fill="none" stroke={c} strokeWidth="5" strokeDasharray="54 100" transform="rotate(-90 20 20)" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="20" cy="20" r="14" fill={c} />
          <path d="M20 20 L20 6 A14 14 0 0 1 33 25 Z" fill={r} />
          <path d="M20 20 L33 25 A14 14 0 0 1 22 34 Z" fill="#FFE600" />
          {kind === 'donut' ? <circle cx="20" cy="20" r="7" fill="#EDEDF0" /> : null}
        </>
      )}
    </svg>
  );
}

function AllShapes({ back }: { back: () => void }) {
  const editor = useEditor();
  return (
    <>
      <button className="btn btn-sm" onClick={back} style={{ marginBottom: 10 }}>
        <Icon name="chevron-left" /> Elements
      </button>
      <div className="grid-4">
        {SHAPE_KINDS.map((s, i) => {
          const item: LibraryItem = { kind: 'shape', shape: s.kind, color: SHAPE_COLORS[i % SHAPE_COLORS.length] };
          return (
            <button key={s.kind} className="shape-tile" title={s.label} onClick={() => addLibraryItem(editor, item)} {...dragProps(item)}>
              <svg viewBox="0 0 40 40">
                <path d={shapePath(s.kind, 40, 40, 4)} fill={item.color} />
              </svg>
            </button>
          );
        })}
      </div>
    </>
  );
}

function IconRow({ query, collection }: { query: string; collection?: string }) {
  const editor = useEditor();
  const [icons, setIcons] = useState<string[]>([]);
  useEffect(() => {
    searchIcons(query, 8, collection).then(setIcons).catch(() => setIcons([]));
  }, [query, collection]);
  if (!icons.length) return null;
  return (
    <div className="grid-4" style={{ marginBottom: 8 }}>
      {icons.map((id) => (
        <IconTile key={id} id={id} onAdd={(item) => addLibraryItem(editor, item)} />
      ))}
    </div>
  );
}

function IconTile({ id, onAdd }: { id: string; onAdd: (item: LibraryItem) => void }) {
  const [svg, setSvg] = useState<string | null>(null);
  useEffect(() => {
    iconSvg(id).then(setSvg).catch(() => setSvg(null));
  }, [id]);
  const item = (): LibraryItem => ({ kind: 'svg', svg: svg ?? '', name: id, source: `iconify:${id}`, w: 200, h: 200 });
  return (
    <button className="shape-tile" title={id} disabled={!svg} onClick={() => svg && onAdd(item())} {...dragProps(item)}>
      {svg ? <span style={{ width: '58%', height: '58%', display: 'block' }} dangerouslySetInnerHTML={{ __html: svg.replace('<svg', '<svg width="100%" height="100%"') }} /> : null}
    </button>
  );
}

function IconSearch({ q, setQ }: { q: string; setQ: (v: string) => void }) {
  const editor = useEditor();
  const [icons, setIcons] = useState<string[] | null>(null);
  const [set, setSet] = useState<string>('');
  useEffect(() => {
    setIcons(null);
    const t = setTimeout(() => searchIcons(q, 96, set || undefined).then(setIcons).catch(() => setIcons([])), 220);
    return () => clearTimeout(t);
  }, [q, set]);
  const sets: [string, string][] = [
    ['', 'Everything'],
    ['ph', 'Phosphor'],
    ['tabler', 'Tabler'],
    ['fluent-emoji-flat', 'Emoji'],
    ['streamline-plump-color', 'Colour'],
    ['pixelarticons', 'Pixel'],
  ];
  return (
    <>
      <Search value={q} onChange={setQ} placeholder="Search icons and graphics" />
      <div className="chips" style={{ margin: '10px 0 12px' }}>
        {sets.map(([id, label]) => (
          <button key={id} className={`chip ${set === id ? 'is-on' : ''}`} onClick={() => setSet(id)}>
            {label}
          </button>
        ))}
      </div>
      {icons === null ? (
        <div className="hint">Searching</div>
      ) : icons.length ? (
        <div className="grid-4">
          {icons.map((id) => (
            <IconTile key={id} id={id} onAdd={(item) => addLibraryItem(editor, item)} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <h4>Nothing called “{q}”</h4>
          <span className="hint">Try a simpler word, in English.</span>
        </div>
      )}
      <p className="hint" style={{ marginTop: 16 }}>
        Icons come from Iconify’s open source sets. Each keeps its own licence, mostly MIT, Apache and CC BY.
      </p>
    </>
  );
}
