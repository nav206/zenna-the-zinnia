# Zenna, the Zinnia

A pet project. An interactive web experience serving dual purpose: tracking the growth of Zenna (my adopted zinnia plant) and on the same-page a mini-game to care for your own virtual plant. 

**The project is Live At:** [https://zenna-the-zinnia.vercel.app/](https://zenna-the-zinnia.vercel.app/)  

Here's how it works:

### Step 1: You meet Zenna. 
### Step 2: You see what Zenna has been up to.

### Step 3: You get to take care of your own Zinnia plant (v2; v3 coming not very soon.)

There are two ways you can interact with virtual plant. 
- **Globally:** anyone can use every care action on the webpage (no login required).
- **Personally:** You create an account using email+PW combination; new plots start as a **seedling** (water / sunlight / sing only). **Prune** unlocks at 6 care moments (**growing**); **deadhead** at 12 (**mature**).
- Any personal care you provide to your dear plant also contributes to **Global** statistics (as if a shared garden counts every visitor's action on the site).


 P.S. There are at least 3 easter eggs I have hidden in the webpage; if you find them-- you enter a giveaway for an actual plant.

## Stack Used:

- Vite + React + TypeScript
- Hono API on Vercel serverless (`/api/*`)
- Postgres via `DATABASE_URL` (PGlite in-memory when unset for local/dev)
- [Motion](https://motion.dev/) for care feedback and stage presence
- Illustrated plant art under `src/assets/illustrations/`
- Growth diary as versioned JSON (`src/data/growth.json`) — canonical IRL record

## Page spine

I decided to keep it as simple as possible, and make a single page artifact. I think it works well, do you agree?

1. **Meet** — Frida-style “Zenna” wordmark; flip icon on the portrait for a field card
2. **Grow** — stem timeline; leaf cards hold the diary; editable care totals
3. **Compete** — soft compare of IRL / Global / Your Zenna; “Compete against me” CTA
4. **Tend** — Water, Prune, Sunlight, Sing, Deadhead; Global or personal plot
5. **Footer roots** — grow with account signup count

Finally, Here's how I and Cursor made this project happen: 

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

**You do not have a production database yet.** Local/dev uses in-memory PGlite when `DATABASE_URL` is unset. Accounts, Global/Personal moods, and signup roots only survive deploys once Postgres is attached.

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
| `cta_click` | Hero, grow handoff, and compete CTAs |
| `care_action` | Water / prune / sunlight / sing / deadhead |
| `scope_change` | Global ↔ personal plot toggle |
| `auth_signup` / `auth_login` / `auth_logout` | Auth success |
| `plant_card_flip` | Portrait flip |
| `sound_toggle` | Sing sound checkbox |


## Project layout

```text
api/              Vercel serverless entry (Hono)
server/           API app + db / auth / plants
migrations/       SQL schema (additive)
src/
  components/     Meet, Grow, Compete, Tend, FooterRoots, PlantStage
  hooks/          usePlantMood, useAuth
  lib/            api client, analytics, singAudio
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

# NOTE TO SELF: 
## Portfolio

Link or iframe this URL from the portfolio project card. Do not merge this app into the portfolio repo until both are stable.
