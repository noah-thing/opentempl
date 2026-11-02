import { memo, useMemo, useRef, useState } from 'react';
import type { Element, Id, TextElement } from '../doc/types';
import { cloneElements } from '../doc/design';
import { makeLine, makeShape, makeText, TEXT_PRESETS, makeDraw } from '../doc/factory';
import { useEditor } from '../editor/Editor';
import { startDrag, useDoc, useFontsVersion, useUI } from '../editor/hooks';
import { aabb, rectsIntersect, unionRects, type Point, type Rect } from '../lib/geom';
import { PageView } from '../render/PageView';
import { RenderContext, type RenderEnv } from '../render/RenderContext';
import { collectTargets, snapBox } from './snap';
import { SelectionOverlay } from './SelectionOverlay';
import { TextEditor } from './TextEditor';
import { CropOverlay } from './CropOverlay';
import { importFiles } from '../io/upload';
import { dropLibraryItem, LIBRARY_MIME } from '../panels/library';
import { smoothPath } from './draw';
import { activeCollab, usePeers } from '../collab/collab';
import { listUploads } from '../io/uploads';
import { CommentDraft, CommentPins } from './Comments';
import { PenLayer } from './PenTool';
import { COBALT } from '../doc/colors';

interface Props {
  pageId: Id;
  zoom: number;
}

// Fingers currently on the screen, so a one finger scroll steps aside for a pinch.
const fingers = new Set<number>();
if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', (e) => e.pointerType === 'touch' && fingers.add(e.pointerId), true);
  for (const type of ['pointerup', 'pointercancel'] as const) window.addEventListener(type, (e) => fingers.delete(e.pointerId), true);
}

