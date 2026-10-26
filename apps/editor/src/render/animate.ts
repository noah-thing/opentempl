import type { AnimationKind, ElementAnimation } from '../doc/types';

// One animation model for Present mode and video export: given the time since
// a page appeared, every element gets an opacity and transform.

export interface AnimState {
  opacity: number;
  tx: number; // fraction of element width
  ty: number; // fraction of element height
  scale: number;
  rotate: number; // degrees
  blur: number; // px
  reveal: number; // 0..1 horizontal reveal for wipe and typewriter
}

const IDLE: AnimState = { opacity: 1, tx: 0, ty: 0, scale: 1, rotate: 0, blur: 0, reveal: 1 };

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export function animState(anim: ElementAnimation | null | undefined, timeMs: number): AnimState {
  if (!anim || anim.kind === 'none') return IDLE;
  const raw = (timeMs - anim.delay) / Math.max(1, anim.duration);
  if (raw >= 1) return IDLE;
  const t = Math.max(0, raw);
  const e = easeOut(t);
  switch (anim.kind as AnimationKind) {
    case 'fade':
      return { ...IDLE, opacity: e };
    case 'rise':
      return { ...IDLE, opacity: e, ty: (1 - e) * 0.35 };
    case 'drop':
      return { ...IDLE, opacity: e, ty: -(1 - e) * 0.35 };
    case 'pop':
      return { ...IDLE, opacity: Math.min(1, t * 3), scale: 0.4 + 0.6 * easeOutBack(t) };
    case 'wipe':
      return { ...IDLE, reveal: e };
    case 'pan':
      return { ...IDLE, opacity: e, tx: -(1 - e) * 0.4 };
    case 'blur':
      return { ...IDLE, opacity: e, blur: (1 - e) * 18 };
    case 'typewriter':
      return { ...IDLE, reveal: t };
    case 'stomp':
      return { ...IDLE, opacity: Math.min(1, t * 4), scale: 1 + (1 - easeOutBack(t)) * 0.9 };
    case 'tumble':
      return { ...IDLE, opacity: e, rotate: (1 - e) * -40, scale: 0.7 + 0.3 * e };
    default:
      return IDLE;
  }
}

export function pageAnimationLength(anims: (ElementAnimation | null | undefined)[]) {
  return anims.reduce((m, a) => (a && a.kind !== 'none' ? Math.max(m, a.delay + a.duration) : m), 0);
}

export const ANIMATIONS: { kind: AnimationKind; label: string }[] = [
  { kind: 'none', label: 'None' },
  { kind: 'fade', label: 'Fade' },
  { kind: 'rise', label: 'Rise' },
  { kind: 'drop', label: 'Drop' },
  { kind: 'pop', label: 'Pop' },
  { kind: 'wipe', label: 'Wipe' },
  { kind: 'pan', label: 'Pan' },
  { kind: 'blur', label: 'Focus' },
  { kind: 'typewriter', label: 'Typewriter' },
  { kind: 'stomp', label: 'Stomp' },
  { kind: 'tumble', label: 'Tumble' },
];
