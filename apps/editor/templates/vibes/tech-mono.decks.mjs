import { tpl, page, T, S, rect, circle, path, L, img, svg, qr, solid, stroke } from '../kit.mjs';

// Three long decks for tech-mono. One grid (12 columns, 80 px margins, 32 px gutters),
// one furniture system, a different acid colour per deck.
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
const GREY = '#8F8F8A';
const GREYL = '#66665F';

const rnd = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const SW = 1920, SH = 1080, M = 80;
const PITCH = (SW - 2 * M + 32) / 12;
const cx = (n) => M + n * PITCH;
const cw = (k) => k * PITCH - 32;
const pad = (n) => String(n).padStart(2, '0');

const dark = (acc) => ({ bg: BK, ink: WH, mute: GREY, acc, onAcc: BK });
const light = (acc) => ({ bg: WH, ink: BK, mute: GREYL, acc, onAcc: BK });
const onAcc = (acc, ink = BK) => ({ bg: acc, ink, mute: ink, acc: ink, onAcc: acc });

const hair = (x1, y1, x2, y2, c, o = 0.3, w = 1, p = {}) => L(x1, y1, x2, y2, c, w, { opacity: o, ...p });
const label = (text, x, y, w, c, p = {}) => T(text, x, y, w, { font: MONO, size: 16, weight: 500, ls: 80, upper: true, lh: 1.5, color: c, ...p });
const mono = (text, x, y, w, c, p = {}) => T(text, x, y, w, { font: MONO, size: 24, weight: 500, lh: 1.4, color: c, ...p });
const body = (text, x, y, w, c, p = {}) => T(text, x, y, w, { font: GRO, size: 32, weight: 400, lh: 1.3, color: c, ...p });
const head = (text, x, y, w, c, p = {}) => T(text, x, y, w, { font: GRO, size: 80, weight: 700, ls: -35, lh: 1.0, color: c, ...p });
const big = (text, x, y, w, c, size, p = {}) => T(text, x, y, w, { font: GRO, size, weight: 800, ls: -Math.min(45, Math.round(size * 0.14)), lh: 0.9, color: c, ...p });
const plus = (x, y, s, c, w = 1) => [L(x - s, y, x + s, y, c, w), L(x, y - s, x, y + s, c, w)];
const box = (x, y, w, h, c, wd = 1.5, p = {}) => S('rect', x, y, w, h, NONE, { stroke: stroke(c, wd), ...p });
const ring = (x, y, r, c, w = 1.5, dash) => S('ellipse', x - r, y - r, 2 * r, 2 * r, NONE, { stroke: stroke(c, w, dash) });
const line = (pts) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
const stroked = (d, x, y, w, h, c, wd = 3, p = {}) => path(d, x, y, w, h, NONE, { w0: w, h0: h, stroke: stroke(c, wd), ...p });
const polar = (x, y, r, a) => [x + r * Math.cos(a), y + r * Math.sin(a)];
const arc = (x, y, r, a0, a1) => {
  const [sx, sy] = polar(0, 0, r, a0), [ex, ey] = polar(0, 0, r, a1);
  return `M${(sx + r).toFixed(2)} ${(sy + r).toFixed(2)} A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${(ex + r).toFixed(2)} ${(ey + r).toFixed(2)}`;
};
const sector = (x, y, R, r, a0, a1, c) => {
  const f = (rad, a) => `${(R + rad * Math.cos(a)).toFixed(2)} ${(R + rad * Math.sin(a)).toFixed(2)}`, big = a1 - a0 > Math.PI ? 1 : 0;
  return path(`M${f(R, a0)} A${R} ${R} 0 ${big} 1 ${f(R, a1)} L${f(r, a1)} A${r} ${r} 0 ${big} 0 ${f(r, a0)} Z`, x - R, y - R, 2 * R, 2 * R, c, { w0: 2 * R, h0: 2 * R });
};
const dot = (x, y, d, fill, p = {}) => circle(x - d / 2, y - d / 2, d, fill, p);
const dimLine = (x1, y, x2, text, c = BK) => [L(x1, y, x2, y, c, 1.5, { start: 'bar', end: 'bar' }), T(text, (x1 + x2) / 2 - 450, y - 40, 900, { font: MONO, size: 20, weight: 500, align: 'center', color: c })];
// Registration marks at the four corners of the content frame.
const marks = (th) => [[M, 80], [SW - M, 80], [M, 1000], [SW - M, 1000]].map(([x, y]) => plus(x, y, 7, th.ink));

// Page furniture: section label top left, deck name top right, hairlines, running footer, page number.
function furn(th, { sec, n, total, deck, foot, x0 = M, x1 = SW - M }) {
  return [
    label(sec, x0, 44, 700, th.ink, { weight: 600 }),
    label(deck, x1 - 700, 44, 700, th.mute, { align: 'right' }),
    hair(x0, 80, x1, 80, th.ink, 0.4),
    hair(x0, 1000, x1, 1000, th.ink, 0.4),
    label(foot, x0, 1024, 900, th.mute),
    label(`${pad(n)} / ${pad(total)}`, x1 - 300, 1024, 300, th.ink, { align: 'right', weight: 600 }),
  ];
}

