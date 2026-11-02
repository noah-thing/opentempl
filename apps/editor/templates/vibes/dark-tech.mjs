import { tpl, page, T, S, rect, circle, path, L, img, frame, overlay, svg, qr, solid, linear, radial, pattern, stroke } from '../kit.mjs';

// ---------- helpers ----------
function cells(rows, x, y, s, colors, p = {}) {
  const out = [], H = rows.length;
  const done = rows.map((r) => Array.from({ length: r.length }, () => false));
  const col = (c) => (typeof colors === 'string' ? colors : colors[c]);
  for (let j = 0; j < H; j++) for (let i = 0; i < rows[j].length; i++) {
    const c = rows[j][i];
    if (done[j][i] || c === '.' || !col(c)) continue;
    let w = 1; while (i + w < rows[j].length && rows[j][i + w] === c && !done[j][i + w]) w++;
    let h = 1;
    outer: while (j + h < H) { for (let k = 0; k < w; k++) if (rows[j + h][i + k] !== c || done[j + h][i + k]) break outer; h++; }
    for (let b = 0; b < h; b++) for (let a = 0; a < w; a++) done[j + b][i + a] = true;
    out.push(rect(x + i * s, y + j * s, w * s, h * s, col(c), p));
  }
  return out;
}
const grid = (cols, rows, fn) => Array.from({ length: rows }, (_, j) => Array.from({ length: cols }, (_, i) => fn(i, j) || '.').join(''));
const rng = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
const bayer = (i, j) => (BAYER[j & 3][i & 3] + 0.5) / 16;
const plus = (x, y, size, color, w = 1.5, p = {}) => [L(x - size, y, x + size, y, color, w, p), L(x, y - size, x, y + size, color, w, p)];
const brackets = (x, y, w, h, len, color, wd = 2) => [
  L(x, y, x + len, y, color, wd), L(x, y, x, y + len, color, wd),
  L(x + w, y, x + w - len, y, color, wd), L(x + w, y, x + w, y + len, color, wd),
  L(x, y + h, x + len, y + h, color, wd), L(x, y + h, x, y + h - len, color, wd),
  L(x + w, y + h, x + w - len, y + h, color, wd), L(x + w, y + h, x + w, y + h - len, color, wd),
];
const BG = '#07090D', GRID = '#18202B', LINE = '#2A323E', WHITE = '#F2F4F0', MUTE = '#8B94A1';
const gridBg = (bg = BG, line = GRID, scale = 1) => pattern('grid', line, bg, scale);
const mono = (t, x, y, w, color = MUTE, p = {}) => T(t, x, y, w, { font: 'Geist Mono', size: 14, weight: 500, upper: true, ls: 100, color, ...p });

const LIME = '#C6F135';
// 1. Summit poster: giant cropped numerals, ruled programme
const summit = tpl({
  id: 'dark-summit-poster', name: 'Summit poster', format: 'poster', category: 'Event', tags: ['conference', 'summit', 'tech', 'programme', 'lime'],
  pages: [page(gridBg(), [
    T('26', -40, 60, 1300, { font: 'Geist', size: 930, weight: 800, ls: -80, lh: 0.9, color: LIME }),
    mono('Open Source Summit', 56, 50, 500, WHITE, { weight: 700 }),
    mono('Berlin, 14 and 15 Oct', 567, 50, 500, WHITE, { weight: 700, align: 'right' }),
    T('Open Source\nSummit', 56, 880, 1000, { font: 'Bricolage Grotesque', size: 112, weight: 700, ls: -50, lh: 0.92, color: WHITE }),
    T('Two days on building software in the open: licences, maintainers, money and the long tail of other people\'s code.', 790, 892, 277, { font: 'Geist', size: 19, weight: 400, lh: 1.4, color: MUTE }),
    L(56, 1130, 1067, 1130, LINE, 1),
    ...[['09:30', 'Ines Okafor', 'What a maintainer owes you'], ['11:00', 'Tomas Reuter', 'Fifteen years of one library'], ['13:30', 'Sana Hadid', 'Funding without a foundation'], ['15:00', 'Panel', 'Who pays for the boring parts?']].flatMap(([t, n, d], i) => [
      mono(t, 56, 1152 + i * 62, 120, LIME, { size: 15 }),
      T(n, 200, 1146 + i * 62, 360, { font: 'Geist', size: 24, weight: 600, color: WHITE }),
      T(d, 580, 1148 + i * 62, 487, { font: 'Geist', size: 22, weight: 400, color: MUTE }),
      L(56, 1196 + i * 62, 1067, 1196 + i * 62, LINE, 1),
    ]),
    mono('summit.example.org', 56, 1510, 400, MUTE, { size: 13 }),
    mono('Tickets from 290 EUR', 667, 1510, 400, MUTE, { size: 13, align: 'right' }),
    ...plus(56, 800, 9, LIME, 2), ...plus(1067, 800, 9, LIME, 2),
  ])],
});

