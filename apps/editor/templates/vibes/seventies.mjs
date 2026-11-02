import { tpl, page, T, S, rect, circle, L, img, overlay } from '../kit.mjs';

// Seventies, image led. The artwork (screen print stripes, suns, ribbons) lives in public/library/art/seventies-*.
const CREAM = '#F3E7CE';
const CHOC = '#3A1F17';
const RUST = '#C9452A';
const ORANGE = '#E4701E';
const MUSTARD = '#EFA81E';
const BLUE = '#1E3F9B';
const AVO = '#6B7A2B';

const GRAIN = (W, H, o = 0.45) => overlay('tex/paper-fibre.jpg', W, H, 'multiply', o);
const SPECK = (W, H, o = 0.3) => overlay('tex/risograph-speckle.jpg', W, H, 'multiply', o);
const A = (n) => `art/seventies-${n}`;

// 1. City arches poster
const cityArches = tpl({
  id: 'seventies-city-arches', name: 'City arches poster', format: 'poster', category: 'Event',
  tags: ['travel', 'city', 'festival', 'poster', 'stripes'],
  pages: [page(CREAM, [
    img(`${A('arches-poster')}.jpg`, 0, 0, 1123, 1587),
    T('Stockholm 74', 60, 56, 400, { font: 'DM Sans', size: 30, weight: 700, color: CHOC }),
    T('Harbour\nDays', 56, 1075, 1000, { font: 'Caprasimo', size: 150, color: CHOC, lh: 0.88, ls: -30 }),
    T('Boats, brass bands and\nlong tables on the quay.', 650, 1250, 413, { font: 'DM Sans', size: 27, weight: 500, color: CHOC, lh: 1.3 }),
    L(60, 1450, 1063, 1450, CHOC, 2),
    T('Saturday 17 August', 60, 1474, 400, { font: 'DM Sans', size: 26, weight: 700, color: CHOC }),
    T('Noon until late', 430, 1474, 300, { font: 'DM Sans', size: 26, weight: 500, color: CHOC }),
    T('Free entry, all piers', 760, 1474, 303, { font: 'DM Sans', size: 26, weight: 500, color: CHOC, align: 'right' }),
    GRAIN(1123, 1587, 0.3),
  ])],
});

// 2. Hello announcement
const trailWord = tpl({
  id: 'seventies-stacked-hello', name: 'Hello announcement', format: 'post', category: 'Social',
  tags: ['announcement', 'opening', 'type', 'stripes', 'launch'],
  pages: [page('#F4E6CB', [
    img(`${A('ribbon-wave')}.png`, -160, 300, 1400, 933),
    T('No. 07', 70, 70, 300, { font: 'DM Sans', size: 26, weight: 700, color: CHOC, upper: true, ls: 160 }),
    T('Opening party', 610, 70, 400, { font: 'DM Sans', size: 26, weight: 700, color: CHOC, upper: true, ls: 160, align: 'right' }),
    T('Hello', 70, 130, 960, { font: 'Caprasimo', size: 350, color: RUST, ls: -30, lh: 1 }),
    L(70, 1090, 1010, 1090, CHOC, 2),
    T('Come early, the\nfirst loaf is free.', 70, 1126, 520, { font: 'DM Sans', size: 44, weight: 700, color: CHOC, lh: 1.1, ls: -10 }),
    T('Saturday 14 June\n09:00 to 15:00', 620, 1130, 390, { font: 'DM Sans', size: 28, weight: 500, color: CHOC, lh: 1.3, align: 'right' }),
    T('Kvarnvägen 12, ground floor', 620, 1230, 390, { font: 'DM Sans', size: 28, weight: 700, color: CHOC, align: 'right' }),
    GRAIN(1080, 1350, 0.5),
  ])],
});

