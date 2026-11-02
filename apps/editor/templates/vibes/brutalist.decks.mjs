import { tpl, page, T, S, rect, circle, path, L, img, overlay, svg, qr, solid, stroke, pattern } from '../kit.mjs';

// Shared helpers. Three decks, three palettes, one printed-report attitude.
const grit = (a = 0.2) => overlay('tex/photocopy-toner.jpg', 1920, 1080, 'multiply', a);
const bw = (extra = {}) => ({ saturation: -100, contrast: 60, brightness: 0, grain: 25, ...extra });
const hollow = (x, y, w, h, c, wd = 6) => rect(x, y, w, h, null, { fill: solid('rgba(0,0,0,0)'), stroke: stroke(c, wd) });
const pad = (n) => String(n).padStart(2, '0');

// Page furniture: section label, page number, running footer. Same place on every slide.
const furniture = (f, n, total, label, ink, left, right) => [
  T(label, 60, 30, 900, { font: f.mono, weight: 700, size: 24, lh: 1.3, ls: 120, upper: true, color: ink }),
  T(`${pad(n)} / ${pad(total)}`, 1460, 30, 400, { font: f.mono, weight: 700, size: 24, lh: 1.3, ls: 60, align: 'right', color: ink }),
  L(60, 80, 1860, 80, ink, 3),
  T(left, 60, 1028, 900, { font: f.mono, weight: 500, size: 22, lh: 1.3, ls: 40, color: ink }),
  T(right, 960, 1028, 900, { font: f.mono, weight: 500, size: 22, lh: 1.3, ls: 40, align: 'right', color: ink }),
];

// ---------------------------------------------------------------------------------------------
// 1. STAPEL, a product launch deck. Paper, black, safety orange. Archivo 900 + Chivo Mono.
// ---------------------------------------------------------------------------------------------
const PAPER = '#F0EEE7', INK = '#0E0E0E', ORG = '#FF5A1E', CONC = '#C9C7BF', MID = '#5E5D57';
const BR = { mono: 'Chivo Mono' };
const BT = 14;
const bF = (n, label, ink = INK) => furniture(BR, n, BT, label, ink, 'Stapel / Launch deck / Autumn 2026', 'stapel.example');
const bD = (t, x, y, w, size, p = {}) => T(t, x, y, w, { font: 'Archivo', weight: 900, size, lh: 0.9, ls: -30, color: INK, ...p });
const bB = (t, x, y, w, size = 32, p = {}) => T(t, x, y, w, { font: 'Archivo', weight: 500, size, lh: 1.3, color: INK, ...p });
const bM = (t, x, y, w, size = 24, p = {}) => T(t, x, y, w, { font: 'Chivo Mono', weight: 500, size, lh: 1.35, color: INK, ...p });

