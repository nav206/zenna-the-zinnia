export const CARE_ACTIONS = [
  'water',
  'prune',
  'sunlight',
  'sing',
  'deadhead',
] as const

export type CareAction = (typeof CARE_ACTIONS)[number]

export type GrowthStage = 'seedling' | 'growing' | 'mature'

export type MoodStats = {
  hydration: number
  neatness: number
  light: number
  joy: number
  totalCare: number
}

/** Care moments needed to leave seedling (unlocks prune). */
export const GROWING_AT = 6
/** Care moments needed to reach mature (unlocks deadhead). */
export const MATURE_AT = 12

const DRIFT_FLOOR = 8

export function clamp(n: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, n))
}

export function stageFromCare(totalCare: number): GrowthStage {
  if (totalCare >= MATURE_AT) return 'mature'
  if (totalCare >= GROWING_AT) return 'growing'
  return 'seedling'
}

export function actionsForStage(stage: GrowthStage): CareAction[] {
  switch (stage) {
    case 'seedling':
      return ['water', 'sunlight', 'sing']
    case 'growing':
      return ['water', 'sunlight', 'sing', 'prune']
    case 'mature':
      return [...CARE_ACTIONS]
  }
}

export function isActionUnlocked(
  stage: GrowthStage,
  action: CareAction,
): boolean {
  return actionsForStage(stage).includes(action)
}

export function unlockHint(action: CareAction, stage: GrowthStage): string | null {
  if (isActionUnlocked(stage, action)) return null
  if (action === 'prune') {
    return `Prune unlocks at growing (${GROWING_AT} care moments).`
  }
  if (action === 'deadhead') {
    return `Deadhead unlocks at mature (${MATURE_AT} care moments).`
  }
  return 'This care action is not available yet.'
}

export function applyCare(mood: MoodStats, action: CareAction): MoodStats {
  const next = {
    ...mood,
    totalCare: mood.totalCare + 1,
  }
  switch (action) {
    case 'water':
      next.hydration = clamp(mood.hydration + 18)
      next.joy = clamp(mood.joy + 4)
      next.light = clamp(mood.light - 2)
      break
    case 'prune':
      next.neatness = clamp(mood.neatness + 16)
      next.joy = clamp(mood.joy + 3)
      next.hydration = clamp(mood.hydration - 3)
      break
    case 'sunlight':
      next.light = clamp(mood.light + 18)
      next.hydration = clamp(mood.hydration - 4)
      next.joy = clamp(mood.joy + 5)
      break
    case 'sing':
      next.joy = clamp(mood.joy + 14)
      next.neatness = clamp(mood.neatness + 2)
      break
    case 'deadhead':
      next.neatness = clamp(mood.neatness + 14)
      next.joy = clamp(mood.joy + 8)
      next.hydration = clamp(mood.hydration - 2)
      break
  }
  return next
}

export function softFloor(mood: MoodStats): MoodStats {
  return {
    hydration: clamp(mood.hydration, DRIFT_FLOOR, 100),
    neatness: clamp(mood.neatness, DRIFT_FLOOR, 100),
    light: clamp(mood.light, DRIFT_FLOOR, 100),
    joy: clamp(mood.joy, DRIFT_FLOOR, 100),
    totalCare: Math.max(0, mood.totalCare),
  }
}

export function isCareAction(value: string): value is CareAction {
  return (CARE_ACTIONS as readonly string[]).includes(value)
}

/** Softer starting mood for a brand-new personal seedling. */
export const SEEDLING_DEFAULTS: MoodStats = {
  hydration: 42,
  neatness: 48,
  light: 44,
  joy: 40,
  totalCare: 0,
}
