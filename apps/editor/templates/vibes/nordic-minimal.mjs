import { tpl, page, T, S, rect, circle, L, svg, img, overlay, stroke } from '../kit.mjs';

const HAN = 'Hanken Grotesk';
const FAM = 'Familjen Grotesk';
const NEW = 'Newsreader';
const paper = (W, H, a = 0.25) => overlay('tex/paper-fibre.jpg', W, H, 'multiply', a);
const grid = (W, H, step, c = '#1B1B1A', o = 0.07) => {
  const out = [];
  for (let x = step; x < W; x += step) out.push(L(x, 0, x, H, c, 1, { opacity: o }));
  for (let y = step; y < H; y += step) out.push(L(0, y, W, y, c, 1, { opacity: o }));
  return out;
};
const D = {
  stool: '<ellipse cx="50" cy="28" rx="32" ry="8"/><path d="M24 31 L16 90 M76 31 L84 90 M50 36 L50 90"/>',
  lamp: '<path d="M50 0 L50 28 M20 64 C20 42 35 28 50 28 C65 28 80 42 80 64 Z M40 64 C40 76 60 76 60 64"/>',
  chair: '<path d="M30 10 L34 52 L74 52 M34 52 L28 92 M74 52 L74 92 M30 10 C44 5 58 6 70 14 L74 52"/>',
  jug: '<path d="M28 40 C24 70 30 90 50 90 C70 90 76 70 72 40 Z M34 40 L40 26 L60 26 L66 40 M72 50 C90 50 90 72 70 72 M44 26 C44 16 56 16 56 26"/>',
};
const draw = (k, c = '#1B1B1A', w = 1.4) => `<svg viewBox="0 0 100 100"><g fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${D[k]}</g></svg>`;

const lamp = () => {
  const W = 1080, H = 1350, ink = '#1B1B1A', cob = '#1F4FD8';
  return tpl({
    id: 'nordic-evening-light-post', name: 'Product post, split title', format: 'post', category: 'Social',
    tags: ['product', 'furniture', 'launch', 'nordic', 'minimal'],
    pages: [page('#F1EEE6', [
      ...grid(W, H, 54),
      T('Nordhem Studio', 54, 54, 400, { font: HAN, size: 18, weight: 600, ls: 40, color: ink }),
      T('New / Autumn 2026', 626, 54, 400, { font: HAN, size: 18, weight: 500, color: ink, align: 'right' }),
      T('evening', 54, 120, 800, { font: FAM, size: 190, weight: 700, ls: -60, lh: 1, color: cob }),
      S('rect', 270, 310, 540, 640, '#DCE2E4'),
      img('art/nordic-lino-pendant-lamp.png', 340, 310, 400, 600),
      T('light', 360, 960, 700, { font: FAM, size: 190, weight: 700, ls: -60, lh: 1, color: cob, align: 'right' }),
      T('Pendant 02\nOpal glass, oak cord', 54, 1190, 360, { font: HAN, size: 18, lh: 1.45, color: ink }),
      T('From 1 490 kr\nnordhem.example', 626, 1190, 400, { font: HAN, size: 18, lh: 1.45, color: ink, align: 'right' }),
      paper(W, H, 0.2),
    ])],
  });
};

const tiles = () => {
  const W = 1123, H = 1587, ink = '#1B1B1A';
  const items = [['stool', 'Stool 01', '1933'], ['pendant-lamp', 'Pendant 02', '1954'], ['chair', 'Chair 03', '1962'], ['jug', 'Jug 04', '1978']];
  const tw = 487, th = 560;
  return tpl({
    id: 'nordic-object-tiles', name: 'Four objects poster', format: 'poster', category: 'Poster',
    tags: ['design', 'objects', 'catalogue', 'nordic', 'poster'],
    pages: [page('#F6F4EE', [
      ...items.flatMap(([k, n, y], i) => {
        const x = 56 + (i % 2) * (tw + 37), yy = 56 + Math.floor(i / 2) * (th + 24);
        return [
          S('rect', x, yy, tw, th, '#CBB89B'),
          img(`art/nordic-lino-${k}.png`, x + (tw - 300) / 2, yy + 24, 300, 450),
          T(n, x + 28, yy + th - 82, 300, { font: HAN, size: 24, weight: 600, color: ink }),
          T(y, x + tw - 128, yy + th - 82, 100, { font: HAN, size: 24, color: ink, align: 'right' }),
          T('Ash and linen', x + 28, yy + th - 48, 300, { font: HAN, size: 17, color: ink, opacity: 0.7 }),
        ];
      }),
      T('Four things for the kitchen', 56, 1360, 700, { font: FAM, size: 54, weight: 600, ls: -35, lh: 1.05, color: ink }),
      T('Hallen Museum of Design\n3 October to 24 January', 56, 1480, 600, { font: HAN, size: 22, lh: 1.4, color: ink }),
      T('Free on Thursdays', 767, 1480, 300, { font: HAN, size: 22, color: ink, align: 'right' }),
      paper(W, H, 0.25),
    ])],
  });
};

