import { tpl, page, T, S, rect, circle, path, L, img, overlay, svg, qr, solid, stroke } from '../kit.mjs';

const INK = '#0B0B0B';
const WHITE = '#F4F3EF';
const RED = '#FF2A12';
const CONC = '#CFCFCB';
const YEL = '#FFD500';
const ORG = '#FF4A1C';

const bw = (extra = {}) => ({ saturation: -100, contrast: 55, brightness: 0, grain: 25, ...extra });
const grit = (W, H, a = 0.22) => overlay('tex/photocopy-toner.jpg', W, H, 'multiply', a);
const mono = (text, x, y, w, size = 15, color = INK, p = {}) => T(text, x, y, w, { font: 'Space Mono', size, lh: 1.35, color, ...p });
const hollow = (x, y, w, h, c, wd = 4) => rect(x, y, w, h, null, { fill: solid('rgba(0,0,0,0)'), stroke: stroke(c, wd) });

export default [
  // 1. Giant numeral poster
  tpl({
    id: 'brutalist-giant-numeral',
    name: 'Giant numeral poster',
    format: 'poster',
    category: 'Event',
    tags: ['poster', 'number', 'edition', 'conference', 'anniversary'],
    pages: [
      page(RED, [
        T('50', -40, 760, 1300, { font: 'Space Grotesk', weight: 700, size: 1100, lh: 0.8, ls: -60, color: WHITE }),
        T('CONCRETE\nSUMMER\nSCHOOL', 40, 100, 1043, { font: 'Space Grotesk', weight: 700, size: 150, lh: 0.9, ls: -40, color: INK }),
        T('Fiftieth session', 40, 40, 400, { font: 'Space Mono', weight: 700, size: 20, color: INK }),
        L(40, 74, 1083, 74, INK, 3),
        T('Talks and walks\nabout postwar\nbuildings', 40, 640, 440, { font: 'Space Grotesk', weight: 500, size: 34, lh: 1.15, color: INK }),
        mono('Dates', 560, 640, 200, 16, INK, { weight: 700, upper: true, ls: 100 }),
        T('26 April to\n28 September', 560, 672, 300, { font: 'Space Grotesk', weight: 600, size: 30, lh: 1.15, color: INK }),
        mono('Venue', 880, 640, 200, 16, INK, { weight: 700, upper: true, ls: 100 }),
        T('Oblast hall\nBlock C', 880, 672, 200, { font: 'Space Grotesk', weight: 600, size: 30, lh: 1.15, color: INK }),
        L(40, 600, 1083, 600, INK, 3),
        grit(1123, 1587, 0.3),
      ]),
    ],
  }),

  // 2. Cropped letter quadrants
  tpl({
    id: 'brutalist-letter-block',
    name: 'Four letter block',
    format: 'post',
    category: 'Social',
    tags: ['title', 'announcement', 'exhibition', 'type'],
    pages: [
      page(INK, [
        T('F', 0, 30, 540, { font: 'Archivo Black', size: 700, lh: 1, color: WHITE, align: 'center' }),
        T('O', 540, 30, 540, { font: 'Archivo Black', size: 700, lh: 1, color: WHITE, align: 'center' }),
        T('R', 0, 640, 540, { font: 'Archivo Black', size: 700, lh: 1, color: WHITE, align: 'center' }),
        T('M', 540, 640, 540, { font: 'Archivo Black', size: 700, lh: 1, color: WHITE, align: 'center' }),
        img('photos/portrait-man-sun.jpg', 350, 430, 380, 470, { mask: 'ellipse', filters: bw({ contrast: 75, brightness: 10 }) }),
        T('NEW\nWORK\n2026', 40, 1210, 200, { font: 'Space Mono', weight: 700, size: 22, lh: 1.25, color: RED }),
        T('Gallery Nord\nOpen Tue to Sun', 740, 1230, 300, { font: 'Space Mono', size: 22, lh: 1.3, color: WHITE, align: 'right' }),
        grit(1080, 1350, 0.35),
      ]),
    ],
  }),

  // 3. Redacted statement
  tpl({
    id: 'brutalist-redacted',
    name: 'Redacted statement',
    format: 'square',
    category: 'Social',
    tags: ['quote', 'statement', 'redacted', 'text', 'announcement'],
    pages: [
      page(WHITE, [
        overlay('tex/newsprint.jpg', 1080, 1080, 'multiply', 0.5),
        T('The committee finds that the proposed building is too large, too grey, too loud and too close to the river. It recommends that the design be reduced, softened, painted and moved. The architect has declined all four requests and wishes to proceed as drawn. The committee notes the decision with regret and some admiration. A second meeting will be held in the spring, weather permitting, to discuss the matter of the staircase, which nobody has yet been able to find.', 50, 50, 980, { font: 'Space Mono', size: 40, lh: 1.4, color: INK }),
        ...[[0, 960], [1, 840], [2, 930], [3, 700], [4, 900], [5, 960], [6, 780], [7, 620], [8, 960], [9, 700]].map(([i, w]) =>
          rect(46, 58 + i * 56, w, 42, RED, { rotation: (i % 3 - 1) * 0.5 })),
        rect(480, 720, 550, 310, INK),
        T('Proceed\nas drawn.', 510, 745, 500, { font: 'Archivo Black', size: 84, lh: 0.95, ls: -30, color: WHITE }),
        T('Minutes, page 14', 510, 950, 480, { font: 'Space Mono', weight: 700, size: 20, ls: 80, color: YEL }),
        mono('Document 22 / copy 4 of 4', 50, 1000, 380, 18, INK, { weight: 700, upper: true, ls: 60 }),
        grit(1080, 1080, 0.2),
      ]),
    ],
  }),

  // 4. Staircase
  tpl({
    id: 'brutalist-staircase',
    name: 'Staircase poster',
    format: 'poster',
    category: 'Event',
    tags: ['poster', 'event', 'architecture', 'stairs', 'open day'],
    pages: [
      page(CONC, [
        rect(0, 0, 1123, 180, RED),
        rect(0, 180, 800, 180, RED),
        rect(0, 360, 540, 180, RED),
        rect(0, 540, 280, 180, RED),
        T('OPEN', 790, 24, 333, { font: 'Space Grotesk', weight: 700, size: 130, lh: 1, ls: -40, color: INK }),
        T('DAY', 830, 204, 333, { font: 'Space Grotesk', weight: 700, size: 130, lh: 1, ls: -40, color: INK }),
        T('AT', 570, 384, 280, { font: 'Space Grotesk', weight: 700, size: 130, lh: 1, ls: -40, color: INK }),
        T('THE', 310, 564, 280, { font: 'Space Grotesk', weight: 700, size: 130, lh: 1, ls: -40, color: INK }),
        T('OLD\nDEPOT', 36, 790, 1080, { font: 'Space Grotesk', weight: 700, size: 300, lh: 0.88, ls: -60, color: INK }),
        T('9 MAY 2026\n10:00 to 17:00', 40, 40, 400, { font: 'Space Mono', weight: 700, size: 28, lh: 1.3, color: WHITE }),
        L(40, 1470, 1083, 1470, INK, 4),
        mono('Free entry. Hard hats provided.', 40, 1495, 600, 22, INK, { weight: 700 }),
        mono('Depot Road 1, Block C', 700, 1495, 383, 22, INK, { weight: 700, align: 'right' }),
        grit(1123, 1587, 0.3),
      ]),
    ],
  }),

  // 5. Schedule
  tpl({
    id: 'brutalist-schedule',
    name: 'Lecture schedule',
    format: 'poster',
    category: 'Event',
    tags: ['schedule', 'lecture', 'series', 'timetable', 'program'],
    pages: [
      page(YEL, [
        T('LECTURE\nSERIES', 40, 30, 1043, { font: 'Archivo Black', size: 150, lh: 0.88, ls: -40, color: INK }),
        T('26/27', 700, 300, 400, { font: 'Space Mono', weight: 700, size: 70, ls: -20, color: INK, align: 'right' }),
        L(40, 400, 1083, 400, INK, 8),
        ...[
          ['03.10', 'Concrete and care', 'M. Ibsen', 'Hall A'],
          ['17.10', 'The long wall', 'T. Okafor', 'Hall A'],
          ['31.10', 'What a stair is for', 'J. Lindqvist', 'Library'],
          ['14.11', 'Brick, again', 'S. Haddad', 'Hall B'],
          ['28.11', 'Roofs of the north', 'A. Nilsson', 'Hall A'],
          ['12.12', 'Open question night', 'Everyone', 'Canteen'],
        ].flatMap(([d, t, n, v], i) => [
          T(d, 40, 424 + i * 160, 300, { font: 'Space Grotesk', weight: 700, size: 78, ls: -30, lh: 1, color: INK }),
          T(t, 380, 428 + i * 160, 700, { font: 'Space Grotesk', weight: 700, size: 44, ls: -10, lh: 1.05, color: INK }),
          mono(`${n}  /  ${v}`, 380, 490 + i * 160, 700, 24, INK, { weight: 700 }),
          L(40, 568 + i * 160, 1083, 568 + i * 160, INK, i === 5 ? 8 : 2),
        ]),
        mono('All lectures 18:30, free entry, no booking', 40, 1450, 1043, 22, INK, { weight: 700, upper: true, ls: 60 }),
        grit(1123, 1587, 0.25),
      ]),
    ],
  }),

  // 6. Red story with arrow
  tpl({
    id: 'brutalist-red-arrow',
    name: 'Red arrow story',
    format: 'story',
    category: 'Social',
    tags: ['story', 'event', 'concert', 'arrow', 'announcement'],
    pages: [
      page(RED, [
        T('LATE\nSHIFT\nOPEN\nMIC', 40, 40, 1000, { font: 'Archivo Black', size: 250, lh: 0.86, ls: -50, color: INK }),
        img('photos/crowd-gig.jpg', 0, 1010, 1080, 340, { filters: bw({ contrast: 85, brightness: 20 }) }),
        T('Thursday 13 November', 40, 1380, 800, { font: 'Space Grotesk', weight: 700, size: 58, ls: -20, color: INK }),
        mono('Doors 19:00  /  Sign up at the bar', 40, 1458, 800, 26, INK, { weight: 700 }),
        mono('Sven Harrys Hall\nStorgatan 5', 40, 1530, 500, 26, INK),
        S('arrow', 640, 1560, 400, 240, INK),
        mono('Free\nall ages', 40, 1790, 400, 26, INK, { weight: 700 }),
        grit(1080, 1920, 0.3),
      ]),
    ],
  }),

  // 7. Split slab flyer
  tpl({
    id: 'brutalist-split-slab',
    name: 'Split slab flyer',
    format: 'flyer',
    category: 'Notice',
    tags: ['flyer', 'workshop', 'coworking', 'announcement', 'rental'],
    pages: [
      page(WHITE, [
        rect(0, 0, 559, 394, RED),
        T('B', -40, -30, 330, { font: 'Archivo Black', size: 500, lh: 1, color: INK, align: 'left' }),
        rect(280, 394, 279, 400, INK),
        T('WASTE &\nFLEXIBLE\nWORK\nPLACES', 322, 30, 237, { font: 'Archivo Black', size: 38, lh: 0.95, ls: -30, color: WHITE }),
        T('Desks by\nthe day.\nNo contract.', 24, 420, 240, { font: 'Space Grotesk', weight: 700, size: 34, lh: 1, ls: -20, color: INK }),
        T('FROM', 304, 424, 220, { font: 'Space Mono', size: 15, color: YEL, ls: 100 }),
        T('90 kr', 300, 442, 260, { font: 'Space Grotesk', weight: 700, size: 92, ls: -40, color: WHITE }),
        T('a day', 304, 540, 220, { font: 'Space Grotesk', weight: 500, size: 30, color: WHITE }),
        L(304, 700, 535, 700, WHITE, 2),
        mono('Hall 4, Verkstadsgatan 22\nMon to Fri 8 to 18\nhello@hall4.example', 304, 712, 240, 13, WHITE),
        mono('Hall\n4', 24, 700, 120, 20, INK, { weight: 700, lh: 1.1 }),
        grit(559, 794, 0.3),
      ]),
    ],
  }),

  // 8. Lookbook carousel
  tpl({
    id: 'brutalist-lookbook',
    name: 'Lookbook carousel',
    format: 'post',
    category: 'Social',
    tags: ['carousel', 'lookbook', 'collection', 'fashion', 'catalogue', 'product'],
    pages: [
      page(INK, [
        T('SS', 30, 40, 1100, { font: 'Archivo Black', size: 640, lh: 0.8, ls: -60, color: WHITE }),
        T('26', 30, 520, 1100, { font: 'Archivo Black', size: 640, lh: 0.8, ls: -60, color: RED }),
        mono('LOOKBOOK / 01 TO 24', 40, 1230, 600, 22, WHITE, { weight: 700 }),
        mono('Studio Vanta\nSpring Summer 2026', 40, 1270, 600, 22, WHITE),
        S('arrow', 900, 1240, 140, 80, RED),
        grit(1080, 1350, 0.35),
      ]),
      page(CONC, [
        img('photos/sneaker-concrete.jpg', 0, 0, 1080, 900, { filters: bw({ contrast: 70, brightness: 10 }) }),
        rect(0, 900, 1080, 450, RED),
        T('01', 40, 920, 400, { font: 'Archivo Black', size: 300, lh: 1, ls: -40, color: INK }),
        T('The Slab\nsneaker', 470, 940, 570, { font: 'Space Grotesk', weight: 700, size: 76, lh: 0.95, ls: -30, color: INK }),
        mono('Leather, rubber, 740 g\nFits a size larger', 470, 1110, 570, 26, INK, { weight: 700 }),
        T('1 490 kr', 470, 1230, 570, { font: 'Space Grotesk', weight: 700, size: 64, ls: -20, color: INK }),
        grit(1080, 1350, 0.3),
      ]),
      page(WHITE, [
        rect(0, 0, 540, 1350, INK),
        img('photos/portrait-window.jpg', 0, 0, 540, 900, { filters: bw({ contrast: 80, brightness: 15 }) }),
        T('02', 560, 40, 500, { font: 'Archivo Black', size: 300, lh: 1, ls: -40, color: RED }),
        T('The Hall\nshirt', 570, 340, 480, { font: 'Space Grotesk', weight: 700, size: 76, lh: 0.95, ls: -30, color: INK }),
        mono('Heavy cotton, boxy\nWashes grey', 570, 520, 480, 26, INK, { weight: 700 }),
        T('890 kr', 570, 640, 480, { font: 'Space Grotesk', weight: 700, size: 64, ls: -20, color: INK }),
        L(570, 780, 1040, 780, INK, 4),
        mono('SIZES\nXS S M L XL\n\nIN STORE FROM\n12 MARCH', 570, 810, 480, 24, INK, { weight: 700, lh: 1.4 }),
        T('Hall', 40, 960, 460, { font: 'Archivo Black', size: 200, lh: 1, color: WHITE, ls: -30 }),
        grit(1080, 1350, 0.25),
      ]),
      page(RED, [
        T('SEE\nTHE\nREST', 40, 40, 1000, { font: 'Archivo Black', size: 330, lh: 0.84, ls: -50, color: INK }),
        T('vanta.example/ss26', 40, 1020, 1000, { font: 'Space Grotesk', weight: 700, size: 70, ls: -20, color: INK }),
        mono('Open Tue to Sat, 11 to 18\nHantverkargatan 9', 40, 1130, 700, 28, INK, { weight: 700 }),
        S('arrow', 780, 1130, 260, 150, INK),
        grit(1080, 1350, 0.3),
      ]),
    ],
  }),

  // 9. Annual report slides
  tpl({
    id: 'brutalist-report-slides',
    name: 'Report slides',
    format: 'slide',
    category: 'Presentation',
    tags: ['report', 'annual report', 'numbers', 'deck', 'results'],
    pages: [
      page(WHITE, [
        T('ANNUAL\nREPORT', 60, 40, 1500, { font: 'Space Grotesk', weight: 700, size: 330, lh: 0.84, ls: -70, color: INK }),
        rect(1380, 0, 540, 1080, RED),
        T('25', 1240, 560, 700, { font: 'Space Grotesk', weight: 700, size: 640, lh: 0.8, ls: -60, color: INK }),
        mono('Kvarn Foundation\nYear ending 31 December', 60, 900, 800, 34, INK, { weight: 700 }),
        L(60, 860, 1300, 860, INK, 6),
        grit(1920, 1080, 0.2),
      ]),
      page(INK, [
        T('74%', -20, -60, 1300, { font: 'Space Grotesk', weight: 700, size: 840, lh: 0.9, ls: -80, color: WHITE }),
        T('of grants went to places\nwith fewer than 2000 people', 1060, 100, 800, { font: 'Space Grotesk', weight: 600, size: 52, lh: 1.1, ls: -10, color: WHITE }),
        L(1060, 330, 1860, 330, RED, 8),
        mono('Up from 51 percent in 2024.', 1060, 360, 760, 30, WHITE),
        rect(0, 760, 1920, 320, RED),
        T('Grants are now decided by a site visit, not a form. It takes longer and we get fewer surprises.', 60, 800, 1700, { font: 'Space Grotesk', weight: 700, size: 64, lh: 1.08, ls: -20, color: INK }),
        grit(1920, 1080, 0.3),
      ]),
      page(WHITE, [
        T('WHERE\nIT WENT', 60, 40, 1100, { font: 'Space Grotesk', weight: 700, size: 190, lh: 0.88, ls: -50, color: INK }),
        ...[
          ['Roofs and walls', 41, RED], ['Tools and benches', 27, INK], ['Teachers', 19, INK], ['Everything else', 13, CONC],
        ].flatMap(([t, v, c], i) => [
          T(t, 1000, 70 + i * 140, 500, { font: 'Space Grotesk', weight: 600, size: 44, ls: -10, color: INK }),
          rect(1000, 130 + i * 140, v * 20, 44, c),
          T(`${v}%`, 1000 + v * 20 + 20, 120 + i * 140, 200, { font: 'Space Mono', weight: 700, size: 42, color: INK }),
        ]),
        rect(0, 700, 1920, 380, INK),
        mono('Total given 12.4 million kr across 86 projects in 31 municipalities', 60, 730, 1000, 40, WHITE, { weight: 700 }),
        T('86', 60, 830, 600, { font: 'Space Grotesk', weight: 700, size: 240, lh: 0.9, ls: -50, color: RED }),
        T('31', 700, 830, 600, { font: 'Space Grotesk', weight: 700, size: 240, lh: 0.9, ls: -50, color: WHITE }),
        T('12.4', 1250, 830, 700, { font: 'Space Grotesk', weight: 700, size: 240, lh: 0.9, ls: -50, color: YEL }),
        grit(1920, 1080, 0.2),
      ]),
      page(YEL, [
        T('NEXT\nYEAR', 60, 40, 1500, { font: 'Space Grotesk', weight: 700, size: 400, lh: 0.84, ls: -70, color: INK }),
        T('Shorter forms.\nMore site visits.', 1040, 140, 800, { font: 'Space Grotesk', weight: 700, size: 90, lh: 1, ls: -30, color: INK }),
        mono('Applications open 1 February\nkvarn.example/apply', 1040, 400, 800, 36, INK, { weight: 700 }),
        S('arrow', 60, 880, 440, 130, INK),
        grit(1920, 1080, 0.2),
      ]),
    ],
  }),

  // 10. Concrete photo
  tpl({
    id: 'brutalist-concrete-photo',
    name: 'Concrete and red',
    format: 'post',
    category: 'Social',
    tags: ['architecture', 'photo', 'article', 'title', 'city'],
    pages: [
      page(WHITE, [
        img('photos/city-tram.jpg', 0, 150, 1080, 1050, { filters: bw({ contrast: 85, brightness: 5 }) }),
        rect(0, 0, 1080, 150, RED),
        rect(0, 1200, 1080, 150, RED),
        rect(0, 1130, 760, 70, WHITE),
        T('What the number 28 tram does to a street', 24, 1146, 730, { font: 'Space Grotesk', weight: 700, size: 36, lh: 1.05, ls: -20, color: INK }),
        mono('ESSAY / 12 MIN READ', 40, 52, 600, 26, INK, { weight: 700 }),
        mono('Issue 09', 760, 52, 280, 26, INK, { weight: 700, align: 'right' }),
        T('THE LONG STREET.', 30, 1218, 1040, { font: 'Archivo Black', size: 96, lh: 1, ls: -40, color: INK }),
        grit(1080, 1350, 0.25),
      ]),
    ],
  }),

  // 11. Price list
  tpl({
    id: 'brutalist-price-list',
    name: 'Price list',
    format: 'a4',
    category: 'Menu',
    tags: ['menu', 'price list', 'services', 'a4', 'rates'],
    pages: [
      page(WHITE, [
        rect(0, 0, 794, 330, INK),
        T('PRICES', 24, 40, 800, { font: 'Archivo Black', size: 165, lh: 1, ls: -50, color: WHITE }),
        T('Garage 14 / bicycle workshop', 30, 270, 700, { font: 'Space Mono', weight: 700, size: 22, color: RED }),
        ...[
          ['Puncture repair', '90'], ['Brake adjustment', '120'], ['Gear tune', '180'], ['New chain', '240'],
          ['Wheel true', '150'], ['Full service', '690'], ['Cargo bike service', '890'],
        ].flatMap(([t, v], i) => [
          T(t, 30, 370 + i * 96, 520, { font: 'Space Grotesk', weight: 700, size: 40, ls: -20, color: INK }),
          T(v, 520, 360 + i * 96, 244, { font: 'Space Grotesk', weight: 700, size: 60, ls: -30, color: INK, align: 'right' }),
          L(30, 430 + i * 96, 764, 430 + i * 96, INK, i === 6 ? 6 : 2),
        ]),
        mono('All prices in kr, parts extra', 30, 1050, 500, 15, INK, { weight: 700 }),
        grit(794, 1123, 0.25),
      ]),
      page(RED, [
        T('EXTRAS', 24, 20, 800, { font: 'Archivo Black', size: 150, lh: 1, ls: -50, color: INK }),
        ...[
          ['Pickup and return', '60'], ['Same day', '+100'], ['Lights fitted', '90'], ['Bell, good', '45'], ['Bell, loud', '70'],
        ].flatMap(([t, v], i) => [
          T(t, 30, 250 + i * 110, 520, { font: 'Space Grotesk', weight: 700, size: 44, ls: -20, color: INK }),
          T(v, 520, 238 + i * 110, 244, { font: 'Space Grotesk', weight: 700, size: 68, ls: -30, color: INK, align: 'right' }),
          L(30, 316 + i * 110, 764, 316 + i * 110, INK, 3),
        ]),
        rect(30, 840, 734, 220, INK),
        T('No appointment.\nJust bring it in.', 56, 868, 680, { font: 'Archivo Black', size: 54, lh: 1, ls: -30, color: WHITE }),
        mono('Mon to Sat 9 to 18 / Hornsgatan 14', 56, 1000, 680, 18, YEL, { weight: 700 }),
        grit(794, 1123, 0.3),
      ]),
    ],
  }),

  // 12. Cover banner
  tpl({
    id: 'brutalist-cover-banner',
    name: 'Cropped word cover',
    format: 'cover',
    category: 'Social',
    tags: ['cover', 'header', 'banner', 'facebook', 'event'],
    pages: [
      page(YEL, [
        T('KNAK', -20, -150, 1900, { font: 'Archivo Black', size: 600, lh: 1, ls: -60, color: INK }),
        rect(1180, 340, 460, 284, INK),
        T('14.05', 1210, 360, 400, { font: 'Space Grotesk', weight: 700, size: 110, ls: -30, color: YEL }),
        mono('La Trastienda\nDoors 21:00', 1212, 500, 400, 26, WHITE, { weight: 700 }),
        mono('SHOW / DJ SETS / FREE BEFORE 22', 40, 570, 800, 24, INK, { weight: 700 }),
        grit(1640, 624, 0.25),
      ]),
    ],
  }),
];
