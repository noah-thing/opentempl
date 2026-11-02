import { tpl, page, T, S, rect, circle, L, img, path, stroke, qr } from '../kit.mjs';

const CLEAR = 'rgba(0,0,0,0)';
const polar = (cx, cy, r, a) => [cx + r * Math.sin((a * Math.PI) / 180), cy - r * Math.cos((a * Math.PI) / 180)];
const arcD = (cx, cy, r, a0, a1) => {
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
};
// ring sectors as filled shapes (stroked arcs render badly in the editor)
const donut = (cx, cy, r, thick, segs, gap = 1.2) => {
  const total = segs.reduce((a, s) => a + s.v, 0);
  let a = 0;
  const R = r + thick / 2, ri = r - thick / 2, box = R + 2;
  return segs.map((s) => {
    const a0 = a + gap / 2, a1 = a + (s.v / total) * 360 - gap / 2;
    a += (s.v / total) * 360;
    const big = a1 - a0 > 180 ? 1 : 0;
    const f = (pt) => `${(pt[0] - cx + box).toFixed(1)} ${(pt[1] - cy + box).toFixed(1)}`;
    const o0 = polar(cx, cy, R, a0), o1 = polar(cx, cy, R, a1), i1 = polar(cx, cy, ri, a1), i0 = polar(cx, cy, ri, a0);
    const d = `M${f(o0)} A${R} ${R} 0 ${big} 1 ${f(o1)} L${f(i1)} A${ri} ${ri} 0 ${big} 0 ${f(i0)} Z`;
    return path(d, cx - box, cy - box, box * 2, box * 2, s.color, { w0: box * 2, h0: box * 2 });
  });
};

// =========================================================================
// DECK 1: Kasse seed pitch. Warm paper, ink, one vermilion. Bricolage Grotesque + Instrument Sans.
// =========================================================================
const P = { paper: '#F6F3EC', ink: '#16191D', red: '#EE4B2B', mute: '#67655F', line: '#D8D3C6', tint: '#F8DCD1', soft: '#EAE5D8', dmute: '#A6A9AE' };
const PD = 'Bricolage Grotesque', PB = 'Instrument Sans';
const pd = (t, x, y, w, p = {}) => T(t, x, y, w, { font: PD, weight: 700, ls: -30, lh: 1.04, color: P.ink, ...p });
const pb = (t, x, y, w, p = {}) => T(t, x, y, w, { font: PB, size: 28, weight: 400, lh: 1.4, color: P.mute, ...p });
const plab = (t, x, y, color = P.red, w = 600, p = {}) => T(t, x, y, w, { font: PB, size: 18, weight: 600, ls: 140, upper: true, lh: 1.2, color, ...p });
const pchrome = (n, section, dark = false) => {
  const c = dark ? P.dmute : P.mute;
  return [
    rect(96, 62, 14, 14, P.red),
    T('Kasse', 122, 52, 300, { font: PD, size: 30, weight: 700, ls: -20, lh: 1.1, color: dark ? '#FFFFFF' : P.ink }),
    plab(section, 1224, 58, c, 600, { align: 'right' }),
    T(String(n).padStart(2, '0'), 96, 1000, 120, { font: PB, size: 22, weight: 600, ls: 80, lh: 1.2, color: dark ? '#FFFFFF' : P.ink }),
    T('Seed round 2026', 1524, 1000, 300, { font: PB, size: 22, weight: 500, lh: 1.2, color: c, align: 'right' }),
  ];
};

