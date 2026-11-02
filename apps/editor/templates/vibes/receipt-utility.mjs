import { tpl, page, T, S, rect, circle, path, L, svg, qr, overlay, stroke } from '../kit.mjs';

// Pseudo random so barcodes are the same every build.
const rng = (seed) => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
const barcode = (x, y, w, h, color, seed = 7) => {
  const r = rng(seed); const out = []; let cx = x;
  while (cx < x + w - 4) { const bw = 1.5 + Math.floor(r() * 4) * 1.5; const gap = 1.5 + Math.floor(r() * 3) * 1.5; out.push(rect(cx, y, Math.min(bw, x + w - cx), h, color)); cx += bw + gap; }
  return out;
};
// Receipt paper with zigzag top and bottom, as one path.
const paper = (x, y, w, h, fill, p = {}) => {
  const t = 14, th = 9; let d = `M0 ${th}`;
  for (let i = 0; i < w / t; i++) d += ` L${i * t + t / 2} 0 L${Math.min((i + 1) * t, w)} ${th}`;
  d += ` L${w} ${h - th}`;
  for (let i = Math.floor(w / t); i >= 0; i--) d += ` L${i * t + t / 2} ${h} L${i * t} ${h - th}`;
  d += ' Z';
  return path(d, x, y, w, h, fill, { w0: w, h0: h, ...p });
};
const MONO = 'Courier Prime';
// Table rows: qty, name, price on fixed columns.
const lines = (rowsArr, x, y, w, pitch, size, color, o = {}) => rowsArr.map(([q, n, p], i) => [
  q !== '' && T(q, x, y + i * pitch, 50, { font: o.font ?? MONO, size, weight: 700, color }),
  T(n, x + (o.qw ?? 52), y + i * pitch, w - (o.qw ?? 52) - 120, { font: o.font ?? MONO, size, weight: 400, color, lh: 1.15 }),
  T(p, x + w - 110, y + i * pitch, 110, { font: o.font ?? MONO, size, weight: 700, color, align: 'right' }),
]);
const dash = (x1, y, x2, color, w = 1.5) => L(x1, y, x2, y, color, w, { dash: 'dash' });

