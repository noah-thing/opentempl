import { createContext, useContext } from 'react';
import { DesignDoc, LOCAL, cloneElements, newId } from '../doc/design';
import { staleConnectors } from '../canvas/connectors';
import type { Element, Id, ImageElement, ShapeElement, TextElement } from '../doc/types';
import type { BooleanOp } from '../lib/pathops';
import { elementPath, pathToNodes, penPath } from '../render/shapes';
import { makeImage, makeText } from '../doc/factory';
import { aabb, unionRects, type Rect } from '../lib/geom';
import { createStore, type Store } from '../lib/store';
import { layoutText } from '../text/layout';
import { curvedGeometry } from '../render/ElementView';
import { fontsVersion, ensureFont, nearestWeight } from '../fonts/fonts';
import { luminance, recolor, refont, type FontPair } from '../tools/restyle';
import { initialEditorState, type EditorState, type PanelId } from './state';
import { localName } from '../collab/collab';
import type { Comment } from '../doc/types';
import { COBALT } from '../doc/colors';

const CLIP_PREFIX = 'tavla/elements:';

// Photos copied in one design travel with the elements to another design in
// the same tab. Across tabs, pasted images are looked up in the uploads library.
const clipboardAssets = new Map<Id, import('../doc/types').Asset>();

// The editor ties a live DesignDoc to UI state and holds every user action, so
// toolbars, shortcuts, the command palette and panels all call the same code.
export class Editor {
  readonly doc: DesignDoc;
  readonly ui: Store<EditorState>;
  private clipboard: Element[] = [];
  private styleClipboard: { type: Element['type']; style: Record<string, unknown> } | null = null;
  private toastTimer = 0;

  constructor(doc: DesignDoc) {
    this.doc = doc;
    this.ui = createStore<EditorState>({
      ...initialEditorState,
      activePageId: doc.snapshot.pageOrder[0] ?? null,
      // On a phone the canvas comes first; panels open from the bottom bar.
      panel: window.innerWidth < 760 ? null : initialEditorState.panel,
    });
    // Pages can arrive later (live collaboration) or be deleted by someone else.
    doc.subscribe(() => {
      const order = doc.snapshot.pageOrder;
      const active = this.ui.get().activePageId;
      if (!active || !order.includes(active)) this.ui.set({ activePageId: order[0] ?? null });
    });
    // Undo and redo bring back what was selected when the step was made, so
    // "try union, undo, try subtract" needs no reselecting.
    doc.undo.on('stack-item-added', (e: { stackItem: { meta: Map<string, unknown> } }) => {
      if (!e.stackItem.meta.has('selection')) e.stackItem.meta.set('selection', this.state.selection);
    });
    doc.undo.on('stack-item-popped', (e: { stackItem: { meta: Map<string, unknown> } }) => {
      const sel = (e.stackItem.meta.get('selection') as Id[] | undefined) ?? [];
      queueMicrotask(() => this.ui.set({ selection: sel.filter((id) => this.s.elements[id]) }));
    });
    // Connectors follow the elements they are stuck to. Only our own edits
    // trigger this; a collaborator's editor moves their connectors itself.
    let queued = false;
    doc.elements.observeDeep((_events, tr) => {
      // Undo and redo restore connectors with their shapes, so they are left alone.
      if (tr.origin !== LOCAL || queued) return;
      queued = true;
      queueMicrotask(() => {
        queued = false;
        const stale = staleConnectors(doc.snapshot.elements);
        if (Object.keys(stale).length) doc.updateElements(stale);
      });
    });
  }

  get s() {
    return this.doc.snapshot;
  }

  get state() {
    return this.ui.get();
  }

  // ---------- selection ----------
  selected(): Element[] {
    return this.state.selection.map((id) => this.s.elements[id]).filter(Boolean);
  }

  groupMembers(id: Id): Id[] {
    const el = this.s.elements[id];
    if (!el?.groupId) return [id];
    const pageId = this.s.elementPage[id];
    const page = this.s.pages[pageId];
    return page.elementIds.filter((eid) => this.s.elements[eid]?.groupId === el.groupId);
  }

