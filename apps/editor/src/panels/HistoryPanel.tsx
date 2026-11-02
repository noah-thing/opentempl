import { useEffect, useState } from 'react';
import { useEditor } from '../editor/Editor';
import { listVersions, restoreVersion, saveVersion, versionSnapshot, type Version } from '../io/versions';
import { thumbnail } from '../export/render';
import { Icon } from '../ui/icons';

function when(t: number) {
  const d = new Date(t);
  const today = new Date();
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === today.toDateString()) return `Today ${time}`;
  return `${d.toLocaleDateString([], { day: 'numeric', month: 'short' })} ${time}`;
}

export default function HistoryPanel() {
  const editor = useEditor();
  const [list, setList] = useState<Version[] | null>(null);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const load = () => listVersions(editor.s.meta.id).then(setList);
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!list) return;
    let alive = true;
    (async () => {
      for (const v of list.slice(0, 12)) {
        if (thumbs[v.id]) continue;
        const { snapshot, doc } = versionSnapshot(v);
        try {
          const blob = await thumbnail(doc, snapshot, snapshot.pageOrder[0], 280);
          if (alive) setThumbs((t) => ({ ...t, [v.id]: URL.createObjectURL(blob) }));
        } catch {
          /* skip */
        }
        doc.destroy();
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list]);

  return (
    <>
      <button
        className="btn btn-ink btn-block"
        onClick={async () => {
          await saveVersion(editor.doc, 'Saved by hand');
          load();
          editor.toast('Version saved');
        }}
      >
        <Icon name="history" /> Save this moment
      </button>
      <p className="hint">OpenTempl also keeps a version every ten minutes you spend editing. The newest 40 stay.</p>
      {list === null ? (
        <div className="hint">Loading</div>
      ) : !list.length ? (
        <div className="empty">
          <h4>No versions yet</h4>
          <span className="hint">Keep working, or save one by hand.</span>
        </div>
      ) : (
        list.map((v) => (
          <div key={v.id} className="row" style={{ padding: '10px 0', borderBottom: '1px solid var(--line-2)' }}>
            <div style={{ width: 88, height: 60, borderRadius: 8, background: 'var(--paper)', overflow: 'hidden', flex: 'none' }}>
              {thumbs[v.id] ? <img src={thumbs[v.id]} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : null}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{when(v.at)}</div>
              <div className="hint">
                {v.label} · {v.pages} {v.pages === 1 ? 'page' : 'pages'}
              </div>
            </div>
            <button
              className="btn btn-sm btn-outline"
              onClick={async () => {
                await restoreVersion(editor.doc, v);
                editor.ui.set({ selection: [], activePageId: editor.s.pageOrder[0] });
                load();
                editor.toast('Restored. The version before it was saved too.');
              }}
            >
              Restore
            </button>
          </div>
        ))
      )}
    </>
  );
}
