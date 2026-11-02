import { tpl, page, T, S, rect, circle, L, svg, img, pattern, overlay, stroke } from '../kit.mjs';

const JOST = 'Jost';
const COR = 'Cormorant Garamond';
const HAN = 'Hanken Grotesk';
const WASHI = '#F2EEE4', SUMI = '#161616', RED = '#D8281C', INDIGO = '#1F2F5C', GREY = '#A9B6BF';
const washi = (W, H, a = 0.35) => overlay('tex/paper-fibre.jpg', W, H, 'multiply', a);
const small = (t, x, y, w, p = {}) => T(t, x, y, w, { font: JOST, size: 13, weight: 400, ls: 220, upper: true, color: SUMI, ...p });
const hanko = (x, y, d, label) => [
  S('rect', x, y, d, d, RED, { radius: 4 }),
  T(label, x, y + d * 0.2, d, { font: JOST, size: d * 0.5, weight: 500, ls: 0, align: 'center', color: WASHI, lh: 1 }),
];

const sun = () => {
  const W = 1123, H = 1587;
  const cols = [['Dates', '3 to 28 March'], ['Hours', 'Ten to six'], ['Place', 'Harbour Hall'], ['Entry', 'Free']];
  return tpl({
    id: 'jp-tide-poster', name: 'Exhibition poster, red disc', format: 'poster', category: 'Poster',
    tags: ['exhibition', 'japanese', 'minimal', 'poster', 'disc'],
    pages: [page(WASHI, [
      washi(W, H, 0.35),
      S('ellipse', 280, -260, 1100, 1100, RED),
      small('Setouchi', 56, 1050, 700, { size: 20 }),
      T('Tide\ntables', 56, 1090, 800, { font: JOST, size: 150, weight: 300, ls: -30, lh: 0.95, color: SUMI }),
      T('Silent prints of the inland sea, 1998 to 2024', 700, 1112, 367, { font: COR, size: 28, lh: 1.35, color: SUMI }),
      ...hanko(981, 1264, 86, 'Tide'),
      T('Photographs\nby Ren Okabe', 56, 56, 260, { font: JOST, size: 14, lh: 1.5, ls: 200, upper: true, color: SUMI }),
      L(56, 1400, 1067, 1400, SUMI, 1),
      ...cols.flatMap(([a, b], i) => [
        small(a, 56 + i * 256, 1424, 240, { size: 11, opacity: 0.6 }),
        T(b, 56 + i * 256, 1452, 240, { font: JOST, size: 24, weight: 400, color: SUMI }),
      ]),
    ])],
  });
};

const enso = () => {
  const W = 794, H = 1123;
  const arc = 'M 252 40 A 232 232 0 1 1 100 90';
  return tpl({
    id: 'jp-enso-a4', name: 'Practice poster, ink circle', format: 'a4', category: 'Poster',
    tags: ['meditation', 'zen', 'class', 'japanese', 'minimal'],
    pages: [page(WASHI, [
      washi(W, H, 0.4),
      img('art/jp-ink-enso.png', 90, 170, 620, 620),
      T('Sit', 56, 56, 500, { font: JOST, size: 70, weight: 300, ls: -20, color: SUMI }),
      small('Morning practice', 56, 140, 400, { size: 12 }),
      T('Zen', 600, 600, 100, { font: JOST, size: 14, ls: 300, upper: true, color: SUMI, rotation: 90, align: 'left' }),
      L(56, 900, 738, 900, SUMI, 1),
      ...[['Time', 'Daily, 06:00'], ['Length', 'Forty minutes'], ['Where', 'Garden room']].flatMap(([a, b], i) => [
        small(a, 56 + i * 230, 924, 220, { size: 11, opacity: 0.6 }),
        T(b, 56 + i * 230, 952, 220, { font: JOST, size: 22, color: SUMI }),
      ]),
      T('No experience needed. Cushions are provided, tea is served after.', 56, 1030, 420, { font: COR, size: 22, lh: 1.35, color: SUMI }),
      ...hanko(652, 1010, 70, 'Zen'),
    ])],
  });
};

