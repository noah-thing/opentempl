import { tpl, page, T, S, rect, circle, path, L, img, frame, overlay, svg, qr, solid, linear, radial, pattern, imageFill, stroke } from '../kit.mjs';

// Rave acid: crushed condensed type, acid colour, photocopied flyer logic.
const BLK = '#0A0A0A';
const ACID = '#E4FF1F';
const LIME = '#B6FF00';
const PINK = '#FF2E93';
const VIOLET = '#5B2BFF';
const CYAN = '#19E3FF';
const CREAM = '#F4F0DC';
const ORANGE = '#FF5B1F';

const list = [];
export default list;

const smiley = (face, ink) => `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="${face}" stroke="${ink}" stroke-width="3"/><ellipse cx="35" cy="38" rx="6" ry="11" fill="${ink}"/><ellipse cx="65" cy="38" rx="6" ry="11" fill="${ink}"/><path d="M20 58 Q50 92 80 58 Q50 74 20 58Z" fill="${ink}"/></svg>`;
const bolt = (c) => `<svg viewBox="0 0 60 100"><path d="M38 0 L6 56 H28 L18 100 L54 38 H32 Z" fill="${c}"/></svg>`;
const lab = (t, x, y, w, c, p = {}) => T(t, x, y, w, { font: 'Archivo', size: 18, weight: 800, ls: 90, upper: true, color: c, lh: 1.2, ...p });

list.push(tpl({
  id: 'rave-smiley-flyer', name: 'Smiley flyer', format: 'flyer', category: 'Event', tags: ['rave', 'acid house', 'smiley', 'party'],
  pages: [page(ACID, [
    T('SMILE LIKE\nIT’S 88', 14, 6, 540, { font: 'Anton', size: 112, lh: 0.88, ls: 0, color: BLK, align: 'center' }),
    svg(smiley(ACID, BLK), 95, 204, 370, 370),
    ...[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => svg(smiley(i % 2 ? ACID : BLK, i % 2 ? BLK : ACID), 14 + i * 60, 578, 44, 44)),
    T('FEEL THE LOVE', 14, 628, 531, { font: 'Anton', size: 54, color: BLK, align: 'center', ls: 20 }),
    rect(14, 696, 531, 3, BLK),
    lab('Warehouse 4, Hamnvagen 8', 14, 706, 300, BLK, { size: 13 }),
    lab('Sat 14 June', 245, 706, 300, BLK, { size: 13, align: 'right' }),
    lab('Free beer and a slow sunrise', 14, 728, 300, BLK, { size: 13 }),
    lab('22:00 to 08:00', 245, 728, 300, BLK, { size: 13, align: 'right' }),
    rect(0, 758, 559, 36, BLK),
    T('NO PHONES ON THE FLOOR', 0, 764, 559, { font: 'Anton', size: 22, color: ACID, align: 'center', ls: 140 }),
    overlay('tex/photocopy-toner.jpg', 559, 794, 'multiply', 0.45),
  ])],
}));

// Giant warped word on lime.
list.push(tpl({
  id: 'rave-warp-lime', name: 'Warped word poster', format: 'poster', category: 'Event', tags: ['rave', 'techno', 'poster', 'warped type'],
  pages: [page(LIME, [
    T('NO', 20, -40, 1100, { font: 'Anton', size: 600, color: BLK, ls: -10, lh: 0.85 }),
    S('burst', 640, 90, 380, 380, PINK, { rotation: 12 }),
    T('FOUR\nDAYS', 640, 180, 380, { font: 'Anton', size: 110, color: BLK, lh: 0.9, align: 'center', rotation: 12 }),
    T('SLEEP', 10, 470, 1110, { font: 'Anton', size: 472, color: BLK, ls: -10, lh: 0.85, curve: 6 }),
    rect(40, 1130, 1043, 4, BLK),
    lab('Thursday to Sunday', 40, 1160, 500, BLK, { size: 30 }),
    lab('One hangar, no clocks', 583, 1160, 500, BLK, { size: 30, align: 'right' }),
    T('HANGAR 9', 40, 1240, 760, { font: 'Anton', size: 190, color: BLK, ls: 10, lh: 1 }),
    T('Doors 23:00\nEntry 250 kr\nBring ID', 740, 1266, 340, { font: 'Archivo', size: 34, weight: 800, lh: 1.15, color: BLK, align: 'right' }),
    overlay('tex/photocopy-toner.jpg', 1123, 1587, 'multiply', 0.5),
  ])],
}));

