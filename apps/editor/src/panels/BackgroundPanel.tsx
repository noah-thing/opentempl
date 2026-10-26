import { useEditor } from '../editor/Editor';
import { useDoc, useUI } from '../editor/hooks';
import { Section, Slider } from './controls';
import { fillCss } from '../render/paint';
import { placeBackgroundPhoto, BACKGROUNDS } from './backgrounds';
import { Icon } from '../ui/icons';
import type { Fill } from '../doc/types';

const SOLIDS = ['#FFFFFF', '#EDEDF0', '#0B0B0D', '#2B3BFF', '#0AA0FF', '#9AA2EA', '#FF3C8E', '#FF4B39', '#FFE600', '#3EDD8A', '#F3E2C7', '#FFD8E4', '#123B2C', '#1B1240'];
const GRADS: Fill[] = [
  { type: 'linear', angle: 160, stops: [{ offset: 0, color: '#2B3BFF' }, { offset: 1, color: '#9AA2EA' }] },
  { type: 'linear', angle: 180, stops: [{ offset: 0, color: '#FFE600' }, { offset: 1, color: '#FF4B39' }] },
  { type: 'linear', angle: 135, stops: [{ offset: 0, color: '#FF3C8E' }, { offset: 1, color: '#FFE600' }] },
  { type: 'radial', stops: [{ offset: 0, color: '#3EDD8A' }, { offset: 1, color: '#0B3D2E' }] },
  { type: 'linear', angle: 180, stops: [{ offset: 0, color: '#0B0B0D' }, { offset: 1, color: '#2B3BFF' }] },
  { type: 'radial', stops: [{ offset: 0, color: '#FFFFFF' }, { offset: 1, color: '#D9D9DF' }] },
];

export default function BackgroundPanel() {
  const editor = useEditor();
  const pageId = useUI((s) => s.activePageId);
  const page = useDoc((s) => (pageId ? s.pages[pageId] : null));
  if (!page || !pageId) return null;
  const bg = page.background;
  const set = (background: Fill) => editor.doc.updatePage(pageId, { background });
  return (
    <>
      <div className="row" style={{ marginBottom: 6 }}>
        <span className="swatch" style={{ width: 40, background: fillCss(bg) }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>Page {editor.s.pageOrder.indexOf(pageId) + 1}</div>
          <div className="hint">{bg.type === 'solid' ? bg.color : bg.type === 'image' ? 'Photo' : 'Gradient'}</div>
        </div>
        <button className="btn btn-sm btn-outline" onClick={() => editor.openPanel('color', 'bg')}>
          Custom
        </button>
      </div>
      <Section title="Colours">
        <div className="swatches">
          {SOLIDS.map((c) => (
            <button key={c} className={`swatch ${bg.type === 'solid' && bg.color === c ? 'is-on' : ''}`} style={{ background: c }} onClick={() => set({ type: 'solid', color: c })} />
          ))}
        </div>
      </Section>
      <Section title="Gradients">
        <div className="grid-3">
          {GRADS.map((g, i) => (
            <button key={i} className="tile" style={{ aspectRatio: '4/3', background: fillCss(g) }} onClick={() => set(g)} aria-label="Gradient background" />
          ))}
        </div>
      </Section>
      <Section title="Textures and light">
        <div className="grid-2">
          {BACKGROUNDS.map((b) => (
            <button key={b.url} className="tile" style={{ aspectRatio: '16/10' }} onClick={() => placeBackgroundPhoto(editor, pageId, b.url, b.name)}>
              <img src={b.thumb} alt={b.name} loading="lazy" />
            </button>
          ))}
        </div>
      </Section>
      {bg.type === 'image' ? (
        <Section title="Photo background" action={<button onClick={() => set({ type: 'solid', color: '#FFFFFF' })}>Remove</button>}>
          <div className="seg" style={{ marginBottom: 10 }}>
            {(['cover', 'contain', 'tile'] as const).map((f) => (
              <button key={f} className={bg.fit === f ? 'is-on' : ''} onClick={() => set({ ...bg, fit: f })}>
                {f === 'cover' ? 'Fill' : f === 'contain' ? 'Fit' : 'Tile'}
              </button>
            ))}
          </div>
          <span className="label">Opacity</span>
          <Slider value={Math.round(bg.opacity * 100)} min={0} max={100} onChange={(v) => set({ ...bg, opacity: v / 100 })} />
        </Section>
      ) : null}
      <Section title="Every page">
        <button className="btn btn-outline btn-block" onClick={() => editor.s.pageOrder.forEach((p) => editor.doc.updatePage(p, { background: bg }))}>
          <Icon name="duplicate" /> Use this background on all pages
        </button>
      </Section>
    </>
  );
}
