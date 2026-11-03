import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { buildDesign, crowded, DraftError, outline, type Design, type Draft, type Op, type Sources, type TemplateDef } from './recipe';
import { GUIDE, INSTRUCTIONS } from './guide';

// The OpenTempl MCP server. Stateless: templates and the catalog come from the
// site, designs live as drafts in the drafts worker, previews are drawn by the
// same worker in a headless browser running the real editor.

const SITE = process.env.OPENTEMPL_SITE ?? 'https://opentempl.org';
const DRAFTS = process.env.OPENTEMPL_DRAFTS ?? 'https://opentempl-drafts.opencursor.workers.dev';
const VERSION = '1.0.0';

// ---------------------------------------------------------------- data

interface TemplateEntry {
  id: string;
  name: string;
  vibe: string;
  category: string;
  tags: string[];
  width: number;
  height: number;
  formatId?: string;
  pages: number;
  score?: number;
}
interface Index {
  vibes: Record<string, { name: string; blurb: string }>;
  templates: TemplateEntry[];
}
interface Style {
  name: string;
  blurb: string;
  templates: number;
  displayFonts: string[];
  textFonts: string[];
  palette: string[];
  best: string[];
}
interface Catalog {
  formats: { id: string; name: string; group: string; width: number; height: number; note?: string }[];
  fonts: [string, string, number[], number][];
  styles: Record<string, Style>;
  library: { path: string; kind: string; name: string; w: number; h: number }[];
}

const cache = new Map<string, { at: number; value: Promise<unknown> }>();
function cached<T>(key: string, load: () => Promise<T>, ttl = 10 * 60_000): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttl) return hit.value as Promise<T>;
  const value = load();
  cache.set(key, { at: Date.now(), value });
  value.catch(() => cache.delete(key));
  return value;
}

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`${new URL(url).pathname} answered ${res.status}`);
  return res.json() as Promise<T>;
}

const index = () => cached('index', () => getJson<Index>(`${SITE}/templates/index.json`));
const catalog = () => cached('catalog', () => getJson<Catalog>(`${SITE}/mcp/catalog.json`));
const pack = (vibe: string) => cached(`pack:${vibe}`, () => getJson<(TemplateDef & { vibe: string })[]>(`${SITE}/templates/${vibe}.json`));

async function template(id: string): Promise<{ entry: TemplateEntry; def: TemplateDef }> {
  const entry = (await index()).templates.find((t) => t.id === id);
  if (!entry) throw new DraftError(`No template "${id}". search_templates lists real ids.`);
  const def = (await pack(entry.vibe)).find((t) => t.id === id);
  if (!def) throw new DraftError(`Template "${id}" could not be loaded.`);
  return { entry, def };
}

async function sources(draft: Draft): Promise<Sources> {
  const cat = await catalog();
  const s = draft.start as { template?: string; format?: string };
  return {
    template: s.template ? (await template(s.template)).def : undefined,
    format: s.format ? cat.formats.find((f) => f.id === s.format) : undefined,
    fonts: new Set(cat.fonts.map((f) => f[0])),
  };
}

const thumb = async (id: string) => {
  const res = await fetch(`${SITE}/templates/thumbs/${id}.jpg`, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) return null;
  return { type: 'image' as const, data: Buffer.from(await res.arrayBuffer()).toString('base64'), mimeType: 'image/jpeg' };
};

// ---------------------------------------------------------------- drafts

interface Stored {
  id: string;
  version: number;
  draft: Draft;
}

const key = () => {
  const k = process.env.OPENTEMPL_DRAFTS_KEY;
  if (!k) throw new Error('The server is missing its drafts key.');
  return k;
};

async function saveDraft(draft: Draft, id?: string): Promise<{ id: string; version: number }> {
  return getJson(`${DRAFTS}/v1/drafts${id ? `/${id}` : ''}`, {
    method: id ? 'PUT' : 'POST',
    headers: { authorization: `Bearer ${key()}`, 'content-type': 'application/json' },
    body: JSON.stringify(draft),
  });
}