// Lineup tower story.
const names = [['ISOLDE', 300, ACID], ['KOVAC', 360, PINK], ['MARROW', 250, CYAN], ['SUB 9', 360, CREAM]];
list.push(tpl({
  id: 'rave-lineup-story', name: 'Lineup story', format: 'story', category: 'Event', tags: ['lineup', 'story', 'club', 'dj'],
  pages: [page(BLK, [
    lab('Friday 29 Nov', 40, 50, 400, ACID, { size: 28 }),
    lab('Kallhall, Stockholm', 540, 50, 500, ACID, { size: 28, align: 'right' }),
    ...(() => { let y = 110; return names.map(([n, sz, c]) => { const e = T(n, 40, y, 1000, { font: 'Anton', size: sz, color: c, lh: 0.84, ls: 0 }); y += sz * 0.88; return e; }); })(),
    T('LUMEN B2B ASH', 40, 1290, 1000, { font: 'Anton', size: 128, color: ACID, lh: 0.9 }),
    ...['• Hanna Voss live', '• Tomte & Ro', '• Open floor till 6'].map((t, i) => T(t, 40, 1480 + i * 60, 600, { font: 'Archivo', size: 36, weight: 800, color: CREAM })),
    rect(640, 1470, 400, 200, ACID, { rotation: -4 }),
    T('250 kr\nbefore 23', 640, 1494, 400, { font: 'Anton', size: 84, lh: 0.9, color: BLK, align: 'center', rotation: -4 }),
    rect(40, 1770, 1000, 3, ACID),
    lab('kallhall.se', 40, 1800, 400, CREAM, { size: 26 }),
    lab('18+, ID at the door', 540, 1800, 500, CREAM, { size: 26, align: 'right' }),
    overlay('tex/film-grain.jpg', 1080, 1920, 'screen', 0.18),
  ])],
}));

// Black on yellow photocopy flyer.
list.push(tpl({
  id: 'rave-xerox-boxed', name: 'Boxed info flyer', format: 'a4', category: 'Event', tags: ['flyer', 'rave', 'photocopy', 'hardcore'],
  pages: [page(ACID, [
    rect(24, 24, 746, 1075, 'rgba(0,0,0,0)', { stroke: stroke(BLK, 5) }),
    rect(24, 24, 746, 150, BLK),
    T('HIGH VOLTAGE', 24, 28, 746, { font: 'Anton', size: 112, color: ACID, align: 'center', ls: 20 }),
    lab('19th October, Mixing Rooms, 134 Kingstone Road', 24, 188, 746, BLK, { size: 17, align: 'center' }),
    rect(24, 230, 746, 4, BLK),
    T('PURE\nLIFE', 44, 250, 500, { font: 'Anton', size: 190, color: BLK, lh: 0.84 }),
    svg(bolt(BLK), 450, 256, 120, 220),
    svg(smiley(ACID, BLK), 620, 262, 130, 130),
    svg(smiley(BLK, ACID), 620, 410, 130, 130),
    rect(44, 612, 706, 4, BLK),
    ...['BANDIT', 'FOREX', 'CASE / 2', 'R TICK'].map((n, i) => T(n, 44, 626 + i * 92, 700, { font: 'Anton', size: 88, color: BLK, lh: 1, ls: 20 })),
    rect(24, 1000, 746, 99, BLK),
    T('£10 • 10:30PM TILL 3:30AM', 24, 1016, 746, { font: 'Anton', size: 64, color: ACID, align: 'center', ls: 30 }),
    S('burst', 590, 470, 170, 170, PINK, { rotation: 10 }),
    T('plus many\nspecial guests', 590, 526, 170, { font: 'Archivo', size: 16, weight: 800, align: 'center', color: BLK, lh: 1.1, rotation: 10 }),
    overlay('tex/photocopy-toner.jpg', 794, 1123, 'multiply', 0.6),
  ])],
}));

