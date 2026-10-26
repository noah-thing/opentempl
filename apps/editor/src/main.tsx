import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/app.css';
import { applyTheme } from './ui/theme';

applyTheme();

createRoot(document.getElementById('root')!).render(<App />);
