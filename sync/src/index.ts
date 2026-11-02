import { ROOM_ID_PATTERN } from './protocol';

export { Room } from './room';

// The front door only routes: it checks the origin and the room id, then hands
// the socket to that room's Durable Object. Nothing here reads or logs a payload.

function originAllowed(origin: string | null, env: Env): boolean {
  if (!origin) return false;
  if (env.ALLOWED_ORIGINS.split(',').includes(origin)) return true;
  return /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/') return new Response('opentempl-sync\n', { headers: { 'content-type': 'text/plain' } });

    const match = url.pathname.match(/^\/v1\/room\/([^/]+)$/);
    if (!match) return new Response('Not found', { status: 404 });
    if (request.headers.get('Upgrade') !== 'websocket') return new Response('Expected a WebSocket', { status: 426 });
    if (!originAllowed(request.headers.get('Origin'), env)) return new Response('Origin not allowed', { status: 403 });
    if (!ROOM_ID_PATTERN.test(match[1])) return new Response('Bad room id', { status: 400 });
    const ip = request.headers.get('cf-connecting-ip');
    if (ip && env.OPENS && !(await env.OPENS.limit({ key: ip })).success) return new Response('Too many connections', { status: 429 });

    return env.ROOMS.get(env.ROOMS.idFromName(match[1])).fetch(request);
  },
} satisfies ExportedHandler<Env>;