// 2. Launch story: dot field, huge version number
const launch = (() => {
  const B = '#3B5BFF';
  const r = rng(3);
  const C = 54, R = 52, s = 20;
  const rows = grid(C, R, (i, j) => {
    const d = Math.hypot((i - 27) / 27, (j - 26) / 22);
    const dens = Math.max(0, 1 - d) * 1.15;
    return dens > bayer(i, j) * 0.9 + r() * 0.08 ? 'b' : '.';
  });
  return tpl({
    id: 'dark-launch-story', name: 'Launch story', format: 'story', category: 'Business', tags: ['launch', 'release', 'version', 'story', 'product', 'update'],
    pages: [page('#05070C', [
      cells(rows, 0, 260, s, { b: B }),
      mono('Release notes', 60, 70, 400, MUTE, { size: 18 }),
      mono('Out now', 620, 70, 400, WHITE, { size: 18, align: 'right' }),
      L(60, 120, 1020, 120, LINE, 1),
      T('4.0', 20, 460, 1100, { font: 'Geist', size: 640, weight: 700, ls: -80, lh: 0.9, color: WHITE, align: 'center' }),
      ...[['01', 'Builds are three times faster'], ['02', 'One config file, not five'], ['03', 'Plugins load only when used']].flatMap(([n, t], i) => [
        L(60, 1360 + i * 120, 1020, 1360 + i * 120, LINE, 1),
        mono(n, 60, 1385 + i * 120, 100, B, { size: 22 }),
        T(t, 170, 1378 + i * 120, 850, { font: 'Geist', size: 40, weight: 500, ls: -10, color: WHITE }),
      ]),
      L(60, 1720, 1020, 1720, LINE, 1),
      rect(60, 1770, 960, 90, '#0E1424', { stroke: stroke(B, 1.5), radius: 8 }),
      T('npm install toolkit@4', 90, 1794, 700, { font: 'Geist Mono', size: 30, weight: 500, color: WHITE }),
      ...brackets(40, 1740, 1000, 150, 18, B, 2).slice(0, 0),
    ])],
  });
})();

