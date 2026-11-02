import { LOOK_FORMATS, styleRefs, zonesFor, type Look, type LookFormat, type TextRole } from './looks';

// The prompt composer. No model writes these prompts: they are assembled from
// the Look's art direction and the user's brief, so the same input always gives
// the same prompt and it works offline, in ChatGPT and through the API alike.

export type TextMode = 'layers' | 'baked' | 'none';
export type RefRole = 'subject' | 'style' | 'logo' | 'palette' | 'person' | 'other';

export interface Reference {
  id: string;
  name: string;
  role: RefRole;
  note: string;
  url: string; // object URL or data URL, for previews and the API
}

export interface Brief {
  subject: string; // what the design is for and what it should show
  headline: string;
  subline: string;
  details: string;
  mood: string;
  extra: string;
  colors: string[]; // empty: keep the Look's palette
  format: LookFormat;
  textMode: TextMode;
  refs: Reference[];
  useLookSample: boolean; // send the Look's sample along as the style reference
}

export const emptyBrief = (look?: Look): Brief => ({
  subject: '',
  headline: look?.example.headline ?? '',
  subline: look?.example.subline ?? '',
  details: look?.example.details ?? '',
  mood: '',
  extra: '',
  colors: [],
  format: look?.formats.includes('poster') ? 'poster' : (look?.formats[0] ?? 'post'),
  textMode: 'layers',
  refs: [],
  useLookSample: true,
});

const REF_ROLE_TEXT: Record<RefRole, string> = {
  subject: 'the real thing to show (a product, place, dish or object). Show it faithfully: same shape, proportions, colours and details, but drawn or photographed in this Look',
  person: 'a person to feature. Keep their likeness, hair, clothing and character, rendered in this Look',
  style: 'an extra style reference. Borrow its feel, texture and colour mood, not its content',
  logo: 'a logo. Reproduce it faithfully, small and clean, in a quiet corner; do not redraw or restyle it',
  palette: 'a colour reference. Take the palette from it',
  other: 'an extra reference',
};

const GLOBAL_AVOID = [
  'anything that looks AI generated: plastic sheen, airbrushed skin, overly smooth gradients, glow and lens flare, HDR, stock photo smiles',
  'gibberish letters, made up words or any text other than the exact words given',
  'watermarks, signatures, UI elements, borders or frames around the design',
  'filler decoration: sparkles, floating dots and stars, confetti, random geometric shapes, gradient orbs, ornamental dividers',
  'uniform line weight, plastic or airbrushed shading, soft storybook gloss, perfect symmetry, melted or merging details, impossible objects',
  'showing the design as a mockup (a poster on a wall, a phone, a hand holding it): the artwork itself must fill the whole canvas edge to edge, flat and straight on',
];

const ROLE_LABEL: Record<TextRole, string> = { headline: 'headline', subline: 'second line', details: 'small details' };

const pct = (v: number) => `${Math.round(v * 100)}%`;
const list = (xs: string[]) => xs.filter(Boolean).map((x) => `- ${x}`).join('\n');

export interface ComposeOptions {
  forChatGPT?: boolean; // adds a line asking it to make the image now, and how references were attached
}

