import { memo } from 'react';
import type { Element, Page } from '../doc/types';
import { ElementView } from './ElementView';
import { fillDef, fillRef } from './paint';
import { useRenderEnv } from './RenderContext';

interface Props {
  page: Page;
  elements: Record<string, Element>;
  width: number;
  height: number;
  className?: string;
  style?: React.CSSProperties;
  // Size the SVG is displayed at. The viewBox always stays in design units.
  displayWidth?: number | string;
  displayHeight?: number | string;
}

export const PageView = memo(function PageView({ page, elements, width, height, className, style, displayWidth, displayHeight }: Props) {
  const env = useRenderEnv();
  const bgId = `bg-${env.idPrefix ?? ''}${page.id}`;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox={`0 0 ${width} ${height}`}
      width={displayWidth ?? width}
      height={displayHeight ?? height}
      className={className}
      style={{ display: 'block', overflow: 'hidden', ...style }}
    >
      <defs>{fillDef(bgId, page.background, width, height, env.assetUrl)}</defs>
      <rect width={width} height={height} fill={fillRef(bgId, page.background)} />
      {page.elementIds.map((id) => {
        const el = elements[id];
        return el ? <ElementView key={id} el={el} /> : null;
      })}
    </svg>
  );
});
