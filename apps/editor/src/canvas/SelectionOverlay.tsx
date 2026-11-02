import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Element, Id, LineElement } from '../doc/types';
import { makeLine } from '../doc/factory';
import { useEditor } from '../editor/Editor';
import { startDrag, useDoc, useUI } from '../editor/hooks';
import { aabb, center, unionRects, type Point } from '../lib/geom';
import { collectTargets, snapBox } from './snap';
import { canConnect, connectorGap, edgePoint, lineBetween } from './connectors';
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
  const hoverId = useUI((s) => s.hoverId);
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
    const key = which === 0 ? 'from' : 'to';
    let stuck: Id | undefined;
    startDrag(
      e,
      (ev) => {
        let p = toLocal(ev.clientX, ev.clientY);
        // Over another element: the end sticks to its edge and follows it from then on.
        stuck = stickTarget(ev.clientX, ev.clientY, line.id);
        if (stuck) {
          const cur = editor.s.elements[line.id] as LineElement;
          const fixed = which === 0 ? lineEnds(cur)[1] : lineEnds(cur)[0];
          const other = cur[which === 0 ? 'to' : 'from'];
          const otherEl = other ? editor.s.elements[other] : undefined;
          const aimAt = otherEl && otherEl.id !== stuck ? center(aabb(otherEl)) : fixed;
          const edge = edgePoint(editor.s.elements[stuck], aimAt, connectorGap(line));
          const patch = which === 1 ? lineBetween(line, fixed, edge) : lineBetween(line, edge, fixed);
          editor.doc.updateElement(line.id, { ...patch, [key]: stuck });
          editor.ui.set({ dragging: true, guides: [], hoverId: stuck });
          setLive('Stuck to an element');
          return;
        }
        if (editor.state.hoverId) editor.ui.set({ hoverId: null });
        if (editor.s.elements[line.id] && (editor.s.elements[line.id] as LineElement)[key]) editor.doc.updateElement(line.id, { [key]: undefined } as Partial<LineElement>);
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
        editor.ui.set({ guides: [], dragging: false, hoverId: null });
      },
      0,
    );
  };

  const stickTarget = (clientX: number, clientY: number, lineId: Id, skip: Id[] = []): Id | undefined => {
    for (const node of document.elementsFromPoint(clientX, clientY)) {
      const id = node.closest('[data-id]')?.getAttribute('data-id');
      if (!id || id === lineId || skip.includes(id) || editor.s.elementPage[id] !== pageId) continue;
      const el = editor.s.elements[id];
      if (canConnect(el) && !el.locked) return id;
    }
    return undefined;
  };

  // ---------- connect dots: pull an arrow out of an element ----------
  // A sticky note is a group; its connector hangs off the biggest member.
  const source = locked || (!single && !grouped) ? null : single ?? els.reduce((a, b) => (a.w * a.h >= b.w * b.h ? a : b));
  const connectable = !!source && canConnect(source) && ['shape', 'svg', 'image', 'text'].includes(source.type) && box.w * zoom > 24 && box.h * zoom > 24;
  const onConnect = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!source) return;
    const skip = els.map((x) => x.id);
    const line = makeLine({ end: 'arrow', from: source.id });
    const gap = connectorGap(line);
    let made = false;
    editor.doc.undo.stopCapturing();
    startDrag(
      e,
      (ev) => {
        const p = toLocal(ev.clientX, ev.clientY);
        const target = stickTarget(ev.clientX, ev.clientY, line.id, skip);
        const to = target ? editor.s.elements[target] : undefined;
        const end = to ? edgePoint(to, center(aabb(editor.s.elements[source.id])), gap) : p;
        const start = edgePoint(editor.s.elements[source.id], to ? center(aabb(to)) : p, gap);
        const geo = { ...lineBetween(line, start, end), to: target };
        if (!made) {
          made = true;
          editor.doc.addElement(pageId, { ...line, ...geo });
        } else editor.doc.updateElement(line.id, geo as Partial<LineElement>);
        editor.ui.set({ hoverId: target ?? null, dragging: true });
      },
      () => {
        editor.ui.set({ hoverId: null, dragging: false });
        if (made) editor.ui.set({ selection: [line.id] });
      },
      2,
    );
  };

  const z = zoom;
  const handles = locked ? [] : handlesFor(single, !single);
  const isLine = single?.type === 'line';
  const lineEndsPts = isLine ? lineEnds(single as LineElement) : null;

  return (
    <>
      <div
        className={`selection ${locked ? 'is-locked' : ''} ${grouped ? 'is-group' : ''} ${connectable ? 'has-connect' : ''}`}
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
      {connectable && !dragging
        ? (() => {
            const b = aabb(box);
            const spots = [
              { side: 'top', x: b.x + b.w / 2, y: b.y, dx: 0, dy: -1 },
              { side: 'right', x: b.x + b.w, y: b.y + b.h / 2, dx: 1, dy: 0 },
              { side: 'bottom', x: b.x + b.w / 2, y: b.y + b.h, dx: 0, dy: 1 },
              { side: 'left', x: b.x, y: b.y + b.h / 2, dx: -1, dy: 0 },
            ];
            const near = !!hoverId && selection.includes(hoverId);
            return spots.map((s) => (
              <div
                key={s.side}
                data-overlay-control
                className={`connect-dot ${near ? 'is-near' : ''}`}
                title="Drag to connect"
                style={{ left: s.x * z + s.dx * 20, top: s.y * z + s.dy * 20 }}
                onPointerDown={onConnect}
              />
            ));
          })()
        : null}
      {!dragging ? <QuickBar box={box} zoom={z} locked={locked} lifted={connectable} /> : null}
    </>
  );
}

function QuickBar({ box, zoom, locked, lifted }: { box: { x: number; y: number; w: number; h: number; rotation: number }; zoom: number; locked: boolean; lifted: boolean }) {
  const editor = useEditor();
  const b = aabb(box);
  const ref = useRef<HTMLDivElement>(null);
  const [below, setBelow] = useState(false);
  const [tick, setTick] = useState(0);
  // Connect dots sit just outside the box, so the bar clears them when they can show.
  const gap = lifted ? 36 : 12;

  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    window.addEventListener('scroll', bump, true);
    window.addEventListener('resize', bump);
    return () => {
      window.removeEventListener('scroll', bump, true);
      window.removeEventListener('resize', bump);
    };
  }, []);

  // Flip under the selection when the bar would run into the page toolbar or leave the viewport.
  useLayoutEffect(() => {
    const el = ref.current;
    const origin = el?.offsetParent?.getBoundingClientRect();
    if (!el || !origin) return;
    const toolbar = document.querySelector('.ctxbar')?.getBoundingClientRect();
    const limit = Math.max(toolbar?.bottom ?? 0, 0) + 8;
    const top = origin.top + b.y * zoom - gap - el.offsetHeight;
    setBelow(top < limit);
  }, [b.x, b.y, b.w, b.h, zoom, gap, tick]);

  return (
    <div
      ref={ref}
      className={`quickbar ${below ? 'is-below' : ''}`}
      data-overlay-control
      style={{ left: (b.x + b.w / 2) * zoom, top: below ? (b.y + b.h) * zoom + (lifted ? 78 : 56) : b.y * zoom - gap }}
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
