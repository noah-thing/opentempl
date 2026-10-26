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
  const fit = Math.min(W / w0, H / h0);
  const cover = Math.max(W / w0, H / h0);
  const elements: Record<string, Element> = {};
  for (const [id, el] of Object.entries(snap.elements)) {
    const fullBleed = el.w >= w0 * 0.9 && el.h >= h0 * 0.9 && !el.rotation;
    if (fullBleed) {
      const next = { ...el, x: (el.x / w0) * W, y: (el.y / h0) * H, w: (el.w / w0) * W, h: (el.h / h0) * H } as Element;
      if (next.type === 'image' && next.assetId) {
        const size = assetSize(next.assetId);
        if (size) next.crop = coverCrop(size.width, size.height, next.w, next.h);
      }
      if (next.type === 'text') next.fontSize = Math.round(next.fontSize * fit * 10) / 10;
      elements[id] = next;
      continue;
    }
    const cx = ((el.x + el.w / 2) / w0) * W;
    const cy = ((el.y + el.h / 2) / h0) * H;
    const w = el.w * fit;
    const h = el.h * fit;
    const next = { ...el, x: cx - w / 2, y: cy - h / 2, w, h } as Element;
    if (next.type === 'text') next.fontSize = Math.round(next.fontSize * fit * 10) / 10;
    if (next.type === 'line') next.width = next.width * fit;
    if (next.type === 'shape' && next.stroke) next.stroke = { ...next.stroke, width: next.stroke.width * fit };
    elements[id] = next;
  }
  void cover;
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
              <span className="kbd">{f.note ?? `${f.width} × ${f.height}`}</span>
            </button>
          ))}
        </Section>
      ))}
    </>
  );
}
