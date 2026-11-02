import type { Look, TextRole, TextZone } from './looks';
import { loadSegmenter } from '../tools/removeBackground';
import { ERASE_SUBJECT_PROMPT, ERASE_TEXT_PROMPT } from './prompt';

// Magic layers: turns one flat picture into a background, a cut out subject and
// real text boxes. Everything runs on this computer (tesseract.js reads the
// words, BiRefNet finds the subject, a small fill rebuilds what was behind);
// with an OpenAI key the rebuilt areas can be repainted by GPT Image instead.

export interface FoundText {
  text: string;
  x: number; // image pixels
  y: number;
  w: number;
  h: number;
  fontSize: number;
  color: string;
  align: 'left' | 'center' | 'right';
  upper: boolean;
  role: TextRole;
  backing?: string; // a solid label strip behind the words when the picture is too busy there
}

export interface LayerResult {
  width: number;
  height: number;
  background: Blob;
  subject: { blob: Blob; x: number; y: number; w: number; h: number } | null;
  texts: FoundText[];
}

export interface SplitOptions {
  findText: boolean;
  separateSubject: boolean;
  repaint?: (image: Blob, mask: Blob, prompt: string) => Promise<Blob>; // API inpainting, when a key is connected
  cutout?: (image: Blob) => Promise<Blob>; // API subject cutout (transparent PNG), when a key is connected
  onStatus: (s: string) => void;
}

type Rect = { x: number; y: number; w: number; h: number };

async function toCanvas(src: Blob) {
  const bmp = await createImageBitmap(src);
  const c = new OffscreenCanvas(bmp.width, bmp.height);
  c.getContext('2d', { willReadFrequently: true })!.drawImage(bmp, 0, 0);
  return c;
}
const canvasBlob = (c: OffscreenCanvas, type = 'image/png') => c.convertToBlob({ type, quality: 0.92 });

// ---- reading the words ----

let workerP: Promise<import('tesseract.js').Worker> | null = null;
async function ocrWorker(onStatus: (s: string) => void) {
  if (!workerP) {
    workerP = (async () => {
      const { createWorker } = await import('tesseract.js');
      return createWorker('eng', 1, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status?.startsWith('loading')) onStatus(`Loading the text reader ${Math.round((m.progress || 0) * 100)}%`);
        },
      });
    })();
    workerP.catch(() => (workerP = null));
  }
  return workerP;
}

const lum = (r: number, g: number, b: number) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const hex = (r: number, g: number, b: number) => '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

// The ink colour of a word box: split its pixels into two groups by brightness;
// the smaller group is the lettering.
function inkColor(data: ImageData, r: Rect) {
  const px: [number, number, number, number][] = [];
  const x0 = Math.max(0, Math.floor(r.x)), y0 = Math.max(0, Math.floor(r.y));
  const x1 = Math.min(data.width, Math.ceil(r.x + r.w)), y1 = Math.min(data.height, Math.ceil(r.y + r.h));
  const step = Math.max(1, Math.floor(Math.sqrt(((x1 - x0) * (y1 - y0)) / 4000)));
  for (let y = y0; y < y1; y += step)
    for (let x = x0; x < x1; x += step) {
      const i = (y * data.width + x) * 4;
      const d = data.data;
      px.push([d[i], d[i + 1], d[i + 2], lum(d[i], d[i + 1], d[i + 2])]);
    }
  if (!px.length) return '#111111';
  let lo = Math.min(...px.map((p) => p[3])), hi = Math.max(...px.map((p) => p[3]));
  for (let it = 0; it < 8; it++) {
    const a = px.filter((p) => Math.abs(p[3] - lo) <= Math.abs(p[3] - hi));
    const b = px.filter((p) => Math.abs(p[3] - lo) > Math.abs(p[3] - hi));
    if (!a.length || !b.length) break;
    lo = a.reduce((s, p) => s + p[3], 0) / a.length;
    hi = b.reduce((s, p) => s + p[3], 0) / b.length;
  }
  const dark = px.filter((p) => Math.abs(p[3] - lo) <= Math.abs(p[3] - hi));
  const light = px.filter((p) => Math.abs(p[3] - lo) > Math.abs(p[3] - hi));
  const ink = dark.length && light.length ? (dark.length < light.length ? dark : light) : px;
  const avg = (k: 0 | 1 | 2) => ink.reduce((s, p) => s + p[k], 0) / ink.length;
  return hex(avg(0), avg(1), avg(2));
}

