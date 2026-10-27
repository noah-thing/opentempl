import { useEffect, useRef, useState } from 'react';
import type { Element, VideoElement } from '../doc/types';
import { useEditor } from '../editor/Editor';
import { startDrag, useUI } from '../editor/hooks';
import { formatTime, grabFrame, loadVideo, mediaUrl } from '../io/media';
import { prepareImage } from '../io/upload';
import { Slider } from '../panels/controls';
import { Icon } from '../ui/icons';
import { Popover, usePopover } from '../ui/Popover';

// Toolbar for a video clip: play it in place, trim it on a filmstrip, sound and loop.
export function VideoTools({ el, TBtn, Div }: { el: VideoElement; TBtn: TBtnType; Div: () => React.ReactElement }) {
  const editor = useEditor();
  const playing = useUI((s) => s.playingVideoId === el.id);
  const trim = usePopover();
  const sound = usePopover();
  const len = Math.max(0, (el.trimEnd || el.duration) - el.trimStart);
  const set = (p: Partial<VideoElement>) => editor.update(el.id, p as Partial<Element>);

  useEffect(() => {
    const on = (e: Event) => (e as CustomEvent).detail === el.id && editor.state.playingVideoId === el.id && editor.ui.set({ playingVideoId: null });
    window.addEventListener('tavla:clip-ended', on);
    return () => window.removeEventListener('tavla:clip-ended', on);
  }, [editor, el.id]);

  // Stop previewing when the clip is deselected or leaves the page.
  useEffect(() => () => {
    if (editor.state.playingVideoId === el.id) editor.ui.set({ playingVideoId: null });
  }, [editor, el.id]);

  return (
    <>
      <TBtn icon={playing ? 'pause' : 'play'} label={playing ? 'Pause' : 'Play'} onClick={() => editor.ui.set({ playingVideoId: playing ? null : el.id })} />
      <TBtn icon="trim" label={formatTime(len)} title="Trim" onClick={trim.toggle} />
      <TBtn icon={el.muted ? 'mute' : 'sound'} title="Sound" onClick={sound.toggle} />
      <TBtn icon="loop" title={el.loop ? 'Loops (click to play once)' : 'Plays once (click to loop)'} on={el.loop} onClick={() => set({ loop: !el.loop })} />
      <Div />
      {trim.anchor ? (
        <Popover anchor={trim.anchor} onClose={trim.close} width={420}>
          <Trimmer el={el} />
        </Popover>
      ) : null}
      {sound.anchor ? (
        <Popover anchor={sound.anchor} onClose={sound.close} width={260}>
          <div style={{ padding: 14 }}>
            <div className="row-between" style={{ marginBottom: 10 }}>
              <span className="label">Sound</span>
              <div className="seg">
                <button className={!el.muted ? 'is-on' : ''} onClick={() => set({ muted: false })}>
                  On
                </button>
                <button className={el.muted ? 'is-on' : ''} onClick={() => set({ muted: true })}>
                  Off
                </button>
              </div>
            </div>
            <div className="label">Volume</div>
            <Slider value={Math.round(el.volume * 100)} min={0} max={100} unit="%" onChange={(n) => set({ volume: n / 100, muted: n === 0 })} />
          </div>
        </Popover>
      ) : null}
    </>
  );
}

type TBtnType = (p: { icon?: string; label?: string; title?: string; on?: boolean; onClick?: (e: React.MouseEvent) => void }) => React.ReactElement;

const STRIP = 9;

