# Building Tavla templates

Tavla is a free, open source design studio (a Canva alternative). This folder holds the big template library, one source file per vibe.
Read this whole file before writing anything.

## What a good Tavla template is

Noah, who owns Tavla, wants templates "very full of graphic design with a really nice vibe": they should feel like the best posters and
posts on Pinterest, made by a human designer with taste, never like generic Canva stock and never like AI output. Each one must also be
**adaptable**: a stranger can swap the words, colours and photo and use it for a cucumber farm, a gig, a cafe, a book club or a product
launch. Specific sample copy is good (it makes the design feel real), but the layout must not depend on one company or person.

Noah threw these out when screening references, so never make anything like them:
- a quote in a default font on a flat colour and nothing else;
- layouts whose whole point is a photo or 3D render;
- sticker sheets, icon grids, type specimens (an asset sheet is not a layout);
- messy collage without hierarchy; random pixel noise; a logo alone.

Text only designs are welcome when the typography itself is the design: scale contrast, a grid, cropping, rotation, stacking, a clever
treatment. Plain centred words are not.

### Banned, these read as AI made (Noah's standing rules)
- one word in a heading set in serif italic as an "accent"; one word picked out in a different colour inside a headline;
- floating 3D type, glossy gradients on text, glow for no reason;
- Inter or Host Grotesk as the only font on a design meant to have character (fine for strict Swiss or business layouts);
- mono "status ticker" lines with live dots or rolling digits, fake UI chrome;
- em dashes and hyphenated compound words in sample copy (write "hand made", "well known"); exclamation marks; marketing filler
  ("Elevate your", "Unlock", "Discover the magic"). Copy should be specific, plain, slightly literary.

### What makes them good
- A strong idea per template: one clear move (a giant cropped numeral, a grid that runs the page, a stamp, a diagonal band, a type stack,
  a pattern field, a cut out shape). Then supporting detail: small info blocks, rules, numbers, labels, edition marks, dates.
- Real typographic craft: tight negative tracking on big type, generous tracking on small caps labels, proper hierarchy (3 to 5 sizes),
  aligned edges, consistent margins, baseline relationships between columns.
- Texture and print feel where the vibe wants it (paper, riso grain, photocopy toner, halftone) using the texture library with blend modes.
- Colour palettes taken from the references, 2 to 4 colours, with intention. Not the same cobalt, tomato and lemon everywhere.
- Fonts: the editor has 1,300+ Google Fonts. Pick characterful ones that fit the vibe (check names and weights in
  `src/fonts/google-fonts.json`: entries are [family, category, [weights], italic]). Two families per template at most, usually.
- The pins are for vibe, not for copying. Study why a reference works (proportion, palette, the move) and make your own design.
  Never trace a pin's layout one to one or reuse its text or brand.

## Formats

Use `format:` in tpl(): post (1080x1350), square, story (1080x1920), poster (A3, 1123x1587), flyer (A5, 559x794), a4, slide (1920x1080),
pin (1000x1500), thumb (YouTube 1280x720), card (business card 1004x650), postcard, invite, banner (email header 1200x400),
cover (Facebook 1640x624), og (1200x630). Mix formats inside your vibes: roughly 40 percent social (post, square, story), 30 percent
print (poster, flyer, invite, card, menu as a4), 20 percent slides or multi page sets (a carousel of 3 to 5 posts, a deck of 3 to 6
slides, a menu with two pages), 10 percent other (thumb, banner, cover).
Multi page templates count once but are worth it: pages should share a system and vary layouts.

## The kit (`templates/kit.mjs`)

```js
import { tpl, page, T, S, rect, circle, path, L, img, frame, overlay, svg, qr, solid, linear, radial, pattern, imageFill, stroke } from '../kit.mjs';
export default [
  tpl({ id: 'riso-garden-party', name: 'Garden party flyer', format: 'flyer', category: 'Event', tags: ['party', 'garden'], pages: [
    page('#F3EEE4', [ /* elements, bottom to top */ ]),
  ]}),
];
```
- `T(text, x, y, w, { font, size, weight, lh, ls, upper, color, align, rotation, opacity, effect, curve, runs, blend })`:
  ls is letter spacing in 1/1000 em (-40 tight display, 80 to 200 for small caps labels). `runs: [{start, end, fontWeight, color, italic}]`
  styles part of a text. effect: `{kind: 'hollow'|'outline'|'shadow'|'lift'|'echo'|'splice'|'highlight'|'glitch'|'neon', color, amount, offset, direction}`.
  `curve` -100..100 bends text on an arc.
