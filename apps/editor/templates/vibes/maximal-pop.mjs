import { tpl, page, T, S, rect, circle, path, L, img, frame, overlay, svg, qr, solid, linear, radial, pattern, imageFill, stroke } from '../kit.mjs';

// Maximal pop: bento tiles, tilted colour bars, giant cropped type, shape stickers.
const INK = '#14110F';
const CREAM = '#F3E9D8';
const RED = '#F0381E';
const BLUE = '#2F4BFF';
const YEL = '#FFC72C';
const LIME = '#D6FF3A';
const GRASS = '#17C25B';
const LILAC = '#CDB6F5';
const PINK = '#FF5FB0';
const ORANGE = '#FF5A1F';

const list = [];
export default list;

const tile = (x, y, w, h, fill, r = 34, p = {}) => rect(x, y, w, h, fill, { radius: r, ...p });
// Sun rays as a path: n triangular rays around a centre.
const rays = (n, cx, cy, r1, r2, half) => {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const p = (r, da) => `${(cx + Math.cos(a + da) * r).toFixed(1)} ${(cy + Math.sin(a + da) * r).toFixed(1)}`;
    d += `M${p(r1, -half)} L${p(r2, 0)} L${p(r1, half)} Z `;
  }
  return d;
};
const sunSvg = (bg, ray, disc) => `<svg viewBox="0 0 100 100"><defs><clipPath id="sc"><rect width="100" height="100" rx="7"/></clipPath></defs><g clip-path="url(#sc)"><rect width="100" height="100" fill="${bg}"/><path d="${rays(14, 50, 50, 28, 90, 0.2)}" fill="${ray}"/><circle cx="50" cy="50" r="29" fill="${disc}"/></g></svg>`;
const glasses = (c) => `<svg viewBox="0 0 100 40"><path d="M2 8 Q2 4 8 4 H92 Q98 4 98 8 L96 14 Q95 32 78 32 Q62 32 60 14 Q50 9 40 14 Q38 32 22 32 Q5 32 4 14 Z" fill="${c}"/></svg>`;
const loop = (c) => `<svg viewBox="0 0 100 100"><path d="M18 78 C42 94 88 84 84 56 C80 28 38 18 28 44 C20 66 60 74 80 58" fill="none" stroke="${c}" stroke-width="13" stroke-linecap="round"/></svg>`;
const eye = (a, b) => `<svg viewBox="0 0 100 60"><path d="M2 30 Q50 -14 98 30 Q50 74 2 30Z" fill="${a}"/><circle cx="50" cy="30" r="17" fill="${b}"/></svg>`;
const label = (t, x, y, w, c, p = {}) => T(t, x, y, w, { font: 'Archivo', size: 22, weight: 800, ls: 80, upper: true, color: c, lh: 1.15, ...p });

list.push(tpl({
  id: 'pop-bento-fest', name: 'Bento festival poster', format: 'poster', category: 'Event', tags: ['festival', 'poster', 'summer', 'tiles'],
  pages: [page(CREAM, [
    rect(0, 0, 1123, 240, INK),
    T('SALTFEST', 24, 4, 1090, { font: 'Archivo Black', size: 203, ls: -45, lh: 1, color: CREAM }),
    // sun
    tile(28, 282, 520, 500, YEL),
    T('Two\nstages,\none\nharbour', 60, 310, 460, { font: 'Archivo Black', size: 88, ls: -40, lh: 0.9, color: INK }),
    // text burst tile
    tile(566, 282, 529, 640, BLUE),
    S('burst', 600, 316, 460, 280, INK),
    T('Concerts,\nworkshops,\nboat races', 600, 392, 460, { font: 'Archivo', size: 40, weight: 800, align: 'center', color: CREAM, lh: 1.08 }),
    S('burst', 628, 612, 400, 240, RED, { rotation: 8 }),
    S('burst', 640, 640, 380, 220, YEL, { rotation: -6 }),
    T('and a lot\nof herring', 640, 704, 380, { font: 'Archivo Black', size: 40, align: 'center', color: INK, lh: 1.05, rotation: -6 }),
    // flowers
    tile(28, 800, 520, 122, INK),
    S('flower', 70, 818, 86, 86, RED), circle(96, 844, 34, BLUE),
    S('flower', 232, 818, 86, 86, BLUE), circle(258, 844, 34, GRASS),
    S('flower', 394, 818, 86, 86, YEL), circle(420, 844, 34, RED),
    // date
    tile(28, 940, 760, 200, GRASS),
    T('4.7 FRI / 6.7 SUN', 44, 976, 730, { font: 'Archivo Black', size: 92, ls: -40, color: INK, lh: 1 }),
    // place
    tile(28, 1158, 760, 120, LILAC),
    T('MEADOW PARK, 27 BRAMBLE PATH, NORTHWYNE', 56, 1186, 700, { font: 'Archivo', size: 34, weight: 800, color: INK, lh: 1.05, upper: true, ls: -10 }),
    // grid + loop tile
    tile(806, 940, 289, 478, INK),
    rect(806, 940, 289, 478, pattern('grid', '#3a3a3a', INK, 1), { radius: 34 }),
    svg(loop(YEL), 826, 970, 250, 250),
    svg(loop(LILAC), 826, 1170, 250, 250, { rotation: 180 }),
    // bottom row
    tile(28, 1296, 360, 122, INK),
    label('Tickets on sale soon,\nall digital platforms', 52, 1322, 320, CREAM, { size: 21, ls: 30 }),
    tile(406, 1296, 382, 122, RED),
    svg(glasses(INK), 440, 1318, 314, 78),
    tile(28, 1436, 760, 123, GRASS),
    T('MORE → SALTFEST.SE', 56, 1472, 700, { font: 'Archivo Black', size: 42, color: INK, ls: -10 }),
    tile(806, 1436, 289, 123, BLUE),
    label('Harbour board\nSaltholm Events\nNo. 12', 828, 1452, 250, CREAM, { size: 19, ls: 40 }),
    overlay('tex/risograph-speckle.jpg', 1123, 1587, 'multiply', 0.22),
  ])],
}));