const brand = tpl({
  id: 'deck-brutalist-brand', name: 'Product launch deck', format: 'slide', category: 'Presentation',
  tags: ['presentation', 'slides', 'deck', 'pitch', 'launch', 'product', 'brand', 'startup'],
  pages: [
    page(PAPER, [
      bM('Launch deck', 60, 36, 600, 24, { weight: 700, upper: true, ls: 120 }),
      bM('Stockholm, autumn 2026', 1260, 36, 600, 24, { weight: 700, upper: true, ls: 120, align: 'right' }),
      L(60, 80, 1860, 80, INK, 3),
      bD('Shelves\nthat stack.', 60, 130, 1500, 170, { lh: 0.88, ls: -50 }),
      bB('Preorders open\n30 September', 1440, 150, 420, 34, { weight: 700, lh: 1.2, align: 'right' }),
      rect(0, 600, 1920, 480, INK),
      bD('STAPEL', 40, 520, 1880, 440, { color: ORG, lh: 0.8, ls: -30 }),
      bM('Presented by Elsa Brandt, founder', 60, 985, 900, 26, { color: PAPER, weight: 700 }),
      grit(0.18),
    ], { name: 'Cover', notes: 'Introduce Stapel in one sentence: a shelf made of modules that stack, lock with a quarter turn and move with you. Say the preorder date out loud.' }),

    page(INK, [
      ...bF(2, 'Manifesto', PAPER),
      bD('We make one thing.\nA shelf you build in nine\nminutes and carry to every\nflat you ever rent.', 60, 150, 1640, 118, { color: PAPER, lh: 1, ls: -35 }),
      rect(1740, 80, 180, 930, ORG),
      T('MANIFESTO', 1490, 480, 700, { font: 'Archivo', weight: 900, size: 84, lh: 1, ls: 80, color: INK, rotation: 90, align: 'center' }),
      bM('Written by the six people who make it.', 60, 930, 900, 28, { color: PAPER }),
      grit(0.22),
    ], { name: 'Manifesto', notes: 'Read the statement slowly. It is the whole company in two sentences, so do not add anything before the next slide.' }),

    page(PAPER, [
      ...bF(3, 'Contents'),
      bD('IN THIS\nDECK', 60, 130, 760, 190, { lh: 0.86, ls: -50 }),
      rect(60, 700, 760, 270, ORG),
      bB('Eleven minutes, one product, one date. Questions are welcome on any slide.', 90, 735, 700, 38, { weight: 700, lh: 1.25 }),
      ...[
        ['The problem', '05'], ['The idea', '06'], ['The product', '07'], ['How it works', '08'],
        ['The numbers', '09'], ['Compared', '11'], ['Launch plan', '12'], ['Team and contact', '13'],
      ].flatMap(([t, p], i) => {
        const y = 130 + i * 110;
        return [
          L(900, y, 1860, y, INK, i === 0 ? 6 : 2),
          bM(pad(i + 1), 900, y + 36, 100, 28, { weight: 700 }),
          bD(t, 1010, y + 22, 700, 56, { weight: 800, ls: -20 }),
          bM(p, 1700, y + 36, 160, 28, { weight: 700, align: 'right' }),
        ];
      }),
      L(900, 1010, 1860, 1010, INK, 2),
      grit(0.15),
    ], { name: 'Contents', notes: 'Eight blocks. Promise the audience they will see the product on slide seven and the price on slide seven.' }),

    page(ORG, [
      T('01', 780, -60, 1400, { font: 'Archivo', weight: 900, size: 900, lh: 0.9, ls: -60, color: INK }),
      bM('Section one', 60, 36, 600, 24, { weight: 700, upper: true, ls: 120 }),
      L(60, 80, 1860, 80, INK, 3),
      bD('THE\nPROBLEM', 60, 640, 800, 124, { lh: 0.88, ls: -40 }),
      bM('Stapel / Launch deck / Autumn 2026', 60, 1028, 900, 22, { ls: 40 }),
      grit(0.28),
    ], { name: 'Section 01', notes: 'Pause here. The next two slides are about why the old shelf fails, not about us.' }),

    page(PAPER, [
      ...bF(5, 'The problem'),
      bD('Furniture\nis built to\nbe bought\nonce.', 60, 140, 1000, 128, { lh: 0.94, ls: -40 }),
      ...[
        'It arrives as 43 parts and a bag of screws.',
        'It loses a little of its grip every time it moves.',
        'It is not worth the van, so it goes to the tip.',
      ].flatMap((t, i) => [
        L(1100, 140 + i * 190, 1860, 140 + i * 190, INK, i === 0 ? 6 : 2),
        bM(pad(i + 1), 1100, 170 + i * 190, 100, 28, { weight: 700 }),
        bB(t, 1210, 164 + i * 190, 640, 38, { weight: 700, lh: 1.2 }),
      ]),
      rect(0, 740, 1920, 340, INK),
      T('8 of 10', 60, 770, 1100, { font: 'Archivo', weight: 900, size: 270, lh: 0.9, ls: -60, color: ORG }),
      bB('flat pack shelves are thrown out within one move.', 1180, 800, 680, 44, { weight: 700, color: PAPER, lh: 1.15 }),
      bM('Source: our survey of 1 200 renters, June 2026', 1180, 940, 680, 24, { color: CONC }),
      L(60, 80, 1860, 80, INK, 3),
      T('05 / 14', 1460, 30, 400, { font: 'Chivo Mono', weight: 700, size: 24, ls: 60, align: 'right', color: INK }),
      grit(0.18),
    ], { name: 'The problem', notes: 'Three small failures, then the number that hurts. Mention that the survey was ours and small, and that we want to be checked.' }),

    page(PAPER, [
      ...bF(6, 'The idea'),
      bD('One box,\nstacked.', 60, 140, 900, 150, { lh: 0.88, ls: -50 }),
      bB('A module is 40 centimetres of oak ply: two sides and a shelf. It locks to the one above with a quarter turn.', 60, 520, 760, 34, { lh: 1.35 }),
      bB('Buy two now. Buy two more when you get a bigger room.', 60, 780, 760, 34, { weight: 700, lh: 1.35 }),
      // staircase of modules, four columns
      ...[1, 2, 3, 4].flatMap((c) => Array.from({ length: c }, (_, r) => {
        const x = 1000 + (c - 1) * 215, y = 880 - (r + 1) * 175, hot = c === 4 && r === 3;
        return [
          rect(x, y, 215, 175, hot ? ORG : PAPER, { stroke: stroke(INK, 7) }),
          rect(x + 7, y + 100, 201, 20, INK),
        ];
      })),
      L(960, 890, 1860, 890, INK, 7),
      ...[1, 2, 3, 4].map((c) => bM(`${c} ${c === 1 ? 'module' : 'modules'}`, 1000 + (c - 1) * 215, 920, 215, 24, { weight: 700 })),
      L(1900, 880, 1900, 180, INK, 3, { start: 'bar', end: 'bar' }),
      bM('160 cm', 1700, 120, 200, 24, { weight: 700, align: 'right' }),
      grit(0.15),
    ], { name: 'The idea', notes: 'Point at the staircase. Each step is one more module; the orange one is the same box as the bottom one.' }),

    page(PAPER, [
      rect(0, 0, 700, 1080, ORG),
      T('40', 40, 150, 640, { font: 'Archivo', weight: 900, size: 500, lh: 0.8, ls: -50, color: INK }),
      bM('Centimetres a side', 60, 600, 560, 28, { weight: 700, upper: true, ls: 80 }),
      L(60, 80, 640, 80, INK, 3),
      bM('Product', 60, 30, 560, 24, { weight: 700, upper: true, ls: 120 }),
      bD('Stapel\nmodule', 780, 120, 1000, 130, { lh: 0.88, ls: -45 }),
      ...[
        ['Material', 'Oak veneer ply, 18 mm'], ['Finish', 'Raw oil, no varnish'], ['Weight', '5.5 kg'],
        ['Holds', '25 kg per shelf'], ['Tools', 'None'], ['Price', '590 kr'],
      ].flatMap(([k, v], i) => {
        const y = 400 + i * 95;
        return [
          L(780, y, 1860, y, INK, i === 0 ? 6 : 2),
          bM(k, 780, y + 30, 300, 26, { weight: 700, upper: true, ls: 80 }),
          bB(v, 1100, y + 20, 760, 44, { weight: 800, lh: 1.1, ls: -10 }),
        ];
      }),
      L(780, 970, 1860, 970, INK, 6),
      grit(0.2),
    ], { name: 'The product', notes: 'One product, six facts. Let the price land on its own, then move on.' }),

    page(PAPER, [
      ...bF(8, 'How it works'),
      bD('Nine minutes,\nthree moves.', 60, 120, 1500, 128, { lh: 0.92, ls: -45 }),
      L(60, 520, 1860, 520, INK, 8, { end: 'arrow' }),
      ...[
        ['1', 'Slide the sides in', 'Two sides, one shelf. They meet at a groove and stay put.'],
        ['2', 'Give it a quarter turn', 'The brass key locks the module and pulls it square.'],
        ['3', 'Stack the next one', 'Same box on top. Repeat until the ceiling says stop.'],
      ].flatMap(([n, t, b], i) => {
        const x = 60 + i * 620;
        return [
          T(n, x - 6, 550, 300, { font: 'Archivo', weight: 900, size: 270, lh: 0.8, ls: -40, color: i === 2 ? ORG : INK }),
          bB(t, x, 780, 560, 44, { weight: 800, lh: 1.1, ls: -10 }),
          bB(b, x, 850, 540, 30, { lh: 1.3, color: MID }),
        ];
      }),
      grit(0.15),
    ], { name: 'How it works', notes: 'Walk the three steps in order. If you have a module in the room, build one now and time it.' }),

    page(PAPER, [
      ...bF(9, 'The numbers'),
      rect(60, 100, 900, 450, ORG), rect(960, 100, 900, 450, INK), rect(60, 550, 900, 450, CONC), rect(960, 550, 900, 450, PAPER, { stroke: stroke(INK, 6) }),
      T('9', 90, 120, 700, { font: 'Archivo', weight: 900, size: 420, lh: 0.8, ls: -50, color: INK }),
      bM('Minutes to build a 4 module shelf', 90, 470, 820, 26, { weight: 700, upper: true, ls: 60 }),
      T('0', 990, 120, 700, { font: 'Archivo', weight: 900, size: 420, lh: 0.8, ls: -50, color: PAPER }),
      bM('Tools needed, screws used or bags of parts', 990, 470, 820, 26, { weight: 700, upper: true, ls: 60, color: PAPER }),
      T('5.5', 90, 570, 800, { font: 'Archivo', weight: 900, size: 420, lh: 0.8, ls: -50, color: INK }),
      bM('Kilos a module, one hand carries it', 90, 920, 820, 26, { weight: 700, upper: true, ls: 60 }),
      T('10', 990, 570, 800, { font: 'Archivo', weight: 900, size: 420, lh: 0.8, ls: -50, color: INK }),
      bM('Years of warranty on every joint', 990, 920, 820, 26, { weight: 700, upper: true, ls: 60 }),
      grit(0.2),
    ], { name: 'Numbers', notes: 'Four numbers, no commentary needed. Let people read them.' }),

    page(PAPER, [
      ...bF(10, 'Preorders'),
      bD('Preorders doubled\nevery fortnight.', 60, 130, 900, 96, { lh: 0.94, ls: -35 }),
      bB('Modules ordered each week since the waitlist opened on 1 August.', 60, 420, 600, 32, { lh: 1.3 }),
      bD('2 115', 60, 600, 600, 190, { color: ORG, ls: -50 }),
      bM('Modules ordered by 26 September', 60, 800, 600, 26, { weight: 700, upper: true, ls: 60 }),
      L(760, 960, 1860, 960, INK, 6),
      ...[60, 85, 120, 170, 240, 340, 480, 690].flatMap((v, i) => {
        const h = Math.round(v * 0.88), x = 780 + i * 135;
        return [
          rect(x, 960 - h, 100, h, i === 7 ? ORG : INK),
          bM(String(v), x - 20, 960 - h - 40, 140, 26, { weight: 700, align: 'center' }),
          bM(`W${i + 1}`, x - 20, 975, 140, 22, { align: 'center', color: MID }),
        ];
      }),
      grit(0.15),
    ], { name: 'Preorders', notes: 'The curve is the story. Say how many came from friends and how many from strangers if you know.' }),

    page(PAPER, [
      ...bF(11, 'Compared'),
      bD('Against the usual two', 60, 110, 1800, 100, { ls: -35 }),
      rect(700, 280, 400, 580, ORG),
      ...[['Stapel', 700], ['Flat pack', 1140], ['Solid wood', 1500]].map(([t, x]) => bD(t, x + 20, 300, 380, 46, { weight: 800, ls: -15 })),
      ...[
        ['Build time', '9 min', '90 min', 'Arrives built'],
        ['Parts', '8', '43', '1'],
        ['Survives a move', 'Five times', 'Rarely', 'Two people'],
        ['Price per 40 cm', '590 kr', '349 kr', '1 900 kr'],
      ].flatMap(([k, a, b, c], i) => {
        const y = 390 + i * 115;
        return [
          L(60, y, 1860, y, INK, i === 0 ? 6 : 2),
          bM(k, 60, y + 38, 600, 26, { weight: 700, upper: true, ls: 80 }),
          bB(a, 720, y + 28, 380, 40, { weight: 800, ls: -10 }),
          bB(b, 1160, y + 28, 340, 40, { weight: 600, ls: -10 }),
          bB(c, 1520, y + 28, 340, 40, { weight: 600, ls: -10 }),
        ];
      }),
      L(60, 850, 1860, 850, INK, 6),
      bM('Prices are what we found on 12 September 2026 for a comparable open shelf.', 60, 900, 1500, 24, { color: MID }),
      grit(0.15),
    ], { name: 'Comparison', notes: 'Be fair to flat pack: it is cheaper. We win on time, on moves survived and on what happens to it afterwards.' }),

    page(INK, [
      ...bF(12, 'Launch plan', PAPER),
      ...[
        ['30 SEP', 'Preorders', 'Open to the waitlist, then to everyone.'],
        ['21 OCT', 'Pop up', 'Three days in a shop on Hornsgatan, Stockholm.'],
        ['14 NOV', 'First delivery', '600 modules by van to Stockholm and Uppsala.'],
        ['JAN', 'Ten shops', 'Stocked in ten independent interiors shops.'],
        ['MAR', 'Berlin', 'A partner workshop, same oak, same key.'],
      ].flatMap(([d, t, b], i) => {
        const x = 60 + i * 366, h = 160 + i * 64;
        return [
          T(d, x, 130, 360, { font: 'Archivo', weight: 900, size: 74, lh: 0.9, ls: -30, color: i === 0 ? ORG : PAPER }),
          bB(t, x, 240, 340, 38, { weight: 800, color: PAPER, lh: 1.1 }),
          bB(b, x, 295, 330, 28, { color: CONC, lh: 1.3 }),
          rect(x, 1000 - h, 340, h, i === 0 ? ORG : PAPER),
          bM(['Waitlist', 'Visitors', 'Delivered', 'Shops', 'Cities'][i], x + 20, 1000 - h + 20, 300, 24, { weight: 700, upper: true, ls: 100 }),
          bD(['2 115', '1 800', '600', '10', '2'][i], x + 20, 1000 - h + 60, 300, 72, { ls: -30 }),
        ];
      }),
      grit(0.2),
    ], { name: 'Launch plan', notes: 'Five dates. The first is public and fixed; the last is a plan we will adjust as we learn.' }),

    page(PAPER, [
      ...bF(13, 'Team'),
      bD('The four who answer\nthe phone.', 60, 110, 1200, 96, { lh: 0.94, ls: -35 }),
      bM('Six people in all, one workshop in Hägersten.', 1160, 200, 700, 26, { align: 'right', color: MID }),
      ...[
        ['portrait.jpg', 'Elsa Brandt', 'Founder, product'],
        ['portrait-man-sun.jpg', 'Omar Rahimi', 'Workshop lead'],
        ['portrait-window.jpg', 'Nina Lindqvist', 'Design'],
        ['man.jpg', 'Jonas Weber', 'Operations'],
      ].flatMap(([p, n, r], i) => {
        const x = 60 + i * 465;
        return [
          img(`photos/${p}`, x, 350, 405, 480, { filters: bw({ contrast: 70 }) }),
          rect(x, 830, 405, 12, i === 0 ? ORG : INK),
          bD(n, x, 870, 420, 42, { weight: 800, ls: -15, lh: 1.1 }),
          bM(r, x, 925, 420, 24, { color: MID }),
        ];
      }),
      grit(0.2),
    ], { name: 'Team', notes: 'Two lines per person: what they did before, and what they own here.' }),

    page(ORG, [
      bM('Contact', 60, 36, 600, 24, { weight: 700, upper: true, ls: 120 }),
      bM('14 / 14', 1460, 36, 400, 24, { weight: 700, ls: 60, align: 'right' }),
      L(60, 80, 1860, 80, INK, 3),
      bD('Stack\nwith us.', 40, 110, 1500, 330, { lh: 0.84, ls: -70 }),
      rect(0, 800, 1920, 280, INK),
      bM('Elsa Brandt', 60, 840, 700, 24, { weight: 700, upper: true, ls: 100, color: ORG }),
      bB('elsa@stapel.example', 60, 880, 800, 52, { weight: 800, color: PAPER, ls: -15 }),
      bM('Preorders and press', 840, 840, 700, 24, { weight: 700, upper: true, ls: 100, color: ORG }),
      bB('stapel.example/preorder', 840, 880, 800, 52, { weight: 800, color: PAPER, ls: -15 }),
      qr('https://stapel.example/preorder', 1650, 830, 210, INK, PAPER),
      grit(0.25),
    ], { name: 'Contact', notes: 'Leave this up during questions. The QR code goes to the preorder page.' }),
  ],
});


