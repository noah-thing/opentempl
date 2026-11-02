import { tpl, page, T, S, rect, circle, path, L, svg, img, qr, overlay, stroke } from '../kit.mjs';

// Menu rows: name left, price right on a tab, optional one line description.
// items: [name, description, price]
function rows(items, x, y, w, pitch, o = {}) {
  const size = o.size ?? 17, dsize = o.dsize ?? 12.5;
  const out = [];
  items.forEach(([name, desc, price], i) => {
    const yy = y + i * pitch;
    out.push(T(name, x, yy, w - 70, { font: o.font ?? 'Bricolage Grotesque', size, weight: o.weight ?? 700, color: o.color ?? '#1B1A17', lh: 1.15, ls: o.ls ?? 0, upper: o.upper }));
    if (price) out.push(T(price, x + w - 64, yy + (o.pdy ?? 0), 64, { font: o.pfont ?? o.font ?? 'Bricolage Grotesque', size: o.psize ?? size, weight: o.pweight ?? 600, color: o.pcolor ?? o.color ?? '#1B1A17', align: 'right', lh: 1.15 }));
    if (desc) out.push(T(desc, x, yy + size * 1.2, w - 70, { font: o.dfont ?? o.font ?? 'Bricolage Grotesque', size: dsize, weight: o.dweight ?? 400, color: o.dcolor ?? o.color ?? '#1B1A17', opacity: o.dop ?? 0.7, lh: 1.25 }));
  });
  return out;
}
const label = (txt, x, y, w, color = '#1B1A17', p = {}) => T(txt, x, y, w, { font: 'Bricolage Grotesque', size: 12, weight: 700, ls: 180, upper: true, color, ...p });

// ---------------------------------------------------------------- 1
const cafeNord = (() => {
  const INK = '#1B1A17', CREAM = '#EFE6D2', TOM = '#D8402A', PINK = '#E8869B', BLUE = '#2A47C8', OCH = '#C99A2E', MAUVE = '#8E6C86';
  const col = 396, cw = 358;
  const sec = (title, y, items) => [
    T(title, col, y, cw, { font: 'Bricolage Grotesque', size: 26, weight: 800, ls: -20, color: INK }),
    L(col, y + 38, col + cw, y + 38, INK, 1.5),
    rows(items, col, y + 52, cw, 40, { size: 15.5, dsize: 12 }),
  ];
  return tpl({
    id: 'food-menu-cafe-nord', name: 'Cafe menu, rotated name', format: 'a4', category: 'Menu', tags: ['menu', 'cafe', 'coffee', 'price list'],
    pages: [page(CREAM, [
      // rotated title
      T('Café Nord', -250, 520, 1000, { font: 'Archivo', size: 200, weight: 800, ls: -60, lh: 0.9, color: INK, rotation: 270 }),
      sec('Hot', 52, [['Espresso', 'Single or double', '3.0'], ['Flat white', 'Oat or whole milk', '4.2'], ['Filter, today', 'Ask what is on', '3.4'], ['Cortado', 'Small and strong', '3.8']]),
      sec('Cold', 304, [['Cold brew', 'Twelve hours, over ice', '4.6'], ['Iced oat latte', 'Vanilla optional', '4.8'], ['Tonic espresso', 'Orange peel', '4.9'], ['Mint soda', 'Lime, not too sweet', '3.9']]),
      sec('Tea', 556, [['Sencha', 'Pot for one', '3.8'], ['Mint and ginger', 'Fresh, not a bag', '3.6'], ['Masala chai', 'Spiced, with milk', '4.4'], ['Rooibos', 'Caffeine free', '3.6']]),
      sec('Bakery', 808, [['Cardamom bun', 'Baked at six', '3.5'], ['Rye and cheese', 'Toasted', '5.2'], ['Seed cookie', 'Salt, dark chocolate', '2.8']]),
      L(col, 1010, col + cw, 1010, INK, 1),
      T('Oat milk is free. Dogs are welcome.', col, 1024, cw, { font: 'Bricolage Grotesque', size: 12.5, color: INK, opacity: 0.7 }),
      T('Mon to Fri 7 to 17\nSat and Sun 9 to 16', col, 1056, 180, { font: 'Bricolage Grotesque', size: 12.5, weight: 600, lh: 1.35, color: INK }),
      T('Ostra Hamngatan 14', col + 190, 1056, 168, { font: 'Bricolage Grotesque', size: 12.5, weight: 600, lh: 1.35, color: INK, align: 'right' }),
      overlay('tex/paper-fibre.jpg', 794, 1123, 'multiply', 0.35),
    ])],
  });
})();

