import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { assetIds, buildDesign, DraftError, lineEnds, notices, outline, palette, type Draft, type Sources, type TemplateDef } from '../../../mcp/recipe';

const pack = JSON.parse(readFileSync(new URL('../public/templates/asia-poster.json', import.meta.url), 'utf8')) as TemplateDef[];
const bauhaus = JSON.parse(readFileSync(new URL('../public/templates/bauhaus.json', import.meta.url), 'utf8')) as TemplateDef[];
const market = pack.find((t) => t.id === 'asia-night-market')!;
const room = bauhaus.find((t) => t.id === 'bauhaus-room-for-light')!;
const fonts = new Set(['Archivo', 'Anton', 'Inter', 'Black Han Sans']);
const fromTemplate = (t: TemplateDef, ops: Draft['ops']) => buildDesign({ v: 1, start: { template: t.id }, ops }, { template: t, fonts });
const blank = (ops: Draft['ops'], src: Sources = { fonts }) => buildDesign({ v: 1, start: { width: 1080, height: 1350 }, ops }, src);

describe('drafts', () => {
  it('names template pages and elements by position', () => {
    const d = fromTemplate(market, []);
    expect(d.pages.map((p) => p.id)).toEqual(['p1']);
    expect(d.pages[0].elements.map((e) => e.id).slice(0, 3)).toEqual(['p1-e1', 'p1-e2', 'p1-e3']);
    expect(d.width).toBe(market.width);
  });

  it('replays the same steps to the same design', () => {
    const ops: Draft['ops'] = [
      { op: 'set_text', id: 'p1-e3', text: 'Late\nMarket' },
      { op: 'add', page: 'p1', element: { type: 'shape', shape: 'star', x: 10, y: 10, w: 100, h: 100, fill: '#FF0000' } },
      { op: 'add_page', copy: 'p1' },
    ];
    expect(JSON.stringify(fromTemplate(market, ops))).toBe(JSON.stringify(fromTemplate(market, ops)));
  });

  it('replaces text, drops stale runs and remembers the old words for fitting', () => {
    const d = fromTemplate(market, [{ op: 'set_text', id: 'p1-e3', text: 'Late\nMarket' }]);
    const el = d.pages[0].elements[2];
    expect(el.type === 'text' && el.text).toBe('Late\nMarket');
    expect(d.fit['p1-e3']).toBe('shrink');
    expect(d.orig['p1-e3']).toBe('Night\nMarket');
  });

  it('sets new words smaller when they need more room than the old ones had, and says so', () => {
    const d = fromTemplate(market, [{ op: 'set_text', id: 'p1-e3', text: 'A much longer headline than this box was ever drawn for' }]);
    const el = d.pages[0].elements[2];
    expect(el.type === 'text' && el.fontSize).toBeLessThan(118);
    expect(notices(d).some((n) => n.startsWith('p1-e3 is set at'))).toBe(true);
    const short = fromTemplate(market, [{ op: 'set_text', id: 'p1-e3', text: 'Late\nShow' }]);
    expect(short.pages[0].elements[2].type === 'text' && (short.pages[0].elements[2] as { fontSize: number }).fontSize).toBe(118);
  });

  it('lets an explicit size win over fitting', () => {
    const d = fromTemplate(market, [
      { op: 'set_text', id: 'p1-e3', text: 'A much longer headline than this box was ever drawn for' },
      { op: 'style', id: 'p1-e3', props: { fontSize: 90 } },
    ]);
    const el = d.pages[0].elements[2];
    expect(el.type === 'text' && el.fontSize).toBe(90);
    expect(Object.keys(d.resized)).toEqual([]);
  });

  it('measures with whatever the caller passes, so the editor can use real fonts', () => {
    const d = blank([{ op: 'add', page: 'p1', element: { type: 'text', text: 'Hi', x: 0, y: 0, w: 500 } }], { fonts, measure: () => ({ height: 333, width: 10 }) });
    expect(d.pages[0].elements[0].h).toBe(333);
  });

  it('points out template words that were never replaced', () => {
    const d = fromTemplate(market, [{ op: 'set_text', id: 'p1-e3', text: 'Late\nShow' }]);
    const left = notices(d).find((n) => n.startsWith('Still the template'));
    expect(left).toContain('p1-e4');
    expect(left).not.toContain('p1-e3 ');
  });

  it('recolours text, shapes, lines, vector art and backgrounds in one step', () => {
    const before = fromTemplate(room, []);
    const red = palette(before).find((p) => p.color === '#d7261e');
    expect(red).toBeTruthy();
    const d = fromTemplate(room, [{ op: 'recolor', from: '#D7261E', to: '#2E7D32' }]);
    expect(palette(d).some((p) => p.color === '#d7261e')).toBe(false);
    const svg = d.pages[0].elements.find((e) => e.type === 'svg');
    expect(svg?.type === 'svg' && svg.colors['#D7261E']).toBe('#2E7D32');
  });

  it('builds elements from scratch with friendly names and checks every value', () => {
    const d = blank([
      { op: 'add', page: 'p1', element: { type: 'text', text: 'Hello', font: 'Anton', size: 120, x: 80, y: 80, w: 900 } },
      { op: 'add', page: 'p1', element: { type: 'line', x1: 80, y1: 400, x2: 1000, y2: 400, width: 3 } },
      { op: 'add', page: 'p1', element: { type: 'image', url: 'https://example.com/a.jpg', x: 0, y: 500, w: 1080, h: 600, mask: 'arch' } },
    ]);
    const [text, line, image] = d.pages[0].elements;
    expect(text.type === 'text' && [text.fontFamily, text.fontSize]).toEqual(['Anton', 120]);
    expect(text.h).toBeGreaterThan(100);
    expect(line.type === 'line' && [Math.round(line.w), line.rotation, line.width]).toEqual([920, 0, 3]);
    expect(image.type === 'image' && image.assetId).toBe('web:1');
    expect(d.cover).toContain('n3');
    expect(assetIds(d)).toEqual(['web:1']);
  });

  it('refuses what it cannot draw, saying what to do instead', () => {
    const bad: [Draft['ops'], RegExp][] = [
      [[{ op: 'set_text', id: 'p9-e1', text: 'x' }], /no element "p9-e1"/],
      [[{ op: 'add', page: 'p1', element: { type: 'text', text: 'x', fontFamily: 'Comic Nonsense' } }], /search_fonts/],
      [[{ op: 'add', page: 'p1', element: { type: 'shape', fill: 'url(javascript:alert(1))' } }], /colour/],
      [[{ op: 'add', page: 'p1', element: { type: 'shape', sparkle: true } }], /not a shape property/],
      [[{ op: 'add', page: 'p1', element: { type: 'image', url: 'http://example.com/a.jpg' } }], /https/],
      [[{ op: 'add', page: 'p1', element: { type: 'icon', icon: 'ph:star' } }], /search_icons/],
      [[{ op: 'add', page: 'p1', element: { type: 'shape', link: 'javascript:alert(1)' } }], /link/],
      [[{ op: 'remove', id: 'p1' }], /at least one page/],
    ];
    for (const [ops] of bad) expect(() => blank(ops)).toThrow(DraftError);
    for (const [ops, msg] of bad) expect(() => blank(ops)).toThrow(msg);
  });

  it('aligns, distributes, swaps colour maps and restyles lines by their ends', () => {
    const d = blank([
      { op: 'add', page: 'p1', element: { type: 'shape', shape: 'circle', x: 100, y: 100, w: 200, h: 200 } },
      { op: 'add', page: 'p1', element: { type: 'text', text: 'Free', x: 0, y: 0, w: 120 } },
      { op: 'align', ids: ['n2'], to: 'center', relative: 'n1' },
      { op: 'align', ids: ['n2'], to: 'middle', relative: 'n1' },
      { op: 'add', page: 'p1', element: { type: 'shape', x: 0, y: 500, w: 100, h: 100, fill: '#000000' } },
      { op: 'add', page: 'p1', element: { type: 'shape', x: 150, y: 500, w: 100, h: 100, fill: '#FFFFFF' } },
      { op: 'add', page: 'p1', element: { type: 'shape', x: 900, y: 500, w: 100, h: 100, fill: '#000000' } },
      { op: 'distribute', ids: ['n3..n5'], axis: 'horizontal' },
      { op: 'recolor', map: { '#000000': '#FFFFFF', '#FFFFFF': '#000000' } },
      { op: 'add', page: 'p1', element: { type: 'line', x1: 0, y1: 0, x2: 100, y2: 0 } },
      { op: 'style', id: 'n6', props: { x2: 100, y2: 100 } },
    ]);
    const [circle, label, a, b, c, line] = d.pages[0].elements;
    expect(circle.type === 'shape' && circle.shape).toBe('ellipse');
    expect(label.x + label.w / 2).toBeCloseTo(200);
    expect(label.y + label.h / 2).toBeCloseTo(200);
    expect([a.x, b.x, c.x]).toEqual([0, 450, 900]);
    expect(a.type === 'shape' && a.fill.type === 'solid' && a.fill.color).toBe('#FFFFFF');
    expect(b.type === 'shape' && b.fill.type === 'solid' && b.fill.color).toBe('#000000');
    const ends = lineEnds(line);
    expect([ends.x1, ends.y1, ends.x2, ends.y2].map((v) => Math.round(v) + 0)).toEqual([0, 0, 100, 100]);
  });

  it('removes runs of elements by range', () => {
    const d = fromTemplate(market, [{ op: 'remove', ids: ['p1-e2..p1-e4'] }]);
    expect(d.pages[0].elements.map((e) => e.id)).toEqual(['p1-e1', 'p1-e5', 'p1-e6']);
  });

  it('copies pages with fresh ids and keeps how their text fits', () => {
    const d = fromTemplate(market, [
      { op: 'set_text', id: 'p1-e3', text: 'One' },
      { op: 'add_page', copy: 'p1' },
      { op: 'move_page', id: 'p2', to: 1 },
    ]);
    expect(d.pages.map((p) => p.id)).toEqual(['p2', 'p1']);
    const copy = d.pages[0].elements[2];
    expect(copy.id).toMatch(/^n\d+$/);
    expect(d.fit[copy.id]).toBe('shrink');
    expect(d.orig[copy.id]).toBe('Night\nMarket');
  });

  it('describes a design with every id the assistant needs', () => {
    const text = outline(fromTemplate(market, []));
    expect(text).toContain('Page p1');
    expect(text).toContain('p1-e3  text');
    expect(text).toMatch(/Palette: #/);
  });
});
