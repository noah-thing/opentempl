// OpenTempl tones: four short music loops synthesised in the browser, so a design
// can have music with no library, no licence and no download. Each one is a
// chord loop in D (I, vi, IV, V) played by a few tiny instruments through a
// shared room, rendered offline and written out as a WAV file.

export interface Tone {
  id: string;
  name: string;
  note: string;
  bpm: number;
  parts: ('pad' | 'bass' | 'arp' | 'ticks' | 'bells' | 'pump')[];
}

export const TONES: Tone[] = [
  { id: 'lantern', name: 'Lantern', note: 'Slow warm chords', bpm: 72, parts: ['pad', 'bass'] },
  { id: 'tram', name: 'Tram', note: 'A bright little arpeggio', bpm: 96, parts: ['pad', 'arp', 'bass'] },
  { id: 'kettle', name: 'Kettle', note: 'Dusty bass and brushes', bpm: 84, parts: ['pump', 'bass', 'ticks'] },
  { id: 'skerry', name: 'Skerry', note: 'Bells over the water', bpm: 66, parts: ['pad', 'bells'] },
];

const SR = 48000;
// D major: Dmaj7, Bm7, Gmaj7, A6, as MIDI notes.
const CHORDS = [
  [50, 54, 57, 61],
  [47, 50, 54, 57],
  [43, 47, 50, 54],
  [45, 49, 52, 54],
];
const hz = (m: number) => 440 * 2 ** ((m - 69) / 12);

export async function renderTone(tone: Tone): Promise<Blob> {
  const bar = (60 / tone.bpm) * 4;
  const loops = Math.max(2, Math.ceil(20 / (bar * 4)));
  const length = bar * 4 * loops + 2;
  const ctx = new OfflineAudioContext(2, Math.ceil(length * SR), SR);

  const master = ctx.createGain();
  master.gain.value = 0.8;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -14;
  comp.ratio.value = 3;
  master.connect(comp).connect(ctx.destination);
  const room = ctx.createConvolver();
  room.buffer = impulse(ctx, 2.6);
  const wet = ctx.createGain();
  wet.gain.value = 0.32;
  room.connect(wet).connect(master);
  const dry = (n: AudioNode, send = 0.5) => {
    n.connect(master);
    const s = ctx.createGain();
    s.gain.value = send;
    n.connect(s).connect(room);
  };

  for (let l = 0; l < loops; l++) {
    CHORDS.forEach((chord, ci) => {
      const t0 = (l * 4 + ci) * bar;
      const beat = bar / 4;
      if (tone.parts.includes('pad') || tone.parts.includes('pump')) {
        for (const m of chord) {
          for (const det of [-7, 7]) {
            const o = ctx.createOscillator();
            o.type = 'sawtooth';
            o.frequency.value = hz(m + 12);
            o.detune.value = det;
            const f = ctx.createBiquadFilter();
            f.type = 'lowpass';
            f.frequency.value = tone.parts.includes('pump') ? 900 : 1400;
            const g = ctx.createGain();
            const peak = tone.parts.includes('pump') ? 0.022 : 0.03;
            g.gain.setValueAtTime(0, t0);
            g.gain.linearRampToValueAtTime(peak, t0 + Math.min(0.7, bar * 0.25));
            if (tone.parts.includes('pump'))
              // A lazy sidechain: the chords duck on every beat.
              for (let b = 0; b < 4; b++) {
                g.gain.setValueAtTime(peak * 0.25, t0 + b * beat + 0.01);
                g.gain.linearRampToValueAtTime(peak, t0 + b * beat + beat * 0.7);
              }
            g.gain.setValueAtTime(peak, t0 + bar - 0.05);
            g.gain.linearRampToValueAtTime(0, t0 + bar + 0.6);
            o.connect(f).connect(g);
            dry(g, 0.6);
            o.start(t0);
            o.stop(t0 + bar + 0.7);
          }
        }
      }
      if (tone.parts.includes('bass')) {
        for (const b of [0, 2.5]) {
          const t = t0 + b * beat;
          const o = ctx.createOscillator();
          o.type = 'sine';
          o.frequency.value = hz(chord[0] - 12);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.32, t + 0.01);
          g.gain.exponentialRampToValueAtTime(0.001, t + beat * 1.4);
          o.connect(g);
          dry(g, 0.1);
          o.start(t);
          o.stop(t + beat * 1.5);
        }
      }
      if (tone.parts.includes('arp')) {
        const order = [0, 1, 2, 3, 2, 1, 3, 2];
        order.forEach((k, i) => {
          const t = t0 + i * (beat / 2);
          const o = ctx.createOscillator();
          o.type = 'triangle';
          o.frequency.value = hz(chord[k] + 24);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.08, t + 0.004);
          g.gain.exponentialRampToValueAtTime(0.0005, t + 0.38);
          o.connect(g);
          dry(g, 0.7);
          o.start(t);
          o.stop(t + 0.4);
        });
      }
      if (tone.parts.includes('ticks')) {
        for (let i = 0; i < 8; i++) {
          const t = t0 + i * (beat / 2) + (i % 2 ? beat * 0.06 : 0);
          const src = ctx.createBufferSource();
          src.buffer = noise(ctx, 0.08);
          const f = ctx.createBiquadFilter();
          f.type = 'highpass';
          f.frequency.value = i % 2 ? 7000 : 5200;
          const g = ctx.createGain();
          g.gain.setValueAtTime(i % 4 === 2 ? 0.12 : 0.05, t);
          g.gain.exponentialRampToValueAtTime(0.0005, t + 0.07);
          src.connect(f).connect(g);
          dry(g, 0.2);
          src.start(t);
        }
      }
      if (tone.parts.includes('bells')) {
        const picks = [3, 1, 2, 0];
        [0, 1.5, 3].forEach((b, i) => {
          const t = t0 + b * beat;
          const base = hz(chord[picks[(ci + i) % 4]] + 24);
          for (const [ratio, amp] of [
            [1, 0.09],
            [2.76, 0.03],
            [5.4, 0.012],
          ]) {
            const o = ctx.createOscillator();
            o.type = 'sine';
            o.frequency.value = base * ratio;
            const g = ctx.createGain();
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(amp, t + 0.003);
            g.gain.exponentialRampToValueAtTime(0.0003, t + 2.2 / ratio);
            o.connect(g);
            dry(g, 0.9);
            o.start(t);
            o.stop(t + 2.3);
          }
        });
      }
    });
  }
  const rendered = await ctx.startRendering();
  // Fold the reverb tail back over the start, so the file loops without a seam.
  const loopLen = Math.round(bar * 4 * loops * SR);
  const out = new AudioBuffer({ numberOfChannels: 2, length: loopLen, sampleRate: SR });
  for (let c = 0; c < 2; c++) {
    const src = rendered.getChannelData(c);
    const dst = out.getChannelData(c);
    dst.set(src.subarray(0, loopLen));
    for (let i = loopLen; i < src.length; i++) dst[i - loopLen] += src[i];
  }
  // Bring every tone to the same loudness ceiling, just under full scale.
  let peak = 0;
  for (let c = 0; c < out.numberOfChannels; c++) for (const v of out.getChannelData(c)) peak = Math.max(peak, Math.abs(v));
  const gain = peak > 0 ? 0.89 / peak : 1;
  for (let c = 0; c < out.numberOfChannels; c++) {
    const d = out.getChannelData(c);
    for (let i = 0; i < d.length; i++) d[i] *= gain;
  }
  return wav(out);
}

