import { tpl, page, T, S, rect, circle, L, svg, img, linear, radial, pattern, overlay, stroke } from '../kit.mjs';

const BRI = 'Bricolage Grotesque';
const FRA = 'Fraunces';
const SANS = 'Figtree';
const fiber = (W, H, a = 0.35) => overlay('tex/paper-fibre.jpg', W, H, 'soft-light', a);
const blob = (x, y, w, h, c, b = 90, o = 1) => S('ellipse', x, y, w, h, c, { blur: b, opacity: o });

const ART = {
  leaf: '<path d="M20 82 C12 40 45 10 82 16 C88 56 56 88 20 82 Z M20 82 L64 36"/>',
  tulip: '<path d="M50 90 L50 54 M28 16 C28 44 38 56 50 56 C62 56 72 44 72 16 C63 26 56 20 50 10 C44 20 37 26 28 16 Z M50 76 C38 76 30 68 27 60 M50 80 C62 80 70 72 73 64"/>',
  carrot: '<path d="M50 94 C32 72 30 42 40 30 L60 30 C70 42 68 72 50 94 Z M44 30 C38 16 46 8 50 5 C54 8 62 16 56 30 M39 46 L50 46 M41 60 L53 60"/>',
  flower: '<circle cx="50" cy="26" r="16"/><circle cx="74" cy="44" r="16"/><circle cx="65" cy="72" r="16"/><circle cx="35" cy="72" r="16"/><circle cx="26" cy="44" r="16"/><circle cx="50" cy="52" r="7"/>',
};
const line = (k, c = '#FFFFFF', w = 1.6) => `<svg viewBox="0 0 100 100"><g fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${ART[k]}</g></svg>`;

const market = () => {
  const W = 1123, H = 1587, ink = '#243268';
  const cells = [['leaf', 56, 56], ['tulip', 582, 56], ['carrot', 56, 466], ['flower', 582, 466]];
  return tpl({
    id: 'pastel-spring-market', name: 'Spring market poster', format: 'poster', category: 'Event',
    tags: ['market', 'spring', 'pastel', 'poster', 'fair'],
    pages: [page('#CFE9F7', [
      blob(-200, -100, 800, 700, '#F6EFA0', 110),
      blob(500, 150, 800, 700, '#FBC8DA', 120),
      blob(-100, 650, 700, 600, '#BDE8C8', 110),
      blob(600, 700, 700, 600, '#A9CCF6', 110),
      fiber(W, H),
      L(561, 56, 561, 880, '#FFFFFF', 3), L(56, 460, 1067, 460, '#FFFFFF', 3),
      L(56, 56, 1067, 56, '#FFFFFF', 3), L(56, 880, 1067, 880, '#FFFFFF', 3),
      L(56, 56, 56, 880, '#FFFFFF', 3), L(1067, 56, 1067, 880, '#FFFFFF', 3),
      ...cells.map(([k, x, y]) => svg(line(k), x + 60, y + 30, 380, 350)),
      T('Spring\nmarket', 56, 940, 1000, { font: BRI, size: 250, weight: 800, ls: -60, lh: 0.84, color: '#FFFFFF' }),
      T('Seedlings, bread, ceramics and second hand books under the plane trees.', 56, 1390, 520, { font: SANS, size: 28, lh: 1.35, weight: 500, color: ink }),
      T('22 and 23 April', 700, 1390, 367, { font: SANS, size: 28, weight: 700, color: ink, align: 'right' }),
      T('Saturday 10 to 17\nSunday 11 to 16\nOlive Square', 700, 1436, 367, { font: SANS, size: 24, lh: 1.35, color: ink, align: 'right' }),
    ])],
  });
};

