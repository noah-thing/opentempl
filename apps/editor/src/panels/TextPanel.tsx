import { useEffect } from 'react';
import { useEditor } from '../editor/Editor';
import { makeText, NO_EFFECT, TEXT_PRESETS, UI_FONT } from '../doc/factory';
import type { TextElement } from '../doc/types';
import { addLibraryItem, dragProps, type LibraryItem } from './library';
import { Section } from './controls';
import { Icon } from '../ui/icons';
import { ensureFont } from '../fonts/fonts';
import { useBrand } from './brand';
import { COBALT } from '../doc/colors';

// Font combinations: small compositions of text boxes, each built for a real
// use (a poster, an invite, a sale) rather than random pairings.
type Combo = { name: string; els: Partial<TextElement>[]; bg?: string };

const t = (p: Partial<TextElement>): Partial<TextElement> => ({ effect: NO_EFFECT, ...p });

export const COMBOS: Combo[] = [
  {
    name: 'Opening night',
    els: [
      t({ text: 'OPENING\nNIGHT', fontFamily: 'Anton', fontSize: 120, lineHeight: 0.92, letterSpacing: 10, w: 520, x: 0, y: 0, align: 'center' }),
      t({ text: 'Friday 14 March · doors 19:00', fontFamily: UI_FONT, fontSize: 24, fontWeight: 500, w: 520, x: 0, y: 236, align: 'center' }),
    ],
  },
  {
    name: 'Summer sale',
    els: [
      t({ text: 'Summer sale', fontFamily: 'Archivo Black', fontSize: 92, lineHeight: 0.95, letterSpacing: -30, w: 620, x: 0, y: 0, align: 'left' }),
      t({ text: 'Up to 40% off everything in the shop', fontFamily: 'Archivo', fontSize: 28, fontWeight: 500, w: 620, x: 4, y: 104 }),
    ],
  },
  {
    name: 'Save the date',
    els: [
      t({ text: 'SAVE THE DATE', fontFamily: UI_FONT, fontSize: 18, fontWeight: 600, letterSpacing: 400, w: 560, x: 0, y: 0, align: 'center' }),
      t({ text: 'Anna & Erik', fontFamily: 'Cormorant Garamond', fontSize: 96, fontWeight: 500, w: 560, x: 0, y: 40, align: 'center', lineHeight: 1 }),
      t({ text: '21 June 2027 · Sandhamn', fontFamily: 'Cormorant Garamond', fontSize: 28, fontWeight: 400, w: 560, x: 0, y: 156, align: 'center' }),
    ],
  },
  {
    name: 'Game night',
    els: [
      t({ text: 'GAME NIGHT', fontFamily: 'Silkscreen', fontSize: 80, fontWeight: 700, w: 640, x: 0, y: 0, align: 'center', lineHeight: 1 }),
      t({ text: 'press start at 20:00', fontFamily: 'Silkscreen', fontSize: 26, w: 640, x: 0, y: 96, align: 'center' }),
    ],
  },
  {
    name: 'Thank you note',
    els: [
      t({ text: 'thank you!', fontFamily: 'Caveat', fontSize: 110, fontWeight: 700, w: 520, x: 0, y: 0, align: 'center', lineHeight: 1 }),
      t({ text: 'for coming to our little party', fontFamily: UI_FONT, fontSize: 24, w: 520, x: 0, y: 122, align: 'center' }),
    ],
  },
  {
    name: 'Big news',
    els: [
      t({ text: 'BIG NEWS', fontFamily: 'Bebas Neue', fontSize: 160, lineHeight: 0.9, letterSpacing: 6, w: 520, x: 0, y: 0, align: 'left' }),
      t({ text: 'We are moving to a bigger studio on Hornsgatan.', fontFamily: UI_FONT, fontSize: 24, w: 400, x: 4, y: 150, lineHeight: 1.35 }),
    ],
  },
  {
    name: 'Fika menu',
    els: [
      t({ text: 'Fika', fontFamily: 'Playfair Display', fontSize: 120, fontWeight: 700, w: 420, x: 0, y: 0, lineHeight: 1 }),
      t({ text: 'Kanelbulle 35\nKardemumma 38\nKaffe påtår 30', fontFamily: UI_FONT, fontSize: 26, w: 420, x: 4, y: 136, lineHeight: 1.5 }),
    ],
  },
  {
    name: 'Neon sign',
    els: [t({ text: 'open late', fontFamily: 'Bungee', fontSize: 84, w: 620, x: 0, y: 0, align: 'center', color: '#FF3C8E', effect: { kind: 'neon', color: '#FF3C8E', amount: 70, offset: 50, direction: 45 } })],
    bg: '#0B0B0D',
  },
  {
    name: 'Hollow headline',
    els: [
      t({ text: 'MAKE\nNOISE', fontFamily: 'Archivo Black', fontSize: 130, lineHeight: 0.9, w: 560, x: 0, y: 0, align: 'center', color: COBALT, effect: { kind: 'splice', color: '#FFE600', amount: 40, offset: 50, direction: 45 } }),
    ],
  },
  {
    name: 'Highlighted quote',
    els: [
      t({ text: 'Good design is\nas little design\nas possible', fontFamily: UI_FONT, fontSize: 56, fontWeight: 600, lineHeight: 1.25, letterSpacing: -20, w: 560, x: 0, y: 0, effect: { kind: 'highlight', color: '#FFE600', amount: 30, offset: 50, direction: 45 } }),
      t({ text: 'after Dieter Rams', fontFamily: UI_FONT, fontSize: 22, w: 560, x: 0, y: 228, color: '#4A4A55' }),
    ],
  },
  {
    name: 'Badge',
    els: [t({ text: 'HANDMADE IN STOCKHOLM ·', fontFamily: UI_FONT, fontSize: 30, fontWeight: 700, letterSpacing: 200, w: 520, x: 0, y: 0, curve: 72, align: 'center' })],
  },
  {
    name: 'Workshop ticket',
    els: [
      t({ text: 'Workshop #023', fontFamily: 'Space Grotesk', fontSize: 72, fontWeight: 700, letterSpacing: -20, w: 620, x: 0, y: 0 }),
      t({ text: 'Visual storytelling: how to say it without words', fontFamily: 'Space Grotesk', fontSize: 24, w: 520, x: 4, y: 88, lineHeight: 1.3 }),
    ],
  },
  {
    name: 'Echo title',
    els: [t({ text: 'again\nand again', fontFamily: 'Syne', fontSize: 104, fontWeight: 800, lineHeight: 0.95, letterSpacing: -30, w: 560, x: 0, y: 0, color: '#FF4B39', effect: { kind: 'echo', color: '#FF4B39', amount: 50, offset: 40, direction: 30 } })],
  },
  {
    name: 'Glitch',
    els: [t({ text: 'SIGNAL LOST', fontFamily: 'Rubik', fontSize: 92, fontWeight: 800, w: 640, x: 0, y: 0, align: 'center', color: '#0B0B0D', effect: { kind: 'glitch', color: '#000', amount: 50, offset: 60, direction: 0 } })],
  },
];

