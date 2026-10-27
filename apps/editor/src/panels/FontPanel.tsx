import { useEffect, useMemo, useRef, useState } from 'react';
import { useEditor } from '../editor/Editor';
import { useDoc, useUI } from '../editor/hooks';
import { FONTS, WEIGHT_NAMES, ensureFont, fontInfo, nearestWeight, previewFont, type FontCategory, type FontInfo } from '../fonts/fonts';
import { Search, Section } from './controls';
import { useBrand } from './brand';
import type { TextElement } from '../doc/types';
import { Icon } from '../ui/icons';

const CATS: [FontCategory | 'all', string][] = [
  ['all', 'All'],
  ['sans', 'Sans'],
  ['serif', 'Serif'],
  ['display', 'Display'],
  ['hand', 'Handwritten'],
  ['mono', 'Mono'],
];

function recent(): string[] {
  try {
    return JSON.parse(localStorage.getItem('tavla:recent-fonts') ?? '[]');
  } catch {
    return [];
  }
}
function pushRecent(f: string) {
  localStorage.setItem('tavla:recent-fonts', JSON.stringify([f, ...recent().filter((x) => x !== f)].slice(0, 8)));
}

export default function FontPanel() {
  const editor = useEditor();
  const sel = useUI((s) => s.selection);
  const text = useDoc((s) => s.elements[sel[0]]) as TextElement | undefined;
  const brand = useBrand();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<FontCategory | 'all'>('all');
  const [limit, setLimit] = useState(80);
  const list = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return FONTS.filter((f) => (cat === 'all' || f.category === cat) && (!ql || f.family.toLowerCase().includes(ql)));
  }, [q, cat]);
  useEffect(() => setLimit(80), [q, cat]);

  const choose = (family: string) => {
    pushRecent(family);
    ensureFont(family).then(() => editor.refitAllText());
    editor.updateSelected((el) => (el.type === 'text' ? { fontFamily: family, fontWeight: nearestWeight(family, el.fontWeight) } : el.type === 'chart' || el.type === 'table' ? { fontFamily: family } : null));
  };

  const current = text?.fontFamily;
  const info = current ? fontInfo(current) : undefined;
  const brandFonts = [...new Set([brand.fonts.heading, brand.fonts.subheading, brand.fonts.body])];
  const recents = recent();

  return (
    <>
      <Search value={q} onChange={setQ} placeholder={`Search ${FONTS.length.toLocaleString('en')} fonts`} />
      <div className="chips" style={{ margin: '10px 0 4px' }}>
        {CATS.map(([id, label]) => (
          <button key={id} className={`chip ${cat === id ? 'is-on' : ''}`} onClick={() => setCat(id)}>
            {label}
          </button>
        ))}
      </div>
      {info && info.weights.length > 1 && text ? (
        <Section title={`${current} weights`}>
          <div className="chips">
            {info.weights.map((w) => (
              <button key={w} className={`chip ${text.fontWeight === w ? 'is-on' : ''}`} style={{ fontWeight: w, fontFamily: `"${current}"` }} onClick={() => editor.updateSelected((el) => (el.type === 'text' ? { fontWeight: w } : null))}>
                {WEIGHT_NAMES[w] ?? w}
              </button>
            ))}
          </div>
        </Section>
      ) : null}
      {!q ? (
        <>
          <Section title="Brand fonts">
            {brandFonts.map((f) => (
              <FontRow key={'b' + f} family={f} on={f === current} onPick={choose} />
            ))}
          </Section>
          {recents.length ? (
            <Section title="Recently used">
              {recents.map((f) => (
                <FontRow key={'r' + f} family={f} on={f === current} onPick={choose} />
              ))}
            </Section>
          ) : null}
        </>
      ) : null}
      <Section title={q ? `${list.length} results` : 'All fonts'}>
        {list.slice(0, limit).map((f) => (
          <FontRow key={f.family} family={f.family} info={f} on={f.family === current} onPick={choose} />
        ))}
        {list.length > limit ? (
          <button className="btn btn-outline btn-block" onClick={() => setLimit((l) => l + 120)}>
            Show more
          </button>
        ) : null}
      </Section>
    </>
  );
}

function FontRow({ family, on, onPick, info }: { family: string; on: boolean; onPick: (f: string) => void; info?: FontInfo }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        previewFont(family);
        io.disconnect();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [family]);
  return (
    <button
      ref={ref}
      className="menu-item"
      style={{ height: 40, fontFamily: `"${family}", var(--font)`, fontSize: 17, background: on ? 'var(--cobalt-soft)' : undefined }}
      onClick={() => onPick(family)}
    >
      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{family}</span>
      {info && info.weights.length > 1 ? <span className="kbd" style={{ fontFamily: 'var(--font)' }}>{info.weights.length} weights</span> : null}
      {on ? <Icon name="check" /> : null}
    </button>
  );
}
