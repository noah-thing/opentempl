import type { DesignSnapshot, Id, VideoElement } from '../doc/types';
import { clipLength, getMedia } from '../io/media';

// The sound of an exported video: the design's soundtrack underneath, then
// every clip that is not muted, placed at its page's start, trimmed, looped
// and set to its volume, all mixed down offline.

export const SAMPLE_RATE = 48000;

export interface PageSpan {
  id: Id;
  start: number; // seconds into the export
  length: number; // seconds
}

export async function mixSound(snap: DesignSnapshot, spans: PageSpan[]): Promise<AudioBuffer | null> {
  const clips: { el: VideoElement; span: PageSpan }[] = [];
  for (const span of spans) {
    for (const id of snap.pages[span.id].elementIds) {
      const el = snap.elements[id];
      if (el?.type === 'video' && !el.muted && !el.hidden && el.volume > 0) clips.push({ el, span });
    }
  }
  const track = snap.meta.soundtrack;
  if (!clips.length && !track) return null;
  const total = spans.reduce((a, s) => Math.max(a, s.start + s.length), 0);
  const ctx = new OfflineAudioContext(2, Math.ceil(total * SAMPLE_RATE), SAMPLE_RATE);
  const decoded = new Map<Id, AudioBuffer | null>();
  let any = false;

  if (track && track.volume > 0) {
    const blob = await getMedia(track.mediaId);
    const buf = blob ? await ctx.decodeAudioData(await blob.arrayBuffer()).catch(() => null) : null;
    if (buf) {
      any = true;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      src.loopStart = track.trimStart;
      src.loopEnd = buf.duration;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(track.volume, 0);
      if (track.fadeOut && total > 3) {
        gain.gain.setValueAtTime(track.volume, total - 2);
        gain.gain.linearRampToValueAtTime(0, total);
      }
      src.connect(gain).connect(ctx.destination);
      src.start(0, track.trimStart);
      src.stop(total);
    }
  }
  for (const { el, span } of clips) {
    if (!decoded.has(el.mediaId)) {
      const blob = await getMedia(el.mediaId);
      let buf: AudioBuffer | null = null;
      // A clip without a sound track fails to decode; it simply adds nothing.
      if (blob) buf = await ctx.decodeAudioData(await blob.arrayBuffer()).catch(() => null);
      decoded.set(el.mediaId, buf);
    }
    const buf = decoded.get(el.mediaId);
    if (!buf) continue;
    any = true;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    gain.gain.value = el.volume;
    src.connect(gain).connect(ctx.destination);
    const len = clipLength(el);
    if (el.loop) {
      src.loop = true;
      src.loopStart = el.trimStart;
      src.loopEnd = el.trimStart + len;
      src.start(span.start, el.trimStart);
      src.stop(span.start + span.length);
    } else src.start(span.start, el.trimStart, Math.min(len, span.length));
  }
  return any ? ctx.startRendering() : null;
}

// AAC where the browser can encode it, Opus otherwise; both fit in an MP4.
export async function pickAudioCodec(): Promise<{ muxer: 'aac' | 'opus'; config: AudioEncoderConfig } | null> {
  if (typeof AudioEncoder === 'undefined') return null;
  const base = { sampleRate: SAMPLE_RATE, numberOfChannels: 2, bitrate: 160_000 };
  for (const [muxer, codec] of [
    ['aac', 'mp4a.40.2'],
    ['opus', 'opus'],
  ] as const) {
    const config = { ...base, codec };
    const ok = await AudioEncoder.isConfigSupported(config).then((r) => r.supported).catch(() => false);
    if (ok) return { muxer, config };
  }
  return null;
}

export async function encodeSound(buffer: AudioBuffer, config: AudioEncoderConfig, onChunk: (c: EncodedAudioChunk, m?: EncodedAudioChunkMetadata) => void) {
  let failed: unknown = null;
  const enc = new AudioEncoder({ output: onChunk, error: (e) => (failed = e) });
  enc.configure(config);
  const block = 4096;
  const left = buffer.getChannelData(0);
  const right = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : left;
  for (let i = 0; i < buffer.length; i += block) {
    if (failed) throw failed;
    const n = Math.min(block, buffer.length - i);
    const planes = new Float32Array(n * 2);
    planes.set(left.subarray(i, i + n), 0);
    planes.set(right.subarray(i, i + n), n);
    const data = new AudioData({ format: 'f32-planar', sampleRate: SAMPLE_RATE, numberOfFrames: n, numberOfChannels: 2, timestamp: Math.round((i / SAMPLE_RATE) * 1e6), data: planes });
    enc.encode(data);
    data.close();
  }
  await enc.flush();
  enc.close();
}
