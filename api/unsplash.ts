// Server side proxy for the Unsplash API, so the access key never reaches the browser.
// Deployed as a Vercel function at /api/unsplash and mounted by the Vite dev server.
//
//   GET /api/unsplash                 curated feed (?page=)
//   GET /api/unsplash?q=sea&page=2    search
//   GET /api/unsplash?download=<url>  report a download, required when a photo is used

const API = 'https://api.unsplash.com';
const PER_PAGE = 30;
const MAX_PAGE = 40;

// One topic per feed page keeps the default view varied for one upstream call.
const FEED_TOPICS = ['textures-patterns', 'people', 'food-drink', 'architecture-interior', 'nature', 'wallpapers', 'street-photography', 'film'];

export interface SlimPhoto {
  id: string;
  w: number;
  h: number;
  color: string;
  blurHash: string | null;
  alt: string;
  urls: { small: string; regular: string; full: string };
  user: { name: string; url: string };
  link: string;
  download: string;
}

export interface ProxyResult {
  status: number;
  body: unknown;
  cache?: string;
}

type Fetch = (url: string, init: { headers: Record<string, string> }) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;
type Raw = Record<string, any>;

function slim(p: Raw): SlimPhoto {
  return {
    id: p.id,
    w: p.width,
    h: p.height,
    color: p.color ?? '#e5e5e5',
    blurHash: p.blur_hash ?? null,
    alt: p.alt_description ?? p.description ?? 'Photo',
    urls: { small: p.urls.small, regular: p.urls.regular, full: p.urls.full },
    user: { name: p.user.name, url: p.user.links.html },
    link: p.links.html,
    download: p.links.download_location,
  };
}

function page(value: string | undefined): number | null {
  if (value === undefined || value === '') return 1;
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= MAX_PAGE ? n : null;
}

// Only Unsplash's own download_location endpoint is ever called, never an arbitrary URL.
function downloadTarget(raw: string): string | null {
  try {
    const u = new URL(raw);
    if (u.protocol !== 'https:' || u.hostname !== 'api.unsplash.com' || u.port) return null;
    return /^\/photos\/[\w-]+\/download$/.test(u.pathname) ? u.toString() : null;
  } catch {
    return null;
  }
}

export async function handleUnsplash(query: Record<string, string | undefined>, key: string | undefined, doFetch: Fetch = fetch as unknown as Fetch): Promise<ProxyResult> {
  if (!key) return { status: 503, body: { error: 'not_configured' } };
  const headers = { Authorization: `Client-ID ${key}`, 'Accept-Version': 'v1' };
  const q = (query.q ?? '').trim();
  if (q.length > 100) return { status: 400, body: { error: 'bad_query' } };

  let url: string;
  let cache = 'public, s-maxage=300, stale-while-revalidate=3600';
  let track = false;

  if (query.download !== undefined) {
    const target = downloadTarget(query.download);
    if (!target) return { status: 400, body: { error: 'bad_download' } };
    url = target;
    track = true;
  } else {
    const n = page(query.page);
    if (n === null) return { status: 400, body: { error: 'bad_page' } };
    if (q) {
      url = `${API}/search/photos?query=${encodeURIComponent(q)}&page=${n}&per_page=${PER_PAGE}&content_filter=high`;
    } else {
      const topic = FEED_TOPICS[(n - 1) % FEED_TOPICS.length];
      const round = Math.floor((n - 1) / FEED_TOPICS.length) + 1;
      url = `${API}/topics/${topic}/photos?order_by=popular&page=${round}&per_page=${PER_PAGE}`;
      cache = 'public, s-maxage=3600, stale-while-revalidate=86400';
    }
  }

  let res;
  try {
    res = await doFetch(url, { headers });
  } catch {
    return { status: 502, body: { error: 'unreachable' } };
  }
  if (!res.ok) return { status: res.status === 403 || res.status === 429 ? 429 : 502, body: { error: 'upstream', status: res.status } };
  if (track) return { status: 200, body: { ok: true } };

  const json = (await res.json()) as Raw | Raw[];
  const list: Raw[] = Array.isArray(json) ? json : (json.results ?? []);
  const totalPages = Array.isArray(json) ? Infinity : (json.total_pages ?? 1);
  const n = page(query.page) ?? 1;
  return { status: 200, body: { photos: list.map(slim), hasMore: list.length === PER_PAGE && (q ? n < totalPages : n < MAX_PAGE) }, cache };
}

interface VercelReq {
  query: Record<string, string | string[] | undefined>;
}
interface VercelRes {
  status(code: number): VercelRes;
  setHeader(name: string, value: string): void;
  json(body: unknown): void;
}

export function firstValues(query: VercelReq['query']): Record<string, string | undefined> {
  return Object.fromEntries(Object.entries(query).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
}

export default async function handler(req: VercelReq, res: VercelRes) {
  const out = await handleUnsplash(firstValues(req.query), process.env.UNSPLASH_ACCESS_KEY);
  // The desktop app calls this from a file or app origin; the endpoint is read only and keyless.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', out.status === 200 && out.cache ? out.cache : 'no-store');
  res.status(out.status).json(out.body);
}
