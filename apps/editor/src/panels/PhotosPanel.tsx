import { useEffect, useState } from 'react';
import { useEditor } from '../editor/Editor';
import { addLibraryItem, dragProps, type LibraryItem } from './library';
import { Search, Section } from './controls';
import { LIBRARY_PHOTOS } from './photos';

// Photos: Tavla's own library first, then Openverse, a search over 700 million
// openly licensed images run by WordPress. No account, no key.

interface OvResult {
  id: string;
  url: string;
  thumbnail: string;
  title: string;
  creator?: string;
  license: string;
  width?: number;
  height?: number;
}

const SUGGEST = ['coffee', 'mountains', 'city night', 'flowers', 'texture', 'ocean', 'concert', 'food', 'portrait', 'forest'];

export default function PhotosPanel() {
  const editor = useEditor();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<OvResult[] | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!q.trim()) {
      setResults(null);
      return;
    }
    setError(false);
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&page_size=30&page=${page}&mature=false`);
        const j = await r.json();
        const list: OvResult[] = (j.results ?? []).map((x: Record<string, unknown>) => ({
          id: x.id,
          url: x.url,
          thumbnail: x.thumbnail,
          title: x.title,
          creator: x.creator,
          license: `${String(x.license).toUpperCase()} ${x.license_version ?? ''}`.trim(),
          width: x.width,
          height: x.height,
        }));
        setResults((prev) => (page > 1 && prev ? [...prev, ...list] : list));
      } catch {
        setError(true);
        setResults([]);
      }
    }, 280);
    return () => clearTimeout(t);
  }, [q, page]);
  useEffect(() => setPage(1), [q]);

  const tile = (item: Extract<LibraryItem, { kind: 'photo' }>, thumb: string, key: string, credit?: string) => (
    <button key={key} className="tile" style={{ aspectRatio: `${item.w} / ${item.h}` }} onClick={() => addLibraryItem(editor, item)} {...dragProps(item)} title={credit}>
      <img src={thumb} alt={item.name} loading="lazy" />
      {credit ? <span className="credit">{credit}</span> : null}
    </button>
  );

  return (
    <>
      <Search value={q} onChange={setQ} placeholder="Search 700 million open photos" />
      {!q ? (
        <>
          <div className="chips" style={{ margin: '10px 0 0' }}>
            {SUGGEST.map((s) => (
              <button key={s} className="chip" onClick={() => setQ(s)}>
                {s}
              </button>
            ))}
          </div>
          <Section title="Tavla library">
            <p className="hint" style={{ margin: '-2px 0 8px' }}>
              Made for Tavla. Free for anything, no credit needed.
            </p>
            <Masonry>{LIBRARY_PHOTOS.map((p) => tile({ kind: 'photo', url: p.url, name: p.name, w: p.w, h: p.h, credit: 'Tavla library' }, p.thumb, p.url))}</Masonry>
          </Section>
        </>
      ) : results === null ? (
        <div className="hint" style={{ marginTop: 12 }}>
          Searching
        </div>
      ) : error ? (
        <div className="empty">
          <h4>Openverse did not answer</h4>
          <span className="hint">Check your connection and try again.</span>
        </div>
      ) : (
        <>
          <Masonry>
            {results.map((r) =>
              tile(
                { kind: 'photo', url: r.url, name: r.title, w: r.width ?? 4, h: r.height ?? 3, credit: `${r.title} by ${r.creator ?? 'unknown'}, ${r.license}, via Openverse` },
                r.thumbnail,
                r.id,
                `${r.creator ?? 'Unknown'} · ${r.license}`,
              ),
            )}
          </Masonry>
          {results.length >= 30 * page ? (
            <button className="btn btn-outline btn-block" style={{ marginTop: 12 }} onClick={() => setPage((p) => p + 1)}>
              Load more
            </button>
          ) : null}
          <p className="hint" style={{ marginTop: 12 }}>
            Openverse photos keep their Creative Commons licences. Tavla saves the credit with each photo you place.
          </p>
        </>
      )}
    </>
  );
}

function Masonry({ children }: { children: React.ReactNode }) {
  return <div style={{ columns: 2, columnGap: 8, marginTop: 10 }}>{Array.isArray(children) ? children.map((c, i) => <div key={i} style={{ breakInside: 'avoid', marginBottom: 8 }}>{c}</div>) : children}</div>;
}
