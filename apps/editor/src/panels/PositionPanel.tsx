import { useEffect, useState } from 'react';
import { useEditor } from '../editor/Editor';
import { useDoc, useUI } from '../editor/hooks';
import type { Element } from '../doc/types';
import { Icon } from '../ui/icons';
import { Section } from './controls';
import { center, rotatePoint } from '../lib/geom';

function NumField({ label, value, onCommit, suffix }: { label: string; value: number; onCommit: (v: number) => void; suffix?: string }) {
  const [v, setV] = useState(String(Math.round(value * 10) / 10));
  useEffect(() => setV(String(Math.round(value * 10) / 10)), [value]);
  return (
    <label className="field" style={{ height: 34, padding: '0 8px' }}>
      <span className="muted" style={{ fontSize: 12, width: 14 }}>
        {label}
      </span>
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        onBlur={() => {
          const n = Number(v);
          if (!Number.isNaN(n)) onCommit(n);
        }}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            const n = Number(v) + (e.key === 'ArrowUp' ? 1 : -1) * (e.shiftKey ? 10 : 1);
            setV(String(n));
            onCommit(n);
          }
        }}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      />
      {suffix ? <span className="muted">{suffix}</span> : null}
    </label>
  );
}

export default function PositionPanel() {
  const editor = useEditor();
  const sel = useUI((s) => s.selection);
  const els = useDoc((s) => sel.map((id) => s.elements[id]).filter(Boolean)) as Element[];
  const [ratio, setRatio] = useState(true);
  if (!els.length) return <div className="hint">Select something to arrange it.</div>;
  const one = els.length === 1 ? els[0] : null;
  const multi = els.length > 1 && !editor.isGrouped();

  return (
    <>
      <Section title="Layer order">
        <div className="grid-2">
          <button className="btn btn-outline" onClick={() => editor.reorder('forward')}>
            <Icon name="forward" /> Forward
          </button>
          <button className="btn btn-outline" onClick={() => editor.reorder('backward')}>
            <Icon name="backward" /> Backward
          </button>
          <button className="btn btn-outline" onClick={() => editor.reorder('front')}>
            <Icon name="front" /> To front
          </button>
          <button className="btn btn-outline" onClick={() => editor.reorder('back')}>
            <Icon name="back" /> To back
          </button>
        </div>
      </Section>
      <Section title={multi ? 'Align to each other' : 'Align to page'}>
        <div className="grid-3">
          {(
            [
              ['left', 'align-left-obj', 'Left'],
              ['hcenter', 'align-hcenter-obj', 'Centre'],
              ['right', 'align-right-obj', 'Right'],
              ['top', 'align-top-obj', 'Top'],
              ['vcenter', 'align-vcenter-obj', 'Middle'],
              ['bottom', 'align-bottom-obj', 'Bottom'],
            ] as const
          ).map(([m, icon, label]) => (
            <button key={m} className="btn btn-outline" onClick={() => editor.align(m)}>
              <Icon name={icon} /> {label}
            </button>
          ))}
        </div>
        {multi ? (
          <div className="grid-3" style={{ marginTop: 8 }}>
            <button className="btn btn-outline" onClick={() => editor.distribute('x')} disabled={els.length < 3}>
              <Icon name="distribute-h" /> Across
            </button>
            <button className="btn btn-outline" onClick={() => editor.distribute('y')} disabled={els.length < 3}>
              <Icon name="distribute-v" /> Down
            </button>
            <button className="btn btn-outline" onClick={() => editor.tidy()}>
              <Icon name="tidy" /> Tidy
            </button>
          </div>
        ) : null}
      </Section>
      {one ? (
        <Section
          title="Size and position"
          action={
            <button onClick={() => setRatio((r) => !r)} style={{ color: ratio ? 'var(--cobalt)' : undefined }}>
              {ratio ? 'Ratio locked' : 'Ratio free'}
            </button>
          }
        >
          <div className="grid-2">
            <NumField label="X" value={one.x} onCommit={(x) => editor.update(one.id, { x })} />
            <NumField label="Y" value={one.y} onCommit={(y) => editor.update(one.id, { y })} />
            <NumField
              label="W"
              value={one.w}
              onCommit={(w) => {
                if (w <= 0) return;
                const h = ratio && one.type !== 'text' ? (one.h * w) / one.w : one.h;
                const patch: Partial<Element> & Record<string, unknown> = { w, h };
                if (one.type === 'text' && ratio) patch.fontSize = Math.round(one.fontSize * (w / one.w) * 10) / 10;
                editor.update(one.id, patch);
              }}
            />
            <NumField
              label="H"
              value={one.h}
              onCommit={(h) => {
                if (h <= 0 || one.type === 'text') return;
                editor.update(one.id, ratio ? { h, w: (one.w * h) / one.h } : { h });
              }}
            />
            <NumField
              label="°"
              value={one.rotation}
              onCommit={(r) => editor.update(one.id, { rotation: ((r % 360) + 360) % 360 })}
            />
            <button
              className="btn btn-outline"
              onClick={() => {
                // Rotate 90 degrees around the centre, keeping the centre fixed.
                const c = center(one);
                const p = rotatePoint({ x: one.x, y: one.y }, c, 0);
                void p;
                editor.update(one.id, { rotation: (one.rotation + 90) % 360 });
              }}
            >
              <Icon name="rotate" /> Turn 90°
            </button>
          </div>
        </Section>
      ) : null}
      {one && (one.type === 'image' || one.type === 'svg' || one.type === 'chart' || one.type === 'draw' || one.type === 'shape') ? (
        <Section title="Alternative text">
          <textarea
            defaultValue={one.alt ?? ''}
            key={one.id}
            placeholder="Describe this for people using screen readers. It travels with SVG and PDF exports."
            onBlur={(e) => editor.update(one.id, { alt: e.target.value.trim() || undefined })}
            onKeyDown={(e) => e.stopPropagation()}
            style={{ width: '100%', height: 72, borderRadius: 10, border: 0, boxShadow: 'inset 0 0 0 1px var(--line)', padding: 10, resize: 'vertical', background: 'var(--sheet)' }}
          />
        </Section>
      ) : null}
      <Section title="Lock">
        <button className="btn btn-outline btn-block" onClick={() => editor.toggleLock()}>
          <Icon name={els.every((e) => e.locked) ? 'unlock' : 'lock'} /> {els.every((e) => e.locked) ? 'Unlock' : 'Lock in place'}
        </button>
      </Section>
    </>
  );
}