// 3. Summer sessions square
const sunSquare = tpl({
  id: 'seventies-sun-reflection', name: 'Summer sessions square', format: 'square', category: 'Event',
  tags: ['music', 'summer', 'festival', 'sun', 'stripes'],
  pages: [page(CREAM, [
    img(`${A('sun-water')}.jpg`, 0, 0, 1080, 1080),
    T('Summer\nSessions', 60, 50, 760, { font: 'Caprasimo', size: 112, color: CHOC, lh: 0.9, ls: -28 }),
    T('Live on the roof, every Friday in July', 60, 985, 700, { font: 'DM Sans', size: 30, weight: 700, color: CHOC }),
    T('From 18:00', 780, 985, 240, { font: 'DM Sans', size: 30, weight: 700, color: CHOC, align: 'right' }),
  ])],
});

// 4. Festival story
const sunStory = tpl({
  id: 'seventies-sun-festival-story', name: 'Sun festival story', format: 'story', category: 'Event',
  tags: ['festival', 'story', 'curved', 'sun', 'music'],
  pages: [page('#E8601C', [
    img(`${A('sun-rings')}.png`, 140, 440, 800, 800),
    T('SOUTH FOR THE SUN', 40, 170, 1000, { font: 'Fraunces', size: 120, weight: 900, color: BLUE, curve: 45, align: 'center', ls: -20 }),
    T('8 to 10\nAugust', 90, 1290, 900, { font: 'Fraunces', size: 170, weight: 900, color: BLUE, align: 'center', lh: 0.88, ls: -40 }),
    T('Valbyparken, free entry', 90, 1640, 900, { font: 'Fraunces', size: 56, weight: 800, color: BLUE, align: 'center', ls: -10 }),
    T('Three stages and a bring your own blanket lawn', 90, 1720, 900, { font: 'DM Sans', size: 32, weight: 500, color: BLUE, align: 'center' }),
    SPECK(1080, 1920, 0.4),
  ])],
});

// 5. Ribbon thumbnail
const ribbonThumb = tpl({
  id: 'seventies-ribbon-thumb', name: 'Ribbon thumbnail', format: 'thumb', category: 'Social',
  tags: ['youtube', 'podcast', 'thumbnail', 'ribbon', 'music'],
  pages: [page('#2B1712', [
    img(`${A('ribbon-wave')}.png`, -110, 160, 1500, 1000),
    T('Slow\nRecords', 76, 60, 640, { font: 'Caprasimo', size: 150, color: '#F4DDB0', lh: 0.86, ls: -25 }),
    T('Episode 12', 80, 330, 400, { font: 'DM Sans', size: 34, weight: 700, color: '#F4DDB0', upper: true, ls: 140 }),
    T('Why we kept\nthe crackle', 780, 70, 440, { font: 'DM Sans', size: 40, weight: 700, color: '#F4DDB0', lh: 1.1, align: 'right' }),
    SPECK(1280, 720, 0.25),
  ])],
});

// 6. Radial sleeve
const radialSleeve = tpl({
  id: 'seventies-radial-sleeve', name: 'Radial record sleeve', format: 'square', category: 'Music',
  tags: ['album', 'record', 'sleeve', 'cover', 'radial'],
  pages: [page(BLUE, [
    img(`${A('radial-emblem')}.png`, 160, 40, 760, 760),
    T('Orange\nHour', 60, 830, 700, { font: 'Caprasimo', size: 120, color: CREAM, lh: 0.86, ls: -25 }),
    T('Side A', 770, 840, 250, { font: 'DM Sans', size: 28, weight: 700, color: CREAM, upper: true, ls: 160, align: 'right' }),
    T('Nine songs for\nthe drive home', 770, 890, 250, { font: 'DM Sans', size: 26, weight: 500, color: CREAM, lh: 1.25, align: 'right' }),
    L(770, 1010, 1020, 1010, CREAM, 2),
    T('Stereo 33 rpm', 770, 1028, 250, { font: 'DM Sans', size: 22, weight: 500, color: CREAM, upper: true, ls: 140, align: 'right' }),
    SPECK(1080, 1080, 0.3),
  ])],
});

