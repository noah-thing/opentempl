import { useEffect, useMemo, useState } from 'react';
import { useEditor } from '../editor/Editor';
import { importFiles, pickFiles } from '../io/upload';
import { listUploads, onUploadsChange, removeUpload } from '../io/uploads';
import type { Asset } from '../doc/types';
import { Icon } from '../ui/icons';
import { Eyes } from '../ui/Logo';
import { Section } from './controls';
import { addCustomFont, listCustomFonts } from '../fonts/custom';

export default function UploadsPanel() {
  const editor = useEditor();
  const [items, setItems] = useState<(Asset & { addedAt: number })[] | null>(null);
  const [over, setOver] = useState(false);
  const [fonts, setFonts] = useState<string[]>([]);
  useEffect(() => {
    const load = () => listUploads().then(setItems);
    load();
    listCustomFonts().then(setFonts);
    return onUploadsChange(load) as () => void;
  }, []);
  const urls = useMemo(() => new Map((items ?? []).map((a) => [a.id, URL.createObjectURL(new Blob([a.bytes as BlobPart], { type: a.mime }))])), [items]);
  useEffect(() => () => urls.forEach((u) => URL.revokeObjectURL(u)), [urls]);

  const place = (a: Asset) => {
    if (!editor.doc.getAsset(a.id)) editor.doc.addAsset(a);
    editor.addImageAsset(a.id, a.width, a.height);
  };

  return (
    <>
      <div
        className={`dropzone ${over ? 'is-over' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          importFiles(editor, [...e.dataTransfer.files]);
        }}
      >
        <Eyes size={56} mood={over ? 'wow' : 'look'} />
        <div style={{ fontWeight: 600, margin: '8px 0 2px' }}>Drop images here</div>
        <div className="hint" style={{ marginBottom: 12 }}>
          PNG, JPG, WebP, GIF and SVG. They stay on this device.
        </div>
        <button className="btn btn-ink" onClick={async () => importFiles(editor, await pickFiles())}>
          <Icon name="upload" /> Upload files
        </button>
      </div>
      <Section title="Your uploads">
        {items === null ? (
          <div className="hint">Loading</div>
        ) : items.length ? (
          <div className="grid-2">
            {items.map((a) => (
              <div key={a.id} className="tile" style={{ aspectRatio: `${a.width} / ${a.height}`, maxHeight: 220 }}>
                <img
                  src={urls.get(a.id)}
                  alt={a.name}
                  draggable
                  onDragStart={(e) => {
                    // Uploads drop as photos: carry the asset id through a data URL free path.
                    e.dataTransfer.setData('application/x-tavla-upload', a.id);
                  }}
                  onClick={() => place(a)}
                  style={{ cursor: 'pointer', objectFit: 'contain', background: 'repeating-conic-gradient(#e9e9ee 0 25%, #fff 0 50%) 0 0/12px 12px' }}
                />
                <button
                  className="icon-btn"
                  title="Remove from uploads"
                  onClick={() => removeUpload(a.id)}
                  style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(255,255,255,.9)', width: 26, height: 26 }}
                >
                  <Icon name="trash" size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="hint">Nothing yet. Uploads appear here and in every design.</p>
        )}
      </Section>
      <Section title="Your fonts">
        <p className="hint" style={{ margin: '0 0 8px' }}>
          Add a font file you own. It works in every design on this device.
        </p>
        <button
          className="btn btn-outline btn-block"
          onClick={async () => {
            const files = await pickFiles('.ttf,.otf,.woff,.woff2');
            for (const f of files) {
              try {
                const fam = await addCustomFont(f);
                editor.toast(`${fam} is ready in the font menu`);
              } catch {
                editor.toast(`Could not read ${f.name}`);
              }
            }
            setFonts(await listCustomFonts());
          }}
        >
          <Icon name="font" /> Upload a font
        </button>
        {fonts.map((f) => (
          <div key={f} className="menu-item" style={{ fontFamily: `"${f}"`, fontSize: 17 }}>
            {f}
          </div>
        ))}
      </Section>
    </>
  );
}
