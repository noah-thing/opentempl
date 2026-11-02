import { tpl, page, T, S, rect, circle, L, img, overlay } from '../kit.mjs';

// Mid century, image led. Artwork (gouache, lithograph and cut paper) lives in public/library/art/mid-*.
const CREAM = '#F1E8D4';
const TOMATO = '#E4572E';
const MUSTARD = '#E8A92B';
const TEAL = '#1F6F78';
const DTEAL = '#123E45';
const SKY = '#6FB1D6';
const CORAL = '#EE8E7B';
const CHAR = '#25282B';

const PAPER = (W, H, o = 0.45) => overlay('tex/paper-fibre.jpg', W, H, 'multiply', o);
const A = (n) => `art/mid-${n}`;

// 1. Coast poster
const coast = (() => {
  const W = 1123, H = 1587;
  return tpl({
    id: 'mid-century-coast-poster', name: 'Seaside travel poster', format: 'poster', category: 'Event',
    tags: ['travel', 'poster', 'festival', 'summer', 'coast'],
    pages: [page(CREAM, [
      img(`${A('coast-poster')}.jpg`, 0, 0, W, H),
      T('Cala Verde', 56, 1140, 1030, { font: 'Archivo Black', size: 166, color: TEAL, ls: -40 }),
      T('A seaside festival of food and music', 62, 1338, 800, { font: 'Josefin Sans', size: 28, weight: 600, color: CHAR, upper: true, ls: 180 }),
      L(62, 1405, 1061, 1405, CHAR, 2),
      T('Friday 22 to Sunday 24 August', 62, 1432, 600, { font: 'Josefin Sans', size: 28, weight: 700, color: CHAR }),
      T('Harbour terraces, all day', 62, 1476, 600, { font: 'Josefin Sans', size: 28, weight: 400, color: CHAR }),
      T('Free entry\nBoats from 10:00', 761, 1432, 300, { font: 'Josefin Sans', size: 28, weight: 400, color: CHAR, align: 'right', lh: 1.3 }),
      PAPER(W, H, 0.3),
    ])],
  });
})();

// 2. Atomic exhibition post
const atomic = (() => {
  const W = 1080, H = 1350;
  return tpl({
    id: 'mid-century-atomic-home', name: 'Atomic home exhibition', format: 'post', category: 'Event',
    tags: ['exhibition', 'design', 'atomic', 'museum', 'starburst'],
    pages: [page(CREAM, [
      rect(60, 60, 630, 650, MUSTARD),
      img(`${A('atomic-starburst')}.png`, 75, 75, 600, 620),
      rect(730, 60, 130, 650, SKY), rect(890, 60, 130, 650, CORAL),
      img(`${A('atomic-starburst')}.png`, 735, 120, 120, 120),
      img(`${A('atomic-starburst')}.png`, 735, 500, 120, 120),
      img(`${A('atomic-starburst')}.png`, 895, 300, 120, 120),
      T('The Atomic\nHome', 56, 790, 980, { font: 'Archivo Black', size: 138, color: CHAR, lh: 0.92, ls: -35 }),
      L(60, 1100, 1020, 1100, CHAR, 2),
      T('Living rooms from 1950 to 1965:\nlamps, sofas and the first colour television.', 60, 1130, 620, { font: 'Josefin Sans', size: 28, weight: 500, color: CHAR, lh: 1.3 }),
      T('Opens\n3 October', 760, 1130, 260, { font: 'Josefin Sans', size: 34, weight: 700, color: TOMATO, align: 'right', lh: 1.15 }),
      T('City Design Museum, second floor', 60, 1262, 700, { font: 'Josefin Sans', size: 20, weight: 600, color: CHAR, upper: true, ls: 180 }),
      PAPER(W, H, 0.5),
    ])],
  });
})();

// 3. Lamp poster
const lamps = (() => {
  const W = 1123, H = 1587;
  return tpl({
    id: 'mid-century-lamps-poster', name: 'Lamps after dark poster', format: 'poster', category: 'Event',
    tags: ['design', 'lamp', 'exhibition', 'poster', 'furniture'],
    pages: [page(DTEAL, [
      img(`${A('lamps-poster')}.jpg`, 0, 0, W, H),
      T('Lamps\nafter dark', 56, 1130, 1000, { font: 'DM Serif Display', size: 120, color: CREAM, lh: 0.95, ls: -15 }),
      T('Forty lamps from Danish and Swedish\nhomes, 1950 to 1970.', 56, 1400, 560, { font: 'Josefin Sans', size: 26, weight: 400, color: CREAM, lh: 1.3 }),
      T('Until 14 February', 680, 1400, 387, { font: 'Josefin Sans', size: 26, weight: 700, color: MUSTARD, align: 'right' }),
      T('Tuesday to Sunday, 11 to 17', 680, 1440, 387, { font: 'Josefin Sans', size: 22, weight: 400, color: CREAM, align: 'right' }),
      PAPER(W, H, 0.3),
    ])],
  });
})();