const pitch = tpl({
  id: 'deck-corporate-clean-pitch', name: 'Startup pitch deck', format: 'slide', category: 'Presentation',
  tags: ['presentation', 'slides', 'deck', 'pitch', 'startup', 'investor', 'seed', 'company'],
  pages: [
    // 1 cover
    page(P.paper, [
      rect(1280, 0, 640, 1080, P.red),
      ...Array.from({ length: 120 }, (_, i) => {
        const c = i % 12, r = Math.floor(i / 12);
        return rect(1354 + c * 42, 130 + r * 42, 30, 30, i === 0 ? P.ink : '#FFFFFF', { opacity: i === 0 ? 1 : 0.38 });
      }),
      pd('120', 1346, 560, 500, { size: 230, ls: -70, lh: 1, color: '#FFFFFF' }),
      T('One crate makes 120 trips. Every square is a cardboard box that never gets made.', 1354, 830, 470, { font: PB, size: 28, weight: 500, lh: 1.35, color: '#FFFFFF' }),
      plab('Seed round  /  2026', 96, 96, P.red),
      pd('Kasse', 84, 190, 1160, { size: 420, ls: -80, lh: 0.95 }),
      T('Reusable shipping crates for online shops that are tired of cardboard.', 96, 700, 900, { font: PB, size: 44, weight: 400, lh: 1.25, color: P.mute, ls: -10 }),
      L(96, 892, 1184, 892, P.ink, 2),
      ...[['Founded', '2023'], ['Based in', 'Stockholm'], ['Raising', '3 M EUR']].flatMap(([k, v], i) => [
        plab(k, 96 + i * 370, 920, P.red, 300, { size: 16 }),
        pd(v, 96 + i * 370, 950, 340, { size: 36, weight: 600, ls: -10, lh: 1.1 }),
      ]),
    ], { name: 'Cover', notes: 'Open with the grid on the right: each square is a cardboard box one crate replaces. Then say who we are in one sentence and what we are raising.' }),

    // 2 agenda
    page(P.paper, [
      ...pchrome(2, 'Agenda'),
      pd('Eight stops,\nfifteen\nminutes', 90, 170, 680, { size: 118, ls: -40, lh: 1.0 }),
      pb('Questions are welcome at any point. The numbers are in the appendix.', 96, 640, 560, { size: 28 }),
      ...[['The problem', '3 to 4'], ['The product', '5 to 6'], ['The market', '7'], ['The business', '8'], ['Traction', '9 to 10'], ['Competition', '11'], ['Team and plan', '12 to 13'], ['The ask', '14 to 15']].flatMap(([t, p], i) => {
        const col = i % 2, row = Math.floor(i / 2);
        const x = 780 + col * 540, y = 170 + row * 190;
        return [
          L(x, y, x + 490, y, i < 2 ? P.ink : P.line, i < 2 ? 3 : 1),
          T(String(i + 1).padStart(2, '0'), x, y + 26, 100, { font: PD, size: 60, weight: 700, ls: -20, lh: 1, color: P.red }),
          pd(t, x + 112, y + 28, 380, { size: 38, weight: 600, ls: -15, lh: 1.1 }),
          T('Slides ' + p, x + 112, y + 82, 380, { font: PB, size: 24, weight: 500, lh: 1.2, color: P.mute }),
        ];
      }),
    ], { name: 'Agenda', notes: 'Walk the eight stops quickly. Tell the room when the ask comes, so they can hold their questions about money until then.' }),

    // 3 problem (dark)
    page(P.ink, [
      pd('1', 140, 90, 900, { size: 1180, ls: -80, lh: 1, color: P.red }),
      ...pchrome(3, 'The problem', true),
      pd('A shipping box makes one trip.', 900, 190, 920, { size: 100, ls: -35, lh: 1.02, color: '#FFFFFF' }),
      pb('Online shops in the Nordics send 640 million parcels a year. Nearly every one leaves in a box that is used once and then, at best, recycled.', 900, 520, 800, { size: 34, lh: 1.4, color: '#D9DADD' }),
      L(900, 880, 1824, 880, '#FFFFFF', 1, { opacity: 0.25 }),
      T('Source: Postnord and Svensk Handel parcel reports, 2025', 900, 902, 900, { font: PB, size: 22, weight: 400, lh: 1.2, color: P.dmute }),
    ], { name: 'Problem', notes: 'Let the single numeral do the work. One trip, then the bin. Give the 640 million figure and move on.' }),

    // 4 why it hurts
    page(P.paper, [
      ...pchrome(4, 'The problem'),
      pd('Three reasons the box has to change', 90, 170, 640, { size: 84, ls: -35, lh: 1.04 }),
      ...[['1.30 EUR', 'What one cardboard parcel costs a shop once box, filler, tape and waste fees are counted.'], ['62%', 'of Nordic shoppers say they get too much packaging with an online order.'], ['2030', 'The year EU rules start to require a share of shipping packaging to be reusable.']].flatMap(([n, t], i) => {
        const y = 170 + i * 250;
        return [
          L(820, y, 1824, y, i === 0 ? P.ink : P.line, i === 0 ? 3 : 1),
          pd(n, 814, y + 44, 420, { size: 100, ls: -45, lh: 1, color: i === 0 ? P.red : P.ink }),
          pb(t, 1270, y + 52, 554, { size: 29, lh: 1.38, color: P.ink }),
        ];
      }),
      L(820, 920, 1824, 920, P.line, 1),
    ], { name: 'Why now', notes: 'Cost, customers, regulation. Three different people care about the same box. The 2030 rule is the reason this window is open now.' }),

    // 5 solution
    page(P.paper, [
      ...pchrome(5, 'The product'),
      pd('How a crate gets home', 90, 160, 1500, { size: 110, ls: -45, lh: 1.02 }),
      L(96, 480, 1824, 480, P.ink, 3),
      ...[['Pack', 'The shop packs the order in a Kasse crate and books any courier.'], ['Deliver', 'The customer keeps the goods and folds the crate.'], ['Drop off', 'Any of 4 100 pickup points takes it. No label, no queue.'], ['Wash', 'Our hubs wash, check and send it back to the shop.']].flatMap(([t, d], i) => {
        const x = 96 + i * 440;
        return [
          rect(x, 466, 28, 28, i === 3 ? P.red : P.ink),
          plab('Step ' + (i + 1), x, 540, P.red, 300, { size: 18 }),
          pd(t, x, 580, 400, { size: 60, ls: -25, lh: 1.05 }),
          pb(d, x, 670, 380, { size: 30 }),
        ];
      }),
      L(96, 880, 1824, 880, P.line, 1),
      pb('Median time from delivery to back on the shop shelf: 9 days.', 96, 902, 1000, { size: 26, color: P.ink, weight: 500 }),
    ], { name: 'Solution', notes: 'Four steps, one sentence each. Stress that the customer does nothing new: they already visit a pickup point to send returns.' }),

    // 6 product
    page(P.paper, [
      ...pchrome(6, 'The product'),
      pd('Three sizes and one lock', 90, 160, 1150, { size: 92, ls: -40, lh: 1.02 }),
      pb('Folds flat to 4 cm for the trip home. Rated for 120 trips. A tracker tag sits in every lid.', 1244, 176, 580, { size: 28, color: P.ink }),
      ...[['S', 368, 230, '32 x 22 x 14 cm  /  1.9 kg', 'Fits two jumpers'], ['M', 506, 322, '44 x 31 x 19 cm  /  3.1 kg', 'Fits a pair of jeans and a jacket'], ['L', 690, 414, '60 x 40 x 26 cm  /  4.6 kg', 'Fits a pair of boots']].flatMap(([n, w, h, dim, fit], i) => {
        const x = [96, 534, 1110][i], by = 820, y = by - h;
        return [
          rect(x, y, w, h, P.soft),
          rect(x, y, w, 8, P.ink),
          rect(x + w * 0.5 - 70, y + 34, 140, 22, P.paper),
          ...[0.38, 0.58, 0.78].map((f) => L(x, y + h * f, x + w, y + h * f, P.paper, 3)),
          rect(x + w * 0.5 - 24, y + h * 0.58 - 14, 48, 36, P.red),
          T(n, x, by + 28, 120, { font: PD, size: 64, weight: 700, ls: -20, lh: 1, color: P.ink }),
          T(dim, x + (i === 0 ? 70 : 80), by + 36, 480, { font: PB, size: 24, weight: 600, lh: 1.2, color: P.ink }),
          T(fit, x + (i === 0 ? 70 : 80), by + 70, 480, { font: PB, size: 24, weight: 400, lh: 1.2, color: P.mute }),
        ];
      }),
      L(96, 820, 1824, 820, P.ink, 2),
    ], { name: 'Product', notes: 'Point at the red lock: it is what makes a crate safe to hand to any courier. Mention that the sizes match what the top three shops already send.' }),

    // 7 market
    page(P.paper, [
      ...pchrome(7, 'The market'),
      rect(96, 170, 780, 780, P.soft),
      rect(96, 470, 480, 480, '#F2B8A3'),
      rect(96, 730, 220, 220, P.red),
      T('4.1 bn EUR', 120, 196, 700, { font: PD, size: 60, weight: 700, ls: -25, lh: 1.05, color: P.ink }),
      T('Europe, a year', 122, 270, 500, { font: PB, size: 24, weight: 500, lh: 1.2, color: P.mute }),
      T('610 M EUR', 120, 496, 440, { font: PD, size: 60, weight: 700, ls: -25, lh: 1.05, color: P.ink }),
      T('What we can reach', 122, 570, 400, { font: PB, size: 24, weight: 500, lh: 1.2, color: P.ink }),
      T('42 M', 118, 756, 190, { font: PD, size: 60, weight: 700, ls: -25, lh: 1.05, color: '#FFFFFF' }),
      T('By 2030', 120, 830, 190, { font: PB, size: 24, weight: 500, lh: 1.2, color: '#FFFFFF' }),
      pd('Where the first 42 million come from', 1000, 170, 824, { size: 68, ls: -30, lh: 1.05 }),
      ...[['All of Europe', 'Packaging that online shops pay for each year, 4.1 billion euro.'], ['What we can reach', 'The Nordics and the German speaking countries, shops sending 200 parcels a week or more.'], ['By 2030', '7 percent of what we can reach. It takes 310 shops.']].flatMap(([t, d], i) => {
        const y = 440 + i * 170;
        return [
          L(1000, y, 1824, y, i === 0 ? P.ink : P.line, i === 0 ? 2 : 1),
          pd(t, 1000, y + 22, 800, { size: 34, weight: 600, ls: -10, lh: 1.1 }),
          pb(d, 1000, y + 70, 824, { size: 26, lh: 1.3 }),
        ];
      }),
    ], { name: 'Market', notes: 'Top down, then bottom up: 42 million is 310 shops at about 135 thousand euro each. Say that sentence out loud, investors will do the maths anyway.' }),

    // 8 business model
    page(P.paper, [
      ...pchrome(8, 'The business'),
      pd('Each trip earns us 0.43 EUR', 90, 160, 1500, { size: 100, ls: -40, lh: 1.02 }),
      pb('Shops pay 0.95 EUR a trip. A cardboard parcel costs them 1.30 EUR.', 96, 300, 1100, { size: 32, color: P.ink }),
      // cardboard bar
      T('Cardboard', 96, 442, 260, { font: PB, size: 30, weight: 600, lh: 1.2, color: P.ink }),
      rect(380, 420, 1200, 120, P.soft),
      T('1.30 EUR', 400, 446, 600, { font: PD, size: 56, weight: 700, ls: -20, lh: 1.05, color: P.mute }),
      // kasse bar
      T('Kasse', 96, 622, 260, { font: PB, size: 30, weight: 600, lh: 1.2, color: P.ink }),
      ...[[0.18, 'Washing', P.ink], [0.22, 'Pickup and\ntransport', '#3A3F46'], [0.12, 'Crate\nwear', '#6B7078'], [0.43, 'Our margin', P.red]].reduce((acc, [v, name, col]) => {
        const k = 1200 / 1.3, w = v * k;
        acc.els.push(rect(380 + acc.x, 600, w - 4, 120, col));
        acc.els.push(T(v.toFixed(2), 380 + acc.x + 14, 632, 200, { font: PD, size: 42, weight: 700, ls: -20, lh: 1.05, color: '#FFFFFF' }));
        acc.els.push(T(name, 380 + acc.x, 740, w - 10, { font: PB, size: 24, weight: 500, lh: 1.25, color: P.ink }));
        acc.x += w;
        return acc;
      }, { x: 0, els: [] }).els,
      pd('27%', 1610, 400, 240, { size: 120, ls: -50, lh: 1, color: P.red }),
      pb('cheaper for the shop than cardboard', 1614, 536, 220, { size: 26, lh: 1.3, color: P.ink }),
      L(96, 880, 1824, 880, P.line, 1),
      pb('Gross margin 45 percent. A crate costs 14 EUR and pays back after 15 trips.', 96, 906, 1500, { size: 28, color: P.ink }),
    ], { name: 'Business model', notes: 'The shop saves 27 percent and we keep 45 percent gross margin. A crate is paid back after 15 of its 120 trips, which is why the model scales with volume and not with headcount.' }),

    // 9 traction
    page(P.paper, [
      ...pchrome(9, 'Traction'),
      pd('212 000', 66, 110, 1800, { size: 500, ls: -90, lh: 1, color: P.red }),
      pb('crate trips in 2025, with 94 percent of crates back in the system within two weeks.', 96, 590, 1050, { size: 40, lh: 1.3, color: P.ink, ls: -10 }),
      ...[['38', 'shops live', 'From a one shop pilot in January'], ['94%', 'of crates returned', 'Lost or damaged: 1 in 17'], ['9 days', 'average turnaround', 'From delivery to the shelf']].flatMap(([n, l, s], i) => {
        const x = 96 + i * 600;
        return [
          L(x, 760, x + 540, 760, P.ink, 2),
          pd(n, x, 780, 400, { size: 80, ls: -30, lh: 1.05 }),
          T(l, x, 878, 540, { font: PB, size: 28, weight: 600, lh: 1.2, color: P.ink }),
          T(s, x, 918, 540, { font: PB, size: 24, weight: 400, lh: 1.2, color: P.mute }),
        ];
      }),
    ], { name: 'Traction', notes: 'One number first. Then three proof points behind it: shops, returns, speed. If asked, 38 shops is up from a single pilot in January.' }),

    // 10 growth chart
    (() => {
      const data = [3, 4, 6, 8, 10, 12, 15, 18, 24, 30, 38, 44];
      const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const cx = 220, cy = 330, cw = 1560, ch = 520, max = 50;
      const pts = data.map((v, i) => [(i / 11) * cw, ch - (v / max) * ch]);
      const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
      return page(P.paper, [
        ...pchrome(10, 'Traction'),
        pd('From 3 000 trips a month to 44 000', 90, 150, 1500, { size: 84, ls: -35, lh: 1.04 }),
        ...[0, 10, 20, 30, 40, 50].flatMap((v) => [
          L(cx, cy + ch - (v / max) * ch, cx + cw, cy + ch - (v / max) * ch, v === 0 ? P.ink : P.line, v === 0 ? 2 : 1),
          T(v === 0 ? '0' : v + ' k', cx - 100, cy + ch - (v / max) * ch - 14, 80, { font: PB, size: 22, weight: 500, lh: 1.2, color: P.mute, align: 'right' }),
        ]),
        path(line + ` L${cw} ${ch} L0 ${ch} Z`, cx, cy, cw, ch, P.tint, { w0: cw, h0: ch }),
        path(line, cx, cy, cw, ch, CLEAR, { w0: cw, h0: ch, stroke: stroke(P.red, 7) }),
        circle(cx + pts[11][0] - 17, cy + pts[11][1] - 17, 34, P.red),
        T('44 000', cx + pts[11][0] - 180, cy + pts[11][1] - 82, 200, { font: PD, size: 50, weight: 700, ls: -20, lh: 1, color: P.ink, align: 'right' }),
        circle(cx + pts[10][0] - 9, cy + pts[10][1] - 9, 18, P.ink),
        T('Black Friday week', cx + pts[10][0] - 300, cy + pts[10][1] + 36, 320, { font: PB, size: 24, weight: 500, lh: 1.2, color: P.ink, align: 'right' }),
        ...mon.map((m, i) => T(m, cx + pts[i][0] - 40, cy + ch + 20, 80, { font: PB, size: 22, weight: 500, lh: 1.2, color: i === 11 ? P.ink : P.mute, align: 'center' })),
        pb('Crate trips per month in 2025, thousands. Total for the year: 212 000.', 96, 936, 1300, { size: 24, color: P.mute }),
      ], { name: 'Growth', notes: 'The curve is steeper than the shop count because existing shops send more each month. Black Friday week was our first real stress test and the hubs held.' });
    })(),

    // 11 competition
    page(P.paper, [
      ...pchrome(11, 'Competition'),
      pd('Four ways to ship a parcel', 90, 150, 1500, { size: 84, ls: -35, lh: 1.04 }),
      rect(1536, 262, 288, 662, P.tint),
      ...['Cardboard', 'Mailer bag', 'Other schemes', 'Kasse'].map((h, i) => pd(h, 690 + i * 282, 290, 280, { size: 30, weight: 700, ls: -10, lh: 1.1, color: i === 3 ? P.red : P.ink })),
      L(96, 354, 1824, 354, P.ink, 3),
      ...[
        ['Used more than once', ['No', 'No', 'Yes', 'Yes, 120 times']],
        ['Cost per parcel', ['1.30 EUR', '0.90 EUR', '1.60 EUR', '0.95 EUR']],
        ['Works with any courier', ['Yes', 'Yes', 'Partly', 'Yes']],
        ['Return at any pickup point', ['No', 'No', 'Own shops', 'Yes']],
        ['Tracked crate by crate', ['No', 'No', 'Yes', 'Yes']],
      ].flatMap(([k, vals], i) => {
        const y = 354 + i * 114;
        return [
          pb(k, 96, y + 36, 560, { size: 30, color: P.ink, weight: 500 }),
          ...vals.map((v, j) => T(v, 690 + j * 282, y + 38, 270, { font: PB, size: 28, weight: j === 3 ? 700 : 400, lh: 1.2, color: j === 3 ? P.red : P.mute })),
          L(96, y + 114, 1824, y + 114, P.line, 1),
        ];
      }),
    ], { name: 'Competition', notes: 'Be fair to the others. Mailer bags are cheap, other reuse schemes work but only inside one retailer. We are the only one that works with every courier and every pickup point.' }),

    // 12 team
    page(P.paper, [
      ...pchrome(12, 'The team'),
      pd('Built by people who have run the hubs, the code and a shop', 90, 150, 1500, { size: 66, ls: -28, lh: 1.06 }),
      ...[['Elsa Wennerberg', 'Chief executive', 'Ran a parcel hub for six years', 'photos/portrait.jpg', 0.2], ['Samir Haddad', 'Chief technology officer', 'Built the tracker tag and the app', 'photos/man.jpg', 0.25], ['Olivia Brandt', 'Chief operating officer', 'Ran a hotel laundry for 400 rooms', 'photos/portrait-window.jpg', 0.2], ['Jonas Ek', 'Head of sales', 'Founded and sold a web shop', 'photos/portrait-man-sun.jpg', 0.3]].flatMap(([n, r, d, ph], i) => {
        const x = 96 + i * 440;
        return [
          img(ph, x, 340, 396, 420, { filters: { duotone: ['#1A1210', '#F6E9E2'], contrast: 8, grain: 10 } }),
          rect(x, 340, 396, 420, P.red, { blend: 'multiply', opacity: 0.35 }),
          rect(x, 760, 396, 6, P.red),
          pd(n, x, 790, 396, { size: 34, ls: -10, lh: 1.15 }),
          T(r, x, 836, 396, { font: PB, size: 24, weight: 600, lh: 1.2, color: P.red }),
          T(d, x, 874, 396, { font: PB, size: 24, weight: 400, lh: 1.25, color: P.mute }),
        ];
      }),
    ], { name: 'Team', notes: 'One line per person, each tied to something they have already done. Add that nine more people work in the hubs and on the road.' }),

    // 13 roadmap
    (() => {
      const gx = 380, qw = 180, top = 300;
      const bar = (c0, c1, lane, label, fill, tc = '#FFFFFF') => [
        rect(gx + c0 * qw + 3, top + 70 + lane * 150, (c1 - c0) * qw - 6, 80, fill),
        T(label, gx + c0 * qw + 18, top + 70 + lane * 150 + 24, (c1 - c0) * qw - 30, { font: PB, size: 25, weight: 600, lh: 1.2, color: tc }),
      ];
      return page(P.paper, [
        ...pchrome(13, 'Roadmap'),
        pd('Two years, four hubs, seven countries', 90, 150, 1500, { size: 84, ls: -35, lh: 1.04 }),
        ...['Q1', 'Q2', 'Q3', 'Q4', 'Q1', 'Q2', 'Q3', 'Q4'].map((q, i) => T(q, gx + i * qw + 4, top + 12, 100, { font: PB, size: 22, weight: 600, ls: 80, lh: 1.2, color: P.mute })),
        T('2026', gx + 4, top - 24, 200, { font: PD, size: 28, weight: 700, lh: 1.1, color: P.ink }),
        T('2027', gx + 4 * qw + 4, top - 24, 200, { font: PD, size: 28, weight: 700, lh: 1.1, color: P.ink }),
        L(gx, top + 56, 1824, top + 56, P.ink, 2),
        L(gx + 4 * qw, top - 24, gx + 4 * qw, 880, P.line, 1),
        ...['Markets', 'Product', 'Hubs'].map((l, i) => pd(l, 96, top + 94 + i * 150, 260, { size: 36, ls: -10, weight: 600, lh: 1.1 })),
        ...[1, 2].map((i) => L(96, top + 56 + i * 150 + 4, 1824, top + 56 + i * 150 + 4, P.line, 1)),
        ...bar(0, 2, 0, 'Sweden and Norway', P.ink), ...bar(2, 4, 0, 'Denmark and Finland', '#3A3F46'), ...bar(4, 8, 0, 'Germany, Austria and Switzerland', P.red),
        ...bar(0, 2, 1, 'Tracker, second version', P.ink), ...bar(2, 5, 1, 'Foldable large crate', '#3A3F46'), ...bar(5, 8, 1, 'Shop dashboard', P.red),
        ...bar(0, 3, 2, 'Hub two, Gothenburg', P.ink), ...bar(3, 6, 2, 'Hub three, Copenhagen', '#3A3F46'), ...bar(6, 8, 2, 'Hub four, Hamburg', P.red),
        L(96, 810, 1824, 810, P.ink, 1),
        pd('600 000 trips', gx + 4 * qw - 360, 832, 350, { size: 36, ls: -10, lh: 1.1, align: 'right' }),
        pd('1.2 million trips', 1824 - 460, 832, 460, { size: 36, ls: -10, lh: 1.1, align: 'right', color: P.red }),
        T('Trips a year, end of period', 96, 836, 270, { font: PB, size: 22, weight: 500, lh: 1.25, color: P.mute }),
      ], { name: 'Roadmap', notes: 'Three lanes: where we sell, what we build, where we wash. Every hub opens just before the market it serves. The year end trip targets are what the round is sized for.' });
    })(),

    // 14 ask (dark)
    page(P.ink, [
      ...pchrome(14, 'The ask', true),
      plab('Seed round', 96, 170, P.red),
      pd('3 M EUR', 84, 210, 1000, { size: 250, ls: -75, lh: 1, color: '#FFFFFF' }),
      pb('Eighteen months of runway, led by one fund and joined by the angels who backed us in 2024.', 96, 560, 760, { size: 32, color: '#D9DADD', lh: 1.4 }),
      ...donut(1230, 460, 150, 80, [{ v: 45, color: P.red }, { v: 30, color: '#FFFFFF' }, { v: 15, color: '#8A8E95' }, { v: 10, color: '#3A3F46' }]),
      ...[['45%', 'Crates and washing hubs', P.red], ['30%', 'Sales in the new markets', '#FFFFFF'], ['15%', 'Tracking and shop dashboard', '#8A8E95'], ['10%', 'Reserve', '#3A3F46']].flatMap(([n, t, c], i) => [
        rect(1500, 268 + i * 104, 22, 22, c),
        T(n, 1540, 252 + i * 104, 140, { font: PD, size: 44, weight: 700, ls: -20, lh: 1.1, color: '#FFFFFF' }),
        T(t, 1540, 304 + i * 104, 330, { font: PB, size: 22, weight: 400, lh: 1.2, color: P.dmute }),
      ]),
      L(96, 800, 1824, 800, '#FFFFFF', 1, { opacity: 0.25 }),
      T('By the end of 2027', 96, 830, 600, { font: PB, size: 18, weight: 600, ls: 140, upper: true, lh: 1.2, color: P.red }),
      T('1.2 million trips a year, four hubs, break even across the Nordics.', 96, 868, 1500, { font: PD, size: 48, weight: 600, ls: -20, lh: 1.15, color: '#FFFFFF' }),
    ], { name: 'The ask', notes: 'State the amount, then where it goes. Everything in the donut maps to a lane on the roadmap. Finish on the end of 2027 line and stop talking.' }),

    // 15 contact
    page(P.red, [
      rect(96, 62, 14, 14, '#FFFFFF'),
      T('Kasse', 122, 52, 300, { font: PD, size: 30, weight: 700, ls: -20, lh: 1.1, color: '#FFFFFF' }),
      pd('Thank\nyou', 80, 150, 1100, { size: 380, ls: -90, lh: 0.88, color: '#FFFFFF' }),
      L(1300, 150, 1300, 880, '#FFFFFF', 1, { opacity: 0.5 }),
      plab('Talk to us', 1360, 160, '#FFFFFF', 400, { opacity: 0.8 }),
      pd('Elsa Wennerberg', 1360, 200, 464, { size: 44, color: '#FFFFFF', ls: -20 }),
      T('elsa@kasse.example\n+46 8 555 01 77', 1360, 270, 464, { font: PB, size: 30, weight: 500, lh: 1.45, color: '#FFFFFF' }),
      plab('Data room', 1360, 440, '#FFFFFF', 400, { opacity: 0.8 }),
      T('kasse.example/seed', 1360, 480, 464, { font: PB, size: 30, weight: 500, lh: 1.3, color: '#FFFFFF' }),
      qr('https://kasse.example/seed', 1360, 600, 220, P.ink, P.paper),
      L(96, 1002, 1824, 1002, '#FFFFFF', 1, { opacity: 0.4 }),
      T('Kasse AB  /  Hornsgatan 48, Stockholm', 96, 1026, 800, { font: PB, size: 22, weight: 500, lh: 1.2, color: '#FFFFFF' }),
      T('15', 1624, 1026, 200, { font: PB, size: 22, weight: 600, ls: 80, lh: 1.2, color: '#FFFFFF', align: 'right' }),
    ], { name: 'Contact', notes: 'Leave this up during questions. The data room has the model, the cohort tables and the hub cost breakdown.' }),
  ],
});