// ------------------------------------------------------------ 1
const marketPoster = (() => {
  const RED = '#D9342B', INK = '#1A1816', PAPER = '#F7F4EC';
  const X = 244, W = 635, IX = X + 44, IW = W - 88;
  return tpl({
    id: 'receipt-market-poster', name: 'Receipt poster, market stall', format: 'poster', category: 'Poster', tags: ['receipt', 'market', 'poster', 'list'],
    pages: [page(RED, [
      T('THANK YOU THANK YOU', -560, 700, 1400, { font: 'Archivo', size: 200, weight: 900, color: '#BB241C', rotation: 270, ls: -30, lh: 0.9 }),
      paper(X, 90, W, 1400, PAPER, { shadow: { x: 0, y: 20, blur: 40, color: '#00000055' } }),
      T('SUNDAY\nMARKET', IX, 150, IW, { font: 'Archivo', size: 112, weight: 900, color: INK, ls: -40, lh: 0.88, align: 'center' }),
      T('Hammarby Torg, stall 14\nOrg. no 559123-4567', IX, 360, IW, { font: MONO, size: 19, color: INK, align: 'center', lh: 1.35 }),
      dash(IX, 450, IX + IW, INK),
      T('DATE 12/10/2025', IX, 470, 300, { font: MONO, size: 18, color: INK }),
      T('CASHIER Ines', IX, 470, IW, { font: MONO, size: 18, color: INK, align: 'right' }),
      T('RECEIPT No. 0412', IX, 500, 300, { font: MONO, size: 18, color: INK }),
      dash(IX, 548, IX + IW, INK),
      T('QTY  ITEM', IX, 568, 300, { font: MONO, size: 17, weight: 700, color: INK }),
      T('SEK', IX, 568, IW, { font: MONO, size: 17, weight: 700, color: INK, align: 'right' }),
      lines([['1', 'Rye loaf, seeded', '58.00'], ['2', 'Honey, small jar', '190.00'], ['1.2', 'Apples, kg', '57.60'], ['1', 'Goat cheese, ash', '79.00'], ['1', 'Dahlias, a bunch', '60.00'], ['4', 'Cardamom buns', '72.00'], ['1', 'Cloth tote', '45.00'], ['1', 'A kind word', '0.00']], IX, 612, IW, 46, 20, INK),
      dash(IX, 1000, IX + IW, INK),
      T('SUBTOTAL', IX, 1020, 300, { font: MONO, size: 20, color: INK }),
      T('561.60', IX, 1020, IW, { font: MONO, size: 20, color: INK, align: 'right' }),
      T('VAT 12 percent incl.', IX, 1056, 400, { font: MONO, size: 20, color: INK }),
      T('60.17', IX, 1056, IW, { font: MONO, size: 20, color: INK, align: 'right' }),
      T('TOTAL', IX, 1110, 300, { font: 'Archivo', size: 46, weight: 900, color: INK, ls: -20 }),
      T('561.60', IX, 1110, IW, { font: 'Archivo', size: 46, weight: 900, color: INK, align: 'right', ls: -20 }),
      dash(IX, 1186, IX + IW, INK),
      barcode(IX + 20, 1210, IW - 40, 120, INK, 11),
      T('4 0 1 2   0 5 5 9   1 2 3 4', IX, 1338, IW, { font: MONO, size: 16, color: INK, align: 'center', ls: 100 }),
      T('Thank you, see you next Sunday.\nBring the jar back.', IX, 1388, IW, { font: MONO, size: 19, color: INK, align: 'center', lh: 1.35 }),
      circle(700, 1180, 280, 'transparent', { stroke: stroke('#2B3FD6', 7), rotation: 0, blend: 'multiply', opacity: 0.9 }),
      T('PAID', 700, 1260, 280, { font: 'Archivo', size: 90, weight: 900, color: '#2B3FD6', align: 'center', rotation: -14, blend: 'multiply', ls: 20 }),
      overlay('tex/photocopy-toner.jpg', 1123, 1587, 'multiply', 0.25),
    ])],
  });
})();

// ------------------------------------------------------------ 2
const ingredients = (() => {
  const BG = '#F5F2E9', INK = '#111111';
  const icon = (x, shape, label) => [
    rect(x, 1286, 150, 150, 'transparent', { stroke: stroke(INK, 4) }),
    S(shape, x + 35, 1316, 80, 80, INK),
    T(label, x, 1446, 150, { font: 'Archivo', size: 13, weight: 800, color: INK, upper: true, ls: 120, align: 'center' }),
  ];
  return tpl({
    id: 'receipt-ingredients-label', name: 'Ingredients label poster', format: 'poster', category: 'Poster', tags: ['label', 'ingredients', 'nutrition', 'poster'],
    pages: [page(BG, [
      T('Weekend', 44, 30, 1100, { font: 'Archivo', size: 238, weight: 800, color: INK, ls: -70, lh: 1 }),
      rect(60, 330, 1003, 10, INK),
      T('Contents: 1 weekend, 48 hours', 60, 366, 700, { font: 'Archivo', size: 26, weight: 700, color: INK, ls: -5 }),
      T('INGREDIENTS', 60, 440, 520, { font: 'Archivo', size: 15, weight: 800, color: INK, ls: 200 }),
      T('Sleep (31%), coffee (12%), long walks (10%), a book not finished (8%), bread, butter, friends who stay too late (6%), a record played twice (4%), unanswered messages (3%), nothing planned (26%). May contain traces of rain.', 60, 474, 520, { font: 'Archivo', size: 21, weight: 600, color: INK, lh: 1.32, upper: true, ls: 10 }),
      rect(60, 860, 520, 4, INK),
      T('WARNING', 60, 884, 520, { font: 'Archivo', size: 15, weight: 800, color: INK, ls: 200 }),
      T('Side effects include lingering in bed, saying yes to a second dinner and forgetting what day it is.', 60, 918, 520, { font: 'Archivo', size: 19, weight: 500, color: INK, lh: 1.35 }),
      T('100%', 590, 420, 520, { font: 'Archivo', size: 184, weight: 800, color: INK, ls: -70, lh: 1 }),
      T('RESTED', 604, 600, 480, { font: 'Archivo', size: 104, weight: 800, color: INK, ls: -30, lh: 1 }),
      T('Best enjoyed slowly.\nDo not shake.\nNot for resale.', 610, 740, 460, { font: 'Archivo', size: 26, weight: 600, color: INK, lh: 1.3 }),
      rect(60, 1206, 1003, 4, INK),
      barcode(800, 1286, 263, 130, INK, 21),
      T('ONE OF A KIND', 800, 1430, 263, { font: 'Archivo', size: 16, weight: 800, color: INK, ls: 200, align: 'center' }),
      T('Packed in Stockholm, in a good mood. Best before Monday 07:30.', 60, 1520, 1003, { font: 'Archivo', size: 15, weight: 600, color: INK, upper: true, ls: 100 }),
      overlay('tex/photocopy-toner.jpg', 1123, 1587, 'multiply', 0.22),
    ])],
  });
})();

