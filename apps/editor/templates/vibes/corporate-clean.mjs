import { tpl, page, T, S, rect, circle, L, img, frame, overlay, svg, qr, stroke, solid, linear, pattern, path } from '../kit.mjs';

const CLEAR = 'rgba(0,0,0,0)';
const HG = 'Hanken Grotesk';
const NR = 'Newsreader';

// ---- helpers -----------------------------------------------------------
const eyebrow = (t, x, y, color, w = 600, size = 20, p = {}) =>
  T(t, x, y, w, { font: HG, size, weight: 600, ls: 140, upper: true, color, lh: 1.2, ...p });
const polar = (cx, cy, r, a) => [cx + r * Math.sin((a * Math.PI) / 180), cy - r * Math.cos((a * Math.PI) / 180)];
const arcD = (cx, cy, r, a0, a1) => {
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
};
// donut: segments [{v, color}]; drawn as stroked arcs
const donut = (cx, cy, r, thick, segs, gap = 1.5) => {
  const total = segs.reduce((a, s) => a + s.v, 0);
  let a = 0;
  const box = r + thick;
  return segs.map((s) => {
    const a0 = a + gap / 2, a1 = a + (s.v / total) * 360 - gap / 2;
    a += (s.v / total) * 360;
    return path(arcD(box, box, r, a0, a1), cx - box, cy - box, box * 2, box * 2, CLEAR, { w0: box * 2, h0: box * 2, stroke: stroke(s.color, thick) });
  });
};
// vertical bars with value labels above and names below
const bars = ({ x, y, w, h, data, max, color, hi, muted, ink, font = HG, vsize = 40, nsize = 22, fmt = (v) => v }) => {
  const n = data.length, gap = w / n * 0.28, bw = w / n - gap;
  return [
    ...data.flatMap(([name, v], i) => {
      const bh = (v / max) * h, bx = x + i * (bw + gap) + gap / 2;
      const last = i === n - 1;
      return [
        rect(bx, y + h - bh, bw, bh, last ? hi : color),
        T(String(fmt(v)), bx - 20, y + h - bh - vsize * 1.35, bw + 40, { font, size: vsize, weight: 600, color: last ? hi : ink, align: 'center', lh: 1.1, ls: -10 }),
        T(name, bx - 20, y + h + 18, bw + 40, { font, size: nsize, weight: 500, color: muted, align: 'center', lh: 1.1 }),
      ];
    }),
    L(x, y + h, x + w, y + h, ink, 2),
  ];
};
// slide furniture
const foot = (name, n, color, line) => [
  L(96, 1002, 1824, 1002, line, 1),
  T(name, 96, 1026, 800, { font: HG, size: 20, weight: 500, color, ls: 40, lh: 1.2 }),
  T(String(n).padStart(2, '0'), 1624, 1026, 200, { font: HG, size: 20, weight: 600, color, align: 'right', ls: 80, lh: 1.2 }),
];

// =========================================================================
const INK = '#0F1720', PAPER = '#F5F4F0', BLUE = '#2250FF', MUTE = '#5F6773', LINE = '#D6D3CA', PALE = '#C9CED8';
const DECK = 'Brightwater  /  Seed round 2025';