// 3. Speaker announcement: photo dissolving into dark cells
const speaker = (() => {
  const r = rng(9);
  const C = 14, R = 68, s = 20;
  const rows = grid(C, R, (i, j) => (r() < Math.max(0, 1 - i / C) * 1.05 ? 'k' : '.'));
  const rows2 = rows.map((x) => x);
  return tpl({
    id: 'dark-speaker-post', name: 'Speaker announcement', format: 'post', category: 'Social', tags: ['speaker', 'announcement', 'conference', 'portrait', 'photo'],
    pages: [page('#06080C', [
      img('photos/portrait-man-sun.jpg', 460, 0, 620, 1350, { filters: { saturation: -100, contrast: 25, duotone: ['#05070B', '#C6F135'], grain: 25 } }),
      cells(rows2, 420, 0, s, { k: '#06080C' }),
      rect(0, 0, 440, 1350, '#06080C'),
      mono('Speaker 03', 60, 64, 300, '#C6F135', { size: 16 }),
      mono('Stage A', 60, 92, 300, MUTE, { size: 14 }),
      T('Dr. Ana\nFerreira', 60, 380, 700, { font: 'Schibsted Grotesk', size: 100, weight: 700, ls: -45, lh: 0.92, color: WHITE }),
      T('Why small teams ship the best infrastructure', 60, 720, 480, { font: 'Schibsted Grotesk', size: 34, weight: 500, lh: 1.15, color: WHITE }),
      L(60, 1060, 400, 1060, LINE, 1),
      mono('Thursday 14 Oct', 60, 1090, 340, MUTE, { size: 15 }),
      mono('11:00 to 11:40', 60, 1120, 340, MUTE, { size: 15 }),
      mono('Confirm.example.org', 60, 1270, 340, '#C6F135', { size: 14 }),
      ...plus(60, 330, 9, '#C6F135', 2),
    ])],
  });
})();

// 4. Event ticket with stub
const ticket = (() => {
  const OR = '#FF5B2E', INKB = '#0A0E1A';
  const r = rng(14);
  const bars = []; let y = 70;
  while (y < 580) { const h = 3 + Math.floor(r() * 7); bars.push(rect(740, y, 200, h, WHITE)); y += h + 3 + Math.floor(r() * 5); }
  const seat = Array.from({ length: 32 }, (_, n) => rect(56 + (n % 8) * 28, 470 + Math.floor(n / 8) * 28, 22, 22, n === 21 ? OR : '#232B3A', { radius: 3 }));
  return tpl({
    id: 'dark-event-ticket', name: 'Event ticket', format: 'card', category: 'Event', tags: ['ticket', 'admit one', 'event', 'pass', 'orange'],
    pages: [page(gridBg(INKB, '#141B2C'), [
      L(700, 30, 700, 620, LINE, 2, { dash: 'dash' }),
      circle(680, -20, 40, '#000000'), circle(680, 630, 40, '#000000'),
      mono('Admit one', 56, 50, 300, OR, { size: 16, weight: 700 }),
      mono('No. 0412', 400, 50, 260, MUTE, { size: 16, align: 'right' }),
      T('Night\nSessions', 52, 110, 620, { font: 'Geist', size: 136, weight: 700, ls: -60, lh: 0.88, color: WHITE }),
      mono('Fri 21 Nov', 56, 390, 300, WHITE, { size: 22 }),
      mono('Doors 20:00', 56, 424, 300, MUTE, { size: 16 }),
      seat,
      mono('Row C, seat 6', 290, 484, 300, MUTE, { size: 14 }),
      ...bars,
      mono('Scan at the door', 740, 596, 220, MUTE, { size: 12 }),
    ])],
  });
})();