// ---------------------------------------------------------------------------------------------
// 1. Product roadmap and strategy (lime)
// ---------------------------------------------------------------------------------------------
{
  const A = LIME, TOTAL = 15;
  const D = BK, W = WH;
  const F = (th, n, sec, extra = {}) => [...furn(th, { sec, n, total: TOTAL, deck: 'Plumb / Product strategy 2027', foot: 'Internal draft 4, 9 Nov 2026', ...extra }), ...marks(th)];
  const dk = dark(A), lt = light(A);

  // Weekly active teams, 52 weeks
  const weeks = Array.from({ length: 52 }, (_, i) => {
    const t = i / 51;
    let v = 1480 + 640 * Math.pow(t, 1.05);
    v -= 150 * Math.exp(-Math.pow((i - 20) / 3.2, 2));
    v += 60 * (1 / (1 + Math.exp(-(i - 31) / 1.4)));
    v += (Math.sin(i * 2.3) * 14);
    return v;
  });
  weeks[51] = 2140;

  const spark = (vals, x, y, w, h, c, dotc, sw = 3) => {
    const lo = Math.min(...vals), hi = Math.max(...vals);
    const pts = vals.map((v, i) => [(i / (vals.length - 1)) * w, h - ((v - lo) / (hi - lo || 1)) * h]);
    return [stroked(line(pts), x, y, w, h, c, sw), dot(x + pts.at(-1)[0], y + pts.at(-1)[1], 16, dotc ?? c)];
  };

  ALL.push(tpl({
    id: 'deck-tech-mono-roadmap', name: 'Product roadmap deck', format: 'slide', category: 'Presentation',
    tags: ['presentation', 'slides', 'deck', 'roadmap', 'strategy', 'product', 'startup', 'planning', 'quarterly'],
    pages: [
      // 1 Cover
      page(BK, [
        marks(dk),
        label('Plumb / Product and Platform', M, 44, 700, W, { weight: 600 }),
        label('Draft 4, 9 Nov 2026', SW - M - 600, 44, 600, GREY, { align: 'right' }),
        hair(M, 80, SW - M, 80, W, 0.4),
        big('Roadmap\n2027', M - 8, 150, 1340, W, 300),
        rect(1440, 150, 400, 400, A),
        ...[[0, 0, 150], [60, 1, 230], [130, 2, 190], [90, 3, 280]].map(([off, r, len]) => rect(1440 + 36 + off * 0.8, 150 + 44 + r * 84, len * 0.8, 40, BK)),
        label('Four themes, one year', 1476, 490, 340, BK, { weight: 700 }),
        hair(M, 800, SW - M, 800, W, 0.4),
        ...[['Presented by', 'Elin Strand, Head of Product\nTomas Reyes, Head of Platform'], ['For', 'Leadership team and board\nReview on 15 Dec 2026'], ['Reading time', '18 minutes\nThen 20 for questions']].flatMap(([a, b], i) => [
          label(a, cx(i * 4), 830, 500, GREY),
          mono(b, cx(i * 4), 872, 620, W, { size: 28 }),
        ]),
      ], { notes: 'Welcome. This is the plan for what Plumb builds in 2027, how we would staff it, and the three decisions we need from you at the end. Eighteen minutes, then questions.' }),

      // 2 Contents
      page(WH, [
        F(lt, 2, 'Contents'),
        head('Contents', M, 130, 700, BK, { size: 140, ls: -60 }),
        body('What Plumb builds in 2027, what we leave alone, and what we need to get there.', M, 330, 580, BK, { size: 34 }),
        label('Reading time', M, 820, 500, GREYL),
        mono('18 minutes', M, 850, 500, BK, { size: 32, weight: 700 }),
        ...[['01', 'Where we are', '03'], ['02', 'Themes', '06'], ['03', 'Roadmap by quarter', '08'], ['04', 'Bets', '09'], ['05', 'Capacity', '11'], ['06', 'Risks', '12'], ['07', 'What we need', '14']].flatMap(([n, t, p], i) => {
          const y = 130 + i * 118;
          return [
            hair(cx(5), y, SW - M, y, BK, 0.5),
            mono(n, cx(5), y + 38, 100, GREYL, { size: 26 }),
            T(t, cx(6.2), y + 20, 760, { font: GRO, size: 56, weight: 600, ls: -25, color: BK }),
            mono('p ' + p, SW - M - 200, y + 38, 200, BK, { size: 26, align: 'right' }),
          ];
        }),
        hair(cx(5), 130 + 7 * 118, SW - M, 130 + 7 * 118, BK, 0.5),
      ], { notes: 'Seven parts. Part one is short: two slides on where the numbers stand. Most of the time goes on the roadmap and the bets.' }),

      // 3 Statement
      page(BK, [
        F(dk, 3, '01 / Where we are'),
        rect(M, 150, 160, 14, A),
        head('Teams adopt Plumb in a week and leave in a year.', M, 210, 1560, W, { size: 140, ls: -35, lh: 0.98 }),
        hair(M, 760, SW - M, 760, W, 0.4),
        ...[['Median time to first deploy', '3 days'], ['Median account age at churn', '11 months'], ['Churned with "cannot see why builds are slow"', '58 %']].flatMap(([a, b], i) => [
          label(a, cx(i * 4), 790, cw(4) - 20, GREY, { size: 17 }),
          T(b, cx(i * 4), 860, cw(4), { font: GRO, size: 100, weight: 700, ls: -40, color: i === 2 ? A : W }),
        ]),
      ], { notes: 'The product is easy to start and easy to outgrow. Almost six in ten of the teams that leave tell us the same thing: they cannot see why their builds are slow.' }),

      // 4 Metrics
      page(WH, [
        rect(cx(6) - 16, 81, 3 * PITCH, 919, A),
        F(lt, 4, '01 / Where we are'),
        head('Four numbers, Q3 2026', M, 120, 1200, BK, { size: 64 }),
        ...[['Active teams', '2,140', '+18 % on Q2', [1480, 1520, 1590, 1640, 1700, 1790, 1860, 1900, 1990, 2040, 2100, 2140]],
            ['Deploys per week', '410k', '+31 % on Q2', [250, 270, 290, 310, 300, 330, 350, 360, 370, 390, 400, 410]],
            ['Net revenue retention', '104 %', 'down 3 points', [112, 112, 111, 111, 110, 109, 108, 107, 107, 106, 105, 104]],
            ['Median build time', '14.2 min', 'down 1.1 min', [16.4, 16.1, 15.8, 15.9, 15.4, 15.6, 15.2, 14.9, 14.8, 14.5, 14.4, 14.2]]].flatMap(([a, b, c, v], i) => {
          const x = cx(i * 3) + (i ? 0 : 0);
          return [
            i > 0 ? hair(cx(i * 3) - 16, 280, cx(i * 3) - 16, 960, BK, 0.4) : null,
            label(a, x, 290, cw(3) - 8, BK, { weight: 600 }),
            T(b, x, 340, cw(3), { font: GRO, size: i === 3 ? 100 : 120, weight: 800, ls: -45, color: BK }),
            mono(c, x, 500, cw(3), BK, { size: 28 }),
            ...spark(v, x, 590, cw(3) - 40, 280, BK, BK, 3.5),
            label('12 weeks', x, 900, 300, i === 2 ? BK : GREYL),
          ];
        }),
      ], { notes: 'Growth is healthy. The third column is the one to watch: retention has slipped three points in a quarter, and builds are only slowly getting faster.' }),

      // 5 Line chart
      page(BK, (() => {
        const px = cx(4) + 70, py = 200, pw = SW - M - px - 20, ph = 640;
        const yv = (v) => py + ph - ((v - 1000) / 1500) * ph;
        const xv = (i) => px + (i / 51) * pw;
        const pts = weeks.map((v, i) => [xv(i) - px, yv(v) - py]);
        return [
          F(dk, 5, '01 / Where we are'),
          head('Weekly active teams', M, 120, cw(4), W, { size: 72 }),
          body('Growth held through the March price change and stepped up when Pipelines launched in June.', M, 330, cw(4) - 20, W, { size: 30 }),
          label('Change in 52 weeks', M, 560, 500, GREY), T('+45 %', M - 4, 595, cw(4), { font: GRO, size: 150, weight: 800, ls: -45, color: A }),
          label('Source', M, 860, 400, GREY), mono('Product analytics, weeks 45 of 2025 to 44 of 2026', M, 890, cw(4) - 20, W, { size: 22 }),
          ...[1000, 1500, 2000, 2500].flatMap((v) => [
            hair(px, yv(v), px + pw, yv(v), W, v === 1000 ? 0.7 : 0.2),
            mono(v.toLocaleString('en-US'), px - 90, yv(v) - 14, 70, GREY, { size: 20, align: 'right' }),
          ]),
          ...[['Nov', 0], ['Feb', 13], ['May', 26], ['Aug', 39]].flatMap(([m, i]) => [L(xv(i), py + ph, xv(i), py + ph + 12, W, 1, { opacity: 0.7 }), label(m, xv(i) - 20, py + ph + 22, 80, GREY, { size: 17 })]),
          label('Oct', xv(51) - 40, py + ph + 22, 80, GREY, { size: 17, align: 'center' }),
          // annotations
          hair(xv(20), py + 40, xv(20), py + ph, W, 0.5, 1, { dash: 'dash' }),
          mono('Wk 20  Price change', xv(20) + 14, py + 36, 360, W, { size: 20 }),
          hair(xv(31), py + 120, xv(31), py + ph, W, 0.5, 1, { dash: 'dash' }),
          mono('Wk 31  Pipelines launch', xv(31) - 400, py + 116, 380, W, { size: 20, align: 'right' }),
          stroked(line(pts), px, py, pw, ph, A, 4),
          dot(xv(51), yv(2140), 20, A),
          T('2,140', xv(51) - 220, yv(2140) - 80, 200, { font: GRO, size: 56, weight: 800, ls: -20, color: A, align: 'right' }),
        ];
      })(), { notes: 'Read this as a healthy line with one dent. The dent is the March price change; the step is the Pipelines launch. Neither changed the long term slope much, which is the point of the next slide.' }),

      // 6 Divider
      page(A, [
        F(onAcc(A), 6, '02 / Themes'),
        big('02', 760, 70, 1200, BK, 860, { align: 'right' }),
        big('Themes', M - 6, 640, 1000, BK, 190),
        body('Three themes, ranked by what they do for retention.', M, 860, 900, BK, { size: 36, weight: 500 }),
      ], { notes: 'Part two. Three themes, each tied to one number we can check next December.' }),

      // 7 Themes table
      page(WH, [
        F(lt, 7, '02 / Themes'),
        head('Three themes, one test each', M, 120, 1500, BK, { size: 64 }),
        label('Theme', M, 230, 400, GREYL), label('What changes for the customer', cx(4.2), 230, 600, GREYL), label('Target by Dec 2027', cx(9.2), 230, 400, GREYL),
        ...[['A', 'Know why it is slow', 'Every build shows where its time went, with no plugin to install.', 'Median build under 9 min'],
            ['B', 'Stop repeating work', 'Remote cache and test selection are on by default.', '70 % of tasks served from cache'],
            ['C', 'Grow with the team', 'Roles, audit log and single sign on for teams past fifty.', 'Net retention above 112 %']].flatMap(([k, t, d, g], i) => {
          const y = 270 + i * 150;
          return [
            hair(M, y, SW - M, y, BK, 0.6),
            mono(k, M, y + 28, 60, GREYL, { size: 28 }),
            T(t, M + 70, y + 24, cw(3), { font: GRO, size: 46, weight: 700, ls: -20, lh: 1.05, color: BK }),
            body(d, cx(4.2), y + 24, cw(4.4), BK, { size: 30 }),
            mono(g, cx(9.2), y + 28, cw(3) + 32, BK, { size: 26, weight: 600 }),
          ];
        }),
        hair(M, 720, SW - M, 720, BK, 0.6),
        label('Share of engineering effort in 2027', M, 760, 800, BK, { weight: 600 }),
        rect(M, 810, 810, 84, BK), rect(M + 810, 810, 598, 84, GREY), rect(M + 1408, 810, 352, 84, A, { stroke: stroke(BK, 1.5) }),
        mono('A  46 %', M + 20, 835, 300, WH, { size: 28, weight: 700 }), mono('B  34 %', M + 830, 835, 300, BK, { size: 28, weight: 700 }), mono('C  20 %', M + 1428, 835, 300, BK, { size: 28, weight: 700 }),
        mono('Platform health is funded from each theme, not a fourth line.', M, 920, 1400, GREYL, { size: 22 }),
      ], { notes: 'Each theme has one customer visible change and one number. If we cannot measure it in December, we should not have built it.' }),

      // 8 Roadmap gantt
      page(BK, (() => {
        const x0 = 480, x1 = SW - M, mw = (x1 - x0) / 12, y0 = 300, lh = 150;
        const bar = (lane, a, b, text, kind, ) => {
          const x = x0 + a * mw + 3, w = (b - a) * mw - 6, y = y0 + lane * lh + 50;
          if (kind === 'solid') return [rect(x, y, w, 58, W), T(text, x + 16, y + 14, w - 20, { font: GRO, size: 26, weight: 600, ls: -5, color: BK })];
          return [box(x, y, w, 58, W, 1.5, { stroke: stroke(W, 1.5, 'dash') }), T(text, x + 16, y + 14, w - 20, { font: GRO, size: 26, weight: 500, ls: -5, color: W })];
        };
        const ms = (lane, m, text, side = 1) => [S('diamond', x0 + m * mw - 13, y0 + lane * lh + 22, 26, 26, A), mono(text, x0 + m * mw + 20, y0 + lane * lh + 14, 240, A, { size: 20 })];
        return [
          F(dk, 8, '03 / Roadmap by quarter'),
          head('Quarter by quarter', M, 110, 1200, W, { size: 64 }),
          ...['Q1', 'Q2', 'Q3', 'Q4'].flatMap((q, i) => [
            label(q + '  2027', x0 + i * 3 * mw + 8, 214, 300, W, { weight: 700 }),
            hair(x0 + i * 3 * mw, 205, x0 + i * 3 * mw, y0 + 4 * lh, W, i ? 0.35 : 0.6),
          ]),
          ...Array.from({ length: 12 }, (_, m) => [L(x0 + m * mw, 262, x0 + m * mw, 274, W, 1, { opacity: 0.6 }), label('JFMAMJJASOND'[m], x0 + m * mw + 6, 248, 40, GREY, { size: 16 })]),
          hair(x0, 285, x1, 285, W, 0.7),
          ...[['A', 'Know why it is slow'], ['B', 'Stop repeating work'], ['C', 'Grow with the team'], ['P', 'Platform health']].flatMap(([k, t], i) => [
            hair(M, y0 + i * lh + 0, x1, y0 + i * lh, W, i ? 0.25 : 0),
            mono(k, M, y0 + i * lh + 50, 40, GREY, { size: 24 }),
            T(t, M + 50, y0 + i * lh + 42, 330, { font: GRO, size: 30, weight: 600, ls: -10, lh: 1.1, color: W }),
          ]),
          hair(M, y0 + 4 * lh, x1, y0 + 4 * lh, W, 0.6),
          bar(0, 0, 3, 'Build timeline', 'solid'), bar(0, 3, 6, 'Slow step alerts', 'solid'), bar(0, 7, 10, 'Cost per build', 'dash'),
          bar(1, 1, 6, 'Remote cache v2', 'solid'), bar(1, 6, 11, 'Test selection', 'dash'),
          bar(2, 2, 7, 'Roles and audit log', 'solid'), bar(2, 7, 12, 'SSO and SCIM', 'solid'),
          bar(3, 0, 2, 'Arm runners', 'solid'), bar(3, 8, 12, 'EU data region', 'dash'),
          ms(1, 6, 'Cache GA'),
          hair(x0 + 6 * mw, 285, x0 + 6 * mw, y0 + 4 * lh, A, 0.9, 1.5, { dash: 'dash' }),
          rect(M, 934, 36, 20, W), label('Committed', M + 52, 932, 300, W, { size: 16 }),
          box(M + 260, 934, 36, 20, W, 1.5, { stroke: stroke(W, 1.5, 'dash') }), label('Exploring', M + 312, 932, 300, W, { size: 16 }),
          S('diamond', M + 520, 933, 22, 22, A), label('Ship date', M + 556, 932, 300, W, { size: 16 }),
          L(M + 780, 944, M + 830, 944, A, 1.5, { dash: 'dash' }), label('Half year review', M + 846, 932, 400, A, { size: 16 }),
        ];
      })(), { notes: 'Solid bars are committed, outlined bars are exploring and can move. The one date we defend is remote cache going general availability at the end of June.' }),

      // 9 Architecture
      page(WH, [
        F(lt, 9, '04 / Bets'),
        label('Bet 1', M, 118, 300, GREYL, { weight: 600 }),
        head('A cache that works\nwithout setup', M, 150, 1100, BK, { size: 88 }),
        ...[[M, 'N1', 'Runner', 'In the customer CI', false], [760, 'N2', 'Cache edge', '12 regions, new in v2', true], [SW - M - 400, 'N3', 'Object store', 'Compressed, 30 day expiry', false]].flatMap(([x, id, t, s, hot]) => [
          hot ? rect(x, 440, 400, 210, A, { stroke: stroke(BK, 1.5) }) : box(x, 440, 400, 210, BK, 1.5),
          label(id, x + 20, 458, 100, BK, { weight: 700 }),
          T(t, x + 20, 510, 360, { font: GRO, size: 52, weight: 700, ls: -20, color: BK }),
          mono(s, x + 20, 586, 360, BK, { size: 21 }),
        ]),
        L(M + 400, 510, 760, 510, BK, 2, { end: 'arrow' }), mono('hash, 38 ms', M + 400, 464, 280, BK, { size: 20, align: 'center' }),
        L(1160, 510, SW - M - 400, 510, BK, 2, { end: 'arrow' }), mono('miss only', 1160, 464, 280, BK, { size: 20, align: 'center' }),
        L(760, 590, M + 400, 590, BK, 2, { end: 'arrow' }), mono('artifact', M + 400, 598, 280, BK, { size: 20, align: 'center' }),
        L(SW - M - 400, 590, 1160, 590, BK, 2, { end: 'arrow' }), mono('stream', 1160, 598, 280, BK, { size: 20, align: 'center' }),
        stroked('M0 0 L0 80 L1360 80 L1360 0', M + 200, 650, 1360, 80, BK, 1.5, { dash: 'dash' }),
        mono('fallback: direct upload when the edge is down', 760 - 100, 745, 800, GREYL, { size: 20, align: 'center' }),
        hair(M, 850, SW - M, 850, BK, 0.6),
        ...[['Cache hit rate', '61 %', '85 %'], ['Median build', '14.2 min', '9.0 min'], ['Setup time', '2 days', '10 min']].flatMap(([a, b, c], i) => [
          label(a, cx(i * 4), 870, 500, GREYL),
          T(b, cx(i * 4), 905, 240, { font: GRO, size: 46, weight: 500, ls: -15, color: GREYL }),
          L(cx(i * 4) + 250 + (i === 1 ? 20 : 0), 930, cx(i * 4) + 300 + (i === 1 ? 20 : 0), 930, BK, 2, { end: 'arrow' }),
          T(c, cx(i * 4) + 330 + (i === 1 ? 20 : 0), 905, 280, { font: GRO, size: 46, weight: 800, ls: -15, color: BK }),
        ]),
      ], { notes: 'The cache moves from something a customer configures to something they never notice. The new part is the edge: it answers from the nearest of twelve regions, so a hash check costs under 40 milliseconds.' }),

      // 10 Scatter
      page(BK, (() => {
        const px = 170, py = 150, pw = 700, ph = 680;
        const X = (v) => px + (v / 24) * pw, Y = (v) => py + ph - (v / 8) * ph;
        const bets = [['A', 'Remote cache v2', 14, 6.5, true], ['B', 'Build timeline', 5, 4.8, true], ['C', 'Test selection', 18, 3.6, false], ['D', 'SSO and SCIM', 9, 5.5, true], ['E', 'Roles and audit log', 11, 3.0, false], ['F', 'EU data region', 22, 2.2, false], ['G', 'Cost per build', 4, 2.0, false]];
        return [
          F(dk, 10, '04 / Bets'),
          box(px, py, pw, ph, W, 1, { opacity: 0.5 }),
          hair(X(12), py, X(12), py + ph, W, 0.35, 1, { dash: 'dash' }), hair(px, Y(4), px + pw, Y(4), W, 0.35, 1, { dash: 'dash' }),
          ...[0, 4, 8].map((v) => mono(String(v), 80, Y(v) - 14, 70, GREY, { size: 20, align: 'right' })),
          ...[0, 6, 12, 18, 24].map((v) => mono(String(v), X(v) - 30, py + ph + 14, 60, GREY, { size: 20, align: 'center' })),
          label('Effort, engineer months', px, py + ph + 56, 500, W, { size: 15 }),
          label('NRR points', 80, 112, 300, W, { size: 15 }),
          label('Plan', px + 12, py + 10, 200, GREY, { size: 15 }), label('Do first', X(12) + 14, py + 10, 200, W, { size: 15, weight: 700 }),
          label('Cheap wins', px + 12, py + ph - 34, 300, GREY, { size: 15 }), label('Drop', X(12) + 14, py + ph - 34, 200, GREY, { size: 15 }),
          ...bets.flatMap(([k, , e, i, hot]) => [dot(X(e), Y(i), 46, hot ? A : BK, { stroke: stroke(hot ? A : W, 1.5) }), T(k, X(e) - 23, Y(i) - 15, 46, { font: MONO, size: 24, weight: 700, color: hot ? BK : W, align: 'center' })]),
          head('Seven bets,\nranked', cx(6.2), 110, 900, W, { size: 72 }),
          ...bets.flatMap(([k, t, e, i, hot], r) => {
            const y = 330 + r * 92;
            return [hair(cx(6.2), y, SW - M, y, W, 0.3), dot(cx(6.2) + 18, y + 46, 36, hot ? A : BK, { stroke: stroke(hot ? A : W, 1.5) }), T(k, cx(6.2), y + 30, 36, { font: MONO, size: 20, weight: 700, color: hot ? BK : W, align: 'center' }),
              T(t, cx(6.2) + 64, y + 26, 520, { font: GRO, size: 36, weight: hot ? 700 : 500, ls: -12, color: W }),
              mono(`${i.toFixed(1)} pts   ${e} mo`, SW - M - 360, y + 32, 360, hot ? A : GREY, { size: 24, align: 'right' })];
          }),
          hair(cx(6.2), 330 + 7 * 92, SW - M, 330 + 7 * 92, W, 0.3),
        ];
      })(), { notes: 'Impact is our estimate of net retention points, effort is engineer months. Three bets clear the bar for the first half: the cache, the timeline and single sign on.' }),

      // 11 Capacity
      page(WH, (() => {
        const base = 920, u = 38, bw = 190, gap = 80, x0 = 780;
        const data = [['Q1', [4, 4, 2, 2]], ['Q2', [5, 6, 3, 2]], ['Q3', [4, 5, 4, 3]], ['Q4', [3, 4, 6, 3]]];
        const fills = [BK, '#A9A9A3', A, NONE];
        const tc = [WH, BK, BK, BK];
        return [
          F(lt, 11, '05 / Capacity'),
          head('Where the\npeople go', M, 120, 600, BK, { size: 88 }),
          body('Twelve engineers today, sixteen from the second quarter. Effort moves from theme A to theme C as the year goes on.', M, 360, cw(4) - 40, BK, { size: 30 }),
          ...[['A  Know why it is slow', 0], ['B  Stop repeating work', 1], ['C  Grow with the team', 2], ['P  Platform health', 3]].flatMap(([t, k], i) => [
            rect(M, 640 + i * 56, 34, 34, fills[k], { stroke: stroke(BK, 1.5) }), mono(t, M + 56, 642 + i * 56, 520, BK, { size: 24 }),
          ]),
          hair(x0 - 40, base, SW - M, base, BK, 0.8),
          ...[0, 4, 8, 12, 16].flatMap((v) => [hair(x0 - 40, base - v * u, SW - M, base - v * u, BK, v ? 0.15 : 0), mono(String(v), x0 - 100, base - v * u - 14, 50, GREYL, { size: 20, align: 'right' })]),
          ...data.flatMap(([q, parts], i) => {
            const x = x0 + i * (bw + gap);
            let y = base;
            const tot = parts.reduce((a, b) => a + b, 0);
            return [
              ...parts.flatMap((n, k) => { y -= n * u; return [rect(x, y, bw, n * u, fills[k], { stroke: stroke(BK, 1.5) }), mono(String(n), x, y + n * u / 2 - 17, bw, tc[k], { size: 24, align: 'center', weight: 700 })]; }),
              T(String(tot), x, y - 64, bw, { font: GRO, size: 48, weight: 800, ls: -15, color: BK, align: 'center' }),
              label(q + ' 2027', x, base + 20, bw, BK, { align: 'center', weight: 600 }),
            ];
          }),
          label('Engineers, headcount at quarter end', x0 - 40, 130, 700, GREYL, { size: 15 }),
        ];
      })(), { notes: 'Four hires land by the end of the second quarter, two in February and two in April. Without them the cache and single sign on cannot both ship in the first half.' }),

      // 12 Risks
      page(BK, [
        F(dk, 12, '06 / Risks'),
        head('Five risks we are watching', M, 110, 1500, W, { size: 64 }),
        label('Risk', M, 215, 300, GREY), label('Likelihood', 760, 215, 200, GREY), label('Impact', 930, 215, 200, GREY), label('What we do about it', 1110, 215, 400, GREY), label('Owner', SW - M - 140, 215, 140, GREY, { align: 'right' }),
        ...[['R1', 'Cache v2 slips past June', 2, 3, 'Cut test selection first, keep the ship date.', 'Platform'],
            ['R2', 'Cloud cost rises with cache traffic', 3, 2, 'Tiered storage and a 30 day expiry.', 'Platform'],
            ['R3', 'Two senior hires take until Q3', 2, 3, 'Two contractors lined up from February.', 'People'],
            ['R4', 'Large customers need SSO by April', 3, 3, 'Pull SSO forward as a beta in March.', 'Product'],
            ['R5', 'A competitor bundles caching free', 2, 2, 'Compete on explanation, not storage.', 'Product']].flatMap(([id, t, l, im, m, o], i) => {
          const y = 250 + i * 134, hot = l * im >= 9;
          const meter = (x, n) => [0, 1, 2].map((k) => rect(x + k * 44, y + 34, 36, 36, k < n ? (hot ? A : W) : NONE, { stroke: stroke(hot ? A : W, 1.5) }));
          return [
            hair(M, y, SW - M, y, W, 0.35),
            mono(id, M, y + 34, 70, hot ? A : GREY, { size: 24, weight: 700 }),
            T(t, M + 80, y + 26, 580, { font: GRO, size: 34, weight: 600, ls: -12, lh: 1.1, color: W }),
            meter(760, l), meter(930, im),
            body(m, 1110, y + 22, 540, W, { size: 28, lh: 1.25 }),
            mono(o, SW - M - 140, y + 34, 140, GREY, { size: 20, align: 'right' }),
          ];
        }),
        hair(M, 250 + 5 * 134, SW - M, 250 + 5 * 134, W, 0.35),
      ], { notes: 'R4 is the one that needs a decision: two of our largest customers have asked for single sign on before April, so we propose a beta in March.' }),

      // 13 Quote
      page(WH, [
        F(lt, 13, '03 / Evidence'),
        label('What customers say', M, 130, 500, GREYL, { weight: 600 }),
        T('We stopped arguing about whose change broke the build. The timeline just shows it.', cx(2), 190, cw(10), { font: GRO, size: 112, weight: 700, ls: -45, lh: 1.0, color: BK }),
        hair(cx(2), 720, SW - M, 720, BK, 0.6),
        T('Dario Okafor', cx(2), 750, 700, { font: GRO, size: 44, weight: 700, ls: -15, color: BK }),
        mono('Staff engineer, Northgate Freight', cx(2), 810, 700, GREYL, { size: 24 }),
        label('Median build', cx(8), 755, 300, GREYL), T('22 → 8 min', cx(8), 785, 500, { font: GRO, size: 64, weight: 800, ls: -25, color: BK }),
        rect(M, 190, 14, 530, A, { stroke: stroke(BK, 1.5) }),
        mono('One of 12 interviews, Sept 2026', cx(2), 900, 800, GREYL, { size: 20 }),
      ], { notes: 'One of twelve customer interviews we ran in September. It is typical: the value is that the argument ends, not that the build gets faster.' }),

      // 14 Ask
      page(BK, [
        ...furn(dk, { sec: '07 / What we need', n: 14, total: TOTAL, deck: 'Plumb / Product strategy 2027', foot: 'Internal draft 4, 9 Nov 2026', x1: 1160 }).slice(0, 4),
        label('14 / 15', 1160 - 300, 1024, 300, W, { align: 'right', weight: 600 }),
        label('Internal draft 4, 9 Nov 2026', M, 1024, 900, GREY),
        ...[[M, 80], [1160, 80], [M, 1000], [1160, 1000]].map(([x, y]) => plus(x, y, 7, W)),
        head('Three decisions\nfor today', M, 130, 1000, W, { size: 88 }),
        ...[['1', 'Approve four hires', 'Two start in February, two in April. Backfills are not included.'], ['2', 'Fund the cache edge', 'Cloud budget for twelve regions through the first year.'], ['3', 'Lock the first half', 'Cache v2, build timeline and SSO. Everything else can move.']].flatMap(([n, t, d], i) => {
          const y = 440 + i * 175;
          return [hair(M, y, 1160, y, W, 0.4), mono(n, M, y + 28, 50, A, { size: 30, weight: 700 }), T(t, M + 80, y + 20, 900, { font: GRO, size: 48, weight: 700, ls: -18, color: W }), body(d, M + 80, y + 86, 960, W, { size: 28 })];
        }),
        rect(1280, 0, 640, 1080, A),
        hair(1280 + 80, 80, SW - M, 80, BK, 0.5), hair(1280 + 80, 1000, SW - M, 1000, BK, 0.5),
        label('The ask', 1360, 44, 300, BK, { weight: 700 }),
        ...plus(SW - M, 80, 7, BK), ...plus(SW - M, 1000, 7, BK),
        ...[['4', 'Engineers'], ['1.2M', 'Cloud budget, year one'], ['15 Dec', 'Decision date']].flatMap(([a, b], i) => [
          i ? hair(1360, 170 + i * 280, SW - M, 170 + i * 280, BK, 0.5) : null,
          T(a, 1350, 190 + i * 280, 520, { font: GRO, size: 190, weight: 800, ls: -70, lh: 1, color: BK }),
          label(b, 1360, 395 + i * 280, 460, BK, { weight: 700 }),
        ]),
      ], { notes: 'The ask in one slide. Four hires, a cloud budget for the cache edge, and a decision by the fifteenth of December so the February hires can start on time.' }),

      // 15 Closing
      page(BK, [
        F(dk, 15, 'Questions'),
        rect(M, 150, 160, 14, A),
        big('Questions', M - 8, 200, 1760, W, 300),
        hair(M, 700, SW - M, 700, W, 0.4),
        ...[['Product', 'Elin Strand', 'elin@plumb.example'], ['Platform', 'Tomas Reyes', 'tomas@plumb.example'], ['Data and metrics', 'Wen Ito', 'wen@plumb.example']].flatMap(([a, b, c], i) => [
          label(a, cx(i * 4), 730, 500, GREY),
          T(b, cx(i * 4), 770, 600, { font: GRO, size: 52, weight: 700, ls: -20, color: W }),
          mono(c, cx(i * 4), 850, 640, A, { size: 26 }),
        ]),
        label('Appendix and source tables: plumb.example/roadmap', M, 930, 1000, GREY),
      ], { notes: 'Open the floor. Backup material, including the metric definitions and the full risk register, is in the shared folder.' }),
    ],
  }));
}

