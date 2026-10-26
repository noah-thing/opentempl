import { useEffect } from 'react';
import { useEditor } from '../editor/Editor';
import { useUI } from '../editor/hooks';
import type { DrawSettings } from '../editor/state';
import { Icon } from '../ui/icons';
import { Section, Slider } from './controls';
import { useBrand } from './brand';

const TOOLS: { id: DrawSettings['tool']; label: string; icon: string }[] = [
  { id: 'pen', label: 'Pen', icon: 'pen' },
  { id: 'marker', label: 'Marker', icon: 'marker' },
  { id: 'highlighter', label: 'Highlighter', icon: 'highlighter' },
  { id: 'glow', label: 'Glow pen', icon: 'glow' },
  { id: 'eraser', label: 'Eraser', icon: 'eraser' },
];
const COLORS = ['#0B0B0D', '#FFFFFF', '#2B3BFF', '#0AA0FF', '#FF4B39', '#FF3C8E', '#FFE600', '#3EDD8A', '#9AA2EA', '#7B5CFF', '#FF9F1A', '#8A8A96', '#123B2C', '#F3E2C7'];

export default function DrawPanel() {
  const editor = useEditor();
  const draw = useUI((s) => s.draw);
  const tool = useUI((s) => s.tool);
  const brand = useBrand();
  useEffect(() => {
    editor.ui.set({ tool: 'draw', selection: [] });
    return () => {
      if (editor.state.tool === 'draw') editor.ui.set({ tool: 'select' });
    };
  }, [editor]);
  const set = (p: Partial<DrawSettings>) => editor.ui.set({ draw: { ...draw, ...p }, tool: 'draw' });
  return (
    <>
      <div className="grid-3" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {TOOLS.map((t) => (
          <button key={t.id} className={`effect-tile ${draw.tool === t.id && tool === 'draw' ? 'is-on' : ''}`} onClick={() => set({ tool: t.id })} title={t.label}>
            <span className="face" style={{ fontSize: 0 }}>
              <span style={{ color: t.id === 'eraser' ? 'var(--ink)' : draw.color === '#FFFFFF' ? 'var(--ink)' : draw.color }}>
                <Icon name={t.icon} size={24} />
              </span>
            </span>
            {t.label.split(' ')[0]}
          </button>
        ))}
      </div>
      {draw.tool !== 'eraser' ? (
        <>
          <Section title="Ink">
            <div className="swatches">
              {[...new Set([...brand.colors, ...COLORS])].slice(0, 21).map((c) => (
                <button key={c} className={`swatch ${draw.color === c ? 'is-on' : ''}`} style={{ background: c }} onClick={() => set({ color: c })} />
              ))}
            </div>
          </Section>
          <Section title="Weight">
            <Slider value={draw.width} min={1} max={60} onChange={(width) => set({ width })} />
            <div style={{ height: 48, display: 'grid', placeItems: 'center', background: 'var(--paper)', borderRadius: 12 }}>
              <svg width="220" height="40" viewBox="0 0 220 40">
                <path
                  d="M10 28 C 50 4, 80 36, 110 20 S 170 6, 210 18"
                  fill="none"
                  stroke={draw.color}
                  strokeOpacity={draw.tool === 'highlighter' ? 0.42 : 1}
                  strokeWidth={Math.min(26, draw.tool === 'marker' ? draw.width * 2.2 : draw.tool === 'highlighter' ? draw.width * 3.4 : draw.width)}
                  strokeLinecap={draw.tool === 'highlighter' ? 'square' : 'round'}
                />
              </svg>
            </div>
          </Section>
        </>
      ) : (
        <p className="hint">Drag over drawings to erase them. Other elements stay put.</p>
      )}
      <Section title="Tips">
        <p className="hint" style={{ margin: 0 }}>
          Every stroke becomes its own element you can move, recolour or animate. Press <kbd>Esc</kbd> to stop drawing.
        </p>
      </Section>
    </>
  );
}
