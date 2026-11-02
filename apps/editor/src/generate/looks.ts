// Looks: visual styles for the Generate tab. Each Look is a written art
// direction (public/looks/looks.json) plus a sample image made from it
// (public/looks/samples/<id>.jpg). The prompt composer turns a Look and the
// user's brief into one long, specific prompt for an image model.

export type LookFormat = 'post' | 'square' | 'story' | 'poster' | 'slide' | 'flyer';
export type TextRole = 'headline' | 'subline' | 'details';

export interface TextZone {
  role: TextRole;
  x: number; // fractions of the page, 0..1
  y: number;
  w: number;
  h: number;
  align: 'left' | 'center' | 'right';
}

// A Pinterest pin a Look was drawn from. Shown straight from Pinterest with its credit, never copied.
export interface LookRef {
  pin: string;
  url: string;
  img: string;
  w: number;
  h: number;
  author: string | null;
  authorUrl: string | null;
}

export interface Look {
  id: string;
  name: string;
  blurb: string;
  vibe: string;
  tags: string[];
  medium: string;
  palette: { colors: string[]; note: string };
  composition: string;
  typography: string;
  texture: string;
  signature: string[];
  avoid: string[];
  formats: LookFormat[];
  type: {
    headline: { font: string; weight: number; upper: boolean; color: string };
    body: { font: string; weight: number };
  };
  textZones: Partial<Record<'poster' | 'post' | 'story', TextZone[]>>;
  example: { subject: string; headline: string; subline: string; details: string };
  sampleBrief: string;
  refs?: LookRef[];
}

// The pins sent along to the image model as style references (by URL; OpenAI fetches them).
export const styleRefs = (look: Look) => (look.refs ?? []).slice(0, 2);

const base = () => `${import.meta.env.BASE_URL}looks/`;

let looksP: Promise<Look[]> | null = null;
export function loadLooks(): Promise<Look[]> {
  looksP ??= fetch(base() + 'looks.json')
    .then((r) => (r.ok ? r.json() : []))
    .catch(() => []);
  return looksP;
}

export function sampleUrl(id: string) {
  return base() + `samples/${id}.jpg`;
}

// Page sizes per format: what the design is, and the size the image model is asked for
// (GPT image models want both sides divisible by 16).
export const LOOK_FORMATS: Record<LookFormat, { name: string; width: number; height: number; formatId: string; api: string; aspect: string; zones: 'poster' | 'post' | 'story' }> = {
  post: { name: 'Instagram post', width: 1080, height: 1350, formatId: 'ig-post', api: '1088x1360', aspect: '4:5 portrait', zones: 'post' },
  square: { name: 'Square post', width: 1080, height: 1080, formatId: 'ig-square', api: '1024x1024', aspect: '1:1 square', zones: 'post' },
  story: { name: 'Story', width: 1080, height: 1920, formatId: 'story', api: '1088x1936', aspect: '9:16 tall portrait', zones: 'story' },
  poster: { name: 'Poster', width: 1123, height: 1587, formatId: 'a3-poster', api: '1152x1632', aspect: 'A3 portrait (1:1.41)', zones: 'poster' },
  flyer: { name: 'Flyer', width: 559, height: 794, formatId: 'a5-flyer', api: '1152x1632', aspect: 'A5 portrait (1:1.41)', zones: 'poster' },
  slide: { name: 'Slide', width: 1920, height: 1080, formatId: 'slides', api: '1920x1088', aspect: '16:9 landscape', zones: 'post' },
};

// Older GPT image models only take three sizes.
export function legacySize(f: LookFormat) {
  const { width, height } = LOOK_FORMATS[f];
  return width === height ? '1024x1024' : width > height ? '1536x1024' : '1024x1536';
}

// Text zones for a format, falling back to a sensible layout when the Look has none.
export function zonesFor(look: Look, f: LookFormat): TextZone[] {
  const key = LOOK_FORMATS[f].zones;
  const z = look.textZones[key] ?? look.textZones.poster ?? look.textZones.post ?? look.textZones.story;
  if (z?.length) return z;
  return [
    { role: 'headline', x: 0.07, y: 0.06, w: 0.86, h: 0.2, align: 'left' },
    { role: 'subline', x: 0.07, y: 0.27, w: 0.6, h: 0.08, align: 'left' },
    { role: 'details', x: 0.07, y: 0.86, w: 0.86, h: 0.08, align: 'left' },
  ];
}