// =========================================================================
// DECK 2: school or university project. Cool white, forest ink, one green.
// Source Serif 4 (upright) + Figtree. A margin column carries the section number.
// =========================================================================
const J = { paper: '#F7F8F5', ink: '#13231E', green: '#0F7A5F', tint: '#D6EBE2', mute: '#56635D', line: '#D2DAD5', deep: '#0D2E26' };
const JS = 'Source Serif 4', JB = 'Figtree';
const js = (t, x, y, w, p = {}) => T(t, x, y, w, { font: JS, weight: 600, ls: -20, lh: 1.08, color: J.ink, ...p });
const jb = (t, x, y, w, p = {}) => T(t, x, y, w, { font: JB, size: 30, weight: 400, lh: 1.42, color: J.mute, ...p });
const jlab = (t, x, y, color = J.green, w = 500, p = {}) => T(t, x, y, w, { font: JB, size: 18, weight: 700, ls: 140, upper: true, lh: 1.2, color, ...p });
const jfoot = (n, dark = false) => [
  L(96, 1002, 1824, 1002, dark ? '#FFFFFF' : J.line, 1, dark ? { opacity: 0.25 } : {}),
  T('Phones and sleep  /  Science project, Year 2', 96, 1026, 800, { font: JB, size: 20, weight: 500, ls: 20, lh: 1.2, color: dark ? J.tint : J.mute }),
  T(String(n).padStart(2, '0'), 1624, 1026, 200, { font: JB, size: 20, weight: 700, ls: 80, lh: 1.2, color: dark ? '#FFFFFF' : J.ink, align: 'right' }),
];
// section margin: big number, name, and a hairline down the page
const jside = (num, name, n) => [
  js(num, 90, 120, 300, { size: 160, weight: 500, ls: -50, lh: 1, color: J.green }),
  T(name, 96, 310, 280, { font: JB, size: 30, weight: 700, lh: 1.2, color: J.ink }),
  L(416, 120, 416, 940, J.line, 1),
  ...jfoot(n),
];
const CX = 480, CW = 1344;

