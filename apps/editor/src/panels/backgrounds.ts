import type { Editor } from '../editor/Editor';
import { assetFromUrl } from '../io/upload';

const base = `${import.meta.env.BASE_URL}library/`;

// Background textures made for OpenTempl. Filled in as the library grows.
export const BACKGROUNDS: { url: string; thumb: string; name: string }[] = [
  'mesh-pink',
  'mesh-blue',
  'mesh-sunset',
  'mesh-mint',
  'paper-cream',
  'paper-kraft',
  'riso-grain',
  'dark-grain',
].map((id) => ({ url: `${base}backgrounds/${id}.jpg`, thumb: `${base}thumbs/bg-${id}.jpg`, name: id.replace('-', ' ') }));

export async function placeBackgroundPhoto(editor: Editor, pageId: string, url: string, name: string) {
  try {
    const asset = await assetFromUrl(url, name, 'OpenTempl library');
    editor.doc.addAsset(asset);
    editor.doc.updatePage(pageId, { background: { type: 'image', assetId: asset.id, fit: 'cover', opacity: 1 } });
  } catch {
    editor.toast('That background is not available yet');
  }
}
