import { tpl, page, T, S, rect, circle, L, img, overlay, svg, qr, pattern, path } from '../kit.mjs';
import { R, f, curve, jit, dense, blobPts, blob, star, rectD, lineD, polyD, squig, halftone, P, fl, sk, circ, g, wrap, art, uid, flowerD, leafD, face, asterisk, roughFilter } from '../notes/hand-kit.mjs';

const PAPER = '#F3EDDF';
const PINK = '#FF48B0';
const BLUE = '#0078BF';
const YELLOW = '#FFE800';
const GREEN = '#00A95C';
const TEAL = '#00838A';
const RED = '#F15060';
const ORANGE = '#FF6C2F';
const BLACK = '#1A1A1A';
const GRAIN = (W, H, o = 0.5) => overlay('tex/risograph-speckle.jpg', W, H, 'multiply', o);
const mul = (el) => ({ ...el, blend: 'multiply' });
const mono = { font: 'Space Mono', weight: 400 };
const PAPER_IMG = '#F0E3D1';
const PINK_IMG = '#FF48B0';

// fern frond: leaflets along a curved stem. returns { leaves: [d], stem: d }
function fern(len, spread, seed, pairs = 11, rot = 0) {
  const r = R(seed);
  const stemPts = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    stemPts.push([t * len, -Math.sin(t * 2.2) * spread * 0.55 - t * t * spread * 0.4]);
  }
  const at = (t) => {
    const k = t * 12, i = Math.min(11, Math.floor(k)), u = k - i;
    return [stemPts[i][0] * (1 - u) + stemPts[i + 1][0] * u, stemPts[i][1] * (1 - u) + stemPts[i + 1][1] * u];
  };
  const leaves = [];
  for (let i = 1; i <= pairs; i++) {
    const t = i / (pairs + 1);
    const p = at(t), q = at(Math.min(1, t + 0.04));
    const ang = Math.atan2(q[1] - p[1], q[0] - p[0]);
    const size = Math.sin(Math.PI * Math.min(1, t * 0.9 + 0.12)) * spread * 0.95 + spread * 0.25;
    leaves.push(leafD(p[0], p[1], size, size * 0.2, ang - 0.95 + (r() - 0.5) * 0.2, i * 3 + seed));
    leaves.push(leafD(p[0], p[1], size, size * 0.2, ang + 0.95 + (r() - 0.5) * 0.2, i * 5 + seed));
  }
  const tip = at(1);
  leaves.push(leafD(tip[0] - 20, tip[1], spread * 0.5, spread * 0.16, -0.5, 99));
  return { leaves, stem: curve(stemPts, false) };
}
// a cut paper flower: petals, centre, stem, two leaves. returns svg string
function cutFlower(cx, cy, r, stemLen, seed, color, hole) {
  const sx = cx + (seed % 2 ? 1 : -1) * r * 0.3;
  const stem = `M${f(cx)} ${f(cy + r * 0.2)}C${f(cx + (sx - cx) * 2)} ${f(cy + stemLen * 0.4)} ${f(sx)} ${f(cy + stemLen * 0.7)} ${f(sx + 6)} ${f(cy + stemLen)}`;
  let out = sk(stem, color, r * 0.16);
  out += fl(leafD(cx + (sx - cx) * 0.8, cy + stemLen * 0.55, r * 1.1, r * 0.28, -0.7, seed), color);
  out += fl(leafD(cx + (sx - cx) * 0.7, cy + stemLen * 0.38, r * 0.9, r * 0.24, Math.PI + 0.7, seed + 2), color);
  const pn = 5 + (seed % 3);
  const rr = R(seed + 40);
  for (let i = 0; i < pn; i++) {
    const a = (i / pn) * 360 + rr() * 14;
    out += `<ellipse cx="${f(cx)}" cy="${f(cy - r * 0.55)}" rx="${f(r * 0.34)}" ry="${f(r * (0.5 + rr() * 0.12))}" fill="${color}" transform="rotate(${f(a)} ${f(cx)} ${f(cy)})"/>`;
  }
  out += circ(cx, cy, r * 0.2, hole);
  return out;
}

