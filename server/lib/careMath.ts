export const CARE_ACTIONS = [
  'water',
  'prune',
  'sunlight',
  'sing',
  'deadhead',
] as const

export type CareAction = (typeof CARE_ACTIONS)[number]

export type MoodStats = {
  hydration: number
  neatness: number
  light: number
  joy: number
  totalCare: number
}

const DRIFT_FLOOR = 8

export function clamp(n: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, n))
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
