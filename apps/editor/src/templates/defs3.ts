import type { Fill, ImageElement, ShapeElement, ShapeKind, TextElement } from '../doc/types';
import { makeChart, makeImage, makeLine, makeQr, makeShape, makeTable, makeText, NO_EFFECT, UI_FONT } from '../doc/factory';
import { coverCrop } from '../editor/Editor';
import { STICKER_SIZES } from '../panels/stickers';
import type { TemplateDef } from './index';

// Third batch: market and event pieces, a product deck, planners and posters.

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

export const DEFS3: TemplateDef[] = [
  {
    id: 'flea-story',
    name: 'Flea market story',
    category: 'Social',
    width: 1080,
    height: 1920,
    formatId: 'story',
    pages: [
      {
        background: bg('paper-kraft'),
        elements: [
          text('Flea\nmarket', 56, 120, 980, { fontFamily: 'Archivo', fontSize: 212, fontWeight: 900, lineHeight: 0.88, letterSpacing: -35, color: TOMATO, rotation: -3 }),
          sticker('voxel-bucket', 800, 470, 300, { rotation: 14 }),
          photo('flowers', 70, 700, 520, 520, { rotation: -4, radius: 6, border: { color: '#FFFFFF', width: 14, dash: 'solid' }, shadow: { x: 0, y: 20, blur: 40, color: 'rgba(0,0,0,0.25)' } }),
          text('Sat\n15 Nov', 640, 760, 420, { fontFamily: 'Archivo', fontSize: 100, fontWeight: 900, lineHeight: 0.92, letterSpacing: -30, color: INK }),
          text('10 to 16,\nrain or not', 644, 980, 400, { fontFamily: G, fontSize: 44, fontWeight: 500, lineHeight: 1.15, color: INK }),
          shape('rect', 0, 1420, 1080, 500, INK),
          text('Vinyl, lamps, winter coats and one very large clock. Tables from 150 kr.', 70, 1480, 940, { fontFamily: G, fontSize: 62, fontWeight: 500, lineHeight: 1.18, color: CREAM }),
          text('Tram shed yard, Rörstrandsgatan 22', 70, 1780, 940, { fontFamily: G, fontSize: 46, fontWeight: 700, color: LEMON }),
        ],
      },
    ],
  },
  {
    id: 'bread-thumb',
    name: 'YouTube thumbnail',
    category: 'Video',
    width: 1280,
    height: 720,
    formatId: 'yt-thumb',
    pages: [
      {
        background: solid(LEMON),
        elements: [
          photo('bread', 700, 0, 580, 720),
          text('40', 40, -60, 700, { fontFamily: 'Archivo', fontSize: 470, fontWeight: 900, lineHeight: 0.9, letterSpacing: -60, color: INK }),
          text('loaves in\nthree days', 60, 400, 700, { fontFamily: 'Archivo', fontSize: 110, fontWeight: 900, lineHeight: 0.9, letterSpacing: -30, color: INK }),
          shape('pill', 60, 620, 480, 64, INK),
          text('Part 1: the starter', 60, 634, 480, { fontFamily: G, fontSize: 32, fontWeight: 700, align: 'center', color: LEMON }),
          sticker('voxel-star', 560, 40, 200, { rotation: 14 }),
        ],
      },
    ],
  },
  {
    id: 'newsletter-a4',
    name: 'Neighbourhood newsletter',
    category: 'Print',
    width: 794,
    height: 1123,
    formatId: 'a4',
    pages: [
      {
        background: solid(CREAM),
        elements: [
          text('Kvarteret', 40, 30, 714, { fontFamily: 'Fraunces', fontSize: 150, fontWeight: 900, letterSpacing: -40, color: INK }),
          makeLine({ x: 40, y: 210, w: 714, h: 0, color: INK, width: 3 }),
          text('The Vita Bergen news sheet', 40, 224, 400, { fontFamily: G, fontSize: 15, fontWeight: 600, color: INK }),
          text('No. 12 · November', 454, 224, 300, { fontFamily: G, fontSize: 15, fontWeight: 600, align: 'right', color: INK }),
          makeLine({ x: 40, y: 254, w: 714, h: 0, color: INK, width: 1 }),
          photo('bread', 40, 290, 330, 440),
          text('The bakery on\nTjärhovsgatan\nis staying', 396, 286, 360, { fontFamily: 'Archivo', fontSize: 44, fontWeight: 900, lineHeight: 0.98, letterSpacing: -15, color: TOMATO }),
          text('After a winter of rumours, Bageri Sju confirmed on Friday that the lease is signed for another five years. The ovens go on at 04:30 and the first cardamom buns leave the counter before six.\n\nThe owners say the trick was the neighbours: 212 signatures on a clipboard hung by the door, most of them in pencil.', 396, 430, 358, { fontFamily: 'DM Sans', fontSize: 14, lineHeight: 1.5, color: INK }),
          text('212 signatures,\nmostly in pencil.', 396, 620, 358, { fontFamily: 'Archivo', fontSize: 30, fontWeight: 900, lineHeight: 1.0, letterSpacing: -10, color: INK }),
          shape('rect', 40, 770, 330, 260, TOMATO, { rotation: -1.5 }),
          text('This month', 64, 796, 280, { fontFamily: G, fontSize: 16, fontWeight: 700, letterSpacing: 100, uppercase: true, color: INK }),
          text('Thu 13  Yard sale, no. 9\nSat 22  Choir in the stairwell\nTue 25  Heating meeting, 18:30\nSun 30  Advent soup, 14:00', 64, 836, 290, { fontFamily: 'DM Sans', fontSize: 17, fontWeight: 600, lineHeight: 1.55, color: '#FFFFFF' }),
          text('Lost and found', 396, 770, 358, { fontFamily: 'Archivo', fontSize: 26, fontWeight: 900, color: INK }),
          text('One blue mitten, left hand, stairwell 14. One grey cat called Misse, answers to a tin opener. One bicycle bell, no bicycle.', 396, 808, 358, { fontFamily: 'DM Sans', fontSize: 14, lineHeight: 1.5, color: INK }),
          makeLine({ x: 396, y: 918, w: 358, h: 0, color: INK, width: 1 }),
          text('Write to us', 396, 934, 358, { fontFamily: 'Archivo', fontSize: 26, fontWeight: 900, color: INK }),
          text('Slip a note under the door of no. 3, or write kvarteret@vitabergen.example. Next issue: 6 December.', 396, 972, 358, { fontFamily: 'DM Sans', fontSize: 14, lineHeight: 1.5, color: INK }),
        ],
      },
    ],
  },
  {
    id: 'concert-ticket',
    name: 'Concert ticket',
    category: 'Print',
    width: 1600,
    height: 600,
    pages: [
      {
        background: solid(INK),
        elements: [
          photo('concert', 0, 0, 1180, 600),
          shape('rect', 0, 0, 1180, 600, 'rgba(11,11,13,0.45)'),
          text('Nattskift', 60, 40, 1100, { fontFamily: 'Bebas Neue', fontSize: 280, lineHeight: 0.9, letterSpacing: 10, color: '#FFFFFF' }),
          text('Live at Münchenbryggeriet\nTorkel Knutssonsgatan 2', 66, 400, 800, { fontFamily: G, fontSize: 38, fontWeight: 600, lineHeight: 1.2, color: '#FFFFFF' }),
          text('Fri 12 Dec · doors 19:00', 66, 508, 800, { fontFamily: G, fontSize: 38, fontWeight: 700, color: LEMON }),
          shape('rect', 1180, 0, 420, 600, LEMON),
          shape('ellipse', 1150, -30, 60, 60, INK),
          shape('ellipse', 1150, 570, 60, 60, INK),
          makeLine({ x: 1180, y: 50, w: 0, h: 500, color: INK, width: 3, dash: 'dash' }),
          text('ADMIT ONE', 1220, 56, 340, { fontFamily: 'Archivo', fontSize: 64, fontWeight: 900, lineHeight: 0.95, letterSpacing: -20, color: INK }),
          text('Standing\nHall B', 1222, 190, 340, { fontFamily: G, fontSize: 44, fontWeight: 600, lineHeight: 1.1, color: INK }),
          text('395 kr', 1222, 340, 340, { fontFamily: 'Archivo', fontSize: 100, fontWeight: 900, letterSpacing: -30, color: INK }),
          text('No. 0417', 1222, 500, 340, { fontFamily: G, fontSize: 32, fontWeight: 600, color: INK }),
        ],
      },
    ],
  },
  {
    id: 'cafe-menu-board',
    name: 'Cafe menu board',
    category: 'Print',
    width: 1920,
    height: 1080,
    formatId: 'slides',
    pages: [
      {
        background: solid(TOMATO),
        elements: [
          photo('coffee', 1400, 0, 520, 1080),
          text('Pilen', 70, 20, 1200, { fontFamily: 'Bricolage Grotesque', fontSize: 330, fontWeight: 800, letterSpacing: -60, color: INK }),
          text('Coffee since 2014 · Hornsgatan 71', 80, 360, 1200, { fontFamily: G, fontSize: 36, fontWeight: 600, color: INK }),
          text('Coffee', 80, 440, 560, { fontFamily: 'Bricolage Grotesque', fontSize: 54, fontWeight: 800, color: INK }),
          text('Filter\nFlat white\nCortado\nOat latte', 80, 540, 400, { fontFamily: G, fontSize: 46, fontWeight: 500, lineHeight: 1.45, color: CREAM }),
          text('38\n48\n44\n52', 480, 540, 100, { fontFamily: G, fontSize: 46, fontWeight: 700, lineHeight: 1.45, align: 'right', color: CREAM }),
          text('From the oven', 720, 440, 600, { fontFamily: 'Bricolage Grotesque', fontSize: 54, fontWeight: 800, color: INK }),
          text('Cardamom bun\nCinnamon bun\nSourdough toast\nOne fat cookie', 720, 540, 460, { fontFamily: G, fontSize: 46, fontWeight: 500, lineHeight: 1.45, color: CREAM }),
          text('42\n42\n55\n35', 1180, 540, 100, { fontFamily: G, fontSize: 46, fontWeight: 700, lineHeight: 1.45, align: 'right', color: CREAM }),
          text('Prices in kronor. Oat milk is free, always.', 80, 950, 1100, { fontFamily: G, fontSize: 32, fontWeight: 600, color: INK }),
          sticker('voxel-heart', 1120, 800, 190, { rotation: 12 }),
        ],
      },
    ],
  },
  {
    id: 'crayfish-invite',
    name: 'Crayfish party invite',
    category: 'Invites',
    width: 559,
    height: 794,
    formatId: 'a5-flyer',
    pages: [
      {
        background: solid(COBALT),
        elements: [
          sticker('char-star-yellow', 380, -20, 190, { rotation: 14 }),
          text('Crayfish\nparty', 36, 170, 500, { fontFamily: 'Archivo', fontSize: 92, fontWeight: 900, lineHeight: 0.88, letterSpacing: -35, color: LEMON }),
          text('Saturday 16 August, from 17:00', 38, 360, 480, { fontFamily: G, fontSize: 24, fontWeight: 700, color: '#FFFFFF' }),
          text('Björkvägen 9, Lidingö', 38, 396, 480, { fontFamily: G, fontSize: 24, fontWeight: 500, color: '#FFFFFF' }),
          shape('rect', 36, 450, 487, 3, LEMON),
          text('Bring a hat. We have paper ones, yours will be better.\n\nCrayfish, dill, Västerbotten pie, snaps for those who want it and one very long table.', 38, 480, 330, { fontFamily: 'DM Sans', fontSize: 16, lineHeight: 1.5, color: '#E4E7FF' }),
          sticker('char-square-red', 400, 520, 150, { rotation: -10 }),
          shape('pill', 36, 700, 487, 54, LEMON),
          text('RSVP to Ebba by 9 Aug · 070 555 01 88', 36, 714, 487, { fontFamily: G, fontSize: 18, fontWeight: 700, align: 'center', color: INK }),
        ],
      },
    ],
  },
  {
    id: 'launch-deck',
    name: 'Product launch deck',
    category: 'Slides',
    width: 1920,
    height: 1080,
    formatId: 'slides',
    pages: [
      {
        background: solid(TOMATO),
        transition: 'fade',
        elements: [
          photo('coffee', 1180, 0, 740, 1080),
          text('Morgon', 100, 130, 1060, { fontFamily: 'Bricolage Grotesque', fontSize: 262, fontWeight: 800, letterSpacing: -60, color: INK }),
          text('A pour over set\nfor people who have\nfive minutes.', 108, 520, 1000, { fontFamily: G, fontSize: 64, fontWeight: 500, lineHeight: 1.1, letterSpacing: -15, color: INK }),
          text('Launch plan · autumn 2027', 108, 940, 800, { fontFamily: G, fontSize: 30, fontWeight: 600, color: INK }),
          sticker('voxel-pen', 1020, 760, 260, { rotation: 20 }),
        ],
      },
      {
        background: solid(CREAM),
        transition: 'slide',
        elements: [
          text('What it is', 120, 100, 800, { fontFamily: G, fontSize: 30, fontWeight: 700, color: TOMATO }),
          text('One ceramic dripper,\ntwo cups, a scoop\nand a timer that\nlives in the lid.', 120, 190, 1400, { fontFamily: 'Bricolage Grotesque', fontSize: 120, fontWeight: 700, lineHeight: 0.98, letterSpacing: -35, color: INK }),
          text('Thrown in Småland, glazed in four colours, packed in a box that doubles as a tray. No app, no capsule, no cable.', 120, 760, 880, { fontFamily: G, fontSize: 36, lineHeight: 1.4, color: '#4A4A55' }),
          photo('desk', 1180, 600, 640, 380, { radius: 20, rotation: 3 }),
        ],
      },
      {
        background: solid(INK),
        transition: 'slide',
        elements: [
          text('Early numbers', 120, 100, 800, { fontFamily: G, fontSize: 30, fontWeight: 700, color: LEMON }),
          text('1 840', 120, 220, 800, { fontFamily: 'Bricolage Grotesque', fontSize: 280, fontWeight: 800, letterSpacing: -60, color: '#FFFFFF' }),
          text('people on the waiting list, from a single post.', 128, 560, 720, { fontFamily: G, fontSize: 38, lineHeight: 1.35, color: '#C9C9D3' }),
          text('94%', 1000, 220, 800, { fontFamily: 'Bricolage Grotesque', fontSize: 280, fontWeight: 800, letterSpacing: -60, color: LEMON }),
          text('of testers brewed it again the next morning.', 1008, 560, 720, { fontFamily: G, fontSize: 38, lineHeight: 1.35, color: '#C9C9D3' }),
          makeLine({ x: 120, y: 780, w: 1680, h: 0, color: '#45454F', width: 2 }),
          text('Tested by 60 households in Stockholm and Gothenburg, August to September.', 120, 830, 1400, { fontFamily: G, fontSize: 30, color: '#8A8A96' }),
        ],
      },
      {
        background: solid(PAPER),
        transition: 'slide',
        elements: [
          text('Price and plan', 120, 100, 800, { fontFamily: G, fontSize: 30, fontWeight: 700, color: COBALT }),
          text('Three ways\nto buy it.', 120, 190, 800, { fontFamily: 'Bricolage Grotesque', fontSize: 120, fontWeight: 700, lineHeight: 0.98, letterSpacing: -35, color: INK }),
          makeTable(4, 3, {
            x: 120, y: 520, w: 1100, h: 440, fontSize: 34, headerFill: INK, headerColor: '#FFFFFF', bodyFill: '#FFFFFF', stripeFill: '#F3F3F6', lineColor: '#D9D9DF',
            cells: [['Set', 'Price', 'Ships'], ['Solo, one cup', '590 kr', '1 Oct'], ['Pair, two cups', '890 kr', '1 Oct'], ['Pair and gift box', '1 090 kr', '15 Nov']],
          }),
          sticker('char-cloud-lilac', 1380, 300, 360, { rotation: -8 }),
          text('Free returns\nfor 30 days.', 1340, 740, 500, { fontFamily: G, fontSize: 52, fontWeight: 600, lineHeight: 1.1, letterSpacing: -10, color: INK }),
        ],
      },
      {
        background: solid(MINT),
        transition: 'zoom',
        elements: [
          text('Join the first batch.', 120, 160, 1500, { fontFamily: 'Bricolage Grotesque', fontSize: 190, fontWeight: 800, lineHeight: 0.92, letterSpacing: -55, color: INK }),
          text('Four hundred sets, numbered by hand,\nmade before Christmas.', 126, 560, 1100, { fontFamily: G, fontSize: 52, fontWeight: 500, lineHeight: 1.2, color: INK }),
          text('morgon.example/first', 126, 840, 900, { fontFamily: G, fontSize: 52, fontWeight: 800, color: INK }),
          makeQr('https://morgon.example/first', { x: 1420, y: 560, w: 380, h: 380, background: MINT }),
        ],
      },
    ],
  },
  {
    id: 'weekly-planner',
    name: 'Weekly planner',
    category: 'Print',
    width: 794,
    height: 1123,
    formatId: 'a4',
    pages: [
      {
        background: solid('#FFFFFF'),
        elements: [
          shape('rect', 0, 0, 794, 300, LEMON),
          text('Week', 44, 24, 400, { fontFamily: 'Archivo', fontSize: 40, fontWeight: 800, color: INK }),
          text('47', 40, 84, 600, { fontFamily: 'Archivo', fontSize: 300, fontWeight: 900, lineHeight: 0.8, letterSpacing: -60, color: INK }),
          text('17 to 23\nNovember', 500, 54, 250, { fontFamily: 'Archivo', fontSize: 36, fontWeight: 800, lineHeight: 1.05, align: 'right', color: INK }),
          sticker('voxel-star', 560, 150, 130, { rotation: 14 }),
          makeTable(8, 3, {
            x: 44, y: 340, w: 706, h: 560, fontSize: 18, headerFill: INK, headerColor: '#FFFFFF', bodyFill: '#FFFFFF', stripeFill: '#F6F3E8', lineColor: '#D9D9DF', radius: 8,
            cells: [
              ['Day', 'The one thing', 'Also'],
              ['Mon', 'Send the invoices', 'Dentist 15:00'],
              ['Tue', 'Draft chapter four', 'Pottery, 18:30'],
              ['Wed', 'Call the landlord', 'Buy stamps'],
              ['Thu', 'Studio day', 'Dinner at Sara\'s'],
              ['Fri', 'Ship the order', 'Swim, 07:00'],
              ['Sat', 'Market stall', 'Pick up the bike'],
              ['Sun', 'Nothing', 'Soup'],
            ],
          }),
          text('Three things that would make it a good week', 44, 940, 706, { fontFamily: 'Archivo', fontSize: 20, fontWeight: 800, color: INK }),
          ...[0, 1, 2].flatMap((i) => [
            shape('ellipse', 44, 982 + i * 40, 22, 22, 'transparent', { stroke: { color: INK, width: 2, dash: 'solid' } }),
            makeLine({ x: 80, y: 1004 + i * 40, w: 670, h: 0, color: '#BDBDC8', width: 1.5 }),
          ]),
        ],
      },
    ],
  },
  {
    id: 'lost-cat',
    name: 'Lost cat poster',
    category: 'Posters',
    width: 794,
    height: 1123,
    formatId: 'a4',
    pages: [
      {
        background: solid(LEMON),
        elements: [
          text('LOST', 40, 24, 722, { fontFamily: 'Archivo', fontSize: 200, fontWeight: 900, lineHeight: 0.9, letterSpacing: -50, color: INK }),
          shape('rect', 44, 290, 330, 330, '#FFFFFF', { rotation: -3, stroke: { color: INK, width: 3, dash: 'dash' } }),
          text('Put your\nphoto of\nMisse here', 44, 410, 330, { fontFamily: 'Caveat', fontSize: 40, fontWeight: 700, lineHeight: 1.05, align: 'center', rotation: -3, color: '#8A8A96' }),
          text('Misse', 408, 290, 360, { fontFamily: 'Archivo', fontSize: 100, fontWeight: 900, letterSpacing: -30, color: INK }),
          text('Grey tabby, white socks, half a tail ear. Shy, but answers to the sound of a tin opening.', 410, 400, 340, { fontFamily: G, fontSize: 21, fontWeight: 500, lineHeight: 1.35, color: INK }),
          text('Last seen Tuesday evening near Tjärhovsgatan 14, Södermalm. Chipped, wears a blue collar with a bell.', 410, 520, 340, { fontFamily: G, fontSize: 21, fontWeight: 500, lineHeight: 1.35, color: INK }),
          shape('rect', 0, 680, 794, 150, INK),
          text('Call Linnea, any hour\n070 555 01 42', 44, 700, 560, { fontFamily: 'Archivo', fontSize: 46, fontWeight: 900, lineHeight: 1.08, letterSpacing: -15, color: LEMON }),
          makeQr('tel:+46705550142', { x: 616, y: 700, w: 110, h: 110, background: INK, color: LEMON, margin: 0 }),
          ...Array.from({ length: 8 }, (_, i) => [
            shape('rect', 44 + i * 88, 880, 88, 200, 'transparent', { stroke: { color: INK, width: 2, dash: 'dash' } }),
            text('Misse\n070 555 01 42', 44 + i * 88 - 52, 959, 192, { fontFamily: G, fontSize: 19, fontWeight: 700, lineHeight: 1.1, align: 'center', rotation: 270, color: INK }),
          ]).flat(),
        ],
      },
    ],
  },
  {
    id: 'flat-to-let',
    name: 'Flat for rent',
    category: 'Print',
    width: 794,
    height: 1123,
    formatId: 'a4',
    pages: [
      {
        background: solid(PAPER),
        elements: [
          photo('desk', 0, 0, 794, 470),
          shape('burst', 560, 330, 210, 210, TOMATO, { rotation: 12 }),
          text('14 900\nkr a\nmonth', 560, 388, 210, { fontFamily: 'Archivo', fontSize: 30, fontWeight: 900, lineHeight: 1.0, align: 'center', rotation: 12, color: '#FFFFFF' }),
          text('To let', 44, 500, 500, { fontFamily: 'Fraunces', fontSize: 110, fontWeight: 900, letterSpacing: -30, color: INK }),
          text('Two bright rooms, high ceilings and a kitchen big enough for a table.', 48, 622, 440, { fontFamily: 'DM Sans', fontSize: 22, fontWeight: 500, lineHeight: 1.35, color: INK }),
          makeLine({ x: 44, y: 730, w: 706, h: 0, color: INK, width: 2 }),
          text('Address', 44, 750, 200, { fontFamily: G, fontSize: 14, fontWeight: 700, letterSpacing: 120, uppercase: true, color: COBALT }),
          text('Tjärhovsgatan 22, 4th floor, lift', 250, 744, 500, { fontFamily: 'DM Sans', fontSize: 20, fontWeight: 600, color: INK }),
          text('Size', 44, 800, 200, { fontFamily: G, fontSize: 14, fontWeight: 700, letterSpacing: 120, uppercase: true, color: COBALT }),
          text('58 m2, two rooms and kitchen', 250, 794, 500, { fontFamily: 'DM Sans', fontSize: 20, fontWeight: 600, color: INK }),
          text('Available', 44, 850, 200, { fontFamily: G, fontSize: 14, fontWeight: 700, letterSpacing: 120, uppercase: true, color: COBALT }),
          text('From 1 January, twelve month contract', 250, 844, 500, { fontFamily: 'DM Sans', fontSize: 20, fontWeight: 600, color: INK }),
          text('Viewing', 44, 900, 200, { fontFamily: G, fontSize: 14, fontWeight: 700, letterSpacing: 120, uppercase: true, color: COBALT }),
          text('Saturday 6 December, 13:00 to 14:00', 250, 894, 500, { fontFamily: 'DM Sans', fontSize: 20, fontWeight: 600, color: INK }),
          makeLine({ x: 44, y: 950, w: 706, h: 0, color: INK, width: 2 }),
          photo('plant', 44, 980, 110, 110, { radius: 8 }),
          photo('studio', 168, 980, 164, 110, { radius: 8 }),
          text('Write to Henrik\nhenrik@lagenhet.example\n070 555 01 17', 440, 980, 310, { fontFamily: 'DM Sans', fontSize: 19, fontWeight: 600, lineHeight: 1.35, align: 'right', color: INK }),
        ],
      },
    ],
  },
  {
    id: 'quote-carousel',
    name: 'Carousel: three quotes',
    category: 'Social',
    width: 1080,
    height: 1350,
    formatId: 'ig-post',
    pages: [
      {
        background: solid(PINK),
        elements: [
          text('“', 40, 20, 400, { fontFamily: 'Archivo', fontSize: 600, fontWeight: 900, lineHeight: 0.8, color: INK }),
          text('Make it badly\nfirst. The good\none is hiding\ninside.', 64, 480, 960, { fontFamily: 'Archivo', fontSize: 108, fontWeight: 900, lineHeight: 0.95, letterSpacing: -35, color: '#FFFFFF' }),
          text('Ingrid, ceramics teacher, to a room of beginners', 68, 1160, 960, { fontFamily: G, fontSize: 32, fontWeight: 600, lineHeight: 1.2, color: INK }),
          text('1/3 →', 800, 1230, 220, { fontFamily: G, fontSize: 34, fontWeight: 700, align: 'right', color: INK }),
        ],
      },
      {
        background: solid(INK),
        elements: [
          sticker('voxel-scissors', 600, -40, 380, { rotation: 20 }),
          text('Cut the\nfirst line.', 64, 330, 960, { fontFamily: 'Archivo', fontSize: 190, fontWeight: 900, lineHeight: 0.88, letterSpacing: -55, color: LEMON }),
          text('It is nearly always a throat clearing, and the second line is where you actually start.', 68, 840, 860, { fontFamily: G, fontSize: 48, fontWeight: 500, lineHeight: 1.28, color: '#E6E6EC' }),
          text('2/3 →', 800, 1230, 220, { fontFamily: G, fontSize: 34, fontWeight: 700, align: 'right', color: LEMON }),
        ],
      },
      {
        background: bg('paper-cream'),
        elements: [
          text('Save this\nfor Monday.', 64, 130, 960, { fontFamily: 'Archivo', fontSize: 170, fontWeight: 900, lineHeight: 0.88, letterSpacing: -50, color: COBALT }),
          sticker('char-blob-blue', 520, 560, 500, { rotation: -6 }),
          text('New note every week from the studio on Sankt Paulsgatan.', 68, 1020, 400, { fontFamily: G, fontSize: 40, fontWeight: 600, lineHeight: 1.22, color: INK }),
          text('3/3', 800, 1230, 220, { fontFamily: G, fontSize: 34, fontWeight: 700, align: 'right', color: INK }),
        ],
      },
    ],
  },
  {
    id: 'conference-badge',
    name: 'Conference badge',
    category: 'Print',
    width: 600,
    height: 900,
    pages: [
      {
        background: solid(MINT),
        elements: [
          shape('pill', 220, 36, 160, 34, INK),
          text('Nordic Frontend Days', 40, 110, 520, { fontFamily: 'Archivo', fontSize: 30, fontWeight: 900, color: INK }),
          text('Stockholmsmässan · 14 to 15 May', 40, 150, 520, { fontFamily: G, fontSize: 21, fontWeight: 600, color: INK }),
          photo('portrait', 40, 220, 250, 300, { radius: 14 }),
          text('Ines\nKarlsson', 40, 540, 540, { fontFamily: 'Archivo', fontSize: 100, fontWeight: 900, lineHeight: 0.9, letterSpacing: -30, color: INK }),
          text('Design engineer, Klarna', 40, 740, 540, { fontFamily: G, fontSize: 26, fontWeight: 600, color: INK }),
          shape('rect', 0, 800, 600, 100, INK),
          text('SPEAKER', 40, 828, 300, { fontFamily: 'Archivo', fontSize: 44, fontWeight: 900, letterSpacing: 40, color: MINT }),
          makeQr('https://frontenddays.example/ines', { x: 340, y: 250, w: 220, h: 220, background: MINT, margin: 0 }),
          text('Talk, Hall A\nThu 10:30', 340, 480, 240, { fontFamily: G, fontSize: 22, fontWeight: 700, lineHeight: 1.2, color: INK }),
        ],
      },
    ],
  },
  {
    id: 'cold-water-poster',
    name: 'Type poster',
    category: 'Posters',
    width: 1123,
    height: 1587,
    formatId: 'a3-poster',
    pages: [
      {
        background: solid(TOMATO),
        elements: [
          shape('ellipse', 560, 760, 760, 760, INK),
          text('COLD\nWATER\nCLUB', 50, 20, 1100, { fontFamily: 'Bebas Neue', fontSize: 520, lineHeight: 0.82, color: '#FFFFFF' }),
          text('Every Saturday, 07:30', 70, 1330, 600, { fontFamily: 'Archivo', fontSize: 40, fontWeight: 900, color: INK }),
          text('Tantolunden jetty, Södermalm.\nTowel and a flask. No wetsuits.\nRain, wind or ice, we swim.', 70, 1396, 700, { fontFamily: G, fontSize: 30, fontWeight: 500, lineHeight: 1.3, color: INK }),
          text('Free,\nalways.', 780, 1380, 340, { fontFamily: 'Archivo', fontSize: 70, fontWeight: 900, lineHeight: 0.92, letterSpacing: -20, rotation: -8, color: LEMON }),
        ],
      },
    ],
  },
  {
    id: 'thank-you-card',
    name: 'Thank you card',
    category: 'Invites',
    width: 559,
    height: 397,
    formatId: 'postcard',
    pages: [
      {
        background: solid(LEMON),
        elements: [
          text('Thank you\nfor the soup.', 34, 40, 460, { fontFamily: 'Fraunces', fontSize: 72, fontWeight: 900, lineHeight: 0.95, letterSpacing: -25, color: INK }),
          sticker('voxel-heart', 380, 200, 190, { rotation: 14 }),
          text('Nobody has fed me like that\nsince I moved to Stockholm.', 36, 250, 340, { fontFamily: 'DM Sans', fontSize: 17, fontWeight: 500, lineHeight: 1.4, color: INK }),
        ],
      },
      {
        background: solid(CREAM),
        elements: [
          text('Dear Maud,', 40, 40, 300, { fontFamily: 'Caveat', fontSize: 40, fontWeight: 700, color: INK }),
          text('The leek and potato was the best thing I ate all winter, and the bread you pushed into my bag survived until Wednesday. Next time the wine is on me.', 40, 100, 480, { fontFamily: 'Caveat', fontSize: 30, fontWeight: 500, lineHeight: 1.25, color: INK }),
          text('Love, Mira', 330, 300, 190, { fontFamily: 'Caveat', fontSize: 40, fontWeight: 700, align: 'right', color: TOMATO }),
        ],
      },
    ],
  },
];
