# Zenna, the Zinnia

A pet project. An interactive web experience tracking the growth of Zenna — an adopted zinnia — with a same-page care mini-game, global + personal plants, and a creative growth story.

**Live:** [https://zenna-the-zinnia.vercel.app/](https://zenna-the-zinnia.vercel.app/)  
**Standalone site** — also featured from the portfolio when that ships.

## Stack

- Vite + React + TypeScript
- Hono API on Vercel serverless (`/api/*`)
- Postgres via `DATABASE_URL` (PGlite in-memory when unset for local/dev)
- [Motion](https://motion.dev/) for care feedback and stage presence
- Illustrated plant art under `src/assets/illustrations/`
- Growth diary as versioned JSON (`src/data/growth.json`) — canonical IRL record

## Page spine

One composition on a single page (not a navbar of widgets):

1. **Meet** — Frida-style “Zenna” wordmark; flip icon on the portrait for a field card
2. **Grow** — stem timeline; leaf cards hold the diary; editable care totals
3. **Compete** — soft compare of IRL / Global / Your Zenna; “Compete against me” CTA
4. **Tend** — Water, Prune, Sunlight, Sing, Deadhead; Global or personal plot
5. **Footer roots** — grow with account signup count

## Develop

```bash
npm install
npm run dev
```

Local API uses PGlite automatically when `DATABASE_URL` is unset. Auth cookies sign with a **dev-only** secret unless you set `SESSION_SECRET` (see `.env.example`).

## Build

```bash
npm run build
npm run preview
```

`npm run build` also runs `scripts/migrate.mjs` when `DATABASE_URL` is set.

## Environment (Vercel)

Set in the Vercel project — do not commit real values:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection (Vercel Postgres / Neon / etc.) |
| `DATABASE_URL_UNPOOLED` | Optional direct URL for migrations behind a pooler |
| `SESSION_SECRET` | Cookie signing (≥16 chars). Required for auth in production |

Copy `.env.example` for local reference only.

## Try the story

1. **Meet** — flip the plant for the field card; continue to Grow or Compete.
2. **Grow** — week-by-week diary (IRL truth lives in `growth.json`).
3. **Compete** — see IRL vs Global vs your plot; CTA scrolls to Tend.
4. **Tend** — **Care for Global** (no account) or **Care for Mine** (sign up / sign in).
5. Try **Deadhead** plus the polished Water / Prune / Sunlight / Sing feedback.
6. Watch footer roots deepen as accounts appear.

## Project layout

```text
api/              Vercel serverless entry (Hono)
server/           API app + db / auth / plants
migrations/       SQL schema (additive)
src/
  components/     Meet, Grow, Compete, Tend, FooterRoots, PlantStage
  hooks/          usePlantMood, useAuth
  lib/            api client, singAudio
  data/growth.json
scripts/migrate.mjs
```

## Care actions

| Action | Feedback |
| --- | --- |
| Water | Droplets, soil darkens, mist, happy sway |
| Prune | Snip flash + leaf fall |
| Sunlight | Warm wash / rays / sun core, stretch |
| Sing | Petal pulse + optional chime (muted by default) |
| Deadhead | Bloom snip + petal scatter |

Global and personal moods persist in Postgres (or PGlite locally). Sing mute preference stays in the browser.

## Deploy (Vercel)

- Framework: Vite
- Build: `npm run build`
- Output: `dist`
- SPA rewrite skips `/api/*` (see `vercel.json`)
- Attach a Postgres store and set `DATABASE_URL` + `SESSION_SECRET`

## Portfolio

Link or iframe this URL from the portfolio project card. Do not merge this app into the portfolio repo until both are stable.
