import { describe, expect, it } from 'vitest';
import { safeColor, safeLink } from '../src/render/safe';

// Designs come from files and share links, so these values are attacker controlled.
describe('safe values', () => {
  it('lets web and mail links through and nothing else', () => {
    expect(safeLink('https://opentempl.org')).toBe('https://opentempl.org/');
    expect(safeLink('mailto:hi@example.com')).toBe('mailto:hi@example.com');
    for (const bad of ['javascript:alert(1)', ' JavaScript:alert(1)', 'data:text/html,x', 'file:///etc/passwd', 'vbscript:x', 'tavla://app/x', '', 42, null]) expect(safeLink(bad)).toBeNull();
  });

  it('accepts colour syntax and refuses anything that could close an attribute', () => {
    for (const ok of ['#fff', '#0B0B0D80', 'currentColor', 'red', 'rgb(1, 2, 3)', 'hsla(10 20% 30% / 0.5)']) expect(safeColor(ok)).not.toBeNull();
    for (const bad of ['red"><img src=x onerror=alert(1)>', 'url(https://x.y/a.png)', 'red;background:url(x)', 'expression(alert(1))', '', {}]) expect(safeColor(bad)).toBeNull();
  });
});
