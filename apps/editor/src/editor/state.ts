import type { Id } from '../doc/types';
import type { Rect } from '../lib/geom';

export type Tool = 'select' | 'hand' | 'text' | 'rect' | 'ellipse' | 'line' | 'draw' | 'pen' | 'sticky';

export type PanelId =
  | 'templates'
  | 'elements'
  | 'text'
  | 'photos'
  | 'uploads'
  | 'draw'
  | 'brand'
  | 'layers'
  | 'apps'
  // contextual panels opened from the selection toolbar
  | 'font'
  | 'color'
  | 'effects'
  | 'adjust'
  | 'animate'
  | 'position'
  | 'chart'
  | 'table'
  | 'background'
  | 'resize'
  | 'bulk'
  | 'history'
  | 'comments'
  | null;

export interface Guide {
  pageId: Id;
  axis: 'x' | 'y';
  pos: number; // position on the page in design units
  from: number;
  to: number;
  kind: 'edge' | 'center' | 'page' | 'gap';
  label?: string;
}

export interface DrawSettings {
  tool: 'pen' | 'marker' | 'highlighter' | 'glow' | 'eraser';
  color: string;
  width: number;
}

export interface EditorState {
  selection: Id[];
  activePageId: Id | null;
  zoom: number;
  autoFit: boolean;
  tool: Tool;
  draw: DrawSettings;
  editingTextId: Id | null;
  cropId: Id | null;
  penEditId: Id | null; // a path shape whose points the pen is editing
  panel: PanelId;
  colorTarget: string | null; // which property the colour panel edits, e.g. "fill", "text", "stroke", "bg"
  hoverId: Id | null;
  guides: Guide[];
  marquee: { pageId: Id; rect: Rect } | null;
  showRulers: boolean;
  snap: boolean;
  showGrid: boolean;
  presenting: boolean;
  presentStart: number;
  commandOpen: boolean;
  exportOpen: boolean;
  shareOpen: boolean;
  shortcutsOpen: boolean;
  findOpen: boolean;
  commentMode: boolean;
  openCommentId: Id | null;
  view: 'scroll' | 'grid';
  toast: { text: string; id: number } | null;
  dragging: boolean;
  pageGuides: Record<Id, { x: number[]; y: number[] }>; // ruler guides
}

export const initialEditorState: EditorState = {
  selection: [],
  activePageId: null,
  zoom: 0.5,
  autoFit: true,
  tool: 'select',
  draw: { tool: 'pen', color: '#2B3BFF', width: 8 },
  editingTextId: null,
  cropId: null,
  penEditId: null,
  panel: 'templates',
  colorTarget: null,
  hoverId: null,
  guides: [],
  marquee: null,
  showRulers: false,
  snap: true,
  showGrid: false,
  presenting: false,
  presentStart: 0,
  commandOpen: false,
  exportOpen: false,
  shareOpen: false,
  shortcutsOpen: false,
  findOpen: false,
  commentMode: false,
  openCommentId: null,
  view: 'scroll',
  toast: null,
  dragging: false,
  pageGuides: {},
};
