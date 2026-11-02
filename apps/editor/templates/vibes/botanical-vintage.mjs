import { tpl, page, T, S, rect, circle, path, L, svg, img, overlay, stroke } from '../kit.mjs';

const FOX = 'art/botanical-plate-foxglove.jpg';
const SHEET = 'art/botanical-specimen-sheet.jpg';
// Ink colour for a black engraving placed on a light ground: dark end of the duotone is the ink.
const ink = (c) => ({ duotone: [c, '#FFFFFF'], contrast: 15 });
const cell = (col, row) => ({ x: col * 0.5 + 0.01, y: row / 3 + 0.01, w: 0.48, h: 0.32 });

// ------------------------------------------------------------ 1
const marketPoster = (() => {
  const KRAFT = '#E4B7A1', RED = '#C8301C', GREEN = '#2F6B3A';
  return tpl({
    id: 'botanical-market-poster', name: 'Farmers market woodtype poster', format: 'poster', category: 'Poster', tags: ['market', 'farmers market', 'woodtype', 'botanical'],
    pages: [page(KRAFT, [
      rect(36, 36, 1051, 1515, 'transparent', { stroke: stroke(RED, 5) }),
      rect(52, 52, 1019, 1483, 'transparent', { stroke: stroke(RED, 1.5) }),
      img(FOX, 380, 510, 640, 960, { blend: 'multiply', filters: ink(GREEN) }),
      T('MARKET SQUARE  •  EVERY SATURDAY  •  SINCE 1952', 70, 80, 983, { font: 'Alfa Slab One', size: 22, color: GREEN, align: 'center', ls: 120 }),
      T('Farmers', 70, 130, 983, { font: 'Alfa Slab One', size: 232, color: RED, align: 'center', ls: -30, lh: 1 }),
      T('Market', 70, 340, 983, { font: 'Alfa Slab One', size: 232, color: RED, align: 'center', ls: -30, lh: 1 }),
      L(90, 600, 330, 600, RED, 4),
      T('Seeds\nSeedlings\nHoney\nCut flowers\nRye bread\nGoat cheese', 90, 630, 280, { font: 'Alfa Slab One', size: 34, color: GREEN, lh: 1.3 }),
      T('Saturdays\n8 until 13\nMay to October', 90, 1010, 280, { font: 'Alfa Slab One', size: 26, color: RED, lh: 1.35 }),
      L(90, 1160, 330, 1160, RED, 4),
      T('Bring a basket.\nBring a friend.\nDogs on a lead.', 90, 1190, 280, { font: 'IM Fell English', size: 28, color: INK_DARK(), lh: 1.3 }),
      S('burst', 790, 1250, 230, 230, RED, { rotation: 12 }),
      T('Free\nentry', 790, 1310, 230, { font: 'Alfa Slab One', size: 40, color: KRAFT, align: 'center', lh: 1, rotation: 12 }),
      T('Stora Torget 1  •  Open to all  •  Rain or shine', 70, 1478, 983, { font: 'Alfa Slab One', size: 22, color: GREEN, align: 'center', ls: 120 }),
      overlay('tex/paper-fibre.jpg', 1123, 1587, 'multiply', 0.45),
      overlay('tex/risograph-speckle.jpg', 1123, 1587, 'multiply', 0.2),
    ])],
  });
})();
function INK_DARK() { return '#3B1D14'; }

