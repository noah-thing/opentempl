import type { TextElement, TextRun } from '../doc/types';

// Tavla lays text out itself (instead of trusting the browser) so the canvas,
// SVG export, PNG export and PDF all break lines in exactly the same places.
// Text can carry runs: ranges with their own weight, slant, decoration or
// colour. Measuring walks those runs, so mixed styles wrap correctly.

export interface Segment {
  text: string;
  x: number; // left edge inside the box
  width: number;
  style: RunStyle;
}

export interface LayoutLine {
  text: string;
  x: number; // left edge of the line inside the box
  y: number; // baseline
  top: number; // top of the line box
  width: number;
  prefix?: string; // bullet or number, drawn in the hanging indent
  prefixX?: number;
  segments: Segment[]; // the line split by style, positioned
}

export interface TextLayout {
  lines: LayoutLine[];
  height: number;
  lineBox: number;
  maxLineWidth: number;
}

export interface RunStyle {
  fontWeight: number;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  color: string | null; // null = the element colour or gradient
}

type TextStyle = Pick<
  TextElement,
  'text' | 'fontFamily' | 'fontSize' | 'fontWeight' | 'italic' | 'letterSpacing' | 'lineHeight' | 'align' | 'uppercase' | 'list' | 'w'
> & { runs?: TextRun[]; underline?: boolean; strike?: boolean };

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
  const key = [s.text, s.fontFamily, s.fontSize, s.fontWeight, s.italic, s.underline, s.strike, s.letterSpacing, s.lineHeight, s.align, s.uppercase, s.list, Math.round(s.w), s.runs?.length ? JSON.stringify(s.runs) : ''].join('|');
  const hit = cache.get(key);
  if (hit) return hit;
  const out = compute(s);
  if (cache.size > 2000) cache.clear();
  cache.set(key, out);
  return out;
}

// Style of every character: the element's style with run overrides applied.
export function charStyles(s: TextStyle, length: number): { styles: RunStyle[]; index: Uint16Array } {
  const base: RunStyle = { fontWeight: s.fontWeight, italic: s.italic, underline: !!s.underline, strike: !!s.strike, color: null };
  const styles: RunStyle[] = [base];
  const index = new Uint16Array(length);
  if (!s.runs?.length) return { styles, index };
  const keyOf = (st: RunStyle) => `${st.fontWeight}|${st.italic}|${st.underline}|${st.strike}|${st.color}`;
  const known = new Map([[keyOf(base), 0]]);
  for (let i = 0; i < length; i++) {
    let st = base;
    for (const r of s.runs) {
      if (i >= r.start && i < r.end) {
        st = {
          fontWeight: r.fontWeight ?? st.fontWeight,
          italic: r.italic ?? st.italic,
          underline: r.underline ?? st.underline,
          strike: r.strike ?? st.strike,
          color: r.color ?? st.color,
        };
      }
    }
    const k = keyOf(st);
    let id = known.get(k);
    if (id === undefined) {
      id = styles.length;
      styles.push(st);
      known.set(k, id);
    }
    index[i] = id;
  }
  return { styles, index };
}

