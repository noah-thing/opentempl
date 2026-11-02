import { tpl, page, T, S, rect, circle, L, svg, img, overlay, stroke } from '../kit.mjs';

const COR = 'Cormorant Garamond';
const BOD = 'Bodoni Moda';
const ITA = 'Italiana';
const SANS = 'Jost';
const BONE = '#EFE9DD', ESP = '#1E1713', BLK = '#0E0D0C', BRASS = '#A8895A', TAUPE = '#8A7A68';
const marble = (W, H, a = 0.22) => overlay('tex/marble-cream.jpg', W, H, 'multiply', a);
const linen = (W, H, a = 0.2) => overlay('tex/linen-canvas.jpg', W, H, 'multiply', a);
const cap = (t, x, y, w, p = {}) => T(t, x, y, w, { font: SANS, size: 13, weight: 400, ls: 260, upper: true, color: ESP, ...p });

const poster = () => {
  const W = 1123, H = 1587;
  return tpl({
    id: 'lux-giant-letter-poster', name: 'Fashion house poster, giant letter', format: 'poster', category: 'Poster',
    tags: ['fashion', 'luxury', 'collection', 'poster', 'serif'],
    pages: [page(BONE, [
      marble(W, H, 0.2),
      T('A', -120, -420, 1500, { font: COR, size: 2100, weight: 300, ls: -60, lh: 1, color: ESP }),
      S('rect', 28, 28, 1067, 1531, 'rgba(0,0,0,0)', { stroke: stroke(ESP, 1), opacity: 0.35 }),
      cap('No. 26', 56, 56, 200, { size: 12 }),
      cap('Paris', 460, 56, 200, { size: 12, align: 'center' }),
      cap('Collection', 867, 56, 200, { size: 12, align: 'right' }),
      L(56, 1400, 1067, 1400, ESP, 1, { opacity: 0.5 }),
      cap('Maison Aubel', 56, 1430, 400, { size: 15, weight: 500 }),
      cap('Autumn Winter 2026', 56, 1470, 400, { size: 12, color: TAUPE }),
      cap('Private viewing', 700, 1430, 367, { size: 12, align: 'right' }),
      cap('14 October, by appointment', 700, 1470, 367, { size: 12, color: TAUPE, align: 'right' }),
    ])],
  });
};

const invite = () => {
  const W = 480, H = 673;
  return tpl({
    id: 'lux-private-viewing-invite', name: 'Private viewing invitation', format: 'invite', category: 'Invitation',
    tags: ['invitation', 'luxury', 'gala', 'opening', 'serif'],
    pages: [page('#F3EEE4', [
      linen(W, H, 0.18),
      S('rect', 24, 24, 432, 625, 'rgba(0,0,0,0)', { stroke: stroke(BRASS, 1) }),
      cap('You are invited', 60, 110, 360, { size: 11, align: 'center' }),
      T('Elise\nMarchetti', 40, 190, 400, { font: ITA, size: 64, ls: 20, lh: 1.05, align: 'center', color: ESP }),
      L(220, 360, 260, 360, BRASS, 1),
      cap('Opening of the new atelier', 60, 390, 360, { size: 11, align: 'center' }),
      T('Thursday the twelfth of March\nSeven in the evening', 40, 424, 400, { font: COR, size: 24, weight: 400, lh: 1.35, align: 'center', color: ESP }),
      cap('14 Rue des Arches, Paris', 60, 500, 360, { size: 10, align: 'center', color: TAUPE }),
      cap('Reply by the first of March', 60, 522, 360, { size: 10, align: 'center', color: TAUPE }),
      img('art/lux-wax-seal.png', 190, 548, 100, 100),
    ])],
  });
};

