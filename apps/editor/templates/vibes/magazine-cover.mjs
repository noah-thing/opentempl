import { tpl, page, T, S, rect, circle, path, L, img, frame, overlay, svg, qr, solid, linear, radial, pattern, imageFill, stroke } from '../kit.mjs';

// A little barcode: bars of varied width on white.
function barcode(x, y, w, h, ink = '#111111', bg = '#FFFFFF') {
  const out = [rect(x, y, w, h, bg)];
  let cx = x + 8;
  const widths = [2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 2, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2];
  let i = 0;
  while (cx < x + w - 10) {
    const bw = widths[i % widths.length] * (w / 90);
    if (i % 2 === 0) out.push(rect(cx, y + 8, bw, h - 28, ink));
    cx += bw + w / 90;
    i++;
  }
  out.push(T('9 771234 567003', x, y + h - 18, w, { font: 'Space Mono', size: 10, align: 'center', color: ink }));
  return out;
}

// Dense verb wall for the type only cover.
const VERBS = 'align angle annotate arrange balance bleed bind blur bold border brush build bump cast centre chop clamp clip collage colour crease crop cut dab deboss deckle dent dip distress dot drag draw dry emboss erase fade fan feather fill flip fold frame gather glue grain grid grind group hang hatch hinge ink join jumble justify kern knock knot label layer lift line link loose mark mask mend miss mount nick notch offset overlap paste patch pin plait press print pull punch rank rip roll rub scale score scrape seam shade shave shear slice smudge snip soak spot stack staple stencil stitch strike tape tear thread tint trace trim tuck twist weave wipe'.split(' ');