const pitchDeck = tpl({
  id: 'corporate-pitch-deck', name: 'Seed pitch deck', format: 'slide', category: 'Presentation',
  tags: ['pitch deck', 'startup', 'investor', 'slides'],
  pages: [
    // 1 title
    page(PAPER, [
      rect(1260, 0, 660, 1080, BLUE),
      ...[[1320, 250, 0.22], [1450, 400, 0.22], [1580, 560, 0.22], [1710, 740, 0.22], [1840, 960, 1]].map(([x, h, o], i) => rect(x - 20, 1080 - h, 100, h, '#FFFFFF', { opacity: i === 4 ? 1 : 0.28 })),
      T('4.8 M', 1300, 80, 380, { font: HG, size: 120, weight: 700, ls: -40, lh: 1, color: '#FFFFFF' }),
      T('EUR recurring revenue\nforecast for 2025', 1306, 220, 380, { font: HG, size: 26, weight: 500, lh: 1.3, color: '#FFFFFF' }),
      rect(0, 0, 1260, 14, INK),
      eyebrow('Seed round  /  2025', 96, 90, BLUE),
      T('Bright\nwater', 86, 250, 1160, { font: HG, size: 270, weight: 700, ls: -70, lh: 0.9, color: INK }),
      T('Quiet, accurate water metering for every building in the Nordics.', 96, 770, 880, { font: HG, size: 40, weight: 400, lh: 1.25, color: MUTE, ls: -10 }),
      L(96, 900, 1164, 900, INK, 2),
      ...[['Founded', '2022'], ['Based in', 'Stockholm'], ['Raising', '4 M EUR']].flatMap(([k, v], i) => [
        eyebrow(k, 96 + i * 360, 925, BLUE, 300, 16), T(v, 96 + i * 360, 955, 320, { font: HG, size: 34, weight: 600, color: INK, lh: 1.1, ls: -10 }),
      ]),
    ]),
    // 2 agenda
    page(PAPER, [
      rect(0, 0, 880, 1080, BLUE),
      eyebrow('Agenda', 96, 96, '#FFFFFF'),
      T('Five things\nin twenty\nminutes', 90, 300, 760, { font: HG, size: 112, weight: 700, ls: -40, lh: 1.02, color: '#FFFFFF' }),
      T('Brightwater\nSeed round 2025', 96, 860, 500, { font: HG, size: 24, weight: 500, lh: 1.35, color: '#BFD0FF' }),
      ...[['The problem', '3 min'], ['What we built', '4 min'], ['Traction', '5 min'], ['The team', '3 min'], ['The ask', '5 min']].flatMap(([t, m], i) => {
        const y = 150 + i * 160;
        return [
          L(1000, y, 1824, y, INK, i === 0 ? 3 : 1),
          T(String(i + 1).padStart(2, '0'), 1000, y + 50, 100, { font: HG, size: 28, weight: 600, color: BLUE, ls: 60, lh: 1.2 }),
          T(t, 1110, y + 36, 520, { font: HG, size: 54, weight: 600, ls: -20, lh: 1.1, color: INK }),
          T(m, 1624, y + 52, 200, { font: HG, size: 28, weight: 500, color: MUTE, align: 'right', lh: 1.2 }),
        ];
      }),
      L(1000, 950, 1824, 950, INK, 1),
      L(1000, 1002, 1824, 1002, LINE, 1), T('02', 1624, 1026, 200, { font: HG, size: 20, weight: 600, color: MUTE, align: 'right', ls: 80, lh: 1.2 }),
    ]),
    // 3 problem
    page(PAPER, [
      T('63%', 70, 150, 1100, { font: HG, size: 460, weight: 700, ls: -60, lh: 1, color: BLUE }),
      T('of leaks in apartment blocks are found when the invoice arrives, weeks after they begin.', 96, 700, 880, { font: HG, size: 40, weight: 500, lh: 1.25, ls: -10, color: INK }),
      L(1180, 160, 1180, 880, LINE, 1),
      eyebrow('The problem', 1260, 160, BLUE),
      T('Water is the one utility nobody watches.', 1260, 220, 564, { font: HG, size: 68, weight: 700, ls: -30, lh: 1.05, color: INK }),
      T('Meters are read once a month by hand. A running toilet wastes 200 litres a day, and the first anyone hears of it is a bill.', 1260, 560, 560, { font: HG, size: 30, weight: 400, lh: 1.4, color: MUTE }),
      T('Source: Swedish Water Association, 2024', 1260, 900, 560, { font: HG, size: 20, weight: 400, color: MUTE }),
      ...foot(DECK, 3, MUTE, LINE),
    ]),
    // 4 numbers
    page(PAPER, [
      eyebrow('Traction', 96, 96, BLUE),
      T('Twelve months of proof', 90, 150, 1500, { font: HG, size: 100, weight: 700, ls: -40, lh: 1.05, color: INK }),
      ...[['18 400', 'apartments metered', 'Across 142 buildings in four cities'], ['91%', 'of leaks caught in a day', 'Median time to alert: 6 hours'], ['0.7%', 'monthly churn', 'No customer has left in the past year']].flatMap(([n, l, s], i) => {
        const x = 96 + i * 612;
        return [
          rect(x, 440, 540, 6, BLUE),
          T(n, x - 6, 500, 560, { font: HG, size: 150, weight: 700, ls: -60, lh: 1, color: INK }),
          T(l, x, 690, 540, { font: HG, size: 38, weight: 600, ls: -10, lh: 1.15, color: INK }),
          T(s, x, 760, 500, { font: HG, size: 26, weight: 400, lh: 1.35, color: MUTE }),
        ];
      }),
      ...foot(DECK, 4, MUTE, LINE),
    ]),
    // 5 chart
    page(PAPER, [
      eyebrow('Revenue', 96, 96, BLUE),
      T('Doubled,\nevery year\nsince launch', 90, 200, 640, { font: HG, size: 96, weight: 700, ls: -40, lh: 1.05, color: INK }),
      T('Recurring revenue in millions of euros, year end. 2025 is the forecast on signed contracts.', 96, 680, 560, { font: HG, size: 28, weight: 400, lh: 1.4, color: MUTE }),
      ...bars({ x: 840, y: 190, w: 984, h: 600, data: [['2021', 0.2], ['2022', 0.5], ['2023', 1.1], ['2024', 2.4], ['2025', 4.8]], max: 4.8, color: PALE, hi: BLUE, muted: MUTE, ink: INK, vsize: 44, nsize: 26, fmt: (v) => v.toFixed(1) }),
      ...foot(DECK, 5, MUTE, LINE),
    ]),
    // 6 team
    page(PAPER, [
      eyebrow('The team', 96, 96, BLUE),
      T('Hardware, software and four winters of field work', 90, 150, 1300, { font: HG, size: 80, weight: 700, ls: -30, lh: 1.05, color: INK }),
      ...[['MA', 'Maja Ekdahl', 'Chief executive', 'Ex water utility engineer'], ['TO', 'Tomas Oyelaran', 'Chief technology officer', 'Built the sensor stack'], ['SL', 'Sofia Lund', 'Head of sales', '11 years in property'], ['KH', 'Karim Haddad', 'Head of data', 'Leak models, PhD KTH']].flatMap(([ini, n, r, d], i) => {
        const x = 96 + i * 440;
        return [
          img(['photos/portrait.jpg', 'photos/man.jpg', 'photos/portrait-window.jpg', 'photos/portrait-man-sun.jpg'][i], x, 430, 392, 392, { filters: { duotone: ['#0A1230', '#E8ECFF'], contrast: 10, grain: 12 } }),
          rect(x, 430, 392, 392, BLUE, { blend: 'multiply', opacity: 0.55 }),
          rect(x, 822, 392, 6, BLUE),
          T(n, x, 850, 392, { font: HG, size: 32, weight: 700, ls: -10, lh: 1.15, color: INK }),
          T(r, x, 894, 392, { font: HG, size: 22, weight: 500, lh: 1.2, color: BLUE }),
          T(d, x, 930, 392, { font: HG, size: 22, weight: 400, lh: 1.2, color: MUTE }),
        ];
      }),
    ]),
    // 7 quote
    page(INK, [
      rect(96, 120, 120, 8, BLUE),
      T('We stopped finding leaks in the invoice and started finding them in the week they began.', 96, 240, 1560, { font: HG, size: 100, weight: 600, ls: -35, lh: 1.08, color: '#FFFFFF' }),
      L(96, 800, 1824, 800, '#FFFFFF', 1, { opacity: 0.25 }),
      T('Elin Forsberg', 96, 840, 700, { font: HG, size: 34, weight: 600, color: '#FFFFFF', lh: 1.2 }),
      T('Property manager, Riksbyggen Uppsala', 96, 888, 900, { font: HG, size: 26, weight: 400, color: '#9AA3B2', lh: 1.2 }),
      ...foot(DECK, 7, '#9AA3B2', '#2A3442'),
    ]),
    // 8 close
    page(BLUE, [
      eyebrow('The ask', 96, 96, '#FFFFFF'),
      T('4 M EUR to\nreach 100 000\napartments', 90, 190, 1500, { font: HG, size: 150, weight: 700, ls: -50, lh: 1.02, color: '#FFFFFF' }),
      L(96, 760, 1824, 760, '#FFFFFF', 2),
      ...[['Talk to us', 'maja@brightwater.example'], ['Data room', 'brightwater.example/seed'], ['Call', '+46 8 555 01 24']].flatMap(([k, v], i) => [
        eyebrow(k, 96 + i * 600, 800, '#BFD0FF', 400, 18), T(v, 96 + i * 600, 840, 580, { font: HG, size: 34, weight: 600, color: '#FFFFFF', lh: 1.2, ls: -10 }),
      ]),
    ]),
  ],
});

// =========================================================================
const FOR = '#0F3D2E', MINT = '#BFF0D4', BONE = '#F3F1EA', FMUTE = '#9DBFAE';
const DECK2 = 'Halden Systems  /  Q3 2025 investor update';
const lineData = [1.2, 1.6, 2.1, 2.5, 3.3, 4.1, 5.2];
const lx = 160, ly = 300, lw = 1600, lh = 520, lmax = 6;
const pts = lineData.map((v, i) => [(i / (lineData.length - 1)) * lw, lh - (v / lmax) * lh]);
const lineD = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');

