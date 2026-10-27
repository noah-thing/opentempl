import type { DesignDoc } from '../doc/design';
import type { DesignSnapshot, Element, Id, TextElement } from '../doc/types';
import { canvasToBlob, elementSvg, pageSvg, rasterize } from './render';
import { layoutText } from '../text/layout';
import { fontsVersion } from '../fonts/fonts';

// PowerPoint export. Plain text stays editable text (with its styled runs),
// photos and simple shapes go in natively, and anything PowerPoint cannot
// draw (effects, charts, graphics, curves) is placed as a sharp image.

const IN = 1 / 96; // design units are CSS pixels at 96 dpi
const hex = (c: string) => c.replace('#', '').slice(0, 6).toUpperCase();

async function blobToDataUrl(b: Blob) {
  return await new Promise<string>((r) => {
    const fr = new FileReader();
    fr.onload = () => r(String(fr.result));
    fr.readAsDataURL(b);
  });
}

function nativeText(el: TextElement) {
  return el.effect.kind === 'none' && !el.curve && !el.gradient && !el.shadow && !el.blur && el.color.startsWith('#');
}

export async function exportPptx(doc: DesignDoc, snap: DesignSnapshot, pageIds: Id[], onProgress?: (d: number, t: number) => void) {
  const { default: PptxGenJS } = await import('pptxgenjs');
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: 'TAVLA', width: snap.meta.width * IN, height: snap.meta.height * IN });
  pptx.layout = 'TAVLA';
  pptx.title = snap.meta.title;

  let done = 0;
  for (const pid of pageIds) {
    const page = snap.pages[pid];
    const slide = pptx.addSlide();
    if (page.background.type === 'solid') slide.background = { color: hex(page.background.color) };
    else {
      // Gradients, patterns and photo backgrounds go in as a full slide picture.
      const bgOnly = { ...snap, pages: { ...snap.pages, [pid]: { ...page, elementIds: [] } } };
      const canvas = await rasterize(await pageSvg(doc, bgOnly, pid, { idPrefix: `bg-${pid}-` }), snap.meta.width, snap.meta.height, 1.5);
      slide.background = { data: await blobToDataUrl(await canvasToBlob(canvas, 'image/jpeg', 0.9)) };
    }
    for (const id of page.elementIds) {
      const el = snap.elements[id] as Element;
      if (!el || el.hidden) continue;
      const pos = { x: el.x * IN, y: el.y * IN, w: el.w * IN, h: el.h * IN, rotate: el.rotation || undefined };
      if (el.type === 'text' && nativeText(el)) {
        const lay = layoutText(el, fontsVersion());
        // Runs become text pieces with their own options; lines keep their breaks.
        const pieces = lay.lines.flatMap((ln, i) =>
          ln.segments.map((sg, j) => ({
            text: sg.text,
            options: {
              bold: sg.style.fontWeight >= 600,
              italic: sg.style.italic,
              underline: sg.style.underline ? { style: 'sng' as const } : undefined,
              strike: sg.style.strike ? ('sngStrike' as const) : undefined,
              color: hex(sg.style.color ?? el.color),
              breakLine: j === ln.segments.length - 1 && i < lay.lines.length - 1,
            },
          })),
        );
        slide.addText(pieces, {
          ...pos,
          h: Math.max(pos.h, lay.height * IN),
          fontFace: el.fontFamily,
          fontSize: el.fontSize * 0.75,
          align: el.align === 'justify' ? 'justify' : el.align,
          valign: 'top',
          margin: 0,
          lineSpacingMultiple: el.lineHeight,
          charSpacing: (el.letterSpacing / 1000) * el.fontSize * 0.75,
          transparency: Math.round((1 - el.opacity) * 100),
          bullet: el.list === 'bullet' ? true : el.list === 'number' ? { type: 'number' } : undefined,
          fit: 'none',
          wrap: true,
        });
        continue;
      }
      if (el.type === 'shape' && el.fill.type === 'solid' && (el.shape === 'rect' || el.shape === 'ellipse') && !el.shadow && !el.blur) {
        slide.addShape(el.shape === 'ellipse' ? 'ellipse' : el.radius ? 'roundRect' : 'rect', {
          ...pos,
          fill: { color: hex(el.fill.color), transparency: Math.round((1 - el.opacity) * 100) },
          line: el.stroke && el.stroke.width ? { color: hex(el.stroke.color), width: el.stroke.width * 0.75 } : { type: 'none' },
          rectRadius: el.shape === 'rect' && el.radius ? Math.min(0.5, el.radius / Math.min(el.w, el.h)) : undefined,
        });
        continue;
      }
      // Everything else: render the element alone at 2x and place the picture.
      const { svg, box } = await elementSvg(doc, snap, id);
      const canvas = await rasterize(svg, box.w, box.h, 2);
      slide.addImage({ data: await blobToDataUrl(await canvasToBlob(canvas, 'image/png')), x: box.x * IN, y: box.y * IN, w: box.w * IN, h: box.h * IN });
    }
    if (page.notes) slide.addNotes(page.notes);
    onProgress?.(++done, pageIds.length);
  }
  return (await pptx.write({ outputType: 'blob' })) as Blob;
}
