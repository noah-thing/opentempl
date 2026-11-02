import { tpl, page, T, S, rect, circle, path, L, img, frame, overlay, svg, qr, solid, linear, radial, pattern, imageFill, stroke } from '../kit.mjs';

const ALL = [];
export default ALL;

const INK = '#111111';
const PAPER = '#F2F0EB';
const RED = '#E8341C';
const BLUE = '#1F3BFF';
const IT = 'Inter Tight';

// Text box centred on (cx, cy), for rotated type.
const RT = (text, cx, cy, w, p = {}) => {
  const h = (p.size ?? 32) * (p.lh ?? 1.2) * String(text).split('\n').length;
  return T(text, cx - w / 2, cy - h / 2, w, p);
};
// Hairline grid: vertical lines at the column edges, horizontal every `step`.
const hair = (W, H, x0, x1, cols, color, width = 1, op = 1) =>
  Array.from({ length: cols + 1 }, (_, i) => L(x0 + ((x1 - x0) * i) / cols, 0, x0 + ((x1 - x0) * i) / cols, H, color, width, { opacity: op }));

ALL.push(
tpl({
    id: 'swiss-lecture-poster',
    name: 'Lecture poster',
    format: 'poster',
    category: 'Event',
    tags: ['lecture', 'talk', 'exhibition'],
    pages: [
      page(PAPER, [
        rect(0, 0, 1123, 1587, PAPER),
        T('07', 40, -90, 1100, { font: 'Inter Tight', size: 900, weight: 800, ls: -60, lh: 1, color: RED }),
        L(40, 760, 1083, 760, INK, 3),
        T('Form\nfollows\nweather', 40, 800, 700, { font: 'Inter Tight', size: 118, weight: 700, ls: -40, lh: 0.95, color: INK }),
        T('An evening lecture on\nbuildings that change\nwith the seasons.', 760, 806, 323, { font: 'Inter Tight', size: 28, weight: 500, lh: 1.25, color: INK }),
        L(40, 1300, 1083, 1300, INK, 1),
        T('Thursday\n7 November', 40, 1330, 300, { font: 'Inter Tight', size: 30, weight: 700, lh: 1.15, color: INK }),
        T('18:30\nDoors 18:00', 380, 1330, 300, { font: 'Inter Tight', size: 30, weight: 500, lh: 1.15, color: INK }),
        T('Main hall\nFree entry', 720, 1330, 300, { font: 'Inter Tight', size: 30, weight: 500, lh: 1.15, color: INK }),
        circle(1003, 1467, 80, RED),
      ]),
    ],
  })
);

