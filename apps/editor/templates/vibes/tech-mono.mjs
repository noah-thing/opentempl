import { tpl, page, T, S, rect, circle, path, L, img, frame, overlay, svg, qr, solid, linear, radial, pattern, imageFill, stroke } from '../kit.mjs';

const ALL = [];
export default ALL;

const BK = '#0A0A0A';
const WH = '#F2F2EE';
const LIME = '#C8FF2E';
const ORG = '#FF5B1F';
const BLU = '#2438FF';
const MONO = 'JetBrains Mono';
const GRO = 'Inter Tight';
const NONE = 'rgba(0,0,0,0)';

const rnd = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
// Crosshair marks, corner brackets, outline shapes
const plus = (x, y, s, c, w = 1) => [L(x - s, y, x + s, y, c, w), L(x, y - s, x, y + s, c, w)];
const corners = (x, y, w, h, s, c, wd = 1.5) => [
  L(x, y, x + s, y, c, wd), L(x, y, x, y + s, c, wd),
  L(x + w, y, x + w - s, y, c, wd), L(x + w, y, x + w, y + s, c, wd),
  L(x, y + h, x + s, y + h, c, wd), L(x, y + h, x, y + h - s, c, wd),
  L(x + w, y + h, x + w - s, y + h, c, wd), L(x + w, y + h, x + w, y + h - s, c, wd),
];
const ring = (cx, cy, r, c, w = 1.5, dash) => S('ellipse', cx - r, cy - r, 2 * r, 2 * r, NONE, { stroke: stroke(c, w, dash) });
const box = (x, y, w, h, c, wd = 1.5) => S('rect', x, y, w, h, NONE, { stroke: stroke(c, wd) });
const label = (text, x, y, w, c, p = {}) => T(text, x, y, w, { font: MONO, size: 14, weight: 500, ls: 60, upper: true, lh: 1.5, color: c, ...p });
// A dimension line with end bars and a value
const dim = (x1, y1, x2, y2, c, text, side = 1) => [
  L(x1, y1, x2, y2, c, 1.5, { start: 'bar', end: 'bar' }),
  T(text, (x1 + x2) / 2 - 60, (y1 + y2) / 2 - 24 * side - (side < 0 ? -8 : 0), 120, { font: MONO, size: 13, weight: 600, align: 'center', color: c }),
];

// 5x7 dot matrix glyphs
const G = {
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  I: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '#####'],
  G: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.###.'],
  N: ['#...#', '##..#', '##..#', '#.#.#', '#..##', '#..##', '#...#'],
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  '0': ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
  '1': ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  '2': ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
  '4': ['#..#.', '#..#.', '#..#.', '#####', '...#.', '...#.', '...#.'],
  '7': ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
};
const dots = (str, x, y, cell, d, color) => {
  const out = [];
  [...str].forEach((ch, k) => G[ch]?.forEach((row, r) => [...row].forEach((v, c) => {
    if (v === '#') out.push(circle(x + (k * 6 + c) * cell + (cell - d) / 2, y + r * cell + (cell - d) / 2, d, color));
  })));
  return out;
};

const radialTicks = (cx, cy, r, n, len, longEvery, c) => Array.from({ length: n }, (_, i) => {
  const a = (i / n) * Math.PI * 2, l = i % longEvery === 0 ? len * 2 : len;
  return L(cx + Math.cos(a) * r, cy + Math.sin(a) * r, cx + Math.cos(a) * (r + l), cy + Math.sin(a) * (r + l), c, i % longEvery === 0 ? 2 : 1);
});
const binRows = (n, w, seed) => Array.from({ length: n }, (_, r) => Array.from({ length: w }, (_, c) => (rnd(seed + r * 31 + c * 7) > 0.5 ? '1' : '0')).join('')).join('\n');