const investorDeck = tpl({
  id: 'corporate-investor-update', name: 'Investor update deck', format: 'slide', category: 'Presentation',
  tags: ['investor update', 'quarterly', 'report', 'slides', 'chart'],
  pages: [
    page(FOR, [
      rect(1180, 0, 740, 1080, MINT),
      path('M0 420 L110 390 L230 350 L340 300 L450 220 L560 120', 1260, 560, 560, 420, CLEAR, { w0: 560, h0: 420, stroke: stroke(FOR, 8) }),
      path('M0 420 L110 390 L230 350 L340 300 L450 220 L560 120 L560 420 Z', 1260, 560, 560, 420, FOR, { w0: 560, h0: 420, opacity: 0.12 }),
      circle(1260 + 560 - 20, 560 + 120 - 20, 40, FOR),
      eyebrow('Annual recurring revenue', 1260, 110, FOR, 560, 18),
      T('5.2 M', 1250, 160, 600, { font: NR, size: 200, weight: 400, ls: -40, lh: 1, color: FOR }),
      T('Up 27 percent on the second quarter', 1260, 380, 520, { font: HG, size: 30, weight: 500, lh: 1.3, color: FOR }),
      rect(0, 0, 1180, 14, MINT),
      eyebrow('Halden Systems', 96, 96, MINT),
      T('Q3\n2025', 90, 250, 1000, { font: NR, size: 300, weight: 400, ls: -60, lh: 0.92, color: BONE }),
      T('Investor update', 96, 840, 1000, { font: NR, size: 84, weight: 300, ls: -15, lh: 1, color: MINT }),
      T('Sent 14 October 2025 to shareholders and advisers', 96, 960, 900, { font: HG, size: 24, weight: 400, color: FMUTE, lh: 1.3 }),
    ]),
    page(FOR, [
      eyebrow('Highlights', 96, 96, MINT),
      T('The quarter in four numbers', 90, 150, 1500, { font: NR, size: 96, weight: 400, ls: -20, lh: 1.05, color: BONE }),
      ...[['5.2 M', 'Annual recurring revenue, up 27 percent on Q2'], ['118%', 'Net revenue retention across all accounts'], ['31', 'New customers, six of them above 100 seats'], ['19', 'Months of runway at the current burn']].flatMap(([n, l], i) => {
        const x = 96 + (i % 2) * 880, y = 370 + Math.floor(i / 2) * 310;
        return [
          L(x, y, x + 800, y, MINT, 1, { opacity: 0.5 }),
          T(n, x - 6, y + 24, 800, { font: NR, size: 150, weight: 400, ls: -30, lh: 1, color: MINT }),
          T(l, x, y + 196, 720, { font: HG, size: 28, weight: 400, lh: 1.35, color: BONE }),
        ];
      }),
      ...foot(DECK2, 2, FMUTE, '#2B5E4A'),
    ]),
    page(FOR, [
      eyebrow('Recurring revenue', 96, 96, MINT),
      T('Seven quarters, one direction', 90, 150, 1500, { font: NR, size: 96, weight: 400, ls: -20, lh: 1.05, color: BONE }),
      ...[0, 2, 4, 6].map((v) => L(lx, ly + lh - (v / lmax) * lh, lx + lw, ly + lh - (v / lmax) * lh, MINT, 1, { opacity: 0.2 })),
      ...[0, 2, 4, 6].map((v) => T(v + ' M', lx - 110, ly + lh - (v / lmax) * lh - 14, 90, { font: HG, size: 20, color: FMUTE, align: 'right', lh: 1 })),
      path(lineD + ` L${lw} ${lh} L0 ${lh} Z`, lx, ly, lw, lh, MINT, { w0: lw, h0: lh, opacity: 0.14 }),
      path(lineD, lx, ly, lw, lh, CLEAR, { w0: lw, h0: lh, stroke: stroke(MINT, 5) }),
      ...pts.flatMap(([x, y], i) => {
        const last = i === pts.length - 1;
        return [
          circle(lx + x - (last ? 16 : 8), ly + y - (last ? 16 : 8), last ? 32 : 16, last ? BONE : FOR, { stroke: last ? null : stroke(MINT, 4) }),
          T(['Q1 24', 'Q2 24', 'Q3 24', 'Q4 24', 'Q1 25', 'Q2 25', 'Q3 25'][i], lx + x - 60, ly + lh + 20, 120, { font: HG, size: 20, color: FMUTE, align: 'center', lh: 1 }),
          last ? T('5.2 M', lx + x - 270, ly + y - 40, 230, { font: NR, size: 56, color: BONE, align: 'right', lh: 1 }) : null,
        ];
      }),
      ...foot(DECK2, 3, FMUTE, '#2B5E4A'),
    ]),
    page(FOR, [
      eyebrow('Revenue mix', 96, 96, MINT),
      T('Where the money comes from', 90, 150, 1500, { font: NR, size: 96, weight: 400, ls: -20, lh: 1.05, color: BONE }),
      ...donut(520, 640, 230, 90, [{ v: 58, color: MINT }, { v: 27, color: BONE }, { v: 15, color: '#4F8A70' }]),
      T('5.2 M', 400, 590, 240, { font: NR, size: 70, color: BONE, align: 'center', lh: 1 }),
      ...[['58%', 'Subscriptions', MINT], ['27%', 'Usage fees', BONE], ['15%', 'Services', '#4F8A70']].flatMap(([n, l, c], i) => {
        const y = 400 + i * 190;
        return [
          rect(1000, y + 20, 36, 36, c),
          T(n, 1070, y - 14, 400, { font: NR, size: 120, weight: 400, ls: -20, lh: 1, color: BONE }),
          T(l, 1400, y + 30, 420, { font: HG, size: 34, weight: 500, color: BONE, lh: 1.2 }),
          L(1000, y + 150, 1824, y + 150, MINT, 1, { opacity: 0.25 }),
        ];
      }),
      ...foot(DECK2, 4, FMUTE, '#2B5E4A'),
    ]),
    page(FOR, [
      eyebrow('Pipeline', 96, 96, MINT),
      T('From first call to signed', 90, 150, 1500, { font: NR, size: 96, weight: 400, ls: -20, lh: 1.05, color: BONE }),
      ...[['Leads', 640, 1500], ['Qualified', 310, 1180], ['Proposal', 140, 860], ['Signed', 52, 540]].flatMap(([n, v, w], i) => {
        const y = 350 + i * 140;
        return [
          rect(96, y, w, 104, i === 3 ? MINT : '#2F6B54'),
          T(String(v), 126, y + 12, 300, { font: NR, size: 76, color: i === 3 ? FOR : BONE, lh: 1.1 }),
          T(n, 96 + w + 36, y + 30, 400, { font: HG, size: 32, weight: 500, color: BONE, lh: 1.2 }),
        ];
      }),
      T('Conversion from lead to signed: 8.1 percent, up from 6.4', 96, 920, 1400, { font: HG, size: 26, color: FMUTE, lh: 1.3 }),
      ...foot(DECK2, 5, FMUTE, '#2B5E4A'),
    ]),
    page(FOR, [
      eyebrow('Next quarter', 96, 96, MINT),
      T('Three priorities,\none ask', 90, 150, 900, { font: NR, size: 120, weight: 400, ls: -25, lh: 1.02, color: BONE }),
      ...[['Ship the Danish version', 'Launch with two pilot customers by 1 December'], ['Hire two account executives', 'Both start before the end of November'], ['Close the Q4 pipeline', 'Target 7 M ARR at year end']].flatMap(([t, d], i) => {
        const y = 520 + i * 150;
        return [
          L(96, y, 960, y, MINT, 1, { opacity: 0.4 }),
          T(String(i + 1), 96, y + 24, 60, { font: NR, size: 56, color: MINT, lh: 1 }),
          T(t, 180, y + 24, 780, { font: HG, size: 36, weight: 600, color: BONE, lh: 1.2, ls: -10 }),
          T(d, 180, y + 74, 780, { font: HG, size: 24, color: FMUTE, lh: 1.3 }),
        ];
      }),
      rect(1100, 150, 724, 780, MINT),
      eyebrow('The ask', 1160, 210, FOR),
      T('Two warm introductions to Danish housing associations', 1160, 270, 600, { font: NR, size: 70, weight: 400, ls: -15, lh: 1.08, color: FOR }),
      T('Reply to this email and we will send a one page briefing for each.', 1160, 700, 600, { font: HG, size: 28, color: FOR, lh: 1.4 }),
      T('anna@halden.example', 1160, 840, 600, { font: HG, size: 28, weight: 700, color: FOR, lh: 1.2 }),
    ]),
  ],
});


