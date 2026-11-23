# Zenna, the Zinnia

I adopted a real zinnia and named her Zenna. Taking care of her taught me something simple and stubborn: growth is mostly showing up — water, light, patience, and the quiet hope that something will bloom even on gloomy days.

This site is that feeling, turned into a single page.

**Live:** [https://zenna-the-zinnia.vercel.app/](https://zenna-the-zinnia.vercel.app/)

## The idea

Two stories share one scroll:

1. **Her story** — a diary of the real plant: how she arrived, how she grew, what tending her looked like week by week.
2. **Your story** — a little garden you can tend in the browser. Care for a shared Global Zinnia with everyone else, or sign in, name a seedling of your own, and watch it grow.

I wanted something that felt warm and a little playful — not a dashboard, not a product pitch. Just a place where a plant could teach presence, and visitors could join in.

## How to wander through it

1. **Meet Zenna** — say hello. Peek at her pocket field guide if you’re curious.
2. **Watch her grow** — the real timeline: weeks, leaves, blooms, the slow becoming.
3. **Pick your adventure** — compare her IRL plot with the global garden, or start your own.
4. **Tend** — water, sunlight, song, prune, deadhead. Guests can care for the shared plot freely; a personal seedling needs an account (and unlocks more care as it matures). Achievements quietly track care streaks and secret finds.
5. **Roots** — every gardener who signs up deepens the roots at the bottom of the page.

Personal care still counts toward the shared garden. Quiet finds are hidden around the page — if you discover them, you’re in the running for a real plant giveaway.

## Stack

- Vite + React + TypeScript
- Hono API on Vercel serverless (`/api/*`)
- Postgres via `DATABASE_URL` (PGlite in-memory when unset for local/dev)
- [Motion](https://motion.dev/) for care feedback and stage presence
- Illustrated plant art under `src/assets/illustrations/`
- Growth diary as versioned JSON (`src/data/growth.json`) — canonical IRL record

## Page spine

Kept as a single-page artifact on purpose:

1. **Meet** — Frida-style “Zenna” wordmark; portrait flips to a pocket field guide
2. **Grow** — stem timeline; leaf cards hold the diary
3. **Compete** — soft compare of IRL / Global / Your Zenna
4. **Tend** — care actions; Global or personal plot; name your plant on signup; achievement gallery; forgot/reset password
5. **Footer roots** — grow with account signup count; tip jar + learn-more links

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

## Environment (Vercel) — database + secrets

**You do not have a production database yet.** Local/dev uses in-memory PGlite when `DATABASE_URL` is unset. Accounts, Global/Personal moods, achievements, and signup roots only survive deploys once Postgres is attached.

### 1. Create Postgres on Vercel

1. Open the [Vercel project](https://vercel.com) → **Storage** → **Create Database** → **Postgres** (Neon-backed is fine).
2. Link it to `zenna-the-zinnia` for Production + Preview.
3. Vercel injects `DATABASE_URL` (and usually `DATABASE_URL_UNPOOLED` / `POSTGRES_URL`). Prefer those auto-created values — do not invent connection strings.

### 2. Set the session secret

1. Project → **Settings** → **Environment Variables**
2. Add `SESSION_SECRET` = a long random string (≥16 chars), e.g. from your password manager or `openssl rand -hex 32`
3. Apply to Production + Preview
4. Redeploy (or wait for the next push) so migrations run via `npm run build` → `scripts/migrate.mjs`

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres (required for real accounts / global persistence) |
| `DATABASE_URL_UNPOOLED` | Optional direct URL for migrations behind a pooler |
| `SESSION_SECRET` | Cookie signing (≥16 chars). Required for auth in production |
| `VITE_GA_MEASUREMENT_ID` | Optional Google Analytics 4 ID (`G-…`). Leave blank to disable |
| `RESEND_API_KEY` | Optional. Sends password-reset emails via Resend |
| `RESET_EMAIL_FROM` | Optional From address for reset emails |
| `ALLOW_DEV_RESET_LINKS` | Optional. When `1`, forgot-password may return a local `resetPath` for testing |

Copy `.env.example` for local reference only — never commit real secrets.

## Analytics (Google Analytics 4)

Free GA4 covers visitors, geography/device, engagement time, and custom events. Demographics (age/gender/interests) appear after you turn on **Google signals** in the GA property.

### 1. Create a GA4 property

1. Open [Google Analytics](https://analytics.google.com) → **Admin** → **Create property**
2. Add a **Web** data stream for `https://zenna-the-zinnia.vercel.app`
3. Copy the **Measurement ID** (`G-XXXXXXXXXX`)

### 2. Set the env var on Vercel

1. Project → **Settings** → **Environment Variables**
2. Add `VITE_GA_MEASUREMENT_ID` = your Measurement ID (Production + Preview)
3. Redeploy so Vite bakes the ID into the client bundle

Locally you can put the same key in `.env` (see `.env.example`). With no ID set, analytics is a no-op.

### 3. Optional: demographics + DebugView

- **Admin → Data settings → Data collection** → enable **Google signals** for age/gender/interest reports (needs enough traffic; may take 24–48h)
- Use GA **Admin → DebugView** while testing; filter Realtime by your events

### Events this site sends

| Event | When |
| --- | --- |
| `page_view` | First load (gtag `config`) |
| `section_view` | Meet / Grow / Compete / Tend / Roots first enter viewport |
| `cta_click` | Hero, grow handoff, compete, and tip-jar CTAs |
| `care_action` | Water / prune / sunlight / sing / deadhead |
| `scope_change` | Global ↔ personal plot toggle |
| `auth_signup` / `auth_login` / `auth_logout` | Auth success |
| `plant_card_flip` | Portrait flip |
| `sound_toggle` | Sing sound checkbox |


## Project layout

```text
api/              Vercel serverless entry (Hono)
server/           API app + db / auth / plants / achievements / password reset
migrations/       SQL schema (additive)
src/
  components/     Meet, Grow, Compete, Tend, FooterRoots, PlantStage, AchievementGallery
  hooks/          usePlantMood, useAuth, useAchievements
  lib/            api client, analytics, achievementsStore, singAudio
  data/           growth.json, plantProfile, achievements catalog
scripts/migrate.mjs
```

## Care actions

| Action | Feedback |
| --- | --- |
| Water | Droplets, soil darkens, mist, happy sway |
| Prune | Snip flash + leaf fall |
| Sunlight | Warm wash / rays / sun core, stretch toward sunrays |
| Sing | Petal pulse + optional chime (muted by default) |
| Deadhead | Bloom snip + petal scatter |

Global and personal moods persist in Postgres (or PGlite locally). Sing mute preference stays in the browser. Guest achievements live in `localStorage` and sync when you sign in.

## Deploy (Vercel)

- Framework: Vite
- Build: `npm run build`
- Output: `dist`
- SPA rewrite skips `/api/*` (see `vercel.json`)
- Attach a Postgres store and set `DATABASE_URL` + `SESSION_SECRET`

# NOTE TO SELF:
## Portfolio

Link or iframe this URL from the portfolio project card. Do not merge this app into the portfolio repo until both are stable.
