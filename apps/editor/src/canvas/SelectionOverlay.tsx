import { useState } from 'react';
import type { Element, Id, LineElement } from '../doc/types';
import { useEditor } from '../editor/Editor';
import { startDrag, useDoc, useUI } from '../editor/hooks';
import { aabb, center, unionRects, type Point } from '../lib/geom';
import { collectTargets, snapBox } from './snap';
import {
  groupResizeBox,
  handlesFor,
  lineEnds,
  lineFromEnds,
  resizeElement,
  rotationFor,
  scaleGroup,
  type Handle,
} from './transform';
import { Icon } from '../ui/icons';

interface Props {
  pageId: Id;
  zoom: number;
  toLocal: (x: number, y: number) => Point;
}

export function SelectionOverlay({ pageId, zoom, toLocal }: Props) {
  const editor = useEditor();
  const selection = useUI((s) => s.selection);
  const dragging = useUI((s) => s.dragging);
  const els = useDoc((s) => selection.map((id) => s.elements[id]).filter(Boolean) as Element[]);
  const [live, setLive] = useState<string | null>(null);
  if (!els.length) return null;

  const single = els.length === 1 ? els[0] : null;
  const grouped = els.length > 1 && els.every((e) => e.groupId && e.groupId === els[0].groupId);
  const locked = els.every((e) => e.locked);
  const box = single ? { x: single.x, y: single.y, w: single.w, h: single.h, rotation: single.rotation } : { ...unionRects(els.map((e) => aabb(e)))!, rotation: 0 };

  const others = () =>
    editor.s.pages[pageId].elementIds
      .filter((i) => !selection.includes(i))
      .map((i) => editor.s.elements[i])
      .filter(Boolean);

  // ---------- resize ----------
  const onHandle = (handle: Handle) => (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    editor.doc.undo.stopCapturing();
    const starts = els.map((x) => structuredClone(x));
    const from = unionRects(starts.map((x) => aabb(x)))!;
    const targets = collectTargets(pageId, { w: editor.s.meta.width, h: editor.s.meta.height }, others(), editor.state.pageGuides[pageId]);
    startDrag(
      e,
      (ev) => {
        let p = toLocal(ev.clientX, ev.clientY);
        // Snap the dragged edge for unrotated boxes.
        if (editor.state.snap && (!single || !single.rotation)) {
          const s = snapBox({ x: p.x, y: p.y, w: 0, h: 0 }, targets, 6 / zoom);
          p = { x: p.x + s.dx, y: p.y + s.dy };
          editor.ui.set({ guides: s.guides });
        }
        if (single) {
          const patch = resizeElement(starts[0], handle, p, {
            shift: ev.shiftKey,
            alt: ev.altKey,
            assetSize: single.type === 'image' ? editor.doc.getAsset(single.assetId) : undefined,
          });
          editor.update(single.id, patch);
          const el = editor.s.elements[single.id];
          setLive(`${Math.round(el.w)} × ${Math.round(el.h)}`);
        } else {
          const to = groupResizeBox(from, handle, p, ev.altKey);
          editor.doc.updateElements(scaleGroup(starts, from, to));
          setLive(`${Math.round(to.w)} × ${Math.round(to.h)}`);
        }
        editor.ui.set({ dragging: true });
      },
      () => {
        setLive(null);
        editor.ui.set({ guides: [], dragging: false });
        for (const s of starts) if (s.type === 'text') editor.fitText(s.id);
      },
      0,
    );
  };

  // ---------- rotate ----------
  const onRotate = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    editor.doc.undo.stopCapturing();
    const starts = els.map((x) => structuredClone(x));
    const startP = toLocal(e.clientX, e.clientY);
    const c = center(box);
    startDrag(
      e,
      (ev) => {
        const p = toLocal(ev.clientX, ev.clientY);
        if (single) {
          const r = rotationFor(starts[0], p, startP, ev.shiftKey);
          editor.doc.updateElement(single.id, { rotation: r });
          setLive(`${Math.round(r)}°`);
        } else {
          // Rotate a multi selection around its centre.
          const a0 = Math.atan2(startP.y - c.y, startP.x - c.x);
          const a1 = Math.atan2(p.y - c.y, p.x - c.x);
          let d = ((a1 - a0) * 180) / Math.PI;
          if (ev.shiftKey) d = Math.round(d / 15) * 15;
          const rad = (d * Math.PI) / 180;
          const patches: Record<Id, Partial<Element>> = {};
          for (const s of starts) {
            const sc = center(s);
            const nx = c.x + (sc.x - c.x) * Math.cos(rad) - (sc.y - c.y) * Math.sin(rad);
            const ny = c.y + (sc.x - c.x) * Math.sin(rad) + (sc.y - c.y) * Math.cos(rad);
            patches[s.id] = { x: nx - s.w / 2, y: ny - s.h / 2, rotation: (((s.rotation + d) % 360) + 360) % 360 };
          }
          editor.doc.updateElements(patches);
          setLive(`${Math.round(d)}°`);
        }
        editor.ui.set({ dragging: true });
      },
      () => {
        setLive(null);
        editor.ui.set({ dragging: false });
      },
      0,
    );
  };

  // ---------- line endpoints ----------
  const onLineEnd = (which: 0 | 1) => (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const line = single as LineElement;
    editor.doc.undo.stopCapturing();
    const [a, b] = lineEnds(line);
    const targets = collectTargets(pageId, { w: editor.s.meta.width, h: editor.s.meta.height }, others(), editor.state.pageGuides[pageId]);
    startDrag(
      e,
      (ev) => {
        let p = toLocal(ev.clientX, ev.clientY);
        if (editor.state.snap) {
          const s = snapBox({ x: p.x, y: p.y, w: 0, h: 0 }, targets, 6 / zoom);
          p = { x: p.x + s.dx, y: p.y + s.dy };
          editor.ui.set({ guides: s.guides });
        }
        const patch = which === 1 ? lineFromEnds(line, a, p, ev.shiftKey) : lineFromEnds(line, b, p, ev.shiftKey);
        if (which === 0) {
          // Keep the direction start -> end when dragging the start point.
          patch.rotation = ((patch.rotation ?? 0) + 180) % 360;
        }
        editor.doc.updateElement(line.id, patch);
        setLive(`${Math.round(editor.s.elements[line.id].w)} px · ${Math.round(editor.s.elements[line.id].rotation)}°`);
        editor.ui.set({ dragging: true });
      },
      () => {
        setLive(null);
        editor.ui.set({ guides: [], dragging: false });
      },
      0,
    );
  };

  const z = zoom;
  const handles = locked ? [] : handlesFor(single, !single);
  const isLine = single?.type === 'line';
  const lineEndsPts = isLine ? lineEnds(single as LineElement) : null;

  return (
    <>
      <div
        className={`selection ${locked ? 'is-locked' : ''} ${grouped ? 'is-group' : ''}`}
        data-selection-body={els.length > 1 ? 'multi' : undefined}
        style={{
          left: box.x * z,
          top: box.y * z,
          width: box.w * z,
          height: box.h * z,
          transform: box.rotation ? `rotate(${box.rotation}deg)` : undefined,
          pointerEvents: els.length > 1 ? 'auto' : 'none',
        }}
      >
        {!isLine &&
          handles.map((h) => (
            <div key={h} data-overlay-control className={`handle handle-${h}`} onPointerDown={onHandle(h)} />
          ))}
        {!locked && !isLine ? (
          <div data-overlay-control className="rotate-handle" onPointerDown={onRotate} title="Rotate">
            <Icon name="rotate" size={14} />
          </div>
        ) : null}
        {locked ? (
          <div className="lock-badge">
            <Icon name="lock" size={12} />
          </div>
        ) : null}
        {live ? <div className="live-label">{live}</div> : null}
      </div>
      {lineEndsPts && !locked
        ? lineEndsPts.map((p, i) => (
            <div
              key={i}
              data-overlay-control
              className="line-handle"
              style={{ left: p.x * z, top: p.y * z }}
              onPointerDown={onLineEnd(i as 0 | 1)}
            />
          ))
        : null}
      {!dragging ? <QuickBar box={box} zoom={z} locked={locked} /> : null}
    </>
  );
}

