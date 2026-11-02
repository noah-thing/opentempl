import { tpl, page, T, S, rect, circle, L, img, frame, overlay, svg, qr, stroke, solid, linear, pattern, path } from '../kit.mjs';

const CLEAR = 'rgba(0,0,0,0)';
const outline = (shape, x, y, w, h, color, width, p = {}) => S(shape, x, y, w, h, CLEAR, { stroke: stroke(color, width), ...p });
const stripes = (x, y, w, h, n, colors, p = {}) => Array.from({ length: n }, (_, i) => rect(x + (w / n) * i, y, w / n + 0.5, h, colors[i % colors.length], p));
const A = 'Anton';
const BC = 'Barlow Condensed';
const OS = 'Oswald';

// shared label: tiny caps
const lab = (t, x, y, w, color, size = 16, p = {}) => T(t, x, y, w, { font: OS, size, weight: 500, ls: 160, upper: true, color, lh: 1.2, ...p });

export default [
  // 1 ------------------------------------------------------------------
  tpl({
    id: 'sports-matchday-pitch', name: 'Matchday pitch poster', format: 'poster', category: 'Event',
    tags: ['football', 'matchday', 'fixture', 'club'],
    pages: [page('#0E5A3A', [
      // pitch drawn under the type
      outline('rect', 40, 40, 1043, 1507, '#F4F1E8', 7, { opacity: 0.9 }),
      L(40, 793, 1083, 793, '#F4F1E8', 7, { opacity: 0.9 }),
      outline('ellipse', 331, 593, 460, 400, '#F4F1E8', 7, { opacity: 0.9 }),
      outline('rect', 250, 40, 623, 250, '#F4F1E8', 7, { opacity: 0.9 }),
      outline('rect', 250, 1297, 623, 250, '#F4F1E8', 7, { opacity: 0.9 }),
      rect(80, 70, 963, 300, '#0E5A3A'),
      lab('Division two  /  Round 21', 80, 80, 600, '#F4F1E8', 18),
      lab('Kick off 16:15', 700, 80, 343, '#F4F1E8', 18, { align: 'right' }),
      T('HARBOUR', 74, 112, 1000, { font: A, size: 292, ls: -10, lh: 0.95, color: '#F4F1E8' }),
      rect(80, 420, 150, 90, '#FF6A13'),
      T('VS', 98, 426, 120, { font: BC, size: 78, weight: 800, italic: true, ls: 40, lh: 1, color: '#0B0B0B' }),
      T('NORTHGATE', 74, 540, 1000, { font: A, size: 238, ls: -6, lh: 0.95, color: '#F4F1E8' }),
      rect(80, 790, 963, 1, '#0E5A3A', { opacity: 0 }),
      T('14.12', 62, 815, 1000, { font: A, size: 470, ls: -20, lh: 0.9, color: '#FF6A13' }),
      rect(0, 1380, 1123, 207, '#0B0B0B'),
      lab('Ground', 80, 1412, 300, '#FF6A13'), T('Pier Road\nStadium', 80, 1440, 300, { font: OS, size: 34, weight: 600, upper: true, color: '#F4F1E8', lh: 1.1 }),
      lab('Gates open', 420, 1412, 300, '#FF6A13'), T('14:30\nNorth stand', 420, 1440, 300, { font: OS, size: 34, weight: 600, upper: true, color: '#F4F1E8', lh: 1.1 }),
      lab('Tickets', 760, 1412, 300, '#FF6A13'), T('Adults 12\nUnder 16 free', 760, 1440, 300, { font: OS, size: 34, weight: 600, upper: true, color: '#F4F1E8', lh: 1.1 }),
    ])],
  }),

  // 2 ------------------------------------------------------------------
  tpl({
    id: 'sports-fixtures-week', name: 'Fixtures of the week', format: 'post', category: 'Social',
    tags: ['fixtures', 'schedule', 'club', 'week'],
    pages: [page('#F1EFE6', [
      T('THIS', 54, 24, 600, { font: A, size: 215, ls: -10, lh: 0.88, color: '#0B0B0B' }),
      T('WEEK', 54, 200, 700, { font: A, size: 215, ls: -10, lh: 0.88, color: '#0B0B0B' }),
      T('Fixtures\nfor all five\nsenior sides', 730, 52, 300, { font: BC, size: 40, weight: 700, italic: true, lh: 1, upper: true, color: '#0B0B0B', ls: 20 }),
      T('09', 830, 200, 220, { font: A, size: 130, lh: 0.9, color: '#F2381C', align: 'right' }),
      lab('Dec 09 to Dec 15', 700, 330, 350, '#0B0B0B', 15, { align: 'right' }),
      ...[
        ['WED', '11', 'Harbour', 'Fenwick', '19:30', 'Away'],
        ['FRI', '13', 'Harbour U19', 'Northgate U19', '18:00', 'Home'],
        ['SAT', '14', 'Harbour', 'Northgate', '16:15', 'Home'],
        ['SAT', '14', 'Harbour Women', 'Linden', '13:00', 'Away'],
        ['SUN', '15', 'Harbour Reserves', 'Ashby', '11:00', 'Home'],
      ].flatMap(([d, n, a, b, t, ha], i) => {
        const y = 440 + i * 150;
        const hot = i === 2;
        return [
          hot ? rect(0, y, 1080, 150, '#F2381C') : L(54, y, 1026, y, '#0B0B0B', 2),
          T(d, 54, y + 12, 120, { font: OS, size: 22, weight: 500, ls: 160, color: hot ? '#F1EFE6' : '#0B0B0B' }),
          T(n, 54, y + 40, 140, { font: A, size: 96, lh: 1, color: hot ? '#F1EFE6' : '#0B0B0B' }),
          T(a.toUpperCase(), 200, y + 22, 700, { font: A, size: 54, ls: 0, lh: 1, color: hot ? '#F1EFE6' : '#0B0B0B' }),
          T('V  ' + b.toUpperCase(), 200, y + 84, 700, { font: BC, size: 38, weight: 700, italic: true, ls: 40, lh: 1, color: hot ? '#0B0B0B' : '#5B5A55' }),
          T(t, 800, y + 28, 226, { font: A, size: 70, lh: 1, color: hot ? '#F1EFE6' : '#0B0B0B', align: 'right' }),
          lab(ha, 800, y + 108, 226, hot ? '#0B0B0B' : '#F2381C', 18, { align: 'right', weight: 600 }),
        ];
      }),
      L(54, 1190, 1026, 1190, '#0B0B0B', 2),
      lab('Home games at Pier Road. Kids under sixteen free all week.', 54, 1226, 700, '#0B0B0B', 15, { lh: 1.5 }),
      lab('harbourfc.example', 54, 1290, 400, '#0B0B0B', 15),
      circle(940, 1218, 86, '#0B0B0B'),
      T('HFC', 940, 1236, 86, { font: A, size: 38, color: '#F1EFE6', align: 'center', lh: 1 }),
    ])],
  }),

  // 3 ------------------------------------------------------------------
  tpl({
    id: 'sports-final-score', name: 'Final score', format: 'square', category: 'Social',
    tags: ['score', 'result', 'full time'],
    pages: [page('#0B0B0B', [
      T('3', -70, -190, 700, { font: A, size: 1050, lh: 1, color: '#D6FF3C' }),
      T('2', 410, -190, 700, { font: A, size: 1050, lh: 1, color: '#F4F1E8', blend: 'difference' }),
      rect(0, 770, 1080, 310, '#0B0B0B'),
      lab('Full time', 54, 790, 300, '#D6FF3C', 20),
      lab('Saturday 14 December', 726, 790, 300, '#F4F1E8', 20, { align: 'right' }),
      T('HARBOUR 3\nNORTHGATE 2', 50, 826, 700, { font: A, size: 92, ls: 0, lh: 0.98, color: '#F4F1E8' }),
      L(54, 1030, 1026, 1030, '#F4F1E8', 2, { opacity: 0.4 }),
      T("Okafor 14'   Lind 52'   Reyes 88'", 54, 1040, 970, { font: BC, size: 32, weight: 600, italic: true, ls: 30, upper: true, color: '#D6FF3C', lh: 1 }),
    ])],
  }),

  // 4 ------------------------------------------------------------------
  tpl({
    id: 'sports-player-of-month', name: 'Player of the month', format: 'post', category: 'Social',
    tags: ['player', 'award', 'photo', 'month'],
    pages: [page('#1A3CFF', [
      T('PLAYER', 28, 24, 1100, { font: A, size: 340, ls: -12, lh: 0.9, color: '#D6FF3C' }),
      img('photos/runner.jpg', 260, 340, 766, 740, { filters: { duotone: ['#06103A', '#E9FF70'], grain: 30, contrast: 14 } }),
      T('OF\nTHE', 54, 346, 200, { font: A, size: 84, lh: 0.95, color: '#D6FF3C' }),
      T('09', 740, 346, 270, { font: A, size: 190, lh: 0.9, color: '#0B0B0B', align: 'right' }),
      T('MONTH', 28, 860, 1100, { font: A, size: 340, ls: -12, lh: 0.9, color: '#F4F1E8' }),
      T('MARA LINDQVIST', 54, 1226, 600, { font: BC, size: 56, weight: 800, italic: true, upper: true, ls: 20, color: '#F4F1E8', lh: 1 }),
      lab('November  /  Forward', 54, 1292, 600, '#D6FF3C', 18),
      T('7', 700, 1236, 100, { font: A, size: 90, lh: 1, color: '#D6FF3C' }), lab('Goals', 700, 1330, 120, '#F4F1E8', 14),
      T('4', 830, 1236, 100, { font: A, size: 90, lh: 1, color: '#D6FF3C' }), lab('Assists', 830, 1330, 120, '#F4F1E8', 14),
      T('9.1', 950, 1236, 130, { font: A, size: 90, lh: 1, color: '#D6FF3C' }), lab('Rating', 950, 1330, 120, '#F4F1E8', 14),
    ])],
  }),

  // 5 ------------------------------------------------------------------
  tpl({
    id: 'sports-club-membership', name: 'Club membership flyer', format: 'flyer', category: 'Flyer',
    tags: ['membership', 'club', 'join', 'season'],
    pages: [page('#F4F1E8', [
      ...stripes(0, 0, 559, 380, 9, ['#C8102E', '#0B0B0B']),
      rect(0, 250, 559, 130, '#0B0B0B'),
      T('JOIN THE', 28, 18, 420, { font: A, size: 92, lh: 0.95, ls: -4, color: '#F4F1E8' }),
      T('CLUB', 28, 100, 520, { font: A, size: 190, lh: 0.9, ls: -8, color: '#F4F1E8' }),
      T('Season 25/26', 30, 280, 300, { font: BC, size: 46, weight: 800, italic: true, upper: true, ls: 30, color: '#F4F1E8', lh: 1 }),
      lab('Open until 31 August', 30, 334, 300, '#C8102E', 13, { weight: 600 }),
      circle(440, 262, 92, '#C8102E'),
      T('25', 440, 276, 92, { font: A, size: 54, align: 'center', color: '#F4F1E8', lh: 1 }),
      ...[['JUNIOR', 'Under 16', '45'], ['ADULT', 'Standing and seated', '90'], ['FAMILY', 'Two adults, up to three kids', '160']].flatMap(([a, b, c], i) => {
        const y = 410 + i * 92;
        return [
          L(28, y, 531, y, '#0B0B0B', 2),
          T(a, 28, y + 12, 300, { font: A, size: 40, lh: 1, color: '#0B0B0B' }),
          lab(b, 30, y + 60, 330, '#0B0B0B', 11),
          T(c, 330, y + 4, 140, { font: A, size: 78, lh: 1, color: '#C8102E', align: 'right' }),
          lab('Eur', 478, y + 56, 54, '#0B0B0B', 11, { align: 'right' }),
        ];
      }),
      L(28, 686, 531, 686, '#0B0B0B', 2),
      lab('Includes home matches, club scarf and a vote at the AGM', 28, 700, 340, '#0B0B0B', 10, { lh: 1.5 }),
      lab('harbourfc.example/join', 28, 760, 300, '#C8102E', 11, { weight: 600 }),
      qr('https://harbourfc.example/join', 450, 702, 80, '#0B0B0B', '#F4F1E8'),
    ])],
  }),

  // 6 ------------------------------------------------------------------
  tpl({
    id: 'sports-run-club-poster', name: 'Run club poster', format: 'poster', category: 'Poster',
    tags: ['run club', 'running', 'weekly', 'poster'],
    pages: [page('#0B0B0B', [
      T('RUN', 36, 30, 900, { font: A, size: 520, lh: 0.78, ls: -16, color: '#F4F1E8' }),
      T('RUN', 36, 486, 900, { font: A, size: 520, lh: 0.78, ls: -16, color: '#F4F1E8' }),
      T('RUN', 36, 942, 900, { font: A, size: 520, lh: 0.78, ls: -16, color: '#F4F1E8' }),
      img('photos/runner.jpg', 420, 600, 290, 400, { border: { color: '#F4F1E8', width: 10 }, filters: { saturation: -100, contrast: 30, grain: 40 } }),
      T('TUE\n18:30', 800, 90, 283, { font: A, size: 70, lh: 0.95, color: '#FF4A1C', align: 'right' }),
      L(800, 250, 1083, 250, '#F4F1E8', 2),
      T('Harbour Park\nbandstand\nAll paces\nFree', 800, 270, 283, { font: OS, size: 24, weight: 500, upper: true, ls: 100, lh: 1.35, color: '#F4F1E8', align: 'right' }),
      rect(0, 1400, 1123, 187, '#FF4A1C'),
      T('EVERY WEEK. 5 KM. NO ONE LEFT BEHIND.', 40, 1424, 1043, { font: A, size: 62, lh: 1, color: '#0B0B0B' }),
      lab('Meet at the bandstand', 40, 1520, 400, '#0B0B0B', 18, { weight: 600 }),
      lab('@harbourrunclub', 723, 1520, 360, '#0B0B0B', 18, { weight: 600, align: 'right' }),
    ])],
  }),

  // 7 carousel ----------------------------------------------------------
  tpl({
    id: 'sports-results-carousel', name: 'Round results carousel', format: 'post', category: 'Social',
    tags: ['results', 'table', 'carousel', 'league'],
    pages: [
      page('#FF6A13', [
        T('21', 20, -60, 1200, { font: A, size: 1000, lh: 1, ls: -40, color: '#0B0B0B' }),
        rect(0, 1010, 1080, 340, '#0B0B0B'),
        T('ROUND\nRESULTS', 54, 1038, 800, { font: A, size: 120, lh: 0.95, color: '#F4F1E8' }),
        lab('Division two  /  7 and 8 December', 54, 1290, 700, '#FF6A13', 18),
        T('Swipe', 880, 1270, 150, { font: BC, size: 34, weight: 700, italic: true, upper: true, ls: 60, color: '#F4F1E8', align: 'right' }),
        path('M0 8 H70 M52 0 L70 8 L52 16', 880, 1316, 70, 16, CLEAR, { w0: 70, h0: 16, stroke: stroke('#F4F1E8', 3) }),
      ]),
      page('#F4F1E8', [
        lab('Round 21', 54, 54, 300, '#0B0B0B', 18), lab('Full time', 726, 54, 300, '#FF6A13', 18, { align: 'right', weight: 600 }),
        ...[
          ['Harbour', 3, 'Northgate', 2], ['Fenwick', 0, 'Linden', 0], ['Ashby', 1, 'Corbridge', 4],
          ['Westmere', 2, 'Hollin', 1], ['Dunmore', 5, 'Staveley', 1], ['Ridgeway', 1, 'Pelham', 1],
        ].flatMap(([a, s1, b, s2], i) => {
          const y = 100 + i * 190;
          const w = s1 > s2;
          return [
            L(54, y, 1026, y, '#0B0B0B', 2),
            T(a.toUpperCase(), 54, y + 30, 360, { font: A, size: 46, lh: 1, color: '#0B0B0B', opacity: s1 >= s2 ? 1 : 0.45 }),
            T(b.toUpperCase(), 54, y + 100, 360, { font: A, size: 46, lh: 1, color: '#0B0B0B', opacity: s2 >= s1 ? 1 : 0.45 }),
            T(String(s1), 600, y + 0, 180, { font: A, size: 150, lh: 1, color: s1 >= s2 ? '#FF6A13' : '#0B0B0B', align: 'right' }),
            T(String(s2), 846, y + 0, 180, { font: A, size: 150, lh: 1, color: s2 >= s1 ? '#FF6A13' : '#0B0B0B', align: 'right' }),
            L(810, y + 90, 836, y + 90, '#0B0B0B', 4),
          ];
        }),
        L(54, 1240, 1026, 1240, '#0B0B0B', 2),
        lab('1 of 4', 54, 1270, 200, '#0B0B0B', 15), lab('harbourfc.example', 726, 1270, 300, '#0B0B0B', 15, { align: 'right' }),
      ]),
      page('#0B0B0B', [
        lab('The table', 54, 54, 300, '#F4F1E8', 18), lab('After 21 games', 726, 54, 300, '#FF6A13', 18, { align: 'right', weight: 600 }),
        T('TOP SIX', 50, 90, 900, { font: A, size: 200, lh: 0.9, ls: -6, color: '#F4F1E8' }),
        ...[['Harbour', 51], ['Dunmore', 47], ['Westmere', 44], ['Corbridge', 40], ['Fenwick', 38], ['Linden', 33]].flatMap(([n, p], i) => {
          const y = 360 + i * 140;
          const bw = (p / 51) * 560;
          return [
            T(String(i + 1), 54, y, 70, { font: A, size: 70, lh: 1, color: i === 0 ? '#FF6A13' : '#F4F1E8', opacity: i === 0 ? 1 : 0.5 }),
            T(n.toUpperCase(), 130, y + 6, 300, { font: A, size: 44, lh: 1, color: '#F4F1E8' }),
            rect(130, y + 68, bw, 30, i === 0 ? '#FF6A13' : '#F4F1E8', { opacity: i === 0 ? 1 : 0.85 }),
            T(String(p), 130 + bw + 18, y + 58, 120, { font: A, size: 50, lh: 1, color: i === 0 ? '#FF6A13' : '#F4F1E8' }),
          ];
        }),
        lab('Points. Three for a win, one for a draw.', 54, 1230, 700, '#F4F1E8', 15, { opacity: 0.7 }),
        lab('2 of 4', 54, 1290, 200, '#F4F1E8', 15),
      ]),
      page('#F4F1E8', [
        lab('Golden boot', 54, 54, 300, '#0B0B0B', 18),
        T('11', 40, 80, 1100, { font: A, size: 800, lh: 0.9, ls: -30, color: '#FF6A13' }),
        T('GOALS', 560, 120, 460, { font: A, size: 150, lh: 0.9, ls: -4, color: '#0B0B0B' }),
        T('Daniel Okafor\nHarbour', 560, 280, 460, { font: BC, size: 56, weight: 800, italic: true, upper: true, lh: 1, ls: 10, color: '#0B0B0B' }),
        L(54, 790, 1026, 790, '#0B0B0B', 2),
        lab('Next round', 54, 820, 300, '#FF6A13', 18, { weight: 600 }),
        T('NORTHGATE\nAWAY', 54, 860, 900, { font: A, size: 140, lh: 0.92, color: '#0B0B0B' }),
        lab('Saturday 21 December  /  16:15', 54, 1150, 700, '#0B0B0B', 20),
        rect(54, 1210, 972, 90, '#0B0B0B'),
        T('FULL MATCH REPORT AT HARBOURFC.EXAMPLE', 54, 1228, 972, { font: OS, size: 24, weight: 500, ls: 120, color: '#F4F1E8', align: 'center', lh: 1.2 }),
      ]),
    ],
  }),

  // 8 ------------------------------------------------------------------
  tpl({
    id: 'sports-lineup-story', name: 'Starting eleven story', format: 'story', category: 'Story',
    tags: ['lineup', 'team sheet', 'formation', 'story'],
    pages: [page('#0E5A3A', [
      ...Array.from({ length: 8 }, (_, i) => rect(0, 280 + i * 180, 1080, 90, '#0C5235')),
      outline('rect', 60, 300, 960, 1280, '#F4F1E8', 5, { opacity: 0.85 }),
      L(60, 940, 1020, 940, '#F4F1E8', 5, { opacity: 0.85 }),
      outline('ellipse', 380, 800, 320, 280, '#F4F1E8', 5, { opacity: 0.85 }),
      outline('rect', 290, 300, 500, 170, '#F4F1E8', 5, { opacity: 0.85 }),
      outline('rect', 290, 1410, 500, 170, '#F4F1E8', 5, { opacity: 0.85 }),
      lab('Matchday  /  Sat 14 Dec  /  16:15', 60, 70, 960, '#F4F1E8', 22),
      T('STARTING', 56, 100, 1000, { font: A, size: 110, lh: 0.95, color: '#F4F1E8' }),
            T('XI', 700, 100, 320, { font: A, size: 240, lh: 0.9, color: '#FF6A13', align: 'right' }),
      ...[
        [1, 'Berg', 540, 1500], [2, 'Sato', 180, 1320], [5, 'Wolfe', 400, 1350], [4, 'Idris', 680, 1350], [3, 'Moreau', 900, 1320],
        [8, 'Lind', 270, 1090], [6, 'Costa', 540, 1140], [10, 'Reyes', 810, 1090],
        [7, 'Hale', 190, 680], [9, 'Okafor', 540, 600], [11, 'Brandt', 890, 680],
      ].flatMap(([n, name, cx, cy]) => [
        circle(cx - 62, cy - 62, 124, n === 9 ? '#FF6A13' : '#0B0B0B'),
        T(String(n), cx - 62, cy - 44, 124, { font: A, size: 72, lh: 1, align: 'center', color: '#F4F1E8' }),
        T(name.toUpperCase(), cx - 100, cy + 72, 200, { font: OS, size: 26, weight: 600, ls: 80, align: 'center', color: '#F4F1E8', lh: 1 }),
      ]),
      rect(0, 1650, 1080, 270, '#0B0B0B'),
      lab('Bench', 60, 1682, 300, '#FF6A13', 20),
      T('12 Aydin    13 Pike    14 Novak    15 Strand\n16 Dubois    17 Eze    18 Marsh', 60, 1730, 960, { font: BC, size: 48, weight: 700, italic: true, upper: true, ls: 30, color: '#F4F1E8', lh: 1.35 }),
    ])],
  }),

  // 9 ------------------------------------------------------------------
  tpl({
    id: 'sports-race-bib', name: 'Race day bib', format: 'a4', category: 'Poster',
    tags: ['race', 'half marathon', 'run', 'entry'],
    pages: [page('#F4F1E8', [
      rect(40, 40, 714, 430, '#FFFFFF', { stroke: stroke('#0B0B0B', 4) }),
      ...[[70, 70], [704, 70], [70, 408], [704, 408]].map(([x, y]) => circle(x - 12, y - 12, 24, '#F4F1E8', { stroke: stroke('#0B0B0B', 3) })),
      T('2147', 36, 112, 722, { font: A, size: 290, lh: 1, ls: -8, color: '#0B0B0B', align: 'center' }),
      rect(100, 40, 594, 56, '#0B0B0B'),
      T('HARBOUR HALF MARATHON', 100, 50, 594, { font: OS, size: 28, weight: 600, ls: 160, color: '#F4F1E8', align: 'center', lh: 1.1 }),
      rect(100, 414, 594, 56, '#F2381C'),
      T('WAVE B  /  START 09:10', 100, 424, 594, { font: OS, size: 28, weight: 600, ls: 160, color: '#F4F1E8', align: 'center', lh: 1.1 }),
      T('HALF', 40, 510, 714, { font: A, size: 240, lh: 0.88, ls: -6, color: '#0B0B0B' }),
      T('21.1 KM', 40, 740, 714, { font: A, size: 120, lh: 1, color: '#F2381C' }),
      lab('Elevation along the course, in metres', 40, 850, 500, '#0B0B0B', 11),
      path('M0 150 L40 140 L90 120 L150 128 L210 70 L260 40 L310 62 L370 98 L430 90 L480 110 L540 60 L600 76 L660 120 L714 128 L714 170 L0 170 Z', 40, 880, 714, 170, '#0B0B0B', { w0: 714, h0: 170 }),
      path('M0 150 L40 140 L90 120 L150 128 L210 70 L260 40 L310 62 L370 98 L430 90 L480 110 L540 60 L600 76 L660 120 L714 128', 40, 880, 714, 170, CLEAR, { w0: 714, h0: 170, stroke: stroke('#F2381C', 5) }),
      ...[0, 5, 10, 15, 21].map((k, i) => lab(k + (k === 21 ? '.1' : ''), 40 + (i / 4) * 690, 1058, 40, '#0B0B0B', 11, { weight: 600 })),
      L(40, 1080, 754, 1080, '#0B0B0B', 2),
      lab('Sunday 4 May 2025', 40, 1090, 350, '#0B0B0B', 11, { weight: 600 }),
      lab('Pier Road start', 300, 1090, 200, '#0B0B0B', 11),
      lab('Medal at the line', 560, 1090, 194, '#F2381C', 11, { align: 'right', weight: 600 }),
    ])],
  }),

  // 10 -----------------------------------------------------------------
  tpl({
    id: 'sports-tryouts-story', name: 'Open tryouts story', format: 'story', category: 'Story',
    tags: ['tryouts', 'trials', 'recruit', 'diagonal'],
    pages: [page('#FF4A1C', [
      rect(-200, 520, 1500, 560, '#0B0B0B', { rotation: -12 }),
      rect(-200, 1110, 1500, 90, '#F4F1E8', { rotation: -12 }),
      rect(-200, 420, 1500, 40, '#F4F1E8', { rotation: -12 }),
      T('OPEN', 54, 90, 900, { font: A, size: 300, lh: 0.88, ls: -8, color: '#0B0B0B' }),
      T('TRYOUTS', 40, 620, 1100, { font: A, size: 250, lh: 0.9, ls: -8, color: '#F4F1E8', rotation: -12 }),
      T('NO CUTS ON DAY ONE.', 120, 1002, 900, { font: BC, size: 64, weight: 800, italic: true, upper: true, ls: 30, color: '#FF4A1C', rotation: -12, lh: 1 }),
      T('Saturday 11 January', 60, 1300, 960, { font: A, size: 110, lh: 1, color: '#0B0B0B' }),
      T('10:00 to 13:00  /  Pier Road pitches\nBoots, shin pads and a bottle of water', 60, 1430, 960, { font: OS, size: 34, weight: 500, upper: true, ls: 60, lh: 1.4, color: '#0B0B0B' }),
      rect(60, 1660, 960, 130, '#0B0B0B'),
      T('REGISTER AT HARBOURFC.EXAMPLE/TRY', 60, 1698, 960, { font: OS, size: 32, weight: 600, ls: 120, color: '#F4F1E8', align: 'center', lh: 1.2 }),
    ])],
  }),

  // 11 -----------------------------------------------------------------
  tpl({
    id: 'sports-match-ticket', name: 'Match ticket', format: 'postcard', category: 'Event',
    tags: ['ticket', 'admit one', 'seat', 'stub'],
    pages: [page('#0B0B0B', [
      rect(14, 14, 531, 369, '#F4F1E8', { radius: 14 }),
      rect(14, 14, 120, 369, '#FF6A13', { radius: 14 }),
      rect(100, 14, 34, 369, '#FF6A13'),
      L(134, 14, 134, 383, '#0B0B0B', 3, { dash: 'dash' }),
      circle(116, -6, 36, '#0B0B0B'), circle(116, 367, 36, '#0B0B0B'),
      T('ADMIT ONE', -108, 180, 340, { font: A, size: 54, lh: 1, color: '#0B0B0B', rotation: 270, align: 'center', ls: 20 }),
      lab('Division two  /  Round 21', 156, 34, 360, '#0B0B0B', 11),
      T('HARBOUR', 152, 52, 380, { font: A, size: 78, lh: 0.95, ls: -2, color: '#0B0B0B' }),
      T('v NORTHGATE', 152, 126, 380, { font: BC, size: 40, weight: 800, italic: true, upper: true, ls: 20, color: '#FF6A13', lh: 1 }),
      L(152, 186, 528, 186, '#0B0B0B', 2),
      ...[['Date', '14.12'], ['Kick off', '16:15'], ['Gate', 'N2']].flatMap(([k, v], i) => [
        lab(k, 152 + i * 128, 198, 120, '#0B0B0B', 10), T(v, 152 + i * 128, 214, 120, { font: A, size: 48, lh: 1, color: '#0B0B0B' }),
      ]),
      ...[['Block', 'C'], ['Row', '12'], ['Seat', '27']].flatMap(([k, v], i) => [
        lab(k, 152 + i * 70, 290, 70, '#0B0B0B', 10), T(v, 152 + i * 70, 306, 70, { font: A, size: 52, lh: 1, color: '#F2381C' }),
      ]),
      qr('HFC-2025-R21-C12-27', 436, 288, 92, '#0B0B0B', '#F4F1E8'),
    ])],
  }),

  // 12 -----------------------------------------------------------------
  tpl({
    id: 'sports-season-cover', name: 'Season launch cover', format: 'cover', category: 'Cover',
    tags: ['cover', 'season', 'kit', 'banner'],
    pages: [page('#0F1A44', [
      ...stripes(1120, 0, 520, 624, 6, ['#FF6A13', '#0F1A44']),
      path('M1120 0 L1190 0 L990 624 L920 624 Z', 0, 0, 1640, 624, '#F4F1E8', { w0: 1640, h0: 624 }),
      T('SEASON', 40, 0, 1000, { font: A, size: 300, lh: 0.9, ls: -12, color: '#F4F1E8' }),
      T('25/26', 40, 340, 700, { font: A, size: 210, lh: 0.9, ls: -6, color: '#FF6A13' }),
      T('Kit launch\n6 January', 690, 392, 300, { font: BC, size: 56, weight: 800, italic: true, upper: true, ls: 20, lh: 1, color: '#F4F1E8' }),
      lab('Clubhouse  /  19:00', 690, 520, 300, '#FF6A13', 18, { weight: 600 }),
    ])],
  }),
];