// ---------------------------------------------------------------------------------------------
// 2. PLAT, a studio credentials deck. Black, off white, safety yellow. Anton + IBM Plex Mono.
// ---------------------------------------------------------------------------------------------
const BLK = '#0A0A0A', YEL = '#FFE600', OFF = '#EDEBE3', GRY = '#8F8D84';
const AG = { mono: 'IBM Plex Mono' };
const AT = 15;
const aF = (n, label, ink = BLK) => furniture(AG, n, AT, label, ink, 'Plåt Studio / Credentials 2026', 'plat.example');
const aD = (t, x, y, w, size, p = {}) => T(t, x, y, w, { font: 'Anton', weight: 400, size, lh: 0.95, ls: 0, upper: true, color: BLK, ...p });
const aM = (t, x, y, w, size = 28, p = {}) => T(t, x, y, w, { font: 'IBM Plex Mono', weight: 500, size, lh: 1.4, color: BLK, ...p });
const aL = (t, x, y, w, color = BLK, p = {}) => aM(t, x, y, w, 24, { weight: 600, upper: true, ls: 100, ...p, color });

const agency = tpl({
  id: 'deck-brutalist-agency', name: 'Studio credentials deck', format: 'slide', category: 'Presentation',
  tags: ['presentation', 'slides', 'deck', 'portfolio', 'agency', 'studio', 'credentials', 'design', 'creative'],
  pages: [
    page(YEL, [
      aL('Studio credentials 2026', 60, 30, 900),
      aL('Göteborg', 1460, 30, 400, BLK, { align: 'right' }),
      L(60, 80, 1860, 80, BLK, 3),
      aD('PLÅT', 30, 388, 2200, 720, { lh: 0.85 }),
      L(1480, 260, 1860, 260, BLK, 8),
      aM('Brand, editorial and digital design for people who make things.', 1480, 285, 380, 30, { weight: 600, lh: 1.3 }),
      aM('Eleven designers\nsince 2014', 1480, 560, 380, 28, { lh: 1.4 }),
      rect(0, 960, 1920, 120, BLK),
      aM('Plåt Studio, Fiskhamnen 9, Göteborg', 60, 1000, 1000, 28, { color: OFF, weight: 600 }),
      aM('plat.example', 1160, 1000, 700, 28, { color: YEL, weight: 600, align: 'right' }),
      grit(0.18),
    ], { name: 'Cover', notes: 'Say who you are in one line, then stop. The rest of the deck does the talking.' }),

    page(OFF, [
      ...aF(2, 'Who we are'),
      img('photos/studio.jpg', 60, 120, 700, 820, { filters: bw({ contrast: 70 }) }),
      rect(60, 940, 700, 40, YEL),
      aD('Eleven\ndesigners.\nOne room.', 860, 120, 1060, 165, { lh: 0.92 }),
      aM('Plåt was started in 2014 above a fish auction hall by two people who had left the same agency in the same week. We now fill the whole floor.', 860, 700, 940, 30, { lh: 1.4 }),
      ...[['Founded', '2014'], ['Where', 'Fiskhamnen, Göteborg'], ['Work in', 'Swedish and English']].flatMap(([k, v], i) => [
        L(860, 880 + i * 0, 1860, 880, BLK, 3),
        aL(k, 860 + i * 340, 905, 320),
        aM(v, 860 + i * 340, 940, 330, 26, { weight: 600, lh: 1.25 }),
      ]),
      grit(0.2),
    ], { name: 'Who we are', notes: 'Facts first: when, where, how many. Skip the adjectives, the work will supply them.' }),

    page(BLK, [
      ...aF(3, 'Principles', OFF),
      ...[
        ['Say it plainer', 'If the client cannot repeat the idea in one breath, the idea is not finished.'],
        ['Make the first draft ugly', 'Nobody argues with a pretty draft, and then nothing improves.'],
        ['One typeface is enough', 'Two is a decision. Three is a mood board.'],
        ['Ship the thing', 'A printed poster teaches more than a perfect file.'],
      ].flatMap(([t, b], i) => {
        const y = 110 + i * 225;
        return [
          L(60, y, 1860, y, i === 0 ? YEL : OFF, i === 0 ? 8 : 2),
          aD(String(i + 1), 60, y + 20, 200, 190, { color: YEL, lh: 0.9 }),
          aD(t, 250, y + 56, 900, 64, { color: OFF }),
          aM(b, 1150, y + 48, 710, 28, { color: OFF, lh: 1.35 }),
        ];
      }),
      grit(0.22),
    ], { name: 'Principles', notes: 'Four rules we actually use in the studio. Pick the one you want a client to remember and say it twice.' }),

    page(BLK, [
      aL('Selected work', 60, 30, 900, OFF),
      aL('2023 to 2026', 1460, 30, 400, OFF, { align: 'right' }),
      L(60, 80, 1860, 80, OFF, 3),
      aD('WORK', 30, 470, 2600, 760, { color: YEL, lh: 0.85 }),
      aD('Four projects.\nOne result each.', 60, 130, 1200, 120, { color: OFF, lh: 1 }),
      grit(0.25),
    ], { name: 'Section: work', notes: 'A breather. Four projects follow and each one comes with a result you can check.' }),

    page(OFF, [
      ...aF(5, 'Services'),
      rect(60, 110, 600, 900, OFF, { stroke: stroke(BLK, 4) }),
      rect(660, 110, 600, 900, BLK),
      rect(1260, 110, 600, 900, YEL),
      ...[
        ['Identity', BLK, ['Naming', 'Logo and type', 'Colour and layout rules', 'A one page guide']],
        ['Editorial', OFF, ['Magazines and reports', 'Books and posters', 'Exhibition graphics', 'Wayfinding']],
        ['Digital', BLK, ['Websites that load fast', 'Motion and titles', 'Social templates', 'Slide decks']],
      ].flatMap(([t, c, items], i) => {
        const x = 60 + i * 600;
        return [
          aL(`0${i + 1}`, x + 36, 140, 200, c, { weight: 700 }),
          aD(t, x + 36, 190, 540, 100, { color: c }),
          ...items.flatMap((it, j) => [
            L(x + 36, 400 + j * 130, x + 564, 400 + j * 130, c, 2),
            aM(it, x + 36, 425 + j * 130, 530, 28, { color: c, weight: 600, lh: 1.25 }),
          ]),
        ];
      }),
      grit(0.2),
    ], { name: 'Services', notes: 'Three disciplines under one roof. Mention which one most new clients come in through.' }),

    page(OFF, [
      img('photos/city.jpg', 0, 80, 1920, 1000, { filters: bw({ contrast: 75, brightness: -5 }) }),
      rect(0, 80, 1920, 8, BLK),
      rect(60, 700, 1000, 380, YEL),
      aL('Case 01 / Wayfinding / 2025', 90, 735, 900),
      aD('Kajen\nsigns', 90, 800, 960, 150, { lh: 0.92 }),
      rect(1060, 880, 860, 200, BLK),
      aM('Four hundred signs for a new quay district, read from a bicycle at speed.', 1100, 915, 780, 30, { color: OFF, lh: 1.35, weight: 600 }),
      aL('06 / 15', 1460, 30, 400, BLK, { align: 'right' }),
      aL('Selected work', 60, 30, 900),
      L(60, 80, 1860, 80, BLK, 3),
      grit(0.22),
    ], { name: 'Case: Kajen', notes: 'Show the scale: four hundred signs, one set of rules. Mention the cyclist test, it always gets a nod.' }),

    page(YEL, [
      ...aF(7, 'Selected work'),
      aL('Case 02 / Editorial / 2024', 60, 130, 800),
      aD('Verkstad\nMagazine', 60, 200, 900, 150, { lh: 0.9 }),
      aM('A quarterly for people who fix things. We redrew the grid, kept one typeface and cut the cover lines from nine to two.', 60, 620, 800, 30, { lh: 1.4 }),
      aM('Plåt did the cover, the grid, the typefaces and a binder for the editors.', 60, 830, 800, 28, { lh: 1.4, weight: 700 }),
      img('photos/desk.jpg', 1000, 110, 860, 440, { filters: bw({ contrast: 70 }) }),
      img('photos/hands-clay.jpg', 1000, 570, 860, 440, { filters: bw({ contrast: 70 }) }),
      grit(0.15),
    ], { name: 'Case: Verkstad', notes: 'Use this one to show restraint. Two cover lines instead of nine is the whole story.' }),

    page(OFF, [
      ...aF(8, 'Result'),
      rect(0, 80, 700, 1000, YEL),
      aD('+213%', 50, 150, 900, 190, { lh: 0.9 }),
      aM('More paying subscribers to Verkstad Magazine in two years after the redesign.', 60, 430, 580, 30, { lh: 1.35, weight: 600 }),
      aM('Source: the magazine\'s own count, January each year.', 60, 900, 580, 24, { lh: 1.35 }),
      // axes
      L(800, 930, 1860, 930, BLK, 4),
      ...[[2022, 1800], [2023, 2000], [2024, 2300], [2025, 5400], [2026, 7200]].flatMap(([yr, v], i, arr) => {
        const x = 880 + i * 220, y = 930 - v * 0.095;
        const nx = 880 + (i + 1) * 220, ny = i < arr.length - 1 ? 930 - arr[i + 1][1] * 0.095 : 0;
        return [
          i < arr.length - 1 && L(x, y, nx, ny, BLK, 10),
          rect(x - 18, y - 18, 36, 36, i === 4 ? YEL : BLK, i === 4 ? { stroke: stroke(BLK, 6) } : {}),
          aM(v.toLocaleString('sv-SE'), i === 2 ? x - 190 : x - 70, i === 2 ? y - 30 : y - 78, 140, 28, { align: i === 2 ? 'right' : 'center', weight: 700 }),
          aM(String(yr), x - 70, 950, 140, 26, { align: 'center' }),
        ];
      }),
      L(1337, 190, 1337, 930, BLK, 3, { dash: 'dash' }),
      aL('Relaunch, March 2024', 1360, 190, 500),
      grit(0.2),
    ], { name: 'Result chart', notes: 'The dashed line is the relaunch. Everything to the right of it is what the new design and the new editor did together; be honest about that.' }),

    page(BLK, [
      ...aF(9, 'Process', OFF),
      aD('How a job runs', 60, 100, 1500, 110, { color: OFF }),
      // week header
      ...Array.from({ length: 8 }, (_, i) => aL(`W${i + 1}`, 860 + i * 125, 235, 120, GRY, { weight: 700, align: 'center' })),
      ...[
        ['Listen', 0, 1], ['Sketch', 1, 2], ['Argue', 2, 2], ['Make', 3, 4], ['Hand over', 7, 1],
      ].flatMap(([t, st, len], i) => {
        const y = 290 + i * 125;
        return [
          L(60, y, 1860, y, OFF, i === 0 ? 4 : 1),
          aD(t, 60, y + 22, 760, 78, { color: OFF }),
          rect(870 + st * 125, y + 30, len * 125 - 20, 76, i === 3 ? YEL : OFF),
        ];
      }),
      L(60, 925, 1860, 925, OFF, 4),
      aM('A typical identity job, eight weeks, one fixed price.', 60, 945, 1200, 26, { color: GRY }),
      grit(0.22),
    ], { name: 'Process', notes: 'Read the bars as a calendar. The long yellow one is the making; the short ones are why it goes well.' }),

    page(OFF, [
      ...aF(10, 'Clients'),
      aD('Who we have worked for', 60, 100, 1700, 100),
      ...[
        'Hamnen Bryggeri', 'Verkstad Magazine', 'Kajen Kvarter', 'Kronhuset Teater',
        'Linné Bageri', 'Majorna Biograf', 'Skärgårdsbåten', 'Tre Lag Fotboll',
        'Fiskhamnen Hallar', 'Cykelköket', 'Vasa Tandvård', 'Röda Sten',
      ].flatMap((n, i) => {
        const c = i % 3, r = Math.floor(i / 3), x = 60 + c * 610, y = 240 + r * 190;
        return [
          L(x, y, x + 580, y, BLK, i < 3 ? 6 : 2),
          aD(n, x, y + 28, 600, 66, { lh: 1, color: i === 0 || i === 7 ? BLK : BLK }),
          aM(['2025', '2024', '2025', '2023', '2022', '2024', '2023', '2026', '2025', '2022', '2024', '2023'][i], x, y + 118, 300, 24, { color: '#5B5A54' }),
        ];
      }),
      rect(60 + 2 * 610, 240 + 3 * 190 + 4, 580, 186, YEL),
      aD('Röda Sten', 60 + 2 * 610 + 0, 240 + 3 * 190 + 28, 600, 66),
      aM('2023', 60 + 2 * 610, 240 + 3 * 190 + 118, 300, 24),
      grit(0.2),
    ], { name: 'Clients', notes: 'Names, not logos. Point out one that is a repeat client and say how many years it has been.' }),

    page(YEL, [
      ...aF(11, 'In numbers'),
      aD('147', 30, 175, 1500, 740, { lh: 0.85 }),
      aM('projects since 2014', 60, 860, 800, 36, { weight: 700 }),
      ...[
        ['63%', 'of clients come back for a second job'],
        ['9', 'countries have printed our posters'],
        ['5 days', 'from first call to a fixed price'],
      ].flatMap(([n, t], i) => [
        L(1100, 120 + i * 300, 1860, 120 + i * 300, BLK, i === 0 ? 8 : 3),
        aD(n, 1100, 150 + i * 300, 760, 150, { lh: 0.95 }),
        aM(t, 1100, 310 + i * 300, 700, 28, { lh: 1.3, weight: 600 }),
      ]),
      grit(0.15),
    ], { name: 'In numbers', notes: 'One number is the headline, three more back it up. If you only say one aloud, say the 63 percent.' }),

    page(BLK, [
      ...aF(12, 'People', OFF),
      aD('Three of eleven', 60, 100, 1100, 100, { color: OFF }),
      ...[
        ['portrait.jpg', 'Maja Berg', 'Founder, design'],
        ['man.jpg', 'Karim Aziz', 'Founder, type'],
        ['portrait-window.jpg', 'Lo Vik', 'Motion'],
      ].flatMap(([f, n, r], i) => {
        const x = 60 + i * 420;
        return [
          img(`photos/${f}`, x, 240, 390, 560, { filters: bw({ contrast: 75 }) }),
          rect(x, 800, 390, 10, i === 0 ? YEL : OFF),
          aD(n, x, 830, 400, 60, { color: OFF }),
          aM(r, x, 905, 400, 26, { color: GRY }),
        ];
      }),
      L(1380, 240, 1860, 240, YEL, 6),
      aL('Also in the room', 1380, 260, 480, YEL, { weight: 700 }),
      ...['Edda Holm, editorial', 'Sven Lund, web', 'Ines Roca, identity', 'Tomas Ek, print', 'Hana Sato, motion', 'Olle Dahl, studio', 'Pia Nord, producer', 'Rut Alm, intern'].map((n, i) =>
        aM(n, 1380, 320 + i * 62, 480, 28, { color: OFF, weight: 500 })),
      grit(0.22),
    ], { name: 'People', notes: 'Introduce the three you will see most, then wave at the rest of the room.' }),

    page(OFF, [
      rect(0, 0, 640, 1080, YEL),
      aD('“', 30, -60, 600, 1100, { lh: 1 }),
      aL('13 / 15', 1460, 30, 400, BLK, { align: 'right' }),
      aL('In their words', 700, 30, 700),
      L(700, 80, 1860, 80, BLK, 3),
      aD('They took our twenty page brief and gave back one sentence. It was the right sentence.', 700, 150, 1180, 100, { lh: 1, ls: 0 }),
      L(700, 760, 1860, 760, BLK, 6),
      aD('Anna Ek', 700, 790, 800, 70),
      aM('Editor in chief, Verkstad Magazine', 700, 880, 900, 28, { weight: 600 }),
      aM('Plåt Studio / Credentials 2026', 700, 1028, 900, 22),
      grit(0.2),
    ], { name: 'Quote', notes: 'Read the quote as written, name the client, and move on without comment.' }),

    page(OFF, [
      rect(0, 80, 760, 1000, YEL),
      aL('14 / 15', 1460, 30, 400, BLK, { align: 'right' }),
      aL('How to start', 60, 30, 700),
      L(60, 80, 1860, 80, BLK, 3),
      aD('How\nto\nstart', 60, 140, 700, 215, { lh: 0.98 }),
      ...[
        ['Send a brief', 'A page is plenty. A photo of the problem is better.'],
        ['Talk for half an hour', 'On the phone or in the studio. We bring coffee and questions.'],
        ['Get a fixed price', 'A plan and one number inside five working days.'],
      ].flatMap(([t, b], i) => {
        const y = 80 + i * 333;
        return [
          i > 0 && L(760, y, 1860, y, BLK, 4),
          aD(String(i + 1), 810, y + 50, 200, 210, { lh: 0.9 }),
          aD(t, 1010, y + 76, 900, 68),
          aM(b, 1010, y + 160, 830, 28, { lh: 1.35 }),
        ];
      }),
      grit(0.2),
    ], { name: 'How to start', notes: 'Three steps and nothing hidden. This is the slide to leave up if someone asks what happens next.' }),

    page(YEL, [
      aL('Contact', 60, 30, 700),
      aL('15 / 15', 1460, 30, 400, BLK, { align: 'right' }),
      L(60, 80, 1860, 80, BLK, 3),
      aD('Say hej.', 30, 130, 1900, 470, { lh: 0.9 }),
      aM('Tell us what you are making and when it needs to exist.', 60, 640, 1200, 34, { weight: 600 }),
      rect(0, 780, 1920, 300, BLK),
      aL('Write', 60, 820, 500, YEL, { weight: 700 }),
      aM('hej@plat.example', 60, 860, 900, 40, { color: OFF, weight: 700 }),
      aL('Call', 700, 820, 500, YEL, { weight: 700 }),
      aM('031 555 01 90', 700, 860, 700, 40, { color: OFF, weight: 700 }),
      aL('Visit', 1200, 820, 500, YEL, { weight: 700 }),
      aM('Fiskhamnen 9\nGöteborg', 1200, 860, 500, 32, { color: OFF, weight: 700, lh: 1.25 }),
      qr('https://plat.example', 1700, 820, 160, BLK, OFF),
      grit(0.2),
    ], { name: 'Contact', notes: 'Say the phone number out loud. People still write it down.' }),
  ],
});


