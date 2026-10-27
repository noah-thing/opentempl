import { useEditor } from '../editor/Editor';
import { Icon } from '../ui/icons';
import { makeChart, makeQr, makeTable } from '../doc/factory';
import type { ImageElement } from '../doc/types';

// Everything bigger than a button lives here, one card each.
export default function ToolsPanel() {
  const editor = useEditor();
  const image = editor.selected().find((e) => e.type === 'image') as ImageElement | undefined;
  const tools: { icon: string; title: string; text: string; run: () => void; badge?: string }[] = [
    { icon: 'palette', title: 'Styles', text: 'Recolour everything with one palette, or one taken from a photo, and swap the fonts for a pair.', run: () => editor.openPanel('styles') },
    { icon: 'resize', title: 'Resize', text: 'Turn a post into a story, a poster into slides. Everything rescales to fit.', run: () => editor.openPanel('resize') },
    { icon: 'bulk', title: 'Bulk create', text: 'Paste a spreadsheet and get one page per row: name tags, certificates, menus.', run: () => editor.openPanel('bulk') },
    { icon: 'wand', title: 'Remove background', text: image ? 'Cut the subject out of the selected photo.' : 'Select a photo first, then cut its subject out.', run: () => editor.openPanel('adjust') },
    { icon: 'qr', title: 'QR code', text: 'A code for any link, in your colours. Vector, so it prints sharp.', run: () => editor.add([makeQr('https://tavla.app')]) },
    { icon: 'chart', title: 'Charts', text: 'Bar, line, pie and progress charts that stay editable.', run: () => editor.add([makeChart('column')]) },
    { icon: 'table', title: 'Table', text: 'Rows and columns with a header and stripes.', run: () => editor.add([makeTable()]) },
    { icon: 'history', title: 'Version history', text: 'Every ten minutes of work is saved as a version you can go back to.', run: () => editor.openPanel('history') },
    { icon: 'users', title: 'Live together', text: 'Share a link and edit at the same time, browser to browser.', run: () => editor.ui.set({ shareOpen: true }) },
    { icon: 'command', title: 'Command palette', text: 'Every action, a few keystrokes away. Press ⌘K anywhere.', run: () => editor.ui.set({ commandOpen: true }) },
  ];
  return (
    <div className="stack" style={{ gap: 8 }}>
      {tools.map((t) => (
        <button
          key={t.title}
          onClick={t.run}
          style={{ display: 'flex', gap: 12, textAlign: 'left', padding: 12, borderRadius: 14, background: 'var(--paper)', alignItems: 'flex-start' }}
        >
          <span style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--sheet)', display: 'grid', placeItems: 'center', flex: 'none', boxShadow: 'var(--shadow-1)' }}>
            <Icon name={t.icon} size={16} />
          </span>
          <span>
            <span style={{ display: 'block', fontWeight: 600, marginBottom: 2 }}>{t.title}</span>
            <span className="hint">{t.text}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
