export const ACHIEVEMENT_IDS = [
  'herb_hugger',
  'green_thumb',
  'night_light',
  'bounty_hunter',
  'hands_muddy',
  'dedicated',
  'farmer_philanthropist',
] as const

export type AchievementId = (typeof ACHIEVEMENT_IDS)[number]

export type AchievementDef = {
  id: AchievementId
  title: string
  description: string
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'herb_hugger',
    title: 'Herb Hugger',
    description: 'Care for a plant 3 times.',
  },
  {
    id: 'green_thumb',
    title: 'Green Thumb',
    description: 'Watch a seed grow into a mature plant.',
  },
  {
    id: 'night_light',
    title: 'Night Light',
    description: 'Use sunlight during local night.',
  },
  {
    id: 'bounty_hunter',
    title: 'Bounty Hunter',
    description: 'Find both easter eggs: flip the portrait and the roots trick.',
  },
  {
    id: 'hands_muddy',
    title: 'Getting Hands Muddy',
    description: 'Take 100 care actions.',
  },
  {
    id: 'dedicated',
    title: 'Dedicated',
    description: 'Take 1,000 care actions.',
  },
  {
    id: 'farmer_philanthropist',
    title: 'Farmer & Philanthropist',
    description: 'Support the garden via Buy Me a Hot Chocolate.',
  },
]

export const ACHIEVEMENT_BY_ID = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a]),
) as Record<AchievementId, AchievementDef>

export function isAchievementId(id: string): id is AchievementId {
  return (ACHIEVEMENT_IDS as readonly string[]).includes(id)
}
