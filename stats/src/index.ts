/*
 * OpenTempl anonymous counts and the optional email list.
 *
 * Once a day an install that has not turned counting off sends a random ID it made itself, its version and
 * its platform. The ID is hashed before it is stored. Events are only counted per day and per name. IP
 * addresses are never stored and requests are not logged; to keep one network from flooding the counts or
 * the list, a one way hash of the address (salted with a server secret and the day) is kept for a few days.
 */

import { renderDashboard, type Stats } from './dashboard';
import { ipBucket } from './ipKey';
import { allowedOrigin, cleanEmail, EVENTS, PLATFORMS, SOURCES, UUID, VERSION } from './validate';

interface Env {
	DB: D1Database;
	STATS_KEY: string;
}

const MAX_BODY = 4 * 1024;
const NEW_INSTALLS_PER_IP_PER_DAY = 200;
const EVENTS_PER_IP_PER_DAY = 3000;
const SUBSCRIBES_PER_IP_PER_DAY = 8;

const day = (offset = 0): string => new Date(Date.now() - offset * 86_400_000).toISOString().slice(0, 10);

async function sha256(s: string): Promise<string> {
	const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
	return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Constant time comparison, so the key cannot be guessed one character at a time. */
function sameKey(a: string, b: string): boolean {
	if (!a || !b || a.length !== b.length) { return false; }
	let diff = 0;
	for (let i = 0; i < a.length; i++) { diff |= a.charCodeAt(i) ^ b.charCodeAt(i); }
	return diff === 0;
}

/**
 * The JSON object in the body. The app sends it as text/plain so the browser needs no preflight,
 * which is also why the content type is not checked here.
 */
async function readObject(req: Request): Promise<Record<string, unknown> | Response> {
	const text = await req.text();
	if (text.length > MAX_BODY) { return new Response('too big', { status: 413 }); }
	try {
		const j: unknown = JSON.parse(text);
		if (j && typeof j === 'object' && !Array.isArray(j)) { return j as Record<string, unknown>; }
	} catch { /* falls through */ }
	return new Response('bad json', { status: 400 });
}

/** Counts one use for this network in the period and says whether it is over the limit. */
async function overIpLimit(req: Request, env: Env, kind: string, limit: number): Promise<boolean> {
	const ip = req.headers.get('cf-connecting-ip');
	if (!ip) { return false; }
	try {
		const hash = await sha256(`${env.STATS_KEY ?? ''}|${day()}|${ipBucket(ip)}`);
		const row = await env.DB.prepare(
			'INSERT INTO ip_limits (kind, period, hash, n) VALUES (?1, ?2, ?3, 1) ON CONFLICT (kind, period, hash) DO UPDATE SET n = n + 1 RETURNING n',
		).bind(kind, day(), hash).first<{ n: number }>();
		await env.DB.prepare('DELETE FROM ip_limits WHERE period < ?1').bind(day(2)).run();
		return Number(row?.n ?? 0) > limit;
	} catch {
		return false;
	}
}

const nothing = (): Response => new Response(null, { status: 204 });
const bad = (what: string): Response => new Response(what, { status: 400 });

async function ping(req: Request, env: Env): Promise<Response> {
	const body = await readObject(req);
	if (body instanceof Response) { return body; }
	const { install, version, platform } = body;
	if (typeof install !== 'string' || typeof version !== 'string' || typeof platform !== 'string') { return bad('bad ping'); }
	const id = install.toLowerCase();
	if (!UUID.test(id) || !VERSION.test(version) || !PLATFORMS.has(platform)) { return bad('bad ping'); }
	const hash = await sha256(id);
	const today = day();
	// known installs just check in; only new IDs count against the network's limit, so a script cannot inflate the total
	const known = await env.DB.prepare('SELECT 1 AS k FROM installs WHERE hash = ?1').bind(hash).first();
	if (!known && await overIpLimit(req, env, 'ping', NEW_INSTALLS_PER_IP_PER_DAY)) {
		return new Response('too many new installs from this network', { status: 429 });
	}
	await env.DB.batch([
		env.DB.prepare(
			`INSERT INTO installs (hash, first_day, last_day, platform, version) VALUES (?1, ?2, ?2, ?3, ?4)
			 ON CONFLICT (hash) DO UPDATE SET last_day = ?2, platform = ?3, version = ?4`,
		).bind(hash, today, platform, version),
		env.DB.prepare('INSERT OR IGNORE INTO active (day, hash) VALUES (?1, ?2)').bind(today, hash),
	]);
	return nothing();
}

async function event(req: Request, env: Env): Promise<Response> {
	const body = await readObject(req);
	if (body instanceof Response) { return body; }
	const { install, name } = body;
	if (typeof install !== 'string' || typeof name !== 'string') { return bad('bad event'); }
	if (!UUID.test(install.toLowerCase()) || !EVENTS.has(name)) { return bad('bad event'); }
	if (await overIpLimit(req, env, 'event', EVENTS_PER_IP_PER_DAY)) { return new Response('too many', { status: 429 }); }
	await env.DB.prepare('INSERT INTO events (day, name, n) VALUES (?1, ?2, 1) ON CONFLICT (day, name) DO UPDATE SET n = n + 1').bind(day(), name).run();
	return nothing();
}

async function subscribe(req: Request, env: Env): Promise<Response> {
	const body = await readObject(req);
	if (body instanceof Response) { return body; }
	const email = cleanEmail(body.email);
	if (!email || typeof body.source !== 'string' || !SOURCES.has(body.source)) { return bad('bad email'); }
	if (await overIpLimit(req, env, 'subscribe', SUBSCRIBES_PER_IP_PER_DAY)) { return new Response('too many, try again tomorrow', { status: 429 }); }
	const token = [...crypto.getRandomValues(new Uint8Array(16))].map(b => b.toString(16).padStart(2, '0')).join('');
	// an address that is already on the list gets the same answer, so the form cannot be used to look people up
	await env.DB.prepare('INSERT OR IGNORE INTO subscribers (email, source, token, created_at) VALUES (?1, ?2, ?3, ?4)')
		.bind(email, body.source, token, new Date().toISOString()).run();
	return nothing();
}

const LINE_PAGE = (text: string): string => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>OpenTempl</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0c0c0e;color:#f2f1ec;font:16px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}p{margin:0 20px;text-align:center}</style></head><body><p>${text}</p></body></html>`;

async function unsubscribe(url: URL, env: Env): Promise<Response> {
	const token = url.searchParams.get('token') ?? '';
	if (/^[0-9a-f]{32}$/.test(token)) {
		await env.DB.prepare('DELETE FROM subscribers WHERE token = ?1').bind(token).run();
	}
	// the same line whether or not the token matched
	return new Response(LINE_PAGE('You are off the list, and your address is deleted.'), {
		headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' },
	});
}

async function count(env: Env, sql: string, ...args: unknown[]): Promise<number> {
	return Number((await env.DB.prepare(sql).bind(...args).first<{ n: number }>())?.n ?? 0);
}

async function pub(env: Env): Promise<Record<string, number>> {
	const [installs30d, designs, exports] = await Promise.all([
		count(env, 'SELECT COUNT(DISTINCT hash) AS n FROM active WHERE day >= ?1', day(29)),
		count(env, "SELECT COALESCE(SUM(n), 0) AS n FROM events WHERE name = 'design_created'"),
		count(env, "SELECT COALESCE(SUM(n), 0) AS n FROM events WHERE name = 'export'"),
	]);
	return { installs30d, designs, exports };
}

async function stats(env: Env): Promise<Stats> {
	const all = async <T>(sql: string, ...args: unknown[]): Promise<T[]> => (await env.DB.prepare(sql).bind(...args).all<T>()).results;
	const names = [...EVENTS];
	const events = await Promise.all(names.map(async name => ({
		name,
		today: await count(env, 'SELECT COALESCE(SUM(n), 0) AS n FROM events WHERE name = ?1 AND day = ?2', name, day()),
		week: await count(env, 'SELECT COALESCE(SUM(n), 0) AS n FROM events WHERE name = ?1 AND day >= ?2', name, day(6)),
		month: await count(env, 'SELECT COALESCE(SUM(n), 0) AS n FROM events WHERE name = ?1 AND day >= ?2', name, day(29)),
		total: await count(env, 'SELECT COALESCE(SUM(n), 0) AS n FROM events WHERE name = ?1', name),
	})));
	return {
		installs: await count(env, 'SELECT COUNT(*) AS n FROM installs'),
		newToday: await count(env, 'SELECT COUNT(*) AS n FROM installs WHERE first_day = ?1', day()),
		newWeek: await count(env, 'SELECT COUNT(*) AS n FROM installs WHERE first_day >= ?1', day(6)),
		activeToday: await count(env, 'SELECT COUNT(*) AS n FROM active WHERE day = ?1', day()),
		activeWeek: await count(env, 'SELECT COUNT(DISTINCT hash) AS n FROM active WHERE day >= ?1', day(6)),
		activeMonth: await count(env, 'SELECT COUNT(DISTINCT hash) AS n FROM active WHERE day >= ?1', day(29)),
		byPlatform: await all('SELECT platform, COUNT(*) AS n FROM installs WHERE last_day >= ?1 GROUP BY platform ORDER BY n DESC', day(29)),
		byVersion: await all('SELECT version, COUNT(*) AS n FROM installs WHERE last_day >= ?1 GROUP BY version ORDER BY n DESC', day(29)),
		daily: await all('SELECT day, COUNT(*) AS active FROM active WHERE day >= ?1 GROUP BY day ORDER BY day', day(29)),
		newDaily: await all('SELECT first_day AS day, COUNT(*) AS n FROM installs WHERE first_day >= ?1 GROUP BY first_day ORDER BY first_day', day(29)),
		events,
		subscribers: {
			total: await count(env, 'SELECT COUNT(*) AS n FROM subscribers'),
			week: await count(env, 'SELECT COUNT(*) AS n FROM subscribers WHERE created_at >= ?1', new Date(Date.now() - 7 * 86_400_000).toISOString()),
			byFooter: await count(env, "SELECT COUNT(*) AS n FROM subscribers WHERE source = 'footer'"),
			byExport: await count(env, "SELECT COUNT(*) AS n FROM subscribers WHERE source = 'export'"),
		},
	};
}

function withCors(res: Response, origin: string | null): Response {
	const allowed = allowedOrigin(origin);
	if (!allowed) { return res; }
	const out = new Response(res.body, res);
	out.headers.set('access-control-allow-origin', allowed);
	out.headers.set('vary', 'origin');
	return out;
}

async function route(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	const url = new URL(req.url);
	const { pathname } = url;
	if (req.method === 'OPTIONS') {
		return new Response(null, { status: 204, headers: { 'access-control-allow-methods': 'GET, POST', 'access-control-allow-headers': 'content-type', 'access-control-max-age': '86400' } });
	}
	if (req.method === 'POST') {
		if (pathname === '/v1/ping') { return ping(req, env); }
		if (pathname === '/v1/event') { return event(req, env); }
		if (pathname === '/v1/subscribe') { return subscribe(req, env); }
	}
	if (req.method === 'GET') {
		if (pathname === '/v1/unsubscribe') { return unsubscribe(url, env); }
		if (pathname === '/v1/public') {
			const cache = caches.default;
			const cacheKey = new Request(`${url.origin}/v1/public`);
			const hit = await cache.match(cacheKey);
			if (hit) { return hit; }
			const res = Response.json(await pub(env), { headers: { 'cache-control': 'public, max-age=3600' } });
			ctx.waitUntil(cache.put(cacheKey, res.clone()));
			return res;
		}
		if (pathname === '/stats' || pathname === '/stats.json') {
			if (!sameKey(url.searchParams.get('key') ?? '', env.STATS_KEY ?? '')) { return new Response('Not found', { status: 404 }); }
			const s = await stats(env);
			const headers = { 'cache-control': 'no-store', 'x-robots-tag': 'noindex' };
			if (pathname === '/stats.json') { return Response.json(s, { headers }); }
			const days = Array.from({ length: 30 }, (_, i) => day(29 - i));
			return new Response(renderDashboard(s, days), { headers: { ...headers, 'content-type': 'text/html; charset=utf-8' } });
		}
	}
	return new Response('OpenTempl anonymous counts. See https://opentempl.org/privacy', { status: 200 });
}

export default {
	async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const res = await route(req, env, ctx);
		return withCors(res, req.headers.get('origin'));
	},
} satisfies ExportedHandler<Env>;
