import { tpl, page, T, rect, L, img, overlay, stroke } from '../kit.mjs';
const A = (n) => `art/${n}.png`;
const PAIR = A('folk-papercut-pair'), GARLAND = A('folk-flower-garland'), SHEET = A('folk-motif-sheet'), FLOWERS = A('folk-flower-pair');

// ------------------------------------------------------------ 1  cross stitch
const crossStitch = (() => {
  const RED = '#C8232C', CREAM = '#F4ECDC', CELL = 34, N = 33, c = 16;
  const grid = [];
  for (let y = 0; y < N; y++) {
    let run = null;
    for (let x = 0; x <= N; x++) {
      let on = false;
      if (x < N) {
        const d = Math.abs(x - c) + Math.abs(y - c);
        if (d <= 16) {
          const r = d;
          if (r === 16 || r === 15) on = true;
          else if (r === 13 || r === 11) on = (x + y) % 2 === 0;
          else if (r === 9) on = true;
          else if (r === 7 || r === 5) on = (x + y) % 2 === 0;
          else if (r === 3) on = true;
          else if (r === 0) on = true;
          else on = false;
        } else {
          const a = ((x % 8) + 8) % 8, b = ((y % 8) + 8) % 8;
          on = Math.abs(a - 3.5) + Math.abs(b - 3.5) <= 1.5 || (a === 3 || a === 4) && (b === 3 || b === 4) ? true : false;
        }
      }
      if (on && run === null) run = x;
      if (!on && run !== null) { grid.push(rect(run * CELL + 0.5, y * CELL, (x - run) * CELL, CELL, RED)); run = null; }
    }
  }
  return tpl({
    id: 'folk-cross-stitch-poster', name: 'Cross stitch poster', format: 'poster', category: 'Poster', tags: ['folk', 'cross stitch', 'festival', 'ornament', 'poster'],
    pages: [page(CREAM, [
      grid,
      rect(0, 1122, 1123, 465, RED),
      T('Folk\nFestival', 60, 1160, 700, { font: 'Pixelify Sans', size: 122, weight: 700, color: CREAM, lh: 0.95, ls: -10 }),
      T('23.09', 760, 1170, 300, { font: 'Pixelify Sans', size: 70, weight: 700, color: CREAM, align: 'right' }),
      T('26.09', 760, 1250, 300, { font: 'Pixelify Sans', size: 70, weight: 700, color: CREAM, align: 'right' }),
      L(60, 1440, 1063, 1440, CREAM, 2),
      T('Music, dance, weaving and long tables\nin the old market hall', 60, 1462, 700, { font: 'IBM Plex Mono', size: 20, color: CREAM, lh: 1.4 }),
      T('Free entry\nBring your own spoon', 760, 1462, 303, { font: 'IBM Plex Mono', size: 20, color: CREAM, lh: 1.4, align: 'right' }),
      overlay('tex/paper-fibre.jpg', 1123, 1587, 'multiply', 0.3),
    ])],
  });
})();

// ------------------------------------------------------------ 2  tiles
const tiles = (() => {
  const BLUE = '#1F36D6', BONE = '#F2EDE0', TINT = ['#F2EDE0', '#DDE2F7'];
  const els = [];
  for (let i = 0; i < 6; i++) {
    const col = i % 2, row = Math.floor(i / 2), x = 60 + col * 360, y = 60 + row * 360;
    const t = TINT[(col + row) % 2];
    els.push(rect(x, y, 340, 340, t, { stroke: stroke(BLUE, 4) }));
    els.push(rect(x + 12, y + 12, 316, 316, 'transparent', { stroke: stroke(BLUE, 1.5) }));
    els.push(img(SHEET, x + 30, y + 30, 280, 280, { crop: { x: col * 0.5 + 0.02, y: row / 3 + 0.005, w: 0.46, h: 0.323 }, blend: 'multiply' }));
  }
  return tpl({
    id: 'folk-tile-grid', name: 'Folk tiles with vertical title', format: 'post', category: 'Social', tags: ['folk', 'tiles', 'art fair', 'blue', 'linocut'],
    pages: [page(BONE, [
      els,
      T('FOLK ART FAIR', 430, 492, 1000, { font: 'Gloock', size: 92, color: BLUE, rotation: 90, lh: 1, ls: -10, upper: true }),
      L(60, 1180, 1020, 1180, BLUE, 3),
      T('Craft, pattern and making things by hand. 12 to 14 September at the Textile Museum.', 60, 1210, 640, { font: 'Space Grotesk', size: 26, weight: 500, color: BLUE, lh: 1.3 }),
      T('Free entry', 760, 1210, 260, { font: 'Space Grotesk', size: 26, weight: 700, color: BLUE, align: 'right' }),
      overlay('tex/paper-fibre.jpg', 1080, 1350, 'multiply', 0.3),
    ])],
  });
})();