// ---------------------------------------------------------------- 2
const checkerDiner = (() => {
  const RED = '#D7261E', CREAM = '#F6EEDC';
  const W = 1123, H = 1587, c = 43;
  const checker = (y) => { const out = []; for (let r = 0; r < 2; r++) for (let i = 0; i < Math.ceil(W / c); i++) if ((i + r) % 2 === 0) out.push(rect(i * c, y + r * c, c, c, RED)); return out; };
  const colW = 470, x1 = 62, x2 = 591;
  const sec = (title, x, y, items) => [
    T(title, x, y, colW, { font: 'Archivo', size: 30, weight: 900, color: RED, upper: true, ls: 10 }),
    L(x, y + 44, x + colW, y + 44, RED, 3),
    rows(items, x, y + 62, colW, 62, { font: 'Archivo', size: 20, dsize: 14, color: RED, weight: 700, dop: 0.85, upper: true, ls: 20, dweight: 500 }),
  ];
  return tpl({
    id: 'food-menu-checker-diner', name: 'Diner menu poster', format: 'poster', category: 'Menu', tags: ['menu', 'diner', 'burgers', 'poster'],
    pages: [page(CREAM, [
      checker(0), checker(H - 2 * c),
      T('Tucker’s', 40, 120, 1043, { font: 'Alfa Slab One', size: 218, color: RED, ls: -30, lh: 1, align: 'center' }),
      T('Burgers, hot dogs & shakes since 1974', 40, 365, 1043, { font: 'Archivo', size: 20, weight: 700, ls: 250, upper: true, color: RED, align: 'center' }),
      sec('Small plates', x1, 450, [['Onion rings', 'Beer batter, ranch', '6.5'], ['Chili cheese fries', 'Beef chili, cheddar', '8.0'], ['Pickle chips', 'Fried, dill dip', '5.5'], ['Wings, six', 'Hot honey', '9.0']]),
      sec('Burgers', x2, 450, [['The classic', 'Single patty, pickles, onion', '11.0'], ['Double trouble', 'Two patties, American cheese', '14.0'], ['Smoke stack', 'Bacon, bbq, crispy onion', '15.5'], ['Garden', 'Beet and bean patty', '12.5']]),
      sec('Hot dogs', x1, 830, [['Chicago', 'Mustard, relish, peppers', '8.5'], ['Chili dog', 'Beef chili, onions', '9.0'], ['Plain jane', 'Ketchup, mustard', '6.0']]),
      sec('Salads', x2, 830, [['Wedge', 'Blue cheese, bacon', '10.5'], ['Cobb', 'Chicken, egg, avocado', '13.0'], ['Slaw', 'Cabbage, apple, lime', '6.0']]),
      sec('Sides', x1, 1140, [['Fries', '', '4.5'], ['Tater tots', '', '5.0'], ['Mac and cheese', '', '6.5']]),
      sec('Shakes', x2, 1140, [['Vanilla, chocolate, strawberry', '', '7.0'], ['Malted', '', '7.5'], ['Root beer float', '', '6.5']]),
      T('Cash or card. Ask for extra napkins.', 40, 1448, 1043, { font: 'Archivo', size: 14, weight: 700, ls: 150, upper: true, color: RED, align: 'center' }),
    ])],
  });
})();