const project = tpl({
  id: 'deck-corporate-clean-project', name: 'School project presentation', format: 'slide', category: 'Presentation',
  tags: ['presentation', 'slides', 'deck', 'school', 'university', 'project', 'research', 'thesis', 'report', 'education'],
  pages: [
    // 1 title
    page(J.paper, [
      jlab('Science project  /  Year 2', 96, 96),
      js('Does a phone free\nbedroom change how\nlong we sleep?', 90, 150, 1800, { size: 152, ls: -55, lh: 1.02, weight: 600 }),
      jb('A two week study of 84 students', 96, 660, 900, { size: 36, color: J.mute }),
      rect(0, 780, 1920, 300, J.green),
      ...[['Presented by', 'Ines Carvalho and\nOmar Reza'], ['Class', 'Science 2B,\nLindeskolan'], ['Supervisor', 'Mr Aziz'], ['Date', '12 May 2026']].flatMap(([k, v], i) => [
        jlab(k, 96 + i * 450, 830, J.tint, 400, { size: 16 }),
        T(v, 96 + i * 450, 868, 410, { font: JB, size: 34, weight: 600, lh: 1.25, color: '#FFFFFF' }),
      ]),
    ], { name: 'Title', notes: 'Say the question out loud before anything else. Then who you are and who supervised the work.' }),

    // 2 contents
    page(J.paper, [
      jlab('Contents', 96, 96),
      js('What you\nwill hear', 90, 150, 720, { size: 92, ls: -35, lh: 1.04 }),
      jb('Twelve minutes. Questions at the end, and the diary data is on the last slide.', 96, 440, 600, { size: 28 }),
      ...[['The research question', 3], ['Background', 4], ['Method', 6], ['Findings', 9], ['Discussion', 12], ['Conclusion', 13], ['Sources', 14]].flatMap(([t, p], i) => {
        const y = 130 + i * 118;
        return [
          L(900, y, 1824, y, i === 0 ? J.ink : J.line, i === 0 ? 3 : 1),
          T(String(i + 1).padStart(2, '0'), 900, y + 36, 80, { font: JB, size: 24, weight: 700, ls: 80, lh: 1.2, color: J.green }),
          T(t, 1000, y + 28, 600, { font: JB, size: 42, weight: 600, ls: -10, lh: 1.15, color: J.ink }),
          T('Slide ' + p, 1624, y + 40, 200, { font: JB, size: 26, weight: 500, lh: 1.2, color: J.mute, align: 'right' }),
        ];
      }),
      L(900, 956, 1824, 956, J.line, 1),
      ...jfoot(2),
    ], { name: 'Contents', notes: 'Read the seven headings quickly. Tell people where the findings start so they know what to wait for.' }),

    // 3 research question
    page(J.green, [
      jlab('Research question', 96, 96, J.tint),
      js('Does leaving the phone\noutside the bedroom change\nhow long teenagers sleep?', 90, 170, 1700, { size: 112, ls: -40, lh: 1.06, weight: 600, color: '#FFFFFF' }),
      L(96, 700, 1824, 700, '#FFFFFF', 1, { opacity: 0.5 }),
      jlab('We measure', 96, 736, J.tint, 700, { size: 18 }),
      T('Hours slept per night, from a morning sleep diary', 96, 776, 780, { font: JB, size: 36, weight: 500, lh: 1.3, color: '#FFFFFF' }),
      jlab('We compare', 1008, 736, J.tint, 700, { size: 18 }),
      T('Phone kept in the bedroom against phone left in the hallway', 1008, 776, 780, { font: JB, size: 36, weight: 500, lh: 1.3, color: '#FFFFFF' }),
      ...jfoot(3, true),
    ], { name: 'Research question', notes: 'This is the whole project in one sentence. Everything after it either explains how we tested it or what we found.' }),

    // 4 background
    page(J.paper, [
      ...jside('01', 'Background', 4),
      js('Most teenagers sleep less than they need', CX - 6, 120, 1100, { size: 80, ls: -30, lh: 1.06 }),
      jb('Doctors recommend 8 to 10 hours for people aged 14 to 17. Surveys in Sweden find that about half of upper secondary students sleep under 7.', CX, 410, 760, { size: 34 }),
      jb('Phones are the new suspect. They light up, buzz and pull us back into a conversation we thought we had left.', CX, 660, 760, { size: 34, color: J.ink }),
      rect(1380, 410, 444, 500, J.tint),
      js('8 to 10', 1410, 440, 400, { size: 96, ls: -35, lh: 1, color: J.green }),
      T('hours recommended each night', 1414, 560, 380, { font: JB, size: 28, weight: 500, lh: 1.3, color: J.ink }),
      L(1414, 660, 1790, 660, J.green, 2),
      js('6 h 52', 1410, 690, 400, { size: 96, ls: -35, lh: 1, color: J.ink }),
      T('what our own students averaged before the test', 1414, 810, 380, { font: JB, size: 28, weight: 500, lh: 1.3, color: J.ink }),
    ], { name: 'Background', notes: 'Two numbers frame the whole project: what teenagers need and what our class actually gets. The gap is the reason for the study.' }),

    // 5 literature
    page(J.paper, [
      ...jside('01', 'Background', 5),
      js('Three studies we built on', CX - 6, 120, 1300, { size: 80, ls: -30, lh: 1.06 }),
      ...['Study', 'What they found', 'Who took part'].map((h, i) => jlab(h, [CX, CX + 380, CX + 1060][i], 300, J.green, 400, { size: 18 })),
      L(CX, 340, 1824, 340, J.ink, 3),
      ...[['Carter and Lindqvist, 2019', 'Teens with a phone in the bedroom slept 21 minutes less on school nights.', '1 400 students, UK'], ['Berg, 2021', 'Notifications after bedtime delayed sleep by half an hour in one in four students.', '620 students, Sweden'], ['Okafor and Ruiz, 2023', 'Leaving the phone outside for two weeks added 24 minutes. Self reported only.', '96 students, Spain']].flatMap(([a, b, c], i) => {
        const y = 340 + i * 190;
        return [
          js(a, CX, y + 36, 360, { size: 34, ls: -10, lh: 1.15 }),
          T(b, CX + 380, y + 34, 640, { font: JB, size: 28, weight: 400, lh: 1.35, color: J.ink }),
          T(c, CX + 1060, y + 34, 284, { font: JB, size: 28, weight: 400, lh: 1.35, color: J.mute }),
          L(CX, y + 190, 1824, y + 190, J.line, 1),
        ];
      }),
    ], { name: 'Earlier studies', notes: 'Three earlier studies, one sentence each. Point out that the last one is closest to ours and relied on self reporting too, which we come back to in the discussion.' }),

    // 6 hypothesis
    page(J.paper, [
      ...jside('02', 'Method', 6),
      jlab('Hypothesis', CX, 126),
      js('Students who leave the phone\noutside the bedroom sleep at\nleast 30 minutes longer.', CX - 6, 170, 1344, { size: 80, ls: -28, lh: 1.08 }),
      ...[['Changed on purpose', 'Where the phone spends the night: bedroom or hallway'], ['Measured', 'Hours and minutes slept, written down every morning'], ['Kept the same', 'Age group, school week, the same two classes']].flatMap(([k, v], i) => {
        const x = CX + i * 456;
        return [
          rect(x, 620, 400, 6, i === 0 ? J.green : J.ink),
          jlab(k, x, 656, i === 0 ? J.green : J.mute, 400, { size: 18 }),
          T(v, x, 700, 390, { font: JB, size: 30, weight: 500, lh: 1.35, color: J.ink }),
        ];
      }),
    ], { name: 'Hypothesis', notes: 'A hypothesis has to be something the data could prove wrong. Ours says at least 30 minutes, so a 10 minute difference would count against us.' }),

    // 7 method steps
    page(J.paper, [
      ...jside('02', 'Method', 7),
      js('Two weeks, four steps', CX - 6, 120, 1300, { size: 80, ls: -30, lh: 1.06 }),
      ...[['Recruit', 'Two classes, 84 students, split into two groups of 42 by drawing names.'], ['Baseline week', 'Both groups sleep as usual. Everyone fills in a diary each morning.'], ['Test week', 'Group B leaves the phone in a box in the hallway from 22:00.'], ['Compare', 'We work out the average per group and test if the gap is real.']].flatMap(([t, d], i) => {
        const y = 310 + i * 160;
        return [
          L(CX, y, 1824, y, i === 0 ? J.ink : J.line, i === 0 ? 3 : 1),
          js(String(i + 1), CX, y + 24, 100, { size: 80, weight: 500, ls: -20, lh: 1, color: J.green }),
          T(t, CX + 110, y + 40, 420, { font: JB, size: 36, weight: 700, lh: 1.15, color: J.ink }),
          T(d, CX + 560, y + 40, 784, { font: JB, size: 28, weight: 400, lh: 1.4, color: J.mute }),
        ];
      }),
    ], { name: 'Method', notes: 'Walk through the four steps in order. Stress that groups were drawn by lot, so nobody chose their own group.' }),

    // 8 participants
    page(J.paper, [
      ...jside('02', 'Method', 8),
      js('Who took part', CX - 6, 120, 1300, { size: 80, ls: -30, lh: 1.06 }),
      js('84', CX - 10, 270, 600, { size: 260, weight: 500, ls: -80, lh: 1, color: J.green }),
      T('students aged 16 to 17 from two classes', CX + 4, 560, 460, { font: JB, size: 32, weight: 500, lh: 1.3, color: J.ink }),
      rect(1020, 300, 402, 120, J.green),
      rect(1428, 300, 396, 120, J.ink),
      T('42', 1044, 322, 200, { font: JS, size: 72, weight: 600, ls: -20, lh: 1, color: '#FFFFFF' }),
      T('42', 1452, 322, 200, { font: JS, size: 72, weight: 600, ls: -20, lh: 1, color: '#FFFFFF' }),
      T('Group A', 1020, 440, 402, { font: JB, size: 28, weight: 700, lh: 1.2, color: J.ink }),
      T('Phone stays in the bedroom', 1020, 478, 402, { font: JB, size: 26, weight: 400, lh: 1.3, color: J.mute }),
      T('Group B', 1428, 440, 396, { font: JB, size: 28, weight: 700, lh: 1.2, color: J.ink }),
      T('Phone in the hallway from 22:00', 1428, 478, 396, { font: JB, size: 26, weight: 400, lh: 1.3, color: J.mute }),
      L(1020, 640, 1824, 640, J.line, 1),
      ...[['46 / 38', 'girls and boys'], ['98%', 'filled in every diary day'], ['3 left', 'dropped out, replaced']].flatMap(([n, t], i) => [
        js(n, 1020 + i * 270, 670, 260, { size: 52, ls: -20, lh: 1.05 }),
        T(t, 1020 + i * 270, 740, 240, { font: JB, size: 24, weight: 400, lh: 1.3, color: J.mute }),
      ]),
    ], { name: 'Participants', notes: 'Both groups have exactly 42 students. Mention the 98 percent diary completion, because it is why we trust the numbers.' }),

    // 9 chart
    (() => {
      const x0 = CX + 60, y0 = 330, w = 760, h = 520, max = 8;
      const data = [
        [x0 + 40, 6 + 54 / 60, '6 h 54', J.line, J.mute],
        [x0 + 150, 6 + 49 / 60, '6 h 49', J.ink, J.ink],
        [x0 + 420, 6 + 52 / 60, '6 h 52', J.tint, J.mute],
        [x0 + 530, 7 + 31 / 60, '7 h 31', J.green, J.green],
      ];
      return page(J.paper, [
        ...jside('03', 'Findings', 9),
        js('Group B slept 39 minutes longer', CX - 6, 120, 1300, { size: 80, ls: -30, lh: 1.06 }),
        ...[0, 2, 4, 6, 8].flatMap((v) => [
          L(x0, y0 + h - (v / max) * h, x0 + w, y0 + h - (v / max) * h, v === 0 ? J.ink : J.line, v === 0 ? 2 : 1),
          T(v === 0 ? '0' : v + ' h', x0 - 90, y0 + h - (v / max) * h - 14, 70, { font: JB, size: 22, weight: 500, lh: 1.2, color: J.mute, align: 'right' }),
        ]),
        ...data.flatMap(([x, v, lbl, fill, tc]) => [
          rect(x, y0 + h - (v / max) * h, 100, (v / max) * h, fill),
          T(lbl, x - 30, y0 + h - (v / max) * h - 44, 160, { font: JB, size: 28, weight: 700, lh: 1.2, color: tc, align: 'center' }),
        ]),
        ...[['Baseline', x0 + 40], ['Test week', x0 + 150], ['Baseline', x0 + 420], ['Test week', x0 + 530]].map(([t, x]) => T(t, x - 20, y0 + h + 14, 140, { font: JB, size: 22, weight: 500, lh: 1.2, color: J.mute, align: 'center' })),
        T('Group A', x0 + 40, y0 + h + 60, 210, { font: JB, size: 26, weight: 700, lh: 1.2, color: J.ink }),
        T('Group B', x0 + 420, y0 + h + 60, 210, { font: JB, size: 26, weight: 700, lh: 1.2, color: J.green }),
        jb('Average sleep per night in each week. Group A kept the phone in the bedroom, group B did not.', 1380, 330, 444, { size: 26 }),
        L(1380, 540, 1824, 540, J.green, 2),
        js('+39', 1376, 560, 300, { size: 150, weight: 500, ls: -50, lh: 1, color: J.green }),
        T('minutes for group B, against 5 fewer for group A', 1384, 730, 430, { font: JB, size: 28, weight: 500, lh: 1.3, color: J.ink }),
      ], { name: 'Findings, chart', notes: 'Look at the two tall bars first, then at the two grey ones. Group A did not change, group B did, and that is the whole result.' });
    })(),

    // 10 key numbers
    page(J.paper, [
      ...jside('03', 'Findings', 10),
      js('What else changed', CX - 6, 120, 1300, { size: 80, ls: -30, lh: 1.06 }),
      js('28', CX - 10, 300, 600, { size: 360, weight: 500, ls: -100, lh: 1, color: J.green }),
      T('minutes earlier to bed in group B', CX + 4, 720, 560, { font: JB, size: 36, weight: 600, lh: 1.25, color: J.ink }),
      T('Median bedtime moved from 23:41 to 23:13.', CX + 4, 810, 560, { font: JB, size: 28, weight: 400, lh: 1.35, color: J.mute }),
      ...[['11 min', 'faster to fall asleep, from 24 to 13 minutes on average'], ['71%', 'of group B, 30 of 42, want to keep the phone outside after the test']].flatMap(([n, t], i) => {
        const y = 300 + i * 320;
        return [
          L(1160, y, 1824, y, i === 0 ? J.ink : J.line, i === 0 ? 3 : 1),
          js(n, 1156, y + 30, 660, { size: 120, weight: 500, ls: -40, lh: 1, color: i === 0 ? J.ink : J.green }),
          T(t, 1164, y + 172, 640, { font: JB, size: 28, weight: 400, lh: 1.35, color: J.mute }),
        ];
      }),
    ], { name: 'Findings, numbers', notes: 'Sleeping longer came from going to bed earlier, not from sleeping in. The 71 percent is the most surprising number: most of group B liked it.' }),

    // 11 quote
    page(J.deep, [
      jlab('In their words', 96, 96, J.tint),
      js('I thought I would be bored. I put the phone in the box and was asleep before I could miss it.', 90, 220, 1560, { size: 92, ls: -30, lh: 1.1, weight: 500, color: '#FFFFFF' }),
      L(96, 800, 1824, 800, '#FFFFFF', 1, { opacity: 0.25 }),
      T('Student in group B', 96, 836, 700, { font: JB, size: 32, weight: 700, lh: 1.2, color: '#FFFFFF' }),
      T('Written in the diary on day 5 of the test week. Shared with permission.', 96, 884, 1200, { font: JB, size: 26, weight: 400, lh: 1.3, color: J.tint }),
      ...jfoot(11, true),
    ], { name: 'Quote', notes: 'One real sentence from the diaries. Say that it was shared with permission and that names were removed.' }),

    // 12 discussion
    page(J.paper, [
      ...jside('04', 'Discussion', 12),
      js('What the result can and cannot tell us', CX - 6, 120, 1344, { size: 72, ls: -28, lh: 1.06 }),
      jlab('Points in favour', CX, 330, J.green),
      jlab('Reasons to be careful', 1160, 330, J.mute),
      L(CX, 366, CX + 600, 366, J.green, 3),
      L(1160, 366, 1824, 366, J.ink, 3),
      ...[['Groups were drawn by lot, so they started level.', 'The gap is bigger than the 30 minutes we predicted.', 'Our numbers agree with the Spanish study.'], ['Sleep was self reported, so it can be off by a few minutes.', 'Two weeks is short. A new habit can fade.', 'Group B knew what was being tested.']].flatMap((list, c) =>
        list.flatMap((t, i) => {
          const x = c === 0 ? CX : 1160, w = c === 0 ? 600 : 664, y = 396 + i * 170;
          return [
            T(String(i + 1), x, y, 50, { font: JS, size: 44, weight: 500, lh: 1, color: c === 0 ? J.green : J.mute }),
            T(t, x + 60, y + 2, w - 60, { font: JB, size: 30, weight: 400, lh: 1.38, color: J.ink }),
          ];
        })),
    ], { name: 'Discussion', notes: 'Be honest about the weak points. Self reporting and a short test are the two a teacher will ask about, so name them first.' }),

    // 13 conclusion
    page(J.tint, [
      jlab('Conclusion', 96, 96),
      js('Yes. Students who left the phone in the hallway slept about 40 minutes longer.', 90, 170, 1500, { size: 120, ls: -42, lh: 1.04, weight: 600 }),
      L(96, 740, 1824, 740, J.ink, 2),
      ...[['The hypothesis held', 'We expected 30 minutes and found 39.'], ['It is a small, real effect', 'It needs a longer test to know if it lasts.'], ['A cheap thing to try', 'A box in the hallway costs nothing.']].flatMap(([k, v], i) => [
        T(k, 96 + i * 600, 776, 540, { font: JB, size: 32, weight: 700, lh: 1.2, color: J.ink }),
        T(v, 96 + i * 600, 826, 540, { font: JB, size: 28, weight: 400, lh: 1.4, color: J.mute }),
      ]),
      ...jfoot(13),
    ], { name: 'Conclusion', notes: 'Answer the question in the first sentence, then give three short reasons to believe it. Stop talking after the third.' }),

    // 14 sources
    page(J.paper, [
      ...jside('05', 'Sources', 14),
      js('Sources', CX - 6, 120, 1300, { size: 80, ls: -30, lh: 1.06 }),
      ...[['Berg, M. (2021). Notifications and bedtime in Swedish upper secondary students. Journal of Adolescent Sleep, 8(2), 44 to 59.'], ['Carter, H. and Lindqvist, P. (2019). Bedroom devices and school night sleep in British teenagers. Sleep Health Review, 5(1), 12 to 27.'], ['Okafor, T. and Ruiz, L. (2023). A two week phone free night trial among Spanish students. European Journal of Youth Studies, 14(3), 201 to 218.'], ['Swedish Public Health Agency (2024). Sleep recommendations for children and young people. Stockholm: Folkhälsomyndigheten.'], ['Our own sleep diaries, collected 27 April to 10 May 2026, available from the authors.']].flatMap(([t], i) => {
        const y = 310 + i * 124;
        return [
          T(String(i + 1), CX, y + 4, 50, { font: JS, size: 36, weight: 500, lh: 1, color: J.green }),
          T(t, CX + 60, y, 1280, { font: JB, size: 26, weight: 400, lh: 1.4, color: J.ink }),
        ];
      }),
    ], { name: 'Sources', notes: 'Leave this up while people ask questions. The first three are the studies from the background section.' }),

    // 15 thank you
    page(J.green, [
      js('Thank you', 84, 110, 1700, { size: 300, ls: -45, lh: 1, color: '#FFFFFF', weight: 600 }),
      T('Questions?', 96, 480, 900, { font: JB, size: 80, weight: 600, ls: -20, lh: 1.1, color: J.tint }),
      L(96, 760, 1824, 760, '#FFFFFF', 1, { opacity: 0.5 }),
      ...[['Authors', 'Ines Carvalho and Omar Reza'], ['Contact', 'ines.carvalho@lindeskolan.example'], ['Data', 'Diary sheets and averages on request']].flatMap(([k, v], i) => [
        jlab(k, 96 + i * 600, 800, J.tint, 400, { size: 16 }),
        T(v, 96 + i * 600, 836, 560, { font: JB, size: 30, weight: 500, lh: 1.3, color: '#FFFFFF' }),
      ]),
      ...jfoot(15, true),
    ], { name: 'Thank you', notes: 'Say thank you, then wait. If nobody asks, offer to show the diary sheets for one student.' }),
  ],
});