export async function readText(src: OffscreenCanvas, onStatus: (s: string) => void): Promise<{ texts: FoundText[]; boxes: Rect[] }> {
  const worker = await ocrWorker(onStatus);
  onStatus('Reading the words');
  const blob = await canvasBlob(src);
  const { data } = await worker.recognize(blob, {}, { blocks: true });
  const img = src.getContext('2d')!.getImageData(0, 0, src.width, src.height);
  const texts: FoundText[] = [];
  const boxes: Rect[] = [];
  for (const block of data.blocks ?? [])
    for (const para of block.paragraphs) {
      const lines = para.lines.filter((l) => l.confidence > 55 && l.text.trim().replace(/[^\p{L}\p{N}]/gu, '').length >= 2);
      if (!lines.length) continue;
      for (const l of lines) for (const w of l.words) if (w.confidence > 40) boxes.push({ x: w.bbox.x0, y: w.bbox.y0, w: w.bbox.x1 - w.bbox.x0, h: w.bbox.y1 - w.bbox.y0 });
      const x0 = Math.min(...lines.map((l) => l.bbox.x0)), x1 = Math.max(...lines.map((l) => l.bbox.x1));
      const y0 = Math.min(...lines.map((l) => l.bbox.y0)), y1 = Math.max(...lines.map((l) => l.bbox.y1));
      const text = lines.map((l) => l.text.trim()).join('\n');
      const upper = text === text.toUpperCase() && /[A-Z]/.test(text);
      const lineH = lines.map((l) => l.bbox.y1 - l.bbox.y0).sort((a, b) => a - b)[Math.floor(lines.length / 2)];
      // A line box spans cap height (all caps) or ascender to descender (mixed case).
      const fontSize = lineH / (upper ? 0.74 : 0.98);
      const lefts = lines.map((l) => l.bbox.x0), rights = lines.map((l) => l.bbox.x1), mids = lines.map((l) => (l.bbox.x0 + l.bbox.x1) / 2);
      const spread = (xs: number[]) => Math.max(...xs) - Math.min(...xs);
      const align = lines.length < 2 ? 'left' : spread(mids) < spread(lefts) && spread(mids) < spread(rights) ? 'center' : spread(rights) < spread(lefts) ? 'right' : 'left';
      texts.push({ text: upper ? text : text, x: x0, y: y0, w: x1 - x0, h: y1 - y0, fontSize, color: inkColor(img, { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }), align, upper, role: 'details' });
    }
  // The biggest type is the headline, the next size down the subline.
  const sizes = [...new Set(texts.map((t) => Math.round(t.fontSize)))].sort((a, b) => b - a);
  for (const t of texts) t.role = Math.round(t.fontSize) === sizes[0] ? 'headline' : Math.round(t.fontSize) === sizes[1] && sizes.length > 2 ? 'subline' : 'details';
  return { texts, boxes };
}

// ---- rebuilding what was behind ----

