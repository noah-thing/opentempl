import { useState } from 'react';
import { useEditor } from '../editor/Editor';
import { Icon } from '../ui/icons';
import { useEscape } from '../ui/useEscape';
import { activeCollab, chosenName, connectCollab, localName, newRoomKey, setLocalName, usePeers, useSyncStatus } from '../collab/collab';
import { forgetRoom, savedRoom, saveRoom } from '../collab/rooms';
import { syncLabel } from './SyncStatus';

export function ShareDialog() {
  const editor = useEditor();
  const peers = usePeers();
  const [name, setName] = useState(chosenName());
  const designId = editor.s.meta.id;
  const [room, setRoom] = useState(() => new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('room') ?? savedRoom(designId));
  const [copied, setCopied] = useState(false);
  const [stopping, setStopping] = useState(false);
  const status = useSyncStatus();
  const close = () => editor.ui.set({ shareOpen: false });
  useEscape(close);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  const link = (key: string) => `${window.location.origin}${window.location.pathname}#/join/${designId}?room=${key}`;

  const start = () => {
    const key = newRoomKey();
    const base = window.location.hash.split('?')[0];
    window.history.replaceState(null, '', `${window.location.pathname}${base}?room=${key}`);
    saveRoom(designId, key);
    if (!activeCollab()) connectCollab(editor, key);
    setRoom(key);
    copy(link(key));
  };
  const stop = async () => {
    setStopping(true);
    const deleted = await activeCollab()?.stopSharing();
    forgetRoom(designId);
    const base = window.location.hash.split('?')[0];
    window.history.replaceState(null, '', `${window.location.pathname}${base}`);
    setRoom(null);
    setStopping(false);
    editor.toast(
      deleted === false
        ? 'Sharing stopped here. The relay was out of reach, so its encrypted copy goes after 90 days without use.'
        : 'Sharing stopped and the encrypted copy is deleted. The design stays on this device.',
    );
  };
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
              Your name
            </div>
            <div className="field">
              <input
                value={name}
                placeholder="Your name"
                maxLength={32}
                onChange={(e) => {
                  setName(e.target.value);
                  setLocalName(e.target.value || 'Guest');
                }}
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
            {name ? null : <p className="hint" style={{ margin: '6px 0 0' }}>Others see you as {localName()} until you add one.</p>}
          </div>
          <div className="share-card">
            <div className="share-card-title">Share a link</div>
            <p className="hint share-card-text">
              Anyone with this link can edit. Changes sync through an encrypted relay, so they arrive even when you're offline. The relay can't read your design.
            </p>
            {room ? (
              <div className="stack">
                <div className="field">
                  <input readOnly value={link(room)} title={link(room)} onFocus={(e) => e.target.select()} />
                  <button className="btn btn-sm btn-ink" onClick={() => copy(link(room))}>
                    {copied ? 'Copied' : 'Copy link'}
                  </button>
                </div>
                <div className="hint">
                  {status ? `${syncLabel(status)}. ` : ''}
                  {peers.length ? `${peers.length} other ${peers.length === 1 ? 'person' : 'people'} here now: ${peers.map((p) => p.name).join(', ')}.` : 'Nobody else is here right now.'}
                </div>
                <button className="btn btn-outline" style={{ alignSelf: 'flex-start' }} onClick={stop} disabled={stopping}>
                  {stopping ? 'Stopping' : 'Stop sharing'}
                </button>
                <p className="hint" style={{ margin: 0 }}>Stopping deletes the encrypted copy on the relay. Everyone keeps the version already on their device.</p>
              </div>
            ) : (
              <button className="btn btn-outline" onClick={start}>
                <Icon name="link" /> Copy link
              </button>
            )}
          </div>
          <div className="share-card">
            <div className="share-card-title">Send a copy</div>
            <p className="hint share-card-text">An .opentempl file holds every page, photo and font choice. The other person opens it from the File menu.</p>
            <button
              className="btn btn-outline"
              onClick={async () => (await import('../export/exporters')).exportDesign(editor.doc, { format: 'tavla', pageIds: [], scale: 1, transparent: false, quality: 0.9, pdfQuality: 'standard' })}
            >
              <Icon name="download" /> Download .opentempl file
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
