import { tpl, page, T, rect, L, img, overlay, stroke } from '../kit.mjs';

const A = (n, e = 'png') => `art/${n}.${e}`;
const GRAPE = A('earthy-grape-cutout'), COLLAGE = A('earthy-leaf-collage', 'jpg'), FLOWER = A('earthy-flower-cutout'), PEBBLES = A('earthy-pebble-column');

// ------------------------------------------------------------ 1
const grapePoster = (() => {
  const CREAM = '#F3EADA', GREEN = '#1F5B3A';
  const acts = [['Moritz Kissinger', 'Rheinhessen'], ['Alexander Schregel', 'Rheingau'], ['Ina Wihler', 'Baden'], ['Madame Flock', 'Mosel'], ['Shadowfolk', 'Mosel'], ['Tessa Maria Sprengar', 'Pfalz']];
  return tpl({
    id: 'earthy-grape-poster', name: 'Wine fair poster, cut paper grapes', format: 'poster', category: 'Poster', tags: ['wine', 'fair', 'event', 'cut paper', 'poster'],
    pages: [page(CREAM, [
      img(GRAPE, 380, 150, 700, 1050),
      T('Natural\nwine\nfair', 60, 80, 700, { font: 'Fraunces', size: 150, weight: 700, color: GREEN, lh: 0.88, ls: -30 }),
      T('16.03.2024', 60, 540, 400, { font: 'Fraunces', size: 40, weight: 500, color: GREEN }),
      T('Saturday, 12 to 20\nThe old brewery, Aarhus', 60, 600, 330, { font: 'DM Sans', size: 22, weight: 500, color: GREEN, lh: 1.35 }),
      L(60, 1230, 1063, 1230, GREEN, 2),
      acts.map(([n, r], i) => [
        T(n, 60 + (i % 2) * 520, 1260 + Math.floor(i / 2) * 56, 300, { font: 'Fraunces', size: 30, weight: 600, color: GREEN, lh: 1.1 }),
        T(r, 60 + (i % 2) * 520 + 280, 1272 + Math.floor(i / 2) * 56, 150, { font: 'DM Sans', size: 17, color: GREEN, opacity: 0.75, align: 'right' }),
      ]),
      T('Tickets 190 kr, glass included', 60, 1470, 600, { font: 'DM Sans', size: 20, weight: 600, color: GREEN }),
      T('redwine.example', 700, 1470, 363, { font: 'DM Sans', size: 20, weight: 600, color: GREEN, align: 'right' }),
      overlay('tex/paper-fibre.jpg', 1123, 1587, 'multiply', 0.35),
    ])],
  });
})();

// ------------------------------------------------------------ 2
const collagePost = (() => {
  const CREAM = '#F3EADA', GREEN = '#1F5B3A';
  return tpl({
    id: 'earthy-leaf-collage-post', name: 'Seed library, torn paper collage', format: 'post', category: 'Social', tags: ['collage', 'seed', 'garden', 'event', 'leaf'],
    pages: [page(GREEN, [
      img(COLLAGE, 0, 0, 1080, 1080),
      rect(60, 620, 640, 650, CREAM),
      T('Seed\nlibrary', 100, 660, 560, { font: 'Fraunces', size: 150, weight: 700, color: GREEN, lh: 0.9, ls: -30 }),
      T('Take some, bring some back. Open every first Saturday of the month, 10 to 14.', 100, 960, 540, { font: 'DM Sans', size: 28, weight: 500, color: GREEN, lh: 1.3 }),
      T('Folkets hus, Skarholmen\nSwap tables, tea and a talk on beans at 11', 100, 1120, 540, { font: 'DM Sans', size: 21, color: GREEN, lh: 1.4, opacity: 0.8 }),
      T('Free', 740, 1180, 280, { font: 'Fraunces', size: 90, weight: 700, color: CREAM, align: 'right' }),
      overlay('tex/paper-fibre.jpg', 1080, 1350, 'multiply', 0.3),
    ])],
  });
})();

