import { useEffect, useState } from 'react';
import { Editor, EditorContext } from './Editor';
import { openDesign, type OpenDesign } from '../io/designs';
import { Loading, navigate } from '../App';
import { TopBar } from '../chrome/TopBar';
import { Rail } from '../chrome/Rail';
import { SidePanel } from '../chrome/SidePanel';
import { ContextToolbar } from '../toolbar/ContextToolbar';
import { Viewport } from '../canvas/Viewport';
import { Rulers } from '../canvas/Rulers';
import { StatusBar } from '../chrome/StatusBar';
import { ContextMenu } from '../chrome/ContextMenu';
import { CommandPalette } from '../chrome/CommandPalette';
import { ExportDialog } from '../chrome/ExportDialog';
import { ShareDialog } from '../chrome/ShareDialog';
import { ShortcutsDialog } from '../chrome/ShortcutsDialog';
import { FindReplace } from '../chrome/FindReplace';
import { Present } from '../present/Present';
import { Toast } from '../chrome/Toast';
import { useShortcuts } from './shortcuts';
import { useUI } from './hooks';
import { onFontsChange, preloadFonts } from '../fonts/fonts';
import { connectCollab, type Collab } from '../collab/collab';
import { startAutoVersions } from '../io/versions';
import { registerCustomFonts } from '../fonts/custom';
import { Sign } from '../ui/Logo';

export function EditorScreen({ id }: { id: string }) {
  const [state, setState] = useState<{ open: OpenDesign; editor: Editor } | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let opened: OpenDesign | null = null;
    let collab: Collab | null = null;
    let offFonts: (() => void) | null = null;
    let stopVersions: (() => void) | null = null;
    (async () => {
      await registerCustomFonts().catch(() => {});
      const room = new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('room');
      opened = await openDesign(id, { joining: !!room });
      if (cancelled) {
        opened?.close();
        return;
      }
      if (!opened) {
        setMissing(true);
        return;
      }
      const editor = new Editor(opened.doc);
      // A handle for the browser tests in qa/, dev builds only.
      if (import.meta.env.DEV) (window as unknown as { __tavla: Editor }).__tavla = editor;
      // Fonts used anywhere in the design load up front; text re-measures as they land.
      const fams = Object.values(opened.doc.snapshot.elements).flatMap((e) => ('fontFamily' in e ? [e.fontFamily] : []));
      preloadFonts(fams).then(() => editor.refitAllText());
      offFonts = onFontsChange(() => editor.refitAllText()) as () => void;
      if (room) collab = connectCollab(editor, room);
      stopVersions = startAutoVersions(opened.doc);
      setState({ open: opened, editor });
      document.title = `${opened.doc.snapshot.meta.title} · OpenTempl`;
    })();
    return () => {
      cancelled = true;
      offFonts?.();
      stopVersions?.();
      collab?.destroy();
      opened?.close();
    };
  }, [id]);

  if (missing)
    return (
      <div style={{ height: '100%', display: 'grid', placeItems: 'center', background: 'var(--paper)' }}>
        <div style={{ display: 'grid', justifyItems: 'center', gap: 14, textAlign: 'center' }}>
          <Sign size={96} mood="wow" />
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: '-0.03em' }}>This design lives on another device</h2>
          <p className="muted" style={{ margin: '0 0 6px', maxWidth: 380 }}>OpenTempl keeps designs in the browser that made them. Ask for an .opentempl file or a live link.</p>
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
  const findOpen = useUI((s) => s.findOpen);
  return (
    <div className="editor">
      <TopBar />
      <Rail />
      <SidePanel />
      <main className="workspace">
        <ContextToolbar />
        <Rulers />
        <Viewport />
        <StatusBar />
      </main>
      <ContextMenu />
      {commandOpen ? <CommandPalette /> : null}
      {exportOpen ? <ExportDialog /> : null}
      {shareOpen ? <ShareDialog /> : null}
      {shortcutsOpen ? <ShortcutsDialog /> : null}
      {findOpen ? <FindReplace /> : null}
      {presenting ? <Present /> : null}
      <Toast />
    </div>
  );
}