// ---------------------------------------------------------------- 3
const noodles = (() => {
  const RED = '#C8261B', CREAM = '#F3E9D4', INK = '#1A1210';
  const strands = [];
  for (let i = 0; i < 15; i++) {
    const x = 60 + i * 50;
    const sway = (i % 2 ? 1 : -1) * (46 + (i % 4) * 14);
    const endx = 397 + (x - 397) * 0.42;
    strands.push(path(`M ${x} 112 C ${x + sway} 260, ${endx - sway} 400, ${endx} 640`, 0, 0, 794, 650, 'transparent', { w0: 794, h0: 650, stroke: stroke(CREAM, 10) }));
  }
  const sec = (title, num, y, items) => [
    T(num, 130, y + 6, 60, { font: 'Archivo', size: 15, weight: 700, color: RED }),
    T(title, 170, y - 12, 400, { font: 'Archivo', size: 34, weight: 900, color: RED, ls: -10, upper: true }),
    L(130, y + 34, 724, y + 34, RED, 2),
    rows(items, 130, y + 48, 594, 46, { font: 'Archivo', size: 16.5, color: INK, weight: 700, dsize: 12.5, dweight: 400 }),
  ];
  return tpl({
    id: 'food-menu-noodle-bar', name: 'Noodle bar menu, two pages', format: 'a4', category: 'Menu', tags: ['menu', 'noodles', 'asian', 'two page'],
    pages: [
      page('#DF5445', [
        img('art/food-noodle-bowl-print.jpg', 0, 0, 794, 1123),
        T('Slurp', 40, 880, 714, { font: 'Archivo', size: 240, weight: 900, color: CREAM, ls: -70, lh: 0.8, align: 'center' }),
        T('Noodle bar', 60, 1064, 674, { font: 'Archivo', size: 16, weight: 700, ls: 450, upper: true, color: CREAM, align: 'center' }),
        T('Hand pulled\nevery morning', 52, 56, 260, { font: 'Archivo', size: 15, weight: 700, ls: 150, upper: true, color: CREAM, lh: 1.3 }),
        T('Open daily\n12 to 22', 482, 56, 260, { font: 'Archivo', size: 15, weight: 700, ls: 150, upper: true, color: CREAM, lh: 1.3, align: 'right' }),
      ]),
      page(CREAM, [
        rect(0, 0, 84, 1123, RED),
        T('Slurp noodle bar', -450, 520, 1000, { font: 'Archivo', size: 56, weight: 900, color: CREAM, ls: -10, upper: true, rotation: 270, align: 'center' }),
        sec('Broths', '01', 70, [['Tonkotsu', 'Pork bone, 18 hour, soft egg, scallion', '13.5'], ['Shoyu chicken', 'Clear broth, menma, nori', '12.5'], ['Miso mushroom', 'Corn, butter, sesame', '12.5']]),
        sec('Dry', '02', 340, [['Sesame noodles', 'Chili crisp, cucumber, peanut', '11.0'], ['Dan dan', 'Minced pork, pickled greens', '12.0'], ['Garlic chive', 'Vegan, fried shallot', '10.5']]),
        sec('Small', '03', 610, [['Gyoza, six', 'Pan fried, black vinegar', '7.5'], ['Smashed cucumber', 'Garlic, sesame oil', '5.5'], ['Rice, a bowl', 'Steamed, plain', '3.0']]),
        sec('Drinks', '04', 830, [['Barley tea', 'Hot or iced', '3.0'], ['Yuzu soda', 'Sharp and cold', '4.5'], ['Lager, 33 cl', 'Light, from the tap', '5.5']]),
        T('Extra noodles 3.0   Extra egg 2.0   Spice level 1 to 5, ask', 130, 1050, 594, { font: 'Archivo', size: 12.5, weight: 600, color: RED, ls: 40 }),
      ]),
    ],
  });
})();

