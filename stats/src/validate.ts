export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export const VERSION = /^\d{1,3}\.\d{1,3}\.\d{1,3}(?:-[0-9a-z.]{1,20})?$/;
export const PLATFORMS = new Set(['web', 'mac', 'win', 'linux']);
export const EVENTS = new Set(['design_created', 'template_opened', 'export', 'generate_used', 'chatgpt_used', 'photo_placed']);
export const SOURCES = new Set(['footer', 'export']);

const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;

/** The address lowercased and trimmed, or null when it cannot be an email. */
export function cleanEmail(raw: unknown): string | null {
	if (typeof raw !== 'string') { return null; }
	const e = raw.trim().toLowerCase();
	if (e.length < 6 || e.length > 254 || e.indexOf('@') > 64) { return null; }
	return EMAIL.test(e) ? e : null;
}

const ORIGINS = new Set(['https://opentempl.org', 'https://www.opentempl.org', 'tavla://app']);

/** Browsers on this site, the desktop app and local dev servers may read responses. */
export function allowedOrigin(origin: string | null): string | null {
	if (!origin) { return null; }
	if (ORIGINS.has(origin)) { return origin; }
	return /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ? origin : null;
}
