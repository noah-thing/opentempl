// Hand drawn, image led: the drawings are real scanned looking artwork (marker, oil pastel, ballpoint)
// commissioned with scripts/art.mjs; everything here is type, layout and simple structure.
import { tpl, page, T, rect, circle, L, img, overlay } from '../kit.mjs';

const INK = '#141414';
const RED = '#E8391D';
const BLUE = '#1F4FD8';
const BP = '#2038B8';
const YELLOW = '#FFD21F';
const grain = (W, H, o = 0.35) => overlay('tex/paper-fibre.jpg', W, H, 'multiply', o);
const hand = { font: 'Gochi Hand' };
const gro = { font: 'Space Grotesk' };

// A crop of a library image: crop = [x, y, w, h] as fractions of the file (size iw x ih), placed at width w.
const ic = (path, iw, ih, crop, x, y, w, p = {}) => {
  const [cx, cy, cw, ch] = crop;
  return img(path, x, y, w, Math.round((w * (ch * ih)) / (cw * iw)), { crop: { x: cx, y: cy, w: cw, h: ch }, ...p });
};
const SOFA = [1400, 933], PLAY = [1400, 1400], FACES = [1400, 1400], LOOP = [1400, 933], JUG = [933, 1400], ROUTE = [933, 1400];
const face = (i, x, y, w, p = {}) => { const c = i % 4, r = Math.floor(i / 4); return ic('art/hand-marker-faces.png', ...FACES, [0.02 + c * 0.2375, 0.02 + r * 0.2375, 0.2375, 0.2375], x, y, w, p); };