export function composePrompt(look: Look, briefIn: Brief, opts: ComposeOptions = {}): string {
  // In ChatGPT, "leave space for text added later" pushes it to draw the design as code (SVG)
  // instead of calling image generation, which then fails. Words go into the picture there;
  // Magic layers can make them editable once the picture is back in OpenTempl.
  const brief: Brief = opts.forChatGPT && briefIn.textMode === 'layers' ? { ...briefIn, textMode: 'baked' } : briefIn;
  const f = LOOK_FORMATS[brief.format];
  const subject = brief.subject.trim() || look.example.subject;
  const words = (['headline', 'subline', 'details'] as TextRole[]).map((r) => [r, brief[r].trim()] as const).filter(([, t]) => t);
  const out: string[] = [];

  if (opts.forChatGPT)
    out.push(`Use your image generation tool to make one picture from this brief. Do not write code, SVG or HTML, and do not describe the design instead of making it.\n`);
  out.push(
    `Create a finished graphic design: a ${f.name.toLowerCase()} in ${f.aspect} format. It is for: ${subject}.`,
    `It must look designed and made by hand by a skilled human designer and illustrator, in the style described below. Treat the style as a strict art direction.`,
  );

  out.push(`\nSTYLE: ${look.name}\n${look.medium}`);
  if (look.signature.length) out.push(`Signature moves to keep:\n${list(look.signature)}`);

  out.push(`\nSUBJECT\nShow ${subject} in this style. Make the subject the hero and fit everything to it: props, setting and details should belong to this subject, not to the example the style came from.`);
  if (brief.mood.trim()) out.push(`Mood and feel: ${brief.mood.trim()}.`);
  if (brief.extra.trim()) out.push(`Also: ${brief.extra.trim()}`);

  out.push(`\nCOMPOSITION\n${look.composition}`);
  if (brief.textMode === 'layers' && words.length) {
    const zones = zonesFor(look, brief.format).filter((z) => words.some(([r]) => r === z.role));
    if (zones.length)
      out.push(
        `IMPORTANT: real type is set on top of this artwork afterwards, so these areas must stay EMPTY: plain, flat background colour or bare paper only, no objects, no pattern, no texture changes, no strong edges. Compose the artwork around them:\n` +
          list(zones.map((z) => `${ROLE_LABEL[z.role]} area: from ${pct(z.x)} to ${pct(z.x + z.w)} across and ${pct(z.y)} to ${pct(z.y + z.h)} down`)),
      );
  }

  if (brief.textMode === 'baked' && words.length) {
    out.push(
      `\nTYPOGRAPHY\n${look.typography}`,
      `Render exactly these words, spelled exactly as written, and no other text anywhere:\n` + list(words.map(([r, t]) => `${ROLE_LABEL[r]}: "${t}"`)),
      `Give them a clear hierarchy: the headline large and dominant, the rest much smaller.`,
    );
  } else {
    out.push(`\nNO TEXT\nDo not draw any letters, words, numbers, logos, signs or labels anywhere in the image. Real type will be added on top later.`);
  }

  if (brief.colors.length)
    out.push(
      `\nCOLOUR\nUse this palette instead of the style's usual colours: ${brief.colors.join(', ')}. Keep the style's way of using colour: ${look.palette.note}`,
    );
  else out.push(`\nCOLOUR\nPalette: ${look.palette.colors.join(', ')}. ${look.palette.note}`);

  out.push(`\nTEXTURE AND FINISH\n${look.texture}`);

  const refs: string[] = [];
  let n = 1;
  if (brief.useLookSample) {
    const pins = opts.forChatGPT ? 0 : styleRefs(look).length;
    const first = n, last = n + pins;
    n = last + 1;
    refs.push(
      `${pins ? `Images ${first} to ${last} are` : `Image ${first} is`} style reference${pins ? 's' : ''} for ${look.name}: match the medium, texture, palette logic and finish. Do not copy their subjects, characters, layouts, words, logos or any artist's signature.`,
    );
  }
  for (const r of brief.refs) refs.push(`Image ${n++} (${r.name}) is ${REF_ROLE_TEXT[r.role]}.${r.note.trim() ? ` ${r.note.trim()}` : ''}`);
  if (refs.length && opts.forChatGPT)
    // In ChatGPT the person may or may not attach the pictures, so the brief must work without them.
    out.push(
      `\nREFERENCE PICTURES (optional)\nThe person may attach pictures. If they did, read them in this order:\n${refs.join('\n')}\nIf nothing is attached, carry on: the art direction above is complete on its own. Never ask for a picture and never wait for one.`,
    );
  else if (refs.length) out.push(`\nREFERENCE IMAGES\n${refs.join('\n')}`);

  out.push(`\nAVOID\n${list([...look.avoid, ...GLOBAL_AVOID])}`);
  if (brief.textMode === 'layers' && words.length) out.push(`\nRemember: no lettering anywhere, and keep the empty text areas truly empty.`);
  if (opts.forChatGPT) {
    out.push(
      `\nDo not search the web or look anything up: work only from this brief, so nothing from elsewhere leaks into the design.`,
      `Make the image now, in ${f.aspect} format, without asking questions first.`,
    );
    // Honest context for ChatGPT and for anyone the chat gets shared with.
    out.push(`(Brief written with OpenTempl, the free, open source design app at opentempl.org. The designer brings the picture back there to set and edit the words.)`);
  }
  return out.join('\n');
}

// A short prompt for removing lettering from an image (Magic layers with an API key).
export const ERASE_TEXT_PROMPT =
  'Remove all letters, words and numbers inside the masked areas. Continue the surrounding artwork, background, texture and grain there so it looks untouched. Change nothing outside the masked areas.';

export const ERASE_SUBJECT_PROMPT =
  'Remove the main subject inside the masked area and continue the background behind it naturally, matching texture, colour and grain. Change nothing outside the masked area.';
