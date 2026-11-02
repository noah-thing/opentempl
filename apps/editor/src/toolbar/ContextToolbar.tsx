import { useState } from 'react';
import { useEditor } from '../editor/Editor';
import { useDoc, useUI } from '../editor/hooks';
import type { Element, Fill, ImageElement, LineCap, LineElement, ShapeElement, SvgElement, TextElement, QrElement, ChartElement, DrawElement, PageTransition } from '../doc/types';
import { Icon } from '../ui/icons';
import { Popover, usePopover } from '../ui/Popover';
import { fillCss } from '../render/paint';
import { parseSvg } from '../render/ElementView';
import { SHAPE_KINDS, elementPath, shapePath } from '../render/shapes';
import { nearestWeight } from '../fonts/fonts';
import { Slider } from '../panels/controls';
import { richCommand } from '../canvas/TextEditor';
import { VideoTools } from './VideoTools';

export function ContextToolbar() {
  const sel = useUI((s) => s.selection);
  const editing = useUI((s) => s.editingTextId);
  const els = useDoc((s) => sel.map((id) => s.elements[id]).filter(Boolean) as Element[]);
  const cropId = useUI((s) => s.cropId);
  if (cropId) return null;
  const types = new Set(els.map((e) => e.type));
  const one = els.length === 1 ? els[0] : null;
  const allText = els.length > 0 && types.size === 1 && types.has('text');
  return (
    <div className="ctxbar-row">
      <div
        className="ctxbar"
        key={one ? one.type : els.length ? 'multi' : 'page'}
        // While editing text, toolbar clicks must not steal the text selection.
        onMouseDown={(e) => editing && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'SELECT' && e.preventDefault()}
      >
        {!els.length ? (
          <PageTools />
        ) : allText ? (
          <TextTools els={els as TextElement[]} editing={!!editing} />
        ) : one?.type === 'shape' ? (
          <ShapeTools el={one} />
        ) : one?.type === 'image' ? (
          <ImageTools el={one} />
        ) : one?.type === 'line' ? (
          <LineTools el={one} />
        ) : one?.type === 'svg' ? (
          <SvgTools el={one} />
        ) : one?.type === 'draw' ? (
          <DrawTools el={one} />
        ) : one?.type === 'chart' ? (
          <ChartTools el={one} />
        ) : one?.type === 'table' ? (
          <TableTools />
        ) : one?.type === 'qr' ? (
          <QrTools el={one} />
        ) : one?.type === 'video' ? (
          <VideoTools el={one} TBtn={TBtn} Div={Div} />
        ) : (
          <MultiTools />
        )}
        {els.length ? <CommonTools els={els} /> : null}
      </div>
    </div>
  );
}

// ---------- shared bits ----------

function Div() {
  return <span className="div" />;
}

function TBtn({ icon, lead, label, title, on, onClick, children }: { icon?: string; lead?: React.ReactNode; label?: string; title?: string; on?: boolean; onClick?: (e: React.MouseEvent) => void; children?: React.ReactNode }) {
  return (
    <button className={`tbtn ${on ? 'is-on' : ''}`} title={title ?? label} onClick={onClick}>
      {lead}
      {icon ? <Icon name={icon} /> : null}
      {label ? <span>{label}</span> : null}
      {children}
    </button>
  );
}

export function Swatch({ fill, onClick, title }: { fill: Fill | string; onClick: () => void; title: string }) {
  const css = typeof fill === 'string' ? fill : fillCss(fill);
  return (
    <button className="swatch-btn" title={title} onClick={onClick}>
      <span className="chip" style={{ background: css === 'transparent' ? 'repeating-conic-gradient(#ddd 0 25%, #fff 0 50%) 0 0/8px 8px' : css }} />
    </button>
  );
}

