# opentempl-sync

The relay behind shared OpenTempl designs: one Cloudflare Worker and one SQLite backed Durable Object per room. It runs at `opentempl-sync.opencursor.workers.dev`. Clients send and receive opaque encrypted Yjs updates, so a shared design syncs any time without accounts and without the server being able to read it. What it stores is described for users in [docs/PRIVACY.md](../docs/PRIVACY.md).

## How it works

A share link carries a random room key after the `#`. The browser derives a room ID (HKDF, 64 hex characters) and an AES-GCM key from it. Only the room ID reaches the relay. Every Yjs update is encrypted on the device before upload, with the room ID bound in as associated data.

The relay keeps an append only log of blobs per room and does four things:

- On connect, sends every stored row, then `Ready` with the row count and size.
- On a push, stores the blob, acks the sender with its sequence number and sends the row to the other sockets.
- Accepts a snapshot to replace the log. It cannot merge encrypted data itself, so a client uploads an encrypted full state with the highest sequence number it has merged (`upTo`). Rows up to that number are replaced, newer rows stay. Parts are held in a staging table and swapped in one transaction, so a dropped upload changes nothing.
- On destroy, deletes the log and keeps a small tombstone so stale copies of the link cannot refill the room.

Updates are CRDT updates, so order never matters and clients recover from any gap or dropped message by comparing state, which is why rate limiting can simply drop and reconnect.

## Wire format

Binary WebSocket messages, defined once in [`src/protocol.ts`](src/protocol.ts) and imported by the editor.

| Client to relay | Layout |
| --- | --- |
| Push | `0x01` blob |
| Snapshot part | `0x02` last(u8) upTo(f64) blob |
| Destroy | `0x03` |

| Relay to client | Layout |
| --- | --- |
| Row | `0x10` seq(f64) blob |
| Ready | `0x11` maxSeq(f64) rows(u32) bytes(u32) |
| Ack | `0x12` seq(f64) |
| Error | `0x13` code(u8) utf8 message |
| Snapped | `0x14` rows(u32) |
| Gone | `0x15` |

The text message `ping` is answered with `pong` without waking the Durable Object.

## Limits

| Limit | Value |
| --- | --- |
| Blob in one message | 2 MB (clients split bigger updates into 1 MB pieces) |
| Stored per room | 50 MB, then `RoomFull` with a plain message; a client answers by compacting |
| Idle expiry | 90 days after the last connect or write, then everything is deleted |
| Rate limit per connection | 60 message burst at 30 per second, 16 MB burst at 4 MB per second |
| Origins | opentempl.org, www.opentempl.org, the desktop app (`tavla://app`) and localhost. Set in `wrangler.jsonc`. |

## Privacy by construction

- Rooms hold ciphertext. The Worker never reads a blob.
- Observability is off in `wrangler.jsonc` and nothing is logged.
- The room ID is derived from the secret with HKDF and a different label than the encryption key, so it reveals nothing about either the key or the PeerJS ID used for live cursors.

## Develop

```sh
npm install
npm run typecheck
npm test            # protocol and Room behaviour inside the real Workers runtime
npx wrangler dev --port 8787
```

To point a local editor at a local relay, run this once in the browser console of the dev site, then reload:

```js
localStorage.setItem('opentempl:relay', 'ws://127.0.0.1:8787')
```

The end to end test is `qa/relay-e2e.mjs` at the repo root. It drives two isolated Chrome profiles against the dev server and the local relay, then reads the Durable Object's SQLite file to confirm only ciphertext was stored.

## Deploy

```sh
npx wrangler deploy
```

No secrets are needed. The Durable Object class is declared in `wrangler.jsonc` as a SQLite class, which the free Workers plan supports. If you move the Worker to another account or name, change `RELAY_URL` in `apps/editor/src/collab/relayProvider.ts`.
