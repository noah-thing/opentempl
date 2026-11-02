import { makeTemplate, type Template, type TemplateDef } from './index';

// Template packs: the big library lives in public/templates as one JSON file per
// vibe plus index.json. The gallery reads the index (small) and a pack is only
// fetched when one of its templates is opened.

export interface VibeInfo {
  name: string;
  blurb: string;
  order?: number;
}

export interface TemplateEntry {
  id: string;
  name: string;
  vibe: string;
  category: string;
  tags: string[];
  width: number;
  height: number;
  formatId?: string;
  pages: number;
  score?: number; // 1 to 10, how beautiful and hand made it looks
}

export interface TemplateIndex {
  vibes: Record<string, VibeInfo>;
  templates: TemplateEntry[];
}

const base = () => `${import.meta.env.BASE_URL}templates/`;

let indexPromise: Promise<TemplateIndex> | null = null;
export function loadTemplateIndex(): Promise<TemplateIndex> {
  indexPromise ??= fetch(base() + 'index.json')
    .then((r) => (r.ok ? r.json() : { vibes: {}, templates: [] }))
    .catch(() => ({ vibes: {}, templates: [] }));
  return indexPromise;
}

const packs = new Map<string, Promise<(TemplateDef & { vibe: string })[]>>();
export function loadPack(vibe: string) {
  if (!packs.has(vibe))
    packs.set(
      vibe,
      fetch(base() + `${vibe}.json`, { cache: import.meta.env.DEV ? 'no-store' : 'default' }).then((r) => (r.ok ? r.json() : [])),
    );
  return packs.get(vibe)!;
}

export function thumbUrl(id: string) {
  return base() + `thumbs/${id}.jpg`;
}

// Finds a template in the packs. With no vibe given it looks the id up in the index first.
export async function loadPackTemplate(id: string, vibe?: string): Promise<Template | undefined> {
  const v = vibe ?? (await loadTemplateIndex()).templates.find((t) => t.id === id)?.vibe;
  if (!v) return undefined;
  const def = (await loadPack(v)).find((t) => t.id === id);
  return def ? makeTemplate(def) : undefined;
}

// The owner's favourite vibes lead every mixed list, woven together, before the rest.
export const LEAD_VIBES = ['swiss-grid', 'pixel-bitmap', 'tech-mono', 'asia-poster'];

// Best first, with the vibes mixed: always the highest scoring template whose
// vibe hasn't appeared in the last few picks, so no one vibe clumps together.
function weave(list: TemplateEntry[], spread: number): TemplateEntry[] {
  const rest = [...list].sort((a, b) => (b.score ?? 5) - (a.score ?? 5));
  const out: TemplateEntry[] = [];
  while (rest.length) {
    const recent = new Set(out.slice(-spread).map((t) => t.vibe));
    const i = rest.findIndex((t) => !recent.has(t.vibe) && (t.score ?? 5) >= (rest[0].score ?? 5) - 1);
    out.push(rest.splice(i >= 0 ? i : 0, 1)[0]);
  }
  return out;
}

// The lead vibes' good templates first, taking strict turns (each vibe's next best), then everything else.
export function blended(list: TemplateEntry[]): TemplateEntry[] {
  const queues = LEAD_VIBES.map((v) => list.filter((t) => t.vibe === v && (t.score ?? 5) >= 6).sort((a, b) => (b.score ?? 5) - (a.score ?? 5)));
  const lead: TemplateEntry[] = [];
  while (queues.some((q) => q.length)) for (const q of queues) if (q.length) lead.push(q.shift()!);
  const leadIds = new Set(lead.map((t) => t.id));
  return [...lead, ...weave(list.filter((t) => !leadIds.has(t.id)), 4)];
}

export const byScore = (list: TemplateEntry[]) => [...list].sort((a, b) => (b.score ?? 5) - (a.score ?? 5));
