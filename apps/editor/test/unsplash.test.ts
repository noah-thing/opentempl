import { describe, expect, it } from 'vitest';
import { handleUnsplash } from '../../../api/unsplash';
import { insertSrc, withUtm, type UnsplashPhoto } from '../src/panels/unsplash';

const raw = (id: string) => ({
  id,
  width: 4000,
  height: 6000,
  color: '#a1b2c3',
  blur_hash: 'LKO2',
  alt_description: 'a quiet street',
  urls: { raw: 'r', small: 's', regular: 'g', full: 'https://images.unsplash.com/photo-1?ixlib=rb-4.1.0&q=85&fm=jpg' },
  user: { name: 'Ada', links: { html: 'https://unsplash.com/@ada' } },
  links: { html: `https://unsplash.com/photos/${id}`, download_location: `https://api.unsplash.com/photos/${id}/download?ixid=x` },
});

function stub(payload: unknown, ok = true, status = 200) {
  const calls: { url: string; auth: string }[] = [];
  const fn = async (url: string, init: { headers: Record<string, string> }) => {
    calls.push({ url, auth: init.headers.Authorization });
    return { ok, status, json: async () => payload };
  };
  return { fn, calls };
}

describe('unsplash proxy', () => {
  it('refuses to run without a key', async () => {
    const out = await handleUnsplash({}, undefined, stub({}).fn);
    expect(out.status).toBe(503);
  });

  it('searches with the safe content filter and slims the result', async () => {
    const s = stub({ results: [raw('a')], total_pages: 3 });
    const out = await handleUnsplash({ q: ' sea ', page: '2' }, 'KEY', s.fn);
    expect(s.calls[0].url).toBe('https://api.unsplash.com/search/photos?query=sea&page=2&per_page=30&content_filter=high');
    expect(s.calls[0].auth).toBe('Client-ID KEY');
    const body = out.body as { photos: Record<string, unknown>[]; hasMore: boolean };
    expect(body.photos[0]).toMatchObject({ id: 'a', w: 4000, h: 6000, user: { name: 'Ada', url: 'https://unsplash.com/@ada' }, download: 'https://api.unsplash.com/photos/a/download?ixid=x' });
    expect(body.photos[0]).not.toHaveProperty('urls.raw');
    expect(out.cache).toContain('s-maxage');
  });

  it('serves a curated feed that rotates topics by page', async () => {
    const s = stub([raw('a')]);
    await handleUnsplash({}, 'KEY', s.fn);
    await handleUnsplash({ page: '2' }, 'KEY', s.fn);
    expect(s.calls[0].url).toContain('/topics/textures-patterns/photos?order_by=popular&page=1');
    expect(s.calls[1].url).toContain('/topics/people/photos');
  });

  it('rejects bad input without calling upstream', async () => {
    const s = stub({});
    for (const query of [{ page: '0' }, { page: 'x' }, { page: '999' }, { q: 'a'.repeat(101) }, { download: 'https://evil.example/photos/a/download' }, { download: 'https://api.unsplash.com.evil.example/photos/a/download' }, { download: 'https://api.unsplash.com/me' }]) {
      expect((await handleUnsplash(query, 'KEY', s.fn)).status).toBe(400);
    }
    expect(s.calls).toHaveLength(0);
  });

  it('triggers a download only against Unsplash', async () => {
    const s = stub({ url: 'https://images.unsplash.com/x' });
    const out = await handleUnsplash({ download: 'https://api.unsplash.com/photos/a/download?ixid=x' }, 'KEY', s.fn);
    expect(out).toEqual({ status: 200, body: { ok: true } });
    expect(s.calls[0].url).toBe('https://api.unsplash.com/photos/a/download?ixid=x');
  });

  it('maps upstream failures without leaking them', async () => {
    expect((await handleUnsplash({ q: 'x' }, 'KEY', stub({}, false, 403).fn)).status).toBe(429);
    expect((await handleUnsplash({ q: 'x' }, 'KEY', stub({}, false, 500).fn)).status).toBe(502);
  });
});

describe('unsplash client helpers', () => {
  const photo = { w: 6000, h: 4000, urls: { full: 'https://images.unsplash.com/photo-1?q=85&fm=jpg' } } as UnsplashPhoto;
  it('caps the inserted size on the long side', () => {
    expect(new URL(insertSrc(photo)).searchParams.get('w')).toBe('2400');
    expect(new URL(insertSrc({ ...photo, w: 4000, h: 6000 })).searchParams.get('h')).toBe('2400');
    expect(new URL(insertSrc({ ...photo, w: 1200, h: 800 })).searchParams.get('w')).toBe('1200');
  });
  it('adds the referral params and keeps existing ones', () => {
    expect(withUtm('https://unsplash.com/photos/a?x=1')).toBe('https://unsplash.com/photos/a?x=1&utm_source=opentempl&utm_medium=referral');
  });
});
