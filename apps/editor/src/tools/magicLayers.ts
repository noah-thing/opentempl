import type { Editor } from '../editor/Editor';
import type { ImageElement } from '../doc/types';
import { newId } from '../doc/design';
import { addUpload } from '../io/uploads';
import { splitIntoLayers } from '../generate/layers';
import { layerElements } from '../generate/build';
import { cutoutSubject, hasKey, inpaint } from '../generate/openai';

// Magic layers on any picture in a design: the photo is replaced, in place, by
// a group of a background, the cut out subject and editable text boxes.
export async function magicLayers(editor: Editor, el: ImageElement, opts: { subject: boolean; repaint: boolean }, onStatus: (s: string) => void) {
  const src = editor.doc.getAsset(el.assetId);
  if (!src) throw new Error('This frame has no picture yet');
  // Only the part of the picture that shows in the frame.
  const bmp = await createImageBitmap(new Blob([src.bytes as BlobPart], { type: src.mime }));
  const cw = Math.max(1, Math.round(bmp.width * el.crop.w)), ch = Math.max(1, Math.round(bmp.height * el.crop.h));
  const c = new OffscreenCanvas(cw, ch);
  c.getContext('2d')!.drawImage(bmp, -el.crop.x * bmp.width, -el.crop.y * bmp.height);
  const visible = await c.convertToBlob({ type: 'image/png' });

  const result = await splitIntoLayers(visible, {
    findText: true,
    separateSubject: opts.subject,
    repaint: opts.repaint && hasKey() ? (image, mask, prompt) => inpaint(image, mask, prompt) : undefined,
    cutout: opts.repaint && hasKey() ? (image) => cutoutSubject(image) : undefined,
    onStatus,
  });
  if (!result.texts.length && !result.subject) {
    editor.toast('Found no words and no clear subject in this picture');
    return;
  }
  const { elements, assets } = await layerElements(result, null, el.w, el.h);
  for (const a of assets) {
    editor.doc.addAsset(a);
    addUpload(a).catch(() => {});
  }
  // Place the layers where the picture was, turned the same way around its centre.
  const cx = el.x + el.w / 2, cy = el.y + el.h / 2;
  const rad = ((el.rotation || 0) * Math.PI) / 180;
  const gid = newId();
  const placed = elements.map((e) => {
    const ex = e.x + e.w / 2 - el.w / 2, ey = e.y + e.h / 2 - el.h / 2;
    const rx = ex * Math.cos(rad) - ey * Math.sin(rad), ry = ex * Math.sin(rad) + ey * Math.cos(rad);
    return { ...e, x: cx + rx - e.w / 2, y: cy + ry - e.h / 2, rotation: (e.rotation || 0) + (el.rotation || 0), opacity: el.opacity, groupId: gid };
  });
  const pageId = editor.s.elementPage[el.id];
  const at = editor.s.pages[pageId].elementIds.indexOf(el.id);
  editor.doc.undo.stopCapturing();
  editor.doc.transact(() => {
    editor.doc.deleteElements([el.id]);
    placed.forEach((e, i) => editor.doc.addElement(pageId, e, at + i));
  });
  editor.ui.set({ selection: placed.map((e) => e.id) });
  editor.refitAllText();
  const n = result.texts.length;
  editor.toast(`Split into ${result.subject ? 'background, subject' : 'background'}${n ? ` and ${n} text box${n === 1 ? '' : 'es'}` : ''}. Undo puts the picture back.`);
}