export const PageStage = memo(function PageStage({ pageId, zoom }: Props) {
  const editor = useEditor();
  const page = useDoc((s) => s.pages[pageId]);
  const elements = useDoc((s) => s.elements);
  const meta = useDoc((s) => s.meta);
  const fontsVersion = useFontsVersion();
  const { selection, editingTextId, cropId, tool, guides, marquee, hoverId, showGrid, penEditId, activePageId, playingVideoId } = useUI((s) => ({
    penEditId: s.tool === 'pen' ? s.penEditId : null,
    playingVideoId: s.playingVideoId,
    activePageId: s.activePageId,
    selection: s.selection,
    editingTextId: s.editingTextId,
    cropId: s.cropId,
    tool: s.tool,
    guides: s.guides,
    marquee: s.marquee,
    hoverId: s.hoverId,
    showGrid: s.showGrid,
  }));
  const ref = useRef<HTMLDivElement>(null);
  const [drawing, setDrawing] = useState<{ d: string; color: string; width: number } | null>(null);
  const [draft, setDraft] = useState<{ pageId: Id; x: number; y: number } | null>(null);
  const commentMode = useUI((s) => s.commentMode);

  const env: RenderEnv = useMemo(
    () => ({
      assetUrl: (id) => editor.doc.assetUrl(id),
      assetSize: (id) => {
        const a = editor.doc.getAsset(id);
        return a ? { width: a.width, height: a.height } : undefined;
      },
      fontsVersion,
      mode: 'edit',
      hiddenIds: editingTextId || penEditId ? new Set([editingTextId ?? penEditId!]) : undefined,
      playing: playingVideoId,
    }),
    [editor, fontsVersion, editingTextId, penEditId, playingVideoId],
  );

  if (!page) return null;
  const W = meta.width;
  const H = meta.height;
  const onThisPage = selection.length > 0 && editor.s.elementPage[selection[0]] === pageId;

  const toLocal = (clientX: number, clientY: number): Point => {
    const r = ref.current!.getBoundingClientRect();
    return { x: (clientX - r.left) / zoom, y: (clientY - r.top) / zoom };
  };

  const hitId = (target: EventTarget | null): Id | null => {
    const node = (target as globalThis.Element | null)?.closest?.('[data-id]');
    const id = node?.getAttribute('data-id') ?? null;
    return id && editor.s.elementPage[id] === pageId ? id : null;
  };
  // Locked layers (a paper texture over a whole template, say) let clicks through
  // to the first unlocked element beneath them; they are only picked when nothing editable is under the pointer.
  // Locked layers, and paper or grain textures blended over the whole page, let clicks through
  // to what lies under them. A texture is still selectable where nothing else is underneath.
  const seeThrough = (id: Id) => {
    const el = editor.s.elements[id];
    if (!el) return false;
    if (el.locked) return true;
    const blended = el.type === 'image' && 'blend' in el && !!el.blend && el.blend !== 'normal';
    return blended && (el.name === 'Texture' || (el.w >= W * 0.9 && el.h >= H * 0.9));
  };
  const pickId = (x: number, y: number, target: EventTarget | null): Id | null => {
    const id = hitId(target);
    if (!id || !seeThrough(id)) return id;
    for (const node of document.elementsFromPoint(x, y)) {
      const below = hitId(node);
      if (below && !seeThrough(below)) return below;
    }
    return id;
  };

  // ---------- creation tools ----------
  const createAt = (p: Point, e: React.PointerEvent) => {
    const kind = tool;
    if (kind === 'text') {
      // Keep the browser from moving focus to the viewport after this press.
      e.preventDefault();
      const t = makeText({ ...TEXT_PRESETS.subheading, text: '' , w: Math.min(W * 0.6, 900) });
      const placed = editor.add([{ ...t, x: p.x, y: p.y - t.fontSize * 0.6 }], { at: { x: p.x + t.w / 2, y: p.y } });
      if (placed?.[0]) editor.ui.set({ editingTextId: placed[0].id, tool: 'select' });
      return;
    }
    const startEl: Element =
      kind === 'line'
        ? makeLine({ x: p.x, y: p.y - 12, w: 1, h: 24 })
        : kind === 'sticky'
          ? makeShape('rect', { x: p.x, y: p.y, w: 1, h: 1, fill: { type: 'solid', color: '#FFE600' }, radius: 6, shadow: { x: 0, y: 8, blur: 24, color: 'rgba(0,0,0,0.18)' } })
          : makeShape(kind === 'ellipse' ? 'ellipse' : 'rect', { x: p.x, y: p.y, w: 1, h: 1, fill: { type: 'solid', color: COBALT } });
    editor.doc.undo.stopCapturing();
    editor.doc.addElement(pageId, startEl);
    editor.ui.set({ selection: [startEl.id], activePageId: pageId });
    startDrag(
      e,
      (ev) => {
        const q = toLocal(ev.clientX, ev.clientY);
        if (startEl.type === 'line') {
          const len = Math.hypot(q.x - p.x, q.y - p.y);
          const ang = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI;
          const snapped = ev.shiftKey ? Math.round(ang / 45) * 45 : ang;
          const cx = p.x + (Math.cos((snapped * Math.PI) / 180) * len) / 2;
          const cy = p.y + (Math.sin((snapped * Math.PI) / 180) * len) / 2;
          editor.doc.updateElement(startEl.id, { x: cx - len / 2, y: cy - 12, w: len, rotation: (snapped + 360) % 360 });
        } else {
          let w = q.x - p.x;
          let h = q.y - p.y;
          if (ev.shiftKey || kind === 'sticky') {
            const s = Math.max(Math.abs(w), Math.abs(h));
            w = Math.sign(w || 1) * s;
            h = Math.sign(h || 1) * s;
          }
          editor.doc.updateElement(startEl.id, { x: Math.min(p.x, p.x + w), y: Math.min(p.y, p.y + h), w: Math.max(1, Math.abs(w)), h: Math.max(1, Math.abs(h)) });
        }
      },
      (_ev, moved) => {
        if (!moved) {
          // Plain click: drop a default sized element centred on the click.
          const size = kind === 'line' ? { w: 320, h: 24 } : kind === 'sticky' ? { w: 360, h: 360 } : { w: 280, h: 280 };
          editor.doc.updateElement(startEl.id, { x: p.x - size.w / 2, y: p.y - size.h / 2, ...size });
        }
        if (kind === 'sticky') {
          const s = editor.s.elements[startEl.id];
          const note = makeText({ ...TEXT_PRESETS.body, text: 'Note', x: s.x + s.w * 0.1, y: s.y + s.w * 0.1, w: s.w * 0.8, fontSize: Math.max(18, s.w * 0.08) });
          const gid = startEl.id + 'g';
          editor.doc.addElement(pageId, { ...note, groupId: gid });
          editor.doc.updateElement(startEl.id, { groupId: gid });
          editor.ui.set({ selection: [note.id], editingTextId: note.id });
        }
        editor.ui.set({ tool: 'select' });
      },
      0,
    );
  };

  // ---------- freehand ----------
  const startDraw = (p: Point, e: React.PointerEvent) => {
    const settings = editor.state.draw;
    if (settings.tool === 'eraser') {
      editor.doc.undo.stopCapturing();
      const erase = (ev: { clientX: number; clientY: number; target: EventTarget | null }) => {
        const node = document.elementFromPoint(ev.clientX, ev.clientY);
        const id = hitId(node);
        if (id && editor.s.elements[id]?.type === 'draw') editor.doc.deleteElements([id]);
      };
      erase(e);
      startDrag(e, (ev) => erase(ev), undefined, 0);
      return;
    }
    const pts: Point[] = [p];
    const width = settings.tool === 'marker' ? settings.width * 2.2 : settings.tool === 'highlighter' ? settings.width * 3.4 : settings.width;
    setDrawing({ d: smoothPath(pts), color: settings.color, width });
    startDrag(
      e,
      (ev) => {
        pts.push(toLocal(ev.clientX, ev.clientY));
        setDrawing({ d: smoothPath(pts), color: settings.color, width });
      },
      () => {
        setDrawing(null);
        if (pts.length < 2) pts.push({ x: p.x + 0.5, y: p.y + 0.5 });
        const b = unionRects(pts.map((q) => ({ x: q.x, y: q.y, w: 0, h: 0 })))!;
        const pad = width;
        const ox = b.x - pad;
        const oy = b.y - pad;
        const w0 = b.w + pad * 2;
        const h0 = b.h + pad * 2;
        const local = pts.map((q) => ({ x: q.x - ox, y: q.y - oy }));
        const el = makeDraw({ x: ox, y: oy, w: w0, h: h0, w0, h0, paths: [{ d: smoothPath(local), color: settings.color, width, tool: settings.tool as 'pen' }] });
        editor.doc.undo.stopCapturing();
        editor.doc.addElement(pageId, el);
      },
      0,
    );
  };

  // ---------- select / move ----------
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('[data-overlay-control]')) return;
    if (editor.state.presenting) return;
    const p = toLocal(e.clientX, e.clientY);
    editor.setActivePage(pageId);
    if (tool === 'hand') return;
    if (editor.state.commentMode) {
      e.preventDefault();
      setDraft({ pageId, ...p });
      editor.ui.set({ commentMode: false, openCommentId: null });
      return;
    }
    if (editor.state.openCommentId) editor.ui.set({ openCommentId: null });
    if (tool === 'draw') return startDraw(p, e);
    if (tool === 'pen') return; // the pen layer has its own pointer handling
    if (tool !== 'select') return createAt(p, e);
    if (editor.state.cropId) {
      editor.ui.set({ cropId: null });
      return;
    }
    if (editor.state.editingTextId) {
      editor.ui.set({ editingTextId: null });
    }

    let id = pickId(e.clientX, e.clientY, e.target);
    if (!id && (e.target as HTMLElement).closest('[data-selection-body]')) id = editor.state.selection[0] ?? null;

    // On touch a finger scrolls the page unless it lands on what is already selected, like
    // Canva: tap to select, then drag. A second finger belongs to the viewport's pinch zoom.
    if (e.pointerType === 'touch' && !(id && editor.state.selection.includes(id))) {
      const scroller = (e.currentTarget as HTMLElement).closest('.viewport') as HTMLElement | null;
      const sl = scroller?.scrollLeft ?? 0;
      const st = scroller?.scrollTop ?? 0;
      startDrag(
        e,
        (_ev, dx, dy) => {
          if (!scroller || fingers.size > 1) return;
          scroller.scrollLeft = sl - dx;
          scroller.scrollTop = st - dy;
        },
        (_ev, moved) => {
          if (moved) return;
          if (id) editor.select([id]);
          else editor.clearSelection();
        },
        8,
      );
      return;
    }

    if (!id) {
      // Empty space: marquee selection.
      if (!e.shiftKey) editor.clearSelection();
      const base = e.shiftKey ? editor.state.selection : [];
      startDrag(
        e,
        (ev) => {
          const q = toLocal(ev.clientX, ev.clientY);
          const rect: Rect = { x: Math.min(p.x, q.x), y: Math.min(p.y, q.y), w: Math.abs(q.x - p.x), h: Math.abs(q.y - p.y) };
          const hits = editor.s.pages[pageId].elementIds.filter((eid) => {
            const el = editor.s.elements[eid];
            return el && !el.locked && !el.hidden && rectsIntersect(rect, aabb(el));
          });
          const expanded = [...new Set([...base, ...hits.flatMap((h) => editor.groupMembers(h))])];
          editor.ui.set({ marquee: { pageId, rect }, selection: expanded });
        },
        () => editor.ui.set({ marquee: null }),
      );
      return;
    }

    const already = editor.state.selection.includes(id);
    if (e.shiftKey) {
      editor.select([id], { additive: true });
      return;
    }
    if (!already) editor.select([id]);
    const ids = editor.state.selection;
    const movable = ids.filter((i) => !editor.s.elements[i]?.locked);
    if (!movable.length) return;
    beginMove(e, p, movable, e.altKey, already && ids.length === 1 ? id : null);
  };

  const beginMove = (e: React.PointerEvent, p: Point, ids: Id[], duplicate: boolean, clickedSelected: Id | null = null) => {
    let moving = ids;
    let starts = moving.map((i) => editor.s.elements[i]);
    let duplicated = false;
    const others = editor.s.pages[pageId].elementIds.filter((i) => !ids.includes(i)).map((i) => editor.s.elements[i]).filter(Boolean);
    const targets = collectTargets(pageId, { w: W, h: H }, others, editor.state.pageGuides[pageId]);
    const startBox = unionRects(starts.map((s) => aabb(s)))!;
    editor.doc.undo.stopCapturing();
    // Dragging a connector away from its elements unsticks it.
    const unstick: Record<Id, Partial<Element>> = {};
    for (const s of starts) {
      if (s.type !== 'line') continue;
      if (s.from && !ids.includes(s.from)) unstick[s.id] = { ...unstick[s.id], from: undefined } as Partial<Element>;
      if (s.to && !ids.includes(s.to)) unstick[s.id] = { ...unstick[s.id], to: undefined } as Partial<Element>;
    }
    let unstuck = duplicate || !Object.keys(unstick).length;
    startDrag(
      e,
      (ev) => {
        if (!unstuck) {
          unstuck = true;
          editor.doc.updateElements(unstick);
        }
        if (duplicate && !duplicated) {
          duplicated = true;
          const groups = new Map<Id, Id>();
          const copies = cloneElements(starts, groups);
          editor.doc.addElements(pageId, copies);
          moving = copies.map((c) => c.id);
          starts = copies;
          editor.ui.set({ selection: moving });
        }
        const q = toLocal(ev.clientX, ev.clientY);
        let dx = q.x - p.x;
        let dy = q.y - p.y;
        if (ev.shiftKey) {
          if (Math.abs(dx) > Math.abs(dy)) dy = 0;
          else dx = 0;
        }
        let guidesOut: typeof guides = [];
        if (editor.state.snap && !ev.metaKey && !ev.ctrlKey) {
          const moved = { ...startBox, x: startBox.x + dx, y: startBox.y + dy };
          const snap = snapBox(moved, targets, 6 / zoom, { x: !ev.shiftKey || dx !== 0, y: !ev.shiftKey || dy !== 0 });
          dx += snap.dx;
          dy += snap.dy;
          guidesOut = snap.guides;
        }
        const patches: Record<Id, Partial<Element>> = {};
        starts.forEach((s) => (patches[s.id] = { x: s.x + dx, y: s.y + dy }));
        editor.doc.updateElements(patches);
        editor.ui.set({ guides: guidesOut, dragging: true });
      },
      (ev, moved) => {
        editor.ui.set({ guides: [], dragging: false });
        if (!moved) {
          // A second click on a selected text box starts editing it.
          if (clickedSelected && editor.s.elements[clickedSelected]?.type === 'text') editor.ui.set({ editingTextId: clickedSelected });
          return;
        }
        // Dropped over another page: move the elements there.
        const under = document.elementFromPoint(ev.clientX, ev.clientY)?.closest('[data-page-id]');
        const target = under?.getAttribute('data-page-id');
        if (target && target !== pageId) {
          const r = under!.getBoundingClientRect();
          const local = { x: (ev.clientX - r.left) / zoom, y: (ev.clientY - r.top) / zoom };
          const q = toLocal(ev.clientX, ev.clientY);
          const shift = { x: local.x - q.x, y: local.y - q.y };
          const patches: Record<Id, Partial<Element>> = {};
          moving.forEach((i) => {
            const el = editor.s.elements[i];
            patches[i] = { x: el.x + shift.x, y: el.y + shift.y };
          });
          editor.doc.transact(() => {
            editor.doc.moveElementsToPage(moving, target);
            editor.doc.updateElements(patches);
          });
          editor.ui.set({ activePageId: target, selection: moving });
        }
      },
      // A finger needs a bigger dead zone than a mouse, or a light touch nudges the element.
      e.pointerType === 'touch' ? 10 : 3,
    );
  };

  const onDoubleClick = (e: React.MouseEvent) => {
    // Over a group the selection box sits on top; look through it for the element.
    let id = pickId(e.clientX, e.clientY, e.target);
    if (!id && (e.target as HTMLElement).closest?.('[data-selection-body]')) {
      for (const node of document.elementsFromPoint(e.clientX, e.clientY)) {
        id = hitId(node);
        if (id) break;
      }
    }
    if (!id) return;
    const el = editor.s.elements[id];
    if (!el || el.locked) return;
    if (el.groupId && editor.state.selection.length > 1) {
      editor.select([id], { expandGroups: false });
      return;
    }
    if (el.type === 'text') editor.ui.set({ selection: [id], editingTextId: id });
    else if (el.type === 'image' && el.assetId) editor.ui.set({ selection: [id], cropId: id });
    else if (el.type === 'chart') editor.openPanel('chart');
    else if (el.type === 'table') editor.openPanel('table');
    else if (el.type === 'shape' && el.nodes?.length) editor.editPoints(id);
    else if (el.type === 'shape') editor.textInShape(id);
  };

  const onContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    // A right click inside the selection box keeps the whole selection.
    const onBox = !!(e.target as HTMLElement).closest?.('[data-selection-body]') && editor.state.selection.length > 0;
    const id = onBox ? editor.state.selection[0] : pickId(e.clientX, e.clientY, e.target);
    if (id && !editor.state.selection.includes(id)) editor.select([id]);
    if (!id) editor.clearSelection();
    window.dispatchEvent(new CustomEvent('tavla:contextmenu', { detail: { x: e.clientX, y: e.clientY, pageId, empty: !id } }));
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const collab = activeCollab();
    if (collab) collab.setCursor({ pageId, ...toLocal(e.clientX, e.clientY) });
    if (editor.state.dragging || tool !== 'select') return;
    const id = pickId(e.clientX, e.clientY, e.target);
    if (id !== editor.state.hoverId) editor.ui.set({ hoverId: id });
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const p = toLocal(e.clientX, e.clientY);
    editor.setActivePage(pageId);
    const upload = e.dataTransfer.getData('application/x-tavla-upload');
    if (upload) {
      const a = (await listUploads()).find((x) => x.id === upload);
      if (a) {
        if (!editor.doc.getAsset(a.id)) editor.doc.addAsset(a);
        const overId = pickId(e.clientX, e.clientY, document.elementFromPoint(e.clientX, e.clientY));
        const over = overId ? editor.s.elements[overId] : null;
        if (over?.type === 'image') editor.replaceImage(over.id, a.id, a.width, a.height);
        else editor.addImageAsset(a.id, a.width, a.height, p);
      }
      return;
    }
    const lib = e.dataTransfer.getData(LIBRARY_MIME);
    if (lib) {
      const overId = pickId(e.clientX, e.clientY, document.elementFromPoint(e.clientX, e.clientY));
      dropLibraryItem(editor, JSON.parse(lib), p, overId);
      return;
    }
    if (e.dataTransfer.files.length) {
      const overId = pickId(e.clientX, e.clientY, document.elementFromPoint(e.clientX, e.clientY));
      await importFiles(editor, [...e.dataTransfer.files], { at: p, replaceId: overId });
    }
  };

  const hover = hoverId && !selection.includes(hoverId) && editor.s.elementPage[hoverId] === pageId ? elements[hoverId] : null;
  const cursor = commentMode ? 'copy' : tool === 'text' ? 'text' : tool === 'draw' ? 'crosshair' : tool === 'hand' ? 'grab' : tool !== 'select' ? 'crosshair' : undefined;

  return (
    <div
      ref={ref}
      className="page-stage"
      data-page-id={pageId}
      style={{ width: W * zoom, height: H * zoom, cursor }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerLeave={() => editor.state.hoverId && editor.ui.set({ hoverId: null })}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      }}
      onDrop={onDrop}
    >
      <RenderContext.Provider value={env}>
        <PageView page={page} elements={elements} width={W} height={H} displayWidth={W * zoom} displayHeight={H * zoom} />
      </RenderContext.Provider>
      <div className="page-overlay">
        {page.elementIds.length === 0 && tool === 'select' && page.background.type === 'solid' ? (
          <div className="empty-sheet" style={{ fontSize: Math.max(13, Math.min(16, W * zoom * 0.024)) }}>
            <span>Empty page. Add a template, drop in a photo, or press T to type.</span>
          </div>
        ) : null}
        {showGrid ? <div className="page-grid" style={{ backgroundSize: `${(W / 12) * zoom}px ${(W / 12) * zoom}px` }} /> : null}
        {hover ? <HoverOutline el={hover} zoom={zoom} /> : null}
        {drawing ? (
          <svg className="draw-preview" viewBox={`0 0 ${W} ${H}`} width={W * zoom} height={H * zoom}>
            <path d={drawing.d} fill="none" stroke={drawing.color} strokeWidth={drawing.width} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
        {tool === 'pen' && activePageId === pageId ? <PenLayer key={penEditId ?? 'new'} pageId={pageId} zoom={zoom} W={W} H={H} toLocal={toLocal} /> : null}
        <RulerGuides pageId={pageId} zoom={zoom} W={W} H={H} />
        {guides.filter((g) => g.pageId === pageId).map((g, i) => (
          <GuideLine key={i} g={g} zoom={zoom} />
        ))}
        {marquee && marquee.pageId === pageId ? (
          <div
            className="marquee"
            style={{ left: marquee.rect.x * zoom, top: marquee.rect.y * zoom, width: marquee.rect.w * zoom, height: marquee.rect.h * zoom }}
          />
        ) : null}
        {onThisPage && !cropId ? <SelectionOverlay pageId={pageId} zoom={zoom} toLocal={toLocal} /> : null}
        {editingTextId && editor.s.elementPage[editingTextId] === pageId ? (
          <TextEditor el={elements[editingTextId] as TextElement} zoom={zoom} />
        ) : null}
        {cropId && editor.s.elementPage[cropId] === pageId ? <CropOverlay id={cropId} zoom={zoom} toLocal={toLocal} /> : null}
        <Peers pageId={pageId} zoom={zoom} />
        <CommentPins pageId={pageId} zoom={zoom} />
        {draft ? <CommentDraft at={draft} zoom={zoom} onDone={() => setDraft(null)} /> : null}
      </div>
    </div>
  );
});

