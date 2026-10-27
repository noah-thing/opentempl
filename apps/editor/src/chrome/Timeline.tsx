import { useMemo, useRef, useState } from 'react';
import { useEditor } from '../editor/Editor';
import { startDrag, useDoc, useFontsVersion, useUI } from '../editor/hooks';
import { clipLength, formatTime } from '../io/media';
import { pageAnimationLength } from '../render/animate';
import { PageView } from '../render/PageView';
import { RenderContext, type RenderEnv } from '../render/RenderContext';
import { Icon } from '../ui/icons';

// The design as a video: each page is a block as long as it plays, with its
// transition on the seam and the soundtrack underneath. Drag a block's right
// edge to retime it; click anywhere to jump to that page; play runs the
// design full screen from the current page.
export function Timeline() {
  const editor = useEditor();
  const order = useDoc((s) => s.pageOrder);
  const pages = useDoc((s) => s.pages);
  const elements = useDoc((s) => s.elements);
  const meta = useDoc((s) => s.meta);
  const active = useUI((s) => s.activePageId);
  const fontsVersion = useFontsVersion();
  const [pps, setPps] = useState(36); // pixels per second
  const [live, setLive] = useState<{ id: string; d: number } | null>(null);
  const track = useRef<HTMLDivElement>(null);
  const env: RenderEnv = useMemo(
    () => ({ assetUrl: (id) => editor.doc.assetUrl(id), assetSize: () => undefined, fontsVersion, mode: 'thumb', idPrefix: 'tl-' }),
    [editor, fontsVersion],
  );

  const shown = order.filter((id) => pages[id] && !pages[id].hidden);
  const length = (id: string) => (live?.id === id ? live.d : pages[id].duration);
  const total = shown.reduce((a, id) => a + length(id), 0);
  const thumbH = 44;
  const thumbW = (meta.width / meta.height) * thumbH;
  const track_ = meta.soundtrack;
  const peaks = track_ ? track_.peaks.slice(Math.floor((track_.trimStart / track_.duration) * track_.peaks.length)) : [];

  const retime = (id: string) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const d0 = pages[id].duration;
    let d = d0;
    startDrag(
      e,
      (_ev, dx) => {
        d = Math.max(0.5, Math.round((d0 + dx / pps) * 10) / 10);
        setLive({ id, d });
      },
      () => {
        setLive(null);
        if (d !== d0) editor.doc.updatePage(id, { duration: d });
      },
      0,
    );
  };

  // Shortest a page can sensibly be: its animations and video clips.
  const floor = (id: string) => {
    const els = pages[id].elementIds.map((e) => elements[e]).filter(Boolean);
    const anim = pageAnimationLength(els.map((e) => e.anim)) / 1000;
    const clip = Math.max(0, ...els.map((e) => (e.type === 'video' ? clipLength(e) : 0)));
    return Math.max(anim, clip);
  };

  let t = 0;
  return (
    <div className="timeline">
      <div className="tl-head">
        <button
          className="track-play"
          title="Play from this page"
          onClick={() => editor.ui.set({ presenting: true, presentAuto: true, presentStart: Math.max(0, shown.indexOf(active ?? '')) })}
        >
          <Icon name="play" />
        </button>
        <span className="tl-total">
          {shown.length} {shown.length === 1 ? 'page' : 'pages'} · {formatTime(total)}
        </span>
        <div style={{ flex: 1 }} />
        <span className="hint" style={{ margin: 0 }}>
          Drag the end of a page to change how long it plays
        </span>
        <input type="range" min={12} max={120} value={pps} onChange={(e) => setPps(+e.target.value)} aria-label="Timeline zoom" style={{ width: 110, ['--fill' as string]: `${((pps - 12) / 108) * 100}%` }} />
      </div>
      <div className="tl-scroll">
        <div className="tl-track" ref={track} style={{ width: Math.max(total * pps + 40, 200) }}>
          <RenderContext.Provider value={env}>
            {shown.map((id, i) => {
              const d = length(id);
              const left = t * pps;
              t += d;
              const min = floor(id);
              const clips = pages[id].elementIds.some((e) => elements[e]?.type === 'video');
              return (
                <div
                  key={id}
                  className={`tl-page ${id === active ? 'is-on' : ''}`}
                  style={{ left, width: d * pps }}
                  onClick={() => editor.ui.set({ activePageId: id, selection: [] })}
                  title={`Page ${order.indexOf(id) + 1}, ${d.toFixed(1)} s`}
                >
                  <div className="tl-thumb" style={{ width: Math.min(thumbW, d * pps - 10), height: thumbH }}>
                    <PageView page={pages[id]} elements={elements} width={meta.width} height={meta.height} displayWidth={thumbW} displayHeight={thumbH} />
                  </div>
                  <span className="tl-label">
                    {order.indexOf(id) + 1}
                    {clips ? <Icon name="video" size={12} /> : null}
                    <b>{d.toFixed(1)} s</b>
                  </span>
                  {min > d + 0.05 ? <span className="tl-short" style={{ left: d * pps - 3 }} title={`Its animations and clips need ${min.toFixed(1)} s`} /> : null}
                  {i > 0 && pages[id].transition !== 'none' ? <span className="tl-seam" title={`${pages[id].transition} transition`} /> : null}
                  <span className="tl-grip" onPointerDown={retime(id)} />
                </div>
              );
            })}
          </RenderContext.Provider>
          {track_ ? (
            <div className="tl-sound" style={{ width: total * pps }} title={track_.name}>
              <svg viewBox={`0 0 ${Math.max(1, peaks.length)} 100`} preserveAspectRatio="none" style={{ width: ((track_.duration - track_.trimStart) / Math.max(0.1, total)) * 100 + '%' }}>
                {peaks.map((p, i) => (
                  <rect key={i} x={i + 0.2} y={50 - Math.max(3, p * 90) / 2} width={0.6} height={Math.max(3, p * 90)} />
                ))}
              </svg>
              <span>
                <Icon name="music" size={12} /> {track_.name}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