// Fills the masked pixels from their surroundings, ring by ring, then adds back
// grain measured around the hole so the patch doesn't look smoothed.
export function fillMasked(img: ImageData, mask: Uint8Array) {
  const { width: W, height: H, data } = img;
  const known = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) known[i] = mask[i] ? 0 : 1;
  let frontier: number[] = [];
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (known[i]) continue;
      if ((x > 0 && known[i - 1]) || (x < W - 1 && known[i + 1]) || (y > 0 && known[i - W]) || (y < H - 1 && known[i + W])) frontier.push(i);
    }
  // Grain of the surroundings: mean absolute difference between neighbouring known pixels.
  let gs = 0, gn = 0;
  for (const i of frontier.slice(0, 4000)) {
    for (const j of [i - 2, i + 2, i - 2 * W, i + 2 * W]) {
      if (j < 0 || j >= W * H || !known[j]) continue;
      const k = j + 1;
      if (k < W * H && known[k]) { gs += Math.abs(data[j * 4] - data[k * 4]); gn++; }
    }
  }
  const grain = Math.min(14, gn ? gs / gn : 0);
  const R = 3;
  while (frontier.length) {
    const next = new Set<number>();
    const vals: [number, number, number, number][] = [];
    for (const i of frontier) {
      const x = i % W, y = (i / W) | 0;
      let r = 0, g = 0, b = 0, n = 0;
      for (let dy = -R; dy <= R; dy++)
        for (let dx = -R; dx <= R; dx++) {
          const xx = x + dx, yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
          const j = yy * W + xx;
          if (!known[j]) continue;
          const wgt = 1 / (1 + dx * dx + dy * dy);
          r += data[j * 4] * wgt; g += data[j * 4 + 1] * wgt; b += data[j * 4 + 2] * wgt; n += wgt;
        }
      if (n) vals.push([i, r / n, g / n, b / n]);
    }
    for (const [i, r, g, b] of vals) {
      const noise = grain ? (Math.random() - 0.5) * grain * 1.6 : 0;
      data[i * 4] = r + noise; data[i * 4 + 1] = g + noise; data[i * 4 + 2] = b + noise; data[i * 4 + 3] = 255;
      known[i] = 1;
    }
    for (const [i] of vals) {
      const x = i % W, y = (i / W) | 0;
      for (const j of [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, y > 0 ? i - W : -1, y < H - 1 ? i + W : -1]) if (j >= 0 && !known[j]) next.add(j);
    }
    if (!vals.length) break;
    frontier = [...next];
  }
}

function maskFromRects(W: number, H: number, rects: Rect[], pad: (r: Rect) => number) {
  const m = new Uint8Array(W * H);
  for (const r of rects) {
    const p = pad(r);
    const x0 = Math.max(0, Math.floor(r.x - p)), y0 = Math.max(0, Math.floor(r.y - p));
    const x1 = Math.min(W, Math.ceil(r.x + r.w + p)), y1 = Math.min(H, Math.ceil(r.y + r.h + p));
    for (let y = y0; y < y1; y++) m.fill(1, y * W + x0, y * W + x1);
  }
  return m;
}

function dilate(m: Uint8Array, W: number, H: number, r: number) {
  const out = new Uint8Array(m);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (!m[y * W + x]) continue;
      for (let dy = -r; dy <= r; dy += Math.max(1, r >> 1))
        for (let dx = -r; dx <= r; dx += Math.max(1, r >> 1)) {
          const xx = x + dx, yy = y + dy;
          if (xx >= 0 && yy >= 0 && xx < W && yy < H) out[yy * W + xx] = 1;
        }
    }
  return out;
}

// The mask format GPT Image edits want: transparent where it may repaint.
async function apiMask(W: number, H: number, mask: Uint8Array) {
  const c = new OffscreenCanvas(W, H);
  const ctx = c.getContext('2d')!;
  const im = ctx.createImageData(W, H);
  for (let i = 0; i < W * H; i++) {
    im.data[i * 4 + 3] = mask[i] ? 0 : 255;
  }
  ctx.putImageData(im, 0, 0);
  return canvasBlob(c);
}

