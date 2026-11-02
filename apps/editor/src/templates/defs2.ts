import type { Fill, ImageElement, ShapeElement, ShapeKind, TextElement } from '../doc/types';
import { makeChart, makeImage, makeLine, makeQr, makeShape, makeTable, makeText, NO_EFFECT, UI_FONT } from '../doc/factory';
import { coverCrop } from '../editor/Editor';
import { STICKER_SIZES } from '../panels/stickers';
import type { TemplateDef } from './index';

// Second batch: decks, print, invites and brand pieces, using the character
// stickers and the background textures.

const PHOTO: Record<string, [number, number]> = {
  portrait: [2, 3], archipelago: [3, 2], coffee: [2, 3], sneaker: [1, 1], concert: [3, 2], plant: [2, 3], skater: [2, 3],
  food: [3, 2], desk: [3, 2], dog: [1, 1], city: [2, 3], flowers: [1, 1], friends: [3, 2], bread: [2, 3], runner: [2, 3],
  ocean: [3, 2], man: [2, 3], sushi: [3, 2], studio: [3, 2], forest: [2, 3],
};

function photo(name: string, x: number, y: number, w: number, h: number, p: Partial<ImageElement> = {}): ImageElement {
  const [rw, rh] = PHOTO[name] ?? [1, 1];
  return makeImage({ assetId: `lib:photos/${name}.jpg`, x, y, w, h, crop: coverCrop(rw * 1000, rh * 1000, w, h), ...p });
}

function sticker(name: string, x: number, y: number, height: number, p: Partial<ImageElement> = {}): ImageElement {
  const [sw, sh] = STICKER_SIZES[name];
  return makeImage({ assetId: `lib:stickers/${name}.webp`, x, y, w: (sw / sh) * height, h: height, ...p });
}

function text(s: string, x: number, y: number, w: number, p: Partial<TextElement> = {}): TextElement {
  const fontSize = p.fontSize ?? 32;
  return makeText({ text: s, x, y, w, h: fontSize * (p.lineHeight ?? 1.2) * s.split('\n').length, effect: NO_EFFECT, ...p });
}

function shape(kind: ShapeKind, x: number, y: number, w: number, h: number, color: string, p: Partial<ShapeElement> = {}): ShapeElement {
  return makeShape(kind, { x, y, w, h, fill: { type: 'solid', color }, ...p });
}

const solid = (color: string): Fill => ({ type: 'solid', color });
const bg = (name: string): Fill => ({ type: 'image', assetId: `lib:backgrounds/${name}.jpg`, fit: 'cover', opacity: 1 });

const INK = '#0B0B0D';
const COBALT = '#2B3BFF';
const TOMATO = '#FF4B39';
const LEMON = '#FFE600';
const MINT = '#3EDD8A';
const PINK = '#FF3C8E';
const LILAC = '#9AA2EA';
const PAPER = '#EDEDF0';
const CREAM = '#F4EFE6';
const G = UI_FONT;

