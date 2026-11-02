// Pings IndexNow (Bing, Yandex, Seznam, Naver) with every URL in the sitemap. Run after each deploy: node seo/indexnow.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const key = fs.readFileSync(path.join(root, 'seo/indexnow-key.txt'), 'utf8').trim();
const urlList = [...fs.readFileSync(path.join(root, 'apps/editor/public/sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const r = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: 'opentempl.org', key, keyLocation: `https://opentempl.org/${key}.txt`, urlList }),
});
console.log(r.status, urlList.length, 'urls');