// ------------------------------------------------------------ 3
const invoice = (() => {
  const BG = '#C9C9C6', INK = '#141414';
  const f = 'IBM Plex Mono', g = 'Space Grotesk';
  const meta = (x, k, v) => [T(k, x, 160, 150, { font: f, size: 9.5, color: INK, upper: true, ls: 120, opacity: 0.6 }), T(v, x, 180, 150, { font: f, size: 12, weight: 500, color: INK })];
  const items = [['01', 'Brand identity, discovery', '1', '12 000'], ['02', 'Logo and wordmark', '1', '18 000'], ['03', 'Type and colour system', '1', '9 500'], ['04', 'Guidelines, 24 pages', '1', '14 000'], ['05', 'Stationery set', '1', '6 500']];
  return tpl({
    id: 'receipt-invoice-grey', name: 'Invoice, tight grid', format: 'a4', category: 'Business', tags: ['invoice', 'billing', 'document', 'freelance'],
    pages: [page(BG, [
      T('[Studio name]', 40, 40, 420, { font: g, size: 26, weight: 700, color: INK, ls: -10 }),
      T('INVOICE', 394, 40, 360, { font: g, size: 26, weight: 700, color: INK, align: 'right', ls: -10 }),
      L(40, 112, 754, 112, INK, 2),
      meta(40, 'Invoice no', '2025-014'), meta(214, 'Issued', '12 Oct 2025'), meta(388, 'Due', '11 Nov 2025'), meta(562, 'Project', 'Harbour & Co'),
      L(40, 220, 754, 220, INK, 1),
      T('Billed to', 40, 240, 300, { font: f, size: 9.5, color: INK, upper: true, ls: 120, opacity: 0.6 }),
      T('Harbour & Co AB\nAttn. Maria Sandell\nKajen 4, 111 49 Stockholm\nOrg. no 556789-0123', 40, 262, 340, { font: f, size: 12, color: INK, lh: 1.5 }),
      T('From', 394, 240, 300, { font: f, size: 9.5, color: INK, upper: true, ls: 120, opacity: 0.6 }),
      T('Studio Name\nBox 123, 118 22 Stockholm\nhello@studio.example\nVAT SE556000000001', 394, 262, 360, { font: f, size: 12, color: INK, lh: 1.5 }),
      rect(40, 400, 714, 30, INK),
      T('No', 52, 408, 40, { font: f, size: 10, weight: 600, color: BG, upper: true, ls: 120 }),
      T('Description', 110, 408, 300, { font: f, size: 10, weight: 600, color: BG, upper: true, ls: 120 }),
      T('Qty', 460, 408, 60, { font: f, size: 10, weight: 600, color: BG, upper: true, ls: 120 }),
      T('Amount, SEK', 594, 408, 148, { font: f, size: 10, weight: 600, color: BG, upper: true, ls: 120, align: 'right' }),
      items.map(([n, d, q, a], i) => [
        T(n, 52, 450 + i * 42, 40, { font: f, size: 12, color: INK }), T(d, 110, 450 + i * 42, 340, { font: f, size: 12.5, color: INK }),
        T(q, 460, 450 + i * 42, 60, { font: f, size: 12, color: INK }), T(a, 594, 450 + i * 42, 148, { font: f, size: 12.5, weight: 500, color: INK, align: 'right' }),
        L(40, 478 + i * 42, 754, 478 + i * 42, INK, 0.8),
      ]),
      T('Subtotal', 460, 690, 120, { font: f, size: 12, color: INK }), T('60 000', 594, 690, 148, { font: f, size: 12.5, color: INK, align: 'right' }),
      T('VAT 25 percent', 460, 720, 140, { font: f, size: 12, color: INK }), T('15 000', 594, 720, 148, { font: f, size: 12.5, color: INK, align: 'right' }),
      L(460, 752, 754, 752, INK, 2),
      T('Total due', 460, 766, 140, { font: g, size: 16, weight: 700, color: INK }), T('75 000', 594, 760, 148, { font: g, size: 28, weight: 700, color: INK, align: 'right', ls: -20 }),
      qr('https://example.com/pay/2025-014', 40, 700, 110, INK, BG),
      T('Scan to pay', 40, 818, 140, { font: f, size: 10, color: INK, upper: true, ls: 120 }),
      T('PAYMENT', 40, 938, 500, { font: g, size: 78, weight: 700, color: INK, ls: -40, lh: 1 }),
      L(40, 1040, 754, 1040, INK, 1),
      T('Bankgiro 123 4567\nIBAN SE45 5000 0000 0583 9825 7466\nReference 2025014', 40, 1054, 400, { font: f, size: 11, color: INK, lh: 1.5 }),
      T('Late fee 8 percent after due date.\nThank you for the work together.', 394, 1054, 360, { font: f, size: 11, color: INK, lh: 1.5, align: 'right' }),
    ])],
  });
})();

