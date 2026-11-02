import { tpl, page, T, S, rect, circle, L, linear, radial, overlay, stroke } from '../kit.mjs';

const SANS = 'Instrument Sans';
const GROT = 'Hanken Grotesk';

// A soft field: blurred ellipses. blobs = [x, y, w, h, color, blur, opacity?]
const field = (blobs) => blobs.map(([x, y, w, h, c, b, o]) => S('ellipse', x, y, w, h, c, { blur: b, opacity: o ?? 1 }));
const grain = (W, H, a = 0.5, mode = 'overlay') => overlay('tex/film-grain.jpg', W, H, mode, a);
const mix = (a, b, t) => {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
};
const rnd = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// 1. Festival poster: two discs sitting on an ember field
const festival = () => {
  const W = 1123, H = 1587;
  return tpl({
    id: 'aura-festival-poster', name: 'Festival poster, two discs', format: 'poster', category: 'Event',
    tags: ['festival', 'film', 'music', 'gradient', 'poster'],
    pages: [page('#140808', [
      field([
        [-300, 760, 1100, 1000, '#FF4A1C', 190],
        [380, 930, 1000, 900, '#FF2E7E', 200],
        [150, -150, 900, 800, '#4A1560', 180],
        [620, 1180, 640, 520, '#FFB347', 140],
      ]),
      S('ellipse', 331, 190, 460, 460, linear(180, '#F8D2AE', '#C9503B')),
      S('ellipse', 271, 650, 580, 580, linear(180, '#E58A5E', '#3A0F26')),
      T('Harbour\nFilm Days', 56, 56, 400, { font: SANS, size: 24, weight: 500, lh: 1.15, ls: 0, color: '#FFE9D6' }),
      T('9th edition', 727, 56, 340, { font: SANS, size: 24, weight: 500, ls: 0, color: '#FFE9D6', align: 'right' }),
      L(56, 1388, 1067, 1388, '#2B0B14', 1, { opacity: 0.5 }),
      T('2 to 12 November', 56, 1412, 380, { font: SANS, size: 22, weight: 600, color: '#2B0B14' }),
      T('Fifty one films\nfrom nineteen coasts', 420, 1412, 380, { font: SANS, size: 22, weight: 400, lh: 1.3, color: '#2B0B14' }),
      T('Old Customs House\nand the Pier Cinema', 810, 1412, 257, { font: SANS, size: 22, weight: 400, lh: 1.3, color: '#2B0B14', align: 'right' }),
      grain(W, H, 0.6),
      grain(W, H, 0.25, 'soft-light'),
    ])],
  });
};

// 2. Panorama carousel: one field running across four posts
const carousel = () => {
  const W = 1080, H = 1350;
  const pageAt = (i, els) => page('#FFF3E8', [
    field([
      [-300 - i * W, 700, 1500, 1100, '#FFB48A', 150],
      [900 - i * W, 450, 1400, 1000, '#FF9EC4', 160],
      [2100 - i * W, 800, 1500, 1100, '#8E9BFF', 170],
      [3200 - i * W, 350, 1300, 1000, '#FFD08A', 160],
      [1600 - i * W, -400, 1200, 700, '#FFE3C8', 140],
    ]),
    S('ellipse', -1100 - i * W + 1500, 150, 2700, 2700, 'rgba(255,255,255,0)', { stroke: stroke('#2B2140', 1.5), opacity: 0.3 }),
    ...els,
    grain(W, H, 0.5),
  ]);
  const ink = '#2B2140';
  const foot = (n) => [
    T('Slow Hours', 72, 1230, 300, { font: SANS, size: 20, weight: 600, ls: 80, upper: true, color: ink }),
    T(`0${n} / 04`, 708, 1230, 300, { font: SANS, size: 20, weight: 500, ls: 80, color: ink, align: 'right' }),
  ];
  return tpl({
    id: 'aura-slow-hours-carousel', name: 'Panorama carousel, four posts', format: 'post', category: 'Social',
    tags: ['carousel', 'journal', 'wellness', 'gradient', 'instagram'],
    pages: [
      pageAt(0, [
        T('Slow\nhours', 72, 120, 800, { font: GROT, size: 250, weight: 300, ls: -50, lh: 0.88, color: ink }),
        T('Four small things I do\non my days off.', 72, 1060, 600, { font: SANS, size: 30, weight: 400, lh: 1.3, color: ink }),
        ...foot(1),
      ]),
      pageAt(1, [
        T('01', 72, 110, 300, { font: GROT, size: 28, weight: 500, color: ink }),
        T('Wake before\nthe phone does.', 72, 160, 900, { font: GROT, size: 108, weight: 300, ls: -35, lh: 1, color: ink }),
        T('Ten minutes of nothing in particular. A window, a glass of water, the light moving across the floor.', 72, 960, 560, { font: SANS, size: 28, lh: 1.4, color: ink }),
        ...foot(2),
      ]),
      pageAt(2, [
        T('02', 72, 110, 300, { font: GROT, size: 28, weight: 500, color: ink }),
        T('Eat lunch\nsitting down.', 72, 160, 900, { font: GROT, size: 108, weight: 300, ls: -35, lh: 1, color: ink }),
        T('At a table, with a plate that is not a keyboard tray. Chew. Notice the salt.', 72, 960, 560, { font: SANS, size: 28, lh: 1.4, color: ink }),
        ...foot(3),
      ]),
      pageAt(3, [
        T('03', 72, 110, 300, { font: GROT, size: 28, weight: 500, color: ink }),
        T('Leave one\nhour open.', 72, 160, 900, { font: GROT, size: 108, weight: 300, ls: -35, lh: 1, color: ink }),
        T('Save this for later and send it to someone who keeps a very full calendar.', 72, 960, 560, { font: SANS, size: 28, lh: 1.4, color: ink }),
        ...foot(4),
      ]),
    ],
  });
};

