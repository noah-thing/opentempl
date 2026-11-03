// Builds the static pages for opentempl.org into apps/editor/public/, so Vite ships them next to the editor.
// Run: node seo/build.mjs   (the Vercel build command runs it before `vite build`).
// Sources: seo/content/*.md (guides), seo/vibes.mjs (template hub text), apps/editor/public/{templates,looks}
// JSON (counts, names, prompts), seo/prompts.json (made by seo/make-prompts.mjs from the real prompt composer).
// One source for visible text, JSON-LD, llms-full.txt and the sitemap, so they cannot drift apart.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { VIBE_TEXT, VIBE_TASKS } from './vibes.mjs';
import { LOOK_QUERY } from './queries.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(root, 'apps/editor/public');
const BASE = 'https://opentempl.org';
const UPDATED = '2026-11-02';
const X_URL = 'https://x.com/fsconfig';

const linksTs = fs.readFileSync(path.join(root, 'apps/editor/src/links.ts'), 'utf8');
const REPO_URL = linksTs.match(/REPO_URL = '([^']+)'/)[1];
const REPO_PUBLIC = /REPO_PUBLIC = true/.test(linksTs);
// Flip when the v0.1.0 release is public and the download links resolve.
const RELEASE_PUBLISHED = true;
const VERSION = JSON.parse(fs.readFileSync(path.join(root, 'apps/desktop/package.json'), 'utf8')).version;
const dl = (file) => `https://github.com/noah-thing/opentempl/releases/download/v${VERSION}/OpenTempl-${VERSION}-${file}`;

const index = JSON.parse(fs.readFileSync(path.join(pub, 'templates/index.json'), 'utf8'));
const looks = JSON.parse(fs.readFileSync(path.join(pub, 'looks/looks.json'), 'utf8'));
const prompts = JSON.parse(fs.readFileSync(path.join(root, 'seo/prompts.json'), 'utf8'));
const thumbs = JSON.parse(fs.readFileSync(path.join(root, 'seo/template-thumbs.json'), 'utf8'));
const vibeMeta = index.vibes;
const vibeIds = Object.keys(vibeMeta).sort((a, b) => vibeMeta[a].order - vibeMeta[b].order);
const hasSample = (id) => fs.existsSync(path.join(pub, 'seo/img/looks', `${id}-900.webp`));
const promptLooks = looks.filter((l) => hasSample(l.id));

const VARS = {
  templates: String(index.templates.length),
  vibes: String(vibeIds.length),
  looks: String(looks.length),
  fonts: '1,344',
  updated: 'November 2026',
};
VARS.licence_line = REPO_PUBLIC ? `MIT licensed. [Source code on GitHub](${REPO_URL}).` : 'MIT licensed. The source repository is private today and opens at launch.';
VARS.runit = REPO_PUBLIC
  ? '```\ngit clone ' + REPO_URL + '\ncd opentempl\nnpm install\nnpm run dev\n```\n\nThe editor opens on a local address. `npm run build` writes the static site, and the `apps/desktop` folder packages it as an Electron app.'
  : 'Build instructions ship with the repository on the day it opens. Until then, the web version at opentempl.org runs from static files with nothing to install.';
VARS.issues = REPO_PUBLIC ? `Open an issue or send a fix at [the repository](${REPO_URL}).` : 'Until the repository opens, send feedback to Noah on [X](' + X_URL + ').';
const subst = (s) => s.replace(/\{\{(\w+)\}\}/g, (_, k) => VARS[k] ?? `{{${k}}}`);

const ENTITY = `OpenTempl is a free, open source (MIT) design app for posters, social media posts and slides, with ${VARS.templates} templates, that works offline and needs no account.`;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const plain = (s) => s.replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1').replace(/[*`]/g, '');
const words = (s) => s.trim().split(/\s+/).length;

const errors = [];
const fail = (m) => errors.push(m);