// ------------------------------------------------------------ 2
const specimenLabel = (() => {
  const BG = '#16231B', CARD = '#EFE6CD', INK = '#1A1A14', GREEN = '#2C4A32';
  const field = (y, k, v) => [
    T(k, 80, y, 150, { font: 'Courier Prime', size: 13, weight: 700, color: GREEN, upper: true, ls: 150 }),
    T(v, 80, y + 24, 300, { font: 'Old Standard TT', size: 25, color: INK, lh: 1.1 }),
    L(80, y + 66, 380, y + 66, INK, 1),
  ];
  return tpl({
    id: 'botanical-specimen-label', name: 'Specimen label card', format: 'a4', category: 'Poster', tags: ['specimen', 'label', 'plant', 'herbarium', 'data'],
    pages: [page(BG, [
      rect(40, 40, 714, 1043, CARD),
      rect(54, 54, 686, 1015, 'transparent', { stroke: stroke(INK, 1.2) }),
      T('Herbarium No. 14', 80, 80, 400, { font: 'Courier Prime', size: 13, weight: 700, color: GREEN, upper: true, ls: 200 }),
      T('Pl. 14', 560, 80, 154, { font: 'Courier Prime', size: 13, weight: 700, color: GREEN, upper: true, ls: 200, align: 'right' }),
      T('FOXGLOVE', 80, 120, 640, { font: 'Old Standard TT', size: 92, weight: 700, color: INK, ls: -20, lh: 1 }),
      T('Digitalis purpurea', 80, 226, 640, { font: 'Old Standard TT', size: 34, color: GREEN, lh: 1, italic: true }),
      L(80, 290, 714, 290, INK, 3),
      field(320, 'Family', 'Plantaginaceae'), field(402, 'Habit', 'Biennial herb'), field(484, 'Height', '60 to 150 cm'),
      field(566, 'Bloom', 'June to August'), field(648, 'Soil', 'Moist, light shade'), field(730, 'Found', 'Woodland edges'),
      img(FOX, 400, 310, 320, 480, { blend: 'multiply', filters: ink(GREEN) }),
      T('A tall, handsome plant with a hum of bees around it. Every part is poisonous, so look but do not taste.', 400, 800, 314, { font: 'Old Standard TT', size: 17, color: INK, lh: 1.35 }),
      T('Pressed and mounted by hand.\nLabel typed on a Remington.', 80, 850, 300, { font: 'Special Elite', size: 14, color: INK, lh: 1.45 }),
      T('COLLECTED  14 JULY 1931', 80, 960, 640, { font: 'Courier Prime', size: 13, weight: 700, color: GREEN, ls: 200 }),
      T('NEAR  LOVO, UPPLAND', 80, 986, 640, { font: 'Courier Prime', size: 13, weight: 700, color: GREEN, ls: 200 }),
      T('A. Nordin', 480, 950, 234, { font: 'Mrs Saint Delafield', size: 56, color: INK, align: 'right' }),
      overlay('tex/paper-fibre.jpg', 794, 1123, 'multiply', 0.4),
    ])],
  });
})();

// ------------------------------------------------------------ 3
const seedPacket = (() => {
  const GREEN = '#2E5E3A', CREAM = '#F1E8CF', PEACH = '#F2B98F', RED = '#BF3A1E';
  const row = (y, k, v) => [T(k, 56, y, 200, { font: 'Courier Prime', size: 13, weight: 700, color: GREEN, upper: true, ls: 200 }), T(v, 56, y + 22, 450, { font: 'Old Standard TT', size: 26, color: '#1E1E16', lh: 1.1 }), L(56, y + 64, 503, y + 64, GREEN, 1)];
  return tpl({
    id: 'botanical-seed-packet', name: 'Seed packet, front and back', format: 'flyer', category: 'Print', tags: ['seed packet', 'label', 'packaging', 'garden', 'two sided'],
    pages: [
      page(GREEN, [
        rect(24, 24, 511, 746, CREAM),
        rect(36, 36, 487, 722, 'transparent', { stroke: stroke(GREEN, 1.5) }),
        T('HEIRLOOM SEEDS', 36, 54, 487, { font: 'Courier Prime', size: 13, weight: 700, color: GREEN, align: 'center', ls: 400 }),
        S('arch', 120, 96, 320, 430, PEACH),
        img(FOX, 137, 96, 286, 430, { blend: 'multiply', filters: ink('#5A1E10') }),
        T('Foxglove', 36, 548, 487, { font: 'Alfa Slab One', size: 66, color: RED, align: 'center', ls: -10, lh: 1 }),
        T('Digitalis purpurea', 36, 626, 487, { font: 'Old Standard TT', size: 21, color: GREEN, align: 'center', italic: true }),
        L(60, 672, 499, 672, GREEN, 1.5),
        T('SOW MARCH TO MAY', 60, 688, 220, { font: 'Courier Prime', size: 12, weight: 700, color: GREEN, ls: 150 }),
        T('100 SEEDS', 279, 688, 220, { font: 'Courier Prime', size: 12, weight: 700, color: GREEN, ls: 150, align: 'right' }),
        T('Packed for 2026  •  Net 0.5 g', 60, 716, 439, { font: 'Courier Prime', size: 11, color: GREEN, ls: 100, align: 'center' }),
        overlay('tex/paper-fibre.jpg', 559, 794, 'multiply', 0.35),
      ]),
      page(CREAM, [
        T('How to grow', 56, 60, 447, { font: 'Alfa Slab One', size: 44, color: RED, lh: 1, ls: -10 }),
        T('A biennial. Sow one summer, flowers the next.', 56, 118, 447, { font: 'Old Standard TT', size: 17, color: '#1E1E16', lh: 1.3 }),
        L(56, 168, 503, 168, GREEN, 3),
        row(190, 'Sow', 'March to May, surface'), row(262, 'Light', 'Do not cover the seed'), row(334, 'Space', '40 cm apart when thinned'), row(406, 'Water', 'Keep damp, never soaked'), row(478, 'Flowers', 'June to August, second year'),
        img(SHEET, 56, 560, 150, 224, { crop: { x: 0.5, y: 0.0, w: 0.5, h: 0.33 }, blend: 'multiply', filters: ink(GREEN) }),
        T('Save the seed.\nShare it.\nAll parts of this plant are poisonous.', 230, 600, 273, { font: 'Old Standard TT', size: 18, color: '#1E1E16', lh: 1.35 }),
        overlay('tex/paper-fibre.jpg', 559, 794, 'multiply', 0.35),
      ]),
    ],
  });
})();