// =========================================================================
// DECK 3: quarterly company update. Navy, ice, one amber. Schibsted Grotesk only.
// Flush modular tiles divided by hairlines, a slim bar on top carries the furniture.
// =========================================================================
const U = { navy: '#0F1B2D', ice: '#EDF1F5', white: '#FFFFFF', amber: '#FFB400', slate: '#5B6B80', line: '#CBD4DE', soft: '#C3CEDA', dlab: '#9FB0C6', mid: '#22365A' };
const UF = 'Schibsted Grotesk';
const ud = (t, x, y, w, p = {}) => T(t, x, y, w, { font: UF, weight: 800, ls: -45, lh: 1.02, color: U.navy, ...p });
const ub = (t, x, y, w, p = {}) => T(t, x, y, w, { font: UF, size: 30, weight: 400, lh: 1.4, color: U.slate, ...p });
const ulab = (t, x, y, color = U.slate, w = 500, p = {}) => T(t, x, y, w, { font: UF, size: 18, weight: 700, ls: 140, upper: true, lh: 1.2, color, ...p });
const uc = (n, dark = false, amber = false) => [
  L(0, 88, 1920, 88, dark ? '#FFFFFF' : U.line, 1, dark ? { opacity: 0.2 } : {}),
  rect(96, 38, 14, 14, U.amber),
  T('Alder & Finch', 124, 28, 400, { font: UF, size: 26, weight: 800, ls: -10, lh: 1.2, color: dark ? U.white : U.navy }),
  T('Q3 2026 company update', 700, 32, 600, { font: UF, size: 22, weight: 500, lh: 1.2, color: dark ? U.dlab : amber ? U.navy : U.slate }),
  T(String(n).padStart(2, '0') + ' / 14', 1624, 32, 200, { font: UF, size: 22, weight: 700, ls: 60, lh: 1.2, color: dark ? U.white : U.navy, align: 'right' }),
];
const chip = (t, x, y, w, good = true) => [
  rect(x, y, w, 56, good ? U.amber : U.ice, good ? {} : { stroke: stroke(U.navy, 2) }),
  T(t, x, y + 13, w, { font: UF, size: 26, weight: 700, lh: 1.2, color: U.navy, align: 'center' }),
];

