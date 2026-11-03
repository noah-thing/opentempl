// What the server tells an assistant. INSTRUCTIONS goes out on connect; GUIDE is the
// handbook behind the design_guide tool. Written for a model that can see previews
// and will be judged by a person on how the result looks.

export const INSTRUCTIONS = `OpenTempl is a free, open source design editor (posters, social posts, slides, menus, cards, invitations). These tools let you design in it: start from one of 337 professional templates or a blank page, edit every element, see a rendered preview after each change, and hand the person a link that opens the finished design in the editor, where they can keep editing and export PNG, PDF, PowerPoint, SVG or GIF.

Work like a designer:
1. Read design_guide once per conversation before your first design. It has the edit reference and the rules that make designs look professional.
2. Find references: search_templates (and list_styles). Look at the previews. get_template shows any template's exact structure, which is the fastest way to learn how a polished layout is built.
3. Build: create_design from a template (then replace the text, photos and colours) or from a format for a design of your own. Send many edits per call.
4. Look at the preview that comes back. Critique it honestly against the checklist in design_guide (overflow, alignment, margins, hierarchy, contrast) and fix what is off with edit_design. Two or three rounds is normal.
5. Give the person the link. Mention they can change anything and export from the editor.

Never invent element ids: they come from get_template, create_design, edit_design and get_design.`;