// 5. Roadmap deck
const deck = (() => {
  const G = '#3DF58A', BGD = '#05090A';
  const bg = () => gridBg(BGD, '#0F1A17');
  const spark = 'M0 90 L40 84 L80 88 L120 70 L160 74 L200 52 L240 58 L280 34 L320 40 L360 12 L400 18';
  return tpl({
    id: 'dark-roadmap-deck', name: 'Roadmap deck', format: 'slide', category: 'Business', tags: ['deck', 'roadmap', 'presentation', 'green', 'strategy'],
    pages: [
      page(bg(), [
        mono('Product roadmap', 100, 90, 600, G, { size: 22 }), mono('2026', 1220, 90, 600, MUTE, { size: 22, align: 'right' }),
        T('What we build\nnext year', 100, 300, 1300, { font: 'Familjen Grotesk', size: 190, weight: 600, ls: -70, lh: 0.92, color: WHITE }),
        ...[900, 700, 500].map((d, i) => circle(1700 - d / 2 + 200, 1080 - d / 2 + 100, d, 'rgba(0,0,0,0)', { stroke: stroke(G, 2), opacity: 0.8 - i * 0.2 })),
        L(100, 960, 1000, 960, LINE, 1),
        mono('Team offsite, Gothenburg', 100, 990, 700, MUTE, { size: 20 }),
        ...plus(100, 250, 12, G, 2),
      ]),
      page(bg(), [
        mono('Agenda', 100, 90, 600, G, { size: 22 }),
        ...[['01', 'Where we are'], ['02', 'Three bets'], ['03', 'What we will not do'], ['04', 'Dates and owners']].flatMap(([n, t], i) => [
          L(100, 260 + i * 190, 1820, 260 + i * 190, LINE, 1),
          T(n, 100, 285 + i * 190, 300, { font: 'Geist Mono', size: 90, weight: 300, color: G }),
          T(t, 500, 300 + i * 190, 1300, { font: 'Familjen Grotesk', size: 92, weight: 500, ls: -30, color: WHITE }),
        ]),
        L(100, 1020, 1820, 1020, LINE, 1),
      ]),
      page(bg(), [
        mono('Reliability', 100, 90, 600, G, { size: 22 }),
        T('99.98%', 80, 240, 1500, { font: 'Familjen Grotesk', size: 440, weight: 600, ls: -90, lh: 0.9, color: WHITE }),
        T('Uptime over the last twelve months, up from 99.7. The goal for next year is not a bigger number but fewer bad nights.', 100, 760, 760, { font: 'Geist', size: 34, weight: 400, lh: 1.4, color: MUTE }),
        path(spark, 1050, 720, 760, 240, 'rgba(0,0,0,0)', { w0: 400, h0: 100, stroke: stroke(G, 3) }),
        circle(1050 + 760 - 12, 720 + 18 - 12, 24, G),
        L(1050, 980, 1810, 980, LINE, 1),
        mono('Jan', 1050, 1000, 100, MUTE, { size: 16 }), mono('Dec', 1710, 1000, 100, MUTE, { size: 16, align: 'right' }),
      ]),
      page(bg(), [
        T('Questions,\ncomments,\nobjections.', 100, 190, 1500, { font: 'Familjen Grotesk', size: 200, weight: 600, ls: -70, lh: 0.92, color: WHITE }),
        qr('https://example.com/roadmap', 1580, 160, 240, G, BGD),
        mono('Roadmap document', 1580, 420, 300, MUTE, { size: 16 }),
        mono('product@company.example', 100, 960, 800, G, { size: 24 }),
      ]),
    ],
  });
})();