  select(ids: Id[], opts: { additive?: boolean; expandGroups?: boolean } = {}) {
    const expand = opts.expandGroups !== false;
    let next = expand ? [...new Set(ids.flatMap((id) => this.groupMembers(id)))] : ids;
    if (opts.additive) {
      const cur = new Set(this.state.selection);
      const allIn = next.every((id) => cur.has(id));
      next = allIn ? this.state.selection.filter((id) => !next.includes(id)) : [...new Set([...this.state.selection, ...next])];
    }
    // A selection never spans pages.
    const page = next.length ? this.s.elementPage[next[next.length - 1]] : this.state.activePageId;
    next = next.filter((id) => this.s.elementPage[id] === page);
    this.ui.set({
      selection: next,
      activePageId: page ?? this.state.activePageId,
      editingTextId: null,
      cropId: null,
    });
    this.syncContextPanel();
  }

  clearSelection() {
    if (!this.state.selection.length && !this.state.editingTextId && !this.state.cropId) return;
    this.ui.set({ selection: [], editingTextId: null, cropId: null });
    this.syncContextPanel();
  }

  selectAll() {
    const page = this.state.activePageId && this.s.pages[this.state.activePageId];
    if (!page) return;
    this.ui.set({ selection: page.elementIds.filter((id) => !this.s.elements[id]?.locked), editingTextId: null });
  }

  // Close contextual panels that no longer apply to the selection.
  private syncContextPanel() {
    const contextual: PanelId[] = ['font', 'color', 'effects', 'adjust', 'animate', 'chart', 'table'];
    if (!contextual.includes(this.state.panel)) return;
    if (!this.state.selection.length && this.state.panel !== 'color') this.ui.set({ panel: null });
  }

  setActivePage(id: Id) {
    if (this.state.activePageId !== id) this.ui.set({ activePageId: id });
  }

  openPanel(panel: PanelId, colorTarget?: string) {
    const same = this.state.panel === panel && (colorTarget === undefined || colorTarget === this.state.colorTarget);
    this.ui.set({ panel: same && panel !== null ? null : panel, colorTarget: colorTarget ?? this.state.colorTarget });
  }

  toast(text: string) {
    window.clearTimeout(this.toastTimer);
    this.ui.set({ toast: { text, id: Date.now() } });
    this.toastTimer = window.setTimeout(() => this.ui.set({ toast: null }), 2600);
  }

  // ---------- geometry ----------
  bounds(ids = this.state.selection): Rect | null {
    return unionRects(ids.map((id) => this.s.elements[id]).filter(Boolean).map((el) => aabb(el)));
  }

  pageSize() {
    return { w: this.s.meta.width, h: this.s.meta.height };
  }

  // ---------- adding ----------
  // Add elements to the active page. When `center` is set they are moved so their
  // combined bounds sit in the middle of the page (or where the user dropped them).
  add(els: Element[], opts: { at?: { x: number; y: number }; select?: boolean; pageId?: Id } = {}) {
    const pageId = opts.pageId ?? this.state.activePageId ?? this.s.pageOrder[0];
    if (!pageId || !els.length) return;
    const b = unionRects(els.map((e) => aabb(e)))!;
    const { w, h } = this.pageSize();
    const cx = opts.at ? opts.at.x : w / 2;
    const cy = opts.at ? opts.at.y : h / 2;
    const dx = cx - (b.x + b.w / 2);
    const dy = cy - (b.y + b.h / 2);
    const placed = els.map((e) => ({ ...e, x: e.x + dx, y: e.y + dy }) as Element);
    this.doc.undo.stopCapturing();
    this.doc.addElements(pageId, placed);
    if (opts.select !== false) this.ui.set({ selection: placed.map((e) => e.id), activePageId: pageId, editingTextId: null });
    for (const e of placed) if (e.type === 'text') ensureFont(e.fontFamily, e.fontWeight, e.italic).then(() => this.fitText(e.id, false));
    return placed;
  }

  // Scale an element so it fits nicely on the page (used for uploads and library items).
  fitToPage<T extends Element>(el: T, fraction = 0.5): T {
    const { w, h } = this.pageSize();
    const s = Math.min((w * fraction) / el.w, (h * fraction) / el.h);
    return { ...el, w: el.w * s, h: el.h * s };
  }