// =========================================================================
const SB = 'Schibsted Grotesk';
const SL = '#1B2430', OR = '#FF5B1F', WARM = '#F6F4EF', SMUTE = '#6A7280', SLINE = '#D9D5CB';

const quarterly = tpl({
  id: 'corporate-quarterly-report', name: 'Quarterly report', format: 'a4', category: 'Report',
  tags: ['report', 'quarterly', 'finance', 'chart', 'kpi'],
  pages: [
    page(WARM, [
      T('Q3', 20, 30, 700, { font: SB, size: 420, weight: 800, ls: -80, lh: 0.9, color: SL }),
      rect(610, 70, 144, 144, OR),
      T('2025', 610, 230, 144, { font: SB, size: 40, weight: 700, ls: -20, lh: 1, color: SL }),
      T('Quarterly\nreport', 44, 520, 700, { font: SB, size: 96, weight: 700, ls: -30, lh: 0.98, color: SL }),
      T('Results, cash position and outlook for the three months to 30 September.', 44, 730, 500, { font: SB, size: 24, lh: 1.35, color: SMUTE }),
      L(44, 960, 750, 960, SL, 2),
      ...[['Company', 'Pelle and Co AB'], ['Period', '1 Jul to 30 Sep'], ['Published', '16 October']].flatMap(([k, v], i) => [
        eyebrow(k, 44 + i * 240, 984, OR, 220, 11), T(v, 44 + i * 240, 1008, 230, { font: SB, size: 18, weight: 600, color: SL, lh: 1.2 }),
      ]),
      T('Page 1 of 3', 44, 1076, 300, { font: SB, size: 12, color: SMUTE, lh: 1.2 }),
    ]),
    page(WARM, [
      eyebrow('02  Financials', 44, 44, OR, 400, 12),
      T('Revenue grew for the fourth quarter running', 44, 84, 640, { font: SB, size: 56, weight: 700, ls: -20, lh: 1.04, color: SL }),
      eyebrow('Revenue, million SEK', 44, 300, SMUTE, 400, 11),
      ...bars({ x: 44, y: 350, w: 706, h: 300, data: [['Q4 24', 31.2], ['Q1 25', 34.8], ['Q2 25', 38.1], ['Q3 25', 43.6]], max: 43.6, color: '#CFCAC0', hi: OR, muted: SMUTE, ink: SL, font: SB, vsize: 30, nsize: 16, fmt: (v) => v.toFixed(1) }),
      eyebrow('Summary income statement', 44, 730, SMUTE, 400, 11),
      ...[['Revenue', '43.6', '+14%'], ['Gross profit', '27.1', '+18%'], ['Operating costs', '21.4', '+9%'], ['Operating profit', '5.7', '+61%']].flatMap(([k, v, d], i) => {
        const y = 760 + i * 66, last = i === 3;
        return [
          L(44, y, 750, y, SL, last ? 2 : 1),
          T(k, 44, y + 18, 400, { font: SB, size: 22, weight: last ? 700 : 500, color: SL, lh: 1.2 }),
          T(v, 440, y + 14, 140, { font: SB, size: 28, weight: 700, color: SL, align: 'right', lh: 1.2 }),
          T(d, 620, y + 20, 130, { font: SB, size: 20, weight: 600, color: last ? OR : SMUTE, align: 'right', lh: 1.2 }),
        ];
      }),
      L(44, 1024, 750, 1024, SL, 1),
      T('Page 2 of 3', 44, 1076, 300, { font: SB, size: 12, color: SMUTE, lh: 1.2 }),
    ]),
    page(SL, [
      eyebrow('03  Outlook', 44, 44, OR, 400, 12),
      T('Against plan, and what comes next', 44, 84, 620, { font: SB, size: 56, weight: 700, ls: -20, lh: 1.04, color: WARM }),
      ...[['New customers', 82, '41 of 50'], ['Gross margin', 96, '62 of 65 percent'], ['Cash runway', 100, '19 of 18 months']].flatMap(([k, v, t], i) => {
        const y = 330 + i * 120;
        return [
          T(k, 44, y, 400, { font: SB, size: 22, weight: 600, color: WARM, lh: 1.2 }),
          T(t, 350, y + 2, 400, { font: SB, size: 20, color: '#9AA3B2', align: 'right', lh: 1.2 }),
          rect(44, y + 44, 706, 14, '#33404F'),
          rect(44, y + 44, 706 * Math.min(v, 100) / 100, 14, OR),
        ];
      }),
      L(44, 740, 750, 740, WARM, 1, { opacity: 0.3 }),
      ...[['Q4 revenue', '47 M'], ['Hires', '6'], ['New markets', '2']].flatMap(([k, v], i) => [
        T(v, 44 + i * 240, 780, 230, { font: SB, size: 84, weight: 800, ls: -30, lh: 1, color: i === 0 ? OR : WARM }),
        T(k, 44 + i * 240, 880, 230, { font: SB, size: 18, color: '#9AA3B2', lh: 1.2 }),
      ]),
      T('We expect growth to continue at a similar pace, led by the two new markets opening in November.', 44, 960, 560, { font: SB, size: 20, lh: 1.4, color: WARM }),
      T('Page 3 of 3', 44, 1076, 300, { font: SB, size: 12, color: '#9AA3B2', lh: 1.2 }),
    ]),
  ],
});

