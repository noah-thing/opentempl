import { useEffect, useMemo, useRef, useState } from 'react';
import { useEditor } from '../editor/Editor';
import { useDoc, useFontsVersion, useUI } from '../editor/hooks';
import { PageView } from '../render/PageView';
import { RenderContext, type RenderEnv } from '../render/RenderContext';
import { pageAnimationLength } from '../render/animate';
import { Icon } from '../ui/icons';
import { presentChannel } from './Presenter';
import { mediaUrl } from '../io/media';
import { safeLink } from '../render/safe';

export function Present() {
  const editor = useEditor();
  const allPages = useDoc((s) => s.pageOrder);
  const hiddenMap = useDoc((s) => s.pages);
  const order = allPages.filter((id) => !hiddenMap[id]?.hidden);
  const pages = useDoc((s) => s.pages);
  const elements = useDoc((s) => s.elements);
  const meta = useDoc((s) => s.meta);
  const start = useUI((s) => s.presentStart);
  const fontsVersion = useFontsVersion();
  const [index, setIndex] = useState(Math.max(0, Math.min(order.length - 1, start)));
  const [time, setTime] = useState(0);
  const [cursor, setCursor] = useState(true);
  const [auto, setAuto] = useState(() => editor.state.presentAuto);
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const root = useRef<HTMLDivElement>(null);
  const page = pages[order[index]];

  const exit = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    editor.ui.set({ presenting: false, presentAuto: false });
  };
  const go = (d: number) => setIndex((i) => Math.max(0, Math.min(order.length - 1, i + d)));

  // Presenter view in another window steers this one, and follows it.
  useEffect(() => {
    const ch = presentChannel(editor.s.meta.id);
    ch.onmessage = (e) => {
      if (typeof e.data?.go === 'number') setIndex(e.data.go);
      if (e.data?.hello) ch.postMessage({ index });
    };
    return () => ch.close();
  }, [editor, index]);
  useEffect(() => {
    const ch = presentChannel(editor.s.meta.id);
    ch.postMessage({ index });
    ch.close();
  }, [editor, index]);

  // The soundtrack runs under the whole presentation, looping from its start point.
  const track = meta.soundtrack;
  useEffect(() => {
    if (!track) return;
    const a = new Audio();
    let live = true;
    mediaUrl(track.mediaId).then((src) => {
      if (!live || !src) return;
      a.src = src;
      a.volume = track.volume;
      a.currentTime = track.trimStart;
      a.play().catch(() => {});
    });
    a.onended = () => {
      a.currentTime = track.trimStart;
      a.play().catch(() => {});
    };
    return () => {
      live = false;
      // A short fade instead of a hard stop when the presentation ends.
      const v0 = a.volume;
      let k = 0;
      const t = setInterval(() => {
        k++;
        a.volume = Math.max(0, v0 * (1 - k / 10));
        if (k >= 10) {
          clearInterval(t);
          a.pause();
          a.removeAttribute('src');
        }
      }, 40);
    };
  }, [track?.mediaId, track?.trimStart]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    root.current?.requestFullscreen?.().catch(() => {});
    const onFs = () => !document.fullscreenElement && editor.ui.set({ presenting: false, presentAuto: false });
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    document.addEventListener('fullscreenchange', onFs);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('fullscreenchange', onFs);
      window.removeEventListener('resize', onResize);
    };
  }, [editor]);

  // Animation clock: restarts on every page.
  useEffect(() => {
    if (!page) return;
    const len = pageAnimationLength(page.elementIds.map((id) => elements[id]?.anim));
    const t0 = performance.now();
    let raf = 0;
    const tick = () => {
      const t = performance.now() - t0;
      setTime(t);
      if (t < len + 50) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    let timer = 0;
    if (auto) timer = window.setTimeout(() => (index < order.length - 1 ? go(1) : setAuto(false)), Math.max(page.duration * 1000, len + 600));
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, auto]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === 'Escape') exit();
      if (['ArrowRight', 'ArrowDown', ' ', 'PageDown', 'Enter'].includes(e.key)) go(1);
      if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(e.key)) go(-1);
      if (e.key === 'Home') setIndex(0);
      if (e.key === 'End') setIndex(order.length - 1);
      if (e.key.toLowerCase() === 'a') setAuto((a) => !a);
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.length]);

  useEffect(() => {
    let t = 0;
    const onMove = () => {
      setCursor(true);
      window.clearTimeout(t);
      t = window.setTimeout(() => setCursor(false), 1800);
    };
    window.addEventListener('pointermove', onMove);
    onMove();
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  const env: RenderEnv = useMemo(
    () => ({ assetUrl: (id) => editor.doc.assetUrl(id), assetSize: () => undefined, fontsVersion, mode: 'present', time, idPrefix: 'present-' }),
    [editor, fontsVersion, time],
  );
  if (!page) return null;
  const scale = Math.min(size.w / meta.width, size.h / meta.height);

  const onClick = (e: React.MouseEvent) => {
    // Links on elements open; anything else advances.
    const id = (e.target as globalThis.Element).closest?.('[data-id]')?.getAttribute('data-id');
    const link = id ? safeLink(elements[id]?.link) : null;
    if (link) {
      window.open(link, '_blank', 'noopener');
      return;
    }
    go(e.clientX < size.w * 0.25 ? -1 : 1);
  };

  return (
    <div ref={root} className={`present ${cursor ? 'show-cursor' : ''}`} onClick={onClick}>
      <div key={index} className={`present-stage ${page.transition !== 'none' ? `pt-${page.transition}` : ''}`} style={{ width: meta.width * scale, height: meta.height * scale }}>
        <RenderContext.Provider value={env}>
          <PageView page={page} elements={elements} width={meta.width} height={meta.height} displayWidth={meta.width * scale} displayHeight={meta.height * scale} />
        </RenderContext.Provider>
      </div>
      <div className="present-controls" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => go(-1)} title="Previous">
          <Icon name="chevron-left" />
        </button>
        <span className="count">
          {index + 1} of {order.length}
        </span>
        <button onClick={() => go(1)} title="Next">
          <Icon name="chevron-right" />
        </button>
        <button
          onClick={() => window.open(`${window.location.pathname}#/presenter/${editor.s.meta.id}`, 'tavla-presenter', 'width=1280,height=760')}
          title="Presenter view with notes and a timer"
        >
          <Icon name="notes" />
        </button>
        <button onClick={() => setAuto((a) => !a)} title="Autoplay (A)" style={{ background: auto ? 'rgba(255,255,255,.18)' : undefined }}>
          <Icon name="play" />
        </button>
        <button onClick={exit} title="Exit (Esc)">
          <Icon name="close" />
        </button>
      </div>
      {page.notes && cursor ? (
        <div
          style={{ position: 'fixed', left: 20, bottom: 74, maxWidth: 420, color: '#d9d9e0', background: 'rgba(30,30,34,.86)', padding: '10px 14px', borderRadius: 12, fontSize: 14, lineHeight: 1.5 }}
          onClick={(e) => e.stopPropagation()}
        >
          {page.notes}
        </div>
      ) : null}
    </div>
  );
}