export default [
  // 1 --------------------------------------------------------------
  tpl({
    id: 'hand-slow-sunday', name: 'Slow Sunday poster', format: 'poster', category: 'Event', tags: ['cafe', 'reading', 'crayon', 'sunday'],
    pages: [page('#F4EFE3', [
      T('SUNDAY', 20, 20, 1300, { font: 'Permanent Marker', size: 300, color: RED, ls: -20, rotation: -2, lh: 1 }),
      T('Slow', 740, 290, 400, { font: 'Gochi Hand', size: 130, color: INK, rotation: -6 }),
      img('art/hand-crayon-sofa.png', 10, 430, 1100, 733),
      T('A reading afternoon,\nevery week', 60, 1230, 500, { ...gro, size: 30, weight: 700, lh: 1.2, color: INK }),
      L(60, 1340, 1063, 1340, INK, 2),
      T('Sofa Society Cafe\nVasagatan 12', 60, 1370, 340, { ...gro, size: 24, lh: 1.35, color: INK }),
      T('Every Sunday\n12 to 16', 420, 1370, 300, { ...gro, size: 24, lh: 1.35, color: INK }),
      T('Bring a book\nWe bring the tea', 760, 1370, 300, { ...gro, size: 24, lh: 1.35, color: INK }),
      T('Free\nentry', 880, 1190, 200, { font: 'Gochi Hand', size: 54, lh: 0.9, color: RED, rotation: 8 }),
      grain(1123, 1587),
    ])],
  }),

  // 2 --------------------------------------------------------------
  (() => {
    const W = 794, H = 1123, bg = '#EFE7D4';
    const row = (name, price, y, sd) => [
      T(name, 70, y, 290, { ...hand, size: 34, color: INK, rotation: sd % 2 ? -0.6 : 0.5 }),
      T(price, 345, y, 140, { ...hand, size: 34, color: INK, rotation: 0.4 }),
    ];
    const sec = (name, y, rot = -2) => T(name, 66, y, 400, { font: 'Reenie Beanie', size: 74, color: BP, rotation: rot });
    const food = (name, desc, price, y) => [
      T(name, 70, y, 540, { ...hand, size: 40, color: INK }), T(price, 640, y, 100, { ...hand, size: 40, color: INK, align: 'right' }),
      T(desc, 70, y + 46, 700, { font: 'Reenie Beanie', size: 34, color: BP, lh: 1 }),
    ];
    return tpl({
      id: 'hand-winelist-menu', name: 'Scribbled wine list', format: 'a4', category: 'Food', tags: ['menu', 'wine', 'restaurant', 'handwritten'],
      pages: [
        page(bg, [
          T('Winelist', 54, 40, 700, { font: 'Reenie Beanie', size: 190, color: BP, rotation: -4 }),
          T('Glass / bottle', 300, 232, 190, { ...hand, size: 24, color: INK, rotation: 3, align: 'right' }),
          sec('Bubbles', 270), ...row('Cremant, Loire', '9 / 46', 342, 1), ...row('Pet nat rose', '11 / 58', 386, 2),
          sec('White', 450), ...row('Muscadet', '8 / 40', 522, 3), ...row('Chenin, dry', '10 / 52', 566, 4), ...row('Gruner', '11 / 56', 610, 5),
          sec('Red', 674, -1), ...row('Gamay', '9 / 46', 746, 6), ...row('Cinsault', '10 / 50', 790, 7),
          sec('Orange', 856, -3), ...row('Ribolla', '12 / 62', 928, 8),
          ic('art/hand-blue-ink-jug.png', ...JUG, [0, 0, 1, 1], 470, 250, 300, { rotation: 3 }),
          T('Ask about the bottle on the shelf', 70, 1030, 720, { font: 'Reenie Beanie', size: 38, color: BP, lh: 1, rotation: -2 }),
          grain(W, H),
        ]),
        page(bg, [
          T('Plates', 54, 40, 700, { font: 'Reenie Beanie', size: 190, color: BP, rotation: -3 }),
          ...food('Radishes, butter, salt', 'the crunchy way to begin', '6', 280),
          ...food('Bread and cultured butter', 'baked down the road this morning', '5', 400),
          ...food('Aged cheese, honey', 'one wedge, one spoon of honey', '9', 520),
          ...food('White beans, lemon, parsley', 'slow cooked, eaten warm', '8', 640),
          ...food('Roast plums, yoghurt', 'the only dessert we make', '7', 760),
          ic('art/hand-blue-ink-jug.png', ...JUG, [0, 0.6, 1, 0.4], 440, 840, 330, { rotation: -2 }),
          T('Tell us if you do not eat something.\nWe will find you a plate.', 60, 980, 700, { font: 'Reenie Beanie', size: 40, color: INK, lh: 1, rotation: -1 }),
          grain(W, H),
        ]),
      ],
    });
  })(),

  // 3 --------------------------------------------------------------
  tpl({
    id: 'hand-playground-club', name: 'Playground club poster', format: 'poster', category: 'Event', tags: ['kids', 'workshop', 'club', 'playground'],
    pages: [page('#F6F2E8', [
      T('PLAY\nCLUB', 54, 50, 800, { font: 'Archivo Black', size: 168, lh: 0.88, ls: -40, color: INK }),
      T('A free open afternoon\nfor anyone under twelve,\nand the grown ups\nwho come along.', 700, 74, 380, { ...gro, size: 26, lh: 1.3, weight: 500, color: INK }),
      ic('art/hand-marker-playground.png', ...PLAY, [0.02, 0.01, 0.96, 0.97], 40, 330, 1043),
      L(54, 1370, 1070, 1370, INK, 2),
      T('Every Saturday\nfrom 2 March', 54, 1400, 300, { ...gro, size: 24, lh: 1.35, color: INK }),
      T('10:00 to 14:00\nNo booking', 400, 1400, 300, { ...gro, size: 24, lh: 1.35, color: INK }),
      T('Tantolunden\nplayground, south', 740, 1400, 300, { ...gro, size: 24, lh: 1.35, color: INK }),
      grain(1123, 1587),
    ])],
  }),

  // 4 --------------------------------------------------------------
  tpl({
    id: 'hand-last-friday', name: 'Open mic with red loop', format: 'poster', category: 'Event', tags: ['open mic', 'gig', 'night', 'loop'],
    pages: [page('#F8F6F0', [
      T('OPEN\nMIC', 40, 50, 1400, { font: 'Anton', size: 430, lh: 0.84, ls: -10, color: INK }),
      T('The Basement\nHornsgatan 40', 850, 110, 240, { ...gro, size: 24, lh: 1.3, weight: 600, color: INK }),
      T('Last Friday\nof every\nmonth', 850, 250, 240, { font: 'Gochi Hand', size: 50, lh: 0.95, color: INK, rotation: -3 }),
      T('14.11', 60, 990, 1500, { font: 'Anton', size: 400, lh: 1, ls: -10, color: INK }),
      img('art/hand-red-marker-loop.png', 10, 880, 1103, 735),
      T('Sign up at the bar from 19:00. Three songs each, no more.', 60, 1510, 600, { ...gro, size: 22, lh: 1.35, color: INK }),
      T('Doors 19:00\nFree entry', 860, 1500, 220, { ...gro, size: 24, lh: 1.3, weight: 600, color: INK }),
      grain(1123, 1587, 0.3),
    ])],
  }),

  // 5 --------------------------------------------------------------
  (() => {
    const W = 1080, H = 1350;
        return tpl({
      id: 'hand-supper-faces', name: 'Doodle faces carousel', format: 'post', category: 'Social', tags: ['carousel', 'community', 'dinner', 'faces'],
      pages: [
        page('#F7F2E5', [
          T('Everyone\nis invited', 60, 60, 1200, { font: 'Archivo Black', size: 150, lh: 0.9, ls: -50, color: INK }),
          T('Neighbours\nsupper', 790, 60, 300, { font: 'Gochi Hand', size: 56, lh: 0.95, color: RED, rotation: -6 }),
          img('art/hand-marker-faces.png', 20, 400, 1040, 1040),
          grain(W, H),
        ]),
        page('#F7F2E5', [
          T('Who is\ncoming', 60, 50, 1000, { font: 'Gochi Hand', size: 140, lh: 0.85, color: INK, rotation: -3 }),
          T('Ines, Otto, Mira, Sam, Lo and Bea,\nthe two from upstairs, Frank from\nnumber nine, and everyone\nelse who says yes.', 60, 330, 960, { font: 'Gochi Hand', size: 50, lh: 1.1, color: INK }),
          img('art/hand-marker-faces.png', 140, 700, 900, 900, { rotation: -4 }),
          T('and you, if you bring a spoon', 60, 590, 900, { font: 'Gochi Hand', size: 50, color: RED, rotation: -2 }),
          grain(W, H),
        ]),
        page(YELLOW, [
          T('Sunday\n6 October', 60, 60, 1000, { font: 'Archivo Black', size: 120, lh: 0.92, ls: -40, color: INK }),
          T('Long table in the courtyard', 64, 360, 900, { font: 'Gochi Hand', size: 66, color: INK, rotation: -2 }),
          T('Time', 64, 520, 300, { ...gro, size: 20, ls: 120, upper: true, weight: 700, color: INK }),
          T('17:00 until the candles go out', 64, 552, 900, { ...gro, size: 36, weight: 600, color: INK }),
          T('Bring', 64, 640, 300, { ...gro, size: 20, ls: 120, upper: true, weight: 700, color: INK }),
          T('A dish for four, a chair if you have one', 64, 672, 900, { ...gro, size: 36, weight: 600, color: INK }),
          T('Where', 64, 760, 300, { ...gro, size: 20, ls: 120, upper: true, weight: 700, color: INK }),
          T('Gard 3, Nytorget 8', 64, 792, 900, { ...gro, size: 36, weight: 600, color: INK }),
          img('art/hand-marker-faces.png', 260, 900, 1000, 1000, { rotation: 8 }),
          grain(W, H),
        ]),
      ],
    });
  })(),

  // 6 --------------------------------------------------------------
  tpl({
    id: 'hand-long-way-round', name: 'Walk route poster', format: 'poster', category: 'Event', tags: ['walk', 'route', 'map', 'run'],
    pages: [page('#F4EFE2', [
      T('THE LONG\nWAY ROUND', 40, 40, 1080, { font: 'Anton', size: 170, lh: 0.88, ls: -10, color: BLUE }),
      img('art/hand-blue-marker-route.png', 330, 440, 760, 1140),
      T('A walk along the\nshoreline, nine\nkilometres, with\ncoffee halfway.', 60, 470, 280, { ...gro, size: 28, lh: 1.3, weight: 600, color: BLUE }),
      T('Saturday 10 May\nMeet at the ferry quay\n09:30', 60, 1180, 280, { ...gro, size: 22, lh: 1.4, color: INK }),
      T('Bring water, wear\nshoes you like.\nDogs welcome.', 60, 1330, 280, { ...gro, size: 22, lh: 1.4, color: INK }),
      grain(1123, 1587, 0.3),
    ])],
  }),

  // 7 --------------------------------------------------------------
  tpl({
    id: 'hand-ink-supper-invite', name: 'Ink flowers invite', format: 'invite', category: 'Invitation', tags: ['invitation', 'dinner', 'wedding', 'flowers'],
    pages: [
      page('#F6F1E4', [
        ic('art/hand-blue-ink-jug.png', ...JUG, [0, 0, 1, 0.82], 40, 44, 400),
        T('Supper at\nthe farm', 40, 582, 400, { font: 'Gochi Hand', size: 34, lh: 1, color: BP, align: 'center' }),
        T('SATURDAY 14 JUNE', 40, 24, 400, { ...gro, size: 11, ls: 260, weight: 500, color: BP, align: 'center' }),
        grain(480, 673),
      ]),
      page('#F6F1E4', [
        T('SATURDAY 14 JUNE', 40, 60, 400, { ...gro, size: 11, ls: 260, weight: 500, color: BP, align: 'center' }),
        T('Anna and Jacob\nare getting married\nand want you at the table.', 50, 120, 380, { font: 'Reenie Beanie', size: 38, lh: 1.05, color: BP, align: 'center' }),
        T('Five o’clock, under the apple trees.\nDinner at seven.\nA bed in the barn if you need one.', 50, 290, 380, { ...gro, size: 15, lh: 1.6, color: INK, align: 'center' }),
        T('Hjortsberga gard, near Vaxholm', 50, 430, 380, { ...gro, size: 12, ls: 120, upper: true, color: BP, align: 'center' }),
        ic('art/hand-blue-ink-jug.png', ...JUG, [0, 0.6, 1, 0.4], 100, 480, 280),
        grain(480, 673),
      ]),
    ],
  }),

  // 8 --------------------------------------------------------------
  (() => {
    const W = 1920, H = 1080, B = '#2547D0';
    return tpl({
      id: 'hand-sketchbook-deck', name: 'Sketchbook pitch deck', format: 'slide', category: 'Presentation', tags: ['deck', 'pitch', 'creative', 'slides'],
      pages: [
        page(B, [
          T('Notes from\nthe sketchbook', 100, 160, 1150, { font: 'Archivo Black', size: 118, lh: 0.92, ls: -40, color: '#F6F1E4' }),
          T('How we think before we make', 108, 560, 900, { font: 'Gochi Hand', size: 64, color: '#D8F24A', rotation: -2 }),
          img('art/hand-marker-faces.png', 1150, 110, 800, 800, { rotation: 5 }),
          T('Studio Kvarn / autumn 2025', 108, 960, 800, { ...gro, size: 28, color: '#F6F1E4' }),
          overlay('tex/paper-fibre.jpg', W, H, 'multiply', 0.25),
        ]),
        page('#F6F1E4', [
          T('Three habits', 100, 90, 1000, { font: 'Archivo Black', size: 110, ls: -30, color: B }),
          ...['Draw it badly first', 'Show it to someone', 'Throw half away'].flatMap((t, i) => [
            T(`${i + 1}`, 110, 330 + i * 230, 120, { font: 'Gochi Hand', size: 150, color: RED }),
            T(t, 280, 350 + i * 230, 900, { ...gro, size: 66, weight: 700, ls: -20, color: INK }),
          ]),
          ic('art/hand-marker-playground.png', ...PLAY, [0.5, 0.36, 0.48, 0.32], 1280, 150, 520, { rotation: 4 }),
          ic('art/hand-marker-playground.png', ...PLAY, [0.02, 0.01, 0.48, 0.36], 1300, 560, 480, { rotation: -3 }),
          overlay('tex/paper-fibre.jpg', W, H, 'multiply', 0.3),
        ]),
        page('#F6F1E4', [
          T('A project, start to finish', 100, 90, 1400, { font: 'Archivo Black', size: 100, ls: -30, color: B }),
          img('art/hand-blue-marker-route.png', 1200, 20, 700, 1050),
          ...[['Week 1', 'Listening, walking round the place'], ['Week 3', 'First drawings on the wall'], ['Week 6', 'Argue about it, redraw'], ['Week 9', 'Print, hang, open the doors']].flatMap(([w, t], i) => [
            T(w, 110, 300 + i * 175, 300, { font: 'Gochi Hand', size: 60, color: RED }),
            T(t, 400, 312 + i * 175, 900, { ...gro, size: 40, weight: 600, color: INK }),
          ]),
          overlay('tex/paper-fibre.jpg', W, H, 'multiply', 0.3),
        ]),
        page(YELLOW, [
          T('Thank you.', 330, 200, 1500, { font: 'Archivo Black', size: 190, ls: -50, color: INK }),
          img('art/hand-red-marker-loop.png', 80, 40, 1500, 560, { rotation: -2 }),
          T('hello@studiokvarn.example\nSodra Larmgatan 8, Gothenburg', 108, 760, 1000, { ...gro, size: 40, lh: 1.4, weight: 600, color: INK }),
          img('art/hand-marker-faces.png', 1100, 500, 900, 900, { rotation: -6 }),
          overlay('tex/paper-fibre.jpg', W, H, 'multiply', 0.25),
        ]),
      ],
    });
  })(),
];