// 7. Diner menu
const dinerMenu = (() => {
  const W = 794, H = 1123;
  const row = (name, price, desc, y, x = 50, w = 694, col = CHOC) => [
    T(name, x, y, w - 90, { font: 'DM Sans', size: 29, weight: 700, color: col }),
    T(price, x + w - 90, y + 2, 90, { font: 'Caprasimo', size: 30, color: col === CHOC ? RUST : MUSTARD, align: 'right' }),
    T(desc, x, y + 42, w - 120, { font: 'DM Sans', size: 20, weight: 400, color: col, opacity: 0.85 }),
  ];
  const items1 = [
    ['Two eggs any way', '78', 'Rye toast, brown butter, a pickled cucumber.'],
    ['Blueberry pancakes', '92', 'A stack of three, whipped cream, maple.'],
    ['Corner omelette', '98', 'Ham, cheddar, chives and home fries.'],
    ['Cardamom porridge', '64', 'Baked pear and toasted oats.'],
    ['Grilled cheese', '88', 'Sourdough, three cheeses, tomato soup.'],
    ['Hash and a fried egg', '96', 'Potato, onion, smoked sausage.'],
  ];
  const p1 = page(CREAM, [
    img(`${A('quarter-stripes')}.png`, 794 - 290, 0, 290, 290),
    T('The Corner\nDiner', 50, 56, 520, { font: 'Caprasimo', size: 82, color: CHOC, lh: 0.88, ls: -25 }),
    T('Breakfast, all day', 50, 262, 500, { font: 'DM Sans', size: 34, weight: 700, color: RUST }),
    L(50, 330, 744, 330, CHOC, 2),
    ...items1.flatMap((it, i) => row(it[0], it[1], it[2], 358 + i * 90)),
    L(50, 960, 744, 960, CHOC, 2),
    T('Open seven to three, Tuesday to Sunday', 50, 984, 694, { font: 'DM Sans', size: 20, weight: 700, color: CHOC, upper: true, ls: 100 }),
    T('Cash or card. Dogs on the patio, please.', 50, 1030, 694, { font: 'DM Sans', size: 20, weight: 400, color: CHOC }),
    GRAIN(W, H, 0.45),
  ]);
  const a = [['Black coffee', '32', 'Free refills until noon.'], ['Milkshake', '58', 'Thick enough for the spoon.'], ['Orange soda', '36', 'Cold glass bottle.'], ['Iced tea', '34', 'Peach, no sugar added.']];
  const b = [['Apple pie', '62', 'Warm, with cinnamon cream.'], ['Rice pudding', '48', 'Plum jam in the middle.'], ['Cinnamon bun', '38', 'Baked every hour.'], ['Lemon tart', '56', 'Sharp, with a shortbread base.']];
  const p2 = page('#3A1F17', [
    T('Something\nto drink', 50, 56, 340, { font: 'Caprasimo', size: 62, color: MUSTARD, lh: 0.9, ls: -20 }),
    T('Sweet\nthings', 424, 56, 340, { font: 'Caprasimo', size: 62, color: '#E58A7A', lh: 0.9, ls: -20 }),
    L(50, 214, 372, 214, CREAM, 2), L(424, 214, 744, 214, CREAM, 2),
    ...a.flatMap((it, i) => row(it[0], it[1], it[2], 244 + i * 98, 50, 322, CREAM)),
    ...b.flatMap((it, i) => row(it[0], it[1], it[2], 244 + i * 98, 424, 320, CREAM)),
    img(`${A('half-arch')}.png`, 0, H - 0.84 * 794, 794, 794),
    SPECK(W, H, 0.25),
  ]);
  return tpl({ id: 'seventies-diner-menu', name: 'Diner menu', format: 'a4', category: 'Menu', tags: ['menu', 'cafe', 'diner', 'restaurant', 'two page'], pages: [p1, p2] });
})();

