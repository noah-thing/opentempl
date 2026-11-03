// What the server tells an assistant. INSTRUCTIONS goes out on connect; the guide
// sections are the handbook behind the design_guide tool. Written for a model that
// can see previews and will be judged by a person on how the result looks.

export const INSTRUCTIONS = `OpenTempl is a free, open source design editor (posters, social posts, slides, menus, cards, invitations). These tools let you design in it: start from one of 337 professional templates or a blank page, edit every element, see a rendered preview after each change, and hand the person a link that opens the finished design in the editor, where they can keep editing and export PNG, PDF, PowerPoint, SVG or GIF.

Work like a designer:
1. Read design_guide once per conversation before your first design (all of it; if your client cuts long results, read it by section: craft, edits, elements).
2. Find references: search_templates (and list_styles). Look at the previews. get_template shows any template's exact structure, the fastest way to learn how a polished layout is built.
3. Build: create_design from a template (then replace the words, photos and colours) or from a format for a design of your own. Send many edits per call.
4. Look at the preview that comes back. Critique it honestly against the checklist in design_guide and fix what is off with edit_design. Use preview_design with zoom to check small type. Two or three rounds is normal.
5. Give the person the link. Mention they can change anything and export from the editor.

Never invent element ids: they come from get_template, create_design, edit_design and get_design.`;

const INTRO = `# OpenTempl design guide

A design is a size (pixels, origin top left), one or more pages, and on each page a stack of elements drawn bottom to top. Every element has a box: x, y, w, h, plus rotation (degrees, around the box centre) and opacity (0 to 1).

create_design starts from a template id (its elements are named p1-e3: page 1, element 3), a format id from list_formats (ig-post 1080×1350, story 1080×1920, slides 1920×1080, a3-poster 1123×1587, a4 794×1123 ...), or a width and height. edit_design adds more edits; undo_edits takes the last ones back. New elements are named n1, n2 ...; new pages p2, p3 .... Every result lists the ids.
`;

const CRAFT = `## What makes a design look professional

Hierarchy. One thing is read first, a second thing second, everything else after. Make the first thing much bigger, not slightly bigger: a poster headline is often 8 to 15 times the size of the small text. Three levels of size are usually enough.

Type.
- Two families at most: one for display, one for text. Or one family in two weights. list_styles shows pairings each style already uses.
- Big type is set tight: lineHeight 0.85 to 1.05, letterSpacing -10 to -50. Body text breathes: lineHeight 1.35 to 1.55, letterSpacing 0.
- Tight tracking also narrows spaces: "1 400" can read as "1400". Use less negative letterSpacing on numbers, or a no break space.
- Small labels (dates, places, categories, page numbers) in caps with letterSpacing 80 to 200 at 14 to 22 px on a 1080 wide page look finished and editorial.
- Lines of body text 45 to 75 characters long. Break headlines by sense, not by accident ("Night / market" reads better than "Night mar / ket").
- Real words. Write copy that fits the brief: a real date, a real place, a price, a call to action. Never lorem ipsum. Invented facts (numbers, names) should be ones the person can easily replace, and say so.

Grid and space.
- Pick a margin and keep it: about 6 to 8 percent of the short side (65 to 90 px on 1080). Everything starts on the same left edge unless there is a reason.
- Divide the width into columns (4, 6 or 12) with equal gutters and put edges on them. Align tops and baselines across columns. align and distribute do this exactly.
- Leave space empty on purpose. Crowding reads as cheap; one generous gap reads as confident.
- Things that touch the edge (a photo, a band of colour, a giant letter) should go past it a little, so the edge is clearly intended.

Colour.
- A background, an ink, and one accent is a whole palette. 60 percent background, 30 percent secondary, 10 percent accent. Use the accent once or twice, where the eye should go.
- Off whites (#F2F0EB, #EFE9DD) and off blacks (#111111, #1E1713) feel printed; pure #FFFFFF and #000000 feel default.
- Small text needs contrast: dark on light or light on dark, never mid grey on a photo.
- recolor with a map moves a whole template into new colours in one edit.

Photos.
- A photo either fills a frame edge to edge or sits in a clean shape (rect with radius, arch, ellipse). Never stretched.
- Pick photos for the feeling of the brief, not only the subject: a jazz night wants a room, light and people, not only an instrument.
- Text over a photo needs help: a gradient shape from transparent to dark under the text (fill {"gradient": ["rgba(0,0,0,0)", "rgba(0,0,0,0.65)"], "angle": 180}), a solid band, or a calm part of the picture.
- Duotone in the brand colours, or one filter preset on every photo, makes mixed photos feel like one set.
- Texture from the library: on light pages blend multiply at 0.2 to 0.5 opacity; on dark pages blend overlay or soft-light at 0.1 to 0.3 (screen greys the blacks).

Details that read as craft: a thin rule (line, width 1 to 3) to separate sections, numbers (01, 02, 03), a small index or issue label in a corner, consistent corner radii, one rotated sticker or stamp, page numbers on slides.

Slides. Build one or two layouts, then add_page with copy and replace the content, so titles sit in the same place on every slide. One idea per slide, big. Speaker notes in page notes. Slide numbers small in a corner.

Restraint. Effects (neon, glitch, echo, shadows) and many shapes are spices. One effect on one element. If a design feels busy, remove things.

## Checklist for every preview
Look at the preview and fix before you hand it over:
1. Text: nothing cut off, overflowing, overlapping other text, or broken into a lonely last word. If the result says text was set smaller to fit, decide whether that is right.
2. Edges: margins equal, nothing accidentally close to the edge, nothing a few pixels off a shared edge.
3. Hierarchy: squint. Is the most important thing the first thing you see?
4. Contrast: every word readable at phone size. Zoom (preview_design with zoom) into small type to be sure.
5. Leftovers: the result lists template words you have not changed; replace them, remove them or keep them on purpose. Also empty image frames and page notes.
6. Balance: the page does not feel heavier on one side by accident, and no area is empty by accident.
`;

