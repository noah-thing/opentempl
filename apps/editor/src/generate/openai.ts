import { LOOK_FORMATS, legacySize, type LookFormat } from './looks';

// Talks to the OpenAI image API with the user's own key. The key is kept in
// this browser's local storage (or the desktop app's) and is only ever sent to
// api.openai.com. Nothing goes through a Tavla server; there isn't one.

const KEY = 'tavla.openai';

export interface AiSettings {
  key: string;
  model: string;
  quality: 'low' | 'medium' | 'high' | 'auto';
}

export const MODELS: { id: string; label: string; custom: boolean }[] = [
  { id: 'gpt-image-2.5-sunburst', label: 'GPT Image 2.5 (best)', custom: true },
  { id: 'gpt-image-2.5-flare', label: 'GPT Image 2.5 Flare', custom: true },
  { id: 'gpt-image-2', label: 'GPT Image 2', custom: true },
  { id: 'gpt-image-1.5', label: 'GPT Image 1.5', custom: false },
  { id: 'gpt-image-1-mini', label: 'GPT Image 1 mini (cheapest)', custom: false },
];

export function getSettings(): AiSettings {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || '{}');
    return { key: s.key ?? '', model: s.model ?? MODELS[0].id, quality: s.quality ?? 'high' };
  } catch {
    return { key: '', model: MODELS[0].id, quality: 'high' };
  }
}

const listeners = new Set<() => void>();
export function saveSettings(s: AiSettings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* private mode: the key lives only for this session */
  }
  listeners.forEach((l) => l());
}
export function onSettingsChange(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export const hasKey = () => !!getSettings().key;

function sizeFor(model: string, f: LookFormat) {
  return MODELS.find((m) => m.id === model)?.custom === false ? legacySize(f) : LOOK_FORMATS[f].api;
}

async function toDataUrl(src: string | Blob): Promise<string> {
  const blob = typeof src === 'string' ? await (await fetch(src)).blob() : src;
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(blob);
  });
}

function b64ToBlob(b64: string, mime = 'image/png') {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

async function call(path: string, body: Record<string, unknown>, signal?: AbortSignal): Promise<Blob[]> {
  const s = getSettings();
  if (!s.key) throw new Error('Connect your OpenAI key first');
  const res = await fetch(`https://api.openai.com/v1/images/${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${s.key}` },
    body: JSON.stringify(body),
    signal,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message ?? `OpenAI answered ${res.status}`;
    if (res.status === 401) throw new Error('OpenAI did not accept the key. Check it in Generate settings.');
    if (/billing|quota/i.test(msg)) throw new Error('Your OpenAI account is out of credit or over its limit.');
    throw new Error(msg);
  }
  const fmt = (body.output_format as string) ?? 'png';
  return (data.data ?? []).map((d: { b64_json: string }) => b64ToBlob(d.b64_json, `image/${fmt === 'jpeg' ? 'jpeg' : fmt}`));
}

export interface GenerateRequest {
  prompt: string;
  format: LookFormat;
  images?: (string | Blob)[]; // references, in the order the prompt names them
  n?: number;
  transparent?: boolean;
  signal?: AbortSignal;
}

// Generates images. With references it uses the edit endpoint, which takes up to 16 input images.
export async function generateImages(req: GenerateRequest): Promise<Blob[]> {
  const s = getSettings();
  const common: Record<string, unknown> = {
    model: s.model,
    prompt: req.prompt.slice(0, 32000),
    n: Math.max(1, Math.min(4, req.n ?? 1)),
    size: sizeFor(s.model, req.format),
    quality: s.quality,
    output_format: req.transparent ? 'png' : 'jpeg',
    ...(req.transparent ? { background: 'transparent' } : { output_compression: 90 }),
  };
  if (!req.images?.length) return call('generations', common, req.signal);
  // Images on other sites (the Look's pins) go by URL and OpenAI fetches them; the rest are sent as data.
  const remote = (src: string | Blob) => typeof src === 'string' && /^https:\/\//.test(src) && !src.startsWith(location.origin);
  const images = await Promise.all(req.images.slice(0, 16).map(async (src) => ({ image_url: remote(src) ? (src as string) : await toDataUrl(src) })));
  return call('edits', { ...common, images }, req.signal);
}

// Repaints only the masked areas of an image (transparent pixels in the mask are repainted).
export async function inpaint(image: Blob, mask: Blob, prompt: string, signal?: AbortSignal): Promise<Blob> {
  const s = getSettings();
  const [out] = await call(
    'edits',
    {
      model: s.model,
      prompt,
      images: [{ image_url: await toDataUrl(image) }],
      mask: { image_url: await toDataUrl(mask) },
      size: 'auto',
      quality: s.quality === 'low' ? 'medium' : s.quality,
      output_format: 'png',
    },
    signal,
  );
  return out;
}

// Cuts the main subject out of a picture: the same picture back with a transparent background.
export async function cutoutSubject(image: Blob, signal?: AbortSignal): Promise<Blob> {
  const s = getSettings();
  const [out] = await call(
    'edits',
    {
      model: s.model,
      prompt:
        'Keep only the main subject of this picture, exactly as it is: same shape, position, size, colours, texture and detail. Remove everything else and make it fully transparent. Do not redraw, restyle, move or add anything.',
      images: [{ image_url: await toDataUrl(image) }],
      background: 'transparent',
      output_format: 'png',
      size: 'auto',
      quality: 'medium',
    },
    signal,
  );
  return out;
}
