import { describe, expect, it } from 'vitest';
import looks from '../public/looks/looks.json';
import { composePrompt, emptyBrief, type TextMode } from '../src/generate/prompt';
import { LOOK_FORMATS, type Look, type LookFormat } from '../src/generate/looks';

// Every Look in every format must give ChatGPT a brief its image tool accepts. Each rule below
// is a failure we saw: vector wording made it write SVG, talk of pictures or editing made the
// tool treat the brief as an edit and refuse, and shapes other than 1:1, 2:3 and 3:2 errored.
const all = looks as unknown as Look[];
const formats = Object.keys(LOOK_FORMATS) as LookFormat[];
const modes: TextMode[] = ['layers', 'baked', 'none'];

const firstLine = (p: string) => p.split('\n')[0];
const body = (p: string) => p.split('\n').slice(1).join('\n');

describe('ChatGPT briefs', () => {
  for (const look of all)
    for (const format of formats.filter((f) => look.formats.includes(f)))
      for (const textMode of modes)
        it(`${look.id} / ${format} / ${textMode}`, () => {
          const brief = { ...emptyBrief(look), format, textMode, subject: 'a late night noodle shop', headline: 'Noodles', subline: 'Open till three', details: 'Storgatan 4' };
          const p = composePrompt(look, brief, { forChatGPT: true });

          expect(firstLine(p)).toMatch(/image generation tool/);
          expect(p).not.toMatch(/\bvectors?\b|\bsvg\b|\bhtml\b/i);
          expect(body(p)).not.toMatch(/\bcode\b/i);
          expect(body(p)).not.toMatch(/\b(attach\w*|reference\w*|existing image|edit the|editing)\b/i);
          expect(p).not.toMatch(/\bImage \d/);
          expect(p).not.toMatch(/keep the empty text areas|must stay EMPTY/);
          expect(p).toMatch(/\((1:1|2:3|3:2)\) image/);
          expect(p).not.toMatch(/\b(9:16|4:5|16:9)\b(?! tall| portrait| landscape)/);
        });
});