// =========================================================================
const PL = '#2B1240', LI = '#D9C8FF', FG = 'Figtree';
const caseStudy = tpl({
  id: 'corporate-case-study-carousel', name: 'Case study carousel', format: 'post', category: 'Social',
  tags: ['case study', 'carousel', 'linkedin', 'results'],
  pages: [
    page(PL, [
      S('ellipse', 480, -260, 800, 800, LI),
      T('-38%', 560, 40, 600, { font: FG, size: 190, weight: 800, ls: -50, lh: 1, color: PL }),
      eyebrow('Case study 04', 80, 80, LI, 500, 22, { font: FG }),
      T('How Pelle and Co cut returns by 38 percent', 76, 540, 920, { font: FG, size: 112, weight: 700, ls: -40, lh: 1.02, color: '#FFFFFF' }),
      rect(80, 1100, 920, 2, LI, { opacity: 0.4 }),
      T('Retail  /  Stockholm  /  6 minute read', 80, 1140, 700, { font: FG, size: 26, color: LI, lh: 1.2 }),
      ...[0, 1, 2, 3].map((i) => rect(80 + i * 62, 1250, 50, 8, i === 0 ? LI : '#5A3A78')),
      T('Swipe', 880, 1228, 120, { font: FG, size: 26, weight: 600, color: LI, align: 'right', lh: 1.2 }),
    ]),
    page(LI, [
      T('01', 56, 40, 900, { font: FG, size: 560, weight: 800, ls: -60, lh: 1, color: PL }),
      eyebrow('The challenge', 80, 700, PL, 500, 22, { font: FG }),
      T('One in four orders came back, and nobody knew why.', 76, 750, 900, { font: FG, size: 76, weight: 700, ls: -25, lh: 1.08, color: PL }),
      T('Sizing guides were three years old and every return cost the company 11 euros.', 80, 1060, 760, { font: FG, size: 32, lh: 1.4, color: PL }),
      T('2 / 5', 880, 1260, 120, { font: FG, size: 24, weight: 600, color: PL, align: 'right', lh: 1.2 }),
    ]),
    page(PL, [
      eyebrow('The approach', 80, 80, LI, 500, 22, { font: FG }),
      T('Three changes, six weeks', 76, 130, 900, { font: FG, size: 92, weight: 700, ls: -30, lh: 1.02, color: '#FFFFFF' }),
      L(130, 520, 130, 1130, LI, 3),
      ...[['Week 1', 'Read every return note and tag the cause'], ['Week 3', 'Rewrite size guides from real measurements'], ['Week 6', 'Show fit feedback on each product page']].flatMap(([k, v], i) => {
        const y = 500 + i * 300;
        return [
          circle(110, y + 10, 40, i === 2 ? LI : PL, { stroke: stroke(LI, 3) }),
          eyebrow(k, 210, y, LI, 400, 22, { font: FG }),
          T(v, 206, y + 44, 780, { font: FG, size: 46, weight: 600, ls: -10, lh: 1.15, color: '#FFFFFF' }),
        ];
      }),
      T('3 / 5', 880, 1260, 120, { font: FG, size: 24, weight: 600, color: LI, align: 'right', lh: 1.2 }),
    ]),
    page(WARM, [
      eyebrow('The result', 80, 80, PL, 500, 22, { font: FG }),
      T('38%', 66, 110, 960, { font: FG, size: 420, weight: 800, ls: -60, lh: 1, color: PL }),
      T('fewer returns in the first quarter', 80, 560, 700, { font: FG, size: 54, weight: 600, ls: -15, lh: 1.1, color: PL }),
      eyebrow('Return rate, percent of orders', 80, 780, '#6B5A7C', 600, 18, { font: FG }),
      rect(80, 850, 880 * 0.25 / 0.25 * 0.25 * 3.4, 70, '#BBA9D6'),
      rect(80, 950, 880 * 0.155 / 0.25 * 0.25 * 3.4, 70, PL),
      T('Before   25', 90, 862, 600, { font: FG, size: 36, weight: 700, color: PL, lh: 1.2 }),
      T('After   15.5', 90, 962, 600, { font: FG, size: 36, weight: 700, color: '#FFFFFF', lh: 1.2 }),
      ...[['11 EUR', 'saved per kept order'], ['4.6', 'average product rating, up from 4.1']].flatMap(([n, l], i) => [
        T(n, 80 + i * 460, 1090, 420, { font: FG, size: 64, weight: 800, ls: -20, lh: 1, color: PL }),
        T(l, 80 + i * 460, 1170, 400, { font: FG, size: 24, lh: 1.3, color: '#6B5A7C' }),
      ]),
      T('4 / 5', 880, 1285, 120, { font: FG, size: 24, weight: 600, color: PL, align: 'right', lh: 1.2 }),
    ]),
    page(LI, [
      T('Read the full story', 76, 300, 900, { font: FG, size: 130, weight: 700, ls: -45, lh: 1, color: PL }),
      T('Numbers, quotes and the exact steps, in four pages.', 80, 740, 700, { font: FG, size: 38, lh: 1.3, color: PL }),
      rect(80, 920, 640, 110, PL),
      T('pelle.example/cases/returns', 80, 954, 640, { font: FG, size: 32, weight: 600, color: LI, align: 'center', lh: 1.2 }),
      T('Pelle and Co', 80, 1240, 500, { font: FG, size: 28, weight: 700, color: PL, lh: 1.2 }),
      T('5 / 5', 880, 1260, 120, { font: FG, size: 24, weight: 600, color: PL, align: 'right', lh: 1.2 }),
    ]),
  ],
});


// =========================================================================
const GR = '#E9E6DF', LEM = '#F2FF4A', GE = 'Geist';
const arrow = (x, y, color, w = 2) => path('M0 20 H56 M38 0 L58 20 L38 40', x, y, 60, 40, CLEAR, { w0: 60, h0: 40, stroke: stroke(color, w * 2) });

const hiringPost = tpl({
  id: 'corporate-hiring-post', name: 'Open roles post', format: 'post', category: 'Social',
  tags: ['hiring', 'jobs', 'careers', 'linkedin'],
  pages: [page(GR, [
    rect(0, 0, 1080, 14, '#0C0C0C'),
    eyebrow('Halden Systems  /  Stockholm', 70, 64, '#0C0C0C', 700, 20, { font: GE }),
    T('Four open\nroles', 58, 120, 1000, { font: GE, size: 200, weight: 800, ls: -70, lh: 0.9, color: '#0C0C0C' }),
    rect(560, 330, 450, 170, LEM),
    T('We are hiring in product, sales and finance. Remote friendly.', 590, 362, 390, { font: GE, size: 32, weight: 600, ls: -10, lh: 1.2, color: '#0C0C0C' }),
    ...[['Senior product designer', 'Product  /  Full time'], ['Account executive', 'Sales  /  Full time'], ['Finance controller', 'Finance  /  Part time'], ['Data engineer', 'Platform  /  Full time']].flatMap(([a, b], i) => {
      const y = 570 + i * 150;
      return [
        i === 0 ? rect(0, y, 1080, 150, LEM) : null,
        L(70, y, 1010, y, '#0C0C0C', i === 0 ? 3 : 1),
        T(String(i + 1).padStart(2, '0'), 70, y + 54, 70, { font: GE, size: 24, weight: 600, color: '#0C0C0C', lh: 1.2 }),
        T(a, 150, y + 32, 760, { font: GE, size: 52, weight: 700, ls: -20, lh: 1.1, color: '#0C0C0C' }),
        T(b, 150, y + 98, 700, { font: GE, size: 22, weight: 400, lh: 1.2, color: '#4A4A46' }),
        arrow(950, y + 54, '#0C0C0C', 2),
      ];
    }),
    rect(0, 1190, 1080, 160, '#0C0C0C'),
    T('Apply by 30 November', 70, 1226, 700, { font: GE, size: 50, weight: 700, ls: -20, lh: 1.1, color: '#FFFFFF' }),
    T('halden.example/jobs', 70, 1288, 700, { font: GE, size: 26, weight: 500, lh: 1.2, color: LEM }),
    T('No cover letter. Send us something you made.', 590, 1236, 420, { font: GE, size: 22, lh: 1.35, color: '#BDBAB2', align: 'right' }),
  ])],
});

