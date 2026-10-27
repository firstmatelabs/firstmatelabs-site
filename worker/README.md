# Demo token endpoint (Cloudflare Worker)

`POST /api/demo/session` with `{ "business": "dental|hvac|roofing|medspa|law", "turnstileToken": "..." }` returns `{ "conversationToken": "..." }`, or:

| Status | Meaning |
|---|---|
| 400 | Bad body or unknown business |
| 403 | Origin not allowed, or Turnstile failed |
| 429 | Any cap hit (per-IP, daily per agent, daily total, concurrency). Same answer for all four |
| 502 / 503 | ElevenLabs refused, or the agent ID is not set |

Nothing here is deployed. The API key and the Turnstile secret are Worker secrets, never files in this repo.

## Caps

All counted in one Durable Object so they are atomic. Values are `[vars]` in `wrangler.toml`.

| Cap | Default | Notes |
|---|---|---|
| Per IP | 5 per hour | IP is hashed before it is stored; counters drop after the hour |
| Per agent | 40 per day | Resets at 00:00 UTC |
| All agents | 200 per day | Resets at 00:00 UTC |
| Concurrent | 4 | Set to the ElevenLabs plan cap. A slot expires after 190 s because the Worker cannot see a call end |

A failed token request gives its slot and counts back.

These caps do not replace the ones set on each agent in ElevenLabs (180 s max call, `daily_limit`, concurrency, bursting off). Set both.

## Go-live steps (for whoever deploys)

1. Fill `AGENT_IDS` and `ALLOWED_ORIGINS` in `wrangler.toml`.
2. `npx wrangler secret put ELEVENLABS_API_KEY` and `npx wrangler secret put TURNSTILE_SECRET`.
3. `npx wrangler deploy`.
4. In `demo/config.js` set `tokenEndpoint` (the Worker URL plus `/api/demo/session`), `turnstileSiteKey`, and `enabled: true`.
5. On each agent in ElevenLabs, turn authentication on and the hostname allowlist off (they do not mix).
