// Run by hand after a Look changes; commit the result. Builds the copy ready ChatGPT prompts for the /prompts gallery from the real composer.
// Usage: node --experimental-strip-types make-prompts.mjs   (Node 22.6+)
// Reads apps/editor/public/looks/looks.json and apps/editor/src/generate/{prompt,looks}.ts,
// writes prompts.json next to this file. Nothing is edited in apps/.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..');
const src = path.join(repo, 'apps/editor/src/generate');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'opentempl-prompts-'));
fs.writeFileSync(path.join(tmp, 'prompt.ts'), fs.readFileSync(path.join(src, 'prompt.ts'), 'utf8').replace("from './looks'", "from './looks.ts'"));
fs.writeFileSync(path.join(tmp, 'looks.ts'), fs.readFileSync(path.join(src, 'looks.ts'), 'utf8').replace('import.meta.env.BASE_URL', "'/'"));
const { composePrompt, emptyBrief } = await import(pathToFileURL(path.join(tmp, 'prompt.ts')).href);
const looks = JSON.parse(fs.readFileSync(path.join(repo, 'apps/editor/public/looks/looks.json'), 'utf8'));

// Common uses. The words are example copy; the page tells people to swap them.
const USES = [
  { key: 'gig-poster', label: 'Gig poster', format: 'poster',
    subject: 'a live music night with three bands at a small venue',
    headline: 'Three Bands, One Night', subline: 'Doors 20:00, entry 100 kr', details: 'Fri 14 Nov, Kolingsborg, Stockholm' },
  { key: 'instagram-post', label: 'Instagram post', format: 'post',
    subject: 'an announcement post for a new product launch from a small shop',
    headline: 'Now In Store', subline: 'The autumn collection is here', details: 'Open daily 10 to 18' },
  { key: 'menu', label: 'Menu', format: 'poster',
    subject: 'a one page menu for a neighbourhood cafe',
    headline: 'Cafe Menu', subline: 'Coffee, pastries and lunch', details: 'Filter coffee 35 kr, Cinnamon bun 40 kr, Soup of the day 120 kr' },
];

const out = {};
for (const l of looks) {
  const chatgpt = (brief) => composePrompt(l, { ...brief, textMode: 'baked', useLookSample: false }, { forChatGPT: true });
  const main = chatgpt(emptyBrief(l));
  const variations = [];
  for (const u of USES) {
    const format = l.formats.includes(u.format) ? u.format : l.formats[0];
    const b = { ...emptyBrief(l), format, subject: u.subject, headline: u.headline, subline: u.subline, details: u.details };
    variations.push({ key: u.key, label: u.label, format, prompt: chatgpt(b) });
  }
  out[l.id] = { name: l.name, subject: l.example.subject, prompt: main, variations };
}
fs.writeFileSync(path.join(here, 'prompts.json'), JSON.stringify(out, null, 1));
console.log('looks', Object.keys(out).length);
