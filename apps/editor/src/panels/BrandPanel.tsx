import { useMemo, useState } from 'react';
import { useEditor } from '../editor/Editor';
import { useDoc } from '../editor/hooks';
import { Section } from './controls';
import { addKit, removeKit, setActiveKit, updateKit, useBrand, useBrandState } from './brand';
import { Icon } from '../ui/icons';
import { FONTS, ensureFont } from '../fonts/fonts';
import { pickFiles, prepareImage } from '../io/upload';
import { documentColors } from './ColorPanel';
import type { TextElement } from '../doc/types';
import { COBALT } from '../doc/colors';

export default function BrandPanel() {
  const editor = useEditor();
  const state = useBrandState();
  const kit = useBrand();
  const elements = useDoc((s) => s.elements);
  const pages = useDoc((s) => s.pages);
  const docColors = useMemo(() => documentColors(elements, pages), [elements, pages]);
  const [editingName, setEditingName] = useState(false);
  const logoUrls = useMemo(() => kit.logos.map((l) => URL.createObjectURL(new Blob([l.bytes as BlobPart], { type: l.mime }))), [kit.logos]);

  // Apply brand fonts and colours to the whole design in one go.
  const applyToDesign = () => {
    const patches: Record<string, Partial<TextElement>> = {};
    for (const el of Object.values(editor.s.elements)) {
      if (el.type !== 'text') continue;
      const role = el.role ?? (el.fontSize >= 64 ? 'heading' : el.fontSize >= 36 ? 'subheading' : 'body');
      patches[el.id] = { fontFamily: kit.fonts[role] };
    }
    Object.values(kit.fonts).forEach((f) => ensureFont(f));
    editor.doc.updateElements(patches);
    setTimeout(() => editor.refitAllText(), 300);
    editor.toast('Brand fonts applied to every text box');
  };

  return (
    <>
      <div className="row" style={{ marginBottom: 6 }}>
        <select className="num" style={{ flex: 1, width: 'auto', height: 34 }} value={state.active} onChange={(e) => setActiveKit(e.target.value)}>
          {state.kits.map((k) => (
            <option key={k.id} value={k.id}>
              {k.name}
            </option>
          ))}
        </select>
        <button className="icon-btn" title="New brand kit" onClick={() => addKit()}>
          <Icon name="plus" />
        </button>
        <button className="icon-btn" title="Delete this kit" disabled={state.kits.length < 2} onClick={() => removeKit(kit.id)}>
          <Icon name="trash" />
        </button>
      </div>
      {editingName ? (
        <div className="field">
          <input
            autoFocus
            defaultValue={kit.name}
            onBlur={(e) => {
              updateKit(kit.id, { name: e.target.value.trim() || kit.name });
              setEditingName(false);
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            }}
          />
        </div>
      ) : (
        <button className="link-btn" onClick={() => setEditingName(true)}>
          Rename kit
        </button>
      )}
      <Section title="Logos" action={<button onClick={async () => {
        const files = await pickFiles('image/*');
        const logos = await Promise.all(files.map((f) => prepareImage(f, f.name)));
        updateKit(kit.id, { logos: [...kit.logos, ...logos] });
      }}>Add</button>}>
        {kit.logos.length ? (
          <div className="grid-3">
            {kit.logos.map((l, i) => (
              <div key={l.id} className="tile" style={{ aspectRatio: '1', display: 'grid', placeItems: 'center', background: 'repeating-conic-gradient(#e9e9ee 0 25%, #fff 0 50%) 0 0/12px 12px' }}>
                <img
                  src={logoUrls[i]}
                  alt={l.name}
                  style={{ objectFit: 'contain', padding: 8, cursor: 'pointer' }}
                  onClick={() => {
                    if (!editor.doc.getAsset(l.id)) editor.doc.addAsset(l);
                    editor.addImageAsset(l.id, l.width, l.height);
                  }}
                />
                <button
                  className="icon-btn"
                  style={{ position: 'absolute', top: 2, right: 2, width: 24, height: 24, background: 'rgba(255,255,255,.9)' }}
                  onClick={() => updateKit(kit.id, { logos: kit.logos.filter((x) => x.id !== l.id) })}
                >
                  <Icon name="close" size={12} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="hint" style={{ margin: 0 }}>
            Logos you add here are one click away in every design.
          </p>
        )}
      </Section>
      <Section title="Colours" action={docColors.length ? <button onClick={() => updateKit(kit.id, { colors: [...new Set([...kit.colors, ...docColors])].slice(0, 21) })}>Take from design</button> : null}>
        <div className="swatches">
          {kit.colors.map((c, i) => (
            <label key={i} className="swatch" style={{ background: c, cursor: 'pointer' }} title={`${c}, right click to remove`} onContextMenu={(e) => {
              e.preventDefault();
              updateKit(kit.id, { colors: kit.colors.filter((_, j) => j !== i) });
            }}>
              <input type="color" value={c.slice(0, 7)} style={{ opacity: 0, width: '100%', height: '100%' }} onChange={(e) => updateKit(kit.id, { colors: kit.colors.map((x, j) => (j === i ? e.target.value.toUpperCase() : x)) })} />
            </label>
          ))}
          <button className="swatch add" title="Add colour" onClick={() => updateKit(kit.id, { colors: [...kit.colors, COBALT] })}>
            <span className="inner">
              <Icon name="plus" size={12} />
            </span>
          </button>
        </div>
      </Section>
      <Section title="Fonts">
        {(['heading', 'subheading', 'body'] as const).map((role) => (
          <div key={role} className="row-between" style={{ marginBottom: 8 }}>
            <span className="label" style={{ textTransform: 'capitalize', width: 84 }}>
              {role}
            </span>
            <select
              className="num"
              style={{ flex: 1, width: 'auto', height: 34, fontFamily: `"${kit.fonts[role]}"` }}
              value={kit.fonts[role]}
              onChange={(e) => {
                ensureFont(e.target.value);
                updateKit(kit.id, { fonts: { ...kit.fonts, [role]: e.target.value } });
              }}
            >
              {FONTS.slice(0, 400).map((f) => (
                <option key={f.family} value={f.family}>
                  {f.family}
                </option>
              ))}
            </select>
          </div>
        ))}
        <button className="btn btn-outline btn-block" onClick={applyToDesign}>
          Apply brand fonts to this design
        </button>
      </Section>
    </>
  );
}