// Tilted colour bars on acid lime.
const bar = (txt, x, y, w, h, fill, rot, size = 124) => [
  rect(x, y, w, h, fill, { rotation: rot }),
  circle(x + 30, y + h / 2 - 17, 34, INK, { rotation: rot }),
  circle(x + w - 64, y + h / 2 - 17, 34, INK, { rotation: rot }),
  T(txt, x, y + (h - size * 1.0) / 2 - 4, w, { font: 'Anton', size, ls: 0, lh: 1, color: INK, align: 'center', rotation: rot }),
];
list.push(tpl({
  id: 'pop-lineup-bars', name: 'Lineup bars post', format: 'post', category: 'Event', tags: ['lineup', 'party', 'dj', 'night'],
  pages: [page(LIME, [
    label('5 September', 48, 44, 300, INK, { size: 28 }),
    label('Harbour Hall', 400, 44, 300, INK, { size: 28, align: 'center' }),
    label('22 to 06', 732, 44, 300, INK, { size: 28, align: 'right' }),
    T('MARA VOSS', 40, 86, 1010, { font: 'Anton', size: 232, ls: -10, lh: 1, color: INK }),
    bar('DONA FLORA', 56, 420, 960, 190, ORANGE, -2.2),
    bar('KLAPP & CO', 96, 586, 900, 190, BLUE, 1.6),
    bar('LUX TWO', 40, 752, 880, 190, PINK, -1.4),
    bar('TANGER DJS', 80, 918, 940, 190, GRASS, 1.2),
    S('burst', 790, 990, 250, 250, RED, { rotation: 12 }),
    T('FREE\nBEFORE\n23:00', 790, 1058, 250, { font: 'Archivo Black', size: 36, lh: 1.02, align: 'center', color: LIME, rotation: 12 }),
    T('Tickets 190 kr', 48, 1226, 500, { font: 'Archivo', size: 40, weight: 800, color: INK }),
    T('Doors 22:00. Bring ID, leave the coat.', 48, 1276, 640, { font: 'Archivo', size: 26, weight: 500, color: INK }),
    S('pill', 760, 1224, 272, 86, INK),
    T('SALTHALL.SE', 760, 1245, 272, { font: 'Archivo Black', size: 26, ls: 30, color: LIME, align: 'center' }),
    overlay('tex/risograph-speckle.jpg', 1080, 1350, 'multiply', 0.2),
  ])],
}));

// Giant cropped word with an eye.
list.push(tpl({
  id: 'pop-giant-loud', name: 'Giant word square', format: 'square', category: 'Social', tags: ['festival', 'announcement', 'giant type'],
  pages: [page(BLUE, [
    label('Festival', 48, 44, 300, CREAM, { size: 30, ls: 20 }),
    T('//', 480, 40, 120, { font: 'Archivo', size: 36, weight: 800, color: CREAM, align: 'center' }),
    label('Gothenburg', 732, 44, 300, CREAM, { size: 30, ls: 20, align: 'right' }),
    T('L', -16, 70, 360, { font: 'Archivo Black', size: 440, ls: 0, lh: 1, color: ORANGE }),
    svg('<svg viewBox="0 0 100 100"><path d="M0 52 Q50 -4 100 52 Q50 108 0 52Z" fill="#fff"/><circle cx="50" cy="52" r="24" fill="#14110F"/></svg>', 262, 178, 210, 210),
    T('U', 470, 70, 400, { font: 'Archivo Black', size: 440, ls: 0, lh: 1, color: ORANGE }),
    T('D', 780, 70, 400, { font: 'Archivo Black', size: 440, ls: 0, lh: 1, color: ORANGE }),
    rect(0, 540, 540, 540, LILAC),
    T('25/07\n28/07', 48, 580, 440, { font: 'Archivo', size: 118, weight: 600, ls: -30, lh: 0.98, color: INK }),
    label('Four nights\nof local noise', 48, 890, 420, INK, { size: 26 }),
    rect(540, 540, 540, 540, LIME),
    ...(() => { let y = 568; return [120, 100, 80, 62, 46, 32, 20, 10].map((h) => { const e = S('ellipse', 570, y, 480, h, BLUE); y += h + 8; return e; }); })(),
    ...[0, 1, 2, 3].map((i) => S('triangle', i * 135, 1010, 135, 70, ORANGE, { rotation: i % 2 ? 180 : 0 })),
  ])],
}));

