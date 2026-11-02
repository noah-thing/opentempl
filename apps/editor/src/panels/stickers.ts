// OpenTempl's own sticker library: voxel tools, googly characters and glass shapes
// made for OpenTempl, shipped with the app and free to use for anything.

const base = `${import.meta.env.BASE_URL}library/stickers/`;

export const STICKER_SIZES: Record<string, [number, number]> = {
  'voxel-cursor': [454, 640],
  'voxel-eye': [626, 640],
  'voxel-star': [574, 640],
  'voxel-heart': [640, 626],
  'voxel-pen': [559, 640],
  'voxel-bucket': [521, 640],
  'voxel-bubble': [640, 573],
  'voxel-bolt': [445, 640],
  'voxel-frame': [562, 640],
  'voxel-camera': [640, 544],
  'voxel-crown': [640, 535],
  'voxel-flower': [591, 640],
  'voxel-scissors': [532, 640],
  'voxel-padlock': [479, 640],
  'char-blob-blue': [640, 627],
  'char-square-red': [640, 626],
  'char-star-yellow': [640, 612],
  'char-circle-mint': [639, 640],
  'char-flower-pink': [608, 640],
  'char-cloud-lilac': [640, 438],
  'glass-arrow': [640, 602],
  'glass-blob': [640, 633],
  'glass-squiggle': [295, 640],
};

const NAMES: Record<string, string> = {
  'char-blob-blue': 'Curious blob',
  'char-square-red': 'Suspicious square',
  'char-star-yellow': 'Surprised star',
  'char-circle-mint': 'Happy circle',
  'char-flower-pink': 'Sleepy flower',
  'char-cloud-lilac': 'Shy cloud',
};

export const STICKERS: { id: string; url: string; name: string; w: number; h: number; group: 'Voxel' | 'Characters' | 'Glass' }[] = Object.entries(STICKER_SIZES).map(([id, [w, h]]) => ({
  id,
  url: `${base}${id}.webp`,
  name: NAMES[id] ?? id.split('-').slice(1).join(' ').replace(/^./, (c) => c.toUpperCase()),
  w,
  h,
  group: id.startsWith('voxel') ? 'Voxel' : id.startsWith('char') ? 'Characters' : 'Glass',
}));
