import { useEffect, useRef } from 'react';
import type { VideoElement } from '../doc/types';
import { useMediaUrl } from '../io/media';

// A live clip inside the SVG page (via foreignObject): starts at the trim
// point, loops or stops at the trim end, and follows mute and volume.
export function VideoPlayer({ el }: { el: VideoElement }) {
  const ref = useRef<HTMLVideoElement>(null);
  const url = useMediaUrl(el.mediaId);
  const end = el.trimEnd || el.duration;

  useEffect(() => {
    const v = ref.current;
    if (!v || !url) return;
    v.currentTime = el.trimStart;
    v.play().catch(() => {
      // Autoplay with sound can be refused; play muted rather than not at all.
      v.muted = true;
      v.play().catch(() => {});
    });
  }, [url, el.trimStart]);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = el.muted;
    v.volume = Math.max(0, Math.min(1, el.volume));
  }, [el.muted, el.volume]);

  return (
    <video
      ref={ref}
      src={url ?? undefined}
      playsInline
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      onTimeUpdate={(e) => {
        const v = e.currentTarget;
        if (v.currentTime < end - 0.03) return;
        if (el.loop) v.currentTime = el.trimStart;
        else v.pause();
      }}
    />
  );
}
