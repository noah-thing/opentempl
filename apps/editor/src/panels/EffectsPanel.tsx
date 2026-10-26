import { useEditor } from '../editor/Editor';
import { useDoc, useUI } from '../editor/hooks';
import type { Element, TextEffectKind, TextElement } from '../doc/types';
import { Section, Slider } from './controls';
import { Swatch } from '../toolbar/ContextToolbar';

const TEXT_FX: { kind: TextEffectKind; label: string; style: React.CSSProperties }[] = [
  { kind: 'none', label: 'None', style: {} },
  { kind: 'shadow', label: 'Shadow', style: { textShadow: '3px 3px 4px rgba(0,0,0,.45)' } },
  { kind: 'lift', label: 'Lift', style: { textShadow: '0 6px 10px rgba(0,0,0,.28)' } },
  { kind: 'hollow', label: 'Hollow', style: { color: 'transparent', WebkitTextStroke: '1.5px #0B0B0D' } },
  { kind: 'splice', label: 'Splice', style: { color: 'transparent', WebkitTextStroke: '1.5px #0B0B0D', textShadow: '3px 3px 0 #FFE600' } },
  { kind: 'outline', label: 'Outline', style: { WebkitTextStroke: '4px #2B3BFF', paintOrder: 'stroke' } as React.CSSProperties },
  { kind: 'echo', label: 'Echo', style: { textShadow: '3px 2px 0 rgba(11,11,13,.45), 6px 4px 0 rgba(11,11,13,.2)' } },
  { kind: 'glitch', label: 'Glitch', style: { textShadow: '-3px 0 #00E5FF, 3px 0 #FF2BD6' } },
  { kind: 'neon', label: 'Neon', style: { color: '#fff', textShadow: '0 0 4px #FF3C8E, 0 0 10px #FF3C8E, 0 0 18px #FF3C8E' } },
  { kind: 'highlight', label: 'Highlight', style: { background: '#FFE600', padding: '0 4px', borderRadius: 4 } },
];

const DEFAULT_COLOR: Partial<Record<TextEffectKind, string>> = {
  shadow: '#0B0B0D',
  splice: '#FFE600',
  outline: '#2B3BFF',
  echo: '#0B0B0D',
  neon: '#FF3C8E',
  highlight: '#FFE600',
};

export default function EffectsPanel() {
  const editor = useEditor();
  const sel = useUI((s) => s.selection);
  const els = useDoc((s) => sel.map((id) => s.elements[id]).filter(Boolean)) as Element[];
  const el = els[0];
  if (!el) return <div className="hint">Select something to add effects.</div>;
  const text = el.type === 'text' ? (el as TextElement) : null;
  const fx = text?.effect;
  const setFx = (patch: Partial<TextElement['effect']>) => editor.updateSelected((e) => (e.type === 'text' ? { effect: { ...e.effect, ...patch } } : null));
  const shadow = el.shadow;

  return (
    <>
      {text && fx ? (
        <>
          <Section title="Text effects">
            <div className="effect-grid">
              {TEXT_FX.map((f) => (
                <button
                  key={f.kind}
                  className={`effect-tile ${fx.kind === f.kind ? 'is-on' : ''}`}
                  onClick={() => setFx({ kind: f.kind, color: f.kind === fx.kind ? fx.color : DEFAULT_COLOR[f.kind] ?? fx.color })}
                >
                  <span className="face">
                    <span style={{ fontFamily: `"${text.fontFamily}"`, ...f.style }}>Ag</span>
                  </span>
                  {f.label}
                </button>
              ))}
            </div>
          </Section>
          {fx.kind !== 'none' ? (
            <div style={{ marginTop: 14 }}>
              {['shadow', 'splice', 'outline', 'echo', 'neon', 'highlight'].includes(fx.kind) ? (
                <div className="row-between" style={{ marginBottom: 10 }}>
                  <span className="label">Colour</span>
                  <Swatch fill={fx.color} title="Effect colour" onClick={() => editor.openPanel('color', 'effect')} />
                </div>
              ) : null}
              {fx.kind !== 'glitch' ? (
                <>
                  <span className="label">{fx.kind === 'hollow' || fx.kind === 'outline' || fx.kind === 'splice' ? 'Thickness' : fx.kind === 'highlight' ? 'Roundness' : 'Intensity'}</span>
                  <Slider value={fx.amount} min={0} max={100} onChange={(amount) => setFx({ amount })} />
                </>
              ) : null}
              {['shadow', 'splice', 'echo', 'glitch'].includes(fx.kind) ? (
                <>
                  <span className="label">Offset</span>
                  <Slider value={fx.offset} min={0} max={100} onChange={(offset) => setFx({ offset })} />
                </>
              ) : null}
              {['shadow', 'splice', 'echo'].includes(fx.kind) ? (
                <>
                  <span className="label">Direction</span>
                  <Slider value={fx.direction} min={-180} max={180} unit="°" onChange={(direction) => setFx({ direction })} />
                </>
              ) : null}
            </div>
          ) : null}
          <Section title="Shape">
            <span className="label">Curve</span>
            <Slider value={text.curve} min={-100} max={100} onChange={(curve) => editor.updateSelected((e) => (e.type === 'text' ? { curve } : null))} />
          </Section>
        </>
      ) : null}
      <Section
        title="Drop shadow"
        action={
          shadow ? (
            <button onClick={() => editor.updateSelected({ shadow: null })}>Remove</button>
          ) : (
            <button onClick={() => editor.updateSelected({ shadow: { x: 0, y: 16, blur: 40, color: 'rgba(11,11,13,0.28)' } })}>Add</button>
          )
        }
      >
        {shadow ? (
          <>
            <div className="row-between" style={{ marginBottom: 10 }}>
              <span className="label">Colour</span>
              <Swatch fill={shadow.color} title="Shadow colour" onClick={() => editor.openPanel('color', 'shadow')} />
            </div>
            <span className="label">Blur</span>
            <Slider value={shadow.blur} min={0} max={200} onChange={(blur) => editor.updateSelected({ shadow: { ...shadow, blur } })} />
            <span className="label">Horizontal</span>
            <Slider value={shadow.x} min={-200} max={200} onChange={(x) => editor.updateSelected({ shadow: { ...shadow, x } })} />
            <span className="label">Vertical</span>
            <Slider value={shadow.y} min={-200} max={200} onChange={(y) => editor.updateSelected({ shadow: { ...shadow, y } })} />
          </>
        ) : (
          <p className="hint" style={{ margin: 0 }}>
            A soft shadow lifts the element off the page.
          </p>
        )}
      </Section>
      <Section title="Layer blur">
        <Slider value={el.blur ?? 0} min={0} max={80} onChange={(blur) => editor.updateSelected({ blur: blur || undefined })} />
      </Section>
    </>
  );
}