/* ---------- markdown (the small subset the content uses) ---------- */
function inline(t) {
  t = esc(t);
  t = t.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" loading="lazy" decoding="async">');
  t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, a, h) => `<a href="${h}"${/^https?:/.test(h) ? ' rel="noopener"' : ''}>${a}</a>`);
  return t;
}
function md(src) {
  const lines = src.split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) { i++; continue; }
    if (l.startsWith('```')) {
      const buf = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) buf.push(lines[i++]);
      i++;
      out.push(`<pre><code>${esc(buf.join('\n'))}</code></pre>`);
      continue;
    }
    let m;
    if ((m = l.match(/^(#{2,3}) (.*)$/))) {
      const lvl = m[1].length;
      out.push(`<h${lvl}${lvl === 2 ? ` id="${slugify(m[2])}"` : ''}>${inline(m[2])}</h${lvl}>`);
      i++;
      continue;
    }
    if (l.startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith('|')) rows.push(lines[i++]);
      const cells = (r) => r.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const head = cells(rows[0]);
      const body = rows.slice(2).map(cells);
      out.push(
        `<div class="tbl"><table><thead><tr>${head.map((h) => `<th>${inline(h)}</th>`).join('')}</tr></thead><tbody>${body
          .map((r) => `<tr>${r.map((c, j) => (j === 0 ? `<th scope="row">${inline(c)}</th>` : `<td>${inline(c)}</td>`)).join('')}</tr>`)
          .join('')}</tbody></table></div>`,
      );
      continue;
    }
    if (/^- /.test(l)) {
      const items = [];
      while (i < lines.length && /^- /.test(lines[i])) items.push(lines[i++].slice(2));
      out.push(`<ul>${items.map((x) => `<li>${inline(x)}</li>`).join('')}</ul>`);
      continue;
    }
    if (/^\d+\. /.test(l)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) items.push(lines[i++].replace(/^\d+\. /, ''));
      out.push(`<ol>${items.map((x) => `<li>${inline(x)}</li>`).join('')}</ol>`);
      continue;
    }
    if (l.startsWith('> ')) {
      const buf = [];
      while (i < lines.length && lines[i].startsWith('> ')) buf.push(lines[i++].slice(2));
      out.push(`<blockquote><p>${inline(buf.join(' '))}</p></blockquote>`);
      continue;
    }
    const buf = [];
    while (i < lines.length && lines[i].trim() && !/^(#{2,3} |\||- |\d+\. |```|> )/.test(lines[i])) buf.push(lines[i++]);
    out.push(`<p>${inline(buf.join(' '))}</p>`);
  }
  return out.join('\n');
}
const slugify = (s) => plain(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function front(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error('no front matter');
  const meta = {};
  for (const line of m[1].split('\n')) {
    const k = line.indexOf(':');
    meta[line.slice(0, k).trim()] = line.slice(k + 1).trim();
  }
  return { meta, body: m[2] };
}

/** Splits a "## FAQ" section off the body. Pairs are blocks: **Question**\nAnswer. */
function splitFaq(body) {
  const m = body.match(/\n## FAQ\n([\s\S]*?)(?=\n## |\n?$)/);
  if (!m) return { main: body, faq: [] };
  const faq = m[1]
    .trim()
    .split(/\n\s*\n/)
    .map((b) => {
      const [q, ...a] = b.trim().split('\n');
      return { q: q.replace(/^\*\*|\*\*$/g, ''), a: a.join(' ').trim() };
    })
    .filter((x) => x.q && x.a);
  return { main: body.replace(m[0], ''), faq };
}

/* ---------- page chrome ---------- */
const NAV = [
  ['/templates', 'Templates'],
  ['/prompts', 'Prompts'],
  ['/canva-alternative', 'Canva alternative'],
  ['/download', 'Desktop app'],
];
const FOOT = [
  ['Make', [['/free-poster-maker', 'Poster maker'], ['/free-instagram-post-maker', 'Instagram posts'], ['/free-presentation-maker', 'Presentations'], ['/free-menu-maker', 'Menus'], ['/templates', 'All templates']]],
  ['Compare', [['/canva-alternative', 'Canva alternative'], ['/open-source-canva', 'Open source Canva'], ['/canva-alternative-offline', 'Offline'], ['/canva-alternative-no-account', 'No account'], ['/canva-pro-free', 'Canva Pro features'], ['/canva-vs-opentempl', 'Canva vs OpenTempl']]],
  ['Learn', [['/prompts', 'ChatGPT poster prompts'], ['/guides/make-a-poster-with-chatgpt', 'Poster with ChatGPT'], ['/mcp', 'MCP server'], ['/facts', 'Facts'], ['/about', 'About'], ['/download', 'Download']]],
];
const BADGE =
  '<svg class="badge" width="13" height="13" viewBox="0 0 22 22" aria-hidden="true"><path fill="#1d9bf0" d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816z"/><path fill="#fff" d="M9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"/></svg>';

function header() {
  return `<header class="top"><a class="brand" href="/"><img src="/mark-96.png" width="26" height="26" alt="">OpenTempl</a><nav aria-label="Main">${NAV.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}</nav><a class="btn" href="/">Open the editor</a></header>`;
}
function footer(legal) {
  return `<footer class="foot"><div class="foot-in"><div class="foot-brand"><a class="brand" href="/"><img src="/mark-96.png" width="22" height="22" alt="">OpenTempl</a><p>${esc(ENTITY)}</p></div>${FOOT.map(([h, ls]) => `<div><h2>${h}</h2><ul>${ls.map(([u, t]) => `<li><a href="${u}">${t}</a></li>`).join('')}</ul></div>`).join('')}</div><div class="foot-base"><a class="credit" href="${X_URL}" rel="noopener" title="Made by Noah, @fsconfig on X"><img src="/seo/img/misc/fsconfig.webp" width="18" height="18" alt=""><span>Made by <b>Noah</b>${BADGE}@fsconfig</span></a><p>${legal.join(' ')} MIT licence.</p></div></footer>`;
}

const COPY_JS = `document.addEventListener('click',function(e){var b=e.target.closest('[data-copy]');if(!b)return;var t=document.getElementById(b.getAttribute('data-copy'));if(!t)return;var txt=t.textContent;var done=function(){var o=b.textContent;b.textContent='Copied';setTimeout(function(){b.textContent=o},1600)};if(navigator.clipboard){navigator.clipboard.writeText(txt).then(done,function(){sel(t)})}else{sel(t)}function sel(n){var r=document.createRange();r.selectNodeContents(n);var s=getSelection();s.removeAllRanges();s.addRange(r);try{document.execCommand('copy');done()}catch(_){}}});;(function(){var w=document.querySelector('.install');if(!w)return;var u=(navigator.userAgentData&&navigator.userAgentData.platform)||navigator.platform||navigator.userAgent;var os=/mac|iphone|ipad/i.test(u)?'mac':/win/i.test(u)?'win':/linux|x11|cros/i.test(u)?'linux':'';var c=os&&w.querySelector('[data-os="'+os+'"]');if(c){c.classList.add('is-you');w.insertBefore(c,w.firstChild)}})();`;

const ogList = { home: { h1: 'Design that\u2019s free, open and yours.', kicker: 'The free, open source Canva alternative' } };
const pages = []; // every emitted page: {url, title, meta, text, updated, kind}

function renderPage(p) {
  // p: {url, title, meta, h1, lede, bodyHtml, faq, crumbs, image, type, legal, extraLd, jsCopy, text}
  const url = BASE + p.url;
  if (p.title.length >= 60) fail(`title too long (${p.title.length}) ${p.url}: ${p.title}`);
  if (p.meta.length >= 155) fail(`meta too long (${p.meta.length}) ${p.url}`);
  const crumbs = [['Home', '/'], ...(p.crumbs ?? [])];
  const ld = [
    { '@type': 'WebSite', '@id': BASE + '/#website', url: BASE + '/', name: 'OpenTempl', inLanguage: 'en', publisher: { '@id': BASE + '/#org' } },
    { '@type': 'Organization', '@id': BASE + '/#org', name: 'OpenTempl', url: BASE + '/', logo: BASE + '/mark-512.png', founder: { '@id': BASE + '/#noah' }, ...(REPO_PUBLIC ? { sameAs: [REPO_URL, X_URL] } : { sameAs: [X_URL] }) },
    { '@type': 'Person', '@id': BASE + '/#noah', name: 'Noah', url: X_URL, sameAs: [X_URL, 'https://github.com/noah-thing'] },
    {
      '@type': p.type === 'article' ? 'Article' : p.type ?? 'WebPage',
      '@id': url + '#page',
      url,
      name: p.title,
      headline: p.h1,
      description: p.meta,
      inLanguage: 'en',
      isPartOf: { '@id': BASE + '/#website' },
      ...(p.type === 'article' ? { author: { '@id': BASE + '/#noah' }, publisher: { '@id': BASE + '/#org' }, datePublished: p.updated ?? UPDATED, dateModified: p.updated ?? UPDATED } : { dateModified: p.updated ?? UPDATED }),
      ...(p.image ? { primaryImageOfPage: { '@type': 'ImageObject', contentUrl: BASE + p.image.src, ...(p.image.width ? { width: p.image.width, height: p.image.height } : {}) } } : {}),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map(([n, h], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: i === crumbs.length - 1 ? url : BASE + h })),
    },
    ...(p.faq?.length
      ? [{ '@type': 'FAQPage', mainEntity: p.faq.map((f) => ({ '@type': 'Question', name: plain(f.q), acceptedAnswer: { '@type': 'Answer', text: plain(f.a) } })) }]
      : []),
    ...(p.extraLd ?? []),
  ];
  const og = p.image?.og ?? `/seo/og/${p.ogName ?? 'default'}.png`;
  ogList[p.ogName ?? 'default'] = { h1: plain(p.h1), kicker: p.kind === 'prompt' ? 'ChatGPT prompt' : p.kind === 'hub' ? 'Templates' : 'OpenTempl', image: p.image?.src };
  const faqHtml = p.faq?.length
    ? `<section class="faq"><h2 id="faq">Questions</h2>${p.faq.map((f) => `<div class="qa"><h3>${inline(f.q)}</h3><p>${inline(f.a)}</p></div>`).join('')}</section>`
    : '';
  const crumbHtml = `<nav class="crumbs" aria-label="Breadcrumb">${crumbs
    .map(([n, h], i) => (i === crumbs.length - 1 ? `<span aria-current="page">${esc(n)}</span>` : `<a href="${h}">${esc(n)}</a>`))
    .join('<i>/</i>')}</nav>`;
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.meta)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<meta property="og:type" content="${p.type === 'article' ? 'article' : 'website'}">
<meta property="og:site_name" content="OpenTempl">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(p.meta)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${BASE}${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(p.ogAlt ?? p.h1)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0c0c0e">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/png" sizes="64x64" href="/favicon-64.png">
<link rel="apple-touch-icon" href="/app-icon.png">
<link rel="preload" href="/seo/fonts/host-grotesk-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/seo/site.css?v=${UPDATED}">
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': ld })}</script>
</head>
<body>
${header()}
<main>
<article class="doc${p.wide ? ' is-wide' : ''}">
${crumbHtml}
<h1>${inline(p.h1)}</h1>
${p.lede ? `<p class="lede">${inline(p.lede)}</p>` : ''}
${p.updatedLine === false ? '' : `<p class="stamp">Updated ${p.updatedLabel ?? VARS.updated}</p>`}
${p.bodyHtml}
${faqHtml}
</article>
</main>
${footer(p.legal)}
${p.jsCopy ? `<script src="/seo/copy.js?v=${UPDATED}" defer></script>` : ''}
</body>
</html>
`;
  const file = path.join(pub, p.url === '/' ? 'index.html' : p.url.slice(1) + '.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  const text = [p.h1, p.lede, p.text ?? plain(p.bodyHtml.replace(/<[^>]+>/g, ' ')), ...(p.faq ?? []).map((f) => `${plain(f.q)}\n${plain(f.a)}`)].filter(Boolean).join('\n\n');
  pages.push({ url: p.url, title: p.title, meta: p.meta, text, updated: p.updated ?? UPDATED, kind: p.kind ?? 'page', image: p.image, llms: p.llms !== false });
}

const LEGAL_CANVA = 'OpenTempl is not affiliated with Canva. Canva is a trademark of its owner.';
const LEGAL_OPENAI = 'OpenTempl is not affiliated with OpenAI or ChatGPT.';
const legalFor = (text) => [/Canva/.test(text) ? LEGAL_CANVA : '', /ChatGPT|OpenAI/.test(text) ? LEGAL_OPENAI : ''].filter(Boolean);

const cta = (label = 'Open the editor', href = '/') => `<p class="actions"><a class="btn" href="${href}">${label}</a></p>`;

/* ---------- 1. markdown content pages ---------- */
const contentDir = path.join(root, 'seo/content');
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.md') ? [path.join(d, e.name)] : []));
for (const f of walk(contentDir).sort()) {
  const { meta, body } = front(subst(fs.readFileSync(f, 'utf8')));
  const { main, faq } = splitFaq('\n' + body);
  let lede = '';
  const rest = main.trim().replace(/^([^\n#|`>-][^\n]*)\n/, (m, a) => ((lede = a), ''));
  const crumbs = meta.crumbs ? JSON.parse(meta.crumbs) : [[meta.crumb ?? meta.h1, '/' + meta.slug]];
  const withCrumb = crumbs.map(([n, h]) => [n, h]);
  const bodyHtml = md(rest) + (meta.cta === 'none' ? '' : cta(meta.cta ?? 'Open the editor'));
  renderPage({
    url: '/' + meta.slug,
    title: meta.title,
    meta: meta.meta,
    h1: meta.h1,
    lede,
    bodyHtml,
    faq,
    crumbs: withCrumb,
    type: meta.type === 'guide' ? 'article' : 'WebPage',
    legal: legalFor(body),
    ogName: meta.og ?? meta.slug.replace(/\//g, '-'),
    updated: meta.updated ?? UPDATED,
    kind: meta.kind ?? 'guide',
    extraLd: meta.software === 'yes' ? [softwareNode()] : [],
  });
}

