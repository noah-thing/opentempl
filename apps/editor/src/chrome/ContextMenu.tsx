import { useEffect, useState } from 'react';
import { useEditor } from '../editor/Editor';
import { Menu, Popover, type MenuItem } from '../ui/Popover';
import type { ImageElement } from '../doc/types';

export function ContextMenu() {
  const editor = useEditor();
  const [at, setAt] = useState<{ x: number; y: number; pageId: string; empty?: boolean } | null>(null);

  useEffect(() => {
    const on = (e: Event) => setAt((e as CustomEvent).detail);
    window.addEventListener('tavla:contextmenu', on);
    return () => window.removeEventListener('tavla:contextmenu', on);
  }, []);
  if (!at) return null;

  const sel = editor.selected();
  const one = sel.length === 1 ? sel[0] : null;
  const close = () => setAt(null);
  const items: MenuItem[] = sel.length
    ? [
        { label: 'Copy', kbd: '⌘C', onClick: () => editor.copy() },
        { label: 'Paste', kbd: '⌘V', onClick: () => editor.paste() },
        { label: 'Duplicate', kbd: '⌘D', onClick: () => editor.duplicateSelected() },
        { label: 'Copy style', kbd: '⌥⌘C', onClick: () => editor.copyStyle() },
        { label: 'Paste style', kbd: '⌥⌘V', onClick: () => editor.pasteStyle() },
        { label: 'Delete', icon: 'trash', kbd: '⌫', danger: true, onClick: () => editor.deleteSelected() },
        { separator: true },
        {
          label: 'Layer',
          row: [
            { icon: 'front', title: 'Bring to front (⌥⌘])', onClick: () => editor.reorder('front') },
            { icon: 'forward', title: 'Bring forward (⌘])', onClick: () => editor.reorder('forward') },
            { icon: 'backward', title: 'Send backward (⌘[)', onClick: () => editor.reorder('backward') },
            { icon: 'back', title: 'Send to back (⌥⌘[)', onClick: () => editor.reorder('back') },
          ],
        },
        { separator: true },
        sel.length > 1
          ? editor.isGrouped()
            ? { label: 'Ungroup', icon: 'ungroup', kbd: '⇧⌘G', onClick: () => editor.ungroup() }
            : { label: 'Group', icon: 'group', kbd: '⌘G', onClick: () => editor.group() }
          : { label: sel[0].locked ? 'Unlock' : 'Lock', icon: sel[0].locked ? 'unlock' : 'lock', kbd: '⇧⌘L', onClick: () => editor.toggleLock() },
        {
          label: 'Align',
          row: [
            { icon: 'align-left-obj', title: 'Align left', onClick: () => editor.align('left') },
            { icon: 'align-hcenter-obj', title: 'Align centre', onClick: () => editor.align('hcenter') },
            { icon: 'align-top-obj', title: 'Align top', onClick: () => editor.align('top') },
            { icon: 'align-vcenter-obj', title: 'Align middle', onClick: () => editor.align('vcenter') },
          ],
        },
        ...(one?.type === 'image' && (one as ImageElement).assetId
          ? [
              { separator: true },
              {
                label: 'Set image as background',
                icon: 'background',
                onClick: () => {
                  const img = one as ImageElement;
                  editor.doc.transact(() => {
                    editor.doc.updatePage(at.pageId, { background: { type: 'image', assetId: img.assetId!, fit: 'cover', opacity: 1 } });
                    editor.doc.deleteElements([img.id]);
                  });
                },
              },
              { label: 'Crop', icon: 'crop', onClick: () => editor.ui.set({ cropId: one.id }) },
            ]
          : []),
        { label: 'Add link', icon: 'link', onClick: () => promptLink(editor) },
        { label: 'Add to every page', icon: 'page', disabled: editor.s.pageOrder.length < 2, onClick: () => editor.addToAllPages() },
      ]
    : [
        { label: 'Paste', kbd: '⌘V', onClick: () => editor.paste() },
        { label: 'Select all', kbd: '⌘A', onClick: () => editor.selectAll() },
        { separator: true },
        { label: 'Page background', icon: 'background', onClick: () => editor.openPanel('background') },
        { label: 'Add page', icon: 'page-add', onClick: () => editor.addPage(at.pageId) },
        { label: 'Duplicate page', icon: 'duplicate', onClick: () => editor.duplicatePage(at.pageId) },
        { label: 'Delete page', icon: 'trash', danger: true, disabled: editor.s.pageOrder.length < 2, onClick: () => editor.deletePage(at.pageId) },
      ];

  return (
    <Popover anchor={{ left: at.x, top: at.y, bottom: at.y, right: at.x, width: 0, height: 0 }} onClose={close} className="menu">
      <Menu items={items} onClose={close} />
    </Popover>
  );
}

function promptLink(editor: ReturnType<typeof useEditor>) {
  const current = editor.selected()[0]?.link ?? '';
  const url = window.prompt('Link (shows in exported PDFs and presentations)', current || 'https://');
  if (url === null) return;
  editor.updateSelected({ link: url.trim() && url !== 'https://' ? url.trim() : undefined });
}
