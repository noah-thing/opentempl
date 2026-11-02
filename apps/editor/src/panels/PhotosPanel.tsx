import { useEffect, useMemo, useState } from 'react';
import { useEditor } from '../editor/Editor';
import { addLibraryItem, dragProps, type LibraryItem } from './library';
import { Search } from './controls';
import { creditLine, fetchPhotos, insertSrc, UnsplashError, withUtm, type UnsplashPhoto } from './unsplash';

// Photos come live from Unsplash through the /api/unsplash proxy.
// public/library/photos/ stays on disk because templates still use those files; the panel no longer lists them.

const SUGGEST = ['coffee', 'mountains', 'city night', 'flowers', 'texture', 'ocean', 'concert', 'food', 'portrait', 'forest'];

type Status = 'loading' | 'ready' | 'not_connected' | 'failed';

export default function PhotosPanel() {
  const editor = useEditor();
  const [q, setQuery] = useState('');
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState<Status>('loading');

  // Changing the search always restarts at page one, in the same render.
  const setQ = (v: string) => {
    setQuery(v);
    setPage(1);
  };

  useEffect(() => {
    const ctl = new AbortController();
    // Typing waits for a pause; paging and the first view go straight out.
    const t = setTimeout(async () => {
      if (page === 1) setStatus('loading');
      try {
        const r = await fetchPhotos(q, page, ctl.signal);
        setPhotos((prev) => {
          if (page === 1) return r.photos;
          const seen = new Set(prev.map((p) => p.id));
          return [...prev, ...r.photos.filter((p) => !seen.has(p.id))];
        });
        setHasMore(r.hasMore);
        setStatus('ready');
      } catch (e) {
        if (ctl.signal.aborted) return;
        if (page === 1) setPhotos([]);
        setHasMore(false);
        setStatus(e instanceof UnsplashError ? e.kind : 'failed');
      }
    }, q && page === 1 ? 300 : 0);
    return () => {
      clearTimeout(t);
      ctl.abort();
    };
  }, [q, page]);

  const columns = useMemo(() => {
    const cols: { items: UnsplashPhoto[]; height: number }[] = [{ items: [], height: 0 }, { items: [], height: 0 }];
    for (const p of photos) {
      const c = cols[0].height <= cols[1].height ? cols[0] : cols[1];
      c.items.push(p);
      c.height += p.h / p.w;
    }
    return cols;
  }, [photos]);

  const tile = (p: UnsplashPhoto) => {
    const item: LibraryItem = { kind: 'photo', url: insertSrc(p), name: p.alt, w: p.w, h: p.h, credit: creditLine(p), download: p.download };
    return (
      <div key={p.id} className="photo-tile">
        <button className="tile" style={{ aspectRatio: `${p.w} / ${p.h}`, background: p.color }} onMouseDown={(e) => e.preventDefault()} onClick={() => addLibraryItem(editor, item)} {...dragProps(item)} title={p.alt}>
          <img src={p.urls.small} alt={p.alt} loading="lazy" draggable={false} />
        </button>
        <span className="photo-credit">
          Photo by{' '}
          <a href={withUtm(p.user.url)} target="_blank" rel="noreferrer">
            {p.user.name}
          </a>{' '}
          on{' '}
          <a href={withUtm(p.link)} target="_blank" rel="noreferrer">
            Unsplash
          </a>
        </span>
      </div>
    );
  };

  return (
    <>
      <Search value={q} onChange={setQ} placeholder="Search free photos" />
      {!q ? (
        <div className="chips" style={{ margin: '10px 0 0' }}>
          {SUGGEST.map((s) => (
            <button key={s} className="chip" onClick={() => setQ(s)}>
              {s}
            </button>
          ))}
        </div>
      ) : null}
      {status === 'not_connected' ? (
        <p className="hint" style={{ marginTop: 14 }}>
          Photos are not connected yet.
        </p>
      ) : status === 'failed' ? (
        <p className="hint" style={{ marginTop: 14 }}>
          Photos could not load. Check your connection.
        </p>
      ) : status === 'loading' ? (
        <p className="hint" style={{ marginTop: 14 }}>
          Loading photos
        </p>
      ) : photos.length === 0 ? (
        <p className="hint" style={{ marginTop: 14 }}>
          No photos for that search.
        </p>
      ) : (
        <>
          <div className="photo-cols">
            {columns.map((c, i) => (
              <div key={i}>{c.items.map(tile)}</div>
            ))}
          </div>
          {hasMore ? (
            <button className="btn btn-outline btn-block" style={{ marginTop: 12 }} onClick={() => setPage((n) => n + 1)}>
              More photos
            </button>
          ) : null}
          <p className="hint" style={{ marginTop: 12 }}>
            Free photos from Unsplash. OpenTempl saves the photographer's credit with each photo you place.
          </p>
        </>
      )}
    </>
  );
}
