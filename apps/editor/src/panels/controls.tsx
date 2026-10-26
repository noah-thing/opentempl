import { useEffect, useState } from 'react';

// Slider with a number box. The number box accepts typing; the slider shows a
// filled track so the value reads at a glance.
export function Slider({
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(Math.round(value * 100) / 100)), [value]);
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="slider-row">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ ['--fill' as string]: `${Math.max(0, Math.min(100, pct))}%` }}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <input
        className="num"
        value={unit ? `${text}` : text}
        onChange={(e) => {
          setText(e.target.value);
          const n = Number(e.target.value);
          if (!Number.isNaN(n) && e.target.value.trim() !== '' && e.target.value !== '-') onChange(Math.max(min, Math.min(max, n)));
        }}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            const d = (e.key === 'ArrowUp' ? 1 : -1) * step * (e.shiftKey ? 10 : 1);
            onChange(Math.max(min, Math.min(max, Math.round((value + d) * 1000) / 1000)));
          }
        }}
        aria-label="Value"
      />
    </div>
  );
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="row-between" style={{ margin: '6px 0 10px' }}>
      <span className="label">{label}</span>
      <button className={`switch ${on ? 'is-on' : ''}`} aria-pressed={on} aria-label={label} onClick={() => onChange(!on)} />
    </div>
  );
}

export function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <>
      <div className="panel-section">
        <h3>{title}</h3>
        {action}
      </div>
      {children}
    </>
  );
}

export function Search({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="field" style={{ marginBottom: 4 }}>
      <svg width="16" height="16" viewBox="0 0 16 16" shapeRendering="crispEdges" className="icon">
        <path d="M4 1h5v1H4zM3 2h1v1H3zM9 2h1v1H9zM2 3h1v5H2zM10 3h1v5h-1zM3 8h1v1H3zM9 8h1v1H9zM4 9h5v1H4zM10 10h1v1h-1zM11 11h1v1h-1zM12 12h1v1h-1zM13 13h1v1h-1z" fill="currentColor" />
      </svg>
      <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => e.stopPropagation()} />
    </div>
  );
}