function compute(s: TextStyle): TextLayout {
  const c = context();
  const spacing = (s.letterSpacing / 1000) * s.fontSize;
  (c as unknown as { letterSpacing: string }).letterSpacing = `${spacing}px`;
  const text = s.uppercase ? upperSameLength(s.text) : s.text;
  const { styles, index } = charStyles(s, text.length);
  const fonts = styles.map((st) => fontString({ fontFamily: s.fontFamily, fontSize: s.fontSize, fontWeight: st.fontWeight, italic: st.italic }));

  // Width of text[a, b) honouring style changes.
  const measure = (a: number, b: number) => {
    let w = 0;
    let i = a;
    while (i < b) {
      const id = index[i];
      let j = i + 1;
      while (j < b && index[j] === id) j++;
      c.font = fonts[id];
      w += c.measureText(text.slice(i, j)).width;
      i = j;
    }
    return w;
  };

  c.font = fonts[0];
  const metrics = c.measureText('Hg');
  const ascent = metrics.fontBoundingBoxAscent ?? s.fontSize * 0.8;
  const descent = metrics.fontBoundingBoxDescent ?? s.fontSize * 0.2;
  const lineBox = s.fontSize * s.lineHeight;
  const baselineOffset = (lineBox - (ascent + descent)) / 2 + ascent;

  const width = Math.max(1, s.w);
  const lines: LayoutLine[] = [];
  let maxLineWidth = 0;
  let number = 0;

  let paraStart = 0;
  const paragraphs: [number, number][] = [];
  for (let i = 0; i <= text.length; i++)
    if (i === text.length || text[i] === '\n') {
      paragraphs.push([paraStart, i]);
      paraStart = i + 1;
    }

  for (const [ps, pe] of paragraphs) {
    const para = text.slice(ps, pe);
    let prefix: string | undefined;
    let indent = 0;
    c.font = fonts[0];
    if (s.list !== 'none' && para.trim().length) {
      number++;
      prefix = s.list === 'bullet' ? '•' : `${number}.`;
      indent = Math.max(c.measureText(s.list === 'bullet' ? '•' : '00.').width + s.fontSize * 0.5, s.fontSize * 1.1);
    } else if (!para.trim().length) {
      number = 0;
    }
    const avail = Math.max(1, width - indent);

    // Tokens are words with their trailing spaces, as [start, end) into text.
    const tokens: [number, number][] = [];
    const re = /\S+\s*|\s+/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(para))) tokens.push([ps + m.index, ps + m.index + m[0].length]);
    if (!tokens.length) tokens.push([ps, ps]);

    // Greedy line breaking on token boundaries, breaking long words by character.
    const ranges: [number, number][] = [];
    let ls = tokens[0][0];
    let le = ls;
    const trimEnd = (a: number, b: number) => {
      while (b > a && /\s/.test(text[b - 1])) b--;
      return b;
    };
    for (const [ts, te] of tokens) {
      if (le === ls) {
        if (measure(ts, trimEnd(ts, te)) > avail) {
          let cs = ts;
          for (let k = ts + 1; k <= te; k++) {
            if (measure(cs, k) > avail && k - 1 > cs) {
              ranges.push([cs, k - 1]);
              cs = k - 1;
            }
          }
          ls = cs;
          le = te;
        } else le = te;
        continue;
      }
      if (measure(ls, trimEnd(ls, te)) <= avail) le = te;
      else {
        ranges.push([ls, le]);
        ls = ts;
        le = te;
        if (measure(ts, trimEnd(ts, te)) > avail) {
          let cs = ts;
          for (let k = ts + 1; k <= te; k++) {
            if (measure(cs, k) > avail && k - 1 > cs) {
              ranges.push([cs, k - 1]);
              cs = k - 1;
            }
          }
          ls = cs;
        }
      }
    }
    ranges.push([ls, le]);

    ranges.forEach(([a, b0], li) => {
      const b = trimEnd(a, b0);
      const lineText = text.slice(a, b);
      const w = measure(a, b);
      const isLast = li === ranges.length - 1;
      let x = indent;
      if (s.align === 'center') x = indent + (avail - w) / 2;
      else if (s.align === 'right') x = indent + avail - w;
      const top = lines.length * lineBox;

      // Justified lines spread the gaps between words; everything else runs on.
      let gapExtra = 0;
      if (s.align === 'justify' && !isLast) {
        const spaces = (lineText.match(/\s+/g) ?? []).length;
        if (spaces > 0) gapExtra = (avail - w) / spaces;
      }
      const segments: Segment[] = [];
      let cx = x;
      let i = a;
      while (i < b) {
        const id = index[i];
        let j = i + 1;
        // With justify, every space run is its own segment so it can stretch.
        const isSpace = /\s/.test(text[i]);
        while (j < b && index[j] === id && (gapExtra ? /\s/.test(text[j]) === isSpace : true)) j++;
        const segW = measure(i, j);
        segments.push({ text: text.slice(i, j), x: cx, width: segW + (gapExtra && isSpace ? gapExtra : 0), style: styles[id] });
        cx += segW + (gapExtra && isSpace ? gapExtra : 0);
        i = j;
      }
      if (!segments.length) segments.push({ text: '', x, width: 0, style: styles[0] });
      const line: LayoutLine = { text: lineText, x, y: top + baselineOffset, top, width: gapExtra ? avail : w, segments };
      if (li === 0 && prefix) {
        line.prefix = prefix;
        line.prefixX = 0;
      }
      maxLineWidth = Math.max(maxLineWidth, line.width + indent);
      lines.push(line);
    });
  }

  return { lines, height: Math.max(lineBox, lines.length * lineBox), lineBox, maxLineWidth };
}

// Uppercase without changing length, so run offsets stay valid (ß stays ß).
function upperSameLength(t: string) {
  let out = '';
  for (const ch of t) {
    const u = ch.toUpperCase();
    out += u.length === ch.length ? u : ch;
  }
  return out;
}

// Width of a single line of text, used when a new text box should hug its content.
export function measureLine(s: Omit<TextStyle, 'w' | 'align' | 'list' | 'lineHeight'>) {
  const c = context();
  c.font = fontString(s);
  (c as unknown as { letterSpacing: string }).letterSpacing = `${(s.letterSpacing / 1000) * s.fontSize}px`;
  const text = s.uppercase ? s.text.toUpperCase() : s.text;
  return Math.max(...text.split('\n').map((l) => c.measureText(l).width));
}