ALL.push(
  // 1 Stepped blocks
  tpl({ id: 'tech-stepped-blocks', name: 'Stepped blocks poster', format: 'poster', category: 'Event', tags: ['gig', 'club', 'blocks', 'lineup'], pages: [
    page(BK, [
      T('Basement\nSessions', 40, 40, 700, { font: GRO, size: 92, weight: 800, ls: -45, lh: 0.92, color: WH }),
      T('Vol. 002\nVol. 003', 700, 46, 200, { font: MONO, size: 22, weight: 500, lh: 1.3, color: WH }),
      T('Nils Aarden\nKoi Koi\n\nMeridian\nBlack Static', 700 + 200, 46, 300, { font: MONO, size: 22, weight: 500, lh: 1.3, color: WH }),
      T('Fri 17.02\nFri 10.03', 700, 130, 200, { font: MONO, size: 22, weight: 500, lh: 1.3, color: LIME }),
      ...[1100, 1100, 960, 960, 780, 780, 640, 500, 500, 320, 320, 170].map((h, k) => rect(k * 93.58, 1587 - h, 93.58, h, k === 5 ? LIME : WH)),
      ...Array.from({ length: 9 }, (_, r) => rect(0, 1587 - 130 - r * 98, 1123, 6, BK)),
      ...[[2, 0], [4, 1], [6, 0], [7, 1], [9, 0], [11, 1]].map(([c, k]) => rect(c * 93.58, 1587 - 4 * 98 - k * 98 - 130 - 0, 93.58, 6, BK)),
      label('Flybar, Hornstull   Doors 22:00   18+', 24, 1548, 700, BK, { size: 14, weight: 700 }),
    ]),
  ]}),

  // 2 Blueprint
  tpl({ id: 'tech-blueprint-spec', name: 'Blueprint spec poster', format: 'poster', category: 'Poster', tags: ['engineering', 'spec', 'blueprint', 'product'], pages: [
    page(BK, [
      L(561, 320, 561, 1180, WH, 1, { dash: 'dash', opacity: 0.5 }),
      L(160, 760, 960, 760, WH, 1, { dash: 'dash', opacity: 0.5 }),
      box(521, 330, 80, 330, WH), box(536, 300, 50, 30, WH), box(501, 660, 120, 60, WH),
      ring(561, 760, 90, WH, 1.5), ring(561, 760, 140, WH, 1, 'dash'), ring(561, 760, 210, WH, 1.5), ring(561, 760, 44, WH, 3),
      ...Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * 6.283; return circle(561 + Math.cos(a) * 175 - 7, 760 + Math.sin(a) * 175 - 7, 14, BK, { stroke: stroke(WH, 1.5) }); }),
      ...radialTicks(561, 760, 216, 72, 6, 6, WH),
      ...dim(421, 1010, 701, 1010, ORG, 'Ø 420'),
      ...dim(740, 300, 740, 660, ORG, '332.0'),
      L(601, 400, 800, 400, WH, 1, { end: 'circle' }), label('A  Drive shaft', 810, 388, 200, WH),
      L(651, 760, 800, 560, WH, 1, { end: 'circle' }), label('B  Bearing ring', 810, 548, 220, WH),
      ...[[80, 80], [1043, 80], [80, 1090], [1043, 1090]].map(([x, y]) => plus(x, y, 12, WH)),
      T('Actuator', 40, 1130, 700, { font: GRO, size: 150, weight: 700, ls: -50, lh: 1, color: WH }),
      circle(1020, 1170, 22, ORG),
      ...[['Torque', '48 Nm peak'], ['Weight', '1.9 kg'], ['Backlash', '< 0.1 deg'], ['Rev', 'C / 2026']].flatMap(([a, b], i) => [
        L(40 + i * 260, 1330, 40 + i * 260 + 230, 1330, WH, 1),
        label(a, 40 + i * 260, 1348, 230, '#8A8A86'),
        T(b, 40 + i * 260, 1378, 230, { font: GRO, size: 30, weight: 500, color: WH }),
      ]),
      label('Drawing 0417 / Scale 1:2 / mm', 40, 40, 700, WH),
      label('Sheet 1 of 3', 783, 40, 300, WH, { align: 'right' }),
    ]),
  ]}),

  // 3 Ring diagram lime
  tpl({ id: 'tech-ring-lime', name: 'Ring diagram poster', format: 'poster', category: 'Poster', tags: ['orbit', 'diagram', 'lime', 'launch'], pages: [
    page(LIME, [
      ring(561, 740, 150, BK, 2), ring(561, 740, 260, BK, 1), ring(561, 740, 360, BK, 3), ring(561, 740, 440, BK, 1, 'dash'),
      ...radialTicks(561, 740, 360, 120, 8, 10, BK),
      ...plus(561, 740, 470, BK, 1),
      circle(561 + 260 * Math.cos(-0.9) - 18, 740 + 260 * Math.sin(-0.9) - 18, 36, BK),
      circle(561 + 440 * Math.cos(2.4) - 11, 740 + 440 * Math.sin(2.4) - 11, 22, LIME, { stroke: stroke(BK, 2) }),
      T('O  R  B  I  T', 40, 700, 1043, { font: GRO, size: 54, weight: 500, ls: 20, color: BK, align: 'center' }),
      label('000', 600, 262, 80, BK), label('090', 1010, 722, 80, BK), label('180', 600, 1190, 80, BK), label('270', 60, 722, 80, BK),
      label('Programme 04\nLaunch window', 40, 40, 400, BK, { weight: 600 }),
      label('N 59.33 E 18.07', 683, 40, 400, BK, { align: 'right', weight: 600 }),
      L(40, 1380, 1083, 1380, BK, 1.5),
      ...[['Date', '12 March 2027'], ['Window', '04:10 to 04:50 UTC'], ['Site', 'Esrange, Kiruna']].flatMap(([a, b], i) => [
        label(a, 40 + i * 352, 1400, 300, BK, { weight: 600 }),
        T(b, 40 + i * 352, 1430, 330, { font: GRO, size: 34, weight: 600, ls: -10, color: BK }),
      ]),
    ]),
  ]}),

  // 4 Terminal log square, lime
  tpl({ id: 'tech-lime-log', name: 'Lime log post', format: 'square', category: 'Post', tags: ['error', 'terminal', 'log', 'type'], pages: [
    page(LIME, [
      T('(OUT OF\nRANGE)', 48, 150, 1000, { font: MONO, size: 150, weight: 800, ls: -60, lh: 0.95, color: BK }),
      L(48, 120, 1032, 120, BK, 2),
      label('Report 0047 / Sensor array B', 48, 56, 700, BK, { weight: 700 }),
      label('Rev 3', 832, 56, 200, BK, { weight: 700, align: 'right' }),
      T('0x04  reading above limit\n0x05  retry in 30 s\n0x06  retry failed\n0x07  channel muted\n0x08  operator notified\n0x09  waiting', 48, 520, 520, { font: MONO, size: 22, weight: 500, lh: 1.45, color: BK }),
      T('SOURCE   B-14\nLIMIT    80.0 C\nPEAK     97.3 C\nHELD     00:04:12\nSTATE    LATCHED', 580, 520, 460, { font: MONO, size: 22, weight: 500, lh: 1.45, color: BK }),
      L(48, 870, 1032, 870, BK, 1.5),
      T(binRows(2, 54, 3), 48, 890, 984, { font: MONO, size: 17, weight: 500, lh: 1.5, color: BK, opacity: 0.55 }),
      label('Please close the valve and\nrestart the pump from the panel.', 48, 960, 700, BK, { size: 16, weight: 600 }),
      rect(900, 940, 132, 90, BK),
      T('B14', 900, 950, 132, { font: MONO, size: 56, weight: 800, color: LIME, align: 'center' }),
    ]),
  ]}),

  // 5 Assembly manual
  tpl({ id: 'tech-assembly-04', name: 'Assembly manual page', format: 'a4', category: 'Poster', tags: ['manual', 'instructions', 'step', 'orange'], pages: [
    page(ORG, [
      L(30, 70, 764, 70, BK, 1.5),
      label('ND-01 / Assembly manual', 30, 36, 400, BK, { weight: 700 }),
      label('Step 4 of 9', 534, 36, 230, BK, { weight: 700, align: 'right' }),
      T('04', 24, 90, 520, { font: GRO, size: 380, weight: 800, ls: -90, lh: 1, color: BK }),
      svg('<svg viewBox="0 0 400 400"><path fill="none" stroke="#0A0A0A" stroke-width="2" d="M200 120 L320 190 L320 330 L200 400 L80 330 L80 190 Z"/><path fill="none" stroke="#0A0A0A" stroke-width="2" d="M200 120 L200 260 M80 190 L200 260 L320 190"/><path fill="none" stroke="#0A0A0A" stroke-width="2" d="M200 20 L290 72 L200 124 L110 72 Z" stroke-dasharray="6 5"/><path fill="none" stroke="#0A0A0A" stroke-width="2" d="M200 128 L200 210" stroke-dasharray="3 6"/><path fill="none" stroke="#0A0A0A" stroke-width="2" d="M193 205 L200 218 L207 205"/><circle fill="none" stroke="#0A0A0A" stroke-width="2" cx="200" cy="72" r="6"/></svg>', 400, 290, 400, 400),
      L(580, 440, 660, 380, BK, 1.5, { end: 'circle' }), circle(660, 336, 44, BK), T('A', 660, 342, 44, { font: GRO, size: 30, weight: 700, color: ORG, align: 'center' }),
      L(380, 560, 230, 640, BK, 1.5, { end: 'circle' }),
      ...plus(60, 640, 10, BK),
      L(30, 700, 764, 700, BK, 1.5),
      ...[['A', 'Housing', 'x1'], ['B', 'Core module', 'x1'], ['C', 'Screw M3 x 8', 'x4']].flatMap(([k, n, q], i) => [
        circle(30, 730 + i * 62, 40, BK), T(k, 30, 736 + i * 62, 40, { font: GRO, size: 26, weight: 700, color: ORG, align: 'center' }),
        T(n, 90, 738 + i * 62, 400, { font: GRO, size: 26, weight: 600, color: BK }),
        T(q, 650, 738 + i * 62, 114, { font: MONO, size: 22, weight: 600, color: BK, align: 'right' }),
      ]),
      label('Seat module B into housing A until it clicks.\nDo not force. Check the arrows face upward.', 30, 1000, 500, BK, { size: 14, weight: 600 }),
      label('Part no. 4411 0087', 534, 1060, 230, BK, { align: 'right', size: 13 }),
    ]),
  ]}),

  // 6 Dot matrix
  tpl({ id: 'tech-dot-matrix', name: 'Dot matrix poster', format: 'poster', category: 'Poster', tags: ['dots', 'pixel', 'signal', 'bitmap'], pages: [
    page(BK, [
      Array.from({ length: 160 }, (_, i) => { const x = rnd(i * 3 + 1) * 1043 + 40, y = rnd(i * 5 + 2) * 1400 + 40; return circle(x, y, 3 + rnd(i) * 3, i % 9 === 0 ? LIME : '#6A6A66'); }),
      ...dots('SIG', 60, 120, 56, 44, WH),
      ...dots('NAL', 60, 600, 56, 44, WH),
      ...dots('07', 560, 1040, 28, 22, LIME),
      ...[[40, 40], [1083, 40], [40, 1547], [1083, 1547]].map(([x, y]) => plus(x, y, 12, WH)),
      label('Frequency  4.2 GHz\nBandwidth  120 MHz\nGain  +34 dB', 60, 1130, 400, WH, { size: 14 }),
      label('Field recordings\nfrom the edge of range', 60, 1280, 400, '#8A8A86', { size: 14 }),
      label('Listening room, Stockholm\n05 to 21 Nov 2026', 60, 1440, 400, WH, { size: 14 }),
      label('N 59.33 E 18.07', 783, 40, 300, WH, { align: 'right' }),
    ]),
  ]}),
);