// 6. Carousel: numbered findings
const carousel = (() => {
  const G = '#3DF58A', BGC = '#06100C';
  const stripe = (c) => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map((i) => rect(0, 60 + i * 52, 18 + ((i * 7) % 5) * 10, 3, c));
  const frame = (n, inner) => page(gridBg(BGC, '#0D1D16'), [
    stripe(G),
    mono('Field notes, vol. 3', 90, 66, 500, MUTE, { size: 15 }),
    mono(`${n}/4`, 880, 66, 110, G, { size: 15, align: 'right' }),
    inner,
  ]);
  const item = (n, t, b, extra = []) => frame(n, [
    T(String(n - 1).padStart(2, '0'), 90, 150, 700, { font: 'Geist Mono', size: 380, weight: 200, ls: -40, color: G, lh: 1 }),
    T(t, 90, 700, 880, { font: 'Geist', size: 96, weight: 600, ls: -40, lh: 0.98, color: WHITE }),
    T(b, 90, 900, 720, { font: 'Geist', size: 30, weight: 400, lh: 1.4, color: MUTE }),
    L(90, 1250, 990, 1250, LINE, 1),
    mono('Swipe', 90, 1272, 200, MUTE, { size: 14 }),
    ...extra,
  ]);
  return tpl({
    id: 'dark-numbered-carousel', name: 'Numbered carousel', format: 'post', category: 'Social', tags: ['carousel', 'tips', 'numbers', 'green', 'linkedin', 'insights'],
    pages: [
      frame(1, [
        T('Three things\nwe learned\nrunning servers\nat midnight', 90, 420, 900, { font: 'Geist', size: 120, weight: 600, ls: -50, lh: 0.96, color: WHITE }),
        L(90, 1250, 990, 1250, LINE, 1),
        mono('Swipe to read', 90, 1272, 400, G, { size: 14 }),
        ...plus(950, 1310, 8, G, 2),
      ]),
      item(2, 'Alerts are a budget', 'Every page you send spends a little of someone\'s trust. Set a monthly limit and stick to it.'),
      item(3, 'Write the runbook first', 'If the fix is not written down before the night it breaks, it is not a fix, it is a hope.'),
      frame(4, [
        T('Sleep is\nan uptime\nmetric.', 90, 380, 900, { font: 'Geist', size: 150, weight: 600, ls: -60, lh: 0.94, color: WHITE }),
        T('Follow for the next volume.\nFifteen minutes a week, no filler.', 90, 1040, 720, { font: 'Geist', size: 30, weight: 400, lh: 1.4, color: MUTE }),
        L(90, 1250, 990, 1250, LINE, 1),
        mono('@fieldnotes', 90, 1272, 400, G, { size: 14 }),
      ]),
    ],
  });
})();

// 7. Spec sheet one pager
const spec = (() => {
  const A = '#C6F135';
  const rows = [['Sensor', 'Dual band radar, 60 GHz'], ['Range', '12 m, 140 degree field'], ['Latency', '8 ms to output'], ['Power', '1.2 W, USB C'], ['Housing', 'Machined aluminium'], ['Weight', '64 g'], ['Operating', 'Minus 10 to 55 C'], ['Software', 'Open firmware, MIT']];
  return tpl({
    id: 'dark-spec-sheet', name: 'Spec sheet', format: 'a4', category: 'Business', tags: ['spec sheet', 'product', 'datasheet', 'hardware', 'technical', 'one pager'],
    pages: [page(gridBg('#080B10', '#141B25', 1), [
      mono('Datasheet 01', 48, 44, 300, A, { size: 12 }), mono('Revision C', 446, 44, 300, MUTE, { size: 12, align: 'right' }),
      T('Halo S1', 48, 80, 700, { font: 'Syne', size: 104, weight: 700, ls: -50, lh: 1, color: WHITE }),
      T('A presence sensor the size of a coin, built for rooms that need to know who is there and nothing more.', 48, 210, 320, { font: 'Geist', size: 17, weight: 400, lh: 1.45, color: MUTE }),
      // drawing
      ...[300, 220, 140, 60].map((d, i) => circle(562 - d / 2 + 0, 260 - d / 2, d, 'rgba(0,0,0,0)', { stroke: stroke(i === 3 ? A : '#3A4553', 1.5, i === 1 ? 'dash' : 'solid') })),
      L(380, 260, 744, 260, '#3A4553', 1), L(562, 80, 562, 440, '#3A4553', 1),
      circle(556, 254, 12, A),
      ...brackets(380, 80, 364, 360, 18, A, 2),
      mono('Fig. 1, front', 380, 452, 360, MUTE, { size: 11, align: 'right' }),
      mono('12 m', 640, 150, 100, A, { size: 11 }),
      L(48, 520, 746, 520, LINE, 1),
      ...rows.flatMap(([k, v], i) => [
        mono(k, 48, 540 + i * 52, 260, MUTE, { size: 13 }),
        T(v, 300, 534 + i * 52, 446, { font: 'Geist', size: 21, weight: 500, color: WHITE }),
        L(48, 580 + i * 52, 746, 580 + i * 52, LINE, 1),
      ]),
      mono('Order code HS1-C', 48, 1040, 300, A, { size: 12 }),
      mono('halo.example.com', 446, 1040, 300, MUTE, { size: 12, align: 'right' }),
    ])],
  });
})();

