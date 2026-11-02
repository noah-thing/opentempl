import { tpl, page, T, S, rect, circle, path, L, img, frame, overlay, svg, qr, solid, linear, radial, pattern, imageFill, stroke } from '../kit.mjs';

// Y2K chrome: liquid chrome and holo foil cut into blobs, stars and rings on sky blue.
const BLUE = '#2D5BFF';
const SKY = '#BCD7FF';
const ICE = '#EEF4FF';
const NAVY = '#0A1033';
const PINK = '#FF4FA3';
const LIME = '#C9FF4D';
const SILVER = '#DDE3EE';

const list = [];
export default list;

const chrome = (shape, x, y, w, h, p = {}) => img('tex/liquid-chrome.jpg', x, y, w, h, { mask: shape, ...p });
const holo = (shape, x, y, w, h, p = {}) => img('tex/holo-foil.jpg', x, y, w, h, { mask: shape, ...p });
const lab = (t, x, y, w, c, p = {}) => T(t, x, y, w, { font: 'Space Grotesk', size: 20, weight: 700, ls: 100, upper: true, color: c, lh: 1.2, ...p });
// a little window frame
const win = (x, y, w, h, title, fill = ICE, bar = BLUE) => [
  rect(x + 6, y + 6, w, h, NAVY, { opacity: 0.9 }),
  rect(x, y, w, h, fill, { stroke: stroke(NAVY, 3) }),
  rect(x, y, w, 36, bar, { stroke: stroke(NAVY, 3) }),
  T(title, x + 12, y + 7, w - 90, { font: 'Space Grotesk', size: 17, weight: 700, color: '#fff', upper: true, ls: 60 }),
  rect(x + w - 30, y + 9, 18, 18, ICE, { stroke: stroke(NAVY, 2) }),
  rect(x + w - 54, y + 9, 18, 18, ICE, { stroke: stroke(NAVY, 2) }),
];
const sparkle = (x, y, s, c = ICE) => S('star4', x, y, s, s, c);

list.push(tpl({
  id: 'y2k-chrome-star-poster', name: 'Chrome star poster', format: 'poster', category: 'Event', tags: ['y2k', 'chrome', 'poster', 'party'],
  pages: [page(linear(180, '#2D5BFF', '#7FA6FF', ICE), [
    rect(0, 0, 1123, 1587, pattern('grid', 'rgba(255,255,255,0.25)', 'rgba(0,0,0,0)', 2.2)),
    T('SOFT', 30, 50, 1100, { font: 'Unbounded', size: 290, weight: 900, color: ICE, ls: -30, lh: 1 }),
    chrome('star4', 90, 260, 940, 940, { shadow: { x: 0, y: 30, blur: 50, color: 'rgba(10,16,51,0.35)' } }),
    T('LAUNCH', 30, 1090, 1100, { font: 'Unbounded', size: 190, weight: 900, color: NAVY, ls: -20, lh: 1 }),
    rect(40, 1340, 1043, 3, NAVY),
    lab('Friday 12 September', 40, 1362, 500, NAVY, { size: 24 }),
    lab('Studio Ljus, Kungsholmen', 583, 1362, 500, NAVY, { size: 24, align: 'right' }),
    T('Doors at nine.\nWear something shiny.', 40, 1420, 640, { font: 'Space Grotesk', size: 40, weight: 600, color: NAVY, ls: -10 }),
    ...win(790, 1420, 293, 110, 'rsvp.exe', ICE, PINK),
    T('Say yes', 810, 1470, 250, { font: 'Space Grotesk', size: 36, weight: 700, color: NAVY }),
  ])],
}));

list.push(tpl({
  id: 'y2k-holo-heart-post', name: 'Holo heart post', format: 'post', category: 'Social', tags: ['y2k', 'holo', 'heart', 'announcement'],
  pages: [page(linear(160, '#FFD6EC', '#C8D8FF'), [
    holo('heart', 140, 190, 800, 760),
    T('SOFT\nLAUNCH', 40, 860, 1000, { font: 'Syne', size: 132, weight: 800, color: NAVY, ls: -30, lh: 0.95, align: 'center' }),
    lab('New season', 60, 60, 400, NAVY, { size: 24 }),
    lab('Online and in store', 620, 60, 400, NAVY, { size: 24, align: 'right' }),
    rect(40, 1240, 1000, 3, NAVY),
    T('04 / 10 / 26', 40, 1262, 500, { font: 'Space Grotesk', size: 36, weight: 700, color: NAVY }),
    T('www.soft-launch.shop', 440, 1262, 600, { font: 'Space Grotesk', size: 36, weight: 700, color: NAVY, align: 'right' }),
  ])],
}));