// Stepped staircase with word chips.
const WORDS = ['Curious', 'Early', 'Awkward', 'Loud', 'Wrong', 'Brave', 'Ready'];
list.push(tpl({
  id: 'pop-stair-chips', name: 'Stair chips poster', format: 'poster', category: 'Event', tags: ['talk', 'conference', 'stairs', 'typography'],
  pages: [page(LIME, [
    ...WORDS.map((w, i) => rect(40 + i * 149, 930 - (i + 1) * 105, 149, (i + 1) * 105, [PINK, INK, CREAM, PINK, INK, CREAM, PINK][i])),
    ...WORDS.map((w, i) => [
      rect(40 + i * 149 + 6, 930 - (i + 1) * 105 - 34, 137, 50, [INK, PINK, INK, INK, PINK, INK, INK][i], { rotation: i % 2 ? 2.5 : -2.5 }),
      T(w, 40 + i * 149 + 6, 930 - (i + 1) * 105 - 25, 137, { font: 'Archivo', size: 25, weight: 800, color: [LIME, INK, LIME, LIME, INK, LIME, LIME][i], align: 'center', rotation: i % 2 ? 2.5 : -2.5 }),
    ]),
    label('Open talks, Hall B', 40, 44, 480, INK, { size: 24 }),
    label('Nov 14 / 18:00', 683, 44, 400, INK, { size: 24, align: 'right' }),
    S('burst', 50, 160, 330, 330, ORANGE, { rotation: -10 }),
    T('Seven\ntalks.\nOne\nroom.', 50, 245, 330, { font: 'Archivo Black', size: 54, lh: 0.98, align: 'center', color: INK, rotation: -10 }),
    T('NOBODY\nSTARTED\nREADY', 30, 930, 1080, { font: 'Rubik', size: 218, weight: 900, ls: -60, lh: 0.82, color: INK }),
    rect(40, 1498, 1043, 3, INK),
    label('Free entry', 40, 1516, 300, INK, { size: 24 }),
    label('Seats are first come', 400, 1516, 340, INK, { size: 24, align: 'center' }),
    label('talks.hallb.se', 783, 1516, 300, INK, { size: 24, align: 'right' }),
    overlay('tex/paper-fibre.jpg', 1123, 1587, 'multiply', 0.3),
  ])],
}));

// Sticker blob wall on black.
const blob = (t, x, y, w, h, fill, rot, size = 54, tc = INK) => [
  S('blob', x, y, w, h, fill, { rotation: rot }),
  T(t, x + w * 0.08, y + h / 2 - size * 0.5, w * 0.84, { font: 'Archivo Black', size, ls: -20, lh: 1, color: tc, align: 'center', rotation: rot, upper: true }),
];
list.push(tpl({
  id: 'pop-blob-wall', name: 'Blob sticker post', format: 'post', category: 'Social', tags: ['quote', 'stickers', 'blobs', 'opinion'],
  pages: [page(INK, [
    ...blob('The', 40, 40, 300, 190, YEL, -6, 70),
    ...blob('best', 330, 30, 360, 240, PINK, 4, 84),
    ...blob('part', 690, 50, 360, 230, LIME, -3, 80),
    ...blob('of a party', 30, 270, 520, 230, ORANGE, 3, 56),
    ...blob('is the', 540, 290, 500, 210, LILAC, -4, 76),
    ...blob('kitchen', 40, 520, 640, 300, BLUE, -3, 96, CREAM),
    ...blob('at', 690, 520, 300, 260, YEL, 6, 120),
    ...blob('one', 40, 840, 430, 270, GRASS, 5, 108),
    ...blob('in the', 470, 820, 380, 220, RED, -5, 82, CREAM),
    ...blob('morning', 560, 1020, 480, 250, PINK, 3, 62),
    ...blob('(agree)', 40, 1090, 460, 200, CREAM, -4, 60),
  ])],
}));