function Trimmer({ el }: { el: VideoElement }) {
  const editor = useEditor();
  const [frames, setFrames] = useState<string[]>([]);
  const [range, setRange] = useState({ a: el.trimStart, b: el.trimEnd || el.duration });
  const bar = useRef<HTMLDivElement>(null);
  const dur = el.duration || 1;

  // A filmstrip of the whole clip, grabbed once when the trimmer opens.
  useEffect(() => {
    let live = true;
    const made: string[] = [];
    (async () => {
      const src = await mediaUrl(el.mediaId);
      if (!src) return;
      const v = await loadVideo(src);
      for (let i = 0; i < STRIP && live; i++) {
        const b = await grabFrame(v, ((i + 0.5) / STRIP) * dur, 120, 'image/jpeg');
        const u = URL.createObjectURL(b);
        made.push(u);
        if (live) setFrames([...made]);
      }
      v.removeAttribute('src');
      v.load();
    })().catch(() => {});
    return () => {
      live = false;
      made.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [el.mediaId, dur]);

  const drag = (which: 'a' | 'b' | 'both') => (e: React.PointerEvent) => {
    e.preventDefault();
    const r = bar.current!.getBoundingClientRect();
    const start = { ...range };
    const x0 = e.clientX;
    let next = start;
    startDrag(
      e,
      (ev) => {
        const dt = ((ev.clientX - x0) / r.width) * dur;
        const minLen = Math.min(0.5, dur);
        if (which === 'a') next = { a: clamp(start.a + dt, 0, start.b - minLen), b: start.b };
        else if (which === 'b') next = { a: start.a, b: clamp(start.b + dt, start.a + minLen, dur) };
        else {
          const shift = clamp(dt, -start.a, dur - start.b);
          next = { a: start.a + shift, b: start.b + shift };
        }
        setRange(next);
      },
      () => commit(next),
      0,
    );
  };

  const commit = async (r: { a: number; b: number }) => {
    const a = round(r.a);
    const b = round(r.b);
    editor.update(el.id, { trimStart: a, trimEnd: b } as Partial<Element>);
    // The poster follows the new first frame, so exports and thumbnails match.
    if (Math.abs(a - el.trimStart) < 0.01) return;
    const src = await mediaUrl(el.mediaId);
    if (!src) return;
    const v = await loadVideo(src);
    const poster = await prepareImage(await grabFrame(v, a), 'poster');
    editor.doc.addAsset(poster);
    editor.update(el.id, { posterId: poster.id } as Partial<Element>);
  };

  const pa = (range.a / dur) * 100;
  const pb = (range.b / dur) * 100;
  return (
    <div className="trimmer">
      <div className="row-between" style={{ marginBottom: 10 }}>
        <span className="label" style={{ margin: 0 }}>
          Trim
        </span>
        <span className="trim-time">
          {formatTime(range.a)} to {formatTime(range.b)} · {(range.b - range.a).toFixed(1)} s
        </span>
      </div>
      <div className="trim-bar" ref={bar}>
        <div className="trim-strip">
          {Array.from({ length: STRIP }, (_, i) => (
            <span key={i} style={{ backgroundImage: frames[i] ? `url(${frames[i]})` : undefined }} />
          ))}
        </div>
        <div className="trim-shade" style={{ left: 0, width: `${pa}%` }} />
        <div className="trim-shade" style={{ left: `${pb}%`, right: 0 }} />
        <div className="trim-window" style={{ left: `${pa}%`, width: `${pb - pa}%` }} onPointerDown={drag('both')}>
          <span className="trim-grip is-a" onPointerDown={(e) => (e.stopPropagation(), drag('a')(e))} />
          <span className="trim-grip is-b" onPointerDown={(e) => (e.stopPropagation(), drag('b')(e))} />
        </div>
      </div>
      <div className="row-between" style={{ marginTop: 10 }}>
        <span className="hint" style={{ margin: 0 }}>
          Drag the ends, or the middle to slide the whole cut.
        </span>
        <button
          className="btn btn-sm btn-outline"
          onClick={() => {
            setRange({ a: 0, b: dur });
            commit({ a: 0, b: dur });
          }}
        >
          <Icon name="undo" size={14} /> Whole clip
        </button>
      </div>
    </div>
  );
}

const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const round = (n: number) => Math.round(n * 100) / 100;
