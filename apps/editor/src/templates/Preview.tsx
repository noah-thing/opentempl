import { useEffect, useMemo } from 'react';
import { PageView } from '../render/PageView';
import { RenderContext, type RenderEnv } from '../render/RenderContext';
import { useFontsVersion } from '../editor/hooks';
import { ensureFont } from '../fonts/fonts';
import { libUrl, type TemplateDef } from './index';
import type { Page } from '../doc/types';

// Renders a template's page straight from its definition, with library
// thumbnails standing in for full photos.
export function TemplatePreview({ template, height, pageIndex = 0 }: { template: TemplateDef; height: number; pageIndex?: number }) {
  const fontsVersion = useFontsVersion();
  const tp = template.pages[pageIndex];
  useEffect(() => {
    const fams = new Set<string>();
    for (const e of tp.elements) if ('fontFamily' in e) fams.add(e.fontFamily);
    fams.forEach((f) => ensureFont(f));
  }, [tp]);
  const { page, elements } = useMemo(() => {
    const elements = Object.fromEntries(tp.elements.map((e, i) => [`t${i}`, { ...e, id: `t${i}` }]));
    const page: Page = { id: `${template.id}-${pageIndex}`, name: '', background: tp.background, elementIds: Object.keys(elements), notes: '', transition: 'none', duration: 5 };
    return { page, elements };
  }, [tp, template.id, pageIndex]);
  const env: RenderEnv = useMemo(
    () => ({
      assetUrl: (id) => (id?.startsWith('lib:') ? libUrl(id, true) : undefined),
      assetSize: () => undefined,
      fontsVersion,
      mode: 'thumb',
      idPrefix: `tp-${template.id}-${pageIndex}-`,
    }),
    [fontsVersion, template.id, pageIndex],
  );
  const scale = height / template.height;
  const w = template.width * scale;
  const maxW = 260;
  const s = w > maxW ? maxW / template.width : scale;
  return (
    <RenderContext.Provider value={env}>
      <PageView page={page} elements={elements} width={template.width} height={template.height} displayWidth={template.width * s} displayHeight={template.height * s} />
    </RenderContext.Provider>
  );
}
