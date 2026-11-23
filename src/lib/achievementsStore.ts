import {
  ACHIEVEMENT_IDS,
  isAchievementId,
  type AchievementId,
} from '../data/achievements'

const UNLOCKED_KEY = 'zenna-achievements-v1'
const EGGS_KEY = 'zenna-eggs-v1'
const LIFETIME_CARE_KEY = 'zenna-lifetime-care-v1'

export type EggId = 'flip_portrait' | 'plant_quotes' | 'roots'

const EGG_IDS: EggId[] = ['flip_portrait', 'plant_quotes', 'roots']

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore quota / private mode
  }
}

export function readUnlocked(): AchievementId[] {
  const raw = readJson<string[]>(UNLOCKED_KEY, [])
  return raw.filter(isAchievementId)
}

export function writeUnlocked(ids: AchievementId[]) {
  const unique = [...new Set(ids.filter(isAchievementId))]
  writeJson(UNLOCKED_KEY, unique)
}

export function mergeUnlocked(ids: AchievementId[]): AchievementId[] {
  const next = [...new Set([...readUnlocked(), ...ids])]
  writeUnlocked(next)
  return next
}

export function readEggs(): EggId[] {
  const raw = readJson<string[]>(EGGS_KEY, [])
  return raw.filter((e): e is EggId => (EGG_IDS as string[]).includes(e))
}

export function markEgg(egg: EggId): EggId[] {
  const next = [...new Set([...readEggs(), egg])]
  writeJson(EGGS_KEY, next)
  return next
}

export function allEggsFound(eggs: EggId[]) {
  return EGG_IDS.every((id) => eggs.includes(id))
}

export function readLifetimeCare(): number {
  try {
    const n = Number(localStorage.getItem(LIFETIME_CARE_KEY) || 0)
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
  } catch {
    return 0
  }
}

export function bumpLifetimeCare(by = 1): number {
  const next = readLifetimeCare() + by
  try {
    localStorage.setItem(LIFETIME_CARE_KEY, String(next))
  } catch {
    // ignore
  }
  return next
}

export function allAchievementIds(): AchievementId[] {
  return [...ACHIEVEMENT_IDS]
}
