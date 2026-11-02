import { useEditor } from '../editor/Editor';
import { Icon } from '../ui/icons';
import { makeChart, makeQr, makeTable } from '../doc/factory';
import type { ImageElement } from '../doc/types';

// The less common jobs, one plain row each. The longer explanation is the tooltip.
export default function ToolsPanel() {
  const editor = useEditor();
  const image = editor.selected().find((e) => e.type === 'image') as ImageElement | undefined;
  const tools: { icon: string; title: string; text: string; run: () => void }[] = [
    { icon: 'check', title: 'Check the design', text: 'Text that is hard to read, too small, soft photos, missing alt text, things off the page. One click to fix.', run: () => editor.openPanel('check') },
    { icon: 'bulk', title: 'Bulk create', text: 'Paste a spreadsheet and get one page per row: name tags, certificates, menus.', run: () => editor.openPanel('bulk') },
    { icon: 'wand', title: 'Remove background', text: image ? 'Cut the subject out of the selected photo.' : 'Select a photo first, then cut its subject out.', run: () => editor.openPanel('adjust') },
    { icon: 'qr', title: 'QR code', text: 'A code for any link, in your colours. Vector, so it prints sharp.', run: () => editor.add([makeQr('https://opentempl.org')]) },
    { icon: 'chart', title: 'Charts', text: 'Bar, line, pie and progress charts that stay editable.', run: () => editor.add([makeChart('column')]) },
    { icon: 'table', title: 'Table', text: 'Rows and columns with a header and stripes.', run: () => editor.add([makeTable()]) },
    { icon: 'history', title: 'Version history', text: 'Every ten minutes of work is saved as a version you can go back to.', run: () => editor.openPanel('history') },
    { icon: 'search', title: 'Command palette', text: 'Every action, a few keystrokes away. Press ⌘K anywhere.', run: () => editor.ui.set({ commandOpen: true }) },
  ];
  return (
    <div className="tool-list">
      {tools.map((t) => (
        <button key={t.title} className="tool-row" title={t.text} onClick={t.run}>
          <Icon name={t.icon} size={20} />
          <span>{t.title}</span>
        </button>
      ))}
    </div>
  );
}
