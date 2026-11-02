<p align="center">
  <img src="apps/desktop/icon.png" width="96" alt="OpenTempl" />
</p>

<h1 align="center">OpenTempl</h1>

<p align="center"><b>The free, open source Canva alternative.</b><br />A design app for posters, social posts, slides, menus and invitations.<br />Works offline, no account, 325 templates in 34 styles. MIT licensed.</p>

<p align="center"><a href="https://opentempl.org">opentempl.org</a> · <a href="https://opentempl.org/canva-alternative">Canva alternative</a> · <a href="https://opentempl.org/templates">Templates</a> · <a href="https://opentempl.org/prompts">ChatGPT poster prompts</a></p>

---

OpenTempl is a free, open source (MIT) design app for posters, social media posts and slides, with 325 templates, that works offline and needs no account. It is an alternative to Canva, built from scratch: a real canvas editor with pages, smart guides, text effects, photo editing, charts, animation, presenting and export, plus the tools Canva keeps behind its paid plans (background removal, magic resize, brand kits, bulk create, transparent PNG, SVG export, version history, custom fonts), included for everyone. It is not affiliated with Canva.

**Good to know before you try it**

- It works offline after the first load. Fonts you have not used yet, icon and stock photo search, live sessions and the first download of the background removal model need a connection.
- Designs are saved on your device. There is no OpenTempl account and no OpenTempl server that stores them.
- Not here yet: team workspaces, a phone app, cloud sync, CMYK output. It is version 0.1 with one maintainer.

There is no account. Designs live in the browser's IndexedDB. A shared design also syncs through a small encrypted relay, so edits arrive any time. The relay only ever holds ciphertext, encrypted with the key in the share link.

## What is in here

```
apps/editor    the editor (React 19, TypeScript, Yjs, Vite)
apps/site      the earlier marketing site (the editor's home page now does that job)
seo/           generator for the static pages on opentempl.org (guides, templates, prompt gallery, sitemap, llms.txt)
api/           Vercel function that proxies Unsplash so the key stays on the server
apps/desktop   Electron shell that packages the editor as a desktop app
research/      design synthesis from the reference board and the Canva teardown
assets/        the Codex briefs used to make OpenTempl's photos, voxel objects and textures
qa/            Playwright scripts used to check the editor end to end
```

## Run it

```bash
npm install
npm run dev          # editor on http://localhost:5181
npm run dev:site     # site on http://localhost:5182
npm run build        # site into dist/, editor into dist/app/
node seo/build.mjs   # static pages into apps/editor/public/ (the Vercel build runs this first)
npm test -w @opentempl/editor   # unit tests (vitest)
```

Browser tests live in `qa/` (Playwright scripts against the dev server). `scripts/ship-mini.sh` rebuilds the private preview on the Mac mini, and with `--desktop` also the desktop apps in the draft release.

Desktop app (macOS, from `apps/desktop`): build the editor, copy `dist/app` to `apps/desktop/app`, then `npx electron-builder --mac dmg`.

## Features

**Canvas.** Pages stacked or in a grid, zoom from 5% to 800%, pinch and ctrl scroll zoom around the cursor, space to pan, rulers with draggable guides, a layout grid, smart guides for edges, centres and equal gaps with the spacing written on the guide, marquee selection, alt drag to duplicate, drag elements between pages.

**Elements.** 23 shapes with fills, gradients, borders and rounded corners; lines with arrowheads, dashes and bends; photo frames in any shape; OpenTempl's own voxel objects, characters and glass shapes; 200,000 icons through Iconify; charts (column, bar, line, area, pie, donut, progress) with a data editor that takes pasted spreadsheets; tables; QR codes; freehand drawing with pen, marker, highlighter, glow pen and eraser; a vector pen (click for corners, drag for curves, edit every point afterwards) and shape combining (union, subtract, intersect, exclude); connector lines that stick to shapes and follow them, pulled out of any selection from its connect dots; video clips with in place playback, filmstrip trimming, volume and loop.

**Text.** Its own line layout, so the screen, PNG, SVG and PDF all break lines in the same place. 1,344 Google Fonts plus your own font files, weights, italic, underline, strike, uppercase, letter and line spacing, lists, alignment, gradients, curved text, and ten effects: shadow, lift, hollow, splice, outline, echo, glitch, neon, highlight.

**Photos.** Crop by dragging inside the frame, masks, borders, twelve filters, eight adjustment sliders, duotones, vignette, grain, and background removal that runs on your machine (BiRefNet lite, MIT licence, through transformers.js).