// 3. Invitation on a single warm orb
const invite = () => {
  const W = 480, H = 673;
  return tpl({
    id: 'aura-orb-invite', name: 'Invitation, warm orb', format: 'invite', category: 'Invitation',
    tags: ['wedding', 'invitation', 'party', 'gradient'],
    pages: [page('#FAF1E8', [
      field([
        [60, 230, 360, 360, '#FF7A3D', 60],
        [30, 330, 300, 280, '#FF9EB5', 70],
        [200, 150, 280, 260, '#FFC48A', 60, 0.8],
      ]),
      T('You are invited to the\nwedding of', 90, 66, 300, { font: SANS, size: 13, weight: 500, ls: 160, upper: true, lh: 1.7, align: 'center', color: '#5A3A2E' }),
      T('Marta\n& Ivo', 40, 285, 400, { font: 'Cormorant Garamond', size: 76, weight: 300, ls: -20, lh: 0.95, align: 'center', color: '#FFF7EE' }),
      T('Saturday 21 June\nFour in the afternoon', 90, 520, 300, { font: SANS, size: 15, weight: 500, lh: 1.5, align: 'center', color: '#5A3A2E' }),
      T('The Glasshouse, Skagen Road 4\nDinner and music to follow', 60, 590, 360, { font: SANS, size: 12, lh: 1.55, align: 'center', color: '#5A3A2E', opacity: 0.8 }),
      grain(W, H, 0.55),
    ])],
  });
};

// 4. Dawn story: horizon arch
const story = () => {
  const W = 1080, H = 1920;
  return tpl({
    id: 'aura-first-light-story', name: 'Horizon story, first light', format: 'story', category: 'Social',
    tags: ['story', 'event', 'run club', 'dawn', 'gradient'],
    pages: [page('#2D5BFF', [
      field([
        [-300, -200, 1700, 1000, '#1E3FE0', 160],
        [-250, 700, 1600, 800, '#B9A8FF', 150],
        [-300, 1120, 1700, 800, '#FF7FB0', 140],
        [-500, 1520, 2000, 1100, '#FF4A2B', 150],
        [100, 1780, 900, 400, '#FFC66B', 120],
      ]),
      T('First light\nrun club', 72, 110, 700, { font: SANS, size: 40, weight: 500, lh: 1.15, color: '#FFFFFF' }),
      T('Every Sunday', 600, 112, 408, { font: SANS, size: 28, weight: 500, color: '#FFFFFF', align: 'right', opacity: 0.85 }),
      T('06:15', 40, 700, 1000, { font: GROT, size: 330, weight: 200, ls: -60, lh: 1, color: '#FFFFFF', align: 'center' }),
      T('Meet at the lido steps', 40, 1030, 1000, { font: SANS, size: 24, weight: 600, ls: 200, upper: true, color: '#1B2468', align: 'center' }),
      T('Six kilometres, easy pace, coffee after.\nBring a light layer, leave the watch at home.', 140, 1740, 800, { font: SANS, size: 28, lh: 1.4, color: '#FFFFFF', align: 'center' }),
      grain(W, H, 0.55),
    ])],
  });
};