function HoverOutline({ el, zoom }: { el: Element; zoom: number }) {
  return (
    <div
      className="hover-outline"
      style={{
        left: el.x * zoom,
        top: el.y * zoom,
        width: el.w * zoom,
        height: el.h * zoom,
        transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
      }}
    />
  );
}

function GuideLine({ g, zoom }: { g: import('../editor/state').Guide; zoom: number }) {
  const style: React.CSSProperties =
    g.axis === 'x'
      ? { left: g.pos * zoom, top: g.from * zoom, height: Math.max(1, (g.to - g.from) * zoom), width: 0 }
      : { top: g.pos * zoom, left: g.from * zoom, width: Math.max(1, (g.to - g.from) * zoom), height: 0 };
  return (
    <div className={`guide guide-${g.axis} guide-${g.kind}`} style={style}>
      {g.label ? <span className="guide-label">{g.label}</span> : null}
    </div>
  );
}

function RulerGuides({ pageId, zoom, W, H }: { pageId: Id; zoom: number; W: number; H: number }) {
  const guides = useUI((s) => s.pageGuides[pageId]);
  if (!guides) return null;
  return (
    <>
      {guides.x.map((x, i) => (
        <div key={`x${i}`} className="ruler-guide ruler-guide-x" style={{ left: x * zoom, height: H * zoom }} />
      ))}
      {guides.y.map((y, i) => (
        <div key={`y${i}`} className="ruler-guide ruler-guide-y" style={{ top: y * zoom, width: W * zoom }} />
      ))}
    </>
  );
}

