import { tpl, page, T, S, rect, circle, path, L, img, frame, overlay, svg, qr, solid, linear, radial, pattern, imageFill, stroke } from '../kit.mjs';

const RED = '#D7261E';
const BLUE = '#1B4DB1';
const YEL = '#F4C20D';
const BLK = '#141414';
const PAPER = '#EFE8D8';
const WHITE = '#F7F4EC';
const GREEN = '#1F8A5B';
const PINK = '#F0A6B4';

const wrap = (w, h, inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${inner}</svg>`;
const f1 = (n) => Math.round(n * 10) / 10;
const GRAIN = (W, H, o = 0.5) => overlay('tex/paper-fibre.jpg', W, H, 'multiply', o);

// shapes on a cell (x, y, size s)
const circ = (x, y, s, c) => `<circle cx="${x + s / 2}" cy="${y + s / 2}" r="${s / 2}" fill="${c}"/>`;
const sq = (x, y, s, c) => `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${c}"/>`;
const quarter = (x, y, s, corner, c) => {
  const C = { tl: [x, y, 'M{c}L{e}A{s} {s} 0 0 1 {n}Z'], };
  const d = {
    tl: `M${x} ${y}L${x + s} ${y}A${s} ${s} 0 0 1 ${x} ${y + s}Z`,
    tr: `M${x + s} ${y}L${x + s} ${y + s}A${s} ${s} 0 0 1 ${x} ${y}Z`,
    br: `M${x + s} ${y + s}L${x} ${y + s}A${s} ${s} 0 0 1 ${x + s} ${y}Z`,
    bl: `M${x} ${y + s}L${x} ${y}A${s} ${s} 0 0 1 ${x + s} ${y + s}Z`,
  }[corner];
  return `<path d="${d}" fill="${c}"/>`;
};
const half = (x, y, s, dir, c) => {
  const d = {
    up: `M${x} ${y + s}A${s / 2} ${s / 2} 0 0 1 ${x + s} ${y + s}Z`,
    down: `M${x + s} ${y}A${s / 2} ${s / 2} 0 0 1 ${x} ${y}Z`,
    left: `M${x + s} ${y + s}A${s / 2} ${s / 2} 0 0 1 ${x + s} ${y}Z`,
    right: `M${x} ${y}A${s / 2} ${s / 2} 0 0 1 ${x} ${y + s}Z`,
  }[dir];
  return `<path d="${d}" fill="${c}"/>`;
};
const tri = (x, y, s, c, flip = false) => `<path d="${flip ? `M${x} ${y}H${x + s}L${x + s / 2} ${y + s}Z` : `M${x} ${y + s}H${x + s}L${x + s / 2} ${y}Z`}" fill="${c}"/>`;
const bars = (x, y, s, c, n = 5, vertical = false) => {
  let o = '';
  const t = s / (n * 2 - 1);
  for (let i = 0; i < n; i++) o += vertical ? `<rect x="${f1(x + i * 2 * t)}" y="${y}" width="${f1(t)}" height="${s}" fill="${c}"/>` : `<rect x="${x}" y="${f1(y + i * 2 * t)}" width="${s}" height="${f1(t)}" fill="${c}"/>`;
  return o;
};

// ===================================================================
// 1. Room for light: letter grid
// ===================================================================
const grid = (() => {
  const W = 1123, H = 1587, c = 200, gx = 61, gy = 100;
  const X = (i) => gx + i * c, Y = (j) => gy + j * c;
  const letter = (ch, i, j, col) => T(ch, X(i) - 8, Y(j) - 20, c + 16, { font: 'Jost', size: 244, weight: 800, color: col, align: 'center', lh: 1, ls: 0 });
  let o = '';
  o += circ(X(1), Y(0), c, BLUE) + circ(X(2), Y(0), c, RED) + sq(X(4), Y(0), c, YEL);
  o += circ(X(1), Y(1), c, YEL) + quarter(X(3), Y(1), c, 'bl', BLK);
  o += quarter(X(0), Y(3), c, 'tr', RED) + half(X(1), Y(3), c, 'up', BLUE) + tri(X(2), Y(3), c, YEL) + circ(X(3), Y(3), c, BLK) + quarter(X(4), Y(3), c, 'bl', BLUE);
  o += sq(X(0), Y(4), c, BLK) + bars(X(1), Y(4), c, BLK, 5, true) + circ(X(2), Y(4), c, RED) + quarter(X(3), Y(4), c, 'tl', YEL) + half(X(4), Y(4), c, 'left', BLK);
  return tpl({
    id: 'bauhaus-room-for-light', name: 'Letter grid poster', format: 'poster', category: 'Event',
    tags: ['exhibition', 'type', 'grid', 'shapes', 'poster'],
    pages: [page(PAPER, [
      svg(wrap(W, H, o), 0, 0, W, H),
      letter('R', 0, 0, BLK), letter('M', 3, 0, BLK),
      letter('F', 0, 1, BLK), letter('R', 2, 1, BLK),
      letter('L', 0, 2, BLK), letter('I', 1, 2, BLK), letter('G', 2, 2, BLK), letter('H', 3, 2, BLK), letter('T', 4, 2, BLK),
      L(61, 1190, 1062, 1190, BLK, 3),
      T('Room for light', 61, 1225, 700, { font: 'Jost', size: 72, weight: 800, color: BLK, ls: -15 }),
      T('A show of lamps, windows\nand things that let it in.', 61, 1330, 500, { font: 'Jost', size: 30, weight: 400, color: BLK, lh: 1.3 }),
      T('10 September to\n29 October', 700, 1235, 362, { font: 'Jost', size: 30, weight: 700, color: BLK, lh: 1.25, align: 'right' }),
      T('Hall 3, entry free', 620, 1330, 442, { font: 'Jost', size: 30, weight: 400, color: BLK, align: 'right' }),
      GRAIN(W, H, 0.5),
    ])],
  });
})();

// ===================================================================
// 2. Checker warp poster
// ===================================================================
const checker = (() => {
  const W = 1123, H = 1587;
  const cw = [110, 98, 84, 70, 56, 44, 34, 26, 20, 16, 16, 20, 26, 34, 44, 56, 70, 84, 98, 110];
  let sum = cw.reduce((a, b) => a + b, 0);
  const rows = 14, rh = 78;
  let o = '', x = 0;
  cw.forEach((w, i) => {
    const k = i;
    for (let r = 0; r < rows; r++) if ((i + r) % 2 === 0) o += `<rect x="${f1(x)}" y="${r * rh}" width="${f1(w + 0.5)}" height="${rh + 0.5}" fill="${BLUE}"/>`;
    x += w;
  });
  const sc = W / sum;
  return tpl({
    id: 'bauhaus-checker-warp', name: 'Checker warp poster', format: 'poster', category: 'Event',
    tags: ['checker', 'pattern', 'poster', 'exhibition', 'optical'],
    pages: [page(PAPER, [
      svg(wrap(sum, rows * rh, o), 0, 0, W, rows * rh * sc),
      rect(0, 1092, W, 495, PAPER),
      T('Quadrat', 56, 1112, 1000, { font: 'Jost', size: 190, weight: 800, color: BLK, ls: -50 }),
      L(62, 1370, 1061, 1370, BLK, 3),
      T('School of Design, Weimar', 62, 1392, 600, { font: 'Jost', size: 26, weight: 700, color: BLK, upper: true, ls: 160 }),
      T('Exhibition of optical studies,\nwoven and printed squares', 62, 1442, 600, { font: 'Jost', size: 26, weight: 400, color: BLK, lh: 1.3 }),
      T('1923', 700, 1380, 361, { font: 'Jost', size: 120, weight: 800, color: BLUE, align: 'right', ls: -30 }),
      GRAIN(W, H, 0.5),
    ])],
  });
})();

// ===================================================================
// 3. Sun and blocks poster
const sunBlocks = tpl({
  id: 'bauhaus-sun-blocks', name: 'Sun and blocks poster', format: 'poster', category: 'Event',
  tags: ['poster', 'sun', 'blocks', 'exhibition', 'colour'],
  pages: [page(PAPER, [
    img('art/bauhaus-sun-blocks-print.jpg', 0, 0, 1123, 1587),
    T('Primary\nColours', 56, 1240, 1000, { font: 'Jost', size: 118, weight: 800, color: BLK, lh: 0.9, ls: -45 }),
    T('A course in seeing red, yellow and blue.', 62, 1510, 700, { font: 'Jost', size: 26, weight: 500, color: BLK }),
    T('Evenings, from 4 November', 600, 1510, 461, { font: 'Jost', size: 26, weight: 700, color: BLK, align: 'right' }),
  ])],
});

// 4. Dot grid post
// ===================================================================
const dots = (() => {
  const W = 1080, H = 1350;
  const cols = [RED, BLUE, YEL, BLK, WHITE];
  const seq = [
    [YEL, RED, BLUE, YEL, RED, BLUE],
    [BLUE, YEL, RED, BLUE, YEL, RED],
    [RED, BLUE, BLK, RED, BLUE, YEL],
    [YEL, RED, BLUE, YEL, WHITE, BLUE],
    [BLUE, YEL, RED, BLUE, YEL, RED],
    [RED, BLUE, YEL, RED, BLUE, YEL],
  ];
  let o = '';
  const c = 150, gx = 90, gy = 90;
  seq.forEach((row, j) => row.forEach((col, i) => { o += circ(gx + i * c, gy + j * c, c - 14, col).replace(`r="${(c - 14) / 2}"`, `r="${(c - 14) / 2}"`); }));
  return tpl({
    id: 'bauhaus-dot-grid', name: 'Open studio dot grid', format: 'post', category: 'Social',
    tags: ['grid', 'circles', 'announcement', 'studio', 'colour'],
    pages: [page(BLK, [
      svg(wrap(W, H, o), 0, 0, W, H),
      T('open\nstudio', 90, 1020, 600, { font: 'Jost', size: 130, weight: 800, color: WHITE, lh: 0.88, ls: -40 }),
      T('Saturday 11 to 17\nSix rooms, forty makers.', 650, 1030, 340, { font: 'Jost', size: 28, weight: 500, color: WHITE, lh: 1.3, align: 'right' }),
      T('Foundry Lane 8', 650, 1160, 340, { font: 'Jost', size: 28, weight: 700, color: YEL, align: 'right' }),
    ])],
  });
})();

// ===================================================================
// 5. Tube lines story
const tubes = tpl({
  id: 'bauhaus-tube-lines-story', name: 'Tube lines story', format: 'story', category: 'Social',
  tags: ['story', 'lines', 'transit', 'announcement', 'colour'],
  pages: [page(WHITE, [
    img('art/bauhaus-tube-lines-print.jpg', 0, 0, 1080, 1620),
    T('Five lines,\none city', 70, 1130, 940, { font: 'Jost', size: 130, weight: 800, color: BLK, lh: 0.9, ls: -40 }),
    T('A free map of every route, folded to fit a pocket. Pick one up at the ticket hall.', 70, 1440, 800, { font: 'Jost', size: 34, weight: 400, color: BLK, lh: 1.3 }),
    L(70, 1740, 1010, 1740, BLK, 3),
    T('New timetable', 70, 1770, 500, { font: 'Jost', size: 28, weight: 700, color: BLK, upper: true, ls: 140 }),
    T('From Monday 3', 510, 1770, 500, { font: 'Jost', size: 28, weight: 700, color: RED, upper: true, ls: 140, align: 'right' }),
  ])],
});

// 6. Shapes carousel
// ===================================================================
const carousel = (() => {
  const W = 1080, H = 1350;
  const cap = (n, t, b, col, bg) => [
    T(n, 70, 1010, 300, { font: 'Jost', size: 26, weight: 700, color: col, upper: true, ls: 200 }),
    T(t, 66, 1050, 940, { font: 'Jost', size: 130, weight: 800, color: col, ls: -40, lh: 1 }),
    T(b, 70, 1200, 800, { font: 'Jost', size: 34, weight: 400, color: col, lh: 1.3 }),
  ];
  let c1 = circ(70, 70, 460, RED) + sq(540, 70, 460, BLUE) + tri(70, 540, 460, YEL) + quarter(540, 540, 460, 'br', BLK);
  let c2 = '';
  for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) c2 += ((i + j) % 2 ? circ : (x, y, s, c) => half(x, y, s, 'up', c))(70 + i * 320, 70 + j * 310, 300, [BLUE, YEL, BLK][(i + j) % 3]);
  let c3 = '';
  for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) { c3 += sq(70 + i * 320, 70 + j * 310, 300, RED); if ((i + j) % 2 === 0) c3 += sq(70 + i * 320 + 80, 70 + j * 310 + 80, 140, BLK); }
  let c4 = '';
  for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) c4 += tri(70 + i * 320, 70 + j * 310, 300, YEL, (i + j) % 2 === 1);
  return tpl({
    id: 'bauhaus-shapes-carousel', name: 'Design basics carousel', format: 'post', category: 'Social',
    tags: ['carousel', 'shapes', 'education', 'design', 'series'],
    pages: [
      page(PAPER, [svg(wrap(W, H, c1), 0, 0, W, H), T('Design basics', 70, 1010, 400, { font: 'Jost', size: 26, weight: 700, color: BLK, upper: true, ls: 200 }), T('Three shapes,\nthree colours', 66, 1050, 940, { font: 'Jost', size: 112, weight: 800, color: BLK, ls: -35, lh: 0.95 }), T('Swipe to meet them', 70, 1275, 500, { font: 'Jost', size: 28, weight: 700, color: RED }), GRAIN(W, H, 0.5)]),
      page(BLUE, [svg(wrap(W, H, c2.replaceAll(BLUE, WHITE)), 0, 0, W, H), ...cap('01', 'The circle', 'Calm, complete, and always blue.', WHITE), GRAIN(W, H, 0.4)]),
      page(RED, [svg(wrap(W, H, c3.replaceAll(RED, PAPER)), 0, 0, W, H), ...cap('02', 'The square', 'Steady, honest, and always red.', PAPER), GRAIN(W, H, 0.4)]),
      page(YEL, [svg(wrap(W, H, c4.replaceAll(YEL, BLK)), 0, 0, W, H), ...cap('03', 'The triangle', 'Sharp, restless, and always yellow.', BLK), GRAIN(W, H, 0.4)]),
    ],
  });
})();

