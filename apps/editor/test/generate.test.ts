import { describe, expect, it } from 'vitest';
import looks from '../public/looks/looks.json';
import fonts from '../src/fonts/google-fonts.json';
import { composePrompt, emptyBrief } from '../src/generate/prompt';
import { fillMasked } from '../src/generate/layers';
import type { Look } from '../src/generate/looks';

const LOOKS = looks as unknown as Look[];
const look = LOOKS[0];

describe('looks', () => {
  it('have unique ids and fonts that exist with their weights', () => {
    expect(new Set(LOOKS.map((l) => l.id)).size).toBe(LOOKS.length);
    const byName = new Map((fonts as [string, string, number[], number][]).map((f) => [f[0], f[2]]));
    for (const l of LOOKS) {
      expect(byName.get(l.type.headline.font)?.includes(l.type.headline.weight), `${l.id} headline font`).toBe(true);
      expect(byName.get(l.type.body.font)?.includes(l.type.body.weight), `${l.id} body font`).toBe(true);
    }
  });
});

describe('prompt composer', () => {
  it('asks for exact words when the words go in the picture', () => {
    const p = composePrompt(look, { ...emptyBrief(look), textMode: 'baked', headline: 'Pickle Days', subject: 'a pickle stand' });
    expect(p).toContain('"Pickle Days"');
    expect(p).toContain('a pickle stand');
    expect(p).not.toContain('Do not draw any letters');
  });

  it('forbids lettering and names calm areas in editable text mode', () => {
    const p = composePrompt(look, { ...emptyBrief(look), textMode: 'layers', headline: 'Pickle Days' });
    expect(p).toContain('Do not draw any letters');
    expect(p).toContain('headline area');
    expect(p).not.toContain('"Pickle Days"');
  });

  it('swaps in the user palette and numbers the references', () => {
    const p = composePrompt(look, {
      ...emptyBrief(look),
      colors: ['#123456', '#ABCDEF'],
      refs: [{ id: 'a', name: 'jar', role: 'subject', note: 'the green lid', url: '' }],
    });
    expect(p).toContain('#123456, #ABCDEF');
    const pins = (look.refs ?? []).slice(0, 2).length;
    expect(p).toContain(pins ? `Images 1 to ${1 + pins} are style references` : 'Image 1 is style reference');
    expect(p).toContain(`Image ${2 + pins} (jar)`);
    expect(p).toContain('the green lid');
  });
});

describe('magic layers fill', () => {
  it('fills a hole from its surroundings', () => {
    const W = 20, H = 20;
    const img = { width: W, height: H, data: new Uint8ClampedArray(W * H * 4), colorSpace: 'srgb' } as ImageData;
    for (let i = 0; i < W * H; i++) img.data.set([200, 100, 50, 255], i * 4);
    const mask = new Uint8Array(W * H);
    for (let y = 6; y < 14; y++) for (let x = 6; x < 14; x++) {
      mask[y * W + x] = 1;
      img.data.set([0, 0, 0, 255], (y * W + x) * 4);
    }
    fillMasked(img, mask);
    const c = (10 * W + 10) * 4;
    expect(img.data[c]).toBeGreaterThan(190);
    expect(img.data[c + 1]).toBeGreaterThan(90);
  });
});
