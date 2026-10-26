import { useEditor } from '../editor/Editor';
import { useUI } from '../editor/hooks';
import type { PanelId } from '../editor/state';
import { Icon } from '../ui/icons';

const ITEMS: { id: PanelId; label: string; icon: string }[] = [
  { id: 'templates', label: 'Templates', icon: 'templates' },
  { id: 'elements', label: 'Elements', icon: 'elements' },
  { id: 'text', label: 'Text', icon: 'text' },
  { id: 'photos', label: 'Photos', icon: 'photos' },
  { id: 'uploads', label: 'Uploads', icon: 'uploads' },
  { id: 'draw', label: 'Draw', icon: 'draw' },
  { id: 'brand', label: 'Brand', icon: 'brand' },
  { id: 'layers', label: 'Layers', icon: 'layers' },
  { id: 'apps', label: 'Tools', icon: 'apps' },
];

export function Rail() {
  const editor = useEditor();
  const panel = useUI((s) => s.panel);
  return (
    <nav className="rail" aria-label="Panels">
      {ITEMS.map((it) => (
        <button
          key={it.id}
          className={`rail-item ${panel === it.id ? 'is-on' : ''}`}
          onClick={() => {
            editor.openPanel(it.id);
            if (it.id === 'draw' && editor.state.panel === 'draw') editor.ui.set({ tool: 'draw' });
            if (it.id !== 'draw' && editor.state.tool === 'draw') editor.ui.set({ tool: 'select' });
          }}
        >
          <Icon name={it.icon} size={20} />
          {it.label}
        </button>
      ))}
      <div className="grow" />
      <button className="rail-item" onClick={() => editor.ui.set({ shortcutsOpen: true })}>
        <Icon name="keyboard" size={20} />
        Keys
      </button>
    </nav>
  );
}
