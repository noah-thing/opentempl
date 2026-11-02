import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/app.css';
import './styles/night.css';
import { applyTheme } from './ui/theme';
import { pingOncePerDay } from './stats/client';

// The font stylesheet loads as print so it never blocks the first paint; the site's
// content policy refuses inline handlers, so it is switched on from here.
document.querySelectorAll<HTMLLinkElement>('link[data-late]').forEach((l) => (l.media = 'all'));

applyTheme();
pingOncePerDay();

// Offline support in production builds (not in the desktop app, which is offline already).
if ('serviceWorker' in navigator && import.meta.env.PROD && !('tavlaDesktop' in window)) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

createRoot(document.getElementById('root')!).render(<App />);
