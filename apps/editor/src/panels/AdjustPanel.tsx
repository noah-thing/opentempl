import { useState } from 'react';
import { useEditor } from '../editor/Editor';
import { useDoc, useUI } from '../editor/hooks';
import type { ImageElement, ImageFilters } from '../doc/types';
import { DUOTONES, FILTER_PRESETS, ImageFilterDef } from '../render/paint';
import { Section, Slider } from './controls';
import { NO_FILTERS } from '../doc/factory';
import { removeBackground } from '../tools/removeBackground';
import { Icon } from '../ui/icons';

const ADJUST: { key: keyof ImageFilters; label: string; min: number }[] = [
  { key: 'brightness', label: 'Brightness', min: -100 },
  { key: 'contrast', label: 'Contrast', min: -100 },
  { key: 'saturation', label: 'Saturation', min: -100 },
  { key: 'temperature', label: 'Warmth', min: -100 },
  { key: 'tint', label: 'Tint', min: -100 },
  { key: 'blur', label: 'Blur', min: 0 },
  { key: 'vignette', label: 'Vignette', min: 0 },
  { key: 'grain', label: 'Grain', min: 0 },
];

export default function AdjustPanel() {
  const editor = useEditor();
  const sel = useUI((s) => s.selection);
  const el = useDoc((s) => s.elements[sel[0]]) as ImageElement | undefined;
  const [busy, setBusy] = useState<string | null>(null);
  if (!el || el.type !== 'image') return <div className="hint">Select a photo to edit it.</div>;
  const url = editor.doc.assetUrl(el.assetId);
  const f = el.filters;
  const set = (patch: Partial<ImageFilters>) => editor.update(el.id, { filters: { ...f, ...patch } } as Partial<ImageElement>);

  return (
    <>
      <Section title="Magic">
        <button
          className="btn btn-outline btn-block"
          disabled={!!busy || !el.assetId}
          onClick={async () => {
            setBusy('Finding the subject');
            try {
              await removeBackground(editor, el, setBusy);
            } catch (e) {
              editor.toast(String((e as Error).message ?? e));
            }
            setBusy(null);
          }}
        >
          <Icon name="wand" /> {busy ?? 'Remove background'}
        </button>
        <p className="hint" style={{ margin: '6px 0 0' }}>
          Runs on your machine with an open model. The first run downloads it once.
        </p>
      </Section>
      <Section title="Filters" action={f.preset !== 'none' ? <button onClick={() => set({ preset: 'none' })}>Clear</button> : null}>
        <div className="grid-3">
          {Object.keys(FILTER_PRESETS).map((name) => (
            <button key={name} className="effect-tile" onClick={() => set({ preset: name })}>
              <span className="face" style={{ overflow: 'hidden', boxShadow: f.preset === name ? '0 0 0 2px var(--cobalt)' : undefined }}>
                {url ? (
                  <svg viewBox="0 0 100 100" width="100%" height="100%">
                    <defs>
                      <ImageFilterDef id={`pv-${name}`} filters={{ ...NO_FILTERS, preset: name }} w={100} h={100} />
                    </defs>
                    <image href={url} width="100" height="100" preserveAspectRatio="xMidYMid slice" filter={name === 'none' ? undefined : `url(#pv-${name})`} />
                  </svg>
                ) : null}
              </span>
              {name === 'none' ? 'Original' : name}
            </button>
          ))}
        </div>
      </Section>
      <Section title="Adjust" action={<button onClick={() => set({ ...NO_FILTERS, preset: f.preset })}>Reset</button>}>
        {ADJUST.map((a) => (
          <div key={a.key}>
            <span className="label">{a.label}</span>
            <Slider value={f[a.key] as number} min={a.min} max={100} onChange={(v) => set({ [a.key]: v })} />
          </div>
        ))}
      </Section>
      <Section title="Duotone" action={f.duotone ? <button onClick={() => set({ duotone: null })}>Remove</button> : null}>
        <div className="grid-3">
          {DUOTONES.map((d) => (
            <button
              key={d.join()}
              className="tile"
              style={{ aspectRatio: '1', background: `linear-gradient(135deg, ${d[0]}, ${d[1]})`, boxShadow: f.duotone?.join() === d.join() ? '0 0 0 2px var(--cobalt)' : undefined }}
              onClick={() => set({ duotone: d })}
              aria-label={`Duotone ${d.join(' and ')}`}
            />
          ))}
        </div>
      </Section>
    </>
  );
}
