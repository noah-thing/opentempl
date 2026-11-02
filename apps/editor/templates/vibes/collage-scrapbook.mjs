import { tpl, page, T, S, rect, circle, L, img, overlay, qr, solid, pattern, stroke } from '../kit.mjs';

const INK = '#16140F';
const CREAM = '#F1EBDD';
const GRID = '#E7E0CF';
const BLUE = '#2744D8';
const TOMATO = '#E8452C';
const BUTTER = '#F5D547';
const PINK = '#F2A6C4';
const GREEN = '#1F7A4D';
const KRAFT = '#C9A57A';

// Real torn paper, tape and cut paper pieces are commissioned images (public/library/art).
// The scrap sheet holds six pieces; each one is cropped out by fraction.
const SCRAPS = {
  blue: [0.0364, 0.105, 0.3293, 0.3655, 461, 341],
  red: [0.3964, 0.12, 0.2371, 0.3526, 332, 329],
  yellow: [0.6679, 0.0622, 0.2993, 0.4448, 419, 415],
  pink: [0.0464, 0.5263, 0.2657, 0.4009, 372, 374],
  green: [0.3507, 0.5606, 0.3493, 0.3505, 489, 327],
  white: [0.725, 0.5874, 0.2436, 0.3098, 341, 289],
};
// A torn scrap placed by width; height follows the natural proportion unless given.
function scrap(c, x, y, w, rot = 0, h) {
  const [cx, cy, cw, ch, pw, ph] = SCRAPS[c];
  return img('art/coll-scraps-sheet.png', x, y, w, h ?? Math.round((w * ph) / pw), { crop: { x: cx, y: cy, w: cw, h: ch }, rotation: rot });
}
const scrapH = (c, w) => Math.round((w * SCRAPS[c][5]) / SCRAPS[c][4]);

const TAPES = {
  beige: [0.0457, 0.1865, 0.455, 0.1736, 637, 162],
  yellow: [0.5436, 0.2004, 0.4114, 0.164, 576, 153],
  floral: [0.0543, 0.4491, 0.43, 0.1608, 602, 150],
  beige2: [0.5307, 0.4373, 0.43, 0.1747, 602, 163],
  yellow2: [0.07, 0.6785, 0.4171, 0.1693, 584, 158],
  beige3: [0.5279, 0.6817, 0.42, 0.1683, 588, 157],
};
const tape = (x, y, rot = -8, w = 150, kind = 'beige') => {
  const [cx, cy, cw, ch, pw, ph] = TAPES[kind];
  return img('art/coll-tape-sheet.png', x, y, w, Math.round((w * ph) / pw), { crop: { x: cx, y: cy, w: cw, h: ch }, rotation: rot });
};

// A big torn sheet. Wide sheets are the portrait image turned 90 degrees.
function sheet(kind, x, y, w, h, rot = 0) {
  const src = kind === 'kraft' ? 'art/coll-paper-kraft.png' : 'art/coll-paper-cream.png';
  if (w <= h) return img(src, x, y, w, h, { crop: { x: 0, y: 0, w: 1, h: 1 }, rotation: rot });
  const cx = x + w / 2, cy = y + h / 2;
  return img(src, cx - h / 2, cy - w / 2, h, w, { crop: { x: 0, y: 0, w: 1, h: 1 }, rotation: rot + 90 });
}
const ticket = (x, y, w, rot = 0, h) => img('art/coll-ticket-stub.png', x, y, w, h ?? Math.round(w * 0.667), { crop: { x: 0, y: 0, w: 1, h: 1 }, rotation: rot });

// A print with a thick white border.
function polaroid(src, x, y, w, h, rot, cap, o = {}) {
  const pad = Math.round(w * 0.055);
  const bottom = Math.round(w * 0.2);
  return [
    rect(x, y, w, h + pad + bottom, '#FBF9F3', { rotation: rot, shadow: { x: 0, y: 8, blur: 18, color: 'rgba(0,0,0,0.3)' } }),
    img(src, x + pad, y + pad, w - pad * 2, h, { rotation: rot, ...o }),
    cap ? T(cap, x, y + pad + h + bottom * 0.2, w, { font: 'Caveat', weight: 600, size: Math.round(w * 0.1), align: 'center', color: INK, rotation: rot, lh: 1 }) : null,
  ];
}
const fibre = (W, H, a = 0.5) => overlay('tex/paper-fibre.jpg', W, H, 'multiply', a);
const bw = (extra = {}) => ({ saturation: -100, contrast: 45, grain: 20, ...extra });