// 8. Concentric rings with data chips
const rings = (() => {
  const OR = '#FF5B2E';
  const chip = (t, x, y, w) => [rect(x, y, w, 76, OR, { radius: 10 }), T(t, x, y + 12, w, { font: 'Martian Mono', size: 34, weight: 600, color: '#0A0A0A', align: 'center', upper: true })];
  return tpl({
    id: 'dark-ring-stats', name: 'Ring stats post', format: 'post', category: 'Social', tags: ['stats', 'network', 'rings', 'orange', 'data', 'update'],
    pages: [page(BG, [
      ...[[540, 600, 1000], [540, 600, 720], [540, 600, 440], [540, 600, 160]].map(([cx, cy, d], i) => circle(cx - d / 2, cy - d / 2, d, 'rgba(0,0,0,0)', { stroke: stroke(i === 3 ? OR : '#313A48', 1.5) })),
      circle(280, 280, 700, 'rgba(0,0,0,0)', { stroke: stroke('#313A48', 1.5), opacity: 0.6 }),
      L(540, 60, 540, 1140, '#1E2530', 1), L(40, 600, 1040, 600, '#1E2530', 1),
      chip('Nodes: 47', 150, 340, 340), chip('Signal', 560, 520, 260), chip('Edges: 213', 380, 780, 360),
      mono('Network summary', 60, 66, 400, MUTE, { size: 16 }),
      mono('Week 42', 620, 66, 400, MUTE, { size: 16, align: 'right' }),
      T('How far one message travels', 60, 1180, 700, { font: 'Geist', size: 56, weight: 500, ls: -20, lh: 1.05, color: WHITE }),
      T('Forty seven nodes, two hundred thirteen links, one signal.', 760, 1190, 260, { font: 'Geist', size: 18, weight: 400, lh: 1.4, color: MUTE }),
    ])],
  });
})();

// 9. Wide cover with a receding grid
const cover = (() => {
  const B = '#4F6BFF', vx = 820, vy = 340, W = 1640, H = 624;
  const r = rng(6);
  const lines = [];
  for (let k = -16; k <= 16; k++) lines.push(L(vx, vy, vx + k * 190, H, B, 1.5, { opacity: 0.55 }));
  for (let i = 1; i <= 8; i++) { const y = vy + Math.pow(i / 8, 2.1) * (H - vy); lines.push(L(0, y, W, y, B, 1.5, { opacity: 0.55 })); }
  const stars = Array.from({ length: 46 }, () => { const s = r() < 0.2 ? 4 : 2; return circle(r() * W, r() * (vy - 20), s, WHITE, { opacity: 0.35 + r() * 0.5 }); });
  return tpl({
    id: 'dark-grid-cover', name: 'Horizon cover', format: 'cover', category: 'Social', tags: ['cover', 'banner', 'linkedin', 'facebook', 'grid', 'header'],
    pages: [page('#05060D', [
      stars, L(0, vy, W, vy, WHITE, 1.5, { opacity: 0.8 }), lines,
      T('Build in public', 0, 108, W, { font: 'Geist', size: 128, weight: 600, ls: -50, align: 'center', color: WHITE }),
      mono('Weekly notes from a small software studio', 0, 262, W, MUTE, { size: 18, align: 'center' }),
      mono('Studio Parallel', 60, 50, 400, WHITE, { size: 15 }), mono('Est. 2021', 1180, 50, 400, MUTE, { size: 15, align: 'right' }),
      ...plus(60, 570, 9, B, 2), ...plus(1580, 570, 9, B, 2),
    ])],
  });
})();