const OR2 = '#FF5B1F';
const hiringStory = tpl({
  id: 'corporate-hiring-story', name: 'Role spotlight story', format: 'story', category: 'Story',
  tags: ['hiring', 'job', 'story', 'role'],
  pages: [page('#0F1720', [
    img('photos/desk.jpg', 0, 0, 1080, 760, { filters: { duotone: ['#0F1720', '#FFB596'], contrast: 16, grain: 14 } }),
    rect(0, 640, 1080, 280, '#0F1720', { opacity: 0 }),
    rect(70, 70, 330, 64, OR2),
    T('We are hiring', 70, 82, 330, { font: HG, size: 28, weight: 700, ls: 40, upper: true, align: 'center', color: '#0F1720', lh: 1.2 }),
    T('Senior\nproduct\ndesigner', 62, 800, 980, { font: HG, size: 168, weight: 800, ls: -60, lh: 0.94, color: '#FFFFFF' }),
    L(70, 1320, 1010, 1320, '#FFFFFF', 1, { opacity: 0.3 }),
    ...[['Where', 'Stockholm, hybrid'], ['Start', 'January 2026'], ['Pay', '65 to 80k SEK']].flatMap(([k, v], i) => [
      eyebrow(k, 70, 1362 + i * 80, OR2, 200, 20), T(v, 330, 1352 + i * 80, 680, { font: HG, size: 40, weight: 500, color: '#FFFFFF', lh: 1.2, ls: -10 }),
    ]),
    rect(70, 1640, 940, 130, OR2),
    T('Apply at halden.example/jobs', 70, 1680, 940, { font: HG, size: 44, weight: 700, ls: -10, color: '#0F1720', align: 'center', lh: 1.2 }),
    T('Applications close 30 November', 70, 1800, 940, { font: HG, size: 24, color: '#9AA3B2', align: 'center', lh: 1.2 }),
  ])],
});

const funding = tpl({
  id: 'corporate-funding-announcement', name: 'Funding announcement', format: 'post', category: 'Social',
  tags: ['announcement', 'funding', 'series a', 'linkedin', 'milestone'],
  pages: [page(BLUE, [
    ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => L(70 + i * 85.45, 0, 70 + i * 85.45, 1350, '#FFFFFF', 1, { opacity: 0.12 })),
    T('8M', -20, 420, 1200, { font: HG, size: 800, weight: 800, ls: -90, lh: 1, color: '#0C2BC4' }),
    eyebrow('Announcement  /  Series A', 70, 80, '#FFFFFF', 800, 22),
    T('We raised\n8 million\neuros', 62, 150, 960, { font: HG, size: 150, weight: 800, ls: -55, lh: 0.96, color: '#FFFFFF' }),
    rect(70, 1020, 940, 2, '#FFFFFF'),
    T('To put a meter in every Nordic apartment block by 2028. Thank you to the 140 customers who trusted us first.', 70, 1050, 640, { font: HG, size: 28, weight: 500, lh: 1.35, color: '#FFFFFF' }),
    eyebrow('Led by', 760, 1050, '#BFD0FF', 250, 16), T('Northlight\nPartners', 760, 1080, 250, { font: HG, size: 30, weight: 700, color: '#FFFFFF', lh: 1.15 }),
    T('With Brightfield, Kaskad and eleven angels', 70, 1250, 940, { font: HG, size: 22, color: '#BFD0FF', lh: 1.2 }),
  ])],
});

const webinarBanner = tpl({
  id: 'corporate-webinar-banner', name: 'Webinar banner', format: 'banner', category: 'Banner',
  tags: ['webinar', 'banner', 'email header', 'event'],
  pages: [page(SL, [
    rect(0, 0, 330, 400, OR),
    T('12', 14, 20, 310, { font: SB, size: 270, weight: 800, ls: -60, lh: 1, color: SL, align: 'center' }),
    T('NOV  /  14:00 CET', 0, 322, 330, { font: SB, size: 22, weight: 700, ls: 100, color: SL, align: 'center', lh: 1.2 }),
    eyebrow('Free webinar  /  45 minutes', 380, 48, OR, 600, 15),
    T('Pricing B2B software\nin practice', 376, 84, 820, { font: SB, size: 66, weight: 700, ls: -25, lh: 1.02, color: '#FFFFFF' }),
    L(380, 262, 1150, 262, '#FFFFFF', 1, { opacity: 0.25 }),
    img('photos/portrait.jpg', 380, 290, 70, 70, { mask: 'ellipse' }), img('photos/man.jpg', 430, 290, 70, 70, { mask: 'ellipse', border: { color: SL, width: 4 } }),
    T('Maja Ekdahl and Tomas Oyelaran', 524, 300, 480, { font: SB, size: 22, weight: 600, color: '#FFFFFF', lh: 1.2 }),
    T('Halden Systems', 524, 330, 480, { font: SB, size: 18, color: '#9AA3B2', lh: 1.2 }),
    T('Save a seat', 960, 308, 200, { font: SB, size: 24, weight: 700, color: OR, align: 'right', lh: 1.2 }),
    arrow(1100, 342, OR, 1.5),
  ])],
});

const webinarOg = tpl({
  id: 'corporate-webinar-card', name: 'Webinar share card', format: 'og', category: 'Social',
  tags: ['webinar', 'og', 'share card', 'event', 'live'],
  pages: [page(BONE, [
    rect(760, 0, 440, 630, FOR),
    img('photos/portrait-window.jpg', 760, 0, 440, 400, { filters: { saturation: -100, contrast: 12 } }),
    rect(760, 400, 440, 230, MINT),
    T('20', 790, 410, 200, { font: HG, size: 150, weight: 800, ls: -50, lh: 1, color: FOR }),
    T('NOV', 960, 436, 200, { font: HG, size: 52, weight: 800, ls: -10, lh: 1, color: FOR }),
    T('Thursday\n15:00 CET', 960, 496, 220, { font: HG, size: 24, weight: 600, color: FOR, lh: 1.25 }),
    L(790, 590, 1170, 590, FOR, 1),
    rect(60, 60, 150, 44, FOR),
    T('LIVE', 60, 69, 150, { font: HG, size: 20, weight: 700, ls: 200, color: MINT, align: 'center', lh: 1.2 }),
    T('How finance teams close the books in three days', 56, 150, 650, { font: HG, size: 62, weight: 700, ls: -25, lh: 1.04, color: FOR }),
    T('With Ines Carvalho, controller at Lindgren Logistics', 60, 470, 600, { font: HG, size: 24, lh: 1.35, color: '#4B5B53' }),
    T('Register at halden.example/live', 60, 560, 600, { font: HG, size: 24, weight: 700, color: FOR, lh: 1.2 }),
  ])],
});