function Peers({ pageId, zoom }: { pageId: Id; zoom: number }) {
  const peers = usePeers();
  const elements = useDoc((s) => s.elements);
  const elementPage = useDoc((s) => s.elementPage);
  return (
    <>
      {peers.map((p) => (
        <div key={p.id}>
          {(p.selection ?? []).map((id) => {
            const el = elements[id];
            if (!el || elementPage[id] !== pageId) return null;
            return (
              <div
                key={id}
                className="peer-selection"
                style={{ left: el.x * zoom, top: el.y * zoom, width: el.w * zoom, height: el.h * zoom, transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined, boxShadow: `0 0 0 1.5px ${p.color}` }}
              />
            );
          })}
          {p.cursor && p.cursor.pageId === pageId ? (
            <div className="peer-cursor" style={{ left: p.cursor.x * zoom, top: p.cursor.y * zoom, color: p.color }}>
              <svg width="18" height="18" viewBox="0 0 16 16" shapeRendering="crispEdges">
                <path d="M1 1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1H7v1h1v2H7v1H6v-2H5v-1H4v1H3v1H2v1H1z" fill="currentColor" stroke="#fff" strokeWidth="0.6" />
              </svg>
              <span style={{ background: p.color }}>{p.name}</span>
            </div>
          ) : null}
        </div>
      ))}
    </>
  );
}

