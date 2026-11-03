import { useEffect, useState } from 'react';
import { Loading, navigate } from '../App';
import { createDesign } from '../io/designs';
import { db } from '../io/db';
import { track } from '../stats/client';
import { buildDraft, fetchDraft } from './draft';

// #/open/<draft id>: a design an assistant made through the MCP server. Opening it
// makes an ordinary design on this computer. Opening the same version again goes
// back to that design instead of making a copy; a newer version makes a new one.

const seenKey = (id: string) => `opentempl:draft:${id}`;

export function OpenDraft({ id }: { id: string }) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const rec = await fetchDraft(id);
        let seen: { version: number; design: string } | null = null;
        try {
          seen = JSON.parse(localStorage.getItem(seenKey(id)) ?? 'null');
        } catch {
          /* private window */
        }
        if (seen && seen.version === rec.version && (await db.get('designs', seen.design))) {
          if (live) window.location.replace(`#/d/${seen.design}`);
          return;
        }
        const built = await buildDraft(rec.draft, { reportDownloads: true });
        const design = await createDesign({ snapshot: built.snapshot, assets: built.assets });
        track('mcp_opened');
        try {
          localStorage.setItem(seenKey(id), JSON.stringify({ version: rec.version, design }));
        } catch {
          /* still opens */
        }
        if (live) window.location.replace(`#/d/${design}`);
      } catch (e) {
        if (live) setError((e as Error).message || 'Could not open this design.');
      }
    })();
    return () => {
      live = false;
    };
  }, [id]);

  if (!error) return <Loading label="Opening the design" />;
  return (
    <div style={{ height: '100%', display: 'grid', placeItems: 'center', background: 'var(--paper)' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 16, color: 'var(--ink-2)', fontWeight: 500, maxWidth: 360, textAlign: 'center' }}>
        {error}
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Go to OpenTempl
        </button>
      </div>
    </div>
  );
}