// Dense tile mosaic with a title block.
const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const PAIRS = [[RED, YEL], [BLUE, LIME], [YEL, RED], [GRASS, INK], [LILAC, BLUE], [PINK, INK], [ORANGE, CREAM], [INK, PINK], [CREAM, BLUE], [BLUE, YEL], [RED, CREAM], [LIME, INK], [YEL, BLUE], [GRASS, CREAM]];
const KINDS = ['circle', 'half', 'star4', 'flower', 'diamond', 'bars', 'quarter', 'arch', 'burst', 'heart', 'cross', 'tri', 'moon', 'ring'];
function motif(kind, x, y, s, bg, fg, r) {
  const i = Math.round(s * 0.14);
  const out = [rect(x, y, s, s, bg, { radius: 22 })];
  const rot = Math.floor(r() * 4) * 90;
  switch (kind) {
    case 'circle': out.push(circle(x + i, y + i, s - 2 * i, fg)); break;
    case 'half': out.push(S('halfcircle', x + i, y + i + 10, s - 2 * i, (s - 2 * i) / 2 + 10, fg, { rotation: rot })); break;
    case 'star4': out.push(S('star4', x + i - 4, y + i - 4, s - 2 * i + 8, s - 2 * i + 8, fg)); break;
    case 'flower': out.push(S('flower', x + i - 4, y + i - 4, s - 2 * i + 8, s - 2 * i + 8, fg), circle(x + s / 2 - 14, y + s / 2 - 14, 28, bg)); break;
    case 'diamond': out.push(S('diamond', x + i, y + i, s - 2 * i, s - 2 * i, fg)); break;
    case 'bars': for (let k = 0; k < 3; k++) out.push(S('pill', x + i, y + i + k * ((s - 2 * i) / 3), s - 2 * i, (s - 2 * i) / 3 - 8, fg)); break;
    case 'quarter': out.push(path('M0 100 A100 100 0 0 1 100 0 L100 100 Z', x + i, y + i, s - 2 * i, s - 2 * i, fg, { w0: 100, h0: 100, rotation: rot })); break;
    case 'arch': out.push(S('arch', x + i + 6, y + i - 2, s - 2 * i - 12, s - 2 * i + 4, fg)); break;
    case 'burst': out.push(S('burst', x + i - 6, y + i - 6, s - 2 * i + 12, s - 2 * i + 12, fg, { rotation: rot })); break;
    case 'heart': out.push(S('heart', x + i, y + i + 4, s - 2 * i, s - 2 * i - 6, fg)); break;
    case 'cross': out.push(S('cross', x + i + 4, y + i + 4, s - 2 * i - 8, s - 2 * i - 8, fg)); break;
    case 'tri': out.push(S('triangle', x + i, y + i, s - 2 * i, s - 2 * i, fg, { rotation: rot })); break;
    case 'moon': out.push(circle(x + i, y + i, s - 2 * i, fg), circle(x + i + 22, y + i - 6, s - 2 * i - 8, bg)); break;
    case 'ring': out.push(circle(x + i, y + i, s - 2 * i, 'rgba(0,0,0,0)', { stroke: stroke(fg, 16) })); break;
  }
  return out;
}
function mosaic(x0, y0, cols, rows, cell, gap, seed, skip) {
  const r = rng(seed);
  const out = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    if (skip(i, j)) continue;
    const [bg, fg] = PAIRS[Math.floor(r() * PAIRS.length)];
    out.push(motif(KINDS[Math.floor(r() * KINDS.length)], x0 + i * (cell + gap), y0 + j * (cell + gap), cell, bg, fg, r));
  }
  return out;
}
list.push(tpl({
  id: 'pop-tile-mosaic', name: 'Tile mosaic poster', format: 'poster', category: 'Event', tags: ['block party', 'street', 'festival', 'pattern', 'tiles'],
  pages: [page(INK, [
    label('Sat 6 August', 20, 24, 300, CREAM, { size: 22 }),
    label('Noon to 21:00', 400, 24, 320, CREAM, { size: 22, align: 'center' }),
    label('Free for all', 803, 24, 300, CREAM, { size: 22, align: 'right' }),
    mosaic(20, 64, 7, 9, 148, 8, 14, (i, j) => (i < 4 && j < 2) || (i >= 2 && j >= 7)),
    // title block
    rect(20, 64, 616, 304, CREAM, { radius: 22 }),
    T('BLOCK\nPARTY', 38, 64, 590, { font: 'Archivo Black', size: 140, ls: -50, lh: 0.86, color: INK }),
    // info block
    rect(332, 1204, 772, 304 - 8 + 0, YEL, { radius: 22 }),
    T('Linden Street\nfrom the bakery\nto the old pool', 352, 1226, 470, { font: 'Archivo Black', size: 52, ls: -20, lh: 0.98, color: INK }),
    T('Live bands on the steps, long tables, a swap shop, face painting and a very slow race.', 352, 1396, 440, { font: 'Archivo', size: 23, weight: 600, lh: 1.25, color: INK }),
    S('burst', 876, 1236, 210, 210, RED, { rotation: 8 }),
    T('BRING\nA DISH', 876, 1306, 210, { font: 'Archivo Black', size: 30, lh: 1, color: CREAM, align: 'center', rotation: 8 }),
    label('lindenblock.se', 20, 1530, 320, CREAM, { size: 22 }),
    label('Rain moves it indoors', 700, 1530, 403, CREAM, { size: 22, align: 'right' }),
  ])],
}));

// Giant sale burst flyer.
list.push(tpl({
  id: 'pop-sale-burst', name: 'Sale burst flyer', format: 'flyer', category: 'Marketing', tags: ['sale', 'discount', 'shop', 'promo'],
  pages: [page(RED, [
    T('ALL', -6, 4, 800, { font: 'Anton', size: 244, ls: -10, lh: 1, color: INK }),
    T('SHOES', -6, 200, 800, { font: 'Anton', size: 244, ls: -10, lh: 1, color: CREAM }),
    S('burst', 132, 250, 400, 400, YEL, { rotation: -8 }),
    T('35%', 142, 350, 380, { font: 'Archivo Black', size: 150, ls: -50, lh: 1, color: INK, align: 'center', rotation: -8 }),
    T('OFF', 142, 480, 380, { font: 'Archivo Black', size: 70, ls: 40, lh: 1, color: RED, align: 'center', rotation: -8 }),
    rect(-20, 600, 620, 60, INK, { rotation: -3 }),
    T('THIS WEEK ONLY  •  THIS WEEK ONLY  •  THIS WEEK ONLY', -20, 616, 640, { font: 'Archivo', size: 24, weight: 800, ls: 120, color: LIME, rotation: -3, align: 'center' }),
    T('Every pair in the shop, no exceptions, no code.', 28, 680, 280, { font: 'Archivo', size: 21, weight: 700, color: INK, lh: 1.2 }),
    rect(0, 744, 559, 50, pattern('checker', INK, CREAM, 0.8)),
    T('Mon to Sat 10 to 19\nStorgatan 14, Uppsala', 300, 684, 240, { font: 'Archivo', size: 14, weight: 800, ls: 60, upper: true, lh: 1.3, color: INK, align: 'right' }),
  ])],
}));