// ---------------------------------------------------------------------------------------------
// 2. Research findings (signal orange)
// ---------------------------------------------------------------------------------------------
{
  const A = ORG, TOTAL = 15;
  const F = (th, n, sec) => [...furn(th, { sec, n, total: TOTAL, deck: 'Hallin Research / Eight seconds', foot: 'Study 2026 03, final report, 22 Sept 2026' }), ...marks(th)];
  const dk = dark(A), lt = light(A);
  const wilson = (k, n) => { const z = 1.96, p = k / n, d = 1 + z * z / n, c = (p + z * z / (2 * n)) / d, h = (z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))) / d; return [c - h, c + h]; };
  const pct = (v) => `${Math.round(v * 100)} %`;

  ALL.push(tpl({
    id: 'deck-tech-mono-research', name: 'Research findings deck', format: 'slide', category: 'Presentation',
    tags: ['presentation', 'slides', 'deck', 'research', 'report', 'findings', 'study', 'data', 'science', 'school'],
    pages: [
      // 1 Cover with a ruler
      page(WH, (() => {
        const x0 = M, x1 = SW - M, u = (x1 - x0) / 10, ry = 660;
        return [
          marks(lt),
          label('Hallin Research, Stockholm', M, 44, 700, BK, { weight: 600 }),
          label('Final report', SW - M - 500, 44, 500, GREYL, { align: 'right' }),
          hair(M, 80, SW - M, 80, BK, 0.4),
          big('Eight seconds', M - 6, 140, 1760, BK, 250),
          T('How long a mobile checkout can make people wait before they leave', M, 400, 1100, { font: GRO, size: 52, weight: 500, ls: -18, lh: 1.08, color: BK }),
          rect(x0 + 5 * u, ry - 70, 3 * u, 70, A),
          mono('Where people start to leave', x0 + 5 * u + 14, ry - 56, 3 * u, BK, { size: 20, weight: 600 }),
          hair(x0, ry, x1, ry, BK, 0.9, 1.5),
          ...Array.from({ length: 41 }, (_, i) => { const w = i % 4 === 0; return L(x0 + i * u / 4, ry, x0 + i * u / 4, ry + (w ? 34 : i % 2 === 0 ? 22 : 12), BK, w ? 2 : 1, { opacity: w ? 1 : 0.7 }); }),
          ...Array.from({ length: 11 }, (_, i) => mono(String(i), x0 + i * u - 20, ry + 44, 40, BK, { size: 20, align: 'center' })),
          label('Seconds of waiting', x1 - 400, ry + 82, 400, GREYL, { align: 'right', size: 15 }),
          hair(M, 860, SW - M, 860, BK, 0.4),
          ...[['Study', '2026 03, 612 participants'], ['Fieldwork', '12 March to 4 June 2026'], ['Authors', 'K. Hallin, J. Mbeki, S. Ito']].flatMap(([a, b], i) => [label(a, cx(i * 4), 885, 400, GREYL), mono(b, cx(i * 4), 920, 600, BK, { size: 26 })]),
        ];
      })(), { notes: 'This is the report from our spring study on waiting at checkout. The ruler is the whole story: the orange stretch, five to eight seconds, is where people leave.' }),

      // 2 Question
      page(BK, [
        F(dk, 2, '01 / Question'),
        rect(M, 150, 160, 14, A),
        head('How long can a checkout make a person wait before they leave?', M, 200, cw(8) - 30, WH, { size: 116, ls: -45, lh: 1.0 }),
        L(cx(8.4) - 16, 150, cx(8.4) - 16, 960, WH, 1, { opacity: 0.35 }),
        label('Three hypotheses', cx(8.4), 150, 500, GREY),
        ...[['H1', 'Leaving rises smoothly with every extra second.'], ['H2', 'Older people tolerate a wait longer than younger ones.'], ['H3', 'A progress bar changes what people do.']].flatMap(([k, t], i) => {
          const y = 230 + i * 245;
          return [hair(cx(8.4), y, SW - M, y, WH, 0.35), mono(k, cx(8.4), y + 28, 90, A, { size: 30, weight: 700 }), body(t, cx(8.4), y + 80, cw(3.6) + 8, WH, { size: 34, lh: 1.2 })];
        }),
      ], { notes: 'One question, three hypotheses. We wrote them down before the first participant, which matters for the next slides: one of them turned out to be wrong.' }),

      // 3 Method flow
      page(WH, (() => {
        const bw = 296, pitch = 366;
        const steps = [['01', 'Recruit', '612 Swedish adults from a consumer panel, all on their own phone.'], ['02', 'Randomise', 'Four wait conditions, 153 people each.'], ['03', 'Task', 'Buy a train ticket in a working prototype.'], ['04', 'Delay', 'A wait of one to eight seconds at the payment step.'], ['05', 'Measure', 'Completed or left, time, and a trust rating from 1 to 7.']];
        return [
          F(lt, 3, '02 / Method'),
          head('How we ran it', M, 120, 1000, BK, { size: 72 }),
          ...dimLine(M, 270, SW - M, 'Remote, 12 March to 4 June 2026, median session 14 minutes'),
          ...steps.flatMap(([n, t, d], i) => {
            const x = M + i * pitch, hot = i === 3;
            return [
              hot ? rect(x, 370, bw, 190, A, { stroke: stroke(BK, 1.5) }) : box(x, 370, bw, 190, BK, 1.5),
              label(n, x + 20, 392, 100, BK, { weight: 700 }),
              T(t, x + 20, 480, bw - 30, { font: GRO, size: 48, weight: 700, ls: -20, color: BK }),
              i < 4 ? L(x + bw, 465, x + pitch, 465, BK, 2, { end: 'arrow' }) : null,
              body(d, x, 590, bw, BK, { size: 30 }),
            ];
          }),
          hair(M, 800, SW - M, 800, BK, 0.4),
          ...[['612', 'sessions completed'], ['14 min', 'median session'], ['3', 'pilot rounds before launch']].flatMap(([a, b], i) => [T(a, cx(i * 4), 825, 500, { font: GRO, size: 76, weight: 800, ls: -30, color: BK }), label(b, cx(i * 4), 918, 500, GREYL)]),
        ];
      })(), { notes: 'Each person saw one condition only, so nobody could compare waits. The delay sat at the payment step because that is where a real checkout calls the bank.' }),

      // 4 Sample
      page(BK, (() => {
        const cxn = 1290, cy = 400, R = 200, r = 118;
        const parts = [['18 to 29', 31, WH], ['30 to 44', 34, '#8F8F8A'], ['45 to 59', 24, A], ['60 and over', 11, '#4A4A46']];
        let a = -Math.PI / 2;
        const arcs = parts.map(([, v, c]) => { const a1 = a + (v / 100) * Math.PI * 2; const el = sector(cxn, cy, R, r, a + 0.015, a1 - 0.015, c); a = a1; return el; });
        const bar = [['5G', 44, WH, BK], ['4G', 41, '#8F8F8A', BK], ['Wifi', 15, A, BK]];
        let bx = M;
        return [
          F(dk, 4, '02 / Method'),
          label('Participants', M, 130, 400, GREY),
          big('612', M - 6, 160, 900, WH, 400),
          mono('296 women, 308 men, 8 other', M, 540, 700, GREY, { size: 26 }),
          label('Age of participants', cx(6) + 90, 130, 400, GREY),
          ...arcs,
          T('Age', cxn - 100, cy - 18, 200, { font: MONO, size: 28, weight: 500, color: GREY, align: 'center' }),
          ...parts.flatMap(([t, v, c], i) => [rect(1590, 270 + i * 76, 26, 26, c), T(t, 1634, 262 + i * 76, 240, { font: GRO, size: 30, weight: 500, color: WH }), mono(v + ' %', 1634, 302 + i * 76 - 6, 200, GREY, { size: 22 })]),
          hair(M, 700, SW - M, 700, WH, 0.4),
          label('Connection during the test', M, 730, 600, GREY),
          ...bar.flatMap(([t, v, c, tc]) => { const w = (v / 100) * 1760; const el = [rect(bx, 780, w, 110, c), T(t, bx + 20, 808, 200, { font: GRO, size: 44, weight: 700, ls: -15, color: tc }), mono(v + ' %', bx + w - 220, 818, 200, tc, { size: 30, weight: 700, align: 'right' })]; bx += w; return el; }),
        ];
      })(), { notes: 'The sample leans slightly to 30 to 44 year olds, which mirrors who buys train tickets on a phone. Everyone was on a phone, mostly on mobile data.' }),

      // 5 Conditions
      page(WH, (() => {
        const x0 = 440, x1 = SW - M, u = (x1 - x0) / 10;
        const rows = [['1.0 s', 1, '153 people', BK], ['2.5 s', 2.5, '153 people', BK], ['5.0 s', 5, '77 plain\n76 with bar', BK], ['8.0 s', 8, '77 plain\n76 with bar', A]];
        return [
          F(lt, 5, '02 / Method'),
          head('Four waits', M, 120, 800, BK, { size: 72 }),
          body('At five and eight seconds, half of each group\nalso saw a progress bar.', cx(6), 130, cw(6) + 60, BK, { size: 30 }),
          ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].flatMap((i) => [hair(x0 + i * u, 310, x0 + i * u, 850, BK, i % 5 === 0 ? 0.4 : 0.12), mono(String(i), x0 + i * u - 20, 858, 40, GREYL, { size: 20, align: 'center' })]),
          ...rows.flatMap(([t, v, n, c], i) => {
            const y = 336 + i * 124;
            return [
              T(t, M, y - 4, 330, { font: GRO, size: 64, weight: 800, ls: -25, color: BK }),
              rect(x0, y, v * u, 60, c, { stroke: stroke(BK, 1.5) }),
              mono(n, x0 + v * u + 18, y + (n.includes('\n') ? 0 : 16), 300, GREYL, { size: 22 }),
            ];
          }),
          hair(x0, 850, x1, 850, BK, 0.8),
          label('Seconds of added wait at the payment step', x0, 905, 900, GREYL, { size: 15 }),
        ];
      })(), { notes: 'The four bars are the four conditions, drawn to the same scale as the ruler on the cover. The eight second wait is long on purpose: we wanted to see where people break.' }),

      // 6 Divider
      page(A, [
        F(onAcc(A), 6, '03 / Findings'),
        label('Five findings', M, 130, 500, BK, { weight: 700 }),
        big('Findings', M - 12, 360, 1900, BK, 470),
      ], { notes: 'Five findings. The first two are about when people leave, the next two about who and what helps, and the last one is about trust.' }),

      // 7 Finding 1
      page(WH, (() => {
        const base = 880, u = 14, bw = 200, x0 = 880, pitch = 245;
        const data = [['1.0 s', 6, '9 of 153'], ['2.5 s', 9, '14 of 153'], ['5.0 s', 23, '35 of 153'], ['8.0 s', 41, '63 of 153']];
        return [
          F(lt, 7, '03 / Finding 1'),
          label('Finding 1', M, 126, 300, GREYL, { weight: 600 }),
          head('Nothing happens until 2.5 seconds, then people start to leave', M, 160, 640, BK, { size: 68, lh: 1.04 }),
          body('Overall, 121 of 612 people left before paying: one in five.', M, 640, 560, BK, { size: 30 }),
          label('Share who abandoned the purchase', x0 - 90, 126, 700, GREYL, { size: 15 }),
          ...[0, 10, 20, 30, 40, 50].flatMap((v) => [hair(x0 - 100, base - v * u, SW - M, base - v * u, BK, v === 0 ? 0.8 : v === 20 ? 0.6 : 0.14, 1, v === 20 ? { dash: 'dash' } : {}), mono(v + '', x0 - 160, base - v * u - 14, 50, GREYL, { size: 20, align: 'right' })]),
          mono('one in five', x0 - 90, base - 20 * u - 36, 200, BK, { size: 20 }),
          ...data.flatMap(([t, v, n], i) => {
            const x = x0 + i * pitch;
            return [
              rect(x, base - v * u, bw, v * u, i === 3 ? A : BK, { stroke: stroke(BK, 1.5) }),
              T(v + ' %', x, base - v * u - 70, bw, { font: GRO, size: 56, weight: 800, ls: -20, color: BK }),
              label(t, x, base + 20, bw, BK, { weight: 700 }),
              mono(n, x, base + 50, bw + 30, GREYL, { size: 18 }),
            ];
          }),
        ];
      })(), { notes: 'H1 said leaving would rise smoothly. It did not. One second and two and a half seconds are statistically the same; the damage starts after that.' }),

      // 8 Big number
      page(A, [
        F(onAcc(A), 8, '03 / Finding 2'),
        label('Finding 2', M, 126, 300, BK, { weight: 700 }),
        big('2.5×', M - 20, 210, 1240, BK, 480),
        T('Going from 2.5 to 5 seconds multiplied the chance of leaving by two and a half.', cx(7.6), 190, cw(4.6), { font: GRO, size: 56, weight: 700, ls: -22, lh: 1.04, color: BK }),
        hair(cx(7.6), 590, SW - M, 590, BK, 0.6),
        ...[['2.5 s', '9 %'], ['5.0 s', '23 %']].flatMap(([a, b], i) => [label(a, cx(7.6) + i * 300, 620, 250, BK, { weight: 700 }), T(b, cx(7.6) + i * 300, 650, 280, { font: GRO, size: 100, weight: 800, ls: -35, color: BK })]),
        mono('Odds ratio 2.9, 95 % interval 1.5 to 5.6', cx(7.6), 800, cw(4.4), BK, { size: 22 }),
        hair(M, 900, SW - M, 900, BK, 0.6),
        label('153 people in each condition, the threshold sits between 2.5 and 5 seconds', M, 925, 1400, BK, { weight: 700 }),
      ], { notes: 'The two groups are the same size, so the comparison is clean. We report the odds ratio in the appendix; the headline is the plain ratio of the two rates.' }),

      // 9 Age dot plot
      page(BK, (() => {
        const px = 640, pw = SW - M - px - 30, u = pw / 100;
        const groups = [['18 to 29', 26, 47], ['30 to 44', 22, 52], ['45 to 59', 11, 37], ['60 and over', 4, 17]];
        const X = (p) => px + p * u;
        return [
          F(dk, 9, '03 / Finding 3'),
          label('Finding 3', M, 126, 300, GREY, { weight: 600 }),
          head('The young leave first', M, 160, 1300, WH, { size: 84 }),
          body('At the eight second wait, the share who abandoned, with 95 percent intervals.', M, 270, 800, WH, { size: 30 }),
          ...[0, 20, 40, 60, 80, 100].flatMap((p) => [hair(X(p), 400, X(p), 880, WH, p === 0 ? 0.7 : 0.18), mono(p + '', X(p) - 30, 890, 60, GREY, { size: 20, align: 'center' })]),
          label('Percent who left', X(0), 936, 500, GREY, { size: 15 }),
          ...groups.flatMap(([t, k, n], i) => {
            const y = 470 + i * 106, p = k / n * 100, [lo, hi] = wilson(k, n).map((v) => v * 100), hot = i === 0;
            return [
              T(t, M, y - 24, 340, { font: GRO, size: 44, weight: 600, ls: -15, color: WH }),
              mono(`${k} of ${n}`, 400, y - 14, 220, GREY, { size: 22 }),
              L(X(lo), y, X(hi), y, hot ? A : WH, 3, { start: 'bar', end: 'bar' }),
              dot(X(p), y, 30, hot ? A : WH),
              T(Math.round(p) + ' %', X(p) - 70, y - 78, 140, { font: GRO, size: 34, weight: 800, ls: -10, color: hot ? A : WH, align: 'center' }),
            ];
          }),
          hair(X(41.2), 400, X(41.2), 880, A, 0.9, 1.5, { dash: 'dash' }),
          label('All ages 41 %', X(41.2) + 10, 834, 300, A, { size: 17 }),
        ];
      })(), { notes: 'This was a surprise. H2 predicted older people would wait longer; the data say younger people leave sooner, though the oldest group is small, which is why its interval is wide.' }),

      // 10 Slope
      page(WH, (() => {
        const lx = 330, rx = 960, y0 = 880, u = 11;
        const Y = (v) => y0 - v * u;
        const sl = [['8.0 s wait', 49, 33, A], ['5.0 s wait', 27, 18, BK]];
        return [
          F(lt, 10, '03 / Finding 4'),
          label('Finding 4', M, 126, 300, GREYL, { weight: 600 }),
          label('No progress bar', lx - 130, 180, 260, BK, { weight: 700, align: 'center' }), label('Progress bar', rx - 130, 180, 260, BK, { weight: 700, align: 'center' }),
          L(lx, 230, lx, y0, BK, 1.5), L(rx, 230, rx, y0, BK, 1.5),
          hair(lx - 60, y0, rx + 60, y0, BK, 0.8),
          mono('0', lx - 100, y0 - 14, 30, GREYL, { size: 20, align: 'right' }),
          ...sl.flatMap(([t, a, b, c], i) => [
            L(lx, Y(a), rx, Y(b), c, 5),
            dot(lx, Y(a), 26, c), dot(rx, Y(b), 26, c),
            T(a + ' %', lx - 200, Y(a) - 24, 150, { font: GRO, size: 48, weight: 800, ls: -15, color: BK, align: 'right' }),
            T(b + ' %', rx + 44, Y(b) - 24, 150, { font: GRO, size: 48, weight: 800, ls: -15, color: BK }),
            mono(t, lx + 40, Y(a) - 64 + i * 14, 300, BK, { size: 22, weight: 700 }),
          ]),
          label('Share who abandoned', M, 940, 600, GREYL, { size: 15 }),
          T('A progress bar took 16 points off the worst wait.', cx(7.6), 190, cw(4.4), { font: GRO, size: 76, weight: 700, ls: -30, lh: 1.02, color: BK }),
          hair(cx(7.6), 640, SW - M, 640, BK, 0.6),
          body('At eight seconds: 38 of 77 left without it, 25 of 76 with it. At five seconds the gap was 9 points.', cx(7.6), 670, cw(4.4), BK, { size: 30 }),
        ];
      })(), { notes: 'H3 held. The progress bar changed nothing about the wait, only what people believed was happening, and it recovered about a third of the people we would have lost.' }),

      // 11 Trust
      page(BK, (() => {
        const px = 740, py = 180, pw = SW - M - px - 30, ph = 640, X = (s) => px + (s / 9) * pw, Y = (v) => py + ph - ((v - 3) / 4) * ph;
        const pts = [[1, 5.9, 0.2], [2.5, 5.8, 0.2], [5, 5.1, 0.25], [8, 4.2, 0.3]];
        return [
          F(dk, 11, '03 / Finding 5'),
          label('Finding 5', M, 126, 300, GREY, { weight: 600 }),
          head('Trust falls before people leave', M, 160, cw(5) + 40, WH, { size: 76 }),
          body('Mean trust in the shop, rated from 1 to 7 after the task. Whiskers show 95 percent intervals.', M, 470, cw(4) + 60, WH, { size: 30 }),
          mono('Even among people who paid, an eight second wait cost 1.7 points.', M, 720, cw(4) + 60, A, { size: 24 }),
          ...[3, 4, 5, 6, 7].flatMap((v) => [hair(px, Y(v), px + pw, Y(v), WH, v === 3 ? 0.7 : v === 4 ? 0.5 : 0.15, 1, v === 4 ? { dash: 'dash' } : {}), mono(String(v), px - 70, Y(v) - 14, 50, GREY, { size: 20, align: 'right' })]),
          mono('midpoint', px + pw - 160, Y(4) + 8, 160, GREY, { size: 18, align: 'right' }),
          label('Mean trust, 1 to 7', px - 90, 126, 500, GREY, { size: 15 }),
          ...[0, 2, 4, 6, 8].flatMap((s) => [L(X(s), py + ph, X(s), py + ph + 12, WH, 1, { opacity: 0.7 }), mono(s + ' s', X(s) - 40, py + ph + 22, 80, GREY, { size: 20, align: 'center' })]),
          stroked(line(pts.map(([s, v]) => [X(s) - px, Y(v) - py])), px, py, pw, ph, WH, 2.5, { dash: 'solid' }),
          ...pts.flatMap(([s, v, e], i) => [L(X(s), Y(v + e), X(s), Y(v - e), i === 3 ? A : WH, 3, { start: 'bar', end: 'bar' }), dot(X(s), Y(v), 30, i === 3 ? A : BK, { stroke: stroke(i === 3 ? A : WH, 3) }), T(v.toFixed(1), X(s) + 28, Y(v) - 46, 100, { font: GRO, size: 40, weight: 800, ls: -10, color: i === 3 ? A : WH })]),
        ];
      })(), { notes: 'Trust is the quiet result. Five seconds already costs about eight tenths of a point, well before most people have left. The ones who stay just trust the shop less.' }),

      // 12 Insights 2x2
      page(WH, [
        F(lt, 12, '04 / Insights'),
        head('Four things we now believe', M, 120, 1400, BK, { size: 64 }),
        hair(M, 250, SW - M, 250, BK, 0.6), hair(M, 620, SW - M, 620, BK, 0.6), hair(cx(6) - 16, 250, cx(6) - 16, 960, BK, 0.6),
        ...[['01', 'Two and a half seconds is free. Five is where the cost starts.', 'Findings 1 and 2'], ['02', 'Patience is not the variable. Young people leave faster than old ones.', 'Finding 3'], ['03', 'Showing progress wins back about a third of the people a long wait would lose.', 'Finding 4'], ['04', 'Trust moves before behaviour does. Five seconds already costs eight tenths of a point.', 'Finding 5']].flatMap(([n, t, e], i) => {
          const x = i % 2 ? cx(6) : M, y = i < 2 ? 250 : 620;
          return [mono(n, x, y + 30, 80, GREYL, { size: 28, weight: 700 }), T(t, x, y + 84, cw(6) - 40, { font: GRO, size: 52, weight: 600, ls: -20, lh: 1.08, color: BK }), label(e, x, y + 322, 300, GREYL, { size: 15 })];
        }),
      ], { notes: 'These are the four sentences we would want a product team to remember from the whole study. Each one points back to a finding.' }),

      // 13 Implications, wait budget
      page(BK, (() => {
        const x0 = M, x1 = SW - M, u = (x1 - x0) / 10, y = 340;
        return [
          F(dk, 13, '04 / Implications'),
          head('A wait budget', M, 120, 900, WH, { size: 72 }),
          body('If you run a checkout, spend the first seconds\nfreely and stop at five.', cx(6), 130, cw(6) + 60, WH, { size: 30 }),
          ...Array.from({ length: 41 }, (_, i) => L(x0 + i * u / 4, y - 14, x0 + i * u / 4, y - (i % 4 === 0 ? 40 : i % 2 === 0 ? 28 : 20), WH, 1, { opacity: 0.7 })),
          ...Array.from({ length: 11 }, (_, i) => mono(String(i), x0 + i * u - 20, y - 76, 40, GREY, { size: 20, align: 'center' })),
          box(x0, y, 2.5 * u, 130, WH, 1.5), rect(x0 + 2.5 * u, y, 2.5 * u, 130, '#8F8F8A'), rect(x0 + 5 * u, y, 5 * u, 130, A),
          T('Free', x0 + 20, y + 38, 300, { font: GRO, size: 56, weight: 700, ls: -20, color: WH }),
          T('Watch', x0 + 2.5 * u + 20, y + 38, 300, { font: GRO, size: 56, weight: 700, ls: -20, color: BK }),
          T('Leaving', x0 + 5 * u + 20, y + 38, 300, { font: GRO, size: 56, weight: 700, ls: -20, color: BK }),
          ...[[0, 'Free', 'Spend it on work people cannot see: validation and fraud checks.', cw(3) - 30], [2.5, 'Watch', 'Show progress as soon as the wait passes 2.5 seconds. Do not wait to be asked.', cw(3) - 30], [5, 'Leaving', 'Do not ship it. Split the step, or move the work out of the payment path.', cw(6) - 40]].flatMap(([s, t, d, w]) => [
            L(x0 + s * u, y + 130, x0 + s * u, 720, WH, 1, { opacity: 0.5 }),
            body(d, x0 + s * u + 20, y + 160, w, WH, { size: 34 }),
          ]),
          hair(M, 780, SW - M, 780, WH, 0.4),
          label('Rule of thumb', M, 812, 400, GREY),
          T('Budget two seconds a step. Show progress at 2.5. Stop at 5.', M, 850, 1760, { font: GRO, size: 60, weight: 700, ls: -22, color: WH }),
        ];
      })(), { notes: 'The practical version of the whole study. Three zones on one ruler. If a step cannot finish inside five seconds, the fix is in the design of the step, not in a faster spinner.' }),

      // 14 Limits and contact
      page(WH, [
        F(lt, 14, '05 / Limits'),
        head('What this does not tell you', M, 120, 1500, BK, { size: 64 }),
        ...[['One task', 'Buying a train ticket in a prototype. Other purchases may differ.'], ['Fixed waits', 'Real sites jitter. We did not test a slow start with a fast finish.'], ['One panel', 'Swedish adults with a recent phone. No one on an old handset.']].flatMap(([a, b], i) => {
          const y = 240 + i * 245;
          return [hair(M, y, cx(7) - 16, y, BK, 0.6), mono(`L${i + 1}`, M, y + 34, 70, GREYL, { size: 26, weight: 700 }), T(a, M + 90, y + 24, 600, { font: GRO, size: 56, weight: 700, ls: -22, color: BK }), body(b, M + 90, y + 104, cw(7) - 100, BK, { size: 32 })];
        }),
        rect(cx(7.4), 190, SW - M - cx(7.4), 770, A),
        label('Next study, spring 2027', cx(7.4) + 40, 230, 500, BK, { weight: 700 }),
        T('Variable waits, mixed in one session', cx(7.4) + 40, 280, cw(4.6) - 80, { font: GRO, size: 54, weight: 700, ls: -22, lh: 1.04, color: BK }),
        body('Waits that change within a session, the way real pages behave. Recruiting from January.', cx(7.4) + 40, 440, cw(4.6) - 80, BK, { size: 30 }),
        hair(cx(7.4) + 40, 620, SW - M - 40, 620, BK, 0.6),
        label('Contact', cx(7.4) + 40, 650, 300, BK, { weight: 700 }),
        T('Karin Hallin', cx(7.4) + 40, 690, 600, { font: GRO, size: 44, weight: 700, ls: -15, color: BK }),
        mono('k.hallin@hallin.example\nData: hallin.example/eight', cx(7.4) + 40, 760, cw(4.6) - 60, BK, { size: 24 }),
      ], { notes: 'Three honest limits. We are running a follow up in spring that mixes slow and fast steps in a single session, because real checkouts do that.' }),

      // 15 Appendix table
      page(BK, (() => {
        const rows = [['1.0 s', 'none', 153, 9], ['2.5 s', 'none', 153, 14], ['5.0 s', 'none', 77, 21], ['5.0 s', 'bar', 76, 14], ['8.0 s', 'none', 77, 38], ['8.0 s', 'bar', 76, 25]];
        const trust = ['5.9', '5.8', '5.0', '5.2', '3.9', '4.5'];
        const ys = 256, rh = 96;
        const R = (txt, edge, y, w, p = {}) => mono(txt, edge - w, y, w, WH, { size: 30, align: 'right', ...p });
        return [
          F(dk, 15, 'Appendix'),
          head('Appendix, all six cells', M, 110, 1500, WH, { size: 56 }),
          label('Wait', M, 210, 200, GREY), label('Progress bar', 360, 210, 300, GREY),
          ...[['n', 800, 200], ['Left', 1000, 200], ['Rate', 1200, 200], ['95 % interval', 1580, 360], ['Mean trust', 1840, 250]].map(([h, e, w]) => label(h, e - w, 210, w, GREY, { align: 'right' })),
          ...rows.flatMap(([w, b, n, k], i) => {
            const y = ys + i * rh, [lo, hi] = wilson(k, n);
            return [hair(M, y, SW - M, y, WH, 0.3), mono(w, M, y + 30, 200, WH, { size: 30, weight: 700 }), mono(b, 360, y + 30, 300, GREY, { size: 30 }),
              R(String(n), 800, y + 30, 200), R(String(k), 1000, y + 30, 200), R(pct(k / n), 1200, y + 30, 200, i === 5 ? { color: A, weight: 700 } : {}), R(`${pct(lo)} to ${pct(hi)}`, 1580, y + 30, 360), R(trust[i], 1840, y + 30, 250)];
          }),
          hair(M, ys + 6 * rh, SW - M, ys + 6 * rh, WH, 0.8),
          mono('All', M, ys + 6 * rh + 30, 200, WH, { size: 30, weight: 700 }), R('612', 800, ys + 6 * rh + 30, 200, { weight: 700 }), R('121', 1000, ys + 6 * rh + 30, 200, { weight: 700 }), R('20 %', 1200, ys + 6 * rh + 30, 200, { weight: 700 }), R('5.3', 1840, ys + 6 * rh + 30, 250, { weight: 700 }),
          label('Intervals are Wilson 95 %. Trust is the mean of a 1 to 7 rating.', M, 930, 1300, GREY),
        ];
      })(), { notes: 'The full table behind every chart. Intervals are Wilson intervals. Trust is the mean of a one to seven rating.' }),
    ],
  }));
}