// ------------------------------------------------------------ 4
const shipLabel = (() => {
  const G = '#3BE05A', INK = '#0C0C0C';
  const f = 'Archivo';
  const box = (x, y, w, h) => rect(x, y, w, h, 'transparent', { stroke: stroke(INK, 5) });
  const up = `<svg viewBox="0 0 100 100"><path d="M50 8 L82 40 H62 V92 H38 V40 H18Z" fill="${INK}"/></svg>`;
  const glass = `<svg viewBox="0 0 100 100"><path d="M24 10 H76 L64 54 Q62 66 54 66 V84 H70 V92 H30 V84 H46 V66 Q38 66 36 54Z" fill="${INK}"/></svg>`;
  const umb = `<svg viewBox="0 0 100 100"><path d="M8 54 Q8 14 50 12 Q92 14 92 54 Z M50 54 V80 Q50 90 40 90 Q34 90 34 84" fill="none" stroke="${INK}" stroke-width="9" stroke-linejoin="round"/></svg>`;
  return tpl({
    id: 'receipt-shipping-label', name: 'Shipping label story', format: 'story', category: 'Social', tags: ['shipping', 'label', 'drop', 'story', 'launch'],
    pages: [page(G, [
      box(40, 40, 1000, 1840),
      L(40, 360, 1040, 360, INK, 5), L(40, 1130, 1040, 1130, INK, 5), L(340, 40, 340, 360, INK, 5),
      T('N', 40, 20, 300, { font: f, size: 330, weight: 800, color: INK, align: 'center', lh: 1 }),
      T('CANDLE BATCH\nNO. 11 OF 12\nSHIPS 18 JUNE\nHAND POURED', 372, 66, 400, { font: f, size: 34, weight: 800, color: INK, lh: 1.25, ls: 20 }),
      svg(up, 800, 70, 100, 100), svg(glass, 920, 70, 100, 100), svg(umb, 800, 200, 100, 100),
      T('11', 0, 400, 900, { font: f, size: 600, weight: 800, color: INK, ls: -80, lh: 1 }),
      T('OF', 700, 450, 320, { font: f, size: 130, weight: 800, color: INK, ls: -20, lh: 1 }),
      T('12', 700, 570, 320, { font: f, size: 250, weight: 800, color: INK, ls: -40, lh: 1 }),
      T('4,7 kg', 700, 860, 330, { font: f, size: 70, weight: 800, color: INK, ls: -20 }),
      T('Fragile, wax\nand glass', 700, 950, 330, { font: f, size: 34, weight: 700, color: INK, lh: 1.15 }),
      T('TRACKING', 70, 1160, 400, { font: f, size: 20, weight: 800, color: INK, ls: 200 }),
      T('STO 0418 7731 02', 70, 1196, 700, { font: f, size: 54, weight: 800, color: INK, ls: -10 }),
      barcode(70, 1290, 600, 170, INK, 31),
      qr('https://example.com/batch/11', 740, 1170, 270, INK, G),
      L(40, 1520, 1040, 1520, INK, 5),
      T('When we started pouring in a borrowed garage, we told ourselves we would make twelve batches and then see. This is the eleventh. Each one is numbered, each one is a little different, and the last is coming in August.', 70, 1550, 940, { font: f, size: 30, weight: 500, color: INK, lh: 1.3 }),
      T('SHIPPED JUN 18   ZIP 118 22   9000', 70, 1810, 940, { font: f, size: 22, weight: 800, color: INK, ls: 150 }),
      overlay('tex/photocopy-toner.jpg', 1080, 1920, 'multiply', 0.18),
    ])],
  });
})();

