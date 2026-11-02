import { Component, type ReactNode } from 'react';
import { Sign } from './Logo';

// If something in the editor throws while rendering, show a calm card instead of
// a blank page. Designs are saved continuously, so reloading loses nothing.
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('OpenTempl crashed while rendering', error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ height: '100%', display: 'grid', placeItems: 'center', background: 'var(--paper)', padding: 24 }}>
        <div style={{ display: 'grid', justifyItems: 'center', gap: 14, textAlign: 'center', maxWidth: 420 }}>
          <Sign size={96} mood="wow" />
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: '-0.03em' }}>Something slipped</h2>
          <p className="muted" style={{ margin: 0 }}>
            Your design is saved. Reload and you will be right where you were.
          </p>
          <code style={{ fontSize: 12, color: 'var(--ink-3)' }}>{this.state.error.message}</code>
          <button className="btn btn-ink" onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      </div>
    );
  }
}