- `S(kind, x, y, w, h, fill, {stroke, radius, rotation, opacity, blend, blur, shadow})`, kinds: rect ellipse triangle diamond pentagon
  hexagon octagon star star4 burst heart arrow chevron cross speech arch pill blob flower squircle halfcircle ticket cloud.
  `rect()` and `circle()` are shortcuts. `path(d, x, y, w, h, fill, {w0, h0, stroke})` draws any SVG path (drawn in a w0 x h0 box).
- `L(x1, y1, x2, y2, color, width, {dash: 'dash'|'dot', start, end})` caps: arrow triangle circle square bar diamond.
- `img('photos/coffee.jpg', x, y, w, h, { mask, radius, border, filters: { duotone: ['#111', '#F2E'], grain: 30, contrast: 20, saturation: -100 } })`
  crop is computed for you (cover). `frame(x, y, w, h)` is an empty photo slot. `overlay('tex/photocopy-toner.jpg', W, H, 'multiply', 0.8)`
  lays a texture over the whole page (put it last so it sits on top, or before the type if type should stay clean).
- `svg('<svg viewBox="0 0 100 100">...</svg>', x, y, w, h)` for hand built vector illustration, ornaments, icons, stamps, arrows,
  squiggles, stars. Use flat fills and strokes; keep the markup small.
- Fills for backgrounds and shapes: `solid('#hex')`, `linear(angle, '#a', '#b')`, `radial('#a', '#b')`,
  `pattern(kind, color, background, scale)` kinds dots grid stripes diagonal checker waves crosses pixels, `imageFill('tex/paper-fibre.jpg')`.
- Any element accepts `blend` (css mix-blend-mode: multiply, screen, overlay, difference...), `opacity`, `rotation`, `blur` (px), `shadow`.
- `qr(value, x, y, size, color, background)` makes a real QR code.

## Library images

All under `apps/editor/public/library/`, referenced without the prefix (`'photos/bread.jpg'`):
- `photos/`: archipelago bread city coffee concert desk dog flowers food forest friends man ocean plant portrait runner skater sneaker
  studio sushi (all .jpg), plus new ones landing as you work: portrait-window portrait-man-sun hands-clay coffee-pour market-produce
  dinner-table crowd-gig runner-track mountain-lake city-tram flowers-studio sneaker-concrete. `ls` the folder to see what exists.
- `tex/`: paper-fibre newsprint photocopy-toner halftone-dots folded-paper crumpled-paper film-grain risograph-speckle liquid-chrome
  holo-foil gold-foil marble-cream linen-canvas watercolor-paper brush-strokes cardboard (.jpg; `ls` to confirm which exist).
- `backgrounds/`: dark-grain mesh-blue mesh-mint mesh-pink mesh-sunset paper-cream paper-kraft riso-grain.
- `art/`: illustrations made for templates (see below).

Prefer typography, shapes, vector svg and textures; use a photo when the design needs one. Owner's rule: commissioned images are for **design elements** (illustrations, ornaments, stamps, hand lettering art, cut paper shapes, textures, patterns, mascots, graphic pieces), **not realistic photos**; use the photos already in the library for photo needs. You may commission at most **two**
illustrations or photos per session with Codex image generation, only when a template truly needs it:
`node scripts/art.mjs <name> <square|portrait|landscape> "<very detailed brief>"` (takes a few minutes; ask for a plain white or flat
colour ground so it can sit on the page with blend multiply). Name them for what they show.

## Workflow

1. Read your brief file and look at the reference pins it lists (contact sheets, then the best ones full size with Read).
   Write `templates/notes/<vibe>.md` for each of your vibes: 10 to 20 bullet points on what makes the vibe work (palettes with hex,
   type choices as Google Font names, layout moves, textures, what to avoid). Keep it practical; later builders reuse it.
2. Write templates in `templates/vibes/<vibe>.mjs` (one default export array per vibe). Ids are kebab case, unique across Tavla:
   prefix them with the vibe (`riso-...`). Names are short and plain ("Garden party flyer").
3. Build and look at every template:
   `node scripts/build-templates.mjs <vibe>` (fix every reported problem), then `node qa/tpl-shot.mjs <vibe> [id ...]`
   and Read the PNGs in `templates/shots/<vibe>/`. Shoot only the ids you changed, to keep the shared renderer free.
4. Review each shot honestly against the checklist below and fix. Expect two or three passes per template.
5. When a vibe is finished: `THUMBS=1 node qa/tpl-shot.mjs <vibe>` once, to make the gallery thumbnails.

### Review checklist (every template, every page)
- Would a good designer post this on their portfolio? Would Noah keep it on his Pinterest board? If not, redo it, don't polish it.
- One clear idea, readable hierarchy, nothing accidental: no text overflowing its box or the page, no collisions, no orphan words on
  their own line in headings, margins consistent, edges aligned.