const statPost = tpl({
  id: 'corporate-stat-post', name: 'Big stat post', format: 'square', category: 'Social',
  tags: ['stat', 'number', 'linkedin', 'insight'],
  pages: [page(LEM, [
    T('85', -30, -30, 900, { font: GE, size: 640, weight: 800, ls: -100, lh: 1, color: '#0C0C0C' }),
    T('%', 790, 40, 300, { font: GE, size: 260, weight: 800, ls: -40, lh: 1, color: '#0C0C0C' }),
    rect(70, 700, 940, 3, '#0C0C0C'),
    T('of finance leaders say their month end close still depends on a spreadsheet nobody dares to touch.', 70, 740, 800, { font: GE, size: 46, weight: 600, ls: -15, lh: 1.15, color: '#0C0C0C' }),
    T('Halden finance survey, 412 respondents, September 2025', 70, 980, 700, { font: GE, size: 22, weight: 500, lh: 1.3, color: '#3A3A30' }),
    svg('<svg viewBox="0 0 100 100"><g stroke="#0C0C0C" stroke-width="14" stroke-linecap="butt"><path d="M50 8V92M13.5 29L86.5 71M13.5 71L86.5 29"/></g></svg>', 920, 960, 90, 90),
  ])],
});

const quote = tpl({
  id: 'corporate-customer-quote', name: 'Customer quote', format: 'square', category: 'Social',
  tags: ['testimonial', 'quote', 'customer', 'review'],
  pages: [page(BONE, [
    rect(70, 80, 8, 600, FOR),
    eyebrow('Customer story', 120, 80, FOR, 600, 20),
    T('Month end used to take us nine days. Now it takes three, and nobody works the weekend.', 116, 140, 900, { font: NR, size: 90, weight: 400, ls: -20, lh: 1.08, color: '#10241C' }),
    rect(0, 760, 1080, 320, FOR),
    img('photos/portrait-window.jpg', 70, 810, 220, 220, { mask: 'ellipse', filters: { saturation: -100 } }),
    T('Ines Carvalho', 330, 830, 400, { font: HG, size: 40, weight: 700, ls: -10, color: BONE, lh: 1.2 }),
    T('Controller, Lindgren Logistics', 330, 886, 460, { font: HG, size: 24, color: MINT, lh: 1.3 }),
    T('Using Halden since 2023', 330, 930, 460, { font: HG, size: 22, color: '#8DB5A3', lh: 1.3 }),
    L(790, 830, 790, 1010, MINT, 1, { opacity: 0.4 }),
    T('67%', 820, 810, 230, { font: NR, size: 110, color: MINT, lh: 1, ls: -20 }),
    T('faster close', 820, 930, 230, { font: HG, size: 24, color: BONE, lh: 1.2 }),
  ])],
});

const card = tpl({
  id: 'corporate-business-card', name: 'Business card', format: 'card', category: 'Print',
  tags: ['business card', 'contact', 'stationery'],
  pages: [
    page('#FFFFFF', [
      rect(0, 0, 1004, 14, BLUE),
      T('Maja Ekdahl', 60, 70, 640, { font: HG, size: 72, weight: 700, ls: -30, lh: 1.05, color: INK }),
      T('Chief executive', 62, 160, 500, { font: HG, size: 30, weight: 500, color: BLUE, lh: 1.2 }),
      L(60, 360, 700, 360, INK, 1),
      ...[['Mobile', '+46 70 555 01 24'], ['Email', 'maja@brightwater.example'], ['Office', 'Hornsgatan 10, Stockholm']].flatMap(([k, v], i) => [
        eyebrow(k, 60, 392 + i * 76, MUTE, 120, 14), T(v, 200, 384 + i * 76, 520, { font: HG, size: 28, weight: 500, color: INK, lh: 1.2 }),
      ]),
      rect(780, 70, 164, 164, BLUE),
      S('ellipse', 800, 90, 124, 124, '#FFFFFF'),
      rect(780, 152, 164, 82, BLUE),
      T('Brightwater', 780, 270, 200, { font: HG, size: 26, weight: 700, ls: -10, color: INK, lh: 1.2 }),
    ]),
    page(BLUE, [
      ...[300, 520, 740, 960].map((r) => S('ellipse', 1004 - r, 650 - r, r * 2, r * 2, CLEAR, { stroke: stroke('#FFFFFF', 2), opacity: 0.35 })),
      T('Bright\nwater', 54, 190, 700, { font: HG, size: 150, weight: 700, ls: -50, lh: 0.92, color: '#FFFFFF' }),
      eyebrow('Metering for every building', 60, 560, '#BFD0FF', 600, 18),
      qr('https://brightwater.example', 800, 440, 150, INK, '#FFFFFF'),
    ]),
  ],
});

const TL = '#0E7C7B';
const onePager = tpl({
  id: 'corporate-product-sheet', name: 'Product one pager', format: 'a4', category: 'Print',
  tags: ['one pager', 'fact sheet', 'product', 'brochure'],
  pages: [page('#FFFFFF', [
    rect(0, 0, 794, 360, INK),
    eyebrow('Product sheet  /  2025', 44, 44, TL, 400, 12, { color: '#6FD8D6' }),
    T('Meter\nPro', 40, 80, 400, { font: HG, size: 150, weight: 800, ls: -50, lh: 0.9, color: '#FFFFFF' }),
    T('A wireless water meter that reports every hour and warns you the same day something is wrong.', 470, 100, 280, { font: HG, size: 20, weight: 400, lh: 1.4, color: '#D5DBE5' }),
    rect(470, 250, 280, 60, TL),
    T('From 39 EUR per apartment', 470, 266, 280, { font: HG, size: 18, weight: 700, color: '#FFFFFF', align: 'center', lh: 1.2 }),
    ...[['Hourly readings', 'Sub meter data in a dashboard you can leave open all day.'], ['Same day alerts', 'A leak above 5 litres an hour sends a message to the caretaker.'], ['Ten year battery', 'Sealed unit, no visits. Fits any 15 mm pipe in minutes.']].flatMap(([a, b], i) => {
      const x = 44 + i * 240;
      return [
        T(String(i + 1), x, 400, 60, { font: HG, size: 64, weight: 800, ls: -20, lh: 1, color: TL }),
        L(x, 480, x + 212, 480, INK, 2),
        T(a, x, 496, 212, { font: HG, size: 22, weight: 700, ls: -10, lh: 1.2, color: INK }),
        T(b, x, 530, 212, { font: HG, size: 15, lh: 1.45, color: MUTE }),
      ];
    }),
    eyebrow('Typical household, litres per day', 44, 650, MUTE, 400, 11),
    ...bars({ x: 44, y: 700, w: 340, h: 200, data: [['Before', 164], ['With alerts', 118]], max: 164, color: '#C9CED8', hi: TL, muted: MUTE, ink: INK, vsize: 26, nsize: 14 }),
    eyebrow('Specification', 440, 650, MUTE, 300, 11),
    ...[['Accuracy', 'Class R160'], ['Radio', 'LoRa 868 MHz'], ['Range', '2 km open air'], ['Rating', 'IP68'], ['Warranty', '10 years']].flatMap(([k, v], i) => {
      const y = 690 + i * 44;
      return [L(440, y, 750, y, INK, 1), T(k, 440, y + 11, 150, { font: HG, size: 15, color: MUTE, lh: 1.2 }), T(v, 590, y + 11, 160, { font: HG, size: 16, weight: 600, color: INK, align: 'right', lh: 1.2 })];
    }),
    L(440, 910, 750, 910, INK, 1),
    rect(0, 1000, 794, 123, TL),
    T('Ask for a free test pack', 44, 1034, 500, { font: HG, size: 36, weight: 700, ls: -15, color: '#FFFFFF', lh: 1.1 }),
    T('sales@brightwater.example  /  +46 8 555 01 24', 44, 1080, 600, { font: HG, size: 16, weight: 500, color: '#D8F3F2', lh: 1.2 }),
    qr('https://brightwater.example/pro', 668, 1020, 82, '#0F1720', '#FFFFFF'),
  ])],
});

