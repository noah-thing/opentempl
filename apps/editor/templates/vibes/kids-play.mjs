// Kids play: gouache fruit and confetti are commissioned artwork; the rest is type and flat toy shapes.
import { tpl, page, T, S, rect, circle, L, img, overlay, pattern } from '../kit.mjs';

const BLUE = '#2B50E8', RED = '#F0432B', YELLOW = '#FFD11F', GREEN = '#1FA35C', PINK = '#FF8FB8', ORANGE = '#FF8A1F', INK = '#1B1B2F', CREAM = '#FBF6E9';
const FRUIT = 'art/kids-gouache-fruit-faces.png';
const CONF = 'art/kids-gouache-confetti.jpg';
const fruit = (k, x, y, w, p = {}) => {
  const c = { pear: [0.04, 0.01, 0.29, 0.43], banana: [0.35, 0.02, 0.36, 0.42], apple: [0.68, 0.06, 0.31, 0.33], straw: [0.04, 0.45, 0.28, 0.33], lemon: [0.35, 0.42, 0.33, 0.42], cherry: [0.67, 0.42, 0.32, 0.33], blue: [0.2, 0.75, 0.25, 0.24], orange: [0.56, 0.72, 0.32, 0.27] }[k];
  return img(FRUIT, x, y, w, Math.round((w * c[3]) / c[2]), { crop: { x: c[0], y: c[1], w: c[2], h: c[3] }, ...p });
};
const letters = (text, colors) => text.split('').map((ch, i) => ({ start: i, end: i + 1, color: colors[i % colors.length] }));
const RAINBOW = [BLUE, RED, GREEN, YELLOW, PINK, ORANGE];