function Transparency({ els }: { els: Element[] }) {
  const editor = useEditor();
  const pop = usePopover();
  const v = Math.round((els[0]?.opacity ?? 1) * 100);
  return (
    <>
      <TBtn icon="transparency" title="Transparency" onClick={pop.toggle} />
      {pop.anchor ? (
        <Popover anchor={pop.anchor} onClose={pop.close} placement="bottom-end" width={260}>
          <div style={{ padding: 14 }}>
            <div className="label" style={{ marginBottom: 6 }}>
              Transparency
            </div>
            <Slider value={v} min={0} max={100} onChange={(n) => editor.updateSelected({ opacity: n / 100 })} />
            <div className="label" style={{ margin: '10px 0 6px' }}>
              Blend
            </div>
            <select
              className="num"
              style={{ width: '100%' }}
              value={els[0]?.blend ?? 'normal'}
              onChange={(e) => editor.updateSelected({ blend: e.target.value === 'normal' ? undefined : e.target.value })}
            >
              {['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'].map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </Popover>
      ) : null}
    </>
  );
}

function CommonTools({ els }: { els: Element[] }) {
  const editor = useEditor();
  const panel = useUI((s) => s.panel);
  return (
    <>
      <Div />
      {els.length === 1 && els[0].type !== 'table' ? <TBtn label="Animate" icon="animate" on={panel === 'animate'} onClick={() => editor.openPanel('animate')} /> : null}
      <TBtn label="Position" icon="position" on={panel === 'position'} onClick={() => editor.openPanel('position')} />
      <Transparency els={els} />
      {els.length === 1 ? <LinkButton el={els[0]} /> : null}
    </>
  );
}

function LinkButton({ el }: { el: Element }) {
  const editor = useEditor();
  const pop = usePopover();
  const [v, setV] = useState(el.link ?? '');
  return (
    <>
      <TBtn icon="link" title="Link" on={!!el.link} onClick={(e) => (setV(el.link ?? ''), pop.toggle(e))} />
      {pop.anchor ? (
        <Popover anchor={pop.anchor} onClose={pop.close} placement="bottom-end" width={320}>
          <form
            style={{ padding: 12, display: 'flex', gap: 8 }}
            onSubmit={(e) => {
              e.preventDefault();
              const url = v.trim();
              editor.update(el.id, { link: url ? (/^[a-z]+:/i.test(url) ? url : `https://${url}`) : undefined });
              pop.close();
            }}
          >
            <div className="field" style={{ flex: 1 }}>
              <input autoFocus value={v} placeholder="Paste a link" onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.stopPropagation()} />
            </div>
            <button className="btn btn-ink btn-sm" style={{ height: 34 }}>
              Done
            </button>
          </form>
        </Popover>
      ) : null}
    </>
  );
}

// ---------- page ----------