// ===================================================================
// 7. Workshop deck
// ===================================================================
const deck = (() => {
  const W = 1920, H = 1080;
  const wide = (inner) => svg(wrap(W, H, inner), 0, 0, W, H);
  let a = circ(1100, 140, 560, RED) + sq(1100, 420, 280, BLUE) + quarter(1380, 420, 280, 'tr', YEL) + `<rect x="1100" y="700" width="560" height="26" fill="${BLK}"/>` + tri(1660, 140, 160, BLK);
  const s1 = page(PAPER, [
    wide(a),
    T('Workshop', 100, 110, 800, { font: 'Jost', size: 30, weight: 700, color: BLK, upper: true, ls: 200 }),
    T('Learning\nto see', 96, 200, 900, { font: 'Jost', size: 200, weight: 800, color: BLK, lh: 0.9, ls: -60 }),
    L(100, 880, 800, 880, BLK, 3),
    T('A day course for teams that make things', 100, 910, 800, { font: 'Jost', size: 34, weight: 400, color: BLK }),
    GRAIN(W, H, 0.5),
  ]);
  const col = (i, shape, t, b) => [
    svg(wrap(300, 300, shape), 100 + i * 600, 240, 340, 340),
    T(t, 100 + i * 600, 640, 520, { font: 'Jost', size: 84, weight: 800, color: BLK, ls: -25 }),
    T(b, 100 + i * 600, 760, 500, { font: 'Jost', size: 36, weight: 400, color: BLK, lh: 1.3 }),
  ];
  const s2 = page(WHITE, [
    T('Three rules', 100, 70, 1000, { font: 'Jost', size: 50, weight: 700, color: BLK, upper: true, ls: 180 }),
    L(100, 150, 1820, 150, BLK, 3),
    ...col(0, circ(0, 0, 300, BLUE), 'Look first', 'Before you draw, spend ten minutes just looking at the thing.'),
    ...col(1, sq(0, 0, 300, RED), 'Cut it down', 'Remove every line that does not carry weight. Then remove one more.'),
    ...col(2, tri(0, 0, 300, YEL), 'Make it twice', 'The second version is the one you keep. The first is a sketch.'),
    GRAIN(W, H, 0.4),
  ]);
  let c = '';
  for (let i = 0; i < 6; i++) c += `<rect x="${100 + i * 280}" y="${760 - (i + 1) * 90}" width="240" height="${(i + 1) * 90}" fill="${[BLUE, RED, YEL, BLUE, RED, YEL][i]}"/>`;
  const s3 = page(PAPER, [
    wide(c),
    T('Attendance, six sessions', 100, 70, 1200, { font: 'Jost', size: 50, weight: 700, color: BLK, upper: true, ls: 160 }),
    T('Everyone came back\nfor the next one.', 100, 160, 1000, { font: 'Jost', size: 100, weight: 800, color: BLK, lh: 0.95, ls: -30 }),
    ...[0, 1, 2, 3, 4, 5].map((i) => T(String(8 + i * 3), 100 + i * 280, 780, 240, { font: 'Jost', size: 56, weight: 800, color: BLK, align: 'center' })),
    GRAIN(W, H, 0.5),
  ]);
  const s4 = page(BLK, [
    wide(circ(1400, 220, 440, YEL) + half(1400, 660, 440, 'up', RED) + `<rect x="1400" y="880" width="440" height="40" fill="${BLUE}"/>`),
    T('Thank you', 100, 220, 1100, { font: 'Jost', size: 220, weight: 800, color: WHITE, ls: -65 }),
    T('studio@workshop.example', 100, 760, 900, { font: 'Jost', size: 40, weight: 500, color: WHITE }),
    T('Bring a pencil to the next one.', 100, 830, 900, { font: 'Jost', size: 40, weight: 500, color: YEL }),
  ]);
  return tpl({ id: 'bauhaus-workshop-deck', name: 'Workshop deck', format: 'slide', category: 'Presentation', tags: ['slides', 'deck', 'workshop', 'course', 'presentation'], pages: [s1, s2, s3, s4] });
})();