// ------------------------------------------------------------ 5
const lineupCarousel = (() => {
  const BLUE = '#2A4FEE', PAPER = '#FBFBF7', INK = '#1330C8';
  const f = 'Space Mono';
  const rec = (p) => [rect(0, 0, 1080, 1350, BLUE), paper(150, 60, 780, 1230, PAPER, { shadow: { x: 0, y: 16, blur: 30, color: '#00000044' } }), ...p];
  const lineup = [['21:00', 'Orion Beats', 'Live'], ['22:00', 'Luma Nova', 'DJ set'], ['23:15', 'Bass Aurora', 'Live'], ['00:30', 'Darkwave Club', 'DJ set'], ['02:00', 'Closing, all of us', '']];
  return tpl({
    id: 'receipt-lineup-carousel', name: 'Line up as a receipt, 3 posts', format: 'post', category: 'Social', tags: ['carousel', 'lineup', 'event', 'receipt', 'club'],
    pages: [
      page(BLUE, rec([
        T('MIDNIGHT\nMARKET', 190, 150, 720, { font: 'Archivo', size: 116, weight: 900, color: INK, ls: -60, lh: 0.88 }),
        T('Night market and live music\nin the old customs hall.', 190, 400, 700, { font: f, size: 28, weight: 400, color: INK, lh: 1.35 }),
        dash(190, 580, 890, INK, 2),
        T('SAT 25 OCT 2025\nDOORS 20:00 UNTIL 04:00\nTULLHUSET, NORRKOPING', 190, 610, 700, { font: f, size: 24, weight: 700, color: INK, lh: 1.6 }),
        dash(190, 790, 890, INK, 2),
        barcode(190, 850, 700, 230, INK, 41),
        T('0 0 0 2 5 1 0 2 0 2 5', 190, 1100, 700, { font: f, size: 22, color: INK, ls: 200, align: 'center' }),
        T('1 / 3   Swipe for the line up', 190, 1200, 700, { font: f, size: 22, weight: 700, color: INK }),
      ])),
      page(BLUE, rec([
        T('LINE UP', 190, 130, 700, { font: 'Archivo', size: 120, weight: 900, color: INK, ls: -40, lh: 1 }),
        dash(190, 280, 890, INK, 2),
        T('TIME', 190, 300, 150, { font: f, size: 20, weight: 700, color: INK, ls: 100 }),
        T('ACT', 360, 300, 300, { font: f, size: 20, weight: 700, color: INK, ls: 100 }),
        T('FORMAT', 690, 300, 200, { font: f, size: 20, weight: 700, color: INK, ls: 100, align: 'right' }),
        lineup.map(([t, a, k], i) => [
          T(t, 190, 360 + i * 130, 150, { font: f, size: 28, weight: 700, color: INK }),
          T(a, 360, 360 + i * 130, 400, { font: 'Archivo', size: 46, weight: 800, color: INK, ls: -20, lh: 1 }),
          T(k, 690, 372 + i * 130, 200, { font: f, size: 22, color: INK, align: 'right' }),
          dash(190, 440 + i * 130, 890, INK, 1.5),
        ]),
        T('SUBTOTAL  5 ACTS', 190, 1030, 400, { font: f, size: 22, color: INK }),
        T('TOTAL  6 HOURS OF MUSIC', 190, 1070, 600, { font: f, size: 26, weight: 700, color: INK }),
        T('2 / 3', 190, 1200, 700, { font: f, size: 22, weight: 700, color: INK }),
      ])),
      page(BLUE, rec([
        T('ADMIT\nONE', 190, 130, 700, { font: 'Archivo', size: 150, weight: 900, color: INK, ls: -60, lh: 0.88 }),
        dash(190, 440, 890, INK, 2),
        T('Tickets 250 SEK\nStudents 180 SEK\nChildren free until 22:00\nCash only at the stalls', 190, 470, 700, { font: f, size: 27, color: INK, lh: 1.55 }),
        dash(190, 740, 890, INK, 2),
        qr('https://example.com/midnight-market', 190, 790, 300, INK, PAPER),
        T('Scan to buy\nor ask a friend\nwho already did.', 540, 800, 350, { font: f, size: 24, weight: 700, color: INK, lh: 1.5 }),
        barcode(190, 1120, 700, 60, INK, 52),
        T('3 / 3   See you there', 190, 1210, 700, { font: f, size: 22, weight: 700, color: INK }),
      ])),
    ],
  });
})();