// Pixel glitch post.
list.push(tpl({
  id: 'rave-pixel-glitch', name: 'Pixel glitch post', format: 'post', category: 'Social', tags: ['glitch', 'pixel', 'announcement', 'club'],
  pages: [page(linear(180, '#2B12C9', '#6A2BFF'), [
    ...[0, 1, 2].map((i) => T('SPACE', -10, -30 + i * 330, 1120, { font: 'Pixelify Sans', size: 380, weight: 700, color: [CYAN, '#23199b', CYAN][i], lh: 1, ls: -20 })),
    ...[[130, 60], [520, 40], [830, 90]].map(([y, h], i) => rect(i % 2 ? 0 : 160, y, 920, h, '#6A2BFF', { opacity: 0.0 })),
    rect(0, 1010, 1080, 340, BLK),
    T('JUST A PIXEL\nIN THE TIME', 50, 1040, 760, { font: 'Pixelify Sans', size: 74, weight: 700, color: CYAN, lh: 0.95 }),
    lab('Online set, Saturday 21:00 CET', 50, 1230, 700, CREAM, { size: 26 }),
    lab('free stream', 50, 1280, 700, PINK, { size: 26 }),
    ...[0, 1, 2, 3, 4, 5].map((i) => rect(800 + (i % 3) * 78, 1050 + Math.floor(i / 3) * 78, 70, 70, [CYAN, PINK, ACID, PINK, ACID, CYAN][i])),
  ])],
}));

// Hot gradient flyer with giant outlined number.
list.push(tpl({
  id: 'rave-hot-number', name: 'Hot number flyer', format: 'flyer', category: 'Event', tags: ['party', 'gradient', 'number', 'summer'],
  pages: [page(linear(160, PINK, ORANGE, '#FFB020'), [
    T('02', -30, 10, 640, { font: 'Anton', size: 560, color: CREAM, lh: 0.9 }),
    T('Night swim', 40, 500, 480, { font: 'Archivo', size: 54, weight: 900, ls: -30, color: BLK }),
    rect(40, 580, 479, 3, BLK),
    lab('Fri 8 Aug', 40, 598, 240, BLK, { size: 14 }), lab('Dock 3, Frihamnen', 240, 598, 279, BLK, { size: 14, align: 'right' }),
    lab('Moa Lind', 40, 624, 240, BLK, { size: 14 }), lab('Reuben & Sol', 240, 624, 279, BLK, { size: 14, align: 'right' }),
    lab('Nattvakt', 40, 650, 240, BLK, { size: 14 }), lab('20:00 till 04:00', 240, 650, 279, BLK, { size: 14, align: 'right' }),
    svg(smiley(BLK, ORANGE), 440, 700, 80, 80),
    T('Bring a towel and good shoes.', 40, 730, 380, { font: 'Archivo', size: 17, weight: 700, color: BLK }),
  ])],
}));