export function comboElements(c: Combo) {
  return c.els.map((p) => makeText({ ...p, text: p.text!, h: (p.fontSize ?? 32) * (p.lineHeight ?? 1.3) * p.text!.split('\n').length }));
}

export default function TextPanel() {
  const editor = useEditor();
  const brand = useBrand();
  useEffect(() => {
    COMBOS.forEach((c) => c.els.forEach((e) => e.fontFamily && ensureFont(e.fontFamily)));
  }, []);

  const presets: { label: string; size: number; weight: number; item: LibraryItem }[] = [
    { label: 'Add a heading', size: 26, weight: 700, item: { kind: 'text', patch: { ...TEXT_PRESETS.heading, fontFamily: brand.fonts.heading } } },
    { label: 'Add a subheading', size: 18, weight: 500, item: { kind: 'text', patch: { ...TEXT_PRESETS.subheading, fontFamily: brand.fonts.subheading } } },
    { label: 'Add a little bit of body text', size: 13, weight: 400, item: { kind: 'text', patch: { ...TEXT_PRESETS.body, fontFamily: brand.fonts.body } } },
  ];

  return (
    <>
      <button className="btn btn-ink btn-block" style={{ height: 40, marginBottom: 14 }} onClick={() => editor.ui.set({ tool: 'text' })}>
        <Icon name="text" /> Draw a text box <kbd style={{ marginLeft: 6, background: 'rgba(255,255,255,.14)', color: '#fff', boxShadow: 'none' }}>T</kbd>
      </button>
      {presets.map((p) => (
        <button key={p.label} className="text-preset" onClick={() => addLibraryItem(editor, p.item)} {...dragProps(p.item)} style={{ fontSize: p.size, fontWeight: p.weight, letterSpacing: p.size > 20 ? '-0.02em' : undefined }}>
          {p.label}
        </button>
      ))}
      <Section title="Font combinations">
        <div className="grid-2">
          {COMBOS.map((c) => {
            const item: LibraryItem = { kind: 'elements', elements: comboElements(c) };
            return (
              <button
                key={c.name}
                className="combo-tile"
                title={c.name}
                onClick={() => addLibraryItem(editor, item)}
                {...dragProps(() => ({ kind: 'elements', elements: comboElements(c) }))}
                style={{ aspectRatio: '1', background: c.bg ?? 'var(--paper)', display: 'grid', placeItems: 'center', padding: 10 }}
              >
                <ComboPreview combo={c} />
              </button>
            );
          })}
        </div>
      </Section>
    </>
  );
}

