// The hero is a working Tavla sheet: the objects can be thrown around, the
// headline can be selected, moved, retyped and recoloured from the toolbar.

const DESIGN_W = 1920;

export function initHero() {
  const sheet = document.querySelector<HTMLElement>('[data-sheet]');
  if (!sheet) return;
  const headlineEl = sheet.querySelector<HTMLElement>('[data-el="headline"]')!;
  const headline = headlineEl.querySelector<HTMLElement>('.headline')!;
  const live = headlineEl.querySelector<HTMLElement>('[data-live]')!;
  const sizeLabel = document.querySelector<HTMLElement>('[data-size]');

  const pct = (el: HTMLElement, prop: string) => parseFloat(getComputedStyle(el).getPropertyValue(prop)) || 0;

  // ---------- size readout in design units ----------
  const updateSize = () => {
    const scale = DESIGN_W / sheet.clientWidth;
    const fs = parseFloat(getComputedStyle(headline).fontSize) * scale;
    if (sizeLabel) sizeLabel.textContent = String(Math.round(fs));
    live.textContent = `${Math.round(headlineEl.offsetWidth * scale)} × ${Math.round(headlineEl.offsetHeight * scale)}`;
  };
  new ResizeObserver(updateSize).observe(sheet);
  updateSize();

  // ---------- dragging anything on the sheet ----------
  const drag = (el: HTMLElement, opts: { tilt: boolean; onStart?: () => boolean }) => {
    el.addEventListener('pointerdown', (e) => {
      if (opts.onStart && !opts.onStart()) return;
      if (e.button !== 0) return;
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      const rect = sheet.getBoundingClientRect();
      const startX = pct(el, '--x');
      const startY = pct(el, '--y');
      const baseR = parseFloat(el.style.getPropertyValue('--r')) || 0;
      const sx = e.clientX;
      const sy = e.clientY;
      let lastX = e.clientX;
      let lastT = performance.now();
      let tilt = 0;
      let moved = false;
      el.classList.add('is-dragging');
      const move = (ev: PointerEvent) => {
        const dx = ((ev.clientX - sx) / rect.width) * 100;
        const dy = ((ev.clientY - sy) / rect.height) * 100;
        if (Math.abs(dx) + Math.abs(dy) > 0.4) moved = true;
        el.style.setProperty('--x', `${Math.max(-8, Math.min(96, startX + dx))}%`);
        el.style.setProperty('--y', `${Math.max(-8, Math.min(92, startY + dy))}%`);
        if (opts.tilt) {
          const now = performance.now();
          const v = (ev.clientX - lastX) / Math.max(1, now - lastT);
          lastX = ev.clientX;
          lastT = now;
          tilt += (Math.max(-22, Math.min(22, v * 14)) - tilt) * 0.35;
          el.style.transform = `rotate(${baseR + tilt}deg) scale(1.04)`;
        }
        if (el === headlineEl) {
          live.classList.add('show');
          updateSize();
        }
      };
      const up = () => {
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', up);
        el.removeEventListener('pointercancel', up);
        el.classList.remove('is-dragging');
        live.classList.remove('show');
        if (opts.tilt) settle(el, baseR, tilt);
        if (!moved && el === headlineEl) headlineEl.classList.add('is-selected');
      };
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
    });
  };

  // Spring the tilt back to rest after a throw.
  const settle = (el: HTMLElement, base: number, from: number) => {
    let r = from;
    let v = 0;
    const step = () => {
      v += -r * 0.16;
      v *= 0.78;
      r += v;
      el.style.transform = `rotate(${base + r}deg)`;
      if (Math.abs(r) > 0.05 || Math.abs(v) > 0.05) requestAnimationFrame(step);
      else el.style.transform = `rotate(${base}deg)`;
    };
    requestAnimationFrame(step);
  };

  sheet.querySelectorAll<HTMLElement>('[data-drag]').forEach((el) => {
    el.style.setProperty('--r', getComputedStyle(el).getPropertyValue('--r'));
    drag(el, { tilt: true, onStart: () => (headlineEl.classList.remove('is-selected'), true) });
  });
  drag(headlineEl, { tilt: false, onStart: () => headline.contentEditable !== 'true' });

  // ---------- editing the headline ----------
  headlineEl.addEventListener('dblclick', () => {
    headline.contentEditable = 'true';
    headline.focus();
    const range = document.createRange();
    range.selectNodeContents(headline);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  });
  headline.addEventListener('blur', () => {
    headline.contentEditable = 'false';
    if (!headline.textContent?.trim()) headline.textContent = 'Make the thing.';
    updateSize();
  });
  headline.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault();
      headline.blur();
    }
  });
  headline.addEventListener('input', updateSize);
  sheet.addEventListener('pointerdown', (e) => {
    if (!headlineEl.contains(e.target as Node)) headlineEl.classList.remove('is-selected');
  });

  // ---------- toolbar ----------
  const swatches = document.querySelectorAll<HTMLButtonElement>('[data-color]');
  swatches.forEach((b) =>
    b.addEventListener('click', () => {
      headline.style.color = b.dataset.color!;
      swatches.forEach((x) => x.classList.toggle('is-on', x === b));
      headlineEl.classList.add('is-selected');
    }),
  );
  const weight = document.querySelector<HTMLButtonElement>('[data-weight]');
  weight?.addEventListener('click', () => {
    const bold = weight.classList.toggle('is-on');
    headline.style.fontWeight = bold ? '800' : '';
    headline.style.letterSpacing = bold ? '-0.06em' : '';
    headlineEl.classList.add('is-selected');
    updateSize();
  });
  const italic = document.querySelector<HTMLButtonElement>('[data-italic]');
  italic?.addEventListener('click', () => {
    const on = italic.classList.toggle('is-on');
    headline.style.fontStyle = on ? 'italic' : '';
    headlineEl.classList.add('is-selected');
  });
}

// The nav mark's pupils glance at the pointer.
export function initMarkEyes() {
  const pupils = document.querySelectorAll<SVGRectElement>('.mark .pupil');
  const mark = document.querySelector<SVGElement>('.mark');
  if (!mark || !pupils.length) return;
  window.addEventListener('pointermove', (e) => {
    const r = mark.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const ox = Math.abs(dx) > 30 ? Math.sign(dx) * 0.5 : 0;
    const oy = Math.abs(dy) > 30 ? Math.sign(dy) * 0.5 : 0;
    pupils.forEach((p, i) => {
      p.setAttribute('x', String((i ? 9.5 : 5.5) + ox));
      p.setAttribute('y', String(8 + oy));
    });
  });
}