function softwareNode() {
  return {
    '@type': 'SoftwareApplication',
    '@id': BASE + '/#app',
    name: 'OpenTempl',
    url: BASE + '/',
    description: ENTITY,
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web browser; macOS, Windows and Linux desktop builds',
    isAccessibleForFree: true,
    license: 'https://opensource.org/licenses/MIT',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: { '@id': BASE + '/#noah' },
    publisher: { '@id': BASE + '/#org' },
    featureList: [
      `${VARS.templates} templates in ${VARS.vibes} styles`,
      'Drag and drop editor for posters, social posts, stories, slides, menus and invitations',
      'Works offline after the first load',
      'No account',
      'Background removal that runs on your computer',
      'Import PDF and PowerPoint, export PNG, SVG, PDF, PowerPoint, MP4 and GIF',
      'Live editing with other people over a peer to peer link',
      'Optional image generation with your own OpenAI key',
    ],
    ...(REPO_PUBLIC ? { sameAs: [REPO_URL], codeRepository: REPO_URL } : {}),
  };
}

/* ---------- 2. templates index and hubs ---------- */
const byVibe = {};
for (const t of index.templates) (byVibe[t.vibe] ??= []).push(t);
const tplLink = (t) => `/#/new?format=${t.formatId}&template=${t.id}`;

