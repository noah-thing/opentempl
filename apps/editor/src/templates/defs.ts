import type { Element, Fill, ImageElement, ShapeKind, TextElement, ChartElement, LineElement, ShapeElement } from '../doc/types';
import { makeChart, makeImage, makeLine, makeShape, makeText, NO_EFFECT, UI_FONT } from '../doc/factory';
import { coverCrop } from '../editor/Editor';
import type { TemplateDef } from './index';
import { STICKER_SIZES } from '../panels/stickers';

// ---------- helpers ----------

const PHOTO: Record<string, [number, number]> = {
  portrait: [2, 3], archipelago: [3, 2], coffee: [2, 3], sneaker: [1, 1], concert: [3, 2], plant: [2, 3], skater: [2, 3],
  food: [3, 2], desk: [3, 2], dog: [1, 1], city: [2, 3], flowers: [1, 1], friends: [3, 2], bread: [2, 3], runner: [2, 3],
  ocean: [3, 2], man: [2, 3], sushi: [3, 2], studio: [3, 2], forest: [2, 3],
};

const STICKER = STICKER_SIZES;

function photo(name: string, x: number, y: number, w: number, h: number, p: Partial<ImageElement> = {}): ImageElement {
  const [rw, rh] = PHOTO[name] ?? [1, 1];
  const crop = coverCrop(rw * 1000, rh * 1000, w, h);
  return makeImage({ assetId: `lib:photos/${name}.jpg`, x, y, w, h, crop, ...p });
}

function sticker(name: string, x: number, y: number, height: number, p: Partial<ImageElement> = {}): ImageElement {
  const [sw, sh] = STICKER[name];
  const w = (sw / sh) * height;
  return makeImage({ assetId: `lib:stickers/${name}.webp`, x, y, w, h: height, ...p });
}

function text(s: string, x: number, y: number, w: number, p: Partial<TextElement> = {}): TextElement {
  const fontSize = p.fontSize ?? 32;
  const lh = p.lineHeight ?? 1.2;
  return makeText({ text: s, x, y, w, h: fontSize * lh * s.split('\n').length, effect: NO_EFFECT, ...p });
}

function shape(kind: ShapeKind, x: number, y: number, w: number, h: number, color: string, p: Partial<ShapeElement> = {}): ShapeElement {
  return makeShape(kind, { x, y, w, h, fill: { type: 'solid', color }, ...p });
}

const solid = (color: string): Fill => ({ type: 'solid', color });

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

// Scale a whole template, for print formats designed at screen size.
function scaled(def: TemplateDef, k: number, size: [number, number]): TemplateDef {
  const el = (e: Element): Element => {
    const n = { ...e, x: e.x * k, y: e.y * k, w: e.w * k, h: e.h * k } as Element & Record<string, unknown>;
    if (n.type === 'text') n.fontSize = e.type === 'text' ? e.fontSize * k : 0;
    if (n.type === 'line' && e.type === 'line') n.width = e.width * k;
    if (n.type === 'shape' && e.type === 'shape' && e.stroke) n.stroke = { ...e.stroke, width: e.stroke.width * k };
    if ('radius' in n && typeof n.radius === 'number') n.radius = n.radius * k;
    return n as Element;
  };
  return { ...def, width: size[0], height: size[1], pages: def.pages.map((p) => ({ ...p, elements: p.elements.map(el) })) };
}

// ---------- templates ----------

