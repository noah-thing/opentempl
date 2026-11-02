import { tpl, page, T, S, rect, circle, path, L, img, frame, overlay, svg, qr, solid, stroke } from '../kit.mjs';

// Three full decks in strict Swiss form. Each has its own grid, palette and type pair:
//   report    12 columns, Archivo + IBM Plex Mono, ink and signal red
//   talk      6 columns, Hanken Grotesk + DM Mono, cobalt
//   portfolio asymmetric (a narrow rail and a wide field), Albert Sans + DM Mono, signal green
const DECKS = [];
export default DECKS;

const W = 1920, H = 1080;

// ======================================================================================
// 1. REPORT: Linden Housing Association, annual report 2025. 12 columns.
// ======================================================================================
{
  const PAPER = '#F4F3EF', INK = '#111111', RED = '#E3261B', G1 = '#55544F', G2 = '#9C9B95', G3 = '#D3D2CC';
  const A = 'Archivo', M = 'IBM Plex Mono';
  const MG = 80, P = (W - 2 * MG) / 12, N = 14;
  const col = (i) => MG + i * P;
  const wid = (n) => n * P - 24;

  const lab = (text, x, y, w, p = {}) => T(text, x, y, w, { font: M, size: 20, weight: 500, ls: 80, upper: true, lh: 1.3, color: INK, ...p });
  const body = (text, x, y, w, p = {}) => T(text, x, y, w, { font: A, size: 32, weight: 400, lh: 1.32, color: INK, ...p });
  const head = (text, x, y, w, size, p = {}) => T(text, x, y, w, { font: A, size, weight: 800, lh: 0.94, ls: -45, color: INK, ...p });
  const furniture = (n, section, c = INK) => [
    L(MG, 86, W - MG, 86, c, 1.5),
    lab('Linden Housing Association', col(0), 44, wid(5), { color: c }),
    lab(section, col(6), 44, wid(3), { color: c }),
    lab('Annual report 2025', col(9), 44, wid(3), { color: c, align: 'right' }),
    lab('linden.example/report', col(0), 1030, wid(5), { color: c }),
    lab(`${String(n).padStart(2, '0')} / ${N}`, col(9), 1030, wid(3), { color: c, align: 'right' }),
  ];
  const cols = (c, op = 0.16) => Array.from({ length: 13 }, (_, i) => L(col(i), 0, col(i), H, c, 1, { opacity: op }));

  // Ring segment for the donut, angles in degrees from twelve o'clock.
  const ring = (D, R, r, a0, a1) => {
    const c = D / 2, rad = (a) => ((a - 90) * Math.PI) / 180;
    const pt = (rr, a) => `${(c + rr * Math.cos(rad(a))).toFixed(2)},${(c + rr * Math.sin(rad(a))).toFixed(2)}`;
    const big = a1 - a0 > 180 ? 1 : 0;
    return `M${pt(R, a0)} A${R},${R} 0 ${big} 1 ${pt(R, a1)} L${pt(r, a1)} A${r},${r} 0 ${big} 0 ${pt(r, a0)} Z`;
  };

  const pages = [];

  // 1 Cover
  pages.push(page(PAPER, [
    cols(INK),
    T('25', 880, -10, 1200, { font: A, size: 1000, weight: 800, ls: -70, lh: 1, color: RED }),
    T('Annual\nreport', col(0) - 8, 300, 1000, { font: A, size: 230, weight: 800, lh: 0.86, ls: -60, color: INK }),
    L(MG, 86, W - MG, 86, INK, 1.5),
    lab('Linden Housing Association', col(0), 44, wid(5)),
    lab('Financial year 2025', col(9), 44, wid(3), { align: 'right' }),
    body('Rents, repairs and the 412 homes\nwe have not built yet.', col(0), 800, wid(5), { size: 40, weight: 600, lh: 1.2, ls: -10 }),
    lab('Published 14 March 2026\nBoard of Linden Housing', col(0), 940, wid(5), { size: 20, lh: 1.5 }),
  ], { notes: 'Welcome. This is the year in numbers: what we built, what we repaired, what it cost and what is next. About twenty minutes.' }));

  // 2 Contents
  const toc = [['01', 'The year in figures', '04'], ['02', 'Homes and repairs', '06'], ['03', 'Money', '09'], ['04', 'Findings', '10'], ['05', 'Case study', '12'], ['06', 'Outlook', '13']];
  pages.push(page(PAPER, [
    furniture(2, 'Contents'),
    head('In this\nreport', col(0), 150, wid(4), 130),
    body('Six sections, fourteen pages, every number checked against the ledger.', col(0), 780, wid(4), { size: 30 }),
    toc.map(([n, t, pg], i) => [
      L(col(5), 160 + i * 130, col(12), 160 + i * 130, INK, i === 0 ? 3 : 1),
      lab(n, col(5), 188 + i * 130, wid(1), { color: RED, size: 24 }),
      T(t, col(6) + 20, 176 + i * 130, wid(5), { font: A, size: 56, weight: 700, ls: -25, lh: 1.1, color: INK }),
      lab(pg, col(11), 190 + i * 130, wid(1), { align: 'right', size: 24 }),
    ]),
    L(col(5), 160 + 6 * 130, col(12), 160 + 6 * 130, INK, 1),
  ], { notes: 'Skim the contents. People who only care about money can jump to section three.' }));

  // 3 Chair's note
  pages.push(page(PAPER, [
    furniture(3, "Chair's note"),
    lab('From the board', col(0), 150, wid(3)),
    body('Eva Lindqvist\nChair of the board', col(0), 200, wid(3), { size: 30, weight: 600, lh: 1.25 }),
    rect(col(3), 150, wid(9) + 24, 10, RED),
    head('We built less than\nwe promised, and\nrepaired more than\nwe planned.', col(3), 210, wid(9), 132),
    body('Two projects slipped into 2026 because the ground was wetter than the survey said. We would rather finish late than patch early.', col(3), 810, wid(5), { size: 32 }),
    body('The money saved went into 1 940 repairs nobody had budgeted for. Tenants noticed.', col(8), 810, wid(4), { size: 32 }),
  ], { notes: 'The chair sets the tone: fewer new homes than planned, many more repairs. Read the first line aloud and stop.' }));

  // 4 Year in figures
  const figs = [['1 204', 'homes we manage', '+126 on 2024', INK], ['9 416', 'repairs completed', '1 940 not budgeted', INK], ['11', 'days median wait for a repair', 'was 19 days', RED], ['4.1 M', 'kronor on energy upgrades', '14 buildings', INK], ['93 %', 'of tenants would recommend us', 'was 88 %', INK], ['1.1 %', 'of homes standing empty', 'was 1.4 %', INK]];
  pages.push(page(PAPER, [
    furniture(4, '01 Figures'),
    head('The year in figures', col(0), 120, wid(8), 64, { ls: -30 }),
    figs.map(([v, l, d, c], i) => {
      const x = col((i % 3) * 4), y = 250 + Math.floor(i / 3) * 380;
      return [
        L(x, y, x + wid(4), y, INK, 3),
        T(v, x - 4, y + 30, wid(4) + 40, { font: A, size: 170, weight: 800, ls: -60, lh: 1, color: c }),
        body(l, x, y + 230, wid(3.6), { size: 32, weight: 600, lh: 1.15 }),
        lab(d, x, y + 310, wid(4), { size: 20 }),
      ];
    }),
  ], { notes: 'Six numbers carry the year. The red one is the one we are proudest of: the wait for a repair nearly halved.' }));

  // 5 Big number
  pages.push(page(RED, [
    cols(INK, 0.2),
    T('93%', 40, 0, 2600, { font: A, size: 900, weight: 800, ls: -75, lh: 1, color: PAPER }),
    L(MG, 86, W - MG, 86, INK, 1.5),
    lab('Linden Housing Association', col(0), 44, wid(5)),
    lab('02 Tenants', col(6), 44, wid(3)),
    lab('Annual report 2025', col(9), 44, wid(3), { align: 'right' }),
    L(MG, 790, W - MG, 790, INK, 3),
    T('of tenants would recommend\nLinden to a friend.', col(0), 822, wid(8), { font: A, size: 64, weight: 700, ls: -25, lh: 1.05, color: INK }),
    body('Survey of 2 318 households, 71 percent replied. Up from 88 percent in 2024.', col(8), 828, wid(4), { size: 30, weight: 500, lh: 1.3 }),
    lab('linden.example/report', col(0), 1030, wid(5)),
    lab('05 / 14', col(9), 1030, wid(3), { align: 'right' }),
  ], { notes: 'One number, nothing else. Let it sit for a second before explaining how we asked.' }));

  // 6 Homes per year, columns
  {
    const data = [[2021, 46], [2022, 61], [2023, 77], [2024, 104], [2025, 126]];
    const x0 = 900, base = 910, sc = 4.6, pitch = 190;
    pages.push(page(PAPER, [
      furniture(6, '02 Homes'),
      head('Homes\ncompleted', col(0), 150, wid(5), 130),
      body('414 new homes in five years. Each year added more than the one before, and 2025 was the first above 120.', col(0), 520, wid(4), { size: 32 }),
      lab('Source: Linden building ledger', col(0), 930, wid(4), { size: 20 }),
      [0, 50, 100, 150].map((v) => [
        L(col(5) + 20, base - v * sc, W - MG, base - v * sc, INK, v === 0 ? 2.5 : 1, { opacity: v === 0 ? 1 : 0.28 }),
        lab(String(v), col(5) + 20, base - v * sc - 30, 120, { size: 20 }),
      ]),
      data.map(([y, v], i) => [
        rect(x0 + i * pitch, base - v * sc, 124, v * sc, i === 4 ? RED : INK),
        T(String(v), x0 + i * pitch - 10, base - v * sc - 62, 144, { font: A, size: 48, weight: 800, ls: -25, lh: 1, color: i === 4 ? RED : INK }),
        lab(String(y), x0 + i * pitch, base + 18, 124, { size: 22 }),
      ]),
    ], { notes: 'Homes completed per year. The slope matters more than any single bar.' }));
  }

  // 7 Repair requests, horizontal bars
  {
    const rows = [['Heating and hot water', 31], ['Plumbing and leaks', 24], ['Windows and doors', 17], ['Electrics', 12], ['Locks and keys', 9], ['Everything else', 7]];
    pages.push(page(PAPER, [
      furniture(7, '02 Repairs'),
      head('What\nbreaks\nfirst', col(0), 140, wid(5), 190),
      body('Heating and water make up more than half of all requests. January is twice as busy as June.', col(0), 760, wid(4.5), { size: 32 }),
      rows.map(([t, v], i) => {
        const y = 150 + i * 130;
        return [
          L(col(6), y, W - MG, y, INK, i === 0 ? 3 : 1),
          T(t, col(6), y + 24, wid(3), { font: A, size: 36, weight: 600, ls: -10, lh: 1.15, color: INK }),
          rect(col(9) - 60, y + 28, v * 11, 56, i === 0 ? RED : INK),
          T(`${v} %`, col(9) - 60 + v * 11 + 18, y + 24, 160, { font: A, size: 48, weight: 800, ls: -20, lh: 1.1, color: INK }),
        ];
      }),
      L(col(6), 150 + 6 * 130, W - MG, 150 + 6 * 130, INK, 1),
      lab('Share of 9 416 completed repairs', col(6), 150 + 6 * 130 + 22, wid(6), { size: 20 }),
    ], { notes: 'Share of repairs by type. Heating and water is the line to watch before winter.' }));
  }

  // 8 Line chart
  {
    const data = [[2019, 26], [2020, 28], [2021, 25], [2022, 23], [2023, 21], [2024, 19], [2025, 11]];
    const x0 = 740, pitch = 170, base = 900, sc = 22;
    const pts = data.map(([y, v], i) => [x0 + i * pitch, base - v * sc]);
    pages.push(page(PAPER, [
      furniture(8, '02 Repairs'),
      head('Waiting\nfor a fix', col(0), 150, wid(4), 118),
      body('Median days from report to repair. For six years the line crept down. Then one phone number and one person changed it in a single spring.', col(0), 480, wid(3.6), { size: 30 }),
      [0, 10, 20, 30].map((v) => [
        L(x0 - 40, base - v * sc, W - MG, base - v * sc, INK, v === 0 ? 2.5 : 1, { opacity: v === 0 ? 1 : 0.28 }),
        lab(String(v), x0 - 40 - 80, base - v * sc - 12, 60, { size: 20, align: 'right' }),
      ]),
      pts.slice(1).map((p, i) => L(pts[i][0], pts[i][1], p[0], p[1], i === 5 ? RED : INK, 6)),
      pts.map((p, i) => [
        rect(p[0] - (i === 6 ? 16 : 10), p[1] - (i === 6 ? 16 : 10), i === 6 ? 32 : 20, i === 6 ? 32 : 20, i === 6 ? RED : INK),
        T(String(data[i][1]), p[0] - 60, p[1] - 76, 120, { font: A, size: 40, weight: 800, ls: -15, lh: 1, color: i === 6 ? RED : INK, align: 'center' }),
        lab(String(data[i][0]), p[0] - 60, base + 18, 120, { size: 20, align: 'center' }),
      ]),
      L(1730, 722, pts[6][0] - 8, pts[6][1] + 22, INK, 2),
      T('New repair desk opens in March. One number to call.', 1350, 730, 380, { font: A, size: 28, weight: 600, lh: 1.25, color: INK }),
    ], { notes: 'Median wait in days. The drop in the last point is the repair desk. Everything before it was slow improvement.' }));
  }

  // 9 Donut
  {
    const segs = [['Upkeep and repairs', 38, RED], ['Loan interest', 27, INK], ['Energy and water', 17, G1], ['Staff and admin', 11, G2], ['Reserve fund', 7, G3]];
    const D = 700, R = 350, r = 205;
    let a = 0;
    const arcs = segs.map(([, v, c]) => { const a0 = a; a += v * 3.6; return path(ring(D, R, r, a0 + 0.5, a - 0.5), 80, 200, D, D, c, { w0: D, h0: D }); });
    pages.push(page(PAPER, [
      furniture(9, '03 Money'),
      arcs,
      T('100 kr', 80 + 175, 200 + 258, 350, { font: A, size: 80, weight: 800, ls: -35, lh: 1, color: INK, align: 'center' }),
      T('of monthly rent', 80 + 175, 200 + 350, 350, { font: A, size: 28, weight: 500, lh: 1.2, color: INK, align: 'center' }),
      head('Where each\nhundred kronor\nof rent goes', col(7), 130, wid(5), 76, { ls: -35 }),
      segs.map(([t, v, c], i) => {
        const y = 440 + i * 100;
        return [
          L(col(7), y, W - MG, y, INK, i === 0 ? 3 : 1),
          rect(col(7), y + 26, 36, 36, c),
          T(t, col(7) + 64, y + 22, wid(3.5), { font: A, size: 36, weight: 600, ls: -10, lh: 1.2, color: INK }),
          T(`${v}`, col(11), y + 12, wid(1), { font: A, size: 60, weight: 800, ls: -25, lh: 1.1, color: INK, align: 'right' }),
        ];
      }),
      L(col(7), 940, W - MG, 940, INK, 1),
    ], { notes: 'Rent split into five uses. Upkeep and repairs is the largest share and the one tenants see.' }));
  }

  // 10 Findings, stepped
  {
    const f = [['01', 'Repairs got faster once one person owned them', 'Since March a single desk takes every call. Median wait fell from 19 days to 11 days.'], ['02', 'Energy savings arrive late and stay', 'New heating in 14 buildings cut use by 22 percent, mostly from the second winter on.'], ['03', 'Tenants stay when they are asked', 'Move outs fell by a third in buildings with a yearly house meeting.']];
    pages.push(page(PAPER, [
      furniture(10, '04 Findings'),
      f.map(([n, h, b], i) => {
        const x = col(i * 4), y = 130 + i * 120;
        return [
          L(x - 12, y, x - 12, 990, INK, 1, { opacity: i === 0 ? 0 : 1 }),
          T(n, x, y, wid(4), { font: A, size: 230, weight: 800, ls: -70, lh: 1, color: i === 0 ? RED : INK }),
          T(h, x, y + 270, wid(3.6), { font: A, size: 52, weight: 700, ls: -20, lh: 1.08, color: INK }),
          body(b, x, y + 470, wid(3.6), { size: 32 }),
        ];
      }),
    ], { notes: 'Three things we learned. They step down the page because the later ones took longer to see.' }));
  }

  // 11 Table
  {
    const rows = [['Median repair wait, days', '19', '11', '14', 1], ['Homes completed', '104', '126', '120', 1], ['Tenants who would recommend, %', '88', '93', '90', 1], ['Energy use, kWh per square metre', '128', '119', '110', 0], ['Homes standing empty, %', '1.4', '1.1', '1.0', 0], ['Rent increase, %', '3.9', '3.1', '3.5', 1]];
    const xs = [1170, 1340, 1510];
    pages.push(page(PAPER, [
      furniture(11, '03 Targets'),
      head('2025\nagainst\nthe plan', col(0), 140, wid(4), 110),
      T('4 of 6', col(0) - 6, 640, wid(4.5), { font: A, size: 150, weight: 800, ls: -60, lh: 1, color: RED }),
      body('targets met. The two misses are energy and empty homes.', col(0), 810, wid(3.6), { size: 30 }),
      ['', '2024', '2025', 'Target'].map((h, i) => i ? lab(h, xs[i - 1], 170, 150, { align: 'right' }) : null),
      lab('Result', 1690, 170, 150),
      L(col(4) + 40, 215, W - MG, 215, INK, 3),
      rows.map(([t, a, b, c, ok], i) => {
        const y = 240 + i * 118;
        return [
          T(t, col(4) + 40, y + 22, 540, { font: A, size: 32, weight: 600, ls: -10, lh: 1.12, color: INK }),
          [a, b, c].map((v, k) => T(v, xs[k], y + 20, 150, { font: A, size: 40, weight: k === 1 ? 800 : 400, ls: -15, lh: 1.1, color: k === 1 && !ok ? RED : INK, align: 'right' })),
          lab(ok ? 'Met' : 'Missed', 1690, y + 32, 150, { color: ok ? INK : RED, weight: 700 }),
          L(col(4) + 40, y + 108, W - MG, y + 108, INK, 1),
        ];
      }),
    ], { notes: 'Four targets met, two missed. Be plain about the misses: energy savings are real but slower than the plan assumed.' }));
  }

  // 12 Case
  pages.push(page(PAPER, [
    img('photos/city.jpg', 0, 0, 900, H, { filters: { saturation: -100, contrast: 24, brightness: -4 } }),
    rect(900, 0, 10, H, RED),
    L(990, 86, W - MG, 86, INK, 1.5),
    lab('Case study', 990, 44, 400),
    lab('12 / 14', 1440, 44, 400, { align: 'right' }),
    head('Almgatan\n14 to 22', 990, 140, 850, 140),
    body('A 1946 block with three stairwells, rebuilt around its tenants over eleven months. Nobody moved out.', 990, 440, 760, { size: 32 }),
    [['Homes', '96'], ['Built', '1946'], ['Cost', '38.2 M kr'], ['Energy use', '31 % lower']].map(([k, v], i) => [
      L(990, 660 + i * 80, W - MG, 660 + i * 80, INK, i === 0 ? 3 : 1),
      lab(k, 990, 686 + i * 80, 260),
      T(v, 1300, 668 + i * 80, 540, { font: A, size: 44, weight: 800, ls: -20, lh: 1.1, color: INK }),
    ]),
    L(990, 660 + 4 * 80, W - MG, 660 + 4 * 80, INK, 1),
    lab('linden.example/report', 990, 1030, 420),
  ], { notes: 'One building as proof. The point is the last line: people stayed in their homes while it was rebuilt.' }));

  // 13 Outlook
  {
    const ms = [['Mar 2026', 'Annual meeting at the Linden hall', RED], ['Jun 2026', 'Work starts at Almgatan 24 to 30', INK], ['Sep 2026', 'Heating rebuild, second phase', INK], ['Dec 2026', 'First 62 new homes handed over', INK]];
    pages.push(page(PAPER, [
      furniture(13, '05 Outlook'),
      T('412', col(0) - 14, 110, 1300, { font: A, size: 560, weight: 800, ls: -80, lh: 1, color: RED }),
      head('new homes\nin three years', col(7) + 20, 230, wid(5), 100),
      body('Sixty two in 2026, then 170 a year if the ground and the loans cooperate.', col(7) + 20, 470, wid(5), { size: 32 }),
      L(col(0), 800, col(12), 800, INK, 3),
      ms.map(([d, t, c], i) => [
        rect(col(i * 3), 788, 24, 24, c),
        lab(d, col(i * 3), 840, wid(3), { size: 22, color: c === RED ? RED : INK, weight: 700 }),
        T(t, col(i * 3), 882, wid(2.7), { font: A, size: 32, weight: 600, ls: -10, lh: 1.2, color: INK }),
      ]),
    ], { notes: 'Looking ahead: one number and four dates. If the ground is dry we hit all four.' }));
  }

  // 14 Contact
  pages.push(page(INK, [
    cols(PAPER, 0.12),
    L(MG, 86, W - MG, 86, PAPER, 1.5),
    lab('Linden Housing Association', col(0), 44, wid(5), { color: PAPER }),
    lab('Annual report 2025', col(9), 44, wid(3), { color: PAPER, align: 'right' }),
    lab('14 / 14', col(9), 1030, wid(3), { color: PAPER, align: 'right' }),
    T('Questions\nand sources', col(0) - 8, 130, 1200, { font: A, size: 200, weight: 800, lh: 0.88, ls: -65, color: PAPER }),
    qr('https://linden.example/report', col(9), 150, 3 * P - 24, INK, PAPER),
    lab('Full report and tables', col(9), 150 + 3 * P - 10, wid(3), { color: PAPER, size: 20 }),
    [['Visit', 'Almgatan 3\n412 63 Göteborg'], ['Write', 'hej@linden.example\nPress: press@linden.example'], ['Call', '031 555 01 20\nWeekdays 8 to 16']].map(([k, v], i) => [
      L(col(i * 4), 740, col(i * 4) + wid(3.6), 740, PAPER, 3),
      lab(k, col(i * 4), 774, wid(3), { color: RED, size: 22, weight: 700 }),
      T(v, col(i * 4), 826, wid(3.7), { font: A, size: 36, weight: 500, lh: 1.3, color: PAPER }),
    ]),
  ], { notes: 'Close on the contact details. The QR code goes to the full report with every table.' }));

  DECKS.push(tpl({
    id: 'deck-swiss-grid-report',
    name: 'Annual report deck',
    format: 'slide',
    category: 'Presentation',
    tags: ['presentation', 'slides', 'deck', 'report', 'annual report', 'research', 'numbers', 'charts', 'swiss'],
    pages,
  }));
}