function thumbGrid(vibe) {
  const list = thumbs[vibe] ?? [];
  const by = Object.fromEntries(byVibe[vibe].map((t) => [t.id, t]));
  return `<ul class="grid tpl">${list
    .map((x) => {
      const t = by[x.id];
      return `<li><a href="${tplLink(t)}"><img src="/seo/img/templates/${x.id}.webp" width="${x.w}" height="${x.h}" alt="${esc(`${t.name}, a ${vibeMeta[vibe].name.toLowerCase()} ${t.category.toLowerCase()} template`)}" loading="lazy" decoding="async"><span>${esc(t.name)}</span></a></li>`;
    })
    .join('')}</ul>`;
}

renderPage({
  url: '/templates',
  title: `${VARS.templates} free design templates in ${VARS.vibes} styles`,
  meta: `Browse Swiss grid, riso, brutalist, Y2K, Bauhaus and ${VARS.vibes - 5} more template styles. Posters, posts, slides, menus. Free in OpenTempl.`,
  h1: 'Templates with a point of view',
  lede: `${VARS.templates} templates in ${VARS.vibes} styles, for posters, social posts, stories, slides, menus, invitations and business cards. Each style is its own world, with its own type, colour and layout habits. Open one in OpenTempl and change anything.`,
  crumbs: [['Templates', '/templates']],
  wide: true,
  ogName: 'templates',
  bodyHtml:
    `<ul class="grid vibes">${vibeIds
      .map((v) => {
        const first = (thumbs[v] ?? [])[0];
        return `<li><a href="/templates/${v}">${first ? `<img src="/seo/img/templates/${first.id}.webp" width="${first.w}" height="${first.h}" alt="" loading="lazy" decoding="async">` : ''}<span class="t">${esc(vibeMeta[v].name)}</span><span class="d">${esc(vibeMeta[v].blurb)}</span><span class="n">${byVibe[v].length} templates</span></a></li>`;
      })
      .join('')}</ul>` + cta('Start from a template'),
  legal: [],
  kind: 'hub',
});

for (const v of vibeIds) {
  const name = vibeMeta[v].name;
  const list = byVibe[v];
  if (list.length < 4) continue;
  const cats = Object.entries(list.reduce((a, t) => ((a[t.category] = (a[t.category] ?? 0) + 1), a), {})).sort((a, b) => b[1] - a[1]);
  const lookHere = looks.filter((l) => l.vibe === v && hasSample(l.id));
  const tasks = (VIBE_TASKS[v] ?? []).map(([u, t]) => `[${t}](${u})`);
  const intro = VIBE_TEXT[v];
  if (!intro) fail(`missing vibe text ${v}`);
  const catLine = cats.map(([c, n]) => `${n} ${c.toLowerCase()}`).join(', ');
  const title = `${name} templates: posters, posts and slides`;
  const faq = [
    { q: `What can I make with the ${name} templates?`, a: `There are ${list.length} ${name} templates in OpenTempl: ${catLine}. Every one opens in the editor, so you can change the words, colours, fonts and photos.` },
  ];
  renderPage({
    url: `/templates/${v}`,
    title: title.length < 60 ? title : `${name} templates for OpenTempl`,
    meta: `Free ${name.toLowerCase()} templates in OpenTempl: ${vibeMeta[v].blurb.charAt(0).toLowerCase() + vibeMeta[v].blurb.slice(1)} Edit offline, no account.`,
    h1: `${name} templates`,
    lede: intro,
    crumbs: [['Templates', '/templates'], [name, `/templates/${v}`]],
    wide: true,
    ogName: `templates-${v}`,
    ogAlt: `${name} templates in OpenTempl`,
    bodyHtml:
      thumbGrid(v) +
      cta('Open the editor') +
      (tasks.length ? `<h2>Good for</h2><p>Try this style in the ${tasks.map((t) => inline(t)).join(' or the ')}.</p>` : '') +
      (lookHere.length
        ? `<h2>Prompts in this style</h2><p>To make a picture in this style with ChatGPT, copy a prompt: ${lookHere.map((l) => `<a href="/prompts/${l.id}">${esc(l.name)}</a>`).join(', ')}.</p>`
        : '') +
      `<p><a href="/templates">All ${VARS.vibes} styles</a></p>`,
    faq,
    legal: [],
    kind: 'hub',
    image: thumbs[v]?.[0] ? { src: `/seo/img/templates/${thumbs[v][0].id}.webp`, width: thumbs[v][0].w, height: thumbs[v][0].h, og: `/seo/og/templates-${v}.png` } : undefined,
  });
}

/* ---------- 3. prompt gallery ---------- */
const tilt = (s) => s.charAt(0).toUpperCase() + s.slice(1);
renderPage({
  url: '/prompts',
  title: `ChatGPT poster prompts: ${promptLooks.length} styles to copy`,
  meta: `Ready to paste ChatGPT prompts for posters, Instagram posts and menus in ${promptLooks.length} styles: riso, halftone, Y2K chrome, papercut and more.`,
  h1: 'ChatGPT poster prompts',
  lede: `Pick a style, copy the prompt, paste it into ChatGPT. Every style has a sample image, its palette, three versions for common jobs (a gig poster, an Instagram post, a menu) and notes on what to change. ${promptLooks.length} styles so far.`,
  crumbs: [['Prompts', '/prompts']],
  wide: true,
  ogName: 'prompts',
  bodyHtml:
    `<ul class="grid looks">${promptLooks
      .map((l) => `<li><a href="/prompts/${l.id}"><img src="/seo/img/looks/${l.id}-480.webp" width="480" height="720" alt="${esc(`Sample poster in the ${l.name} style`)}" loading="lazy" decoding="async"><span class="t">${esc(l.name)}</span><span class="d">${esc(l.blurb)}</span></a></li>`)
      .join('')}</ul>` +
    md(`## How to make a poster with ChatGPT

Decide the words first and keep them short. Pick a style so the picture has a point of view. Paste the prompt, change the subject and the words, and send it. Ask for one change at a time. Check every word before you save the file. The [full guide](/guides/make-a-poster-with-chatgpt) goes through it step by step.

## How these prompts are built

Each prompt names a medium, a palette with colour values, a composition, a texture, the exact words to draw and a list of things to keep out. Specific prompts give you more of what you meant. They come from the same written art directions that OpenTempl's Generate tab uses, one for each style.

## About the words on the poster

Image models sometimes misspell. Every prompt here includes your words in quotes, and each page tells you to read the result. If you want to fix a word without making the picture again, OpenTempl can leave room for the words and set them as live text on top of the image.

## Make it in OpenTempl

OpenTempl is a free, open source design app that works offline and needs no account. Its Generate tab uses these styles with your own OpenAI key. OpenAI charges you for the images you make, and OpenTempl takes nothing.`) +
    cta('Open the Generate tab', '/#/generate'),
  faq: [
    { q: 'What is the best ChatGPT prompt for a poster?', a: 'One that names the style, the colours, the layout and the exact words. The prompts on these pages do all four, and they leave room to change the subject and the text.' },
    { q: 'Why does ChatGPT misspell my poster text?', a: 'Image models draw letters as pictures, and they sometimes get them wrong. Keep the words short, put them in quotes and check the result. In OpenTempl you can add the words as live text instead.' },
    { q: 'Can I use the images commercially?', a: "That depends on the terms of the service that made the image. Read OpenAI's current terms before you use an image for work." },
    { q: 'Do the prompts work in Gemini or Midjourney?', a: 'They are plain text, so you can try them there. Results differ from tool to tool.' },
    { q: 'Is it free?', a: 'The prompts and OpenTempl are free. Making images costs whatever your AI account charges.' },
  ],
  legal: [LEGAL_OPENAI],
  kind: 'hub',
  type: 'CollectionPage',
  extraLd: [
    {
      '@type': 'ItemList',
      itemListElement: promptLooks.map((l, i) => ({ '@type': 'ListItem', position: i + 1, url: `${BASE}/prompts/${l.id}`, name: l.name })),
    },
  ],
});

