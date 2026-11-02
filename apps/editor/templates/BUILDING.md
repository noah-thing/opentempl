# Building templates

The template library is written as code. Each style (a "vibe") has one source file in `templates/vibes/`, built from the helpers in `templates/kit.mjs`. `scripts/build-templates.mjs` checks every template and writes the packs the editor loads.

## What a good template is

Templates should look like posters and posts a designer would be proud of, and each one has to be adaptable: someone can swap the words, colours and photo and use it for a farm shop, a gig, a café or a book club. Specific sample copy is good because it makes the design feel real, but the layout must not depend on one company or person.

Avoid:

- a quote in a default font on a flat colour and nothing else;
- layouts whose whole point is a photo or a 3D render;
- sticker sheets, icon grids and type specimens;
- collage without hierarchy, random pixel noise, a logo alone.

Text only designs are fine when the typography is the design: scale contrast, a grid, cropping, rotation, stacking.

House rules for the sample copy and the look:

- No em dashes, no hyphenated compound words (write "hand made" as two words), no exclamation marks, no marketing filler.
- No serif italic accent word in a heading, and no single word picked out in another colour.
- No floating 3D type, glossy text gradients or glow for its own sake.
- No decorative shadow doubles or fake interface chrome.
- Keep to two typefaces at most, usually one or two.

What tends to work:

- One strong move per template (a giant cropped numeral, a grid that runs the page, a stamp, a diagonal band, a type stack, a pattern field), then supporting detail: small info blocks, rules, numbers, labels, dates.
- Real typographic craft: tight tracking on big type, open tracking on small caps labels, three to five sizes, aligned edges, consistent margins.
- Texture where the style wants it (paper, riso grain, toner, halftone), using the texture library with blend modes.
- A palette of two to four colours chosen on purpose.
- Fonts from the 1,300 Google Fonts bundled in the editor. Names and weights are in `apps/editor/src/fonts/google-fonts.json` as `[family, category, [weights], italic]`.

Per style notes (palette, type, moves, what to avoid) are in `notes/<vibe>.md`.

## Workflow

1. Read `notes/<vibe>.md` if the style exists, or write one for a new style.
2. Add templates to `templates/vibes/<vibe>.mjs`, one default export array per file. Multi page decks live in `<vibe>.decks.mjs`. Ids are kebab case and unique, prefixed with the vibe (`riso-garden-party`). Names are short and plain.
3. Check them: `node scripts/build-templates.mjs <vibe>` reports every problem.
4. Look at them: start the template renderer with `node qa/tpl-render-server.mjs`, then `node qa/tpl-shot.mjs <vibe> [id ...]` writes PNGs to `templates/shots/<vibe>/` (git ignored). Look at every page.
5. When a style is finished, `THUMBS=1 node qa/tpl-shot.mjs <vibe>` makes the gallery thumbnails in `public/templates/thumbs/`.

### Review checklist

- One clear idea and a readable hierarchy.
- No text overflowing its box or the page, no collisions, no lone words on the last line of a heading.
- Margins are consistent and edges align.
- It looks like its style and not like the default OpenTempl look.
- Words, colours and photos can be swapped without breaking it.

Text boxes: `w` is the wrapping width. Big display type needs a wide enough box or explicit `\n` breaks. The editor refits heights, so position stacked text with real line heights in mind.

## Formats

Pass `format:` to `tpl()`:

| Format | Size |
| --- | --- |
| post | 1080 x 1350 |
| square | 1080 x 1080 |
| story | 1080 x 1920 |
| poster | A3, 1123 x 1587 |
| flyer | A5, 559 x 794 |
| a4 | 794 x 1123 |
| slide | 1920 x 1080 |
| pin | 1000 x 1500 |
| thumb | YouTube, 1280 x 720 |
| card | business card, 1004 x 650 |
| postcard, invite | print sizes |
| banner | email header, 1200 x 400 |
| cover | Facebook, 1640 x 624 |
| og | 1200 x 630 |

A multi page template counts once but is worth it: share a system across the pages and vary the layouts.

## The kit

