// Light or dark editor chrome. The pages themselves always render as designed.
const KEY = 'tavla:theme'; // legacy name kept on purpose so the saved theme survives

export function applyTheme() {
  const t = localStorage.getItem(KEY) ?? 'light';
  document.documentElement.dataset.theme = t;
}

export function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem(KEY, next);
  applyTheme();
}

export function isDark() {
  return document.documentElement.dataset.theme === 'dark';
}