function QuickBar({ box, zoom, locked }: { box: { x: number; y: number; w: number; h: number; rotation: number }; zoom: number; locked: boolean }) {
  const editor = useEditor();
  const b = aabb(box);
  // Near the top of the page the bar would sit under the toolbar, so it goes below.
  const below = b.y * zoom < 90;
  return (
    <div
      className={`quickbar ${below ? 'is-below' : ''}`}
      data-overlay-control
      style={{ left: (b.x + b.w / 2) * zoom, top: below ? (b.y + b.h) * zoom + 56 : b.y * zoom }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {locked ? (
        <button onClick={() => editor.toggleLock()} title="Unlock">
          <Icon name="unlock" size={15} />
        </button>
      ) : (
        <>
          <button onClick={() => editor.duplicateSelected()} title="Duplicate (⌘D)">
            <Icon name="duplicate" size={15} />
          </button>
          <button onClick={() => editor.toggleLock()} title="Lock">
            <Icon name="lock" size={15} />
          </button>
          <button onClick={() => editor.deleteSelected()} title="Delete">
            <Icon name="trash" size={15} />
          </button>
          <button
            onClick={(e) => {
              const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
              window.dispatchEvent(new CustomEvent('tavla:contextmenu', { detail: { x: r.left, y: r.bottom + 6, pageId: editor.state.activePageId } }));
            }}
            title="More"
          >
            <Icon name="more" size={15} />
          </button>
        </>
      )}
    </div>
  );
}