// 8. Carousel
const carousel = (() => {
  const W = 1080, H = 1350;
  const num = (n, col) => T(n, 40, 330, 1000, { font: 'Caprasimo', size: 560, color: col, ls: -40, lh: 1 });
  return tpl({
    id: 'seventies-carousel-fern', name: 'Tips carousel', format: 'post', category: 'Social',
    tags: ['carousel', 'tips', 'plants', 'instagram', 'series'],
    pages: [
      page(MUSTARD, [
        img(`${A('quarter-stripes')}.png`, W - 400, H - 400, 400, 400, { rotation: 180 }),
        T('Fern care in three notes', 60, 62, 600, { font: 'DM Sans', size: 24, weight: 700, color: CHOC, upper: true, ls: 140 }),
        T('How to keep\na fern\nhappy', 60, 150, 960, { font: 'Caprasimo', size: 190, color: CHOC, lh: 0.9, ls: -40 }),
        T('From the plant shop on Mill Street.', 60, 1030, 520, { font: 'DM Sans', size: 34, weight: 500, color: CHOC, lh: 1.25 }),
        T('Swipe', 60, 1230, 300, { font: 'DM Sans', size: 26, weight: 700, color: CHOC, upper: true, ls: 160 }),
        L(190, 1245, 290, 1245, CHOC, 3, { end: 'arrow' }),
        GRAIN(W, H, 0.45),
      ]),
      page(RUST, [
        img(`${A('quarter-stripes')}.png`, W - 520, 0, 520, 520),
        num('01', MUSTARD),
        T('Light', 60, 880, 960, { font: 'Caprasimo', size: 150, color: CREAM, ls: -30 }),
        T('Bright but not direct. A north window is plenty.', 60, 1080, 700, { font: 'DM Sans', size: 36, weight: 500, color: CREAM, lh: 1.25 }),
        GRAIN(W, H, 0.45),
      ]),
      page(AVO, [
        img(`${A('quarter-stripes')}.png`, W - 330, H - 330, 330, 330, { rotation: 180 }),
        num('02', CREAM),
        T('Water', 60, 880, 960, { font: 'Caprasimo', size: 150, color: CHOC, ls: -30 }),
        T('Keep the soil as damp as a wrung out sponge. Lukewarm, from the bottom.', 60, 1080, 600, { font: 'DM Sans', size: 36, weight: 500, color: CREAM, lh: 1.25 }),
        GRAIN(W, H, 0.45),
      ]),
      page(CREAM, [
        img(`${A('half-arch')}.png`, 90, H - 0.84 * 900, 900, 900),
        T('03', 40, 70, 1000, { font: 'Caprasimo', size: 560, color: RUST, ls: -40, lh: 1 }),
        T('Patience', 60, 560, 960, { font: 'Caprasimo', size: 150, color: CHOC, ls: -30 }),
        T('It will drop a few leaves in the first month. Wait it out, then pass this on to a friend.', 60, 760, 760, { font: 'DM Sans', size: 36, weight: 500, color: CHOC, lh: 1.25 }),
        GRAIN(W, H, 0.45),
      ]),
    ],
  });
})();

