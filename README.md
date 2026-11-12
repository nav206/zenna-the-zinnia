# Zenna, the Zinnia

A pet project. An interactive web experience tracking the growth of Zenna — an adopted zinnia — with a same-page care mini-game (water, prune, sunlight, sing) and a creative growth story.

**Live:** _(URL after first deploy)_  
**Standalone site** — also featured from the portfolio when that ships.

## Stack

- Vite + React + TypeScript
- [Motion](https://motion.dev/) for care feedback and stage presence
- Authored illustrations / sketches under `src/assets/illustrations/` (not cheap polygon plant art)
- Growth diary as versioned JSON (`src/data/growth.json`)

## Page spine

One composition, three chapters on a single page (not a navbar of widgets):

1. **Meet** — brand-first hero + plant stage
2. **Tend** — care mini-game actions (scaffold; feedback next)
3. **Grow** — weekly diary driven by JSON (creative viz next)

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

## Project layout

```text
src/
  components/     Meet, Tend, Grow, PlantStage
  data/growth.json
  assets/illustrations/   authored plant art goes here
  types/growth.ts
public/
  photos/         optional week photos (week-01.jpg, …)
```

## Add a week of growth

Edit `src/data/growth.json`. Each entry:

```json
{
  "week": 1,
  "date": "2026-11-03",
  "heightCm": 12,
  "note": "First true leaves after the move indoors.",
  "photo": "/photos/week-01.jpg"
}
```

Commit the data (and optional photo under `public/photos/`). Redeploy.

## Care actions (mini-game)

| Action | Feedback idea |
| --- | --- |
| Water | Droplets, soil darkens, happy sway |
| Prune | Snip + leaf fall, cleaner silhouette |
| Sunlight | Warm wash / ray drift, stretch toward light |
| Sing | Opt-in audio + rhythmic petal/leaf pulse |

Plant mood is local (browser); diary growth is the real record. Sing stays muted / opt-in.

## Deploy

Any static host (Vercel, Netlify, Cloudflare Pages). Build command: `npm run build`. Output: `dist/`.

## Portfolio

Link or iframe this URL from the portfolio project card. Do not merge this app into the portfolio repo until both are stable.
