import type { Asset, DesignSnapshot, Element, ImageElement, Page, TextElement } from '../doc/types';
import { makeImage, makeShape, makeText, NO_EFFECT } from '../doc/factory';
import { newId } from '../doc/design';
import { prepareImage } from '../io/upload';
import { coverCrop } from '../editor/Editor';
import { LOOK_FORMATS, zonesFor, type Look } from './looks';
import type { Brief } from './prompt';
import { placeKnownText, splitIntoLayers, type FoundText, type LayerResult } from './layers';
import { cutoutSubject, getSettings, hasKey, inpaint } from './openai';

// Turns a generated picture into Tavla elements: either one image, or Magic
// layers (background, cut out subject, real text boxes).

export interface LayerChoice {
  layers: boolean; // split into layers at all
  subject: boolean; // also cut out the main subject
  repaint: boolean; // use the OpenAI key to rebuild what was behind text and subject
}

function textEl(t: FoundText, look: Look | null, sx: number, sy: number): TextElement {
  const head = t.role === 'headline';
  const font = look ? (head ? look.type.headline.font : look.type.body.font) : 'Host Grotesk';
  const weight = look ? (head ? look.type.headline.weight : look.type.body.weight) : head ? 700 : 500;
  const size = Math.max(10, Math.round(t.fontSize * sy));
  return makeText({
    text: t.text,
    x: Math.round(t.x * sx),
    y: Math.round(t.y * sy),
    w: Math.max(40, Math.round(t.w * sx * 1.08)),
    h: Math.round(t.h * sy),
    fontFamily: font,
    fontSize: size,
    fontWeight: weight,
    color: t.color,
    align: t.align,
    lineHeight: head ? 0.98 : 1.2,
    letterSpacing: head ? -20 : 0,
    uppercase: t.upper,
    role: t.role === 'headline' ? 'heading' : t.role === 'subline' ? 'subheading' : 'body',
    effect: NO_EFFECT,
    name: t.role === 'headline' ? 'Headline' : t.role === 'subline' ? 'Second line' : 'Details',
  });
}

// Elements for a page of size W x H from a layer split of an image of any size.
export async function layerElements(result: LayerResult, look: Look | null, W: number, H: number): Promise<{ elements: Element[]; assets: Asset[] }> {
  const assets: Asset[] = [];
  const elements: Element[] = [];
  const bg = await prepareImage(result.background, 'Background');
  assets.push(bg);
  elements.push(makeImage({ assetId: bg.id, x: 0, y: 0, w: W, h: H, crop: coverCrop(bg.width, bg.height, W, H), name: 'Background' }) as ImageElement);
  // The picture is stretched to cover the page: map image pixels to page units the same way.
  const crop = coverCrop(result.width, result.height, W, H);
  const sx = W / (result.width * crop.w), sy = H / (result.height * crop.h);
  const ox = crop.x * result.width, oy = crop.y * result.height;
  if (result.subject) {
    const s = await prepareImage(result.subject.blob, 'Subject');
    assets.push(s);
    elements.push(makeImage({ assetId: s.id, x: (result.subject.x - ox) * sx, y: (result.subject.y - oy) * sy, w: result.subject.w * sx, h: result.subject.h * sy, name: 'Subject' }) as ImageElement);
  }
  for (const t of result.texts) {
    const el = textEl({ ...t, x: t.x - ox, y: t.y - oy }, look, sx, sy);
    if (t.backing) {
      // The strip hugs the words: a little wider than a line of text, padded like a printed label.
      const pad = el.fontSize * 0.45;
      const lines = t.text.split('\n');
      // Generous width per character so the words never wrap past the strip (monospace faces run wide).
      const per = /mono|courier|code/i.test(el.fontFamily) ? 0.62 : 0.52;
      const natural = Math.max(...lines.map((l) => l.length)) * el.fontSize * per;
      el.w = Math.min(el.w, natural);
      const rows = lines.reduce((n, l) => n + Math.max(1, Math.ceil((l.length * el.fontSize * per) / el.w)), 0);
      elements.push(makeShape('rect', { x: el.x - pad, y: el.y - pad * 0.6, w: el.w + pad * 2, h: rows * el.fontSize * el.lineHeight + pad * 1.2, fill: { type: 'solid', color: t.backing }, name: 'Label' }));
    }
    elements.push(el);
  }
  return { elements, assets };
}

export async function designFromImage(image: Blob, look: Look, brief: Brief, choice: LayerChoice, onStatus: (s: string) => void): Promise<{ snapshot: DesignSnapshot; assets: Asset[] }> {
  const f = LOOK_FORMATS[brief.format];
  const W = f.width, H = f.height;
  let elements: Element[] = [];
  let assets: Asset[] = [];
  const repaint = choice.repaint && hasKey() ? (img: Blob, mask: Blob, prompt: string) => inpaint(img, mask, prompt) : undefined;
  if (!choice.layers) {
    const a = await prepareImage(image, look.name);
    assets = [a];
    elements = [makeImage({ assetId: a.id, x: 0, y: 0, w: W, h: H, crop: coverCrop(a.width, a.height, W, H), name: look.name }) as ImageElement];
  } else {
    // Made without text: set the brief's words in the Look's fonts. Made with text: read it back off the picture.
    const known = brief.textMode !== 'baked';
    const cutout = choice.repaint && hasKey() ? (img: Blob) => cutoutSubject(img) : undefined;
    const result = await splitIntoLayers(image, { findText: !known, separateSubject: choice.subject, repaint, cutout, onStatus });
    if (known) {
      // Words are placed by looking at the full picture, subject included, so they land in space that is really calm.
      const bmp = await createImageBitmap(result.background);
      const words = { headline: brief.headline, subline: brief.subline, details: brief.details };
      result.texts = (await placeKnownText(image, look, zonesFor(look, brief.format), words, W, H)).map((t) => ({
        ...t,
        // placeKnownText works in page units; layerElements expects picture pixels.
        x: t.x * (bmp.width / W),
        y: t.y * (bmp.height / H),
        w: t.w * (bmp.width / W),
        h: t.h * (bmp.height / H),
        fontSize: t.fontSize * (bmp.height / H),
      }));
      if (brief.textMode === 'none') result.texts = [];
    }
    ({ elements, assets } = await layerElements(result, look, W, H));
  }
  const pid = newId();
  const els: Record<string, Element> = {};
  for (const e of elements) els[e.id] = e;
  const page: Page = { id: pid, name: '', background: { type: 'solid', color: '#FFFFFF' }, elementIds: elements.map((e) => e.id), notes: '', transition: 'none', duration: 5 };
  const now = Date.now();
  return {
    snapshot: {
      meta: { id: '', title: brief.headline.trim() || look.name, width: W, height: H, unit: 'px', createdAt: now, updatedAt: now, formatId: f.formatId },
      pageOrder: [pid],
      pages: { [pid]: page },
      elements: els,
    },
    assets,
  };
}

export const repaintAvailable = () => hasKey() && !!getSettings().model;
