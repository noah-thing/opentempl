import { useEffect, useMemo, useRef, useState } from 'react';
import { useEditor, type Editor } from '../editor/Editor';
import { Icon } from '../ui/icons';
import { QUICK } from '../editor/shortcuts';
import { SHAPE_KINDS } from '../render/shapes';
import { makeShape, makeChart, makeQr, makeTable } from '../doc/factory';
import { navigate } from '../App';
import { toggleTheme } from '../ui/theme';
import { COBALT } from '../doc/colors';

interface Command {
  label: string;
  group: string;
  kbd?: string;
  run: (ed: Editor) => void;
}

function commands(): Command[] {
  const list: Command[] = [
    { label: 'Add a heading', group: 'Add', run: QUICK.heading },
    { label: 'Add a subheading', group: 'Add', run: QUICK.subheading },
    { label: 'Add body text', group: 'Add', run: QUICK.body },
    { label: 'Add a line', group: 'Add', run: QUICK.line },
    { label: 'Add a bar chart', group: 'Add', run: (ed) => ed.add([makeChart('column')]) },
    { label: 'Add a line chart', group: 'Add', run: (ed) => ed.add([makeChart('line')]) },
    { label: 'Add a pie chart', group: 'Add', run: (ed) => ed.add([makeChart('donut')]) },
    { label: 'Add a table', group: 'Add', run: (ed) => ed.add([makeTable()]) },
    { label: 'Add a QR code', group: 'Add', run: (ed) => ed.add([makeQr('https://opentempl.org')]) },
    ...SHAPE_KINDS.map((s) => ({
      label: `Add ${s.label.toLowerCase()}`,
      group: 'Shapes',
     
      run: (ed: Editor) => ed.add([makeShape(s.kind, { fill: { type: 'solid', color: COBALT } })]),
    })),
    { label: 'Undo', group: 'Edit', kbd: '⌘Z', run: (ed) => ed.undo() },
    { label: 'Redo', group: 'Edit', kbd: '⌘⇧Z', run: (ed) => ed.redo() },
    { label: 'Duplicate selection', group: 'Edit', kbd: '⌘D', run: (ed) => ed.duplicateSelected() },
    { label: 'Delete selection', group: 'Edit', kbd: '⌫', run: (ed) => ed.deleteSelected() },
    { label: 'Copy style', group: 'Edit', kbd: '⌥⌘C', run: (ed) => ed.copyStyle() },
    { label: 'Paste style', group: 'Edit', kbd: '⌥⌘V', run: (ed) => ed.pasteStyle() },
    { label: 'Find and replace', group: 'Edit', kbd: '⌘F', run: (ed) => ed.ui.set({ findOpen: true }) },
    { label: 'Add selection to every page', group: 'Pages', run: (ed) => ed.addToAllPages() },
    { label: 'Toggle dark theme', group: 'View', run: () => toggleTheme() },
    { label: 'Group selection', group: 'Arrange', kbd: '⌘G', run: (ed) => ed.group() },
    { label: 'Ungroup', group: 'Arrange', kbd: '⌘⇧G', run: (ed) => ed.ungroup() },
    { label: 'Combine shapes: union', group: 'Arrange', run: (ed) => ed.combine('union') },
    { label: 'Combine shapes: subtract', group: 'Arrange', run: (ed) => ed.combine('subtract') },
    { label: 'Combine shapes: intersect', group: 'Arrange', run: (ed) => ed.combine('intersect') },
    { label: 'Combine shapes: exclude', group: 'Arrange', run: (ed) => ed.combine('exclude') },
    { label: 'Styles: palettes and font pairs', group: 'Pages', run: (ed) => ed.openPanel('styles') },
    { label: 'Check the design for problems', group: 'File', run: (ed) => ed.openPanel('check') },
    { label: 'Pen tool', group: 'Add', kbd: 'P', run: (ed) => ed.ui.set({ tool: 'pen', selection: [] }) },
    { label: 'Tidy up into a grid', group: 'Arrange', run: (ed) => ed.tidy() },
    { label: 'Align left', group: 'Arrange', run: (ed) => ed.align('left') },
    { label: 'Align centre', group: 'Arrange', run: (ed) => ed.align('hcenter') },
    { label: 'Align right', group: 'Arrange', run: (ed) => ed.align('right') },
    { label: 'Align top', group: 'Arrange', run: (ed) => ed.align('top') },
    { label: 'Align middle', group: 'Arrange', run: (ed) => ed.align('vcenter') },
    { label: 'Align bottom', group: 'Arrange', run: (ed) => ed.align('bottom') },
    { label: 'Distribute horizontally', group: 'Arrange', run: (ed) => ed.distribute('x') },
    { label: 'Distribute vertically', group: 'Arrange', run: (ed) => ed.distribute('y') },
    { label: 'Bring to front', group: 'Arrange', run: (ed) => ed.reorder('front') },
    { label: 'Send to back', group: 'Arrange', run: (ed) => ed.reorder('back') },
    { label: 'Flip horizontal', group: 'Arrange', run: (ed) => ed.flip('x') },
    { label: 'Flip vertical', group: 'Arrange', run: (ed) => ed.flip('y') },
    { label: 'Lock or unlock', group: 'Arrange', run: (ed) => ed.toggleLock() },
    { label: 'Add page', group: 'Pages', run: (ed) => ed.addPage() },
    { label: 'Duplicate page', group: 'Pages', run: (ed) => ed.duplicatePage() },
    { label: 'Delete page', group: 'Pages', run: (ed) => ed.deletePage() },
    { label: 'Page background', group: 'Pages', run: (ed) => ed.openPanel('background') },
    { label: 'Export', group: 'File', kbd: '⌘E', run: (ed) => ed.ui.set({ exportOpen: true }) },
    { label: 'Present', group: 'File', kbd: '⌘⌥P', run: (ed) => ed.ui.set({ presenting: true }) },
    { label: 'Share live', group: 'File', run: (ed) => ed.ui.set({ shareOpen: true }) },
    { label: 'Resize design', group: 'File', run: (ed) => ed.openPanel('resize') },
    { label: 'Bulk create', group: 'File', run: (ed) => ed.openPanel('bulk') },
    { label: 'Version history', group: 'File', run: (ed) => ed.openPanel('history') },
    { label: 'All designs', group: 'File', run: () => navigate('/') },
    { label: 'Toggle rulers', group: 'View', kbd: '⌘⇧R', run: (ed) => ed.ui.set({ showRulers: !ed.state.showRulers }) },
    { label: 'Toggle layout grid', group: 'View', kbd: "⌘'", run: (ed) => ed.ui.set({ showGrid: !ed.state.showGrid }) },
    { label: 'Toggle snapping', group: 'View', run: (ed) => ed.ui.set({ snap: !ed.state.snap }) },
    { label: 'Fit page to screen', group: 'View', kbd: '⌘0', run: () => window.dispatchEvent(new Event('tavla:fit')) },
    { label: 'Keyboard shortcuts', group: 'View', kbd: '?', run: (ed) => ed.ui.set({ shortcutsOpen: true }) },
  ];
  const panels: [string, Parameters<Editor['openPanel']>[0]][] = [
    ['Templates', 'templates'],
    ['Elements', 'elements'],
    ['Text', 'text'],
    ['Photos', 'photos'],
    ['Uploads', 'uploads'],
    ['Draw', 'draw'],
    ['Brand kit', 'brand'],
    ['Layers', 'layers'],
    ['Tools', 'apps'],
  ];
  for (const [label, id] of panels) list.push({ label: `Open ${label}`, group: 'Panels', run: (ed) => ed.openPanel(id) });
  return list;
}