- Text boxes: width `w` is the wrapping width. Big display type needs a wide enough box or explicit `\n` line breaks.
  Heights are refitted by the editor, so stacked text must be positioned with real line heights in mind.
- Does it look like the vibe and not like the default Tavla look (flat loud colour + one grotesk)?
- Is it adaptable (swap words, colours, photo) and is the sample copy specific and good?
- None of the banned AI tells.

## Rules

- Only touch your own files: `templates/vibes/<your vibes>.mjs`, `templates/notes/<your vibes>.md`, your shots, and new files you add to
  `public/library/art/`. Never edit kit.mjs, the build scripts or the app; if something is missing or broken, say so in your final report.
- Rendering runs on the Mac mini (LaunchAgents app.tavla.tpldev and app.tavla.tplrender in ~/tavla-work there); `node qa/tpl-shot.mjs` syncs the editor over, renders there and copies the PNGs back, so nothing heavy runs on the MacBook. Don't start renderers or browsers locally.
- Don't use git.

## Image led templates (owner's direction, 31 October)

For some vibes, illustration, ornament, stripes and doodles drawn in code (svg paths, stacked shapes) look AI made and "vibe coded".
The owner flagged: seventies, mid-century, quiet-luxury, nordic-minimal, hand-drawn, collage-scrapbook, fine-stationery (and riso-zine
partly). In those vibes build templates **image led**:
- The artwork is commissioned with image generation in the real medium of the vibe: gouache, screen print, linocut, risograph, cut and
  torn paper, crayon and oil pastel, ink and brush, engraving, letterpress ornament, pressed flowers, wax seals, film photograms.
  `node scripts/art.mjs <name> <square|portrait|landscape> "<brief>"` for a full bleed artwork (ask for calm areas where type will sit,
  and NO text in the image), or add `transparent` as a fifth argument for a single element (a stamp, an ornament, a torn paper piece,
  a character, a flower) on a transparent background that you can place on any colour.
- Real, editable type on top in well chosen Google Fonts, plus only simple structural code: rules, a colour block, a frame, a grid.
  No code drawn illustrations, sunbursts, stripes, doodles or ornaments in these vibes.
- Briefs must be specific and long: medium, paper, ink colours as hex, grain, imperfection (misregistration, uneven ink, pencil under
  drawing, brush texture), composition, what to leave empty, and "no text, no letters".
- Copy: plain and human. Avoid lines that sound written by an AI (tidy aphorisms, "where X meets Y", "crafted", "curated", "elevate",
  "journey", "timeless", "a celebration of", triplets of adjectives). Write like a real cafe, band, couple or studio would.

### More tells the owner flagged (31 October)
- Coloured offset shadows and doubled type (text effects echo, splice, shadow, lift, glitch, neon used as decoration). A real print has one
  ink per letter; misregistration, when used, is 2 to 4 px and the same ink colour logic as the artwork, never a pink and cyan drop shadow.
- Flat rectangles or simple shapes standing in for illustration (buildings as coloured bars, suns as circles with rays, fans and
  sunbursts built from wedges). Commission the illustration instead.
- Near empty layouts with widely tracked caps in the middle of a dark page (the "luxury card" cliché).

## The AI tell checklist (research, 31 October)

Designers spot generated work by these signs. Check every template against all of them before calling it done.

Layout and type
- Type that feels pasted on top of the picture: no relationship between type and image (no overlap, no tucking behind a subject,
  no shared edge, no scale play). Make type and image interact.
- More than two typefaces, or a "bold serif + clean sans + script" mix.
- No white space: every element present and small. Pick one hero, cut the rest, let space work.
- Competing focal points; everything centred and evenly spaced; symmetric by default. Prefer a deliberate grid and asymmetry.
- Filler decoration: sparkles, stars, floating dots, confetti, random geometric shapes, gradient orbs, divider ornaments,
  brushstroke banners, circular icon badges.
- Over smooth finish: perfect gradients, glow, drop shadows, glossy highlights.
- Generic slogans and tidy aphorisms.

Commissioned images
- Uniform line weight, plastic or airbrushed shading, soft "storybook" gloss, everything perfectly symmetrical, melted or merging details,
  inconsistent light, impossible objects, gibberish letters. Brief against them explicitly: name a real print process or medium, a limited
  ink palette, visible imperfection (misregistration, dry brush, pencil under drawing, paper tooth), and crop the art boldly in the layout.

What makes it read as human
- Bold cropping, intentional asymmetry, a visible grid, one strong idea, type set with care (tracking, hierarchy, rag), specific local
  details in the copy (a street, a time, a price), and slight, believable imperfection.
