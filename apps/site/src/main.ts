import './style.css';
import { initHero, initMarkEyes } from './hero';
import { initWordmark } from './wordmark';

initHero();
initMarkEyes();
initWordmark();

// Sections drift up as they arrive.
const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    }
  },
  { rootMargin: '0px 0px -10% 0px' },
);
document.querySelectorAll('.display, .lede, .sum, .ticket, .window, .fact, .feature-grid li, .dl, .code, .pile').forEach((el, i) => {
  el.setAttribute('data-reveal', '');
  (el as HTMLElement).style.transitionDelay = `${(i % 4) * 70}ms`;
  io.observe(el);
});

// The 3D eye loads only when its section gets close.
const eyeHost = document.querySelector<HTMLElement>('[data-eye]');
if (eyeHost) {
  const lazy = new IntersectionObserver(
    async ([e]) => {
      if (!e.isIntersecting) return;
      lazy.disconnect();
      const { initEye } = await import('./eye');
      initEye(eyeHost);
    },
    { rootMargin: '400px' },
  );
  lazy.observe(eyeHost);
}