// ---------------------------------------------------------------- 4
const colourCards = (() => {
  const fish = '<svg viewBox="0 0 100 60"><path d="M5 30 Q35 0 70 20 L96 4 L88 30 L96 56 L70 40 Q35 60 5 30Z" fill="#111"/><circle cx="23" cy="27" r="3.2" fill="#fff"/><path d="M42 18 Q46 30 42 42 M52 18 Q56 30 52 42" stroke="#fff" stroke-width="2.5" fill="none"/></svg>';
  const bird = '<svg viewBox="0 0 100 80"><path d="M10 55 Q10 20 45 20 Q50 5 62 10 L78 6 L68 18 Q85 28 85 48 Q80 72 45 72 Q14 72 10 55Z" fill="#111"/><circle cx="62" cy="14" r="2.5" fill="#fff"/><path d="M40 72 L38 80 M52 72 L52 80" stroke="#111" stroke-width="3"/></svg>';
  const carrot = '<svg viewBox="0 0 60 100"><path d="M12 24 Q30 14 48 24 L33 96 Q30 100 27 96Z" fill="#111"/><path d="M30 20 Q18 4 10 2 M30 20 Q30 2 30 0 M30 20 Q42 4 52 4" stroke="#111" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M20 40 H30 M30 56 H40 M24 70 H32" stroke="#fff" stroke-width="2.5"/></svg>';
  const cake = '<svg viewBox="0 0 100 80"><path d="M8 40 H92 V74 H8Z" fill="#111"/><path d="M8 40 Q20 24 32 40 Q44 24 56 40 Q68 24 80 40 Q86 32 92 40" fill="#111"/><rect x="47" y="8" width="6" height="22" fill="#111"/><path d="M50 2 Q56 8 50 14 Q44 8 50 2Z" fill="#111"/></svg>';
  const cards = [
    ['Sea', '#9CC9F2', 70, 900, fish, [['Cod, brown butter', '24'], ['Mussels, cider', '19'], ['Smoked trout', '17'], ['Fish soup', '16'], ['Prawn toast', '14'], ['Oysters, three', '18'], ['Crab on rye', '17'], ['Herring, three ways', '15']]],
    ['Land', '#F0B84A', 70 + 249, 840, bird, [['Roast chicken', '23'], ['Pork belly', '25'], ['Beef cheek', '28'], ['Lamb ribs', '27'], ['Sausage, mash', '18'], ['Duck leg', '29'], ['Steak, fries', '34']]],
    ['Garden', '#F08A66', 70 + 498, 780, carrot, [['Carrots, tahini', '13'], ['Beet, goat curd', '14'], ['Charred leek', '12'], ['Mushroom toast', '15'], ['Burnt cabbage', '13'], ['Green salad', '8']]],
    ['Sweet', '#A9D4A4', 70 + 747, 870, cake, [['Burnt cheesecake', '9'], ['Plum tart', '9'], ['Sorbet, two', '7'], ['Chocolate pot', '8'], ['Ice cream', '6'], ['Cheese plate', '12'], ['Coffee, tea', '4']]],
  ];
  const els = [];
  cards.forEach(([t, col, x, h, art, list]) => {
    const y = 1517 - h;
    els.push(rect(x, y, 235, h, col));
    els.push(T(t, x + 20, y + 22, 215, { font: 'Anton', size: 48, color: '#111', upper: true, lh: 1 }));
    list.forEach(([n, p], j) => {
      const yy = y + 130 + j * 58;
      els.push(T(n, x + 20, yy, 160, { font: 'Space Mono', size: 13.5, weight: 700, color: '#111', lh: 1.2 }));
      els.push(T(p, x + 190, yy, 30, { font: 'Space Mono', size: 13.5, weight: 700, color: '#111', align: 'right' }));
      els.push(L(x + 20, yy + 34, x + 215, yy + 34, '#111', 1));
    });
  });
  return tpl({
    id: 'food-menu-colour-cards', name: 'Menu in colour cards', format: 'poster', category: 'Menu', tags: ['menu', 'restaurant', 'poster', 'colourful'],
    pages: [page('#111111', [
      T('The\nmenu', 62, 40, 700, { font: 'Anton', size: 260, color: '#F4EFE4', upper: true, lh: 0.88, ls: -10 }),
      T('Twelve to ten,\ntuesday to sunday.\nShare everything.', 760, 74, 300, { font: 'Space Mono', size: 17, color: '#F4EFE4', lh: 1.45 }),
      els,
    ])],
  });
})();

