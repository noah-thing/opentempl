import { useEffect, useRef, useState } from 'react';
import type { Soundtrack } from '../doc/types';
import { useEditor } from '../editor/Editor';
import { startDrag, useDoc } from '../editor/hooks';
import { formatTime, mediaUrl } from '../io/media';
import { importSoundtrack, pickFiles } from '../io/upload';
import { Eyes } from '../ui/Logo';
import { Icon } from '../ui/icons';
import { Section, Slider } from './controls';
import { TONES, renderTone } from '../tools/tones';

// The design's soundtrack: one song or voice over under every page. It plays
// in Present and is mixed into MP4 exports, under the sound of any video clips.
export default function AudioPanel() {
  const editor = useEditor();
  const track = useDoc((s) => s.meta.soundtrack ?? null);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const choose = async () => {
    const [f] = await pickFiles('audio/*,.mp3,.m4a,.wav,.ogg,.flac');
    if (f) await importSoundtrack(editor, f);
  };

  return (
    <>
      {track ? (
        <TrackCard track={track} onReplace={choose} />
      ) : (
        <div
          className={`dropzone ${over ? 'is-over' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={async (e) => {
            e.preventDefault();
            setOver(false);
            const f = [...e.dataTransfer.files].find((x) => x.type.startsWith('audio/') || /\.(mp3|m4a|wav|ogg|flac|aac|opus)$/i.test(x.name));
            if (f) await importSoundtrack(editor, f);
          }}
        >
          <Eyes size={56} mood={over ? 'wow' : 'look'} />
          <div style={{ fontWeight: 600, margin: '8px 0 2px' }}>Drop a song or a voice over</div>
          <div className="hint" style={{ marginBottom: 12 }}>
            MP3, M4A, WAV, OGG or FLAC. It plays under every page when you present, and goes into MP4 exports.
          </div>
          <button className="btn btn-ink" onClick={choose}>
            <Icon name="music" /> Choose a sound file
          </button>
        </div>
      )}
      <Section title="Tavla tones">
        <p className="hint" style={{ margin: '0 0 10px' }}>
          Four little loops Tavla plays itself, made on your machine when you pick one. Free to use anywhere.
        </p>
        <div className="tones">
          {TONES.map((t) => (
            <button
              key={t.id}
              className={`tone ${busy === t.id ? 'is-busy' : ''} ${track?.name === t.name ? 'is-on' : ''}`}
              disabled={!!busy}
              onClick={async () => {
                setBusy(t.id);
                try {
                  const blob = await renderTone(t);
                  await importSoundtrack(editor, new File([blob], `${t.name}.wav`, { type: 'audio/wav' }));
                } finally {
                  setBusy(null);
                }
              }}
            >
              <ToneMark id={t.id} />
              <span>
                <b>{t.name}</b>
                <i>{busy === t.id ? 'Playing it into a file' : t.note}</i>
              </span>
            </button>
          ))}
        </div>
      </Section>
      <Section title="How it mixes">
        <p className="hint" style={{ margin: 0 }}>
          The soundtrack starts on page one and loops if the design runs longer. Sound from video clips plays on top. Use your own music or something you have the rights to.
        </p>
      </Section>
    </>
  );
}

function TrackCard({ track, onReplace }: { track: Soundtrack; onReplace: () => void }) {
  const editor = useEditor();
  const [playing, setPlaying] = useState(false);
  const [head, setHead] = useState<number | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const wave = useRef<HTMLDivElement>(null);
  const set = (p: Partial<Soundtrack>) => editor.doc.setMeta({ soundtrack: { ...track, ...p } });

  useEffect(() => () => audio.current?.pause(), []);
  useEffect(() => {
    if (audio.current) audio.current.volume = track.volume;
  }, [track.volume]);

  const play = async () => {
    if (playing) {
      audio.current?.pause();
      setPlaying(false);
      setHead(null);
      return;
    }
    const src = await mediaUrl(track.mediaId);
    if (!src) return editor.toast('This sound file is not on this device');
    const a = audio.current ?? new Audio();
    audio.current = a;
    a.src = src;
    a.volume = track.volume;
    a.currentTime = track.trimStart;
    await a.play().catch(() => {});
    setPlaying(true);
    const tick = () => {
      if (a.paused) {
        setPlaying(false);
        setHead(null);
        return;
      }
      setHead(a.currentTime);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const onTrim = (e: React.PointerEvent) => {
    e.preventDefault();
    const r = wave.current!.getBoundingClientRect();
    const at = (x: number) => Math.max(0, Math.min(track.duration - 1, ((x - r.left) / r.width) * track.duration));
    let t = at(e.clientX);
    set({ trimStart: round(t) });
    startDrag(
      e,
      (ev) => {
        t = at(ev.clientX);
        set({ trimStart: round(t) });
      },
      () => {
        if (audio.current && playing) audio.current.currentTime = t;
      },
      0,
    );
  };

  const n = track.peaks.length;
  const cut = (track.trimStart / track.duration) * 100;
  return (
    <div className="track">
      <div className="track-head">
        <button className="track-play" onClick={play} title={playing ? 'Pause' : 'Play from the start point'}>
          <Icon name={playing ? 'pause' : 'play'} />
        </button>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="track-name" title={track.name}>
            {track.name}
          </div>
          <div className="hint" style={{ margin: 0 }}>
            Starts at {formatTime(track.trimStart)} of {formatTime(track.duration)}
          </div>
        </div>
      </div>
      <div className="track-wave" ref={wave} onPointerDown={onTrim} title="Drag to choose where the music starts">
        <svg viewBox={`0 0 ${n} 100`} preserveAspectRatio="none" aria-hidden="true">
          {track.peaks.map((p, i) => {
            const h = Math.max(4, p * 96);
            return <rect key={i} x={i + 0.18} y={50 - h / 2} width={0.64} height={h} rx={0.3} className={(i / n) * 100 < cut ? 'is-cut' : ''} />;
          })}
        </svg>
        <span className="track-cut" style={{ left: `${cut}%` }} />
        {head !== null ? <span className="track-head-line" style={{ left: `${(head / track.duration) * 100}%` }} /> : null}
      </div>
      <div className="label" style={{ marginTop: 14 }}>
        Volume
      </div>
      <Slider value={Math.round(track.volume * 100)} min={0} max={100} unit="%" onChange={(v) => set({ volume: v / 100 })} />
      <div className="row-between" style={{ margin: '4px 0 14px' }}>
        <span className="label" style={{ margin: 0 }}>
          Fade out at the end
        </span>
        <button className={`switch ${track.fadeOut ? 'is-on' : ''}`} onClick={() => set({ fadeOut: !track.fadeOut })} aria-label="Fade out at the end" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <button className="btn btn-outline" onClick={onReplace}>
          <Icon name="upload" /> Replace
        </button>
        <button
          className="btn btn-outline"
          onClick={() => {
            audio.current?.pause();
            editor.doc.setMeta({ soundtrack: null });
          }}
        >
          <Icon name="trash" /> Remove
        </button>
      </div>
    </div>
  );
}

const round = (n: number) => Math.round(n * 10) / 10;

// A small drawn sign for each tone, in the pixel hand of the icons.
function ToneMark({ id }: { id: string }) {
  const bars: Record<string, number[]> = {
    lantern: [3, 5, 7, 8, 7, 5, 3, 2],
    tram: [2, 6, 3, 7, 2, 6, 3, 7],
    kettle: [7, 2, 4, 2, 7, 2, 4, 2],
    skerry: [8, 1, 1, 5, 1, 1, 3, 1],
  };
  return (
    <svg className="tone-mark" viewBox="0 0 16 10" aria-hidden="true">
      {(bars[id] ?? []).map((h, i) => (
        <rect key={i} x={i * 2} y={10 - h} width={1.4} height={h} />
      ))}
    </svg>
  );
}