  addImageAsset(assetId: Id, iw: number, ih: number, at?: { x: number; y: number }) {
    // A selected empty frame takes the photo instead. With a whole collage
    // selected, each photo fills the next empty cell.
    const frames = this.selected().filter((e): e is ImageElement => e.type === 'image' && !e.assetId);
    if (frames.length && (this.state.selection.length === 1 || this.isGrouped())) {
      const order = this.s.pages[this.s.elementPage[frames[0].id]].elementIds;
      frames.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
      this.replaceImage(frames[0].id, assetId, iw, ih);
      return;
    }
    const el = this.fitToPage(makeImage({ assetId, w: iw, h: ih }), 0.6);
    this.add([el], { at });
  }

  replaceImage(id: Id, assetId: Id, iw: number, ih: number) {
    const el = this.s.elements[id] as ImageElement;
    if (!el || el.type !== 'image') return;
    this.doc.updateElement(id, { assetId, crop: coverCrop(iw, ih, el.w, el.h) } as Partial<Element>);
  }

  // ---------- updating ----------
  update(id: Id, patch: Partial<Element>) {
    this.doc.updateElement(id, patch);
    if (this.s.elements[id]?.type === 'text') this.fitText(id);
  }

  updateSelected(patch: Partial<Element> | ((el: Element) => Partial<Element> | null)) {
    const patches: Record<Id, Partial<Element>> = {};
    for (const el of this.selected()) {
      const p = typeof patch === 'function' ? patch(el) : patch;
      if (p) patches[el.id] = p;
    }
    this.doc.updateElements(patches);
    for (const id of Object.keys(patches)) if (this.s.elements[id]?.type === 'text') this.fitText(id);
  }

  // Keep a text box's height (and size, for curved text) in sync with its content.
  fitText(id: Id, tracked = true) {
    const el = this.s.elements[id] as TextElement | undefined;
    if (!el || el.type !== 'text') return;
    let patch: Partial<TextElement> | null = null;
    if (el.curve) {
      const single = layoutText({ ...el, w: 100000, list: 'none' }, fontsVersion());
      const g = curvedGeometry(el, single.maxLineWidth);
      if (Math.abs(g.w - el.w) > 0.5 || Math.abs(g.h - el.h) > 0.5) {
        const cx = el.x + el.w / 2;
        const cy = el.y + el.h / 2;
        patch = { w: g.w, h: g.h, x: cx - g.w / 2, y: cy - g.h / 2 };
      }
    } else {
      const lay = layoutText(el, fontsVersion());
      if (Math.abs(lay.height - el.h) > 0.5) patch = el.valign === 'middle' ? { h: lay.height, y: el.y + (el.h - lay.height) / 2 } : { h: lay.height };
    }
    if (!patch) return;
    if (tracked) this.doc.updateElement(id, patch);
    else {
      const y = this.doc.elements.get(id);
      if (y) this.doc.ydoc.transact(() => Object.entries(patch!).forEach(([k, v]) => y.set(k, v)), 'layout');
    }
  }

  refitAllText() {
    for (const el of Object.values(this.s.elements)) if (el.type === 'text') this.fitText(el.id, false);
  }

  // ---------- structure ----------
  deleteSelected() {
    const ids = this.state.selection.filter((id) => !this.s.elements[id]?.locked);
    if (!ids.length) return;
    this.doc.deleteElements(ids);
    this.ui.set({ selection: [], editingTextId: null, cropId: null });
  }

