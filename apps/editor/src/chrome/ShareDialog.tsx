import { useState } from 'react';
import { useEditor } from '../editor/Editor';
import { Icon } from '../ui/icons';
import { activeCollab, connectCollab, localName, newRoomKey, setLocalName, usePeers } from '../collab/collab';
import { exportDesign } from '../export/exporters';

export function ShareDialog() {
  const editor = useEditor();
  const peers = usePeers();
  const [name, setName] = useState(localName());
  const [room, setRoom] = useState(() => new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('room'));
  const [copied, setCopied] = useState(false);
  const close = () => editor.ui.set({ shareOpen: false });

  const start = () => {
    const key = newRoomKey();
    const base = window.location.hash.split('?')[0];
    window.history.replaceState(null, '', `${window.location.pathname}${base}?room=${key}`);
    if (!activeCollab()) connectCollab(editor, key);
    setRoom(key);
  };
  const link = room ? `${window.location.origin}${window.location.pathname}#/join/${editor.s.meta.id}?room=${room}` : '';

  return (
    <div className="scrim" onPointerDown={(e) => e.target === e.currentTarget && close()}>
      <div className="dialog" role="dialog" aria-label="Share">
        <div className="dialog-head">
          <h2>Share</h2>
          <button className="icon-btn" onClick={close} title="Close">
            <Icon name="close" />
          </button>
        </div>
        <div className="dialog-body stack" style={{ gap: 18 }}>
          <div>
            <div className="label" style={{ marginBottom: 6 }}>
              Your name on other people's screens
            </div>
            <div className="field">
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setLocalName(e.target.value || 'Guest');
                }}
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div style={{ padding: 16, borderRadius: 14, background: 'var(--paper)' }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Design together, live</div>
            <p className="hint" style={{ margin: '0 0 12px' }}>
              Anyone with the link edits this design with you in real time. Changes travel directly between your browsers, encrypted with the key in the link. No account, no upload to a Tavla server.
            </p>
            {room ? (
              <div className="stack">
                <div className="field">
                  <input readOnly value={link} onFocus={(e) => e.target.select()} />
                  <button
                    className="btn btn-sm btn-ink"
                    onClick={() => {
                      navigator.clipboard.writeText(link);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1600);
                    }}
                  >
                    {copied ? 'Copied' : 'Copy link'}
                  </button>
                </div>
                <div className="hint">{peers.length ? `${peers.length} other ${peers.length === 1 ? 'person' : 'people'} here: ${peers.map((p) => p.name).join(', ')}` : 'Waiting for someone to open the link. Keep this tab open while you work together.'}</div>
              </div>
            ) : (
              <button className="btn btn-primary" onClick={start}>
                <Icon name="users" /> Start a live session
              </button>
            )}
          </div>
          <div style={{ padding: 16, borderRadius: 14, boxShadow: 'inset 0 0 0 1px var(--line)' }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Send a copy</div>
            <p className="hint" style={{ margin: '0 0 12px' }}>A .tavla file holds every page, photo and font choice. The other person opens it from File, Open.</p>
            <button
              className="btn btn-outline"
              onClick={() => exportDesign(editor.doc, { format: 'tavla', pageIds: [], scale: 1, transparent: false, quality: 0.9, pdfQuality: 'standard' })}
            >
              <Icon name="download" /> Download .tavla file
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
