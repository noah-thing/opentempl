// The mark: the matte pixel cloud on its cobalt tile (research/icon/v4/pixel-cloud.png).
// The 96 px file covers every size the interface draws it at, up to 3x screens.
export function Mark({ size = 28 }: { size?: number; tone?: 'ink' | 'lime' }) {
  const src = `${import.meta.env.BASE_URL}${size > 32 ? 'mark-512.png' : 'mark-96.png'}`;
  return <img src={src} width={size} height={size} alt="Tavla" draggable={false} style={{ display: 'block', flex: 'none' }} />;
}

// Wordmark set in the grotesk, tight, with the mark in front.
export function Wordmark({ size = 22, tone = 'ink' }: { size?: number; tone?: 'ink' | 'lime' }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.4, fontWeight: 600, fontSize: size, letterSpacing: '-0.045em' }}>
      <Mark size={size * 1.25} tone={tone} />
      tavla
    </span>
  );
}

// A quiet sign for empty states and loaders: the mark's pixel t on its own, in the muted ink.
export function Sign({ size = 40 }: { size?: number; mood?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden style={{ color: 'var(--ink-3)' }}>
      <rect x="0.5" y="0.5" width="15" height="15" rx="4" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M7 3h2v3h3v2H9v3h3v2H7V8H5V6h2z" fill="currentColor" />
    </svg>
  );
}
