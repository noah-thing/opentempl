import { useMemo, useState } from 'react';
import { useEditor } from '../editor/Editor';
import { useDoc, useUI } from '../editor/hooks';
import type { TextElement } from '../doc/types';
import { cloneElement } from '../doc/design';
import { Section } from './controls';
import { Icon } from '../ui/icons';

// Bulk create: paste a table, connect columns to text boxes on the current page,
// get one copy of the page per row. Canva keeps this on its paid plan.

function parse(text: string) {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return { header: [] as string[], rows: [] as string[][] };
  const sep = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ',';
  const split = (l: string) => {
    if (sep !== ',') return l.split(sep).map((c) => c.trim());
    // Minimal CSV with quotes.
    const out: string[] = [];
    let cur = '';
    let q = false;
    for (let i = 0; i < l.length; i++) {
      const ch = l[i];
      if (ch === '"') {
        if (q && l[i + 1] === '"') {
          cur += '"';
          i++;
        } else q = !q;
      } else if (ch === ',' && !q) {
        out.push(cur.trim());
        cur = '';
      } else cur += ch;
    }
    out.push(cur.trim());
    return out;
  };
  const [header, ...rows] = lines.map(split);
  return { header, rows };
}

export default function BulkPanel() {
  const editor = useEditor();
  const pageId = useUI((s) => s.activePageId);
  const page = useDoc((s) => (pageId ? s.pages[pageId] : null));
  const elements = useDoc((s) => s.elements);
  const [raw, setRaw] = useState('name,role\nAstrid Lind,Designer\nOmar Haddad,Developer\nMaja Berg,Producer');
  const data = useMemo(() => parse(raw), [raw]);
  const texts = (page?.elementIds ?? []).map((id) => elements[id]).filter((e): e is TextElement => e?.type === 'text');
  const [map, setMap] = useState<Record<string, string>>({});

  // Text boxes with {{column}} placeholders connect automatically.
  const auto = useMemo(() => {
    const out: Record<string, string> = {};
    for (const t of texts) {
      const m = t.text.match(/\{\{\s*([^}]+?)\s*\}\}/);
      if (m && data.header.includes(m[1])) out[t.id] = m[1];
    }
    return out;
  }, [texts, data.header]);
  const mapping = { ...auto, ...map };
  const connected = Object.entries(mapping).filter(([, col]) => col);

  const run = () => {
    if (!page || !pageId || !data.rows.length || !connected.length) return;
    const start = editor.s.pageOrder.indexOf(pageId) + 1;
    editor.doc.transact(() => {
      data.rows.forEach((row, i) => {
        const groups = new Map<string, string>();
        const { id: _i, elementIds: _e, ...rest } = structuredClone(page);
        const np = editor.doc.addPage({ ...rest, name: row[0] ?? `Row ${i + 1}` }, start + i);
        for (const eid of page.elementIds) {
          const el = editor.s.elements[eid];
          if (!el) continue;
          const copy = cloneElement(el, groups);
          const col = mapping[eid];
          if (copy.type === 'text' && col) {
            const v = row[data.header.indexOf(col)] ?? '';
            copy.text = /\{\{/.test(copy.text) ? copy.text.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, k) => row[data.header.indexOf(k)] ?? '') : v;
          }
          editor.doc.addElement(np, copy);
        }
      });
    });
    editor.refitAllText();
    editor.toast(`${data.rows.length} pages made`);
  };

  return (
    <>
      <p className="hint" style={{ margin: '0 0 10px' }}>
        Paste rows from a spreadsheet or a CSV. The first row names the columns. Then connect each column to a text box on this page, or write <b>{'{{name}}'}</b> inside a text box.
      </p>
      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        onKeyDown={(e) => e.stopPropagation()}
        spellCheck={false}
        style={{ width: '100%', height: 140, borderRadius: 12, border: 0, boxShadow: 'inset 0 0 0 1px var(--line)', padding: 10, fontFamily: 'var(--font)', resize: 'vertical' }}
      />
      <div className="hint">
        {data.rows.length} rows, {data.header.length} columns
      </div>
      <Section title="Connect columns">
        {texts.length ? (
          texts.map((t) => (
            <div key={t.id} className="row-between" style={{ marginBottom: 8 }}>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.text.split('\n')[0] || 'Empty text'}</span>
              <select className="num" style={{ width: 130 }} value={mapping[t.id] ?? ''} onChange={(e) => setMap({ ...map, [t.id]: e.target.value })}>
                <option value="">Keep as is</option>
                {data.header.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          ))
        ) : (
          <p className="hint">Add some text boxes to this page first.</p>
        )}
      </Section>
      <button className="btn btn-primary btn-block" style={{ marginTop: 16, height: 42 }} disabled={!connected.length || !data.rows.length} onClick={run}>
        <Icon name="bulk" /> Make {data.rows.length} pages
      </button>
    </>
  );
}