// ---------------------------------------------------------------- 5
const storySpecial = (() => {
  const CREAM = '#F2E8D5', TOM = '#D8402A', INK = '#1B1A17';
  return tpl({
    id: 'food-menu-special-story', name: 'Special of the day story', format: 'story', category: 'Menu', tags: ['story', 'special', 'soup', 'lunch'],
    pages: [page(CREAM, [
      T('89', -60, 330, 1300, { font: 'Archivo', size: 1000, weight: 900, ls: -80, lh: 0.8, color: TOM }),
      T('Special', 70, 96, 700, { font: 'Archivo', size: 30, weight: 700, ls: 300, upper: true, color: INK }),
      T('Tuesday 5 March', 70, 140, 700, { font: 'Archivo', size: 30, weight: 400, ls: 300, upper: true, color: INK }),
      L(70, 200, 1010, 200, INK, 3),
      T('Soup of\nthe day', 70, 1175, 940, { font: 'Gloock', size: 150, color: INK, lh: 0.95, ls: -30 }),
      T('Roast tomato, basil oil, sourdough toast.', 70, 1500, 700, { font: 'Archivo', size: 36, weight: 500, color: INK, lh: 1.25 }),
      L(70, 1640, 1010, 1640, INK, 2),
      T('Served 11 to 15', 70, 1670, 450, { font: 'Archivo', size: 28, weight: 700, color: INK }),
      T('Eat in or take away', 70, 1710, 450, { font: 'Archivo', size: 28, weight: 400, color: INK }),
      T('Vegan\nGluten free on request', 600, 1670, 410, { font: 'Archivo', size: 28, weight: 400, color: INK, align: 'right', lh: 1.4 }),
      S('burst', 700, 1080, 300, 300, INK, { rotation: -12 }),
      T('while\nit lasts', 700, 1175, 300, { font: 'Archivo', size: 46, weight: 800, color: CREAM, align: 'center', lh: 1, rotation: -12, ls: -10 }),
      overlay('tex/paper-fibre.jpg', 1080, 1920, 'multiply', 0.4),
    ])],
  });
})();

