import DOMPurify from 'dompurify';

// Designs arrive from files, share links and people editing alongside you, so
// anything that ends up as markup or a link is cleaned where it is drawn, not
// only where it was first added.

let purify: ReturnType<typeof DOMPurify> | null = null;

function purifier() {
  if (purify) return purify;
  purify = DOMPurify(window);
  // External references would let a design load anything and see who opened it.
  purify.addHook('uponSanitizeAttribute', (_node, data) => {
    if ((data.attrName === 'href' || data.attrName === 'xlink:href') && !/^(#|data:image\/(png|jpe?g|gif|webp);)/i.test(data.attrValue.trim())) data.keepAttr = false;
  });
  return purify;
}

export function sanitizeSvg(svg: string): string | null {
  if (typeof window === 'undefined') return null;
  const clean = purifier().sanitize(svg, { USE_PROFILES: { svg: true, svgFilters: true }, FORBID_TAGS: ['foreignObject', 'style', 'a'] });
  return /^\s*<svg[\s>]/i.test(clean) ? clean : null;
}

// Paint values go into markup and CSS, so only plain colour syntax gets through.
const COLOR = /^(#[0-9a-f]{3,8}|currentColor|transparent|[a-z]{3,20}|(rgb|hsl)a?\([\d\s.,%/]+\))$/i;
export const safeColor = (c: unknown): string | null => (typeof c === 'string' && COLOR.test(c.trim()) ? c.trim() : null);

export function safeLink(link: unknown): string | null {
  if (typeof link !== 'string') return null;
  try {
    const u = new URL(link.trim());
    return ['https:', 'http:', 'mailto:'].includes(u.protocol) ? u.toString() : null;
  } catch {
    return null;
  }
}
