// Tight bounds of any path, curves included, measured by the browser.
const NS = 'http://www.w3.org/2000/svg';
let probe: SVGPathElement | null = null;

export function pathBounds(d: string) {
  if (!probe) {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('style', 'position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden');
    probe = document.createElementNS(NS, 'path');
    svg.append(probe);
    document.body.append(svg);
  }
  probe.setAttribute('d', d);
  const b = probe.getBBox();
  return { x: b.x, y: b.y, w: b.width, h: b.height };
}