// 5. Deck on a dark sphere
const deck = () => {
  const W = 1920, H = 1080;
  const bg = '#0A0A1C';
  const base = (els) => page(bg, [
    ...els,
    grain(W, H, 0.5), grain(W, H, 0.2, 'soft-light'),
  ]);
  const white = '#F1EEFF';
  const sphere = (x, y, d) => [
    S('ellipse', x - d * 0.2, y - d * 0.2, d * 1.4, d * 1.4, '#3B3BFF', { blur: 160, opacity: 0.55 }),
    S('ellipse', x, y, d, d, radial('#E9EDFF', '#8E9BFF', '#2A1FD6', '#0A0A1C')),
  ];
  return tpl({
    id: 'aura-night-sphere-deck', name: 'Quarterly letter deck', format: 'slide', category: 'Presentation',
    tags: ['slides', 'deck', 'report', 'gradient', 'dark'],
    pages: [
      base([
        ...sphere(1060, 130, 820),
        T('Quarterly\nletter', 110, 380, 900, { font: GROT, size: 170, weight: 300, ls: -50, lh: 0.95, color: white }),
        T('Third quarter, written for the people who own a piece of this.', 110, 820, 620, { font: SANS, size: 30, lh: 1.35, color: white, opacity: 0.85 }),
        T('Lantern Labs', 110, 100, 400, { font: SANS, size: 24, weight: 600, color: white }),
        T('October 2026', 1410, 100, 400, { font: SANS, size: 24, weight: 500, color: white, align: 'right', opacity: 0.8 }),
      ]),
      base([
        field([[-300, 500, 1400, 1000, '#3B3BFF', 200, 0.5], [900, -300, 1200, 700, '#7B4DFF', 200, 0.35]]),
        T('Revenue', 110, 100, 400, { font: SANS, size: 24, weight: 600, color: white }),
        T('38%', 100, 250, 1100, { font: GROT, size: 560, weight: 200, ls: -70, lh: 1, color: white }),
        T('Growth over the same quarter last year, with the same team of eleven.', 1180, 560, 560, { font: SANS, size: 38, lh: 1.3, color: white }),
        L(1180, 520, 1810, 520, white, 1, { opacity: 0.5 }),
        T('Page 2', 1410, 980, 400, { font: SANS, size: 20, color: white, align: 'right', opacity: 0.6 }),
      ]),
      base([
        field([[600, 650, 1500, 900, '#2A1FD6', 200, 0.55]]),
        T('What changed', 110, 100, 600, { font: SANS, size: 24, weight: 600, color: white }),
        ...[['01', 'We shipped\nthe offline mode', 'Used by four in ten accounts in its first month.'], ['02', 'We closed the\nsecond office', 'Rent went down, travel went up, the trade held.'], ['03', 'We stopped\nanswering at night', 'Support hours are now nine to six. Ratings rose.']].flatMap(([n, h, p], i) => [
          L(110 + i * 600, 420, 590 + i * 600, 420, white, 1, { opacity: 0.5 }),
          T(n, 110 + i * 600, 450, 200, { font: SANS, size: 24, weight: 500, color: white, opacity: 0.7 }),
          T(h, 110 + i * 600, 520, 480, { font: GROT, size: 56, weight: 300, ls: -20, lh: 1.05, color: white }),
          T(p, 110 + i * 600, 700, 420, { font: SANS, size: 26, lh: 1.4, color: white, opacity: 0.85 }),
        ]),
      ]),
      base([
        ...sphere(660, 130, 820),
        T('Thank you\nfor the patience.', 0, 400, 1920, { font: GROT, size: 120, weight: 300, ls: -35, lh: 1, color: white, align: 'center' }),
        T('letters@lanternlabs.example', 0, 960, 1920, { font: SANS, size: 24, weight: 500, ls: 120, color: white, align: 'center', opacity: 0.8 }),
      ]),
    ],
  });
};