function ComboPreview({ combo }: { combo: Combo }) {
  const first = combo.els[0];
  const second = combo.els[1];
  const fx = first.effect?.kind ?? 'none';
  const main: React.CSSProperties = {
    fontFamily: `"${first.fontFamily}"`,
    fontWeight: first.fontWeight ?? 400,
    fontSize: Math.min(30, 600 / Math.max(6, (first.text ?? '').split('\n')[0].length * 2.2)),
    lineHeight: 0.95,
    letterSpacing: `${(first.letterSpacing ?? 0) / 1000}em`,
    color: fx === 'splice' || fx === 'hollow' ? 'transparent' : first.color ?? '#0B0B0D',
    WebkitTextStroke: fx === 'splice' || fx === 'hollow' ? `1px ${first.color}` : undefined,
    textShadow:
      fx === 'neon'
        ? `0 0 6px ${first.color}, 0 0 14px ${first.color}`
        : fx === 'splice'
          ? `2px 2px 0 ${first.effect!.color}`
          : fx === 'echo'
            ? `2px 1px 0 ${first.color}66, 4px 2px 0 ${first.color}33`
            : fx === 'glitch'
              ? '-2px 0 #00E5FF, 2px 0 #FF2BD6'
              : undefined,
    background: fx === 'highlight' ? 'linear-gradient(transparent 12%, #FFE600 12%, #FFE600 88%, transparent 88%)' : undefined,
    whiteSpace: 'pre-line',
    textAlign: first.align === 'left' ? 'left' : 'center',
  };
  return (
    <div style={{ display: 'grid', gap: 4, justifyItems: first.align === 'left' ? 'start' : 'center', width: '100%' }}>
      <div style={main}>{first.curve ? 'HANDMADE' : first.text}</div>
      {second ? (
        <div style={{ fontFamily: `"${second.fontFamily}"`, fontSize: 9, fontWeight: second.fontWeight ?? 400, color: '#4A4A55', letterSpacing: `${(second.letterSpacing ?? 0) / 1000}em`, whiteSpace: 'pre-line', textAlign: first.align === 'left' ? 'left' : 'center' }}>
          {second.text?.split('\n')[0]}
        </div>
      ) : null}
    </div>
  );
}
