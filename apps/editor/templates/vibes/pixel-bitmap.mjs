import { tpl, page, T, S, rect, circle, L, img, frame, overlay, svg, qr, solid, linear, pattern, stroke } from '../kit.mjs';

// ---------- pixel helpers ----------
// cells(rows, x, y, s, colours): rows are strings, each char a colour key ('.' or ' ' is empty).
// Same colour cells are merged into greedy rectangles so a big sprite is a few dozen rects.
function cells(rows, x, y, s, colors, p = {}) {
  const out = [];
  const H = rows.length;
  const done = rows.map((r) => Array.from({ length: r.length }, () => false));
  const col = (c) => (typeof colors === 'string' ? colors : colors[c]);
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < rows[j].length; i++) {
      const c = rows[j][i];
      if (done[j][i] || c === '.' || c === ' ' || !col(c)) continue;
      let w = 1;
      while (i + w < rows[j].length && rows[j][i + w] === c && !done[j][i + w]) w++;
      let h = 1;
      outer: while (j + h < H) {
        for (let k = 0; k < w; k++) if (rows[j + h][i + k] !== c || done[j + h][i + k]) break outer;
        h++;
      }
      for (let b = 0; b < h; b++) for (let a = 0; a < w; a++) done[j + b][i + a] = true;
      out.push(rect(x + i * s, y + j * s, w * s, h * s, col(c), p));
    }
  }
  return out;
}
// grid from a function: fn(cx, cy) returns a char
const grid = (cols, rows, fn) => Array.from({ length: rows }, (_, j) => Array.from({ length: cols }, (_, i) => fn(i, j) || '.').join(''));
const rng = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
const bayer = (i, j) => (BAYER[j & 3][i & 3] + 0.5) / 16;
// mirror a half sprite horizontally (rows given as the left half incl. centre column when odd=true)
const mirror = (rows, odd = true) => rows.map((r) => r + [...r.slice(0, odd ? -1 : undefined)].reverse().join(''));

