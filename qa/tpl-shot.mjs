// Screenshots pack templates for review while building.
//   node qa/tpl-shot.mjs <vibe> [id ...]     -> apps/editor/templates/shots/<vibe>/<id>[-n].png
//   THUMBS=1 node qa/tpl-shot.mjs <vibe>     -> also public/templates/thumbs/<id>.jpg (first page, 480 px wide)
// Rendering happens on the Mac mini (dev server + qa/tpl-render-server.mjs run there as
// the LaunchAgents app.tavla.tpldev and app.tavla.tplrender), so the MacBook never runs
// headless Chrome. This script syncs the editor over, asks the mini to render, and copies
// the pictures back. TAVLA_RENDER=local uses a renderer on this machine instead.
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const [vibe, ...ids] = process.argv.slice(2);
if (!vibe) { console.log('usage: node qa/tpl-shot.mjs <vibe> [id ...]'); process.exit(1); }
const body = JSON.stringify({ vibe, ids, thumbs: !!process.env.THUMBS });

if (process.env.TAVLA_RENDER === 'local') {
  const res = await fetch('http://127.0.0.1:4422', { method: 'POST', body }).catch(() => null);
  if (!res) { console.log('The local template renderer is not running: node qa/tpl-render-server.mjs'); process.exit(1); }
  for (const line of await res.json()) console.log(line);
  process.exit(0);
}

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const editor = path.join(root, 'apps/editor');
const remote = 'mini:tavla-work/apps/editor';
const run = (cmd, args, input) => execFileSync(cmd, args, { input, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], maxBuffer: 64 << 20 });
try {
  // The renderer reads packs, library images and the app code from the mini's copy.
  run('rsync', ['-a', '--exclude', 'node_modules', '--exclude', 'templates/shots', '--exclude', 'public/templates/thumbs', `${editor}/`, `${remote}/`]);
  const out = run('ssh', ['mini', 'curl -s -X POST http://127.0.0.1:4422 --data-binary @-'], body);
  run('rsync', ['-a', `${remote}/templates/shots/${vibe}/`, `${editor}/templates/shots/${vibe}/`]);
  if (process.env.THUMBS) run('rsync', ['-a', `${remote}/public/templates/thumbs/`, `${editor}/public/templates/thumbs/`]);
  for (const line of JSON.parse(out)) console.log(line.replace('/Users/iriskalith/tavla-work', root));
} catch (e) {
  console.log(`Rendering on the mini failed: ${(e.stderr || e.message || '').toString().slice(0, 400)}`);
  process.exit(1);
}