const card = () => {
  const W = 1004, H = 650;
  return tpl({
    id: 'lux-black-card', name: 'Business card, embossed cotton', format: 'card', category: 'Business card',
    tags: ['business card', 'luxury', 'serif', 'jeweller', 'emboss'],
    pages: [
      page(BONE, [
        img('art/lux-blind-emboss.jpg', 0, 0, W, H),
        T('Clara Aubel', 70, 66, 560, { font: COR, size: 62, weight: 400, ls: -10, color: ESP }),
        cap('Goldsmith and founder', 72, 144, 500, { size: 12, color: TAUPE }),
        L(72, 190, 132, 190, BRASS, 2),
        ...[['Atelier', 'Strandvagen 7\n114 56 Stockholm'], ['Write', 'clara@aubel.example'], ['Call', '+46 8 000 00 00']].flatMap(([a, b], i) => [
          cap(a, 72, 382 + i * 82, 120, { size: 11, color: '#5E5042' }),
          T(b, 200, 372 + i * 82, 360, { font: COR, size: 24, weight: 500, lh: 1.25, color: ESP }),
        ]),
      ]),
      page('#E9E2D3', [
        linen(W, H, 0.25),
        img('art/lux-pressed-botanicals.jpg', 0, 0, 400, H, { crop: { x: 0, y: 0, w: 0.4, h: 1 } }),
        T('Aubel', 470, 66, 480, { font: COR, size: 76, weight: 400, ls: 10, color: ESP }),
        cap('Fine jewellery since 1998', 472, 164, 480, { size: 12, color: TAUPE }),
        L(472, 214, 934, 214, ESP, 1, { opacity: 0.3 }),
        ...[['Hours', 'Tuesday to Saturday\nEleven to six'], ['By appointment', 'Mondays and evenings\nafter a message'], ['Online', 'aubel.example']].flatMap(([a, b], i) => [
          cap(a, 472, 250 + i * 104, 200, { size: 10, color: TAUPE }),
          T(b, 650, 242 + i * 104, 290, { font: COR, size: 24, weight: 500, lh: 1.25, color: ESP }),
        ]),
        img('art/lux-wax-seal.png', 850, 520, 90, 90),
      ]),
    ],
  });
};

const deck = () => {
  const W = 1920, H = 1080, cr = '#EFE9DD', dim = '#B9AE9B';
  const base = (n, label, els) => page(BLK, [
    S('rect', 48, 48, 1824, 984, 'rgba(0,0,0,0)', { stroke: stroke(BRASS, 1), opacity: 0.5 }),
    cap('Maison Aubel', 100, 90, 400, { color: dim, size: 12 }),
    cap(label, 760, 90, 400, { color: dim, size: 12, align: 'center' }),
    cap(`${String(n).padStart(2, '0')} / 04`, 1420, 90, 400, { color: dim, size: 12, align: 'right' }),
    ...els,
  ]);
  const sw = (x, y, c, name) => [S('rect', x, y, 160, 220, c), cap(name, x, y + 240, 200, { size: 11, color: dim })];
  return tpl({
    id: 'lux-lookbook-deck', name: 'Lookbook deck, black', format: 'slide', category: 'Presentation',
    tags: ['lookbook', 'luxury', 'deck', 'fashion', 'brand'],
    pages: [
      base(1, 'Lookbook 2026', [
        T('A', 700, -160, 520, { font: COR, size: 1000, weight: 300, ls: -20, lh: 1, color: '#171513' }),
        T('Autumn\nWinter', 0, 330, W, { font: COR, size: 210, weight: 300, ls: -20, lh: 0.95, align: 'center', color: cr }),
        L(900, 250, 1020, 250, BRASS, 1),
        cap('Twenty six looks', 0, 160, W, { color: dim, align: 'center' }),
        cap('Spring in Paris, shot in Normandy', 100, 940, 700, { color: dim, size: 12 }),
        cap('Look 01 to 26', 1120, 940, 700, { color: dim, size: 12, align: 'right' }),
      ]),
      base(2, 'Look 01', [
        img('photos/portrait.jpg', 1020, 48, 852, 984, { filters: { saturation: -100, contrast: 10 } }),
        T('01', 100, 200, 300, { font: BOD, size: 150, weight: 400, ls: -20, color: '#2A2622' }),
        T('The long coat', 100, 420, 800, { font: COR, size: 124, weight: 300, ls: -20, lh: 1, color: cr }),
        T('Double faced wool, cut on the bias and lined in silk. It takes about nine metres of cloth.', 100, 600, 640, { font: COR, size: 36, weight: 400, lh: 1.35, color: '#C9BFAD' }),
        L(100, 830, 900, 830, BRASS, 1, { opacity: 0.6 }),
        cap('Camel, ink, bone', 100, 860, 300, { color: dim, size: 12 }),
        cap('Sizes 34 to 46', 350, 860, 300, { color: dim, size: 12 }),
        cap('Made in Biella', 600, 860, 300, { color: dim, size: 12, align: 'right' }),
      ]),
      base(3, 'Materials', [
        T('Three cloths', 100, 200, 900, { font: COR, size: 110, weight: 300, ls: -20, color: cr }),
        ...[['Wool', 'Biella, Italy', '#B08A5E'], ['Silk', 'Como, Italy', '#D9CFBD'], ['Linen', 'Normandy, France', '#7A6C58']].flatMap(([a, b, c], i) => [
          ...sw(100 + i * 600, 500, c, ''),
          T(a, 300 + i * 600, 480, 300, { font: COR, size: 72, weight: 300, ls: -10, color: cr }),
          cap(b, 300 + i * 600, 585, 300, { color: dim, size: 12 }),
          L(300 + i * 600, 640, 580 + i * 600, 640, BRASS, 1, { opacity: 0.5 }),
          T('Washed twice before the first cut.', 300 + i * 600, 660, 280, { font: COR, size: 24, lh: 1.3, color: '#C9BFAD' }),
        ]),
      ]),
      base(4, 'Contact', [
        img('art/lux-pressed-botanicals.jpg', 1000, 48, 872, 984, { crop: { x: 0, y: 0, w: 0.58, h: 1 } }),
        T('By\nappointment', 100, 330, 800, { font: COR, size: 130, weight: 300, ls: -15, lh: 1, color: cr }),
        L(100, 300, 220, 300, BRASS, 1),
        cap('atelier@aubel.example', 100, 640, 700, { color: dim }),
        cap('Rue des Arches 14, Paris', 100, 685, 700, { color: dim }),
        cap('Tuesday to Saturday, eleven to six', 100, 940, 700, { color: '#8F7F66', size: 12 }),
      ]),
    ],
  });
};