// Holo foil business card, two sides.
list.push(tpl({
  id: 'y2k-holo-card', name: 'Holo business card', format: 'card', category: 'Business', tags: ['business card', 'holo', 'y2k', 'designer'],
  pages: [
    page(ICE, [
      img('tex/holo-foil.jpg', 0, 0, 1004, 650, { opacity: 0.9 }),
      chrome('star4', 640, 40, 330, 330),
      T('Mina Okafor', 50, 440, 900, { font: 'Syne', size: 72, weight: 800, color: NAVY, ls: -30 }),
      lab('Motion designer', 54, 550, 600, NAVY, { size: 24 }),
    ]),
    page(BLUE, [
      rect(0, 0, 1004, 650, pattern('grid', 'rgba(255,255,255,0.22)', 'rgba(0,0,0,0)', 2.4)),
      chrome('pill', 40, 40, 360, 120),
      lab('mina@okafor.studio', 50, 280, 700, ICE, { size: 36, ls: 40, upper: false }),
      lab('+46 70 123 45 67', 50, 340, 700, ICE, { size: 36, ls: 40, upper: false }),
      lab('okafor.studio', 50, 400, 700, ICE, { size: 36, ls: 40, upper: false }),
      ...win(620, 330, 340, 250, 'portfolio.exe', ICE, PINK),
      qr('https://okafor.studio', 740, 394, 130, NAVY, ICE),
    ]),
  ],
}));

// Desktop style deck.
list.push(tpl({
  id: 'y2k-desktop-deck', name: 'Desktop window deck', format: 'slide', category: 'Presentation', tags: ['deck', 'slides', 'y2k', 'windows'],
  pages: [
    page(linear(180, BLUE, SKY), [
      rect(0, 0, 1920, 1080, pattern('grid', 'rgba(255,255,255,0.22)', 'rgba(0,0,0,0)', 3)),
      chrome('star4', 1180, 130, 700, 700),
      ...win(100, 200, 1000, 560, 'welcome.exe'),
      T('The web\nwe built', 140, 280, 920, { font: 'Syne', size: 130, weight: 800, color: NAVY, ls: -50, lh: 0.88 }),
      lab('A short history of home pages', 140, 640, 920, NAVY, { size: 28 }),
      rect(0, 1020, 1920, 60, SILVER, { stroke: stroke(NAVY, 3) }),
      rect(10, 1028, 200, 44, ICE, { stroke: stroke(NAVY, 3) }), T('Start', 50, 1034, 150, { font: 'Space Grotesk', size: 26, weight: 700, color: NAVY }),
      T('9:41', 1800, 1034, 100, { font: 'Space Grotesk', size: 26, weight: 700, color: NAVY, align: 'right' }),
    ]),
    page(ICE, [
      T('Three things\nthat mattered', 90, 80, 1700, { font: 'Syne', size: 100, weight: 800, color: NAVY, ls: -40, lh: 0.9 }),
      ...[['Guestbooks', PINK], ['Webrings', BLUE], ['Visitor counters', NAVY]].map(([t, c], i) => [
        ...win(90 + i * 600, 440, 540, 480, `0${i + 1}.exe`, SKY, c),
        T(`0${i + 1}`, 120 + i * 600, 500, 480, { font: 'Syne', size: 150, weight: 800, color: NAVY, ls: -30, lh: 1 }),
        T(t, 120 + i * 600, 820, 480, { font: 'Space Grotesk', size: 44, weight: 700, color: NAVY, ls: -20 }),
      ]),
    ]),
    page(NAVY, [
      holo('blob', 1060, 120, 760, 760),
      T('Why it\nstill feels\nlike home.', 100, 140, 1000, { font: 'Syne', size: 118, weight: 800, color: ICE, ls: -50, lh: 0.9 }),
      lab('Because someone chose every pixel', 100, 800, 900, SKY, { size: 28 }),
    ]),
    page(BLUE, [
      chrome('star4', 600, -120, 720, 720),
      T('Thank you', 100, 600, 1720, { font: 'Syne', size: 175, weight: 800, color: ICE, ls: -50, lh: 1 }),
      lab('hello@theweb.example', 100, 940, 900, ICE, { size: 32 }),
    ]),
  ],
}));