```js
import { tpl, page, T, S, rect, circle, path, L, img, frame, overlay, svg, qr, solid, linear, radial, pattern, imageFill, stroke } from '../kit.mjs';

export default [
  tpl({ id: 'riso-garden-party', name: 'Garden party flyer', format: 'flyer', category: 'Event', tags: ['party', 'garden'], pages: [
    page('#F3EEE4', [ /* elements, bottom to top */ ]),
  ]}),
];
```

- `T(text, x, y, w, { font, size, weight, lh, ls, upper, color, align, rotation, opacity, effect, curve, runs, blend })`. `ls` is letter spacing in thousandths of an em (about -40 for tight display type, 80 to 200 for small caps labels). `runs: [{ start, end, fontWeight, color, italic }]` styles part of a text. `effect` is `{ kind: 'hollow' | 'outline' | 'shadow' | 'lift' | 'echo' | 'splice' | 'highlight' | 'glitch' | 'neon', color, amount, offset, direction }`. `curve` from -100 to 100 bends text on an arc.
- `S(kind, x, y, w, h, fill, { stroke, radius, rotation, opacity, blend, blur, shadow })`. Kinds: rect, ellipse, triangle, diamond, pentagon, hexagon, octagon, star, star4, burst, heart, arrow, chevron, cross, speech, arch, pill, blob, flower, squircle, halfcircle, ticket, cloud. `rect()` and `circle()` are shortcuts. `path(d, x, y, w, h, fill, { w0, h0, stroke })` draws any SVG path in a `w0 x h0` box.
- `L(x1, y1, x2, y2, color, width, { dash: 'dash' | 'dot', start, end })`. Caps: arrow, triangle, circle, square, bar, diamond.
- `img('photos/coffee.jpg', x, y, w, h, { mask, radius, border, filters })` places a picture, and the crop is worked out for you. `filters` takes `duotone`, `grain`, `contrast`, `saturation` and the rest. `frame(x, y, w, h)` is an empty photo slot. `overlay('tex/photocopy-toner.jpg', W, H, 'multiply', 0.8)` lays a texture over the whole page.
- `svg('<svg viewBox="0 0 100 100">...</svg>', x, y, w, h)` for ornaments, stamps and icons. Keep the markup small.
- Fills: `solid('#hex')`, `linear(angle, '#a', '#b')`, `radial('#a', '#b')`, `pattern(kind, color, background, scale)` (dots, grid, stripes, diagonal, checker, waves, crosses, pixels) and `imageFill('tex/paper-fibre.jpg')`.
- Every element takes `blend` (any CSS mix blend mode), `opacity`, `rotation`, `blur` and `shadow`.
- `qr(value, x, y, size, color, background)` makes a real QR code.

## Library images

Everything under `apps/editor/public/library/` is referenced without that prefix (`'photos/bread.jpg'`):

- `photos/`: pictures for the photo slots.
- `tex/`: paper, toner, halftone, foil, canvas and other textures.
- `backgrounds/`: mesh gradients, paper and grain backgrounds.
- `art/`: illustrations and ornaments made for templates.
- `stickers/`: the voxel objects and characters.

`ls` a folder to see what is there. Prefer typography, shapes, vector `svg` and textures, and reach for a photo only when the design needs one.

### Making new art

`scripts/art.mjs` makes one illustration or texture with the OpenAI image API (the key goes in `~/.config/tavla/openai.key`). Every call costs money, so write one good brief rather than several tries:

```sh
node scripts/art.mjs <name> <square|portrait|landscape> "<detailed brief>" [transparent]
```

Ask for a plain white or flat colour ground so the piece can sit on a page with `multiply`. Add `transparent` for a single element such as a stamp or an ornament. A good brief names the medium (gouache, linocut, risograph, cut paper), the ink colours as hex, the paper and grain, visible imperfection such as misregistration or dry brush, the composition, what to leave empty for type, and says there is no text in the picture.

For styles that lean on illustration (seventies, mid century, quiet luxury, Nordic minimal, hand drawn, scrapbook), prefer a commissioned image in the real medium, with real type on top and only simple structure in code, over illustration drawn from svg paths.