export const GUIDE = `# OpenTempl design guide

## How a design is made
A design is a size (pixels, origin top left), one or more pages, and on each page a stack of elements drawn bottom to top. Every element has a box: x, y, w, h, plus rotation (degrees, around the box centre) and opacity (0 to 1).

create_design starts a design from:
- template: a template id from search_templates. Ids of its elements look like p1-e3 (page 1, element 3).
- format: a size id from list_formats (ig-post 1080×1350, story 1080×1920, slides 1920×1080, a3-poster 1123×1587, a4 794×1123 ...).
- width and height for any custom size.
Then it applies your edits in order. edit_design adds more edits later; undo_edits takes the last ones back. New elements get ids n1, n2 and so on; new pages p2, p3 and so on. Every result lists the ids.

## Edits
Each edit is an object with "op":
- set_text {id, text, fit?}  Replace the words in a text element. Use \\n for line breaks. fit: "shrink" (default for existing text: the font gets smaller if the words do not fit the box), "grow" (the box grows down), "none".
- style {id, props}  Change any property (lists below). Example: {"op":"style","id":"p1-e4","props":{"fontSize":120,"color":"#E8341C","letterSpacing":-30}}
- set_image {id, url | library, credit?, download?}  Put a photo in an image frame (it is cropped to fill), a shape (the photo fills the shape), or a page id (page background). Photos from search_photos: pass url, credit and download exactly as given. library: a path from list_library.
- add {page, element, below?}  Add an element on a page, on top unless below names an element to slide under. element = {"type": ..., props}. Types and their props are below.
- duplicate {id, dx?, dy?, props?}  Copy an element next to itself, optionally changing props. Good for repeated rows, cards and list items.
- remove {id}  Remove an element, or a whole page when id is a page id.
- recolor {from, to}  Swap one colour for another everywhere: text, shapes, lines, vector art, backgrounds, gradients, charts. The fastest way to put a template into a brand's colours.
- page {id, background?, name?, notes?, transition?, duration?, hidden?}  Page background (colour or fill), speaker notes, transition (none fade slide zoom flip circle).
- add_page {copy?, after?, background?, name?}  A blank page, or a copy of a page (the way to build slides that share a layout).
- move_page {id, to}  to is the 1 based position.
- arrange {id, to}  front, back, forward or backward within its page.
- title {title}  The design's name.

## Element types and props
All elements: x, y, w, h, rotation, opacity, hidden, flipX, flipY, link (https or mailto, clickable in PDF and Present), alt, name, blend (multiply, screen, overlay, soft-light, difference, ... any CSS blend mode), blur (layer blur px), shadow {x, y, blur, color} or null, anim {kind, delay ms, duration ms} where kind is fade rise drop pop wipe pan blur typewriter stomp tumble.

text: text, fontFamily (any Google Font, exact name from search_fonts), fontSize, fontWeight (100 to 900), italic, underline, strike, color, gradient (a fill for the letters, or null), align (left center right justify), lineHeight (multiple of size), letterSpacing (thousandths of an em: -40 tight display, 0 normal, 100 to 200 for small caps labels), uppercase, list (none bullet number), curve (-100 to 100 bends the line into an arc), effect {kind, color, amount, offset, direction} with kind none shadow lift hollow splice outline echo glitch neon highlight, role (heading subheading body), runs (styled ranges: [{start, end, fontWeight?, italic?, underline?, color?}] in character offsets, for one coloured or bold word), valign "middle" (grows from its centre, for labels in shapes). When adding text, w sets the measure and the height is worked out from the words.

shape: shape (rect ellipse triangle diamond pentagon hexagon octagon star star4 burst heart arrow chevron cross speech arch pill blob flower squircle halfcircle ticket cloud path), fill, stroke {color, width, dash solid|dash|dot} or null, radius (rounded corners). shape "path" takes path (SVG path data drawn in a w0 × h0 space, scaled to the box): any vector form you can describe.

line: from point to point: {"type":"line","x1":80,"y1":200,"x2":1000,"y2":200,"color":"#111","width":3}. Also dash, start and end caps (none arrow triangle circle square bar diamond), curve.

image: url or library, plus radius, mask (any shape kind: ellipse, arch, blob, star ...), border (a stroke), filters {brightness, contrast, saturation, temperature, tint (-100 to 100), blur, vignette, grain (0 to 100), preset (none warm cool mono noir fade vivid film vintage dream), duotone [dark colour, light colour] or null}. The photo is cropped to fill the box.

icon: {"type":"icon","icon":"ph:arrow-right-bold","color":"#111", x, y, w, h}  any of 200,000 icons; search_icons finds names. Use one icon set per design.

svg: your own vector art: svg (one <svg> with a viewBox; no scripts, styles or links) and colors (map of colour in the markup to new colour).

qr: value (a link or text), color, background, margin.
chart: kind (bar column line area pie donut progress), labels, series [{name, values, color}], fontFamily, textColor, gridColor, showLegend, showValues, showGrid, rounded.
table: cells (rows of text, first row is the header), fontFamily, fontSize, textColor, headerFill, headerColor, bodyFill, stripeFill (or null), lineColor, radius.
draw: freehand strokes: paths [{d, color, width, tool pen|marker|highlighter|glow}] in a w0 × h0 space.

Fills (page backgrounds, shape fills, text gradient): "#F4C20D", {"gradient": ["#FF5F6D", "#FFC371"], "angle": 135}, {"radial": ["#fff", "#c9d6ff"]}, {"pattern": "dots", "color": "#111", "background": "#F2F0EB", "scale": 1} (dots grid stripes diagonal checker waves crosses pixels).

## What makes a design look professional
Hierarchy. One thing is read first, a second thing second, everything else after. Make the first thing much bigger, not slightly bigger: a poster headline is often 8 to 15 times the size of the small text. Three levels of size are usually enough.

Type.
- Two families at most: one for display, one for text. Or one family in two weights. list_styles shows pairings each style already uses.
- Big type is set tight: lineHeight 0.85 to 1.05, letterSpacing -10 to -50. Body text breathes: lineHeight 1.35 to 1.55, letterSpacing 0.
- Small labels (dates, places, categories, page numbers) in caps with letterSpacing 80 to 200 at 14 to 22 px on a 1080 wide page look finished and editorial.
- Lines of body text 45 to 75 characters long. Break headlines by sense, not by accident ("Night / market" reads better than "Night mar / ket").
- Real words. Write copy that fits the brief: a real date, a real place, a price, a call to action. Never lorem ipsum.

Grid and space.
- Pick a margin and keep it: about 6 to 8 percent of the short side (65 to 90 px on 1080). Everything starts on the same left edge unless there is a reason.
- Divide the width into columns (4, 6 or 12) with equal gutters and put edges on them. Align tops and baselines across columns.
- Leave space empty on purpose. Crowding reads as cheap; one generous gap reads as confident.
- Things that touch the edge (a photo, a band of colour, a giant letter) should go past it a little, so the edge is clearly intended.

Colour.
- A background, an ink, and one accent is a whole palette. 60 percent background, 30 percent secondary, 10 percent accent. Use the accent once or twice, where the eye should go.
- Off whites (#F2F0EB, #EFE9DD) and off blacks (#111111, #1E1713) feel printed; pure #FFFFFF and #000000 feel default.
- Small text needs contrast: dark on light or light on dark, never mid grey on a photo.
- recolor moves a whole template into new colours in one edit.

Photos.
- A photo either fills a frame edge to edge or sits in a clean shape (rect with radius, arch, ellipse). Never stretched.
- Text over a photo needs help: a gradient shape from transparent to dark under the text (fill {"gradient": ["rgba(0,0,0,0)", "rgba(0,0,0,0.65)"], "angle": 180}), a solid band, or a calm part of the picture.
- Duotone in the brand colours or one filter preset across all photos makes mixed photos feel like one set.

Details that read as craft: a thin rule (line, width 1 to 3) to separate sections, numbers (01, 02, 03), a small index or issue label in a corner, consistent corner radii, a texture from the library at low opacity with blend multiply, one rotated sticker or stamp, page numbers on slides.

Slides. Build one or two layouts, then add_page with copy and replace the content, so titles sit in the same place on every slide. One idea per slide, big. Speaker notes in page notes. Slide numbers small in a corner.

Restraint. Effects (neon, glitch, echo, shadows) and many shapes are spices. One effect on one element. If a design feels busy, remove things.

## Checklist for every preview
Look at the preview image and fix before you hand it over:
1. Text: nothing cut off, overflowing its box, overlapping other text, or broken into a lonely last word. Shrunk text means the box was too small: shorten the words or widen the box.
2. Edges: margins equal on all sides, nothing accidentally close to the edge, nothing a few pixels off a shared edge.
3. Hierarchy: squint. Is the most important thing the first thing you see?
4. Contrast: every word readable at phone size.
5. Leftovers: empty image frames, template words that no longer fit the brief, placeholder dates.
6. Balance: the page does not feel heavier on one side by accident.

## Working well
- Send many edits in one call; each call returns a fresh preview.
- get_design shows the current element list. get_design with raw true returns exact JSON for a page, useful before precise adjustments.
- Templates are a library of solved layouts: get_template with raw true on a template you admire shows exactly how it is built (sizes, tracking, positions), then build your own in that spirit.
- If a photo cannot be loaded (the site does not share images), use search_photos or the library instead.
- The link opens the design in the browser with nothing to install. It is a copy for the person: what they change there stays on their computer.
`;
