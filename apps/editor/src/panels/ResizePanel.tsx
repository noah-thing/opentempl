import { useState } from 'react';
import { useEditor, coverCrop } from '../editor/Editor';
import { useDoc } from '../editor/hooks';
import { FORMATS } from '../doc/formats';
import type { DesignSnapshot, Element, Asset } from '../doc/types';
import { Section } from './controls';
import { Icon } from '../ui/icons';
import { createDesign } from '../io/designs';
import { navigate } from '../App';

// Magic resize: every element keeps its relative position on the page and
// scales by the smaller of the two ratios, so nothing falls off the edge.
// Elements that covered the page (backgrounds) are rescaled to cover again.
export function resizeSnapshot(snap: DesignSnapshot, W: number, H: number, assetSize: (id: string) => { width: number; height: number } | undefined): DesignSnapshot {
  const w0 = snap.meta.width;
  const h0 = snap.meta.height;
  const sx = W / w0;
  const sy = H / h0;
  const fit = Math.min(sx, sy);
  const near = (a: number, b: number) => Math.abs(a - b) <= Math.max(2, Math.min(w0, h0) * 0.01);
  // Map one axis: an element spanning the page stretches with it, one touching
  // an edge stays glued to that edge, anything else keeps its relative centre.
  const axis = (pos: number, size: number, full: number, next: number, scale: number, s: number, lean: 'start' | 'end' | null = null) => {
    const spans = size >= full * 0.8;
    const start = near(pos, 0) || pos < 0;
    const end = near(pos + size, full) || pos + size > full;
    if (spans) {
      // Margins scale like everything else, so edges stay aligned with neighbours.
      const l = Math.max(0, pos) > 1 ? pos * scale : pos * s;
      const r = Math.max(0, full - pos - size) > 1 ? (full - pos - size) * scale : (full - pos - size) * s;
      return { pos: l, size: next - l - r, stretched: true };
    }
    const ns = size * scale;
    const before = pos;
    const after = full - pos - size;
    // Glued to an edge, or clearly closer to one side: keep that margin.
    if ((start && !end) || (!end && (before < after * 0.6 || (lean === 'start' && before <= after)))) return { pos: before * scale, size: ns, stretched: false };
    if ((end && !start) || (!start && (after < before * 0.6 || (lean === 'end' && after <= before)))) return { pos: next - after * scale - ns, size: ns, stretched: false };
    const c = ((pos + size / 2) / full) * next;
    return { pos: c - ns / 2, size: ns, stretched: false };
  };
  const elements: Record<string, Element> = {};
  for (const [id, el] of Object.entries(snap.elements)) {
    if (el.rotation) {
      const c = { x: ((el.x + el.w / 2) / w0) * W, y: ((el.y + el.h / 2) / h0) * H };
      const next = { ...el, w: el.w * fit, h: el.h * fit } as Element;
      next.x = c.x - next.w / 2;
      next.y = c.y - next.h / 2;
      if (next.type === 'text') next.fontSize = Math.round(next.fontSize * fit * 10) / 10;
      elements[id] = next;
      continue;
    }
    const isText = el.type === 'text';
    const lean = el.type === 'text' ? (el.align === 'left' ? 'start' : el.align === 'right' ? 'end' : null) : null;
    const hx = axis(el.x, el.w, w0, W, fit, sx, lean);
    const hy = isText ? { ...axis(el.y, el.h, h0, H, fit, fit), stretched: false } : axis(el.y, el.h, h0, H, fit, sy);
    const next = { ...el, x: hx.pos, y: hy.pos, w: hx.size, h: hy.size } as Element;
    if (next.type === 'image' && next.assetId && (hx.stretched || hy.stretched)) {
      const size = assetSize(next.assetId);
      if (size) next.crop = coverCrop(size.width, size.height, next.w, next.h);
    } else if (next.type === 'image' && !hx.stretched && !hy.stretched) {
      // Plain scaling keeps the crop.
    }
    if (next.type === 'shape' && (hx.stretched || hy.stretched) && !hx.stretched !== !hy.stretched) {
      // A band that spans one axis keeps its thickness proportional to the fit.
      if (hx.stretched) next.h = el.h * fit;
      if (hy.stretched) next.w = el.w * fit;
    }
    if (next.type === 'text') next.fontSize = Math.round(next.fontSize * fit * 10) / 10;
    if (next.type === 'line') next.width = next.width * fit;
    if (next.type === 'shape' && next.stroke) next.stroke = { ...next.stroke, width: next.stroke.width * fit };
    elements[id] = next;
  }
  return { ...snap, meta: { ...snap.meta, width: Math.round(W), height: Math.round(H) }, elements };
}

