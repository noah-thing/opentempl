/*
 * Designs made through the OpenTempl MCP server wait here until someone opens the link.
 *
 * A draft is the list of steps that rebuilds a design from a template: text, colours, photo links. Only the
 * MCP server can write (it holds DRAFTS_KEY). Anyone with a draft's id can read it, like a share link; the
 * ids are random and long enough that they cannot be guessed. Nothing about the person is stored, and a
 * draft is deleted 90 days after it last changed.
 *
 * It also draws previews, so the assistant can see what it made: a headless browser opens the editor's
 * render page and draws the draft through the same export code the editor uses.
 */

import puppeteer from '@cloudflare/puppeteer';

interface Env {
	DB: D1Database;
	DRAFTS_KEY: string;
	READS?: RateLimit;
	BROWSER: Fetcher;
	RENDER_SITE: string;
}

const MAX_BODY = 256 * 1024;
const KEEP_DAYS = 90;
const ID = /^[A-Za-z0-9]{12}$/;

function sameKey(a: string, b: string): boolean {
	if (!a || !b || a.length !== b.length) { return false; }
	let diff = 0;
	for (let i = 0; i < a.length; i++) { diff |= a.charCodeAt(i) ^ b.charCodeAt(i); }
	return diff === 0;
}

function newId(): string {
	const abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const bytes = crypto.getRandomValues(new Uint8Array(12));
	return [...bytes].map(b => abc[b % 62]).join('');
}

const json = (body: unknown, status = 200, extra: Record<string, string> = {}): Response =>
	new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...extra } });

// The editor reads drafts from the site, the desktop app and local dev.
const OPEN = { 'access-control-allow-origin': '*', 'cache-control': 'no-store' };

async function read(id: string, req: Request, env: Env): Promise<Response> {
	if (!ID.test(id)) { return json({ error: 'not_found' }, 404, OPEN); }
	const ip = req.headers.get('cf-connecting-ip');
	if (ip && env.READS && !(await env.READS.limit({ key: ip })).success) { return json({ error: 'slow_down' }, 429, OPEN); }
	const row = await env.DB.prepare('SELECT body, version, updated FROM drafts WHERE id = ?1').bind(id).first<{ body: string; version: number; updated: number }>();
	if (!row) { return json({ error: 'not_found' }, 404, OPEN); }
	return new Response(`{"id":${JSON.stringify(id)},"version":${row.version},"updated":${row.updated},"draft":${row.body}}`, {
		headers: { 'content-type': 'application/json', ...OPEN },
	});
}

async function write(id: string | null, req: Request, env: Env): Promise<Response> {
	const auth = req.headers.get('authorization') ?? '';
	if (!sameKey(auth, `Bearer ${env.DRAFTS_KEY ?? ''}`)) { return json({ error: 'forbidden' }, 403); }
	const text = await req.text();
	if (text.length > MAX_BODY) { return json({ error: 'too_big' }, 413); }
	try {
		const j: unknown = JSON.parse(text);
		if (!j || typeof j !== 'object' || Array.isArray(j)) { throw new Error('shape'); }
	} catch {
		return json({ error: 'bad_json' }, 400);
	}
	const now = Date.now();
	if (id) {
		if (!ID.test(id)) { return json({ error: 'not_found' }, 404); }
		const row = await env.DB.prepare('UPDATE drafts SET body = ?2, version = version + 1, updated = ?3 WHERE id = ?1 RETURNING version')
			.bind(id, text, now).first<{ version: number }>();
		return row ? json({ id, version: row.version }) : json({ error: 'not_found' }, 404);
	}
	const fresh = newId();
	await env.DB.prepare('INSERT INTO drafts (id, body, version, created, updated) VALUES (?1, ?2, 1, ?3, ?3)').bind(fresh, text, now).run();
	return json({ id: fresh, version: 1 });
}

interface RenderBody {
	draft: unknown;
	pages?: string[];
	maxSide?: number;
}

async function render(req: Request, env: Env): Promise<Response> {
	const auth = req.headers.get('authorization') ?? '';
	if (!sameKey(auth, `Bearer ${env.DRAFTS_KEY ?? ''}`)) { return json({ error: 'forbidden' }, 403); }
	const text = await req.text();
	if (text.length > MAX_BODY) { return json({ error: 'too_big' }, 413); }
	let body: RenderBody;
	try {
		body = JSON.parse(text);
	} catch {
		return json({ error: 'bad_json' }, 400);
	}
	let browser;
	try {
		browser = await puppeteer.launch(env.BROWSER);
	} catch (e) {
		// Out of browser time for the day, or too many at once.
		return json({ error: 'busy', detail: String((e as Error).message ?? e).slice(0, 200) }, 503);
	}
	try {
		const page = await browser.newPage();
		await page.setViewport({ width: 800, height: 600 });
		await page.goto(`${env.RENDER_SITE}/#/mcp-render`, { waitUntil: 'domcontentloaded', timeout: 20000 });
		await page.waitForSelector('body[data-ready=yes]', { timeout: 20000 });
		const out = await page.evaluate(
			// Runs in the page; opentemplRender is defined by the editor's render route.
			(b: RenderBody) => (globalThis as unknown as { opentemplRender: (d: unknown, o: unknown) => Promise<unknown> }).opentemplRender(b.draft, { pages: b.pages, maxSide: b.maxSide }),
			body,
		);
		return json(out);
	} catch (e) {
		return json({ error: 'render_failed', detail: String((e as Error).message ?? e).slice(0, 300) }, 500);
	} finally {
		await browser.close().catch(() => {});
	}
}

export default {
	async fetch(req: Request, env: Env): Promise<Response> {
		const url = new URL(req.url);
		if (url.pathname === '/') { return new Response('opentempl-drafts\n', { headers: { 'content-type': 'text/plain' } }); }
		if (req.method === 'OPTIONS') {
			return new Response(null, { status: 204, headers: { ...OPEN, 'access-control-allow-methods': 'GET', 'access-control-max-age': '86400' } });
		}
		if (url.pathname === '/v1/render' && req.method === 'POST') { return render(req, env); }
		const m = url.pathname.match(/^\/v1\/drafts(?:\/([^/]+))?$/);
		if (!m) { return json({ error: 'not_found' }, 404); }
		if (req.method === 'GET' && m[1]) { return read(m[1], req, env); }
		if (req.method === 'POST' && !m[1]) { return write(null, req, env); }
		if (req.method === 'PUT' && m[1]) { return write(m[1], req, env); }
		return json({ error: 'method' }, 405);
	},

	async scheduled(_event: ScheduledController, env: Env): Promise<void> {
		await env.DB.prepare('DELETE FROM drafts WHERE updated < ?1').bind(Date.now() - KEEP_DAYS * 86_400_000).run();
	},
} satisfies ExportedHandler<Env>;