export default [
  tpl({
    id: 'magazine-gloss-portrait', name: 'Glossy portrait cover', format: 'a4', category: 'Magazine',
    tags: ['cover', 'portrait', 'fashion', 'masthead'],
    pages: [page('#CFC9C0', [
      img('photos/portrait-window.jpg', 0, 0, 794, 1123, { filters: { contrast: 12, grain: 18, saturation: -20, brightness: -12 } }),
      T('NORD', 0, -4, 794, { font: 'Bodoni Moda', size: 232, weight: 800, ls: -30, lh: 1, color: '#FFFFFF', align: 'center' }),
      T('THE ISSUE ABOUT STAYING IN', 40, 224, 714, { font: 'Familjen Grotesk', size: 14, weight: 700, ls: 380, align: 'center', color: '#FFFFFF' }),
      T('Winter\nlight', 40, 300, 300, { font: 'Bodoni Moda', size: 64, weight: 700, lh: 0.95, ls: -20, color: '#FFFFFF' }),
      T('How eleven people\nlearned to like the dark', 40, 430, 300, { font: 'Familjen Grotesk', size: 18, weight: 500, lh: 1.25, color: '#FFFFFF' }),
      T('INSIDE', 440, 880, 300, { font: 'Familjen Grotesk', size: 12, weight: 700, ls: 300, color: '#FFFFFF' }),
      T('Soup, a manual\nThe last cinema on the island\nWool, taken seriously\nA walk at 15:00', 440, 904, 320, { font: 'Familjen Grotesk', size: 17, weight: 500, lh: 1.45, color: '#FFFFFF' }),
      ...barcode(40, 940, 134, 110),
      T('NO. 14  /  DECEMBER  /  8 EUR', 440, 1070, 500, { font: 'Familjen Grotesk', size: 12, weight: 700, ls: 260, color: '#FFFFFF' }),
    ])],
  }),
  tpl({
    id: 'magazine-giant-letter', name: 'Giant letter cover', format: 'a4', category: 'Magazine',
    tags: ['cover', 'letter', 'photo', 'type'],
    pages: [page('#EDE7DA', [
      img('photos/city-tram.jpg', 0, 0, 794, 1123, { filters: { saturation: -30, contrast: 8, grain: 20 } }),
      T('T', -53, -45, 900, { font: 'Archivo', size: 1250, weight: 900, lh: 1, color: '#E8271C', opacity: 0.94 }),
      T('Tramline', 40, 36, 400, { font: 'Archivo', size: 30, weight: 800, ls: -10, color: '#FFFFFF' }),
      T('A QUARTERLY OF CITIES\nAT NIGHT', 40, 78, 400, { font: 'Archivo', size: 11, weight: 700, ls: 220, lh: 1.5, color: '#FFFFFF' }),
      T('Issue 09\nWinter', 640, 36, 114, { font: 'Archivo', size: 13, weight: 700, lh: 1.3, align: 'right', color: '#FFFFFF' }),
      T('Where the last\ntram goes when\nit stops', 40, 880, 460, { font: 'Archivo', size: 38, weight: 800, lh: 1, ls: -20, color: '#FFFFFF' }),
      T('Fourteen routes, one timetable nobody trusts', 40, 1034, 400, { font: 'Archivo', size: 15, weight: 500, color: '#FFFFFF' }),
    ])],
  }),
  tpl({
    id: 'magazine-sliced-portrait', name: 'Sliced portrait cover', format: 'a4', category: 'Magazine',
    tags: ['cover', 'collage', 'portrait', 'strips'],
    pages: [page('#F2EFE8', [
      ...[0, 1, 2, 3].map((i) => img('photos/portrait-man-sun.jpg', [-30, 22, -14, 30][i] - 20, 150 + i * 212, 860, 236, {
        crop: { x: 0, y: 0.14 + i * 0.185, w: 1, h: 0.2 },
        rotation: [-1.2, 0.8, -0.6, 1][i],
        filters: { contrast: 14, grain: 22, saturation: i === 1 ? -100 : 0 },
      })),
      T('SPLIT', -14, -10, 840, { font: 'Anton', size: 330, weight: 400, ls: -20, lh: 1, color: '#FF5A1F' }),
      T('Not another profile of a man in a field', 40, 1060, 560, { font: 'Archivo', size: 20, weight: 800, ls: -10, color: '#111111' }),
      T('VOL. 116', 640, 1064, 114, { font: 'Space Mono', size: 14, weight: 700, align: 'right', color: '#111111' }),
      rect(40, 330, 190, 40, '#111111', { rotation: -3 }),
      T('The long interview', 40, 339, 190, { font: 'Archivo', size: 15, weight: 800, align: 'center', color: '#FFFFFF', rotation: -3 }),
    ])],
  }),
  tpl({
    id: 'magazine-science-journal', name: 'Science journal cover', format: 'a4', category: 'Magazine',
    tags: ['journal', 'science', 'cover', 'serif'],
    pages: [page('#F4F1EA', [
      T('Observer', 40, 20, 714, { font: 'Newsreader', size: 150, weight: 600, ls: -40, lh: 1, color: '#111111', align: 'center' }),
      L(40, 196, 754, 196, '#111111', 2),
      T('THE INTERNATIONAL WEEKLY JOURNAL OF FIELD SCIENCE', 40, 204, 714, { font: 'Familjen Grotesk', size: 11, weight: 600, ls: 200, align: 'center', color: '#111111' }),
      circle(147, 250, 500, '#111111'),
      img('photos/flowers-studio.jpg', 157, 260, 480, 480, { mask: 'ellipse', filters: { saturation: -100, contrast: 55, grain: 30, brightness: 8 } }),
      circle(520, 590, 170, '#F0541E', { blend: 'multiply', opacity: 0.9 }),
      T('Wild flowers\nand the soil that\nkeeps them', 40, 770, 460, { font: 'Newsreader', size: 44, weight: 500, lh: 1.02, ls: -10, color: '#111111' }),
      T('Page 214', 40, 922, 200, { font: 'Familjen Grotesk', size: 13, weight: 700, color: '#F0541E' }),
      ...[['MEADOWS', 'Why mown lawns lose\nforty species a year'], ['SEED BANKS', 'Counting what sleeps\nunderneath'], ['METHOD', 'A cheap way to\nmeasure pollen']].flatMap(([a, b], i) => [
        rect(40 + i * 242, 960, 230, 4, '#111111'),
        T(a, 40 + i * 242, 974, 230, { font: 'Familjen Grotesk', size: 11, weight: 700, ls: 260, color: '#F0541E' }),
        T(b, 40 + i * 242, 996, 230, { font: 'Newsreader', size: 17, weight: 500, lh: 1.2, color: '#111111' }),
      ]),
      T('Vol. 204  No. 4  June', 560, 790, 194, { font: 'Familjen Grotesk', size: 12, weight: 600, ls: 80, align: 'right', color: '#111111' }),
    ])],
  }),
  tpl({
    id: 'magazine-verb-wall', name: 'Type only cover', format: 'a4', category: 'Magazine',
    tags: ['cover', 'typographic', 'list', 'indie'],
    pages: [page('#EFEADF', [
      ...[0, 1, 2].map((c) => T(VERBS.slice(c * 29, c * 29 + 29).join('\n').toUpperCase(), 30 + c * 248, 30, 240, { font: 'Sofia Sans Extra Condensed', size: 25, weight: 900, lh: 0.96, ls: 0, color: '#111111', opacity: 0.9 })),
      rect(0, 740, 794, 383, '#EFEADF'),
      T('Verbs', 30, 730, 740, { font: 'Archivo', size: 250, weight: 900, ls: -80, lh: 1, color: '#2A3BFF' }),
      T('A quarterly of things you do to paper', 30, 990, 560, { font: 'Archivo', size: 26, weight: 800, lh: 1.1, ls: -10, color: '#111111' }),
      T('Issue 07 / Spring\nPrinted on one sheet', 574, 992, 190, { font: 'Space Mono', size: 12, lh: 1.5, align: 'right', color: '#111111' }),
      rect(30, 1066, 734, 3, '#111111'),
    ])],
  }),
  tpl({
    id: 'magazine-hand-lettered', name: 'Hand lettered cover', format: 'pin', category: 'Magazine',
    tags: ['cover', 'marker', 'craft', 'lettering'],
    pages: [page('#E4E5E6', [
      T('Atelier*', 40, 36, 500, { font: 'Archivo', size: 76, weight: 800, ls: -40, color: '#111111' }),
      T('THE INTERNATIONAL DESIGN MAGAZINE', 40, 128, 500, { font: 'Archivo', size: 10, weight: 700, ls: 200, color: '#111111' }),
      T('MARCH 2026', 760, 52, 200, { font: 'Archivo', size: 13, weight: 700, ls: 160, align: 'right', color: '#111111' }),
      T('HAND\nMADE', 10, 220, 990, { font: 'Permanent Marker', size: 292, ls: -20, lh: 0.88, color: '#1D2E9E' }),
      img('photos/hands-clay.jpg', 380, 860, 580, 420, { mask: 'ellipse', filters: { contrast: 10, saturation: -10 } }),
      T('In praise of the thumbprint', 40, 1290, 330, { font: 'Archivo', size: 36, weight: 800, lh: 1.02, ls: -20, color: '#111111' }),
      T('Nine potters, one kiln, and a week of mistakes that stayed in.', 40, 1380, 330, { font: 'Archivo', size: 18, weight: 500, lh: 1.3, color: '#111111' }),
      
    ])],
  }),
  tpl({
    id: 'magazine-market-quarterly', name: 'Food quarterly cover', format: 'pin', category: 'Magazine',
    tags: ['cover', 'food', 'arch', 'serif'],
    pages: [page('#E0462B', [
      T('Market', 20, -10, 960, { font: 'Gloock', size: 300, weight: 400, ls: -40, lh: 1, color: '#FBEFD9', align: 'center' }),
      T('A QUARTERLY OF WHAT IS IN SEASON', 40, 300, 920, { font: 'Familjen Grotesk', size: 15, weight: 700, ls: 340, align: 'center', color: '#FBEFD9' }),
      S('arch', 300, 380, 660, 960, '#FBEFD9'),
      img('photos/market-produce.jpg', 312, 392, 636, 936, { mask: 'arch', filters: { saturation: 12, contrast: 8 } }),
      T('Cucumbers,\nforgiven', 40, 880, 250, { font: 'Gloock', size: 42, weight: 400, lh: 0.96, color: '#FBEFD9' }),
      T('Ten recipes for\nthe vegetable\nno one chose', 40, 990, 250, { font: 'Familjen Grotesk', size: 22, weight: 500, lh: 1.25, color: '#FBEFD9' }),
      T('Summer\nissue', 40, 400, 260, { font: 'Gloock', size: 48, weight: 400, lh: 0.96, color: '#FBEFD9' }),
      T('Tomato season,\nan argument', 40, 1130, 250, { font: 'Familjen Grotesk', size: 22, weight: 500, lh: 1.25, color: '#FBEFD9' }),
      T('No. 21  /  12 EUR', 40, 1430, 400, { font: 'Familjen Grotesk', size: 13, weight: 700, ls: 260, color: '#FBEFD9' }),
    ])],
  }),
  tpl({
    id: 'magazine-issue-set', name: 'Issue pages set', format: 'a4', category: 'Magazine',
    tags: ['magazine', 'contents', 'feature', 'multi page'],
    pages: [
      page('#111111', [
        img('photos/crowd-gig.jpg', 0, 0, 794, 1123, { filters: { duotone: ['#12002E', '#FF4B9A'], contrast: 15, grain: 30 } }),
        T('LOUD', 14, 20, 780, { font: 'Anton', size: 330, ls: -10, lh: 1, color: '#FFFFFF' }),
        T('The night\nissue', 40, 890, 500, { font: 'Archivo', size: 88, weight: 900, lh: 0.88, ls: -40, color: '#FFFFFF' }),
        T('Venues that never close, promoters who never sleep', 40, 1060, 520, { font: 'Archivo', size: 16, weight: 600, color: '#FFFFFF' }),
        T('No. 31', 640, 1064, 114, { font: 'Archivo', size: 16, weight: 800, align: 'right', color: '#FFFFFF' }),
      ]),
      page('#F2EEE6', [
        T('Contents', 40, 36, 500, { font: 'Archivo', size: 76, weight: 900, ls: -40, color: '#111111' }),
        L(40, 150, 754, 150, '#111111', 3),
        ...[['06', 'The last record shop', 'A basement, a landlord and forty years of shelving'], ['14', 'Door policy', 'Who decides who gets in, and why'], ['22', 'Ten nights, ten rooms', 'A photo essay with no flash'], ['38', 'Soundcheck', 'Notes from the people who set up at four'], ['46', 'Last orders', 'The final column']].flatMap(([n, a, b], i) => [
          T(n, 40, 180 + i * 170, 200, { font: 'Anton', size: 120, lh: 1, color: i === 0 ? '#FF4B9A' : '#111111' }),
          T(a, 250, 196 + i * 170, 500, { font: 'Archivo', size: 34, weight: 800, ls: -20, color: '#111111' }),
          T(b, 250, 244 + i * 170, 440, { font: 'Archivo', size: 18, weight: 500, lh: 1.3, color: '#111111' }),
          L(40, 330 + i * 170, 754, 330 + i * 170, '#111111', 1),
        ]),
      ]),
      page('#FF4B9A', [
        T('06', -20, -190, 900, { font: 'Anton', size: 800, lh: 1, color: '#111111' }),
        img('photos/crowd-gig.jpg', 397, 700, 357, 330, { filters: { contrast: 15, grain: 20 } }),
        T('The last record shop', 40, 700, 330, { font: 'Archivo', size: 46, weight: 900, lh: 0.95, ls: -30, color: '#111111' }),
        T('Words by Elin Roth\nPhotographs by Sam Okoye', 40, 860, 330, { font: 'Archivo', size: 14, weight: 700, lh: 1.4, ls: 60, upper: true, color: '#111111' }),
        T('The shelves were built in 1983 by a man who did not believe in the compact disc. They are still straight. The landlord, who believes in nothing, has given the shop until June.', 40, 930, 330, { font: 'Archivo', size: 15, weight: 500, lh: 1.4, color: '#111111' }),
        T('Photograph: the Friday queue', 397, 1040, 357, { font: 'Archivo', size: 11, weight: 600, color: '#111111' }),
      ]),
    ],
  }),
];
