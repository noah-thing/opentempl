// Cute mascot: the characters are commissioned artwork (flat, outlined, original); type and layout are built here.
import { tpl, page, T, rect, circle, L, img, S } from '../kit.mjs';

const COBALT = '#2F54EB', CREAM = '#F6F0E2', RED = '#F24630', MUSTARD = '#F3B61F', PINK = '#FF7AB8', INK = '#1B1B1B';
const CAST = 'art/mascot-cast-sheet.png';
const CR = { cup: [0.019, 0.334, 0.158, 0.36], blob: [0.184, 0.4, 0.21, 0.292], beet: [0.391, 0.228, 0.21, 0.466], cloud: [0.6, 0.38, 0.203, 0.265], star: [0.805, 0.364, 0.182, 0.33] };
// height follows the crop so the character is never squashed
const mc = (k, x, y, w, p = {}) => { const c = CR[k]; return img(CAST, x, y, w, Math.round((w * c[3] * 933) / (c[2] * 1400)), { crop: { x: c[0], y: c[1], w: c[2], h: c[3] }, ...p }); };
const mh = (k, w) => Math.round((w * CR[k][3] * 933) / (CR[k][2] * 1400));

export default [
  // 1 ------------------------------------------------------------
  (() => {
    const row = [['cup', 287, 'Latte', 'Always tired.'], ['blob', 382, 'Bloop', 'Never stops asking.'], ['beet', 382, 'Beta', 'Knows better.'], ['cloud', 356, 'Puff', 'Thinks you are great.'], ['star', 331, 'Nova', 'Says very little.']];
    let x = 40;
    const placed = row.map(([k, w, name, line]) => { const e = { k, w, name, line, x }; x += w + 30; return e; });
    return tpl({
      id: 'mascot-meet-the-crew', name: 'Meet the crew slides', format: 'slide', category: 'Presentation', tags: ['team', 'about', 'characters', 'slides'],
      pages: [
        page(CREAM, [
          rect(0, 0, 1920, 330, COBALT),
          T('Meet the crew', 90, 90, 1700, { font: 'Titan One', size: 150, color: CREAM, lh: 1 }),
          T('Five regulars who run the place', 96, 250, 1200, { font: 'Fredoka', weight: 500, size: 38, color: CREAM }),
          ...placed.flatMap((e) => [mc(e.k, e.x, 890 - mh(e.k, e.w), e.w), T(e.name, e.x, 925, e.w, { font: 'Titan One', size: 44, align: 'center', color: INK }), T(e.line, e.x - 10, 985, e.w + 20, { font: 'Fredoka', size: 26, align: 'center', color: INK })]),
        ]),
        page(MUSTARD, [
          mc('cup', 1100, 180, 440),
          T('Latte', 100, 140, 900, { font: 'Titan One', size: 230, color: INK, lh: 1 }),
          T('Opens the shop at six, closes it at three, and has opinions about both.', 106, 450, 820, { font: 'Fredoka', weight: 500, size: 46, lh: 1.3, color: INK }),
          T('Likes: oat milk, quiet mornings\nDislikes: queues, the word “quick”', 106, 760, 820, { font: 'Fredoka', size: 34, lh: 1.5, color: INK }),
        ]),
        page(PINK, [
          mc('star', 1400, 160, 340), mc('cloud', 1180, 560, 420),
          T('How we work', 100, 100, 1100, { font: 'Titan One', size: 120, color: INK }),
          ...['Keep the team small', 'Reply the same day', 'Say what went wrong'].flatMap((t, i) => [
            circle(100, 330 + i * 190, 100, CREAM, { stroke: { color: INK, width: 6, dash: 'solid' } }),
            T(String(i + 1), 100, 345 + i * 190, 100, { font: 'Titan One', size: 64, align: 'center', color: INK }),
            T(t, 250, 350 + i * 190, 900, { font: 'Fredoka', weight: 600, size: 60, color: INK }),
          ]),
        ]),
      ],
    });
  })(),

  // 2 ------------------------------------------------------------
  tpl({
    id: 'mascot-grumble-cold-brew', name: 'Grumpy mascot product poster', format: 'poster', category: 'Marketing', tags: ['product', 'drink', 'brand', 'poster'],
    pages: [page(CREAM, [
      T('Cold brew, no. 1', 54, 54, 600, { font: 'Space Grotesk', size: 24, weight: 700, color: INK }),
      T('330 ml', 880, 54, 190, { font: 'Space Grotesk', size: 24, weight: 700, color: INK, align: 'right' }),
      img('art/mascot-fluffy-red.png', 150, 170, 820, 1230),
      rect(0, 1160, 1123, 427, COBALT),
      T('GRUMBLE', 30, 1200, 1070, { font: 'Chango', size: 118, color: CREAM, align: 'center', lh: 1 }),
      T('Cold brew for people who are not ready yet.', 60, 1400, 1000, { font: 'Space Grotesk', size: 34, weight: 600, color: CREAM, align: 'center' }),
      T('Brewed 18 hours in Malmo', 60, 1480, 1000, { font: 'Space Grotesk', size: 22, color: CREAM, align: 'center' }),
    ])],
  }),

  // 3 ------------------------------------------------------------
  tpl({
    id: 'mascot-cup-hiring', name: 'Hiring banner with cup', format: 'og', category: 'Business', tags: ['hiring', 'jobs', 'cafe', 'banner'],
    pages: [page(MUSTARD, [
      mc('cup', 80, 630 - mh('cup', 300) - 40, 300),
      T('We need a\nbarista.', 470, 70, 700, { font: 'Titan One', size: 96, lh: 0.95, color: INK }),
      T('Three early shifts a week, from March. No experience needed, just be nice before eight.', 474, 330, 640, { font: 'Fredoka', weight: 500, size: 30, lh: 1.3, color: INK }),
      rect(474, 500, 360, 66, INK, { radius: 33 }),
      T('jobs@latte.example', 474, 514, 360, { font: 'Fredoka', weight: 600, size: 28, align: 'center', color: MUSTARD }),
    ])],
  }),

  // 4 ------------------------------------------------------------
  tpl({
    id: 'mascot-beet-letter', name: 'Newsletter with beet', format: 'post', category: 'Social', tags: ['newsletter', 'food', 'veg', 'announcement'],
    pages: [page(CREAM, [
      rect(0, 0, 1080, 560, COBALT),
      T('THE BEET\nLETTER', 60, 60, 960, { font: 'Chango', size: 118, color: CREAM, lh: 0.95 }),
      mc('beet', 680, 300, 330),
      T('Issue 14', 66, 430, 400, { font: 'Space Grotesk', size: 26, weight: 700, color: CREAM, ls: 80, upper: true }),
      T('This week in the box', 66, 620, 600, { font: 'Titan One', size: 44, color: INK }),
      ...['Beets, naturally', 'Two kinds of kale', 'Potatoes with mud still on', 'A recipe for soup nobody asked for'].flatMap((t, i) => [
        T(String(i + 1), 66, 740 + i * 110, 70, { font: 'Titan One', size: 52, color: RED }),
        T(t, 140, 746 + i * 110, 880, { font: 'Fredoka', weight: 600, size: 44, color: INK }),
        L(66, 740 + i * 110 + 90, 1014, 740 + i * 110 + 90, INK, 2),
      ]),
      T('Delivered on Thursdays. Skip a week any time.', 66, 1250, 900, { font: 'Fredoka', size: 28, color: INK }),
    ])],
  }),

  // 5 ------------------------------------------------------------
  tpl({
    id: 'mascot-late-opening', name: 'Announcement story with blob', format: 'story', category: 'Social', tags: ['story', 'announcement', 'opening hours', 'shop'],
    pages: [page(COBALT, [
      T('OH,', 70, 90, 940, { font: 'Chango', size: 330, color: CREAM, lh: 1 }),
      mc('blob', 340, 400, 520, {}),
      T('We are open\nuntil nine now.', 70, 1160, 940, { font: 'Titan One', size: 110, lh: 1, color: MUSTARD }),
      T('Monday to Saturday, starting this week.\nCome and see.', 74, 1520, 940, { font: 'Fredoka', weight: 500, size: 44, lh: 1.3, color: CREAM }),
      T('Bloop Cafe, Hornsgatan 71', 74, 1760, 940, { font: 'Space Grotesk', size: 30, weight: 600, color: CREAM }),
    ])],
  }),
];