const EDITS = `## Edits
Each edit is an object with "op". All edits in a call are checked first: if one is wrong, none are applied, and the error names it.

- set_text {id, text, fit?}  Replace the words in a text element. Use \\n for line breaks. fit: "shrink" (default: the type gets smaller if the new words need more room than the old ones had; the result tells you when that happened), "grow" (the box grows down to fit), "none".
- style {id or ids, props}  Change properties (see Elements). Setting fontSize sets exactly that size and lets the box grow to fit. Example: {"op":"style","id":"p1-e4","props":{"fontSize":120,"color":"#E8341C","letterSpacing":-30}}
- set_image {id, photo + credit | url | library}  Put a photo in an image frame (cropped to fill), a shape (the photo fills the shape), or a page id (page background). Photos from search_photos: pass photo and credit exactly as given. library: a path from list_library.
- add {page, element, below?}  Add an element on a page, on top unless below names an element to slide under. element = {"type": ..., props}.
- duplicate {id, dx?, dy?, props?}  Copy an element next to itself, optionally changing props. Good for rows, cards and list items.
- remove {id or ids}  Remove elements, or whole pages when given page ids.
- recolor {from, to} or {map: {from: to, ...}}  Swap colours everywhere: text, shapes, lines, vector art, backgrounds, gradients, charts. Swaps in one map happen together, so two colours can trade places.
- align {ids, to, relative?}  to: left center right top middle bottom. relative: "page", "selection" (the ids together) or an element id. Default: page for one id, selection for several. Centre a label on a shape: {"op":"align","ids":["n7"],"to":"center","relative":"n6"} then the same with "middle". Text heights are measured with the real fonts, so this centres exactly.
- distribute {ids, axis, gap?}  Space elements evenly along "horizontal" or "vertical", between the first and last, or with an exact gap.
- page {id, background?, name?, notes?, transition?, duration?, hidden?}  Page background (colour or fill), speaker notes, transition (none fade slide zoom flip circle).
- add_page {copy?, after?, background?, name?}  A blank page, or a copy of a page (the way to build slides that share a layout).
- move_page {id, to}  to is the 1 based position.
- arrange {id, to}  front, back, forward or backward within its page.
- title {title}  The design's name.

Where an edit takes ids, a run like "p1-e10..p1-e40" names every element numbered in between.
`;

