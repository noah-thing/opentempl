import { useEffect, useMemo, useState } from 'react';
import { useEditor, type Editor } from '../editor/Editor';
import { useDoc, useUI } from '../editor/hooks';
import type { Element, Fill, GradientStop, Page } from '../doc/types';
import { fillCss, PATTERNS, patternDef } from '../render/paint';
import { Slider } from './controls';
import { Section } from './controls';
import { useBrand } from './brand';
import { Icon } from '../ui/icons';
import { extractPalette } from './palette';
import { hasRichSelection, richCommand, richSelectionColor } from '../canvas/TextEditor';

// One colour panel for everything. `colorTarget` says what it edits: text,
// fill, stroke, line, bg, qr, qrbg, draw, svg:<colour>, chart:<series>.

const DEFAULT = [
  '#0B0B0D', '#4A4A55', '#8A8A96', '#C9C9D3', '#EDEDF0', '#FFFFFF', 'transparent',
  '#2B3BFF', '#0AA0FF', '#9AA2EA', '#7B5CFF', '#FF3C8E', '#FF4B39', '#FF9F1A',
  '#FFE600', '#3EDD8A', '#0E8A5F', '#123B2C', '#5B3A1A', '#F3E2C7', '#FFD8E4',
];

const GRADIENTS: GradientStop[][] = [
  [{ offset: 0, color: '#2B3BFF' }, { offset: 1, color: '#FF3C8E' }],
  [{ offset: 0, color: '#FF4B39' }, { offset: 1, color: '#FFE600' }],
  [{ offset: 0, color: '#3EDD8A' }, { offset: 1, color: '#0AA0FF' }],
  [{ offset: 0, color: '#0B0B0D' }, { offset: 1, color: '#2B3BFF' }],
  [{ offset: 0, color: '#9AA2EA' }, { offset: 1, color: '#FFD8E4' }],
  [{ offset: 0, color: '#FFE600' }, { offset: 0.5, color: '#FF3C8E' }, { offset: 1, color: '#2B3BFF' }],
  [{ offset: 0, color: '#FFFFFF' }, { offset: 1, color: '#C9C9D3' }],
];

function currentFill(editor: Editor, target: string | null, els: Element[], page: Page | null): Fill | string | null {
  const el = els[0];
  if (target === 'bg') return page?.background ?? null;
  if (!el) return null;
  if (target === 'text' && el.type === 'text') return richSelectionColor() ?? el.gradient ?? el.color;
  if (target === 'fill' && el.type === 'shape') return el.fill;
  if (target === 'stroke') return el.type === 'shape' ? el.stroke?.color ?? '#0B0B0D' : el.type === 'image' ? el.border?.color ?? '#0B0B0D' : null;
  if (target === 'line' && el.type === 'line') return el.color;
  if (target === 'qr' && el.type === 'qr') return el.color;
  if (target === 'qrbg' && el.type === 'qr') return el.background;
  if (target === 'draw' && el.type === 'draw') return el.paths[0]?.color ?? null;
  if (target?.startsWith('svg:') && el.type === 'svg') {
    const k = target.slice(4);
    return el.colors[k] ?? (k === 'currentColor' ? '#0B0B0D' : k);
  }
  if (target?.startsWith('chart:') && el.type === 'chart') return el.series[Number(target.slice(6))]?.color ?? null;
  if (target === 'effect' && 'effect' in el) return (el as { effect: { color: string } }).effect.color;
  if (target === 'shadow') return el.shadow?.color ?? '#000000';
  return null;
}

function apply(editor: Editor, target: string | null, value: Fill | string) {
  const solid = typeof value === 'string' ? value : value.type === 'solid' ? value.color : null;
  const fill: Fill = typeof value === 'string' ? { type: 'solid', color: value } : value;
  if (target === 'bg') {
    const id = editor.state.activePageId;
    if (id) editor.doc.updatePage(id, { background: fill });
    return;
  }
  // Colouring selected words while editing makes a run instead of recolouring the box.
  if (target === 'text' && solid && hasRichSelection()) {
    richCommand('foreColor', solid);
    return;
  }
  editor.updateSelected((el) => {
    if (target === 'text' && el.type === 'text') {
      const runs = el.runs?.map(({ color: _c, ...r }) => r).filter((r) => Object.keys(r).length > 2);
      const clean = runs?.length ? runs : undefined;
      return fill.type === 'solid' ? { color: fill.color, gradient: null, runs: clean } : { gradient: fill, color: fill.type === 'linear' || fill.type === 'radial' ? fill.stops[0].color : el.color, runs: clean };
    }
    if (target === 'fill' && el.type === 'shape') return { fill };
    if (target === 'stroke' && el.type === 'shape' && solid) return { stroke: { ...(el.stroke ?? { width: 4, dash: 'solid' }), color: solid } };
    if (target === 'stroke' && el.type === 'image' && solid) return { border: { ...(el.border ?? { width: 4, dash: 'solid' }), color: solid } };
    if (target === 'line' && el.type === 'line' && solid) return { color: solid };
    if (target === 'qr' && el.type === 'qr' && solid) return { color: solid };
    if (target === 'qrbg' && el.type === 'qr' && solid) return { background: solid };
    if (target === 'draw' && el.type === 'draw' && solid) return { paths: el.paths.map((p) => ({ ...p, color: solid })) };
    if (target?.startsWith('svg:') && el.type === 'svg' && solid) return { colors: { ...el.colors, [target.slice(4)]: solid } };
    if (target?.startsWith('chart:') && el.type === 'chart' && solid) {
      const i = Number(target.slice(6));
      return { series: el.series.map((s, j) => (j === i ? { ...s, color: solid } : s)) };
    }
    if (target === 'effect' && el.type === 'text' && solid) return { effect: { ...el.effect, color: solid } };
    if (target === 'shadow' && solid) return { shadow: { ...(el.shadow ?? { x: 0, y: 12, blur: 30 }), color: solid } };
    // Sensible default: whatever "colour" means for this element.
    if (!target || target === 'auto') {
      if (el.type === 'text') return { color: solid ?? el.color };
      if (el.type === 'shape') return { fill };
      if (el.type === 'line' && solid) return { color: solid };
    }
    return null;
  });
}