export const DEFS2: TemplateDef[] = [
  {
    id: 'pitch-deck',
    name: 'Pitch deck',
    category: 'Slides',
    width: 1920,
    height: 1080,
    formatId: 'slides',
    pages: [
      {
        background: bg('mesh-blue'),
        transition: 'fade',
        elements: [
          text('Lera', 120, 110, 600, { fontFamily: G, fontSize: 48, fontWeight: 700, color: '#FFFFFF' }),
          text('Pottery classes\nyou can book\nin ten seconds.', 120, 330, 1300, { fontFamily: G, fontSize: 132, fontWeight: 500, lineHeight: 0.92, letterSpacing: -45, color: '#FFFFFF', anim: { kind: 'rise', delay: 0, duration: 800 } }),
          text('Seed round · 2027', 120, 930, 800, { fontFamily: G, fontSize: 30, color: 'rgba(255,255,255,0.8)' }),
          sticker('char-blob-blue', 1460, 640, 300, { rotation: -8, anim: { kind: 'pop', delay: 500, duration: 700 } }),
        ],
      },
      {
        background: solid('#FFFFFF'),
        transition: 'slide',
        elements: [
          text('01 · The problem', 120, 110, 900, { fontFamily: G, fontSize: 30, fontWeight: 600, color: TOMATO }),
          text('Studios run on DMs,\nspreadsheets and hope.', 120, 200, 1500, { fontFamily: G, fontSize: 104, fontWeight: 500, lineHeight: 0.98, letterSpacing: -40, color: INK }),
          text('Six in ten classes in Stockholm are booked through Instagram messages. Half of no shows never get a reminder.', 120, 560, 820, { fontFamily: G, fontSize: 36, lineHeight: 1.4, color: '#4A4A55' }),
          photo('studio', 1080, 520, 720, 440, { radius: 24 }),
        ],
      },
      {
        background: solid(PAPER),
        transition: 'slide',
        elements: [
          text('02 · Traction', 120, 110, 900, { fontFamily: G, fontSize: 30, fontWeight: 600, color: COBALT }),
          text('Bookings per month', 120, 200, 1200, { fontFamily: G, fontSize: 72, fontWeight: 600, letterSpacing: -25, color: INK }),
          makeChart('area', { x: 120, y: 330, w: 1100, h: 620, labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'], series: [{ name: 'Bookings', values: [120, 210, 380, 520, 790, 1140], color: COBALT }], showLegend: false }),
          text('×9.5', 1320, 420, 480, { fontFamily: G, fontSize: 210, fontWeight: 500, letterSpacing: -60, color: INK }),
          text('in six months, with no paid marketing.', 1328, 680, 460, { fontFamily: G, fontSize: 32, lineHeight: 1.35, color: '#4A4A55' }),
        ],
      },
      {
        background: solid(INK),
        transition: 'zoom',
        elements: [
          text('03 · The ask', 120, 110, 900, { fontFamily: G, fontSize: 30, fontWeight: 600, color: LEMON }),
          text('8 MSEK to open\nin Oslo and Copenhagen.', 120, 300, 1600, { fontFamily: G, fontSize: 128, fontWeight: 500, lineHeight: 0.95, letterSpacing: -45, color: '#FFFFFF' }),
          text('hello@lera.app', 120, 900, 800, { fontFamily: G, fontSize: 36, fontWeight: 600, color: '#FFFFFF' }),
        ],
      },
    ],
  },
  {
    id: 'resume',
    name: 'Resume',
    category: 'Print',
    width: 794,
    height: 1123,
    formatId: 'a4',
    pages: [
      {
        background: solid('#FFFFFF'),
        elements: [
          photo('man', 56, 56, 150, 150, { mask: 'ellipse' }),
          text('Omar Haddad', 236, 72, 500, { fontFamily: G, fontSize: 52, fontWeight: 600, letterSpacing: -30, color: INK }),
          text('Product designer · Stockholm', 238, 140, 500, { fontFamily: G, fontSize: 20, color: '#4A4A55' }),
          makeLine({ x: 56, y: 240, w: 682, h: 24, color: INK, width: 2 }),
          text('Experience', 56, 290, 200, { fontFamily: G, fontSize: 16, fontWeight: 700, color: COBALT, uppercase: true, letterSpacing: 120 }),
          text('Lead designer, Lera\n2025 to now\n\nDesigner, Studio Norr\n2021 to 2025\n\nIntern, Spotify\n2020', 260, 286, 478, { fontFamily: G, fontSize: 19, lineHeight: 1.5, color: INK }),
          text('Skills', 56, 640, 200, { fontFamily: G, fontSize: 16, fontWeight: 700, color: COBALT, uppercase: true, letterSpacing: 120 }),
          text('Interface design, design systems, prototyping, type, workshops, a little code', 260, 636, 478, { fontFamily: G, fontSize: 19, lineHeight: 1.5, color: INK }),
          text('Education', 56, 760, 200, { fontFamily: G, fontSize: 16, fontWeight: 700, color: COBALT, uppercase: true, letterSpacing: 120 }),
          text('Beckmans College of Design\nVisual communication, 2018 to 2021', 260, 756, 478, { fontFamily: G, fontSize: 19, lineHeight: 1.5, color: INK }),
          text('Contact', 56, 900, 200, { fontFamily: G, fontSize: 16, fontWeight: 700, color: COBALT, uppercase: true, letterSpacing: 120 }),
          text('omar@haddad.se\n+46 70 555 01 23\nhaddad.se', 260, 896, 478, { fontFamily: G, fontSize: 19, lineHeight: 1.5, color: INK }),
        ],
      },
    ],
  },
  {
    id: 'certificate',
    name: 'Certificate',
    category: 'Print',
    width: 1123,
    height: 794,
    formatId: 'a4',
    pages: [
      {
        background: solid(CREAM),
        elements: [
          shape('rect', 32, 32, 1059, 730, 'transparent', { stroke: { color: INK, width: 3, dash: 'solid' }, fill: { type: 'solid', color: 'transparent' } }),
          text('CERTIFICATE OF COMPLETION', 80, 110, 963, { fontFamily: G, fontSize: 20, fontWeight: 600, letterSpacing: 400, align: 'center', color: INK }),
          text('Saga Lind', 80, 200, 963, { fontFamily: 'Cormorant Garamond', fontSize: 120, fontWeight: 600, align: 'center', color: INK }),
          text('finished Throw your first bowl, three evenings at Lera Studio,\nand made four bowls that hold soup without leaking.', 120, 380, 883, { fontFamily: G, fontSize: 24, lineHeight: 1.5, align: 'center', color: '#4A4A55' }),
          makeLine({ x: 180, y: 620, w: 280, h: 24, color: INK, width: 2 }),
          makeLine({ x: 663, y: 620, w: 280, h: 24, color: INK, width: 2 }),
          text('Teacher', 180, 650, 280, { fontFamily: G, fontSize: 16, align: 'center', color: '#4A4A55' }),
          text('14 March 2027', 663, 650, 280, { fontFamily: G, fontSize: 16, align: 'center', color: '#4A4A55' }),
          shape('burst', 490, 560, 140, 140, TOMATO),
          text('#023', 490, 612, 140, { fontFamily: G, fontSize: 28, fontWeight: 700, align: 'center', color: '#FFFFFF' }),
        ],
      },
    ],
  },
  {
    id: 'birthday',
    name: 'Birthday party',
    category: 'Invites',
    width: 1080,
    height: 1350,
    formatId: 'ig-post',
    pages: [
      {
        background: bg('mesh-pink'),
        elements: [
          text('Elsa is\nturning 7!', 64, 130, 952, { fontFamily: 'Rubik', fontSize: 170, fontWeight: 800, lineHeight: 0.9, letterSpacing: -30, align: 'center', color: '#FFFFFF', shadow: { x: 0, y: 10, blur: 30, color: 'rgba(160,20,90,0.35)' } }),
          sticker('char-star-yellow', 130, 560, 280, { rotation: -12 }),
          sticker('char-cloud-lilac', 640, 610, 210, { rotation: 8 }),
          sticker('char-circle-mint', 460, 720, 190, { rotation: -4 }),
          shape('pill', 190, 1040, 700, 110, '#FFFFFF'),
          text('Saturday 3 May, 14:00 · Vasaparken', 190, 1075, 700, { fontFamily: G, fontSize: 34, fontWeight: 600, align: 'center', color: PINK }),
          text('Cake guaranteed. Costumes encouraged.', 64, 1200, 952, { fontFamily: G, fontSize: 30, align: 'center', color: '#FFFFFF' }),
        ],
      },
    ],
  },
  {
    id: 'carousel',
    name: 'Carousel: five tips',
    category: 'Social',
    width: 1080,
    height: 1350,
    formatId: 'ig-post',
    pages: [
      {
        background: solid(LEMON),
        elements: [
          text('5 ways to\nmake posters\npeople stop for', 64, 150, 952, { fontFamily: G, fontSize: 130, fontWeight: 600, lineHeight: 0.92, letterSpacing: -45, color: INK }),
          sticker('voxel-eye', 700, 820, 300, { rotation: 10 }),
          text('Swipe →', 64, 1200, 400, { fontFamily: G, fontSize: 36, fontWeight: 600, color: INK }),
        ],
      },
      {
        background: solid(INK),
        elements: [
          text('01', 64, 100, 400, { fontFamily: G, fontSize: 64, fontWeight: 600, color: LEMON }),
          text('One thing\nhuge.', 64, 300, 952, { fontFamily: G, fontSize: 170, fontWeight: 600, lineHeight: 0.9, letterSpacing: -50, color: '#FFFFFF' }),
          text('Pick the single most important word and make it ten times bigger than everything else.', 64, 900, 860, { fontFamily: G, fontSize: 40, lineHeight: 1.35, color: '#C9C9D3' }),
        ],
      },
      {
        background: solid(COBALT),
        elements: [
          text('02', 64, 100, 400, { fontFamily: G, fontSize: 64, fontWeight: 600, color: LEMON }),
          text('One colour,\nlouder.', 64, 300, 952, { fontFamily: G, fontSize: 170, fontWeight: 600, lineHeight: 0.9, letterSpacing: -50, color: '#FFFFFF' }),
          text('A full field of one saturated colour reads from across the street. Three colours read as noise.', 64, 900, 860, { fontFamily: G, fontSize: 40, lineHeight: 1.35, color: '#DCDFFF' }),
        ],
      },
      {
        background: solid(PAPER),
        elements: [
          text('03', 64, 100, 400, { fontFamily: G, fontSize: 64, fontWeight: 600, color: TOMATO }),
          text('Objects at\nthe edges.', 64, 300, 952, { fontFamily: G, fontSize: 170, fontWeight: 600, lineHeight: 0.9, letterSpacing: -50, color: INK }),
          sticker('voxel-heart', 760, 840, 240, { rotation: 14 }),
          sticker('voxel-bolt', 60, 980, 220, { rotation: -16 }),
        ],
      },
    ],
  },
  {
    id: 'podcast-cover',
    name: 'Podcast cover',
    category: 'Social',
    width: 1400,
    height: 1400,
    pages: [
      {
        background: solid(TOMATO),
        elements: [
          text('Late\nShift', 90, 120, 1220, { fontFamily: G, fontSize: 380, fontWeight: 700, lineHeight: 0.82, letterSpacing: -60, color: INK }),
          sticker('char-square-red', 860, 820, 420, { rotation: 8 }),
          text('A podcast about\nmaking things at night', 96, 1150, 700, { fontFamily: G, fontSize: 52, fontWeight: 500, lineHeight: 1.15, color: INK }),
        ],
      },
    ],
  },
  {
    id: 'logo-pixel',
    name: 'Logo: pixel mark',
    category: 'Brand',
    width: 500,
    height: 500,
    formatId: 'logo',
    pages: [
      {
        background: solid(PAPER),
        elements: [
          sticker('voxel-crown', 130, 100, 200),
          text('Kungen', 40, 330, 420, { fontFamily: 'Silkscreen', fontSize: 64, fontWeight: 700, align: 'center', color: INK }),
          text('BURGERS SINCE 2019', 40, 410, 420, { fontFamily: G, fontSize: 16, fontWeight: 600, letterSpacing: 300, align: 'center', color: '#4A4A55' }),
        ],
      },
    ],
  },
  {
    id: 'logo-badge',
    name: 'Logo: round badge',
    category: 'Brand',
    width: 500,
    height: 500,
    formatId: 'logo',
    pages: [
      {
        background: solid('#FFFFFF'),
        elements: [
          shape('ellipse', 26, 26, 448, 448, MINT),
          text('FIKA CLUB · EST 2027 · FIKA CLUB · EST 2027 ·', 70, 235.6, 360, { fontFamily: G, fontSize: 24, fontWeight: 700, letterSpacing: 120, curve: 100, align: 'center', color: INK }),
          sticker('char-circle-mint', 160, 160, 180),
        ],
      },
    ],
  },
  {
    id: 'linkedin-banner',
    name: 'LinkedIn banner',
    category: 'Web',
    width: 1584,
    height: 396,
    pages: [
      {
        background: bg('mesh-sunset'),
        elements: [
          text('Design for slow brands.', 520, 120, 1000, { fontFamily: G, fontSize: 88, fontWeight: 600, letterSpacing: -35, color: INK }),
          text('Maja Berg · Studio in Stockholm · open for 2027', 524, 240, 1000, { fontFamily: G, fontSize: 30, color: INK }),
        ],
      },
    ],
  },
  {
    id: 'email-header',
    name: 'Newsletter header',
    category: 'Web',
    width: 1200,
    height: 400,
    formatId: 'email-header',
    pages: [
      {
        background: solid(INK),
        elements: [
          text('Field notes', 64, 100, 800, { fontFamily: G, fontSize: 120, fontWeight: 600, letterSpacing: -45, color: '#FFFFFF' }),
          text('Issue 7 · October', 68, 260, 600, { fontFamily: G, fontSize: 30, color: '#8A8A96' }),
          sticker('glass-blob', 900, 70, 260, { rotation: 12 }),
        ],
      },
    ],
  },
  {
    id: 'recipe-card',
    name: 'Recipe card',
    category: 'Print',
    width: 559,
    height: 794,
    formatId: 'a5-flyer',
    pages: [
      {
        background: solid(CREAM),
        elements: [
          photo('food', 0, 0, 559, 330),
          text('Tomato pasta,\nthe weeknight one', 36, 360, 487, { fontFamily: 'Playfair Display', fontSize: 40, fontWeight: 700, lineHeight: 1.05, color: INK }),
          text('Serves 4 · 25 min', 36, 460, 487, { fontFamily: G, fontSize: 15, fontWeight: 600, color: TOMATO }),
          text('400 g spaghetti\n500 g cherry tomatoes\n3 cloves garlic\nOlive oil, salt, basil\nParmesan to finish', 36, 500, 220, { fontFamily: G, fontSize: 14, lineHeight: 1.6, color: INK }),
          text('Roast the tomatoes with garlic and oil at 220° for 15 minutes. Boil the pasta, keep a cup of the water, toss everything with basil and enough water to make it glossy.', 280, 500, 243, { fontFamily: G, fontSize: 13, lineHeight: 1.55, color: '#4A4A55' }),
        ],
      },
    ],
  },
  {
    id: 'whiteboard',
    name: 'Brainstorm board',
    category: 'Whiteboard',
    width: 4000,
    height: 2600,
    formatId: 'whiteboard',
    pages: [
      {
        background: solid('#F7F7F9'),
        elements: [
          text('Summer campaign ideas', 200, 160, 3000, { fontFamily: G, fontSize: 220, fontWeight: 600, letterSpacing: -40, color: INK }),
          ...[
            ['Rooftop film night', LEMON, 160, 520, -2],
            ['Free fika with every booking', MINT, 640, 560, 2],
            ['Kids class Saturdays', '#FFD8E4', 1120, 500, -1],
            ['Collab with the bakery', LILAC, 160, 1000, 1],
            ['Pottery + pasta evening', LEMON, 640, 1040, -2],
            ['Open studio, 12 to 18', MINT, 1120, 980, 2],
          ].flatMap(([t, c, x, y, r]) => [
            shape('rect', (x as number) * 1.3, (y as number) * 1.2, 560, 560, c as string, { radius: 10, rotation: r as number, shadow: { x: 0, y: 18, blur: 40, color: 'rgba(0,0,0,0.12)' } }),
            text(t as string, (x as number) * 1.3 + 50, (y as number) * 1.2 + 64, 460, { fontFamily: 'Caveat', fontSize: 84, fontWeight: 700, lineHeight: 1.05, rotation: r as number, color: INK }),
          ]),
          sticker('char-blob-blue', 2160, 1700, 420, { rotation: -6 }),
          text('Vote with a dot →', 2100, 2160, 900, { fontFamily: 'Caveat', fontSize: 80, fontWeight: 700, color: COBALT }),
          makeTable(4, 3, { x: 2280, y: 600, w: 1500, h: 600, cells: [['Idea', 'Cost', 'Owner'], ['Film night', '4 000 kr', 'Saga'], ['Kids class', '800 kr', 'Omar'], ['Bakery collab', '0 kr', 'Maja']], fontSize: 40 }),
          makeQr('https://opentempl.org', { x: 3500, y: 2160, w: 300, h: 300 }),
        ],
      },
    ],
  },
  {
    id: 'sale-story',
    name: 'Sale story',
    category: 'Social',
    width: 1080,
    height: 1920,
    formatId: 'story',
    pages: [
      {
        background: bg('riso-grain'),
        elements: [
          text('SALE', 40, 170, 1000, { fontFamily: 'Archivo Black', fontSize: 300, lineHeight: 0.9, letterSpacing: -30, align: 'center', color: LEMON }),
          text('−40%', 40, 500, 1000, { fontFamily: 'Archivo Black', fontSize: 220, align: 'center', color: '#FFFFFF', effect: { kind: 'splice', color: PINK, amount: 40, offset: 50, direction: 45 } }),
          photo('sneaker', 190, 880, 700, 700, { mask: 'squircle' }),
          text('This weekend only, in store and online', 80, 1680, 920, { fontFamily: G, fontSize: 44, fontWeight: 600, align: 'center', color: '#FFFFFF' }),
        ],
      },
    ],
  },
  {
    id: 'city-guide',
    name: 'City guide',
    category: 'Posters',
    width: 1123,
    height: 1587,
    formatId: 'a3-poster',
    pages: [
      {
        background: solid(PAPER),
        elements: [
          photo('city', 0, 0, 1123, 1000),
          text('Stockholm\nin winter', 72, 1040, 980, { fontFamily: G, fontSize: 170, fontWeight: 500, lineHeight: 0.88, letterSpacing: -50, color: INK }),
          text('Six warm places to sit when it gets dark at three.', 78, 1400, 560, { fontFamily: G, fontSize: 30, lineHeight: 1.35, color: '#4A4A55' }),
          shape('pill', 760, 1410, 300, 80, COBALT),
          text('Guide #04', 760, 1431, 300, { fontFamily: G, fontSize: 32, fontWeight: 600, align: 'center', color: '#FFFFFF' }),
          sticker('char-flower-pink', 900, 860, 200, { rotation: 10 }),
        ],
      },
    ],
  },
];