// ---------------------------------------------------------------------------------------------
// 3. HALL 7, an event recap. Concrete, black, signal red. Chivo 900 + Chivo Mono.
// ---------------------------------------------------------------------------------------------
const CON = '#D8D6CE', BK = '#0C0C0C', RD = '#F0281A', WH = '#F6F5F0', DCON = '#A3A199', MUT = '#4A4944';
const RC = { mono: 'Chivo Mono' };
const RT = 14;
const rF = (n, label, ink = BK) => furniture(RC, n, RT, label, ink, 'Hall 7 / Recap 2026', 'hall7.example');
const rD = (t, x, y, w, size, p = {}) => T(t, x, y, w, { font: 'Chivo', weight: 900, size, lh: 0.9, ls: -30, upper: true, color: BK, ...p });
const rB = (t, x, y, w, size = 30, p = {}) => T(t, x, y, w, { font: 'Chivo', weight: 600, size, lh: 1.3, color: BK, ...p });
const rM = (t, x, y, w, size = 26, p = {}) => T(t, x, y, w, { font: 'Chivo Mono', weight: 500, size, lh: 1.35, color: BK, ...p });
const rL = (t, x, y, w, color = BK, p = {}) => rM(t, x, y, w, 24, { weight: 700, upper: true, ls: 100, ...p, color });