async function loadDraft(id: string): Promise<Stored> {
  const clean = id.trim().replace(/^.*#\/open\//, '');
  if (!/^[A-Za-z0-9]{12}$/.test(clean)) throw new DraftError(`"${id}" is not a design id. It is the 12 characters create_design returned.`);
  const res = await fetch(`${DRAFTS}/v1/drafts/${clean}`, { signal: AbortSignal.timeout(15_000) });
  if (res.status === 404) throw new DraftError(`No design "${clean}". It may have expired (designs are kept 90 days after their last edit).`);
  if (!res.ok) throw new Error(`The design store answered ${res.status}`);
  return res.json() as Promise<Stored>;
}

const link = (id: string) => `${SITE}/#/open/${id}`;

interface Rendered {
  images: CallToolResult['content'];
  note?: string;
}

async function render(draft: Draft, pages: string[], maxSide: number): Promise<Rendered> {
  try {
    const res = await fetch(`${DRAFTS}/v1/render`, {
      method: 'POST',
      headers: { authorization: `Bearer ${key()}`, 'content-type': 'application/json' },
      body: JSON.stringify({ draft, pages, maxSide }),
      signal: AbortSignal.timeout(55_000),
    });
    const body = (await res.json()) as { pages?: { id: string; jpg: string }[]; missing?: string[]; error?: string };
    if (!res.ok || !body.pages) {
      return { images: [], note: res.status === 503 ? 'No preview this time: the preview service is busy or has used its free time for today. The link still opens the design.' : `No preview this time (${body.error ?? res.status}). The link still opens the design.` };
    }
    const images: CallToolResult['content'] = [];
    for (const p of body.pages) {
      images.push({ type: 'text', text: `Preview of page ${p.id}:` });
      images.push({ type: 'image', data: p.jpg, mimeType: 'image/jpeg' });
    }
    const note = body.missing?.length ? `These photos could not be loaded, so their frames are empty: ${body.missing.join(', ')}. The site may not share its images; use search_photos or list_library instead.` : undefined;
    return { images, note };
  } catch (e) {
    return { images: [], note: `No preview this time (${(e as Error).message}). The link still opens the design.` };
  }
}

// ---------------------------------------------------------------- edits

const id = z.string().describe('Element id (p1-e3, n2) or page id (p1), as listed by the tools');
const props = z.record(z.string(), z.any());

const EditSchema = z.discriminatedUnion('op', [
  z.object({ op: z.literal('set_text'), id, text: z.string(), fit: z.enum(['shrink', 'grow', 'none']).optional() }),
  z.object({ op: z.literal('style'), id, props: props.describe('Properties to change, e.g. {"fontSize": 96, "color": "#111"}') }),
  z.object({
    op: z.literal('set_image'),
    id: id.describe('An image element, a shape, or a page id for the page background'),
    url: z.string().optional(),
    library: z.string().optional().describe('A path from list_library'),
    credit: z.string().optional(),
    download: z.string().optional().describe('Unsplash download link from search_photos'),
    fit: z.enum(['cover', 'contain', 'tile']).optional(),
  }),
  z.object({ op: z.literal('add'), page: z.string(), element: props.describe('{"type": "text" | "shape" | "line" | "image" | "icon" | "svg" | "qr" | "chart" | "table" | "draw", ...props}'), below: z.string().optional() }),
  z.object({ op: z.literal('duplicate'), id, dx: z.number().optional(), dy: z.number().optional(), props: props.optional() }),
  z.object({ op: z.literal('remove'), id }),
  z.object({ op: z.literal('recolor'), from: z.string(), to: z.string() }),
  z.object({
    op: z.literal('page'),
    id: z.string(),
    background: z.any().optional(),
    name: z.string().optional(),
    notes: z.string().optional(),
    transition: z.string().optional(),
    duration: z.number().optional(),
    hidden: z.boolean().optional(),
  }),
  z.object({ op: z.literal('add_page'), copy: z.string().optional(), after: z.string().optional(), background: z.any().optional(), name: z.string().optional() }),
  z.object({ op: z.literal('move_page'), id: z.string(), to: z.number() }),
  z.object({ op: z.literal('arrange'), id, to: z.enum(['front', 'back', 'forward', 'backward']) }),
  z.object({ op: z.literal('title'), title: z.string() }),
]);

const edits = z.array(EditSchema).max(400).describe('Edits applied in order. design_guide has the full reference.');

// Icons are stored as their SVG so a design never depends on the icon service again.
async function resolveIcons(ops: Op[]) {
  for (const op of ops) {
    if (op.op !== 'add' || op.element?.type !== 'icon') continue;
    const name = String(op.element.icon ?? '');
    if (!/^[a-z0-9-]+:[a-z0-9-]+$/.test(name)) throw new DraftError(`Icon names look like "ph:star-bold"; "${name}" is not one. search_icons finds them.`);
    const [prefix, icon] = name.split(':');
    const res = await fetch(`https://api.iconify.design/${prefix}/${icon}.svg`, { signal: AbortSignal.timeout(10_000) });
    const svg = res.ok ? await res.text() : '';
    if (!svg.startsWith('<svg')) throw new DraftError(`Icon "${name}" was not found. search_icons lists real names.`);
    op.element.svg = svg.replace(/\swidth="[^"]*"|\sheight="[^"]*"/g, '');
  }
}

// The pages an edit touches, so the preview shows what changed. A colour swap touches them all.
function previewPages(d: Design, ops: Op[], limit: number): string[] {
  const pageOf = new Map<string, string>();
  for (const p of d.pages) {
    pageOf.set(p.id, p.id);
    for (const e of p.elements) pageOf.set(e.id, p.id);
  }
  const hit = new Set<string>();
  // New pages take the next free number, so the newest are the highest numbered.
  const newest = [...d.pages].sort((a, b) => Number(b.id.slice(1)) - Number(a.id.slice(1)));
  let added = 0;
  for (const op of ops) {
    if (op.op === 'recolor') return d.pages.slice(0, limit).map((p) => p.id);
    const o = op as { id?: string; page?: string };
    const p = op.op === 'add_page' ? newest[added++]?.id : pageOf.get(o.page ?? o.id ?? '');
    if (p) hit.add(p);
  }
  const list = hit.size ? d.pages.filter((p) => hit.has(p.id)) : d.pages.slice(0, 1);
  return list.slice(0, limit).map((p) => p.id);
}

const SIZES = { small: 640, medium: 1000, large: 1500 };

async function respond(stored: { id: string; version: number }, draft: Draft, d: Design, opts: { ops: Op[]; preview: boolean; size: keyof typeof SIZES; full: boolean; lead: string }): Promise<CallToolResult> {
  const pages = previewPages(d, opts.ops, 4);
  const shot = opts.preview ? await render(draft, pages, SIZES[opts.size]) : { images: [] };
  const warn = crowded(d);
  const head = [`${opts.lead} Design ${stored.id}, version ${stored.version}.`, `Open it in OpenTempl: ${link(stored.id)}`];
  if (shot.note) head.push(shot.note);
  if (warn.length) head.push(`Check these:\n${warn.map((w) => `- ${w}`).join('\n')}`);
  const text = `${head.join('\n')}\n\n${outline(d, opts.full ? {} : { pages })}`;
  return { content: [{ type: 'text', text }, ...shot.images], structuredContent: { design_id: stored.id, version: stored.version, link: link(stored.id) } };
}

// ---------------------------------------------------------------- search

const words = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean);

