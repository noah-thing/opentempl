import './subscribe.css';
import { useState } from 'react';
import { isSubscribed, subscribe, type SubscribeResult } from '../stats/client';

const ERRORS: Record<Exclude<SubscribeResult, 'ok'>, string> = {
  invalid: 'That does not look like an email address.',
  limited: 'Too many tries from this network. Try again tomorrow.',
  failed: 'That did not go through. Check your connection and try again.',
};

// One quiet line and a field. There is no account behind it: the address is only used to send new templates,
// and every message carries a link that deletes it.
export function Subscribe({ source, onDone, compact = false }: { source: 'footer' | 'export'; onDone?: () => void; compact?: boolean }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'done'>(() => (isSubscribed() && source === 'footer' ? 'done' : 'idle'));
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === 'busy') return;
    setState('busy');
    setError(null);
    const res = await subscribe(email, source);
    if (res === 'ok') {
      setState('done');
      onDone?.();
    } else {
      setState('idle');
      setError(ERRORS[res]);
    }
  };

  if (state === 'done') {
    return (
      <p className={`subscribe-line ${compact ? 'is-compact' : ''}`} role="status">
        You are on the list. We write when there are new templates, and every email has a link that removes you.
      </p>
    );
  }
  return (
    <form className={`subscribe ${compact ? 'is-compact' : ''}`} onSubmit={submit} noValidate>
      <label htmlFor={`subscribe-${source}`}>New templates each month, by email</label>
      <div className="subscribe-row">
        <input
          id={`subscribe-${source}`}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `subscribe-err-${source}` : undefined}
          required
        />
        <button type="submit" disabled={state === 'busy' || !email.trim()}>
          {state === 'busy' ? 'Sending' : 'Subscribe'}
        </button>
      </div>
      {error ? (
        <p className="subscribe-err" id={`subscribe-err-${source}`} role="alert">
          {error}
        </p>
      ) : (
        <p className="subscribe-fine">No account. We only use your address to send new templates.</p>
      )}
    </form>
  );
}