// Three page carousel.
const cs = (bg, fg, n, head, lines) => page(bg, [
  rect(30, 30, 1020, 1290, 'rgba(0,0,0,0)', { stroke: stroke(fg, 5) }),
  lab('Nattvakt Vol. 3', 70, 70, 500, fg, { size: 24 }), lab(`${n} / 3`, 600, 70, 380, fg, { size: 24, align: 'right' }),
  T(head, 64, 130, 960, { font: 'Anton', size: 250, color: fg, lh: 0.86 }),
  ...lines.map((l, i) => [rect(64, 700 + i * 150, 952, 4, fg), T(l[0], 64, 724 + i * 150, 300, { font: 'Anton', size: 70, color: fg }), T(l[1], 380, 736 + i * 150, 640, { font: 'Archivo', size: 40, weight: 800, color: fg, upper: true, ls: 40 })]),
  overlay('tex/photocopy-toner.jpg', 1080, 1350, 'multiply', bg === BLK ? 0 : 0.4),
]);
list.push(tpl({
  id: 'rave-carousel-night', name: 'Night schedule carousel', format: 'post', category: 'Social', tags: ['carousel', 'schedule', 'club', 'rules'],
  pages: [
    page(BLK, [
      T('NATT\nVAKT', -10, 20, 1100, { font: 'Anton', size: 560, color: ACID, lh: 0.84 }),
      svg(smiley(PINK, BLK), 700, 900, 300, 300),
      lab('Volume three, swipe for the night', 64, 1240, 800, CREAM, { size: 28 }),
      rect(64, 1190, 560, 4, ACID),
      T('Sat 6 Dec', 64, 1100, 600, { font: 'Anton', size: 90, color: CREAM }),
    ]),
    cs(ACID, BLK, 2, 'THE\nNIGHT', [['22:00', 'Doors and a quiet floor'], ['00:00', 'Isolde, the warm up'], ['02:00', 'Kovac, three hours'], ['05:00', 'Sunrise, the soft stuff']]),
    cs(PINK, BLK, 3, 'THE\nRULES', [['01', 'Phones stay in pockets'], ['02', 'Ask before you touch'], ['03', 'Water is free, ask the bar'], ['04', 'Leave quiet, take your cup']]),
  ],
}));

// Ticket graphic.
list.push(tpl({
  id: 'rave-ticket-og', name: 'Ticket header', format: 'og', category: 'Event', tags: ['ticket', 'header', 'og', 'club'],
  pages: [page(BLK, [
    S('ticket', 30, 40, 1140, 550, ACID),
    T('ALL\nNIGHT\nLONG', 90, 70, 480, { font: 'Anton', size: 150, color: BLK, lh: 0.84 }),
    rect(826, 70, 3, 490, BLK, { opacity: 0.8 }),
    lab('Admit one', 860, 90, 280, BLK, { size: 20 }),
    T('No.\n0147', 860, 130, 280, { font: 'Anton', size: 120, color: BLK, lh: 0.88 }),
    ...Array.from({ length: 26 }, (_, i) => rect(860 + i * 11, 440, 3 + (i * 7) % 5, 100, BLK)),
    lab('Sat 6 Dec, 22:00', 700, 90, 100, BLK, { size: 1, opacity: 0 }),
    lab('Kallhall, Stockholm', 90, 500, 500, BLK, { size: 24 }),
    lab('Sat 6 Dec', 400, 500, 380, BLK, { size: 24, align: 'right' }),
    svg(smiley(PINK, BLK), 560, 190, 200, 200),
  ])],
}));

// Mix cover thumbnail with vinyl.
list.push(tpl({
  id: 'rave-thumb-mix', name: 'Mix video cover', format: 'thumb', category: 'Social', tags: ['mix', 'dj set', 'video', 'youtube'],
  pages: [page(PINK, [
    circle(700, -80, 880, BLK),
    ...[300, 200, 100].map((d, i) => circle(700 + 440 - d / 2 + 0, -80 + 440 - d / 2, d, 'rgba(0,0,0,0)', { stroke: stroke(i === 2 ? ACID : '#262626', i === 2 ? 3 : 10) })),
    circle(1080, 300, 120, ACID), circle(1130, 350, 20, BLK),
    T('MIX\n014', 30, 50, 800, { font: 'Anton', size: 290, color: BLK, lh: 0.82 }),
    rect(30, 590, 560, 80, BLK, { rotation: -2 }),
    T('2 HOURS OF 4AM', 30, 598, 560, { font: 'Anton', size: 56, color: ACID, align: 'center', ls: 40, rotation: -2 }),
    S('burst', 560, 40, 190, 190, ACID, { rotation: 12 }),
    T('NEW\nSET', 560, 94, 190, { font: 'Anton', size: 56, lh: 0.9, color: BLK, align: 'center', rotation: 12 }),
  ])],
}));
