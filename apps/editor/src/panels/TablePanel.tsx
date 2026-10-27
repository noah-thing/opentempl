import { useEditor } from '../editor/Editor';
import { useDoc, useUI } from '../editor/hooks';
import type { TableElement } from '../doc/types';
import { Section, Slider } from './controls';
import { Icon } from '../ui/icons';

export default function TablePanel() {
  const editor = useEditor();
  const sel = useUI((s) => s.selection);
  const el = useDoc((s) => s.elements[sel[0]]) as TableElement | undefined;
  if (!el || el.type !== 'table') return <div className="hint">Select a table to edit it.</div>;
  const set = (p: Partial<TableElement>) => editor.update(el.id, p);
  const resize = (rows: number, cols: number) => {
    const cells = Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => el.cells[r]?.[c] ?? ''));
    set({ rows, cols, cells, h: (el.h / el.rows) * rows, w: (el.w / el.cols) * cols });
  };
  const color = (label: string, key: keyof TableElement) => (
    <div className="row-between" style={{ marginBottom: 8 }}>
      <span className="label">{label}</span>
      <input type="color" value={String(el[key] ?? '#ffffff').slice(0, 7)} onChange={(e) => set({ [key]: e.target.value } as Partial<TableElement>)} />
    </div>
  );
  return (
    <div
      onPaste={(e) => {
        const text = e.clipboardData.getData('text/plain');
        if (!text.includes('\t')) return;
        e.preventDefault();
        const rows = text.trim().split(/\r?\n/).map((r) => r.split('\t'));
        const cols = Math.max(...rows.map((r) => r.length));
        set({ rows: rows.length, cols, cells: rows.map((r) => Array.from({ length: cols }, (_, i) => r[i] ?? '')), h: (el.h / el.rows) * rows.length, w: (el.w / el.cols) * cols });
      }}
    >
      <p className="hint" style={{ margin: '0 0 10px' }}>
        Edit cells here, or paste a range from a spreadsheet.
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse' }}>
          <tbody>
            {el.cells.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td key={c} style={{ padding: 2 }}>
                    <input
                      className="num"
                      style={{ width: Math.max(52, Math.floor(300 / el.cols)), fontWeight: r === 0 ? 600 : 400, padding: '0 6px' }}
                      value={cell}
                      onChange={(e) => set({ cells: el.cells.map((rr, i) => (i === r ? rr.map((cc, j) => (j === c ? e.target.value : cc)) : rr)) })}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="row" style={{ marginTop: 10, flexWrap: 'wrap' }}>
        <button className="btn btn-sm btn-outline" onClick={() => resize(el.rows + 1, el.cols)}>
          <Icon name="plus" size={12} /> Row
        </button>
        <button className="btn btn-sm btn-outline" disabled={el.rows < 2} onClick={() => resize(el.rows - 1, el.cols)}>
          <Icon name="minus" size={12} /> Row
        </button>
        <button className="btn btn-sm btn-outline" onClick={() => resize(el.rows, el.cols + 1)}>
          <Icon name="plus" size={12} /> Column
        </button>
        <button className="btn btn-sm btn-outline" disabled={el.cols < 2} onClick={() => resize(el.rows, el.cols - 1)}>
          <Icon name="minus" size={12} /> Column
        </button>
      </div>
      <Section title="Style">
        <span className="label">Text size</span>
        <Slider value={el.fontSize} min={8} max={64} onChange={(fontSize) => set({ fontSize })} />
        <span className="label">Corners</span>
        <Slider value={el.radius} min={0} max={48} onChange={(radius) => set({ radius })} />
        {color('Header fill', 'headerFill')}
        {color('Header text', 'headerColor')}
        {color('Body fill', 'bodyFill')}
        {color('Text', 'textColor')}
        {color('Lines', 'lineColor')}
        <div className="row-between">
          <span className="label">Stripes</span>
          <button className={`switch ${el.stripeFill ? 'is-on' : ''}`} onClick={() => set({ stripeFill: el.stripeFill ? null : '#F3F3F6' })} />
        </div>
      </Section>
    </div>
  );
}