function PageTools() {
  const editor = useEditor();
  const pageId = useUI((s) => s.activePageId);
  const page = useDoc((s) => (pageId ? s.pages[pageId] : null));
  const pop = usePopover();
  if (!page) return null;
  const TRANS: PageTransition[] = ['none', 'fade', 'slide', 'zoom', 'flip', 'circle'];
  return (
    <>
      <TBtn label="Background" title="Page background" lead={<span className="bg-dot" style={{ background: fillCss(page.background) }} />} onClick={() => editor.openPanel('background')} />
      <Div />
      <TBtn icon="animate" label={page.transition === 'none' ? 'Transition' : `Transition: ${page.transition}`} onClick={pop.toggle} />
      <Div />
      <TBtn icon="palette" label="Styles" onClick={() => editor.openPanel('styles')} />
      <Div />
      <TBtn icon="ruler" label="Rulers" title="Rulers and guides" on={editor.state.showRulers} onClick={() => editor.ui.set({ showRulers: !editor.state.showRulers })} />
      <TBtn icon="grid" label="Grid" title="Layout grid" on={editor.state.showGrid} onClick={() => editor.ui.set({ showGrid: !editor.state.showGrid })} />
      <TBtn icon="magnet" label="Snap" title="Snap to guides and edges" on={editor.state.snap} onClick={() => editor.ui.set({ snap: !editor.state.snap })} />
      {pop.anchor ? (
        <Popover anchor={pop.anchor} onClose={pop.close} width={280}>
          <div style={{ padding: 14 }} className="stack">
            <div className="label">Transition into this page</div>
            <div className="chips">
              {TRANS.map((t) => (
                <button key={t} className={`chip ${page.transition === t ? 'is-on' : ''}`} onClick={() => editor.doc.updatePage(page.id, { transition: t })}>
                  {t === 'none' ? 'None' : t[0].toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <div className="label">Page duration when playing</div>
            <Slider value={page.duration} min={1} max={30} step={0.5} unit="s" onChange={(n) => editor.doc.updatePage(page.id, { duration: n })} />
            <button className="btn btn-sm btn-outline" onClick={() => editor.s.pageOrder.forEach((p) => editor.doc.updatePage(p, { transition: page.transition, duration: page.duration }))}>
              Apply to every page
            </button>
          </div>
        </Popover>
      ) : null}
    </>
  );
}

// ---------- text ----------

function TextTools({ els }: { els: TextElement[]; editing: boolean }) {
  const editor = useEditor();
  const panel = useUI((s) => s.panel);
  const t = els[0];
  const spacing = usePopover();
  // Styling the whole box also clears that property from any styled runs.
  const setAll = (patch: Partial<TextElement>) =>
    editor.updateSelected((e) => {
      if (e.type !== 'text') return null;
      const keys = Object.keys(patch) as (keyof TextElement)[];
      const runs = e.runs
        ?.map((r) => {
          const n = { ...r } as Record<string, unknown>;
          for (const k of keys) delete n[k];
          return n as unknown as typeof r;
        })
        .filter((r) => Object.keys(r).length > 2);
      return { ...patch, runs: runs?.length ? runs : undefined } as Partial<Element>;
    });
  const size = Math.round(t.fontSize * 10) / 10;
  const bold = t.fontWeight >= 600;
  const aligns: TextElement['align'][] = ['left', 'center', 'right', 'justify'];
  const lists: TextElement['list'][] = ['none', 'bullet', 'number'];
  return (
    <>
      <button className="tbtn font-pick" onClick={() => editor.openPanel('font')} title="Font" style={{ fontFamily: `"${t.fontFamily}"` }}>
        <span style={{ maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.fontFamily}</span>
        <Icon name="chevron-down" size={12} />
      </button>
      <div className="size-box">
        <button title="Smaller" onClick={() => editor.updateSelected((e) => (e.type === 'text' ? { fontSize: Math.max(4, Math.round(e.fontSize - 1)) } : null))}>
          <Icon name="minus" size={12} />
        </button>
        <input
          value={size}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (n > 0) setAll({ fontSize: Math.min(2000, n) });
          }}
          onKeyDown={(e) => e.stopPropagation()}
          aria-label="Font size"
        />
        <button title="Bigger" onClick={() => editor.updateSelected((e) => (e.type === 'text' ? { fontSize: Math.round(e.fontSize + 1) } : null))}>
          <Icon name="plus" size={12} />
        </button>
      </div>
      <button className="swatch-btn" title="Text colour" onClick={() => editor.openPanel('color', 'text')}>
        <span className="letter">
          A<i style={{ background: t.gradient ? fillCss(t.gradient) : t.color }} />
        </span>
      </button>
      <TBtn
        icon="bold"
        title="Bold (⌘B)"
        on={bold}
        onClick={() => {
          const target = bold ? nearestWeight(t.fontFamily, 400) : nearestWeight(t.fontFamily, 700);
          if (richCommand('bold')) return;
          if (target === t.fontWeight) editor.toast(`${t.fontFamily} comes in one weight only`);
          else setAll({ fontWeight: target });
        }}
      />
      <TBtn icon="italic" title="Italic (⌘I)" on={t.italic} onClick={() => richCommand('italic') || setAll({ italic: !t.italic })} />
      <TBtn icon="underline" title="Underline (⌘U)" on={t.underline} onClick={() => richCommand('underline') || setAll({ underline: !t.underline })} />
      <TBtn icon="strike" title="Strikethrough" on={t.strike} onClick={() => richCommand('strikeThrough') || setAll({ strike: !t.strike })} />
      <TBtn icon="case" title="Uppercase (⌘⇧K)" on={t.uppercase} onClick={() => setAll({ uppercase: !t.uppercase })} />
      <Div />
      <TBtn icon={`align-${t.align}`} title={`Align ${t.align}`} onClick={() => setAll({ align: aligns[(aligns.indexOf(t.align) + 1) % aligns.length] })} />
      <TBtn icon={t.list === 'number' ? 'list-number' : 'list-bullet'} title="List" on={t.list !== 'none'} onClick={() => setAll({ list: lists[(lists.indexOf(t.list) + 1) % lists.length] })} />
      <TBtn icon="spacing" title="Spacing" onClick={spacing.toggle} />
      <Div />
      <TBtn label="Effects" icon="effects" on={panel === 'effects'} onClick={() => editor.openPanel('effects')} />
      {spacing.anchor ? (
        <Popover anchor={spacing.anchor} onClose={spacing.close} width={280}>
          <div style={{ padding: 14 }}>
            <div className="label">Letter spacing</div>
            <Slider value={t.letterSpacing} min={-200} max={800} onChange={(n) => setAll({ letterSpacing: n })} />
            <div className="label">Line spacing</div>
            <Slider value={t.lineHeight} min={0.5} max={3} step={0.01} onChange={(n) => setAll({ lineHeight: n })} />
            <div className="label">Curve</div>
            <Slider value={t.curve} min={-100} max={100} onChange={(n) => setAll({ curve: n })} />
          </div>
        </Popover>
      ) : null}
    </>
  );
}

// ---------- shapes ----------

function BorderPopover({ stroke, radius, showRadius, onStroke, onRadius }: { stroke: ShapeElement['stroke']; radius: number; showRadius: boolean; onStroke: (s: ShapeElement['stroke']) => void; onRadius: (r: number) => void }) {
  const editor = useEditor();
  const pop = usePopover();
  const s = stroke ?? { color: '#0B0B0D', width: 0, dash: 'solid' as const };
  return (
    <>
      <TBtn icon="stroke" title="Border and corners" onClick={pop.toggle} />
      {pop.anchor ? (
        <Popover anchor={pop.anchor} onClose={pop.close} width={290}>
          <div style={{ padding: 14 }}>
            <div className="label" style={{ marginBottom: 6 }}>
              Border style
            </div>
            <div className="seg" style={{ marginBottom: 12 }}>
              {(['solid', 'dash', 'dot'] as const).map((d) => (
                <button key={d} className={s.dash === d && s.width > 0 ? 'is-on' : ''} onClick={() => onStroke({ ...s, dash: d, width: s.width || 4 })}>
                  {d === 'solid' ? 'Solid' : d === 'dash' ? 'Dashed' : 'Dotted'}
                </button>
              ))}
            </div>
            <div className="label">Border weight</div>
            <Slider value={s.width} min={0} max={80} onChange={(n) => onStroke(n > 0 ? { ...s, width: n } : null)} />
            <div className="row-between" style={{ marginBottom: 10 }}>
              <span className="label">Border colour</span>
              <Swatch fill={s.color} title="Border colour" onClick={() => editor.openPanel('color', 'stroke')} />
            </div>
            {showRadius ? (
              <>
                <div className="label">Corner rounding</div>
                <Slider value={radius} min={0} max={400} onChange={onRadius} />
              </>
            ) : null}
          </div>
        </Popover>
      ) : null}
    </>
  );
}

function ShapeTools({ el }: { el: ShapeElement }) {
  const editor = useEditor();
  const panel = useUI((s) => s.panel);
  const swap = usePopover();
  return (
    <>
      <Swatch fill={el.fill} title="Fill colour" onClick={() => editor.openPanel('color', 'fill')} />
      <BorderPopover
        stroke={el.stroke}
        radius={el.radius}
        showRadius={!['ellipse', 'heart', 'blob', 'cloud', 'flower', 'squircle', 'halfcircle', 'pill', 'path'].includes(el.shape)}
        onStroke={(stroke) => editor.update(el.id, { stroke } as Partial<Element>)}
        onRadius={(radius) => editor.update(el.id, { radius } as Partial<Element>)}
      />
      <TBtn label="Edit points" icon="bezier" title="Edit points: drag anchors and handles, Alt click to switch corner and curve" onClick={() => editor.editPoints(el.id)} />
      <TBtn title="Change shape" onClick={swap.toggle}>
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path d={elementPath(el, 14, 14)} transform="translate(1 1)" fill="currentColor" fillRule="evenodd" />
        </svg>
      </TBtn>
      <Div />
      <TBtn label="Effects" icon="effects" on={panel === 'effects'} onClick={() => editor.openPanel('effects')} />
      <TBtn icon="flip-h" title="Flip" onClick={() => editor.flip('x')} />
      {swap.anchor ? (
        <Popover anchor={swap.anchor} onClose={swap.close} width={300}>
          <div className="grid-4" style={{ padding: 12 }}>
            {SHAPE_KINDS.map((s) => (
              <button
                key={s.kind}
                className="shape-tile"
                title={s.label}
                onClick={() => {
                  editor.update(el.id, { shape: s.kind } as Partial<Element>);
                  swap.close();
                }}
              >
                <svg viewBox="0 0 40 40">
                  <path d={shapePath(s.kind, 40, 40, 4)} fill="currentColor" />
                </svg>
              </button>
            ))}
          </div>
        </Popover>
      ) : null}
    </>
  );
}

// ---------- images ----------

function ImageTools({ el }: { el: ImageElement }) {
  const editor = useEditor();
  const panel = useUI((s) => s.panel);
  const mask = usePopover();
  const flip = usePopover();
  return (
    <>
      <TBtn label="Edit photo" icon="adjust" on={panel === 'adjust'} onClick={() => editor.openPanel('adjust')} />
      <TBtn label="Crop" icon="crop" onClick={() => el.assetId && editor.ui.set({ cropId: el.id })} />
      <TBtn
        label="Replace"
        icon="upload"
        title="Replace the photo, keep the frame"
        onClick={async () => {
          const { pickFiles, prepareImage } = await import('../io/upload');
          const { addUpload } = await import('../io/uploads');
          const [f] = await pickFiles('image/*');
          if (!f) return;
          const a = await prepareImage(f, f.name);
          editor.doc.addAsset(a);
          addUpload(a).catch(() => {});
          editor.replaceImage(el.id, a.id, a.width, a.height);
        }}
      />
      <TBtn icon="flip-h" title="Flip" onClick={flip.toggle} />
      <TBtn label="Shape" title="Mask with a shape" onClick={mask.toggle}>
        <Icon name="chevron-down" size={12} />
      </TBtn>
      <BorderPopover
        stroke={el.border}
        radius={el.radius}
        showRadius={!el.mask || el.mask === 'rect'}
        onStroke={(border) => editor.update(el.id, { border } as Partial<Element>)}
        onRadius={(radius) => editor.update(el.id, { radius } as Partial<Element>)}
      />
      <Div />
      <TBtn label="Effects" icon="effects" on={panel === 'effects'} onClick={() => editor.openPanel('effects')} />
      {mask.anchor ? (
        <Popover anchor={mask.anchor} onClose={mask.close} width={300}>
          <div className="grid-4" style={{ padding: 12 }}>
            <button className="shape-tile" title="No mask" onClick={() => (editor.update(el.id, { mask: null } as Partial<Element>), mask.close())}>
              <svg viewBox="0 0 40 40">
                <rect width="40" height="40" fill="#0B0B0D" />
              </svg>
            </button>
            {SHAPE_KINDS.filter((s) => s.kind !== 'rect').map((s) => (
              <button key={s.kind} className="shape-tile" title={s.label} onClick={() => (editor.update(el.id, { mask: s.kind } as Partial<Element>), mask.close())}>
                <svg viewBox="0 0 40 40">
                  <path d={shapePath(s.kind, 40, 40, 4)} fill="currentColor" />
                </svg>
              </button>
            ))}
          </div>
        </Popover>
      ) : null}
      {flip.anchor ? (
        <Popover anchor={flip.anchor} onClose={flip.close} className="menu">
          <button className="menu-item" onClick={() => (editor.flip('x'), flip.close())}>
            Flip horizontal
          </button>
          <button className="menu-item" onClick={() => (editor.flip('y'), flip.close())}>
            Flip vertical
          </button>
        </Popover>
      ) : null}
    </>
  );
}

// ---------- lines ----------

const CAPS: LineCap[] = ['none', 'arrow', 'triangle', 'circle', 'square', 'diamond', 'bar'];

function CapPicker({ value, onChange, flip }: { value: LineCap; onChange: (c: LineCap) => void; flip?: boolean }) {
  const pop = usePopover();
  const draw = (c: LineCap) => (
    <svg width="28" height="16" viewBox="0 0 28 16" style={{ transform: flip ? 'scaleX(-1)' : undefined }}>
      <path d="M2 8 H22" stroke="currentColor" strokeWidth="2" />
      {c === 'arrow' ? <path d="M18 3 L24 8 L18 13" fill="none" stroke="currentColor" strokeWidth="2" /> : null}
      {c === 'triangle' ? <path d="M18 3 L26 8 L18 13 Z" fill="currentColor" /> : null}
      {c === 'circle' ? <circle cx="23" cy="8" r="4" fill="currentColor" /> : null}
      {c === 'square' ? <rect x="19" y="4" width="8" height="8" fill="currentColor" /> : null}
      {c === 'diamond' ? <path d="M23 3 L27 8 L23 13 L19 8 Z" fill="currentColor" /> : null}
      {c === 'bar' ? <rect x="22" y="2" width="2" height="12" fill="currentColor" /> : null}
    </svg>
  );
  return (
    <>
      <button className="tbtn" onClick={pop.toggle} title={flip ? 'Line start' : 'Line end'}>
        {draw(value)}
      </button>
      {pop.anchor ? (
        <Popover anchor={pop.anchor} onClose={pop.close} className="menu">
          {CAPS.map((c) => (
            <button key={c} className={`menu-item ${c === value ? 'is-active' : ''}`} onClick={() => (onChange(c), pop.close())}>
              {draw(c)} <span style={{ textTransform: 'capitalize' }}>{c}</span>
            </button>
          ))}
        </Popover>
      ) : null}
    </>
  );
}

function LineTools({ el }: { el: LineElement }) {
  const editor = useEditor();
  const pop = usePopover();
  const set = (p: Partial<LineElement>) => editor.update(el.id, p as Partial<Element>);
  return (
    <>
      <Swatch fill={el.color} title="Line colour" onClick={() => editor.openPanel('color', 'line')} />
      <TBtn icon="stroke" title="Line style" onClick={pop.toggle} />
      <CapPicker value={el.start} onChange={(start) => set({ start })} flip />
      <CapPicker value={el.end} onChange={(end) => set({ end })} />
      <Div />
      <TBtn label="Effects" icon="effects" onClick={() => editor.openPanel('effects')} />
      {pop.anchor ? (
        <Popover anchor={pop.anchor} onClose={pop.close} width={280}>
          <div style={{ padding: 14 }}>
            <div className="seg" style={{ marginBottom: 12 }}>
              {(['solid', 'dash', 'dot'] as const).map((d) => (
                <button key={d} className={el.dash === d ? 'is-on' : ''} onClick={() => set({ dash: d })}>
                  {d === 'solid' ? 'Solid' : d === 'dash' ? 'Dashed' : 'Dotted'}
                </button>
              ))}
            </div>
            <div className="label">Weight</div>
            <Slider value={el.width} min={1} max={60} onChange={(width) => set({ width, h: Math.max(24, width * 4) })} />
            <div className="label">Bend</div>
            <Slider value={el.curve} min={-100} max={100} onChange={(curve) => set({ curve, h: Math.max(24, el.width * 4, (Math.abs(curve) / 100) * el.w * 1.1) })} />
          </div>
        </Popover>
      ) : null}
    </>
  );
}

// ---------- graphics ----------

function SvgTools({ el }: { el: SvgElement }) {
  const editor = useEditor();
  const colors = parseSvg(el.svg).colors.slice(0, 6);
  return (
    <>
      {colors.length ? (
        colors.map((c) => (
          <Swatch key={c} fill={el.colors[c] ?? (c === 'currentColor' ? '#0B0B0D' : c)} title="Graphic colour" onClick={() => editor.openPanel('color', `svg:${c}`)} />
        ))
      ) : (
        <span className="hint" style={{ padding: '0 8px' }}>
          Graphic
        </span>
      )}
      <Div />
      <TBtn label="Effects" icon="effects" onClick={() => editor.openPanel('effects')} />
      <TBtn icon="flip-h" title="Flip horizontal" onClick={() => editor.flip('x')} />
    </>
  );
}

function DrawTools({ el }: { el: DrawElement }) {
  const editor = useEditor();
  const pop = usePopover();
  return (
    <>
      <Swatch fill={el.paths[0]?.color ?? '#000'} title="Ink colour" onClick={() => editor.openPanel('color', 'draw')} />
      <TBtn icon="stroke" title="Stroke weight" onClick={pop.toggle} />
      <Div />
      <TBtn label="Effects" icon="effects" onClick={() => editor.openPanel('effects')} />
      {pop.anchor ? (
        <Popover anchor={pop.anchor} onClose={pop.close} width={260}>
          <div style={{ padding: 14 }}>
            <div className="label">Weight</div>
            <Slider
              value={el.paths[0]?.width ?? 8}
              min={1}
              max={80}
              onChange={(w) => editor.update(el.id, { paths: el.paths.map((p) => ({ ...p, width: w })) } as Partial<Element>)}
            />
          </div>
        </Popover>
      ) : null}
    </>
  );
}

function ChartTools({ el }: { el: ChartElement }) {
  const editor = useEditor();
  const kinds: ChartElement['kind'][] = ['column', 'bar', 'line', 'area', 'pie', 'donut', 'progress'];
  return (
    <>
      <TBtn label="Edit data" icon="table" onClick={() => editor.openPanel('chart')} />
      <select className="num" style={{ width: 120 }} value={el.kind} onChange={(e) => editor.update(el.id, { kind: e.target.value } as Partial<Element>)}>
        {kinds.map((k) => (
          <option key={k} value={k}>
            {k[0].toUpperCase() + k.slice(1)}
          </option>
        ))}
      </select>
      {el.series.slice(0, 4).map((s, i) => (
        <Swatch key={i} fill={s.color} title={`${s.name} colour`} onClick={() => editor.openPanel('color', `chart:${i}`)} />
      ))}
    </>
  );
}

function TableTools() {
  const editor = useEditor();
  return <TBtn label="Edit table" icon="table" onClick={() => editor.openPanel('table')} />;
}

function QrTools({ el }: { el: QrElement }) {
  const editor = useEditor();
  return (
    <>
      <div className="field" style={{ height: 32, width: 240 }}>
        <Icon name="link" />
        <input value={el.value} onChange={(e) => editor.update(el.id, { value: e.target.value } as Partial<Element>)} onKeyDown={(e) => e.stopPropagation()} />
      </div>
      <Swatch fill={el.color} title="Code colour" onClick={() => editor.openPanel('color', 'qr')} />
      <Swatch fill={el.background} title="Background" onClick={() => editor.openPanel('color', 'qrbg')} />
    </>
  );
}

function MultiTools() {
  const editor = useEditor();
  const grouped = editor.isGrouped();
  const n = editor.state.selection.length;
  return (
    <>
      <span className="hint" style={{ padding: '0 8px', fontWeight: 500, color: 'var(--ink-2)' }}>
        {n} selected
      </span>
      <TBtn label={grouped ? 'Ungroup' : 'Group'} icon={grouped ? 'ungroup' : 'group'} onClick={() => (grouped ? editor.ungroup() : editor.group())} />
      {editor.canCombine() ? (
        <>
          <Div />
          <TBtn icon="union" title="Union: merge into one shape" onClick={() => editor.combine('union')} />
          <TBtn icon="subtract" title="Subtract: cut the top shapes out of the bottom one" onClick={() => editor.combine('subtract')} />
          <TBtn icon="intersect" title="Intersect: keep only where they overlap" onClick={() => editor.combine('intersect')} />
          <TBtn icon="exclude" title="Exclude: keep everything but the overlap" onClick={() => editor.combine('exclude')} />
        </>
      ) : null}
      <Div />
      <TBtn icon="align-left-obj" title="Align left" onClick={() => editor.align('left')} />
      <TBtn icon="align-hcenter-obj" title="Align centre" onClick={() => editor.align('hcenter')} />
      <TBtn icon="align-right-obj" title="Align right" onClick={() => editor.align('right')} />
      <TBtn icon="align-top-obj" title="Align top" onClick={() => editor.align('top')} />
      <TBtn icon="align-vcenter-obj" title="Align middle" onClick={() => editor.align('vcenter')} />
      <TBtn icon="align-bottom-obj" title="Align bottom" onClick={() => editor.align('bottom')} />
      <TBtn icon="distribute-h" title="Space evenly across" onClick={() => editor.distribute('x')} />
      <TBtn icon="distribute-v" title="Space evenly down" onClick={() => editor.distribute('y')} />
      <TBtn icon="tidy" title="Tidy up" onClick={() => editor.tidy()} />
    </>
  );
}