const hills = () => {
  const W = 1123, H = 1587;
  const bands = [['#C9D3DA', '#9FB0BC', 560], ['#8FA3B4', '#6E869A', 760], ['#4F6784', '#3F5876', 960], ['#1F2F5C', '#2C3F73', 1160]];
  return tpl({
    id: 'jp-halftone-hills', name: 'Mist and hills poster', format: 'poster', category: 'Poster',
    tags: ['landscape', 'festival', 'halftone', 'japanese', 'poster'],
    pages: [page('#EEF0EE', [
      washi(W, H, 0.25),
      ...bands.flatMap(([c, d, y], i) => [
        S('ellipse', -300 + i * 120, y, 1500, 1100, c),
        S('ellipse', -300 + i * 120, y, 1500, 1100, pattern('dots', d, c, 3)),
      ]),
      S('ellipse', 800, 250, 110, 110, RED),
      small('Yama no hi', 56, 56, 500, { size: 14 }),
      small('Mountain day, 11 August', 567, 56, 500, { size: 14, align: 'right' }),
      T('Hills\nafter\nrain', 56, 120, 700, { font: JOST, size: 150, weight: 300, ls: -35, lh: 0.95, color: SUMI }),
      L(56, 1448, 1067, 1448, '#EEF0EE', 1, { opacity: 0.6 }),
      T('A walk of nine kilometres, from the valley station to the shrine at the top.', 56, 1470, 500, { font: COR, size: 26, lh: 1.3, color: '#EEF0EE' }),
      T('Starts 07:00\nBring water', 767, 1470, 300, { font: JOST, size: 20, lh: 1.4, color: '#EEF0EE', align: 'right' }),
    ])],
  });
};

const menu = () => {
  const W = 794, H = 1123;
  const item = (y, n, d, p, ink) => [
    T(n, 130, y, 420, { font: JOST, size: 30, weight: 400, color: ink }),
    T(d, 130, y + 42, 420, { font: COR, size: 21, lh: 1.3, color: ink, opacity: 0.8 }),
    T(p, 580, y + 4, 144, { font: JOST, size: 26, weight: 300, color: ink, align: 'right' }),
    L(130, y + 96, 724, y + 96, ink, 1, { opacity: 0.2 }),
  ];
  const side = (ink, title) => [
    T(title, -150, 480, 400, { font: JOST, size: 80, weight: 300, ls: 40, upper: true, color: ink, rotation: 270 }),
  ];
  return tpl({
    id: 'jp-tea-menu', name: 'Tea house menu, two pages', format: 'a4', category: 'Menu',
    tags: ['menu', 'tea', 'japanese', 'cafe', 'minimal'],
    pages: [
      page(WASHI, [
        washi(W, H, 0.35),
        S('ellipse', 560, -130, 340, 340, RED),
        T('Cha', 130, 90, 400, { font: JOST, size: 120, weight: 300, ls: -30, color: SUMI }),
        small('Tea, brewed to order', 130, 230, 400, { size: 12 }),
        L(56, 56, 56, 1067, SUMI, 1),
        T('1', 20, 56, 30, { font: JOST, size: 12, color: SUMI, align: 'center' }),
        ...[['Sencha', 'Green, grassy, first harvest.', '52'], ['Hojicha', 'Roasted, caramel, no bitterness.', '48'], ['Genmaicha', 'Green tea with toasted rice.', '48'], ['Matcha', 'Whisked at the table, thick or thin.', '68'], ['Kuki', 'Stem tea, sweet and light.', '56']].flatMap(([a, b, c], i) => item(380 + i * 120, a, b, c, SUMI)),
        small('Refill with hot water, free', 130, 1030, 600, { size: 11, opacity: 0.7 }),
      ]),
      page('#1A1A1A', [
        washi(W, H, 0.15),
        S('ellipse', 590, 70, 130, 130, RED),
        T('Wagashi', 130, 90, 450, { font: JOST, size: 80, weight: 300, ls: -20, color: WASHI }),
        small('Sweets for the season', 130, 200, 400, { size: 12, color: WASHI }),
        L(56, 56, 56, 1067, WASHI, 1, { opacity: 0.6 }),
        ...[['Daifuku', 'Soft rice cake, red bean, strawberry.', '38'], ['Dorayaki', 'Two pancakes, a thick spoon of an.', '34'], ['Mizu yokan', 'Cold jelly of azuki, cut in squares.', '36'], ['Warabi mochi', 'Bracken starch, roasted soy flour.', '42']].flatMap(([a, b, c], i) => item(380 + i * 120, a, b, c, WASHI)),
        small('Made each morning, gone when gone', 130, 1030, 600, { size: 11, color: WASHI, opacity: 0.7 }),
      ]),
    ],
  });
};