// ---------- batch 1 ----------
const COBALT = '#2A3BFF';
ALL.push(
  // Repeated headline on a square grid
  tpl({ id: 'swiss-repeat-headline', name: 'Repeat headline poster', format: 'poster', category: 'Event', tags: ['poster', 'conference', 'type'], pages: [
    page('#FFFFFF', [
      Array.from({ length: 22 }, (_, i) => L(0, 36 + i * 72, 1123, 36 + i * 72, '#C5CCFF', 1)),
      Array.from({ length: 17 }, (_, i) => L(36 + i * 72, 0, 36 + i * 72, 1587, '#C5CCFF', 1)),
      T('Field\nnotes &\nField\nnotes &\nField', 36, 60, 1100, { font: 'Archivo', size: 292, weight: 800, ls: -55, lh: 0.84, color: COBALT }),
      rect(36, 1380, 520, 171, '#FFFFFF'),
      T('Open call for field recordings,\nsketches and half finished maps.\nSend up to ten pages by 30 June.', 52, 1392, 500, { font: 'Space Grotesk', size: 22, weight: 500, lh: 1.25, color: COBALT }),
      T('Issue 04\nMalmö, 2026', 52, 1500, 300, { font: 'Space Grotesk', size: 22, weight: 700, lh: 1.15, color: COBALT }),
    ]),
  ]}),

  // Giant ampersand, green
  tpl({ id: 'swiss-giant-ampersand', name: 'Giant ampersand poster', format: 'poster', category: 'Event', tags: ['festival', 'ampersand', 'type'], pages: [
    page('#1E8F5A', [
      T('&', -80, -330, 1400, { font: IT, size: 1850, weight: 800, ls: 0, lh: 1, color: '#F2EFE4' }),
      T('Listening\n&\nMaking', 40, 40, 520, { font: IT, size: 64, weight: 800, ls: -30, lh: 0.95, color: '#0E3B26' }),
      T('N°', 40, 1407, 90, { font: IT, size: 100, weight: 800, ls: -40, lh: 1, color: '#0E3B26' }),
      T('095', 120, 1407, 400, { font: IT, size: 100, weight: 800, ls: -40, lh: 1, color: '#F2EFE4' }),
      rect(700, 1090, 383, 457, '#0E3B26'),
      T('A festival of sound and\nobject making', 722, 1112, 340, { font: IT, size: 22, weight: 700, lh: 1.2, color: '#F2EFE4' }),
      T('Fri 12 to Sun 14 June\nHall 4, Gasverket\nDay pass 190 kr', 722, 1300, 340, { font: IT, size: 22, weight: 500, lh: 1.3, color: '#F2EFE4' }),
      L(722, 1280, 1061, 1280, '#F2EFE4', 1.5),
      T('listeningandmaking.se', 722, 1500, 340, { font: IT, size: 20, weight: 500, color: '#F2EFE4' }),
    ]),
  ]}),

  // Crossing ribbons
  tpl({ id: 'swiss-ribbons', name: 'Crossing ribbons poster', format: 'poster', category: 'Event', tags: ['exhibition', 'gallery', 'stripes'], pages: [
    page('#F4F2EC', [
      rect(-250, 560, 1700, 64, '#F5D92B', { rotation: 38 }),
      rect(-250, 680, 1700, 64, '#E8341C', { rotation: -33, blend: 'multiply' }),
      rect(-250, 900, 1700, 64, '#2BB3E8', { rotation: 41, blend: 'multiply' }),
      rect(-250, 820, 1700, 64, '#18A558', { rotation: -48, blend: 'multiply' }),
      RT('Kunsthalle Nord', 62, 1180, 600, { font: IT, size: 34, weight: 800, ls: 10, rotation: 270, color: INK }),
      RT('Galerie am Fluss, Basel', 1062, 1200, 600, { font: IT, size: 34, weight: 700, rotation: 90, color: INK }),
      T('Anna Moreau', 100, 1470, 800, { font: IT, size: 44, weight: 800, ls: -20, color: INK }),
      T('Zeichnungen 1998 bis 2024', 100, 1522, 800, { font: IT, size: 26, weight: 500, color: INK }),
      T('Eröffnung\n12.09. 19 Uhr', 100, 90, 400, { font: IT, size: 26, weight: 600, lh: 1.2, color: INK }),
    ]),
  ]}),

  // Overprinted cross
  tpl({ id: 'swiss-overprint-cross', name: 'Overprint cross', format: 'post', category: 'Poster', tags: ['overprint', 'print', 'colour'], pages: [
    page('#F4F1E8', [
      rect(465, 300, 150, 760, '#18A8E8', { blend: 'multiply' }),
      rect(190, 560, 700, 150, '#F5D92B', { blend: 'multiply' }),
      rect(330, 640, 420, 150, '#F0449A', { blend: 'multiply' }),
      T('Three inks', 64, 60, 600, { font: 'Space Grotesk', size: 40, weight: 700, ls: -20, color: INK }),
      T('A short course in\nprinting with overlap', 64, 112, 600, { font: 'Space Grotesk', size: 22, weight: 400, lh: 1.25, color: INK }),
      L(64, 1180, 1016, 1180, INK, 1),
      T('Cyan', 64, 1204, 200, { font: 'Space Grotesk', size: 22, weight: 700, color: INK }),
      T('Magenta', 330, 1204, 200, { font: 'Space Grotesk', size: 22, weight: 700, color: INK }),
      T('Yellow', 600, 1204, 200, { font: 'Space Grotesk', size: 22, weight: 700, color: INK }),
      T('Saturdays\n10 to 14', 840, 1204, 200, { font: 'Space Grotesk', size: 22, weight: 700, lh: 1.25, color: INK }),
      rect(64, 1250, 22, 22, '#18A8E8'),
      rect(330, 1250, 22, 22, '#F0449A'),
      rect(600, 1250, 22, 22, '#F5D92B'),
      T('Studio 3, Konstfack', 64, 1290, 400, { font: 'Space Grotesk', size: 18, weight: 400, color: INK }),
    ]),
  ]}),

  // Overlaid outline numerals on grey
  tpl({ id: 'swiss-outline-numerals', name: 'Outline numerals poster', format: 'poster', category: 'Event', tags: ['dates', 'open studio', 'numerals'], pages: [
    page('#D8D8D4', [
      T('05', -40, 180, 1250, { font: 'Archivo', size: 900, weight: 800, ls: -60, lh: 1, color: '#D8D8D4', effect: { kind: 'outline', color: '#E8341C', amount: 18, offset: 50, direction: 45 } }),
      T('25', 120, 520, 1250, { font: 'Archivo', size: 900, weight: 800, ls: -60, lh: 1, color: '#D8D8D4', effect: { kind: 'outline', color: '#E8341C', amount: 18, offset: 50, direction: 45 } }),
      T('Open Studios', 40, 40, 700, { font: IT, size: 52, weight: 800, ls: -20, color: INK }),
      T('Five weeks, twenty five rooms.\nEvery door on the third floor\nstays open.', 40, 108, 500, { font: IT, size: 24, weight: 500, lh: 1.25, color: INK }),
      T('Fri to Sun\n12 to 18', 880, 40, 200, { font: IT, size: 24, weight: 700, lh: 1.2, color: INK }),
      L(40, 1500, 1083, 1500, INK, 1.5),
      T('Verkstadsgatan 9, Norrköping', 40, 1520, 600, { font: IT, size: 22, weight: 600, color: INK }),
      T('openstudios.example', 800, 1520, 283, { font: IT, size: 22, weight: 600, color: INK, align: 'right' }),
    ]),
  ]}),
);

// ---------- batch 2 ----------
const calDays = () => {
  const out = [];
  const hi = { 7: '#B58CF2', 11: '#2F6BFF', 14: '#FF8A2B', 18: '#E8341C', 21: '#18A558', 25: '#F5D92B', 28: '#F0449A', 30: '#18A558' };
  for (let d = 1; d <= 31; d++) {
    const idx = d + 3; // 1 Oct 2026 is a Thursday (Sunday first grid, column 4)
    const col = idx % 7, row = Math.floor(idx / 7);
    const cx = 64 + col * 136 + 68, cy = 855 + row * 106;
    if (hi[d]) out.push(circle(cx - 46, cy - 46, 92, hi[d], { blend: 'multiply' }));
    out.push(T(String(d), cx - 68, cy - 36, 136, { font: 'Archivo', size: 64, weight: 700, ls: -20, lh: 1, align: 'center', color: INK }));
  }
  return out;
};

