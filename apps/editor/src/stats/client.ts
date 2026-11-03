import { useEffect, useState } from 'react';
import pkg from '../../package.json';

// Anonymous counts: one ping a day and a few named events, each carrying a random ID this browser made
// for itself. Nothing about the design, the person or the page is sent. See docs/PRIVACY.md.

const BASE = (import.meta.env.VITE_STATS_URL as string | undefined) ?? 'https://opentempl-stats.opencursor.workers.dev';
const INSTALL = 'opentempl:install';
const SHARE = 'opentempl:share-counts';
const PINGED = 'opentempl:pinged';

export type StatEvent = 'design_created' | 'template_opened' | 'export' | 'generate_used' | 'chatgpt_used' | 'photo_placed' | 'mcp_opened';
type Platform = 'web' | 'mac' | 'win' | 'linux';

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // private windows: counting simply stays off
  }
}

/** The person's own switch. On unless they turned it off. */
export function sharingOn(): boolean {
  return read(SHARE) !== 'off';
}

export function setSharing(on: boolean) {
  write(SHARE, on ? 'on' : 'off');
}

function allowed(): boolean {
  if (!sharingOn()) return false;
  if (navigator.doNotTrack === '1') return false;
  // Local work should not count, unless a build asks for it to test the wiring.
  return !import.meta.env.DEV || import.meta.env.VITE_STATS_DEV === '1';
}

function installId(): string | null {
  let id = read(INSTALL);
  if (!id) {
    id = crypto.randomUUID();
    write(INSTALL, id);
    if (read(INSTALL) !== id) return null;
  }
  return id;
}

function platform(): Platform {
  const p = (window as { tavlaDesktop?: { platform?: string } }).tavlaDesktop?.platform;
  return p === 'darwin' ? 'mac' : p === 'win32' ? 'win' : p === 'linux' ? 'linux' : 'web';
}

// text/plain keeps these simple requests, so the browser sends no preflight and a closing tab still delivers them.
function post(path: string, body: unknown) {
  const data = JSON.stringify(body);
  try {
    if (navigator.sendBeacon?.(`${BASE}${path}`, new Blob([data], { type: 'text/plain' }))) return;
    fetch(`${BASE}${path}`, { method: 'POST', body: data, headers: { 'content-type': 'text/plain' }, keepalive: true, credentials: 'omit' }).catch(() => {});
  } catch {
    // counting must never get in the way
  }
}

/** Once per UTC day, when the app opens. */
export function pingOncePerDay() {
  if (!allowed()) return;
  const today = new Date().toISOString().slice(0, 10);
  if (read(PINGED) === today) return;
  const install = installId();
  if (!install) return;
  write(PINGED, today);
  post('/v1/ping', { install, version: pkg.version, platform: platform() });
}

export function track(name: StatEvent) {
  if (!allowed()) return;
  const install = installId();
  if (install) post('/v1/event', { install, name });
}

export type SubscribeResult = 'ok' | 'invalid' | 'limited' | 'failed';

/** The email list is the person's own choice, so it works even with counting off. */
export async function subscribe(email: string, source: 'footer' | 'export'): Promise<SubscribeResult> {
  try {
    const res = await fetch(`${BASE}/v1/subscribe`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, source }),
      credentials: 'omit',
    });
    if (res.ok) {
      write('opentempl:subscribed', '1');
      return 'ok';
    }
    return res.status === 400 ? 'invalid' : res.status === 429 ? 'limited' : 'failed';
  } catch {
    return 'failed';
  }
}

export const isSubscribed = () => read('opentempl:subscribed') === '1';

// The export note is offered once per install, whatever the answer.
export const exportNoteSeen = () => read('opentempl:export-note') === '1';
export const markExportNoteSeen = () => write('opentempl:export-note', '1');

export type Usage = { installs30d: number; designs: number; exports: number };
let usage: Promise<Usage | null> | null = null;

/** The public totals for the "Used by" line, or null while loading and when the counter cannot be reached. */
export function useUsage(): Usage | null {
  const [value, setValue] = useState<Usage | null>(null);
  useEffect(() => {
    usage ??= fetch(`${BASE}/v1/public`, { credentials: 'omit' })
      .then((r) => (r.ok ? (r.json() as Promise<Usage>) : null))
      .catch(() => null);
    let live = true;
    usage.then((u) => live && setValue(u));
    return () => {
      live = false;
    };
  }, []);
  return value;
}

/** The "Used by" line stays hidden until this many people used the app in the last 30 days. */
export const SHOW_USAGE_FROM = 1000;