export default [
  // 1. Plant swap
  tpl({
    id: 'collage-plant-swap',
    name: 'Cut paper poster',
    format: 'poster',
    category: 'Event',
    tags: ['poster', 'workshop', 'swap', 'plants', 'cut paper', 'market'],
    pages: [
      page(CREAM, [
        fibre(1123, 1587, 0.6),
        T('PLANT', 60, 50, 1000, { font: 'Bricolage Grotesque', weight: 800, size: 250, lh: 0.88, ls: -40, color: INK }),
        T('SWAP', 60, 270, 1000, { font: 'Bricolage Grotesque', weight: 800, size: 250, lh: 0.88, ls: -40, color: TOMATO }),
        scrap('yellow', 700, 520, 380, 6),
        scrap('pink', 40, 700, 300, -8),
        img('art/coll-cutpaper-plant.png', 250, 480, 620, 930, { crop: { x: 0, y: 0, w: 1, h: 1 } }),
        T('free\ncuttings', 760, 1110, 300, { font: 'Caveat', weight: 700, size: 66, lh: 0.9, color: TOMATO, rotation: -6 }),
        tape(600, 500, 20, 170, 'yellow'),
        L(60, 1430, 1063, 1430, INK, 3),
        T('Saturday 14 June, 11 to 15', 60, 1448, 700, { font: 'Bricolage Grotesque', weight: 700, size: 44, ls: -10, color: INK }),
        T('Folkets Park, by the old greenhouse.\nBring something that grew, take something that will.', 60, 1508, 760, { font: 'Space Grotesk', size: 24, lh: 1.25, color: INK }),
        T('free', 880, 1440, 180, { font: 'Caveat', weight: 700, size: 90, color: BLUE, rotation: -5, align: 'center' }),
      ]),
    ],
  }),

  // 2. Polaroid spread
  tpl({
    id: 'collage-polaroid-spread',
    name: 'Polaroid spread',
    format: 'post',
    category: 'Social',
    tags: ['photo', 'memories', 'scrapbook', 'polaroid', 'travel', 'diary'],
    pages: [
      page(pattern('grid', GRID, '#F4F0E4', 1.4), [
        scrap('blue', 30, 30, 560, -2),
        T('SUMMER\nROLL 03', 90, 90, 440, { font: 'Bricolage Grotesque', weight: 800, size: 84, lh: 0.95, ls: -30, color: CREAM, rotation: -2 }),
        T('June to August', 90, 290, 420, { font: 'Caveat', weight: 700, size: 52, color: BUTTER, rotation: -2 }),
        ...polaroid('photos/friends.jpg', 560, 110, 480, 330, 4, 'rooftop, last night'),
        ...polaroid('photos/archipelago.jpg', 70, 500, 470, 300, -5, 'the boat was late'),
        ...polaroid('photos/coffee.jpg', 620, 700, 380, 380, 3, 'cardamom'),
        tape(740, 90, 4, 170), tape(190, 480, -6, 170, 'yellow'), tape(740, 680, -4, 170, 'beige2'),
        scrap('pink', 40, 880, 260, 6),
        T('keep\nthis one', 70, 920, 200, { font: 'Caveat', weight: 700, size: 52, lh: 0.9, color: INK, rotation: 6 }),
        ticket(330, 1000, 420, -4),
        T('34 photos\n3 sunburns\n1 lost hat', 400, 1072, 280, { font: 'Space Mono', weight: 700, size: 24, lh: 1.3, color: INK, rotation: -4 }),
        fibre(1080, 1350, 0.35),
      ]),
    ],
  }),

  // 3. Layered portrait, film night
  tpl({
    id: 'collage-portrait-night',
    name: 'Paper layers portrait',
    format: 'post',
    category: 'Event',
    tags: ['film', 'event', 'portrait', 'poster', 'screening', 'paper'],
    pages: [
      page(CREAM, [
        img('art/coll-ground-layers.jpg', 0, 0, 1080, 1350),
        sheet('cream', 10, 10, 1060, 260, 0),
        T('ELSEWHERE', 50, 60, 980, { font: 'Bricolage Grotesque', weight: 800, size: 150, lh: 1, ls: -40, color: INK }),
        ...polaroid('photos/portrait.jpg', 290, 300, 500, 580, -2, null, { filters: bw({ contrast: 70, brightness: 10 }) }),
        tape(450, 280, 4, 190, 'beige'), tape(640, 840, -16, 170, 'yellow2'),
        T('A film by Ines Kovac', 60, 1040, 700, { font: 'Space Mono', weight: 700, size: 24, color: INK }),
        T('Saturday 9 August, 20:30', 60, 1078, 900, { font: 'Bricolage Grotesque', weight: 800, size: 62, ls: -20, color: INK }),
        T('Rooftop, Barnängen. Bring a blanket.', 60, 1165, 700, { font: 'Space Grotesk', size: 26, color: INK }),
        T('free\nentry', 790, 1060, 220, { font: 'Caveat', weight: 700, size: 64, lh: 0.9, color: CREAM, align: 'center', rotation: -8 }),
        fibre(1080, 1350, 0.25),
      ]),
    ],
  }),

  // 4. Cut words
  tpl({
    id: 'collage-cut-letters',
    name: 'Cut word note',
    format: 'square',
    category: 'Social',
    tags: ['announcement', 'moving', 'news', 'letters', 'ransom', 'typography'],
    pages: [
      page(KRAFT, [
        overlay('tex/cardboard.jpg', 1080, 1080, 'multiply', 0.5),
        sheet('cream', 40, 30, 1000, 1020, -1),
        scrap('green', 100, 100, 300, -3), T('We', 100, 100 + 40, 300, { font: 'DM Serif Display', size: 150, color: CREAM, align: 'center', rotation: -3, lh: 1 }),
        scrap('yellow', 400, 90, 290, 2), T('are', 400, 90 + 55, 290, { font: 'Archivo Black', size: 110, color: INK, align: 'center', rotation: 2, lh: 1 }),
        scrap('red', 700, 110, 280, -2), T('moving', 704, 110 + 105, 272, { font: 'Bricolage Grotesque', weight: 800, size: 62, color: CREAM, align: 'center', rotation: -2, lh: 1, ls: -20 }),
        scrap('white', 110, 420, 320, 3), T('house', 110, 420 + 60, 320, { font: 'Special Elite', size: 74, color: INK, align: 'center', rotation: 3, lh: 1 }),
        scrap('pink', 440, 440, 270, -2), T('on the', 440, 440 + 85, 270, { font: 'Space Grotesk', weight: 700, size: 70, color: INK, align: 'center', rotation: -2, lh: 1, ls: 10 }),
        scrap('blue', 720, 420, 270, 3), T('first', 720, 420 + 70, 270, { font: 'DM Serif Display', size: 100, color: CREAM, align: 'center', rotation: 3, lh: 1 }),
        T('Same street, bigger door, nobody remembers where the kettle went. Come on Saturday 3 May from noon and carry something.', 110, 740, 520, { font: 'Special Elite', size: 27, lh: 1.35, color: INK }),
        T('Lilla Bergsgatan 12', 110, 920, 520, { font: 'Space Mono', weight: 700, size: 24, color: INK }),
        ticket(620, 690, 400, 5),
        T('3 MAY', 680, 770, 290, { font: 'Anton', size: 84, align: 'center', color: INK, rotation: 5, lh: 1 }),
        tape(30, 20, -30, 160), tape(900, 960, -30, 160, 'beige3'),
      ]),
    ],
  }),

  // 5. Index of small things
  tpl({
    id: 'collage-things-i-kept',
    name: 'Index of small things',
    format: 'square',
    category: 'Social',
    tags: ['list', 'collection', 'index', 'moodboard', 'photos', 'grid'],
    pages: [
      page(pattern('grid', GRID, '#F3EFE3', 1.2), [
        T('THINGS\nI KEPT', 50, 40, 600, { font: 'Bricolage Grotesque', weight: 800, size: 130, lh: 0.88, ls: -40, color: INK }),
        T('a partial list, 2019 to now', 54, 300, 500, { font: 'Caveat', weight: 700, size: 46, color: TOMATO, rotation: -2 }),
        ...[
          ['photos/coffee.jpg', 560, 40, 230, 230, '01 the cup'],
          ['photos/bread.jpg', 820, 70, 200, 260, '02 sourdough'],
          ['photos/plant.jpg', 60, 410, 230, 300, '03 plant'],
          ['photos/dog.jpg', 330, 380, 300, 300, '04 Pelle'],
          ['photos/desk.jpg', 680, 380, 340, 250, '05 the desk'],
          ['photos/flowers.jpg', 70, 770, 250, 250, '06 tulips'],
          ['photos/sneaker.jpg', 370, 740, 260, 260, '07 the shoes'],
          ['photos/studio.jpg', 690, 700, 330, 250, '08 workshop'],
        ].flatMap(([src, x, y, w, h, cap]) => [
          rect(x - 12, y - 12, w + 24, h + 24, '#FBF9F3', { shadow: { x: 0, y: 5, blur: 10, color: 'rgba(0,0,0,0.28)' } }),
          img(src, x, y, w, h),
          T(cap, x - 6, y + h + 20, w, { font: 'Space Mono', weight: 700, size: 18, color: INK, ls: 20 }),
        ]),
        tape(100, 396, -8, 140), tape(610, 14, 10, 140, 'yellow'), tape(740, 362, 6, 130, 'beige2'), tape(30, 760, -40, 110, 'yellow2'),
        fibre(1080, 1080, 0.4),
      ]),
    ],
  }),

  // 6. House rules
  tpl({
    id: 'collage-house-rules',
    name: 'Sticky note wall',
    format: 'square',
    category: 'Social',
    tags: ['notes', 'rules', 'list', 'sticky notes', 'tips', 'checklist'],
    pages: [
      page(pattern('grid', GRID, '#F7F4EA', 1.3), [
        ...(() => {
          const w = 300;
          const kinds = ['beige', 'yellow', 'beige2', 'floral', 'yellow2', 'beige3', 'beige'];
          let k = 0;
          const note = (x, y, c, rot, text, size = 44) => [
            rect(x, y, w, w, c, { rotation: rot, shadow: { x: 0, y: 8, blur: 14, color: 'rgba(0,0,0,0.25)' } }),
            T(text, x + 24, y + 30, w - 48, { font: 'Caveat', weight: 700, size, lh: 1.02, color: INK, rotation: rot }),
            tape(x + 70, y - 22, rot * 2, 160, kinds[k++ % kinds.length]),
          ];
          return [
            rect(50, 50, 630, 300, PINK, { rotation: -1.5, shadow: { x: 0, y: 8, blur: 14, color: 'rgba(0,0,0,0.25)' } }),
            T('HOUSE\nRULES', 80, 60, 580, { font: 'Bricolage Grotesque', weight: 800, size: 140, lh: 0.88, ls: -40, color: INK, rotation: -1.5 }),
            T('flat 4B, revised again', 360, 285, 300, { font: 'Caveat', weight: 700, size: 36, color: TOMATO, rotation: -1.5 }),
            note(715, 60, BUTTER, 2.5, '1. Whoever finishes the milk buys the milk.'),
            note(50, 385, BUTTER, -2, '2. Shoes off. Yes, the nice ones too.', 46),
            note(380, 380, '#FBF9F3', 1.5, '3. The thermostat is not a debate club.'),
            note(715, 390, BUTTER, -2.5, '4. Guests are welcome. Surprise guests bring cake.'),
            note(50, 720, '#BFD0FF', 2, '5. Dishes by midnight, no heroes.', 46),
            note(380, 715, BUTTER, -1.5, "6. Plants are everyone's. Water on Sundays."),
            note(715, 725, TOMATO, 2, '7. Sing in the shower. We know. We like it.', 44),
          ];
        })(),
        fibre(1080, 1080, 0.4),
      ]),
    ],
  }),

  // 7. Flea market story
  tpl({
    id: 'collage-flea-story',
    name: 'Torn paper story',
    format: 'story',
    category: 'Event',
    tags: ['story', 'market', 'event', 'flea', 'announcement', 'ticket'],
    pages: [
      page(KRAFT, [
        overlay('tex/cardboard.jpg', 1080, 1920, 'multiply', 0.6),
        sheet('cream', 40, 90, 1000, 800, -1),
        T('FLEA', 100, 140, 900, { font: 'Bricolage Grotesque', weight: 800, size: 300, lh: 0.85, ls: -50, color: INK, rotation: -1 }),
        T('MARKET', 100, 430, 900, { font: 'Bricolage Grotesque', weight: 800, size: 205, lh: 0.85, ls: -50, color: TOMATO, rotation: -1 }),
        T('Sunday 12 October, 10 to 16\nMariatorget, rain or shine', 110, 700, 800, { font: 'Space Grotesk', weight: 600, size: 40, lh: 1.25, color: INK, rotation: -1 }),
        tape(30, 70, -30, 190), tape(840, 840, -30, 190, 'beige3'),
        ...polaroid('photos/market-produce.jpg', 130, 960, 560, 520, -4, 'ask for the last pears'),
        tape(330, 940, 4, 190, 'yellow'),
        ticket(560, 1260, 460, 6),
        T('ADMIT ONE', 620, 1330, 340, { font: 'Space Mono', weight: 700, size: 26, ls: 120, rotation: 6, color: INK, align: 'center' }),
        T('FREE', 620, 1370, 340, { font: 'Anton', size: 100, lh: 1, rotation: 6, color: INK, align: 'center' }),
        scrap('blue', 740, 960, 250, 8),
        T('300 stalls,\nzero shame', 740, 1030, 250, { font: 'Caveat', weight: 700, size: 46, lh: 0.95, color: CREAM, align: 'center', rotation: 8 }),
        rect(0, 1620, 1080, 300, INK),
        T('Sell, swap or just look.\nBook a table at fleamarket.example', 70, 1665, 940, { font: 'Space Grotesk', weight: 600, size: 42, lh: 1.25, color: CREAM }),
        T('Tables 100 kr', 70, 1790, 500, { font: 'Space Mono', weight: 700, size: 28, color: BUTTER }),
      ]),
    ],
  }),

  // 8. Business card
  tpl({
    id: 'collage-card',
    name: 'Cut paper card',
    format: 'card',
    category: 'Business card',
    tags: ['business card', 'contact', 'creative', 'illustrator', 'paper'],
    pages: [
      page(CREAM, [
        fibre(1004, 650, 0.6),
        scrap('green', 520, 40, 440, 3),
        img('art/coll-cutpaper-bird.png', 560, 90, 440, 440, { crop: { x: 0, y: 0, w: 1, h: 1 } }),
        T('Elsa\nBerg', 60, 60, 460, { font: 'Bricolage Grotesque', weight: 800, size: 130, lh: 0.88, ls: -40, color: INK }),
        T('Illustration and cut paper', 66, 360, 420, { font: 'Space Grotesk', weight: 600, size: 28, color: INK }),
        tape(380, 20, -22, 150),
      ]),
      page(KRAFT, [
        overlay('tex/cardboard.jpg', 1004, 650, 'multiply', 0.5),
        sheet('cream', 50, 40, 904, 570, -1),
        T('elsa@bergpapper.example', 110, 100, 780, { font: 'Space Mono', weight: 700, size: 36, color: INK }),
        T('+46 70 555 01 02', 110, 165, 780, { font: 'Space Mono', size: 36, color: INK }),
        T('bergpapper.example', 110, 230, 780, { font: 'Space Mono', size: 36, color: INK }),
        T('Verkstan, Hammarby Kaj 4, Stockholm', 110, 330, 500, { font: 'Space Grotesk', size: 26, lh: 1.2, color: INK }),
        rect(650, 330, 200, 200, '#FBF9F3', { rotation: 3, shadow: { x: 0, y: 5, blur: 10, color: 'rgba(0,0,0,0.3)' } }),
        qr('https://example.com/elsa', 665, 345, 170, INK, '#FBF9F3', { rotation: 3 }),
        T('say hello', 110, 450, 400, { font: 'Caveat', weight: 700, size: 70, color: BLUE, rotation: -4 }),
        tape(30, 20, -35, 150),
      ]),
    ],
  }),

  // 9. Travel journal
  tpl({
    id: 'collage-travel-journal',
    name: 'Travel journal carousel',
    format: 'post',
    category: 'Social',
    tags: ['carousel', 'travel', 'journal', 'trip', 'diary', 'photos'],
    pages: [
      page(BLUE, [
        sheet('cream', 50, 40, 980, 1270, -1),
        T('LISBON', 110, 110, 880, { font: 'Bricolage Grotesque', weight: 800, size: 230, lh: 0.9, ls: -50, color: INK, rotation: -1 }),
        T('notebook, October 2025', 116, 330, 700, { font: 'Caveat', weight: 700, size: 62, color: TOMATO, rotation: -1 }),
        ...polaroid('photos/city-tram.jpg', 300, 440, 520, 600, 4, 'the 28, twice'),
        tape(500, 420, -4, 190), tape(120, 440, -30, 160, 'yellow'),
        T('1 / 4', 880, 1200, 100, { font: 'Space Mono', weight: 700, size: 22, color: INK }),
        fibre(1080, 1350, 0.3),
      ]),
      page(CREAM, [
        fibre(1080, 1350, 0.6),
        T('DAY 1 TO 3', 60, 50, 800, { font: 'Bricolage Grotesque', weight: 800, size: 120, ls: -40, color: INK }),
        ...polaroid('photos/market-produce.jpg', 70, 230, 450, 420, -4, 'figs, 2 euro'),
        ...polaroid('photos/food.jpg', 560, 330, 450, 330, 4, 'too much cod'),
        tape(230, 210, -6, 170, 'yellow'), tape(730, 310, 8, 170, 'beige2'),
        sheet('cream', 70, 940, 940, 360, 0),
        T('Wednesday: lost, then found the good bakery.\nThursday: the hill, the other hill, a nap.\nFriday: nothing planned, everything happened.', 130, 1000, 800, { font: 'Caveat', weight: 600, size: 46, lh: 1.15, color: INK }),
        ticket(660, 790, 330, -5),
        T('TRAM 28\nONE WAY', 700, 835, 250, { font: 'Space Mono', weight: 700, size: 30, lh: 1.15, rotation: -5, color: INK, align: 'center' }),
        T('2 / 4', 880, 1280, 100, { font: 'Space Mono', weight: 700, size: 22, color: INK }),
      ]),
      page(TOMATO, [
        sheet('cream', 50, 40, 980, 1270, 1),
        T('EATEN', 110, 100, 800, { font: 'Bricolage Grotesque', weight: 800, size: 200, lh: 0.9, ls: -50, color: INK, rotation: 1 }),
        ...['pastel de nata, 7', 'sardines on toast', 'the grilled thing, once', 'ginjinha, once more', 'tinned fish, souvenirs'].flatMap((t, i) => [
          T(t, 130, 350 + i * 120, 560, { font: 'Caveat', weight: 700, size: 62, color: INK, rotation: 1 }),
          L(130, 425 + i * 120, 650, 428 + i * 120, INK, 2),
        ]),
        ...polaroid('photos/coffee-pour.jpg', 690, 370, 300, 330, 6, 'bica'),
        tape(790, 350, 8, 140, 'yellow'),
        scrap('yellow', 110, 920, 400, -2),
        T('best thing: the nata at 7 a.m., eaten standing up in the rain', 160, 980, 320, { font: 'Caveat', weight: 700, size: 44, lh: 1.05, color: INK, rotation: -2 }),
        T('3 / 4', 880, 1230, 100, { font: 'Space Mono', weight: 700, size: 22, color: INK }),
      ]),
      page(GREEN, [
        sheet('cream', 50, 40, 980, 1270, -1),
        T('NEXT\nTIME', 110, 100, 800, { font: 'Bricolage Grotesque', weight: 800, size: 250, lh: 0.85, ls: -50, color: INK, rotation: -1 }),
        ...['Sintra, early', 'the ferry to the south', 'learn five more words', 'stay a week, not six days'].flatMap((t, i) => [
          rect(130, 690 + i * 100, 46, 46, null, { fill: solid('rgba(0,0,0,0)'), stroke: stroke(INK, 5), rotation: 1 }),
          T(t, 210, 680 + i * 100, 700, { font: 'Caveat', weight: 700, size: 62, color: INK }),
        ]),
        L(140, 700, 170, 730, TOMATO, 6), L(170, 700, 140, 730, TOMATO, 6),
        T('save this for later', 520, 1130, 460, { font: 'Caveat', weight: 700, size: 60, color: TOMATO, rotation: -4, align: 'right' }),
        tape(40, 30, -30, 170),
        T('4 / 4', 880, 1220, 100, { font: 'Space Mono', weight: 700, size: 22, color: INK }),
        fibre(1080, 1350, 0.3),
      ]),
    ],
  }),
];