// ------------------------------------------------------------ 3  invite
const folkInvite = (() => {
  const RED = '#C9262B', CREAM = '#F5EDDD';
  return tpl({
    id: 'folk-bird-invitation', name: 'Folk birds invitation, two sides', format: 'invite', category: 'Invitation', tags: ['invitation', 'folk', 'wedding', 'birds', 'papercut'],
    pages: [
      page(CREAM, [
        img(PAIR, 80, 24, 320, 320),
        T('Anna\n& Jonas', 40, 340, 400, { font: 'DM Serif Display', size: 70, color: RED, align: 'center', lh: 0.95, ls: -10 }),
        T('are getting married', 40, 500, 400, { font: 'Space Grotesk', size: 15, weight: 500, color: RED, align: 'center', ls: 150, upper: true }),
        T('Saturday 8 August 2026', 40, 562, 400, { font: 'Space Grotesk', size: 15, weight: 700, color: RED, align: 'center', ls: 150, upper: true }),
        T('Kyrkbacken, then the barn', 40, 590, 400, { font: 'Space Grotesk', size: 14, weight: 500, color: RED, align: 'center', ls: 100 }),
        overlay('tex/paper-fibre.jpg', 480, 673, 'multiply', 0.3),
      ]),
      page(CREAM, [
        T('The day', 40, 44, 400, { font: 'DM Serif Display', size: 38, color: RED, align: 'center' }),
        [['14:00', 'Ceremony in the church'], ['15:30', 'Coffee and cake in the garden'], ['18:00', 'Dinner in the barn'], ['21:00', 'Dancing, a fiddler and a band']].map(([t, d], i) => [
          T(t, 70, 108 + i * 52, 100, { font: 'Space Grotesk', size: 20, weight: 700, color: RED }),
          T(d, 160, 110 + i * 52, 260, { font: 'Space Grotesk', size: 16, weight: 400, color: RED, lh: 1.25 }),
          L(70, 144 + i * 52, 410, 144 + i * 52, RED, 1),
        ]),
        T('Please reply by 1 June to\nanna.jonas@example.com or 070 123 45 67', 40, 330, 400, { font: 'Space Grotesk', size: 13, weight: 500, color: RED, align: 'center', lh: 1.5 }),
        img(GARLAND, 0, 380, 480, 320),
        overlay('tex/paper-fibre.jpg', 480, 673, 'multiply', 0.3),
      ]),
    ],
  });
})();

// ------------------------------------------------------------ 4  story
const folkStory = (() => {
  const BG = '#1A1513', CREAM = '#F3E6CC', YEL = '#F0B323';
  return tpl({
    id: 'folk-night-market-story', name: 'Folk night market story', format: 'story', category: 'Social', tags: ['folk', 'market', 'story', 'dark', 'flowers'],
    pages: [page(BG, [
      img(FLOWERS, 140, -60, 800, 1200),
      T('Night\nmarket', 70, 1250, 940, { font: 'Gloock', size: 200, color: CREAM, align: 'center', lh: 0.86, ls: -30 }),
      L(70, 1700, 1010, 1700, CREAM, 2),
      T('Friday 15 August, from six', 70, 1730, 700, { font: 'Space Grotesk', size: 32, weight: 700, color: CREAM }),
      T('Lanterns, hot food and a fiddler by the well, in the old square.', 70, 1785, 700, { font: 'Space Grotesk', size: 26, color: CREAM, lh: 1.3, opacity: 0.8 }),
      T('Free', 800, 1725, 210, { font: 'Gloock', size: 64, color: YEL, align: 'right' }),
      overlay('tex/risograph-speckle.jpg', 1080, 1920, 'screen', 0.2),
    ])],
  });
})();

// ------------------------------------------------------------ 5  postcard
const holidayCard = (() => {
  const BROWN = '#5A2819', CREAM = '#F3E8D3';
  return tpl({
    id: 'folk-holiday-postcard', name: 'Folk holiday postcard', format: 'postcard', category: 'Cards', tags: ['postcard', 'holiday', 'christmas', 'folk', 'greeting'],
    pages: [
      page(CREAM, [
        img(PAIR, 100, 6, 360, 360),
        T('Season’s greetings', 40, 330, 479, { font: 'DM Serif Display', size: 34, color: '#C9262B', align: 'center', lh: 1 }),
        overlay('tex/paper-fibre.jpg', 559, 397, 'multiply', 0.3),
      ]),
      page(CREAM, [
        L(279, 40, 279, 357, BROWN, 1),
        T('Dear all,', 40, 50, 220, { font: 'DM Serif Display', size: 22, color: BROWN }),
        T('A card from a cold and bright corner of the world. We hope the year ends softly for you and the next one starts slowly. Come by when you can, there is always coffee on.', 40, 88, 220, { font: 'Space Grotesk', size: 13, color: BROWN, lh: 1.5 }),
        T('Love, the three of us', 40, 300, 220, { font: 'DM Serif Display', size: 17, color: BROWN }),
        rect(449, 40, 70, 84, 'transparent', { stroke: stroke(BROWN, 1.2) }),
        img(SHEET, 456, 52, 56, 60, { crop: { x: 0.5, y: 0.667, w: 0.5, h: 0.333 }, blend: 'multiply' }),
        L(300, 200, 520, 200, BROWN, 1), L(300, 240, 520, 240, BROWN, 1), L(300, 280, 520, 280, BROWN, 1),
        overlay('tex/paper-fibre.jpg', 559, 397, 'multiply', 0.3),
      ]),
    ],
  });
})();

export default [crossStitch, tiles, folkInvite, folkStory, holidayCard];