function scoreTemplate(t: TemplateEntry, style: { name: string; blurb: string } | undefined, q: string[]) {
  if (!q.length) return t.score ?? 5;
  const name = words(t.name);
  const tags = t.tags.flatMap(words);
  const other = [...words(t.category), ...words(style?.name ?? ''), ...words(style?.blurb ?? ''), ...words(t.vibe)];
  let s = 0;
  for (const w of q) {
    const stem = w.replace(/s$/, '');
    const has = (list: string[]) => list.some((x) => x === w || x.replace(/s$/, '') === stem || (stem.length > 3 && x.startsWith(stem)));
    if (has(name)) s += 6;
    if (has(tags)) s += 4;
    if (has(other)) s += 2;
  }
  return s ? s + (t.score ?? 5) / 3 : 0;
}

const err = (e: unknown): CallToolResult => ({ isError: true, content: [{ type: 'text', text: e instanceof DraftError ? e.message : `Something went wrong: ${(e as Error).message}` }] });

const safe =
  <A>(fn: (a: A) => Promise<CallToolResult>) =>
  async (a: A) => {
    try {
      return await fn(a);
    } catch (e) {
      return err(e);
    }
  };

// ---------------------------------------------------------------- server

export function createServer() {
  const server = new McpServer({ name: 'opentempl', title: 'OpenTempl', version: VERSION, websiteUrl: SITE } as never, { instructions: INSTRUCTIONS });
  const read = { readOnlyHint: true, openWorldHint: true };

  server.registerTool(
    'design_guide',
    { title: 'Design guide', description: 'The handbook: how designs are built here, every edit and property, and the rules that make a design look professional. Read it before your first design.', inputSchema: {}, annotations: read },
    async () => ({ content: [{ type: 'text', text: GUIDE }] }),
  );

  server.registerTool(
    'list_styles',
    {
      title: 'List template styles',
      description: 'The 34 template styles (Swiss grid, Riso zine, Quiet luxury ...) with the fonts and colours each one uses and its best templates. Use it to choose a direction or borrow a proven palette and font pairing.',
      inputSchema: {},
      annotations: read,
    },
    safe(async () => {
      const cat = await catalog();
      const text = Object.entries(cat.styles)
        .map(([id, s]) => `${id}: ${s.name}. ${s.blurb} ${s.templates} templates.\n  display fonts: ${s.displayFonts.join(', ')} · text fonts: ${s.textFonts.join(', ')}\n  palette: ${s.palette.join(' ')}\n  best: ${s.best.join(', ')}`)
        .join('\n');
      return { content: [{ type: 'text', text }] };
    }),
  );

  server.registerTool(
    'list_formats',
    { title: 'List sizes', description: 'Every ready made size (Instagram post, story, slides, A4, A3 poster, business card ...) with its id and pixel size.', inputSchema: {}, annotations: read },
    safe(async () => {
      const cat = await catalog();
      return { content: [{ type: 'text', text: cat.formats.map((f) => `${f.id}: ${f.name} (${f.group}) ${f.width}×${f.height}px${f.note ? `, ${f.note}` : ''}`).join('\n') }] };
    }),
  );

  server.registerTool(
    'list_library',
    {
      title: 'List the art library',
      description: "OpenTempl's own images, free to use: photographs, illustrations and prints, stickers with transparent backgrounds, page backgrounds (mesh gradients, paper) and textures (grain, paper, brush). Place them with set_image or an image element using library: <path>.",
      inputSchema: { kind: z.enum(['photos', 'art', 'stickers', 'backgrounds', 'tex']).optional().describe('Only this folder') },
      annotations: read,
    },
    safe(async ({ kind }) => {
      const cat = await catalog();
      const list = cat.library.filter((l) => !kind || l.path.startsWith(`${kind}/`));
      return { content: [{ type: 'text', text: list.map((l) => `${l.path}  ${l.w}×${l.h}  ${l.kind}`).join('\n') }] };
    }),
  );

  server.registerTool(
    'search_templates',
    {
      title: 'Search templates',
      description: 'Search the 337 templates by words (what it is for, mood, subject), style, size or category. Returns ids and previews of the best matches. Leave the query empty to see the highest rated.',
      inputSchema: {
        query: z.string().optional().describe('e.g. "jazz night poster", "bakery menu", "pitch deck", "wedding invitation"'),
        style: z.string().optional().describe('A style id from list_styles, e.g. swiss-grid'),
        format: z.string().optional().describe('A size id from list_formats, e.g. ig-post, story, slides, a3-poster'),
        multi_page: z.boolean().optional().describe('true for decks and multi page designs only'),
        limit: z.number().int().min(1).max(30).optional().describe('How many results, default 8'),
        previews: z.number().int().min(0).max(8).optional().describe('How many of the top results to show as images, default 4'),
      },
      annotations: read,
    },
    safe(async ({ query, style, format, multi_page, limit = 8, previews = 4 }) => {
      const idx = await index();
      const q = words(query ?? '');
      const hits = idx.templates
        .filter((t) => (!style || t.vibe === style) && (!format || t.formatId === format) && (multi_page === undefined || multi_page === t.pages > 1))
        .map((t) => ({ t, s: scoreTemplate(t, idx.vibes[t.vibe], q) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, limit);
      if (!hits.length) return { content: [{ type: 'text', text: 'No templates match. Try fewer or broader words, or drop the style and format filters.' }] };
      const text = hits
        .map(({ t }) => `${t.id}: ${t.name} · ${idx.vibes[t.vibe]?.name ?? t.vibe} · ${t.category} · ${t.formatId ?? ''} ${t.width}×${t.height} · ${t.pages} page${t.pages > 1 ? 's' : ''} · rated ${t.score ?? 5}/10`)
        .join('\n');
      const imgs = (await Promise.all(hits.slice(0, previews).map(async ({ t }) => [t.id, await thumb(t.id)] as const))).flatMap(([tid, im]) => (im ? [{ type: 'text' as const, text: `${tid}:` }, im] : []));
      return { content: [{ type: 'text', text }, ...imgs] };
    }),
  );

  server.registerTool(
    'get_template',
    {
      title: 'Look at a template',
      description: "A template's pages and every element (ids, text, fonts, sizes, colours, positions) with its preview. raw: true returns the exact element JSON, to learn how a polished layout is built.",
      inputSchema: { id: z.string(), raw: z.boolean().optional(), page: z.number().int().min(1).optional().describe('With raw: only this page (1 based)') },
      annotations: read,
    },
    safe(async ({ id: tid, raw, page }) => {
      const { entry, def } = await template(tid);
      const d = buildDesign({ v: 1, start: { template: tid }, ops: [] }, { template: def });
      const im = await thumb(tid);
      const body = raw ? JSON.stringify(page ? d.pages[page - 1] : d.pages, null, 0) : outline(d);
      return {
        content: [{ type: 'text', text: `${entry.name} (${entry.vibe}, ${entry.category})\n${body}` }, ...(im ? [im] : [])],
      };
    }),
  );

  server.registerTool(
    'create_design',
    {
      title: 'Create a design',
      description:
        'Start a design from a template, a size id, or a custom width and height, apply edits, and get back its id, a link that opens it in OpenTempl, its elements, and a rendered preview. Use the preview to check your work and edit_design to refine.',
      inputSchema: {
        template: z.string().optional().describe('Template id from search_templates'),
        format: z.string().optional().describe('Size id from list_formats, for a blank design'),
        width: z.number().optional(),
        height: z.number().optional(),
        title: z.string().optional(),
        edits: edits.optional(),
        preview: z.boolean().optional().describe('Render a preview (default true)'),
        preview_size: z.enum(['small', 'medium', 'large']).optional(),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    safe(async ({ template: tid, format, width, height, title, edits: ops = [], preview = true, preview_size = 'medium' }) => {
      const start = tid ? { template: tid } : format ? { format } : width && height ? { width, height } : null;
      if (!start) throw new DraftError('Give a template id, a format id, or a width and height.');
      const draft: Draft = { v: 1, title, start, ops: ops as Op[] };
      await resolveIcons(draft.ops);
      const d = buildDesign(draft, await sources(draft));
      const stored = await saveDraft(draft);
      return respond(stored, draft, d, { ops: draft.ops.length ? draft.ops : [], preview, size: preview_size, full: true, lead: 'Created.' });
    }),
  );

  server.registerTool(
    'edit_design',
    {
      title: 'Edit a design',
      description: 'Apply more edits to a design made with create_design. Returns the updated elements of the pages that changed and a fresh preview. The link stays the same and opens the newest version.',
      inputSchema: { design_id: z.string(), edits, preview: z.boolean().optional(), preview_size: z.enum(['small', 'medium', 'large']).optional() },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    safe(async ({ design_id, edits: ops, preview = true, preview_size = 'medium' }) => {
      const rec = await loadDraft(design_id);
      const added = ops as Op[];
      await resolveIcons(added);
      const draft: Draft = { ...rec.draft, ops: [...rec.draft.ops, ...added] };
      const d = buildDesign(draft, await sources(draft));
      const stored = await saveDraft(draft, rec.id);
      return respond(stored, draft, d, { ops: added, preview, size: preview_size, full: false, lead: `Applied ${added.length} edit${added.length === 1 ? '' : 's'}.` });
    }),
  );

  server.registerTool(
    'undo_edits',
    {
      title: 'Undo edits',
      description: 'Take back the last edits made to a design (count of edits, not calls).',
      inputSchema: { design_id: z.string(), count: z.number().int().min(1).describe('How many of the most recent edits to remove') },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    },
    safe(async ({ design_id, count }) => {
      const rec = await loadDraft(design_id);
      const draft: Draft = { ...rec.draft, ops: rec.draft.ops.slice(0, Math.max(0, rec.draft.ops.length - count)) };
      const d = buildDesign(draft, await sources(draft));
      const stored = await saveDraft(draft, rec.id);
      return respond(stored, draft, d, { ops: [], preview: true, size: 'medium', full: true, lead: `Removed the last ${Math.min(count, rec.draft.ops.length)} edits.` });
    }),
  );

  server.registerTool(
    'get_design',
    {
      title: 'Read a design',
      description: "A design's pages and elements with ids. raw: true returns exact element JSON (optionally one page), and history: true lists the edits so far.",
      inputSchema: { design_id: z.string(), raw: z.boolean().optional(), page: z.string().optional().describe('Page id, e.g. p2'), history: z.boolean().optional() },
      annotations: read,
    },
    safe(async ({ design_id, raw, page, history }) => {
      const rec = await loadDraft(design_id);
      const d = buildDesign(rec.draft, await sources(rec.draft));
      const parts = [`Design ${rec.id}, version ${rec.version}. Link: ${link(rec.id)}`];
      if (history) parts.push(`Started from ${JSON.stringify(rec.draft.start)}. Edits:\n${rec.draft.ops.map((o, i) => `${i + 1}. ${JSON.stringify(o).slice(0, 300)}`).join('\n')}`);
      parts.push(raw ? JSON.stringify(page ? d.pages.filter((p) => p.id === page) : d.pages) : outline(d, page ? { pages: [page] } : {}));
      return { content: [{ type: 'text', text: parts.join('\n\n') }] };
    }),
  );

  server.registerTool(
    'preview_design',
    {
      title: 'Preview a design',
      description: 'Render pages of a design as images, exactly as the editor draws them.',
      inputSchema: { design_id: z.string(), pages: z.array(z.string()).max(8).optional().describe('Page ids; default the first four'), size: z.enum(['small', 'medium', 'large']).optional() },
      annotations: read,
    },
    safe(async ({ design_id, pages, size = 'medium' }) => {
      const rec = await loadDraft(design_id);
      const d = buildDesign(rec.draft, await sources(rec.draft));
      const list = pages?.length ? pages : d.pages.slice(0, 4).map((p) => p.id);
      const shot = await render(rec.draft, list, SIZES[size]);
      return { content: [{ type: 'text', text: shot.note ?? `Design ${rec.id}, ${d.pages.length} page${d.pages.length > 1 ? 's' : ''}. Link: ${link(rec.id)}` }, ...shot.images] };
    }),
  );

  server.registerTool(
    'search_photos',
    {
      title: 'Search photos',
      description: 'Search free Unsplash photos. Place one with set_image, or an image element, passing its url, credit and download exactly as given (Unsplash requires the credit and the download report).',
      inputSchema: {
        query: z.string().min(1).max(100),
        orientation: z.enum(['landscape', 'portrait', 'squarish']).optional(),
        color: z.enum(['black_and_white', 'black', 'white', 'yellow', 'orange', 'red', 'purple', 'magenta', 'green', 'teal', 'blue']).optional(),
        count: z.number().int().min(1).max(12).optional().describe('Default 6'),
        previews: z.boolean().optional().describe('Show small images of the results (default true)'),
      },
      annotations: read,
    },
    safe(async ({ query, orientation, color, count = 6, previews = true }) => {
      const k = process.env.UNSPLASH_ACCESS_KEY;
      if (!k) throw new DraftError('Photo search is not set up on this server. Use list_library instead.');
      const params = new URLSearchParams({ query, per_page: String(count), content_filter: 'high' });
      if (orientation) params.set('orientation', orientation);
      if (color) params.set('color', color);
      const res = await fetch(`https://api.unsplash.com/search/photos?${params}`, { headers: { Authorization: `Client-ID ${k}`, 'Accept-Version': 'v1' }, signal: AbortSignal.timeout(15_000) });
      if (res.status === 403 || res.status === 429) throw new DraftError('Photo search has hit its hourly limit. Try again later or use list_library.');
      if (!res.ok) throw new Error(`Unsplash answered ${res.status}`);
      const json = (await res.json()) as { results: { id: string; width: number; height: number; color: string; alt_description?: string; description?: string; urls: { regular: string; small: string; thumb: string }; user: { name: string }; links: { download_location: string } }[] };
      if (!json.results.length) return { content: [{ type: 'text', text: 'No photos found. Try simpler words.' }] };
      const content: CallToolResult['content'] = [];
      const lines = json.results.map(
        (p, i) =>
          `${i + 1}. ${p.alt_description ?? p.description ?? 'Photo'} · ${p.width}×${p.height} · main colour ${p.color}\n   url: ${p.urls.regular.replace(/&w=\d+/, '&w=2400')}\n   credit: Photo by ${p.user.name} on Unsplash\n   download: ${p.links.download_location}`,
      );
      content.push({ type: 'text', text: lines.join('\n') });
      if (previews) {
        const imgs = await Promise.all(
          json.results.map(async (p, i) => {
            try {
              const r = await fetch(p.urls.thumb, { signal: AbortSignal.timeout(8_000) });
              return r.ok ? [{ type: 'text' as const, text: `${i + 1}:` }, { type: 'image' as const, data: Buffer.from(await r.arrayBuffer()).toString('base64'), mimeType: r.headers.get('content-type') ?? 'image/jpeg' }] : [];
            } catch {
              return [];
            }
          }),
        );
        content.push(...imgs.flat());
      }
      return { content };
    }),
  );

  server.registerTool(
    'search_icons',
    {
      title: 'Search icons',
      description: 'Search 200,000 open source icons. Add one as an element: {"type": "icon", "icon": "<name>", "color": "#111", "x", "y", "w", "h"}. Keep to one icon set per design (the part before the colon).',
      inputSchema: {
        query: z.string().min(1).max(60),
        set: z.string().optional().describe('Only this icon set, e.g. ph (Phosphor), lucide, tabler, mdi, material-symbols, solar, iconoir, simple-icons (brand logos)'),
        limit: z.number().int().min(1).max(64).optional(),
      },
      annotations: read,
    },
    safe(async ({ query, set, limit = 24 }) => {
      const params = new URLSearchParams({ query, limit: String(Math.max(32, limit)) });
      if (set) params.set('prefix', set);
      const j = await getJson<{ icons?: string[] }>(`https://api.iconify.design/search?${params}`);
      const icons = (j.icons ?? []).slice(0, limit);
      return { content: [{ type: 'text', text: icons.length ? icons.join('\n') : 'No icons found. Try one plain word.' }] };
    }),
  );

  server.registerTool(
    'search_fonts',
    {
      title: 'Search fonts',
      description: 'Find Google Fonts by name or kind, with their weights. Any of the 1,300+ families works in fontFamily.',
      inputSchema: {
        query: z.string().optional().describe('Part of a name, e.g. "grotesk", "mono", "garamond"'),
        category: z.enum(['sans', 'serif', 'display', 'hand', 'mono']).optional(),
        limit: z.number().int().min(1).max(100).optional(),
      },
      annotations: read,
    },
    safe(async ({ query, category, limit = 30 }) => {
      const cat = await catalog();
      const q = (query ?? '').toLowerCase();
      const list = cat.fonts.filter(([name, c]) => (!category || c === category) && (!q || name.toLowerCase().includes(q)));
      const sorted = [...list].sort((a, b) => b[3] - a[3]);
      return { content: [{ type: 'text', text: sorted.slice(0, limit).map(([n, c, w]) => `${n} (${c}) weights ${w.join(' ')}`).join('\n') || 'No fonts match.' }] };
    }),
  );

  server.registerPrompt(
    'design',
    {
      title: 'Design something',
      description: 'Make a finished design from a short brief.',
      argsSchema: { brief: z.string().describe('What to make, for whom, and any words, dates or colours that must be on it') },
    },
    ({ brief }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Design this in OpenTempl: ${brief}\n\nRead design_guide first. Look at a few matching templates for reference, then build it, check every preview against the checklist and refine until it looks professionally made. Finish with the link.`,
          },
        },
      ],
    }),
  );

  return server;
}