ALL.push(
  // Calendar month
  tpl({ id: 'swiss-calendar-month', name: 'Month calendar', format: 'post', category: 'Calendar', tags: ['calendar', 'schedule', 'month'], pages: [
    page('#F7F4EC', [
      T('10', 64, 48, 200, { font: 'Archivo', size: 64, weight: 600, lh: 1, color: INK }),
      T('Presence House\nProgramme', 420, 52, 300, { font: 'Archivo', size: 20, weight: 700, ls: 60, upper: true, lh: 1.25, color: INK }),
      T("'26", 816, 48, 200, { font: 'Archivo', size: 64, weight: 600, lh: 1, color: INK, align: 'right' }),
      T('OCT', 40, 110, 1100, { font: 'Archivo', size: 430, weight: 900, ls: -30, lh: 1, color: INK }),
      ...['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => T(d, 64 + i * 136, 700, 136, { font: 'Archivo', size: 74, weight: 800, align: 'center', color: INK })),
      ...calDays(),
    ]),
  ]}),

  // Perspective planes
  tpl({ id: 'swiss-planes', name: 'Colour planes poster', format: 'poster', category: 'Event', tags: ['design', 'planes', 'geometry'], pages: [
    page('#F5F3EE', [
      path('M0,0 L430,0 L0,560 Z', 0, 0, 1123, 1587, INK, { w0: 1123, h0: 1587 }),
      path('M0,700 L520,1030 L1123,640 L600,320 Z', 0, 0, 1123, 1587, '#F5D92B', { w0: 1123, h0: 1587 }),
      path('M0,700 L520,1030 L520,1420 L0,1170 Z', 0, 0, 1123, 1587, '#1F6BFF', { w0: 1123, h0: 1587 }),
      path('M520,1030 L1123,640 L1123,1130 L520,1420 Z', 0, 0, 1123, 1587, '#F0449A', { w0: 1123, h0: 1587 }),
      T('Design Days', 640, 60, 440, { font: IT, size: 34, weight: 800, ls: -10, color: INK }),
      T('Three days of talks on\nspace, surface and light', 640, 108, 440, { font: IT, size: 22, weight: 500, lh: 1.25, color: INK }),
      T('28.9 to\n1.10.2026', 40, 1470, 500, { font: IT, size: 44, weight: 800, ls: -20, lh: 1.05, color: INK }),
      T('Pavilion Nord\nHaus der Gestaltung\nBasel', 640, 1470, 440, { font: IT, size: 22, weight: 500, lh: 1.25, color: INK }),
    ]),
  ]}),

  // Two big circles
  tpl({ id: 'swiss-two-circles', name: 'Two circles poster', format: 'poster', category: 'Event', tags: ['exhibition', 'circles', 'artist'], pages: [
    page('#F4A8C7', [
      circle(330, -300, 900, '#46B6F0'),
      circle(330, 740, 900, '#46B6F0'),
      T('Aires\nLibres', 40, 40, 700, { font: IT, size: 120, weight: 700, ls: -50, lh: 0.92, color: INK }),
      T('02.05.2019 to\n23.09.2019', 40, 280, 500, { font: IT, size: 34, weight: 500, lh: 1.15, color: INK }),
      RT('Parc des Bastions, Genève', 1050, 800, 800, { font: IT, size: 20, weight: 600, ls: 80, upper: true, rotation: 90, color: INK }),
      T('Inès\nAubry', 40, 1330, 700, { font: IT, size: 120, weight: 700, ls: -50, lh: 0.92, color: INK }),
    ]),
  ]}),

  // Stacked black / cream / blue blocks programme
  tpl({ id: 'swiss-block-programme', name: 'Block programme', format: 'a4', category: 'Programme', tags: ['programme', 'schedule', 'timetable'], pages: [
    page('#E9E6DE', [
      rect(30, 30, 734, 112, INK),
      T('Programme', 46, 38, 600, { font: 'Space Grotesk', size: 76, weight: 600, ls: -30, lh: 1.1, color: '#F2F0EB' }),
      T('+', 690, 38, 60, { font: 'Space Grotesk', size: 76, weight: 400, lh: 1.1, color: '#F2F0EB', align: 'right' }),
      T('Spring', 46, 156, 400, { font: 'Space Grotesk', size: 50, weight: 500, ls: -20, color: INK }),
      T('112', 600, 156, 148, { font: 'Space Grotesk', size: 50, weight: 500, ls: -20, color: INK, align: 'right' }),
      ...['Opening night, hall 1|03.02', 'Cello and voice|10.02', 'Open rehearsal|17.02', 'Film and live score|24.02', 'Choir workshop|03.03', 'Chamber evening|10.03', 'Open rehearsal|17.03', 'Young players|24.03', 'Spring concert|31.03'].flatMap((r, i) => {
        const [a, b] = r.split('|'); const y = 232 + i * 30;
        return [L(46, y, 748, y, INK, 1), T(a, 46, y + 5, 500, { font: 'Space Grotesk', size: 15, weight: 500, color: INK }), T(b, 620, y + 5, 128, { font: 'Space Grotesk', size: 15, weight: 500, color: INK, align: 'right' })];
      }),
      L(46, 502, 748, 502, INK, 1),
      rect(30, 548, 734, 545, '#4670FF'),
      T('Open\nrehearsals\nand late\nconcerts', 50, 566, 700, { font: 'Space Grotesk', size: 100, weight: 600, ls: -45, lh: 0.96, color: INK }),
      T('2024/5', 450, 1018, 300, { font: 'Space Grotesk', size: 56, weight: 500, ls: -20, color: INK, align: 'right' }),
      T('Stadsteatern, Södra scenen', 50, 1050, 400, { font: 'Space Grotesk', size: 15, weight: 500, color: INK }),
    ]),
  ]}),

  // Giant cropped vertical word with label
  tpl({ id: 'swiss-cropped-word', name: 'Cropped word poster', format: 'poster', category: 'Poster', tags: ['type', 'bakery', 'studio'], pages: [
    page('#F6F3EC', [
      RT('STU', 290, 800, 1700, { font: IT, size: 640, weight: 200, ls: -40, lh: 1, rotation: 270, align: 'center', color: INK }),
      RT('DIO', 840, 800, 1700, { font: IT, size: 640, weight: 200, ls: -40, lh: 1, rotation: 270, align: 'center', color: INK }),
      rect(380, 1240, 640, 280, '#8E98FF', { rotation: -4 }),
      T('001 / Spring edition\nOrigin: Gothenburg\nProcess: hand thrown\nFiring: wood, 1280 C\nNext open day: 14 June', 410, 1280, 580, { font: 'IBM Plex Mono', size: 20, weight: 500, lh: 1.5, rotation: -4, color: INK }),
      T('Studio Kvarn\nKeramik och form', 40, 40, 500, { font: IT, size: 24, weight: 700, lh: 1.15, color: INK }),
      T('2026', 983, 40, 100, { font: IT, size: 24, weight: 700, color: INK, align: 'right' }),
    ]),
  ]}),

  // Column of red circles
  tpl({ id: 'swiss-circle-grid', name: 'Circle grid poster', format: 'poster', category: 'Event', tags: ['talk', 'circles', 'bilingual'], pages: [
    page('#F3D9D0', [
      ...[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => circle(40 + c * 372, 40 + r * 372, 332, '#E02B20'))),
      T('13/04', 40, 1180, 700, { font: IT, size: 150, weight: 800, ls: -60, lh: 1, color: INK }),
      T('Kväll med\nMarta Lind', 40, 1330, 700, { font: IT, size: 66, weight: 700, ls: -25, lh: 1, color: INK }),
      T('An evening with\nMarta Lind', 560, 1330, 520, { font: IT, size: 66, weight: 300, ls: -25, lh: 1, color: INK }),
      T('Stadsbiblioteket, Rotundan   18.30   Fri entré', 40, 1520, 1000, { font: IT, size: 20, weight: 700, ls: 100, upper: true, color: INK }),
    ]),
  ]}),
);