const deck = () => {
  const W = 1920, H = 1080;
  const base = (n, label, els) => page(WASHI, [
    washi(W, H, 0.3),
    small('Ma Studio', 90, 70, 400, { size: 14 }),
    small(label, 760, 70, 400, { size: 14, align: 'center' }),
    small(String(n).padStart(2, '0'), 1430, 70, 400, { size: 14, align: 'right' }),
    L(90, 120, 1830, 120, SUMI, 1),
    ...els,
  ]);
  return tpl({
    id: 'jp-ma-deck', name: 'Studio deck, the space between', format: 'slide', category: 'Presentation',
    tags: ['deck', 'studio', 'japanese', 'minimal', 'slides'],
    pages: [
      base(1, 'Introduction', [
        S('ellipse', 1180, 220, 640, 640, RED),
        T('Ma', 90, 250, 900, { font: JOST, size: 420, weight: 200, ls: -50, lh: 1, color: SUMI }),
        T('The space between things.\nA studio profile, 2026.', 90, 800, 800, { font: COR, size: 40, lh: 1.3, color: SUMI }),
      ]),
      base(2, 'Principles', [
        ...[['One', 'We take things out until it stops working, then put one back.', 120], ['Two', 'The margin belongs to the reader.', 240], ['Three', 'Each drawing gets one colour, picked by hand.', 360]].flatMap(([a, b, d], i) => [
          S('ellipse', 90 + i * 600 + (360 - d) / 2 * 0, 300 + (360 - d) / 2, d, d, i === 2 ? RED : SUMI),
          small(a, 90 + i * 600, 760, 500, { size: 14, opacity: 0.6 }),
          T(b, 90 + i * 600, 800, 480, { font: COR, size: 34, lh: 1.3, color: SUMI }),
        ]),
      ]),
      base(3, 'Process', [
        L(120, 540, 1700, 540, SUMI, 1),
        ...[['Listen', 'Two weeks'], ['Draw', 'Three weeks'], ['Cut', 'One week'], ['Hand over', 'One day']].flatMap(([a, b], i) => [
          S('ellipse', 120 + i * 500 - 18, 522, 36, 36, i === 3 ? RED : WASHI, { stroke: stroke(SUMI, 1.5) }),
          T(a, 120 + i * 500 - 18, 400, 360, { font: JOST, size: 56, weight: 300, ls: -15, color: SUMI }),
          small(b, 120 + i * 500 - 18, 600, 360, { size: 14, opacity: 0.7 }),
          T(['We sit with the people who will use it.', 'Plans, sections, one model.', 'Joinery and edges, full size.', 'Keys, drawings, a long breath.'][i], 120 + i * 500 - 18, 660, 360, { font: COR, size: 30, lh: 1.3, color: SUMI }),
        ]),
      ]),
      base(4, 'Contact', [
        S('ellipse', 90, 250, 660, 660, SUMI),
        T('Thank you.', 880, 330, 900, { font: JOST, size: 140, weight: 300, ls: -35, color: SUMI }),
        T('hello@mastudio.example\nKyobashi Annex 3F, Osaka', 880, 620, 800, { font: COR, size: 40, lh: 1.4, color: SUMI }),
        ...hanko(1744, 900, 86, 'Ma'),
      ]),
    ],
  });
};

const moon = () => {
  const W = 1080, H = 1080, bg = INDIGO, ph = '#EFEBDD';
  const phases = [0, 0.3, 0.55, 0.8, 1];
  return tpl({
    id: 'jp-moon-phases-square', name: 'Moon viewing post', format: 'square', category: 'Social',
    tags: ['event', 'moon', 'japanese', 'minimal', 'night'],
    pages: [page(bg, [
      S('ellipse', 590, 90, 380, 380, ph),
      S('ellipse', 590 + 95, 90 - 30, 380, 380, bg),
      ...phases.flatMap((t, i) => {
        const x = 90 + i * 190, y = 650, d = 130;
        return [
          S('ellipse', x, y, d, d, ph),
          S('ellipse', x + t * d * 0.85, y, d, d, bg, { opacity: 1 }),
        ];
      }),
      L(90, 620, 990, 620, ph, 1, { opacity: 0.4 }),
      T('Tsukimi', 90, 70, 600, { font: JOST, size: 30, weight: 400, ls: 300, upper: true, color: ph }),
      T('Evening of\nmoon viewing', 90, 190, 400, { font: JOST, size: 52, weight: 300, ls: -10, lh: 1.1, color: ph }),
      T('14 September', 90, 830, 500, { font: JOST, size: 64, weight: 300, ls: -15, color: ph }),
      T('Sunset to ten, on the roof of the old bathhouse. Rice dumplings and warm sake.', 90, 930, 560, { font: COR, size: 26, lh: 1.35, color: ph }),
      T('Tickets 250 kr\nlimited to forty', 790, 930, 200, { font: JOST, size: 18, lh: 1.5, color: ph, align: 'right' }),
      overlay('tex/folded-paper.jpg', W, H, 'soft-light', 0.5),
    ])],
  });
};

export default [sun(), enso(), hills(), menu(), deck(), moon()];
