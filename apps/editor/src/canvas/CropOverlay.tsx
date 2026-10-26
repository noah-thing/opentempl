import type { ImageElement } from '../doc/types';
import { useEditor, coverCrop } from '../editor/Editor';
import { startDrag, useDoc } from '../editor/hooks';
import { rotatePoint, type Point } from '../lib/geom';

// Crop mode: the full photo shows ghosted around the frame. Drag to move the
// photo inside the frame, use the slider to zoom it.
export function CropOverlay({ id, zoom }: { id: string; zoom: number; toLocal: (x: number, y: number) => Point }) {
  const editor = useEditor();
  const el = useDoc((s) => s.elements[id]) as ImageElement | undefined;
  if (!el || el.type !== 'image') return null;
  const url = editor.doc.assetUrl(el.assetId);
  const asset = editor.doc.getAsset(el.assetId);
  const iw = el.w / el.crop.w;
  const ih = el.h / el.crop.h;
  const ix = -el.crop.x * iw;
  const iy = -el.crop.y * ih;
  const scale = asset ? Math.max(1, 1 / Math.max(el.crop.w, el.crop.h * (asset.height / asset.width) / (el.h / el.w) || 1)) : 1;
  void scale;

  const onPan = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const start = { ...el.crop };
    editor.doc.undo.stopCapturing();
    startDrag(
      e,
      (_ev, dx, dy) => {
        // Pointer delta in screen pixels -> element local -> image fractions.
        const local = rotatePoint({ x: dx, y: dy }, { x: 0, y: 0 }, -el.rotation);
        const fx = local.x / zoom / iw;
        const fy = local.y / zoom / ih;
        editor.doc.updateElement(el.id, {
          crop: {
            ...start,
            x: Math.max(0, Math.min(1 - start.w, start.x - fx)),
            y: Math.max(0, Math.min(1 - start.h, start.y - fy)),
          },
        } as Partial<ImageElement>);
      },
      undefined,
      0,
    );
  };

  // Zoom: 1 means the photo just covers the frame.
  const base = asset ? coverCrop(asset.width, asset.height, el.w, el.h) : { x: 0, y: 0, w: 1, h: 1 };
  const z = base.w / el.crop.w;
  const setZoom = (nz: number) => {
    const cx = el.crop.x + el.crop.w / 2;
    const cy = el.crop.y + el.crop.h / 2;
    const w = base.w / nz;
    const h = base.h / nz;
    editor.doc.updateElement(el.id, {
      crop: {
        w,
        h,
        x: Math.max(0, Math.min(1 - w, cx - w / 2)),
        y: Math.max(0, Math.min(1 - h, cy - h / 2)),
      },
    } as Partial<ImageElement>);
  };

  return (
    <>
      <div
        className="crop-stage"
        data-overlay-control
        style={{
          left: el.x * zoom,
          top: el.y * zoom,
          width: el.w * zoom,
          height: el.h * zoom,
          transform: `${el.rotation ? `rotate(${el.rotation}deg)` : ''} ${el.flipX ? 'scaleX(-1)' : ''} ${el.flipY ? 'scaleY(-1)' : ''}`,
        }}
        onPointerDown={onPan}
      >
        {url ? (
          <img
            src={url}
            alt=""
            draggable={false}
            className="crop-ghost"
            style={{ left: ix * zoom, top: iy * zoom, width: iw * zoom, height: ih * zoom }}
          />
        ) : null}
        <div className="crop-window" />
      </div>
      <div
        className="crop-bar"
        data-overlay-control
        style={{ left: (el.x + el.w / 2) * zoom, top: (el.y + el.h) * zoom + 18 }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <span>Zoom</span>
        <input type="range" min={1} max={5} step={0.01} value={z} onChange={(e) => setZoom(Number(e.target.value))} />
        <button onClick={() => asset && editor.doc.updateElement(el.id, { crop: coverCrop(asset.width, asset.height, el.w, el.h) } as Partial<ImageElement>)}>Reset</button>
        <button className="primary" onClick={() => editor.ui.set({ cropId: null })}>
          Done
        </button>
      </div>
    </>
  );
}