// 4. Jazz sleeve
const sleeve = tpl({
  id: 'mid-century-jazz-sleeve', name: 'Quartet record sleeve', format: 'square', category: 'Music',
  tags: ['jazz', 'album', 'sleeve', 'music', 'cover'],
  pages: [page(MUSTARD, [
    img(`${A('jazz-sleeve')}.jpg`, 0, 0, 1080, 1080),
    T('Cool\nRooms', 50, 640, 600, { font: 'Archivo Black', size: 150, color: CHAR, lh: 0.84, ls: -40 }),
    T('The Marlowe Quartet', 56, 940, 600, { font: 'Josefin Sans', size: 28, weight: 700, color: CHAR, upper: true, ls: 200 }),
    T('Recorded live, one take, 1959', 56, 990, 600, { font: 'Josefin Sans', size: 24, weight: 400, color: CHAR }),
    PAPER(1080, 1080, 0.3),
  ])],
});

// 5. Chair exhibition
const chair = (() => {
  const W = 1123, H = 1587;
  return tpl({
    id: 'mid-century-chair-exhibition', name: 'Chair exhibition poster', format: 'poster', category: 'Event',
    tags: ['exhibition', 'furniture', 'museum', 'design', 'chair'],
    pages: [page(CREAM, [
      circle(130, 190, 860, TEAL),
      img(`${A('chair-cutout')}.png`, 250, 190, 640, 960),
      T('MUSEUM OF DESIGN', 60, 60, 600, { font: 'Josefin Sans', size: 26, weight: 700, color: CHAR, ls: 220 }),
      T('The Chair', 56, 1180, 1000, { font: 'Archivo Black', size: 150, color: CHAR, ls: -35 }),
      T('Fifty chairs from the museum cellar', 62, 1350, 900, { font: 'Josefin Sans', size: 38, weight: 600, color: TOMATO }),
      L(62, 1430, 1061, 1430, CHAR, 2),
      T('Opens\n12 March', 62, 1452, 250, { font: 'Josefin Sans', size: 24, weight: 700, color: CHAR, lh: 1.25 }),
      T('Open daily\n10 to 18', 400, 1452, 250, { font: 'Josefin Sans', size: 24, weight: 400, color: CHAR, lh: 1.25 }),
      T('Harbour Street 4\nmuseumofdesign.example', 700, 1452, 361, { font: 'Josefin Sans', size: 24, weight: 400, color: CHAR, lh: 1.25, align: 'right' }),
      PAPER(W, H, 0.5),
    ])],
  });
})();

// 6. Train story
const train = tpl({
  id: 'mid-century-slow-train-story', name: 'Slow train story', format: 'story', category: 'Social',
  tags: ['travel', 'train', 'story', 'transit', 'announcement'],
  pages: [page(CREAM, [
    img(`${A('train-gouache')}.jpg`, 0, 0, 1080, 1620),
    T('slow train\nto the lakes', 56, 1215, 980, { font: 'Archivo Black', size: 128, color: CHAR, lh: 0.95, ls: -35 }),
    L(60, 1560, 1020, 1560, CHAR, 2),
    T('Line 4', 60, 1590, 300, { font: 'Josefin Sans', size: 28, weight: 700, color: TOMATO, upper: true, ls: 200 }),
    T('New summer timetable from 1 June.\nTwo trains a day, window seats free.', 60, 1650, 900, { font: 'Josefin Sans', size: 32, weight: 400, color: CHAR, lh: 1.3 }),
    T('Book at the ticket hall', 60, 1810, 700, { font: 'Josefin Sans', size: 24, weight: 700, color: CHAR, upper: true, ls: 180 }),
    PAPER(1080, 1920, 0.4),
  ])],
});