// 6. Thumbnail
const thumb = () => {
  const W = 1280, H = 720;
  return tpl({
    id: 'aura-lagoon-thumb', name: 'Video thumbnail, lagoon glow', format: 'thumb', category: 'YouTube',
    tags: ['youtube', 'thumbnail', 'gradient', 'vlog'],
    pages: [page('#06222B', [
      field([
        [-200, 250, 1000, 700, '#00B7C7', 150],
        [600, -150, 900, 700, '#B5F23D', 150, 0.9],
        [700, 380, 800, 600, '#2A5CFF', 150, 0.8],
      ]),
      S('ellipse', 760, 90, 440, 440, 'rgba(255,255,255,0)', { stroke: stroke('#FFFFFF', 3) }),
      T('I slept\nin a train\nfor a week', 70, 130, 760, { font: GROT, size: 124, weight: 800, ls: -45, lh: 0.95, color: '#FFFFFF' }),
      T('Episode 04', 70, 600, 360, { font: SANS, size: 28, weight: 600, ls: 160, upper: true, color: '#06222B' }),
      grain(W, H, 0.55),
    ])],
  });
};

// 7. Business card
const card = () => {
  const W = 1004, H = 650;
  return tpl({
    id: 'aura-duo-card', name: 'Business card, grain field', format: 'card', category: 'Business card',
    tags: ['business card', 'studio', 'gradient'],
    pages: [
      page('#F5B79A', [
        field([
          [-200, 150, 800, 700, '#FF6B4A', 120],
          [400, -200, 800, 700, '#FFD2A8', 120],
          [500, 300, 700, 600, '#E86AA6', 120, 0.8],
        ]),
        T('Nora Lindgren', 56, 54, 500, { font: SANS, size: 28, weight: 600, color: '#2A1620' }),
        T('Colour and light', 56, 92, 500, { font: SANS, size: 22, color: '#2A1620', opacity: 0.75 }),
        grain(W, H, 0.6),
      ]),
      page('#FBF4EC', [
        field([[640, 260, 520, 520, '#FF7A4D', 80], [520, 340, 420, 380, '#FF9EC4', 90]]),
        T('Nora Lindgren', 56, 54, 500, { font: SANS, size: 28, weight: 600, color: '#2A1620' }),
        T('Lighting designer', 56, 92, 500, { font: SANS, size: 22, color: '#2A1620', opacity: 0.75 }),
        T('nora@lindgren.example\n+46 70 000 00 00\nKarlavagen 12, Stockholm', 56, 470, 460, { font: SANS, size: 21, lh: 1.5, color: '#2A1620' }),
        grain(W, H, 0.5),
      ]),
    ],
  });
};

// 8. Bars poster: each bar is a day
const bars = () => {
  const W = 1123, H = 1587;
  const days = [['Mon', 5, 760, '#FF8A5C', '#FFD08A'], ['Tue', 6, 980, '#E8508C', '#FFB28A'], ['Wed', 7, 640, '#7C6BFF', '#F2A4C8'], ['Thu', 8, 1060, '#3B6BFF', '#BFD0FF'], ['Fri', 9, 880, '#E8508C', '#8E9BFF'], ['Sat', 10, 1100, '#FF8A5C', '#F2A4C8'], ['Sun', 11, 700, '#7C6BFF', '#FFD08A']];
  const bw = 124, gap = 22, x0 = (W - (7 * bw + 6 * gap)) / 2;
  return tpl({
    id: 'aura-week-bars-poster', name: 'Programme poster, one bar per day', format: 'poster', category: 'Event',
    tags: ['programme', 'schedule', 'festival', 'gradient', 'poster'],
    pages: [page('#0C0C10', [
      ...days.flatMap(([d, n, h, c1, c2], i) => {
        const x = x0 + i * (bw + gap), y = 1330 - h;
        return [
          S('rect', x, y, bw, h, linear(180, c1, c2)),
          S('rect', x, y, bw, h, linear(180, c1, c2), { blur: 40, opacity: 0.6 }),
          T(String(n).padStart(2, '0'), x + bw / 2 - 210, y + 120, 420, { font: GROT, size: 80, weight: 600, ls: -20, color: '#0C0C10', rotation: 270, align: 'center' }),
          T(d, x + 18, 1346, 100, { font: SANS, size: 19, weight: 500, ls: 120, upper: true, color: '#E8E6F0' }),
        ];
      }),
      T('Resonance\nweek', 56, 56, 600, { font: GROT, size: 74, weight: 300, ls: -30, lh: 0.95, color: '#F4F2FA' }),
      T('Seven nights of\nquiet electronic music', 700, 62, 367, { font: SANS, size: 24, lh: 1.3, color: '#F4F2FA', align: 'right' }),
      T('November\n2026', 56, 1450, 300, { font: SANS, size: 20, weight: 600, lh: 1.4, color: '#E8E6F0' }),
      T('Doors at eight, every night\nHall 3, the old tram depot', 700, 1450, 367, { font: SANS, size: 20, lh: 1.4, color: '#E8E6F0', align: 'right' }),
      grain(W, H, 0.55, 'soft-light'), grain(W, H, 0.35),
    ])],
  });
};