export default [
  // 1 ------------------------------------------------------------
  (() => {
    const W = 1123, H = 1587;
    const fr = fern(900, 250, 4, 12);
    const clip = uid('c');
    const tf = 'translate(40 760) rotate(-32)';
    const dots = halftone(1123, 900, 14, (x, y) => 0.15 + (y / 900) * 0.9, 0.45);
    const fernSvg = art(1123, 900, `<clipPath id="${clip}">${fr.leaves.map((d) => fl(d, '#000', { transform: tf })).join('')}</clipPath><g clip-path="url(#${clip})">${fl(dots, BLUE)}</g><g transform="${tf}">${sk(fr.stem, BLUE, 8)}</g>`, 0, 0, { blend: 'multiply' });
    const head = (dx, dy, color, extra = {}) => ['PLANT', 'SWAP'].map((w, i) => T(w, 34 + dx, 720 + i * 355 + dy, 1500, { font: 'Anton', size: 400, ls: -10, lh: 0.9, color, blend: 'multiply', ...extra }));
    return tpl({
      id: 'riso-plant-swap', name: 'Plant swap poster', format: 'poster', category: 'Event', tags: ['plants', 'market', 'community', 'swap'],
      pages: [page(PAPER, [
        circle(520, 90, 640, YELLOW, { blend: 'multiply' }),
        fernSvg,
        head(0, 0, GREEN),
        T('No. 04', 44, 44, 300, { ...mono, size: 22, color: BLACK, ls: 60 }),
        T('Saturday 14 June\n10 to 16\nHarbour Hall, Gullbergs', 44, 76, 420, { ...mono, size: 22, lh: 1.35, color: BLACK }),
        T('Bring a cutting.\nTake a cutting.\nFree for everyone.', 790, 1480, 300, { ...mono, size: 22, lh: 1.35, color: BLACK }),
        GRAIN(W, H),
      ]),
      ]
    });
  })(),

  // 2 ------------------------------------------------------------
  (() => {
    const W = 1080, H = 1350;
    const paper = '#F1EBDD';
    const flowerBox = (x, y, w, h, bg, fg, seed, n = 2) => {
      const r = R(seed);
      let inner = '';
      for (let i = 0; i < n; i++) inner += cutFlower(w * (0.3 + 0.4 * i) + (r() - 0.5) * 20, h * (0.22 + r() * 0.12), w * (n > 1 ? 0.16 : 0.26), h * 0.8, seed + i, fg, bg);
      return [rect(x, y, w, h, bg, { blend: 'multiply' }), art(w, h, inner, x, y, {})];
    };
    return tpl({
      id: 'riso-cutflower-show', name: 'Cut paper flowers carousel', format: 'post', category: 'Event', tags: ['exhibition', 'flowers', 'gallery', 'carousel'],
      pages: [
        page(paper, [
          rect(120, 110, 600, 860, BLUE, { blend: 'multiply' }),
          art(600, 860, cutFlower(300, 300, 190, 560, 3, paper, BLUE) + cutFlower(130, 160, 70, 300, 2, paper, BLUE), 120, 110),
          rect(520, 620, 440, 560, BLACK),
          art(440, 560, cutFlower(300, 190, 120, 340, 5, YELLOW, BLACK), 520, 620),
          T('Wild &\nWonderful\nFlowers', 120, 1020, 560, { font: 'Bricolage Grotesque', weight: 800, size: 74, lh: 0.95, ls: -30, color: BLACK }),
          T('A winter show of paper cuts\nby eleven studios', 120, 1236, 520, { font: 'Space Grotesk', size: 24, lh: 1.3, color: BLACK }),
          T('8.25', 548, 1070, 300, { font: 'Bricolage Grotesque', weight: 800, size: 84, ls: -40, color: YELLOW }),
          T('Flower Gallery Oslo', 120, 62, 500, { font: 'Space Grotesk', size: 22, weight: 500, ls: 60, color: BLACK }),
          GRAIN(W, H),
        ]),
        page(paper, [
          rect(60, 60, 460, 640, BLUE, { blend: 'multiply' }),
          art(460, 640, cutFlower(230, 210, 140, 420, 7, paper, BLUE), 60, 60),
          rect(560, 60, 460, 300, YELLOW, { blend: 'multiply' }),
          art(460, 300, cutFlower(150, 130, 80, 160, 9, BLACK, YELLOW) + cutFlower(330, 120, 60, 150, 4, BLACK, YELLOW), 560, 60),
          rect(560, 400, 460, 300, BLACK, { blend: 'multiply' }),
          art(460, 300, cutFlower(230, 130, 90, 170, 12, paper, BLACK), 560, 400),
          T('Eleven studios,\none cutting table.', 60, 760, 1000, { font: 'Bricolage Grotesque', weight: 800, size: 96, lh: 0.92, ls: -40, color: BLACK }),
          T('Each one is cut from a single sheet with a knife. They all come out a little different.', 60, 1040, 520, { font: 'Space Grotesk', size: 28, lh: 1.35, color: BLACK }),
          T('02', 960, 1260, 80, { ...mono, size: 24, color: BLACK, align: 'right' }),
          GRAIN(W, H),
        ]),
        page(BLUE, [
          rect(60, 60, 960, 1230, paper),
          T('Visit', 100, 100, 600, { font: 'Bricolage Grotesque', weight: 800, size: 140, ls: -50, color: BLUE, blend: 'multiply' }),
          L(100, 300, 980, 300, BLACK, 3),
          T('Opens', 100, 340, 300, { ...mono, size: 22, ls: 100, upper: true, color: BLACK }),
          T('Friday 8 August', 100, 384, 700, { font: 'Bricolage Grotesque', weight: 700, size: 60, ls: -20, color: BLACK }),
          T('Closes', 100, 520, 300, { ...mono, size: 22, ls: 100, upper: true, color: BLACK }),
          T('Sunday 31 August', 100, 564, 700, { font: 'Bricolage Grotesque', weight: 700, size: 60, ls: -20, color: BLACK }),
          T('Hours', 100, 700, 300, { ...mono, size: 22, ls: 100, upper: true, color: BLACK }),
          T('Tuesday to Sunday\n11 to 18, Thursday till 21', 100, 744, 800, { font: 'Bricolage Grotesque', weight: 700, size: 50, lh: 1.1, ls: -20, color: BLACK }),
          rect(100, 960, 330, 250, YELLOW, { blend: 'multiply' }),
          art(330, 250, cutFlower(165, 85, 56, 150, 3, BLACK, YELLOW), 100, 960),
          T('Flower Gallery\nStorgata 14, Oslo\nfloweroslo.example', 480, 980, 500, { font: 'Space Grotesk', size: 30, lh: 1.35, weight: 500, color: BLACK }),
          GRAIN(W, H),
        ]),
      ]
    });
  })(),

  // 5 ------------------------------------------------------------
  (() => {
    const W = 1920, H = 1080;
    const regMark = (x, y, r = 34, c = BLACK) => art(2 * r + 8, 2 * r + 8, circ(r + 4, r + 4, r * 0.62, 'none', { stroke: c, 'stroke-width': 3 }) + sk(`M${r + 4} 4V${2 * r + 4}M4 ${r + 4}H${2 * r + 4}`, c, 3), x - r - 4, y - r - 4);
    const deckHead = (n) => [T('How to print with three inks', 90, 62, 900, { ...mono, size: 24, color: BLACK, ls: 20 }), T(`0${n} / 04`, 1690, 62, 150, { ...mono, size: 24, color: BLACK })];
    return tpl({
      id: 'riso-three-inks-deck', name: 'Three inks workshop deck', format: 'slide', category: 'Presentation', tags: ['workshop', 'deck', 'print', 'slides'],
      pages: [
        page(PAPER, [
          circle(1000, 150, 620, PINK, { blend: 'multiply' }),
          circle(1250, 150, 620, YELLOW, { blend: 'multiply' }),
          circle(1125, 400, 620, BLUE, { blend: 'multiply' }),
          T('Three inks,\nno shortcuts.', 90, 330, 1400, { font: 'Bricolage Grotesque', weight: 800, size: 140, lh: 0.92, ls: -45, color: BLACK }),
          T('A short guide to printing with a risograph', 94, 680, 800, { font: 'Space Grotesk', size: 38, weight: 500, color: BLACK }),
          T('Fjord Press\nWorkshop notes 01', 94, 920, 500, { ...mono, size: 24, lh: 1.4, color: BLACK }),
          regMark(1790, 990),
          GRAIN(W, H),
        ]),
        page(PAPER, [
          rect(0, 0, 700, 1080, PINK, { blend: 'multiply' }),
          rect(620, 0, 700, 1080, YELLOW, { blend: 'multiply' }),
          rect(1240, 0, 680, 1080, BLUE, { blend: 'multiply' }),
          ...deckHead(2),
          T('01', 90, 150, 600, { font: 'Anton', size: 360, color: BLACK, lh: 1 }),
          T('Pink', 90, 640, 500, { font: 'Bricolage Grotesque', weight: 800, size: 88, ls: -30, color: BLACK }),
          T('Warm and loud. Lay it down first so the other inks can sit on top of it.', 90, 760, 460, { font: 'Space Grotesk', size: 30, lh: 1.35, color: BLACK }),
          T('02', 730, 150, 600, { font: 'Anton', size: 360, color: BLACK, lh: 1 }),
          T('Yellow', 730, 640, 500, { font: 'Bricolage Grotesque', weight: 800, size: 88, ls: -30, color: BLACK }),
          T('The lightest ink. Under blue it turns green, under pink it turns orange.', 730, 760, 460, { font: 'Space Grotesk', size: 30, lh: 1.35, color: BLACK }),
          T('03', 1350, 150, 600, { font: 'Anton', size: 360, color: BLACK, lh: 1 }),
          T('Blue', 1350, 640, 500, { font: 'Bricolage Grotesque', weight: 800, size: 88, ls: -30, color: BLACK }),
          T('Cool and deep. Use it for the line work and the small text.', 1350, 760, 460, { font: 'Space Grotesk', size: 30, lh: 1.35, color: BLACK }),
          GRAIN(W, H),
        ]),
        (() => {
          const dp = halftone(1920, 1080, 22, (x) => 1 - x / 1920 * 0.9, 0.26);
          const db = halftone(1920, 1080, 22, (x, y) => 0.1 + (x / 1920) * 0.95 - y / 3000, 1.3);
          return page(PAPER, [
            art(1920, 1080, fl(dp, PINK), 0, 0, { blend: 'multiply' }),
            art(1920, 1080, fl(db, BLUE), 0, 0, { blend: 'multiply' }),
            ...deckHead(3),
            T('Overprint', 78, 520, 1900, { font: 'Anton', size: 430, ls: -10, lh: 1, color: PAPER }),
            rect(60, 930, 940, 100, PAPER),
            T('Pink over blue is purple. Yellow over blue is green.', 94, 956, 900, { font: 'Space Grotesk', size: 38, weight: 600, color: BLACK }),
            GRAIN(W, H),
          ]);
        })(),
        page(PAPER, [
          T('PRINT', 100, 164, 1900, { font: 'Anton', size: 520, ls: -10, lh: 0.9, color: PINK, blend: 'multiply' }),
          T('Thursday 19:00, Studio 2', 94, 760, 1600, { font: 'Bricolage Grotesque', weight: 800, size: 88, ls: -30, color: BLACK }),
          T('Bring an apron and one drawing you do not mind losing.\nhello@fjordpress.example', 94, 890, 1100, { font: 'Space Grotesk', size: 34, lh: 1.4, color: BLACK }),
          regMark(1790, 960),
          GRAIN(W, H),
          ...deckHead(4),
        ]),
      ]
    });
  })(),

  // 6 ------------------------------------------------------------
  (() => {
    const W = 794, H = 1123;
    const tomato = (cx, cy, rx, ry, seed) => {
      const body = blob(cx, cy, rx, ry, { n: 11, amp: 0.05, seed });
      const hl = blob(cx - rx * 0.4, cy - ry * 0.35, rx * 0.2, ry * 0.12, { n: 6, amp: 0.1, seed: seed + 1, rot: 0.5 });
      return { body, hl, calyx: star(cx, cy - ry * 0.82, rx * 0.34, rx * 0.12, 5, seed, 0.12, -Math.PI / 2, true), cx, cy, rx, ry };
    };
    const ts = [tomato(250, 530, 170, 140, 2), tomato(540, 480, 150, 125, 5), tomato(420, 720, 190, 150, 8), tomato(180, 780, 115, 100, 11)];
    const reds = ts.map((t) => fl(t.body, RED) + fl(t.hl, PAPER, { opacity: 0.9 })).join('');
    const blues = ts.map((t) => sk(t.body, BLUE, 5, { transform: 'translate(9 7)' }) + fl(t.calyx, BLUE) + sk(`M${t.cx} ${f(t.cy - t.ry * 0.9)}q10 -34 30 -48`, BLUE, 5)).join('');
    const shade = ts.map((t, i) => { const id = uid('k'); const dots = halftone(W, H, 11, (x, y) => ((x - t.cx) / t.rx + (y - t.cy) / t.ry) * 0.5 + 0.25, 0.7); return `<clipPath id="${id}">${fl(t.body, '#000')}</clipPath><g clip-path="url(#${id})">${fl(dots, BLUE)}</g>`; }).join('');
    return tpl({
      id: 'riso-tomato-zine', name: 'Recipe zine, tomatoes', format: 'a4', category: 'Food', tags: ['recipe', 'zine', 'food', 'cookbook'],
      pages: [
        page(PAPER, [
          art(W, H, reds, 0, 0, { blend: 'multiply' }),
          art(W, H, shade, 0, 0, { blend: 'multiply', opacity: 0.55 }),
          art(W, H, blues, 0, 0, { blend: 'multiply' }),
          T('sugo', 60, 40, 700, { font: 'Bricolage Grotesque', weight: 800, size: 190, ls: -60, color: BLACK }),
          T('A sauce zine in\nfour small steps', 62, 250, 400, { font: 'Space Grotesk', size: 26, weight: 500, lh: 1.25, color: BLACK }),
          T('No. 03\nSummer', 640, 62, 120, { ...mono, size: 18, lh: 1.4, color: BLACK }),
          L(60, 940, 734, 940, BLACK, 2),
          T('1  Tomatoes, 1 kg\n2  Olive oil, 4 spoons\n3  Onion, one\n4  Salt, basil', 60, 960, 330, { ...mono, size: 17, lh: 1.55, color: BLACK }),
          T('Cook slow, forty minutes,\nuntil the pan goes quiet.\nTaste. Salt. Taste again.', 430, 960, 320, { ...mono, size: 17, lh: 1.55, color: BLACK }),
          GRAIN(W, H),
        ]),
        (() => {
          const on = blob(590, 440, 160, 170, { n: 10, amp: 0.04, seed: 4 });
          let rings = '';
          for (let i = 1; i < 6; i++) rings += sk(blob(590, 440, 160 - i * 26, 170 - i * 28, { n: 10, amp: 0.05, seed: i }), BLUE, 4);
          return page(PAPER, [
            art(W, H, fl(on, BLUE, { opacity: 0.22 }) + rings + sk(on, BLUE, 6), 0, 0, { blend: 'multiply' }),
            art(W, H, sk(on, RED, 5, { transform: 'translate(-8 -6)' }), 0, 0, { blend: 'multiply' }),
            T('Step one,\nthe onion', 60, 70, 380, { font: 'Bricolage Grotesque', weight: 800, size: 84, lh: 0.95, ls: -40, color: BLACK }),
            T('Cut it small.\nThe size of a lentil is fine, the size of a coin is not. Cry if you have to.', 60, 300, 290, { font: 'Space Grotesk', size: 24, lh: 1.4, color: BLACK }),
            L(60, 640, 734, 640, BLACK, 2),
            T('2', 60, 670, 120, { font: 'Anton', size: 150, color: RED, blend: 'multiply' }),
            T('Warm the oil in the widest pan you own. Add the onion and a pinch of salt. Wait until it is the colour of a church candle.', 190, 690, 540, { font: 'Space Grotesk', size: 26, lh: 1.4, color: BLACK }),
            T('3', 60, 860, 120, { font: 'Anton', size: 150, color: BLUE, blend: 'multiply' }),
            T('Tear the tomatoes in with your hands. Lower the heat. Leave the lid off and go and do something else.', 190, 880, 540, { font: 'Space Grotesk', size: 26, lh: 1.4, color: BLACK }),
            T('Sugo, page 2', 60, 1070, 400, { ...mono, size: 16, color: BLACK }),
            GRAIN(W, H),
          ]);
        })(),
      ]
    });
  })(),

  // 7 ------------------------------------------------------------
  (() => {
    const W = 1080, H = 1920;
    const sunDots = halftone(900, 900, 18, (x, y) => 1.05 - y / 900 * 1.1, 0.5);
    const sunClip = uid('s');
    const sun = art(900, 900, `<clipPath id="${sunClip}"><circle cx="450" cy="450" r="440"/></clipPath><g clip-path="url(#${sunClip})">${fl(sunDots, PINK)}</g>`, 90, 120, { blend: 'multiply' });
    let water = '';
    let y = 0, t = 8;
    while (y < 330) { water += `<rect x="0" y="${f(y)}" width="1080" height="${f(t)}" fill="${BLUE}"/>`; y += t * 2.0; t = Math.min(30, t + 2.4); }
    let refl = '';
    y = 0; t = 8;
    while (y < 330) { const w = 760 - y * 0.8; refl += `<rect x="${f(540 - w / 2)}" y="${f(y)}" width="${f(w)}" height="${f(t)}" fill="${PINK}"/>`; y += t * 2.0; t = Math.min(30, t + 2.4); }
    return tpl({
      id: 'riso-night-swim', name: 'Night swim lineup story', format: 'story', category: 'Event', tags: ['festival', 'lineup', 'story', 'summer'],
      pages: [page(PAPER, [
        sun,
        art(1080, 340, water, 0, 1190, { blend: 'multiply' }),
        art(1080, 340, refl, 0, 1190, { blend: 'multiply' }),
        rect(0, 1500, 1080, 420, BLUE, { blend: 'multiply' }),
        T('NIGHT\nSWIM', 70, 620, 1500, { font: 'Anton', size: 300, lh: 0.88, ls: -10, color: BLACK }),
        T('Open air music at the lido, Sat 16 August', 74, 56, 940, { ...mono, size: 26, color: BLACK }),
        T('Mira Lind\nThe Quiet Pool\nOtto & Ines\nDJ Backstroke\nSunken Choir', 74, 1556, 700, { font: 'Bricolage Grotesque', weight: 800, size: 62, lh: 1.03, ls: -30, color: PAPER }),
        T('Doors 18:00\nLast dip 23:30', 740, 1570, 280, { ...mono, size: 26, lh: 1.4, color: PAPER }),
        T('Free for members\nlidosummer.example', 740, 1790, 300, { ...mono, size: 22, lh: 1.4, color: PAPER }),
        GRAIN(W, H),
      ])]
    });
  })(),

  // 8 ------------------------------------------------------------
  tpl({
    id: 'riso-open-studio-cover', name: 'Open studio cover', format: 'cover', category: 'Social', tags: ['cover', 'header', 'studio', 'print'],
    pages: [page(PAPER, [
      T('OPEN', -20, -100, 2000, { font: 'Anton', size: 640, ls: -20, lh: 1, color: ORANGE, blend: 'multiply' }),
      T('STUDIO', 640, 300, 2000, { font: 'Anton', size: 330, ls: -20, lh: 1, color: BLUE, blend: 'multiply' }),
      circle(1380, 30, 170, PINK, { blend: 'multiply' }),
      T('Every first Saturday\n12 to 18, coffee on us', 880, 90, 600, { font: 'Space Grotesk', weight: 600, size: 30, lh: 1.25, color: BLACK }),
      GRAIN(1640, 624),
    ])]
  }),

  // 9 ------------------------------------------------------------
  tpl({
    id: 'riso-low-tide-issue', name: 'Zine cover, duotone', format: 'flyer', category: 'Publishing', tags: ['zine', 'cover', 'magazine', 'photo'],
    pages: [page(PAPER, [
      img('photos/archipelago.jpg', 0, 0, 559, 794, { filters: { duotone: ['#0A3FA8', '#FFB8DC'], contrast: 30, grain: 30 } }),
      overlay('tex/halftone-dots.jpg', 559, 794, 'multiply', 0.12),
      
      T('LOW\nTIDE', 24, 300, 700, { font: 'Anton', size: 210, lh: 0.84, ls: -10, color: YELLOW }),
      T('ISSUE 07', 30, 30, 300, { font: 'Archivo', weight: 800, size: 15, ls: 140, color: PAPER }),
      T('Winter 2025', 430, 30, 100, { font: 'Archivo', weight: 600, size: 15, ls: 60, color: PAPER }),
      T('Stories from the\nwaterline, written\nand drawn by\nthe people who\nlive there.', 30, 668, 260, { font: 'Space Grotesk', size: 15, lh: 1.3, weight: 500, color: PAPER }),
      T('48 pages\nRisograph, two inks\n60 kr', 380, 706, 150, { ...mono, size: 12, lh: 1.5, color: PAPER }),
      GRAIN(559, 794, 0.4),
    ])]
  }),

  // 10 -----------------------------------------------------------
  (() => {
    const W = 1004, H = 650;
    return tpl({
      id: 'riso-studio-card', name: 'Print studio card', format: 'card', category: 'Business', tags: ['business card', 'studio', 'print'],
      pages: [
        page(PAPER, [
          circle(520, 80, 380, PINK, { blend: 'multiply' }),
          circle(700, 160, 380, YELLOW, { blend: 'multiply' }),
          circle(610, 260, 380, BLUE, { blend: 'multiply' }),
          T('Fjord\nPress', 50, 360, 700, { font: 'Bricolage Grotesque', weight: 800, size: 130, lh: 0.88, ls: -50, color: BLACK }),
          T('Risograph printing, Gothenburg', 54, 590, 600, { ...mono, size: 20, color: BLACK }),
          GRAIN(W, H),
        ]),
        page(PAPER, [
          T('Saga Holm', 60, 62, 600, { font: 'Bricolage Grotesque', weight: 800, size: 64, ls: -30, color: BLACK }),
          T('Printer', 60, 140, 600, { ...mono, size: 22, color: BLACK }),
          L(60, 200, 944, 200, BLACK, 2),
          T('saga@fjordpress.example\n+46 70 123 45 67\nKvarnen, Nytorget 4\nGothenburg', 60, 240, 500, { font: 'Space Grotesk', size: 30, lh: 1.5, weight: 500, color: BLACK }),
          rect(700, 300, 244, 244, YELLOW, { blend: 'multiply' }),
          qr('https://fjordpress.example', 720, 320, 204, BLUE, 'transparent', { blend: 'multiply' }),
          rect(60, 580, 40, 12, PINK, { blend: 'multiply' }), rect(110, 580, 40, 12, YELLOW, { blend: 'multiply' }), rect(160, 580, 40, 12, BLUE, { blend: 'multiply' }),
          GRAIN(W, H),
        ]),
      ]
    });
  })(),

  // ---- image led: real risograph prints, commissioned; type and structure only ----
  // 13 -----------------------------------------------------------
  tpl({
    id: 'riso-img-field-flowers', name: 'Flower market, printed poppies', format: 'poster', category: 'Event', tags: ['flowers', 'market', 'poster', 'spring'],
    pages: [page(PAPER_IMG, [
      img('art/riso-print-wildflowers.jpg', 0, 170, 1123, 1417, { crop: { x: 0, y: 0, w: 1, h: 0.8407 } }),
      T('FIELD\nFLOWERS', 44, 40, 1000, { font: 'Anton', size: 180, lh: 0.86, ls: -10, color: BLUE, blend: 'multiply', opacity: 0.85 }),
      T('Saturday 21 June\n10 to 18\nKungstradgarden', 780, 60, 300, { ...mono, size: 22, lh: 1.4, color: BLACK }),
    ])],
  }),

  // 14 -----------------------------------------------------------
  tpl({
    id: 'riso-img-poppy-carousel', name: 'Poppy print carousel', format: 'post', category: 'Social', tags: ['carousel', 'flowers', 'shop', 'seasonal'],
    pages: [
      page(PAPER_IMG, [
        img('art/riso-print-wildflowers.jpg', 0, 0, 1080, 1350, { crop: { x: 0, y: 0, w: 1, h: 0.833 } }),
        T('POPPY\nSEASON', 54, 40, 1000, { font: 'Anton', size: 190, lh: 0.86, ls: -10, color: BLUE, blend: 'multiply' }),
        T('Three weeks\nonly', 590, 70, 400, { font: 'Bricolage Grotesque', weight: 800, size: 44, lh: 1, ls: -10, color: PINK_IMG, blend: 'multiply' }),
      ]),
      page(PAPER_IMG, [
        img('art/riso-print-wildflowers.jpg', 60, 60, 960, 745, { crop: { x: 0, y: 0.1, w: 0.58, h: 0.3 } }),
        T('Picked this\nmorning, sold\nby noon.', 60, 860, 960, { font: 'Bricolage Grotesque', weight: 800, size: 100, lh: 0.95, ls: -35, color: BLUE, blend: 'multiply' }),
        T('Everything on the table was cut at six from the field behind the barn. Tell us what you like and we will wrap it in paper.', 62, 1170, 880, { font: 'Space Grotesk', size: 28, lh: 1.35, color: BLACK }),
      ]),
      page(PAPER_IMG, [
        img('art/riso-print-wildflowers.jpg', 0, 700, 1080, 650, { crop: { x: 0, y: 0.55, w: 1, h: 0.4 } }),
        T('Find us', 60, 50, 900, { font: 'Anton', size: 170, color: BLUE, blend: 'multiply' }),
        T('Fridays and Saturdays, 8 to 14\nBehind the old dairy, Lindesberg', 62, 300, 960, { font: 'Space Grotesk', size: 38, lh: 1.35, weight: 600, color: BLACK }),
        T('Cash or swish. Bring a jar if you have one.', 62, 520, 960, { ...mono, size: 24, color: BLACK }),
      ]),
    ],
  }),

  // 15 -----------------------------------------------------------
  tpl({
    id: 'riso-img-fish-fair', name: 'Fish fair poster', format: 'poster', category: 'Event', tags: ['fish', 'market', 'harbour', 'food'],
    pages: [page(PAPER_IMG, [
      img('art/riso-print-fish.jpg', 0, 0, 1123, 1587, { crop: { x: 0, y: 0, w: 1, h: 0.9417 } }),
      T('THE CATCH', 40, 1130, 1083, { font: 'League Gothic', size: 250, ls: -5, lh: 1, color: BLUE, blend: 'multiply' }),
      L(44, 1418, 1079, 1418, BLACK, 2),
      T('Date', 44, 1436, 240, { font: 'Space Mono', size: 15, ls: 140, upper: true, color: BLUE, blend: 'multiply' }),
      T('Saturday\n6 September', 44, 1466, 250, { font: 'Space Grotesk', size: 22, lh: 1.3, weight: 600, color: BLACK }),
      T('From', 306, 1436, 240, { font: 'Space Mono', size: 15, ls: 140, upper: true, color: BLUE, blend: 'multiply' }),
      T('07:00, when the\nboats come in', 306, 1466, 250, { font: 'Space Grotesk', size: 22, lh: 1.3, weight: 600, color: BLACK }),
      L(292, 1436, 292, 1540, BLACK, 1),
      T('Eat', 568, 1436, 240, { font: 'Space Mono', size: 15, ls: 140, upper: true, color: BLUE, blend: 'multiply' }),
      T('Smoked, salted,\nraw, in a bun', 568, 1466, 250, { font: 'Space Grotesk', size: 22, lh: 1.3, weight: 600, color: BLACK }),
      L(554, 1436, 554, 1540, BLACK, 1),
      T('Where', 830, 1436, 240, { font: 'Space Mono', size: 15, ls: 140, upper: true, color: BLUE, blend: 'multiply' }),
      T('Fiskekrogen,\nSodra hamnen', 830, 1466, 250, { font: 'Space Grotesk', size: 22, lh: 1.3, weight: 600, color: BLACK }),
      L(816, 1436, 816, 1540, BLACK, 1),
    ])],
  }),

  // 16 -----------------------------------------------------------
  tpl({
    id: 'riso-img-fish-menu', name: 'Fish menu, two pages', format: 'a4', category: 'Food', tags: ['menu', 'fish', 'restaurant', 'seafood'],
    pages: [
      page(PAPER_IMG, [
        img('art/riso-print-fish.jpg', 0, 0, 794, 1123, { crop: { x: 0, y: 0, w: 1, h: 0.9417 } }),
        T('Fish on\nFridays', 50, 835, 700, { font: 'Bricolage Grotesque', weight: 800, size: 84, lh: 0.92, ls: -40, color: BLUE, blend: 'multiply' }),
        T('Whatever the boats brought in,\nwritten on the wall at noon.', 54, 1005, 600, { font: 'Space Grotesk', size: 22, lh: 1.35, color: BLACK }),
        T('Kvarnholmen, Nacka', 54, 1070, 400, { ...mono, size: 14, color: BLACK }),
      ]),
      page(PAPER_IMG, [
        img('art/riso-print-fish.jpg', 47, 50, 700, 252, { crop: { x: 0, y: 0.5, w: 1, h: 0.24 } }),
        T('Today', 50, 340, 400, { font: 'Bricolage Grotesque', weight: 800, size: 70, ls: -30, color: BLUE, blend: 'multiply' }),
        ...[['Mackerel, grilled, new potatoes', '145'], ['Carp, fried whole, pickled cucumber', '165'], ['Smoked tuna, rye, dill cream', '155'], ['Fish soup, bread, aioli', '125']].flatMap(([n, p], i) => [
          T(n, 50, 450 + i * 90, 560, { font: 'Space Grotesk', size: 26, weight: 600, color: BLACK }),
          T(p, 640, 450 + i * 90, 110, { ...mono, size: 24, color: BLACK, align: 'right' }),
          L(50, 450 + i * 90 + 48, 750, 450 + i * 90 + 48, BLACK, 1),
        ]),
        img('art/riso-print-fish.jpg', 47, 840, 700, 252, { crop: { x: 0, y: 0.26, w: 1, h: 0.24 } }),
      ]),
    ],
  }),

  // 17 -----------------------------------------------------------
  (() => {
    const W = 1920, H = 1080;
    const CREAM = '#F5ECDA';
    return tpl({
      id: 'riso-img-pool-slides', name: 'Pool club slides', format: 'slide', category: 'Presentation', tags: ['swimming', 'club', 'slides', 'summer'],
      pages: [
        page(PAPER_IMG, [
          img('art/riso-print-pool.jpg', 0, 0, W, H, { crop: { x: 0, y: 0, w: 1, h: 0.844 } }),
          T('POOL\nDAY', 90, 90, 900, { font: 'Anton', size: 420, lh: 0.82, ls: -10, color: CREAM }),
          T('Swimming club, summer term', 100, 900, 700, { font: 'Space Grotesk', size: 40, weight: 700, color: '#0B2A6B' }),
          T('Lido Saltsjon', 100, 960, 700, { ...mono, size: 26, color: '#0B2A6B' }),
        ]),
        page(PAPER_IMG, [
          img('art/riso-print-pool.jpg', 1260, 0, 660, 1080, { crop: { x: 0.45, y: 0, w: 0.4, h: 1 } }),
          T('Timetable', 90, 80, 1000, { font: 'Anton', size: 190, color: BLUE, blend: 'multiply' }),
          ...[['Mon', 'Kids, 16:00', 'Lanes 1 and 2'], ['Wed', 'Beginners, 18:30', 'Shallow end'], ['Fri', 'Open swim, 07:00', 'All lanes'], ['Sun', 'Long swim, 09:00', 'Lane 4 only']].flatMap(([d, t, w], i) => [
            T(d, 90, 360 + i * 150, 200, { font: 'Anton', size: 90, color: PINK_IMG, blend: 'multiply' }),
            T(t, 300, 372 + i * 150, 600, { font: 'Space Grotesk', size: 46, weight: 700, color: BLACK }),
            T(w, 300, 430 + i * 150, 600, { ...mono, size: 26, color: BLACK }),
            L(90, 345 + i * 150, 1160, 345 + i * 150, BLACK, 2),
          ]),
        ]),
        page(YELLOW, [
          img('art/riso-print-pool.jpg', 0, 0, 1080, 1080, { crop: { x: 0.45, y: 0, w: 0.4, h: 0.844 * 0.62 } }),
          T('First swim\nis free.', 1160, 130, 740, { font: 'Anton', size: 150, lh: 0.88, color: BLACK }),
          T('Bring a towel and a cap.\nWe have spare goggles.', 1164, 520, 700, { font: 'Space Grotesk', size: 40, lh: 1.3, weight: 600, color: BLACK }),
          T('pool@saltsjoklubben.example', 1164, 900, 700, { ...mono, size: 26, color: BLACK }),
        ]),
      ],
    });
  })(),

  // 18 -----------------------------------------------------------
  tpl({
    id: 'riso-img-pool-story', name: 'Pool story', format: 'story', category: 'Social', tags: ['story', 'swimming', 'summer', 'club'],
    pages: [page(PAPER_IMG, [
      img('art/riso-print-pool.jpg', 0, 0, 1080, 1560, { crop: { x: 0.42, y: 0, w: 0.5, h: 1 } }),
      rect(0, 1500, 1080, 420, PAPER_IMG),
      T('Lane 3\nis free.', 60, 1530, 960, { font: 'Anton', size: 190, lh: 0.88, ls: -10, color: BLUE, blend: 'multiply' }),
      T('Sundays 7 to 9, Lido Saltsjon', 64, 1860, 900, { ...mono, size: 28, color: BLACK }),
    ])],
  }),
  // 19 -----------------------------------------------------------
  tpl({
    id: 'riso-img-golden-hour', name: 'Evening walks poster', format: 'poster', category: 'Event', tags: ['city', 'walk', 'tour', 'evening'],
    pages: [page(PAPER_IMG, [
      img('art/riso-print-street.jpg', 0, 130, 1123, 1457, { crop: { x: 0, y: 0, w: 1, h: 0.864 } }),
      T('GOLDEN HOUR', 44, 40, 1060, { font: 'Anton', size: 150, ls: -10, lh: 1, color: ORANGE, blend: 'multiply' }),
      T('Walks through the housing estates of Angered,\nled by people who grew up there.', 46, 205, 700, { font: 'Space Grotesk', size: 26, lh: 1.35, weight: 600, color: BLACK }),
      rect(0, 1487, 1123, 100, PAPER_IMG),
      T('Thursdays in September, 18:30', 44, 1510, 700, { ...mono, size: 24, color: BLACK }),
      T('Meet at Angered torg', 700, 1510, 400, { ...mono, size: 24, color: BLACK }),
    ])],
  }),
];