// ---------- batch 3 ----------
// Pixel field that dissolves into the corner: deterministic pseudo random.
const rnd = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const pixelField = (x0, y0, cols, rows, cell, color, falloff) => {
  const out = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const p = falloff(c, r, cols, rows);
    if (rnd(r * 97 + c * 13 + 5) < p) out.push(rect(x0 + c * cell, y0 + r * cell, cell - 4, cell - 4, color));
  }
  return out;
};
const dotField = (x0, y0, cols, rows, step, maxD, color, fn) => {
  const out = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const d = maxD * fn(c / (cols - 1), r / (rows - 1));
    if (d > 2) out.push(circle(x0 + c * step + (step - d) / 2, y0 + r * step + (step - d) / 2, d, color));
  }
  return out;
};

ALL.push(
  tpl({ id: 'swiss-pixel-dissolve', name: 'Pixel dissolve poster', format: 'poster', category: 'Event', tags: ['seminar', 'pixels', 'science'], pages: [
    page('#F7F5F0', [
      pixelField(40, 40, 16, 26, 34, '#E8341C', (c, r, C, R) => Math.max(0, 1.05 - (c / C) * 0.95 - (r / R) * 0.6)),
      pixelField(40, 40, 16, 26, 34, '#14214D', (c, r, C, R) => Math.max(0, 0.18 - (c / C) * 0.2 - (r / R) * 0.12 + 0.02)),
      T('Physics of\nLiving\nSystems', 640, 60, 450, { font: 'Work Sans', size: 64, weight: 500, ls: -30, lh: 0.98, color: INK }),
      T('seminar series, spring 2026', 640, 260, 500, { font: 'Work Sans', size: 22, weight: 500, color: INK }),
      ...[['Selma Bergh', 'KTH', '12 Feb'], ['Aron Dahl', 'Uppsala', '26 Feb'], ['Lena Wirth', 'ETH Zürich', '12 Mar'], ['Omar Haddad', 'Karolinska', '26 Mar'], ['Ida Sjöberg', 'SciLifeLab', '9 Apr'], ['Per Lund', 'Chalmers', '23 Apr']].flatMap((r, i) => {
        const col = i % 2, row = Math.floor(i / 2); const x = 40 + col * 280 + (col ? 0 : 0), y = 980 + row * 130;
        return [rect(x, y, 14, 14, RED), T(r[2], x + 26, y - 4, 200, { font: 'Work Sans', size: 20, weight: 700, color: RED }), T(r[0] + '\n' + r[1], x, y + 28, 260, { font: 'Work Sans', size: 20, weight: 500, lh: 1.25, color: INK })];
      }),
      T('Thursdays 15.15\nRoom D3, Albanova', 700, 980, 380, { font: 'Work Sans', size: 22, weight: 600, lh: 1.3, color: INK }),
      T('Free, no sign up.\nCoffee from 14.45.', 700, 1100, 380, { font: 'Work Sans', size: 22, weight: 400, lh: 1.3, color: INK }),
      rect(40, 1510, 80, 36, INK),
      T('Dept. of Physics', 140, 1514, 500, { font: 'Work Sans', size: 22, weight: 700, color: INK }),
    ]),
  ]}),

  tpl({ id: 'swiss-halftone-circle', name: 'Halftone sphere poster', format: 'poster', category: 'Poster', tags: ['halftone', 'dots', 'sound'], pages: [
    page('#EFEDE6', [
      dotField(60, 220, 34, 34, 28, 26, INK, (u, v) => { const dx = u - 0.5, dy = v - 0.5; const r = Math.hypot(dx, dy) * 2; if (r > 1) return 0; return Math.pow(1 - r, 0.7) * 1.0 + 0.0 + (1 - v) * 0.1; }),
      T('Soft\nThunder', 40, 1180, 900, { font: 'Archivo', size: 230, weight: 800, ls: -60, lh: 0.86, color: INK }),
      T('A record of low\nfrequency weather', 700, 1260, 380, { font: 'Archivo', size: 26, weight: 500, lh: 1.2, color: INK }),
      T('LP, 12 tracks', 40, 40, 500, { font: 'Archivo', size: 20, weight: 700, ls: 100, upper: true, color: INK }),
      T('Release 14.11', 683, 40, 400, { font: 'Archivo', size: 20, weight: 700, ls: 100, upper: true, color: INK, align: 'right' }),
      L(40, 90, 1083, 90, INK, 1.5),
    ]),
  ]}),

  tpl({ id: 'swiss-lineup-story', name: 'Blue lineup story', format: 'story', category: 'Event', tags: ['lineup', 'festival', 'story'], pages: [
    page('#1F3BFF', [
      T('Nattlivet\nfestival', 54, 80, 980, { font: IT, size: 170, weight: 800, ls: -45, lh: 0.9, color: '#F2F0EB' }),
      L(54, 460, 1026, 460, '#F2F0EB', 3),
      ...['Mira Okonkwo', 'The Static Parade', 'Lo Fi Hannah', 'Brus', 'Sven Tallrot', 'Kids on Ice', 'Ada Vesper', 'Folk Machine', 'Ninja Bergman'].map((n, i) =>
        T(n, 54, 500 + i * 128, 980, { font: IT, size: 100, weight: i % 3 === 0 ? 800 : 500, ls: -30, lh: 1, color: '#F2F0EB' })),
      L(54, 1710, 1026, 1710, '#F2F0EB', 1.5),
      T('2 to 4 Aug', 54, 1736, 400, { font: IT, size: 38, weight: 700, ls: -10, color: '#F2F0EB' }),
      T('Slagthuset, Malmö', 54, 1790, 600, { font: IT, size: 38, weight: 400, color: '#F2F0EB' }),
      T('Tickets 795 kr', 560, 1736, 466, { font: IT, size: 38, weight: 700, color: '#F2F0EB', align: 'right' }),
      T('nattlivet.example', 560, 1790, 466, { font: IT, size: 38, weight: 400, color: '#F2F0EB', align: 'right' }),
    ]),
  ]}),

  tpl({ id: 'swiss-hairline-index', name: 'Hairline index sheet', format: 'a4', category: 'Poster', tags: ['grid', 'coordinates', 'index'], pages: [
    page('#F3F1EC', [
      hair(794, 1123, 40, 754, 6, INK, 0.75, 0.35),
      Array.from({ length: 20 }, (_, i) => L(0, 40 + i * 54, 794, 40 + i * 54, INK, 0.75, { opacity: 0.2 })),
      T('Index of\nthings that\nrepeat', 40, 52, 714, { font: 'Schibsted Grotesk', size: 110, weight: 800, ls: -50, lh: 0.92, color: INK }),
      rect(40 + 119 * 3, 40 + 54 * 8, 119 * 2, 54 * 3, RED),
      T('53°N 18°E', 40 + 119 * 3 + 12, 40 + 54 * 8 + 10, 200, { font: 'IBM Plex Mono', size: 14, weight: 500, color: '#F3F1EC' }),
      ...Array.from({ length: 6 }, (_, i) => T(String(i + 1).padStart(2, '0'), 44 + i * 119, 1056, 100, { font: 'IBM Plex Mono', size: 14, weight: 500, color: INK })),
      T('14', 36, 700, 700, { font: 'Schibsted Grotesk', size: 330, weight: 900, ls: -70, lh: 1, color: INK }),
      T('A working index of grids, rhythm and repetition in\nbuilt and printed form. Edition of 300.', 40 + 119, 40 + 54 * 12, 360, { font: 'Schibsted Grotesk', size: 15, weight: 500, lh: 1.35, color: INK }),
      T('Spring edition\nPlate 14', 40 + 119 * 5, 40 + 54 * 12, 119, { font: 'IBM Plex Mono', size: 13, weight: 500, lh: 1.4, color: INK }),
    ]),
  ]}),

  tpl({ id: 'swiss-name-card', name: 'Grid business card', format: 'card', category: 'Business card', tags: ['card', 'studio', 'contact'], pages: [
    page('#F2F0EB', [
      rect(0, 0, 1004, 650, '#F2F0EB'),
      rect(704, 0, 300, 650, RED),
      T('Elin Strand', 48, 48, 600, { font: IT, size: 64, weight: 800, ls: -35, color: INK }),
      T('Graphic design', 48, 124, 600, { font: IT, size: 30, weight: 500, color: INK }),
      L(48, 470, 656, 470, INK, 1.5),
      T('Fabriksgatan 12\n413 03 Göteborg', 48, 492, 300, { font: IT, size: 22, weight: 500, lh: 1.3, color: INK }),
      T('elin@strand.example\n+46 70 123 45 67', 380, 492, 300, { font: IT, size: 22, weight: 500, lh: 1.3, color: INK }),
      T('ES', 724, 24, 260, { font: IT, size: 360, weight: 800, ls: -80, lh: 1, color: '#F2F0EB' }),
    ]),
    page(RED, [
      circle(40, 40, 570, '#F2F0EB'),
      T('strand.example', 48, 580, 600, { font: IT, size: 26, weight: 600, color: '#F2F0EB' }),
    ]),
  ]}),

  tpl({ id: 'swiss-stripe-banner', name: 'Stripe event banner', format: 'banner', category: 'Banner', tags: ['banner', 'summit', 'header'], pages: [
    page('#E6F23A', [
      ...Array.from({ length: 8 }, (_, i) => rect(0, 18 + i * 12, 1200, 6, '#B9BDB0')),
      ...Array.from({ length: 8 }, (_, i) => rect(0, 400 - 18 - 6 - i * 12, 1200, 6, '#B9BDB0')),
      T('OnRoad', 80, 110, 1040, { font: 'Schibsted Grotesk', size: 150, weight: 800, ls: -60, lh: 1, color: INK, align: 'center' }),
      T('A summit for people who move things', 80, 270, 1040, { font: 'Schibsted Grotesk', size: 22, weight: 800, ls: 80, upper: true, color: INK, align: 'center' }),
    ]),
  ]}),

  tpl({ id: 'swiss-thumb-numerals', name: 'Numerals video thumbnail', format: 'thumb', category: 'Thumbnail', tags: ['youtube', 'thumbnail', 'numbers'], pages: [
    page('#F2F0EB', [
      T('10', -30, -90, 800, { font: IT, size: 640, weight: 800, ls: -70, lh: 1, color: RED }),
      T('rules for\nbetter\nposters', 700, 90, 700, { font: IT, size: 120, weight: 800, ls: -50, lh: 0.95, color: INK }),
      L(700, 500, 1240, 500, INK, 3),
      T('Swiss style in ten minutes', 700, 530, 560, { font: IT, size: 38, weight: 600, color: INK }),
      rect(40, 600, 430, 80, INK),
      T('Part 1 of 3', 64, 616, 380, { font: IT, size: 38, weight: 700, color: '#F2F0EB' }),
    ]),
  ]}),
);

