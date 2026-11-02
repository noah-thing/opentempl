// Hand written intro for each template style hub, and the jobs each style suits.
export const VIBE_TEXT = {
  'swiss-grid': 'The International Typographic Style from 1950s Switzerland: a visible grid, flush left sans serif type, numbers and one strong image. It suits conference posters, annual reports and anything with a lot to say in a clear order.',
  'pixel-bitmap': 'Pixel type, bitmap grids, dot matrix and game sprites. Good for game nights, indie releases, hack events and anyone who grew up near a CRT screen.',
  'tech-mono': 'Black, white and one acid colour on a strict grid, set in monospaced type. Fits meetups, developer events, product launches and slides for technical talks.',
  'asia-poster': 'Dense, colourful event posters led by type, in the manner of Seoul and Tokyo street posters and club flyers. Works for festivals, pop ups and gigs where every inch has a job.',
  'riso-zine': 'Two inks, slight misregistration and grain: the look of a risograph print or a photocopied zine. Right for gig posters, zine covers, markets and school events.',
  brutalist: 'Raw type, system fonts and blunt layouts that do not apologise. Use it for art shows, club nights and anything that should not look polite.',
  bauhaus: 'Primary colours, circles, squares and diagonals from the German school of the 1920s. Strong for exhibition posters, workshops and music events.',
  seventies: 'Fat type, stripes and warm brown light. Suits record nights, cafes, vintage markets and invitations that want some warmth.',
  'rave-acid': 'Warped type, acid colour and all night flyers. Built for club nights, afterparties and anything that looks better printed at three in the morning.',
  'xerox-punk': 'Photocopy grain, cut out letters and the attitude of a gig flyer. Suits band posters, student nights and protest notices.',
  'magazine-cover': 'Mastheads, cover lines and one big image. Use it for newsletters, portfolios, lookbooks and event programmes that want to feel published.',
  'quiet-luxury': 'Serif type, space, cream and black. For brand announcements, menus, invitations and anything that should speak quietly.',
  'japanese-minimal': 'Quiet layouts, vertical type and one red dot. For exhibitions, tea rooms, workshops and calm announcements.',
  'nordic-minimal': 'Pale colours, calm layouts and a lot of air. Good for studios, cafes, wellness classes and small shop posts.',
  'mid-century': 'Flat shapes and warm print colours from the 1950s. For vintage markets, family events, travel and home brands.',
  'botanical-vintage': 'Plates, engravings and old labels. Suits plant shops, garden clubs, apothecary style branding and invitations.',
  'folk-pattern': 'Ornament, repeat and hand cut colour taken from folk art. For midsummer, markets, handmade brands and seasonal invitations.',
  'hand-drawn': 'Marker lines, doodles and handwriting. Friendly for classes, bake sales, kids events and community notices.',
  'collage-scrapbook': 'Cut paper, tape and torn edges. For zines, school projects, flea markets and personal invitations.',
  'kids-play': 'Bright shapes and friendly type for parties and classrooms. For birthdays, school events and children’s activities.',
  'cute-mascot': 'A character carries the message. For small shops, clubs and social posts that need a face.',
  'soft-pastel': 'Pale colour, round shapes and gentle type. For baby showers, beauty and wellness posts and spring events.',
  'gradient-aura': 'Blurred colour fields with quiet type. For wellness, music releases, event posts and stories.',
  'y2k-chrome': 'Chrome type, blobs and early web shine from around the year 2000. For club nights, fashion drops and nostalgic posts.',
  'dark-tech': 'Night backgrounds, neon and conference energy. For developer events, launches, esports and slides on a dark screen.',
  'maximal-pop': 'Loud colour and everything at once. For sales, festivals, student events and posts that need to be seen from across a room.',
  'sports-bold': 'Numbers, club colours and athletic type. For match days, team signups, tournaments and training schedules.',
  'photo-overlay': 'One strong photo with bold type on top. For travel, events, news and any post where the picture is the point.',
  academic: 'Diagrams, museum posters and scientific plates. For lectures, symposia, school projects and research slides.',
  'receipt-utility': 'Typewriter type, forms, labels and receipts. For shop notices, price lists, zines and design that looks like an artefact.',
  'fine-stationery': 'Invitations, fine lines and a letterpress feel. For weddings, dinners, announcements and thank you cards.',
  'food-menu': 'Menus, cafe boards and recipe cards. For restaurants, pop ups, bake sales and market stalls.',
  'earthy-organic': 'Clay, soft shapes and natural tones. For ceramics, farm shops, yoga and slow living brands.',
  'corporate-clean': 'Posts and slides for work that still look designed. For team updates, pitches, reports and company announcements.',
};
const P = ['/free-poster-maker', 'poster maker'];
const I = ['/free-instagram-post-maker', 'Instagram post maker'];
const S = ['/free-presentation-maker', 'presentation maker'];
const M = ['/free-menu-maker', 'menu maker'];
export const VIBE_TASKS = {
  'swiss-grid': [P, S], 'pixel-bitmap': [P, I], 'tech-mono': [S, I], 'asia-poster': [P, I], 'riso-zine': [P, I], brutalist: [P, I],
  bauhaus: [P], seventies: [P, M], 'rave-acid': [P, I], 'xerox-punk': [P], 'magazine-cover': [P, S], 'quiet-luxury': [I, M],
  'japanese-minimal': [P, I], 'nordic-minimal': [I, P], 'mid-century': [P, M], 'botanical-vintage': [P, M], 'folk-pattern': [P, I],
  'hand-drawn': [P, I], 'collage-scrapbook': [P, I], 'kids-play': [P, I], 'cute-mascot': [I], 'soft-pastel': [I], 'gradient-aura': [I],
  'y2k-chrome': [I, P], 'dark-tech': [S, I], 'maximal-pop': [I, P], 'sports-bold': [P, I], 'photo-overlay': [I, P], academic: [P, S],
  'receipt-utility': [P, M], 'fine-stationery': [P], 'food-menu': [M], 'earthy-organic': [I, M], 'corporate-clean': [S, I],
};