  duplicateSelected(offset = 24) {
    const els = this.selected();
    if (!els.length) return;
    const pageId = this.s.elementPage[els[0].id];
    const order = this.s.pages[pageId].elementIds;
    const groups = new Map<Id, Id>();
    const copies = cloneElements(els.slice().sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id)), groups).map(
      (el) => ({ ...el, x: el.x + offset, y: el.y + offset, locked: false }) as Element,
    );
    this.doc.undo.stopCapturing();
    this.doc.addElements(pageId, copies);
    this.ui.set({ selection: copies.map((c) => c.id) });
  }

  copy(cut = false) {
    const els = this.selected();
    if (!els.length) return;
    this.clipboard = structuredClone(els);
    clipboardAssets.clear();
    for (const e of els) {
      const ids = [e.type === 'image' ? e.assetId : null, e.type === 'shape' && e.fill.type === 'image' ? e.fill.assetId : null].filter(Boolean) as Id[];
      for (const id of ids) {
        const a = this.doc.getAsset(id);
        if (a) clipboardAssets.set(id, a);
      }
    }
    try {
      // Assets are left out of the system clipboard: other OpenTempl tabs share the
      // same origin storage so they can still resolve them later.
      navigator.clipboard?.writeText(CLIP_PREFIX + JSON.stringify(els)).catch(() => {});
    } catch {
      /* clipboard may be unavailable */
    }
    if (cut) this.deleteSelected();
  }

  async paste(text?: string) {
    let els = this.clipboard;
    if (text?.startsWith(CLIP_PREFIX)) {
      try {
        els = JSON.parse(text.slice(CLIP_PREFIX.length));
      } catch {
        /* ignore */
      }
    }
    if (!els.length) return false;
    // Bring along any photo bytes this design does not have yet.
    for (const el of els) {
      const id = el.type === 'image' ? el.assetId : el.type === 'shape' && el.fill.type === 'image' ? el.fill.assetId : null;
      if (!id || this.doc.getAsset(id)) continue;
      let a = clipboardAssets.get(id);
      if (!a) {
        const { listUploads } = await import('../io/uploads');
        a = (await listUploads()).find((u) => u.id === id);
      }
      if (a) this.doc.addAsset(a);
    }
    const groups = new Map<Id, Id>();
    const copies = cloneElements(els, groups);
    const pageId = this.state.activePageId!;
    const sameSpot = copies.some((c) => this.s.pages[pageId]?.elementIds.some((id) => this.s.elements[id]?.x === c.x && this.s.elements[id]?.y === c.y));
    const shifted = copies.map((c) => ({ ...c, x: c.x + (sameSpot ? 24 : 0), y: c.y + (sameSpot ? 24 : 0) }) as Element);
    this.doc.undo.stopCapturing();
    this.doc.addElements(pageId, shifted);
    this.ui.set({ selection: shifted.map((c) => c.id) });
    this.clipboard = shifted;
    return true;
  }

  // ---------- comments ----------
  addComment(pageId: Id, x: number, y: number, text: string) {
    const c: Comment = { id: newId(), pageId, x, y, author: localName(), color: commentColor(localName()), text, at: Date.now(), resolved: false, replies: [] };
    this.doc.setComment(c);
    this.ui.set({ openCommentId: c.id, commentMode: false });
    return c.id;
  }

  replyComment(id: Id, text: string) {
    const c = this.s.comments[id];
    if (!c) return;
    this.doc.setComment({ ...c, replies: [...c.replies, { author: localName(), color: commentColor(localName()), text, at: Date.now() }] });
  }

  resolveComment(id: Id, resolved = true) {
    const c = this.s.comments[id];
    if (c) this.doc.setComment({ ...c, resolved });
    if (resolved) this.ui.set({ openCommentId: null });
  }

  // ---------- style clipboard ----------
  copyStyle() {
    const el = this.selected()[0];
    if (!el) return;
    const keys: Record<string, string[]> = {
      text: ['fontFamily', 'fontSize', 'fontWeight', 'italic', 'underline', 'strike', 'color', 'gradient', 'align', 'lineHeight', 'letterSpacing', 'uppercase', 'effect', 'curve'],
      shape: ['fill', 'stroke', 'radius'],
      image: ['filters', 'radius', 'border', 'mask'],
      line: ['color', 'width', 'dash', 'start', 'end'],
      svg: ['colors'],
      chart: ['fontFamily', 'textColor', 'gridColor', 'showLegend', 'showValues', 'showGrid', 'rounded'],
      table: ['fontFamily', 'fontSize', 'textColor', 'headerFill', 'headerColor', 'bodyFill', 'stripeFill', 'lineColor', 'radius'],
      qr: ['color', 'background'],
      draw: [],
    };
    const style: Record<string, unknown> = { opacity: el.opacity, shadow: el.shadow ?? null, blur: el.blur, blend: el.blend };
    for (const k of keys[el.type] ?? []) style[k] = structuredClone((el as unknown as Record<string, unknown>)[k]);
    this.styleClipboard = { type: el.type, style };
    this.toast('Style copied. Select something and paste it with ⌥⌘V.');
  }

  pasteStyle() {
    const clip = this.styleClipboard;
    if (!clip) return this.toast('Copy a style first with ⌥⌘C');
    this.updateSelected((el) => {
      const common = { opacity: clip.style.opacity, shadow: clip.style.shadow, blur: clip.style.blur, blend: clip.style.blend } as Partial<Element>;
      if (el.type !== clip.type) {
        // Colours still carry across types: text colour onto a shape fill and back.
        const c = (clip.style.color ?? (clip.style.fill as { color?: string } | undefined)?.color) as string | undefined;
        if (c && el.type === 'shape') return { ...common, fill: { type: 'solid', color: c } } as Partial<Element>;
        if (c && el.type === 'text') return { ...common, color: c } as Partial<Element>;
        return common;
      }
      return { ...common, ...structuredClone(clip.style) } as Partial<Element>;
    });
  }

  // Put copies of the selection on every other page, at the same spot.
  addToAllPages() {
    const els = this.selected();
    if (!els.length) return;
    const from = this.s.elementPage[els[0].id];
    this.doc.transact(() => {
      for (const pid of this.s.pageOrder) {
        if (pid === from) continue;
        const groups = new Map<Id, Id>();
        this.doc.addElements(pid, cloneElements(els, groups));
      }
    });
    this.toast(`Added to ${this.s.pageOrder.length - 1} other pages`);
  }

  group() {
    const ids = this.state.selection;
    if (ids.length < 2) return;
    const gid = newId();
    this.doc.updateElements(Object.fromEntries(ids.map((id) => [id, { groupId: gid }])));
    this.toast('Grouped');
  }

  ungroup() {
    const ids = this.state.selection.filter((id) => this.s.elements[id]?.groupId);
    if (!ids.length) return;
    this.doc.updateElements(Object.fromEntries(ids.map((id) => [id, { groupId: undefined }])));
    this.toast('Ungrouped');
  }

  // Typing into a shape: a centred label grouped with it, in a colour that
  // reads on the fill. A label that is already there is edited instead.
  textInShape(id: Id) {
    const el = this.s.elements[id];
    if (el?.type !== 'shape' || el.locked) return;
    const pageId = this.s.elementPage[id];
    const box = aabb(el);
    const inside = (t: Element) => {
      const c = { x: t.x + t.w / 2, y: t.y + t.h / 2 };
      return c.x > box.x && c.x < box.x + box.w && c.y > box.y && c.y < box.y + box.h;
    };
    const label = el.groupId ? this.groupMembers(id).map((i) => this.s.elements[i]).find((t) => t?.type === 'text' && inside(t)) : undefined;
    if (label) return this.ui.set({ selection: [label.id], editingTextId: label.id });
    const fill = el.fill.type === 'solid' && /^#[0-9a-f]{6}/i.test(el.fill.color) ? el.fill.color : '#FFFFFF';
    const size = Math.round(Math.max(16, Math.min(96, Math.min(el.w, el.h) * 0.16)));
    const h = size * 1.3;
    const t = makeText({ text: '', x: el.x + el.w * 0.12, y: el.y + el.h / 2 - h / 2, w: el.w * 0.76, h, fontSize: size, fontWeight: 600, align: 'center', valign: 'middle', lineHeight: 1.3, rotation: el.rotation, color: luminance(fill) < 0.35 ? '#FFFFFF' : '#0B0B0D' });
    const gid = el.groupId ?? newId();
    const at = this.s.pages[pageId].elementIds.indexOf(id) + 1;
    this.doc.undo.stopCapturing();
    this.doc.transact(() => {
      if (!el.groupId) this.doc.updateElement(id, { groupId: gid });
      this.doc.addElement(pageId, { ...t, groupId: gid }, at);
    });
    this.ui.set({ selection: [t.id], editingTextId: t.id });
  }

  // ---------- styles ----------
  private scopePages(scope: 'page' | 'all') {
    return scope === 'all' ? this.s.pageOrder : this.state.activePageId ? [this.state.activePageId] : [];
  }

  applyPalette(colors: string[], scope: 'page' | 'all') {
    const { elements, pages } = recolor(this.s, this.scopePages(scope), colors);
    this.doc.undo.stopCapturing();
    this.doc.transact(() => {
      this.doc.updateElements(elements);
      for (const [id, p] of Object.entries(pages)) this.doc.updatePage(id, p);
    });
  }

  async applyFonts(pair: FontPair, scope: 'page' | 'all') {
    await Promise.all([ensureFont(pair.heading, pair.headingWeight), ensureFont(pair.body, 400), ensureFont(pair.body, 700)]);
    const patches = refont(this.s, this.scopePages(scope), pair, nearestWeight);
    this.doc.undo.stopCapturing();
    this.doc.updateElements(patches);
    this.refitAllText();
  }

  // Any shape becomes pen points: built in ones are converted once, then edited like pen shapes.
  editPoints(id: Id) {
    const el = this.s.elements[id];
    if (el?.type !== 'shape' || el.locked) return;
    if (!el.nodes?.length) {
      const nodes = pathToNodes(elementPath(el));
      if (!nodes || nodes.length > 400) return this.toast('This shape has more than one outline. Redraw it with the pen, or edit it as it is.');
      this.doc.undo.stopCapturing();
      this.doc.updateElement(id, { shape: 'path', path: penPath(nodes, true), nodes, w0: el.w, h0: el.h, radius: 0 } as Partial<Element>);
    }
    this.ui.set({ tool: 'pen', penEditId: id, selection: [] });
  }

  // Shapes only: everything else has no outline to combine.
  canCombine() {
    const sel = this.selected();
    return sel.length > 1 && sel.every((e) => e.type === 'shape');
  }

  // The polygon maths loads the first time someone combines shapes.
  async combine(op: BooleanOp) {
    if (!this.canCombine()) return this.toast('Select two or more shapes to combine');
    if (this.selected().some((e) => e.locked)) return this.toast('Unlock the shapes first, then combine them');
    const { combineShapes } = await import('../lib/pathops');
    const pageId = this.s.elementPage[this.state.selection[0]];
    const order = this.s.pages[pageId].elementIds;
    const shapes = (this.selected() as ShapeElement[]).sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
    const result = combineShapes(shapes, op);
    if (!result) return this.toast('Those shapes leave nothing behind');
    const at = order.indexOf(shapes[0].id);
    this.doc.undo.stopCapturing();
    this.doc.transact(() => {
      this.doc.deleteElements(shapes.map((e) => e.id));
      this.doc.addElement(pageId, result, at);
    });
    this.ui.set({ selection: [result.id] });
  }

  isGrouped() {
    const sel = this.selected();
    return sel.length > 1 && sel.every((e) => e.groupId && e.groupId === sel[0].groupId);
  }

  toggleLock() {
    const sel = this.selected();
    const lock = !sel.every((e) => e.locked);
    this.doc.updateElements(Object.fromEntries(sel.map((e) => [e.id, { locked: lock }])));
    this.toast(lock ? 'Locked' : 'Unlocked');
  }

  reorder(mode: 'front' | 'back' | 'forward' | 'backward') {
    this.doc.reorder(this.state.selection, mode);
  }

  nudge(dx: number, dy: number) {
    this.doc.undo.stopCapturing();
    this.updateSelected((el) => (el.locked ? null : { x: el.x + dx, y: el.y + dy }));
  }

  flip(axis: 'x' | 'y') {
    this.updateSelected((el) => (axis === 'x' ? { flipX: !el.flipX } : { flipY: !el.flipY }));
  }

  align(mode: 'left' | 'hcenter' | 'right' | 'top' | 'vcenter' | 'bottom') {
    const sel = this.selected().filter((e) => !e.locked);
    if (!sel.length) return;
    const multi = this.state.selection.length > 1 && !this.isGrouped();
    const target: Rect = multi ? this.bounds()! : { x: 0, y: 0, w: this.s.meta.width, h: this.s.meta.height };
    // A group aligns as one unit.
    const units = multi ? sel.map((e) => [e]) : [sel];
    const patches: Record<Id, Partial<Element>> = {};
    for (const unit of units) {
      const b = unionRects(unit.map((e) => aabb(e)))!;
      let dx = 0;
      let dy = 0;
      if (mode === 'left') dx = target.x - b.x;
      if (mode === 'hcenter') dx = target.x + target.w / 2 - (b.x + b.w / 2);
      if (mode === 'right') dx = target.x + target.w - (b.x + b.w);
      if (mode === 'top') dy = target.y - b.y;
      if (mode === 'vcenter') dy = target.y + target.h / 2 - (b.y + b.h / 2);
      if (mode === 'bottom') dy = target.y + target.h - (b.y + b.h);
      for (const e of unit) patches[e.id] = { x: e.x + dx, y: e.y + dy };
    }
    this.doc.updateElements(patches);
  }

  distribute(axis: 'x' | 'y') {
    const sel = this.selected().filter((e) => !e.locked);
    if (sel.length < 3) return;
    const boxes = sel.map((e) => ({ e, b: aabb(e) }));
    boxes.sort((a, b) => (axis === 'x' ? a.b.x - b.b.x : a.b.y - b.b.y));
    const first = boxes[0].b;
    const last = boxes[boxes.length - 1].b;
    const total = boxes.reduce((s, x) => s + (axis === 'x' ? x.b.w : x.b.h), 0);
    const span = axis === 'x' ? last.x + last.w - first.x : last.y + last.h - first.y;
    const gap = (span - total) / (boxes.length - 1);
    let cursor = axis === 'x' ? first.x : first.y;
    const patches: Record<Id, Partial<Element>> = {};
    for (const { e, b } of boxes) {
      const d = cursor - (axis === 'x' ? b.x : b.y);
      patches[e.id] = axis === 'x' ? { x: e.x + d } : { y: e.y + d };
      cursor += (axis === 'x' ? b.w : b.h) + gap;
    }
    this.doc.updateElements(patches);
  }

  // Arrange the selection into a tidy grid (something Canva calls "Tidy up").
  tidy() {
    const sel = this.selected().filter((e) => !e.locked);
    if (sel.length < 2) return;
    const b = this.bounds(sel.map((e) => e.id))!;
    const cols = Math.ceil(Math.sqrt(sel.length));
    const sorted = sel.slice().sort((a, c) => (Math.abs(a.y - c.y) > 40 ? a.y - c.y : a.x - c.x));
    const cellW = Math.max(...sel.map((e) => aabb(e).w));
    const cellH = Math.max(...sel.map((e) => aabb(e).h));
    const gap = Math.min(cellW, cellH) * 0.12;
    const patches: Record<Id, Partial<Element>> = {};
    sorted.forEach((e, i) => {
      const box = aabb(e);
      const col = i % cols;
      const row = Math.floor(i / cols);
      const tx = b.x + col * (cellW + gap) + (cellW - box.w) / 2;
      const ty = b.y + row * (cellH + gap) + (cellH - box.h) / 2;
      patches[e.id] = { x: e.x + (tx - box.x), y: e.y + (ty - box.y) };
    });
    this.doc.updateElements(patches);
  }

  // ---------- pages ----------
  addPage(afterId = this.state.activePageId) {
    const idx = afterId ? this.s.pageOrder.indexOf(afterId) + 1 : this.s.pageOrder.length;
    const bg = afterId ? this.s.pages[afterId]?.background : undefined;
    const id = this.doc.addPage(bg && bg.type !== 'image' ? { background: bg } : {}, idx);
    this.ui.set({ activePageId: id, selection: [] });
    return id;
  }

  duplicatePage(id = this.state.activePageId) {
    if (!id) return;
    const nid = this.doc.duplicatePage(id);
    if (nid) this.ui.set({ activePageId: nid, selection: [] });
  }

  deletePage(id = this.state.activePageId) {
    if (!id || this.s.pageOrder.length <= 1) return;
    const idx = this.s.pageOrder.indexOf(id);
    this.doc.deletePage(id);
    const next = this.s.pageOrder[Math.max(0, idx - 1)];
    this.ui.set({ activePageId: next, selection: [] });
  }

  undo() {
    this.ui.set({ editingTextId: null, cropId: null });
    this.doc.undo.undo();
    this.pruneSelection();
  }

  redo() {
    this.doc.undo.redo();
    this.pruneSelection();
  }

  pruneSelection() {
    const sel = this.state.selection.filter((id) => this.s.elements[id]);
    if (sel.length !== this.state.selection.length) this.ui.set({ selection: sel });
  }
}

export function commentColor(name: string) {
  const colors = [COBALT, '#FF4B39', '#0E8A5F', '#FF3C8E', '#0AA0FF', '#7B5CFF'];
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return colors[h % colors.length];
}

// Crop that covers a w x h box with an image of natural size iw x ih, centred.
export function coverCrop(iw: number, ih: number, w: number, h: number) {
  const ir = iw / ih;
  const br = w / h;
  if (ir > br) {
    const cw = br / ir;
    return { x: (1 - cw) / 2, y: 0, w: cw, h: 1 };
  }
  const ch = ir / br;
  return { x: 0, y: (1 - ch) / 2, w: 1, h: ch };
}

export const EditorContext = createContext<Editor | null>(null);

export function useEditor(): Editor {
  const e = useContext(EditorContext);
  if (!e) throw new Error('useEditor outside EditorContext');
  return e;
}