// ------------------------------------------------------------ 3
const potterySlides = (() => {
  const CREAM = '#F1E8D6', CLAY = '#A5482B', INK = '#2A1A12';
  const col = (x, n, t, d) => [T(n, x, 290, 100, { font: 'Young Serif', size: 170, color: CLAY, lh: 1 }), T(t, x, 520, 520, { font: 'Young Serif', size: 62, color: INK, lh: 1.1 }), T(d, x, 620, 500, { font: 'DM Sans', size: 34, color: INK, lh: 1.4, opacity: 0.85 })];
  return tpl({
    id: 'earthy-pottery-slides', name: 'Pottery course, 3 slides', format: 'slide', category: 'Slides', tags: ['pottery', 'course', 'workshop', 'slides', 'terracotta'],
    pages: [
      page(CREAM, [
        img(PEBBLES, 1180, 40, 640, 960),
        T('Pottery\nfor\nbeginners', 100, 120, 1000, { font: 'Young Serif', size: 190, color: CLAY, lh: 0.95, ls: -30 }),
        T('Six Tuesday evenings in the studio on Verkstadsgatan. No experience needed, bring an apron.', 100, 780, 820, { font: 'DM Sans', size: 36, weight: 500, color: INK, lh: 1.35 }),
        T('Autumn term  •  8 places', 100, 960, 700, { font: 'DM Sans', size: 26, weight: 700, color: CLAY, ls: 100, upper: true }),
        overlay('tex/paper-fibre.jpg', 1920, 1080, 'multiply', 0.3),
      ]),
      page(CREAM, [
        T('What you will make', 100, 90, 1200, { font: 'Young Serif', size: 90, color: INK, ls: -10 }),
        L(100, 230, 1820, 230, CLAY, 3),
        col(100, '1', 'A pinch pot', 'Week one. Learn how the clay moves and what a thumb can do.'),
        col(720, '2', 'Coil and slab', 'Weeks two to four. A tall jug, a plate and a small planter.'),
        col(1340, '3', 'Glaze day', 'Weeks five and six. Colours, wax resist and a first firing.'),
        T('All firings and clay are included.', 100, 980, 900, { font: 'DM Sans', size: 28, weight: 700, color: CLAY }),
        overlay('tex/paper-fibre.jpg', 1920, 1080, 'multiply', 0.3),
      ]),
      page(CLAY, [
        rect(1260, 0, 660, 1080, CREAM),
        img(PEBBLES, 1300, 60, 580, 960),
        T('Join us', 100, 100, 1000, { font: 'Young Serif', size: 190, color: CREAM, ls: -30, lh: 1 }),
        T('1 800 kr', 100, 420, 900, { font: 'Young Serif', size: 120, color: CREAM, lh: 1 }),
        T('for six evenings, clay and firing.\nStudents 1 400 kr.', 100, 570, 900, { font: 'DM Sans', size: 36, color: CREAM, lh: 1.35 }),
        T('Sign up at\nstudio.example/course\nor ask at the counter.', 100, 800, 900, { font: 'DM Sans', size: 36, weight: 700, color: CREAM, lh: 1.35 }),
        overlay('tex/paper-fibre.jpg', 1920, 1080, 'multiply', 0.25),
      ]),
    ],
  });
})();

// ------------------------------------------------------------ 4
const giantLetters = (() => {
  const SAND = '#DDD2BF', CLAY = '#A5482B';
  return tpl({
    id: 'earthy-giant-letters', name: 'Open studio, giant cropped letters', format: 'story', category: 'Social', tags: ['ceramics', 'studio', 'open day', 'typography', 'story'],
    pages: [page(SAND, [
      T('CL', -60, -30, 1300, { font: 'Fraunces', size: 880, weight: 800, color: CLAY, lh: 0.9, ls: -40 }),
      T('AY', -60, 700, 1300, { font: 'Fraunces', size: 880, weight: 800, color: CLAY, lh: 0.9, ls: -40 }),
      rect(60, 1530, 960, 330, SAND),
      T('Open studio', 90, 1560, 900, { font: 'Fraunces', size: 90, weight: 700, color: '#2A1A12', ls: -20, lh: 1 }),
      T('Saturday 9 November, 11 to 17\nMeet the potters, try the wheel,\nbuy seconds at half price.', 90, 1680, 900, { font: 'DM Sans', size: 32, weight: 500, color: '#2A1A12', lh: 1.4 }),
      overlay('tex/paper-fibre.jpg', 1080, 1920, 'multiply', 0.4),
    ])],
  });
})();

// ------------------------------------------------------------ 5
const flowerShare = (() => {
  const PINK = '#F2B9CF', RED = '#D83A2B', CREAM = '#FBEFE6';
  return tpl({
    id: 'earthy-flower-share', name: 'Flower share, cut paper blooms', format: 'pin', category: 'Poster', tags: ['flowers', 'subscription', 'farm', 'cut paper', 'pink'],
    pages: [page(PINK, [
      img(FLOWER, 120, 40, 760, 1140),
      rect(0, 1090, 1000, 410, RED),
      T('Flower share', 50, 1110, 900, { font: 'Bricolage Grotesque', size: 150, weight: 800, color: CREAM, ls: -60, lh: 1 }),
      T('Each Friday from June to September we cut a bunch from the field and leave it at the farm gate. Sign up for the season and pick up on the way home.', 54, 1290, 560, { font: 'DM Sans', size: 23, weight: 500, color: CREAM, lh: 1.35 }),
      T('1 100 kr\nfor 16 bunches', 680, 1290, 270, { font: 'Bricolage Grotesque', size: 34, weight: 700, color: CREAM, lh: 1.15, align: 'right' }),
      T('Limited to 40 members. Sign up at gardenfarm.example', 54, 1445, 896, { font: 'DM Sans', size: 18, weight: 600, color: CREAM }),
      overlay('tex/paper-fibre.jpg', 1000, 1500, 'multiply', 0.3),
    ])],
  });
})();

export default [grapePoster, collagePost, potterySlides, giantLetters, flowerShare];
