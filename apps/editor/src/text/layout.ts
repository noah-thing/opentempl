import type { TextElement } from '../doc/types';

// Tavla lays text out itself (instead of trusting the browser) so the canvas,
// SVG export, PNG export and PDF all break lines in exactly the same places.

export interface LayoutWord {
  text: string;
  x: number;
}

export interface LayoutLine {
  text: string;
  x: number; // left edge of the line inside the box
  y: number; // baseline
  top: number; // top of the line box
  width: number;
  prefix?: string; // bullet or number, drawn in the hanging indent
  prefixX?: number;
  words?: LayoutWord[]; // only for justified lines
}

export interface TextLayout {
  lines: LayoutLine[];
  height: number;
  lineBox: number;
  maxLineWidth: number;
}

type TextStyle = Pick<
  TextElement,
  'text' | 'fontFamily' | 'fontSize' | 'fontWeight' | 'italic' | 'letterSpacing' | 'lineHeight' | 'align' | 'uppercase' | 'list' | 'w'
>;

let ctx: CanvasRenderingContext2D | null = null;
function context() {
  if (!ctx) {
    const c = document.createElement('canvas');
    ctx = c.getContext('2d')!;
  }
  return ctx;
}

export function fontString(s: Pick<TextElement, 'fontFamily' | 'fontSize' | 'fontWeight' | 'italic'>) {
  return `${s.italic ? 'italic ' : ''}${s.fontWeight} ${s.fontSize}px "${s.fontFamily}", "Host Grotesk", sans-serif`;
}

const cache = new Map<string, TextLayout>();
let cacheVersion = -1;

export function layoutText(s: TextStyle, fontsVersion: number): TextLayout {
  if (cacheVersion !== fontsVersion) {
    cache.clear();
    cacheVersion = fontsVersion;
  }
  const key = [s.text, s.fontFamily, s.fontSize, s.fontWeight, s.italic, s.letterSpacing, s.lineHeight, s.align, s.uppercase, s.list, Math.round(s.w)].join('|');
  const hit = cache.get(key);
  if (hit) return hit;
  const out = compute(s);
  if (cache.size > 2000) cache.clear();
  cache.set(key, out);
  return out;
}

function compute(s: TextStyle): TextLayout {
  const c = context();
  c.font = fontString(s);
  const spacing = (s.letterSpacing / 1000) * s.fontSize;
  (c as unknown as { letterSpacing: string }).letterSpacing = `${spacing}px`;
  const measure = (t: string) => c.measureText(t).width;

  const metrics = c.measureText('Hg');
  const ascent = metrics.fontBoundingBoxAscent ?? s.fontSize * 0.8;
  const descent = metrics.fontBoundingBoxDescent ?? s.fontSize * 0.2;
  const lineBox = s.fontSize * s.lineHeight;
  const baselineOffset = (lineBox - (ascent + descent)) / 2 + ascent;

  const text = s.uppercase ? s.text.toUpperCase() : s.text;
  const paragraphs = text.split('\n');
  const width = Math.max(1, s.w);
  const lines: LayoutLine[] = [];
  let maxLineWidth = 0;
  let number = 0;

  for (const para of paragraphs) {
    let prefix: string | undefined;
    let indent = 0;
    if (s.list !== 'none' && para.trim().length) {
      number++;
      prefix = s.list === 'bullet' ? '•' : `${number}.`;
      indent = Math.max(measure(s.list === 'bullet' ? '•' : '00.') + s.fontSize * 0.5, s.fontSize * 1.1);
    } else if (!para.trim().length) {
      number = 0;
    }
    const avail = Math.max(1, width - indent);
    const tokens = para.match(/\S+\s*|\s+/g) ?? [''];
    const paraLines: string[] = [];
    let current = '';
    for (const token of tokens) {
      const attempt = current + token;
      if (measure(attempt.trimEnd()) <= avail || current === '') {
        if (current === '' && measure(token.trimEnd()) > avail) {
          // A single word longer than the box: break it by characters.
          let chunk = '';
          for (const ch of token) {
            if (measure(chunk + ch) > avail && chunk) {
              paraLines.push(chunk);
              chunk = ch;
            } else chunk += ch;
          }
          current = chunk;
        } else current = attempt;
      } else {
        paraLines.push(current);
        current = token;
      }
    }
    paraLines.push(current);

    paraLines.forEach((raw, i) => {
      const lineText = raw.replace(/\s+$/, '');
      const w = measure(lineText);
      const isLast = i === paraLines.length - 1;
      let x = indent;
      if (s.align === 'center') x = indent + (avail - w) / 2;
      else if (s.align === 'right') x = indent + avail - w;
      const top = lines.length * lineBox;
      const line: LayoutLine = { text: lineText, x, y: top + baselineOffset, top, width: w };
      if (i === 0 && prefix) {
        line.prefix = prefix;
        line.prefixX = 0;
      }
      if (s.align === 'justify' && !isLast) {
        const parts = lineText.split(/(\s+)/).filter((p) => p.length && !/^\s+$/.test(p));
        if (parts.length > 1) {
          const wordsW = parts.reduce((a, p) => a + measure(p), 0);
          const gap = (avail - wordsW) / (parts.length - 1);
          let cx = indent;
          line.words = parts.map((p) => {
            const word = { text: p, x: cx };
            cx += measure(p) + gap;
            return word;
          });
          line.width = avail;
        }
      }
      maxLineWidth = Math.max(maxLineWidth, line.width + indent);
      lines.push(line);
    });
  }

  return { lines, height: Math.max(lineBox, lines.length * lineBox), lineBox, maxLineWidth };
}

// Width of a single line of text, used when a new text box should hug its content.
export function measureLine(s: Omit<TextStyle, 'w' | 'align' | 'list' | 'lineHeight'>) {
  const c = context();
  c.font = fontString(s);
  (c as unknown as { letterSpacing: string }).letterSpacing = `${(s.letterSpacing / 1000) * s.fontSize}px`;
  const text = s.uppercase ? s.text.toUpperCase() : s.text;
  return Math.max(...text.split('\n').map((l) => c.measureText(l).width));
}