// ---------- batch 4: invite, exhibition, decks, carousel ----------
const SW = 1920, SH = 1080, SM = 80;
const num = (n, tot, color = INK) => T(`${String(n).padStart(2, '0')} / ${String(tot).padStart(2, '0')}`, SW - SM - 300, SH - 60, 300, { font: 'IBM Plex Mono', size: 18, weight: 500, ls: 60, align: 'right', color });
const slideHair = (color, op = 0.2) => Array.from({ length: 13 }, (_, i) => L(SM + (i * (SW - 2 * SM)) / 12, 0, SM + (i * (SW - 2 * SM)) / 12, SH, color, 1, { opacity: op }));

ALL.push(
  tpl({ id: 'swiss-save-the-date', name: 'Save the date invite', format: 'invite', category: 'Invitation', tags: ['invitation', 'wedding', 'save the date'], pages: [
    page('#F4E64A', [
      T('OCT', 30, 14, 440, { font: 'Archivo', size: 150, weight: 800, ls: -50, lh: 1, color: INK }),
      T('9', 30, 110, 420, { font: 'Archivo', size: 400, weight: 800, ls: -60, lh: 1, color: INK, align: 'center' }),
      T('2026', 30, 430, 420, { font: 'Archivo', size: 150, weight: 800, ls: -50, lh: 1, color: INK }),
      T('Ida & Jonas', 30, 640, 200, { font: 'Archivo', size: 15, weight: 600, color: INK }),
      T('Invitation to follow', 250, 640, 200, { font: 'Archivo', size: 15, weight: 500, color: INK, align: 'right' }),
      T('We are making\nit official', 30, 600 - 0, 120, { font: 'Archivo', size: 13, weight: 500, lh: 1.3, color: INK }),
      T('Sandhamn\nSweden', 330, 600, 120, { font: 'Archivo', size: 13, weight: 500, lh: 1.3, color: INK, align: 'right' }),
    ]),
  ]}),

  tpl({ id: 'swiss-exhibition-photos', name: 'Exhibition poster with photos', format: 'poster', category: 'Event', tags: ['exhibition', 'photography', 'gallery'], pages: [
    page('#F2F0EB', [
      T('Common\nGround', 40, 36, 1043, { font: 'Archivo', size: 230, weight: 800, ls: -65, lh: 0.84, color: INK }),
      T('Photographs of shared spaces, 2019 to 2025', 44, 450, 900, { font: 'Archivo', size: 24, weight: 500, lh: 1.25, color: INK }),
      img('photos/city.jpg', 40, 520, 508, 500, { filters: { contrast: 10 } }),
      img('photos/friends.jpg', 575, 520, 250, 240),
      img('photos/portrait.jpg', 575, 780, 250, 240),
      img('photos/studio.jpg', 850, 520, 233, 500),
      L(40, 1060, 1083, 1060, INK, 1.5),
      T('Opening\nThursday 4 Sept\n18:00', 40, 1090, 330, { font: 'Archivo', size: 24, weight: 700, lh: 1.25, color: INK }),
      T('Hours\nTue to Sun\n11 to 17', 400, 1090, 330, { font: 'Archivo', size: 24, weight: 500, lh: 1.25, color: INK }),
      T('Place\nFotografiska Hall B\nStockholm', 760, 1090, 330, { font: 'Archivo', size: 24, weight: 500, lh: 1.25, color: INK }),
      T('Curated by Hanna Sundin   Free entry', 40, 1510, 800, { font: 'Archivo', size: 20, weight: 600, color: INK }),
      rect(1003, 1500, 80, 40, RED),
    ]),
  ]}),

  // Lecture deck
  tpl({ id: 'swiss-lecture-deck', name: 'Lecture deck', format: 'slide', category: 'Presentation', tags: ['lecture', 'slides', 'talk', 'university'], pages: [
    page(PAPER, [
      T('07', 1020, -120, 1400, { font: IT, size: 1000, weight: 800, ls: -70, lh: 1, color: RED }),
      T('Form\nfollows\nweather', SM, 120, 900, { font: IT, size: 190, weight: 800, ls: -60, lh: 0.92, color: INK }),
      L(SM, 860, SW - SM, 860, INK, 3),
      T('Lecture 7 of 10, Autumn 2026', SM, 890, 700, { font: IT, size: 34, weight: 700, color: INK }),
      T('Dr Karin Elmqvist', 700, 890, 500, { font: IT, size: 34, weight: 500, color: INK }),
      T('School of Architecture, Room A2', 1300, 890, 540, { font: IT, size: 34, weight: 500, color: INK }),
    ]),
    page(PAPER, [
      ...slideHair(INK),
      T('01', SM, 100, 600, { font: IT, size: 400, weight: 800, ls: -60, lh: 1, color: RED }),
      T('A building is a long\nconversation with\nits climate.', 700 + 2, 130, 1100, { font: IT, size: 96, weight: 700, ls: -40, lh: 1.02, color: INK }),
      T('Weather arrives first and stays longest. Before there is a client or a brief, there is a prevailing wind and a low winter sun.', 700, 700, 760, { font: IT, size: 34, weight: 400, lh: 1.3, color: INK }),
      num(2, 5),
    ]),
    page(PAPER, [
      img('photos/archipelago.jpg', SW / 2 + 20, 0, SW / 2 - 20, SH),
      T('02', SM, 100, 400, { font: 'IBM Plex Mono', size: 28, weight: 500, color: RED }),
      T('Three case\nstudies', SM, 160, 800, { font: IT, size: 150, weight: 800, ls: -55, lh: 0.95, color: INK }),
      ...[['Hofsós Pool', 'Iceland, 2019'], ['Rain House', 'Kerala, 2021'], ['Snow Hall', 'Kiruna, 2023']].flatMap((r, i) => [
        L(SM, 560 + i * 130, 860, 560 + i * 130, INK, 1.5),
        T(r[0], SM, 580 + i * 130, 500, { font: IT, size: 44, weight: 700, ls: -15, color: INK }),
        T(r[1], 560, 590 + i * 130, 300, { font: IT, size: 30, weight: 400, color: INK, align: 'right' }),
      ]),
      num(3, 5),
    ]),
    page(INK, [
      ...slideHair('#F2F0EB', 0.14),
      T('03', SM, 100, 400, { font: 'IBM Plex Mono', size: 28, weight: 500, color: RED }),
      ...[['4.2 m', 'Annual rainfall the roof is drawn for'], ['11 °', 'Pitch that sheds snow without gutters'], ['38 %', 'Heating saved by a south facing buffer'], ['0', 'Mechanical cooling systems']].map((r, i) => [
        T(r[0], SM + i * 450 - (i ? 0 : 0), 380, 440, { font: IT, size: 150, weight: 800, ls: -60, color: '#F2F0EB' }),
        L(SM + i * 450, 580, SM + i * 450 + 380, 580, RED, 4),
        T(r[1], SM + i * 450, 610, 380, { font: IT, size: 30, weight: 400, lh: 1.3, color: '#F2F0EB' }),
      ]),
      num(4, 5, '#F2F0EB'),
    ]),
    page(RED, [
      T('Questions', SM, 140, 1700, { font: IT, size: 330, weight: 800, ls: -60, lh: 1, color: '#F2F0EB' }),
      L(SM, 820, SW - SM, 820, '#F2F0EB', 3),
      T('karin.elmqvist@arch.example', SM, 850, 900, { font: IT, size: 44, weight: 600, color: '#F2F0EB' }),
      T('Next week\nLecture 8: Light', 1300, 850, 540, { font: IT, size: 44, weight: 500, lh: 1.15, color: '#F2F0EB' }),
    ]),
  ]}),

  // Studio portfolio deck
  tpl({ id: 'swiss-portfolio-deck', name: 'Studio portfolio deck', format: 'slide', category: 'Presentation', tags: ['portfolio', 'studio', 'case study', 'slides'], pages: [
    page('#F4F2EC', [
      T('Halm\nStudio', SM, 80, 1200, { font: 'Schibsted Grotesk', size: 380, weight: 800, ls: -70, lh: 0.84, color: INK }),
      rect(1500, 0, 420, SH, '#2A3BFF'),
      T('Portfolio\n2021 to 2026', 1540, 80, 340, { font: 'Schibsted Grotesk', size: 38, weight: 700, lh: 1.15, color: '#F4F2EC' }),
      T('Identity, editorial\nand wayfinding', 1540, 900, 340, { font: 'Schibsted Grotesk', size: 30, weight: 500, lh: 1.25, color: '#F4F2EC' }),
      T('Gothenburg and anywhere with wifi', SM, 960, 900, { font: 'Schibsted Grotesk', size: 30, weight: 600, color: INK }),
    ]),
    page('#F4F2EC', [
      img('photos/studio.jpg', 0, 0, 1180, SH),
      T('01', 1260, 80, 300, { font: 'IBM Plex Mono', size: 22, weight: 500, color: '#2A3BFF' }),
      T('Nordlys\nBakery', 1260, 130, 560, { font: 'Schibsted Grotesk', size: 100, weight: 800, ls: -40, lh: 0.95, color: INK }),
      L(1260, 520, 1840, 520, INK, 1.5),
      ...[['Client', 'Nordlys Bageri'], ['Year', '2025'], ['Scope', 'Identity, packaging'], ['Result', '+34 % web orders']].flatMap((r, i) => [
        T(r[0], 1260, 548 + i * 64, 200, { font: 'IBM Plex Mono', size: 18, weight: 500, upper: true, ls: 60, color: INK }),
        T(r[1], 1460, 544 + i * 64, 380, { font: 'Schibsted Grotesk', size: 28, weight: 500, color: INK }),
      ]),
      num(2, 5),
    ]),
    page('#F4F2EC', [
      T('02', SM, 80, 300, { font: 'IBM Plex Mono', size: 22, weight: 500, color: '#2A3BFF' }),
      T('Signs for a\nharbour hospital', SM, 120, 1200, { font: 'Schibsted Grotesk', size: 100, weight: 800, ls: -40, lh: 0.95, color: INK }),
      img('photos/city.jpg', SM, 400, 560, 560),
      img('photos/archipelago.jpg', 680, 400, 560, 560),
      img('photos/desk.jpg', 1280, 400, 560, 560),
      T('Wayfinding that works at walking pace and in a hurry.', 1280, 120, 560, { font: 'Schibsted Grotesk', size: 30, weight: 500, lh: 1.3, color: INK }),
      num(3, 5),
    ]),
    page('#2A3BFF', [
      ...slideHair('#F4F2EC', 0.18),
      T('What we do', SM, 80, 800, { font: 'Schibsted Grotesk', size: 44, weight: 700, color: '#F4F2EC' }),
      ...['Identity', 'Editorial', 'Wayfinding', 'Packaging', 'Websites'].map((r, i) => [
        L(SM, 220 + i * 150, SW - SM, 220 + i * 150, '#F4F2EC', 1.5),
        T(r, SM, 240 + i * 150, 1200, { font: 'Schibsted Grotesk', size: 100, weight: 800, ls: -45, lh: 1, color: '#F4F2EC' }),
        T('0' + (i + 1), SW - SM - 200, 270 + i * 150, 200, { font: 'IBM Plex Mono', size: 24, weight: 500, align: 'right', color: '#F4F2EC' }),
      ]),
      num(4, 5, '#F4F2EC'),
    ]),
    page('#F4F2EC', [
      T('Say hello', SM, 100, 1700, { font: 'Schibsted Grotesk', size: 330, weight: 800, ls: -95, lh: 1, color: INK }),
      L(SM, 700, SW - SM, 700, INK, 3),
      T('hej@halm.example', SM, 740, 800, { font: 'Schibsted Grotesk', size: 56, weight: 700, ls: -15, color: INK }),
      T('Magasinsgatan 21\n411 18 Göteborg', 1000, 740, 400, { font: 'Schibsted Grotesk', size: 30, weight: 500, lh: 1.3, color: INK }),
      T('halm.example\n@halmstudio', 1440, 740, 400, { font: 'Schibsted Grotesk', size: 30, weight: 500, lh: 1.3, color: INK }),
      rect(SW - SM - 120, SH - 180, 120, 120, '#2A3BFF'),
    ]),
  ]}),

  // Annual numbers deck
  tpl({ id: 'swiss-annual-numbers', name: 'Annual numbers deck', format: 'slide', category: 'Presentation', tags: ['report', 'annual', 'numbers', 'slides'], pages: [
    page('#E8341C', [
      ...slideHair(INK, 0.35),
      T('Kvarn Cooperative', SM, 50, 700, { font: 'Archivo', size: 30, weight: 800, color: INK }),
      T('Annual report in numbers', 700, 50, 700, { font: 'Archivo', size: 30, weight: 500, color: INK }),
      T('FY 2025', SW - SM - 300, 54, 300, { font: 'IBM Plex Mono', size: 24, weight: 500, ls: 60, align: 'right', color: INK }),
      L(SM, 120, SW - SM, 120, INK, 3),
      T('2025', SM - 20, 70, 2200, { font: 'Archivo', size: 760, weight: 800, ls: -70, lh: 1, color: '#F2F0EB' }),
      ...[['4 812', 'members'], ['27', 'local groups'], ['1.9 M', 'kronor in rebates'], ['62 %', 'volunteered']].flatMap((r, i) => {
        const x = SM + i * 450;
        return [
          L(x, 790, x + 410, 790, INK, 3),
          T(r[0], x, 810, 430, { font: 'Archivo', size: 110, weight: 800, ls: -45, lh: 1, color: INK }),
          T(r[1], x, 940, 400, { font: 'Archivo', size: 32, weight: 500, color: INK }),
          T('0' + (i + 1), x, 990, 100, { font: 'IBM Plex Mono', size: 20, weight: 500, ls: 60, color: INK }),
        ];
      }),
    ]),
    page('#F2F0EB', [
      T('4 812', SM - 10, 20, 2400, { font: 'Archivo', size: 640, weight: 800, ls: -60, lh: 1, color: INK }),
      L(SM, 850, SW - SM, 850, INK, 3),
      T('members at year end', SM, 880, 800, { font: 'Archivo', size: 54, weight: 700, ls: -20, color: INK }),
      T('Up 612 on 2024. The first year every district had a local group.', 1100, 880, 740, { font: 'Archivo', size: 34, weight: 400, lh: 1.3, color: INK }),
      num(2, 5),
    ]),
    page('#F2F0EB', [
      T('Members per year', SM, 80, 900, { font: 'Archivo', size: 44, weight: 700, color: INK }),
      ...[[2021, 2100], [2022, 2760], [2023, 3380], [2024, 4200], [2025, 4812]].flatMap(([y, v], i) => {
        const h = (v / 4812) * 640; const x = SM + i * 340;
        return [rect(x, 880 - h, 280, h, i === 4 ? RED : INK), T(String(y), x, 900, 280, { font: 'IBM Plex Mono', size: 22, weight: 500, color: INK }), T(String(v), x, 880 - h - 56, 280, { font: 'Archivo', size: 44, weight: 700, color: INK })];
      }),
      T('Growth is steady, not sudden. Each year added about 600 members.', SM, 150, 700, { font: 'Archivo', size: 28, weight: 400, lh: 1.3, color: INK }),
      num(3, 5),
    ]),
    page(INK, [
      ...[['62 %', 'of members volunteer at least once a year', RED], ['1.9 M', 'kronor returned to members as rebates', '#F2F0EB'], ['27', 'local groups across eleven districts', '#2BB3E8']].flatMap((r, i) => [
        T(r[0], SM + i * 600, 160, 580, { font: 'Archivo', size: 200, weight: 800, ls: -70, color: r[2] }),
        L(SM + i * 600, 440, SM + i * 600 + 500, 440, r[2], 3),
        T(r[1], SM + i * 600, 470, 480, { font: 'Archivo', size: 34, weight: 400, lh: 1.3, color: '#F2F0EB' }),
      ]),
      T('What the year looked like', SM, 880, 1000, { font: 'Archivo', size: 54, weight: 700, ls: -20, color: '#F2F0EB' }),
      num(4, 5, '#F2F0EB'),
    ]),
    page('#F2F0EB', [
      T('Next', SM, 130, 1000, { font: 'Archivo', size: 330, weight: 800, ls: -80, lh: 1, color: INK }),
      T('6 000', 960, 150, 1100, { font: 'Archivo', size: 380, weight: 800, ls: -70, lh: 1, color: RED }),
      L(SM, 760, SW - SM, 760, INK, 3),
      T('Target members by December 2026', SM, 790, 1000, { font: 'Archivo', size: 54, weight: 700, ls: -20, color: INK }),
      T('Annual meeting 18 March\nKvarn Hall, 18:00', 1300, 790, 540, { font: 'Archivo', size: 34, weight: 500, lh: 1.3, color: INK }),
    ]),
  ]}),

  // Carousel
  tpl({ id: 'swiss-carousel-rules', name: 'Rules carousel', format: 'post', category: 'Carousel', tags: ['carousel', 'tips', 'instagram', 'rules'], pages: [
    page('#1F3BFF', [
      T('5', 40, -170, 1100, { font: IT, size: 1100, weight: 800, ls: -60, lh: 1, color: '#F2F0EB' }),
      T('rules for\nclear grids', 64, 980, 900, { font: IT, size: 110, weight: 800, ls: -45, lh: 0.95, color: '#F2F0EB' }),
      T('Swipe', 64, 1250, 300, { font: IT, size: 28, weight: 700, ls: 100, upper: true, color: '#F2F0EB' }),
      L(220, 1266, 340, 1266, '#F2F0EB', 3, { end: 'arrow' }),
    ]),
    ...[['1', 'Choose a module', 'Pick one unit and build every margin, gap and size from it. Eight pixels is a fine start.'], ['2', 'Align to the edge', 'If two things sit near each other, they should share an edge. Almost aligned is wrong.'], ['3', 'Use few sizes', 'Three type sizes do the work of seven. Make the gaps between them large.'], ['4', 'Let space speak', 'An empty column is a decision. Leave it empty on purpose.']].map(([n, h, b], i) =>
      page(i % 2 ? '#F2F0EB' : '#FFFFFF', [
        ...hair(1080, 1350, 64, 1016, 6, '#1F3BFF', 1, 0.25),
        T('0' + n, 64, 60, 300, { font: 'IBM Plex Mono', size: 26, weight: 500, color: '#1F3BFF' }),
        T(n, 40, 200, 900, { font: IT, size: 760, weight: 800, ls: -60, lh: 1, color: '#1F3BFF' }),
        T(h, 64, 960, 952, { font: IT, size: 80, weight: 800, ls: -35, lh: 1, color: INK }),
        T(b, 64, 1080, 640, { font: IT, size: 30, weight: 400, lh: 1.3, color: INK }),
        T(`${i + 2} / 5`, 856, 1260, 160, { font: 'IBM Plex Mono', size: 22, weight: 500, align: 'right', color: INK }),
      ])),
  ]}),
);
