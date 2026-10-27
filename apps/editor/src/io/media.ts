import { useEffect, useState } from 'react';
import type { Id } from '../doc/types';
import { db } from './db';

// Video clips live here, outside the design's Y.Doc: one blob per clip, keyed
// by the element's mediaId. Object URLs are made once and reused.

const urls = new Map<Id, string>();
const pending = new Map<Id, Promise<string | null>>();

export async function putMedia(id: Id, blob: Blob) {
  await db.set('media', id, blob);
}

export async function getMedia(id: Id): Promise<Blob | undefined> {
  return db.get<Blob>('media', id);
}

export function mediaUrl(id: Id): Promise<string | null> {
  const known = urls.get(id);
  if (known) return Promise.resolve(known);
  let p = pending.get(id);
  if (!p) {
    p = getMedia(id).then((b) => {
      if (!b) return null;
      const u = URL.createObjectURL(b);
      urls.set(id, u);
      return u;
    });
    pending.set(id, p);
  }
  return p;
}

export function useMediaUrl(id: Id | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(() => (id ? (urls.get(id) ?? null) : null));
  useEffect(() => {
    if (!id) return;
    let live = true;
    mediaUrl(id).then((u) => live && setUrl(u));
    return () => {
      live = false;
    };
  }, [id]);
  return url;
}

// Load a clip into a detached <video> and wait until it can show frames.
export function loadVideo(src: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const v = document.createElement('video');
    v.muted = true;
    v.playsInline = true;
    v.preload = 'auto';
    v.crossOrigin = 'anonymous';
    v.onloadeddata = () => resolve(v);
    v.onerror = () => reject(new Error('This video format cannot be played here'));
    v.src = src;
  });
}

export function seek(v: HTMLVideoElement, t: number): Promise<void> {
  return new Promise((resolve) => {
    const target = Math.max(0, Math.min(t, (v.duration || t) - 0.001));
    if (Math.abs(v.currentTime - target) < 0.0005 && v.readyState >= 2) return resolve();
    const done = () => {
      v.removeEventListener('seeked', done);
      resolve();
    };
    v.addEventListener('seeked', done);
    v.currentTime = target;
  });
}

// One frame as an image blob, at most `maxSide` pixels on the long side.
export async function grabFrame(v: HTMLVideoElement, t: number, maxSide = 1600, type = 'image/webp'): Promise<Blob> {
  await seek(v, t);
  const s = Math.min(1, maxSide / Math.max(v.videoWidth, v.videoHeight));
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(v.videoWidth * s));
  c.height = Math.max(1, Math.round(v.videoHeight * s));
  c.getContext('2d')!.drawImage(v, 0, 0, c.width, c.height);
  return new Promise((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error('frame'))), type, 0.86));
}

export function clipLength(el: { trimStart: number; trimEnd: number; duration: number }) {
  return Math.max(0.1, (el.trimEnd || el.duration) - el.trimStart);
}

export function formatTime(s: number) {
  s = Math.round(s);
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, '0')}`;
}

// One frame as a JPEG data URL, for inlining into an exported SVG.
export async function frameDataUrl(v: HTMLVideoElement, t: number, maxSide: number): Promise<string> {
  await seek(v, t);
  const s = Math.min(1, maxSide / Math.max(v.videoWidth, v.videoHeight));
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(v.videoWidth * s));
  c.height = Math.max(1, Math.round(v.videoHeight * s));
  c.getContext('2d')!.drawImage(v, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.88);
}

// Where in the clip a page moment falls: loops wrap, one shot clips hold the last frame.
export function clipTime(el: { trimStart: number; trimEnd: number; duration: number; loop: boolean }, seconds: number) {
  const len = clipLength(el);
  const into = el.loop ? seconds % len : Math.min(seconds, len - 0.04);
  return el.trimStart + Math.max(0, into);
}