export const DEFS: TemplateDef[] = [
  {
    id: 'fika-poster',
    name: 'Fika at four',
    category: 'Posters',
    width: 1123,
    height: 1587,
    formatId: 'a3-poster',
    pages: [
      {
        background: solid(CREAM),
        elements: [
          photo('coffee', 0, 0, 1123, 980),
          text('Fika\nat four.', 72, 1010, 980, { fontFamily: G, fontSize: 210, fontWeight: 500, lineHeight: 0.86, letterSpacing: -45, color: INK }),
          text('Cardamom buns from the oven, coffee by the pot,\nand nobody checks their email.', 78, 1420, 640, { fontFamily: G, fontSize: 26, lineHeight: 1.4, color: '#4A4A55' }),
          text('Every weekday\nKafé Linnea, Södermalm', 760, 1420, 300, { fontFamily: G, fontSize: 22, fontWeight: 600, lineHeight: 1.4, align: 'right', color: INK }),
          shape('burst', 840, 820, 230, 230, TOMATO, { rotation: 12 }),
          text('35 kr', 840, 905, 230, { fontFamily: G, fontSize: 52, fontWeight: 700, align: 'center', color: '#FFFFFF', rotation: 12, letterSpacing: -20 }),
        ],
      },
    ],
  },
  {
    id: 'open-studio',
    name: 'Open studio',
    category: 'Social',
    width: 1080,
    height: 1350,
    formatId: 'ig-post',
    pages: [
      {
        background: solid(COBALT),
        elements: [
          text('Open\nstudio', 64, 120, 960, { fontFamily: G, fontSize: 250, fontWeight: 500, lineHeight: 0.84, letterSpacing: -55, color: '#FFFFFF' }),
          sticker('voxel-cursor', 640, 560, 330, { rotation: -14 }),
          sticker('voxel-pen', 120, 760, 230, { rotation: 18 }),
          shape('pill', 64, 1150, 470, 84, '#FFFFFF'),
          text('Saturday, 12 to 18', 64, 1172, 470, { fontFamily: G, fontSize: 34, fontWeight: 600, align: 'center', color: COBALT }),
          text('Hornsgatan 54\nfree, bring a friend', 640, 1150, 380, { fontFamily: G, fontSize: 30, lineHeight: 1.3, align: 'right', color: '#FFFFFF' }),
        ],
      },
    ],
  },
  {
    id: 'game-night',
    name: 'Game night',
    category: 'Social',
    width: 1080,
    height: 1920,
    formatId: 'story',
    pages: [
      {
        background: solid(INK),
        elements: [
          text('PRESS\nSTART', 60, 300, 960, { fontFamily: 'Silkscreen', fontSize: 200, fontWeight: 700, lineHeight: 1, align: 'center', color: LEMON }),
          sticker('voxel-star', 360, 760, 380, { rotation: -8 }),
          text('game night', 60, 1210, 960, { fontFamily: 'Bungee', fontSize: 118, align: 'center', color: PINK, effect: { kind: 'neon', color: PINK, amount: 70, offset: 50, direction: 45 } }),
          text('FRIDAY 20:00\nBRING SNACKS, LOSE GRACEFULLY', 60, 1500, 960, { fontFamily: 'Silkscreen', fontSize: 40, lineHeight: 1.5, align: 'center', color: '#FFFFFF' }),
          sticker('voxel-eye', 80, 1660, 180, { rotation: 10 }),
          sticker('voxel-eye', 820, 1660, 180, { rotation: -6 }),
        ],
      },
    ],
  },
  {
    id: 'sneaker-drop',
    name: 'Sneaker drop',
    category: 'Social',
    width: 1080,
    height: 1080,
    formatId: 'ig-square',
    pages: [
      {
        background: solid('#E8231A'),
        elements: [
          photo('sneaker', 0, 0, 1080, 1080),
          text('DROP 03', 56, 48, 968, { fontFamily: 'Archivo Black', fontSize: 196, lineHeight: 0.9, letterSpacing: -40, color: '#FFFFFF' }),
          shape('ticket', 56, 900, 420, 120, LEMON, { rotation: -3 }),
          text('Friday 10:00', 56, 935, 420, { fontFamily: 'Archivo', fontSize: 42, fontWeight: 700, align: 'center', color: INK, rotation: -3 }),
          text('Only 300 pairs.\nNo restock.', 640, 920, 384, { fontFamily: 'Archivo', fontSize: 34, fontWeight: 600, lineHeight: 1.25, align: 'right', color: '#FFFFFF' }),
        ],
      },
    ],
  },
  {
    id: 'archipelago-thumb',
    name: 'Weekend in the archipelago',
    category: 'Video',
    width: 1280,
    height: 720,
    formatId: 'yt-thumb',
    pages: [
      {
        background: solid(INK),
        elements: [
          photo('archipelago', 0, 0, 1280, 720),
          text('48 hours,\nno wifi', 56, 300, 900, { fontFamily: G, fontSize: 150, fontWeight: 700, lineHeight: 0.9, letterSpacing: -40, color: '#FFFFFF', shadow: { x: 0, y: 8, blur: 40, color: 'rgba(0,0,0,0.45)' } }),
          shape('pill', 56, 56, 330, 68, LEMON),
          text('Stockholm archipelago', 56, 74, 330, { fontFamily: G, fontSize: 26, fontWeight: 600, align: 'center', color: INK }),
          sticker('glass-arrow', 1000, 360, 220, { rotation: 20 }),
        ],
      },
    ],
  },
  {
    id: 'quarter-deck',
    name: 'Quarter in review',
    category: 'Slides',
    width: 1920,
    height: 1080,
    formatId: 'slides',
    pages: [
      {
        background: solid('#FFFFFF'),
        transition: 'fade',
        notes: 'Welcome everyone. Twenty minutes, then questions. Start with the three numbers, end with what we change next quarter.',
        elements: [
          text('Q3', 120, 120, 600, { fontFamily: G, fontSize: 64, fontWeight: 600, color: COBALT }),
          text('What we shipped,\nwhat we learned', 120, 420, 1400, { fontFamily: G, fontSize: 150, fontWeight: 500, lineHeight: 0.92, letterSpacing: -45, color: INK, anim: { kind: 'rise', delay: 0, duration: 800 } }),
          makeLine({ x: 120, y: 900, w: 1680, h: 24, color: INK, width: 3 }),
          text('Studio Tavla · October', 120, 940, 900, { fontFamily: G, fontSize: 30, color: '#4A4A55' }),
          sticker('voxel-bucket', 1480, 110, 300, { rotation: 8, anim: { kind: 'pop', delay: 400, duration: 700 } }),
        ],
      },
      {
        background: solid(PAPER),
        transition: 'slide',
        notes: 'Pause on each number. The 38 percent is the one people will ask about: it comes from moving packing to the morning shift.',
        elements: [
          text('Three numbers', 120, 110, 1200, { fontFamily: G, fontSize: 72, fontWeight: 600, letterSpacing: -25, color: INK }),
          text('214', 120, 360, 520, { fontFamily: G, fontSize: 210, fontWeight: 500, letterSpacing: -60, color: COBALT, anim: { kind: 'rise', delay: 0, duration: 700 } }),
          text('new customers,\nmost from word of mouth', 128, 640, 480, { fontFamily: G, fontSize: 32, lineHeight: 1.35, color: '#4A4A55' }),
          text('38%', 700, 360, 520, { fontFamily: G, fontSize: 210, fontWeight: 500, letterSpacing: -60, color: TOMATO, anim: { kind: 'rise', delay: 150, duration: 700 } }),
          text('faster delivery\nthan last quarter', 708, 640, 480, { fontFamily: G, fontSize: 32, lineHeight: 1.35, color: '#4A4A55' }),
          text('4.8', 1280, 360, 520, { fontFamily: G, fontSize: 210, fontWeight: 500, letterSpacing: -60, color: INK, anim: { kind: 'rise', delay: 300, duration: 700 } }),
          text('average rating\nacross 1,200 reviews', 1288, 640, 480, { fontFamily: G, fontSize: 32, lineHeight: 1.35, color: '#4A4A55' }),
        ],
      },
      {
        background: solid('#FFFFFF'),
        transition: 'slide',
        elements: [
          text('Revenue by month', 120, 110, 1200, { fontFamily: G, fontSize: 72, fontWeight: 600, letterSpacing: -25, color: INK }),
          { ...makeChart('column', { x: 120, y: 260, w: 1100, h: 700, labels: ['Jul', 'Aug', 'Sep'], series: [{ name: 'This year', values: [420, 510, 640], color: COBALT }, { name: 'Last year', values: [300, 340, 360], color: '#C9CCD6' }], rounded: 14 }) } as ChartElement,
          text('September was our best month ever, mostly thanks to the autumn collection.', 1340, 420, 460, { fontFamily: G, fontSize: 40, fontWeight: 500, lineHeight: 1.25, letterSpacing: -10, color: INK }),
        ],
      },
      {
        background: solid(INK),
        transition: 'zoom',
        elements: [
          text('Thank you', 120, 380, 1680, { fontFamily: G, fontSize: 220, fontWeight: 500, letterSpacing: -60, align: 'center', color: '#FFFFFF', anim: { kind: 'blur', delay: 0, duration: 900 } }),
          text('Questions are very welcome.', 120, 680, 1680, { fontFamily: G, fontSize: 36, align: 'center', color: '#8A8A96' }),
        ],
      },
    ],
  },
  {
    id: 'wedding-invite',
    name: 'Save the date',
    category: 'Invites',
    width: 480,
    height: 673,
    formatId: 'invite',
    pages: [
      {
        background: solid(CREAM),
        elements: [
          photo('flowers', 110, 56, 260, 330, { mask: 'arch' }),
          text('SAVE THE DATE', 40, 420, 400, { fontFamily: G, fontSize: 13, fontWeight: 600, letterSpacing: 420, align: 'center', color: INK }),
          text('Anna & Erik', 40, 448, 400, { fontFamily: 'Cormorant Garamond', fontSize: 64, fontWeight: 500, lineHeight: 1, align: 'center', color: INK }),
          text('21 June 2027\nSandhamn, Stockholm archipelago', 40, 540, 400, { fontFamily: 'Cormorant Garamond', fontSize: 20, lineHeight: 1.35, align: 'center', color: '#4A4A55' }),
          text('Invitation to follow', 40, 620, 400, { fontFamily: G, fontSize: 11, letterSpacing: 200, align: 'center', color: '#8A8A96', uppercase: true }),
        ],
      },
    ],
  },
  {
    id: 'gig-poster',
    name: 'Gig poster',
    category: 'Posters',
    width: 1123,
    height: 1587,
    formatId: 'a3-poster',
    pages: [
      {
        background: solid(INK),
        elements: [
          photo('concert', 0, 0, 1123, 1587, { filters: { brightness: 0, contrast: 10, saturation: 0, temperature: 0, tint: 0, blur: 0, vignette: 0, grain: 22, preset: 'none', duotone: ['#1B1240', '#FF3C8E'] } }),
          text('SIGNAL\nLOST', 56, 90, 1011, { fontFamily: 'Rubik', fontSize: 250, fontWeight: 800, lineHeight: 0.86, letterSpacing: -30, color: '#FFFFFF', effect: { kind: 'glitch', color: '#000', amount: 50, offset: 55, direction: 0 } }),
          text('+ Midnattssol\n+ The Puffins', 64, 640, 600, { fontFamily: G, fontSize: 52, fontWeight: 600, lineHeight: 1.15, color: '#FFFFFF' }),
          makeLine({ x: 64, y: 1360, w: 995, h: 24, color: '#FFFFFF', width: 3 }),
          text('Debaser Strand', 64, 1400, 600, { fontFamily: G, fontSize: 44, fontWeight: 600, color: '#FFFFFF' }),
          text('14.03\n19:30', 760, 1400, 300, { fontFamily: G, fontSize: 44, fontWeight: 600, lineHeight: 1.1, align: 'right', color: LEMON }),
        ],
      },
    ],
  },
  {
    id: 'adopt-dog',
    name: 'Adopt me',
    category: 'Social',
    width: 1080,
    height: 1350,
    formatId: 'ig-post',
    pages: [
      {
        background: solid(MINT),
        elements: [
          photo('dog', 150, 180, 780, 780, { mask: 'blob' }),
          text('Hi, I am Bosse.', 64, 1010, 952, { fontFamily: G, fontSize: 118, fontWeight: 600, letterSpacing: -45, align: 'center', color: INK }),
          text('Three years old, loves sofas and snacks.\nLooking for a home in Stockholm.', 64, 1160, 952, { fontFamily: G, fontSize: 32, lineHeight: 1.35, align: 'center', color: '#123B2C' }),
          shape('burst', 800, 120, 200, 200, LEMON, { rotation: -10 }),
          text('Good\nboy', 800, 172, 200, { fontFamily: G, fontSize: 40, fontWeight: 700, lineHeight: 1, align: 'center', color: INK, rotation: -10 }),
        ],
      },
    ],
  },
  {
    id: 'bakery-menu',
    name: 'Bakery menu',
    category: 'Print',
    width: 794,
    height: 1123,
    formatId: 'a4',
    pages: [
      {
        background: solid(CREAM),
        elements: [
          photo('bread', 0, 0, 794, 420),
          text('Bageri\nNorrmalm', 56, 460, 700, { fontFamily: 'Playfair Display', fontSize: 84, fontWeight: 700, lineHeight: 0.95, color: INK }),
          makeLine({ x: 56, y: 650, w: 682, h: 24, color: INK, width: 2 }),
          text('Sourdough loaf\nRye with seeds\nCardamom bun\nCinnamon bun\nSemla, in season', 56, 690, 420, { fontFamily: G, fontSize: 30, lineHeight: 1.6, color: INK }),
          text('69\n74\n38\n35\n55', 520, 690, 218, { fontFamily: G, fontSize: 30, fontWeight: 600, lineHeight: 1.6, align: 'right', color: INK }),
          text('Open every day from 7. Bread sold out? Come back at 14, the second batch is worth it.', 56, 1010, 682, { fontFamily: G, fontSize: 18, lineHeight: 1.45, color: '#4A4A55' }),
        ],
      },
    ],
  },
  {
    id: 'run-club',
    name: 'Run club',
    category: 'Social',
    width: 1080,
    height: 1920,
    formatId: 'story',
    pages: [
      {
        background: solid(INK),
        elements: [
          photo('runner', 0, 0, 1080, 1920),
          shape('rect', 0, 1240, 1080, 680, LEMON),
          text('Run club', 64, 1290, 952, { fontFamily: G, fontSize: 180, fontWeight: 700, letterSpacing: -60, color: INK }),
          text('Sundays 08:00 at Rålambshovsparken.\n5 km easy, coffee after, every pace welcome.', 64, 1510, 900, { fontFamily: G, fontSize: 38, lineHeight: 1.35, color: INK }),
          text('#014', 64, 1780, 400, { fontFamily: G, fontSize: 34, fontWeight: 600, color: INK }),
        ],
      },
    ],
  },
  {
    id: 'ceramics-flyer',
    name: 'Ceramics workshop',
    category: 'Print',
    width: 559,
    height: 794,
    formatId: 'a5-flyer',
    pages: [
      {
        background: solid(PAPER),
        elements: [
          text('Workshop #023', 36, 36, 487, { fontFamily: G, fontSize: 18, fontWeight: 600, color: TOMATO }),
          text('Throw your\nfirst bowl', 36, 66, 487, { fontFamily: G, fontSize: 64, fontWeight: 500, lineHeight: 0.92, letterSpacing: -35, color: INK }),
          photo('studio', 36, 230, 487, 330, { radius: 18 }),
          text('Three Thursday evenings with Saga at Lera Studio. Clay, glaze and firing included. Max 8 people.', 36, 590, 330, { fontFamily: G, fontSize: 15, lineHeight: 1.45, color: '#4A4A55' }),
          shape('ellipse', 410, 590, 113, 113, COBALT),
          text('1 450\nkr', 410, 618, 113, { fontFamily: G, fontSize: 22, fontWeight: 700, lineHeight: 1.05, align: 'center', color: '#FFFFFF' }),
          text('lerastudio.se', 36, 740, 487, { fontFamily: G, fontSize: 14, fontWeight: 600, color: INK }),
        ],
      },
    ],
  },
  {
    id: 'portfolio-deck',
    name: 'Portfolio',
    category: 'Slides',
    width: 1920,
    height: 1080,
    formatId: 'slides',
    pages: [
      {
        background: solid(LILAC),
        elements: [
          photo('portrait', 1200, 0, 720, 1080),
          text('Maja Berg', 120, 140, 1000, { fontFamily: G, fontSize: 40, fontWeight: 600, color: INK }),
          text('I design\nquiet things\nfor loud\nbrands.', 120, 300, 1000, { fontFamily: G, fontSize: 132, fontWeight: 500, lineHeight: 0.9, letterSpacing: -45, color: INK }),
          text('Selected work 2024 to 2027', 120, 940, 700, { fontFamily: G, fontSize: 28, color: INK }),
        ],
      },
      {
        background: solid('#FFFFFF'),
        elements: [
          photo('desk', 0, 0, 1100, 1080),
          text('01', 1220, 120, 500, { fontFamily: G, fontSize: 40, fontWeight: 600, color: COBALT }),
          text('Lera Studio', 1220, 190, 600, { fontFamily: G, fontSize: 96, fontWeight: 500, letterSpacing: -40, color: INK }),
          text('A new identity for a ceramics studio in Stockholm: a wordmark drawn from the shape of a thrown bowl, signage, and a website that books classes.', 1220, 340, 560, { fontFamily: G, fontSize: 30, lineHeight: 1.45, color: '#4A4A55' }),
          text('Identity · Web · Signage', 1220, 920, 560, { fontFamily: G, fontSize: 24, fontWeight: 600, color: INK }),
        ],
      },
    ],
  },
  {
    id: 'sushi-menu',
    name: 'Omakase night',
    category: 'Posters',
    width: 1080,
    height: 1350,
    formatId: 'ig-post',
    pages: [
      {
        background: solid('#14110F'),
        elements: [
          photo('sushi', 0, 0, 1080, 760),
          text('Omakase\nnight', 64, 800, 700, { fontFamily: 'Cormorant Garamond', fontSize: 132, fontWeight: 600, lineHeight: 0.9, color: '#F4EFE6' }),
          text('Twelve pieces chosen by the chef.\nThursdays, two sittings, 18:00 and 20:30.', 64, 1110, 700, { fontFamily: G, fontSize: 28, lineHeight: 1.45, color: '#C9C2B6' }),
          shape('ellipse', 800, 830, 216, 216, TOMATO),
          text('895\nkr', 800, 880, 216, { fontFamily: G, fontSize: 48, fontWeight: 700, lineHeight: 1, align: 'center', color: '#FFFFFF' }),
        ],
      },
    ],
  },
  {
    id: 'forest-retreat',
    name: 'Forest retreat',
    category: 'Posters',
    width: 1080,
    height: 1920,
    formatId: 'story',
    pages: [
      {
        background: solid('#123B2C'),
        elements: [
          photo('forest', 0, 0, 1080, 1920),
          text('Slow\nweekend', 64, 140, 952, { fontFamily: G, fontSize: 210, fontWeight: 500, lineHeight: 0.86, letterSpacing: -55, color: '#FFFFFF' }),
          text('Two nights in a cabin in Tyresta. Sauna, a lake, no schedule.', 64, 1600, 700, { fontFamily: G, fontSize: 40, lineHeight: 1.3, color: '#FFFFFF' }),
          shape('pill', 64, 1760, 360, 80, '#FFFFFF'),
          text('Book a cabin', 64, 1781, 360, { fontFamily: G, fontSize: 32, fontWeight: 600, align: 'center', color: '#123B2C' }),
        ],
      },
    ],
  },
  {
    id: 'pixel-hello',
    name: 'Pixel hello',
    category: 'Social',
    width: 1600,
    height: 900,
    formatId: 'x-post',
    pages: [
      {
        background: solid(PAPER),
        elements: [
          text('We made a\ndesign tool.', 90, 110, 1100, { fontFamily: G, fontSize: 150, fontWeight: 500, lineHeight: 0.9, letterSpacing: -50, color: INK }),
          text('Free, open source, and your files stay yours.', 96, 470, 900, { fontFamily: G, fontSize: 40, color: '#4A4A55' }),
          sticker('voxel-cursor', 1180, 90, 300, { rotation: -10 }),
          sticker('voxel-star', 1320, 420, 240, { rotation: 12 }),
          sticker('voxel-frame', 1020, 520, 260, { rotation: -6 }),
          shape('pill', 96, 700, 330, 90, COBALT),
          text('tavla.app', 96, 722, 330, { fontFamily: G, fontSize: 38, fontWeight: 600, align: 'center', color: '#FFFFFF' }),
        ],
      },
    ],
  },
  {
    id: 'pink-quote',
    name: 'Quote card',
    category: 'Social',
    width: 1080,
    height: 1080,
    formatId: 'ig-square',
    pages: [
      {
        background: solid(PINK),
        elements: [
          text('“', 64, 20, 300, { fontFamily: G, fontSize: 320, fontWeight: 700, lineHeight: 1, color: '#FFFFFF' }),
          text('Make it simple,\nthen make it\nyours.', 64, 330, 952, { fontFamily: G, fontSize: 110, fontWeight: 600, lineHeight: 0.98, letterSpacing: -40, color: '#FFFFFF' }),
          text('Field notes, issue 7', 64, 940, 600, { fontFamily: G, fontSize: 30, fontWeight: 600, color: INK }),
          sticker('glass-squiggle', 880, 640, 340, { rotation: 18 }),
        ],
      },
    ],
  },
  scaled({
    id: 'business-card',
    name: 'Business card',
    category: 'Print',
    width: 321,
    height: 208,
    formatId: 'business-card',
    pages: [
      {
        background: solid(COBALT),
        elements: [text('Saga Lind', 20, 20, 281, { fontFamily: G, fontSize: 30, fontWeight: 600, letterSpacing: -20, color: '#FFFFFF' }), text('Ceramicist', 20, 58, 281, { fontFamily: G, fontSize: 13, color: '#DCDFFF' }), sticker('voxel-pen', 236, 120, 72, { rotation: 14 })],
      },
      {
        background: solid('#FFFFFF'),
        elements: [
          text('saga@lerastudio.se\n+46 70 123 45 67\nlerastudio.se', 20, 120, 281, { fontFamily: G, fontSize: 12, lineHeight: 1.5, color: INK }),
          shape('ellipse', 20, 20, 40, 40, TOMATO),
        ],
      },
    ],
  }, 1004 / 321, [1004, 650]),
];

void (null as unknown as LineElement | Element);
void makeLine;