export function documentColors(elements: Record<string, Element>, pages: Record<string, Page>) {
  const set = new Map<string, number>();
  const add = (c?: string | null) => c && c !== 'transparent' && set.set(c.toUpperCase(), (set.get(c.toUpperCase()) ?? 0) + 1);
  for (const p of Object.values(pages)) if (p.background.type === 'solid') add(p.background.color);
  for (const e of Object.values(elements)) {
    if (e.type === 'text') add(e.color);
    if (e.type === 'shape' && e.fill.type === 'solid') add(e.fill.color);
    if (e.type === 'shape') add(e.stroke?.color);
    if (e.type === 'line') add(e.color);
    if (e.type === 'svg') Object.values(e.colors).forEach(add);
  }
  return [...set.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c).slice(0, 14);
}

export default function ColorPanel() {
  const editor = useEditor();
  const target = useUI((s) => s.colorTarget);
  const sel = useUI((s) => s.selection);
  const pageId = useUI((s) => s.activePageId);
  const els = useDoc((s) => sel.map((id) => s.elements[id]).filter(Boolean));
  const page = useDoc((s) => (pageId ? s.pages[pageId] : null));
  const elements = useDoc((s) => s.elements);
  const pages = useDoc((s) => s.pages);
  const brand = useBrand();
  const current = currentFill(editor, target, els, page);
  const currentSolid = typeof current === 'string' ? current : current?.type === 'solid' ? current.color : null;
  const [hex, setHex] = useState(currentSolid ?? '#000000');
  useEffect(() => setHex(currentSolid ?? hex), [currentSolid]); // eslint-disable-line react-hooks/exhaustive-deps
  const docColors = useMemo(() => documentColors(elements, pages), [elements, pages]);
  const [photoColors, setPhotoColors] = useState<string[]>([]);
  useEffect(() => {
    const ids = Object.values(elements).flatMap((e) => (e.type === 'image' && e.assetId ? [e.assetId] : []));
    extractPalette(ids.slice(0, 4).map((id) => editor.doc.assetUrl(id)!).filter(Boolean)).then(setPhotoColors);
  }, [editor, elements]);
  const allowGradient = target === 'fill' || target === 'bg' || target === 'text';

  const set = (v: Fill | string) => apply(editor, target, v);
  const swatch = (c: string, key: string) => (
    <button
      key={key}
      className={`swatch ${currentSolid?.toUpperCase() === c.toUpperCase() ? 'is-on' : ''}`}
      title={c}
      style={{ background: c === 'transparent' ? 'repeating-conic-gradient(#ddd 0 25%, #fff 0 50%) 0 0/8px 8px' : c }}
      onClick={() => set(c)}
    />
  );
  const gradient = current && typeof current !== 'string' && (current.type === 'linear' || current.type === 'radial') ? current : null;

  return (
    <>
      <div className="row" style={{ marginBottom: 8 }}>
        <label className="swatch" style={{ width: 34, flex: 'none', background: currentSolid ?? '#fff', cursor: 'pointer', overflow: 'hidden' }} title="Pick any colour">
          <input type="color" value={/^#[0-9a-f]{6}$/i.test(hex) ? hex : '#000000'} onChange={(e) => (setHex(e.target.value), set(e.target.value.toUpperCase()))} style={{ opacity: 0, width: '100%', height: '100%' }} />
        </label>
        <div className="field" style={{ flex: 1 }}>
          <span className="muted">#</span>
          <input
            value={hex.replace('#', '')}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9a-f]/gi, '').slice(0, 6);
              setHex('#' + v);
              if (v.length === 6 || v.length === 3) set('#' + v.toUpperCase());
            }}
            onKeyDown={(e) => e.stopPropagation()}
            aria-label="Hex colour"
          />
        </div>
        {'EyeDropper' in window ? (
          <button
            className="icon-btn"
            title="Pick a colour from the screen"
            onClick={async () => {
              try {
                const r = await new (window as unknown as { EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper().open();
                set(r.sRGBHex.toUpperCase());
              } catch {
                /* cancelled */
              }
            }}
          >
            <Icon name="color" />
          </button>
        ) : null}
      </div>
      {docColors.length ? (
        <Section title="In this design">
          <div className="swatches">{docColors.map((c) => swatch(c, 'd' + c))}</div>
        </Section>
      ) : null}
      <Section title={brand.name} action={<button onClick={() => editor.openPanel('brand')}>Edit</button>}>
        <div className="swatches">{brand.colors.map((c) => swatch(c, 'b' + c))}</div>
      </Section>
      {photoColors.length ? (
        <Section title="From your photos">
          <div className="swatches">{photoColors.map((c) => swatch(c, 'p' + c))}</div>
        </Section>
      ) : null}
      <Section title="Colours">
        <div className="swatches">{DEFAULT.map((c) => swatch(c, 'x' + c))}</div>
      </Section>
      {allowGradient ? (
        <Section title="Gradients">
          <div className="swatches">
            {GRADIENTS.map((stops, i) => (
              <button key={i} className="swatch" style={{ background: fillCss({ type: 'linear', angle: 135, stops }) }} onClick={() => set({ type: 'linear', angle: gradient?.type === 'linear' ? gradient.angle : 135, stops })} />
            ))}
          </div>
          {gradient ? <GradientEditor fill={gradient} onChange={set} /> : null}
        </Section>
      ) : null}
      {target === 'fill' || target === 'bg' ? (
        <Section title="Patterns">
          <div className="swatches">
            {PATTERNS.map((p) => {
              const pat = current && typeof current !== 'string' && current.type === 'pattern' ? current : null;
              const f = { type: 'pattern' as const, kind: p.kind, color: pat?.color ?? '#0B0B0D', background: pat?.background ?? '#FFFFFF', scale: pat?.scale ?? 40 };
              return (
                <button key={p.kind} className={`swatch ${pat?.kind === p.kind ? 'is-on' : ''}`} title={p.label} onClick={() => set(f)} style={{ overflow: 'hidden', padding: 0 }}>
                  <svg viewBox="0 0 40 40" width="100%" height="100%" style={{ borderRadius: '50%' }}>
                    <defs>{patternDef(`pp-${p.kind}`, { ...f, scale: 10 })}</defs>
                    <rect width="40" height="40" fill={`url(#pp-${p.kind})`} />
                  </svg>
                </button>
              );
            })}
          </div>
          {current && typeof current !== 'string' && current.type === 'pattern' ? (
            <div className="stack" style={{ marginTop: 12, padding: 12, borderRadius: 12, background: 'var(--paper)' }}>
              <div className="row-between">
                <span className="label">Ink and paper</span>
                <div className="row" style={{ gap: 6 }}>
                  <input type="color" value={current.color.slice(0, 7)} onChange={(e) => set({ ...current, color: e.target.value.toUpperCase() })} />
                  <input type="color" value={current.background.slice(0, 7)} onChange={(e) => set({ ...current, background: e.target.value.toUpperCase() })} />
                </div>
              </div>
              <span className="label">Size</span>
              <Slider value={current.scale} min={8} max={200} onChange={(scale) => set({ ...current, scale })} />
            </div>
          ) : null}
        </Section>
      ) : null}
    </>
  );
}