const SW = 1920, SH = 1080;
const pg = (n, t, c) => label(`${String(n).padStart(2, '0')} / ${String(t).padStart(2, '0')}`, SW - 380, SH - 64, 300, c, { align: 'right' });
ALL.push(
  // 7 Deck
  tpl({ id: 'tech-systems-deck', name: 'Systems review deck', format: 'slide', category: 'Presentation', tags: ['deck', 'review', 'engineering', 'slides', 'report'], pages: [
    page(BK, [
      ...plus(80, 80, 14, WH), ...plus(SW - 80, 80, 14, WH), ...plus(80, SH - 80, 14, WH), ...plus(SW - 80, SH - 80, 14, WH),
      label('Platform team / Quarterly review', 130, 70, 800, WH, { size: 18 }),
      label('Q3 2026', SW - 430, 70, 300, LIME, { size: 18, align: 'right' }),
      T('Systems\nreview', 120, 250, 1400, { font: GRO, size: 300, weight: 800, ls: -90, lh: 0.9, color: WH }),
      rect(1500, 260, 300, 300, LIME),
      L(1500, 600, 1800, 600, WH, 1.5),
      label('Prepared by\nInfrastructure\nDistributed to all leads', 1500, 630, 300, WH, { size: 16 }),
      label('Confidential draft 3', 130, SH - 70, 600, '#8A8A86', { size: 16 }),
    ]),
    page(LIME, [
      label('Availability, 90 days', 80, 70, 800, BK, { size: 18, weight: 700 }),
      L(80, 120, SW - 80, 120, BK, 2),
      T('99.94%', 60, 160, 1800, { font: GRO, size: 520, weight: 800, ls: -110, lh: 1, color: BK }),
      L(80, 760, SW - 80, 760, BK, 2),
      ...[['Incidents', '3'], ['Longest outage', '41 min'], ['Error budget left', '62 %'], ['Pages at night', '0']].flatMap(([a, b], i) => [
        label(a, 80 + i * 450, 790, 400, BK, { size: 16, weight: 700 }),
        T(b, 80 + i * 450, 830, 420, { font: GRO, size: 90, weight: 700, ls: -35, color: BK }),
      ]),
      pg(2, 4, BK),
    ]),
    page(WH, [
      label('Service table', 80, 70, 800, BK, { size: 18, weight: 700 }),
      T('Where the\nweight sits', 80, 150, 800, { font: GRO, size: 130, weight: 800, ls: -50, lh: 0.95, color: BK }),
      ...[['auth', '14 ms', '99.99'], ['billing', '88 ms', '99.95'], ['search', '131 ms', '99.90'], ['media', '240 ms', '99.81'], ['notify', '36 ms', '99.97'], ['export', '1.9 s', '99.40']].flatMap(([a, b, c], i) => {
        const y = 150 + i * 120;
        return [L(1000, y, SW - 80, y, BK, 1.5), T(a, 1000, y + 22, 300, { font: GRO, size: 50, weight: 700, ls: -15, color: BK }), label('P95  ' + b, 1360, y + 36, 260, BK, { size: 20 }), label(c + ' %', 1640, y + 36, 200, BK, { size: 20, align: 'right', weight: 700 }), rect(1000, y + 100, (parseFloat(c) - 99) * 840, 8, i === 5 ? BK : LIME, { stroke: stroke(BK, 1) })];
      }),
      L(1000, 870, SW - 80, 870, BK, 1.5),
      pg(3, 4, BK),
    ]),
    page(BK, [
      label('Next two quarters', 80, 70, 800, WH, { size: 18 }),
      T('Roadmap', 80, 140, 1400, { font: GRO, size: 190, weight: 800, ls: -65, color: WH }),
      L(120, 640, SW - 120, 640, WH, 2),
      ...[['Oct', 'Move media to the edge'], ['Nov', 'Single sign on for partners'], ['Jan', 'Retire the old export job'], ['Feb', 'Region failover test']].flatMap(([a, b], i) => {
        const x = 120 + i * 440;
        return [circle(x - 14, 626, 28, i === 0 ? LIME : BK, { stroke: stroke(i === 0 ? LIME : WH, 2) }), L(x, 640, x, 700, WH, 1), label(a, x, 720, 200, i === 0 ? LIME : WH, { size: 22, weight: 700 }), T(b, x, 770, 400, { font: GRO, size: 38, weight: 500, lh: 1.15, color: WH })];
      }),
      pg(4, 4, WH),
    ]),
  ]}),

  // 8 Story, blue
  tpl({ id: 'tech-node-story', name: 'Node story', format: 'story', category: 'Story', tags: ['story', 'blue', 'binary', 'announcement'], pages: [
    page(BLU, [
      T(binRows(52, 14, 11), 64, 64, 300, { font: MONO, size: 26, weight: 500, ls: 120, lh: 1.5, color: WH, opacity: 0.9 }),
      T(binRows(52, 14, 41), 400, 64, 300, { font: MONO, size: 26, weight: 500, ls: 120, lh: 1.5, color: WH, opacity: 0.35 }),
      T(binRows(52, 14, 71), 736, 64, 300, { font: MONO, size: 26, weight: 500, ls: 120, lh: 1.5, color: WH, opacity: 0.9 }),
      rect(336, 380, 400, 400, BK), rect(736, 780, 280, 280, BK), rect(64, 1180, 200, 200, BK),
      T('NODE', 336, 520, 400, { font: MONO, size: 96, weight: 800, ls: -20, align: 'center', color: BLU }),
      label('Live in\n3 regions', 360, 640, 360, WH, { size: 20, align: 'center' }),
      rect(0, 1440, 1080, 480, BK),
      T('New nodes\nare online', 64, 1480, 950, { font: GRO, size: 130, weight: 800, ls: -55, lh: 0.95, color: WH }),
      label('Frankfurt / Stockholm / Warsaw', 64, 1780, 700, WH, { size: 20 }),
      label('Today', 780, 1780, 236, BLU, { size: 20, align: 'right', weight: 700 }),
    ]),
  ]}),

  // 9 Card
  tpl({ id: 'tech-card', name: 'Mono business card', format: 'card', category: 'Business card', tags: ['card', 'engineer', 'contact', 'lime'], pages: [
    page(BK, [
      ...corners(30, 30, 944, 590, 28, WH, 1.5),
      T('Maja Lindholm', 70, 80, 800, { font: GRO, size: 76, weight: 700, ls: -35, color: WH }),
      label('Firmware engineer', 70, 175, 600, LIME, { size: 20 }),
      L(70, 430, 934, 430, WH, 1, { opacity: 0.5 }),
      label('maja@lindholm.example\n+46 70 555 01 23', 70, 462, 500, WH, { size: 18 }),
      label('Lindholm Embedded\nSveavägen 44, Stockholm', 560, 462, 380, WH, { size: 18, align: 'right' }),
      ...plus(850, 150, 22, LIME, 2), ring(850, 150, 14, LIME, 2),
    ]),
    page(LIME, [
      qr('https://lindholm.example', 70, 70, 250, BK, LIME),
      T('LE', 360, 20, 600, { font: GRO, size: 560, weight: 800, ls: -90, lh: 1, color: BK, align: 'right' }),
      label('Scan for portfolio\nand open source work', 70, 360, 300, BK, { size: 16, weight: 700 }),
      label('lindholm.example', 70, 560, 500, BK, { size: 20, weight: 700 }),
    ]),
  ]}),

  // 10 OG
  tpl({ id: 'tech-release-og', name: 'Release card', format: 'og', category: 'Social', tags: ['release', 'changelog', 'open graph', 'dev'], pages: [
    page(BK, [
      Array.from({ length: 5 }, (_, i) => L(0, 126 * (i + 1), 1200, 126 * (i + 1), WH, 1, { opacity: 0.12 })),
      Array.from({ length: 9 }, (_, i) => L(133 * (i + 1), 0, 133 * (i + 1), 630, WH, 1, { opacity: 0.12 })),
      ...[[133, 126], [1067, 126], [133, 504], [1067, 504]].map(([x, y]) => plus(x, y, 10, LIME)),
      label('Release notes', 56, 48, 400, WH, { size: 16 }),
      label('Stable channel', 744, 48, 400, LIME, { size: 16, align: 'right' }),
      T('v2.4', 46, 130, 800, { font: GRO, size: 330, weight: 800, ls: -95, lh: 1, color: WH }),
      rect(780, 180, 364, 300, LIME),
      T('Faster\nbuilds,\nsmaller\ndiffs', 800, 195, 330, { font: GRO, size: 62, weight: 800, ls: -25, lh: 0.98, color: BK }),
      L(56, 540, 1144, 540, WH, 1),
      label('142 commits / 17 contributors / 3 breaking changes', 56, 560, 900, WH, { size: 15 }),
      label('14 Nov 2026', 744, 560, 400, WH, { size: 15, align: 'right' }),
    ]),
  ]}),
);
