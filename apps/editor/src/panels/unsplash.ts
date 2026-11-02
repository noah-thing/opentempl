// Client for the /api/unsplash proxy (api/unsplash.ts). The access key lives on the server.
// Unsplash's API terms: hotlink their CDN, credit the photographer, report every use.

export interface UnsplashPhoto {
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

export interface PhotoPage {
  photos: UnsplashPhoto[];
  hasMore: boolean;
}

export class UnsplashError extends Error {
  constructor(readonly kind: 'not_connected' | 'failed') {
    super(kind);
  }
}

// The desktop app and any host that does not run the function use the public one.
function apiBase(): string {
  const web = /^https?:$/.test(location.protocol);
  return window.tavlaDesktop || !web ? 'https://opentempl.org' : '';
}

export async function fetchPhotos(q: string, page: number, signal?: AbortSignal): Promise<PhotoPage> {
  const params = new URLSearchParams({ page: String(page) });
  if (q.trim()) params.set('q', q.trim());
  let res: Response;
  try {
    res = await fetch(`${apiBase()}/api/unsplash?${params}`, { signal });
  } catch (e) {
    if (signal?.aborted) throw e;
    throw new UnsplashError('failed');
  }
  const json = await res.json().catch(() => null);
  if (res.ok && json && Array.isArray(json.photos)) return json as PhotoPage;
  // 503 is a server without a key, 404 or a non JSON page is a host without the function.
  throw new UnsplashError(res.status === 503 || res.status === 404 || !json ? 'not_connected' : 'failed');
}

// Unsplash asks for a ping to download_location whenever someone uses a photo.
export function reportDownload(downloadLocation: string): void {
  fetch(`${apiBase()}/api/unsplash?download=${encodeURIComponent(downloadLocation)}`).catch(() => {});
}

export function withUtm(url: string): string {
  const u = new URL(url);
  u.searchParams.set('utm_source', 'opentempl');
  u.searchParams.set('utm_medium', 'referral');
  return u.toString();
}

const INSERT_LONG_SIDE = 2400;

// The full size file, resized by Unsplash's image CDN so a print sized poster stays sharp without 8k downloads.
export function insertSrc(p: UnsplashPhoto): string {
  const u = new URL(p.urls.full);
  u.searchParams.set(p.w >= p.h ? 'w' : 'h', String(Math.min(INSERT_LONG_SIDE, Math.max(p.w, p.h))));
  return u.toString();
}

export function creditLine(p: UnsplashPhoto): string {
  return `${p.user.name} on Unsplash`;
}