// Five page carousel.
const cPal = [[BLUE, CREAM, LIME], [LIME, INK, PINK], [PINK, INK, BLUE], [ORANGE, INK, CREAM], [INK, CREAM, YEL]];
const slidePage = (n, bg, fg, ac, head, body, tag) => page(bg, [
  rect(40, 40, 1000, 1270, 'rgba(0,0,0,0)', { radius: 40, stroke: stroke(fg, 4) }),
  T(String(n), 470, 330, 900, { font: 'Archivo Black', size: 1100, ls: -80, lh: 1, color: ac }),
  label(tag, 80, 82, 500, fg, { size: 24 }),
  label(`0${n} / 05`, 700, 82, 300, fg, { size: 24, align: 'right' }),
  T(head, 80, 150, 820, { font: 'Archivo Black', size: 100, ls: -35, lh: 0.94, color: fg }),
  rect(80, 1040, 640, 210, fg, { radius: 30 }),
  T(body, 112, 1066, 580, { font: 'Archivo', size: 34, weight: 700, lh: 1.16, color: bg }),
]);
list.push(tpl({
  id: 'pop-carousel-five', name: 'Five tips carousel', format: 'post', category: 'Social', tags: ['carousel', 'tips', 'instagram', 'numbers'],
  pages: [
    page(YEL, [
      T('5', 250, -60, 900, { font: 'Archivo Black', size: 1500, ls: -80, lh: 1, color: RED }),
      rect(0, 760, 1080, 590, INK),
      label('Shop smarter', 60, 800, 500, LIME, { size: 24 }),
      label('Swipe', 720, 800, 300, LIME, { size: 24, align: 'right' }),
      T('Five ways to make\na small shop feel big', 60, 860, 960, { font: 'Archivo Black', size: 84, ls: -35, lh: 0.96, color: CREAM }),
      S('arrow', 800, 1230, 180, 60, LIME),
    ]),
    slidePage(1, ...cPal[0], 'Light the\nwindow', 'Warm bulbs, one shelf, nothing taped to the glass.', 'Shop smarter'),
    slidePage(2, ...cPal[1], 'Price it\nout loud', 'Big numbers, plain words. People walk past small print.', 'Shop smarter'),
    slidePage(3, ...cPal[2], 'Give the\ndoor a job', 'A sign, a smell or a sample. Something to meet them on the step.', 'Shop smarter'),
    slidePage(4, ...cPal[3], 'Name the\nregulars', 'Write three names on the board each week. They will bring friends.', 'Shop smarter'),
    slidePage(5, ...cPal[4], 'Close with\na reason', 'End every visit with the next date, a stamp or a small gift.', 'Shop smarter'),
  ],
}));

// Pitch deck, five slides on one tile grid.
const deckBase = (bg, n, title) => [
  label(title, 60, 44, 600, INK, { size: 22 }),
  label(`0${n}`, 1760, 44, 100, INK, { size: 22, align: 'right' }),
];
list.push(tpl({
  id: 'pop-deck-studio', name: 'Studio year deck', format: 'slide', category: 'Presentation', tags: ['deck', 'slides', 'report', 'pitch'],
  pages: [
    page(YEL, [
      T('YEAR\nIN\nREVIEW', 60, 90, 1400, { font: 'Archivo Black', size: 262, ls: -60, lh: 0.84, color: INK }),
      tile(1260, 60, 600, 600, BLUE, 50),
      T('38\nwalls\npainted', 1300, 100, 540, { font: 'Archivo Black', size: 96, ls: -40, lh: 0.92, color: CREAM }),
      tile(1260, 690, 290, 330, PINK, 50),
      S('flower', 1290, 750, 230, 230, INK), circle(1368, 828, 74, PINK),
      tile(1570, 690, 290, 330, INK, 50),
      T('2026', 1570, 770, 290, { font: 'Archivo Black', size: 84, ls: -30, color: LIME, align: 'center' }),
      label('Mejeri Studio\nannual meeting', 1570, 890, 290, CREAM, { size: 20, align: 'center' }),
      label('Presented by Anna and Jonas', 60, 1000, 800, INK, { size: 26 }),
    ]),
    page(CREAM, [
      ...deckBase(CREAM, 2, 'The year in four lines'),
      T('Four things we did.', 60, 130, 1700, { font: 'Archivo Black', size: 190, ls: -60, lh: 0.9, color: INK }),
      ...[['12', 'Books designed', RED, CREAM], ['41', 'Posters printed', BLUE, CREAM], ['3', 'Moves of the studio', LIME, INK], ['1', 'Very big dog', YEL, INK]].map(([n, t, c, tc], i) => [
        tile(60 + i * 450, 520, 420, 500, c, 50),
        T(n, 60 + i * 450 + 20, 530, 380, { font: 'Archivo Black', size: 270, ls: -50, lh: 1, color: tc }),
        T(t, 60 + i * 450 + 36, 880, 360, { font: 'Archivo', size: 40, weight: 800, lh: 1.05, color: tc }),
      ]),
    ]),
    page(ORANGE, [
      ...deckBase(ORANGE, 3, 'What worked'),
      T('SMALL\nJOBS,\nBIG\nNOISE', 60, 70, 1000, { font: 'Anton', size: 246, ls: 0, lh: 0.92, color: INK }),
      tile(1100, 70, 760, 460, CREAM, 50),
      T('Short projects with a clear date and a clear mess, finished on time. Forty one of them.', 1140, 110, 680, { font: 'Archivo Black', size: 50, ls: -15, lh: 1.14, color: INK }),
      tile(1100, 560, 360, 460, INK, 50),
      S('burst', 1130, 600, 300, 300, YEL, { rotation: 10 }),
      T('+38%', 1130, 700, 300, { font: 'Archivo Black', size: 70, color: INK, align: 'center', rotation: 10 }),
      tile(1490, 560, 370, 460, BLUE, 50),
      T('Repeat clients', 1520, 600, 310, { font: 'Archivo Black', size: 50, ls: -20, lh: 1, color: CREAM }),
      T('9 of 12', 1520, 880, 310, { font: 'Archivo Black', size: 80, ls: -30, color: LIME }),
    ]),
    page(LIME, [
      ...deckBase(LIME, 4, 'Next year'),
      S('burst', 120, 640, 400, 400, PINK, { rotation: -8 }),
      T('Keep it\nsmall.', 120, 740, 400, { font: 'Archivo Black', size: 70, ls: -25, lh: 0.95, color: INK, align: 'center', rotation: -8 }),
      T('Next\nyear', 60, 70, 900, { font: 'Archivo Black', size: 260, ls: -60, lh: 0.86, color: INK }),
      ...['Hire one person who can draw', 'Print on the cheap press', 'Say no to every logo sprint'].map((t, i) => [
        tile(780, 110 + i * 300, 1080, 270, [PINK, BLUE, YEL][i], 50),
        T(String(i + 1), 810, 110 + i * 300 + 10, 200, { font: 'Archivo Black', size: 250, ls: -40, lh: 1, color: INK }),
        T(t, 1030, 110 + i * 300 + 64, 800, { font: 'Archivo Black', size: 60, ls: -25, lh: 1, color: i === 1 ? CREAM : INK }),
      ]),
    ]),
    page(BLUE, [
      T('THANK\nYOU', 60, 70, 1400, { font: 'Archivo Black', size: 360, ls: -60, lh: 0.84, color: CREAM }),
      S('burst', 1330, 90, 480, 480, RED, { rotation: -10 }),
      T('Questions\nwelcome', 1330, 240, 480, { font: 'Archivo Black', size: 64, ls: -20, lh: 1, align: 'center', color: CREAM, rotation: -10 }),
      tile(60, 820, 1800, 200, INK, 50),
      T('hello@mejeri.studio', 100, 880, 1000, { font: 'Archivo Black', size: 72, ls: -30, color: LIME }),
      label('Mejeri Studio, Fabriksgatan 9', 1100, 900, 720, CREAM, { size: 28, align: 'right' }),
    ]),
  ],
}));