// ======================================================================================
// 2. TALK: "Signs that say less", a conference talk. 6 columns, cobalt.
// ======================================================================================
{
  const PAPER = '#F6F6F3', INK = '#0C0C0C', BLUE = '#1B3BFF', GREY = '#D8D8D3';
  const HG = 'Hanken Grotesk', MO = 'DM Mono';
  const MG = 96, P = (W - 2 * MG) / 6, N = 14;
  const col = (i) => MG + i * P;
  const wid = (n) => n * P - 32;

  const lab = (text, x, y, w, p = {}) => T(text, x, y, w, { font: MO, size: 20, ls: 60, upper: true, lh: 1.35, color: INK, ...p, weight: 500 });
  const body = (text, x, y, w, p = {}) => T(text, x, y, w, { font: HG, size: 34, weight: 400, lh: 1.32, color: INK, ...p });
  const display = (text, x, y, w, size, p = {}) => T(text, x, y, w, { font: HG, size, weight: 800, lh: 0.92, ls: -50, color: INK, ...p });
  const furniture = (n, section, c = INK) => [
    lab(section, col(0), 48, wid(3), { color: c }),
    lab('Form and Function 2026', col(3), 48, wid(3) + 32, { color: c, align: 'right' }),
    lab('Maja Holm  /  Signs that say less', col(0), 1028, wid(4), { color: c }),
    lab(`${String(n).padStart(2, '0')} / ${N}`, col(4), 1028, wid(2) + 32, { color: c, align: 'right' }),
  ];
  const cols = (c, op = 0.22) => Array.from({ length: 7 }, (_, i) => L(col(i), 0, col(i), H, c, 1, { opacity: op }));

  const pages = [];

  // 1 Title
  pages.push(page(BLUE, [
    cols(PAPER),
    display('Signs\nthat say\nless', col(0) - 12, 70, 1700, 300, { color: PAPER, ls: -80, lh: 0.86 }),
    L(col(0), 880, col(6), 880, PAPER, 3),
    T('Maja Holm\nWayfinding designer', col(0), 916, wid(2), { font: HG, size: 30, weight: 600, lh: 1.25, color: PAPER }),
    T('Form and Function 2026\nGothenburg, 14 May', col(2), 916, wid(2), { font: HG, size: 30, weight: 500, lh: 1.25, color: PAPER }),
    T('A talk in 35 minutes\nSlides at holm.example', col(4), 916, wid(2), { font: HG, size: 30, weight: 500, lh: 1.25, color: PAPER }),
  ], { notes: 'Welcome. The title is the whole argument: a sign that says less gets read more. Say your name once and move on.' }));

  // 2 About
  pages.push(page(PAPER, [
    img('photos/portrait-window.jpg', 0, 0, col(3) - 16, H, { filters: { duotone: ['#08124F', '#E9ECFF'], contrast: 8 } }),
    lab('About the speaker', col(3), 48, wid(3)),
    display('Maja\nHolm', col(3) - 6, 120, wid(3), 200),
    [['Works at', 'Holm och Ek, Gothenburg'], ['Known for', 'Two hospitals and a ferry terminal'], ['Teaches', 'Wayfinding to second year students'], ['Has been lost in', 'Every building she has signed']].map(([k, v], i) => [
      L(col(3), 560 + i * 110, col(6) - 0, 560 + i * 110, INK, i === 0 ? 3 : 1),
      lab(k, col(3), 586 + i * 110, 300, { size: 20 }),
      body(v, col(3) + 330, 574 + i * 110, 600, { size: 30, weight: 500, lh: 1.2 }),
    ]),
    lab('02 / 14', col(4), 1028, wid(2) + 32, { align: 'right' }),
  ], { notes: 'A short introduction. The last line is true and always gets a smile.' }));

  // 3 Big idea
  pages.push(page(PAPER, [
    furniture(3, 'The idea'),
    rect(col(0), 150, 140, 14, BLUE),
    display('A sign is a\nsentence you\nonly get to\nsay once.', col(0) - 6, 190, wid(6), 176, { ls: -60, lh: 0.96 }),
    body('Nobody stops to reread it.\nNobody can ask what you meant.', col(3), 900, wid(3), { size: 32, weight: 500, lh: 1.25 }),
  ], { notes: 'The one idea of the talk. Read it slowly. Pause after "once".' }));

  // 4 Agenda
  pages.push(page(PAPER, [
    furniture(4, 'Today'),
    [['3', 'rules'], ['2', 'examples'], ['1', 'question']].map(([n, t], i) => [
      L(col(i * 2) - 16, 140, col(i * 2) - 16, 1000, INK, 1, { opacity: i === 0 ? 0 : 1 }),
      T(n, col(i * 2) - 12, 100, wid(2), { font: HG, size: 640, weight: 800, ls: -60, lh: 1, color: BLUE }),
      T(t, col(i * 2), 780, wid(2), { font: HG, size: 72, weight: 800, ls: -35, lh: 1, color: INK }),
      body(['Short enough to remember.', 'One built, one broken.', 'To take home.'][i], col(i * 2), 880, wid(1.8), { size: 30 }),
    ]),
  ], { notes: 'Three rules, two examples, one question. People like knowing where the end is.' }));

  // 5 Rule one
  pages.push(page(PAPER, [
    T('1', -40, -250, 1100, { font: HG, size: 1500, weight: 800, ls: -80, lh: 1, color: BLUE }),
    lab('Rule one', col(2) + 40, 48, wid(2)),
    display('Say one\nthing', col(2) + 40, 150, wid(4), 190),
    L(col(2) + 40, 600, col(6), 600, INK, 3),
    body('A person walking at pace reads about four words. Pick the one that matters and cut the rest.', col(2) + 40, 640, wid(3.2), { size: 38, weight: 500, lh: 1.28 }),
    lab('Maja Holm  /  Signs that say less', col(2) + 40, 1028, wid(3)),
    lab('05 / 14', col(4), 1028, wid(2) + 32, { align: 'right' }),
  ], { notes: 'Rule one. The giant numeral is the point: one. Ask the room to name the last sign they read all of.' }));

  // 6 Example one: before and after
  {
    const wBox = wid(3), y = 330, h = 500;
    pages.push(page(PAPER, [
      furniture(6, 'Example one: the hospital corridor'),
      display('Same corridor,\nsame lifts', col(0) - 4, 100, wid(6), 100, { lh: 0.98 }),
      rect(col(0), y + 40, wBox, h - 40, GREY),
      lab('Before: 26 words', col(0), y + 4, wBox, { size: 22, weight: 700 }),
      T('Visitors please note that the main lifts to wards 4 to 9 are located beyond the cafe, past reception, on the left after the double doors.', col(0) + 36, y + 90, wBox - 72, { font: HG, size: 40, weight: 500, lh: 1.3, color: INK }),
      rect(col(3), y + 40, wBox, h - 40, BLUE),
      lab('After: 1 word and an arrow', col(3), y + 4, wBox, { size: 22, weight: 700 }),
      T('Lifts', col(3) + 36, y + 120, wBox - 72, { font: HG, size: 240, weight: 800, ls: -70, lh: 1, color: PAPER }),
      L(col(3) + 46, y + 440, col(3) + 380, y + 440, PAPER, 16, { end: 'arrow' }),
      body('The cafe is still there. Nobody was ever looking for it.', col(0), 880, wid(3), { size: 30 }),
      body('Fourteen fewer people a week asked reception for directions.', col(3), 880, wid(3), { size: 30 }),
    ], { notes: 'Same corridor, same lifts. The old sign tried to be a map. The new one is a signpost. Let the left sign be painfully unreadable from the back of the room.' }));
  }

  // 7 Quote
  pages.push(page(INK, [
    cols(PAPER, 0.14),
    lab('A note from the workshop', col(0), 48, wid(3), { color: PAPER }),
    T('If you have to\nexplain the sign,\nyou have drawn\na poster.', col(0) - 6, 150, wid(6), { font: HG, size: 176, weight: 800, ls: -60, lh: 0.96, color: PAPER }),
    L(col(0), 870, col(2), 870, BLUE, 8),
    T('Arne Sjöberg, signpainter', col(0), 900, wid(3), { font: HG, size: 34, weight: 700, color: PAPER }),
    lab('Göteborg, 1987', col(0), 956, wid(3), { color: PAPER }),
    lab('07 / 14', col(4), 1028, wid(2) + 32, { color: PAPER, align: 'right' }),
  ], { notes: 'Arne painted signs for forty years and taught me this at a kitchen table. He would have hated this slide for being a poster.' }));

  // 8 Rule two
  pages.push(page(PAPER, [
    furniture(8, 'Rule two'),
    L(col(0), 150, col(6), 150, INK, 3),
    T('2', col(0) - 6, 150, 400, { font: HG, size: 260, weight: 800, ls: -60, lh: 1, color: BLUE }),
    display('Put it where\nthe eyes\nalready are', col(1) + 40, 190, wid(5), 150, { lh: 0.98 }),
    body('People look at doors, at floors and at the person ahead. They do not look up. Mount signs at the height of a handle, or paint them on what everybody walks across.', col(1) + 40, 700, wid(3), { size: 34 }),
    body('We moved the pharmacy sign from the ceiling to the floor. It was found 40 seconds sooner, on average.', col(4) + 20, 700, wid(2), { size: 34, weight: 600, lh: 1.28 }),
  ], { notes: 'Rule two is about placement. Ask who looked at the ceiling today.' }));

  // 9 Big stat
  pages.push(page(BLUE, [
    cols(PAPER, 0.22),
    T('3', col(0) - 20, -150, 1000, { font: HG, size: 1100, weight: 800, ls: -80, lh: 1, color: PAPER }),
    T('seconds', col(2) + 30, 380, wid(4) + 32, { font: HG, size: 210, weight: 800, ls: -65, lh: 1, color: PAPER }),
    L(col(2) + 30, 700, col(6), 700, PAPER, 3),
    T('is what a reader gives a sign before they walk on.', col(2) + 30, 730, wid(3.4), { font: HG, size: 52, weight: 700, ls: -20, lh: 1.1, color: PAPER }),
    lab('Median glance, filmed in 212 visits', col(2) + 30, 940, wid(4), { color: PAPER }),
    lab('Maja Holm  /  Signs that say less', col(0), 1028, wid(4), { color: PAPER }),
    lab('09 / 14', col(4), 1028, wid(2) + 32, { color: PAPER, align: 'right' }),
  ], { notes: 'Three seconds. Everything else in this talk is about spending them well.' }));

  // 10 Rule three
  pages.push(page(PAPER, [
    furniture(10, 'Rule three'),
    T('3', col(3) + 60, -20, 900, { font: HG, size: 1050, weight: 800, ls: -80, lh: 1, color: BLUE }),
    display('Test it on\nsomeone in\na hurry', col(0) - 6, 150, wid(4), 150),
    L(col(0), 720, col(3) + 60, 720, INK, 3),
    body('Not a colleague. Not a client. Stop a stranger at the door, give them four seconds and ask where they were going.', col(0), 750, wid(3.4), { size: 34 }),
  ], { notes: 'Rule three. Do the test with a stranger, not a friend. Friends know where the lifts are.' }));

  // 11 Example two: timetable
  {
    const rows = [['07:42', 'Alingsås', '4'], ['07:51', 'Göteborg C', '2'], ['08:03', 'Borås', '6'], ['08:12', 'Lerum', '3'], ['08:27', 'Floda', '1']];
    pages.push(page(PAPER, [
      furniture(11, 'Example two: the station board'),
      display('One train\nin bold', col(0) - 4, 120, wid(3), 130, { lh: 0.98 }),
      body('The old board listed every stop of every train. We kept three columns and put the next departure first, in colour.', col(0), 520, wid(2.8), { size: 32 }),
      lab('Time', col(3), 160, 200),
      lab('Destination', col(3) + 220, 160, 400),
      lab('Platform', col(5) + 8, 160, wid(1), { align: 'right' }),
      L(col(3), 200, col(6), 200, INK, 3),
      rows.map(([t, d, p], i) => {
        const y = 200 + i * 150, hot = i === 0;
        return [
          hot ? rect(col(3) - 20, y + 3, col(6) - col(3) + 40 - 0, 147, BLUE) : null,
          T(t, col(3), y + 26, 220, { font: HG, size: 80, weight: 800, ls: -40, lh: 1.1, color: hot ? PAPER : INK }),
          T(d, col(3) + 220, y + 40, 420, { font: HG, size: 48, weight: 600, ls: -20, lh: 1.1, color: hot ? PAPER : INK }),
          T(p, col(5) - 20, y + 26, wid(1) + 28, { font: HG, size: 80, weight: 800, ls: -40, lh: 1.1, color: hot ? PAPER : INK, align: 'right' }),
          L(col(3), y + 150, col(6), y + 150, INK, 1),
        ];
      }),
    ], { notes: 'Five departures and one in colour. That is the entire redesign.' }));
  }

  // 12 Recap
  pages.push(page(BLUE, [
    cols(PAPER, 0.18),
    lab('In short', col(0), 48, wid(3), { color: PAPER }),
    [['1', 'Say one thing'], ['2', 'Put it where the eyes already are'], ['3', 'Test it on someone in a hurry']].map(([n, t], i) => [
      L(col(0), 170 + i * 250, col(6), 170 + i * 250, PAPER, 3),
      T(n, col(0), 190 + i * 250, 200, { font: HG, size: 150, weight: 800, ls: -50, lh: 1, color: PAPER }),
      T(t, col(1) + 20, 212 + i * 250, wid(5) - 20, { font: HG, size: 100, weight: 800, ls: -45, lh: 1, color: PAPER }),
    ]),
    L(col(0), 170 + 3 * 250, col(6), 170 + 3 * 250, PAPER, 3),
    lab('Maja Holm  /  Signs that say less', col(0), 1028, wid(4), { color: PAPER }),
    lab('12 / 14', col(4), 1028, wid(2) + 32, { color: PAPER, align: 'right' }),
  ], { notes: 'The whole talk in three lines. Leave this up while people write it down.' }));

  // 13 Closing question
  pages.push(page(PAPER, [
    cols(INK, 0.1),
    rect(0, 0, W, 24, BLUE),
    furniture(13, 'One question'),
    display('What would\nyou remove\nfirst?', col(0) - 10, 140, wid(6), 270, { ls: -75, lh: 0.99 }),
    body('Take a sign from your own street and cross out half of it.', col(3), 940, wid(3), { size: 32, weight: 500, lh: 1.25 }),
  ], { notes: 'Ask the question and wait. Let the room be quiet for a while before taking hands.' }));

  // 14 Contact
  pages.push(page(BLUE, [
    cols(PAPER, 0.22),
    lab('Thank you', col(0), 48, wid(3), { color: PAPER }),
    T('Maja\nHolm', col(0) - 10, 90, wid(5), { font: HG, size: 320, weight: 800, ls: -80, lh: 0.92, color: PAPER }),
    qr('https://holm.example/signs', col(4) + 16, 120, 2 * P - 32, INK, PAPER),
    lab('Slides and reading list', col(4) + 16, 120 + 2 * P - 20, wid(2), { color: PAPER }),
    L(col(0), 780, col(6), 780, PAPER, 3),
    [['Write', 'maja@holm.example'], ['Studio', 'Holm och Ek\nKungsgatan 41, Göteborg'], ['Find me', '@majaholm']].map(([k, v], i) => [
      lab(k, col(i * 2), 812, wid(2), { color: PAPER, weight: 700 }),
      T(v, col(i * 2), 866, wid(2) + 16, { font: HG, size: 36, weight: 600, lh: 1.25, color: PAPER }),
    ]),
  ], { notes: 'Contact details and the slides. Questions are welcome, especially the ones that start with "but what about".' }));

  DECKS.push(tpl({
    id: 'deck-swiss-grid-talk',
    name: 'Conference talk deck',
    format: 'slide',
    category: 'Presentation',
    tags: ['presentation', 'slides', 'deck', 'talk', 'conference', 'lecture', 'keynote', 'swiss'],
    pages,
  }));
}