const recap = tpl({
  id: 'deck-brutalist-recap', name: 'Event recap deck', format: 'slide', category: 'Presentation',
  tags: ['presentation', 'slides', 'deck', 'report', 'recap', 'event', 'festival', 'annual report', 'summary'],
  pages: [
    page(CON, [
      rL('Festival recap 2026', 60, 30, 900),
      rL('Norrköping', 1140, 30, 400, BK, { align: 'right' }),
      L(60, 80, 1560, 80, BK, 3),
      rect(1560, 0, 360, 1080, RD),
      T('2026', 1240, 400, 1000, { font: 'Chivo', weight: 900, size: 300, lh: 0.8, ls: -40, color: BK, rotation: 90, align: 'center' }),
      rD('HALL 7', 30, 110, 1530, 420, { lh: 0.85, ls: -40 }),
      rect(0, 640, 1560, 440, BK),
      rB('What happened in an engine hall that had been empty since 2009.', 60, 690, 1100, 60, { color: WH, weight: 800, lh: 1.1, ls: -10 }),
      rM('14 to 16 August / Verkstadsgatan 7 / 12 400 visitors', 60, 960, 1400, 28, { color: WH }),
      grit(0.2),
    ], { name: 'Cover', notes: 'Open with the place, not the numbers. The hall had been empty for seventeen years and people came anyway.' }),

    page(BK, [
      ...rF(2, 'What happened', WH),
      rD('Three days, 41 acts and one hall that nobody had used since 2009.', 60, 130, 1700, 118, { color: WH, lh: 1, ls: -30 }),
      ...[['Dates', 'Fri 14 to Sun 16 August'], ['Place', 'The old engine hall, Norrköping'], ['Doors', '14:00 to 01:00, free under 16']].flatMap(([k, v], i) => [
        L(60 + i * 610, 700, 60 + i * 610 + 580, 700, i === 0 ? RD : WH, i === 0 ? 8 : 3),
        rL(k, 60 + i * 610, 730, 560, RD),
        rB(v, 60 + i * 610, 775, 580, 38, { color: WH, weight: 700, lh: 1.2 }),
      ]),
      grit(0.2),
    ], { name: 'What happened', notes: 'One sentence of what it was, then three practical facts for anyone who missed it.' }),

    page(RD, [
      ...rF(3, 'In numbers'),
      rD('12 400', 20, 90, 1900, 560, { lh: 0.85, ls: -50 }),
      rM('Visitors over three days, 31 percent more than we planned for', 60, 640, 1500, 32, { weight: 700 }),
      rect(0, 760, 1920, 320, BK),
      ...[['41', 'Acts on 3 stages'], ['612', 'Volunteer hours, 74 people'], ['3', 'Nights, none cancelled']].flatMap(([n, t], i) => [
        rD(n, 60 + i * 620, 790, 560, 170, { color: i === 0 ? RD : WH, lh: 0.95 }),
        rM(t, 60 + i * 620, 960, 560, 26, { color: WH, weight: 700 }),
      ]),
      L(60, 80, 1860, 80, BK, 3),
      grit(0.22),
    ], { name: 'Numbers', notes: 'Give the headline number first and let it sit. The planning figure was 9 500, so say that too.' }),

    page(CON, [
      ...rF(4, 'Attendance'),
      rD('Saturday filled up at ten.', 60, 110, 1750, 100, { ls: -30 }),
      rM('People inside the hall on Saturday 15 August, counted on the hour.', 60, 215, 1700, 28, { color: MUT }),
      L(60, 910, 1860, 910, BK, 5),
      ...[380, 610, 940, 1300, 1750, 2300, 2900, 3400, 3900, 3700, 3100, 1800].flatMap((v, i) => {
        const h = Math.round(v * 0.15), x = 90 + i * 148, hot = i === 8;
        return [
          rect(x, 910 - h, 116, h, hot ? RD : BK),
          rM(v.toLocaleString('sv-SE'), x - 14, 910 - h - 34, 144, 24, { align: 'center', weight: 700 }),
          rM(`${pad((14 + i) % 24)}`, x - 14, 925, 144, 24, { align: 'center', color: MUT }),
        ];
      }),
      L(60, 910 - 4200 * 0.15, 1860, 910 - 4200 * 0.15, RD, 3, { dash: 'dash' }),
      rL('Capacity 4 200', 1460, 910 - 4200 * 0.15 + 10, 400, RD, { align: 'right' }),
      grit(0.18),
    ], { name: 'Attendance', notes: 'Peak was 22:00 at 3 900 people, 300 under the fire limit. Mention how the doors team held the line.' }),

    page(WH, [
      ...rF(5, 'Programme'),
      rD('HIGH\nLIGHTS', 60, 120, 560, 140, { lh: 0.88 }),
      rM('Six of the 41 acts that people still talk about.', 60, 440, 480, 28, { color: MUT, lh: 1.35 }),
      ...[
        ['FRI', '21:30', 'Marta Oyelaran Quartet', 'Main hall'],
        ['FRI', '23:45', 'Kjell and the Pumps', 'Dock stage'],
        ['SAT', '19:00', 'Brass of the East Harbour', 'Courtyard'],
        ['SAT', '22:00', 'Nils Vega live set', 'Main hall'],
        ['SUN', '15:00', 'Children\'s choir of Hageby', 'Main hall'],
        ['SUN', '20:30', 'The last song, all of us', 'Main hall'],
      ].flatMap(([d, t, a, st], i) => {
        const y = 120 + i * 145;
        return [
          L(640, y, 1860, y, BK, i === 0 ? 8 : 2),
          rect(640, y + 22, 120, 56, i === 3 ? RD : BK),
          rM(d, 640, y + 36, 120, 26, { color: WH, weight: 700, align: 'center' }),
          rM(t, 790, y + 32, 160, 28, { weight: 700 }),
          rD(a, 960, y + 20, 900, 46, { ls: -15, upper: false, lh: 1.1 }),
          rM(st, 960, y + 80, 700, 24, { color: MUT }),
        ];
      }),
      L(640, 990, 1860, 990, BK, 2),
      grit(0.15),
    ], { name: 'Programme highlights', notes: 'Pick the three you saw yourself. The red one is the set people ask about most.' }),

    page(RD, [
      rL('Voices', 60, 30, 900),
      rL('06 / 14', 1460, 30, 400, BK, { align: 'right' }),
      L(60, 80, 1860, 80, BK, 3),
      rD('WHAT\nPEOPLE\nSAID', 40, 130, 1500, 300, { lh: 0.86, ls: -50 }),
      rM('Collected from the feedback wall and the door survey, 1 to 9 September.', 60, 1000, 1500, 26, { weight: 700 }),
      grit(0.28),
    ], { name: 'Section: voices', notes: 'Short break. The next three slides are the audience, in their own words.' }),

    page(CON, [
      img('photos/portrait-window.jpg', 0, 0, 700, 1080, { filters: bw({ contrast: 80 }) }),
      rect(700, 0, 20, 1080, RD),
      rL('Voices', 780, 30, 600),
      rL('07 / 14', 1460, 30, 400, BK, { align: 'right' }),
      L(780, 80, 1860, 80, BK, 3),
      rD('I came for the band and stayed for the building.', 780, 140, 1100, 100, { lh: 1, ls: -30 }),
      L(780, 780, 1860, 780, BK, 6),
      rD('Linnea Åhs', 780, 810, 900, 64, { upper: false }),
      rM('Volunteer, bar crew, Saturday', 780, 890, 900, 28),
      rM('Hall 7 / Recap 2026', 780, 1028, 900, 22),
      grit(0.2),
    ], { name: 'Quote with photo', notes: 'Name the person and what she did. It lands harder when she is one of the 74 volunteers.' }),

    page(CON, [
      ...rF(8, 'Voices'),
      rect(0, 80, 1000, 1000, BK),
      rD('You could\nhear the\nroom\nbreathe.', 60, 140, 900, 150, { color: WH, lh: 0.92, ls: -40 }),
      rM('Tomas, 41, Norrköping', 60, 860, 800, 28, { color: RD, weight: 700 }),
      L(1060, 140, 1860, 140, BK, 6),
      rB('The queue for coffee was the best place to meet people.', 1060, 170, 800, 52, { weight: 800, lh: 1.15, ls: -10 }),
      rM('Maja, 27, Linköping', 1060, 400, 800, 28, { weight: 700 }),
      L(1060, 540, 1860, 540, BK, 2),
      rB('My daughter had her first loud night out and wanted to stay for Sunday as well.', 1060, 570, 800, 44, { weight: 800, lh: 1.15, ls: -10 }),
      rM('Hamid, 38, Finspång', 1060, 800, 800, 28, { weight: 700 }),
      grit(0.2),
    ], { name: 'Quote wall', notes: 'Three people, three ages. Read the first aloud and let the others be read.' }),

    page(BK, [
      ...rF(9, 'Gallery', WH),
      img('photos/concert.jpg', 60, 110, 900, 620, { filters: bw({ contrast: 70 }) }),
      img('photos/crowd-gig.jpg', 980, 110, 880, 300, { filters: { duotone: [BK, '#FF4A36'], contrast: 40, grain: 25 } }),
      img('photos/friends.jpg', 980, 430, 430, 300, { filters: bw({ contrast: 70 }) }),
      img('photos/skater.jpg', 1430, 430, 430, 300, { filters: bw({ contrast: 70 }) }),
      img('photos/dinner-table.jpg', 60, 750, 600, 260, { filters: bw({ contrast: 70 }) }),
      img('photos/hands-clay.jpg', 680, 750, 600, 260, { filters: bw({ contrast: 70 }) }),
      rect(1300, 750, 560, 260, RD),
      rD('412', 1330, 770, 500, 150, { lh: 0.9 }),
      rM('photos in the archive, taken by nine volunteers', 1330, 925, 500, 24, { weight: 700, lh: 1.3 }),
      grit(0.2),
    ], { name: 'Gallery', notes: 'Let the pictures run. Say who took the photographs; the archive is open to everyone who was there.' }),

    page(BK, [
      img('photos/crowd-gig.jpg', 0, 0, 1920, 1080, { filters: bw({ contrast: 75, brightness: -5 }) }),
      rect(0, 700, 1920, 380, RD),
      rD('23:40', 20, 680, 1500, 380, { lh: 0.85, ls: -50 }),
      rM('Saturday, main hall', 1200, 735, 640, 30, { weight: 700, align: 'right' }),
      rB('The third hour at capacity. The doors team held it with one rope and a lot of good manners.', 1200, 790, 660, 30, { weight: 700, lh: 1.3, align: 'right' }),
      rL('Gallery', 60, 30, 900, WH),
      rL('10 / 14', 1460, 30, 400, WH, { align: 'right' }),
      L(60, 80, 1860, 80, WH, 3),
      grit(0.3),
    ], { name: 'Full bleed photo', notes: 'One picture, one time stamp. If you have the sound from that night, play ten seconds.' }),

    page(WH, [
      ...rF(11, 'The site'),
      rD('Where things happened', 60, 100, 1500, 90, { ls: -30 }),
      // plan
      rect(60, 240, 1260, 740, WH, { stroke: stroke(BK, 8) }),
      rect(60, 240, 760, 740, BK),
      rect(820, 240, 500, 360, RD),
      rect(820, 600, 500, 380, DCON, { fill: pattern('diagonal', BK, DCON, 1) }),
      rect(60, 700, 300, 280, WH, { stroke: stroke(BK, 8) }),
      rect(360, 700, 200, 280, CON, { stroke: stroke(BK, 8) }),
      ...[
        ['1', 'Main hall', 330, 400, WH], ['2', 'Dock stage', 1010, 400, BK], ['3', 'Courtyard', 1010, 760, WH], ['4', 'Food', 140, 820, BK], ['5', 'Bar', 400, 820, BK],
      ].map(([n, t, x, y, c]) => [
        rD(n, x - 20, y - 70, 120, 90, { color: c, lh: 0.9 }),
        rM(t, x - 20, y + 16, 300, 26, { color: c, weight: 700 }),
      ]),
      ...[
        ['1', 'Main hall', '3 000 standing'], ['2', 'Dock stage', '800 standing'], ['3', 'Courtyard', 'Open air, free'],
        ['4', 'Food', '11 stalls'], ['5', 'Bar', '2 bars, one in the dock'],
      ].flatMap(([n, t, c], i) => [
        L(1400, 240 + i * 150, 1860, 240 + i * 150, BK, i === 0 ? 6 : 2),
        rD(n, 1400, 262 + i * 150, 80, 64, { color: RD }),
        rB(t, 1490, 258 + i * 150, 370, 36, { weight: 800, lh: 1.1 }),
        rM(c, 1490, 306 + i * 150, 370, 24, { color: MUT }),
      ]),
      L(1400, 990, 1860, 990, BK, 2),
      grit(0.15),
    ], { name: 'Site plan', notes: 'Use this to explain flow: in by the courtyard, through the food, and into the main hall.' }),

    page(BK, [
      ...rF(12, 'Partners', WH),
      rL('Presenting partner', 60, 130, 700, RD),
      rD('Norrköpings Kulturfond', 60, 180, 1800, 180, { color: WH, lh: 0.88, ls: -40, upper: true }),
      L(60, 560, 1860, 560, WH, 3),
      rL('Supporting partners', 60, 590, 700, RD),
      ...['Östgöta Bryggeri', 'Folkets Hus', 'Linköpings Tryckeri', 'Stadens Bageri'].map((n, i) => rD(n, 60 + (i % 2) * 920, 640 + Math.floor(i / 2) * 100, 880, 56, { color: WH, upper: false, ls: -15, lh: 1.1 })),
      L(60, 860, 1860, 860, WH, 3),
      rL('And with thanks to', 60, 885, 700, RD),
      rM('Hageby Skolor / Motala Hyr / Tåg i Öst / Radio Kvarn / Verkstan / Café Mellan', 60, 925, 1800, 28, { color: WH, lh: 1.45 }),
      grit(0.2),
    ], { name: 'Partners', notes: 'Thank partners by name and in this order. Offer the sponsor pack to anyone who asks afterwards.' }),

    page(CON, [
      ...rF(13, 'Budget'),
      rD('Where the money went', 60, 100, 1500, 100, { ls: -30 }),
      rM('Total cost 1 840 000 kr. Ticket sales and the culture fund covered it, with 62 000 kr left over.', 60, 220, 1500, 28, { color: MUT }),
      ...(() => { let x = 60; return [[38, RD], [27, BK], [17, WH], [11, DCON], [7, '#6C6A63']].map(([v, c]) => { const w = Math.round(v * 18); const r = rect(x, 330, w, 200, c, c === WH ? { stroke: stroke(BK, 4) } : {}); const t = rD(`${v}`, x + 14, 350, w, 90, { color: c === BK || c === RD || c === '#6C6A63' ? (c === RD ? BK : WH) : BK, lh: 0.9 }); x += w; return [r, t]; }); })().flat(),
      ...[
        ['Artists and crews', '38 %', '699 000 kr', RD], ['Sound, light and staging', '27 %', '497 000 kr', BK], ['Venue, safety and cleaning', '17 %', '313 000 kr', WH],
        ['Staff and volunteer meals', '11 %', '202 000 kr', DCON], ['Marketing', '7 %', '129 000 kr', '#6C6A63'],
      ].flatMap(([t, p, k, c], i) => {
        const y = 580 + i * 80;
        return [
          L(60, y, 1860, y, BK, i === 0 ? 5 : 2),
          rect(60, y + 20, 36, 36, c, { stroke: stroke(BK, 4) }),
          rB(t, 130, y + 16, 900, 36, { weight: 700 }),
          rM(p, 1100, y + 22, 200, 30, { weight: 700 }),
          rM(k, 1360, y + 22, 500, 30, { align: 'right' }),
        ];
      }),
      L(60, 980, 1860, 980, BK, 5),
      grit(0.18),
    ], { name: 'Budget', notes: 'Say where the biggest slice went and why. Artists first; we pay the same fee per set, whatever the stage.' }),

    page(BK, [
      ...rF(14, 'Next year', WH),
      rD('20 TO 22\nAUGUST\n2027', 40, 110, 1340, 205, { color: WH, lh: 0.86, ls: -50 }),
      rect(1400, 80, 520, 1000, RD),
      rD('Tickets from 1 March', 1440, 130, 450, 80, { lh: 0.95 }),
      qr('https://hall7.example/2027', 1440, 420, 440, BK, WH),
      rM('hall7.example/2027', 1440, 880, 440, 28, { weight: 700 }),
      ...[
        ['A second stage', 'In the loading dock, 800 people.'],
        ['Under 16 stays free', 'And so does Sunday afternoon.'],
        ['Sunday ends at 22:00', 'Trains home leave from the hall.'],
      ].flatMap(([t, b], i) => [
        L(60, 700 + i * 105, 1340, 700 + i * 105, WH, i === 0 ? 5 : 2),
        rB(t, 60, 715 + i * 105, 560, 38, { color: WH, weight: 800, lh: 1.1 }),
        rM(b, 660, 722 + i * 105, 680, 26, { color: CON }),
      ]),
      grit(0.2),
    ], { name: 'Next year', notes: 'Give the date first, then three changes. The QR code goes to the ticket waitlist.' }),
  ],
});

export default [brand, agency, recap];