// Repaints the masked area, either through the API or locally, and keeps every
// unmasked pixel exactly as it was.
async function rebuild(canvas: OffscreenCanvas, mask: Uint8Array, prompt: string, opts: SplitOptions) {
  const W = canvas.width, H = canvas.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  const orig = ctx.getImageData(0, 0, W, H);
  if (opts.repaint) {
    try {
      const painted = await createImageBitmap(await opts.repaint(await canvasBlob(canvas), await apiMask(W, H, mask), prompt));
      const tmp = new OffscreenCanvas(W, H);
      const tctx = tmp.getContext('2d', { willReadFrequently: true })!;
      tctx.drawImage(painted, 0, 0, W, H);
      const p = tctx.getImageData(0, 0, W, H);
      for (let i = 0; i < W * H; i++) if (mask[i]) for (let k = 0; k < 4; k++) orig.data[i * 4 + k] = p.data[i * 4 + k];
      ctx.putImageData(orig, 0, 0);
      return;
    } catch {
      opts.onStatus('Repainting through OpenAI failed, filling on this computer instead');
    }
  }
  fillMasked(orig, mask);
  ctx.putImageData(orig, 0, 0);
}

// ---- the subject ----

async function localCutout(canvas: OffscreenCanvas, onStatus: (s: string) => void): Promise<Blob | null> {
  onStatus('Loading the cutout model');
  const seg = await loadSegmenter(onStatus);
  onStatus('Finding the subject');
  const url = URL.createObjectURL(await canvasBlob(canvas));
  try {
    type Out = { toCanvas?: () => HTMLCanvasElement | OffscreenCanvas; toBlob?: () => Promise<Blob> };
    const out = (await seg(url)) as Out[] | Out;
    const o = Array.isArray(out) ? out[0] : out;
    return o?.toBlob ? await o.toBlob() : o?.toCanvas ? await canvasBlob(o.toCanvas() as OffscreenCanvas) : null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function cutSubject(canvas: OffscreenCanvas, onStatus: (s: string) => void, cutout?: (image: Blob) => Promise<Blob>) {
  let blob: Blob | null = null;
  if (cutout) {
    onStatus('Cutting out the subject with GPT Image');
    blob = await cutout(await canvasBlob(canvas)).catch(() => null);
  }
  blob ??= await localCutout(canvas, onStatus);
  if (!blob) return null;
  {
    // Bring the cutout to the picture's own size, whatever size it came back at.
    const bmp = await createImageBitmap(blob);
    const cut = new OffscreenCanvas(canvas.width, canvas.height);
    cut.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const W = cut.width, H = cut.height;
    const a = cut.getContext('2d', { willReadFrequently: true })!.getImageData(0, 0, W, H);
    let x0 = W, y0 = H, x1 = 0, y1 = 0, n = 0;
    const mask = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++)
      if (a.data[i * 4 + 3] > 96) {
        mask[i] = 1;
        n++;
        const x = i % W, y = (i / W) | 0;
        if (x < x0) x0 = x;
        if (y < y0) y0 = y;
        if (x > x1) x1 = x;
        if (y > y1) y1 = y;
      }
    // Nothing found, or the "subject" is the whole picture: no separate layer.
    if (n < W * H * 0.02 || n > W * H * 0.85) return null;
    const crop = new OffscreenCanvas(x1 - x0 + 1, y1 - y0 + 1);
    crop.getContext('2d')!.drawImage(cut, -x0, -y0);
    return { blob: await canvasBlob(crop), x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1, mask, W, H };
  }
}

export async function splitIntoLayers(src: Blob, opts: SplitOptions): Promise<LayerResult> {
  const canvas = await toCanvas(src);
  const W = canvas.width, H = canvas.height;
  let texts: FoundText[] = [];
  if (opts.findText) {
    const found = await readText(canvas, opts.onStatus);
    texts = found.texts;
    if (found.boxes.length) {
      opts.onStatus('Lifting the words off the picture');
      await rebuild(canvas, maskFromRects(W, H, found.boxes, (r) => Math.max(4, r.h * 0.18)), ERASE_TEXT_PROMPT, opts);
    }
  }
  let subject: LayerResult['subject'] = null;
  if (opts.separateSubject) {
    // The cutout model can be slow on machines without a GPU: give up on the subject layer rather than hang.
    const s = await Promise.race([cutSubject(canvas, opts.onStatus, opts.cutout).catch(() => null), new Promise<null>((r) => setTimeout(() => r(null), 120000))]);
    if (s) {
      subject = { blob: s.blob, x: s.x * (W / s.W), y: s.y * (H / s.H), w: s.w * (W / s.W), h: s.h * (H / s.H) };
      opts.onStatus('Filling in behind the subject');
      const m = s.W === W && s.H === H ? s.mask : null;
      if (m) await rebuild(canvas, dilate(m, W, H, Math.round(Math.max(W, H) / 200)), ERASE_SUBJECT_PROMPT, opts);
    }
  }
  return { width: W, height: H, background: await canvasBlob(canvas, 'image/jpeg'), subject, texts };
}

// Where text goes when the picture was made without any (Look text zones), with
// a colour that reads on the background behind it.
export async function placeKnownText(background: Blob, look: Look, zones: TextZone[], words: Partial<Record<TextRole, string>>, pageW: number, pageH: number): Promise<FoundText[]> {
  const c = await toCanvas(background);
  const img = c.getContext('2d', { willReadFrequently: true })!.getImageData(0, 0, c.width, c.height);
  const sx = c.width / pageW, sy = c.height / pageH;
  // Mean brightness and how busy (standard deviation) a page area is.
  const stats = (r: Rect) => {
    let n = 0, sum = 0, sq = 0;
    const x0 = Math.max(0, Math.floor(r.x * sx)), y0 = Math.max(0, Math.floor(r.y * sy));
    const x1 = Math.min(c.width, Math.ceil((r.x + r.w) * sx)), y1 = Math.min(c.height, Math.ceil((r.y + r.h) * sy));
    const step = Math.max(2, Math.floor(Math.sqrt(((x1 - x0) * (y1 - y0)) / 2500)));
    for (let y = y0; y < y1; y += step)
      for (let x = x0; x < x1; x += step) {
        const i = (y * c.width + x) * 4;
        const v = lum(img.data[i], img.data[i + 1], img.data[i + 2]);
        sum += v; sq += v * v; n++;
      }
    const mean = n ? sum / n : 128;
    return { mean, sd: n ? Math.sqrt(Math.max(0, sq / n - mean * mean)) : 0 };
  };
  const order: TextRole[] = ['headline', 'subline', 'details'];
  const sorted = [...zones].sort((a, b) => order.indexOf(a.role) - order.indexOf(b.role));
  const out: FoundText[] = [];
  const taken: Rect[] = [];
  const overlaps = (a: Rect) => taken.some((b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h);
  for (const z of sorted) {
    let text = words[z.role]?.trim();
    if (!text) continue;
    const headline = z.role === 'headline';
    const zr = { x: z.x * pageW, y: z.y * pageH, w: Math.max(z.w, 0.45) * pageW, h: z.h * pageH };
    let fontSize: number;
    if (headline && !text.includes('\n')) {
      // A headline is set as big as it can be: on one, two or three balanced lines, whichever is largest.
      let bestSize = 0, bestText = text;
      for (let k = 1; k <= 3; k++) {
        const t = balance(text, k);
        const size = Math.min(zr.h / (k * 0.98), zr.w / (longestLine(t) * 0.56), pageW * 0.16);
        if (size > bestSize * 1.08) { bestSize = size; bestText = t; }
      }
      text = bestText;
      fontSize = bestSize;
    } else {
      const lines = Math.max(1, text.split('\n').length);
      fontSize = headline
        ? Math.min(zr.h / (lines * 1.0), zr.w / (longestLine(text) * 0.56))
        : Math.min(zr.h / (lines * 1.35), z.role === 'subline' ? pageW * 0.045 : pageW * 0.026);
    }
    const inside = (r: Rect) => r.x >= pageW * 0.05 && r.y >= pageH * 0.04 && r.x + r.w <= pageW * 0.95 && r.y + r.h <= pageH * 0.96;
    let best: Rect | null = null;
    // Try the planned size first; if nothing fits on the page, set the words a little smaller and look again.
    for (let attempt = 0; attempt < 4 && !best; attempt++, fontSize *= 0.85) {
      // Height the words will take once wrapped at this width (roughly).
      const perLine = Math.max(1, Math.floor(zr.w / (fontSize * 0.55)));
      const wrapped = text.split('\n').reduce((n, l) => n + Math.max(1, Math.ceil(l.length / perLine)), 0);
      const need = { w: Math.min(zr.w, pageW * 0.9), h: wrapped * fontSize * (headline ? 1.0 : 1.3) };
      // Candidates: the Look's zone, right under the block above, and a scan of the page. Calm and close wins.
      const cands: Rect[] = [{ ...zr, w: need.w, h: need.h }];
      const prev = out[out.length - 1];
      if (prev) cands.push({ x: prev.x, y: prev.y + prev.h + fontSize * 0.6, w: need.w, h: need.h });
      for (let y = 0.04; y < 0.96; y += 0.03)
        for (let x = 0.04; x < 0.9; x += 0.06) cands.push({ x: x * pageW, y: y * pageH, w: need.w, h: need.h });
      let bestScore = Infinity;
      for (const r of cands) {
        if (!inside(r) || overlaps(r)) continue;
        const st = stats(r);
        const dist = Math.hypot(r.x - zr.x, r.y - zr.y) / Math.hypot(pageW, pageH);
        const score = st.sd + dist * (headline ? 120 : 70) - (r === cands[1] ? 6 : 0);
        if (score < bestScore) { bestScore = score; best = r; }
      }
    }
    if (!best) continue;
    fontSize /= 0.85;
    const st = stats(best);
    const auto = st.mean > 140 ? '#111111' : '#FFFFFF';
    let color = headline && look.type.headline.color !== 'auto' ? pickReadable(look.type.headline.color, auto, st.mean) : auto;
    // Small words on busy artwork: set them on a strip of the Look's darkest colour, like a printed label.
    let backing: string | undefined;
    if (!headline && st.sd > 52) {
      const byLum = [...look.palette.colors].sort((a, b) => hexLum(a) - hexLum(b));
      backing = byLum[0] ?? '#111111';
      color = hexLum(backing) > 140 ? '#111111' : '#FFFFFF';
    }
    taken.push({ x: best.x - 8, y: best.y - 8, w: best.w + 16, h: best.h + 16 });
    out.push({ text, ...best, fontSize, color, align: z.align, upper: headline && look.type.headline.upper, role: z.role, backing });
  }
  return out;
}

const hexLum = (h: string) => {
  const n = parseInt(h.replace('#', '').slice(0, 6), 16);
  return lum((n >> 16) & 255, (n >> 8) & 255, n & 255);
};

// Breaks words into k lines of similar length.
function balance(text: string, k: number) {
  const words = text.split(/\s+/);
  if (k <= 1 || words.length < k) return text;
  const target = text.length / k;
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if (cur && (cur + ' ' + w).length > target * 1.15 && lines.length < k - 1) {
      lines.push(cur);
      cur = w;
    } else cur = cur ? `${cur} ${w}` : w;
  }
  lines.push(cur);
  return lines.join('\n');
}

const longestLine = (t: string) => Math.max(...t.split('\n').map((l) => l.length));

function pickReadable(color: string, fallback: string, bgLum: number) {
  const n = parseInt(color.slice(1), 16);
  const L = lum((n >> 16) & 255, (n >> 8) & 255, n & 255);
  return Math.abs(L - bgLum) > 90 ? color : fallback;
}
