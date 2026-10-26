import { useEffect, useState } from 'react';
import { Editor, EditorContext } from './Editor';
import { openDesign, type OpenDesign } from '../io/designs';
import { Loading, navigate } from '../App';
import { TopBar } from '../chrome/TopBar';
import { Rail } from '../chrome/Rail';
import { SidePanel } from '../chrome/SidePanel';
import { ContextToolbar } from '../toolbar/ContextToolbar';
import { Viewport } from '../canvas/Viewport';
import { StatusBar } from '../chrome/StatusBar';
import { ContextMenu } from '../chrome/ContextMenu';
import { CommandPalette } from '../chrome/CommandPalette';
import { ExportDialog } from '../chrome/ExportDialog';
import { ShareDialog } from '../chrome/ShareDialog';
import { ShortcutsDialog } from '../chrome/ShortcutsDialog';
import { Present } from '../present/Present';
import { Toast } from '../chrome/Toast';
import { useShortcuts } from './shortcuts';
import { useUI } from './hooks';
import { onFontsChange, preloadFonts } from '../fonts/fonts';
import { connectCollab, type Collab } from '../collab/collab';

export function EditorScreen({ id }: { id: string }) {
  const [state, setState] = useState<{ open: OpenDesign; editor: Editor } | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let opened: OpenDesign | null = null;
    let collab: Collab | null = null;
    let offFonts: (() => void) | null = null;
    (async () => {
      opened = await openDesign(id);
      if (cancelled) {
        opened?.close();
        return;
      }
      if (!opened) {
        setMissing(true);
        return;
      }
      const editor = new Editor(opened.doc);
      // Fonts used anywhere in the design load up front; text re-measures as they land.
      const fams = Object.values(opened.doc.snapshot.elements).flatMap((e) => ('fontFamily' in e ? [e.fontFamily] : []));
      preloadFonts(fams).then(() => editor.refitAllText());
      offFonts = onFontsChange(() => editor.refitAllText()) as () => void;
      const room = new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('room');
      if (room) collab = connectCollab(editor, room);
      setState({ open: opened, editor });
      document.title = `${opened.doc.snapshot.meta.title} · Tavla`;
    })();
    return () => {
      cancelled = true;
      offFonts?.();
      collab?.destroy();
      opened?.close();
    };
  }, [id]);

  if (missing)
    return (
      <div style={{ height: '100%', display: 'grid', placeItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p>This design is not on this device.</p>
          <button className="btn btn-ink" onClick={() => navigate('/')}>
            Back to your designs
          </button>
        </div>
      </div>
    );
  if (!state) return <Loading label="Opening your design" />;
  return (
    <EditorContext.Provider value={state.editor}>
      <EditorLayout />
    </EditorContext.Provider>
  );
}

function EditorLayout() {
  useShortcuts();
  const presenting = useUI((s) => s.presenting);
  const exportOpen = useUI((s) => s.exportOpen);
  const shareOpen = useUI((s) => s.shareOpen);
  const commandOpen = useUI((s) => s.commandOpen);
  const shortcutsOpen = useUI((s) => s.shortcutsOpen);
  return (
    <div className="editor">
      <TopBar />
      <Rail />
      <SidePanel />
      <main className="workspace">
        <ContextToolbar />
        <Viewport />
        <StatusBar />
      </main>
      <ContextMenu />
      {commandOpen ? <CommandPalette /> : null}
      {exportOpen ? <ExportDialog /> : null}
      {shareOpen ? <ShareDialog /> : null}
      {shortcutsOpen ? <ShortcutsDialog /> : null}
      {presenting ? <Present /> : null}
      <Toast />
    </div>
  );
}
