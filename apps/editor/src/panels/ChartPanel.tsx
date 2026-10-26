import { useEditor } from '../editor/Editor';
import { useDoc, useUI } from '../editor/hooks';
import type { ChartElement } from '../doc/types';
import { Section, Toggle, Slider } from './controls';
import { Icon } from '../ui/icons';

const COLORS = ['#2B3BFF', '#FF4B39', '#FFE600', '#3EDD8A', '#FF3C8E', '#0AA0FF'];

export default function ChartPanel() {
  const editor = useEditor();
  const sel = useUI((s) => s.selection);
  const el = useDoc((s) => s.elements[sel[0]]) as ChartElement | undefined;
  if (!el || el.type !== 'chart') return <div className="hint">Select a chart to edit its data.</div>;
  const set = (p: Partial<ChartElement>) => editor.update(el.id, p);
  const pie = el.kind === 'pie' || el.kind === 'donut' || el.kind === 'progress';
  const series = pie ? el.series.slice(0, 1) : el.series;

  const setCell = (si: number, li: number, v: string) => {
    const n = Number(v.replace(',', '.'));
    set({ series: el.series.map((s, i) => (i === si ? { ...s, values: el.labels.map((_, j) => (j === li ? (Number.isNaN(n) ? 0 : n) : s.values[j] ?? 0)) } : s)) });
  };

  // Paste rows straight from a spreadsheet: first column labels, first row names.
  const onPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text/plain');
    if (!text.includes('\t') && !text.includes('\n')) return;
    e.preventDefault();
    const rows = text.trim().split(/\r?\n/).map((r) => r.split(/\t|;|,(?=\S)/));
    if (rows.length < 2) return;
    const header = rows[0];
    const body = rows.slice(1);
    const labels = body.map((r) => r[0]);
    const s = header.slice(1).map((name, i) => ({ name, color: el.series[i]?.color ?? COLORS[i % COLORS.length], values: body.map((r) => Number(String(r[i + 1] ?? '0').replace(',', '.')) || 0) }));
    set({ labels, series: s.length ? s : el.series });
    editor.toast(`${labels.length} rows pasted`);
  };

  return (
    <div onPaste={onPaste}>
      <p className="hint" style={{ margin: '0 0 10px' }}>
        Type values below, or paste rows from a spreadsheet anywhere in this panel.
      </p>
      <div style={{ overflowX: 'auto', borderRadius: 12, boxShadow: 'inset 0 0 0 1px var(--line)' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontVariantNumeric: 'tabular-nums' }}>
          <thead>
            <tr>
              <th style={{ padding: 6 }} />
              {series.map((s, si) => (
                <th key={si} style={{ padding: 4 }}>
                  <input
                    className="num"
                    style={{ width: '100%', fontWeight: 600, borderLeft: `4px solid ${s.color}` }}
                    value={s.name}
                    onChange={(e) => set({ series: el.series.map((x, i) => (i === si ? { ...x, name: e.target.value } : x)) })}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {el.labels.map((l, li) => (
              <tr key={li}>
                <td style={{ padding: 4 }}>
                  <input
                    className="num"
                    style={{ width: 92 }}
                    value={l}
                    onChange={(e) => set({ labels: el.labels.map((x, j) => (j === li ? e.target.value : x)) })}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </td>
                {series.map((s, si) => (
                  <td key={si} style={{ padding: 4 }}>
                    <input className="num" style={{ width: '100%' }} value={s.values[li] ?? 0} onChange={(e) => setCell(si, li, e.target.value)} onKeyDown={(e) => e.stopPropagation()} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {el.kind !== 'progress' ? (
        <div className="row" style={{ marginTop: 10 }}>
          <button className="btn btn-sm btn-outline" onClick={() => set({ labels: [...el.labels, `Item ${el.labels.length + 1}`], series: el.series.map((s) => ({ ...s, values: [...s.values, 0] })) })}>
            <Icon name="plus" size={12} /> Row
          </button>
          <button className="btn btn-sm btn-outline" disabled={el.labels.length < 2} onClick={() => set({ labels: el.labels.slice(0, -1), series: el.series.map((s) => ({ ...s, values: s.values.slice(0, -1) })) })}>
            <Icon name="minus" size={12} /> Row
          </button>
          {!pie ? (
            <>
              <button className="btn btn-sm btn-outline" onClick={() => set({ series: [...el.series, { name: `Series ${el.series.length + 1}`, color: COLORS[el.series.length % COLORS.length], values: el.labels.map(() => 10) }] })}>
                <Icon name="plus" size={12} /> Series
              </button>
              <button className="btn btn-sm btn-outline" disabled={el.series.length < 2} onClick={() => set({ series: el.series.slice(0, -1) })}>
                <Icon name="minus" size={12} /> Series
              </button>
            </>
          ) : null}
        </div>
      ) : null}
      <Section title="Style">
        <Toggle label="Legend" on={el.showLegend} onChange={(showLegend) => set({ showLegend })} />
        <Toggle label="Values on the chart" on={el.showValues} onChange={(showValues) => set({ showValues })} />
        {!pie ? <Toggle label="Grid lines" on={el.showGrid} onChange={(showGrid) => set({ showGrid })} /> : null}
        {el.kind === 'column' || el.kind === 'bar' ? (
          <>
            <span className="label">Rounded bars</span>
            <Slider value={el.rounded} min={0} max={40} onChange={(rounded) => set({ rounded })} />
          </>
        ) : null}
        <div className="row-between">
          <span className="label">Text colour</span>
          <input type="color" value={el.textColor} onChange={(e) => set({ textColor: e.target.value })} />
        </div>
      </Section>
    </div>
  );
}