// 10. Blog card with two bars
const og = (() => {
  const A = '#C6F135';
  return tpl({
    id: 'dark-blog-card', name: 'Blog share card', format: 'og', category: 'Social', tags: ['blog', 'og image', 'engineering', 'share', 'article'],
    pages: [page(gridBg('#080A0F', '#151B25'), [
      rect(60, 60, 170, 38, 'rgba(0,0,0,0)', { stroke: stroke(A, 1.5), radius: 19 }),
      mono('Engineering', 60, 69, 170, A, { size: 14, align: 'center' }),
      T('How we cut our build from 14 minutes to 90 seconds', 60, 150, 620, { font: 'Geist', size: 64, weight: 600, ls: -30, lh: 1.02, color: WHITE }),
      T('Nora Lind', 60, 540, 300, { font: 'Geist', size: 24, weight: 600, color: WHITE }),
      mono('Platform team, 6 min read', 60, 575, 400, MUTE, { size: 14 }),
      L(740, 570, 1140, 570, LINE, 1.5),
      rect(770, 210, 150, 360, '#262E3B'), rect(970, 532, 150, 38, A),
      mono('Before', 770, 585, 150, MUTE, { size: 13 }), mono('After', 970, 585, 150, A, { size: 13 }),
      T('14:00', 770, 150, 200, { font: 'Geist Mono', size: 40, weight: 500, color: MUTE }),
      T('1:30', 970, 472, 200, { font: 'Geist Mono', size: 40, weight: 500, color: A }),
    ])],
  });
})();

// 11. Video thumbnail
const thumb = (() => {
  const A = '#C6F135';
  return tpl({
    id: 'dark-video-thumb', name: 'Tech video thumbnail', format: 'thumb', category: 'Social', tags: ['youtube', 'thumbnail', 'video', 'coding', 'tutorial'],
    pages: [page('#06080C', [
      img('photos/desk.jpg', 600, 0, 680, 720, { filters: { saturation: -100, contrast: 30, duotone: ['#06080C', A], grain: 20 } }),
      rect(0, 0, 640, 720, '#06080C'),
      rect(40, 396, 570, 112, A),
      T('I deleted\nmy whole', 50, 70, 600, { font: 'Archivo', size: 112, weight: 900, ls: -40, lh: 0.95, color: WHITE }),
      T('backend', 52, 398, 560, { font: 'Archivo', size: 114, weight: 900, ls: -40, lh: 1, color: '#06080C' }),
      mono('And it got faster', 50, 560, 500, WHITE, { size: 26 }),
      L(520, 640, 640, 560, A, 6, { end: 'arrow' }),
    ])],
  });
})();

// 12. Dither field statement
const dith = (() => {
  const A = '#C6F135';
  const C = 60, R = 62, s = 18;
  const rows = grid(C, R, (i, j) => {
    const v = j / R;
    const d = Math.pow(Math.max(0, v - 0.6) / 0.4, 1.1) * 1.15;
    return d > bayer(i, j) ? 'a' : '.';
  });
  return tpl({
    id: 'dark-dither-statement', name: 'Dither statement', format: 'post', category: 'Social', tags: ['statement', 'quote', 'dither', 'lime', 'minimal', 'announcement'],
    pages: [page('#070A08', [
      cells(rows, 0, 1350 - R * s, s, { a: A }),
      mono('Principle 04', 64, 66, 400, A, { size: 16 }),
      mono('Studio handbook', 616, 66, 400, MUTE, { size: 16, align: 'right' }),
      T('Fewer\nmoving\nparts.', 56, 150, 960, { font: 'Geist', size: 210, weight: 300, ls: -80, lh: 0.92, color: WHITE }),
      T('Every part you add is a part someone has to understand at three in the morning.', 64, 790, 520, { font: 'Geist', size: 26, weight: 400, lh: 1.4, color: MUTE }),
    ])],
  });
})();

export default [summit, launch, speaker, ticket, deck, carousel, spec, rings, cover, og, thumb, dith];
