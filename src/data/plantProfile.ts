/** Dex / trading-card facts for Meet — card-tight copy (no scroll). */
export type ProfileLine = {
  title: string
  detail: string
}

/** Spoken when the Tend-stage plant is clicked. */
export const PLANT_QUOTES = [
  'If I were a Pokémon, Grass would be my type.',
  'Feeling Zen? Or nah?',
  'Sun! Sun! Sun! We follow orders, sun, or plants die.',
  'Ama-zinnia-ing!!!!!',
] as const

export const plantProfile = {
  commonName: 'Common zinnia',
  scientificName: 'Zinnia elegans',
  family: 'Asteraceae',
  order: 'Asterales',
  genus: 'Zinnia',
  origin: 'Mexico → windowsills worldwide',
  adopted: '2026-09-26',
  needs: [
    { title: 'Breathe', detail: 'draining soil' },
    { title: 'Sun', detail: '6–8 hrs daily' },
    { title: 'Space', detail: 'don’t crowd other plants' },
  ] as const satisfies readonly ProfileLine[],
  strengths: [
    {
      title: 'Attractive',
      detail: 'humans + pollinators (multi-species rizz)',
    },
    { title: 'Comeback', detail: 'cut more → bloom more' },
    { title: 'Adaptability', detail: 'temp, pH, soil like cuisine' },
  ] as const satisfies readonly ProfileLine[],
  weaknesses: [
    { title: 'Salinity', detail: 'no salt water / beach days' },
    { title: 'Sickness', detail: 'wet rot; mildew on wet leaves' },
  ] as const satisfies readonly ProfileLine[],
} as const