// Two page menu.
const item = (n, d, p, y, c) => [
  rect(40, y, 714, 104, c, { radius: 28 }),
  T(n, 68, y + 12, 520, { font: 'Archivo Black', size: 36, ls: -15, color: INK, lh: 1 }),
  T(d, 68, y + 60, 560, { font: 'Archivo', size: 17, weight: 600, color: INK, lh: 1.2 }),
  T(p, 600, y + 20, 126, { font: 'Archivo Black', size: 40, ls: -20, color: INK, align: 'right' }),
];
list.push(tpl({
  id: 'pop-menu-bun', name: 'Bakery menu', format: 'a4', category: 'Food', tags: ['menu', 'bakery', 'cafe', 'two pages'],
  pages: [
    page(CREAM, [
      rect(0, 0, 794, 330, RED),
      T('BUN\nCLUB', 36, 6, 700, { font: 'Archivo Black', size: 160, ls: -50, lh: 0.82, color: CREAM }),
      S('burst', 560, 40, 200, 200, YEL, { rotation: 10 }),
      T('Baked\nbefore 7', 560, 98, 200, { font: 'Archivo Black', size: 28, lh: 1, align: 'center', color: INK, rotation: 10 }),
      label('Cinnamon, cardamom, everything else', 40, 296, 720, CREAM, { size: 16 }),
      ...[['Cardamom bun', 'Pearl sugar, still warm', '38', ORANGE], ['Cinnamon swirl', 'Twice as much cinnamon as you think', '36', YEL], ['Saffron knot', 'Winter only, we mean it', '42', LILAC], ['Rye and butter', 'Fermented crust, salted butter', '34', LIME], ['Chocolate pretzel', 'Dark, a little burnt on purpose', '45', PINK], ['Plain bun', 'For people who know what they want', '28', GRASS]].map((r, i) => item(...r.slice(0, 3), 344 + i * 118, r[3])),
      label('Mon to Sat 7 to 15', 40, 1082, 400, INK, { size: 16 }),
      label('Hantverkargatan 3', 400, 1082, 354, INK, { size: 16, align: 'right' }),
    ]),
    page(BLUE, [
      T('SOMETHING\nTO DRINK', 36, 30, 740, { font: 'Archivo Black', size: 98, ls: -40, lh: 0.88, color: CREAM }),
      ...[['Black coffee', '30', LIME], ['Flat white', '42', PINK], ['Cold brew, oat', '44', YEL], ['Chai, loud', '40', ORANGE], ['Fresh juice', '45', LILAC]].map(([n, p, c], i) => [
        rect(40, 250 + i * 118, 714, 100, c, { radius: 28, rotation: i % 2 ? 0.8 : -0.8 }),
        T(n, 70, 250 + i * 118 + 26, 500, { font: 'Archivo Black', size: 40, ls: -20, color: INK }),
        T(p, 600, 250 + i * 118 + 22, 126, { font: 'Archivo Black', size: 44, ls: -20, color: INK, align: 'right' }),
      ]),
      rect(40, 870, 714, 200, INK, { radius: 28 }),
      T('Bring your own cup', 70, 900, 500, { font: 'Archivo Black', size: 40, ls: -20, color: LIME }),
      T('and the coffee is 8 kr cheaper. We wash it. You carry it home.', 70, 960, 480, { font: 'Archivo', size: 21, weight: 600, lh: 1.25, color: CREAM }),
      S('flower', 580, 880, 150, 150, PINK), circle(630, 930, 50, INK),
      label('Allergies? Ask, we will tell you the truth.', 40, 1092, 714, CREAM, { size: 14 }),
    ]),
  ],
}));

