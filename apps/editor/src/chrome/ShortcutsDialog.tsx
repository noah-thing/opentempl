import { useEditor } from '../editor/Editor';
import { Icon } from '../ui/icons';
import { useEscape } from '../ui/useEscape';
import { SHORTCUTS } from '../editor/shortcuts';

export function ShortcutsDialog() {
  const editor = useEditor();
  const close = () => editor.ui.set({ shortcutsOpen: false });
  useEscape(close);
  const groups = [...new Set(SHORTCUTS.map((s) => s.group))];
  return (
    <div className="scrim" onPointerDown={(e) => e.target === e.currentTarget && close()}>
      <div className="dialog" role="dialog" aria-label="Keyboard shortcuts" style={{ width: 'min(760px, 100%)' }}>
        <div className="dialog-head">
          <h2>Keyboard shortcuts</h2>
          <button className="icon-btn" onClick={close} title="Close">
            <Icon name="close" />
          </button>
        </div>
        <div className="dialog-body" style={{ columns: 2, columnGap: 32 }}>
          {groups.map((g) => (
            <div key={g} style={{ breakInside: 'avoid', marginBottom: 18 }}>
              <div className="label" style={{ marginBottom: 6, color: 'var(--ink)' }}>
                {g}
              </div>
              {SHORTCUTS.filter((s) => s.group === g).map((s) => (
                <div key={s.label} className="row-between" style={{ height: 30 }}>
                  <span>{s.label}</span>
                  <kbd>{s.keys}</kbd>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
