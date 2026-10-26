// Pull a small palette out of photos: downsample, bucket colours in a coarse
// RGB grid, then keep the most common buckets that are not too similar.

const cache = new Map<string, string[]>();

async function colorsOf(url: string): Promise<string[]> {
  const hit = cache.get(url);
  if (hit) return hit;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = url;
  await img.decode();
  const c = document.createElement('canvas');
  c.width = 48;
  c.height = 48;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, 48, 48);
  const data = ctx.getImageData(0, 0, 48, 48).data;
  const buckets = new Map<number, { n: number; r: number; g: number; b: number }>();
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const key = ((r >> 5) << 6) | ((g >> 5) << 3) | (b >> 5);
    const cur = buckets.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
    cur.n++;
    cur.r += r;
    cur.g += g;
    cur.b += b;
    buckets.set(key, cur);
  }
  const sorted = [...buckets.values()].sort((a, b) => b.n - a.n);
  const out: [number, number, number][] = [];
  for (const s of sorted) {
    const col: [number, number, number] = [s.r / s.n, s.g / s.n, s.b / s.n];
    if (out.every((o) => Math.hypot(o[0] - col[0], o[1] - col[1], o[2] - col[2]) > 48)) out.push(col);
    if (out.length >= 6) break;
  }
  const hex = out.map(([r, g, b]) => '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase());
  cache.set(url, hex);
  return hex;
}

export async function extractPalette(urls: string[]): Promise<string[]> {
  const all = (await Promise.all(urls.map((u) => colorsOf(u).catch(() => [])))).flat();
  return [...new Set(all)].slice(0, 14);
}
