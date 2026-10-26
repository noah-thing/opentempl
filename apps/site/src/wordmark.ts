// The footer wordmark: "tavla" drawn on a pixel grid. The counters of the two
// a's hold pupils that follow the pointer, so the name looks back at you.

const GLYPHS: Record<string, string[]> = {
  t: ['.#..', '.#..', '####', '.#..', '.#..', '.#..', '..##'],
  a: ['.....', '.....', '.###.', '....#', '.####', '#...#', '.####'],
  v: ['.....', '.....', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  l: ['##.', '.#.', '.#.', '.#.', '.#.', '.#.', '.##'],
};

const WORD = 'tavla';
const GAP = 1;

export function initWordmark() {
  const host = document.querySelector<HTMLElement>('[data-wordmark]');
  if (!host) return;
  const cells: string[] = [];
  const eyes: { x: number; y: number }[] = [];
  let cx = 0;
  for (const ch of WORD) {
    const g = GLYPHS[ch];
    const w = g[0].length;
    g.forEach((row, y) =>
      [...row].forEach((c, x) => {
        if (c === '#') cells.push(`<rect class="px" x="${cx + x + 0.06}" y="${y + 0.06}" width="0.88" height="0.88" rx="0.14" style="--d:${(cx + x) * 18 + y * 30}ms"/>`);
      }),
    );
    // The bowl of an "a" is the empty row 5, columns 1 to 3: the eye lives there.
    if (ch === 'a') eyes.push({ x: cx + 1, y: 5 });
    cx += w + GAP;
  }
  const W = cx - GAP;
  const H = 7;
  const pupils = eyes.map((e, i) => `<rect class="pupil" data-i="${i}" x="${e.x + 1.06}" y="${e.y + 0.06}" width="0.88" height="0.88" rx="0.3"/>`).join('');
  host.innerHTML = `<svg viewBox="-0.2 -0.2 ${W + 0.4} ${H + 0.4}" role="img" aria-label="tavla"><style>
    .px{fill:#0B0B0D;transition:transform .5s cubic-bezier(.2,.8,.2,1);transform-box:fill-box;transform-origin:center}
    .px:hover{transform:scale(.6) rotate(12deg);fill:#2B3BFF}
    .pupil{fill:#2B3BFF;transition:x .18s ease-out, y .18s ease-out}
  </style>${cells.join('')}${pupils}</svg>`;
  const svg = host.querySelector('svg')!;
  const pupilEls = [...host.querySelectorAll<SVGRectElement>('.pupil')];
  window.addEventListener('pointermove', (e) => {
    const r = svg.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    const unit = r.width / (W + 0.4);
    pupilEls.forEach((p, i) => {
      const eye = eyes[i];
      const ex = r.left + (eye.x + 2.2) * unit;
      const ey = r.top + (eye.y + 0.7) * unit;
      const dx = e.clientX - ex;
      const ox = Math.abs(dx) < unit * 2 ? 0 : Math.sign(dx);
      p.setAttribute('x', String(eye.x + 1.06 + ox));
      p.setAttribute('y', String(eye.y + 0.06 + (e.clientY < ey - unit * 3 ? -0.0 : 0)));
    });
  });
}
