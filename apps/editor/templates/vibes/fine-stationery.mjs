import { tpl, page, T, rect, L, img, qr, overlay, stroke } from '../kit.mjs';

const INK = '#1A1816', GREY = '#8A8479', BONE = '#EDE8DD', GREIGE = '#CFC6B6';
const A = (n) => `art/${n}.png`;
const SHEET = A('stat-cotton-sheet'), WREATH = A('stat-watercolour-wreath'), SPRIG = A('stat-pressed-sprig'), SEAL = A('stat-wax-seal');
const ORN = A('stat-letterpress-ornament'), MONO = A('stat-monogram-frame'), SUPPER = A('stat-ink-supper'), OLIVE = A('stat-olive-branch');
const cap = (txt, x, y, w, p = {}) => T(txt, x, y, w, { font: 'Jost', size: 9.5, weight: 400, ls: 260, upper: true, color: INK, lh: 1.7, ...p });
const shadow = { x: 0, y: 6, blur: 18, color: '#3A302255' };

// ------------------------------------------------------------ 1
const scriptInvite = tpl({
  id: 'stationery-script-invite', name: 'Wreath wedding invitation, two sides', format: 'invite', category: 'Invitation', tags: ['wedding', 'invitation', 'watercolour', 'rsvp'],
  pages: [
    page(GREIGE, [
      img(SHEET, 12, 12, 456, 649, { shadow }),
      cap('Together with their families', 40, 52, 400, { align: 'center', size: 8.5 }),
      img(WREATH, 30, 84, 420, 420),
      T('Elin', 100, 218, 300, { font: 'Pinyon Script', size: 50, color: INK, align: 'center', lh: 1 }),
      T('and', 100, 276, 300, { font: 'Cormorant Garamond', size: 17, color: GREY, align: 'center' }),
      T('Oskar', 110, 290, 300, { font: 'Pinyon Script', size: 50, color: INK, align: 'center', lh: 1 }),
      cap('are getting married', 40, 520, 400, { align: 'center', size: 8.5 }),
      cap('Saturday 14 June 2026   at four o’clock', 40, 548, 400, { align: 'center', size: 9.5, weight: 500 }),
      T('Saltsjobaden church', 40, 580, 400, { font: 'Cormorant Garamond', size: 18, color: INK, align: 'center' }),
    ]),
    page(GREIGE, [
      img(SHEET, 12, 12, 456, 649, { shadow }),
      cap('The day', 60, 66, 360, { align: 'center', color: GREY }),
      T('We marry at four in Saltsjobaden church.\nDinner and dancing follow at Villa Sjohage,\na short walk down the hill.', 40, 100, 400, { font: 'Cormorant Garamond', size: 18, color: INK, align: 'center', lh: 1.4 }),
      img(ORN, 130, 164, 220, 146),
      cap('Dress', 60, 304, 360, { align: 'center', color: GREY }),
      T('Garden formal. The lawn is soft,\nso think about your shoes.', 50, 336, 380, { font: 'Cormorant Garamond', size: 19, color: INK, align: 'center', lh: 1.4 }),
      cap('Reply by 1 May', 60, 420, 360, { align: 'center', color: GREY }),
      T('hello@elinandoskar.example\n070 123 45 67', 50, 450, 380, { font: 'Cormorant Garamond', size: 19, color: INK, align: 'center', lh: 1.4 }),
      img(SPRIG, 330, 468, 120, 180, { rotation: 8 }),
      T('Elin & Oskar', 40, 590, 260, { font: 'Pinyon Script', size: 38, color: INK, align: 'center' }),
    ]),
  ],
});

// ------------------------------------------------------------ 2
const menuCard = (() => {
  const course = (y, head, name, desc) => [
    cap(head, 120, y, 554, { align: 'center', color: GREY }),
    T(name, 120, y + 28, 554, { font: 'Cormorant Garamond', size: 30, weight: 500, color: INK, align: 'center', lh: 1.1 }),
    T(desc, 120, y + 66, 554, { font: 'Cormorant Garamond', size: 18, color: INK, align: 'center', lh: 1.3, opacity: 0.7 }),
  ];
  return tpl({
    id: 'stationery-arch-menu', name: 'Dinner menu on cotton paper', format: 'a4', category: 'Invitation', tags: ['wedding', 'menu', 'dinner', 'olive'],
    pages: [page(GREIGE, [
      img(SHEET, 60, 36, 674, 1011, { shadow: { x: 0, y: 10, blur: 28, color: '#3A302255' } }),
      T('Menu', 120, 100, 554, { font: 'Cormorant Garamond', size: 104, weight: 300, color: INK, align: 'center', ls: 20, lh: 1 }),
      cap('Elin and Oskar   14 June 2026', 120, 232, 554, { align: 'center' }),
      img(ORN, 247, 244, 300, 200),
      course(400, 'To begin', 'Chilled pea soup', 'mint, creme fraiche, sourdough crisp'),
      course(520, 'Fish', 'Hake with brown butter', 'new potatoes, dill, pickled green strawberries'),
      course(640, 'Main', 'Slow roast lamb', 'charred leeks, anchovy, rosemary jus'),
      course(760, 'Cheese', 'Vasterbotten, well aged', 'cloudberry jam, rye crackers'),
      course(880, 'To finish', 'Burnt honey cake', 'whipped cream, wild blueberries'),
      T('Please tell us about allergies before the day.', 120, 1000, 554, { font: 'Jost', size: 10, ls: 100, color: GREY, align: 'center' }),
      img(OLIVE, 560, 700, 220, 330, { rotation: 0 }),
    ])],
  });
})();