// YouTube thumbnail.
list.push(tpl({
  id: 'pop-thumb-shout', name: 'Video thumbnail', format: 'thumb', category: 'Social', tags: ['youtube', 'thumbnail', 'video', 'challenge'],
  pages: [page(YEL, [
    img('photos/runner.jpg', 700, 0, 580, 720, { filters: { saturation: -100, contrast: 30 } }),
    rect(700, 0, 580, 720, BLUE, { blend: 'screen', opacity: 0.95 }),
    img('photos/runner.jpg', 700, 0, 580, 720, { filters: { saturation: -100, contrast: 40 }, blend: 'multiply' }),
    T('30\nDAYS', 28, 0, 700, { font: 'Archivo Black', size: 212, ls: -60, lh: 0.8, color: INK }),
    rect(28, 520, 640, 150, RED, { rotation: -2.5 }),
    T('NO SUGAR', 28, 546, 640, { font: 'Anton', size: 118, color: CREAM, align: 'center', rotation: -2.5 }),
    S('burst', 530, 20, 230, 230, PINK, { rotation: 12 }),
    T('IT GOT\nWEIRD', 530, 86, 230, { font: 'Archivo Black', size: 38, lh: 0.98, align: 'center', color: INK, rotation: 12 }),
    S('arrow', 540, 420, 150, 90, INK, { rotation: -20 }),
  ])],
}));

// Business card, front and back.
list.push(tpl({
  id: 'pop-card-bento', name: 'Bento business card', format: 'card', category: 'Business', tags: ['business card', 'studio', 'creative'],
  pages: [
    page(CREAM, [
      rect(20, 20, 600, 610, INK, { radius: 36 }),
      T('NOOR\nBERG', 44, 30, 560, { font: 'Archivo Black', size: 170, ls: -55, lh: 0.84, color: CREAM }),
      ...['Signs', 'Murals', 'Menus'].map((w, i) => [rect(44 + i * 180, 400, 164, 64, [LIME, PINK, YEL][i], { radius: 32 }), T(w, 44 + i * 180, 416, 164, { font: 'Archivo Black', size: 28, color: INK, align: 'center' })]),
      label('Illustrator and sign painter', 48, 560, 540, LIME, { size: 20 }),
      rect(640, 20, 344, 300, RED, { radius: 36 }),
      T('Since\n2014', 668, 40, 290, { font: 'Archivo Black', size: 84, ls: -35, lh: 0.9, color: INK }),
      rect(640, 340, 164, 290, BLUE, { radius: 36 }),
      S('flower', 656, 440, 132, 132, YEL), circle(700, 484, 44, BLUE),
      rect(824, 340, 160, 290, LIME, { radius: 36 }),
      S('burst', 836, 440, 136, 136, PINK, { rotation: 10 }),
    ]),
    page(LIME, [
      rect(20, 20, 964, 610, INK, { radius: 36 }),
      T('Let us paint\nyour window.', 60, 50, 640, { font: 'Archivo Black', size: 80, ls: -30, lh: 0.95, color: LIME }),
      rect(60, 290, 400, 4, CREAM),
      T('noor@noorberg.se\n070 123 45 67\nnoorberg.se\n@noorberg', 60, 330, 500, { font: 'Archivo', size: 36, weight: 700, lh: 1.3, color: CREAM }),
      S('burst', 700, 250, 250, 250, ORANGE, { rotation: 10 }),
      T('Signs,\nmurals,\nmenus', 700, 320, 250, { font: 'Archivo Black', size: 38, lh: 0.98, align: 'center', color: INK, rotation: 10 }),
      qr('https://noorberg.se', 800, 470, 130, INK, LIME),
    ]),
  ],
}));

// Story set: supper club, three frames.
const sFrame = (bg, n) => [label('Sunday supper club', 60, 70, 600, INK, { size: 28 }), label(`${n} / 3`, 760, 70, 260, INK, { size: 28, align: 'right' })];
list.push(tpl({
  id: 'pop-story-supper', name: 'Supper club stories', format: 'story', category: 'Social', tags: ['story', 'dinner', 'event', 'three frames'],
  pages: [
    page(ORANGE, [
      ...sFrame(ORANGE, 1),
      T('SUPPER\nCLUB', 40, 180, 1040, { font: 'Archivo Black', size: 205, ls: -70, lh: 0.84, color: INK }),
      S('burst', 620, 780, 380, 380, YEL, { rotation: 10 }),
      T('Eight\nseats.\nOne pot.', 620, 878, 380, { font: 'Archivo Black', size: 52, lh: 0.98, align: 'center', color: INK, rotation: 10 }),
      rect(60, 1240, 960, 520, CREAM, { radius: 50 }),
      T('Every second Sunday', 100, 1290, 880, { font: 'Archivo Black', size: 74, ls: -30, lh: 1, color: INK }),
      T('A long table above the bakery. We cook, you bring wine and a story about a bad first job.', 100, 1400, 880, { font: 'Archivo', size: 40, weight: 600, lh: 1.2, color: INK }),
      S('flower', 820, 1620, 150, 150, RED), circle(870, 1670, 50, CREAM),
      T('Sun 17:00', 100, 1650, 600, { font: 'Archivo Black', size: 60, ls: -20, color: RED }),
    ]),
    page(BLUE, [
      ...sFrame(BLUE, 2).map((e) => ({ ...e, color: CREAM })),
      T('THE\nMENU', 40, 160, 1040, { font: 'Archivo Black', size: 300, ls: -70, lh: 0.84, color: CREAM }),
      ...[['Bread and cultured butter', LIME], ['Beans, burnt leek, egg yolk', PINK], ['Lamb shoulder, six hours', YEL], ['Plum cake, cold cream', LILAC]].map(([t, c], i) => [
        rect(60 + (i % 2) * 20, 800 + i * 220, 940, 190, c, { radius: 50, rotation: i % 2 ? 1.2 : -1.2 }),
        T(`0${i + 1}`, 100, 840 + i * 220, 160, { font: 'Archivo Black', size: 100, ls: -30, color: INK }),
        T(t, 270, 846 + i * 220, 680, { font: 'Archivo Black', size: 50, ls: -20, lh: 1.02, color: INK }),
      ]),
    ]),
    page(LIME, [
      ...sFrame(LIME, 3),
      T('SAVE\nA SEAT', 40, 160, 1040, { font: 'Archivo Black', size: 260, ls: -60, lh: 0.84, color: INK }),
      rect(60, 700, 960, 700, INK, { radius: 50 }),
      T('Message us with\nyour name and\nyour allergies.', 110, 760, 860, { font: 'Archivo Black', size: 80, ls: -30, lh: 0.98, color: LIME }),
      T('280 kr, drinks not included. Seats are first come and we will say no kindly.', 110, 1100, 760, { font: 'Archivo', size: 38, weight: 600, lh: 1.2, color: CREAM }),
      S('arrow', 640, 1300, 300, 70, PINK),
      S('burst', 80, 1500, 300, 300, PINK, { rotation: -8 }),
      T('@bakeryabove', 80, 1618, 300, { font: 'Archivo Black', size: 34, align: 'center', color: INK, rotation: -8 }),
    ]),
  ],
}));