// ---------------------------------------------------------------- 6
const wineList = (() => {
  const WINE = '#5E1A28', CREAM = '#F1E6D6', INK = '#2A1A18', GOLD = '#C9A46A';
  const idx = [['Sparkling', '02'], ['White', '02'], ['Orange', '02'], ['Red', '03'], ['By the glass', '03']];
  const row = (y, name, place, year, g, b) => [
    T(name, 70, y, 340, { font: 'Cormorant Garamond', size: 20, weight: 700, color: INK, lh: 1.1 }),
    T(place, 70, y + 22, 340, { font: 'Jost', size: 11.5, weight: 400, color: INK, opacity: 0.65, lh: 1.2, ls: 20 }),
    T(year, 430, y + 2, 80, { font: 'Cormorant Garamond', size: 18, weight: 500, color: INK }),
    T(g, 560, y + 2, 60, { font: 'Cormorant Garamond', size: 18, weight: 500, color: INK, align: 'right' }),
    T(b, 650, y + 2, 74, { font: 'Cormorant Garamond', size: 18, weight: 700, color: INK, align: 'right' }),
  ];
  const head = (title, y) => [
    T(title, 70, y, 400, { font: 'Gloock', size: 32, color: WINE }),
    L(70, y + 48, 724, y + 48, WINE, 1.5),
  ];
  return tpl({
    id: 'food-menu-wine-list', name: 'Wine list, two pages', format: 'a4', category: 'Menu', tags: ['wine', 'list', 'restaurant', 'two page'],
    pages: [
      page(WINE, [
        T('Wine\nlist', 56, 120, 700, { font: 'Gloock', size: 270, color: CREAM, lh: 0.82, ls: -40 }),
        T('Autumn selection', 70, 640, 500, { font: 'Jost', size: 16, weight: 400, ls: 350, upper: true, color: GOLD }),
        L(70, 700, 724, 700, GOLD, 1),
        idx.map(([n, p], i) => [
          T(n, 70, 730 + i * 44, 400, { font: 'Cormorant Garamond', size: 26, weight: 500, color: CREAM }),
          T(p, 624, 736 + i * 44, 100, { font: 'Jost', size: 14, weight: 400, ls: 150, color: GOLD, align: 'right' }),
        ]),
        T('Ask us for a taste before you decide.\nAll wines are 75 cl. Glass 12 cl.', 70, 1000, 400, { font: 'Cormorant Garamond', size: 17, color: CREAM, opacity: 0.75, lh: 1.35 }),
        T('Nº 7', 604, 1000, 120, { font: 'Gloock', size: 30, color: GOLD, align: 'right' }),
      ]),
      page(CREAM, [
        T('Glass', 560, 54, 60, { font: 'Jost', size: 11, weight: 500, ls: 200, upper: true, color: INK, align: 'right' }),
        T('Bottle', 650, 54, 74, { font: 'Jost', size: 11, weight: 500, ls: 200, upper: true, color: INK, align: 'right' }),
        T('Year', 430, 54, 80, { font: 'Jost', size: 11, weight: 500, ls: 200, upper: true, color: INK }),
        head('Sparkling', 76),
        row(148, 'Crémant de Loire Brut', 'Chenin Blanc, Saumur', '2020', '12', '68'),
        row(206, 'Franciacorta Satèn', 'Chardonnay, Lombardy', '2019', '', '92'),
        row(264, 'Pet nat rosé', 'Gamay, Beaujolais', '2022', '11', '62'),
        head('White', 340),
        row(412, 'Chablis, Vieilles Vignes', 'Chardonnay, Burgundy', '2021', '14', '79'),
        row(470, 'Grüner Veltliner', 'Kamptal, Austria', '2022', '11', '58'),
        row(528, 'Albariño', 'Rías Baixas, Spain', '2022', '12', '64'),
        head('Orange', 604),
        row(676, 'Ribolla Gialla', 'Friuli, Italy', '2020', '13', '72'),
        row(734, 'Skin contact Riesling', 'Pfalz, Germany', '2021', '12', '66'),
        head('Red', 810),
        row(882, 'Nebbiolo', 'Langhe, Piedmont', '2020', '15', '88'),
        row(940, 'Cinsault', 'Swartland, South Africa', '2022', '11', '60'),
        row(998, 'Rioja Reserva', 'Tempranillo, Rioja Alta', '2018', '13', '74'),
        T('Please tell us about any allergies. Sulphites are present in all wines.', 70, 1070, 654, { font: 'Cormorant Garamond', size: 14, color: INK, opacity: 0.7 }),
        overlay('tex/paper-fibre.jpg', 794, 1123, 'multiply', 0.3),
      ]),
    ],
  });
})();

