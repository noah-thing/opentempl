import { ICON_NAMES, Icon } from './icons';

// Every icon at the sizes the app uses. Open #/icons to review the set.
export function IconSheet() {
  return (
    <div style={{ height: '100%', overflow: 'auto', padding: 32, background: '#fff' }}>
      <h1 style={{ margin: '0 0 20px', fontWeight: 500, letterSpacing: '-0.03em' }}>Tavla pixel icons · {ICON_NAMES.length}</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
        {ICON_NAMES.map((n) => (
          <div key={n} style={{ display: 'grid', justifyItems: 'center', gap: 6, padding: 10, borderRadius: 10, background: '#F4F4F6' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <Icon name={n} size={16} />
              <Icon name={n} size={32} />
            </div>
            <span style={{ fontSize: 11, color: '#4A4A55' }}>{n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
