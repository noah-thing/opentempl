import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/app.css';
import './styles/night.css';
import { applyTheme } from './ui/theme';
import { pingOncePerDay } from './stats/client';

applyTheme();
pingOncePerDay();

// Offline support in production builds (not in the desktop app, which is offline already).
if ('serviceWorker' in navigator && import.meta.env.PROD && !('tavlaDesktop' in window)) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

createRoot(document.getElementById('root')!).render(<App />);
