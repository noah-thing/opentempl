import { useEffect, useMemo, useState } from 'react';
import { openDesign, type OpenDesign } from '../io/designs';
import { PageView } from '../render/PageView';
import { RenderContext, type RenderEnv } from '../render/RenderContext';
import { useFontsVersion } from '../editor/hooks';
import { useStore } from '../lib/store';
import { preloadFonts } from '../fonts/fonts';
import { Icon } from '../ui/icons';
import { Loading } from '../App';

// Presenter view: a second window with the current slide, the next one, the
// speaker notes and a timer. It steers the audience window over a
// BroadcastChannel, so it works with any screen arrangement.

export function presentChannel(id: string) {
  return new BroadcastChannel(`tavla-present-${id}`);
}

export function Presenter({ id }: { id: string }) {
  const [open, setOpen] = useState<OpenDesign | null>(null);
  useEffect(() => {
    let o: OpenDesign | null = null;
    openDesign(id).then((x) => {
      o = x;
      if (x) preloadFonts(Object.values(x.doc.snapshot.elements).flatMap((e) => ('fontFamily' in e ? [e.fontFamily] : [])));
      setOpen(x);
    });
    return () => {
      o?.close();
    };
  }, [id]);
  if (!open) return <Loading label="Opening presenter view" />;
  return <PresenterView open={open} id={id} />;
}

function PresenterView({ open, id }: { open: OpenDesign; id: string }) {
  const snap = useStore(open.doc, (s) => s);
  const fontsVersion = useFontsVersion();
  const order = snap.pageOrder.filter((p) => !snap.pages[p]?.hidden);
  const [index, setIndex] = useState(0);
  const [start] = useState(() => Date.now());
  const [now, setNow] = useState(Date.now());
  const channel = useMemo(() => presentChannel(id), [id]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    channel.onmessage = (e) => typeof e.data?.index === 'number' && setIndex(e.data.index);
    channel.postMessage({ hello: true });
    return () => {
      clearInterval(t);
      channel.close();
    };
  }, [channel]);

  const go = (i: number) => {
    const n = Math.max(0, Math.min(order.length - 1, i));
    setIndex(n);
    channel.postMessage({ go: n });
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowRight', 'ArrowDown', ' ', 'PageDown'].includes(e.key)) go(index + 1);
      if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) go(index - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const env: RenderEnv = useMemo(() => ({ assetUrl: (a) => open.doc.assetUrl(a), assetSize: () => undefined, fontsVersion, mode: 'present', idPrefix: 'pv-' }), [open, fontsVersion]);
  const W = snap.meta.width;
  const H = snap.meta.height;
  const page = snap.pages[order[index]];
  const next = snap.pages[order[index + 1]];
  const secs = Math.floor((now - start) / 1000);
  const clock = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;
  const big = Math.min(760 / W, 430 / H);
  const small = Math.min(380 / W, 220 / H);

  return (
    <div style={{ height: '100%', background: '#0B0B0D', color: '#F1F1F4', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 28, padding: 28, overflow: 'auto' }}>
      <RenderContext.Provider value={env}>
        <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
          <div style={{ fontSize: 13, color: '#8A8A96' }}>
            Now · {index + 1} of {order.length}
          </div>
          {page ? <PageView page={page} elements={snap.elements} width={W} height={H} displayWidth={W * big} displayHeight={H * big} /> : null}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-outline" style={{ background: '#1F1F25', color: '#fff' }} onClick={() => go(index - 1)}>
              <Icon name="chevron-left" /> Back
            </button>
            <button className="btn btn-primary" onClick={() => go(index + 1)}>
              Next <Icon name="chevron-right" />
            </button>
          </div>
        </div>
        <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
          <div style={{ fontSize: 64, fontWeight: 500, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>{clock}</div>
          <div style={{ fontSize: 13, color: '#8A8A96' }}>Next</div>
          {next ? (
            <PageView page={next} elements={snap.elements} width={W} height={H} displayWidth={W * small} displayHeight={H * small} />
          ) : (
            <div style={{ color: '#8A8A96' }}>That was the last page.</div>
          )}
          <div style={{ fontSize: 13, color: '#8A8A96', marginTop: 8 }}>Notes</div>
          <div style={{ fontSize: 22, lineHeight: 1.45, whiteSpace: 'pre-wrap', maxWidth: 560 }}>{page?.notes || 'No notes for this page. Add them under Notes in the editor.'}</div>
        </div>
      </RenderContext.Provider>
    </div>
  );
}