export default [
  // 1 ------------------------------------------------------------
  tpl({
    id: 'kids-two-is-fun', name: 'Second birthday invite', format: 'invite', category: 'Invitation', tags: ['birthday', 'invite', 'toddler', 'party'],
    pages: [page(CREAM, [
      img(CONF, 0, 0, 480, 673, { crop: { x: 0, y: 0, w: 0.475, h: 1 } }),
      rect(34, 60, 412, 550, '#FFFFFF', { radius: 30 }),
      T('two', 34, 76, 412, { font: 'Chango', size: 150, align: 'center', color: BLUE, lh: 1, runs: letters('two', [BLUE, RED, GREEN]) }),
      T('is fun', 34, 232, 412, { font: 'Titan One', size: 76, align: 'center', color: YELLOW, lh: 1, runs: letters('is fun', [ORANGE, ORANGE, PINK, PINK, PINK, PINK]) }),
      T('Steve is turning two', 34, 330, 412, { font: 'Fredoka', weight: 600, size: 28, align: 'center', color: INK }),
      T('Saturday 14 September\n2 to 4 in the afternoon\nLittle Oak Hall', 34, 392, 412, { font: 'Fredoka', weight: 500, size: 22, align: 'center', lh: 1.45, color: INK }),
      T('There will be cake and a bubble machine.\nPlease tell Maria if anyone has allergies:\n070 123 45 67', 34, 500, 412, { font: 'Fredoka', size: 16, align: 'center', lh: 1.45, color: INK }),
    ])],
  }),

  // 2 ------------------------------------------------------------
  tpl({
    id: 'kids-fruit-party', name: 'Fruit party invite', format: 'invite', category: 'Invitation', tags: ['birthday', 'invite', 'fruit', 'party'],
    pages: [
      page(BLUE, [
        fruit('pear', 20, 30, 120, { rotation: -10 }), fruit('banana', 330, 40, 150, { rotation: 8 }), fruit('cherry', 0, 470, 150, { rotation: 6 }), fruit('apple', 350, 500, 130, { rotation: -8 }),
        fruit('lemon', 180, 560, 110, { rotation: 4 }),
        T('Sophie\nis turning 6', 40, 190, 400, { font: 'Lilita One', size: 62, lh: 0.98, align: 'center', color: '#FFFFFF' }),
        T('and we are having\na birthday party', 40, 360, 400, { font: 'Fredoka', weight: 500, size: 24, lh: 1.25, align: 'center', color: '#FFFFFF' }),
      ]),
      page(YELLOW, [
        fruit('straw', 340, 540, 120, { rotation: 10 }), fruit('orange', 30, 560, 120, { rotation: -6 }), fruit('blue', 250, 600, 50, { rotation: 5 }),
        T('Sunday 7 August', 40, 90, 400, { font: 'Lilita One', size: 46, color: INK }),
        T('5 p.m.', 40, 150, 400, { font: 'Lilita One', size: 46, color: INK }),
        T('Our place, Bjorkgatan 3\nNear the red gate', 40, 250, 400, { font: 'Fredoka', weight: 500, size: 26, lh: 1.35, color: INK }),
        T('Bring something to wear that\ncan get paint on it.', 40, 370, 400, { font: 'Fredoka', size: 22, lh: 1.35, color: INK }),
        T('Say yes by 1 August:\nDaniel, 070 765 43 21', 40, 460, 360, { font: 'Fredoka', weight: 600, size: 20, lh: 1.35, color: INK }),
      ]),
    ],
  }),

  // 3 ------------------------------------------------------------
  (() => {
    const tile = (ch, x, y, c, r, tc = '#fff') => [
      rect(x + 10, y + 12, 205, 205, INK, { radius: 28, rotation: r }),
      rect(x, y, 205, 205, c, { radius: 28, rotation: r }),
      T(ch, x, y + 6, 205, { font: 'Chango', size: 150, align: 'center', color: tc, lh: 1.1, rotation: r }),
    ];
    const row1 = ['B', 'U', 'I', 'L', 'D'], row2 = ['D', 'A', 'Y'];
    return tpl({
      id: 'kids-build-day', name: 'Building blocks day poster', format: 'poster', category: 'Event', tags: ['kids', 'workshop', 'blocks', 'poster'],
      pages: [page(CREAM, [
        ...row1.flatMap((ch, i) => tile(ch, 30 + i * 214, 110 + (i % 2) * 24, [BLUE, RED, GREEN, ORANGE, PINK][i], [-3, 2, -2, 3, -4][i], i === 3 ? INK : '#fff')),
        ...row2.flatMap((ch, i) => tile(ch, 150 + i * 214, 400 + (i % 2 ? -10 : 10), [YELLOW, BLUE, RED][i], [2, -3, 4][i], i === 0 ? INK : '#fff')),
        img(CONF, 0, 740, 1123, 480, { crop: { x: 0, y: 0, w: 1, h: 0.62 } }),
        T('A whole day with a thousand blocks, a table the length of the room and no instructions.', 60, 1220, 700, { font: 'Fredoka', weight: 600, size: 40, lh: 1.25, color: INK }),
        T('Saturday 9 November\n10 to 15', 60, 1420, 400, { font: 'Fredoka', weight: 600, size: 28, lh: 1.3, color: INK }),
        T('Biblioteket, Stortorget 2\nAges 4 to 10, free', 480, 1420, 400, { font: 'Fredoka', weight: 500, size: 28, lh: 1.3, color: INK }),
      ])],
    });
  })(),

  // 4 ------------------------------------------------------------
  tpl({
    id: 'kids-double-fun', name: 'Twin birthday post', format: 'post', category: 'Invitation', tags: ['birthday', 'twins', 'party', 'invite'],
    pages: [page(BLUE, [
      rect(0, 1090, 1080, 90, '#fff', { fill: pattern('checker', INK, '#ffffff', 7) }),
      S('burst', 40, 400, 520, 520, YELLOW, { rotation: -8 }),
      S('burst', 520, 360, 520, 520, PINK, { rotation: 10 }),
      T('DOUBLE\nTHE FUN', 40, 40, 1000, { font: 'Titan One', size: 150, lh: 0.92, align: 'center', color: YELLOW }),
      T('ARLO', 40, 500, 520, { font: 'Titan One', size: 120, align: 'center', color: BLUE, rotation: -8 }),
      T('4', 40, 610, 520, { font: 'Titan One', size: 220, align: 'center', color: RED, rotation: -8 }),
      T('ELSIE', 520, 470, 520, { font: 'Titan One', size: 120, align: 'center', color: BLUE, rotation: 10 }),
      T('6', 520, 580, 520, { font: 'Titan One', size: 220, align: 'center', color: RED, rotation: 10 }),
      T('Sunday 9 November, 11 a.m.', 40, 1200, 1000, { font: 'Lilita One', size: 52, align: 'center', color: '#fff' }),
      T('Little Oak Hall. Please tell us by 25 October.', 40, 1270, 1000, { font: 'Fredoka', weight: 500, size: 30, align: 'center', color: '#fff' }),
    ])],
  }),

  // 5 ------------------------------------------------------------
  tpl({
    id: 'kids-sports-day', name: 'Sports day story', format: 'story', category: 'Event', tags: ['sports', 'school', 'kids', 'story'],
    pages: [page('#8FD3F4', [
      circle(140, 150, 800, YELLOW),
      T('SPORTS\nDAY', 40, 360, 1000, { font: 'Chango', size: 175, lh: 0.9, align: 'center', color: RED }),
      S('ellipse', -300, 1250, 1100, 900, GREEN), S('ellipse', 450, 1350, 1100, 900, '#17894E'),
      fruit('pear', 70, 1000, 300, { rotation: -6 }), fruit('apple', 400, 1070, 280, { rotation: 5 }), fruit('banana', 700, 960, 330, { rotation: 8 }),
      T('Saturday 14 June', 40, 1630, 1000, { font: 'Lilita One', size: 76, align: 'center', color: '#fff' }),
      T('Aspuddens IP, from 10. Bring a water bottle.', 40, 1730, 1000, { font: 'Fredoka', weight: 500, size: 36, align: 'center', color: '#fff' }),
    ])],
  }),

  // 6 ------------------------------------------------------------
  tpl({
    id: 'kids-big-one', name: 'First birthday post', format: 'post', category: 'Invitation', tags: ['birthday', 'first', 'baby', 'invite'],
    pages: [page('#D9C7F4', [
      T('1', 680, -120, 600, { font: 'Titan One', size: 1000, lh: 1, color: ORANGE }),
      fruit('cherry', 70, 840, 320, { rotation: -8 }), fruit('straw', 400, 1000, 240, { rotation: 6 }),
      T('MOLLY\nTURNS', 50, 60, 700, { font: 'Titan One', size: 150, lh: 0.9, color: INK }),
      T('Saturday 5 August\nat 2 pm', 50, 440, 500, { font: 'Fredoka', weight: 600, size: 44, lh: 1.25, color: INK }),
      T('Cake and ice cream\nin the garden,\nBjorkvagen 9', 50, 640, 450, { font: 'Fredoka', weight: 500, size: 36, lh: 1.3, color: INK }),
    ])],
  }),
];