function noise(ctx: BaseAudioContext, seconds: number) {
  const b = ctx.createBuffer(1, Math.ceil(seconds * SR), SR);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}

// A room: two channels of decaying noise, slightly different, so it feels wide.
function impulse(ctx: BaseAudioContext, seconds: number) {
  const n = Math.ceil(seconds * SR);
  const b = ctx.createBuffer(2, n, SR);
  for (let c = 0; c < 2; c++) {
    const d = b.getChannelData(c);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 3.2;
  }
  return b;
}

function wav(buf: AudioBuffer): Blob {
  const ch = buf.numberOfChannels;
  const n = buf.length;
  const data = new DataView(new ArrayBuffer(44 + n * ch * 2));
  const str = (o: number, s: string) => [...s].forEach((c, i) => data.setUint8(o + i, c.charCodeAt(0)));
  str(0, 'RIFF');
  data.setUint32(4, 36 + n * ch * 2, true);
  str(8, 'WAVE');
  str(12, 'fmt ');
  data.setUint32(16, 16, true);
  data.setUint16(20, 1, true);
  data.setUint16(22, ch, true);
  data.setUint32(24, buf.sampleRate, true);
  data.setUint32(28, buf.sampleRate * ch * 2, true);
  data.setUint16(32, ch * 2, true);
  data.setUint16(34, 16, true);
  str(36, 'data');
  data.setUint32(40, n * ch * 2, true);
  const chans = Array.from({ length: ch }, (_, c) => buf.getChannelData(c));
  let o = 44;
  for (let i = 0; i < n; i++)
    for (let c = 0; c < ch; c++) {
      const v = Math.max(-1, Math.min(1, chans[c][i]));
      data.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7fff, true);
      o += 2;
    }
  return new Blob([data.buffer], { type: 'audio/wav' });
}
