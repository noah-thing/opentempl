import { useEffect, useState } from 'react';
import { useEditor } from '../editor/Editor';
import { useDoc, useUI } from '../editor/hooks';
import type { AnimationKind, Element } from '../doc/types';
import { ANIMATIONS, animState } from '../render/animate';
import { Section, Slider } from './controls';

// Each tile plays its animation on hover, using the same maths as Present mode.
function Preview({ kind, playing }: { kind: AnimationKind; playing: boolean }) {
  const [t, setT] = useState(10000);
  useEffect(() => {
    if (!playing) {
      setT(10000);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const loop = () => {
      const e = (performance.now() - t0) % 1600;
      setT(e);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing]);
  const s = animState({ kind, delay: 0, duration: 900 }, t);
  return (
    <span
      style={{
        display: 'block',
        fontWeight: 700,
        fontSize: 26,
        opacity: s.opacity,
        transform: `translate(${s.tx * 40}px, ${s.ty * 30}px) rotate(${s.rotate}deg) scale(${s.scale})`,
        filter: s.blur ? `blur(${s.blur / 3}px)` : undefined,
        clipPath: s.reveal < 1 ? `inset(0 ${100 - s.reveal * 100}% 0 0)` : undefined,
      }}
    >
      Ag
    </span>
  );
}

export default function AnimatePanel() {
  const editor = useEditor();
  const sel = useUI((s) => s.selection);
  const pageId = useUI((s) => s.activePageId);
  const els = useDoc((s) => sel.map((id) => s.elements[id]).filter(Boolean)) as Element[];
  const [hover, setHover] = useState<AnimationKind | null>(null);
  const el = els[0];
  const anim = el?.anim ?? { kind: 'none' as AnimationKind, delay: 0, duration: 700 };

  const setAll = (kind: AnimationKind) => editor.updateSelected((e) => ({ anim: kind === 'none' ? null : { kind, delay: e.anim?.delay ?? 0, duration: e.anim?.duration ?? 700 } }));

  // Animate the whole page in reading order with a stagger.
  const animatePage = (kind: AnimationKind) => {
    if (!pageId) return;
    const ids = editor.s.pages[pageId].elementIds;
    const sorted = ids
      .map((id) => editor.s.elements[id])
      .filter(Boolean)
      .sort((a, b) => (Math.abs(a.y - b.y) > 40 ? a.y - b.y : a.x - b.x));
    editor.doc.updateElements(Object.fromEntries(sorted.map((e, i) => [e.id, { anim: kind === 'none' ? null : { kind, delay: i * 140, duration: 700 } }])));
    editor.toast(kind === 'none' ? 'Animations removed from this page' : `${sorted.length} elements animate in order`);
  };

  return (
    <>
      {el ? (
        <Section title="Selected element">
          <div className="effect-grid">
            {ANIMATIONS.map((a) => (
              <button
                key={a.kind}
                className={`effect-tile ${anim.kind === a.kind ? 'is-on' : ''}`}
                onMouseEnter={() => setHover(a.kind)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setAll(a.kind)}
              >
                <span className="face">{a.kind === 'none' ? <span style={{ fontWeight: 700, fontSize: 26 }}>Ag</span> : <Preview kind={a.kind} playing={hover === a.kind || anim.kind === a.kind} />}</span>
                {a.label}
              </button>
            ))}
          </div>
          {anim.kind !== 'none' ? (
            <div style={{ marginTop: 14 }}>
              <span className="label">Duration</span>
              <Slider value={anim.duration / 1000} min={0.1} max={4} step={0.05} unit="s" onChange={(v) => editor.updateSelected((e) => (e.anim ? { anim: { ...e.anim, duration: Math.round(v * 1000) } } : null))} />
              <span className="label">Delay</span>
              <Slider value={anim.delay / 1000} min={0} max={8} step={0.05} unit="s" onChange={(v) => editor.updateSelected((e) => (e.anim ? { anim: { ...e.anim, delay: Math.round(v * 1000) } } : null))} />
            </div>
          ) : null}
        </Section>
      ) : null}
      <Section title="Whole page">
        <p className="hint" style={{ margin: '0 0 8px' }}>
          Every element enters in reading order, one after another.
        </p>
        <div className="chips">
          {ANIMATIONS.map((a) => (
            <button key={a.kind} className="chip" onClick={() => animatePage(a.kind)}>
              {a.label}
            </button>
          ))}
        </div>
        <button className="btn btn-outline btn-block" style={{ marginTop: 12 }} onClick={() => editor.ui.set({ presenting: true, presentStart: editor.s.pageOrder.indexOf(pageId ?? '') })}>
          Preview in Present mode
        </button>
      </Section>
    </>
  );
}