// ------------------------------------------------------------ 3
const saveDate = tpl({
  id: 'stationery-save-the-date', name: 'Save the date, stacked names', format: 'post', category: 'Invitation', tags: ['save the date', 'wedding', 'announcement', 'pressed flower'],
  pages: [page(BONE, [
    T('14', 90, 100, 1000, { font: 'Bodoni Moda', size: 1100, weight: 400, color: '#E2DACA', lh: 0.85, ls: -60 }),
    T('ELIN\nOSKAR', 70, 80, 640, { font: 'Cormorant Garamond', size: 140, weight: 300, color: INK, lh: 0.88, ls: 20 }),
    img(SPRIG, 790, 640, 230, 345, { rotation: 6 }),
    T('save the date', 150, 640, 700, { font: 'Mrs Saint Delafield', size: 190, color: INK, rotation: -8 }),
    L(70, 1140, 1010, 1140, INK, 1),
    cap('June', 70, 1168, 240, { size: 15, ls: 400 }),
    T('2026', 70, 1198, 300, { font: 'Cormorant Garamond', size: 64, weight: 300, color: INK, ls: 40 }),
    cap('Villa Sjohage\nSaltsjobaden, Sweden', 430, 1170, 300, { size: 14, ls: 300, lh: 1.9 }),
    cap('Invitation\nto follow', 780, 1170, 230, { size: 14, ls: 300, lh: 1.9, align: 'right' }),
    overlay('tex/paper-fibre.jpg', 1080, 1350, 'multiply', 0.35),
  ])],
});

// ------------------------------------------------------------ 4
const placeCards = (() => {
  const names = [['Astrid Lindqvist', 'Table 1'], ['Gustav Ekman', 'Table 1'], ['Maja Holm', 'Table 2'], ['Teodor Bergh', 'Table 2'], ['Signe Falk', 'Table 3'], ['Ivar Nord', 'Table 3'], ['Linnea Ahl', 'Table 4'], ['Felix Dahl', 'Table 4']];
  const els = [];
  names.forEach(([n, t], i) => {
    const x = i % 2 ? 402 : 52, y = 62 + Math.floor(i / 2) * 257, w = 340, h = 227;
    els.push(img(SHEET, x, y, w, h, { crop: { x: 0.1, y: 0.3, w: 0.8, h: 0.3 }, shadow: { x: 0, y: 2, blur: 5, color: '#00000030' } }));
    els.push(L(x + 14, y + h / 2, x + w - 14, y + h / 2, '#B9B1A0', 1, { dash: 'dash' }));
    els.push(T(t, x, y + 38, w, { font: 'Jost', size: 9.5, ls: 300, upper: true, color: GREY, align: 'center', rotation: 180 }));
    els.push(T(n, x, y + 118, w, { font: 'Pinyon Script', size: 40, color: INK, align: 'center', lh: 1.1 }));
    els.push(img(ORN, x + w / 2 - 70, y + 166, 140, 93));
  });
  return tpl({
    id: 'stationery-place-cards', name: 'Place cards, tent fold sheet', format: 'a4', category: 'Invitation', tags: ['place cards', 'wedding', 'dinner', 'print'],
    pages: [page(GREIGE, [els, T('Cut along the edge, fold on the dashed line.', 52, 1070, 690, { font: 'Jost', size: 10, ls: 150, color: '#6F685B', align: 'center' })])],
  });
})();

