# Zenna, the Zinnia

An interactive web experience tracking the growth of Zenna — an adopted zinnia — with a same-page care mini-game (water, prune, sunlight, sing) and a creative growth story.

**Live:** [https://zenna-the-zinnia.vercel.app/](https://zenna-the-zinnia.vercel.app/)  
**Standalone site** — also featured from the portfolio when that ships.

## Stack

- Vite + React + TypeScript
- [Motion](https://motion.dev/) for care feedback and stage presence
- Illustrated plant art under `src/assets/illustrations/` (authored / generated placeholders — not cheap polygon plant figures)
- Growth diary as versioned JSON (`src/data/growth.json`)

## Page spine

One composition, three chapters on a single page (not a navbar of widgets):

1. **Meet** — brand-first hero; flip the plant portrait for a Pokémon-style field card (taxonomy, needs, strengths, weakness)
2. **Grow** — botanical stem timeline driven by JSON (story & data first)
3. **Tend** — care mini-game (Water, Prune, Sunlight, Sing); mood in `localStorage`

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Try the story

1. Land on **Meet** — click / tap / keyboard-activate the plant to flip into her trading card, then scroll to **Grow** (or use “Watch her grow”).
2. Read the week-by-week stem story — data and diary first.
3. Continue to **Tend** (or use “Tend Zenna”) — tap **Water**, **Prune**, or **Sunlight**.
4. While you stay, moisture / joy / neatness ease down about every 12s; light follows your browser’s local day (brighter) or night (softer). Hidden tabs pause.
5. **Sing** is visual by default. Check **Enable Sing sound** for a soft Web Audio chime (opt-in).
6. Mood stats persist in this browser via `localStorage`.

## Project layout

```text
src/
  components/     Meet, MeetPlantCard, Tend, Grow, PlantStage
  hooks/          usePlantMood (localStorage)
  lib/            singAudio (opt-in Web Audio)
  data/growth.json
  data/plantProfile.ts    Meet trading-card facts
  assets/illustrations/   plant + week art
  types/growth.ts
public/
  photos/         optional real week photos later
```

## Add a week of growth

Edit `src/data/growth.json`. Each entry:

```json
{
  "week": 1,
  "date": "2026-11-03",
  "heightCm": 12,
  "note": "First true leaves after the move indoors.",
  "photo": "illustrations/zenna-week-01.jpg"
}
```

Commit the data (and optional art under `src/assets/illustrations/` or `public/photos/`). Redeploy.

## Care actions (mini-game)

| Action | Feedback |
| --- | --- |
| Water | Droplets, soil darkens, happy sway |
| Prune | Snip flash + leaf fall |
| Sunlight | Warm wash / ray drift, stretch toward light |
| Sing | Petal pulse + optional chime (muted by default) |

Plant mood is local (browser); diary growth is the real record.

## Deploy (Vercel)

Recommended host for this Vite + React SPA.

**Settings**
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- SPA rewrites: `vercel.json` routes `/(.*)` → `/index.html`

**Option A — GitHub import (best for ongoing deploys)**
1. Open [vercel.com/new](https://vercel.com/new) and sign in with GitHub.
2. Import `nav206/zenna-the-zinnia`.
3. Deploy from `main` (after merging PR #1) or from `cursor/tend-grow-experience-a89e` for a branch preview.
4. Paste the production URL into **Live** above.

**Option B — CLI**
```bash
npx vercel login
npx vercel          # preview
npx vercel --prod   # production (once linked)
```

## Portfolio

Link or iframe this URL from the portfolio project card. Do not merge this app into the portfolio repo until both are stable.
