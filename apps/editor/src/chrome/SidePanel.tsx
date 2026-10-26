import { lazy, Suspense, type ComponentType } from 'react';
import { useEditor } from '../editor/Editor';
import { useUI } from '../editor/hooks';
import type { PanelId } from '../editor/state';
import { Icon } from '../ui/icons';

const PANELS: Partial<Record<Exclude<PanelId, null>, { title: string; C: ComponentType }>> = {
  templates: { title: 'Templates', C: lazy(() => import('../panels/TemplatesPanel')) },
  elements: { title: 'Elements', C: lazy(() => import('../panels/ElementsPanel')) },
  text: { title: 'Text', C: lazy(() => import('../panels/TextPanel')) },
  photos: { title: 'Photos', C: lazy(() => import('../panels/PhotosPanel')) },
  uploads: { title: 'Uploads', C: lazy(() => import('../panels/UploadsPanel')) },
  draw: { title: 'Draw', C: lazy(() => import('../panels/DrawPanel')) },
  brand: { title: 'Brand kit', C: lazy(() => import('../panels/BrandPanel')) },
  layers: { title: 'Layers', C: lazy(() => import('../panels/LayersPanel')) },
  apps: { title: 'Tools', C: lazy(() => import('../panels/ToolsPanel')) },
  font: { title: 'Font', C: lazy(() => import('../panels/FontPanel')) },
  color: { title: 'Colour', C: lazy(() => import('../panels/ColorPanel')) },
  effects: { title: 'Effects', C: lazy(() => import('../panels/EffectsPanel')) },
  adjust: { title: 'Edit photo', C: lazy(() => import('../panels/AdjustPanel')) },
  animate: { title: 'Animate', C: lazy(() => import('../panels/AnimatePanel')) },
  position: { title: 'Position', C: lazy(() => import('../panels/PositionPanel')) },
  chart: { title: 'Chart data', C: lazy(() => import('../panels/ChartPanel')) },
  table: { title: 'Table', C: lazy(() => import('../panels/TablePanel')) },
  background: { title: 'Page background', C: lazy(() => import('../panels/BackgroundPanel')) },
  resize: { title: 'Resize', C: lazy(() => import('../panels/ResizePanel')) },
  bulk: { title: 'Bulk create', C: lazy(() => import('../panels/BulkPanel')) },
  history: { title: 'Version history', C: lazy(() => import('../panels/HistoryPanel')) },
};

export function SidePanel() {
  const editor = useEditor();
  const panel = useUI((s) => s.panel);
  const entry = panel ? PANELS[panel] : null;
  return (
    <aside className={`panel ${entry ? 'is-open' : ''}`} aria-label={entry?.title}>
      {entry ? (
        <div className="panel-inner">
          <div className="panel-head">
            <h2>{entry.title}</h2>
            <button className="icon-btn" title="Close panel" onClick={() => editor.ui.set({ panel: null })}>
              <Icon name="close" />
            </button>
          </div>
          <div className="panel-body">
            <Suspense fallback={<div className="hint">Loading</div>}>
              <entry.C key={panel} />
            </Suspense>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
