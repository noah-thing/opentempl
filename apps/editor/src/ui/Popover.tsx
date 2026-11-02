import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './icons';

// Anchored floating surface. Positions itself under (or above) an anchor rect,
// stays on screen, and closes on outside click or Escape.
export function Popover({
  anchor,
  onClose,
  children,
  className = 'popover',
  placement = 'bottom-start',
  width,
}: {
  anchor: DOMRect | { left: number; top: number; bottom: number; right: number; width: number; height: number };
  onClose: () => void;
  children: ReactNode;
  className?: string;
  placement?: 'bottom-start' | 'bottom-end' | 'bottom' | 'right-start' | 'top';
  width?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: -9999, top: -9999 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    let left = anchor.left;
    let top = anchor.bottom + 6;
    if (placement === 'bottom-end') left = anchor.right - w;
    if (placement === 'bottom') left = anchor.left + anchor.width / 2 - w / 2;
    if (placement === 'right-start') {
      left = anchor.right + 6;
      top = anchor.top;
    }
    if (placement === 'top') {
      left = anchor.left + anchor.width / 2 - w / 2;
      top = anchor.top - h - 6;
    }
    if (top + h > window.innerHeight - 8) top = Math.max(8, anchor.top - h - 6);
    left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
    top = Math.max(8, top);
    setPos({ left, top });
  }, [anchor, placement]);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      // A press on the button that opened it is left to that button, which toggles it shut.
      const a = anchor;
      if (e.clientX >= a.left && e.clientX <= a.right && e.clientY >= a.top && e.clientY <= a.bottom) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    // Defer so the click that opened the popover does not close it.
    const t = setTimeout(() => window.addEventListener('pointerdown', onDown, true));
    window.addEventListener('keydown', onKey, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener('pointerdown', onDown, true);
      window.removeEventListener('keydown', onKey, true);
    };
  }, [onClose, anchor]);

  return createPortal(
    <div ref={ref} className={className} style={{ ...pos, width }} onPointerDown={(e) => e.stopPropagation()}>
      {children}
    </div>,
    document.body,
  );
}

export interface MenuItem {
  label?: string;
  icon?: string;
  kbd?: string;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
  hint?: string; // why a row is unavailable
  separator?: boolean;
  heading?: string;
  checked?: boolean;
  row?: { icon: string; title: string; onClick: () => void }[]; // a row of icon buttons
}

export function Menu({ items, onClose }: { items: MenuItem[]; onClose: () => void }) {
  return (
    <>
      {items.map((it, i) =>
        it.separator ? (
          <div key={i} className="menu-sep" />
        ) : it.row ? (
          <div key={i} className="menu-row">
            {it.label ? <span className="menu-row-label">{it.label}</span> : null}
            {it.row.map((b) => (
              <button
                key={b.title}
                className="icon-btn"
                title={b.title}
                onClick={() => {
                  b.onClick();
                  onClose();
                }}
              >
                <Icon name={b.icon} />
              </button>
            ))}
          </div>
        ) : it.heading ? (
          <div key={i} className="menu-label">
            {it.heading}
          </div>
        ) : (
          <button
            key={i}
            className={`menu-item ${it.danger ? 'is-danger' : ''}`}
            disabled={it.disabled}
            title={it.disabled ? it.hint : undefined}
            onClick={() => {
              it.onClick?.();
              onClose();
            }}
          >
            {it.icon ? <Icon name={it.icon} /> : it.checked !== undefined ? <span style={{ width: 16 }}>{it.checked ? <Icon name="check" /> : null}</span> : null}
            <span>{it.label}</span>
            {it.kbd ? <span className="kbd">{it.kbd}</span> : null}
          </button>
        ),
      )}
    </>
  );
}

// Button that opens a popover anchored to itself.
export function usePopover() {
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  return {
    anchor,
    open: (e: React.MouseEvent) => setAnchor((e.currentTarget as HTMLElement).getBoundingClientRect()),
    close: () => setAnchor(null),
    toggle: (e: React.MouseEvent) => {
      // Read the rect now: React clears currentTarget before a lazy updater runs.
      const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setAnchor((a) => (a ? null : r));
    },
  };
}
