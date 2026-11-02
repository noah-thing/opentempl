import { tpl, page, T, S, rect, circle, path, L, img, frame, overlay, svg, qr, solid, pattern, stroke } from '../kit.mjs';

const INK = '#111111';
const PAPER = '#F1EEE6';
const YEL = '#F4D31C';
const PINK = '#F26BA5';
const RED = '#E8321E';
const MINT = '#8FE3A2';
const BLUE = '#2B4FD8';

// Photocopied photo: pure toner contrast.
const toner = (extra = {}) => ({ saturation: -100, contrast: 75, brightness: 8, grain: 45, ...extra });
const duo = (a, b, extra = {}) => ({ duotone: [a, b], contrast: 55, grain: 40, ...extra });

// Approximate width of condensed display type, used to size cut-out strips.
const aw = (text, size, k = 0.47) => Math.ceil(String(text).length * size * k);

// A cut-and-paste strip: a paper rectangle with one line of type, rotated together.
function strip(text, x, y, size, o = {}) {
  const { font = 'Anton', weight = 400, bg = INK, color = PAPER, rot = 0, padX = 14, padY = 6, k = 0.44, ls = 0, w, upper = true, lh = 1 } = o;
  const tw = w ?? aw(text, size, k) + padX * 2 + (ls * size * String(text).length) / 1000;
  const th = Math.round(size * lh) + padY * 2;
  return [
    rect(x, y, tw, th, bg, { rotation: rot }),
    T(text, x, y + padY, tw, { font, size, weight, color, align: 'center', ls, upper, lh, rotation: rot }),
  ];
}

const tape = (x, y, rot = -8, w = 110, c = '#EFE3B0') => rect(x, y, w, 30, c, { rotation: rot, opacity: 0.78, blend: 'multiply' });
const toners = (W, H, a = 0.85) => overlay('tex/photocopy-toner.jpg', W, H, 'multiply', a);
const dots = (W, H, a = 0.3) => overlay('tex/halftone-dots.jpg', W, H, 'multiply', a, { name: 'Halftone' });

const scissors = (x, y, c = INK) => svg(`<svg viewBox="0 0 40 20"><g fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round"><circle cx="6" cy="5" r="3.6"/><circle cx="6" cy="15" r="3.6"/><path d="M9 7 L38 16 M9 13 L38 4"/></g></svg>`, x, y, 40, 20);