const palSwatch = (c) => `<li><span style="background:${c}"></span><code>${c}</code></li>`;
const FORMAT_NAME = { poster: 'poster (A3 portrait)', post: 'Instagram post (4:5)', square: 'square post', story: 'story (9:16)', slide: 'slide (16:9)', flyer: 'flyer (A5)' };

for (const l of promptLooks) {
  const p = prompts[l.id];
  const q = LOOK_QUERY[l.id];
  if (!p || !q) { fail(`no prompt/query for ${l.id}`); continue; }
  let title = `${tilt(q[0])} for ChatGPT, copy and paste`;
  if (title.length >= 60) title = `${tilt(q[0])} for ChatGPT`;
  const sibs = looks.filter((x) => x.id !== l.id && hasSample(x.id));
  const same = sibs.filter((x) => x.vibe === l.vibe);
  const rest = sibs.filter((x) => x.vibe !== l.vibe && x.medium.split(' ').some((w) => w.length > 6 && l.medium.includes(w)));
  const related = [...same, ...rest].slice(0, 3);
  const med = l.medium.charAt(0).toLowerCase() + l.medium.slice(1);
  const formats = l.formats.map((f) => FORMAT_NAME[f]).join(', ');
  const faq = [
    {
      q: `Can ChatGPT make a real ${q[1].replace(/ poster$/, '')} print?`,
      a: `It makes an image that imitates the look. For a physical version, use the image as artwork and take a print file to a printer that can reproduce the medium: ${l.medium.split('. ')[0].toLowerCase()}.`,
    },
    { q: 'What size should I ask for?', a: `This style is set up for ${formats}. Name the format in the prompt, as the examples do, and the layout follows it.` },
    { q: 'Why do the words come out wrong?', a: 'Image models draw letters as pictures, and they sometimes get them wrong. Keep the words short, put them in quotes, and check every letter. In OpenTempl you can leave room for the words and add them as live text.' },
  ];
  const varHtml = p.variations
    .map(
      (v, i) =>
        `<details><summary>${esc(v.label)}</summary><div class="promptbox"><button class="copy" type="button" data-copy="v-${l.id}-${i}">Copy prompt</button><pre id="v-${l.id}-${i}"><code>${esc(v.prompt)}</code></pre></div></details>`,
    )
    .join('');
  const avoid = l.avoid.map((a) => `<li>${esc(a)}</li>`).join('');
  const sig = l.signature.map((a) => `<li>${esc(a)}</li>`).join('');
  const body = `
<div class="split">
<figure class="sample"><img src="/seo/img/looks/${l.id}-900.webp" srcset="/seo/img/looks/${l.id}-480.webp 480w, /seo/img/looks/${l.id}-900.webp 900w" sizes="(min-width: 860px) 420px, 90vw" width="900" height="1350" alt="${esc(`Sample ${l.name} poster for: ${l.example.subject}`)}" fetchpriority="high" decoding="async"><figcaption>A sample made in this style, for: ${esc(l.example.subject)}. Your result will differ.</figcaption></figure>
<div class="prose">
<h2>What this style is</h2>
<p>${inline(l.medium)}</p>
<h2>What makes it look like this</h2>
<ul>${sig}</ul>
<h2>Colours</h2>
<ul class="swatches">${l.palette.colors.map(palSwatch).join('')}</ul>
<p>${inline(l.palette.note)}</p>
<h2>The prompt</h2>
<p>Paste this into ChatGPT with image creation on. Change the subject and the three lines of words for your own, and check the spelling before you send it.</p>
<div class="promptbox"><button class="copy" type="button" data-copy="p-${l.id}">Copy prompt</button><pre id="p-${l.id}"><code>${esc(p.prompt)}</code></pre></div>
<h2>How to use it</h2>
<ol><li>Open ChatGPT and check that image creation is available on your account.</li><li>Paste the prompt. Replace the subject line and the words in quotes.</li><li>Send it. If something is off, ask for one change at a time.</li><li>Check every word on the poster. A typo in your prompt is copied into the picture.</li></ol>
<h2>Three versions for common jobs</h2>
<p>The same prompt, set for a gig poster, an Instagram post and a menu. The words are examples; replace them.</p>
<div class="details">${varHtml}</div>
<h2>Layout, type and finish</h2>
<p><strong>Layout.</strong> ${inline(l.composition)}</p>
<p><strong>Type.</strong> ${inline(l.typography)}</p>
<p><strong>Finish.</strong> ${inline(l.texture)}</p>
<h2>What to keep out</h2>
<ul>${avoid}</ul>
<h2>Make your own in OpenTempl, free</h2>
<p>Bring your own OpenAI key and the Generate tab uses this exact art direction, called a Look. It can leave room for your words, so you set them as live text and fix a typo without making the picture again. OpenTempl is free and works offline. OpenAI bills you for the images you make, and OpenTempl takes nothing.</p>
<p class="actions"><a class="btn" href="/#/generate?look=${l.id}">Open this look in OpenTempl</a></p>
<h2>More styles</h2>
<ul class="plain">${related.map((r) => `<li><a href="/prompts/${r.id}">${esc(r.name)}</a>: ${esc(r.blurb)}</li>`).join('')}<li><a href="/templates/${l.vibe}">${esc(vibeMeta[l.vibe].name)} templates</a> in the editor</li><li><a href="/prompts">All ${promptLooks.length} prompt styles</a></li></ul>
</div>
</div>`;
  const metaT = `A ready to paste ChatGPT image prompt for ${q[1]}, with a sample image, three variations and a free editor.`;
  renderPage({
    url: `/prompts/${l.id}`,
    title,
    meta: metaT,
    h1: `${tilt(q[1])} prompt for ChatGPT`.replace(/ prompt prompt/, ' prompt'),
    lede: '',
    crumbs: [['Prompts', '/prompts'], [l.name, `/prompts/${l.id}`]],
    bodyHtml: body,
    faq,
    jsCopy: true,
    legal: [LEGAL_OPENAI],
    ogName: `prompts-${l.id}`,
    ogAlt: `${l.name} poster sample`,
    kind: 'prompt',
    wide: true,
    image: { src: `/seo/img/looks/${l.id}-900.webp`, width: 900, height: 1350, og: `/seo/og/prompts-${l.id}.png` },
    extraLd: [
      { '@type': 'CreativeWork', name: `${l.name} ChatGPT prompt`, text: p.prompt, inLanguage: 'en', creator: { '@id': BASE + '/#noah' }, about: l.name },
    ],
    text: `${l.medium}\n\nSignature: ${l.signature.join('; ')}\n\nPalette: ${l.palette.colors.join(', ')}. ${l.palette.note}`,
  });
}