// ------------------------------------------------------------ 4
const museumBlue = (() => {
  const BLUE = '#1D3FBF', CREAM = '#F0E8D0';
  return tpl({
    id: 'botanical-museum-blue', name: 'Herbarium exhibition, blue ink', format: 'poster', category: 'Poster', tags: ['museum', 'exhibition', 'herbarium', 'blue', 'botanical'],
    pages: [page(CREAM, [
      img(SHEET, 360, 70, 700, 1050, { blend: 'multiply', filters: ink(BLUE) }),
      T('HERBARIUM', -650, 690, 1500, { font: 'Alfa Slab One', size: 205, color: BLUE, rotation: 270, ls: -20, lh: 1 }),
      L(360, 1170, 1060, 1170, BLUE, 4),
      T('The Hortus\nCollection', 360, 1190, 460, { font: 'Alfa Slab One', size: 50, color: BLUE, lh: 1.05 }),
      T('Three hundred pressed plants from the university gardens, shown together for the first time.', 360, 1330, 380, { font: 'Old Standard TT', size: 21, color: BLUE, lh: 1.35 }),
      T('15 NOV to 8 MARCH', 790, 1195, 270, { font: 'Courier Prime', size: 17, weight: 700, color: BLUE, ls: 150, align: 'right' }),
      T('Tuesday to Sunday\n10 until 17', 790, 1228, 270, { font: 'Courier Prime', size: 17, color: BLUE, ls: 50, lh: 1.5, align: 'right' }),
      T('Free for under 18', 790, 1330, 270, { font: 'Courier Prime', size: 17, color: BLUE, ls: 50, align: 'right' }),
      T('Natural History Museum\nSveavagen 12, Uppsala', 790, 1480, 270, { font: 'Courier Prime', size: 15, weight: 700, color: BLUE, ls: 50, align: 'right', lh: 1.4 }),
      overlay('tex/paper-fibre.jpg', 1123, 1587, 'multiply', 0.4),
      overlay('tex/risograph-speckle.jpg', 1123, 1587, 'multiply', 0.2),
    ])],
  });
})();

// ------------------------------------------------------------ 5
const plantSale = (() => {
  const BG = '#12392A', CREAM = '#F1E8D0';
  const cards = [['Fern', '45', '#F2B7A0', 0, 0], ['Poppy', '35', '#F0CE6A', 1, 0], ['Oak seedling', '60', '#A9CDA0', 0, 1], ['Hop, climbing', '55', '#E9A9B4', 1, 1], ['Thistle', '40', '#9DBFD6', 0, 2], ['Bellflower', '38', '#F2B7A0', 1, 2]];
  const els = cards.map(([n, p, c, col, row], i) => {
    const x = 70 + (i % 2) * 490, y = 400 + Math.floor(i / 2) * 450;
    return [
      rect(x, y, 450, 330, c),
      img(SHEET, x + 10, y + 10, 430, 310, { crop: cell(col, row), blend: 'multiply', filters: ink('#12392A') }),
      T(n, x, y + 346, 330, { font: 'Alfa Slab One', size: 31, color: CREAM, lh: 1.1 }),
      T(p + ' kr', x + 300, y + 346, 150, { font: 'Alfa Slab One', size: 31, color: CREAM, align: 'right' }),
      T('Pot 12 cm', x, y + 386, 330, { font: 'Courier Prime', size: 17, color: CREAM, opacity: 0.75 }),
    ];
  });
  return tpl({
    id: 'botanical-plant-sale', name: 'Plant sale price cards', format: 'story', category: 'Social', tags: ['plant sale', 'garden', 'price', 'story', 'nursery'],
    pages: [page(BG, [
      T('Plant\nsale', 70, 70, 700, { font: 'Alfa Slab One', size: 150, color: CREAM, lh: 0.95, ls: -20 }),
      T('Saturday 3 May\n9 until 15\nThe old greenhouse', 700, 100, 320, { font: 'Courier Prime', size: 25, weight: 700, color: CREAM, align: 'right', lh: 1.45 }),
      T('Cash, card or a swap.', 700, 270, 320, { font: 'Courier Prime', size: 20, color: CREAM, align: 'right', opacity: 0.75 }),
      els,
      T('Everything grown here, from seed, without peat.', 70, 1810, 940, { font: 'Courier Prime', size: 22, weight: 700, color: CREAM, ls: 20 }),
      overlay('tex/paper-fibre.jpg', 1080, 1920, 'screen', 0.15),
    ])],
  });
})();