// Story: chrome heart and marquee.
list.push(tpl({
  id: 'y2k-story-night', name: 'Chrome night story', format: 'story', category: 'Social', tags: ['story', 'party', 'y2k', 'night'],
  pages: [page(linear(180, NAVY, '#1B3BD6', '#8DB3FF'), [
    rect(0, 0, 1080, 1920, pattern('grid', 'rgba(255,255,255,0.14)', 'rgba(0,0,0,0)', 2.6)),
    lab('Saturday 18 October', 60, 70, 600, ICE, { size: 28 }), lab('Club Silver', 620, 70, 400, ICE, { size: 28, align: 'right' }),
    T('MILLENNIUM', 60, 170, 1000, { font: 'Bricolage Grotesque', size: 150, weight: 800, color: ICE, ls: -50, lh: 1 }),
    T('BUG BALL', 60, 320, 1000, { font: 'Bricolage Grotesque', size: 150, weight: 800, color: PINK, ls: -40, lh: 1 }),
    chrome('heart', 140, 560, 800, 760, { shadow: { x: 0, y: 40, blur: 60, color: 'rgba(0,0,0,0.5)' } }),
    holo('pill', 60, 1380, 400, 110, { rotation: -6 }),
    rect(0, 1640, 1080, 280, ICE),
    T('Dress code: aluminium.\nDoors 22:00, last entry 01:00.', 60, 1680, 960, { font: 'Space Grotesk', size: 46, weight: 700, color: NAVY, lh: 1.2 }),
    lab('tickets at clubsilver.example', 60, 1830, 960, BLUE, { size: 28 }),
  ])],
}));

// Email header banner.
list.push(tpl({
  id: 'y2k-banner-liquid', name: 'Liquid email header', format: 'banner', category: 'Marketing', tags: ['banner', 'email', 'header', 'newsletter'],
  pages: [page(linear(90, BLUE, SKY), [
    chrome('blob', 760, -140, 520, 520),
    holo('star4', 1040, 200, 150, 150),
    T('Spring\ndrop', 40, 34, 480, { font: 'Bricolage Grotesque', size: 150, weight: 800, color: ICE, ls: -50, lh: 0.86 }),
    ...win(500, 130, 340, 190, 'new.exe', ICE, PINK),
    T('Fourteen small\nthings for the sun.', 518, 182, 310, { font: 'Space Grotesk', size: 24, weight: 700, color: NAVY, lh: 1.15 }),
  ])],
}));

// Flyer: navy with holo orb and ring text.
list.push(tpl({
  id: 'y2k-flyer-orb', name: 'Orb flyer', format: 'flyer', category: 'Event', tags: ['flyer', 'party', 'y2k', 'holo'],
  pages: [page(NAVY, [
    holo('ellipse', 90, 120, 380, 380),
    circle(60, 90, 440, 'rgba(0,0,0,0)', { stroke: stroke(ICE, 2) }),
    circle(30, 60, 500, 'rgba(0,0,0,0)', { stroke: stroke('rgba(238,244,255,0.4)', 2, 'dash') }),
    T('Cyber\nCafe', 30, 520, 500, { font: 'Bricolage Grotesque', size: 108, weight: 800, color: ICE, ls: -40, lh: 0.88 }),
    rect(30, 720, 499, 2, SKY),
    lab('Fri 3 Oct   21:00', 30, 735, 300, SKY, { size: 13 }), lab('Torggatan 9', 230, 735, 299, SKY, { size: 13, align: 'right' }),
    lab('Slow internet, fast music', 30, 758, 499, PINK, { size: 12 }),
    lab('Liquid Jo', 20, 20, 300, SKY, { size: 12, ls: 120 }), lab('Mica', 240, 20, 300, SKY, { size: 12, align: 'right' }),
  ])],
}));

// Pin: auto reply window.
list.push(tpl({
  id: 'y2k-pin-window', name: 'Window notice pin', format: 'pin', category: 'Social', tags: ['pinterest', 'notice', 'window', 'announcement'],
  pages: [page(linear(180, SKY, ICE), [
    rect(0, 0, 1000, 1500, pattern('grid', 'rgba(45,91,255,0.2)', 'rgba(0,0,0,0)', 2.6)),
    chrome('star4', 520, 60, 420, 420),
    ...win(80, 380, 840, 640, 'out_of_office.exe', ICE, BLUE),
    T('Back on\nthe 14th.', 130, 470, 760, { font: 'Bricolage Grotesque', size: 170, weight: 800, color: NAVY, ls: -50, lh: 0.88 }),
    T('I am swimming somewhere cold with no signal. Anything urgent can wait, anything lovely can be sent by post.', 130, 800, 740, { font: 'Space Grotesk', size: 34, weight: 500, color: NAVY, lh: 1.25 }),
    rect(130, 940, 220, 56, PINK, { stroke: stroke(NAVY, 3) }), T('OK', 130, 950, 220, { font: 'Space Grotesk', size: 30, weight: 700, color: NAVY, align: 'center' }),
    holo('heart', 600, 1100, 300, 280), holo('pill', 80, 1130, 380, 100),
    lab('Studio closed 1 to 13 August', 80, 1420, 840, NAVY, { size: 22 }),
  ])],
}));