function score(q: string, s: string) {
  if (!q) return 1;
  const a = s.toLowerCase();
  const b = q.toLowerCase();
  if (a.includes(b)) return 2 + (a.startsWith(b) ? 1 : 0);
  // Fuzzy: all query letters in order.
  let i = 0;
  for (const ch of a) if (ch === b[i]) i++;
  return i === b.length ? 1 : 0;
}

export function CommandPalette() {
  const editor = useEditor();
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const all = useMemo(commands, []);
  const list = useMemo(
    () =>
      all
        .map((c) => ({ c, s: Math.max(score(q, c.label), score(q, c.group) * 0.5) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, 60)
        .map((x) => x.c),
    [all, q],
  );
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => inputRef.current?.focus(), []);
  useEffect(() => setActive(0), [q]);
  const close = () => editor.ui.set({ commandOpen: false });
  const run = (c: Command) => {
    close();
    c.run(editor);
  };
  return (
    <div className="scrim" onPointerDown={(e) => e.target === e.currentTarget && close()}>
      <div className="cmdk" role="dialog" aria-label="Command palette">
        <div className="cmdk-input">
          <Icon name="search" />
          <input
            ref={inputRef}
            value={q}
            placeholder="Type a command, a shape, a tool"
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Escape') close();
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActive((a) => Math.min(list.length - 1, a + 1));
              }
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActive((a) => Math.max(0, a - 1));
              }
              if (e.key === 'Enter' && list[active]) run(list[active]);
            }}
          />
          <kbd>esc</kbd>
        </div>
        <div className="cmdk-list">
          {list.map((c, i) => (
            <button key={c.label} className={`cmdk-item ${i === active ? 'is-active' : ''}`} onMouseEnter={() => setActive(i)} onClick={() => run(c)}>
              <span>{c.label}</span>
              {c.kbd ? <kbd>{c.kbd}</kbd> : null}
            </button>
          ))}
          {!list.length ? <div className="hint" style={{ padding: 16 }}>Nothing matches. Try “chart”, “align” or “background”.</div> : null}
        </div>
      </div>
    </div>
  );
}