export default [
  // 1. Gig flyer on yellow stock
  tpl({
    id: 'xerox-gig-flyer',
    name: 'Gig flyer',
    format: 'flyer',
    category: 'Event',
    tags: ['gig', 'concert', 'band', 'flyer', 'punk'],
    pages: [
      page(YEL, [
        T('SMALL ROOM RECORDS PRESENTS', 24, 22, 511, { font: 'Courier Prime', weight: 700, size: 13, ls: 140, color: INK }),
        L(24, 46, 535, 46, INK, 3),
        strip('THE COLD', 20, 62, 100, { rot: -2, bg: INK, color: YEL }),
        strip('SPOTS', 120, 164, 100, { rot: 1.5, bg: PAPER, color: INK }),
        // photo block
        rect(48, 318, 400, 290, INK, { rotation: 2.5 }),
        img('photos/concert.jpg', 54, 324, 388, 278, { rotation: 2.5, filters: toner({ contrast: 60, brightness: 45 }) }),
        img('tex/halftone-dots.jpg', 54, 324, 388, 278, { rotation: 2.5, blend: 'multiply', opacity: 0.35 }),
        tape(24, 308, -35, 100),
        tape(400, 590, -30, 100),
        T('LIVE LOUD', 383, 440, 250, { font: 'Anton', size: 64, color: INK, rotation: 90, align: 'center', lh: 1 }),
        // date
        ...strip('FRI 14 NOV', 24, 628, 54, { rot: -1.5, bg: INK, color: PAPER }),
        T('with Lung Ox, Paper Teeth\nand a DJ from the basement', 24, 700, 330, { font: 'Special Elite', size: 15, lh: 1.25, color: INK }),
        T('Doors 20:00\nAll ages\n80 kr or pay what you can', 340, 695, 200, { font: 'Courier Prime', weight: 700, size: 13, lh: 1.35, color: INK }),
        T('bring earplugs', 372, 252, 160, { font: 'Permanent Marker', size: 22, color: RED, rotation: -8, lh: 1 }),
        L(440, 292, 410, 330, RED, 3, { end: 'arrow' }),
        circle(412, 78, 108, RED, { rotation: 0 }),
        T('NO\nCOVER\nFOR\nCATS', 412, 90, 108, { font: 'Anton', size: 21, lh: 1.05, align: 'center', color: YEL, rotation: 10 }),
        toners(559, 794, 0.8),
      ]),
    ],
  }),

  // 2. Zine cover
  tpl({
    id: 'xerox-zine-cover',
    name: 'Zine cover',
    format: 'a4',
    category: 'Publication',
    tags: ['zine', 'cover', 'magazine', 'punk', 'newsletter'],
    pages: [
      page(PAPER, [
        overlay('tex/newsprint.jpg', 794, 1123, 'multiply', 0.9),
        T('NOISE', -8, -92, 830, { font: 'Anton', size: 372, lh: 1, ls: -20, color: INK }),
        rect(0, 262, 794, 362, INK),
        T('FLOOR', -8, 266, 830, { font: 'Anton', size: 372, lh: 1, ls: -20, color: PAPER }),
        T('ISSUE 04 / WINTER / 5 KR', 28, 640, 500, { font: 'Courier Prime', weight: 700, size: 15, ls: 140, color: INK }),
        // photo
        rect(38, 694, 330, 340, INK, { rotation: -3 }),
        img('photos/portrait.jpg', 44, 700, 318, 328, { rotation: -3, filters: toner({ contrast: 85, brightness: 30 }) }),
        img('tex/halftone-dots.jpg', 44, 700, 318, 328, { rotation: -3, blend: 'multiply', opacity: 0.18 }),
        tape(8, 712, -40, 100),
        tape(300, 1012, -30, 100),
        T('she plays bass\nlike a landlord', 200, 1062, 230, { font: 'Permanent Marker', size: 20, lh: 1.05, color: RED, rotation: -5 }),
        // contents
        T('INSIDE', 420, 684, 340, { font: 'Anton', size: 46, color: INK }),
        L(420, 740, 766, 740, INK, 4),
        ...[
          ['03', 'The last good rehearsal room'],
          ['07', 'Eleven records for under ten kronor'],
          ['12', 'How to fold a zine from one sheet'],
          ['16', 'Interview with a drummer who quit'],
          ['21', 'Letters, mostly complaints'],
        ].flatMap(([n, t], i) => [
          T(n, 420, 758 + i * 58, 50, { font: 'Anton', size: 28, color: RED }),
          T(t, 476, 760 + i * 58, 290, { font: 'Special Elite', size: 17, lh: 1.15, color: INK }),
          L(420, 808 + i * 58, 766, 808 + i * 58, INK, 1, { dash: 'dot' }),
        ]),
        S('burst', 600, 1010, 160, 112, RED, { rotation: 12 }),
        T('FREE\nSTICKER\nINSIDE', 600, 1036, 160, { font: 'Anton', size: 22, lh: 1, align: 'center', color: PAPER, rotation: 12 }),
        toners(794, 1123, 0.75),
      ]),
    ],
  }),

  // 3. Open decks, two ink pink poster
  tpl({
    id: 'xerox-pink-poster',
    name: 'Two ink poster',
    format: 'poster',
    category: 'Event',
    tags: ['poster', 'party', 'club', 'dj', 'night'],
    pages: [
      page(PINK, [
        T('OPEN', 22, -8, 1100, { font: 'Anton', size: 450, lh: 0.84, ls: -20, color: INK }),
        img('photos/skater.jpg', 140, 330, 600, 900, { mask: 'arch', blend: 'multiply', filters: toner({ contrast: 110, brightness: 50 }) }),
        img('tex/halftone-dots.jpg', 140, 330, 600, 900, { mask: 'arch', blend: 'multiply', opacity: 0.22 }),
        T('DECKS', 22, 1164, 1100, { font: 'Anton', size: 450, lh: 0.84, ls: -20, color: INK }),
        T('Every Sunday\nbring a record,\nplay two songs', 790, 480, 310, { font: 'Special Elite', size: 29, lh: 1.25, color: INK }),
        T('20:00', 790, 660, 310, { font: 'Anton', size: 130, lh: 1, color: INK }),
        T('Basement bar\nStorgatan 14', 790, 810, 310, { font: 'Courier Prime', weight: 700, size: 26, lh: 1.3, color: INK }),
        T('free in\nfree out', 796, 940, 260, { font: 'Permanent Marker', size: 48, lh: 1, color: RED, rotation: -7 }),
        toners(1123, 1587, 0.8),
      ]),
    ],
  }),

  // 4. Manifesto with marker corrections
  tpl({
    id: 'xerox-manifesto',
    name: 'Marked up manifesto',
    format: 'post',
    category: 'Social',
    tags: ['quote', 'manifesto', 'statement', 'text', 'marker'],
    pages: [
      page(PAPER, [
        overlay('tex/crumpled-paper.jpg', 1080, 1350, 'multiply', 0.55),
        T('MAKE THE THING\nBEFORE YOU\nFEEL READY.\nCOPY IT UNTIL IT\nLOOKS LIKE YOU.', 64, 70, 960, { font: 'Archivo Black', size: 100, lh: 1.1, ls: -35, color: INK }),
        rect(60, 218, 720, 22, RED, { rotation: -1.2, opacity: 0.92 }),
        rect(60, 450, 940, 20, RED, { rotation: 0.8, opacity: 0.92 }),
        T('never', 800, 180, 230, { font: 'Permanent Marker', size: 70, lh: 1, color: RED, rotation: -6 }),
        T('until it looks\nwrong, then\nkeep it', 600, 640, 420, { font: 'Permanent Marker', size: 54, lh: 1.05, color: RED, rotation: -4 }),
        L(430, 585, 590, 668, RED, 5, { end: 'arrow' }),
        rect(0, 900, 1080, 450, INK),
        T('RULES FOR THE\nSECOND DRAFT', 64, 950, 640, { font: 'Anton', size: 74, lh: 0.98, color: PAPER }),
        T('1. Cut the first page.\n2. Cut the nice sentence.\n3. Photocopy at 140 percent.\n4. Staple.', 600, 960, 420, { font: 'Special Elite', size: 27, lh: 1.55, color: PAPER }),
        L(64, 1240, 1016, 1240, PAPER, 2, { dash: 'dot' }),
        T('page 1 of 1', 64, 1272, 300, { font: 'Courier Prime', size: 16, ls: 100, color: PAPER }),
        scissors(980, 1228, PAPER),
        toners(1080, 1350, 0.7),
      ]),
    ],
  }),

  // 5. Wanted flyer with tear off tabs
  tpl({
    id: 'xerox-tear-off-tabs',
    name: 'Tear off tab flyer',
    format: 'flyer',
    category: 'Notice',
    tags: ['wanted', 'notice', 'tear off', 'flyer', 'lost', 'for rent'],
    pages: [
      page(PAPER, [
        overlay('tex/newsprint.jpg', 559, 794, 'multiply', 0.7),
        rect(18, 18, 523, 640, null, { fill: solid('rgba(0,0,0,0)'), stroke: stroke(INK, 6) }),
        T('LOUD, FAST AND BAD AT PRACTICE', 34, 36, 490, { font: 'Courier Prime', weight: 700, size: 13, ls: 120, color: INK, align: 'center' }),
        ...strip('DRUMMER', 34, 66, 112, { bg: INK, color: PAPER, rot: -1.5, w: 491 }),
        ...strip('WANTED', 34, 190, 112, { bg: RED, color: PAPER, rot: 1, w: 491 }),
        T('Three of us, one rehearsal room, no singer\nwho can count. We need someone who hits\nthings on time and does not mind the cold.', 40, 336, 480, { font: 'Special Elite', size: 17, lh: 1.35, color: INK }),
        ...['Own sticks', 'Own van (circle one)', 'Tuesdays and Saturdays', 'Likes fast songs'].flatMap((t, i) => [
          rect(42, 436 + i * 38, 20, 20, null, { fill: solid('rgba(0,0,0,0)'), stroke: stroke(INK, 3) }),
          T(t, 76, 434 + i * 38, 380, { font: 'Courier Prime', weight: 700, size: 20, color: INK }),
        ]),
        L(48, 440, 58, 454, INK, 4), L(58, 440, 48, 454, INK, 4),
        S('ellipse', 62, 462, 270, 48, null, { fill: solid('rgba(0,0,0,0)'), stroke: stroke(RED, 4), rotation: -2 }),
        T('call after six', 340, 540, 190, { font: 'Permanent Marker', size: 26, lh: 1, color: RED, rotation: -6 }),
        L(366, 600, 330, 566, RED, 3, { end: 'arrow' }),
        // tabs
        L(18, 664, 541, 664, INK, 2, { dash: 'dash' }),
        scissors(24, 654),
        ...Array.from({ length: 8 }, (_, i) => [
          i > 0 ? L(18 + i * 65.4, 664, 18 + i * 65.4, 782, INK, 2, { dash: 'dash' }) : null,
          T('070 123 45 67', 18 + i * 65.4 + 32.7 - 70, 712, 140, { font: 'Courier Prime', weight: 700, size: 14, color: INK, align: 'center', rotation: -90, lh: 1 }),
        ]),
        toners(559, 794, 0.7),
      ]),
    ],
  }),

  // 6. Press kit slides
  tpl({
    id: 'xerox-press-kit',
    name: 'Press kit slides',
    format: 'slide',
    category: 'Presentation',
    tags: ['deck', 'press kit', 'band', 'pitch', 'slides'],
    pages: [
      page(YEL, [
        T('PAPER\nTEETH', 70, 40, 1250, { font: 'Anton', size: 400, lh: 0.84, ls: -20, color: INK }),
        T('PRESS KIT\n2026', 80, 880, 500, { font: 'Courier Prime', weight: 700, size: 40, lh: 1.15, ls: 120, color: INK }),
        rect(1180, 70, 680, 880, INK, { rotation: 2 }),
        img('photos/friends.jpg', 1192, 82, 656, 856, { rotation: 2, filters: toner({ contrast: 80, brightness: 30 }) }),
        img('tex/halftone-dots.jpg', 1192, 82, 656, 856, { rotation: 2, blend: 'multiply', opacity: 0.25 }),
        tape(1130, 56, -35, 190), tape(1730, 900, -35, 190),
        T('three people, one amp,\nno encore', 1130, 970, 640, { font: 'Permanent Marker', size: 44, lh: 1.05, color: RED, rotation: -3 }),
        toners(1920, 1080, 0.8),
      ]),
      page(PAPER, [
        overlay('tex/newsprint.jpg', 1920, 1080, 'multiply', 0.8),
        T('ABOUT', 90, 70, 600, { font: 'Anton', size: 64, color: INK, ls: 30 }),
        L(90, 150, 1830, 150, INK, 5),
        T('We started in a laundry room because it was the only place with a socket and no neighbours. Four years, two records and one stolen van later we still play every song faster than we wrote it.', 90, 210, 800, { font: 'Special Elite', size: 40, lh: 1.4, color: INK }),
        ...[['4', 'YEARS'], ['2', 'RECORDS'], ['1', 'STOLEN VAN']].flatMap(([n, l], i) => [
          T(n, 90 + i * 290, 600, 280, { font: 'Anton', size: 230, lh: 1, color: i === 1 ? RED : INK }),
          T(l, 100 + i * 290, 860, 280, { font: 'Courier Prime', weight: 700, size: 28, ls: 120, color: INK }),
        ]),
        L(90, 850, 880, 850, INK, 4),
        rect(990, 210, 840, 760, INK),
        T('"The loudest\nthing in\nthe building\nwas the fridge,\nuntil they\nstarted."', 1030, 230, 780, { font: 'Anton', size: 108, lh: 1.02, color: PAPER }),
        T('A local paper, 2025', 1030, 900, 700, { font: 'Courier Prime', size: 28, ls: 100, color: YEL }),
        toners(1920, 1080, 0.7),
      ]),
      page(PAPER, [
        overlay('tex/newsprint.jpg', 1920, 1080, 'multiply', 0.8),
        T('ON THE ROAD', 90, 70, 900, { font: 'Anton', size: 64, color: INK, ls: 30 }),
        L(90, 150, 1830, 150, INK, 5),
        ...[
          ['14 NOV', 'Basement Bar', 'Stockholm', 'Few left'],
          ['21 NOV', 'The Boiler Room', 'Gothenburg', ''],
          ['28 NOV', 'Folkets Hus', 'Malmo', 'Door only'],
          ['05 DEC', 'Garage 9', 'Uppsala', 'Free'],
          ['12 DEC', 'Kulturhuset', 'Lund', 'Few left'],
        ].flatMap(([d, v, c, n], i) => [
          T(d, 90, 200 + i * 150, 330, { font: 'Anton', size: 84, color: INK }),
          T(v, 470, 218 + i * 150, 700, { font: 'Archivo Black', size: 50, color: INK, ls: -20 }),
          T(c, 1130, 232 + i * 150, 400, { font: 'Special Elite', size: 38, color: INK }),
          T(n, 1540, 236 + i * 150, 290, { font: 'Courier Prime', weight: 700, size: 30, ls: 80, color: INK, align: 'right', upper: true }),
          L(90, 310 + i * 150, 1830, 310 + i * 150, INK, 2, { dash: 'dot' }),
        ]),
        S('ellipse', 1470, 340, 390, 110, null, { fill: solid('rgba(0,0,0,0)'), stroke: stroke(RED, 7), rotation: -4 }),
        T('SOLD OUT', 1470, 361, 390, { font: 'Anton', size: 62, color: RED, align: 'center', rotation: -4 }),
        toners(1920, 1080, 0.7),
      ]),
      page(PINK, [
        T('WRITE\nTO US', 90, 40, 1350, { font: 'Anton', size: 400, lh: 0.84, ls: -20, color: INK }),
        T('booking@paperteeth.example\n+46 70 123 45 67', 100, 800, 1100, { font: 'Courier Prime', weight: 700, size: 52, lh: 1.3, color: INK }),
        rect(1450, 560, 360, 360, PAPER, { rotation: 3 }),
        qr('https://example.com/paperteeth', 1472, 582, 316, INK, PAPER, { rotation: 3 }),
        T('photos, songs and\na rider you can read', 1330, 380, 520, { font: 'Permanent Marker', size: 44, lh: 1.05, color: RED, rotation: -4, align: 'right' }),
        toners(1920, 1080, 0.8),
      ]),
    ],
  }),

  // 7. Demo tape insert
  tpl({
    id: 'xerox-demo-tape',
    name: 'Demo tape cover',
    format: 'square',
    category: 'Music',
    tags: ['demo', 'tape', 'album', 'cover', 'cassette', 'tracklist'],
    pages: [
      page(PAPER, [
        overlay('tex/crumpled-paper.jpg', 1080, 1080, 'multiply', 0.6),
        rect(0, 0, 250, 1080, INK),
        T('DEMO 03', -330, 450, 900, { font: 'Anton', size: 210, lh: 1, color: YEL, rotation: -90, align: 'center', ls: -10 }),
        img('photos/man.jpg', 290, 40, 460, 640, { rotation: 1.5, filters: toner({ contrast: 95, brightness: 35 }) }),
        img('tex/halftone-dots.jpg', 290, 40, 460, 640, { rotation: 1.5, blend: 'multiply', opacity: 0.25 }),
        tape(270, 30, -30, 100), tape(660, 650, -30, 100),
        T('recorded in a bedroom,\nmixed in a bathroom', 300, 710, 460, { font: 'Permanent Marker', size: 30, lh: 1.05, color: RED, rotation: -2 }),
        T('SIDE A', 790, 50, 260, { font: 'Anton', size: 48, color: INK }),
        L(790, 108, 1040, 108, INK, 4),
        ...['Wet concrete', 'Nobody drives', 'Landlord blues', 'Ten past four', 'Static'].map((t, i) =>
          T(`${i + 1}. ${t}`, 790, 124 + i * 52, 270, { font: 'Special Elite', size: 22, color: INK })),
        T('SIDE B', 790, 420, 260, { font: 'Anton', size: 48, color: INK }),
        L(790, 478, 1040, 478, INK, 4),
        ...['Cold tea', 'Bus 53', 'The long way', 'Hiss'].map((t, i) =>
          T(`${i + 6}. ${t}`, 790, 494 + i * 52, 270, { font: 'Special Elite', size: 22, color: INK })),
        T('*PT003*', 790, 760, 280, { font: 'Libre Barcode 39', size: 100, color: INK, lh: 1 }),
        T('PT003  C30  NORMAL BIAS', 790, 860, 280, { font: 'Courier Prime', weight: 700, size: 14, ls: 100, color: INK }),
        ...strip('PAPER TEETH', 290, 840, 92, { bg: INK, color: PAPER, rot: -1.5, k: 0.42 }),
        S('burst', 860, 920, 190, 140, RED, { rotation: -10 }),
        T('C30\nHAND\nMADE', 860, 950, 190, { font: 'Anton', size: 28, lh: 1, align: 'center', color: PAPER, rotation: -10 }),
        toners(1080, 1080, 0.8),
      ]),
    ],
  }),

  // 8. Copy of a copy
  tpl({
    id: 'xerox-copy-of-a-copy',
    name: 'Generation loss poster',
    format: 'poster',
    category: 'Event',
    tags: ['exhibition', 'poster', 'art', 'fade', 'repeat'],
    pages: [
      page(PAPER, [
        overlay('tex/halftone-dots.jpg', 1123, 1587, 'multiply', 0.28, { name: 'Halftone fade' }),
        ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) =>
          T('COPY OF A COPY', 40, 36 + i * 150, 1060, { font: 'Anton', size: 150, lh: 1, ls: -10, color: INK, opacity: [1, 0.86, 0.7, 0.55, 0.42, 0.3, 0.2, 0.12][i], blur: [0, 0.5, 1, 1.8, 2.8, 4, 5.5, 7][i] })),
        rect(40, 1262, 1043, 6, INK),
        T('Photocopies of photocopies,\nhung in a row.\nBring your own glasses.', 40, 1296, 560, { font: 'Special Elite', size: 29, lh: 1.3, color: INK }),
        T('8 NOV TO 6 DEC\nTUE TO SUN 12 to 18\nFREE ENTRY', 640, 1296, 443, { font: 'Courier Prime', weight: 700, size: 29, lh: 1.5, color: INK, ls: 40 }),
        T('Gallery Vigil, Hagagatan 9', 40, 1510, 700, { font: 'Courier Prime', size: 24, ls: 80, color: INK }),
        S('ellipse', 880, 1488, 200, 70, null, { fill: solid('rgba(0,0,0,0)'), stroke: stroke(RED, 5), rotation: -4 }),
        T('original\nnot included', 880, 1496, 200, { font: 'Permanent Marker', size: 22, lh: 1, color: RED, align: 'center', rotation: -4 }),
        overlay('tex/photocopy-toner.jpg', 1123, 1587, 'multiply', 0.9),
      ]),
    ],
  }),

  // 9. Record fair banner
  tpl({
    id: 'xerox-swap-meet-banner',
    name: 'Swap meet banner',
    format: 'banner',
    category: 'Event',
    tags: ['banner', 'header', 'market', 'records', 'email'],
    pages: [
      page(YEL, [
        ...strip('RECORDS', 30, 24, 100, { bg: INK, color: YEL, rot: -2 }),
        ...strip('TAPES', 190, 134, 100, { bg: PAPER, color: INK, rot: 1.5 }),
        ...strip('ZINES', 100, 246, 100, { bg: RED, color: PAPER, rot: -1 }),
        rect(690, 30, 220, 340, INK, { rotation: 3 }),
        img('photos/concert.jpg', 696, 36, 208, 328, { rotation: 3, filters: toner({ contrast: 80, brightness: 35 }) }),
        img('tex/halftone-dots.jpg', 696, 36, 208, 328, { rotation: 3, blend: 'multiply', opacity: 0.25 }),
        tape(660, 20, -35, 90),
        T('SWAP MEET', 940, 40, 240, { font: 'Anton', size: 54, lh: 1, color: INK }),
        T('Last Sunday\nof every month\n11 to 16, free', 940, 112, 250, { font: 'Special Elite', size: 21, lh: 1.3, color: INK }),
        T('Folkets Hus, hall B', 940, 232, 250, { font: 'Courier Prime', weight: 700, size: 16, ls: 60, color: INK }),
        T('bring a crate', 944, 300, 240, { font: 'Permanent Marker', size: 34, color: RED, rotation: -5 }),
        L(1050, 346, 1160, 346, RED, 4, { end: 'arrow' }),
        toners(1200, 400, 0.8),
      ]),
    ],
  }),

  // 10. Carousel: how to
  tpl({
    id: 'xerox-how-to-carousel',
    name: 'How to carousel',
    format: 'post',
    category: 'Social',
    tags: ['carousel', 'how to', 'steps', 'tutorial', 'guide'],
    pages: [
      page(YEL, [
        T('HOW TO', 60, 50, 700, { font: 'Courier Prime', weight: 700, size: 34, ls: 200, color: INK }),
        ...strip('MAKE A', 60, 110, 180, { bg: INK, color: YEL, rot: -1.5, k: 0.48 }),
        ...strip('GIG', 60, 336, 180, { bg: PAPER, color: INK, rot: 1.5, k: 0.5 }),
        ...strip('POSTER', 60, 562, 180, { bg: RED, color: PAPER, rot: -1, k: 0.48 }),
        img('photos/concert.jpg', 620, 360, 400, 270, { rotation: 4, filters: toner({ contrast: 70, brightness: 40 }) }),
        T('four steps,\none pair of scissors', 60, 830, 600, { font: 'Special Elite', size: 40, lh: 1.25, color: INK }),
        T('swipe', 760, 1210, 220, { font: 'Permanent Marker', size: 46, color: RED, rotation: -4 }),
        L(790, 1275, 1000, 1275, RED, 6, { end: 'arrow' }),
        T('1 / 4', 60, 1270, 200, { font: 'Courier Prime', weight: 700, size: 24, ls: 100, color: INK }),
        toners(1080, 1350, 0.8),
      ]),
      ...[
        ['1', 'CUT', 'Cut your headline out of anything: a newspaper, a bus ticket, a cereal box. Mix sizes. Ugly is correct.', PAPER, INK],
        ['2', 'PASTE', 'Glue the letters down crooked on one clean sheet. Leave a white margin. A photo goes in the middle, cropped hard.', PINK, INK],
        ['3', 'COPY IT BADLY', 'Photocopy it. Photocopy the copy. Turn the contrast up until the faces go to dots. Stop one copy before you are happy.', PAPER, INK],
      ].map(([n, h, body, bg, ink], i) => page(bg, [
        overlay('tex/newsprint.jpg', 1080, 1350, 'multiply', bg === PAPER ? 0.7 : 0.25),
        T(n, 40, 20, 600, { font: 'Anton', size: 620, lh: 0.9, color: RED, ls: -20 }),
        ...(i === 0 ? [
          scissors(660, 150, INK),
          ...strip('C', 590, 200, 150, { bg: INK, color: PAPER, rot: -6, padX: 20, w: 120, k: 0.5 }),
          ...strip('U', 700, 230, 150, { bg: YEL, color: INK, rot: 4, padX: 20, w: 120, font: 'Archivo Black' }),
          ...strip('T', 830, 190, 150, { bg: PAPER, color: INK, rot: -3, padX: 20, w: 110, font: 'Special Elite' }),
        ] : []),
        ...(i === 1 ? [
          rect(570, 150, 420, 520, INK, { rotation: 3 }),
          img('photos/runner.jpg', 578, 158, 404, 504, { rotation: 3, filters: toner({ contrast: 90, brightness: 40 }) }),
          tape(540, 140, -35, 100), tape(930, 640, -35, 100),
        ] : []),
        ...(i === 2 ? [
          img('photos/city.jpg', 570, 120, 420, 520, { rotation: -3, filters: toner({ contrast: 100, brightness: 30 }) }),
          img('tex/halftone-dots.jpg', 570, 120, 420, 520, { rotation: -3, blend: 'multiply', opacity: 0.45 }),
        ] : []),
        T(h, 60, 740, 960, { font: 'Anton', size: i === 2 ? 120 : 190, lh: 1, color: ink, ls: -10 }),
        L(60, i === 2 ? 880 : 960, 1020, i === 2 ? 880 : 960, INK, 5),
        T(body, 60, i === 2 ? 920 : 1000, 900, { font: 'Special Elite', size: 40, lh: 1.3, color: ink }),
        T(`${i + 2} / 4`, 60, 1270, 200, { font: 'Courier Prime', weight: 700, size: 24, ls: 100, color: ink }),
        L(900, 1285, 1020, 1285, RED, 6, { end: 'arrow' }),
        toners(1080, 1350, 0.75),
      ])),
    ],
  }),

  // 11. Thumbnail
  tpl({
    id: 'xerox-video-thumb',
    name: 'Video thumbnail',
    format: 'thumb',
    category: 'Social',
    tags: ['youtube', 'thumbnail', 'video', 'cover'],
    pages: [
      page(YEL, [
        img('photos/man.jpg', 700, 0, 580, 720, { filters: toner({ contrast: 95, brightness: 40 }), blend: 'multiply' }),
        img('tex/halftone-dots.jpg', 700, 0, 580, 720, { blend: 'multiply', opacity: 0.3 }),
        ...strip('I MADE', 40, 40, 112, { bg: INK, color: YEL, rot: -2, w: 380 }),
        ...strip('100 POSTERS', 40, 185, 100, { bg: PAPER, color: INK, rot: 1.2, w: 660 }),
        ...strip('IN ONE NIGHT', 40, 320, 80, { bg: RED, color: PAPER, rot: -1.2, w: 580 }),
        T('no sleep, bad glue', 60, 560, 500, { font: 'Permanent Marker', size: 48, color: INK, rotation: -3 }),
        L(520, 600, 690, 610, INK, 6, { end: 'arrow' }),
        toners(1280, 720, 0.8),
      ]),
    ],
  }),

  // 12. Business card
  tpl({
    id: 'xerox-business-card',
    name: 'Cut and paste card',
    format: 'card',
    category: 'Business card',
    tags: ['business card', 'contact', 'band', 'booking'],
    pages: [
      page(YEL, [
        ...strip('MARA', 60, 60, 190, { bg: INK, color: YEL, rot: -2, w: 460 }),
        ...strip('LIND', 60, 250, 190, { bg: PAPER, color: INK, rot: 1.5, w: 400 }),
        T('Bass. Booking. Bad ideas.', 70, 500, 600, { font: 'Special Elite', size: 32, color: INK }),
        S('burst', 740, 330, 220, 190, RED, { rotation: 10 }),
        T('CALL\nME', 740, 372, 220, { font: 'Anton', size: 56, lh: 1, color: PAPER, align: 'center', rotation: 10 }),
        toners(1004, 650, 0.8),
      ]),
      page(PAPER, [
        overlay('tex/newsprint.jpg', 1004, 650, 'multiply', 0.8),
        rect(0, 0, 40, 650, INK),
        T('+46 70 123 45 67', 90, 90, 700, { font: 'Anton', size: 76, color: INK }),
        T('mara@paperteeth.example\nGatan 9, Stockholm\n@paperteeth', 90, 240, 600, { font: 'Courier Prime', weight: 700, size: 36, lh: 1.5, color: INK }),
        L(90, 220, 700, 220, INK, 4),
        rect(740, 330, 210, 210, YEL, { rotation: 3 }),
        qr('https://example.com/mara', 758, 348, 174, INK, YEL, { rotation: 3 }),
        T('scan or call after six', 90, 520, 600, { font: 'Permanent Marker', size: 34, color: RED, rotation: -2 }),
        toners(1004, 650, 0.7),
      ]),
    ],
  }),
];
