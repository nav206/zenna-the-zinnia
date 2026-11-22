/** Dex / trading-card facts for Meet — concise field-guide copy. */
export type ProfileLine = {
  title: string
  detail: string
}

export const plantProfile = {
  commonName: 'Common zinnia',
  scientificName: 'Zinnia elegans',
  family: 'Asteraceae',
  order: 'Asterales',
  genus: 'Zinnia',
  origin: 'Mexico → windowsills worldwide',
  adopted: '2026-09-26',
  needs: [
    {
      title: 'To breathe',
      detail: 'soil that can drain',
    },
    {
      title: 'Daily tan',
      detail: '6–8 hrs of daily sunlight',
    },
    {
      title: 'Space',
      detail: 'cannot be crammed with other plants or zinnias',
    },
  ] as const satisfies readonly ProfileLine[],
  strengths: [
    {
      title: 'Attractive',
      detail: 'not just to humans — pollinators alike (multi-species rizz)',
    },
    {
      title: 'Comeback',
      detail: 'the more you cut it, the greater its blooms',
    },
    {
      title: 'Adaptability',
      detail: 'takes temperature, pH, soil changes like different cuisine meals',
    },
  ] as const satisfies readonly ProfileLine[],
  weaknesses: [
    {
      title: 'Salinity',
      detail: 'salt water is a no-go (no beach days for Zenna)',
    },
    {
      title: 'Sickness',
      detail: 'can get wet rot; powdery mildew on wet leaves',
    },
  ] as const satisfies readonly ProfileLine[],
  funFact: 'If I were a Pokémon, Grass would be my type.',
} as const