// 9. Deck
const deck = (() => {
  const W = 1920, H = 1080;
  const s1 = page(CREAM, [
    img(`${A('half-arch')}.png`, 1546 - 550, 540 - 550, 1100, 1100, { rotation: 270 }),
    T('Studio update', 120, 110, 700, { font: 'DM Sans', size: 34, weight: 700, color: CHOC, upper: true, ls: 160 }),
    T('A good\nyear on\nthe ground', 120, 250, 1000, { font: 'Caprasimo', size: 165, color: CHOC, lh: 0.9, ls: -40 }),
    T('Annual review, Fern & Fold', 120, 900, 800, { font: 'DM Sans', size: 44, weight: 700, color: RUST }),
    T('September 2025', 120, 970, 600, { font: 'DM Sans', size: 30, weight: 500, color: CHOC }),
    GRAIN(W, H, 0.45),
  ]);
  const s2 = page('#F4E6CB', [
    img(`${A('half-arch')}.png`, 1100, H - 0.84 * 900 + 60, 900, 900),
    T('74%', 100, 200, 1100, { font: 'Caprasimo', size: 470, color: RUST, ls: 0, lh: 1 }),
    T('of customers\ncame back within\nthe month.', 1190, 200, 640, { font: 'DM Sans', size: 56, weight: 700, color: CHOC, lh: 1.12, ls: -10 }),
    L(1190, 520, 1800, 520, CHOC, 2),
    T('Up from 51% last year, with the same\nopening hours and the same two ovens.', 1190, 550, 640, { font: 'DM Sans', size: 30, weight: 500, color: CHOC, lh: 1.3 }),
    T('02', 120, 960, 200, { font: 'DM Sans', size: 28, weight: 700, color: CHOC, ls: 100 }),
    GRAIN(W, H, 0.45),
  ]);
  const s3 = page(MUSTARD, [
    T('Three things we learned', 120, 80, 1400, { font: 'Caprasimo', size: 80, color: CHOC, ls: -20 }),
    L(120, 200, 1800, 200, CHOC, 3),
    ...[['Bake smaller', 'Two batches an hour beat one big one. Less waste, warmer bread.', 120], ['Open earlier', 'The seven o\'clock crowd is the one that returns on Saturday.', 720], ['Say the price', 'A chalkboard with real numbers brought more people than any poster.', 1320]]
      .flatMap(([t, b, x]) => [
        img(`${A('sun-rings')}.png`, x, 250, 380, 380),
        T(t, x, 670, 520, { font: 'Caprasimo', size: 72, color: CHOC, ls: -20, lh: 0.95 }),
        T(b, x, 780, 480, { font: 'DM Sans', size: 34, weight: 500, color: CHOC, lh: 1.3 }),
      ]),
    T('03', 120, 960, 200, { font: 'DM Sans', size: 28, weight: 700, color: CHOC, ls: 100 }),
    GRAIN(W, H, 0.45),
  ]);
  const s4 = page(RUST, [
    img(`${A('half-arch')}.png`, 620, H - 0.84 * 1000, 1000, 1000),
    T('Next up', 120, 100, 800, { font: 'DM Sans', size: 34, weight: 700, color: CREAM, upper: true, ls: 160 }),
    T('A second oven,\na longer table.', 120, 170, 1500, { font: 'Caprasimo', size: 150, color: CREAM, lh: 0.92, ls: -30 }),
    T('hello@fernandfold.example', 120, 960, 800, { font: 'DM Sans', size: 32, weight: 700, color: CREAM }),
    T('04', 1700, 960, 100, { font: 'DM Sans', size: 28, weight: 700, color: CREAM, ls: 100, align: 'right' }),
    GRAIN(W, H, 0.45),
  ]);
  return tpl({ id: 'seventies-update-deck', name: 'Annual update deck', format: 'slide', category: 'Presentation', tags: ['slides', 'deck', 'report', 'presentation', 'annual'], pages: [s1, s2, s3, s4] });
})();

// 10. Block party flyer
const blockParty = tpl({
  id: 'seventies-block-party-flyer', name: 'Block party flyer', format: 'flyer', category: 'Event',
  tags: ['party', 'flyer', 'neighbourhood', 'bold', 'street'],
  pages: [page('#C8321E', [
    T('BLOCK\nPARTY', 30, 30, 520, { font: 'Bowlby One', size: 118, color: '#F6C13A', lh: 0.88, ls: -30 }),
    img(`${A('sun-rings')}.png`, 290, 290, 240, 240),
    T('Long tables, loud speakers\nand a grill that never stops.', 30, 310, 250, { font: 'DM Sans', size: 22, weight: 700, color: '#F4DDB0', lh: 1.2 }),
    T('Saturday\n9 August', 30, 570, 250, { font: 'Bowlby One', size: 38, color: '#F6C13A', lh: 1, ls: -10 }),
    T('From 14:00 until\nthe lights go out', 310, 580, 220, { font: 'DM Sans', size: 20, weight: 500, color: '#F4DDB0', lh: 1.3 }),
    L(30, 700, 529, 700, '#F4DDB0', 1.5),
    T('Fjällgatan, between 12 and 30', 30, 716, 499, { font: 'DM Sans', size: 16, weight: 700, color: '#F4DDB0', upper: true, ls: 120 }),
    T('Bring a chair', 30, 744, 499, { font: 'DM Sans', size: 16, weight: 500, color: '#F4DDB0', upper: true, ls: 120 }),
    SPECK(559, 794, 0.45),
  ])],
});

export default [cityArches, trailWord, sunSquare, sunStory, ribbonThumb, radialSleeve, dinerMenu, carousel, deck, blockParty];