// ------------------------------------------------------------ 6
const cyanotype = (() => {
  const BLUE = '#0F3A7A', CREAM = '#F3F1E8';
  const duo = { duotone: [CREAM, BLUE], contrast: 10 };
  const names = ['Fern', 'Poppy', 'Oak', 'Hop', 'Thistle', 'Bellflower'];
  return tpl({
    id: 'botanical-cyanotype-set', name: 'Cyanotype field notes, 3 posts', format: 'post', category: 'Social', tags: ['cyanotype', 'carousel', 'field notes', 'blue', 'tutorial'],
    pages: [
      page(BLUE, [
        img(FOX, 380, 30, 700, 1050, { filters: duo }),
        T('Field\nnotes', 70, 90, 600, { font: 'Cormorant Garamond', size: 190, weight: 300, color: CREAM, lh: 0.88, ls: -30 }),
        T('VOL. 3', 74, 470, 300, { font: 'Jost', size: 20, weight: 400, color: CREAM, ls: 400 }),
        L(70, 1110, 1010, 1110, CREAM, 1.5),
        T('A summer of pressing\nplants and printing them in sun.', 70, 1140, 700, { font: 'Cormorant Garamond', size: 46, weight: 400, color: CREAM, lh: 1.15 }),
        T('Swipe', 800, 1170, 210, { font: 'Jost', size: 20, color: CREAM, ls: 400, align: 'right', upper: true }),
        overlay('tex/paper-fibre.jpg', 1080, 1350, 'multiply', 0.3),
      ]),
      page(BLUE, [
        img(SHEET, 60, 60, 640, 960, { filters: duo }),
        names.map((n, i) => [
          T(String(i + 1).padStart(2, '0'), 760, 100 + i * 150, 80, { font: 'Jost', size: 20, color: CREAM, ls: 200 }),
          T(n, 760, 90 + i * 150, 260, { font: 'Cormorant Garamond', size: 48, weight: 400, color: CREAM, lh: 1 }),
          L(760, 164 + i * 150, 1020, 164 + i * 150, CREAM, 1),
        ]),
        T('Six plants from the verge behind the allotments, printed on paper coated by hand.', 60, 1080, 640, { font: 'Cormorant Garamond', size: 32, color: CREAM, lh: 1.25 }),
        T('2 / 3', 800, 1260, 210, { font: 'Jost', size: 20, color: CREAM, ls: 300, align: 'right' }),
        overlay('tex/paper-fibre.jpg', 1080, 1350, 'multiply', 0.3),
      ]),
      page(CREAM, [
        T('How to make one', 70, 70, 900, { font: 'Cormorant Garamond', size: 120, weight: 300, color: BLUE, ls: -20, lh: 1 }),
        L(70, 230, 1010, 230, BLUE, 1.5),
        [['1', 'Press', 'Dry the plant flat between paper for a week.'], ['2', 'Coat', 'Brush the paper in the dark. Let it dry in the dark.'], ['3', 'Expose', 'Lay the plant on the paper under glass. Ten minutes of sun.'], ['4', 'Rinse', 'Wash in cold water until the white turns clear. It deepens as it dries.']].map(([n, h, t], i) => [
          T(n, 70, 270 + i * 200, 100, { font: 'Cormorant Garamond', size: 120, weight: 300, color: BLUE, lh: 1 }),
          T(h, 230, 280 + i * 200, 700, { font: 'Cormorant Garamond', size: 56, weight: 500, color: BLUE, lh: 1 }),
          T(t, 230, 352 + i * 200, 780, { font: 'Cormorant Garamond', size: 34, color: BLUE, lh: 1.25 }),
          L(70, 460 + i * 200, 1010, 460 + i * 200, BLUE, 1),
        ]),
        T('3 / 3', 800, 1260, 210, { font: 'Jost', size: 20, color: BLUE, ls: 300, align: 'right' }),
        overlay('tex/paper-fibre.jpg', 1080, 1350, 'multiply', 0.3),
      ]),
    ],
  });
})();

export default [marketPoster, specimenLabel, seedPacket, museumBlue, plantSale, cyanotype];
