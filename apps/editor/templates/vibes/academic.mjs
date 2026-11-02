import { tpl, page, T, S, rect, circle, path, L, img, frame, overlay, svg, qr, solid, linear, radial, pattern, imageFill, stroke } from '../kit.mjs';

const INK = '#16161A';
const RED = '#D9381E';
const BLUE = '#1F3DFF';
const CREAM = '#F0EADC';

const ring = (cx, cy, r, color, w = 1.5, p = {}) => S('ellipse', cx - r, cy - r, 2 * r, 2 * r, 'transparent', { stroke: stroke(color, w), ...p });
const dot = (cx, cy, d, color, p = {}) => circle(cx - d / 2, cy - d / 2, d, color, p);
const polar = (cx, cy, r, deg) => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)];

// Orbit diagram: rings, a tilted ellipse, planets with leader lines and labels.
function orbits() {
  const cx = 561, cy = 640;
  const out = [];
  const planets = [['Mercury', 90, -40, 'left'], ['Venus', 160, 130, 'right'], ['Earth', 240, 215, 'left'], ['Mars', 320, -25, 'right'], ['Jupiter', 400, 60, 'right'], ['Saturn', 460, 250, 'left']];
  planets.forEach(([n, r, a]) => out.push(ring(cx, cy, r, INK, 1.2)));
  out.push(S('ellipse', cx - 500, cy - 150, 1000, 300, 'transparent', { stroke: stroke(INK, 1, 'dash'), rotation: -24 }));
  out.push(L(cx - 500, cy, cx + 500, cy, INK, 1, { dash: 'dot' }), L(cx, cy - 500, cx, cy + 500, INK, 1, { dash: 'dot' }));
  out.push(dot(cx, cy, 44, RED));
  planets.forEach(([n, r, a, side], i) => {
    const [px, py] = polar(cx, cy, r, a);
    out.push(dot(px, py, 14 + i * 2, INK));
    out.push(T(n.toUpperCase(), px + 14, py - 22, 140, { font: 'IBM Plex Mono', size: 13, weight: 500, ls: 120, color: INK }));
  });
  return out;
}

// Concept map nodes and edges.
const NODES = [[240, 220, 'Intent'], [470, 150, 'Tools'], [720, 250, 'Rules'], [330, 430, 'Habit'], [580, 400, 'Objects'], [180, 620, 'Craft'], [440, 640, 'Systems'], [700, 600, 'Power'], [310, 850, 'Care'], [560, 830, 'Repair'], [260, 1040, 'Time'], [520, 1060, 'Use'], [720, 960, 'Waste'], [420, 1230, 'Memory'], [660, 1200, 'Place']];
const EDGES = [[0, 1], [1, 2], [0, 3], [1, 4], [2, 4], [3, 4], [3, 5], [3, 6], [4, 6], [4, 7], [2, 7], [5, 8], [6, 8], [6, 9], [7, 9], [8, 10], [9, 11], [9, 12], [10, 11], [11, 12], [10, 13], [11, 13], [12, 14], [13, 14]];

// A cluster of cells: white circles joined into a blob, blue and red organelles inside.
function cells() {
  const pts = [[290, 330], [420, 280], [520, 380], [400, 450], [300, 520], [420, 620], [560, 560], [690, 520], [770, 640], [650, 740], [520, 780], [400, 860], [520, 960], [660, 920], [790, 880], [700, 1040]];
  const out = [];
  pts.forEach(([x, y]) => out.push(dot(x, y, 190, '#FFFFFF')));
  pts.forEach(([x, y], i) => {
    out.push(dot(x - 22 + (i % 3) * 8, y + 8, 84, '#2F5BFF', { blend: 'normal' }));
    out.push(dot(x + 28, y - 18 + (i % 2) * 16, 70, '#F03A2E', { blend: 'multiply' }));
    out.push(dot(x + 4, y + 2, 24 + (i % 3) * 4, '#0B0B0D'));
  });
  return out;
}