// ------------------------------------------------------------ 6
const priceReceipt = (() => {
  const BLUE = '#2D4FD6', Y = '#F7C531', RED = '#D93A1A', INK = '#1A1410';
  const items = [['Clean cut', '450'], ['Cut and wash', '520'], ['Skin fade', '480'], ['Beard trim', '250'], ['Hot towel shave', '380'], ['Kids under 12', '320'], ['Fringe, between cuts', '100']];
  return tpl({
    id: 'receipt-price-list', name: 'Price list on a receipt', format: 'flyer', category: 'Print', tags: ['price list', 'barber', 'services', 'receipt', 'flyer'],
    pages: [page(BLUE, [
      paper(40, 36, 479, 722, Y, { shadow: { x: 0, y: 8, blur: 18, color: '#00000055' } }),
      T('Clip & Co', 60, 78, 439, { font: 'Bowlby One', size: 62, color: RED, align: 'center', lh: 1, ls: -10 }),
      T('BARBER SHOP SINCE 1998', 60, 152, 439, { font: 'Courier Prime', size: 13, weight: 700, color: INK, align: 'center', ls: 250 }),
      dash(64, 190, 495, INK, 1.2),
      T('SERVICE', 64, 204, 200, { font: 'Courier Prime', size: 13, weight: 700, color: INK, ls: 150 }),
      T('SEK', 64, 204, 431, { font: 'Courier Prime', size: 13, weight: 700, color: INK, ls: 150, align: 'right' }),
      items.map(([n, p], i) => [
        T(n, 64, 238 + i * 50, 300, { font: 'Courier Prime', size: 19, weight: 700, color: INK }),
        L(64, 266 + i * 50, 495, 266 + i * 50, INK, 1, { dash: 'dot' }),
        T(p, 395, 238 + i * 50, 100, { font: 'Courier Prime', size: 19, weight: 700, color: INK, align: 'right' }),
      ]),
      dash(64, 594, 495, INK, 1.2),
      T('TOTAL', 64, 610, 200, { font: 'Bowlby One', size: 24, color: RED }),
      T('A GOOD MOOD', 264, 614, 231, { font: 'Courier Prime', size: 15, weight: 700, color: INK, align: 'right' }),
      barcode(110, 656, 340, 52, INK, 61),
      T('Walk ins welcome, Tue to Sat 10 to 18', 64, 718, 431, { font: 'Courier Prime', size: 12, weight: 700, color: INK, align: 'center' }),
      overlay('tex/photocopy-toner.jpg', 559, 794, 'multiply', 0.2),
    ])],
  });
})();

export default [marketPoster, ingredients, invoice, shipLabel, lineupCarousel, priceReceipt];
