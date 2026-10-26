// Iconify's public API: 200,000+ open source icons from 150+ sets.
// https://iconify.design/docs/api/

const API = 'https://api.iconify.design';
const searchCache = new Map<string, Promise<string[]>>();
const svgCache = new Map<string, Promise<string>>();

export function searchIcons(query: string, limit = 64, prefix?: string): Promise<string[]> {
  const key = `${query}|${limit}|${prefix ?? ''}`;
  let p = searchCache.get(key);
  if (!p) {
    const url = `${API}/search?query=${encodeURIComponent(query)}&limit=${Math.max(32, limit)}${prefix ? `&prefix=${prefix}` : ''}`;
    p = fetch(url)
      .then((r) => r.json())
      .then((j: { icons?: string[] }) => (j.icons ?? []).slice(0, limit));
    p.catch(() => searchCache.delete(key));
    searchCache.set(key, p);
  }
  return p;
}

export function iconSvg(id: string): Promise<string> {
  let p = svgCache.get(id);
  if (!p) {
    const [prefix, name] = id.split(':');
    p = fetch(`${API}/${prefix}/${name}.svg`).then((r) => {
      if (!r.ok) throw new Error('icon');
      return r.text();
    });
    p.catch(() => svgCache.delete(id));
    svgCache.set(id, p);
  }
  return p;
}
