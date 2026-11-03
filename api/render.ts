import chromium from '@sparticuz/chromium';
import puppeteer, { type Browser, type Page } from 'puppeteer-core';

// Draws MCP previews: headless Chromium opens the editor's render page and runs a
// draft through the same export code the editor uses. Only the drafts worker calls
// it (it holds the key and keeps a monthly count, so this stays inside the free
// plan). The browser and the loaded page are kept between requests on a warm instance.

const SITE = process.env.OPENTEMPL_SITE ?? 'https://opentempl.org';

let browser: Promise<Browser> | null = null;
let page: Promise<Page> | null = null;

function sameKey(a: string, b: string) {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function renderPage(): Promise<Page> {
  browser ??= (async () => {
    const b = await puppeteer.launch({ args: chromium.args, executablePath: await chromium.executablePath(), headless: true, defaultViewport: { width: 800, height: 600 } });
    b.on('disconnected', () => {
      browser = null;
      page = null;
    });
    return b;
  })();
  page ??= (async () => {
    const p = await (await browser!).newPage();
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

async function handle(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('POST only', { status: 405 });
  if (!sameKey(req.headers.get('authorization') ?? '', `Bearer ${process.env.OPENTEMPL_DRAFTS_KEY ?? ''}`)) return new Response('forbidden', { status: 403 });
  const body = (await req.json()) as { draft: unknown; pages?: string[]; maxSide?: number; zoom?: unknown };
  try {
    const p = await renderPage();
    const out = await p.evaluate(
      (b) => (window as unknown as { opentemplRender: (d: unknown, o: unknown) => Promise<unknown> }).opentemplRender(b.draft, { pages: b.pages, maxSide: b.maxSide, zoom: b.zoom }),
      body,
    );
    return Response.json(out);
  } catch (e) {
    // A crashed page or browser is started fresh next time.
    page = null;
    return Response.json({ error: 'render_failed', detail: String((e as Error).message ?? e).slice(0, 300) }, { status: 500 });
  }
}

export default { fetch: handle };
