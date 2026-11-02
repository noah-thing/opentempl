// Screenshots templates for review while building.
//   node qa/tpl-shot.mjs <vibe> [id ...]     -> apps/editor/templates/shots/<vibe>/<id>[-n].png
//   THUMBS=1 node qa/tpl-shot.mjs <vibe>     -> also public/templates/thumbs/<id>.jpg (first page, 480 px wide)
// Needs the renderer running: node qa/tpl-render-server.mjs (and the editor dev server).
const [vibe, ...ids] = process.argv.slice(2);
if (!vibe) { console.log('usage: node qa/tpl-shot.mjs <vibe> [id ...]'); process.exit(1); }

const body = JSON.stringify({ vibe, ids, thumbs: !!process.env.THUMBS });
const res = await fetch('http://127.0.0.1:4422', { method: 'POST', body }).catch(() => null);
if (!res) { console.log('The template renderer is not running: node qa/tpl-render-server.mjs'); process.exit(1); }
for (const line of await res.json()) console.log(line);