// Birthday invite with giant number.
list.push(tpl({
  id: 'pop-invite-thirty', name: 'Birthday invite', format: 'invite', category: 'Invitation', tags: ['birthday', 'party', 'invite', 'number'],
  pages: [page(PINK, [
    T('30', -30, 0, 700, { font: 'Archivo Black', size: 440, ls: -90, lh: 1, color: BLUE }),
    S('burst', 320, 40, 150, 150, YEL, { rotation: 14 }),
    T('Yes,\nreally.', 320, 82, 150, { font: 'Archivo Black', size: 28, lh: 0.98, align: 'center', color: INK, rotation: 14 }),
    rect(24, 440, 432, 209, INK, { radius: 30 }),
    T('Saga turns thirty', 44, 456, 400, { font: 'Archivo Black', size: 38, ls: -20, color: LIME }),
    T('Saturday 12 April, from 19:00\nThe roof at Kungsgatan 22\nBring a dish and a dance move', 44, 508, 400, { font: 'Archivo', size: 18, weight: 700, lh: 1.4, color: CREAM }),
    T('RSVP 070 123 45 67 by 1 April', 44, 616, 400, { font: 'Archivo', size: 13, weight: 800, ls: 80, upper: true, color: PINK }),
    S('flower', 20, 352, 80, 80, YEL), circle(46, 378, 28, PINK),
  ])],
}));

// Pinterest pin: seven snacks list.
list.push(tpl({
  id: 'pop-pin-seven', name: 'Seven ideas pin', format: 'pin', category: 'Social', tags: ['pinterest', 'list', 'ideas', 'recipes'],
  pages: [page(GRASS, [
    T('7', 560, -140, 600, { font: 'Archivo Black', size: 900, ls: -60, lh: 1, color: CREAM }),
    T('SNACKS\nFOR A\nLONG\nTRAIN\nRIDE', 40, 40, 700, { font: 'Anton', size: 190, lh: 0.92, color: INK }),
    ...['Salted cucumbers', 'Cold dumplings', 'Cheese and rye', 'Plums, nothing else', 'A boiled egg kit', 'Pickled carrots', 'Dark chocolate'].map((t, i) => [
      rect(40 + (i % 2) * 40, 1000 + i * 66 - (i > 0 ? 0 : 0), 900 - (i % 2) * 40, 58, [YEL, PINK, LILAC, LIME, ORANGE, CREAM, BLUE][i], { radius: 29, rotation: i % 2 ? 0.6 : -0.6 }),
      T(`${i + 1}`, 66 + (i % 2) * 40, 1008 + i * 66, 40, { font: 'Archivo Black', size: 32, color: i === 6 ? CREAM : INK }),
      T(t, 120 + (i % 2) * 40, 1008 + i * 66, 700, { font: 'Archivo Black', size: 32, ls: -15, color: i === 6 ? CREAM : INK }),
    ]),
    label('Save for the next long trip', 40, 1470, 700, INK, { size: 22 }),
  ])],
}));

// Facebook cover with tiles.
list.push(tpl({
  id: 'pop-cover-tiles', name: 'Tile page cover', format: 'cover', category: 'Social', tags: ['cover', 'facebook', 'header', 'community'],
  pages: [page(INK, [
    rect(20, 20, 760, 584, LIME, { radius: 44 }),
    T('LOCAL\nBAND\nNIGHT', 50, 36, 720, { font: 'Archivo Black', size: 190, ls: -60, lh: 0.84, color: INK }),
    rect(800, 20, 360, 280, RED, { radius: 44 }),
    T('Doors\n19:00', 830, 44, 300, { font: 'Archivo Black', size: 96, ls: -40, lh: 0.9, color: INK }),
    rect(1180, 20, 440, 280, BLUE, { radius: 44 }),
    T('Every first Friday', 1210, 50, 380, { font: 'Archivo Black', size: 48, ls: -20, lh: 1, color: CREAM }),
    label('The Barn, Bergsgatan 4', 1210, 238, 380, LIME, { size: 18 }),
    rect(800, 320, 230, 284, PINK, { radius: 44 }),
    S('flower', 830, 400, 170, 170, INK), circle(889, 459, 52, PINK),
    rect(1050, 320, 270, 284, YEL, { radius: 44 }),
    S('burst', 1070, 340, 230, 230, ORANGE, { rotation: 8 }),
    T('Free\nentry', 1070, 400, 230, { font: 'Archivo Black', size: 40, lh: 0.98, align: 'center', color: INK, rotation: 8 }),
    rect(1340, 320, 280, 284, LILAC, { radius: 44 }),
    T('3\nbands', 1340, 380, 280, { font: 'Archivo Black', size: 64, ls: -30, lh: 0.9, align: 'center', color: INK }),
  ])],
}));
