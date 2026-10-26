const base = `${import.meta.env.BASE_URL}library/`;

// Photos shot for Tavla's library (generated, so free of releases and licences).
export const LIBRARY_PHOTOS: { url: string; thumb: string; name: string; w: number; h: number }[] = [
  ['portrait', 'Portrait in blue', 2, 3],
  ['archipelago', 'Archipelago at dusk', 3, 2],
  ['coffee', 'Coffee and a bun', 2, 3],
  ['sneaker', 'Yellow sneaker', 1, 1],
  ['concert', 'Gig crowd', 3, 2],
  ['plant', 'Monstera', 2, 3],
  ['skater', 'Skater', 2, 3],
  ['food', 'Pasta night', 3, 2],
  ['desk', 'Studio desk', 3, 2],
  ['dog', 'Terrier', 1, 1],
  ['city', 'Winter street', 2, 3],
  ['flowers', 'Tulips', 1, 1],
  ['friends', 'Rooftop friends', 3, 2],
  ['bread', 'Bakery shelf', 2, 3],
  ['runner', 'Morning run', 2, 3],
  ['ocean', 'Open water', 3, 2],
  ['man', 'Portrait in rust', 2, 3],
  ['sushi', 'Sushi', 3, 2],
  ['studio', 'Ceramics studio', 3, 2],
  ['forest', 'Pine forest', 2, 3],
].map(([id, name, w, h]) => ({ url: `${base}photos/${id}.jpg`, thumb: `${base}thumbs/${id}.jpg`, name: name as string, w: (w as number) * 600, h: (h as number) * 600 }));
