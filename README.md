# Zenna, the Zinnia

An interactive web experience tracking the growth of Zenna — an adopted zinnia — with a same-page care mini-game (water, prune, sunlight, sing) and a creative growth story.

**Live:** _(URL after first deploy)_  
**Standalone site** — also featured from the portfolio when that ships.

## Stack

- Vite + React + TypeScript
- [Motion](https://motion.dev/) for care feedback and stage presence
- Illustrated plant art under `src/assets/illustrations/` (authored / generated placeholders — not cheap polygon plant figures)
- Growth diary as versioned JSON (`src/data/growth.json`)

## Page spine

One composition, three chapters on a single page (not a navbar of widgets):

1. **Meet** — brand-first hero + plant stage
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

1. Land on **Meet**, then scroll to **Grow** (or use “Watch her grow”).
2. Read the week-by-week stem story — data and diary first.
3. Continue to **Tend** (or use “Tend Zenna”) — tap **Water**, **Prune**, or **Sunlight**.
4. While you stay, moisture / joy / neatness ease down slowly; light follows your browser’s local day (brighter) or night (softer). Hidden tabs pause.
5. **Sing** is visual by default. Check **Enable Sing sound** for a soft Web Audio chime (opt-in).
6. Mood stats persist in this browser via `localStorage`.

## Project layout

```text
src/
  components/     Meet, Tend, Grow, PlantStage
  hooks/          usePlantMood (localStorage)
  lib/            singAudio (opt-in Web Audio)
  data/growth.json
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

## Deploy

Any static host (Vercel, Netlify, Cloudflare Pages). Build command: `npm run build`. Output: `dist/`.

## Portfolio

Link or iframe this URL from the portfolio project card. Do not merge this app into the portfolio repo until both are stable.