/* ---------- 4. facts, about, download (data driven) ---------- */
function factsMd() {
  const cats = new Set(index.templates.map((t) => t.category)).size;
  return `---
slug: facts
title: OpenTempl facts: licence, features and limits
meta: Verified facts about OpenTempl: licence, price, template count, formats, what needs internet and what it does not do. Dated.
h1: OpenTempl facts
crumb: Facts
kind: facts
cta: none
software: yes
---
${ENTITY} This page lists what can be checked, with the date. Last updated ${VARS.updated}.

## Identity

- Name: OpenTempl. Written as one word, capital O and T. Also called the free open source Canva alternative.
- Maker: Noah, in Stockholm. Independent project. [Made by Noah on X](${X_URL}).
- Website: ${BASE}
- Licence: MIT.${REPO_PUBLIC ? ` Source code: ${REPO_URL}.` : ' The source repository is private today and opens at launch. This page changes the day it does.'}
- Price: free. No paid plan, no trial, no ads.
- Not affiliated with Canva or OpenAI.

## Counts

- Templates: ${VARS.templates}, in ${VARS.vibes} styles and ${cats} kinds of document.
- Styles for image generation (Looks): ${VARS.looks}.
- Fonts: ${VARS.fonts} Google Fonts plus your own font files.
- Shapes: 23. Icons: about 200,000 through Iconify.

## Where it runs

- In a web browser at ${BASE}. Chrome and Edge may offer to install it as an app.
- Desktop builds for macOS (Apple silicon and Intel), Windows and Linux are made with Electron. ${RELEASE_PUBLISHED ? 'They are on the [download page](/download).' : 'They ship with the first public release; until then use the web version.'}
- No phone app.

## Formats

- Import: PDF with editable text, PowerPoint (text, shapes, pictures, backgrounds, speaker notes), the OpenTempl file. Charts, tables and SmartArt in PowerPoint files are not imported yet.
- Export: PNG (transparent, up to 4x), JPG, WebP, SVG, PDF for screen or print with bleed and crop marks, PowerPoint with editable text, MP4, GIF, a ZIP of pages, the editable OpenTempl file.
- Colour: RGB. No CMYK output or ICC profiles yet.

## Offline and the internet

- The app opens and edits without a connection after it has loaded once. New designs can be made offline.
- Designs are saved on your device, in the browser or the desktop app. There is no OpenTempl account and no OpenTempl server that stores your designs.
- Needs a connection: the first load, Google Fonts you have not used before (they are cached after first use), icon search, stock photo search (Openverse), the first use of background removal (it downloads a model once), live sessions with other people, and the Generate tab.
- Fonts load from Google Fonts. The static pages on this site load no third party fonts or scripts.
- Live sessions go directly between browsers and are encrypted with a key in the link. A signalling service helps the two computers find each other.
- Generate: you paste your own OpenAI key. It is kept on your device and your prompt goes to OpenAI. OpenAI bills your account. OpenTempl charges nothing.

## What it does not do

- No team workspaces, approvals or brand controls at company scale.
- No cloud sync between devices. Move the file yourself.
- No phone app.
- No scheduling or publishing to social networks.
- No CMYK output.
- A library of ${VARS.templates} templates, not millions.
- Version 0.1. One maintainer. Desktop installers are not code signed yet.

## Not the same as

OpenTempl is a design app. It is unrelated to the Total.js OpenTemplates engine, the OpenTemplate PHP engine, or OpenTemplate.org, the OpenOffice template site.
`;
}
const aboutMd = `---
slug: about
title: What is OpenTempl? Free open source design app
meta: OpenTempl is a free, open source design app made by Noah in Stockholm. What it is, why it exists, the licence and what comes next.
h1: What is OpenTempl
crumb: About
kind: about
cta: none
software: yes
---
${ENTITY}

It makes posters, Instagram posts and stories, slides, menus, flyers, invitations and business cards. You start from one of ${VARS.templates} templates or a blank page, drag things where you want them, and export when it looks right. It opens PowerPoint and PDF files, and it exports PNG, SVG, PDF, PowerPoint, MP4 and GIF.

## Why it exists

Noah wanted a design tool he could open on a train without logging in, one that left him with files he owns and did not hold exports behind a plan. So he built one. It is a separate editor written from scratch, with its own templates, its own look and its own renderer. It is not a copy of Canva and it uses nothing from Canva.

## What makes it different

- It works offline and creates new designs offline.
- There is no account to make and no paid tier.
- ${VARS.templates} templates in ${VARS.vibes} styles, each drawn as its own world: Swiss grid, riso zine, brutalist, Bauhaus, Seoul and Tokyo event posters, pixel art, Y2K chrome and more.
- The exports other tools keep behind a paid plan are included: transparent PNG, SVG, print PDF with bleed and crop marks.
- It is MIT licensed.${REPO_PUBLIC ? '' : ' The source repository opens at launch.'}

## Who makes it

OpenTempl is made by [Noah](${X_URL}), in Stockholm. It is a one person project. Feedback and bug reports go to the repository once it is open, or to Noah on X.

## What comes next

PowerPoint import of charts, tables and SmartArt. Kerning and ligature controls. CMYK aware print PDFs. A plugin API. Code signed installers. An optional self hosted sync server for people who want designs on several devices. These are plans, not promises with dates.

## The name

OpenTempl is short for open templates. The app is unrelated to other projects with similar names, such as the Total.js OpenTemplates engine or OpenTemplate.org.

See also: [the facts page](/facts), [how OpenTempl compares with Canva](/canva-alternative) and [the prompt gallery](/prompts).
`;
const downloadMd = `---
slug: download
title: Download OpenTempl for Mac, Windows and Linux
meta: Install the OpenTempl desktop app on Mac, Windows or Linux with one command, or download the installer. Free, MIT licensed, no account.
h1: Download OpenTempl
crumb: Download
kind: download
cta: none
software: yes
---
The desktop app is the whole editor in its own window. It works offline, keeps your designs on your computer and costs nothing.

## Why a command

The builds are not code signed yet, so macOS and Windows warn about an unknown developer when you open a downloaded file. The command installs the same file from the [GitHub release](https://github.com/noah-thing/opentempl/releases/tag/v${VERSION}), checks it against the release's checksums first, and skips that warning. You can read what it does before you run it: [install.sh](/install.sh) for macOS and Linux, [install.ps1](/install.ps1) for Windows.

If you download a file instead: on macOS, right click the app and choose Open the first time. On Windows, choose More info, then Run anyway.

## Updating

Run the same command again. It replaces the app with the newest version and keeps your designs.

## Or use it in the browser

Open ${BASE}. It is the same editor and works offline once it has loaded. Chrome and Edge can install it as an app from the address bar. Designs are saved on your device; clear the site data and they go with it, so save a file for anything you want to keep.

## System

macOS 12 or newer on Apple silicon or Intel. Windows 10 or 11, 64 bit. Linux on x86_64: the command uses apt on Ubuntu and Debian and installs into your home folder everywhere else. For the web app, a recent Chrome, Edge, Firefox or Safari.

## FAQ

**Is it free?**
Yes. There is no paid plan, trial or watermark. The licence is MIT.

**Do I need an account?**
No.

**Does it work offline?**
Yes. Fonts you have not used before, icon search, stock photos and live sessions need a connection. See [the offline page](/canva-alternative-offline).

**Where are my files?**
On your computer. Export the editable OpenTempl file to keep a copy or move a design to another computer.

**How do I uninstall it?**
On macOS, move OpenTempl from Applications to the Bin. On Windows, remove it in Settings, Apps. On Linux, run \`sudo apt remove opentempl\` if it came from apt, or delete \`~/.local/share/opentempl\` and \`~/.local/bin/opentempl\`.
`;