// ===================================================================
// 8. Trio flyer
// ===================================================================
const trio = (() => {
  const W = 559, H = 794;
  const o = `<circle cx="210" cy="250" r="150" fill="${RED}"/><rect x="190" y="150" width="240" height="240" fill="${BLUE}" style="mix-blend-mode:screen" opacity="0.92"/><path d="M130 440H400L265 200Z" fill="${YEL}" opacity="0.92"/>`;
  return tpl({
    id: 'bauhaus-trio-flyer', name: 'Lecture series flyer', format: 'flyer', category: 'Event',
    tags: ['flyer', 'lecture', 'series', 'shapes', 'black'],
    pages: [page(BLK, [
      svg(wrap(W, H, o), 0, 0, W, H),
      T('Form,\nColour,\nSpace', 30, 450, 500, { font: 'Jost', size: 76, weight: 800, color: WHITE, lh: 0.92, ls: -25 }),
      L(30, 684, 529, 684, WHITE, 1.5),
      T('Three lectures\non seeing', 30, 700, 250, { font: 'Jost', size: 17, weight: 700, color: WHITE, lh: 1.25 }),
      T('Tuesdays in May\n19:00, Aula', 280, 700, 249, { font: 'Jost', size: 17, weight: 400, color: WHITE, lh: 1.25, align: 'right' }),
      GRAIN(W, H, 0.3),
    ])],
  });
})();

export default [grid, checker, sunBlocks, dots, tubes, carousel, deck, trio];
