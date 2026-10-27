import { useEffect, useState } from 'react';
import { useEditor } from '../editor/Editor';
import { useDoc, useUI } from '../editor/hooks';
import { Icon } from '../ui/icons';
import { Mark } from '../ui/Logo';
import { Menu, Popover, usePopover, type MenuItem } from '../ui/Popover';
import { navigate } from '../App';
import { exportDesign } from '../export/exporters';
import { duplicateDesign, importTavla } from '../io/designs';
import { pickFiles, importFiles } from '../io/upload';
import { usePeers } from '../collab/collab';
import { saveVersion } from '../io/versions';
import { isDark, toggleTheme } from '../ui/theme';

export function TopBar() {
  const editor = useEditor();
  const title = useDoc((s) => s.meta.title);
  const size = useDoc((s) => `${s.meta.width} × ${s.meta.height}`);
  const canUndo = useUndoState();
  const showRulers = useUI((s) => s.showRulers);
  const file = usePopover();
  const peers = usePeers();

  const fileItems: MenuItem[] = [
    { label: 'New design', icon: 'plus', onClick: () => navigate('/') },
    {
      label: 'Make a copy',
      icon: 'duplicate',
      onClick: async () => {
        const id = await duplicateDesign(editor.s.meta.id);
        if (id) navigate(`/d/${id}`);
      },
    },
    {
      label: 'Open a .tavla file',
      icon: 'folder',
      onClick: async () => {
        const [f] = await pickFiles('.tavla');
        if (!f) return;
        const id = await importTavla(f);
        if (id) navigate(`/d/${id}`);
        else editor.toast('That file is not a Tavla design');
      },
    },
    { label: 'Upload photos or videos', icon: 'upload', onClick: async () => importFiles(editor, await pickFiles()) },
    {
      label: 'Import a PDF as a new design',
      icon: 'file',
      onClick: async () => {
        const [f] = await pickFiles('.pdf');
        if (!f) return;
        editor.toast('Importing PDF pages');
        const { importPdf } = await import('../io/pdfImport');
        navigate(`/d/${await importPdf(f)}`);
      },
    },
    { separator: true },
    { label: 'Save version', icon: 'history', kbd: '', onClick: async () => (await saveVersion(editor.doc, 'Saved by hand'), editor.toast('Version saved')) },
    { label: 'Version history', icon: 'history', onClick: () => editor.openPanel('history') },
    { label: 'Resize design', icon: 'resize', onClick: () => editor.openPanel('resize') },
    { label: 'Bulk create from a table', icon: 'bulk', onClick: () => editor.openPanel('bulk') },
    { separator: true },
    { label: 'Show rulers and guides', checked: showRulers, kbd: '⌘⇧R', onClick: () => editor.ui.set({ showRulers: !showRulers }) },
    { label: 'Show layout grid', checked: editor.state.showGrid, kbd: "⌘'", onClick: () => editor.ui.set({ showGrid: !editor.state.showGrid }) },
    { label: 'Snap to guides', checked: editor.state.snap, onClick: () => editor.ui.set({ snap: !editor.state.snap }) },
    { label: 'Dark theme', checked: isDark(), onClick: () => toggleTheme() },
    { label: 'Find and replace', icon: 'search', kbd: '⌘F', onClick: () => editor.ui.set({ findOpen: true }) },
    { separator: true },
    { label: 'Download as .tavla file', icon: 'download', onClick: () => exportDesign(editor.doc, { format: 'tavla', pageIds: [], scale: 1, transparent: false, quality: 0.9, pdfQuality: 'standard' }) },
    { label: 'Keyboard shortcuts', icon: 'keyboard', kbd: '?', onClick: () => editor.ui.set({ shortcutsOpen: true }) },
    { label: 'Command palette', icon: 'command', kbd: '⌘K', onClick: () => editor.ui.set({ commandOpen: true }) },
  ];

  return (
    <header className="topbar">
      <button className="mark" onClick={() => navigate('/')} title="All designs">
        <Mark size={30} />
      </button>
      <button className="btn" onClick={file.toggle}>
        <span className="btn-label">File</span> <Icon name="chevron-down" size={12} />
      </button>
      <button className="btn" onClick={() => editor.openPanel('resize')}>
        <Icon name="resize" /> <span className="btn-label">Resize</span>
      </button>
      <div className="sep" />
      <button className="icon-btn" title="Undo (⌘Z)" disabled={!canUndo.undo} onClick={() => editor.undo()}>
        <Icon name="undo" />
      </button>
      <button className="icon-btn" title="Redo (⌘⇧Z)" disabled={!canUndo.redo} onClick={() => editor.redo()}>
        <Icon name="redo" />
      </button>
      <div className="sep" />
      <input
        className="title"
        value={title}
        size={Math.max(8, title.length)}
        onChange={(e) => editor.doc.setMeta({ title: e.target.value })}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        }}
        onBlur={() => (document.title = `${editor.s.meta.title} · Tavla`)}
        aria-label="Design title"
      />
      <span className="saved">
        <Icon name="check" size={12} /> On this device
      </span>
      <div className="spacer" />
      <span className="size-chip">{size}</span>
      {peers.length ? (
        <div className="row" style={{ gap: 0, marginLeft: 6 }}>
          {peers.slice(0, 4).map((p, i) => (
            <span
              key={p.id}
              title={p.name}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: p.color,
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 600,
                fontSize: 12,
                marginLeft: i ? -6 : 0,
                boxShadow: '0 0 0 2px #fff',
              }}
            >
              {p.name.slice(0, 1).toUpperCase()}
            </span>
          ))}
        </div>
      ) : null}
      <CommentsButton />
      <button className="btn" onClick={() => editor.ui.set({ shareOpen: true })}>
        <Icon name="users" /> <span className="btn-label">Share</span>
      </button>
      <button className="btn" onClick={() => editor.ui.set({ presenting: true, presentStart: editor.s.pageOrder.indexOf(editor.state.activePageId ?? '') })}>
        <Icon name="play" /> <span className="btn-label">Present</span>
      </button>
      <button className="btn btn-primary" onClick={() => editor.ui.set({ exportOpen: true })}>
        <Icon name="download" /> <span className="btn-label">Export</span>
      </button>
      {file.anchor ? (
        <Popover anchor={file.anchor} onClose={file.close} className="menu">
          <Menu items={fileItems} onClose={file.close} />
        </Popover>
      ) : null}
    </header>
  );
}

function CommentsButton() {
  const editor = useEditor();
  const open = useDoc((s) => Object.values(s.comments).filter((c) => !c.resolved).length);
  const panel = useUI((s) => s.panel);
  return (
    <button className={`icon-btn ${panel === 'comments' ? 'is-on' : ''}`} title="Comments" onClick={() => editor.openPanel('comments')}>
      <Icon name="comment" />
      {open ? <span className="badge-dot tabular">{open}</span> : null}
    </button>
  );
}

function useUndoState() {
  const editor = useEditor();
  const [s, set] = useState({ undo: false, redo: false });
  useEffect(() => {
    const um = editor.doc.undo;
    const update = () => set({ undo: um.undoStack.length > 0, redo: um.redoStack.length > 0 });
    update();
    um.on('stack-item-added', update);
    um.on('stack-item-popped', update);
    um.on('stack-cleared', update);
    return () => {
      um.off('stack-item-added', update);
      um.off('stack-item-popped', update);
      um.off('stack-cleared', update);
    };
  }, [editor]);
  return s;
}