const sky = () => {
  const W = 794, H = 1123, ink = '#1B1B1A', cob = '#1F4FD8';
  return tpl({
    id: 'nordic-open-sky-a4', name: 'Exhibition poster, big lowercase', format: 'a4', category: 'Poster',
    tags: ['exhibition', 'photography', 'nordic', 'a4'],
    pages: [page('#F4F3EE', [
      T('Photographs 2019 to 2026', 40, 40, 400, { font: HAN, size: 13, weight: 600, color: ink }),
      T('Anna Berglund', 354, 40, 400, { font: HAN, size: 13, color: ink, align: 'right' }),
      img('photos/ocean.jpg', 40, 80, 714, 420, { filters: { saturation: -25, contrast: 8 } }),
      T('Fig. 1  Skagerrak, 06:40', 40, 508, 400, { font: HAN, size: 12, color: ink, opacity: 0.7 }),
      T('open\nsky', 34, 560, 720, { font: FAM, size: 250, weight: 700, ls: -75, lh: 0.82, color: cob }),
      T('Forty two pictures of weather, taken from the same bench over seven years.', 440, 920, 314, { font: HAN, size: 16, lh: 1.45, color: ink }),
      L(40, 1050, 754, 1050, ink, 1),
      T('Gallery Havet, Strandvagen 12', 40, 1066, 400, { font: HAN, size: 13, weight: 600, color: ink }),
      T('7 to 30 November', 354, 1066, 400, { font: HAN, size: 13, color: ink, align: 'right' }),
      paper(W, H, 0.2),
    ])],
  });
};

const sauna = () => {
  const W = 559, H = 794, ink = '#1D3A30', bg = '#EDEBE2';
  const rows = [['Mon', 'Closed', ''], ['Tue', '17 to 21', 'Mixed'], ['Wed', '17 to 21', 'Women'], ['Thu', '17 to 21', 'Mixed'], ['Fri', '16 to 22', 'Mixed'], ['Sat', '12 to 22', 'Mixed'], ['Sun', '12 to 19', 'Men']];
  return tpl({
    id: 'nordic-sauna-hours', name: 'Opening hours flyer', format: 'flyer', category: 'Flyer',
    tags: ['sauna', 'opening hours', 'schedule', 'nordic'],
    pages: [page(bg, [
      img('art/nordic-birch-linocut.jpg', 345, 28, 186, 262),
      T('Sauna', 28, 40, 300, { font: FAM, size: 88, weight: 700, ls: -50, lh: 0.9, color: ink }),
      T('at the\nharbour', 28, 130, 300, { font: FAM, size: 88, weight: 700, ls: -50, lh: 0.9, color: ink }),
      L(28, 300, 531, 300, ink, 1.5),
      ...rows.flatMap(([d, t, g], i) => [
        T(d, 28, 316 + i * 48, 120, { font: HAN, size: 20, weight: 600, color: ink }),
        T(t, 170, 316 + i * 48, 200, { font: HAN, size: 20, color: ink }),
        T(g, 380, 316 + i * 48, 151, { font: HAN, size: 20, color: ink, align: 'right', opacity: 0.8 }),
        L(28, 346 + i * 48 + 8, 531, 346 + i * 48 + 8, ink, 1, { opacity: 0.25 }),
      ]),
      T('Bring a towel. Swimming trunks required in mixed sessions. 90 kr, or ten visits for 700.', 28, 690, 360, { font: HAN, size: 13, lh: 1.5, color: ink }),
      T('Kajen 3, Gothenburg', 380, 690, 151, { font: HAN, size: 13, weight: 600, color: ink, align: 'right' }),
      paper(W, H, 0.25),
    ])],
  });
};