**Pages and motion.** Backgrounds in colour, gradient, photo or texture; page transitions; ten entrance animations with delay and duration; speaker notes; Present mode with autoplay; hidden pages.

**Organise.** Layers panel with drag to restack, hide, lock and rename; group, align, distribute and tidy; numeric position panel; copy and paste style; find and replace; add to every page; alt text.

**Check.** A design check flags text that does not stand out from what is actually behind it (WCAG contrast), text too small for the page, photos that will print soft, missing alt text, elements off the page and empty boxes, with one click fixes.

**Restyle.** Styles recolour the whole design with one of sixteen palettes or five colours taken from a photo, matched by brightness so contrast survives, and swap the fonts for one of twelve pairs.

**Make more.** Magic resize into any format, in place or as a copy. Bulk create: paste a table and get a page per row. Brand kits with logos, colours and fonts. 325 templates in 34 styles. Version history with a snapshot every ten minutes. A command palette on ⌘K with every action.

**Export.** PNG (transparent, up to 4×), JPG, WebP, SVG, PDF for screen or print with live links and bleed, PowerPoint with editable text, MP4 video of pages, animations and clips with their mixed sound (WebCodecs), GIF, multi page ZIP, and the editable `.opentempl` file (video clips included).

**Sound.** A soundtrack under the whole design, from your own file or one of four OpenTempl tones that the app synthesises on the spot. Trim it on its waveform, set volume and fade out. It plays in Present mode and is mixed with the clips' sound into MP4 exports.

**Import.** `.opentempl` files, PowerPoint files (slides, text with bold, italic and colour runs, theme colours, shapes, pictures with crops, backgrounds, speaker notes; placeholders take their position from the layout like in PowerPoint) and PDFs. PDF text comes in as editable text boxes over the page drawn without its text, in fonts with matching widths (Arimo for Helvetica and Arial, Tinos for Times, Cousine for Courier), with weight, colour and paragraph spacing read from the file; or pages as plain pictures if you prefer.

**Share.** One link, no accounts. Anyone with it can edit, with cursors and selections of everyone in the room. Changes sync two ways at once: peer to peer over WebRTC for speed, and through an end to end encrypted relay so they arrive even when nobody else is online, when you are offline, or when WebRTC can't connect on a strict network. Opening the link on a new device downloads the design into that device's IndexedDB. Stop sharing deletes the room on the relay.

How the relay stays blind: the link carries a random key after the `#`. The browser derives two things from it with HKDF, a room ID that names the room on the relay, and an AES-GCM key that never leaves the device. Every Yjs update is sealed with that key before upload, so the relay stores and fans out ciphertext it cannot read or merge. Clients compact the log by uploading an encrypted full snapshot. Limits: 2 MB per message (larger updates are split into pieces), 50 MB per room, rooms deleted after 90 days idle. Awareness (cursors, names) stays on WebRTC only. The relay is a Cloudflare Worker with a Durable Object per room, in [`sync/`](sync); see its README for the protocol, deploy steps and tests. The client side is `collab/relayProvider.ts`, `relayCrypto.ts` and `relayChunks.ts`.

## Architecture in one paragraph

A design is a Y.Doc: `meta`, `pageOrder`, `pages` and `elements` maps, plus `assets` holding image bytes so a design is complete on its own. `DesignDoc` keeps an immutable snapshot for React and routes every local edit through one transaction origin, which drives undo, persistence (y-indexeddb) and collaboration (a small PeerJS based Yjs provider, `collab/peerProvider.ts`, plus the encrypted relay provider, `collab/relayProvider.ts`) from the same data. Video bytes are the exception: they live in their own IndexedDB store so version history and live sync stay light, and the design keeps a poster frame. Rendering is SVG: the same `PageView` draws the canvas, thumbnails, Present mode, and exports (rendered to a string with fonts and images inlined, then rasterised). Interaction lives in an HTML overlay above each page. See `research/canva/02-document-model.md` for how this compares with Canva's model.

## Privacy

No account, nothing personal collected. OpenTempl counts anonymously how many copies are in use and how often a handful of actions happen (a design made, an export), using a random ID your browser makes for itself and no IP address. Turn it off any time under File, Share anonymous counts. The newsletter form is optional, and every email has a link that deletes your address. The full list of what is counted and stored is in [docs/PRIVACY.md](docs/PRIVACY.md), and the code is in [`stats/`](stats).

## Licence

MIT. The photos, voxel objects, characters and textures in `apps/editor/public/library` were made for OpenTempl and are free to use for anything. Icons from Iconify and photos from Openverse keep their own licences.