function GradientEditor({ fill, onChange }: { fill: Extract<Fill, { type: 'linear' | 'radial' }>; onChange: (f: Fill) => void }) {
  return (
    <div className="stack" style={{ marginTop: 14, padding: 12, borderRadius: 12, background: 'var(--paper)' }}>
      <div style={{ height: 22, borderRadius: 6, background: fillCss({ ...fill, type: 'linear', angle: 90 } as Fill) }} />
      <div className="row">
        {fill.stops.map((s, i) => (
          <label key={i} className="swatch" style={{ width: 26, background: s.color, cursor: 'pointer', overflow: 'hidden' }}>
            <input
              type="color"
              value={s.color.slice(0, 7)}
              style={{ opacity: 0 }}
              onChange={(e) => onChange({ ...fill, stops: fill.stops.map((x, j) => (j === i ? { ...x, color: e.target.value.toUpperCase() } : x)) })}
            />
          </label>
        ))}
        <div style={{ flex: 1 }} />
        <div className="seg" style={{ width: 132 }}>
          <button className={fill.type === 'linear' ? 'is-on' : ''} onClick={() => onChange({ type: 'linear', angle: 135, stops: fill.stops })}>
            Linear
          </button>
          <button className={fill.type === 'radial' ? 'is-on' : ''} onClick={() => onChange({ type: 'radial', stops: fill.stops })}>
            Radial
          </button>
        </div>
      </div>
      {fill.type === 'linear' ? (
        <input
          type="range"
          min={0}
          max={360}
          value={fill.angle}
          style={{ ['--fill' as string]: `${(fill.angle / 360) * 100}%` }}
          onChange={(e) => onChange({ ...fill, angle: Number(e.target.value) })}
          aria-label="Gradient angle"
        />
      ) : null}
    </div>
  );
}