function bars(x, y, w, h, vals, color, labels) {
  const out = [];
  const max = Math.max(...vals);
  const bw = w / vals.length;
  [0, 0.25, 0.5, 0.75, 1].forEach((f) => {
    out.push(L(x, y + h - f * h, x + w, y + h - f * h, INK, 0.8, { opacity: 0.35 }));
    out.push(T(String(Math.round(max * 1.1 * f)), x - 70, y + h - f * h - 12, 56, { font: 'IBM Plex Mono', size: 20, align: 'right', color: INK }));
  });
  vals.forEach((v, i) => {
    const bh = (v / (max * 1.1)) * h;
    out.push(rect(x + i * bw + bw * 0.18, y + h - bh, bw * 0.64, bh, i === vals.indexOf(max) ? RED : color));
    out.push(T(labels[i], x + i * bw, y + h + 14, bw, { font: 'IBM Plex Mono', size: 20, align: 'center', color: INK }));
  });
  out.push(L(x, y + h, x + w, y + h, INK, 2));
  return out;
}

export default [
  tpl({
    id: 'academic-orbit-lecture', name: 'Lecture poster, orbits', format: 'poster', category: 'Event',
    tags: ['lecture', 'diagram', 'science', 'public talk'],
    pages: [page(CREAM, [
      T('PUBLIC LECTURE SERIES  /  NO. 4', 40, 40, 700, { font: 'IBM Plex Mono', size: 15, weight: 500, ls: 160, color: INK }),
      T('Planetarium Hall', 700, 40, 383, { font: 'IBM Plex Mono', size: 15, weight: 500, ls: 160, align: 'right', color: INK }),
      L(40, 74, 1083, 74, INK, 2),
      ...orbits(),
      T('Fig. 1  Mean orbital radii. Not to scale; the Sun is much smaller than shown.', 40, 1170, 1000, { font: 'IBM Plex Mono', size: 14, lh: 1.4, color: INK }),
      L(40, 1215, 1083, 1215, INK, 2),
      T('The Slow\nSolar System', 40, 1235, 760, { font: 'Newsreader', size: 112, weight: 500, lh: 0.95, ls: -30, color: INK }),
      T('Thursday 12 March\n19:00', 800, 1250, 283, { font: 'IBM Plex Sans', size: 24, weight: 500, lh: 1.3, color: INK }),
      T('Dr. Ines Forsberg on why the planets keep their distance. Free, no booking.', 800, 1340, 283, { font: 'IBM Plex Sans', size: 17, weight: 400, lh: 1.4, color: INK }),
      T('1', 1050, 1480, 33, { font: 'IBM Plex Mono', size: 12, align: 'right', color: RED }),
      T('1  Seats are first come, first served.', 40, 1530, 500, { font: 'IBM Plex Mono', size: 12, color: INK }),
      overlay('tex/paper-fibre.jpg', 1123, 1587, 'multiply', 0.4),
    ])],
  }),
  tpl({
    id: 'academic-systems-map', name: 'Concept map poster', format: 'poster', category: 'Event',
    tags: ['map', 'diagram', 'symposium', 'blue'],
    pages: [page('#FFFFFF', [
      ...EDGES.map(([a, b]) => L(NODES[a][0], NODES[a][1], NODES[b][0], NODES[b][1], BLUE, 1)),
      ...NODES.flatMap(([x, y, n], i) => [dot(x, y, i % 4 === 0 ? 22 : 12, BLUE), T(n, x + 16, y - 11, 140, { font: 'Space Grotesk', size: 22, weight: 500, color: BLUE })]),
      T('Maps of\nUncertainty', 330, 580, 1300, { font: 'Space Grotesk', size: 150, weight: 700, lh: 0.95, ls: -50, color: BLUE, rotation: 90 }),
      T('A one day symposium on drawing what we do not know.', 40, 40, 360, { font: 'Space Grotesk', size: 26, weight: 500, lh: 1.2, color: BLUE }),
      L(40, 1400, 860, 1400, BLUE, 1),
      T('Saturday 4 October\nStudio Hall B', 40, 1420, 360, { font: 'Space Grotesk', size: 22, weight: 500, lh: 1.3, color: BLUE }),
      T('Nine speakers, three workshops, one very large piece of paper.', 420, 1420, 360, { font: 'Space Grotesk', size: 18, weight: 400, lh: 1.35, color: BLUE }),
    ])],
  }),
  tpl({
    id: 'academic-cell-conference', name: 'Conference poster, cells', format: 'poster', category: 'Event',
    tags: ['conference', 'biology', 'cells', 'dark'],
    pages: [page('#0B0B0D', [
      ...cells(),
      T('International\nConference on\nSingle Cell Biology', 40, 40, 440, { font: 'IBM Plex Sans', size: 22, weight: 500, lh: 1.3, color: '#FFFFFF' }),
      T('Harbour Institute\nof Technology', 640, 40, 440, { font: 'IBM Plex Sans', size: 22, weight: 500, lh: 1.3, color: '#FFFFFF' }),
      T('October 9 to 11', 640, 120, 440, { font: 'IBM Plex Sans', size: 22, weight: 500, color: '#FFFFFF' }),
      T('One cell,\nthen the next.', 40, 1340, 900, { font: 'IBM Plex Sans', size: 100, weight: 300, lh: 0.98, ls: -30, color: '#FFFFFF' }),
      T('Fig. 1  Sixteen cells from a cultured sample, two stains', 40, 1550, 700, { font: 'IBM Plex Mono', size: 13, color: '#FFFFFF', opacity: 0.7 }),
    ])],
  }),
  tpl({
    id: 'academic-research-deck', name: 'Research talk deck', format: 'slide', category: 'Presentation',
    tags: ['deck', 'research', 'chart', 'footnotes'],
    pages: [
      page(CREAM, [
        T('Slow rivers,\nfast data', 100, 230, 1000, { font: 'Newsreader', size: 170, weight: 500, lh: 0.95, ls: -40, color: INK }),
        T('Measuring flow in small catchments with cheap sensors', 100, 640, 800, { font: 'IBM Plex Sans', size: 38, weight: 400, lh: 1.25, color: INK }),
        T('Department of Hydrology  /  Spring colloquium', 100, 950, 900, { font: 'IBM Plex Mono', size: 22, weight: 500, ls: 100, upper: true, color: INK }),
        L(100, 190, 820, 190, INK, 3),
        svg('<svg viewBox="0 0 400 700"><g fill="none" stroke-width="2.5"><path d="M0 420 C60 330 120 510 200 400 S340 300 400 380" stroke="#16161A"/><path d="M0 460 C60 370 120 550 200 440 S340 340 400 420" stroke="#D9381E"/><path d="M0 500 C60 410 120 590 200 480 S340 380 400 460" stroke="#16161A"/><path d="M0 540 C60 450 120 630 200 520 S340 420 400 500" stroke="#16161A" stroke-dasharray="4 6"/></g></svg>', 1240, 190, 580, 700),
        T('Fig. 0', 1240, 900, 300, { font: 'IBM Plex Mono', size: 18, color: INK }),
      ]),
      page('#FFFFFF', [
        T('Results', 100, 70, 500, { font: 'IBM Plex Mono', size: 22, weight: 500, ls: 200, upper: true, color: RED }),
        T('Flow doubled where the bank was cut.', 100, 120, 1100, { font: 'Newsreader', size: 84, weight: 500, lh: 1, ls: -30, color: INK }),
        ...bars(220, 370, 1000, 480, [12, 14, 13, 31, 29, 15], '#16161A', ['A', 'B', 'C', 'D', 'E', 'F']),
        T('Figure 2.  Mean peak flow per site, litres per second.', 220, 940, 1000, { font: 'IBM Plex Mono', size: 20, color: INK }),
        T('Sites D and E, where the bank was cut back¹, show peak flow well above the rest.', 1340, 380, 480, { font: 'Newsreader', size: 36, weight: 400, lh: 1.25, color: INK }),
        L(1340, 960, 1820, 960, INK, 1),
        T('¹ Cut in March, before the spring melt.', 1340, 975, 480, { font: 'IBM Plex Sans', size: 18, color: INK }),
      ]),
      page(CREAM, [
        T('Three findings', 100, 70, 900, { font: 'Newsreader', size: 100, weight: 500, ls: -30, color: INK }),
        ...[['1', 'The cheap sensor agrees with the expensive one within four percent.'], ['2', 'Cut banks double peak flow but not total volume.'], ['3', 'Two seasons of data is enough to see it. One is not.']].flatMap(([n, t], i) => [
          L(100 + i * 600, 330, 640 + i * 600, 330, INK, 2),
          T(n, 100 + i * 600, 350, 400, { font: 'Newsreader', size: 420, weight: 300, lh: 1, color: i === 1 ? RED : INK }),
          T(t, 100 + i * 600, 850, 480, { font: 'Newsreader', size: 40, weight: 400, lh: 1.25, color: INK }),
        ]),
      ]),
      page('#FFFFFF', [
        T('References', 100, 70, 900, { font: 'Newsreader', size: 100, weight: 500, ls: -30, color: INK }),
        ...['Alm, K. and Ruiz, P. (2023). Low cost flow sensing in headwater streams. Journal of Applied Hydrology, 41(2), 112 to 130.', 'Berg, T. (2021). Bank morphology and the shape of the flood pulse. Earth Surface Letters, 9, 44 to 59.', 'Okafor, N. et al. (2024). Two seasons is the minimum. Methods in Field Science, 6(1), 3 to 17.', 'Lund, S. (2019). A field guide to cheap electronics near water. Mossa Press.'].flatMap((t, i) => [
          T(`[${i + 1}]`, 100, 280 + i * 170, 100, { font: 'IBM Plex Mono', size: 24, weight: 500, color: RED }),
          T(t, 220, 276 + i * 170, 1300, { font: 'Newsreader', size: 34, weight: 400, lh: 1.25, color: INK }),
        ]),
        T('Thank you.  Questions to ines@hydrology.example', 100, 980, 1400, { font: 'IBM Plex Mono', size: 22, ls: 60, color: INK }),
      ]),
    ],
  }),
  tpl({
    id: 'academic-syllabus', name: 'Course syllabus', format: 'a4', category: 'Education',
    tags: ['syllabus', 'course', 'handout', 'two pages', 'table'],
    pages: [
      page('#FBFAF5', [
        T('101', 20, -40, 900, { font: 'Newsreader', size: 400, weight: 300, lh: 1, ls: -60, color: INK }),
        T('Introduction to\nLooking', 40, 380, 700, { font: 'Newsreader', size: 78, weight: 500, lh: 1, ls: -30, color: INK }),
        T('A first course in how to see a painting, a building and a bad chart.', 40, 570, 520, { font: 'IBM Plex Sans', size: 20, weight: 400, lh: 1.4, color: INK }),
        L(40, 650, 754, 650, INK, 2),
        ...[['Wk', 'Topic', 'Reading'], ['1', 'Frames and edges', 'Ch. 1'], ['2', 'Light', 'Ch. 2, 3'], ['3', 'Scale', 'Essay A'], ['4', 'Surface', 'Ch. 4'], ['5', 'Reading a chart', 'Ch. 5'], ['6', 'Reviews', 'None'], ['7', 'Final project', 'None']].flatMap(([a, b, c], i) => [
          T(a, 40, 668 + i * 46, 60, { font: 'IBM Plex Mono', size: 15, weight: i ? 400 : 700, color: i ? INK : RED }),
          T(b, 120, 668 + i * 46, 420, { font: 'IBM Plex Sans', size: 19, weight: i ? 400 : 700, color: INK }),
          T(c, 600, 668 + i * 46, 154, { font: 'IBM Plex Mono', size: 15, weight: i ? 400 : 700, align: 'right', color: i ? INK : RED }),
          L(40, 700 + i * 46, 754, 700 + i * 46, INK, i ? 0.6 : 1.5, { opacity: i ? 0.4 : 1 }),
        ]),
        T('Autumn term  /  Tuesdays 10:00 to 12:00  /  Room 214  /  Dr. M. Sjoberg¹', 40, 1060, 714, { font: 'IBM Plex Mono', size: 13, ls: 40, color: INK }),
        T('¹ Office hours Thursday 14:00', 40, 1088, 714, { font: 'IBM Plex Sans', size: 12, color: INK }),
      ]),
      page('#FBFAF5', [
        T('Reading list', 40, 40, 700, { font: 'Newsreader', size: 66, weight: 500, ls: -30, color: INK }),
        L(40, 130, 754, 130, INK, 2),
        T('Required', 40, 150, 300, { font: 'IBM Plex Mono', size: 14, weight: 700, ls: 200, upper: true, color: RED }),
        ...['Berger, J. Ways of Seeing. Penguin, 1972.', 'Tufte, E. The Visual Display of Quantitative Information. Graphics Press, 1983.', 'Sontag, S. On Photography, chapter one. 1977.', 'Albers, J. Interaction of Color. Yale, 1963.'].flatMap((t, i) => [
          T(`${i + 1}`, 40, 190 + i * 90, 40, { font: 'Newsreader', size: 46, weight: 300, color: INK }),
          T(t, 110, 196 + i * 90, 600, { font: 'Newsreader', size: 22, weight: 400, lh: 1.3, color: INK }),
        ]),
        L(40, 580, 754, 580, INK, 1),
        T('Figure 1', 40, 600, 300, { font: 'IBM Plex Mono', size: 14, weight: 700, ls: 200, upper: true, color: RED }),
        ...[0, 1, 2, 3, 4, 5].map((i) => rect(40 + i * 118, 640 + (i % 3) * 20, 100, 200 - (i % 3) * 20, INK, { opacity: 0.12 + i * 0.14 })),
        T('Figure 1.  Six greys, one for each week of the first half term.', 40, 870, 700, { font: 'IBM Plex Mono', size: 13, color: INK }),
        L(40, 1030, 300, 1030, INK, 1),
        T('² Optional texts are on the library shelf marked 101.', 40, 1042, 700, { font: 'IBM Plex Sans', size: 12, color: INK }),
      ]),
    ],
  }),
  tpl({
    id: 'academic-museum-plate', name: 'Museum plate poster', format: 'poster', category: 'Event',
    tags: ['museum', 'exhibition', 'specimen', 'engraving'],
    pages: [page('#EBE4D1', [
      rect(40, 40, 1043, 1507, 'transparent', { stroke: stroke(INK, 2) }),
      rect(54, 54, 1015, 1479, 'transparent', { stroke: stroke(INK, 0.8) }),
      T('PLATE', 80, 84, 200, { font: 'IBM Plex Mono', size: 14, weight: 500, ls: 300, color: INK }),
      T('XII', 80, 108, 200, { font: 'Newsreader', size: 70, weight: 400, ls: -10, lh: 1, color: RED }),
      T('Coleoptera  /  Lucanidae', 620, 90, 380, { font: 'IBM Plex Mono', size: 14, weight: 500, ls: 200, align: 'right', color: INK }),
      T('Collected 1887, oak woodland', 620, 114, 380, { font: 'IBM Plex Mono', size: 14, ls: 100, align: 'right', color: INK }),
      img('art/academic-beetle-engraving.jpg', 150, 230, 823, 823, { blend: 'multiply' }),
      L(438, 335, 200, 330, INK, 0.8, { start: 'circle' }), T('Mandibles', 80, 312, 120, { font: 'IBM Plex Mono', size: 13, ls: 100, color: INK }),
      L(818, 364, 940, 330, INK, 0.8, { start: 'circle' }), T('Antenna', 940, 312, 120, { font: 'IBM Plex Mono', size: 13, ls: 100, color: INK }),
      L(530, 744, 230, 712, INK, 0.8, { start: 'circle' }), T('Elytra', 100, 694, 120, { font: 'IBM Plex Mono', size: 13, ls: 100, align: 'right', color: INK }),
      L(793, 836, 960, 1000, INK, 0.8, { start: 'circle' }), T('Tarsus', 962, 1000, 100, { font: 'IBM Plex Mono', size: 13, ls: 100, color: INK }),
      L(150, 1090, 450, 1090, INK, 2), L(150, 1080, 150, 1100, INK, 2), L(450, 1080, 450, 1100, INK, 2), L(300, 1084, 300, 1096, INK, 1),
      T('5 cm', 470, 1080, 100, { font: 'IBM Plex Mono', size: 13, ls: 100, color: INK }),
      L(80, 1140, 1043, 1140, INK, 2),
      T('The Stag\nBeetle', 80, 1170, 700, { font: 'Newsreader', size: 150, weight: 500, lh: 0.92, ls: -40, color: INK }),
      T('New gallery, ground floor.\nOpen daily 10 to 17.', 740, 1186, 303, { font: 'IBM Plex Sans', size: 22, weight: 500, lh: 1.3, color: INK }),
      T('A hundred and forty specimens from the museum drawers, shown to the public for the first time.', 740, 1290, 303, { font: 'IBM Plex Sans', size: 16, lh: 1.4, color: INK }),
      T('Museum of Natural Collections', 80, 1488, 700, { font: 'IBM Plex Mono', size: 14, weight: 500, ls: 200, upper: true, color: INK }),
      overlay('tex/paper-fibre.jpg', 1123, 1587, 'multiply', 0.5),
    ])],
  }),
];
