export interface Format {
  id: string;
  name: string;
  group: 'Social' | 'Video' | 'Slides' | 'Print' | 'Web' | 'Personal';
  width: number;
  height: number;
  unit?: 'px' | 'mm';
  note?: string;
}

// Sizes in pixels at 96 dpi for print formats, so 1 mm = 3.7795 px.
const mm = (v: number) => Math.round(v * 3.7795);

export const FORMATS: Format[] = [
  { id: 'ig-post', name: 'Instagram post', group: 'Social', width: 1080, height: 1350, note: '4:5' },
  { id: 'ig-square', name: 'Square post', group: 'Social', width: 1080, height: 1080, note: '1:1' },
  { id: 'story', name: 'Story or Reel', group: 'Social', width: 1080, height: 1920, note: '9:16' },
  { id: 'x-post', name: 'X post', group: 'Social', width: 1600, height: 900, note: '16:9' },
  { id: 'linkedin', name: 'LinkedIn post', group: 'Social', width: 1200, height: 1200 },
  { id: 'pinterest', name: 'Pinterest pin', group: 'Social', width: 1000, height: 1500, note: '2:3' },
  { id: 'fb-cover', name: 'Facebook cover', group: 'Social', width: 1640, height: 624 },
  { id: 'yt-thumb', name: 'YouTube thumbnail', group: 'Video', width: 1280, height: 720 },
  { id: 'yt-banner', name: 'YouTube banner', group: 'Video', width: 2560, height: 1440 },
  { id: 'video-hd', name: 'Video 1080p', group: 'Video', width: 1920, height: 1080 },
  { id: 'video-vertical', name: 'Vertical video', group: 'Video', width: 1080, height: 1920 },
  { id: 'slides', name: 'Presentation', group: 'Slides', width: 1920, height: 1080, note: '16:9' },
  { id: 'slides-43', name: 'Presentation 4:3', group: 'Slides', width: 1440, height: 1080 },
  { id: 'a4', name: 'A4 document', group: 'Print', width: mm(210), height: mm(297), unit: 'mm', note: '210 × 297 mm' },
  { id: 'a3-poster', name: 'A3 poster', group: 'Print', width: mm(297), height: mm(420), unit: 'mm', note: '297 × 420 mm' },
  { id: 'a5-flyer', name: 'A5 flyer', group: 'Print', width: mm(148), height: mm(210), unit: 'mm', note: '148 × 210 mm' },
  { id: 'letter', name: 'US Letter', group: 'Print', width: 816, height: 1056, note: '8.5 × 11 in' },
  { id: 'business-card', name: 'Business card', group: 'Print', width: mm(85), height: mm(55), unit: 'mm', note: '85 × 55 mm' },
  { id: 'postcard', name: 'Postcard', group: 'Print', width: mm(148), height: mm(105), unit: 'mm', note: 'A6' },
  { id: 'poster-50x70', name: 'Poster 50 × 70', group: 'Print', width: mm(500), height: mm(700), unit: 'mm' },
  { id: 'logo', name: 'Logo', group: 'Web', width: 500, height: 500 },
  { id: 'web-banner', name: 'Website hero', group: 'Web', width: 1920, height: 1080 },
  { id: 'og-image', name: 'Link preview image', group: 'Web', width: 1200, height: 630 },
  { id: 'email-header', name: 'Email header', group: 'Web', width: 1200, height: 400 },
  { id: 'invite', name: 'Invitation', group: 'Personal', width: mm(127), height: mm(178), unit: 'mm', note: '5 × 7 in' },
  { id: 'phone-wallpaper', name: 'Phone wallpaper', group: 'Personal', width: 1170, height: 2532 },
  { id: 'desktop-wallpaper', name: 'Desktop wallpaper', group: 'Personal', width: 2560, height: 1600 },
  { id: 'whiteboard', name: 'Whiteboard', group: 'Personal', width: 4000, height: 2600 },
];

export function formatById(id?: string) {
  return FORMATS.find((f) => f.id === id);
}
