import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

// Plain JavaScript module: Chromium's package is ESM only, and .ts functions here build as CommonJS.
// Draws MCP previews: headless Chromium opens the editor's render page and runs a
// draft through the same export code the editor uses. Only the drafts worker calls
// it (it holds the key and keeps a monthly count, so this stays inside the free
// plan). The browser and the loaded page are kept between requests on a warm instance.

const SITE = process.env.OPENTEMPL_SITE ?? 'https://opentempl.org';

let browser = null;
let page = null;

function sameKey(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function renderPage() {
  browser ??= (async () => {
    const b = await puppeteer.launch({ args: chromium.args, executablePath: await chromium.executablePath(), headless: true, defaultViewport: { width: 800, height: 600 } });
    b.on('disconnected', () => {
      browser = null;
      page = null;
    });
    return b;
  })();
  page ??= (async () => {
    const p = await (await browser).newPage();
    await p.goto(`${SITE}/#/mcp-render`, { waitUntil: 'domcontentloaded', timeout: 25_000 });
    await p.waitForSelector('body[data-ready=yes]', { timeout: 25_000 });
    return p;
  })();
  try {
    return await page;
  } catch (e) {
    page = null;
    throw e;
  }
}

async function handle(req) {
  if (req.method !== 'POST') return new Response('POST only', { status: 405 });
  if (!sameKey(req.headers.get('authorization') ?? '', `Bearer ${process.env.OPENTEMPL_DRAFTS_KEY ?? ''}`)) return new Response('forbidden', { status: 403 });
  const body = await req.json();
  try {
    const p = await renderPage();
    const out = await p.evaluate(
      (b) => window.opentemplRender(b.draft, { pages: b.pages, maxSide: b.maxSide, zoom: b.zoom }),
      body,
    );
    return Response.json(out);
  } catch (e) {
    // A crashed page or browser is started fresh next time.
    page = null;
    return Response.json({ error: 'render_failed', detail: String(e?.message ?? e).slice(0, 300) }, { status: 500 });
  }
}

export default { fetch: handle };
