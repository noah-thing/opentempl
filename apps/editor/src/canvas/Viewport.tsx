import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useEditor } from '../editor/Editor';
import { useDoc, useUI } from '../editor/hooks';
import { PageStage } from './PageStage';
import { Icon } from '../ui/icons';
import type { Id } from '../doc/types';

export const ZOOM_MIN = 0.1;
export const ZOOM_MAX = 8;

export function Viewport() {
  const editor = useEditor();
  const pageOrder = useDoc((s) => s.pageOrder);
  const meta = useDoc((s) => ({ w: s.meta.width, h: s.meta.height }));
  const { zoom, autoFit, activePageId, view, tool } = useUI((s) => ({
    zoom: s.zoom,
    autoFit: s.autoFit,
    activePageId: s.activePageId,
    view: s.view,
    tool: s.tool,
  }));
  const ref = useRef<HTMLDivElement>(null);
  const [panning, setPanning] = useState(false);
  const space = useRef(false);

  // Fit the page into the viewport whenever its size or the window changes.
  const fit = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const pad = view === 'grid' ? 120 : 180;
    const z = Math.min((el.clientWidth - 128) / meta.w, (el.clientHeight - pad) / meta.h);
    editor.ui.set({ zoom: Math.max(ZOOM_MIN, Math.min(view === 'grid' ? 0.4 : 2, z * (view === 'grid' ? 0.42 : 1))) });
  }, [editor, meta.w, meta.h, view]);

  useLayoutEffect(() => {
    if (!autoFit) return;
    fit();
    const ro = new ResizeObserver(() => editor.state.autoFit && fit());
    if (ref.current) ro.observe(ref.current);
    return () => ro.disconnect();
  }, [autoFit, fit, editor]);

  useEffect(() => {
    const onFit = () => {
      editor.ui.set({ autoFit: true });
      fit();
      requestAnimationFrame(() => {
        const node = ref.current?.querySelector(`[data-page-wrap="${editor.state.activePageId}"]`) as HTMLElement | null;
        if (node && ref.current) ref.current.scrollTo({ top: Math.max(0, node.offsetTop - 92), left: 0 });
      });
    };
    window.addEventListener('tavla:fit', onFit);
    return () => window.removeEventListener('tavla:fit', onFit);
  }, [editor, fit]);

  // Zoom around the pointer with ctrl/cmd + wheel or trackpad pinch.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const z0 = editor.state.zoom;
      const z1 = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z0 * Math.exp(-Math.max(-60, Math.min(60, e.deltaY)) * 0.006)));
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left + el.scrollLeft;
      const my = e.clientY - rect.top + el.scrollTop;
      editor.ui.set({ zoom: z1, autoFit: false });
      requestAnimationFrame(() => {
        el.scrollLeft = mx * (z1 / z0) - (e.clientX - rect.left);
        el.scrollTop = my * (z1 / z0) - (e.clientY - rect.top);
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [editor]);

  // Space bar pans, like every design tool.
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isTyping(e)) {
        space.current = true;
        if (ref.current) ref.current.style.cursor = 'grab';
        e.preventDefault();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        space.current = false;
        if (ref.current) ref.current.style.cursor = '';
      }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  const onPointerDownCapture = (e: React.PointerEvent) => {
    if (!(space.current || tool === 'hand' || e.button === 1)) return;
    e.preventDefault();
    e.stopPropagation();
    const el = ref.current!;
    const sx = e.clientX;
    const sy = e.clientY;
    const sl = el.scrollLeft;
    const st = el.scrollTop;
    setPanning(true);
    const move = (ev: PointerEvent) => {
      el.scrollLeft = sl - (ev.clientX - sx);
      el.scrollTop = st - (ev.clientY - sy);
    };
    const up = () => {
      setPanning(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const onBackground = (e: React.PointerEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('pages')) editor.clearSelection();
  };

  // Scroll the active page into view when it changes from elsewhere (strip, shortcuts).
  const lastActive = useRef<Id | null>(null);
  useEffect(() => {
    if (!activePageId || lastActive.current === activePageId) return;
    const prev = lastActive.current;
    lastActive.current = activePageId;
    if (!prev) return;
    const node = ref.current?.querySelector(`[data-page-wrap="${activePageId}"]`) as HTMLElement | null;
    const r = node?.getBoundingClientRect();
    const v = ref.current?.getBoundingClientRect();
    if (node && r && v && (r.bottom < v.top + 60 || r.top > v.bottom - 60)) node.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [activePageId]);

  return (
    <div
      ref={ref}
      className={`viewport ${panning ? 'is-panning' : ''}`}
      onPointerDownCapture={onPointerDownCapture}
      onPointerDown={onBackground}
      tabIndex={-1}
    >
      <div className={`pages ${view === 'grid' ? 'is-grid' : ''}`} onPointerDown={onBackground}>
        {pageOrder.map((pid, i) => (
          <PageBlock key={pid} pageId={pid} index={i} total={pageOrder.length} zoom={zoom} active={pid === activePageId} />
        ))}
        {view === 'scroll' ? (
          <button className="add-page" style={{ width: meta.w * zoom }} onClick={() => editor.addPage(pageOrder[pageOrder.length - 1])}>
            <Icon name="plus" /> Add page
          </button>
        ) : null}
      </div>
    </div>
  );
}

function PageBlock({ pageId, index, total, zoom, active }: { pageId: Id; index: number; total: number; zoom: number; active: boolean }) {
  const editor = useEditor();
  const name = useDoc((s) => s.pages[pageId]?.name ?? '');
  const hidden = useDoc((s) => !!s.pages[pageId]?.hidden);
  return (
    <div className={`page-wrap ${active ? 'is-active' : ''} ${hidden ? 'is-hidden' : ''}`} data-page-wrap={pageId}>
      <div className="page-head">
        <span className="num">{String(index + 1).padStart(2, '0')}</span>
        <input
          className="name"
          value={name}
          placeholder="Add page title"
          onChange={(e) => editor.doc.updatePage(pageId, { name: e.target.value })}
          onKeyDown={(e) => e.stopPropagation()}
        />
        <div className="actions">
          <button className="icon-btn" title="Move up" disabled={index === 0} onClick={() => editor.doc.movePage(pageId, index - 1)}>
            <Icon name="chevron-up" />
          </button>
          <button className="icon-btn" title="Move down" disabled={index === total - 1} onClick={() => editor.doc.movePage(pageId, index + 1)}>
            <Icon name="chevron-down" />
          </button>
          <button className="icon-btn" title={hidden ? 'Show page in present and export' : 'Hide page from present and export'} onClick={() => editor.doc.updatePage(pageId, { hidden: !hidden })}>
            <Icon name={hidden ? 'eye-off' : 'eye'} />
          </button>
          <button className="icon-btn" title="Duplicate page" onClick={() => editor.duplicatePage(pageId)}>
            <Icon name="duplicate" />
          </button>
          <button className="icon-btn" title="Delete page" disabled={total <= 1} onClick={() => editor.deletePage(pageId)}>
            <Icon name="trash" />
          </button>
          <button className="icon-btn" title="Add page after" onClick={() => editor.addPage(pageId)}>
            <Icon name="page-add" />
          </button>
        </div>
      </div>
      <PageStage pageId={pageId} zoom={zoom} />
    </div>
  );
}

export function isTyping(e: KeyboardEvent | React.KeyboardEvent) {
  const t = e.target as HTMLElement;
  return !!t && (t.isContentEditable || t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT');
}