// ======================================================================================
// 3. PORTFOLIO: Studio Orrby, architecture and interiors. Asymmetric grid: rail + field.
// ======================================================================================
{
  const PAPER = '#E9E7E1', INK = '#0E0E0E', GREEN = '#00A36C', MIDG = '#BDBBB4';
  const AS = 'Albert Sans', MO = 'DM Mono';
  const RX = 80, RW = 300, SEP = 420, FX = 460, FP = 345, N = 14;
  const fc = (i) => FX + i * FP;
  const fw = (n) => n * FP - 30;
  const FEND = W - 80;

  const lab = (text, x, y, w, p = {}) => T(text, x, y, w, { font: MO, size: 20, ls: 60, upper: true, lh: 1.4, color: INK, ...p, weight: 500 });
  const body = (text, x, y, w, p = {}) => T(text, x, y, w, { font: AS, size: 32, weight: 400, lh: 1.32, color: INK, ...p });
  const big = (text, x, y, w, size, p = {}) => T(text, x, y, w, { font: AS, size, weight: 800, lh: 0.92, ls: -50, color: INK, ...p });
  const bw = (extra = {}) => ({ saturation: -100, contrast: 18, brightness: -2, ...extra });
  const furniture = (n, section, c = INK, sep = true) => [
    sep ? L(SEP, 0, SEP, H, c, 1, { opacity: 0.4 }) : null,
    T('Studio Orrby', RX, 40, RW, { font: AS, size: 30, weight: 800, ls: -15, color: c }),
    lab(section, RX, 90, RW, { color: c }),
    lab(`${String(n).padStart(2, '0')} / ${N}`, RX, 1028, RW, { color: c }),
  ];

  const pages = [];

  // 1 Cover
  pages.push(page(PAPER, [
    img('photos/desk.jpg', SEP, 0, W - SEP, 470, { filters: bw({ contrast: 24 }) }),
    L(SEP, 0, SEP, H, INK, 1, { opacity: 0.4 }),
    T('Studio Orrby', RX, 40, RW, { font: AS, size: 30, weight: 800, ls: -15 }),
    lab('Architecture and\ninteriors, Malmö\nSince 2014', RX, 90, RW, { lh: 1.5 }),
    rect(RX, 700, RW, 300, GREEN),
    T('Portfolio\n2026', RX + 28, 728, RW - 56, { font: AS, size: 52, weight: 800, ls: -30, lh: 1, color: INK }),
    big('Studio\nOrrby', FX - 10, 480, 1400, 290, { ls: -75, lh: 0.86 }),
    lab('Selected work 2019 to 2026', FX, 1028, 700),
  ], { notes: 'Welcome to Studio Orrby. This is a short walk through six years of houses and rooms, and how we make them.' }));

  // 2 Intro
  pages.push(page(PAPER, [
    furniture(2, 'About'),
    big('We design houses and rooms for the people who will actually live in them.', FX - 6, 130, fw(4) - 60, 112, { ls: -45, lh: 0.98 }),
    [['2014', 'Year we started, in one room above a bakery'], ['9', 'People, four of them architects'], ['63', 'Projects built, from sheds to a school']].map(([n, t], i) => [
      L(fc(i), 700, fc(i) + fw(1) + 0, 700, INK, 3),
      T(n, fc(i) - 4, 720, fw(1) + 60, { font: AS, size: 150, weight: 800, ls: -60, lh: 1, color: INK }),
      body(t, fc(i), 890, fw(1), { size: 28, lh: 1.3 }),
    ]),
    rect(fc(3), 700, fw(1), 3, GREEN),
    body('Based in Malmö. Working anywhere a train goes.', fc(3), 720, fw(1), { size: 32, weight: 600 }),
  ], { notes: 'Who we are in three numbers. Keep it short; the work does the talking.' }));

  // 3 Index of work
  {
    const rows = [['01', 'Skärgårdshus', 'Summer house', 'Sandhamn', '2024'], ['02', 'Bord 9', 'Restaurant', 'Malmö', '2023'], ['03', 'Ateljé Lera', 'Ceramics studio', 'Ystad', '2022'], ['04', 'Villa Lindh', 'Apartment rebuild', 'Lund', '2021'], ['05', 'Norra Hamnen', 'Housing, 38 homes', 'Malmö', '2019']];
    pages.push(page(PAPER, [
      furniture(3, 'Selected work'),
      rows.map(([n, t, k, c, y], i) => [
        L(FX, 140 + i * 160, FEND, 140 + i * 160, INK, i === 0 ? 3 : 1),
        lab(n, FX, 176 + i * 160, 80, { color: GREEN, weight: 500, size: 24 }),
        T(t, FX + 90, 160 + i * 160, 700, { font: AS, size: 84, weight: 800, ls: -40, lh: 1.05, color: INK }),
        body(k, fc(2) + 150, 182 + i * 160, 400, { size: 30, weight: 500 }),
        body(c, fc(3) + 120, 182 + i * 160, 200, { size: 30, weight: 400 }),
        lab(y, FEND - 120, 190 + i * 160, 120, { align: 'right', size: 22 }),
      ]),
      L(FX, 140 + 5 * 160, FEND, 140 + 5 * 160, INK, 1),
    ], { notes: 'Five projects, newest first. The next slides go deeper on the first three.' }));
  }

  // 4 Project one hero
  pages.push(page(PAPER, [
    img('photos/archipelago.jpg', SEP, 0, W - SEP, H, { filters: bw({ contrast: 22 }) }),
    T('Studio Orrby', RX, 40, RW, { font: AS, size: 30, weight: 800, ls: -15 }),
    lab('Selected work', RX, 90, RW),
    T('01', RX - 8, 150, RW + 40, { font: AS, size: 230, weight: 800, ls: -80, lh: 1, color: GREEN }),
    L(RX, 760, RX + RW, 760, INK, 3),
    T('Skärgårdshus', RX, 785, RW + 20, { font: AS, size: 44, weight: 800, ls: -20, lh: 1.05, color: INK }),
    body('Summer house\nSandhamn, 2024', RX, 870, RW, { size: 28, lh: 1.3 }),
    lab('04 / 14', RX, 1028, RW),
  ], { notes: 'Project one. A summer house on bare rock. Let the photograph carry the first ten seconds.' }));

  // 5 Project one detail
  pages.push(page(PAPER, [
    furniture(5, '01 Skärgårdshus'),
    img('photos/forest.jpg', FX, 110, fw(2), 800, { filters: bw({ contrast: 20 }) }),
    lab('Fig. 1.2  The path to the house', FX, 930, fw(2)),
    big('A house that\nleans away\nfrom the wind', fc(2) + 20, 110, fw(2) - 20, 92, { ls: -40, lh: 0.98 }),
    body('Eight months a year nobody is home. The roof is steep, the windows small on the north side and every door can be shut from outside in a storm.', fc(2) + 20, 440, fw(2) - 20, { size: 30 }),
    [['Area', '94 m2'], ['Material', 'Larch, lime plaster'], ['Client', 'Private'], ['Year', '2024']].map(([k, v], i) => [
      L(fc(2) + 20, 700 + i * 70, FEND, 700 + i * 70, INK, i === 0 ? 3 : 1),
      lab(k, fc(2) + 20, 724 + i * 70, 200),
      T(v, fc(2) + 250, 712 + i * 70, 440, { font: AS, size: 32, weight: 700, color: INK, lh: 1.2 }),
    ]),
    L(fc(2) + 20, 700 + 4 * 70, FEND, 700 + 4 * 70, INK, 1),
  ], { notes: 'What we did and what it was for. One sentence of idea, then the facts.' }));

  // 6 Project two
  pages.push(page(PAPER, [
    furniture(6, 'Selected work'),
    img('photos/dinner-table.jpg', FX, 100, 1030, 820, { filters: bw({ contrast: 24, brightness: -4 }) }),
    T('02', 1540, 90, 300, { font: AS, size: 160, weight: 800, ls: -60, lh: 1, color: GREEN }),
    big('Bord 9', 1540, 300, 320, 90, { ls: -40 }),
    body('Restaurant\nMalmö, 2023', 1540, 410, 300, { size: 28, lh: 1.3 }),
    L(1540, 560, FEND, 560, INK, 3),
    body('Forty seats and one long table. The kitchen is behind glass, so the room is quiet and the cooks are not.', 1540, 590, 300, { size: 28, lh: 1.3 }),
    lab('Fig. 2.1  The long table, before opening', FX, 940, 1030),
  ], { notes: 'Project two. The long table is the whole idea. Everything else was fitted around it.' }));

  // 7 Project three
  pages.push(page(PAPER, [
    furniture(7, 'Selected work'),
    img('photos/studio.jpg', FX, 100, 660, 520, { filters: bw({ contrast: 18 }) }),
    img('photos/hands-clay.jpg', 1150, 100, 330, 520, { filters: bw({ contrast: 24 }) }),
    img('photos/plant.jpg', 1510, 300, 330, 520, { filters: bw({ contrast: 14 }) }),
    lab('03', FX, 662, 100, { color: GREEN, size: 24 }),
    big('Ateljé\nLera', FX - 4, 700, 700, 110, { ls: -50, lh: 0.92 }),
    body('Ceramics studio, Ystad, 2022', FX, 925, 660, { size: 30, weight: 500 }),
    body('A former garage turned into a workshop for six potters. Kilns on the north wall, long benches under the windows.', 1150, 700, 330, { size: 26, lh: 1.3 }),
    lab('Fig. 3.1 to 3.3', 1510, 850, 330),
  ], { notes: 'Project three. Three pictures of one room: the whole, the hands and the light.' }));

  // 8 Case study statement (green)
  pages.push(page(GREEN, [
    L(SEP, 0, SEP, H, INK, 1, { opacity: 0.5 }),
    T('Studio Orrby', RX, 40, RW, { font: AS, size: 30, weight: 800, ls: -15 }),
    lab('Case study', RX, 90, RW),
    lab('08 / 14', RX, 1028, RW),
    big('The brief:\na house that survives eight months of nobody home.', FX - 6, 150, fw(4) - 20, 116, { ls: -45, lh: 0.98 }),
    L(FX, 800, FEND, 800, INK, 3),
    body('Skärgårdshus, Sandhamn. Wind from three sides, salt in everything, one ferry a day in winter.', fc(0), 830, fw(2), { size: 32, weight: 500 }),
    body('A family of five wanted it open from May to September and shut and safe from October to April.', fc(2), 830, fw(2), { size: 32, weight: 500 }),
  ], { notes: 'Now one project in depth. The brief was the most honest part: a house mostly empty.' }));

  // 9 Process
  {
    const st = [['01', 'Listen', 3, 'Three weeks of visits, in every season we can fit.'], ['02', 'Draw', 9, 'Nine weeks of models. The family chooses between two.'], ['03', 'Build', 38, 'Thirty eight weeks on site, a visit every Thursday.'], ['04', 'Return', 2, 'We come back after the first winter and fix what it found.']];
    pages.push(page(PAPER, [
      furniture(9, 'Process'),
      big('How a project goes', FX - 4, 100, fw(4), 100, { ls: -45 }),
      st.map(([n, t, wk, d], i) => [
        L(fc(i), 340, fc(i) + fw(1), 340, INK, 3),
        lab(n, fc(i), 364, 100, { color: GREEN, size: 24 }),
        T(t, fc(i) - 2, 410, fw(1), { font: AS, size: 90, weight: 800, ls: -45, lh: 1, color: INK }),
        body(d, fc(i), 540, fw(1) - 10, { size: 28, lh: 1.32 }),
        rect(fc(i), 860, Math.max(14, (wk / 38) * fw(1)), 28, i === 2 ? GREEN : INK),
        lab(`${wk} weeks`, fc(i), 910, fw(1), { size: 22 }),
      ]),
      lab('Bar length is time', FX, 1028, 600),
    ], { notes: 'Four stages. The bars under each one are drawn to scale, so you can see where the time really goes: on site.' }));
  }

  // 10 Results (ink)
  pages.push(page(INK, [
    L(SEP, 0, SEP, H, PAPER, 1, { opacity: 0.35 }),
    T('Studio Orrby', RX, 40, RW, { font: AS, size: 30, weight: 800, ls: -15, color: PAPER }),
    lab('Results', RX, 90, RW, { color: PAPER }),
    lab('10 / 14', RX, 1028, RW, { color: PAPER }),
    [['41 %', 'less energy for heating than a standard house of the same size'], ['21', 'days ahead of schedule at handover, on the agreed budget'], ['3', 'new commissions from neighbours who walked past the site']].map(([n, t, ], i) => [
      T(n, FX + i * 460 - 6, 150, 440, { font: AS, size: 200, weight: 800, ls: -80, lh: 1, color: PAPER }),
      rect(FX + i * 460, 560, 400, 10, GREEN),
      T(t, FX + i * 460, 610, 380, { font: AS, size: 32, weight: 500, lh: 1.3, color: PAPER }),
    ]),
    lab('Skärgårdshus, measured over the first full year', FX, 940, 1000, { color: PAPER }),
  ], { notes: 'Three outcomes, plainly. The third one is the one we are proudest of: the neighbours noticed.' }));

  // 11 Quote
  pages.push(page(PAPER, [
    furniture(11, 'Client'),
    big('They drew the house\naround how we actually\nlive, not how we\nsay we live.', FX - 6, 150, fw(4) - 30, 112, { ls: -45, lh: 0.98 }),
    L(FX, 760, FX + 200, 760, GREEN, 10),
    T('Karin and Ola Lund', FX, 800, 800, { font: AS, size: 44, weight: 800, ls: -20, color: INK }),
    body('Skärgårdshus, Sandhamn', FX, 860, 800, { size: 30 }),
  ], { notes: 'A client in their own words. Ask permission and use their full names.' }));

  // 12 Clients
  {
    const cl = ['Saltvik Hotel', 'Bord 9', 'Ateljé Lera', 'Villa Lindh', 'Fiskeläget Housing', 'Tåg Café', 'Kullen Residency', 'Hav och Hem', 'Pilgatan 6 Housing', 'Oskarsson Pottery', 'Studio Lund', 'Norra Hamnen Friends'];
    pages.push(page(PAPER, [
      furniture(12, 'Clients'),
      big('People who\nhired us twice', FX - 4, 100, fw(3), 100, { ls: -45, lh: 0.95 }),
      cl.map((c, i) => {
        const row = Math.floor(i / 3);
        const cx = FX + (i % 3) * 460;
        const y = 400 + row * 140;
        return [L(cx, y, cx + 420, y, INK, row === 0 ? 3 : 1), T(c, cx, y + 26, 420, { font: AS, size: 38, weight: i % 5 === 0 ? 800 : 500, ls: -15, lh: 1.15, color: INK })];
      }),
    ], { notes: 'A plain list. The bold ones are clients who came back for a second project.' }));
  }

  // 13 Team
  {
    const ppl = [['photos/portrait-window.jpg', 'Sofia Orr', 'Founder, architect'], ['photos/portrait-man-sun.jpg', 'Jonas Berg', 'Interiors'], ['photos/man.jpg', 'Henrik Dahl', 'Site architect'], ['photos/portrait.jpg', 'Alma Rask', 'Project lead']];
    pages.push(page(PAPER, [
      furniture(13, 'People'),
      ppl.map(([ph, n, r], i) => [
        img(ph, fc(i), 130 + (i % 2) * 70, fw(1), 520, { filters: bw({ contrast: 14 }) }),
        T(n, fc(i), 700 + (i % 2) * 70, fw(1), { font: AS, size: 44, weight: 800, ls: -20, lh: 1.05, color: INK }),
        lab(r, fc(i), 770 + (i % 2) * 70, fw(1)),
      ]),
      body('Nine people in all. Five more on the next page of our site.', FX, 960, 900, { size: 28 }),
    ], { notes: 'The four people you will meet first. The rest of the studio is on the website.' }));
  }

  // 14 Contact
  pages.push(page(GREEN, [
    L(SEP, 0, SEP, H, INK, 1, { opacity: 0.5 }),
    T('Studio Orrby', RX, 40, RW, { font: AS, size: 30, weight: 800, ls: -15 }),
    lab('Contact', RX, 90, RW),
    lab('14 / 14', RX, 1028, RW),
    big('Say\nhello', FX - 14, 50, 1400, 360, { ls: -90, lh: 0.98 }),
    L(FX, 760, FEND, 760, INK, 3),
    [['Write', 'hej@orrby.example'], ['Visit', 'Södra Förstadsgatan 12\n211 43 Malmö'], ['Follow', '@studioorrby\norrby.example']].map(([k, v], i) => [
      lab(k, fc(i === 0 ? 0 : i === 1 ? 1.2 : 3), 790, 300, { weight: 500 }),
      T(v, fc(i === 0 ? 0 : i === 1 ? 1.2 : 3), 840, i === 1 ? 460 : 330, { font: AS, size: 32, weight: 600, lh: 1.3, color: INK }),
    ]),
    qr('https://orrby.example', FEND - 220, 90, 220, INK, GREEN),
  ], { notes: 'Close on the contact details. We answer every email within two days, which is worth saying out loud.' }));

  DECKS.push(tpl({
    id: 'deck-swiss-grid-portfolio',
    name: 'Studio portfolio deck',
    format: 'slide',
    category: 'Presentation',
    tags: ['presentation', 'slides', 'deck', 'portfolio', 'case study', 'architecture', 'design studio', 'swiss'],
    pages,
  }));
}

// END
