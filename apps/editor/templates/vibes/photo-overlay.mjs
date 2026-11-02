import { tpl, page, T, S, rect, circle, path, L, img, frame, overlay, svg, qr, solid, linear, radial, pattern, imageFill, stroke } from '../kit.mjs';

const ACID = '#E6FF3B';

export default [
  tpl({
    id: 'photo-run-club-carousel', name: 'Run club carousel', format: 'post', category: 'Social',
    tags: ['carousel', 'sport', 'club', 'stacked type'],
    pages: [
      page('#111111', [
        img('photos/runner-track.jpg', 0, 0, 1080, 1350, { filters: { contrast: 18, saturation: 10, grain: 14 } }),
        T('RUN\nCLUB', 50, 40, 1000, { font: 'Anton', size: 420, ls: -10, lh: 0.84, color: ACID }),
        T('Sundays, 9:00', 50, 1190, 600, { font: 'Archivo', size: 44, weight: 800, ls: -10, color: '#FFFFFF' }),
        T('All paces. Bring water.', 50, 1246, 600, { font: 'Archivo', size: 26, weight: 500, color: '#FFFFFF' }),
        T('1 / 3', 880, 1250, 150, { font: 'Archivo', size: 24, weight: 700, align: 'right', color: '#FFFFFF' }),
      ]),
      page(ACID, [
        T('The plan', 50, 50, 500, { font: 'Archivo', size: 34, weight: 800, color: '#111111' }),
        T('2 / 3', 880, 54, 150, { font: 'Archivo', size: 24, weight: 700, align: 'right', color: '#111111' }),
        ...[['5K', 'Easy loop along the water'], ['8K', 'The hill, twice'], ['12K', 'Long and slow, then coffee']].flatMap(([a, b], i) => [
          L(50, 160 + i * 380, 1030, 160 + i * 380, '#111111', 4),
          T(a, 50, 170 + i * 380, 700, { font: 'Anton', size: 330, ls: -10, lh: 1, color: '#111111' }),
          T(b, 600, 300 + i * 380, 430, { font: 'Archivo', size: 36, weight: 700, lh: 1.15, ls: -10, color: '#111111' }),
        ]),
      ]),
      page('#111111', [
        img('photos/runner.jpg', 0, 0, 1080, 1350, { filters: { duotone: ['#0A0A0A', '#E6FF3B'], contrast: 20, grain: 20 } }),
        T('Show up\nonce.', 50, 850, 1000, { font: 'Anton', size: 230, ls: -10, lh: 0.88, color: '#FFFFFF' }),
        T('3 / 3', 880, 54, 150, { font: 'Archivo', size: 24, weight: 700, align: 'right', color: '#111111' }),
        T('Meet at the east gate of the park', 50, 1290, 980, { font: 'Archivo', size: 26, weight: 700, ls: 100, upper: true, color: '#FFFFFF' }),
      ]),
    ],
  }),
  tpl({
    id: 'photo-blue-signal', name: 'Blue duotone poster', format: 'poster', category: 'Event',
    tags: ['duotone', 'music', 'poster', 'blue'],
    pages: [page('#0A1FFF', [
      img('photos/crowd-gig.jpg', 0, 0, 1123, 1587, { filters: { duotone: ['#0716C9', '#C9D6FF'], contrast: 25, grain: 30 } }),
      overlay('tex/halftone-dots.jpg', 1123, 1587, 'multiply', 0.22),
      T('SIGNAL', 40, 44, 1043, { font: 'Space Grotesk', size: 56, weight: 500, ls: 400, color: '#FFFFFF' }),
      T('07 / 2026', 700, 54, 383, { font: 'Space Grotesk', size: 22, weight: 500, ls: 200, align: 'right', color: '#FFFFFF' }),
      T('Where the music\ngoes after midnight', 40, 1260, 760, { font: 'Space Grotesk', size: 60, weight: 500, lh: 1.05, ls: -20, color: '#FFFFFF' }),
      T('Live sets in three rooms.\nSaturday 14 June, 22:00 to 05:00.\nHarbour Hall, Gate 4.', 760, 1264, 323, { font: 'Space Grotesk', size: 20, weight: 400, lh: 1.4, color: '#FFFFFF' }),
      L(40, 1230, 1083, 1230, '#FFFFFF', 2),
    ])],
  }),
  tpl({
    id: 'photo-lake-serif', name: 'Landscape serif poster', format: 'poster', category: 'Event',
    tags: ['nature', 'volunteer', 'serif', 'landscape'],
    pages: [page('#2A3A2E', [
      img('photos/mountain-lake.jpg', 0, 0, 1123, 1587, { filters: { saturation: -10, contrast: 10, grain: 12, brightness: -6 } }),
      T('Lake Shore\nClean Up\nDay', 50, 1010, 1040, { font: 'Young Serif', size: 190, lh: 0.92, ls: -40, color: '#EEF5B8' }),
      T('SATURDAY 19 APRIL', 60, 70, 600, { font: 'Archivo', size: 30, weight: 800, ls: 200, color: '#EEF5B8' }),
      T('9:00 TO 13:00', 60, 112, 600, { font: 'Archivo', size: 30, weight: 800, ls: 200, color: '#EEF5B8' }),
      T('Meet at the boat ramp.\nGloves, bags and soup provided.', 700, 70, 363, { font: 'Archivo', size: 20, weight: 500, lh: 1.35, align: 'right', color: '#EEF5B8' }),
    ])],
  }),
  tpl({
    id: 'photo-arch-window', name: 'Window portrait poster', format: 'poster', category: 'Event',
    tags: ['portrait', 'oval', 'blue', 'gig'],
    pages: [page('#2938D6', [
      S('ellipse', 230, 140, 1000, 1120, '#F4EFE6'),
      img('photos/portrait-man-sun.jpg', 242, 152, 976, 1096, { mask: 'ellipse', filters: { contrast: 8 } }),
      T('SAT 9 MAY\n8PM TO 2AM', 40, 44, 400, { font: 'Archivo', size: 26, weight: 800, lh: 1.25, color: '#F4EFE6' }),
      T('Open air,\nLarge Lawn', 683, 44, 400, { font: 'Archivo', size: 26, weight: 800, lh: 1.25, align: 'right', color: '#F4EFE6' }),
      T('sundown', 40, 1280, 1043, { font: 'Archivo', size: 205, weight: 900, ls: -70, lh: 1, color: '#F4EFE6' }),
      T('A long evening of records, with friends and a field.', 40, 1510, 700, { font: 'Archivo', size: 22, weight: 600, color: '#F4EFE6' }),
      T('Free for everyone', 783, 1510, 300, { font: 'Archivo', size: 22, weight: 800, align: 'right', color: '#F4EFE6' }),
    ])],
  }),
  tpl({
    id: 'photo-rotated-dates', name: 'Rotated dates story', format: 'story', category: 'Social',
    tags: ['story', 'dates', 'rotated', 'coffee'],
    pages: [page('#FF4A1C', [
      T('09 10', -320, 740, 900, { font: 'Anton', size: 300, lh: 1, ls: -10, color: '#2A0F05', rotation: 270 }),
      T('NOV', 725, 300, 500, { font: 'Anton', size: 190, lh: 1, color: '#2A0F05', rotation: 90 }),
      img('photos/coffee-pour.jpg', 300, 220, 560, 1000, { filters: { contrast: 10, saturation: 8, grain: 12 } }),
      T('Two days of coffee', 300, 1300, 560, { font: 'Archivo', size: 50, weight: 900, lh: 1, ls: -30, color: '#2A0F05' }),
      T('Tastings, cuppings and the argument about milk.', 300, 1380, 560, { font: 'Archivo', size: 26, weight: 600, lh: 1.3, color: '#2A0F05' }),
      T('Roastery Row 14\nFree entry', 300, 1500, 560, { font: 'Archivo', size: 24, weight: 800, lh: 1.3, ls: 100, upper: true, color: '#2A0F05' }),
      T('BREW FEST', 300, 120, 560, { font: 'Archivo', size: 40, weight: 900, ls: 200, color: '#2A0F05' }),
    ])],
  }),
  tpl({
    id: 'photo-red-slab-film', name: 'Film night poster', format: 'poster', category: 'Event',
    tags: ['film', 'screening', 'red', 'stacked'],
    pages: [page('#140A08', [
      img('photos/dinner-table.jpg', 0, 0, 1123, 1587, { filters: { contrast: 18, saturation: -20, grain: 24, brightness: -18 } }),
      rect(60, 120, 660, 760, '#D91E18'),
      T('WE ATE\nUNTIL THE\nLAST\nTRAM', 90, 140, 620, { font: 'Anton', size: 172, lh: 0.94, ls: -10, color: '#140A08' }),
      T('A film by Greta Lind', 60, 940, 700, { font: 'Archivo', size: 26, weight: 700, ls: 140, upper: true, color: '#F3E4D3' }),
      T('Screening in the garden, 21 June', 60, 1450, 700, { font: 'Archivo', size: 32, weight: 800, ls: -10, color: '#F3E4D3' }),
      T('Blankets welcome. Candles provided.', 60, 1494, 700, { font: 'Archivo', size: 20, weight: 500, color: '#F3E4D3' }),
      T('FILM\nNIGHT', 760, 1440, 300, { font: 'Archivo', size: 30, weight: 900, lh: 1, ls: 100, align: 'right', color: '#D91E18' }),
    ])],
  }),
  tpl({
    id: 'photo-field-notes-collage', name: 'Field notes collage', format: 'square', category: 'Social',
    tags: ['collage', 'photos', 'labels', 'square'],
    pages: [page('#1F3BE0', [
      ...[['coffee-pour', 40, 170, 330, 440, -5, 'No. 1  Morning'], ['hands-clay', 400, 60, 400, 290, 3, 'No. 2  Hands'], ['market-produce', 640, 380, 380, 270, -4, 'No. 3  Market'], ['flowers-studio', 70, 700, 300, 290, 4, 'No. 4  Jar'], ['plant', 420, 680, 260, 310, -3, 'No. 5  Window']].flatMap(([f, x, y, w, h, r, c]) => [
        rect(x - 10, y - 10, w + 20, h + 56, '#F6F1E7', { rotation: r }),
        img(`photos/${f}.jpg`, x, y, w, h, { rotation: r, filters: { contrast: 8, grain: 10 } }),
        T(c, x, y + h + 8, w, { font: 'Space Mono', size: 15, weight: 400, color: '#1F3BE0', rotation: r }),
      ]),
      T('Field\nnotes', 700, 700, 340, { font: 'Archivo', size: 110, weight: 900, lh: 0.88, ls: -50, color: '#F6F1E7' }),
      T('A week of small things, collected', 700, 940, 340, { font: 'Archivo', size: 20, weight: 600, lh: 1.25, color: '#F6F1E7' }),
      T('Volume 3', 40, 40, 300, { font: 'Space Mono', size: 18, weight: 700, ls: 100, upper: true, color: '#F6F1E7' }),
    ])],
  }),
  tpl({
    id: 'photo-skate-thumb', name: 'Skate video thumbnail', format: 'thumb', category: 'YouTube',
    tags: ['thumbnail', 'video', 'skate', 'yellow'],
    pages: [page('#0E4FB8', [
      img('photos/skater.jpg', 0, -300, 1280, 1000, { filters: { contrast: 20, saturation: 20 } }),
      T('NO\nBRAKES', 40, 20, 1200, { font: 'Anton', size: 300, lh: 0.84, ls: -10, color: '#FFE600' }),
      rect(40, 600, 480, 80, '#111111', { rotation: -2 }),
      T('Day 30 at the bowl', 40, 616, 480, { font: 'Archivo', size: 36, weight: 800, align: 'center', color: '#FFFFFF', rotation: -2 }),
      S('arrow', 900, 520, 240, 120, '#FFE600', { rotation: -20 }),
    ])],
  }),
];
