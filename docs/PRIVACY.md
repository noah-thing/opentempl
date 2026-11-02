# Privacy

OpenTempl has no accounts. Your designs, photos and files stay on your computer unless you share a design with a link. This page lists everything that does leave it, and nothing else does.

## Anonymous counts

The first time you open OpenTempl it makes a random ID (a UUID) and keeps it in your browser's storage, under `opentempl:install`. It is not based on you, your device or your network. The ID does three things.

**Once a day** the app sends the ID, the OpenTempl version, and one of `web`, `mac`, `win` or `linux`. This gives the daily, weekly and monthly count of active installs.

**When you do one of six things** the app sends the ID and the name of the action: `design_created`, `template_opened`, `export`, `generate_used`, `chatgpt_used`, `photo_placed`. The server adds one to that day's count for that name and keeps nothing else about the action. It does not know which template, which photo, what format or what the design contained.

**What the server stores.** A SHA-256 hash of your ID (never the ID itself), the day it first and last appeared, its version and platform, and the list of days it was active. IP addresses are not stored and requests are not logged. To stop one network from flooding the counts, a one way hash of the address, mixed with the day and a server secret, is kept next to a counter for about three days and then deleted. It means nothing from one day to the next and cannot be turned back into an address.

**What is never sent:** your name, email, files, designs, text, photos, prompts, API keys or anything you typed.

### Turning counts off

In the editor open File and untick **Share anonymous counts**. Nothing is sent after that. Counts are also off whenever your browser sends Do Not Track, and in local development builds. To remove the ID as well, clear the site's storage in your browser.

## Shared designs

Sharing a design is the one time a copy of it leaves your device, and it leaves encrypted. When you copy a share link, OpenTempl makes a random key and puts it in the link after the `#`, which browsers never send to any server. Every change is encrypted on your device with a key derived from that secret (AES-GCM) before it is uploaded to the OpenTempl relay, a Cloudflare Worker with one Durable Object per shared design. The relay stores and forwards those encrypted blobs so changes reach people who open the link later. It cannot read them, because it never has the key.

**What the relay sees:** a room ID (a one way hash derived from the secret), the size and timing of encrypted messages, and the network address of whoever connects, which Cloudflare handles as it does for any request. Nothing is logged by the Worker. Design contents, titles, text, photos, names and cursors are not visible to it. Cursors and names go only between browsers over WebRTC.

**What it keeps:** the encrypted log of changes, at most 50 MB per shared design. A shared design is deleted from the relay when you choose **Stop sharing**, and automatically after 90 days with no one connecting or editing.

**What follows from the link being the key:** anyone who has the link can read and edit the design, and anyone you give it to can pass it on. Stop sharing, then share again, to get a new link. Everyone who opened the design keeps their own copy on their device. Video clips are not part of the synced design and stay on the device that added them.

The code is in [`sync/`](../sync) and [`apps/editor/src/collab/`](../apps/editor/src/collab).

## Email list (optional)

The newsletter form in the footer, and the note after your first export, are the only places OpenTempl asks for an email address, and you never need to fill them in. If you do, the server stores the address in lowercase, when you signed up, which form you used, and a random unsubscribe token. The address is used for one thing: telling you when there are new templates, about once a month. It is never sold or shared.

### Unsubscribing

Every email carries a personal unsubscribe link. Opening it deletes your address from the list straight away. If you lose the email, reply to any message from the list and ask to be removed.

## Where it runs

A Cloudflare Worker and a D1 database, with request logging switched off. The code is in [`stats/`](../stats), including the exact tables in `stats/migrations/0001_init.sql`.

## Other services the app can call

To introduce two browsers for live cursors, OpenTempl uses the free public PeerJS broker, which sees a hash of the room key and the network addresses involved, never the design.


Photo search goes through OpenTempl's own `/api/unsplash` route and sends only your search words. If you add your own OpenAI key to use Generate, requests with your prompt and pictures go to OpenAI from your browser. Neither is part of the counts above.
