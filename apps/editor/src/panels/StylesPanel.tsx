import { useEffect, useMemo, useState } from 'react';
import type { ImageElement } from '../doc/types';
import { useEditor } from '../editor/Editor';
import { useDoc, useUI } from '../editor/hooks';
import { previewFont } from '../fonts/fonts';
import { FONT_PAIRS, PALETTES, designColors, luminance, paletteFromImage, type FontPair } from '../tools/restyle';
import { Icon } from '../ui/icons';
import { Section } from './controls';
import { useBrandState } from './brand';

// Styles: recolour the design with a palette and swap its fonts for a pair,
// on this page or every page. Each click is one undo step.
export default function StylesPanel() {
  const editor = useEditor();
  const [scope, setScope] = useState<'page' | 'all'>('all');
  const [fromPhoto, setFromPhoto] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);
  const kits = useBrandState().kits;
  const pageId = useUI((s) => s.activePageId);
  const snap = useDoc((s) => s);
  const current = useMemo(() => designColors(snap, scope === 'all' ? snap.pageOrder : pageId ? [pageId] : []), [snap, scope, pageId]);

  // The photo to read colours from: the selected one, else the biggest on the page.
  const photo = useMemo(() => {
    const sel = editor.selected().find((e): e is ImageElement => e.type === 'image' && !!e.assetId);
    if (sel) return sel;
    const ids = pageId ? snap.pages[pageId]?.elementIds ?? [] : [];
    return ids
      .map((id) => snap.elements[id])
      .filter((e): e is ImageElement => e?.type === 'image' && !!e.assetId)
      .sort((a, b) => b.w * b.h - a.w * a.h)[0];
  }, [editor, snap, pageId]);

  useEffect(() => FONT_PAIRS.forEach((p) => (previewFont(p.heading), previewFont(p.body))), []);

  const palette = (colors: string[]) => editor.applyPalette(colors, scope);
  const fonts = async (pair: FontPair) => {
    setBusy(true);
    try {
      await editor.applyFonts(pair, scope);
    } finally {
      setBusy(false);
    }
  };
  const shuffle = async () => {
    palette(PALETTES[Math.floor(Math.random() * PALETTES.length)].colors);
    await fonts(FONT_PAIRS[Math.floor(Math.random() * FONT_PAIRS.length)]);
  };

  return (
    <>
      <div className="row-between" style={{ marginBottom: 12 }}>
        <div className="seg">
          <button className={scope === 'page' ? 'is-on' : ''} onClick={() => setScope('page')}>
            This page
          </button>
          <button className={scope === 'all' ? 'is-on' : ''} onClick={() => setScope('all')}>
            All pages
          </button>
        </div>
        <button className="btn btn-sm btn-ink" onClick={shuffle} disabled={busy} title="A random palette and font pair">
          <Icon name="shuffle" size={14} /> Shuffle
        </button>
      </div>
      <p className="hint" style={{ margin: '0 0 6px' }}>
        Colours swap by brightness, darkest for darkest, so text keeps its contrast. ⌘Z takes a step back.
      </p>
      <div className="style-now" title="Colours in use now">
        {current
          .slice()
          .sort((a, b) => luminance(a) - luminance(b))
          .map((c) => (
            <i key={c} style={{ background: c }} />
          ))}
      </div>

      {kits.length ? (
        <Section title="Your brand">
          {kits.map((k) => (
            <div key={k.id} className="brand-style">
              <PaletteRow name={k.name} colors={k.colors.slice(0, 6)} onClick={() => palette(k.colors)} />
              <button
                className="btn btn-sm btn-outline"
                disabled={busy}
                onClick={() => fonts({ name: k.name, heading: k.fonts.heading, headingWeight: 700, body: k.fonts.body })}
                title={`${k.fonts.heading} and ${k.fonts.body}`}
              >
                Use its fonts
              </button>
            </div>
          ))}
        </Section>
      ) : null}

      <Section title="From a photo">
        {photo ? (
          <>
            <button
              className="btn btn-outline btn-block"
              onClick={async () => {
                const url = editor.doc.assetUrl(photo.assetId);
                if (url) setFromPhoto(await paletteFromImage(url));
              }}
            >
              <Icon name="image" /> Take colours from {editor.selected().some((e) => e.id === photo.id) ? 'the selected photo' : 'the biggest photo here'}
            </button>
            {fromPhoto ? <PaletteRow name="From the photo" colors={fromPhoto} onClick={() => palette(fromPhoto)} /> : null}
          </>
        ) : (
          <p className="hint" style={{ margin: 0 }}>
            Put a photo on the page, or select one, and OpenTempl pulls five colours out of it.
          </p>
        )}
      </Section>

      <Section title="Palettes">
        <div className="palette-list">
          {PALETTES.map((p) => (
            <PaletteRow key={p.name} name={p.name} colors={p.colors} onClick={() => palette(p.colors)} />
          ))}
        </div>
      </Section>

      <Section title="Font pairs">
        <div className="pair-grid">
          {FONT_PAIRS.map((p) => (
            <button key={p.name} className="pair" disabled={busy} onClick={() => fonts(p)} title={`${p.heading} with ${p.body}`}>
              <b style={{ fontFamily: `'${p.heading}'`, fontWeight: p.headingWeight }}>{p.name}</b>
              <span style={{ fontFamily: `'${p.body}'` }}>
                {p.heading === p.body ? p.heading : `${p.heading} and ${p.body}`}
              </span>
            </button>
          ))}
        </div>
      </Section>
    </>
  );
}

function PaletteRow({ name, colors, onClick }: { name: string; colors: string[]; onClick: () => void }) {
  return (
    <button className="palette-row" onClick={onClick}>
      <span className="chips5">
        {colors.map((c) => (
          <i key={c} style={{ background: c }} />
        ))}
      </span>
      <span>{name}</span>
    </button>
  );
}
