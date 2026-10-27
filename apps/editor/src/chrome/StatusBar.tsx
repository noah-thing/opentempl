import { useState } from 'react';
import { useEditor } from '../editor/Editor';
import { useDoc, useUI } from '../editor/hooks';
import { Icon } from '../ui/icons';
import { ZOOM_MAX, ZOOM_MIN } from '../canvas/Viewport';
import { PageStrip } from './PageStrip';
import { Timeline } from './Timeline';

// Zoom is shown on a log scale so 10% to 800% feels even on the slider.
const toSlider = (z: number) => (Math.log(z) - Math.log(ZOOM_MIN)) / (Math.log(ZOOM_MAX) - Math.log(ZOOM_MIN));
const fromSlider = (v: number) => Math.exp(Math.log(ZOOM_MIN) + v * (Math.log(ZOOM_MAX) - Math.log(ZOOM_MIN)));

export function StatusBar() {
  const editor = useEditor();
  const zoom = useUI((s) => s.zoom);
  const view = useUI((s) => s.view);
  const pages = useDoc((s) => s.pageOrder.length);
  const active = useUI((s) => s.activePageId);
  const index = useDoc((s) => s.pageOrder.indexOf(active ?? '')) + 1;
  const [strip, setStrip] = useState<'pages' | 'timeline' | null>(null);
  const [notes, setNotes] = useState(false);
  return (
    <>
      {notes && active ? <Notes pageId={active} /> : null}
      {strip === 'pages' ? <PageStrip /> : strip === 'timeline' ? <Timeline /> : null}
      <footer className="statusbar">
        <button className={`btn btn-sm ${notes ? 'is-on' : ''}`} onClick={() => setNotes((n) => !n)}>
          <Icon name="notes" /> Notes
        </button>
        <button className={`btn btn-sm ${strip === 'pages' ? 'is-on' : ''}`} onClick={() => setStrip((s) => (s === 'pages' ? null : 'pages'))}>
          <Icon name="page" /> Pages
        </button>
        <button className={`btn btn-sm ${strip === 'timeline' ? 'is-on' : ''}`} onClick={() => setStrip((s) => (s === 'timeline' ? null : 'timeline'))}>
          <Icon name="video" /> Timeline
        </button>
        <span className="pages-count">
          Page {index} of {pages}
        </span>
        <div style={{ flex: 1 }} />
        <div className="zoom">
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={toSlider(zoom)}
            style={{ ['--fill' as string]: `${toSlider(zoom) * 100}%` }}
            onChange={(e) => editor.ui.set({ zoom: fromSlider(Number(e.target.value)), autoFit: false })}
            aria-label="Zoom"
          />
          <span>{Math.round(zoom * 100)}%</span>
        </div>
        <button className="icon-btn" title="Fit page (⌘0)" onClick={() => window.dispatchEvent(new Event('tavla:fit'))}>
          <Icon name="fit" />
        </button>
        <button
          className={`icon-btn ${view === 'grid' ? 'is-on' : ''}`}
          title="Grid view"
          onClick={() => {
            editor.ui.set({ view: view === 'grid' ? 'scroll' : 'grid', autoFit: true });
            setTimeout(() => window.dispatchEvent(new Event('tavla:fit')));
          }}
        >
          <Icon name="grid" />
        </button>
        <button className="icon-btn" title="Present" onClick={() => editor.ui.set({ presenting: true, presentStart: index - 1 })}>
          <Icon name="present" />
        </button>
      </footer>
    </>
  );
}

function Notes({ pageId }: { pageId: string }) {
  const editor = useEditor();
  const notes = useDoc((s) => s.pages[pageId]?.notes ?? '');
  return (
    <div style={{ background: 'var(--sheet)', borderTop: '1px solid var(--line)', padding: '10px 16px' }}>
      <textarea
        value={notes}
        placeholder="Speaker notes for this page. They show in presenter view."
        onChange={(e) => editor.doc.updatePage(pageId, { notes: e.target.value })}
        onKeyDown={(e) => e.stopPropagation()}
        style={{ width: '100%', height: 72, border: 0, outline: 0, resize: 'none', background: 'transparent' }}
      />
    </div>
  );
}