export default function ResizePanel() {
  const editor = useEditor();
  const meta = useDoc((s) => s.meta);
  const [w, setW] = useState(meta.width);
  const [h, setH] = useState(meta.height);
  const [picked, setPicked] = useState<string | null>(null);
  const groups = [...new Set(FORMATS.map((f) => f.group))];

  const run = async (copy: boolean) => {
    if (w < 16 || h < 16 || w > 12000 || h > 12000) return editor.toast('Pick a size between 16 and 12,000 px');
    const snap = resizeSnapshot(editor.doc.toSnapshot(), w, h, (id) => editor.doc.getAsset(id));
    if (copy) {
      const assets: Asset[] = [];
      editor.doc.assets.forEach((a) => assets.push(a));
      const id = await createDesign({ snapshot: { ...snap, meta: { ...snap.meta, title: `${meta.title} ${w}×${h}`, formatId: picked ?? undefined } }, assets });
      navigate(`/d/${id}`);
      return;
    }
    editor.doc.transact(() => {
      editor.doc.setMeta({ width: snap.meta.width, height: snap.meta.height, formatId: picked ?? undefined });
      editor.doc.updateElements(snap.elements);
    });
    window.dispatchEvent(new Event('tavla:fit'));
    editor.refitAllText();
    editor.toast(`Resized to ${w} × ${h}`);
  };

  return (
    <>
      <div className="row">
        <label className="field" style={{ flex: 1 }}>
          <span className="muted">W</span>
          <input value={w} onChange={(e) => setW(Number(e.target.value) || 0)} onKeyDown={(e) => e.stopPropagation()} />
        </label>
        <button className="icon-btn" title="Swap" onClick={() => (setW(h), setH(w))}>
          <Icon name="shuffle" />
        </button>
        <label className="field" style={{ flex: 1 }}>
          <span className="muted">H</span>
          <input value={h} onChange={(e) => setH(Number(e.target.value) || 0)} onKeyDown={(e) => e.stopPropagation()} />
        </label>
      </div>
      <div className="grid-2" style={{ marginTop: 10 }}>
        <button className="btn btn-outline" onClick={() => run(false)}>
          Resize this design
        </button>
        <button className="btn btn-primary" onClick={() => run(true)}>
          Copy and resize
        </button>
      </div>
      {groups.map((g) => (
        <Section key={g} title={g}>
          {FORMATS.filter((f) => f.group === g).map((f) => (
            <button
              key={f.id}
              title={f.note}
              className="menu-item"
              style={{ height: 40, background: picked === f.id ? 'var(--cobalt-soft)' : undefined }}
              onClick={() => {
                setW(f.width);
                setH(f.height);
                setPicked(f.id);
              }}
            >
              <span style={{ width: 26, display: 'grid', placeItems: 'center' }}>
                <span style={{ width: (f.width / Math.max(f.width, f.height)) * 20, height: (f.height / Math.max(f.width, f.height)) * 20, boxShadow: 'inset 0 0 0 1.5px var(--ink)', borderRadius: 2 }} />
              </span>
              <span style={{ flex: 1 }}>{f.name}</span>
              <span className="kbd tabular">{Math.round(f.width)} × {Math.round(f.height)} px</span>
            </button>
          ))}
        </Section>
      ))}
    </>
  );
}