// 5x7 bitmap font
const F = {
  A: '.###.|#...#|#...#|#####|#...#|#...#|#...#', B: '####.|#...#|#...#|####.|#...#|#...#|####.',
  C: '.####|#....|#....|#....|#....|#....|.####', D: '####.|#...#|#...#|#...#|#...#|#...#|####.',
  E: '#####|#....|#....|####.|#....|#....|#####', F: '#####|#....|#....|####.|#....|#....|#....',
  G: '.####|#....|#....|#.###|#...#|#...#|.###.', H: '#...#|#...#|#...#|#####|#...#|#...#|#...#',
  I: '#####|..#..|..#..|..#..|..#..|..#..|#####', J: '..###|...#.|...#.|...#.|...#.|#..#.|.##..',
  K: '#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#', L: '#....|#....|#....|#....|#....|#....|#####',
  M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#', N: '#...#|##..#|#.#.#|#..##|#...#|#...#|#...#',
  O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.', P: '####.|#...#|#...#|####.|#....|#....|#....',
  Q: '.###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#', R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
  S: '.####|#....|#....|.###.|....#|....#|####.', T: '#####|..#..|..#..|..#..|..#..|..#..|..#..',
  U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.', V: '#...#|#...#|#...#|#...#|#...#|.#.#.|..#..',
  W: '#...#|#...#|#...#|#.#.#|#.#.#|##.##|#...#', X: '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
  Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..', Z: '#####|....#|...#.|..#..|.#...|#....|#####',
  0: '.###.|#...#|#..##|#.#.#|##..#|#...#|.###.', 1: '..#..|.##..|..#..|..#..|..#..|..#..|.###.',
  2: '.###.|#...#|....#|...#.|..#..|.#...|#####', 3: '####.|....#|....#|.###.|....#|....#|####.',
  4: '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.', 5: '#####|#....|####.|....#|....#|#...#|.###.',
  6: '.###.|#....|#....|####.|#...#|#...#|.###.', 7: '#####|....#|...#.|..#..|.#...|.#...|.#...',
  8: '.###.|#...#|#...#|.###.|#...#|#...#|.###.', 9: '.###.|#...#|#...#|.####|....#|....#|.###.',
  '.': '.....|.....|.....|.....|.....|.##..|.##..', ':': '.....|.##..|.##..|.....|.##..|.##..|.....',
  '-': '.....|.....|.....|#####|.....|.....|.....', '!': '..#..|..#..|..#..|..#..|..#..|.....|..#..',
  '?': '.###.|#...#|....#|...#.|..#..|.....|..#..', '/': '....#|....#|...#.|..#..|.#...|#....|#....',
  '+': '.....|..#..|..#..|#####|..#..|..#..|.....', '>': '#....|.#...|..#..|...#.|..#..|.#...|#....',
  '<': '....#|...#.|..#..|.#...|..#..|...#.|....#', '*': '.....|#.#.#|.###.|#####|.###.|#.#.#|.....',
  '_': '.....|.....|.....|.....|.....|.....|#####', ' ': '.....|.....|.....|.....|.....|.....|.....',
  '#': '.#.#.|#####|.#.#.|.#.#.|#####|.#.#.|.....', ',': '.....|.....|.....|.....|.##..|..#..|.#...',
  '%': '##..#|##.#.|...#.|..#..|.#...|#.##.|#..##', "'": '.##..|..#..|.#...|.....|.....|.....|.....',
};
// rows of a word in the 5x7 font, gap columns between letters
function wordRows(text, gap = 1) {
  const rows = Array.from({ length: 7 }, () => '');
  [...String(text).toUpperCase()].forEach((ch, n) => {
    const g = (F[ch] ?? F[' ']).split('|');
    for (let j = 0; j < 7; j++) rows[j] += (n ? '.'.repeat(gap) : '') + g[j];
  });
  return rows;
}
const wordCols = (text, gap = 1) => String(text).length * 5 + (String(text).length - 1) * gap;
// pixel word as rects. s = cell size.
const pword = (text, x, y, s, color, p = {}) => cells(wordRows(text, p.gap ?? 1).map((r) => r.replace(/#/g, 'a')), x, y, s, { a: color }, p.rect);
// stack lines of text into one row map (for blurring etc)
const stackRows = (words, gap = 1, lineGap = 2) => {
  const rs = [];
  words.forEach((w, n) => { if (n) for (let i = 0; i < lineGap; i++) rs.push(''); rs.push(...wordRows(w, gap)); });
  const W = Math.max(...rs.map((r) => r.length));
  return rs.map((r) => r.padEnd(W, '.'));
};
// ordered dither field: density(cx,cy) in 0..1 -> char c on '.' elsewhere
const dither = (cols, rows, density, c = 'a') => grid(cols, rows, (i, j) => (density(i / cols, j / rows, i, j) > bayer(i, j) ? c : '.'));
// small thin-frame corner marks
const plus = (x, y, size, color, w = 2) => [L(x - size, y, x + size, y, color, w), L(x, y - size, x, y + size, color, w)];

// sprites
const SPR = {
  invader: ['..#.....#..', '...#...#...', '..#######..', '.##.###.##.', '###########', '#.#######.#', '#.#.....#.#', '...##.##...'],
  heart: ['.###...###.', '#####.#####', '###########', '###########', '.#########.', '..#######..', '...#####...', '....###....', '.....#.....'],
  qmark: ['..#######..', '.#########.', '###.....###', '###.....###', '........###', '.......###.', '......###..', '.....###...', '.....###...', '...........', '.....###...', '.....###...'],
  boat: ['..........##............', '..........##............', '..........##............', '.......##########.......', '.......#.#.#.#.#.#.......', '.......##########.......', '.....##############.....', '..######################', '...####################.', '....##################..', '.....################...'],
  ghost: ['..#######..', '.#########.', '###########', '##..###..##', '#...###...#', '###########', '###########', '###########', '##.##.##.##', '#...#.#...#'],
  wizard: ['.......#.......', '......###......', '.....#####.....', '.....#####.....', '....#######....', '..###########..', '...#.......#...', '...#.##.##.#...', '...#.##.##.#...', '....#.....#....', '....#..#..#....', '.....#####.....', '....#######....', '...#########...', '..##.#####.##..', '..##.#####.##..', '.###.#####.###.', '.#...#####...#.', '....###.###....', '....###.###....', '...####.####...'],
};

const INK = '#111111';

// 1. Transit ticket with a pixel bird
const ticket = (() => {
  const Y = '#F4D20E';
  return tpl({
    id: 'pixel-ticket-bird', name: 'Pixel ticket', format: 'flyer', category: 'Event', tags: ['ticket', 'event', 'transit', 'bird', 'pass'],
    pages: [page('#E7E4DB', [
      rect(36, 36, 487, 722, Y, { radius: 46 }),
      // perforation notches
      circle(14, 330, 44, '#E7E4DB'), circle(501, 330, 44, '#E7E4DB'),
      L(70, 352, 489, 352, INK, 2, { dash: 'dash' }),
      T('Stop number', 72, 76, 200, { font: 'Space Mono', size: 12, upper: true, ls: 80, color: INK }),
      T('20', 72, 92, 200, { font: 'Archivo', size: 104, weight: 800, ls: -60, lh: 1, color: INK }),
      rect(290, 82, 193, 72, INK, { radius: 6 }),
      T('Lines on this stop', 302, 92, 170, { font: 'Space Mono', size: 10, upper: true, ls: 60, color: Y }),
      T('1  2  3  5', 302, 114, 170, { font: 'Silkscreen', size: 24, color: Y, ls: 40 }),
      T('Next stop', 72, 232, 200, { font: 'Space Mono', size: 12, upper: true, ls: 80, color: INK }),
      T('Ferry quay', 72, 252, 300, { font: 'Archivo', size: 26, weight: 700, ls: -10, upper: true, color: INK }),
      qr('https://example.com/stops/20', 392, 214, 92, INK, Y),
      T('Get the guide', 392, 308, 100, { font: 'Space Mono', size: 10, upper: true, ls: 60, color: INK }),
      T('Harbour\nroad', 72, 384, 420, { font: 'Archivo', size: 72, weight: 800, ls: -50, lh: 0.95, upper: true, color: INK }),
      T('Zone B', 72, 556, 200, { font: 'Space Mono', size: 12, upper: true, ls: 80, color: INK }),
      T('Step free', 72, 576, 200, { font: 'Space Mono', size: 12, upper: true, ls: 80, color: INK }),
      // wire and bird
      
      cells(SPR.boat, 190, 700 - 11 * 12 - 24, 12, { '#': INK }),
      cells(grid(34, 2, (i, j) => ((i + j) % 4 < 2 ? '#' : '.')), 76, 676, 12, { '#': INK }),
    ])],
  });
})();

// 2. Maze of blocks on a dotted ground
const maze = (() => {
  const LIME = '#C8F03A';
  const C = 32, R = 45, s = 35;
  const g = Array.from({ length: R }, () => Array(C).fill('.'));
  const fill = (c0, r0, c1, r1) => { for (let j = r0; j <= r1; j++) for (let i = c0; i <= c1; i++) g[j][i] = '#'; };
  fill(1, 1, 22, 5); fill(11, 5, 18, 12); fill(11, 12, 30, 17); fill(25, 17, 30, 23);
  fill(5, 23, 30, 29); fill(5, 29, 10, 38); fill(5, 38, 15, 42);
  fill(0, 14, 5, 17); fill(2, 8, 4, 10); fill(21, 8, 24, 9); fill(14, 33, 17, 34);
  fill(19, 33, 30, 43);
  const rows = g.map((r) => r.join(''));
  return tpl({
    id: 'pixel-maze-poster', name: 'Maze poster', format: 'poster', category: 'Event', tags: ['maze', 'poster', 'festival', 'walk', 'tour'],
    pages: [page(pattern('dots', '#111111', LIME, 0.9), [
      cells(rows, 0, 0, s, { '#': INK }),
      T('WALK TO', 66, 66, 700, { font: 'Oxanium', size: 104, weight: 300, ls: 20, color: LIME }),
      T('A walking tour of the\nold harbour, nine stops,\nno map.', 402, 232, 250, { font: 'Space Mono', size: 15, lh: 1.5, color: LIME }),
      T('THE SEA', 198, 872, 900, { font: 'Oxanium', size: 150, weight: 300, ls: 10, color: LIME }),
      T('Saturday 14 June\n10:00, ferry quay\nFree, bring shoes', 190, 1060, 190, { font: 'Space Mono', size: 15, lh: 1.55, color: LIME }),
      // route diagram
      ...(() => {
        const pts = [[720, 1190], [800, 1190], [800, 1260], [900, 1260], [900, 1190], [1000, 1190], [1000, 1330], [880, 1330], [880, 1420]];
        const out = [];
        for (let i = 1; i < pts.length; i++) out.push(L(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], LIME, 3));
        pts.forEach(([x, y], n) => out.push(circle(x - 11, y - 11, 22, INK, { stroke: stroke(LIME, 3) }), n === pts.length - 1 ? circle(x - 5, y - 5, 10, LIME) : null));
        return out;
      })(),
      T('Nine stops', 700, 1475, 300, { font: 'Space Mono', size: 13, upper: true, ls: 120, color: LIME }),
      ...plus(1060, 1540, 8, LIME, 2), ...plus(700, 1540, 8, LIME, 2), ...plus(1060, 1182, 8, LIME, 2),
      ...Array.from({ length: 9 }, (_, i) => L(60, 1100 + i * 34, 80, 1100 + i * 34, INK, 2)),
      pword('HARBOUR WALKS', 80, 1530, 4, INK),
    ])],
  });
})();

// 3. Giant face on teal with a pink header
const face = (() => {
  const TEAL = '#2EB89B', PINK = '#F8B3D1';
  const rows = [
    '...............', '.#####...#####.', '.#...#...#...#.', '.#.#.#...#.#.#.', '.#...#...#...#.', '.#####...#####.', '...............',
    '.......#.......', '......##.......', '.......#.......', '...............', '.#...........#.', '..#.........#..', '...#########...',
  ];
  return tpl({
    id: 'pixel-face-poster', name: 'Face poster', format: 'poster', category: 'Event', tags: ['face', 'theatre', 'season', 'poster', 'program'],
    pages: [page(TEAL, [
      rect(0, 0, 1123, 330, PINK),
      T('Spring season 2026', 70, 62, 600, { font: 'Archivo', size: 22, weight: 700, upper: true, ls: 140, color: INK }),
      T('The Little\nTheatre', 70, 108, 900, { font: 'Gloock', size: 112, lh: 0.95, ls: -20, color: INK }),
      T('Tickets and the full\nprogramme at littletheatre.org', 760, 112, 300, { font: 'Archivo', size: 20, weight: 500, lh: 1.35, color: INK }),
      cells(rows, 70, 395, 66, { '#': INK }),
      L(70, 1460, 1053, 1460, INK, 2),
      T('Six plays\nfour weeks', 70, 1482, 400, { font: 'Archivo', size: 26, weight: 700, lh: 1.15, color: INK }),
      T('Fri to Sun\n19:30, Sun 15:00', 500, 1482, 300, { font: 'Archivo', size: 26, weight: 500, lh: 1.15, color: INK }),
      T('Church Street 4\nBox office 10 to 16', 800, 1482, 260, { font: 'Archivo', size: 26, weight: 500, lh: 1.15, color: INK }),
    ])],
  });
})();

// 4. Eye that dissolves into pixels
const eye = (() => {
  const BLUE = '#1F18E6', BL = '#10102A';
  const r = rng(11);
  const C = 36, R = 36, cx = 17.5, cy = 17.5;
  const rows = grid(C, R, (i, j) => {
    const x = i - cx, y = j - cy;
    const lid = 8.5 * Math.pow(Math.max(0, 1 - Math.pow(x / 17, 2)), 0.75);
    const d = Math.hypot(x, y);
    const inEye = Math.abs(y) <= lid;
    if (d < 3.4) return 'k';
    if (d < 7 && inEye) return r() < 0.8 ? 'b' : (r() < 0.5 ? 'k' : '.');
    if (inEye && Math.abs(Math.abs(y) - lid) < 1.2) return r() < 0.85 ? 'k' : 'b';
    const out = Math.max(0, 1 - Math.hypot(x / 20, y / 14));
    if (!inEye && r() < out * 0.85) return r() < 0.55 ? 'b' : 'k';
    return '.';
  });
  return tpl({
    id: 'pixel-eye-mosaic', name: 'Eye mosaic', format: 'post', category: 'Event', tags: ['eye', 'film', 'festival', 'mosaic', 'blue'],
    pages: [page('#FFFFFF', [
      cells(rows, 0, 0, 30, { b: BLUE, k: BL }),
      T('Short Film Night', 60, 1118, 960, { font: 'Space Grotesk', size: 62, weight: 300, ls: 120, color: INK }),
      T('Saturday 8 November, 19:00, the old swimming hall', 60, 1204, 700, { font: 'Space Grotesk', size: 22, weight: 500, color: INK }),
      T('Eleven films under twenty minutes. Doors at 18:00,\nentry on the door, soup in the interval.', 60, 1256, 700, { font: 'Space Grotesk', size: 18, weight: 400, lh: 1.45, color: '#555' }),
      ...plus(990, 1230, 14, BLUE, 3),
    ])],
  });
})();

// 5. Hourglass story
const hourglass = (() => {
  const BLU = '#2A22D6';
  const C = 27, R = 32;
  const cx = 13;
  const hw = (j) => (j < 16 ? Math.max(1, 10 - Math.floor(j * 0.62)) : Math.max(1, 10 - Math.floor((31 - j) * 0.62)));
  const rows = grid(C, R, (i, j) => {
    const d = Math.abs(i - cx), h = hw(j);
    if (j === 0 || j === R - 1) return d <= 12 ? 'b' : '.';
    if (d === h || d === h + 1) return 'b';
    if (d < h) {
      if (j >= 15 && j <= 17) return d === 0 ? 'b' : '.';
      if (j >= 7 && j <= 14) return (i + j) % 2 === 0 ? 'b' : '.';
      if (j > 17 && d === 0 && j < 31 - Math.max(0, 8 - 0)) return 'b';
      if (j > 17 && j >= 31 - Math.max(0, 8 - Math.floor(d * 0.75))) return 'b';
    }
    return '.';
  });
  return tpl({
    id: 'pixel-hourglass-story', name: 'Hourglass story', format: 'story', category: 'Event', tags: ['hourglass', 'timer', 'story', 'pitch', 'countdown'],
    pages: [page('#FFFFFF', [
      T('Pitch night', 54, 62, 500, { font: 'Space Mono', size: 20, weight: 700, upper: true, ls: 100, color: BLU }),
      T('Thu 21 Nov\n18:30', 760, 62, 270, { font: 'Space Mono', size: 20, weight: 700, upper: true, ls: 100, lh: 1.3, color: BLU, align: 'right' }),
      cells(rows, 54 + 0, 220, 36, { b: BLU }),
      T('Three minutes\non the clock', 54, 1440, 972, { font: 'Archivo', size: 104, weight: 800, ls: -50, lh: 0.95, color: BLU }),
      T('Eight founders, one slide each, a bell that does not care.\nCome and heckle kindly.', 54, 1680, 560, { font: 'Archivo', size: 28, weight: 500, lh: 1.3, color: BLU }),
      T('Studio 4, Kungsgatan 12', 54, 1830, 600, { font: 'Space Mono', size: 20, weight: 700, upper: true, ls: 80, color: BLU }),
    ])],
  });
})();

// 6. Pixel mask over a portrait
const maskPortrait = (() => {
  const LIME = '#D6F23A';
  const mask = ['..#.....#..', '...#...#...', '..#######..', '.##.###.##.', '###########', '#.#######.#', '#.#.....#.#', '...##.##...'];
  return tpl({
    id: 'pixel-mask-portrait', name: 'Pixel mask cover', format: 'post', category: 'Social', tags: ['portrait', 'mask', 'podcast', 'cover', 'photo', 'issue'],
    pages: [page('#9A9A97', [
      img('photos/portrait.jpg', 0, 0, 1080, 1350, { filters: { saturation: -100, contrast: 25, brightness: -6 } }),
      cells(mask, 262, 360, 50, { '#': LIME }),
      rect(594, 510, 48, 48, '#111111'),
      T('Pieces', 40, 1000, 1000, { font: 'Bricolage Grotesque', size: 290, weight: 800, ls: -60, lh: 0.9, color: LIME }),
      T('Vol. 116', 740, 62, 300, { font: 'Space Mono', size: 22, weight: 700, upper: true, ls: 100, color: LIME, align: 'right' }),
      L(40, 1305, 1040, 1305, LIME, 2),
      T('Eleven conversations with people who make things in public.', 40, 1318, 700, { font: 'Space Grotesk', size: 19, weight: 500, color: LIME }),
    ])],
  });
})();

// 7. Focus pull: three lines of type, crisp to blurred, as pixel cells
const focusPull = (() => {
  const u = 3;
  const base = stackRows(['OPEN', 'LENS', '2026'], 1, 2);
  const W = base[0].length * u, H = base.length * u;
  const v = Array.from({ length: H }, (_, j) => Array.from({ length: W }, (_, i) => (base[Math.floor(j / u)][Math.floor(i / u)] === '#' ? 1 : 0)));
  const lineH = 9 * u;
  const out = grid(W, H, (i, j) => {
    const line = Math.floor(j / lineH);
    const r = [0, 1, 2][Math.min(2, line)];
    let sum = 0, n = 0;
    for (let b = -r; b <= r; b++) for (let a = -r; a <= r; a++) { const y = j + b, x = i + a; if (y >= 0 && y < H && x >= 0 && x < W) { sum += v[y][x]; n++; } }
    const m = sum / (n || 1) * (r === 2 ? 1.25 : 1);
    return m > 0.8 ? 'a' : m > 0.55 ? 'b' : m > 0.38 ? 'c' : m > 0.22 ? 'd' : m > 0.1 ? 'e' : '.';
  });
  const s = 16;
  const x0 = Math.floor((1123 - W * s) / 2);
  return tpl({
    id: 'pixel-focus-pull', name: 'Focus pull poster', format: 'poster', category: 'Event', tags: ['blur', 'photography', 'festival', 'type', 'exhibition'],
    pages: [page('#0A0A0A', [
      cells(out, x0, 100, s, { a: '#FFFFFF', b: '#D2D2D2', c: '#9C9C9C', d: '#6A6A6A', e: '#3A3A3A' }),
      T('Open Lens is a festival of photographs\nthat are not quite in focus.', 60, 1440, 520, { font: 'Space Grotesk', size: 22, weight: 500, lh: 1.35, color: '#FFFFFF' }),
      T('3 to 24 May\nHall 7, Frihamnen', 680, 1440, 380, { font: 'Space Grotesk', size: 22, weight: 500, lh: 1.35, color: '#FFFFFF', align: 'right' }),
      L(60, 1418, 1063, 1418, '#FFFFFF', 1),
      overlay('tex/film-grain.jpg', 1123, 1587, 'screen', 0.18),
    ])],
  });
})();

// 8. Bitmap word between dither strips
const zine = (() => {
  const s = 44, x0 = 34;
  const strip = (flip) => dither(72, 5, (u, v) => (flip ? 1 - v : v) * 1.1 - 0.02 + 0.0 * u);
  const wrow = (t) => wordRows(t, 1).map((r) => r.replace(/#/g, 'a'));
  const inv = wordRows('FAIR', 1).map((r) => r.replace(/#/g, 'k').replace(/\./g, 'a'));
  return tpl({
    id: 'pixel-bitmap-word', name: 'Bitmap word', format: 'square', category: 'Social', tags: ['zine', 'fair', 'dither', 'bitmap', 'type', 'market'],
    pages: [page('#0B0B0B', [
      cells(strip(false), 0, 0, 15, { a: '#F4F4F0' }),
      cells(wrow('ZINE'), x0, 130, s, { a: '#F4F4F0' }),
      rect(x0 - 22, 130 + 7 * s + 22, 1080 - 2 * (x0 - 22), 7 * s + 44, '#F4F4F0'),
      cells(inv, x0, 130 + 7 * s + 44, s, { k: '#0B0B0B' }),
      cells(strip(true), 0, 1080 - 75, 15, { a: '#F4F4F0' }),
      T('Sat 22 March\nHall 3, Frihamnen', 34, 868, 300, { font: 'Space Mono', size: 19, weight: 700, lh: 1.4, upper: true, ls: 40, color: '#F4F4F0' }),
      T('Forty tables of things\nprinted, stapled and\nfolded by hand.', 400, 868, 340, { font: 'Space Mono', size: 17, lh: 1.5, color: '#F4F4F0' }),
      T('Free entry\nDoors 11 to 17', 790, 868, 256, { font: 'Space Mono', size: 19, weight: 700, lh: 1.4, upper: true, ls: 40, color: '#F4F4F0', align: 'right' }),
    ])],
  });
})();

// 9. Yellow block that dissolves upward, over a grey photo
const dissolve = (() => {
  const YEL = '#F6DD0C';
  const r = rng(5);
  const s = 29, C = 30, x0 = 124, y0 = 640;
  let h = 5;
  const rows = Array.from({ length: 10 }, () => Array(C).fill('.'));
  for (let i = 0; i < C; i++) {
    h = Math.max(1, Math.min(9, h + Math.round((r() - 0.5) * 5)));
    for (let k = 1; k <= h; k++) if (r() < 1 - (k / (h + 2)) * 0.7) rows[10 - k][i] = 'y';
  }
  const bars = [];
  let bx = 0;
  while (bx < 210) { const w = 2 + Math.floor(r() * 4); bars.push(rect(x0 + 40 + bx, 1240, w, 44, '#111111')); bx += w + 2 + Math.floor(r() * 4); }
  return tpl({
    id: 'pixel-dissolve-block', name: 'Dissolving block', format: 'poster', category: 'Business', tags: ['catalogue', 'photo', 'yellow', 'block', 'barcode', 'release'],
    pages: [page('#222', [
      img('photos/city.jpg', 0, 0, 1123, 1587, { filters: { saturation: -100, contrast: 30, brightness: -8 } }),
      cells(rows.map((x) => x.join('')), x0, y0 - 10 * s, s, { y: YEL }),
      rect(x0, y0, 883, 700, YEL),
      T('Catalogue 04', x0 + 40, y0 + 36, 400, { font: 'Space Mono', size: 17, weight: 700, upper: true, ls: 100, color: INK }),
      T('Autumn and winter', x0 + 560, y0 + 36, 283, { font: 'Space Mono', size: 17, weight: 700, upper: true, ls: 100, color: INK, align: 'right' }),
      T('Small\nbatch\nmakers', x0 + 36, y0 + 110, 800, { font: 'Archivo', size: 138, weight: 800, ls: -60, lh: 0.88, color: INK }),
      T('Thirty six pages of things made in\nruns of fifty or fewer.', x0 + 40, y0 + 530, 520, { font: 'Space Grotesk', size: 21, weight: 500, lh: 1.35, color: INK }),
      ...bars,
      T('No. 0004\nSwedish edition', x0 + 560, y0 + 600, 283, { font: 'Space Mono', size: 14, lh: 1.45, color: INK, align: 'right' }),
    ])],
  });
})();

// 10. Pixel ribbon that winds down the page
const ribbon = (() => {
  const r = rng(21);
  const s = 26, C = 43, R = 61;
  const pal = ['a', 'b', 'c', 'd'];
  const rows = grid(C, R, (i, j) => {
    const cx = 21 + 8 * Math.sin((j / R) * Math.PI * 2.3 + 0.7);
    const w = 5.4 + 1.6 * Math.sin(j / 7);
    const d = Math.abs(i - cx);
    if (d > w) return '.';
    if (d > w - 1.3 && r() < 0.5) return '.';
    const k = Math.floor((j * 0.9 + i * 0.7) / 5);
    return pal[((k % 4) + 4) % 4];
  });
  return tpl({
    id: 'pixel-ribbon-poster', name: 'Ribbon poster', format: 'poster', category: 'Event', tags: ['ribbon', 'music', 'release', 'mosaic', 'colour'],
    pages: [page('#EFEBE1', [
      cells(rows, 2, 0, s, { a: '#2F5BE8', b: '#F2B90D', c: '#E5412D', d: '#17171A' }),
      T('Slow\nCurrent', 56, 60, 560, { font: 'Bricolage Grotesque', size: 96, weight: 700, ls: -50, lh: 0.9, color: INK }),
      T('A record in nine\nlong movements', 56, 270, 300, { font: 'Space Grotesk', size: 22, weight: 500, lh: 1.3, color: INK }),
      T('Out 14 February\non vinyl and tape', 56, 1380, 300, { font: 'Space Grotesk', size: 22, weight: 500, lh: 1.3, color: INK }),
      pword('SIDE A', 56, 1480, 5, INK),
      pword('SIDE B', 56, 1520, 5, '#E5412D'),
    ])],
  });
})();

// 11. Four page carousel: big pixel numerals
const numbers = (() => {
  const P = [
    { bg: '#0D0D0D', fg: '#D4F23A', ink: '#D4F23A', n: '1', t: 'Ask early', b: 'Most problems are cheaper in week one than in week ten.' },
    { bg: '#F5D50D', fg: '#111111', ink: '#111111', n: '2', t: 'Ship small', b: 'A thing in someone\'s hands teaches more than a plan.' },
    { bg: '#2A22D6', fg: '#FFFFFF', ink: '#FFFFFF', n: '3', t: 'Write it down', b: 'Memory is a poor filing cabinet. Use a real one.' },
    { bg: '#F8B7D2', fg: '#111111', ink: '#111111', n: '4', t: 'Rest on purpose', b: 'The best ideas of the year came on a Sunday walk.' },
  ];
  const digit = (n) => wordRows(n).map((r) => r.replace(/#/g, 'a'));
  const body = (p, x, y, w) => T(p.b, x, y, w, { font: 'Space Grotesk', size: 26, weight: 500, lh: 1.3, color: p.ink });
  const head = (p, x, y, size) => T(p.t, x, y, 940, { font: 'Bricolage Grotesque', size, weight: 700, ls: -40, lh: 0.95, color: p.ink });
  const layouts = [
    (p) => [cells(digit(p.n), 70, 130, 112, { a: p.fg }), head(p, 70, 960, 120), body(p, 70, 1130, 600)],
    (p) => [cells(digit(p.n), 330, -190, 150, { a: p.fg }), head(p, 70, 880, 140), body(p, 70, 1100, 520)],
    (p) => [head(p, 70, 130, 120), cells(digit(p.n), 70, 330, 120, { a: p.fg }), body(p, 70, 1190, 600)],
    (p) => [head(p, 70, 130, 130), cells(digit(p.n), 70, 440, 100, { a: p.fg }), body(p, 640, 880, 360)],
  ];
  return tpl({
    id: 'pixel-numeral-carousel', name: 'Numeral carousel', format: 'post', category: 'Social', tags: ['carousel', 'numbers', 'tips', 'lessons', 'series'],
    pages: P.map((p, i) => page(p.bg, [
      layouts[i](p),
      pword('FIRST YEAR', 70, 62, 5, p.ink),
      pword(`${i + 1}/4`, 1010 - 5 * 5 * 3 - 10, 62, 5, p.ink),
      L(70, 1290, 1010, 1290, p.ink, 2),
      T('Notes from a first year in business', 70, 1305, 700, { font: 'Space Mono', size: 15, upper: true, ls: 80, color: p.ink }),
    ])),
  });
})();

// 12. Arcade night
const arcade = (() => {
  const BG = '#0F1B15', G = '#A6E8B8', DIM = '#4C7A5C';
  const crab = ['..#.....#..', '#..#...#..#', '#.#######.#', '###.###.###', '###########', '.#########.', '..#.....#..', '.#.......#.'];
  const squid = ['...##...', '..####..', '.######.', '##.##.##', '########', '..#..#..', '.#.##.#.', '#.#..#.#'];
  const ship = ['......#......', '.....###.....', '.....###.....', '.###########.', '#############', '#############'];
  const out = [];
  const s = 9;
  const types = [squid, crab, invaderRows(), crab, squid];
  function invaderRows() { return SPR.invader; }
  for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) {
    const spr = [squid, crab, crab, SPR.invader][r];
    out.push(cells(spr, 100 + c * 124, 250 + r * 100, s, { '#': r === 0 ? '#E8F8B0'.replace('#E8F8B0', G) : G }));
  }
  const barrier = ['..########..', '.##########.', '############', '####....####', '###......###'];
  return tpl({
    id: 'pixel-game-night', name: 'Game night poster', format: 'poster', category: 'Event', tags: ['arcade', 'game', 'night', 'retro', 'party'],
    pages: [page(BG, [
      pword('SCORE 0000', 60, 60, 4, G),
      pword('HI 9999', 800, 60, 4, G),
      out,
      cells(barrier, 130, 1000, 12, { '#': DIM }), cells(barrier, 480, 1000, 12, { '#': DIM }), cells(barrier, 830, 1000, 12, { '#': DIM }),
      cells(ship, 530, 1170, 8, { '#': G }),
      rect(566, 1090, 8, 60, G),
      T('Game night', 60, 1290, 1000, { font: 'Press Start 2P', size: 68, color: G }),
      L(60, 1400, 1063, 1400, DIM, 2),
      T('Friday 6 December, 20:00', 60, 1425, 560, { font: 'Press Start 2P', size: 16, lh: 1.8, color: G }),
      T('Bar Jetons, Rörstrandsgatan 9\nFree play, tokens on the house', 60, 1470, 700, { font: 'Space Mono', size: 17, lh: 1.5, color: DIM.replace('#4C7A5C', '#7DB890') }),
      T('INSERT COIN', 780, 1436, 283, { font: 'Press Start 2P', size: 16, color: G, align: 'right' }),
      overlay('tex/film-grain.jpg', 1123, 1587, 'screen', 0.12),
    ])],
  });
})();

// 13. Falling blocks story
const falling = (() => {
  const col = { I: '#2EB8E6', O: '#F4C20D', T: '#9B4FD6', S: '#35B562', Z: '#E8412E', J: '#2A3FD6', L: '#F28A1C' };
  const board = [
    '....SS....', '...SS.....', '..........', '..........', '..........', '..........', '..........', '....T.....', '...TTT....', '..........', '..........',
    '.I........', '.I..OO..L.', '.I..OO..L.', '.IJJJ.ZLL.', '.OOJ.ZZSS.', '.OOTTTZSSL', 'IIIITTZZSL', 'OOLLJ.ZZLL', 'OOLJJJTSSL', 'ZZZ.JJTTSS',
  ];
  return tpl({
    id: 'pixel-falling-blocks', name: 'Falling blocks story', format: 'story', category: 'Social', tags: ['tetris', 'blocks', 'welcome', 'story', 'game'],
    pages: [page('#F6F3EA', [
      cells(board, 1080 - 10 * 70 - 30, 1920 - board.length * 70 - 30, 70, col),
      ...Array.from({ length: 9 }, (_, i) => L(1080 - 10 * 70 - 30 + 35 + i * 0, 0, 0, 0, '#000', 0)).slice(0, 0),
      T('Welcome\nback to\nthe term', 60, 150, 980, { font: 'Instrument Serif', size: 190, ls: -30, lh: 0.9, color: INK }),
      T('New course rooms, a new timetable and the same bad coffee. First lectures begin Monday 6 January.', 60, 760, 460, { font: 'Space Grotesk', size: 26, weight: 500, lh: 1.35, color: INK }),
      T('Start of term\nQuad B', 60, 1740, 380, { font: 'Space Mono', size: 18, weight: 700, upper: true, ls: 80, lh: 1.5, color: INK }),
    ])],
  });
})();

// 14. Annual report numerals
const numerals = (() => {
  const W = '#F2F2EE', Gy = '#8A8A86';
  const dig = (t) => wordRows(t, 1).map((r) => r.replace(/#/g, 'a'));
  return tpl({
    id: 'pixel-annual-numerals', name: 'Annual report poster', format: 'poster', category: 'Business', tags: ['annual report', 'numbers', 'year', 'black', 'report'],
    pages: [page('#080808', [
      cells(dig('20'), 56, 56, 64, { a: W }),
      cells(dig('26'), 56, 56 + 9 * 64 - 0, 64, { a: W }),
      T('Annual report\nof a very\nsmall company', 800, 60, 270, { font: 'Space Grotesk', size: 22, weight: 500, lh: 1.3, color: W }),
      T('01 People\n02 Money\n03 Mistakes\n04 Next', 800, 330, 270, { font: 'Space Mono', size: 17, lh: 1.7, color: Gy }),
      T('Revenue\n4.2 million kr', 800, 560, 270, { font: 'Space Grotesk', size: 22, weight: 500, lh: 1.3, color: W }),
      T('Staff\n7, one of them part time', 800, 700, 270, { font: 'Space Grotesk', size: 22, weight: 500, lh: 1.3, color: W }),
      T('Coffee machines\n2, one broken', 800, 840, 270, { font: 'Space Grotesk', size: 22, weight: 500, lh: 1.3, color: W }),
      L(56, 1230, 1067, 1230, W, 1),
      T('This was the year we stopped\nmeasuring everything and started\nmeasuring the three things that\nmatter.', 56, 1260, 480, { font: 'Space Grotesk', size: 24, weight: 500, lh: 1.35, color: W }),
      T('Contents\n\n03  Letter from the founders\n09  The numbers, plainly\n14  What we got wrong\n22  What we are building', 620, 1260, 440, { font: 'Space Mono', size: 15, lh: 1.7, color: Gy }),
      T('Printed in an edition of 300', 56, 1520, 500, { font: 'Space Mono', size: 13, upper: true, ls: 100, color: Gy }),
    ])],
  });
})();

// 15. Pixel wizard on red
const wizard = (() => {
  const RED = '#E8412E';
  const rows = [
    '.......y.......', '......hhh......', '.....hhhhh.....', '.....hyhhh.....', '....hhhhhhh....', '...hhhhhhhhh...', '.hhhhhhhhhhhhh.',
    '...sssssssss...', '...sksssssks...', '...sssssssss...', '..wwwwwwwwwww..', '..wwwwwwwwwww..', '...wwwwwwwww...', '....wwwwwww....',
    '...rrrwwwrrr...', '..rrrrrwrrrrr..', '.srrrrrrrrrrrs.', '.srrrrrrrrrrrs.', '..rrrrrrrrrrr..', '..rrrrrrrrrrr..', '..rrrr...rrrr..', '..bbb.....bbb..',
  ];
  return tpl({
    id: 'pixel-wizard-poster', name: 'Press start poster', format: 'poster', category: 'Event', tags: ['wizard', 'game', 'museum', 'exhibition', 'red', 'hero'],
    pages: [page(RED, [
      cells(rows, 304, 250, 34, { h: '#5B34B0', y: '#FFE14A', s: '#F6C9A0', k: '#111111', w: '#FFFFFF', r: '#2B3FD6', b: '#111111' }),
      T('The Toy Museum', 64, 64, 600, { font: 'Archivo', size: 22, weight: 700, upper: true, ls: 140, color: '#FFFFFF' }),
      T('Autumn show', 600, 64, 459, { font: 'Archivo', size: 22, weight: 700, upper: true, ls: 140, color: '#FFFFFF', align: 'right' }),
      T('Press\nstart', 56, 1010, 1100, { font: 'Archivo', size: 236, weight: 900, ls: -40, lh: 0.82, color: '#FFFFFF' }),
      T('Sixty games from the first arcades to the last cartridges, all of them playable.', 64, 1490, 640, { font: 'Archivo', size: 22, weight: 500, lh: 1.3, color: '#FFFFFF' }),
      T('Open daily 10 to 18\nSkeppsbron 12', 760, 1490, 299, { font: 'Archivo', size: 22, weight: 700, lh: 1.3, color: '#FFFFFF', align: 'right' }),
    ])],
  });
})();

// 16. Dot matrix pear with a colour strip
const pear = (() => {
  const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const mix = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');
  const C = 22, R = 30, gap = 30, x0 = 232, y0 = 240;
  const dots = [];
  for (let j = 0; j < R; j++) for (let i = 0; i < C; i++) {
    const body = Math.pow((i - 10.5) / 9.6, 2) + Math.pow((j - 20) / 9.6, 2) <= 1;
    const neck = Math.pow((i - 10.5) / 5.2, 2) + Math.pow((j - 10) / 8.6, 2) <= 1;
    const stem = i >= 10 && i <= 11 && j >= 0 && j <= 3;
    if (!(body || neck || stem)) continue;
    let c;
    if (stem) c = '#6A4A2A';
    else {
      const sh = Math.min(1, Math.max(0, ((i - 4) / 14) * 0.8 + ((j - 4) / 26) * 0.2));
      c = mix('#D3E25A', '#5E8F2A', sh);
      if (Math.hypot(i - 7, j - 17) < 2.2) c = mix(c, '#F3F7B8', 0.7);
    }
    dots.push(circle(x0 + i * gap, y0 + j * gap, 24, c));
  }
  const sw = ['#EAF08A', '#D3E25A', '#A9C43E', '#7FA832', '#5E8F2A', '#3F6B22'];
  return tpl({
    id: 'pixel-dot-pear', name: 'Dot matrix colour poster', format: 'poster', category: 'Business', tags: ['dots', 'fruit', 'colour', 'palette', 'poster', 'dot matrix'],
    pages: [page('#EFECE3', [
      T('Colour of\nthe month', 64, 64, 400, { font: 'Archivo', size: 40, weight: 700, ls: -20, lh: 1, color: '#D6362B' }),
      T('Studio Almanac', 64, 168, 400, { font: 'Archivo', size: 40, weight: 700, ls: -20, lh: 1, color: '#D6362B' }),
      dots,
      ...sw.map((c, i) => rect(64 + i * 60, 1340, 60, 60, c)),
      T('Pear, 06 to 03', 64, 1420, 400, { font: 'Space Mono', size: 15, weight: 700, upper: true, ls: 60, color: INK }),
      T('Ripe fruit is never one colour. This month\nwe look at the six that make a pear.', 64, 1460, 500, { font: 'Space Mono', size: 14, lh: 1.5, color: INK }),
      T('Issue 11\nOctober', 760, 1340, 299, { font: 'Space Mono', size: 15, weight: 700, lh: 1.5, upper: true, ls: 60, color: INK, align: 'right' }),
    ])],
  });
})();

// 17. Crossing LED tile strips
const led = (() => {
  const c = 14, sw = 126;
  const lit = (text, x, y, fill, vertical) => {
    let r = wordRows(text, 1).map((s) => s.replace(/#/g, 'a'));
    if (vertical) r = Array.from({ length: r[0].length }, (_, i) => r.map((row) => row[i]).reverse().join('')).reverse().map((s) => s);
    const out = [];
    r.forEach((row, j) => [...row].forEach((ch, i) => { if (ch === 'a') out.push(circle(x + i * c + 1, y + j * c + 1, c - 2, fill)); }));
    return out;
  };
  const vert = (text, x, y, fill) => {
    // rotate the glyph rows a quarter turn so the word reads downward
    const r = wordRows(text, 1);
    const cols = r[0].length;
    const rot = Array.from({ length: cols }, (_, i) => r.map((row) => row[i]).reverse().join(''));
    const out = [];
    rot.forEach((row, j) => [...row].forEach((ch, i) => { if (ch === '#') out.push(circle(x + i * c + 1, y + j * c + 1, c - 2, fill)); }));
    return out;
  };
  return tpl({
    id: 'pixel-led-strips', name: 'LED strips poster', format: 'poster', category: 'Event', tags: ['led', 'market', 'dot matrix', 'strips', 'festival', 'night'],
    pages: [page('#E4E3DE', [
      rect(180, 0, sw, 1587, '#111111'), vert('FOOD', 180 + 14, 345, '#F2B90D'), vert('MUSIC', 180 + 14, 905, '#F2B90D'),
      rect(830, 0, sw, 1587, '#E8412E'), vert('SEPT', 830 + 14, 345, '#FFFFFF'), vert('12-14', 830 + 14, 905, '#FFFFFF'),
      rect(0, 190, 1123, sw, '#2A3FD6'), lit('NIGHT MARKET', 42, 204, '#FFFFFF'),
      rect(0, 760, 1123, sw, '#F2B90D'), lit('EVERY FRIDAY', 42, 774, '#111111'),
      rect(0, 1310, 1123, sw, '#111111'), lit('OPEN LATE', 42, 1324, '#FFFFFF'),
      T('Harbour Square\n17:00 to 23:00', 336, 380, 440, { font: 'Space Grotesk', size: 28, weight: 600, lh: 1.25, color: INK }),
      T('Free to walk in.\nStalls, grills and a\nstage by the water.', 336, 960, 440, { font: 'Space Grotesk', size: 28, weight: 600, lh: 1.25, color: INK }),
    ])],
  });
})();

// 18. Stepped pixel frame, hard shadow headline, info blocks
const frameP = (() => {
  const BLU = '#2B3FD6', CREAM = '#FFF3D4', PINK = '#F6B1E2', YEL = '#FFE24A';
  const C = 31, R = 44, s = 36;
  const r = rng(8);
  const edge = (n) => { const a = []; let d = 3; for (let i = 0; i < n; i++) { if (r() < 0.1) d = Math.max(2, Math.min(5, d + (r() < 0.5 ? -1 : 1))); a.push(d); } return a; };
  const top = edge(C), bot = edge(C), lef = edge(R), rig = edge(R);
  const rows = grid(C, R, (i, j) => (j < top[i] || j >= R - bot[i] || i < lef[j] || i >= C - rig[j] ? 'b' : '.'));
  return tpl({
    id: 'pixel-green-frame', name: 'Stepped frame poster', format: 'poster', category: 'Event', tags: ['frame', 'open studios', 'graduate show', 'event', 'info'],
    pages: [page(CREAM, [
      cells(rows, 3, 0, s, { b: BLU }),
      T('Graduate show 2026', 200, 215, 800, { font: 'Archivo', size: 22, weight: 700, upper: true, ls: 140, color: INK }),
      T('Open\nStudios', 196, 270, 900, { font: 'Archivo', size: 176, weight: 900, ls: -40, lh: 0.84, color: YEL }),
      rect(200, 850, 340, 290, PINK), rect(583, 850, 340, 290, PINK),
      T('Preview evening', 222, 872, 300, { font: 'Archivo', size: 26, weight: 800, color: INK }),
      T('Thursday 28 May\n17:00 to 21:00\nDrinks and a first look', 222, 922, 300, { font: 'Archivo', size: 21, weight: 500, lh: 1.4, color: INK }),
      T('Open days', 605, 872, 300, { font: 'Archivo', size: 26, weight: 800, color: INK }),
      T('Friday 29 May to\nSunday 31 May\n11:00 to 17:00', 605, 922, 300, { font: 'Archivo', size: 21, weight: 500, lh: 1.4, color: INK }),
      T('Where to find us', 200, 1190, 400, { font: 'Archivo', size: 22, weight: 800, color: INK }),
      T('The Old Print Works\n12 Mill Street\nstudios.example.org', 200, 1228, 400, { font: 'Archivo', size: 21, weight: 500, lh: 1.4, color: INK }),
      qr('https://example.org/studios', 840, 1190, 84, INK, CREAM),
    ])],
  });
})();

// 19. Cursor business card, two sides
const cursorCard = (() => {
  const LIME = '#D4F23A';
  const cur = ['#.........', '##........', '###.......', '####......', '#####.....', '######....', '#######...', '########..', '#########.', '#####.....', '##.##.....', '#..##.....', '...##.....', '....##....', '....##....'];
  return tpl({
    id: 'pixel-cursor-card', name: 'Cursor business card', format: 'card', category: 'Business', tags: ['business card', 'designer', 'developer', 'cursor', 'lime'],
    pages: [
      page(LIME, [
        cells(cur, 640, 90, 30, { '#': INK }),
        T('Mira\nLindqvist', 60, 70, 520, { font: 'Archivo', size: 88, weight: 800, ls: -50, lh: 0.92, color: INK }),
        T('Interface designer', 60, 300, 400, { font: 'Space Mono', size: 20, weight: 700, upper: true, ls: 80, color: INK }),
        pword('PLAY', 60, 560, 6, INK),
      ]),
      page(INK, [
        T('mira@lindqvist.example\n+46 70 123 45 67\nlindqvist.example', 60, 70, 520, { font: 'Space Mono', size: 26, lh: 1.6, color: LIME }),
        L(60, 330, 944, 330, LIME, 2),
        T('Product interfaces,\ndesign systems and\nthe odd game.', 60, 360, 520, { font: 'Archivo', size: 34, weight: 600, lh: 1.2, color: '#FFFFFF' }),
        qr('https://lindqvist.example', 784, 70, 160, LIME, INK),
        cells(['#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#.#'], 60, 584, 18, { '#': LIME }),
      ]),
    ],
  });
})();

// 20. Quarterly review deck
const deck = (() => {
  const CR = '#F3EFE4', OR = '#FF5A1F';
  const mono = (t, x, y, w, color, p = {}) => T(t, x, y, w, { font: 'Space Mono', size: 22, weight: 700, upper: true, ls: 100, color, ...p });
  const sky = [1, 1, 2, 2, 3, 3, 5, 4, 6, 7, 8, 9];
  const skyRows = Array.from({ length: 9 }, (_, j) => sky.map((h) => (9 - j <= h ? 'o' : '.')).join(''));
  const bars = [3, 4, 4, 6, 8, 11];
  const barRows = Array.from({ length: 11 }, (_, j) => bars.map((h, i) => (11 - j <= h ? (i === 5 ? 'o' : 'c') : '.').repeat(3)).join('.'));
  const col = (n, h, b, x, spr) => [cells(spr, x, 200, 14, { '#': INK }), T(n, x, 480, 460, { font: 'Bricolage Grotesque', size: 96, weight: 700, ls: -40, color: INK }), T(h, x, 620, 460, { font: 'Space Grotesk', size: 36, weight: 700, color: INK }), T(b, x, 680, 440, { font: 'Space Grotesk', size: 30, weight: 400, lh: 1.35, color: INK })];
  return tpl({
    id: 'pixel-review-deck', name: 'Quarterly review deck', format: 'slide', category: 'Business', tags: ['deck', 'review', 'report', 'quarterly', 'presentation', 'numbers'],
    pages: [
      page(CR, [
        mono('Quarterly review', 100, 90, 800, INK), mono('Q3 2026', 1320, 90, 500, INK, { align: 'right' }),
        T('Quarter three,\nin plain numbers', 100, 330, 1300, { font: 'Bricolage Grotesque', size: 160, weight: 700, ls: -60, lh: 0.95, color: INK }),
        cells(skyRows, 1100, 1080 - 9 * 60, 60, { o: OR }),
        T('Prepared by the finance desk for the whole company.', 100, 900, 800, { font: 'Space Grotesk', size: 32, weight: 500, color: INK }),
      ]),
      page(OR, [
        mono('01 Revenue', 100, 90, 800, INK),
        cells(wordRows('+38', 1).map((r) => r.replace(/#/g, 'a')), 100, 250, 52, { a: INK }),
        T('Growth in recurring revenue over the quarter', 1100, 300, 700, { font: 'Bricolage Grotesque', size: 56, weight: 700, ls: -20, lh: 1.05, color: INK }),
        T('Mostly returning customers. New business was flat and we are fine with that.', 1100, 520, 640, { font: 'Space Grotesk', size: 32, weight: 500, lh: 1.35, color: INK }),
        L(100, 980, 1820, 980, INK, 2),
        mono('Q3 2026', 100, 1000, 500, INK, { size: 20 }),
      ]),
      page(CR, [
        mono('02 What we do next', 100, 90, 800, INK),
        col('Keep', 'The Friday demo', 'It finds problems early and everyone ends up on the same page.', 100, SPR.heart),
        col('Start', 'Writing it down', 'Decisions go in one shared document, with a date and a name.', 700, SPR.invader),
        col('Stop', 'Status meetings', 'If it is a status, it fits in a message. We want the time back.', 1300, SPR.ghost),
        L(100, 980, 1820, 980, INK, 2),
      ]),
      page('#111111', [
        mono('03 Customers', 100, 90, 800, CR),
        T('Active\ncustomers,\nmonth by month', 100, 250, 800, { font: 'Bricolage Grotesque', size: 96, weight: 700, ls: -30, lh: 0.98, color: CR }),
        T('From 310 in April to 1,140 in September.', 100, 650, 600, { font: 'Space Grotesk', size: 32, weight: 500, lh: 1.35, color: CR }),
        cells(barRows, 960, 220, 40, { c: CR, o: OR }),
        ...['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'].map((m, i) => T(m, 960 + i * 160, 700 + 0, 120, { font: 'Space Mono', size: 22, weight: 700, upper: true, ls: 80, color: CR })),
      ]),
      page(CR, [
        cells(dither(40, 54, (u, v) => u * 1.15 - 0.12 + (v - 0.5) * 0.1), 1120, 0, 20, { a: OR }),
        mono('Next quarter', 100, 90, 800, INK),
        T('Questions,\nplease.', 100, 330, 1100, { font: 'Bricolage Grotesque', size: 230, weight: 700, ls: -80, lh: 0.88, color: INK }),
        T('finance@company.example', 100, 900, 800, { font: 'Space Mono', size: 30, weight: 700, color: INK }),
      ]),
    ],
  });
})();

// 21. Corner cafe menu, two pages
const menu = (() => {
  const CR = '#F4EDDC', RED = '#D6362B';
  const cup = ['..#...#...#...', '...#...#...#..', '..#...#...#...', '..............', 'rrrrrrrrrrrr..', 'rrrrrrrrrrrr##', 'rrrrrrrrrrrr.#', 'rrrrrrrrrrrr.#', 'rrrrrrrrrrrr##', '.rrrrrrrrrr...', '..rrrrrrrr....', '.############.'];
  const cake = ['.......r......', '......rrr.....', '..............', '.wwwwwwwwwwww.', 'wwwwwwwwwwwwww', 'bbbbbbbbbbbbbb', 'bbbbbbbbbbbbbb', 'rrrrrrrrrrrrrr', 'bbbbbbbbbbbbbb', 'bbbbbbbbbbbbbb', '##############'];
  const items = (list, y0) => list.flatMap(([n, d, p], i) => {
    const y = y0 + i * 84;
    return [
      T(n, 64, y, 520, { font: 'Space Mono', size: 22, weight: 700, color: INK }),
      T(d, 64, y + 32, 520, { font: 'Space Mono', size: 14, color: '#555' }),
      T(p, 600, y, 130, { font: 'Space Mono', size: 22, weight: 700, color: INK, align: 'right' }),
      L(64 + n.length * 13.5 + 14, y + 20, 590, y + 20, INK, 1.5, { dash: 'dot' }),
    ];
  });
  const head = (title, sub, sprite, cols) => [
    T('Corner Cafe', 64, 56, 500, { font: 'Space Mono', size: 16, weight: 700, upper: true, ls: 140, color: INK }),
    T(title, 64, 96, 560, { font: 'Pixelify Sans', size: 110, weight: 700, ls: -10, color: RED }),
    T(sub, 64, 214, 500, { font: 'Space Mono', size: 15, color: INK }),
    cells(sprite, 794 - 64 - 14 * 10, 70, 10, cols),
    L(64, 270, 730, 270, INK, 2),
  ];
  return tpl({
    id: 'pixel-cafe-menu', name: 'Cafe menu', format: 'a4', category: 'Food', tags: ['menu', 'cafe', 'coffee', 'food', 'two page', 'a4'],
    pages: [
      page(CR, [
        head('Drinks', 'Everything is made to order. Oat milk is free.', cup, { r: RED, '#': INK }),
        items([['Espresso', 'Double shot, short and dark', '32'], ['Cortado', 'Equal parts milk and coffee', '38'], ['Flat white', 'Silky milk, two shots', '42'], ['Filter coffee', 'Bottomless until 11', '30'], ['Oat latte', 'The big one', '46'], ['Hot chocolate', 'Dark, with a pinch of salt', '44'], ['Cardamom tea', 'Pot for one, steeped four minutes', '38'], ['Fresh juice', 'Whatever the market had', '48']], 310),
        T('Prices in kronor, tip stays with the team.', 64, 1040, 600, { font: 'Space Mono', size: 13, color: INK }),
      ]),
      page(CR, [
        head('Food', 'Baked here every morning until it runs out.', cake, { w: '#FFFFFF', b: '#8A5A33', r: RED, '#': INK }),
        items([['Cardamom bun', 'Pearl sugar, still warm', '36'], ['Cheese toastie', 'Three cheeses, sourdough', '68'], ['Egg on rye', 'Soft egg, pickled onion', '74'], ['Soup of the day', 'With bread and butter', '89'], ['Granola bowl', 'Yoghurt and stewed fruit', '58'], ['Carrot cake', 'Cream cheese on top', '52'], ['Cinnamon bun', 'Same as the cardamom, but cinnamon', '36'], ['Kids toast', 'Butter and jam', '29']], 310),
        T('Tell us about allergies, we would rather know.', 64, 1040, 600, { font: 'Space Mono', size: 13, color: INK }),
      ]),
    ],
  });
})();

// 22. Question mark quiz poster
const quiz = (() => {
  const YEL = '#F6C915', PUR = '#6A36B8';
  return tpl({
    id: 'pixel-question-quiz', name: 'Question mark poster', format: 'poster', category: 'Event', tags: ['quiz', 'question', 'pub', 'game', 'yellow', 'trivia'],
    pages: [page(YEL, [
      T('PUB QUIZ', 56, 40, 1100, { font: 'Jersey 25', size: 250, color: PUR, lh: 1 }),
      cells(SPR.qmark, 212, 360, 62, { '#': PUR }),
      ...[[70, 640], [1050, 640], [70, 1130], [1050, 1130]].flatMap(([x, y]) => [L(x - 18, y - 18, x + 18, y + 18, PUR, 7), L(x - 18, y + 18, x + 18, y - 18, PUR, 7)]),
      L(56, 1390, 1067, 1390, INK, 2),
      T('Tuesday 18 March', 56, 1415, 480, { font: 'Space Grotesk', size: 30, weight: 700, color: INK }),
      T('19:30, The Anchor\nTeams of four', 56, 1462, 480, { font: 'Space Grotesk', size: 24, weight: 500, lh: 1.3, color: INK }),
      T('Six rounds, one music\nround nobody wins.\nPrize: the good chair.', 640, 1415, 427, { font: 'Space Grotesk', size: 24, weight: 500, lh: 1.3, color: INK, align: 'right' }),
    ])],
  });
})();

export default [ticket, maze, face, eye, hourglass, maskPortrait, focusPull, zine, dissolve, ribbon, numbers, arcade, falling, numerals, wizard, pear, led, frameP, cursorCard, deck, menu, quiz];
