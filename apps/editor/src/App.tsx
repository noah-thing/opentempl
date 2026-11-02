import { lazy, Suspense, useEffect, useState } from 'react';
import { Home } from './home/Home';
import { EditorScreen } from './editor/EditorScreen';
import { createDesign } from './io/designs';
import { formatById } from './doc/formats';
import { findTemplate } from './templates';
import { Sign } from './ui/Logo';
import { IconSheet } from './ui/IconSheet';
import { ErrorBoundary } from './ui/ErrorBoundary';
import { Presenter } from './present/Presenter';
import { RenderTemplate } from './templates/RenderTemplate';

const Studio = lazy(() => import('./generate/Studio').then((m) => ({ default: m.Studio })));

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

declare global {
  interface Window {
    tavlaDesktop?: { platform: string; onOpenFile: (cb: (f: { name: string; bytes: Uint8Array }) => void) => void };
  }
}

// Inside the desktop app: make room for the window buttons and open files
// from Finder or Explorer (.tavla, and PowerPoint and PDF through Open With).
if (window.tavlaDesktop) {
  document.documentElement.classList.add('is-desktop', `is-${window.tavlaDesktop.platform}`);
  window.tavlaDesktop.onOpenFile(async (f) => {
    const file = new File([f.bytes as BlobPart], f.name);
    const name = f.name.toLowerCase();
    let id: string | null = null;
    if (name.endsWith('.pptx')) id = await (await import('./io/pptxImport')).importPptx(file);
    else if (name.endsWith('.pdf')) id = await (await import('./io/pdfImport')).importPdf(file);
    else id = await (await import('./io/designs')).importDesign(file);
    if (id) navigate(`/d/${id}`);
  });
}

export function App() {
  const hash = useHash();
  const path = hash.replace(/^#/, '') || '/';

  if (path.startsWith('/d/') || path.startsWith('/join/')) {
    // A join link is a design link with a room key: the editor reads the key from the hash.
    const id = path.replace(/^\/(d|join)\//, '').split('?')[0];
    return (
      <ErrorBoundary key={id}>
        <EditorScreen id={id} />
      </ErrorBoundary>
    );
  }
  if (path === '/icons') return <IconSheet />;
  if (path.startsWith('/generate'))
    return (
      <Suspense fallback={<Loading label="Opening the looks" />}>
        <Studio query={path.split('?')[1] ?? ''} />
      </Suspense>
    );
  if (path.startsWith('/render')) return <RenderTemplate query={path.split('?')[1] ?? ''} />;
  if (path.startsWith('/presenter/')) return <Presenter id={path.slice(11).split('?')[0]} />;
  if (path.startsWith('/new')) return <NewDesign query={path.split('?')[1] ?? ''} />;
  return <Home />;
}

function NewDesign({ query }: { query: string }) {
  useEffect(() => {
    const q = new URLSearchParams(query);
    const fmt = formatById(q.get('format') ?? '');
    const w = Number(q.get('w'));
    const h = Number(q.get('h'));
    (async () => {
      const tpl = q.get('template') ? await findTemplate(q.get('template')!) : undefined;
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
        <div className="loading-line" />
        {label}
      </div>
    </div>
  );
}
