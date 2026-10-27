import { useState } from 'react';
import { useEditor } from '../editor/Editor';
import { useDoc } from '../editor/hooks';
import { Icon } from '../ui/icons';
import { useEscape } from '../ui/useEscape';
import { Eyes } from '../ui/Logo';
import { exportDesign, type ExportFormat } from '../export/exporters';

const FORMATS: { id: ExportFormat; name: string; note: string }[] = [
  { id: 'png', name: 'PNG', note: 'Sharp images, transparent backgrounds' },
  { id: 'jpg', name: 'JPG', note: 'Small files for photos' },
  { id: 'webp', name: 'WebP', note: 'Smallest images for the web' },
  { id: 'pdf', name: 'PDF', note: 'Print and documents, links stay clickable' },
  { id: 'svg', name: 'SVG', note: 'Vector, opens in Figma and Illustrator' },
  { id: 'video', name: 'MP4 video', note: 'Pages and animations as a video' },
  { id: 'gif', name: 'GIF', note: 'A small looping animation for chats and posts' },
  { id: 'tavla', name: 'Tavla file', note: 'The editable design, to keep or send' },
];

export function ExportDialog() {
  const editor = useEditor();
  const allPages = useDoc((s) => s.pageOrder);
  const pagesMap = useDoc((s) => s.pages);
  const pageOrder = allPages.filter((id) => !pagesMap[id]?.hidden);
  const meta = useDoc((s) => s.meta);
  const [format, setFormat] = useState<ExportFormat>('png');
  const [scale, setScale] = useState(1);
  const [transparent, setTransparent] = useState(false);
  const [quality, setQuality] = useState(0.9);
  const [pdfQuality, setPdfQuality] = useState<'standard' | 'print'>('standard');
  const [which, setWhich] = useState<'all' | 'current'>('all');
  const [bleed, setBleed] = useState(false);
  const [busy, setBusy] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const close = () => !busy && editor.ui.set({ exportOpen: false });
  useEscape(close);

  const run = async () => {
    setError(null);
    setBusy({ done: 0, total: 1 });
    try {
      await exportDesign(editor.doc, {
        format,
        pageIds: which === 'current' && editor.state.activePageId ? [editor.state.activePageId] : pageOrder,
        scale,
        transparent,
        quality,
        pdfQuality,
        bleed,
        onProgress: (done, total) => setBusy({ done, total }),
      });
      setBusy(null);
      editor.ui.set({ exportOpen: false });
      editor.toast('Exported. Check your downloads.');
    } catch (e) {
      setBusy(null);
      setError(String((e as Error)?.message ?? e));
    }
  };

  const raster = format === 'png' || format === 'jpg' || format === 'webp';
  return (
    <div className="scrim" onPointerDown={(e) => e.target === e.currentTarget && close()}>
      <div className="dialog" role="dialog" aria-label="Export" style={{ width: 'min(620px, 100%)' }}>
        <div className="dialog-head">
          <h2>Export</h2>
          <button className="icon-btn" onClick={close} title="Close">
            <Icon name="close" />
          </button>
        </div>
        <div className="dialog-body">
          {busy ? (
            <div className="empty" style={{ padding: '36px 0' }}>
              <Eyes size={84} mood="wow" />
              <h4>
                Rendering {busy.done} of {busy.total}
              </h4>
              <div style={{ width: 260, height: 4, background: 'var(--line)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${(busy.done / Math.max(1, busy.total)) * 100}%`, height: '100%', background: 'var(--ink)', transition: 'width .2s' }} />
              </div>
            </div>
          ) : (
            <div className="stack" style={{ gap: 18 }}>
              <div className="grid-2" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                {FORMATS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    style={{
                      textAlign: 'left',
                      padding: '12px 14px',
                      borderRadius: 12,
                      boxShadow: format === f.id ? 'inset 0 0 0 2px var(--ink)' : 'inset 0 0 0 1px var(--line)',
                      background: format === f.id ? 'var(--sheet)' : 'var(--sheet)',
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{f.name}</div>
                    <div className="hint">{f.note}</div>
                  </button>
                ))}
              </div>
              {format !== 'tavla' ? (
                <div className="row-between">
                  <span className="label">Pages</span>
                  <div className="seg" style={{ width: 240 }}>
                    <button className={which === 'all' ? 'is-on' : ''} onClick={() => setWhich('all')}>
                      All {pageOrder.length}
                    </button>
                    <button className={which === 'current' ? 'is-on' : ''} onClick={() => setWhich('current')}>
                      Current page
                    </button>
                  </div>
                </div>
              ) : null}
              {raster || format === 'video' ? (
                <div>
                  <div className="row-between">
                    <span className="label">Size</span>
                    <span className="tabular hint">
                      {Math.round(meta.width * scale)} × {Math.round(meta.height * scale)} px
                    </span>
                  </div>
                  <div className="slider-row">
                    <input
                      type="range"
                      min={0.25}
                      max={4}
                      step={0.25}
                      value={scale}
                      style={{ ['--fill' as string]: `${((scale - 0.25) / 3.75) * 100}%` }}
                      onChange={(e) => setScale(Number(e.target.value))}
                    />
                    <span className="tabular" style={{ textAlign: 'right', fontWeight: 500 }}>
                      {scale}×
                    </span>
                  </div>
                </div>
              ) : null}
              {format === 'png' || format === 'webp' || format === 'svg' ? (
                <label className="row-between">
                  <span className="label">Transparent background</span>
                  <button className={`switch ${transparent ? 'is-on' : ''}`} onClick={() => setTransparent((t) => !t)} aria-pressed={transparent} />
                </label>
              ) : null}
              {format === 'jpg' || format === 'webp' ? (
                <div>
                  <span className="label">Quality</span>
                  <div className="slider-row">
                    <input type="range" min={0.4} max={1} step={0.05} value={quality} style={{ ['--fill' as string]: `${((quality - 0.4) / 0.6) * 100}%` }} onChange={(e) => setQuality(Number(e.target.value))} />
                    <span className="tabular" style={{ textAlign: 'right', fontWeight: 500 }}>
                      {Math.round(quality * 100)}
                    </span>
                  </div>
                </div>
              ) : null}
              {format === 'pdf' ? (
                <div className="row-between">
                  <span className="label">Quality</span>
                  <div className="seg" style={{ width: 240 }}>
                    <button className={pdfQuality === 'standard' ? 'is-on' : ''} onClick={() => setPdfQuality('standard')}>
                      Screen
                    </button>
                    <button className={pdfQuality === 'print' ? 'is-on' : ''} onClick={() => setPdfQuality('print')}>
                      Print, 300 dpi
                    </button>
                  </div>
                </div>
              ) : null}
              {format === 'pdf' ? (
                <label className="row-between">
                  <span className="label">Bleed and crop marks, for print shops</span>
                  <button className={`switch ${bleed ? 'is-on' : ''}`} onClick={() => setBleed((b) => !b)} aria-pressed={bleed} />
                </label>
              ) : null}
              {error ? <div style={{ color: '#d22b1b' }}>{error}</div> : null}
              <button className="btn btn-primary btn-block" style={{ height: 44 }} onClick={run}>
                <Icon name="download" /> Download {FORMATS.find((f) => f.id === format)?.name}
              </button>
              <p className="hint" style={{ margin: 0 }}>
                Everything renders on your machine. Nothing is uploaded, no watermark, no paid tier.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