const story = () => {
  const W = 1080, H = 1920, cr = '#EFE9DD';
  return tpl({
    id: 'lux-perfume-story', name: 'Fragrance story, aquatint', format: 'story', category: 'Social',
    tags: ['perfume', 'story', 'luxury', 'launch', 'serif'],
    pages: [page('#24180F', [
      img('art/lux-bottle-aquatint.jpg', 0, 0, W, H),
      cap('Maison Aubel', 0, 130, W, { color: '#D8C7A4', align: 'center', size: 16 }),
      T('No. 4', 0, 1480, W, { font: BOD, size: 120, weight: 400, ls: -10, align: 'center', color: cr }),
      cap('Cedar, fig leaf, a little smoke', 0, 1650, W, { color: '#D8C7A4', align: 'center', size: 15 }),
      cap('From 6 November', 0, 1700, W, { color: '#A8957A', align: 'center', size: 13 }),
    ])],
  });
};

const carousel = () => {
  const W = 1080, H = 1350;
  const crops = [{ x: 0, y: 0, w: 0.62, h: 0.64 }, { x: 0, y: 0.36, w: 0.62, h: 0.64 }, { x: 0.38, y: 0.36, w: 0.62, h: 0.64 }];
  const pg = (n, title, body) => page(BONE, [
    linen(W, H, 0.22),
    img('art/lux-pressed-botanicals.jpg', 90, 160, 900, 620, { crop: crops[Number(n) - 1] }),
    S('rect', 40, 40, 1000, 1270, 'rgba(0,0,0,0)', { stroke: stroke(ESP, 1), opacity: 0.3 }),
    L(90, 130, 990, 130, ESP, 1, { opacity: 0.4 }),
    L(90, 1250, 990, 1250, ESP, 1, { opacity: 0.4 }),
    cap('Maison Aubel, Paris', 90, 1270, 500, { size: 11, color: TAUPE }),
    cap('Swipe', 590, 1270, 400, { size: 11, color: TAUPE, align: 'right' }),
    cap('Atelier notes', 90, 90, 400, { size: 12 }),
    cap(`${n} of 03`, 590, 90, 400, { size: 12, align: 'right', color: TAUPE }),
    T(title, 90, 840, 800, { font: COR, size: 104, weight: 400, ls: -25, lh: 1, color: ESP }),
    T(body, 90, 1010, 700, { font: COR, size: 32, weight: 400, lh: 1.35, color: '#4A3F35' }),
  ]);
  return tpl({
    id: 'lux-atelier-notes', name: 'Atelier notes, three posts', format: 'post', category: 'Social',
    tags: ['carousel', 'luxury', 'fashion', 'serif', 'instagram'],
    pages: [
      pg('01', 'On linen', 'It creases, and we like that. Every bolt is washed twice before we cut it.'),
      pg('02', 'On patience', 'One jacket takes forty one hours. Four of them go on the buttonholes.'),
      pg('03', 'On hems', 'Rolled by hand and stitched, never glued. Turn one over and look for the thread.'),
    ],
  });
};

export default [poster(), invite(), card(), story(), carousel()];