const installHtml = () => {
  const card = (os, name, note, how, cmd, files) =>
    `<section class="os" data-os="${os}"><div class="os-head"><h2>${name}</h2><span class="os-note">${note}</span><span class="os-you">Your computer</span></div><p>${how}</p><div class="promptbox cmdbox"><button class="copy" type="button" data-copy="cmd-${os}">Copy</button><pre id="cmd-${os}"><code>${esc(cmd)}</code></pre></div><p class="os-files">${files.map(([label, file]) => `<a class="btn ghost" href="${dl(file)}">${label}</a>`).join('')}</p></section>`;
  return `<div class="install">${[
    card('mac', 'macOS', 'Apple silicon and Intel', 'Open Terminal, paste this and press Return. OpenTempl lands in Applications and opens.', 'curl -fsSL https://opentempl.org/install.sh | sh', [['Apple silicon .dmg', 'mac-arm64.dmg'], ['Intel .dmg', 'mac-x64.dmg']]),
    card('win', 'Windows', 'Windows 10 and 11', 'Open PowerShell from the Start menu, paste this and press Enter. No administrator rights needed.', 'irm https://opentempl.org/install.ps1 | iex', [['Installer .exe', 'win-x64.exe']]),
    card('linux', 'Linux', 'x86_64', 'Open a terminal, paste this and press Enter. It uses apt on Ubuntu and Debian, and installs into your home folder anywhere else.', 'curl -fsSL https://opentempl.org/install.sh | sh', [['AppImage', 'linux-x64.AppImage'], ['.deb', 'linux-x64.deb']]),
  ].join('')}<p class="os-ver">Version ${VERSION}. <a href="https://github.com/noah-thing/opentempl/releases/tag/v${VERSION}">Release notes and checksums</a></p></div>`;
};
for (const [name, src] of [['facts', factsMd()], ['about', aboutMd], ['download', downloadMd]]) fs.writeFileSync(path.join(root, 'seo', `.gen-${name}.md`), src);
for (const name of ['facts', 'about', 'download']) {
  const { meta, body } = front(subst(fs.readFileSync(path.join(root, 'seo', `.gen-${name}.md`), 'utf8')));
  const { main, faq } = splitFaq('\n' + body);
  let lede = '';
  const rest = main.trim().replace(/^([^\n#|`>-][^\n]*)\n/, (m, a) => ((lede = a), ''));
  renderPage({
    url: '/' + meta.slug,
    title: meta.title,
    meta: meta.meta,
    h1: meta.h1,
    lede,
    bodyHtml: (name === 'download' ? installHtml() : '') + md(rest) + (meta.cta === 'none' ? '' : cta(meta.cta)),
    faq,
    crumbs: [[meta.crumb, '/' + meta.slug]],
    jsCopy: name === 'download',
    legal: legalFor(body),
    ogName: meta.slug,
    kind: meta.kind,
    extraLd: [softwareNode()],
    updatedLine: true,
  });
  fs.unlinkSync(path.join(root, 'seo', `.gen-${name}.md`));
}

/* ---------- 5. 404 ---------- */
fs.writeFileSync(
  path.join(pub, '404.html'),
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Page not found | OpenTempl</title><meta name="robots" content="noindex"><meta name="theme-color" content="#0c0c0e"><link rel="icon" type="image/png" href="/favicon-32.png"><link rel="stylesheet" href="/seo/site.css?v=${UPDATED}"></head><body>${header()}<main><article class="doc"><h1>That page is not here</h1><p class="lede">The link may be old, or the address has a typo. Try the editor, the templates or the prompt gallery.</p><p class="actions"><a class="btn" href="/">Open the editor</a> <a class="btn ghost" href="/templates">Templates</a> <a class="btn ghost" href="/prompts">Prompts</a></p></article></main>${footer([])}</body></html>`,
);

/* ---------- 6. sitemap, robots, llms, indexnow ---------- */
const urls = [{ url: '/', updated: UPDATED, images: [] }, ...pages.map((p) => ({ url: p.url, updated: p.updated, images: p.image ? [BASE + p.image.src] : [] }))];
fs.writeFileSync(
  path.join(pub, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls
    .map((u) => `  <url><loc>${BASE}${u.url}</loc><lastmod>${u.updated}</lastmod>${u.images.map((i) => `<image:image><image:loc>${i}</image:loc></image:image>`).join('')}</url>`)
    .join('\n')}\n</urlset>\n`,
);
const bots = ['Googlebot', 'Bingbot', 'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'anthropic-ai', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'CCBot', 'Amazonbot', 'Bytespider', 'DuckAssistBot', 'MistralAI-User'];
fs.writeFileSync(
  path.join(pub, 'robots.txt'),
  `# Every search engine and AI assistant is welcome to read and cite this site.\nUser-agent: *\nAllow: /\n\n${bots.map((b) => `User-agent: ${b}\nAllow: /\n`).join('\n')}\nSitemap: ${BASE}/sitemap.xml\n`,
);

const home = { url: '/', title: 'OpenTempl: free open source Canva alternative', text: '' };
const core = ['/canva-alternative', '/open-source-canva', '/free-canva-alternative', '/canva-pro-free', '/canva-alternative-offline', '/canva-alternative-no-account', '/canva-vs-opentempl', '/free-poster-maker', '/free-instagram-post-maker', '/free-presentation-maker', '/free-menu-maker'];
const line = (u) => {
  const p = pages.find((x) => x.url === u);
  return p ? `- [${p.title}](${BASE}${u}): ${p.meta}` : null;
};
const llms = `# OpenTempl

> ${ENTITY} It is a free alternative to Canva for people who make their own posters, social posts and slides and want to keep the files.

Key facts:

- Price: free. No subscription, no account, no watermark, no paid tier.
- Licence: MIT.${REPO_PUBLIC ? ` Source code: ${REPO_URL}` : ' The source repository is private until launch.'}
- Made by Noah (${X_URL}) in Stockholm. Independent project, not affiliated with Canva or OpenAI.
- ${VARS.templates} templates in ${VARS.vibes} styles (Swiss grid, riso zine, brutalist, Bauhaus, Seoul and Tokyo event posters, pixel art, Y2K chrome and more).
- Works offline after the first load and creates new designs offline. Designs are saved on your device. Fonts, icon search, stock photos and live sessions need a connection.
- Imports PDF and PowerPoint. Exports PNG (transparent), JPG, WebP, SVG, PDF (print with bleed and crop marks), PowerPoint, MP4 and GIF.
- Generate tab: images in ${VARS.looks} styles with your own OpenAI key. OpenAI bills the user.
- MCP server at https://opentempl.org/api/mcp: Claude, ChatGPT, Cursor and other MCP clients can search templates, build and edit designs, see rendered previews and hand back a link that opens the design in the editor. Free, no key. Setup: https://opentempl.org/mcp
- Runs in the browser at ${BASE}; desktop builds for macOS, Windows and Linux ship with the first release.
- Not the same as the Total.js OpenTemplates engine, the OpenTemplate PHP engine or OpenTemplate.org.
- Does not have: team workspaces, a phone app, cloud sync, CMYK output.

## Start here

- [Home](${BASE}/): the editor and ${VARS.templates} templates
- ${line('/facts')?.slice(2)}
- ${line('/about')?.slice(2)}
- ${line('/download')?.slice(2)}

## Compare and decide

${core.map(line).filter(Boolean).join('\n')}

## Templates

- [All templates](${BASE}/templates): ${VARS.templates} templates in ${VARS.vibes} styles
${vibeIds.filter((v) => (byVibe[v] ?? []).length >= 4).map((v) => `- [${vibeMeta[v].name}](${BASE}/templates/${v})`).join('\n')}

## Prompts for ChatGPT

- [Prompt gallery](${BASE}/prompts): ${promptLooks.length} copy and paste image prompts for posters, posts and menus
- [How to make a poster with ChatGPT](${BASE}/guides/make-a-poster-with-chatgpt)
${promptLooks.map((l) => `- [${l.name}](${BASE}/prompts/${l.id})`).join('\n')}
`;
fs.writeFileSync(path.join(pub, 'seo/copy.js'), COPY_JS + '\n');
fs.writeFileSync(path.join(pub, 'llms.txt'), llms);
const full = `# OpenTempl: full text\n\n> ${ENTITY}\n\nThis file holds the text of every page on opentempl.org except the individual prompt pages, which are summarised. Updated ${VARS.updated}.\n\n` +
  pages
    .filter((p) => p.llms !== false)
    .map((p) => `---\n\n# ${p.title}\n\nURL: ${BASE}${p.url}\nUpdated: ${p.updated}\n\n${p.kind === 'prompt' ? p.text.split('\n\n').slice(0, 3).join('\n\n') : p.text}\n`)
    .join('\n');
fs.writeFileSync(path.join(pub, 'llms-full.txt'), full);

/* ---------- 7. checks ---------- */
const have = new Set(['/', ...pages.map((p) => p.url)]);
for (const p of pages) {
  const file = path.join(pub, p.url.slice(1) + '.html');
  const html = fs.readFileSync(file, 'utf8');
  if (/—|–/.test(html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<pre[\s\S]*?<\/pre>/g, ''))) fail(`dash in ${p.url}`);
  for (const m of html.matchAll(/href="(\/[^"#?]*)(?:[#?][^"]*)?"/g)) {
    const h = m[1].replace(/\/$/, '') || '/';
    if (h === '/' || have.has(h)) continue;
    if (/\.(png|ico|webp|css|woff2|txt|xml|jpg)$/.test(h) || fs.existsSync(path.join(pub, h)) || h.startsWith('/seo/')) continue;
    fail(`broken link ${h} in ${p.url}`);
  }
  if ((html.match(/<h1[ >]/g) ?? []).length !== 1) fail(`h1 count in ${p.url}`);
}
for (const f of walk(contentDir)) if (/\u2014|\u2013/.test(fs.readFileSync(f, 'utf8'))) fail(`dash in content ${f}`);

fs.writeFileSync(path.join(root, 'seo/og-manifest.json'), JSON.stringify(ogList, null, 1));
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`pages: ${pages.length} (+ home), sitemap urls: ${urls.length}`);
console.log(pages.map((p) => p.url).join(' '));