// 9. Launch cover
const cover = () => {
  const W = 1640, H = 624;
  return tpl({
    id: 'aura-launch-cover', name: 'Product cover, glow icon', format: 'cover', category: 'Cover',
    tags: ['cover', 'product', 'launch', 'facebook', 'gradient'],
    pages: [page('#06231C', [
      field([
        [900, -120, 900, 800, '#B5F23D', 150, 0.9],
        [1200, 200, 800, 600, '#00B7C7', 140],
        [500, 300, 900, 500, '#0B5D4A', 140],
      ]),
      S('ellipse', 1150, 130, 360, 360, radial('#F6FFC8', '#B5F23D', '#0BA38A')),
      T('Folio 2.0', 70, 70, 400, { font: SANS, size: 24, weight: 600, ls: 160, upper: true, color: '#E9FFD0' }),
      T('Notes that keep\nworking offline.', 70, 330, 800, { font: GROT, size: 76, weight: 400, ls: -30, lh: 1, color: '#F4FFE6' }),
      T('Free update for every account, from 4 November', 70, 520, 700, { font: SANS, size: 22, color: '#E9FFD0', opacity: 0.85 }),
      grain(W, H, 0.6),
    ])],
  });
};

// 10. Pixel block flyer
const blocks = () => {
  const W = 559, H = 794;
  const cols = 7, cw = W / cols, rows = 6;
  const pal = ['#1F3BFF', '#2F8CFF', '#6EC8F5', '#CFEAF5', '#F6F0A0', '#F3E04A'];
  const cells = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const t = Math.min(1, Math.max(0, (c / (cols - 1)) * 0.45 + (r / (rows - 1)) * 0.55 + (rnd(r * 9 + c) - 0.5) * 0.45));
    const k = t * (pal.length - 1), i = Math.min(pal.length - 2, Math.floor(k));
    const col = mix(pal[i], pal[i + 1], k - i);
    cells.push(S('rect', c * cw, 30 + r * cw, cw + 0.5, cw + 0.5, linear(rnd(r * 5 + c + 40) > 0.5 ? 180 : 90, col, mix(col, pal[Math.min(5, i + 1)], 0.6)), { blur: 3 }));
  }
  return tpl({
    id: 'aura-block-flyer', name: 'Symposium flyer, gradient blocks', format: 'flyer', category: 'Event',
    tags: ['symposium', 'conference', 'flyer', 'gradient', 'blocks'],
    pages: [page('#F8F6EE', [
      ...cells,
      grain(W, 660, 0.5),
      T('Slow cities', 28, 560, 500, { font: GROT, size: 60, weight: 700, ls: -45, lh: 1, color: '#12163A' }),
      T('A one day symposium on streets, benches and the speed of walking.', 28, 632, 330, { font: SANS, size: 15, lh: 1.4, color: '#12163A' }),
      T('12 September 2026\nCity Library, Hall B\nFree, seats limited', 388, 632, 150, { font: SANS, size: 12, weight: 500, lh: 1.55, color: '#12163A', align: 'right' }),
      L(28, 745, 531, 745, '#12163A', 1),
      T('slowcities.example', 28, 756, 300, { font: SANS, size: 11, ls: 120, upper: true, color: '#12163A' }),
    ])],
  });
};


const ring = (x, y, d, c, w = 1.5, o = 1) => S('ellipse', x, y, d, d, 'rgba(0,0,0,0)', { stroke: stroke(c, w), opacity: o });