const deck = () => {
  const W = 1920, H = 1080, ink = '#1B1B1A', bg = '#F2EFE7';
  const base = (n, els) => page(bg, [
    ...grid(W, H, 120, ink, 0.05),
    T('Annual report 2026', 80, 60, 600, { font: HAN, size: 22, weight: 600, color: ink }),
    T(String(n).padStart(2, '0'), 1760, 60, 80, { font: HAN, size: 22, color: ink, align: 'right' }),
    ...els, paper(W, H, 0.2),
  ]);
  return tpl({
    id: 'nordic-annual-deck', name: 'Annual report deck', format: 'slide', category: 'Presentation',
    tags: ['report', 'deck', 'nordic', 'minimal', 'slides'],
    pages: [
      base(1, [
        img('art/nordic-birch-linocut.jpg', 1260, 140, 580, 800),
        T('the year\nin short', 74, 280, 1200, { font: FAM, size: 260, weight: 700, ls: -70, lh: 0.88, color: '#1F4FD8' }),
        T('Birch & Co, Malmo', 80, 940, 600, { font: HAN, size: 22, color: ink }),
        T('Prepared for the members, March 2027', 1160, 940, 680, { font: HAN, size: 22, color: ink, align: 'right' }),
      ]),
      base(2, [
        T('We planted\n4 200 trees.', 80, 240, 1000, { font: FAM, size: 130, weight: 700, ls: -45, lh: 0.98, color: ink }),
        T('Most of them birch, a few hundred oak along the south fence. Survival after the first winter was 91 percent, up from 78.', 1100, 260, 640, { font: NEW, size: 36, lh: 1.4, color: ink }),
        ...[['4 200', 'planted'], ['91%', 'survived'], ['12', 'volunteers']].flatMap(([a, b], i) => [
          L(80 + i * 580, 760, 600 + i * 580, 760, ink, 1.5),
          T(a, 80 + i * 580, 780, 500, { font: FAM, size: 100, weight: 600, ls: -40, color: ink }),
          T(b, 80 + i * 580, 910, 500, { font: HAN, size: 22, color: ink }),
        ]),
      ]),
      base(3, [
        S('rect', 80, 180, 780, 780, '#C9B79C'),
        img('art/nordic-lino-stool.png', 280, 230, 380, 570),
        T('Where the money went', 1000, 240, 760, { font: FAM, size: 80, weight: 700, ls: -35, lh: 1, color: ink }),
        ...[['Seedlings and soil', '48%'], ['Tools and fencing', '21%'], ['Workshops', '19%'], ['Rent and admin', '12%']].flatMap(([a, b], i) => [
          T(a, 1000, 520 + i * 90, 560, { font: HAN, size: 30, color: ink }),
          T(b, 1560, 520 + i * 90, 200, { font: HAN, size: 30, weight: 600, color: ink, align: 'right' }),
          L(1000, 566 + i * 90, 1760, 566 + i * 90, ink, 1, { opacity: 0.3 }),
        ]),
      ]),
      base(4, [
        T('next\nspring', 74, 280, 1200, { font: FAM, size: 260, weight: 700, ls: -70, lh: 0.88, color: '#1F4FD8' }),
        T('Planting days begin on the first Saturday of April.\nBring boots. We bring coffee.', 1060, 740, 780, { font: NEW, size: 36, lh: 1.4, color: ink, align: 'left' }),
      ]),
    ],
  });
};

const cal = () => {
  const W = 1080, H = 1080, ink = '#1B1B1A', red = '#D8342B';
  const cells = [];
  const cw = 144, x0 = 36, y0 = 400;
  for (let d = 1; d <= 30; d++) {
    const idx = d + 5; // November starts on a Sunday-ish offset
    const col = (idx - 1) % 7, row = Math.floor((idx - 1) / 7);
    const x = x0 + col * cw + 14, y = y0 + row * 112;
    if (d === 19) cells.push(S('ellipse', x - 14 + (cw - 94) / 2, y - 18, 94, 94, red));
    cells.push(T(String(d), x - 14, y, cw, { font: FAM, size: 40, weight: d === 19 ? 700 : 400, color: d === 19 ? '#F4F2EA' : ink, align: 'center' }));
  }
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return tpl({
    id: 'nordic-calendar-square', name: 'Month calendar post', format: 'square', category: 'Social',
    tags: ['calendar', 'event', 'date', 'nordic', 'minimal'],
    pages: [page('#F4F2EA', [
      T('november', 36, 36, 900, { font: FAM, size: 190, weight: 700, ls: -65, lh: 1, color: ink }),
      T('Book club meets on the 19th, seven o\'clock, at the corner library. We are reading something short.', 36, 262, 980, { font: NEW, size: 26, lh: 1.35, color: ink }),
      ...days.map((d, i) => T(d, x0 + i * cw, 356, cw, { font: FAM, size: 20, weight: 600, color: ink, align: 'center', opacity: 0.6 })),
      L(36, 392, 1044, 392, ink, 1.5),
      ...cells,
      L(36, 1044, 1044, 1044, ink, 1),
      paper(W, H, 0.2),
    ])],
  });
};

export default [lamp(), tiles(), sky(), sauna(), deck(), cal()];
