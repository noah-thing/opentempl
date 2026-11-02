import { useEffect, useMemo, useState } from 'react';
import { PageView } from '../render/PageView';
import { RenderContext, type RenderEnv } from '../render/RenderContext';
import { useFontsVersion } from '../editor/hooks';
import { ensureFont } from '../fonts/fonts';
import { libUrl, type TemplateDef } from './index';
import { loadPack } from './packs';
import type { Page } from '../doc/types';

// #/render?vibe=<vibe>&id=<id>[&scale=0.5]: every page of a pack template at full
// size with full resolution library images, nothing else on screen. Used to make
// gallery thumbnails and to review templates while building them. Sets
// data-ready on <body> once fonts and images have loaded.
export function RenderTemplate({ query }: { query: string }) {
  const q = new URLSearchParams(query);
  const vibe = q.get('vibe') ?? '';
  const id = q.get('id') ?? '';
  const scale = Number(q.get('scale')) || 1;
  const [def, setDef] = useState<TemplateDef | null | undefined>(undefined);
  const fontsVersion = useFontsVersion();

  useEffect(() => {
    document.body.removeAttribute('data-ready');
    loadPack(vibe).then((list) => setDef(list.find((t) => t.id === id) ?? null));
  }, [vibe, id]);

  useEffect(() => {
    if (!def) {
      if (def === null) document.body.setAttribute('data-ready', 'missing');
      return;
    }
    const fams = new Set<string>();
    for (const p of def.pages) for (const e of p.elements) if ('fontFamily' in e) fams.add(e.fontFamily);
    Promise.all([...fams].map((f) => ensureFont(f))).then(async () => {
      await document.fonts.ready;
      await new Promise((r) => setTimeout(r, 300));
      const imgs = [...document.querySelectorAll('image')];
      await Promise.all(
        imgs.map(
          (im) =>
            new Promise((res) => {
              const href = im.getAttribute('href');
              if (!href) return res(null);
              const i = new Image();
              i.onload = i.onerror = () => res(null);
              i.src = href;
            }),
        ),
      );
      await new Promise((r) => setTimeout(r, 400));
      document.body.setAttribute('data-ready', 'yes');
    });
  }, [def]);

  const env: RenderEnv = useMemo(
    () => ({ assetUrl: (a) => (a?.startsWith('lib:') ? libUrl(a) : undefined), assetSize: () => undefined, fontsVersion, mode: 'export' }),
    [fontsVersion],
  );

  if (!def) return <div style={{ padding: 40, font: '16px system-ui' }}>{def === null ? `No template ${vibe}/${id}` : 'Loading'}</div>;
  return (
    <RenderContext.Provider value={env}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, padding: 40, background: '#d8d8dc', alignItems: 'flex-start' }}>
        {def.pages.map((tp, i) => {
          const elements = Object.fromEntries(tp.elements.map((e, j) => [`e${i}-${j}`, { ...e, id: `e${i}-${j}` }]));
          const page: Page = { id: `p${i}`, name: '', background: tp.background, elementIds: Object.keys(elements), notes: '', transition: 'none', duration: 5 };
          return (
            <div key={i} className="render-page" style={{ width: def.width * scale, height: def.height * scale, background: '#fff', overflow: 'hidden' }}>
              <PageView page={page} elements={elements} width={def.width} height={def.height} displayWidth={def.width * scale} displayHeight={def.height * scale} />
            </div>
          );
        })}
      </div>
    </RenderContext.Provider>
  );
}