const menu = () => {
  const W = 794, H = 1123, ink = '#4A2E2A';
  const item = (y, n, d, p) => [
    T(n, 70, y, 460, { font: BRI, size: 30, weight: 700, color: ink }),
    T(d, 70, y + 40, 460, { font: SANS, size: 17, lh: 1.35, color: ink, opacity: 0.8 }),
    T(p, 600, y + 4, 124, { font: BRI, size: 28, weight: 600, color: ink, align: 'right' }),
    L(70, y + 90, 724, y + 90, ink, 1, { opacity: 0.25, dash: 'dot' }),
  ];
  const side = () => [];
  return tpl({
    id: 'pastel-cafe-menu', name: 'Cafe menu, two pages', format: 'a4', category: 'Menu',
    tags: ['menu', 'cafe', 'pastel', 'bakery'],
    pages: [
      page('#FFF6EC', [
        ...side(0, '#F7C6D0', '#FBE9A5'),
        T('Drinks', 70, 70, 400, { font: BRI, size: 120, weight: 800, ls: -45, lh: 1, color: ink }),
        T('Pour over, oat, tea, and the cold ones', 70, 200, 400, { font: SANS, size: 20, color: ink }),
        ...item(480, 'Filter coffee', 'Single origin, changes every Monday. Refills are free.', '38'),
        ...item(590, 'Flat white', 'Double shot, steamed oat or whole milk.', '46'),
        ...item(700, 'Rose cardamom latte', 'Honey, a little rose water, ground cardamom.', '56'),
        ...item(810, 'Iced hojicha', 'Roasted green tea, milk, lots of ice.', '52'),
        ...item(920, 'Hot chocolate', 'Dark, thick, with a spoon of cream.', '48'),
        fiber(W, H, 0.3),
      ]),
      page('#F4F0FF', [
        T('Sweets', 330, 70, 440, { font: BRI, size: 120, weight: 800, ls: -45, lh: 1, color: '#2E3A6B' }),
        T('Baked at six, gone by three', 330, 200, 400, { font: SANS, size: 20, color: '#2E3A6B' }),
        ...[['Cardamom bun', 'Laminated, glazed with sugar and a pinch of salt.', '38'], ['Lemon olive cake', 'Soft crumb, olive oil, a thin sugar crust.', '52'], ['Strawberry tart', 'Almond cream, fruit from the farm up the road.', '62'], ['Oat cookie', 'Chewy, with brown butter and dark chocolate.', '28']].flatMap(([a, b, c], i) => [
          T(a, 70, 480 + i * 130, 460, { font: BRI, size: 30, weight: 700, color: '#2E3A6B' }),
          T(b, 70, 520 + i * 130, 460, { font: SANS, size: 17, lh: 1.35, color: '#2E3A6B', opacity: 0.8 }),
          T(c, 600, 484 + i * 130, 124, { font: BRI, size: 28, weight: 600, color: '#2E3A6B', align: 'right' }),
          L(70, 570 + i * 130, 724, 570 + i * 130, '#2E3A6B', 1, { opacity: 0.25, dash: 'dot' }),
        ]),
        T('Ask about gluten free and vegan, we usually have both.', 70, 1040, 650, { font: SANS, size: 18, color: '#2E3A6B' }),
        fiber(W, H, 0.3),
      ]),
    ],
  });
};

const carousel = () => {
  const W = 1080, H = 1080, ink = '#3A2342';
  const pg = (bg, els) => page(bg, [...els, fiber(W, H, 0.3)]);
  return tpl({
    id: 'pastel-soap-carousel', name: 'Product launch, three squares', format: 'square', category: 'Social',
    tags: ['carousel', 'launch', 'soap', 'pastel', 'instagram'],
    pages: [
      pg('#F9D3D0', [
        S('arch', 150, 330, 380, 600, '#FBE9A5', { blend: 'multiply' }),
        S('arch', 400, 330, 380, 600, '#BFE0F5', { blend: 'multiply' }),
        S('arch', 650, 330, 300, 600, '#CFC5F2', { blend: 'multiply' }),
        T('Oat and peach,\nour new batch', 70, 70, 900, { font: FRA, size: 104, weight: 300, ls: -35, lh: 1, color: ink }),
        T('Soft Soap Co.', 70, 985, 400, { font: SANS, size: 22, weight: 700, ls: 120, upper: true, color: ink }),
        T('Batch No. 12', 680, 985, 330, { font: SANS, size: 22, weight: 700, ls: 120, upper: true, color: ink, align: 'right' }),
        L(70, 960, 1010, 960, ink, 1.5),
        T('Cold process bars, cured for six weeks.', 70, 1020, 700, { font: SANS, size: 24, weight: 500, color: ink }),
      ]),
      pg('#CDEBDD', [
        ...[['Oat', '#FBE9A5', 90], ['Peach', '#FFC6A8', 410], ['Clay', '#D9C2F0', 730]].flatMap(([n, c, x]) => [
          S('arch', x, 250, 260, 500, c, { blend: 'multiply' }),
          T(n, x, 780, 260, { font: FRA, size: 44, weight: 400, color: ink, align: 'center' }),
          T({ Oat: 'Milled fine, soothing', Peach: 'Kernel oil, a soft scent', Clay: 'Pink clay, gentle grip' }[n], x, 845, 260, { font: SANS, size: 20, weight: 500, color: ink, align: 'center', opacity: 0.8 }),
        ]),
        T('Three things inside', 70, 70, 900, { font: FRA, size: 80, weight: 300, ls: -30, lh: 1, color: ink }),
        T('Nothing else. No perfume, no dye.', 70, 960, 800, { font: SANS, size: 26, weight: 500, color: ink }),
      ]),
      pg('#E6DCFA', [
        S('ellipse', 590, 260, 500, 500, '#FBD3DE', { blend: 'multiply' }),
        S('ellipse', 430, 380, 420, 420, '#FFE9A8', { blend: 'multiply' }),
        T('Find us', 70, 70, 900, { font: FRA, size: 110, weight: 300, ls: -35, lh: 1, color: ink }),
        T('Saturdays at the Olive Square market, or by post, anywhere in Sweden.', 70, 210, 520, { font: SANS, size: 28, lh: 1.35, color: ink }),
        L(70, 900, 1010, 900, ink, 1.5),
        T('Saturday\n10 to 15', 70, 920, 300, { font: SANS, size: 24, weight: 700, lh: 1.3, color: ink }),
        T('Olive Square\nStall 14', 400, 920, 300, { font: SANS, size: 24, weight: 700, lh: 1.3, color: ink }),
        T('softsoap.example', 710, 920, 300, { font: SANS, size: 24, weight: 700, lh: 1.3, color: ink, align: 'right' }),
      ]),
    ],
  });
};