// 7. City carousel
const carousel = (() => {
  const W = 1080, H = 1350;
  const SK = `${A('city-skyline')}.jpg`;
  const tile = (i, x, y, fx, fy, filters) => img(SK, x, y, 300, 300, { crop: { x: fx, y: fy, w: 0.3, h: 0.45 }, filters });
  const stops = (a, col) => a.flatMap((s, i) => [
    T(s[0], 60, 1030 + i * 96, 140, { font: 'Josefin Sans', size: 34, weight: 700, color: col }),
    T(s[1], 210, 1030 + i * 96, 820, { font: 'Josefin Sans', size: 34, weight: 400, color: col }),
    L(60, 1076 + i * 96, 1020, 1076 + i * 96, col, 1.5, { opacity: 0.5 }),
  ]);
  return tpl({
    id: 'mid-century-city-guide-carousel', name: 'City guide carousel', format: 'post', category: 'Social',
    tags: ['carousel', 'travel', 'city', 'guide', 'skyline'],
    pages: [
      page(CREAM, [
        tile(0, 60, 60, 0.0, 0.5), tile(1, 390, 60, 0.35, 0.5, { saturation: -30, temperature: -30 }), tile(2, 720, 60, 0.7, 0.5),
        tile(3, 60, 390, 0.7, 0.05, { temperature: 40 }), tile(4, 390, 390, 0.15, 0.1), tile(5, 720, 390, 0.4, 0.05, { saturation: -40, temperature: 30 }),
        T('Six cities,\none tram\neach', 56, 1040, 900, { font: 'Archivo Black', size: 98, color: CHAR, lh: 0.95, ls: -25 }),
        T('Swipe for the\nslow way in', 720, 1060, 300, { font: 'Josefin Sans', size: 26, weight: 600, color: TOMATO, align: 'right', lh: 1.3, upper: true, ls: 100 }),
        PAPER(W, H, 0.5),
      ]),
      page(CREAM, [
        img(SK, 0, 0, W, 1000),
        T('Morning', 56, 40, 900, { font: 'Archivo Black', size: 150, color: CHAR, ls: -35 }),
        ...stops([['07:30', 'Coffee at the tram stop'], ['09:00', 'The fish market, before it fills'], ['11:00', 'Climb the water tower']], CHAR),
        PAPER(W, H, 0.5),
      ]),
      page(CREAM, [
        img(SK, 0, 0, W, 1000, { filters: { temperature: 70, tint: 20, contrast: 15, brightness: -15 } }),
        T('Evening', 56, 40, 900, { font: 'Archivo Black', size: 150, color: CREAM, ls: -35 }),
        ...stops([['17:30', 'Walk the old harbour wall'], ['19:00', 'Dinner at a long communal table'], ['21:30', 'Last tram, front seat']], CHAR),
        PAPER(W, H, 0.5),
      ]),
    ],
  });
})();