// ---------------------------------------------------------------- 7
const drinksBlocks = (() => {
  const BG = '#F4F2EC', INK = '#111111';
  const cell = (x, y, w, h, fill) => rect(x, y, w, h, fill, { stroke: stroke(INK, 4) });
  const list = (items, x, y, w, pitch, color, size = 17) => items.map(([n, p], i) => [
    T(n, x, y + i * pitch, w - 60, { font: 'IBM Plex Mono', size, weight: 500, color, lh: 1.2 }),
    T(p, x + w - 56, y + i * pitch, 56, { font: 'IBM Plex Mono', size, weight: 700, color, align: 'right' }),
  ]);
  return tpl({
    id: 'food-menu-drinks-blocks', name: 'Drinks menu block grid', format: 'poster', category: 'Menu', tags: ['drinks', 'bar', 'cocktails', 'poster'],
    pages: [page(BG, [
      cell(40, 40, 230, 460, INK),
      T('DRINK', -145, 180, 600, { font: 'Anton', size: 180, color: BG, lh: 1, rotation: 270, align: 'center' }),
      cell(270, 40, 813, 460, BG),
      T('Cocktails', 300, 60, 400, { font: 'Anton', size: 64, color: INK, upper: true }),
      T('All 14', 300, 135, 200, { font: 'IBM Plex Mono', size: 15, color: INK, opacity: 0.6 }),
      list([['Negroni', '12'], ['Paper plane', '13'], ['Espresso martini', '13'], ['Gimlet', '12'], ['Old fashioned', '14']], 300, 200, 340, 46, INK),
      list([['Margarita', '12'], ['Daiquiri', '12'], ['Whisky sour', '13'], ['Paloma', '12'], ['House spritz', '10']], 710, 200, 340, 46, INK),
      cell(40, 500, 880, 540, BG),
      T('Beer', 70, 520, 400, { font: 'Anton', size: 64, color: INK, upper: true }),
      T('On tap', 70, 620, 200, { font: 'IBM Plex Mono', size: 15, weight: 700, color: INK, upper: true, ls: 100 }),
      list([['Pilsner 40 cl', '6'], ['Pale ale 40 cl', '7'], ['Dark lager 40 cl', '7'], ['Sour, guest 30 cl', '8'], ['IPA 40 cl', '8']], 70, 660, 290, 46, INK, 16),
      T('Bottles', 400, 620, 200, { font: 'IBM Plex Mono', size: 15, weight: 700, color: INK, upper: true, ls: 100 }),
      list([['Wheat 50 cl', '8'], ['Stout 33 cl', '8'], ['Cider 33 cl', '7'], ['Lager 0.0', '5'], ['Gose 33 cl', '8']], 400, 660, 270, 46, INK, 16),
      L(710, 560, 710, 1010, INK, 2),
      T('Happy hour', 740, 620, 170, { font: 'IBM Plex Mono', size: 15, weight: 700, color: INK, upper: true, ls: 100 }),
      T('Mon to Fri\n16 to 18\n\nAll tap beer 4', 740, 660, 170, { font: 'IBM Plex Mono', size: 17, weight: 500, color: INK, lh: 1.4 }),
      cell(920, 500, 163, 540, INK),
      T('WINE', 701, 683, 600, { font: 'Anton', size: 175, color: BG, lh: 1, rotation: 270, align: 'center' }),
      cell(40, 1040, 380, 507, BG),
      T('No or low', 70, 1060, 330, { font: 'Anton', size: 64, color: INK, upper: true, lh: 1 }),
      list([['Zero spritz', '7'], ['Ginger beer', '5'], ['Cold brew tonic', '6'], ['Fresh lemonade', '5'], ['Kombucha', '6']], 70, 1230, 320, 46, INK, 16),
      cell(420, 1040, 663, 507, BG),
      T('Spirits', 450, 1060, 400, { font: 'Anton', size: 64, color: INK, upper: true }),
      list([['Gin', '9'], ['Vodka', '9'], ['Rum, white', '9'], ['Rum, dark', '10'], ['Tequila', '10'], ['Mezcal', '12']], 450, 1160, 290, 44, INK),
      list([['Rye', '11'], ['Bourbon', '11'], ['Scotch', '12'], ['Cognac', '13'], ['Amaro', '9'], ['Calvados', '11']], 770, 1160, 290, 44, INK),
      T('Neat, rocks or a short pour. Ask the bar.', 450, 1480, 600, { font: 'IBM Plex Mono', size: 14, color: INK, opacity: 0.6 }),
    ])],
  });
})();