const bokeh = () => {
  const W = 1080, H = 1350, ink = '#4A1F3D';
  const dots = [[90, 120, 260], [700, 60, 200], [820, 380, 330], [40, 560, 180], [420, 300, 140], [620, 760, 220], [160, 880, 240]];
  return tpl({
    id: 'pastel-open-studio', name: 'Open studio post, soft field', format: 'post', category: 'Social',
    tags: ['open studio', 'art', 'pastel', 'gradient', 'event'],
    pages: [page('#FBD9E4', [
      blob(-200, 300, 900, 900, '#F9B5CE', 160),
      blob(500, -100, 800, 700, '#FFE7B4', 150),
      T('open\nstudio', 70, 640, 900, { font: BRI, size: 230, weight: 800, ls: -60, lh: 0.84, color: ink }),
      T('Fifteen painters, one old laundry building, tea on the stairs.', 70, 1130, 520, { font: SANS, size: 28, lh: 1.35, weight: 500, color: ink }),
      T('Sat 14 and\nSun 15 March\nBlock C, Lindhagen', 700, 1130, 310, { font: SANS, size: 24, lh: 1.4, weight: 700, color: ink, align: 'right' }),
      fiber(W, H, 0.35),
    ])],
  });
};

const stat = () => {
  const W = 1080, H = 1920, ink = '#2D2A5E';
  return tpl({
    id: 'pastel-seven-in-ten-story', name: 'Big number story', format: 'story', category: 'Social',
    tags: ['stat', 'story', 'pastel', 'survey', 'number'],
    pages: [page('#E5DDFB', [
      blob(-300, 100, 1000, 900, '#FFE7A0', 170),
      blob(400, 600, 1100, 1000, '#F7B9D4', 180),
      blob(-200, 1200, 1100, 800, '#B9DDF7', 170),
      T('7', 40, 330, 900, { font: FRA, size: 720, weight: 300, ls: -50, lh: 1, color: ink }),
      T('in 10', 470, 800, 540, { font: FRA, size: 150, weight: 300, ls: -30, lh: 1, color: ink }),
      T('library members said they read more after they stopped buying books.', 90, 1260, 760, { font: SANS, size: 44, lh: 1.25, weight: 500, color: ink }),
      L(90, 1560, 990, 1560, ink, 1.5),
      ...[['1 200', 'members asked'], ['41%', 'read weekly'], ['6', 'branches']].flatMap(([a, b], i) => [
        T(a, 90 + i * 300, 1580, 280, { font: FRA, size: 56, weight: 300, color: ink }),
        T(b, 90 + i * 300, 1650, 280, { font: SANS, size: 22, weight: 500, color: ink, opacity: 0.8 }),
      ]),
      T('Spring 2026, public libraries', 90, 1760, 860, { font: SANS, size: 30, weight: 600, color: ink, opacity: 0.8 }),
      fiber(W, H, 0.35),
    ])],
  });
};

const flyer = () => {
  const W = 559, H = 794, ink = '#33305F';
  return tpl({
    id: 'pastel-clay-flyer', name: 'Workshop flyer, hands in clay', format: 'flyer', category: 'Event',
    tags: ['workshop', 'ceramics', 'class', 'pastel', 'flyer'],
    pages: [page('#FADFE0', [
      S('rect', 0, 0, W, 470, pattern('stripes', '#F6C9D0', '#FADFE0', 4)),
      img('photos/hands-clay.jpg', 120, 120, 320, 350, { mask: 'arch' }),
      S('rect', 0, 480, W, 4, ink),
      T('Hands in clay', 36, 40, 480, { font: BRI, size: 62, weight: 800, ls: -40, lh: 0.95, color: ink }),
      T('Six evenings of wheel throwing for people who have never touched one.', 36, 515, 330, { font: SANS, size: 17, lh: 1.4, weight: 500, color: ink }),
      T('Tuesdays\n18:00 to 21:00\nfrom 6 May', 390, 515, 133, { font: SANS, size: 15, lh: 1.45, weight: 700, color: ink, align: 'right' }),
      L(36, 700, 523, 700, ink, 1, { opacity: 0.4 }),
      T('Kiln & Co, Vasagatan 9', 36, 715, 300, { font: SANS, size: 13, weight: 600, color: ink }),
      T('1 800 kr, clay and firing included', 250, 715, 273, { font: SANS, size: 13, color: ink, align: 'right' }),
      fiber(W, H, 0.3),
    ])],
  });
};

export default [menu(), carousel(), bokeh(), stat(), flyer()];