// 3b. Invitation
const invite2 = () => {
  const W = 480, H = 673, ink = '#3A1A12';
  return tpl({
    id: 'aura-orb-invite', name: 'Invitation, warm orb', format: 'invite', category: 'Invitation',
    tags: ['wedding', 'invitation', 'party', 'gradient'],
    pages: [page('#FAF1E8', [
      field([
        [40, 200, 400, 400, '#FF7A3D', 60],
        [10, 330, 300, 280, '#FF9EB5', 70],
        [200, 130, 280, 260, '#FFC48A', 60, 0.8],
      ]),
      S('rect', 18, 18, 444, 637, 'rgba(0,0,0,0)', { stroke: stroke(ink, 0.8), opacity: 0.6 }),
      ring(80, 190, 320, ink, 0.8, 0.5),
      T('No. 01', 36, 34, 120, { font: SANS, size: 11, weight: 600, ls: 140, upper: true, color: ink }),
      T('Midsummer', 324, 34, 120, { font: SANS, size: 11, weight: 600, ls: 140, upper: true, color: ink, align: 'right' }),
      T('The wedding of', 90, 96, 300, { font: SANS, size: 13, weight: 600, ls: 200, upper: true, align: 'center', color: ink }),
      T('Marta\n& Ivo', 40, 270, 400, { font: 'Cormorant Garamond', size: 84, weight: 500, ls: -20, lh: 0.95, align: 'center', color: '#2B0F08' }),
      L(36, 500, 444, 500, ink, 0.8, { opacity: 0.6 }),
      T('Saturday\n21 June', 36, 516, 180, { font: SANS, size: 16, weight: 600, lh: 1.35, color: ink }),
      T('Four in\nthe afternoon', 150, 516, 180, { font: SANS, size: 16, weight: 600, lh: 1.35, color: ink, align: 'center' }),
      T('The Glasshouse\nSkagen Road 4', 264, 516, 180, { font: SANS, size: 16, weight: 600, lh: 1.35, color: ink, align: 'right' }),
      T('Dinner and music to follow. Kindly reply by 1 May.', 36, 600, 408, { font: SANS, size: 12, color: ink, align: 'center', opacity: 0.8 }),
      grain(W, H, 0.55),
    ])],
  });
};

// 5b. Deck
const deck2 = () => {
  const W = 1920, H = 1080, bg = '#0A0A1C', white = '#F1EEFF';
  const frame = (n, label) => [
    S('rect', 40, 40, 1840, 1000, 'rgba(0,0,0,0)', { stroke: stroke(white, 1), opacity: 0.25 }),
    T('Lantern Labs', 80, 80, 400, { font: SANS, size: 22, weight: 600, color: white }),
    T(label, 760, 80, 400, { font: SANS, size: 20, weight: 500, ls: 160, upper: true, color: white, align: 'center', opacity: 0.8 }),
    T(`${String(n).padStart(2, '0')} / 04`, 1440, 80, 400, { font: SANS, size: 20, weight: 500, ls: 100, color: white, align: 'right', opacity: 0.8 }),
  ];
  const base = (els) => page(bg, [...els, grain(W, H, 0.5), grain(W, H, 0.2, 'soft-light')]);
  const sphere = (x, y, d) => [
    S('ellipse', x - d * 0.2, y - d * 0.2, d * 1.4, d * 1.4, '#3B3BFF', { blur: 160, opacity: 0.55 }),
    S('ellipse', x, y, d, d, radial('#E9EDFF', '#8E9BFF', '#2A1FD6', '#0A0A1C')),
    ring(x - d * 0.18, y - d * 0.18, d * 1.36, white, 1, 0.35),
    ring(x - d * 0.36, y - d * 0.36, d * 1.72, white, 1, 0.2),
  ];
  return tpl({
    id: 'aura-night-sphere-deck', name: 'Quarterly letter deck', format: 'slide', category: 'Presentation',
    tags: ['slides', 'deck', 'report', 'gradient', 'dark'],
    pages: [
      base([
        ...sphere(1130, 160, 760),
        ...frame(1, 'Letter to owners'),
        T('Quarterly\nletter', 80, 300, 1000, { font: GROT, size: 210, weight: 300, ls: -55, lh: 0.92, color: white }),
        ...[['Period', 'Q3 2026'], ['Written by', 'The founders'], ['Length', 'Six pages'], ['Next letter', 'January']].flatMap(([a, b], i) => [
          L(80 + i * 270, 800, 320 + i * 270, 800, white, 1, { opacity: 0.45 }),
          T(a, 80 + i * 270, 818, 240, { font: SANS, size: 16, weight: 500, ls: 120, upper: true, color: white, opacity: 0.65 }),
          T(b, 80 + i * 270, 848, 240, { font: SANS, size: 26, weight: 500, color: white }),
        ]),
      ]),
      base([
        field([[-300, 500, 1400, 1000, '#3B3BFF', 200, 0.5], [900, -300, 1200, 700, '#7B4DFF', 200, 0.35]]),
        ...frame(2, 'Revenue'),
        T('38%', 70, 190, 1200, { font: GROT, size: 640, weight: 200, ls: -80, lh: 1, color: white }),
        ...[3, 4, 4.4, 5.2, 5.9, 6.4, 7.3, 8].map((h, i) => S('rect', 1180 + i * 82, 760 - h * 54, 56, h * 54, linear(180, '#C9D0FF', '#3B3BFF'), { opacity: i === 7 ? 1 : 0.55 })),
        T('Growth over the same quarter last year, with the same team of eleven.', 1180, 180, 600, { font: SANS, size: 36, lh: 1.3, color: white }),
        L(1180, 790, 1830, 790, white, 1, { opacity: 0.5 }),
        T('Q4 25', 1180, 806, 200, { font: SANS, size: 16, ls: 100, upper: true, color: white, opacity: 0.65 }),
        T('Q3 26', 1630, 806, 200, { font: SANS, size: 16, ls: 100, upper: true, color: white, opacity: 0.65, align: 'right' }),
      ]),
      base([
        field([[600, 650, 1500, 900, '#2A1FD6', 200, 0.55]]),
        ...frame(3, 'What changed'),
        ...[['01', 'We shipped\nthe offline mode', 'Used by four in ten accounts in its first month.'], ['02', 'We closed the\nsecond office', 'Rent went down, travel went up, and the trade held.'], ['03', 'We stopped\nanswering at night', 'Support hours are now nine to six. Ratings rose.']].flatMap(([n, h, p], i) => [
          S('rect', 80 + i * 600, 240, 540, 700, 'rgba(255,255,255,0.05)', { stroke: stroke(white, 1) }),
          T(n, 110 + i * 600, 270, 200, { font: GROT, size: 90, weight: 200, color: white }),
          T(h, 110 + i * 600, 560, 480, { font: GROT, size: 52, weight: 300, ls: -20, lh: 1.05, color: white }),
          T(p, 110 + i * 600, 760, 470, { font: SANS, size: 26, lh: 1.4, color: white, opacity: 0.9 }),
        ]),
      ]),
      base([
        ...sphere(1180, 190, 700),
        ...frame(4, 'Thank you'),
        T('Thank you\nfor the\npatience.', 80, 300, 1000, { font: GROT, size: 170, weight: 300, ls: -50, lh: 0.95, color: white }),
        L(80, 860, 600, 860, white, 1, { opacity: 0.5 }),
        T('letters@lanternlabs.example', 80, 880, 700, { font: SANS, size: 26, weight: 500, color: white }),
      ]),
    ],
  });
};