// ---------------------------------------------------------------------------------------------
// 3. Technical talk or workshop (electric blue)
// ---------------------------------------------------------------------------------------------
{
  const A = BLU, TOTAL = 14, SOFT = '#C6CCFF';
  const F = (th, n, sec) => [...furn(th, { sec, n, total: TOTAL, deck: 'Ines Carvalho / Retries without regret', foot: 'Backend Meetup 31, 14 Nov 2026' }), ...marks(th)];
  const lt = light(A), dk = dark(A), bl = { bg: A, ink: WH, mute: SOFT, acc: WH, onAcc: A };
  // A numbered circle on a diagram
  const badge = (n, x, y, fill, ink) => [dot(x, y, 40, fill), T(String(n), x - 20, y - 15, 40, { font: MONO, size: 22, weight: 700, color: ink, align: 'center' })];

  ALL.push(tpl({
    id: 'deck-tech-mono-talk', name: 'Technical talk deck', format: 'slide', category: 'Presentation',
    tags: ['presentation', 'slides', 'deck', 'talk', 'workshop', 'conference', 'engineering', 'developer', 'lecture', 'school'],
    pages: [
      // 1 Cover
      page(A, (() => {
        const lx = 1240, lw = 600, ly = 600, ts = [0, 1, 3, 7, 15];
        return [
          marks(bl),
          label('Workshop, 90 minutes', M, 44, 700, WH, { weight: 600 }),
          label('Backend Meetup 31', SW - M - 600, 44, 600, SOFT, { align: 'right' }),
          hair(M, 80, SW - M, 80, WH, 0.5),
          big('Retries\nwithout\nregret', M - 8, 130, 1100, WH, 250, { lh: 0.88 }),
          label('Seconds since the first failure', lx, 470, lw, SOFT, { size: 15 }),
          hair(lx, ly, lx + lw, ly, WH, 0.9, 1.5),
          ...ts.flatMap((t, i) => [dot(lx + (t / 15) * lw - (i === 4 ? 14 : 0), ly, 28, i === 4 ? BK : WH), mono(String(t), lx + (t / 15) * lw - (i === 4 ? 14 : 0) - 30, ly + 30, 60, WH, { size: 22, align: 'center' })]),
          ...ts.slice(1).map((t, i) => { const x0 = lx + (ts[i] / 15) * lw + 14, x1 = lx + (t / 15) * lw - (i === 3 ? 14 : 0) - 14; return x1 - x0 > 30 ? L(x0 + 4, ly - 40, x1 - 4, ly - 40, WH, 1.5, { start: 'bar', end: 'bar', opacity: 0.8 }) : null; }),
          hair(M, 840, SW - M, 840, WH, 0.5),
          ...[['Speaker', 'Ines Carvalho, platform engineer\nNordkvist, Stockholm'], ['Where', 'Kista Tech Hall, room 4\n14 November 2026, 18:30'], ['Bring', 'A laptop with Docker\nand a pot of strong coffee']].flatMap(([a, b], i) => [label(a, cx(i * 4), 870, 500, SOFT), mono(b, cx(i * 4), 908, 620, WH, { size: 26 })]),
        ];
      })(), { notes: 'Welcome. Ninety minutes: 25 of ideas, 40 of building, a live demo and a short wrap. The dots on the right are the whole talk: waiting longer each time you try again.' }),

      // 2 Agenda
      page(WH, (() => {
        const x0 = M, W0 = SW - 2 * M, u = W0 / 90, y = 480;
        const segs = [[0, 25, 'Concepts', 'Delivery, keys and backoff, drawn out.', BK, WH], [25, 65, 'Lab', 'Build the whole thing in five steps.', A, WH], [65, 77, 'Demo', 'Break a queue on stage.', '#A9A9A3', BK], [77, 90, 'Wrap', 'Takeaways and questions.', WH, BK]];
        return [
          F(lt, 2, 'Agenda'),
          head('Ninety minutes,\nfour parts', M, 120, 1200, BK, { size: 84 }),
          ...[0, 10, 20, 30, 40, 50, 60, 70, 80, 90].flatMap((m) => [L(x0 + m * u, y - 20, x0 + m * u, y - 4, BK, 1, { opacity: 0.8 }), mono(String(m), x0 + m * u - 30, y - 56, 60, GREYL, { size: 20, align: 'center' })]),
          label('Minutes into the evening', M, 382, 400, GREYL, { size: 15 }),
          ...segs.flatMap(([a, b, t, d, f, ink]) => [
            rect(x0 + a * u, y, (b - a) * u, 110, f, { stroke: stroke(BK, 1.5) }),
            mono(`${b - a} min`, x0 + a * u + 18, y + 38, (b - a) * u - 20, ink, { size: 28, weight: 700 }),
            L(x0 + a * u, y + 130, x0 + a * u, y + 460, BK, 1, { opacity: 0.5 }),
            T(t, x0 + a * u + 18, y + 146, (b - a) * u - 24, { font: GRO, size: 50, weight: 700, ls: -20, color: BK }),
            body(d, x0 + a * u + 18, y + 220, (b - a) * u - 36, BK, { size: 30 }),
            mono(`${pad(Math.floor((18 * 60 + 30 + a) / 60))}:${pad((30 + a) % 60)}`, x0 + a * u + 18, y + 380, 200, GREYL, { size: 24 }),
          ]),
        ];
      })(), { notes: 'The bar is drawn to scale. Most of the evening is the lab, because nobody remembers a diagram until they have broken it themselves.' }),

      // 3 Statement with panel
      page(WH, [
        rect(0, 0, 760, SH, A),
        plus(M, 80, 7, WH), plus(680, 80, 7, WH), plus(M, 1000, 7, WH), plus(680, 1000, 7, WH), plus(840, 80, 7, BK), plus(SW - M, 80, 7, BK), plus(840, 1000, 7, BK), plus(SW - M, 1000, 7, BK),
        label('The idea', M, 44, 400, WH, { weight: 600 }),
        label('Backend Meetup 31', 1840 - 600, 44, 600, GREYL, { align: 'right' }),
        hair(M, 80, 680, 80, WH, 0.5), hair(840, 80, SW - M, 80, BK, 0.4),
        big('×2', M - 12, 260, 700, WH, 520),
        mono('twice, on purpose', M, 800, 600, WH, { size: 28 }),
        T('A retry is a promise to do the same thing twice.', 840, 190, 1000, { font: GRO, size: 118, weight: 700, ls: -45, lh: 1.0, color: BK }),
        body('So the second time has to be as safe as the first. Everything in the next ninety minutes follows from that.', 840, 720, 860, BK, { size: 34 }),
        hair(840, 1000, SW - M, 1000, BK, 0.4), hair(M, 1000, 680, 1000, WH, 0.5),
        label('Backend Meetup 31, 14 Nov 2026', M, 1024, 600, SOFT), label('03 / 14', SW - M - 300, 1024, 300, BK, { align: 'right', weight: 600 }),
      ], { notes: 'Say the sentence slowly. Everything we build tonight is about making the second attempt as safe as the first one.' }),

      // 4 Sequence diagram
      page(BK, (() => {
        const xs = [820, 1250, 1680], top = 250, bot = 940;
        const msg = (y, from, to, text, o = {}) => [L(xs[from], y, xs[to], y, o.c ?? WH, o.w ?? 2, { end: 'arrow', ...(o.dash ? { dash: 'dash' } : {}) }), mono(text, Math.min(xs[from], xs[to]) + 20, y - 38, Math.abs(xs[to] - xs[from]) - 40, o.c ?? WH, { size: 22, align: 'center' })];
        return [
          F(dk, 4, '01 / Concepts'),
          label('Concept 1', M, 120, 400, GREY),
          head('At least once, never exactly once', M, 160, cw(4) + 40, WH, { size: 68 }),
          body('A queue promises the job arrives. It cannot promise it arrives once.', M, 520, cw(4), WH, { size: 30 }),
          mono('Job 41 ran twice.\nBoth runs were correct.\nThat is the problem.', M, 740, cw(4) + 40, WH, { size: 26 }),
          ...['Producer', 'Queue', 'Consumer'].flatMap((t, i) => [box(xs[i] - 140, top, 280, 70, WH, 1.5), T(t, xs[i] - 140, top + 16, 280, { font: GRO, size: 34, weight: 600, ls: -10, color: WH, align: 'center' }), L(xs[i], top + 70, xs[i], bot, WH, 1, { dash: 'dash', opacity: 0.5 })]),
          ...msg(420, 0, 1, 'send(job 41)'), ...badge(1, xs[0] - 50, 420, WH, BK),
          ...msg(500, 1, 2, 'deliver(job 41)'), ...badge(2, xs[1] - 50, 500, WH, BK),
          rect(xs[2] - 14, 500, 28, 150, BK, { stroke: stroke(WH, 1.5) }), mono('works 4 s', xs[2] + 26, 556, 200, GREY, { size: 20 }),
          L(xs[2], 660, xs[1], 660, WH, 2, { end: 'arrow', dash: 'dash', opacity: 0.7 }), mono('ack lost', xs[1] + 20, 622, 260, GREY, { size: 22, align: 'center' }),
          ...badge(3, xs[2] - 50, 660, BK, WH).map((e) => ({ ...e, ...(e.type === 'shape' ? { stroke: stroke(WH, 1.5) } : {}) })),
          box(xs[1] - 14, 700, 28, 100, WH, 1.5), mono('30 s timeout', xs[1] + 26, 730, 240, GREY, { size: 20 }),
          ...badge(4, xs[1] - 50, 750, WH, BK),
          ...msg(840, 1, 2, 'deliver(job 41) again', { c: WH, w: 3 }),
          ...badge(5, xs[1] - 50, 840, A, WH),
          ...msg(910, 2, 1, 'ack'), ...badge(6, xs[2] - 50, 910, WH, BK),
        ].filter(Boolean);
      })(), { notes: 'Walk the numbers. One: send. Two: deliver. Three: the consumer finishes but its acknowledgement is lost. Four: the queue waits thirty seconds. Five: it delivers again. The consumer has now done the work twice.' }),

      // 5 Flow chart
      page(WH, (() => {
        const y = 470, h = 150;
        const node = (x, w, t, s, hot) => [hot ? rect(x, y, w, h, A) : box(x, y, w, h, BK, 1.5), T(t, x + 20, y + 30, w - 40, { font: GRO, size: 38, weight: 700, ls: -12, lh: 1.05, color: hot ? WH : BK }), mono(s, x + 20, y + h - 46, w - 30, hot ? SOFT : GREYL, { size: 20 })];
        return [
          F(lt, 5, '01 / Concepts'),
          label('Concept 2', M, 120, 400, GREYL),
          head('A key makes the second run harmless', M, 160, 1400, BK, { size: 72 }),
          body('The caller picks the key once and sends it with every attempt.', M, 330, 1000, BK, { size: 32 }),
          ...node(M, 300, 'Request', 'key 4f2a91c0'),
          L(M + 300, y + h / 2, 520, y + h / 2, BK, 2, { end: 'arrow' }),
          S('diamond', 520, y - 20, 300, h + 40, A), T('Seen this key?', 560, y + 40, 220, { font: GRO, size: 34, weight: 700, ls: -10, lh: 1.05, color: WH, align: 'center' }),
          L(820, y + h / 2, 960, y + h / 2, BK, 2, { end: 'arrow' }), mono('no', 850, y + h / 2 - 40, 80, BK, { size: 24, weight: 700 }),
          ...node(960, 300, 'Do the work', 'one transaction'),
          L(1260, y + h / 2, 1340, y + h / 2, BK, 2, { end: 'arrow' }),
          ...node(1340, 260, 'Save result', 'under the key'),
          L(1600, y + h / 2, 1660, y + h / 2, BK, 2, { end: 'arrow' }),
          ...node(1660, 180, 'Reply', '200'),
          L(670, y + h + 20, 670, 770, BK, 2, { end: 'arrow' }), mono('yes', 690, 676, 80, BK, { size: 24, weight: 700 }),
          ...node(480, 380, 'Return saved reply', 'no work done', false).map((e, i) => (i === 0 ? { ...e, y: 770 } : { ...e, y: e.y + 300 })),
          L(860, 845, 1750, 845, BK, 2), L(1750, 845, 1750, y + h + 4, BK, 2, { end: 'arrow' }),
          mono('Sent as a header with every attempt', SW - M - 700, 335, 700, GREYL, { size: 24, align: 'right' }),
        ];
      })(), { notes: 'The decision diamond is the whole idea. If we have seen the key, we hand back the saved reply and do no work. If not, we do the work and save the reply under the key.' }),

      // 6 Jitter raster
      page(WH, (() => {
        const x0 = 460, x1 = SW - M - 20, u = (x1 - x0) / 32, n = 12;
        const rows = (y0, jitter, c) => Array.from({ length: n }, (_, r) => {
          let t = 0; const out = [];
          for (let k = 0; k < 5; k++) { const d = 2 ** k; t += jitter ? (0.12 + 0.88 * rnd(r * 17 + k * 5 + 3)) * d : d; out.push(dot(x0 + t * u, y0 + r * 19, 12, c)); }
          return out;
        });
        return [
          F(lt, 6, '01 / Concepts'),
          label('Concept 3', M, 120, 400, GREYL),
          head('Backoff needs jitter', M, 160, 1000, BK, { size: 72 }),
          body('Twelve clients fail together and retry on a doubling clock.', cx(6), 170, cw(6), BK, { size: 30 }),
          ...[0, 8, 16, 24, 32].flatMap((t) => [hair(x0 + t * u, 320, x0 + t * u, 870, BK, t ? 0.14 : 0.6), mono(String(t), x0 + t * u - 20, 880, 40, GREYL, { size: 20, align: 'center' })]),
          label('Seconds since the first failure', x0, 925, 700, GREYL, { size: 15 }),
          T('No jitter', M, 340, 340, { font: GRO, size: 44, weight: 700, ls: -15, color: BK }), mono('Five walls of\ntwelve at once.', M, 400, 340, GREYL, { size: 22 }),
          T('Full jitter', M, 650, 340, { font: GRO, size: 44, weight: 700, ls: -15, color: BK }), mono('Same clients,\nspread out.', M, 710, 340, GREYL, { size: 22 }),
          ...rows(342, false, BK).flat(), hair(M, 610, x1, 610, BK, 0.4),
          ...rows(652, true, A).flat(),
        ];
      })(), { notes: 'Both panels show the same twelve clients. Without jitter the retries land in five identical walls and knock the server over again. With jitter the same retries are spread out.' }),

      // 7 Divider
      page(A, [
        F(bl, 7, '02 / Lab'),
        big('Lab', M - 20, 160, 1700, WH, 640),
        label('40 minutes', M, 840, 400, SOFT, { weight: 600 }),
        T('Five steps, laptops open.', cx(5), 830, 900, { font: GRO, size: 64, weight: 700, ls: -24, color: WH }),
      ], { notes: 'Laptops open now. Pull the repo from the link on the last slide, or follow along on the projector and do it later.' }),

      // 8 Steps
      page(WH, [
        F(lt, 8, '02 / Lab'),
        head('Five steps', M, 120, 560, BK, { size: 96 }),
        body('Each step is small enough to test on its own. Do them in this order.', M, 360, cw(4) - 10, BK, { size: 30 }),
        mono('nordkvist.example/lab', M, 880, cw(4), GREYL, { size: 24 }),
        ...[['Name the operation', 'Build the key from the order id and the action, never a random value.', 'Same input, same key'], ['Write the intent', 'Insert a row with the key before anything else happens.', 'Unique index on the key'], ['Do the work', 'Run it in the same transaction as the insert.', 'Both roll back together'], ['Store the answer', 'Save the reply next to the key for 24 hours.', 'A replay returns the saved body'], ['Acknowledge last', 'Ack the message only after the commit succeeds.', 'Kill the consumer, nothing doubles']].flatMap(([t, d, c], i) => {
          const y = 120 + i * 166;
          return [
            hair(cx(4), y, SW - M, y, BK, 0.5),
            rect(cx(4), y + 24, 64, 64, i === 4 ? A : BK), mono(String(i + 1), cx(4), y + 40, 64, WH, { size: 32, weight: 700, align: 'center' }),
            T(t, cx(4) + 100, y + 18, 700, { font: GRO, size: 46, weight: 700, ls: -18, color: BK }),
            body(d, cx(4) + 100, y + 76, 1000, BK, { size: 28 }),
            mono(c, cx(4) + 100, y + 120, 1000, GREYL, { size: 20 }),
          ];
        }),
        hair(cx(4), 120 + 5 * 166, SW - M, 120 + 5 * 166, BK, 0.5),
      ], { notes: 'Five steps, in this order. The last one matters most: acknowledge only after the commit. People often do it first and lose jobs instead of doubling them.' }),

      // 9 Comparison
      page(BK, (() => {
        const cols = [560, 1000, 1440], cwid = 400;
        return [
          F(dk, 9, '02 / Lab'),
          head('What a queue can promise', M, 110, 1400, WH, { size: 72 }),
          rect(1430, 250, 410, 710, A),
          ...['At most once', 'At least once', 'Exactly once effect'].map((t, i) => T(t, cols[i], 270, cwid - 20, { font: GRO, size: 40, weight: 700, ls: -15, lh: 1.05, color: WH })),
          ...[['Lost jobs', 'Possible', 'Never', 'Never'], ['Duplicates', 'Never', 'Possible', 'Absorbed by the key'], ['You build', 'Nothing', 'Nothing', 'Keys and a ledger'], ['Use it for', 'Metrics, logs', 'Email, search index', 'Payments, orders']].flatMap(([r, ...v], i) => {
            const y = 400 + i * 140;
            return [
              hair(M, y, SW - M, y, WH, 0.35),
              label(r, M, y + 40, 420, GREY, { size: 17 }),
              ...v.map((t, k) => T(t, cols[k], y + 28, cwid - 20, { font: GRO, size: 34, weight: k === 2 ? 700 : 500, ls: -10, lh: 1.1, color: WH })),
            ];
          }),
          hair(M, 960, SW - M, 960, WH, 0.35),
        ];
      })(), { notes: 'At least once with an idempotency key behaves like exactly once from the outside. That is the third column, and it is what the lab builds.' }),

      // 10 Numbers
      page(WH, [
        F(lt, 10, '03 / Results'),
        label('Duplicate charges per month, before and after', M, 126, 1000, GREYL, { weight: 600 }),
        big('11', M - 14, 160, 900, BK, 600),
        L(780, 440, 1060, 440, BK, 5, { end: 'arrow' }),
        big('0', 1130, 160, 700, A, 600),
        hair(M, 800, SW - M, 800, BK, 0.5),
        ...[['+38 ms', 'p95 latency added'], ['3 days', 'to roll out'], ['0', 'night pages since']].flatMap(([a, b], i) => [T(a, cx(i * 4), 825, cw(4), { font: GRO, size: 72, weight: 800, ls: -28, color: BK }), label(b, cx(i * 4), 915, 500, GREYL)]),
      ], { notes: 'This is Nordkvist in production over six months. Eleven duplicate charges a month became none. The price was 38 milliseconds on the slowest path.' }),

      // 11 Demo
      page(BK, (() => {
        const x = cx(5), w = SW - M - x;
        const cmds = [['make up', 'queue, worker and ledger running'], ['make flood N=500', '500 jobs sent'], ['make kill', 'worker killed in the middle of a job'], ['make report', '500 sent   537 delivered   37 redelivered']];
        return [
          F(dk, 11, '03 / Demo'),
          label('Live demo, 12 minutes', M, 126, 600, GREY, { weight: 600 }),
          head('Break it\non purpose', M, 170, 700, WH, { size: 120, ls: -45 }),
          body('If the demo gods say no, there is a recorded run at the end of the deck.', M, 560, cw(5) - 20, WH, { size: 30 }),
          box(x, 150, w, 800, WH, 1, { opacity: 0.5 }),
          ...[[x, 150, 1, 1], [x + w, 150, -1, 1], [x, 950, 1, -1], [x + w, 950, -1, -1]].flatMap(([a, b, dx, dy]) => [L(a, b, a + dx * 34, b, WH, 3), L(a, b, a, b + dy * 34, WH, 3)]),
          ...cmds.flatMap(([c, r], i) => {
            const y = 190 + i * 165;
            return [
              mono(String(i + 1), x + 40, y + 8, 50, GREY, { size: 28 }),
              T(c, x + 110, y, w - 150, { font: MONO, size: 44, weight: 700, color: WH }),
              mono(r, x + 110, y + 70, w - 150, GREY, { size: 24 }),
              i < 3 ? hair(x + 40, y + 130, x + w - 40, y + 130, WH, 0.25) : null,
            ];
          }),
          rect(x + 30, 830, w - 60, 90, A), mono('0 applied twice', x + 110, 856, w - 150, WH, { size: 34, weight: 700 }),
        ].filter(Boolean);
      })(), { notes: 'Four commands. Flood the queue with five hundred jobs, kill the worker in the middle, and let the report count what happened. The line to point at is the last one: zero applied twice.' }),

      // 12 Takeaways
      page(A, [
        F(bl, 12, '04 / Wrap'),
        label('Take home', M, 126, 400, SOFT, { weight: 600 }),
        ...['Assume every message arrives twice.', 'Key on the order, not the clock.', 'Add jitter before you add capacity.', 'Acknowledge last.'].flatMap((t, i) => {
          const y = 190 + i * 200;
          return [hair(M, y, SW - M, y, WH, 0.5), T(String(i + 1), M, y + 14, 140, { font: GRO, size: 150, weight: 800, ls: -45, color: WH, lh: 1 }), T(t, cx(2), y + 44, cw(10), { font: GRO, size: 76, weight: 700, ls: -28, lh: 1.0, color: WH })];
        }),
      ], { notes: 'Four lines to remember. If the audience keeps only one, make it the last: acknowledge last.' }),

      // 13 Links
      page(WH, [
        F(lt, 13, '04 / Wrap'),
        head('Read, run, ask', M, 120, 1000, BK, { size: 84 }),
        ...[['Slides and lab', 'nordkvist.example/retries'], ['Exponential Backoff and Jitter', 'Marc Brooker, AWS Architecture Blog, 2015'], ['Life Beyond Distributed Transactions', 'Pat Helland, CIDR, 2007'], ['Idempotent requests', 'Stripe API reference'], ['Recorded demo run', 'nordkvist.example/retries/demo']].flatMap(([a, b], i) => {
          const y = 330 + i * 120;
          return [hair(M, y, 1300, y, BK, 0.5), T(a, M, y + 18, 820, { font: GRO, size: 40, weight: 600, ls: -14, color: BK }), mono(b, M, y + 68, 1100, GREYL, { size: 22 })];
        }),
        hair(M, 330 + 5 * 120, 1300, 330 + 5 * 120, BK, 0.5),
        qr('https://nordkvist.example/retries', 1420, 330, 420, BK, WH),
        label('Scan for the slides and the lab', 1420, 770, 420, BK, { weight: 600 }),
      ], { notes: 'Everything is at the first link. The two papers are short and worth reading; the Brooker post is the one that made me add jitter in the first place.' }),

      // 14 Closing
      page(BK, [
        F(dk, 14, 'Contact'),
        rect(M, 150, 160, 14, A),
        big('Tack', M - 8, 190, 1700, WH, 380),
        hair(M, 700, SW - M, 700, WH, 0.4),
        ...[['Speaker', 'Ines Carvalho', 'ines@nordkvist.example'], ['Office hours', 'Thursdays 15:00', 'Hornsgatan 20, Stockholm'], ['Next meetup', '12 December', 'Backend Meetup 32, Kista']].flatMap(([a, b, c], i) => [
          label(a, cx(i * 4), 730, 500, GREY),
          T(b, cx(i * 4), 770, 600, { font: GRO, size: 48, weight: 700, ls: -18, color: WH }),
          mono(c, cx(i * 4), 840, 640, i ? WH : WH, { size: 26 }),
        ]),
      ], { notes: 'Tack. Questions here or at the bar. I am at the office every Thursday if you want to look at your own queue together.' }),
    ],
  }));
}
