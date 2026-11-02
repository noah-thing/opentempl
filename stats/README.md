# opentempl-stats

The anonymous counts and the optional email list for OpenTempl, as one Cloudflare Worker with one D1 database. It runs at `opentempl-stats.opencursor.workers.dev`. What it counts and stores is written out for users in [docs/PRIVACY.md](../docs/PRIVACY.md).

## Endpoints

| Route | What it does |
| --- | --- |
| `POST /v1/ping` | `{install, version, platform}`, once a day per install. `platform` is `web`, `mac`, `win` or `linux`. |
| `POST /v1/event` | `{install, name}` for `design_created`, `template_opened`, `export`, `generate_used`, `chatgpt_used`, `photo_placed`. Only a count per day and per name is kept. |
| `POST /v1/subscribe` | `{email, source}` with `source` of `footer` or `export`. Always answers 204 for a valid address, new or not. |
| `GET /v1/unsubscribe?token=` | Deletes the row and shows one line. |
| `GET /v1/public` | `{installs30d, designs, exports}` for the "Used by" line. Cached for an hour. CORS for opentempl.org, the desktop app and localhost. |
| `GET /stats?key=` and `/stats.json?key=` | The dashboard, for whoever holds `STATS_KEY`. |

Pings and events are sent as `text/plain` JSON so the browser needs no preflight and `sendBeacon` works.

## Privacy by construction

- The install ID is a random UUID the app makes itself. Only its SHA-256 hash is stored.
- IP addresses are never stored. To slow floods, a hash of the address salted with the day and `STATS_KEY` is kept in `ip_limits` with a counter for about three days.
- Observability is off in `wrangler.jsonc` and bodies are never logged.
- An address leaves the list the moment its unsubscribe link is opened.

## Set up

```sh
npm install
npx wrangler d1 migrations apply opentempl-stats --remote
npx wrangler secret put STATS_KEY      # any long random string
npx wrangler deploy
```

The key also lives in `~/.config/opentempl/stats-key` on the maintainer's machine, outside the repo. Open `/stats?key=...` to read the dashboard.

## Develop

```sh
npm run typecheck
npm test
```

## Reading the email list

```sh
npx wrangler d1 execute opentempl-stats --remote --command "select email, source, created_at from subscribers"
```

Every mail sent to the list needs an unsubscribe link: `https://opentempl-stats.opencursor.workers.dev/v1/unsubscribe?token=<token>`, with each row's own `token`.