// 6b. Thumbnail
const thumb2 = () => {
  const W = 1280, H = 720;
  return tpl({
    id: 'aura-lagoon-thumb', name: 'Video thumbnail, lagoon glow', format: 'thumb', category: 'YouTube',
    tags: ['youtube', 'thumbnail', 'gradient', 'vlog'],
    pages: [page('#06222B', [
      field([
        [-200, 250, 1000, 700, '#00B7C7', 150],
        [600, -150, 900, 700, '#B5F23D', 150, 0.9],
        [700, 380, 800, 600, '#2A5CFF', 150, 0.8],
      ]),
      S('ellipse', 800, 60, 420, 420, '#06222B'),
      S('ellipse', 800, 60, 420, 420, 'rgba(0,0,0,0)', { stroke: stroke('#FFFFFF', 3) }),
      S('rect', 0, 560, W, 160, '#06222B'),
      L(0, 560, W, 560, '#B5F23D', 4),
      T('I slept\nin a train', 50, 40, 900, { font: GROT, size: 170, weight: 800, ls: -55, lh: 0.9, color: '#FFFFFF' }),
      T('for a week', 50, 360, 900, { font: GROT, size: 170, weight: 800, ls: -55, lh: 0.9, color: '#06222B' }),
      T('EP 04', 860, 205, 200, { font: GROT, size: 64, weight: 800, ls: -20, color: '#FFFFFF', align: 'center' }),
      T('Stockholm to Narvik\n1 400 km, 19 hours a day', 50, 590, 700, { font: SANS, size: 32, weight: 600, lh: 1.25, color: '#FFFFFF' }),
      T('Night 1 of 7', 780, 590, 450, { font: SANS, size: 32, weight: 600, color: '#B5F23D', align: 'right' }),
      grain(W, H, 0.55),
    ])],
  });
};

