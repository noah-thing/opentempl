import { useState } from 'react';
import { Icon } from '../ui/icons';
import { getSettings, MODELS, saveSettings, type AiSettings } from './openai';

// Connecting an OpenAI key. It stays on this computer and is only sent to OpenAI.
export function KeyDialog({ onClose }: { onClose: () => void }) {
  const [s, setS] = useState<AiSettings>(getSettings());
  const [check, setCheck] = useState<string | null>(null);
  async function test() {
    setCheck('Checking');
    try {
      const r = await fetch('https://api.openai.com/v1/models', { headers: { authorization: `Bearer ${s.key.trim()}` } });
      if (!r.ok) throw new Error(r.status === 401 ? 'OpenAI did not accept this key.' : `OpenAI answered ${r.status}.`);
      const ids: string[] = ((await r.json()).data ?? []).map((m: { id: string }) => m.id);
      setCheck(ids.includes(s.model) ? 'The key works.' : `The key works, but this account has no ${s.model}. Pick another model.`);
    } catch (e) {
      setCheck((e as Error).message === 'Failed to fetch' ? 'Could not reach OpenAI. Are you online?' : (e as Error).message);
    }
  }
  return (
    <div className="scrim" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog">
        <div className="dialog-head">
          <h2>Connect OpenAI</h2>
          <button className="icon-btn" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>
        <div className="dialog-body key-dialog">
          <p>
            OpenTempl makes pictures with your own OpenAI account, so you pay OpenAI directly for what you use and nothing goes through us. Make a key at{' '}
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer">
              platform.openai.com/api-keys
            </a>
            . It is saved on this computer only and sent to nobody but OpenAI.
          </p>
          <label className="fld">
            <span>API key</span>
            <input type="password" autoComplete="off" value={s.key} placeholder="sk-..." onChange={(e) => setS({ ...s, key: e.target.value })} />
          </label>
          <label className="fld">
            <span>Model</span>
            <select value={s.model} onChange={(e) => setS({ ...s, model: e.target.value })}>
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
          <div className="fld">
            <span>Quality</span>
            <div className="seg">
              {(['low', 'medium', 'high'] as const).map((q) => (
                <button key={q} className={s.quality === q ? 'is-on' : ''} onClick={() => setS({ ...s, quality: q })}>
                  {q === 'low' ? 'Draft' : q === 'medium' ? 'Good' : 'Best'}
                </button>
              ))}
            </div>
            <small>Draft is quick and costs about a tenth of Best. Use it to find the idea, then make the final in Best.</small>
          </div>
          {check ? <p className="muted">{check}</p> : null}
          <div className="row">
            <button className="btn btn-outline" disabled={!s.key.trim()} onClick={test}>
              Test the key
            </button>
            {getSettings().key ? (
              <button
                className="btn btn-outline"
                onClick={() => {
                  saveSettings({ ...s, key: '' });
                  onClose();
                }}
              >
                Forget the key
              </button>
            ) : null}
            <button
              className="btn btn-primary"
              style={{ marginLeft: 'auto' }}
              onClick={() => {
                saveSettings({ ...s, key: s.key.trim() });
                onClose();
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