// 8. Cafe menu
const menu = (() => {
  const W = 794, H = 1123;
  const sec = (title, items, x, y, col, priceCol, w = 330) => [
    T(title, x, y, w, { font: 'Josefin Sans', size: 20, weight: 700, color: priceCol, upper: true, ls: 240 }),
    L(x, y + 40, x + w, y + 40, col, 1.5),
    ...items.flatMap((it, i) => [
      T(it[0], x, y + 62 + i * 98, w - 70, { font: 'DM Serif Display', size: 29, color: col }),
      T(it[1], x + w - 70, y + 64 + i * 98, 70, { font: 'DM Serif Display', size: 29, color: priceCol, align: 'right' }),
      T(it[2], x, y + 100 + i * 98, w - 40, { font: 'Josefin Sans', size: 17, weight: 400, color: col, opacity: 0.85 }),
    ]),
  ];
  const p1 = page(CREAM, [
    img(`${A('atomic-starburst')}.png`, 520, -20, 300, 300),
    T('Starlight\nCoffee Bar', 50, 70, 520, { font: 'DM Serif Display', size: 80, color: CHAR, lh: 0.92, ls: -15 }),
    T('Roasted slowly, since 1958', 50, 248, 520, { font: 'Josefin Sans', size: 20, weight: 600, color: TOMATO, upper: true, ls: 160 }),
    ...sec('Coffee', [['Espresso', '28', 'Short, dark, single origin.'], ['Flat white', '38', 'Double shot, steamed milk.'], ['Filter coffee', '32', 'Free second cup.'], ['Cortado', '36', 'Equal parts coffee and milk.'], ['Iced latte', '42', 'Over a single large cube.']], 50, 330, CHAR, TOMATO, 330),
    ...sec('Pastry', [['Cardamom bun', '38', 'Baked at six every morning.'], ['Almond croissant', '44', 'Twice baked, a little sticky.'], ['Rye sandwich', '62', 'Smoked ham, mustard, pickle.'], ['Orange cake', '46', 'Syrup soaked, no icing.'], ['Cheese toastie', '58', 'Aged cheddar, thick bread.']], 414, 330, CHAR, TOMATO, 330),
    L(50, 1010, 744, 1010, CHAR, 1.5),
    T('Open every day 7 to 18  |  Corner of Maple and Fourth', 50, 1034, 694, { font: 'Josefin Sans', size: 16, weight: 600, color: CHAR, upper: true, ls: 140 }),
    PAPER(W, H, 0.6),
  ]);
  const p2 = page(CREAM, [
    T('Lunch plates', 50, 70, 560, { font: 'DM Serif Display', size: 70, color: TEAL, ls: -10 }),
    T('Served 11 to 15', 50, 160, 400, { font: 'Josefin Sans', size: 20, weight: 600, color: TOMATO, upper: true, ls: 200 }),
    ...sec('Warm', [['Tomato soup', '78', 'Basil oil, grilled bread.'], ['Mushroom melt', '98', 'Rye, gruyère, thyme.'], ['Meatballs', '112', 'Mash, lingon, cream sauce.'], ['Baked potato', '88', 'Sour cream, red onion, chives.']], 50, 250, CHAR, TOMATO, 330),
    ...sec('Fresh', [['Beet salad', '94', 'Goat cheese, hazelnuts.'], ['Egg and anchovy', '86', 'On buttered toast.'], ['Fruit and curd', '72', 'Seasonal, with oats.'], ['Cucumber and dill', '68', 'Thin sliced, light vinegar.']], 414, 250, CHAR, TOMATO, 330),
    img(`${A('chair-cutout')}.png`, 480, 690, 300, 450),
    T('Ask about the plate of the day,\nit is never on this page.', 50, 1000, 400, { font: 'Josefin Sans', size: 18, weight: 400, color: CHAR, lh: 1.3 }),
    PAPER(W, H, 0.6),
  ]);
  return tpl({ id: 'mid-century-cafe-menu', name: 'Coffee bar menu', format: 'a4', category: 'Menu', tags: ['menu', 'cafe', 'coffee', 'restaurant', 'two page'], pages: [p1, p2] });
})();

// 9. Garden party invite
const invite = (() => {
  const W = 480, H = 673;
  const front = page(MUSTARD, [
    img(`${A('atomic-starburst')}.png`, 70, 20, 340, 340),
    img(`${A('atomic-starburst')}.png`, 320, 300, 130, 130),
    T('Garden\nParty', 30, 430, 420, { font: 'Archivo Black', size: 92, color: CHAR, lh: 0.9, ls: -30 }),
    T('You are invited', 32, 618, 300, { font: 'Josefin Sans', size: 15, weight: 700, color: CHAR, upper: true, ls: 220 }),
    PAPER(W, H, 0.5),
  ]);
  const back = page(CREAM, [
    img(`${A('atomic-starburst')}.png`, 190, 30, 100, 100),
    T('Saturday\n7 June', 40, 170, 400, { font: 'Archivo Black', size: 58, color: CHAR, lh: 0.95, align: 'center', ls: -20 }),
    T('From three o\'clock', 40, 310, 400, { font: 'Josefin Sans', size: 18, weight: 700, color: TOMATO, upper: true, ls: 220, align: 'center' }),
    T('Lemonade on the lawn, lunch under the\npear tree, and records until it gets dark.', 40, 360, 400, { font: 'Josefin Sans', size: 17, weight: 400, color: CHAR, lh: 1.5, align: 'center' }),
    rect(40, 520, 400, 100, TEAL),
    T('Number 9, Orchard Lane\nRSVP to Marit by the first', 40, 545, 400, { font: 'Josefin Sans', size: 15, weight: 700, color: CREAM, lh: 1.5, align: 'center' }),
    PAPER(W, H, 0.5),
  ]);
  return tpl({ id: 'mid-century-garden-party-invite', name: 'Garden party invitation', format: 'invite', category: 'Invitation', tags: ['invitation', 'party', 'garden', 'birthday', 'two page'], pages: [front, back] });
})();

export default [coast, atomic, lamps, sleeve, chair, train, carousel, menu, invite];