// 7b. Card
const card2 = () => {
  const W = 1004, H = 650, ink = '#2A1620';
  return tpl({
    id: 'aura-duo-card', name: 'Business card, grain field', format: 'card', category: 'Business card',
    tags: ['business card', 'studio', 'gradient'],
    pages: [
      page('#F5B79A', [
        field([
          [-200, 150, 800, 700, '#FF6B4A', 120],
          [400, -200, 800, 700, '#FFD2A8', 120],
          [500, 300, 700, 600, '#E86AA6', 120, 0.8],
        ]),
        S('rect', 0, 440, W, 210, ink),
        S('ellipse', 640, 70, 300, 300, ink),
        S('ellipse', 700, 130, 300, 300, 'rgba(0,0,0,0)', { stroke: stroke(ink, 1.5) }),
        T('Nora\nLindgren', 56, 56, 600, { font: GROT, size: 108, weight: 700, ls: -45, lh: 0.9, color: ink }),
        T('Colour and light', 56, 470, 500, { font: SANS, size: 30, weight: 600, color: '#FBE9DC' }),
        T('Lighting design for rooms\nthat change through the day', 56, 520, 500, { font: SANS, size: 22, lh: 1.35, color: '#FBE9DC', opacity: 0.8 }),
        T('Studio\nNo. 014', 744, 470, 204, { font: SANS, size: 22, weight: 600, lh: 1.35, color: '#FBE9DC', align: 'right' }),
        grain(W, H, 0.6),
      ]),
      page('#FBF4EC', [
        field([[600, 200, 600, 600, '#FF7A4D', 90], [480, 300, 500, 420, '#FF9EC4', 100]]),
        S('rect', 56, 56, 892, 538, 'rgba(0,0,0,0)', { stroke: stroke(ink, 1.2) }),
        L(56, 400, 948, 400, ink, 1.2),
        T('Nora Lindgren', 90, 90, 500, { font: GROT, size: 40, weight: 700, ls: -20, color: ink }),
        T('Lighting designer', 90, 140, 500, { font: SANS, size: 24, color: ink, opacity: 0.8 }),
        ...[['Write', 'nora@lindgren.example'], ['Call', '+46 70 000 00 00'], ['Visit', 'Karlavagen 12, Stockholm']].flatMap(([a, b], i) => [
          T(a, 90 + i * 290, 430, 260, { font: SANS, size: 15, weight: 600, ls: 160, upper: true, color: ink, opacity: 0.6 }),
          T(b, 90 + i * 290, 464, 270, { font: SANS, size: 21, weight: 500, lh: 1.3, color: ink }),
        ]),
        grain(W, H, 0.5),
      ]),
    ],
  });
};

// 9b. Cover
const cover2 = () => {
  const W = 1640, H = 624, lime = '#E9FFD0';
  return tpl({
    id: 'aura-launch-cover', name: 'Product cover, glow icon', format: 'cover', category: 'Cover',
    tags: ['cover', 'product', 'launch', 'facebook', 'gradient'],
    pages: [page('#06231C', [
      field([
        [950, -150, 900, 800, '#B5F23D', 150, 0.9],
        [1250, 200, 800, 600, '#00B7C7', 140],
        [500, 300, 900, 500, '#0B5D4A', 140],
      ]),
      ring(1000, -60, 700, lime, 1, 0.4),
      ring(1100, 40, 500, lime, 1, 0.5),
      S('ellipse', 1180, 120, 300, 300, radial('#F6FFC8', '#B5F23D', '#0BA38A')),
      S('rect', 0, 0, 1640, 624, 'rgba(0,0,0,0)', { stroke: stroke(lime, 1), opacity: 0.0 }),
      T('Folio 2.0', 70, 60, 400, { font: SANS, size: 22, weight: 600, ls: 180, upper: true, color: lime }),
      T('Out 4 November', 1170, 60, 400, { font: SANS, size: 22, weight: 600, ls: 140, upper: true, color: lime, align: 'right' }),
      T('Notes that keep\nworking offline.', 70, 140, 900, { font: GROT, size: 108, weight: 500, ls: -45, lh: 0.95, color: '#F4FFE6' }),
      ...[['01', 'Offline first'], ['02', 'Sync in the background'], ['03', 'Search every note']].flatMap(([n, t], i) => [
        L(70 + i * 330, 470, 360 + i * 330, 470, lime, 1, { opacity: 0.6 }),
        T(n, 70 + i * 330, 486, 80, { font: SANS, size: 18, weight: 600, color: lime, opacity: 0.7 }),
        T(t, 70 + i * 330, 520, 280, { font: SANS, size: 26, weight: 500, color: '#F4FFE6' }),
      ]),
      grain(W, H, 0.6),
    ])],
  });
};

export default [festival(), carousel(), invite2(), story(), thumb2(), card2(), blocks()];