// ---------------------------------------------------------------- 8
const lunchWeek = (() => {
  const Y = '#F2C230', INK = '#141414';
  const days = [['Mon', 'Meatballs, mash, lingonberry', 'Pickled cucumber', ''], ['Tue', 'Baked cod, dill potatoes', 'Browned butter, capers', ''], ['Wed', 'Lentil dal, flatbread', 'Raita, coriander', 'V'], ['Thu', 'Pea soup, thin pancakes', 'Jam and cream, as it should be', ''], ['Fri', 'Fried chicken, slaw', 'Hot honey, pickles', 'GF']];
  const els = [];
  days.forEach(([d, dish, sub, tag], i) => {
    const y = 470 + i * 142;
    els.push(L(60, y, 1020, y, INK, i === 0 ? 8 : 3));
    els.push(T(d, 60, y + 20, 200, { font: 'Anton', size: 84, color: INK, upper: true, lh: 1 }));
    els.push(T(dish, 280, y + 28, 640, { font: 'Archivo', size: 38, weight: 800, color: INK, ls: -15, lh: 1.05 }));
    els.push(T(sub, 280, y + 82, 640, { font: 'Archivo', size: 24, weight: 400, color: INK, lh: 1.1 }));
    if (tag) els.push(T(tag, 900, y + 34, 120, { font: 'Archivo', size: 26, weight: 800, color: INK, align: 'right', ls: 80 }));
  });
  return tpl({
    id: 'food-menu-lunch-week', name: 'Weekly lunch board', format: 'post', category: 'Menu', tags: ['lunch', 'weekly', 'daily special', 'instagram'],
    pages: [page(Y, [
      T('Lunch\nthis week', 54, 40, 980, { font: 'Archivo', size: 196, weight: 900, color: INK, ls: -70, lh: 0.84 }),
      T('Week 11', 800, 90, 220, { font: 'Archivo', size: 28, weight: 700, ls: 250, upper: true, color: INK, align: 'right' }),
      els,
      L(60, 1190, 1020, 1190, INK, 8),
      T('119', 60, 1214, 300, { font: 'Anton', size: 100, color: INK, lh: 1 }),
      T('Includes salad bar, bread\nand coffee. Served 11 to 14.', 300, 1236, 480, { font: 'Archivo', size: 26, weight: 500, color: INK, lh: 1.25 }),
      T('V vegetarian\nGF gluten free', 800, 1238, 220, { font: 'Archivo', size: 22, weight: 600, color: INK, align: 'right', lh: 1.3 }),
    ])],
  });
})();

// ---------------------------------------------------------------- 9
const boardSlide = (() => {
  const G = '#17382B', CREAM = '#F1E8D3', OCH = '#E3A72F';
  const col = (x, title, items) => [
    T(title, x, 130, 360, { font: 'Fraunces', size: 58, weight: 700, color: OCH, ls: -20 }),
    L(x, 215, x + 360, 215, CREAM, 2),
    rows(items, x, 245, 360, 112, { font: 'Bricolage Grotesque', size: 32, weight: 700, color: CREAM, dsize: 21, dcolor: CREAM, dop: 0.7, psize: 32 }),
  ];
  return tpl({
    id: 'food-menu-board-slide', name: 'Digital menu board', format: 'slide', category: 'Menu', tags: ['menu board', 'screen', 'cafe', 'slide'],
    pages: [page(G, [
      rect(0, 0, 520, 1080, OCH),
      T('Menu', 44, 40, 470, { font: 'Anton', size: 215, color: G, upper: true, lh: 1, ls: -5 }),
      T('Order at the counter.\nWe bring it to you.', 52, 520, 440, { font: 'Bricolage Grotesque', size: 34, weight: 600, color: G, lh: 1.2 }),
      T('Open 7 to 18\nEvery day', 52, 930, 440, { font: 'Bricolage Grotesque', size: 28, weight: 500, color: G, lh: 1.3 }),
      col(580, 'Coffee', [['Espresso', 'Double shot', '35'], ['Flat white', 'Silky milk', '49'], ['Latte', 'Tall glass', '52'], ['Filter', 'Refills free', '39'], ['Cortado', 'Small and strong', '42']]),
      col(990, 'Other', [['Hot chocolate', 'Dark, 70 percent', '48'], ['Chai latte', 'House spiced', '52'], ['Fresh juice', 'Orange or apple', '55'], ['Iced tea', 'Peach, lemon', '42'], ['Matcha', 'Whisked to order', '54']]),
      col(1400, 'Bakery', [['Cardamom bun', 'Baked at six', '38'], ['Cheese toastie', 'Rye, mustard', '58'], ['Banana bread', 'Brown butter', '36'], ['Seed cookie', 'Salt, dark chocolate', '28'], ['Fruit of the day', '', '15']]),
      T('Swish or card', 580, 960, 360, { font: 'Bricolage Grotesque', size: 26, weight: 600, color: OCH }),
      T('Oat milk +5', 990, 960, 360, { font: 'Bricolage Grotesque', size: 26, weight: 600, color: OCH }),
    ])],
  });
})();

export default [cafeNord, checkerDiner, noodles, colourCards, storySpecial, wineList, drinksBlocks, lunchWeek, boardSlide];
