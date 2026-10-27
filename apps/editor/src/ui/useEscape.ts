import { useEffect } from 'react';

// Close a dialog with Escape. Capturing, so editor shortcuts never see the key.
export function useEscape(close: () => void) {
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
      close();
    };
    window.addEventListener('keydown', on, true);
    return () => window.removeEventListener('keydown', on, true);
  }, [close]);
}