const update = tpl({
  id: 'deck-corporate-clean-update', name: 'Quarterly company update', format: 'slide', category: 'Presentation',
  tags: ['presentation', 'slides', 'deck', 'report', 'quarterly', 'company', 'team', 'update', 'review', 'business'],
  pages: [
    // 1 cover
    page(U.navy, [
      rect(1280, 0, 640, 540, U.amber),
      rect(1280, 540, 640, 540, U.ice),
      ud('Q3', 1290, 20, 640, { size: 470, ls: -90, lh: 1, color: U.navy }),
      ulab('All hands  /  6 October 2026', 96, 96, U.amber, 900),
      ud('Company\nupdate', 90, 200, 1180, { size: 200, ls: -70, lh: 0.94, color: U.white }),
      T('July, August and September in plain numbers, and what we do about them in the last quarter of the year.', 96, 680, 900, { font: UF, size: 38, weight: 400, lh: 1.3, color: U.dlab }),
      T('Alder & Finch', 96, 960, 600, { font: UF, size: 30, weight: 800, lh: 1.2, color: U.white }),
      ...[['Presented by', 'Lena Moberg, chief operating officer'], ['Audience', 'All staff, 87 people'], ['Length', 'Forty minutes and questions']].flatMap(([k, v], i) => [
        ulab(k, 1340, 596 + i * 150, U.slate, 500, { size: 16 }),
        T(v, 1340, 632 + i * 150, 520, { font: UF, size: 32, weight: 600, lh: 1.25, color: U.navy }),
      ]),
    ], { name: 'Cover', notes: 'Welcome everyone. Forty minutes: the numbers first, then what went well, what did not, and the plan for the last quarter.' }),

    // 2 agenda
    page(U.ice, [
      ...uc(2),
      rect(0, 89, 640, 991, U.navy),
      ulab('Agenda', 96, 140, U.amber),
      ud('Six topics,\nforty minutes', 90, 200, 540, { size: 84, ls: -35, lh: 1.04, color: U.white }),
      T('Bars show how long each one gets. Questions are welcome at any point.', 96, 560, 450, { font: UF, size: 28, weight: 400, lh: 1.4, color: U.dlab }),
      ...[['Highlights', 5], ['Revenue and costs', 10], ['What went well', 5], ['What did not', 5], ['Priorities for Q4', 10], ['Questions', 5]].flatMap(([t, m], i) => {
        const y = 150 + i * 142;
        return [
          L(720, y, 1824, y, i === 0 ? U.navy : U.line, i === 0 ? 3 : 1),
          T(String(i + 1).padStart(2, '0'), 720, y + 44, 80, { font: UF, size: 24, weight: 700, ls: 80, lh: 1.2, color: U.slate }),
          ud(t, 810, y + 34, 520, { size: 46, ls: -20, lh: 1.1, weight: 700 }),
          rect(1360, y + 50, m * 30, 34, U.amber),
          T(m + ' min', 1360 + m * 30 + 16, y + 48, 160, { font: UF, size: 26, weight: 600, lh: 1.2, color: U.navy }),
        ];
      }),
    ], { name: 'Agenda', notes: 'Read the six topics. Say that the two ten minute blocks are where we want the most discussion.' }),

    // 3 highlights
    page(U.white, [
      ...uc(3),
      ulab('Highlights', 96, 130, U.slate),
      ud('Sales up 6 percent, margin down 0.7 points', 90, 168, 1700, { size: 84, ls: -38 }),
      ...[
        ['Revenue', '2.4 M', 'euro in the quarter', '+6% on Q2', true, [1.95, 2.27, 2.4], 2.5],
        ['Orders', '41 200', 'orders shipped', '+9% on Q2', true, [34.1, 37.8, 41.2], 45],
        ['Customer score', '61', 'net promoter score', '+4 on Q2', true, [55, 57, 61], 70],
        ['Gross margin', '40.3%', 'of sales after goods', '0.7 pts down', false, [41.2, 41.0, 40.3], 45],
      ].flatMap(([k, n, d, delta, good, sp, mx], i) => {
        const x = i * 480, y = 330;
        return [
          i > 0 ? L(x, y, x, 1080, U.line, 1) : null,
          ulab(k, x + 48, y + 44, U.slate, 400),
          ud(n, x + 42, y + 84, 440, { size: 124, ls: -50, lh: 1 }),
          T(d, x + 48, y + 224, 400, { font: UF, size: 28, weight: 500, lh: 1.3, color: U.navy }),
          ...sp.map((v, j) => rect(x + 48 + j * 96, y + 520 - (v / mx) * 240, 80, (v / mx) * 240, j === 2 ? (good ? U.amber : U.navy) : U.soft)),
          L(x + 48, y + 520, x + 48 + 272, y + 520, U.navy, 2),
          ...['Q1', 'Q2', 'Q3'].map((q, j) => T(q, x + 48 + j * 96, y + 534, 80, { font: UF, size: 22, weight: 600, lh: 1.2, color: U.slate, align: 'center' })),
          ...chip(delta, x + 48, y + 600, 260, good),
        ];
      }),
      L(0, 330, 1920, 330, U.navy, 3),
    ], { name: 'Highlights', notes: 'Three of four headline numbers moved the right way. The one that did not, gross margin, is the topic of the middle of this meeting.' }),

    // 4 revenue chart
    (() => {
      const vals = [640, 610, 700, 720, 760, 790, 760, 790, 850];
      const plan = [null, null, null, null, null, null, 740, 760, 800];
      const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
      const x0 = 780, w = 1040, y0 = 250, h = 650, max = 900, bw = 76, step = w / 9;
      return page(U.white, [
        ...uc(4),
        rect(0, 89, 640, 991, U.navy),
        ulab('Revenue', 96, 140, U.amber),
        ud('2.4 M euro in the quarter', 90, 190, 500, { size: 80, ls: -35, lh: 1.04, color: U.white }),
        T('4 percent above plan and 6 percent above the second quarter. September was our best month this year.', 96, 520, 450, { font: UF, size: 28, weight: 400, lh: 1.4, color: U.dlab }),
        ...vals.flatMap((v, i) => {
          const x = x0 + i * step + (step - bw) / 2, bh = (v / max) * h, q3 = i >= 6;
          return [
            rect(x, y0 + h - bh, bw, bh, q3 ? U.amber : U.soft),
            T(String(v), x - 20, y0 + h - bh - 42, bw + 40, { font: UF, size: 26, weight: q3 ? 800 : 600, lh: 1.2, color: q3 ? U.navy : U.slate, align: 'center' }),
            T(m[i], x - 20, y0 + h + 18, bw + 40, { font: UF, size: 24, weight: 500, lh: 1.2, color: U.slate, align: 'center' }),
            plan[i] ? L(x - 10, y0 + h - (plan[i] / max) * h, x + bw + 10, y0 + h - (plan[i] / max) * h, U.navy, 4) : null,
          ];
        }),
        L(x0, y0 + h, x0 + w, y0 + h, U.navy, 2),
        T('Monthly revenue in thousand euro, 2026. Black lines mark the plan for each Q3 month.', x0, 960, 1040, { font: UF, size: 24, weight: 400, lh: 1.3, color: U.slate }),
      ], { name: 'Revenue', notes: 'The amber bars are this quarter. All three months beat plan, and September carried the result.' });
    })(),

    // 5 went well
    page(U.ice, [
      ...uc(5),
      rect(0, 89, 1000, 991, U.navy),
      ulab('Went well  /  1 of 3', 96, 140, U.amber, 700),
      ud('2.1', 70, 190, 900, { size: 480, ls: -100, lh: 1, color: U.amber }),
      ud('days from order to door', 90, 690, 800, { size: 64, ls: -25, lh: 1.05, color: U.white, weight: 700 }),
      T('Down from 3.4 days in the spring. The new Gothenburg shelf layout and later pickups did most of it.', 96, 820, 780, { font: UF, size: 30, weight: 400, lh: 1.4, color: U.dlab }),
      ulab('Went well  /  2 of 3', 1060, 140, U.slate, 700),
      ud('18%', 1050, 180, 800, { size: 200, ls: -70, lh: 1, color: U.navy }),
      T('fewer returns than in Q2. Better size guides on the product pages.', 1060, 400, 740, { font: UF, size: 32, weight: 500, lh: 1.35, color: U.navy }),
      L(1000, 584, 1920, 584, U.navy, 3),
      ulab('Went well  /  3 of 3', 1060, 636, U.slate, 700),
      ud('3 800', 1050, 676, 800, { size: 200, ls: -70, lh: 1, color: U.navy }),
      T('units of the autumn range sold in its first five weeks, twice the forecast.', 1060, 896, 740, { font: UF, size: 32, weight: 500, lh: 1.35, color: U.navy }),
    ], { name: 'Went well', notes: 'Three wins, one for operations, one for the website team and one for buying. Thank each team by name before you move on.' }),

    // 6 did not go well
    page(U.white, [
      ...uc(6),
      rect(0, 89, 24, 991, U.amber),
      ulab('What did not go well', 96, 130, U.slate),
      ud('Three things that missed', 90, 168, 1700, { size: 84, ls: -38 }),
      ...['What', 'Plan', 'Actual', 'Why'].map((h, i) => ulab(h, [96, 700, 1000, 1300][i], 340, U.slate, 400, { size: 18 })),
      L(96, 380, 1824, 380, U.navy, 3),
      ...[['Gross margin', '41.5%', '40.3%', 'Freight rates rose 11 percent in July.'], ['Warehouse hiring', '6 people', '3 people', 'Few applicants for night shifts.'], ['Checkout app', '1 September', 'Not live', 'Payment testing ran five weeks long.']].flatMap(([a, b, c, d], i) => {
        const y = 380 + i * 215;
        return [
          ud(a, 96, y + 62, 580, { size: 52, ls: -20, lh: 1.1, weight: 700 }),
          T(b, 700, y + 68, 280, { font: UF, size: 34, weight: 500, lh: 1.2, color: U.slate }),
          T(c, 1000, y + 68, 280, { font: UF, size: 34, weight: 800, lh: 1.2, color: U.navy }),
          rect(1000, y + 124, 80, 8, U.amber),
          T(d, 1300, y + 62, 524, { font: UF, size: 30, weight: 400, lh: 1.35, color: U.navy }),
          L(96, y + 215, 1824, y + 215, U.line, 1),
        ];
      }),
    ], { name: 'Did not go well', notes: 'Say each miss plainly, with the reason. People trust a team that names its own misses before anyone else does.' }),

    // 7 quote
    page(U.amber, [
      ...uc(7, false, true),
      ud('It arrived the next morning and the box was the nicest part. That is my third order this year.', 90, 170, 1700, { size: 118, ls: -42, lh: 1.06, weight: 800 }),
      L(96, 800, 1824, 800, U.navy, 2),
      T('Marit Holm', 96, 836, 700, { font: UF, size: 34, weight: 800, lh: 1.2, color: U.navy }),
      T('Customer since 2023, written in an order review on 21 September', 96, 884, 1200, { font: UF, size: 28, weight: 500, lh: 1.3, color: U.navy }),
    ], { name: 'Customer voice', notes: 'One real review, read aloud. It connects the delivery time win to what a customer actually felt.' }),

    // 8 costs
    page(U.white, [
      ...uc(8),
      ulab('Costs', 96, 130, U.slate),
      ud('Freight took the margin', 90, 168, 1700, { size: 84, ls: -38 }),
      ub('Cost for every 100 euro of sales in the third quarter. The right column is the change against Q2.', 96, 290, 1300, { size: 28, color: U.slate }),
      ...[['Goods', 59.7, '0.7 more', U.soft], ['Freight', 11.2, '1.1 more', U.amber], ['Staff', 17.9, '1.0 less', U.soft], ['Marketing', 6.4, '0.2 more', U.soft], ['Other', 2.9, '0.1 less', U.soft], ['Left over', 1.9, '0.9 less', U.navy]].flatMap(([k, v, dlt, col], i) => {
        const y = 380 + i * 108;
        return [
          L(96, y, 1824, y, i === 5 ? U.navy : U.line, i === 5 ? 3 : 1),
          T(k, 96, y + 30, 300, { font: UF, size: 34, weight: i === 1 || i === 5 ? 800 : 600, lh: 1.2, color: U.navy }),
          rect(420, y + 24, v * 15, 52, col),
          T(v.toFixed(1), 420 + v * 15 + 18, y + 24, 140, { font: UF, size: 36, weight: 800, lh: 1.2, color: U.navy }),
          T(dlt, 1560, y + 32, 264, { font: UF, size: 28, weight: i === 1 ? 800 : 500, lh: 1.2, color: i === 1 ? U.navy : U.slate, align: 'right' }),
        ];
      }),
      L(96, 1028, 1824, 1028, U.line, 1),
    ], { name: 'Costs', notes: 'Freight is the only cost line that moved against us by more than a point. Staff costs fell because three hires did not happen, so that is not a saving to celebrate.' }),

    // 9 priorities (dark)
    page(U.navy, [
      ...uc(9, true),
      ulab('Priorities for Q4', 96, 130, U.amber),
      ud('Three things matter most', 90, 168, 1700, { size: 84, ls: -38, color: U.white }),
      ...[['Win back the margin', 'Gross margin back to 41.5 percent by December', 'Lena Moberg, operations'], ['Launch the checkout app', 'Live on 14 November, 30 percent of orders by year end', 'Tariq Nilsson, product'], ['Get through Black Friday', '12 000 orders in the week, all shipped within 48 hours', 'Sofie Berg, customer service']].flatMap(([t, d, o], i) => {
        const y = 330 + i * 240;
        return [
          L(96, y, 1824, y, U.white, 1, { opacity: i === 0 ? 0.6 : 0.25 }),
          ud(String(i + 1), 90, y + 14, 200, { size: 200, ls: -60, lh: 1, color: U.amber }),
          ud(t, 330, y + 40, 700, { size: 56, ls: -22, lh: 1.08, weight: 700, color: U.white }),
          T(d, 1080, y + 44, 400, { font: UF, size: 28, weight: 400, lh: 1.4, color: U.white }),
          ulab('Owner', 1540, y + 44, U.dlab, 300, { size: 16 }),
          T(o, 1540, y + 80, 284, { font: UF, size: 28, weight: 600, lh: 1.3, color: U.white }),
        ];
      }),
    ], { name: 'Priorities', notes: 'Only three. Each has one owner and one measurable target, so in January we can say plainly whether it worked.' }),

    // 10 timeline
    (() => {
      const px = (d) => 96 + (d / 92) * 1728, railY = 560;
      const ms = [[9, '10 Oct', 'Carrier tender closes', 1], [23, '24 Oct', 'Seasonal staff in place', -1], [44, '14 Nov', 'Checkout app live', 1], [53, '24 to 30 Nov', 'Black Friday week', -1], [79, '19 Dec', 'Last delivery before Christmas', 1], [91, '31 Dec', 'Year end close', -1]];
      return page(U.ice, [
        ...uc(10),
        ulab('Timeline', 96, 130, U.slate),
        ud('The next three months', 90, 168, 1700, { size: 84, ls: -38 }),
        ...[['October', 0, 31], ['November', 31, 61], ['December', 61, 92]].flatMap(([n, a, b], i) => [
          rect(px(a), railY - 7, px(b) - px(a) - 4, 14, i === 1 ? U.navy : U.slate),
          T(n, px(a), railY + 22, 300, { font: UF, size: 22, weight: 700, ls: 100, upper: true, lh: 1.2, color: U.slate }),
        ]),
        rect(px(53), railY - 22, px(60) - px(53), 44, U.amber),
        ...ms.flatMap(([d, dt, t, side], i) => {
          const x = px(d), right = i >= 4, w = 300;
          const ty = side > 0 ? railY - 230 : railY + 90;
          const tx = right ? x - w - 18 : x + 18;
          return [
            L(x, side > 0 ? railY - 150 : railY + 40, x, side > 0 ? railY - 22 : railY + 150, U.navy, 2),
            ...(i === 3 ? [] : [rect(x - 8, railY - 8, 16, 16, U.navy)]),
            ud(dt, tx, ty + (side > 0 ? 0 : 20), w, { size: 40, ls: -15, lh: 1.1, weight: 800, align: right ? 'right' : 'left' }),
            T(t, tx, ty + (side > 0 ? 52 : 72), w, { font: UF, size: 26, weight: 500, lh: 1.3, color: U.slate, align: right ? 'right' : 'left' }),
          ];
        }),
        L(96, 810, 1824, 810, U.navy, 3),
        ...[['Orders', '50 000'], ['Gross margin', '41.5%'], ['App share of orders', '30%']].flatMap(([k, v], i) => [
          ulab('Q4 target  /  ' + k, 96 + i * 600, 840, U.slate, 560, { size: 16 }),
          ud(v, 90 + i * 600, 876, 560, { size: 84, ls: -35, lh: 1 }),
        ]),
      ], { name: 'Timeline', notes: 'Four dates the whole company should know: the carrier decision, the app launch, Black Friday week and the last delivery before Christmas.' });
    })(),

    // 11 people
    page(U.white, [
      ...uc(11),
      ulab('People', 96, 130, U.slate),
      ud('Four new colleagues, 87 of us', 90, 168, 1300, { size: 84, ls: -38 }),
      ud('87', 1500, 130, 330, { size: 220, ls: -80, lh: 1, color: U.navy, align: 'right' }),
      T('people, up from 85 after two left', 1380, 360, 450, { font: UF, size: 24, weight: 500, lh: 1.3, color: U.slate, align: 'right' }),
      ...[['Sara Lindgren', 'Warehouse lead', 'photos/portrait.jpg'], ['Elias Ahmadi', 'Data analyst', 'photos/man.jpg'], ['Maya Torres', 'Customer service', 'photos/portrait-window.jpg'], ['Karl Dahl', 'Carrier manager', 'photos/portrait-man-sun.jpg']].flatMap(([n, r, ph], i) => [
        img(ph, i * 480, 440, 480, 440, { filters: { duotone: ['#0F1B2D', '#FFEFC4'], contrast: 8, grain: 8 } }),
        i > 0 ? L(i * 480, 440, i * 480, 1080, U.white, 3) : null,
        ud(n, i * 480 + 40, 912, 420, { size: 38, ls: -15, lh: 1.15, weight: 700 }),
        T(r, i * 480 + 40, 962, 420, { font: UF, size: 26, weight: 500, lh: 1.2, color: U.slate }),
      ]),
    ], { name: 'People', notes: 'Introduce the four by name and say which team each one joined. Ask them to wave.' }),

    // 12 customers
    page(U.ice, [
      ...uc(12),
      ulab('Customers', 96, 130, U.slate),
      ud('Who is ordering', 90, 168, 1300, { size: 84, ls: -38 }),
      ...donut(470, 650, 220, 120, [{ v: 61, color: U.navy }, { v: 39, color: U.amber }], 1.5),
      ud('41 200', 330, 600, 280, { size: 64, ls: -25, lh: 1, align: 'center' }),
      T('orders in Q3', 330, 674, 280, { font: UF, size: 24, weight: 500, lh: 1.2, color: U.slate, align: 'center' }),
      rect(900, 408, 22, 22, U.navy), T('Returning customers', 940, 400, 400, { font: UF, size: 26, weight: 600, lh: 1.3, color: U.navy }),
      rect(900, 468, 22, 22, U.amber), T('First time customers', 940, 460, 400, { font: UF, size: 26, weight: 600, lh: 1.3, color: U.navy }),
      ...[['61%', 'of orders came from people who had ordered before'], ['58 EUR', 'average order value, up 3 euro on Q2'], ['4.7', 'average rating across 3 100 reviews']].flatMap(([n, t], i) => {
        const y = 560 + i * 140;
        return [
          L(900, y, 1824, y, i === 0 ? U.navy : U.line, i === 0 ? 3 : 1),
          ud(n, 894, y + 22, 400, { size: 72, ls: -28, lh: 1 }),
          T(t, 1290, y + 30, 534, { font: UF, size: 26, weight: 400, lh: 1.35, color: U.navy }),
        ];
      }),
    ], { name: 'Customers', notes: 'Six in ten orders come from repeat customers, which is why delivery time and returns matter so much to us.' }),

    // 13 next steps
    page(U.white, [
      ...uc(13),
      ulab('Next steps', 96, 130, U.slate),
      ud('Who does what, and by when', 90, 168, 1700, { size: 84, ls: -38 }),
      ...['Action', 'Owner', 'Due'].map((h, i) => ulab(h, [180, 1160, 1560][i], 316, U.slate, 300, { size: 18 })),
      L(96, 356, 1824, 356, U.navy, 3),
      ...[['Sign the new carrier contract', 'Lena Moberg', '10 Oct'], ['Hire three night shift packers', 'Sofie Berg', '24 Oct'], ['Finish payment testing for the app', 'Tariq Nilsson', '7 Nov'], ['Launch the checkout app', 'Tariq Nilsson', '14 Nov'], ['Stock check before Black Friday', 'Sara Lindgren', '20 Nov'], ['Send the Q4 review to all staff', 'Lena Moberg', '12 Jan']].flatMap(([a, o, d], i) => {
        const y = 356 + i * 108;
        return [
          rect(96, y + 32, 44, 44, U.navy),
          T(String(i + 1), 96, y + 40, 44, { font: UF, size: 26, weight: 800, lh: 1.2, color: U.white, align: 'center' }),
          T(a, 180, y + 34, 940, { font: UF, size: 34, weight: 600, lh: 1.25, color: U.navy }),
          T(o, 1160, y + 32, 380, { font: UF, size: 30, weight: 400, lh: 1.25, color: U.slate }),
          T(d, 1560, y + 30, 264, { font: UF, size: 32, weight: 800, lh: 1.25, color: U.navy }),
          L(96, y + 108, 1824, y + 108, U.line, 1),
        ];
      }),
    ], { name: 'Next steps', notes: 'Every line has one name and one date. We will walk through the list again at the start of the next all hands.' }),

    // 14 close
    page(U.navy, [
      rect(1280, 0, 640, 1080, U.amber),
      ud('Questions', 80, 150, 1200, { size: 230, ls: -80, lh: 1, color: U.white }),
      T('Ask now, or send it to the address on the right. We answer every question in the staff channel within a day.', 96, 480, 900, { font: UF, size: 36, weight: 400, lh: 1.4, color: U.dlab }),
      L(96, 880, 1184, 880, U.white, 1, { opacity: 0.3 }),
      T('Alder & Finch  /  Q3 2026 company update', 96, 920, 1000, { font: UF, size: 24, weight: 500, lh: 1.3, color: U.dlab }),
      ulab('Next update', 1340, 96, U.navy, 500),
      ud('12 January\n2027', 1334, 136, 560, { size: 84, ls: -35, lh: 1.04, color: U.navy }),
      ulab('Questions to', 1340, 700, U.navy, 500),
      T('lena.moberg@\nalderfinch.example', 1340, 740, 560, { font: UF, size: 32, weight: 600, lh: 1.3, color: U.navy }),
      T('Slides on the intranet\nunder All hands', 1340, 880, 560, { font: UF, size: 28, weight: 400, lh: 1.35, color: U.navy }),
    ], { name: 'Questions', notes: 'Leave this on screen. If the room is quiet, ask which of the three priorities people think is hardest.' }),
  ],
});

export default [pitch, project, update];
