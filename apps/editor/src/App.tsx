import { useEffect, useState } from 'react';
import { Home } from './home/Home';
import { EditorScreen } from './editor/EditorScreen';
import { createDesign } from './io/designs';
import { formatById } from './doc/formats';
import { templateById } from './templates';
import { Eyes } from './ui/Logo';
import { IconSheet } from './ui/IconSheet';

// Hash routes: #/ home, #/d/<id> editor, #/new?format=<id>&template=<id>
function useHash() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const on = () => setHash(window.location.hash);
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return hash;
}

export function navigate(path: string) {
  window.location.hash = path;
}

export function App() {
  const hash = useHash();
  const path = hash.replace(/^#/, '') || '/';

  if (path.startsWith('/join/')) {
    const [id, q] = path.slice(6).split('?');
    window.location.replace(`#/d/${id}?${q ?? ''}`);
    return null;
  }
  if (path.startsWith('/d/')) {
    const id = path.slice(3).split('?')[0];
    return <EditorScreen key={id} id={id} />;
  }
  if (path === '/icons') return <IconSheet />;
  if (path.startsWith('/new')) return <NewDesign query={path.split('?')[1] ?? ''} />;
  return <Home />;
}

function NewDesign({ query }: { query: string }) {
  useEffect(() => {
    const q = new URLSearchParams(query);
    const tpl = templateById(q.get('template') ?? '');
    const fmt = formatById(q.get('format') ?? '');
    const w = Number(q.get('w'));
    const h = Number(q.get('h'));
    (async () => {
      let id: string;
      if (tpl) {
        const built = await tpl.build();
        id = await createDesign({ snapshot: built.snapshot, assets: built.assets });
      } else
        id = await createDesign({
          meta: fmt
            ? { width: fmt.width, height: fmt.height, title: fmt.name, formatId: fmt.id }
            : w && h
              ? { width: w, height: h, title: 'Custom size' }
              : {},
        });
      window.location.replace(`#/d/${id}`);
    })();
  }, [query]);
  return <Loading label="Laying out a fresh sheet" />;
}

export function Loading({ label }: { label: string }) {
  return (
    <div style={{ height: '100%', display: 'grid', placeItems: 'center', background: 'var(--paper)' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 14, color: 'var(--ink-2)', fontWeight: 500 }}>
        <Eyes size={72} />
        {label}
      </div>
    </div>
  );
}
