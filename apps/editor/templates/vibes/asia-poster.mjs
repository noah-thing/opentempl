import { tpl, page, T, S, rect, circle, path, L, img, frame, overlay, svg, qr, solid, linear, radial, pattern, imageFill, stroke } from '../kit.mjs';

const CJK = 'Noto Sans JP';
const W = 1123, H = 1587;


// Red dot field: a loose grid of circles in three sizes, some running off the page.
function dotField() {
  const out = [];
  const sizes = [60, 150, 260, 110, 200, 80];
  let k = 0;
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 3; c++) {
      const s = sizes[(k++ * 5 + r) % sizes.length];
      const cx = 140 + c * 330 + (r % 2) * 90, cy = 260 + r * 215;
      if (cx > 760 || (cy > 1000 && cx < 330)) continue;
      out.push(circle(cx - s / 2, cy - s / 2, s, '#E5231B'));
    }
  }
  return out;
}


// Menu rows: name left, price right, small description, dotted rule.
function menuRows(items, x, y, w, color) {
  const out = [];
  items.forEach(([n, d, p], i) => {
    const yy = y + i * 80;
    out.push(T(n, x, yy, w - 120, { font: 'Archivo', size: 28, weight: 700, ls: -10, color }));
    out.push(T(p, x + w - 100, yy, 100, { font: 'Archivo', size: 28, weight: 800, align: 'right', color }));
    out.push(T(d, x, yy + 36, w - 120, { font: 'Archivo', size: 16, weight: 400, color, opacity: 0.85 }));
    out.push(L(x, yy + 66, x + w, yy + 66, color, 1.5, { dash: 'dot', opacity: 0.6 }));
  });
  return out;
}