// ------------------------------------------------------------ 5
const supperLine = (() => {
  const BLUE = '#2B3FD6', CREAM = '#F3EFE2';
  return tpl({
    id: 'stationery-supper-line', name: 'Supper invitation, inked table', format: 'pin', category: 'Invitation', tags: ['supper club', 'dinner', 'invitation', 'ink drawing'],
    pages: [page(CREAM, [
      img(SUPPER, 60, 90, 880, 587),
      T('Long table,\nlate supper', 70, 760, 860, { font: 'Instrument Serif', size: 130, color: BLUE, lh: 0.95, ls: -20 }),
      L(70, 1100, 930, 1100, BLUE, 1.5),
      T('Saturday 12 October', 70, 1130, 450, { font: 'Instrument Serif', size: 40, color: BLUE }),
      T('Seven o’clock, the old\nbakery on Kvarngatan', 70, 1190, 450, { font: 'Familjen Grotesk', size: 24, weight: 400, color: BLUE, lh: 1.35 }),
      T('Twenty four seats.\nBring something to pour.\nReply to book a place.', 480, 1130, 450, { font: 'Familjen Grotesk', size: 24, weight: 400, color: BLUE, lh: 1.35, align: 'right' }),
      T('hello@suppers.example', 480, 1290, 450, { font: 'Familjen Grotesk', size: 24, weight: 600, color: BLUE, align: 'right' }),
      overlay('tex/paper-fibre.jpg', 1000, 1500, 'multiply', 0.3),
    ])],
  });
})();

// ------------------------------------------------------------ 6
const coords = tpl({
  id: 'stationery-coordinates', name: 'Coordinates announcement', format: 'post', category: 'Invitation', tags: ['coordinates', 'opening', 'invitation', 'location', 'pressed flower'],
  pages: [page('#F8F6F1', [
    L(60, 0, 60, 1350, '#D8D2C4', 1), L(1020, 0, 1020, 1350, '#D8D2C4', 1),
    L(0, 120, 1080, 120, '#D8D2C4', 1), L(0, 1230, 1080, 1230, '#D8D2C4', 1),
    T('59°20′N', 60, 180, 1000, { font: 'Bodoni Moda', size: 228, weight: 400, color: INK, lh: 0.95, ls: -50 }),
    T('18°04′E', 60, 410, 1000, { font: 'Bodoni Moda', size: 228, weight: 400, color: INK, lh: 0.95, ls: -50 }),
    img(SPRIG, 760, 560, 240, 360, { rotation: -6 }),
    cap('Studio opening', 90, 930, 400, { size: 13, ls: 350 }),
    T('Come and see the new studio. The neighbours are bringing food and there is a long table by the window.', 90, 972, 560, { font: 'Cormorant Garamond', size: 36, color: INK, lh: 1.3 }),
    cap('Thursday\n21 November', 740, 960, 280, { size: 13, ls: 350, lh: 1.9, align: 'right' }),
    cap('From six\nuntil late', 740, 1072, 280, { size: 13, ls: 350, lh: 1.9, align: 'right' }),
    cap('Hornsgatan 54, third floor', 90, 1252, 500, { size: 12, ls: 300 }),
    cap('Reply by Friday', 640, 1252, 380, { size: 12, ls: 300, align: 'right' }),
    overlay('tex/paper-fibre.jpg', 1080, 1350, 'multiply', 0.3),
  ])],
});

// ------------------------------------------------------------ 7
const bizCard = tpl({
  id: 'stationery-florist-card', name: 'Business card, inked monogram', format: 'card', category: 'Stationery', tags: ['business card', 'florist', 'monogram', 'two sided'],
  pages: [
    page(GREIGE, [
      img(SHEET, 120, 18, 764, 614, { crop: { x: 0, y: 0.18, w: 1, h: 0.64 }, shadow }),
      img(MONO, 322, 40, 360, 360),
      T('LA', 322, 176, 360, { font: 'Cormorant Garamond', size: 96, weight: 300, color: INK, align: 'center', ls: 60 }),
      cap('Linnea Ahl', 322, 428, 360, { align: 'center', size: 13, ls: 400 }),
      cap('Flowers and styling', 322, 462, 360, { align: 'center', size: 9.5, ls: 300, color: GREY }),
    ]),
    page(INK, [
      img(SEAL, 80, 64, 120, 120),
      T('Linnea Ahl', 80, 230, 600, { font: 'Cormorant Garamond', size: 64, weight: 400, color: '#F4F0E8', ls: 10 }),
      cap('Wedding flowers and event styling', 82, 310, 600, { color: '#CFC7B5', size: 11, ls: 350 }),
      L(82, 470, 922, 470, '#4A453F', 1),
      cap('hello@linneaahl.example', 82, 500, 400, { color: '#F4F0E8', size: 11, ls: 250 }),
      cap('070 123 45 67', 82, 536, 400, { color: '#F4F0E8', size: 11, ls: 250 }),
      cap('Stockholm and the archipelago', 522, 500, 400, { color: '#F4F0E8', size: 11, ls: 250, align: 'right' }),
      cap('@linneaahl', 522, 536, 400, { color: '#F4F0E8', size: 11, ls: 250, align: 'right' }),
    ]),
  ],
});

export default [scriptInvite, menuCard, saveDate, placeCards, supperLine, coords, bizCard];