const invite = tpl({
  id: 'corporate-summit-invite', name: 'Conference invitation', format: 'invite', category: 'Event',
  tags: ['conference', 'summit', 'invitation', 'event'],
  pages: [page('#0C0C0C', [
    rect(24, 24, 432, 625, '#0C0C0C', { stroke: stroke('#3A3A38', 1) }),
    rect(24, 24, 432, 40, LEM),
    T('YOU ARE INVITED', 24, 33, 432, { font: GE, size: 14, weight: 700, ls: 260, color: '#0C0C0C', align: 'center', lh: 1.2 }),
    T('Water\nSummit', 40, 90, 420, { font: GE, size: 108, weight: 800, ls: -45, lh: 0.9, color: '#FFFFFF' }),
    T('26', 36, 280, 420, { font: GE, size: 250, weight: 800, ls: -60, lh: 0.9, color: LEM }),
    L(40, 520, 440, 520, '#FFFFFF', 1, { opacity: 0.4 }),
    ...[['Date', '9 to 10 March'], ['Place', 'Münchenbryggeriet'], ['Doors', '08:30']].flatMap(([k, v], i) => [
      eyebrow(k, 40, 540 + i * 30, LEM, 80, 10, { font: GE }), T(v, 130, 536 + i * 30, 320, { font: GE, size: 16, weight: 600, color: '#FFFFFF', lh: 1.2 }),
    ]),
    T('Two days on the future of utilities. Reply by 15 January.', 40, 634 - 10, 400, { font: GE, size: 11, color: '#9A9A96', lh: 1.3 }),
  ])],
});

const welcome = tpl({
  id: 'corporate-new-hire-post', name: 'Welcome a new hire', format: 'post', category: 'Social',
  tags: ['welcome', 'new hire', 'team', 'announcement'],
  pages: [page(WARM, [
    img('photos/portrait-man-sun.jpg', 0, 0, 1080, 900, { filters: { contrast: 8, saturation: -20 } }),
    rect(0, 0, 1080, 900, '#FF5B1F', { blend: 'multiply', opacity: 0.18 }),
    rect(70, 70, 360, 62, WARM),
    T('Welcome aboard', 70, 82, 360, { font: SB, size: 26, weight: 700, ls: 40, upper: true, color: SL, align: 'center', lh: 1.2 }),
    rect(0, 820, 1080, 530, WARM),
    rect(70, 780, 12, 150, OR),
    T('Noor Hassan', 70, 960, 940, { font: SB, size: 128, weight: 800, ls: -50, lh: 1, color: SL }),
    T('joins as Head of Finance', 74, 1100, 900, { font: SB, size: 48, weight: 500, ls: -10, lh: 1.15, color: SL }),
    L(70, 1200, 1010, 1200, SL, 1),
    eyebrow('Starts', 70, 1230, OR, 200, 18), T('Monday 3 November', 70, 1262, 500, { font: SB, size: 32, weight: 600, color: SL, lh: 1.2 }),
    eyebrow('Before', 560, 1230, OR, 200, 18), T('Fourteen years at Nordea', 560, 1262, 450, { font: SB, size: 32, weight: 600, color: SL, lh: 1.2 }),
  ])],
});

const AM = '#FFB800', WK = '#14120E';
const proposal = tpl({
  id: 'corporate-proposal', name: 'Project proposal', format: 'a4', category: 'Report',
  tags: ['proposal', 'quote', 'scope', 'timeline'],
  pages: [
    page(WK, [
      rect(44, 44, 70, 70, AM),
      S('ellipse', 58, 58, 42, 42, WK),
      eyebrow('Proposal 2025 / 114', 640 - 280, 60, AM, 310, 12, { align: 'right' }),
      T('Website\nand brand\nrefresh', 40, 330, 720, { font: SB, size: 130, weight: 800, ls: -45, lh: 0.94, color: '#FFFFFF' }),
      rect(44, 770, 120, 8, AM),
      T('Prepared for Lindgren Logistics', 44, 810, 600, { font: SB, size: 28, weight: 500, color: '#FFFFFF', lh: 1.2 }),
      T('Valid until 30 November 2025', 44, 850, 600, { font: SB, size: 20, color: '#9A968C', lh: 1.2 }),
      L(44, 1030, 750, 1030, '#FFFFFF', 1, { opacity: 0.3 }),
      T('Studio Norr  /  hello@norr.example', 44, 1056, 600, { font: SB, size: 16, color: '#9A968C', lh: 1.2 }),
    ]),
    page('#FFFFFF', [
      eyebrow('02  Scope and timeline', 44, 44, '#B07F00', 400, 12),
      T('Twelve weeks from kick off to launch', 44, 84, 640, { font: SB, size: 52, weight: 800, ls: -20, lh: 1.05, color: WK }),
      ...['1', '3', '5', '7', '9', '11'].map((w, i) => T('Wk ' + w, 292 + i * 58 - 10, 296, 60, { font: SB, size: 12, color: '#7A766C', lh: 1.2, align: 'center' })),
      ...[['Discovery', 0, 2, '4 800'], ['Brand direction', 2, 4, '9 200'], ['Design system', 4, 8, '12 500'], ['Build', 6, 11, '21 000'], ['Launch', 11, 12, '3 500']].flatMap(([n, a, b, c], i) => {
        const y = 340 + i * 66;
        return [
          L(44, y, 750, y, WK, 1),
          T(n, 44, y + 20, 230, { font: SB, size: 22, weight: 700, color: WK, lh: 1.2 }),
          rect(292 + a * 29, y + 20, (b - a) * 29, 26, i === 3 ? AM : WK),
          T(c, 650, y + 20, 100, { font: SB, size: 20, weight: 600, color: WK, align: 'right', lh: 1.2 }),
        ];
      }),
      L(44, 670, 750, 670, WK, 2),
      T('Total in EUR, excluding VAT', 44, 700, 400, { font: SB, size: 20, color: '#7A766C', lh: 1.2 }),
      T('51 000', 300, 680, 450, { font: SB, size: 96, weight: 800, ls: -35, lh: 1, color: WK, align: 'right' }),
      rect(44, 860, 706, 150, AM),
      eyebrow('Included', 70, 884, WK, 200, 12),
      T('Two rounds of changes per phase, hosting for the first year and training for four people.', 70, 912, 520, { font: SB, size: 20, weight: 500, lh: 1.35, color: WK }),
      T('Sign here', 600, 884, 130, { font: SB, size: 14, weight: 700, ls: 100, upper: true, color: WK, lh: 1.2 }),
      L(600, 980, 730, 980, WK, 2),
    ]),
  ],
});

export default [pitchDeck, investorDeck, quarterly, caseStudy, hiringPost, hiringStory, funding, webinarBanner, webinarOg, statPost, quote, card, onePager, invite, welcome, proposal];