const ELEMENTS = `## Element types and props
All elements: x, y, w, h, rotation, opacity, hidden, flipX, flipY, link (https or mailto, clickable in PDF and Present), alt, name, blend (multiply, screen, overlay, soft-light, difference, ... any CSS blend mode), blur (layer blur px), shadow {x, y, blur, color} or null, anim {kind, delay ms, duration ms} where kind is fade rise drop pop wipe pan blur typewriter stomp tumble.

text: text, fontFamily (any Google Font, exact name from search_fonts), fontSize, fontWeight (100 to 900), italic, underline, strike, color, gradient (a fill for the letters, or null), align (left center right justify: horizontal only), lineHeight (multiple of size), letterSpacing (thousandths of an em), uppercase, list (none bullet number), curve (-100 to 100 bends the line into an arc), effect {kind, color, amount, offset, direction} with kind none shadow lift hollow splice outline echo glitch neon highlight, role (heading subheading body), runs (styled ranges: [{start, end, fontWeight?, italic?, underline?, color?}] in character offsets, for one coloured or bold word), valign "middle" (when the text grows it grows up and down from its centre instead of down; it does not centre text inside a taller box: use align for that). Text starts at the top of its box; w sets the measure and the height follows the words.

shape: shape (rect ellipse triangle diamond pentagon hexagon octagon star star4 burst heart arrow chevron cross speech arch pill blob flower squircle halfcircle ticket cloud path; a circle is an ellipse with w = h), fill, stroke {color, width, dash solid|dash|dot} or null, radius (rounded corners). shape "path" takes path (SVG path data drawn in a w0 × h0 space, scaled to the box): any vector form you can describe.

line: from point to point, both when adding and when styling: {"type":"line","x1":80,"y1":200,"x2":1000,"y2":200,"color":"#111","width":3}. Also dash, start and end caps (none arrow triangle circle square bar diamond), curve.

image: photo + credit, url or library, plus radius, mask (any shape kind: ellipse, arch, blob, star ...), border (a stroke), filters {brightness, contrast, saturation, temperature, tint (-100 to 100), blur, vignette, grain (0 to 100), preset (none warm cool mono noir fade vivid film vintage dream), duotone [dark colour, light colour] or null}. The photo is cropped to fill the box.

icon: {"type":"icon","icon":"ph:arrow-right-bold","color":"#111", x, y, w, h}  any of 200,000 icons; search_icons finds names. Use one icon set per design.

svg: your own vector art: svg (one <svg> with a viewBox; no scripts, styles or links) and colors (map of colour in the markup to new colour).

qr: value (a link or text), color, background, margin.
chart: kind (bar column line area pie donut progress), labels, series [{name, values, color}], fontFamily, textColor, gridColor, showLegend, showValues, showGrid, rounded. Some templates draw charts as fixed shapes; replace those with a real chart when the numbers change.
table: cells (rows of text, first row is the header), fontFamily, fontSize, textColor, headerFill, headerColor, bodyFill, stripeFill (or null), lineColor, radius.
draw: freehand strokes: paths [{d, color, width, tool pen|marker|highlighter|glow}] in a w0 × h0 space.

Fills (page backgrounds, shape fills, text gradient): "#F4C20D", {"gradient": ["#FF5F6D", "#FFC371"], "angle": 135}, {"radial": ["#fff", "#c9d6ff"]}, {"pattern": "dots", "color": "#111", "background": "#F2F0EB", "scale": 1} (dots grid stripes diagonal checker waves crosses pixels).

## Working well
- Send many edits in one call; each call returns a fresh preview of the pages it touched (preview_pages chooses others, or "all").
- get_design shows the current element list; with raw true, exact JSON for a page.
- Templates are a library of solved layouts: get_template (with page for long decks, raw true for exact JSON) shows how one is built. Runs of identical pieces are folded into one line; remove them with a run like "p1-e10..p1-e129".
- If a photo cannot be loaded (the site does not share images), use search_photos or the library instead.
- The link opens the design in the browser with nothing to install. It is a copy for the person: what they change there stays on their computer.
`;

export function guideSection(section: 'all' | 'craft' | 'edits' | 'elements'): string {
  if (section === 'craft') return INTRO + '\n' + CRAFT;
  if (section === 'edits') return EDITS;
  if (section === 'elements') return ELEMENTS;
  return [INTRO, CRAFT, EDITS, ELEMENTS].join('\n');
}