export default [
  tpl({
    id: 'asia-night-market', name: 'Night market poster', format: 'poster', category: 'Event',
    tags: ['market', 'festival', 'hangul', 'night'],
    pages: [page('#1F33FF', [
      T('서울\n밤의\n시장', -14, 0, 1200, { font: 'Black Han Sans', size: 540, weight: 400, lh: 0.76, ls: -60, color: '#FF3B1D' }),
      L(40, 1262, 1083, 1262, '#FFFFFF', 3),
      T('Night\nMarket', 40, 1286, 520, { font: 'Archivo', size: 118, weight: 900, lh: 0.88, ls: -50, color: '#FFFFFF' }),
      T('Friday 14 to\nSunday 16 November\n17:00 until the last bus', 600, 1294, 483, { font: 'Archivo', size: 30, weight: 600, lh: 1.2, color: '#FFFFFF' }),
      T('Forty one stalls under the viaduct. Dumplings, secondhand records, hand rolled cigarettes of paper and a stage nobody booked.', 600, 1424, 483, { font: 'Archivo', size: 18, weight: 400, lh: 1.35, color: '#FFFFFF', opacity: 0.85 }),
      T('Free entry  /  Bring cash', 600, 1520, 483, { font: 'Archivo', size: 20, weight: 700, lh: 1.25, ls: 100, upper: true, color: '#FF3B1D' }),
    ])],
  }),
  tpl({
    id: 'asia-kanji-museum', name: 'Paper exhibition poster', format: 'poster', category: 'Event',
    tags: ['exhibition', 'kanji', 'museum', 'print'],
    pages: [page('#EFEBE2', [
      T('紙', -90, -190, 1400, { font: CJK, size: 1320, weight: 900, lh: 1, color: '#111111' }),
      rect(40, 40, 120, 120, '#E63A1F'),
      T('印', 40, 52, 120, { font: CJK, size: 96, weight: 900, color: '#EFEBE2', align: 'center' }),
      T('紙\n印\n刷\n修\n復', 1020, 1210, 63, { font: CJK, size: 56, weight: 700, lh: 1.08, align: 'center', color: '#111111' }),
      L(40, 1190, 1083, 1190, '#111111', 3),
      T('Paper, Print,\nRepair', 40, 1220, 700, { font: 'Archivo', size: 104, weight: 800, ls: -40, lh: 0.92, color: '#111111' }),
      T('An exhibition about how ordinary things are made, torn and mended.', 40, 1450, 520, { font: 'Archivo', size: 24, weight: 500, lh: 1.3, color: '#111111' }),
      T('4 June to 18 July\nTuesday to Sunday\n10:00 to 18:00', 760, 1224, 250, { font: 'Archivo', size: 26, weight: 600, lh: 1.3, color: '#111111' }),
      T('Gallery 3, Old Mill Museum\nof Printing', 760, 1396, 250, { font: 'Archivo', size: 20, weight: 400, lh: 1.3, color: '#111111' }),
      overlay('tex/paper-fibre.jpg', W, H, 'multiply', 0.55),
    ])],
  }),
  tpl({
    id: 'asia-red-dots', name: 'Ceramics fair poster', format: 'poster', category: 'Event',
    tags: ['fair', 'ceramics', 'dots', 'japan'],
    pages: [page('#F6F2EA', [
      ...dotField(),
      T('CERAMICS', 160, 640, 1560, { font: 'Archivo', size: 262, weight: 900, ls: -50, lh: 1, color: '#111111', rotation: 90 }),
      T('陶\n器\n市', 60, 1040, 150, { font: CJK, size: 130, weight: 800, lh: 1.02, color: '#111111' }),
      T('Tokyo Ceramics\nFair', 60, 60, 480, { font: 'Archivo', size: 40, weight: 800, lh: 1.05, ls: -10, color: '#111111' }),
      T('Spring edition\n21 to 23 March', 60, 160, 400, { font: 'Archivo', size: 22, weight: 500, lh: 1.3, color: '#111111' }),
      T('Sixty kilns, one tent,\nopen fire at six', 60, 1500, 250, { font: 'Archivo', size: 18, weight: 500, lh: 1.3, color: '#111111' }),
      overlay('tex/risograph-speckle.jpg', W, H, 'multiply', 0.35),
    ])],
  }),
  tpl({
    id: 'asia-club-lineup', name: 'Club night story', format: 'story', category: 'Event',
    tags: ['club', 'lineup', 'story', 'nightlife'],
    pages: [page('#0B0B0B', [
      T('클\n럽\n나\n잇', 800, 70, 300, { font: 'Black Han Sans', size: 250, weight: 400, lh: 0.88, color: '#D6FF2E' }),
      T('Back Room\nSessions', 60, 70, 700, { font: 'Archivo', size: 70, weight: 800, lh: 0.95, ls: -20, color: '#FFFFFF' }),
      T('Volume 12', 60, 230, 400, { font: 'Archivo', size: 22, weight: 600, ls: 140, upper: true, color: '#D6FF2E' }),
      ...['Mina Oh', 'Kuro', 'Sable Ko', 'DJ Tofu', 'Hana Beat', 'Rye', 'Odd Hours'].flatMap((n, i) => [
        L(60, 420 + i * 150, 760, 420 + i * 150, '#FFFFFF', 2, { opacity: 0.4 }),
        T(n, 60, 440 + i * 150, 700, { font: 'Archivo', size: 88, weight: 900, lh: 1, ls: -40, upper: true, color: i === 0 ? '#D6FF2E' : '#FFFFFF' }),
        T(`${22 + Math.floor((i + 1) / 2)}:${i % 2 ? '30' : '00'}`, 60, 535 + i * 150, 200, { font: 'Archivo', size: 18, weight: 600, ls: 120, color: '#FFFFFF', opacity: 0.6 }),
      ]),
      rect(0, 1560, 1080, 360, '#D6FF2E'),
      T('11.22', 50, 1566, 700, { font: 'Archivo', size: 250, weight: 900, ls: -80, lh: 1, color: '#0B0B0B' }),
      T('Saturday\nDoors 22:00', 770, 1620, 270, { font: 'Archivo', size: 30, weight: 700, lh: 1.2, color: '#0B0B0B' }),
      T('Basement of the old\nrecord shop, Itaewon', 770, 1730, 270, { font: 'Archivo', size: 22, weight: 500, lh: 1.25, color: '#0B0B0B' }),
      T('18+ only. Tickets at the door.', 60, 1840, 650, { font: 'Archivo', size: 20, weight: 700, ls: 100, upper: true, color: '#0B0B0B' }),
    ])],
  }),
  tpl({
    id: 'asia-onigiri-label', name: 'Rice ball menu card', format: 'post', category: 'Food',
    tags: ['onigiri', 'cafe', 'illustration', 'japan'],
    pages: [page('#FFE27A', [
      T('ONI\nGIRI', 60, 50, 600, { font: 'Archivo', size: 230, weight: 900, lh: 0.84, ls: -60, color: '#111111' }),
      T('002', 880, 56, 150, { font: 'Archivo', size: 56, weight: 800, align: 'right', color: '#111111' }),
      img('art/asia-onigiri-ink.jpg', 250, 330, 800, 800, { blend: 'multiply' }),
      T('おにぎり', 60, 1080, 900, { font: CJK, size: 120, weight: 500, ls: -20, color: '#111111' }),
      L(60, 1245, 1020, 1245, '#111111', 3),
      T('Hand pressed every morning\nSalmon, plum, kelp, tuna', 60, 1265, 600, { font: 'Archivo', size: 24, weight: 600, lh: 1.25, color: '#111111' }),
      T('Open 7 to 15', 740, 1265, 280, { font: 'Archivo', size: 26, weight: 800, lh: 1.25, align: 'right', color: '#111111' }),
      circle(70, 520, 150, '#E8321C'),
      T('Fresh\ntoday', 70, 557, 150, { font: 'Archivo', size: 34, weight: 800, lh: 1, align: 'center', color: '#FFE27A', rotation: -12 }),
    ])],
  }),
  tpl({
    id: 'asia-pixel-city', name: 'City pop radio post', format: 'post', category: 'Social',
    tags: ['city pop', 'radio', 'skyline', 'night'],
    pages: [page('#2B2A7A', [
      img('art/asia-city-pop-skyline.jpg', 0, 0, 1080, 1350, { filters: { grain: 10 } }),
      T('都\n市\n電\n波', 940, 60, 100, { font: 'Dela Gothic One', size: 84, weight: 400, lh: 1.1, align: 'center', color: '#FFF1D6' }),
      T('CITY\nPOP FM', 50, 80, 900, { font: 'Dela Gothic One', size: 150, weight: 400, lh: 0.95, ls: -30, color: '#FFF1D6' }),
      T('Weeknights 22:00 to 02:00', 56, 420, 700, { font: 'Archivo', size: 24, weight: 700, ls: 160, upper: true, color: '#FFD9A8' }),
      T('Slow records for the last train home', 60, 1262, 700, { font: 'Archivo', size: 28, weight: 600, color: '#FFF1D6' }),
      T('88.4', 760, 1236, 260, { font: 'Archivo', size: 90, weight: 900, ls: -40, align: 'right', color: '#FFF1D6' }),
    ])],
  }),
  tpl({
    id: 'asia-long-summer', name: 'Summer school poster', format: 'poster', category: 'Event',
    tags: ['school', 'summer', 'blob', 'course'],
    pages: [page('#BEE0FF', [
      path('M52 4 C80 -2 100 22 95 48 C92 68 100 84 79 95 C58 105 32 99 15 82 C-3 65 1 38 13 22 C25 8 38 6 52 4Z', 60, 290, 1080, 1150, '#FF6A13', { w0: 100, h0: 100, rotation: -6 }),
      T('2\n0\n2\n6', 60, 60, 160, { font: 'Archivo', size: 150, weight: 900, lh: 0.8, ls: -40, color: '#14213D' }),
      T('Four weeks of drawing, printing,\nbread and bad weather for\npeople who say they are not\ncreative.', 640, 70, 430, { font: 'Archivo', size: 25, weight: 500, lh: 1.25, color: '#14213D' }),
      T('The Long\nSummer\nSchool', 130, 560, 900, { font: 'Archivo', size: 188, weight: 900, lh: 0.88, ls: -60, color: '#14213D' }),
      T('Open call', 200, 1150, 400, { font: 'Archivo', size: 26, weight: 700, ls: 140, upper: true, color: '#14213D' }),
      T('Applications close 1 May', 200, 1190, 600, { font: 'Archivo', size: 40, weight: 600, ls: -10, color: '#14213D' }),
      T('여름학교', 800, 1480, 300, { font: 'Black Han Sans', size: 54, weight: 400, align: 'right', color: '#14213D' }),
      T('Harbour Studio, Gothenburg', 60, 1500, 600, { font: 'Archivo', size: 20, weight: 600, ls: 120, upper: true, color: '#14213D' }),
    ])],
  }),
  tpl({
    id: 'asia-izakaya-menu', name: 'Izakaya menu', format: 'a4', category: 'Menu',
    tags: ['menu', 'izakaya', 'restaurant', 'two pages'],
    pages: [
      page('#E2341D', [
        T('食', 380, -170, 800, { font: CJK, size: 820, weight: 900, lh: 1, color: '#C42A15' }),
        T('Kuro\nIzakaya', 44, 40, 600, { font: 'Archivo', size: 86, weight: 900, lh: 0.9, ls: -40, color: '#FFF1DC' }),
        T('Small plates, 17:00 until late', 44, 232, 500, { font: 'Archivo', size: 17, weight: 700, ls: 140, upper: true, color: '#FFF1DC' }),
        T('居\n酒\n屋', 690, 40, 70, { font: CJK, size: 62, weight: 800, lh: 1.1, align: 'center', color: '#FFF1DC' }),
        T('Food', 44, 330, 400, { font: 'Archivo', size: 40, weight: 800, color: '#FFF1DC' }),
        ...menuRows([
          ['Edamame, sea salt', 'Warm, in the pod', '4'],
          ['Chicken skewers', 'Thigh, tare glaze, spring onion', '9'],
          ['Pickled cucumber', 'Sesame, chilli, a little vinegar', '5'],
          ['Gyoza, six', 'Pan fried, ponzu on the side', '9'],
          ['Grilled mackerel', 'Daikon, lemon, charred skin', '14'],
          ['Potato salad', 'The kind your friend’s mother makes', '7'],
          ['Pork belly bun', 'Mustard, pickled red onion', '8'],
          ['Rice, miso, pickles', 'To finish', '6'],
        ], 44, 400, 706, '#FFF1DC'),
        T('Prices in euros. Tell us about allergies before you order.', 44, 1060, 706, { font: 'Archivo', size: 14, weight: 500, color: '#FFF1DC', opacity: 0.85 }),
      ]),
      page('#FFF1DC', [
        T('飲', 380, -170, 800, { font: CJK, size: 820, weight: 900, lh: 1, color: '#F6E0C2' }),
        T('Drinks', 44, 40, 600, { font: 'Archivo', size: 86, weight: 900, lh: 0.9, ls: -40, color: '#E2341D' }),
        T('Kuro Izakaya', 44, 140, 500, { font: 'Archivo', size: 17, weight: 700, ls: 140, upper: true, color: '#1A1A1A' }),
        T('Beer and sake', 44, 330, 400, { font: 'Archivo', size: 40, weight: 800, color: '#1A1A1A' }),
        ...menuRows([
          ['Draught lager', '0.4 litre', '6'],
          ['Hoppy highball', 'Barley spirit, soda, lime', '8'],
          ['Cold sake, house', 'Dry, 120 ml', '9'],
          ['Cold sake, reserve', 'Round, a little sweet', '14'],
          ['Plum wine', 'On ice', '7'],
          ['Roasted barley tea', 'Hot or cold, free refills', '3'],
        ], 44, 400, 706, '#1A1A1A'),
        rect(44, 900, 706, 180, '#E2341D'),
        T('Set for two', 70, 922, 400, { font: 'Archivo', size: 22, weight: 700, ls: 140, upper: true, color: '#FFF1DC' }),
        T('Four plates and a carafe of sake. The kitchen picks, you argue about it.', 70, 962, 480, { font: 'Archivo', size: 22, weight: 500, lh: 1.3, color: '#FFF1DC' }),
        T('38', 560, 910, 170, { font: 'Archivo', size: 130, weight: 900, ls: -40, align: 'right', color: '#FFF1DC' }),
      ]),
    ],
  }),
  tpl({
    id: 'asia-ramen-crawl', name: 'Ramen crawl carousel', format: 'post', category: 'Social',
    tags: ['carousel', 'food', 'ramen', 'guide'],
    pages: [
      page('#E8321C', [
        T('麺', -110, -230, 1400, { font: CJK, size: 1250, weight: 900, lh: 1, color: '#FFF1DC' }),
        T('Ramen\nCrawl', 60, 880, 960, { font: 'Archivo', size: 210, weight: 900, lh: 0.84, ls: -60, color: '#111111' }),
        T('Five bowls, one evening, one rule: finish the broth.', 60, 1262, 700, { font: 'Archivo', size: 26, weight: 600, lh: 1.25, color: '#111111' }),
        T('1 / 4', 880, 1280, 140, { font: 'Archivo', size: 24, weight: 700, align: 'right', color: '#111111' }),
      ]),
      page('#F5EDE0', [
        T('The route', 60, 60, 600, { font: 'Archivo', size: 36, weight: 800, color: '#111111' }),
        T('2 / 4', 880, 66, 140, { font: 'Archivo', size: 24, weight: 700, align: 'right', color: '#111111' }),
        ...['Station noodles|Shoyu, thin, 6 minutes from the gate', 'Back alley miso|Corn, butter, a counter of nine seats', 'The salt place|Clear broth, no sign, ask at the florist', 'Tonkotsu at midnight|Heavy, cloudy, worth the queue', 'Cold noodles|Because you will need them'].flatMap((r, i) => {
          const [a, b] = r.split('|');
          return [
            L(60, 170 + i * 220, 1020, 170 + i * 220, '#111111', 3),
            T(`0${i + 1}`, 60, 186 + i * 220, 300, { font: 'Archivo', size: 150, weight: 900, ls: -60, lh: 1, color: '#E8321C' }),
            T(a, 380, 214 + i * 220, 640, { font: 'Archivo', size: 46, weight: 800, ls: -20, lh: 1.05, color: '#111111' }),
            T(b, 380, 280 + i * 220, 640, { font: 'Archivo', size: 24, weight: 500, lh: 1.25, color: '#111111' }),
          ];
        }),
      ]),
      page('#1A0500', [
        img('photos/food.jpg', 0, 0, 1080, 1350, { filters: { duotone: ['#1A0500', '#FF6A3D'], contrast: 15, grain: 25 } }),
        T('Rule one', 60, 880, 600, { font: 'Archivo', size: 30, weight: 700, ls: 140, upper: true, color: '#FFF1DC' }),
        T('The soup\ncomes first.', 60, 930, 960, { font: 'Archivo', size: 150, weight: 900, lh: 0.88, ls: -50, color: '#FFF1DC' }),
        T('3 / 4', 880, 66, 140, { font: 'Archivo', size: 24, weight: 700, align: 'right', color: '#FFF1DC' }),
      ]),
      page('#111111', [
        T('4 / 4', 880, 1280, 140, { font: 'Archivo', size: 24, weight: 700, align: 'right', color: '#FFF1DC' }),
        T('麺', 700, -30, 600, { font: CJK, size: 400, weight: 900, lh: 1, color: '#E8321C' }),
        T('Rules of\nthe crawl', 60, 60, 900, { font: 'Archivo', size: 120, weight: 900, lh: 0.9, ls: -50, color: '#FFF1DC' }),
        ...['Half portions only', 'Never order the extras', 'Slurp, it is polite', 'Share the bill, not the bowl'].flatMap((t, i) => [
          T(`${i + 1}`, 60, 440 + i * 140, 80, { font: 'Archivo', size: 40, weight: 800, color: '#E8321C' }),
          T(t, 150, 440 + i * 140, 700, { font: 'Archivo', size: 50, weight: 700, ls: -10, lh: 1.1, color: '#FFF1DC' }),
        ]),
        T('Save this for Friday', 60, 1240, 700, { font: 'Archivo', size: 28, weight: 700, ls: 120, upper: true, color: '#FFF1DC' }),
      ]),
    ],
  }),
  tpl({
    id: 'asia-design-week-deck', name: 'Design week deck', format: 'slide', category: 'Presentation',
    tags: ['deck', 'conference', 'slides', 'hangul'],
    pages: [
      page('#C6FF3D', [
        T('디자인', -40, -120, 2000, { font: 'Black Han Sans', size: 700, weight: 400, lh: 1, ls: -40, color: '#111111' }),
        T('Design Week 2026', 70, 700, 1800, { font: 'Archivo', size: 150, weight: 900, ls: -60, lh: 1, color: '#111111' }),
        L(70, 920, 1850, 920, '#111111', 4),
        T('Programme overview', 70, 950, 600, { font: 'Archivo', size: 30, weight: 700, color: '#111111' }),
        T('Three days, nine venues, forty talks', 700, 950, 700, { font: 'Archivo', size: 30, weight: 500, color: '#111111' }),
        T('3 to 5 September', 1400, 950, 450, { font: 'Archivo', size: 30, weight: 700, align: 'right', color: '#111111' }),
      ]),
      page('#111111', [
        T('Programme', 70, 60, 800, { font: 'Archivo', size: 110, weight: 900, ls: -40, color: '#C6FF3D' }),
        ...[['Day one', 'Thursday', 'Opening talk|Type workshop|Print lab open house|Night walk'], ['Day two', 'Friday', 'Studio visits|Panel: working small|Portfolio reviews|Closing party'], ['Day three', 'Saturday', 'Market of makers|Book launch|Film screening|Farewell lunch']].flatMap(([a, b, c], i) => [
          L(70 + i * 600, 260, 70 + i * 600, 1000, '#C6FF3D', 3),
          T(a, 100 + i * 600, 260, 460, { font: 'Archivo', size: 28, weight: 700, ls: 140, upper: true, color: '#C6FF3D' }),
          T(b, 100 + i * 600, 310, 460, { font: 'Archivo', size: 76, weight: 800, ls: -30, color: '#FFFFFF' }),
          T(c.split('|').join('\n'), 100 + i * 600, 460, 460, { font: 'Archivo', size: 44, weight: 500, lh: 1.75, color: '#FFFFFF' }),
        ]),
      ]),
      page('#1F33FF', [
        img('photos/portrait.jpg', 0, 0, 760, 1080, { filters: { duotone: ['#0A0A8F', '#FF6A4D'], contrast: 10, grain: 20 } }),
        T('“We made the poster last, after everyone agreed what it was for.”', 840, 120, 1000, { font: 'Archivo', size: 88, weight: 800, lh: 1.02, ls: -30, color: '#FFFFFF' }),
        T('Keynote, Thursday 18:00', 840, 840, 700, { font: 'Archivo', size: 28, weight: 700, ls: 140, upper: true, color: '#C6FF3D' }),
        T('Mira Sandvik\nStudio director, Oslo', 840, 900, 700, { font: 'Archivo', size: 36, weight: 500, lh: 1.25, color: '#FFFFFF' }),
        T('기조연설', 1540, 940, 320, { font: 'Black Han Sans', size: 64, weight: 400, align: 'right', color: '#FFFFFF' }),
      ]),
    ],
  }),
  tpl({
    id: 'asia-season-end-burst', name: 'Season end sale flyer', format: 'flyer', category: 'Retail',
    tags: ['sale', 'flyer', 'burst', 'retail'],
    pages: [page('#27C4F4', [
      T('시즌\n오프', -6, -30, 600, { font: 'Black Han Sans', size: 250, weight: 400, lh: 0.82, ls: -40, color: '#111111' }),
      img('art/asia-sale-hanger.jpg', 230, 170, 320, 480, { blend: 'multiply' }),
      T('Season\nend', 24, 540, 340, { font: 'Archivo', size: 76, weight: 900, lh: 0.86, ls: -50, color: '#111111' }),
      T('up to 70% off', 28, 690, 300, { font: 'Archivo', size: 24, weight: 800, color: '#E8321C' }),
      rect(0, 730, 559, 64, '#111111'),
      T('Fri 29 Nov to Sun 8 Dec  /  All stores', 24, 748, 520, { font: 'Archivo', size: 16, weight: 700, ls: 100, upper: true, color: '#FFE600' }),
    ])],
  }),
  tpl({
    id: 'asia-open-call-banner', name: 'Open call banner', format: 'banner', category: 'Email',
    tags: ['banner', 'call', 'header'],
    pages: [page('#FF3D8B', [
      T('공모', 0, 30, 600, { font: 'Black Han Sans', size: 290, weight: 400, lh: 1, ls: -40, color: '#111111' }),
      T('Call for\nmakers', 610, 40, 560, { font: 'Archivo', size: 120, weight: 900, lh: 0.88, ls: -50, color: '#111111' }),
      T('Posters, zines, type and odd objects. Show us one thing you finished.', 610, 270, 340, { font: 'Archivo', size: 20, weight: 600, lh: 1.25, color: '#111111' }),
      rect(980, 280, 190, 90, '#111111', { radius: 45 }),
      T('Apply by 12 Dec', 980, 306, 190, { font: 'Archivo', size: 20, weight: 800, align: 'center', color: '#FFFFFF' }),
    ])],
  }),
];
