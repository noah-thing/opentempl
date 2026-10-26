import { createContext, useContext } from 'react';

export interface RenderEnv {
  assetUrl: (id: string | null | undefined) => string | undefined;
  assetSize: (id: string | null | undefined) => { width: number; height: number } | undefined;
  fontsVersion: number;
  mode: 'edit' | 'export' | 'present' | 'thumb';
  hiddenIds?: Set<string>; // e.g. the text being edited in place
  time?: number; // ms since the page appeared; set to play entrance animations
  idPrefix?: string; // keeps defs unique when several copies of a page are on screen
}

export const RenderContext = createContext<RenderEnv>({
  assetUrl: () => undefined,
  assetSize: () => undefined,
  fontsVersion: 0,
  mode: 'edit',
});

export const useRenderEnv = () => useContext(RenderContext);
