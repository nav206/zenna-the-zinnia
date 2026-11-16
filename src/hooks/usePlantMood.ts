import { useCallback, useEffect, useState } from 'react'
import {
  fetchGlobalPlant,
  fetchPersonalPlant,
  postCare,
  type ApiPlant,
  type CareActionId,
  type GrowthStage,
  type PlantScope,
} from '../lib/api'

export type { CareActionId, GrowthStage, PlantScope }

export type PlantMood = {
  hydration: number
  neatness: number
  light: number
  joy: number
  lastAction: CareActionId | null
  lastAt: number
  soundEnabled: boolean
  totalCare: number
  growthStage: GrowthStage
  unlockedActions: CareActionId[]
}

const SOUND_KEY = 'zenna-sound-enabled-v2'
const DRIFT_FLOOR = 8
const TICK_MS = 12000
const DAY_START_HOUR = 6
const DAY_END_HOUR = 18
const LIGHT_DAY_CEILING = 88
const LIGHT_NIGHT_FLOOR = DRIFT_FLOOR

const ALL_ACTIONS: CareActionId[] = [
  'water',
  'prune',
  'sunlight',
  'sing',
  'deadhead',
]

const DEFAULT_MOOD: PlantMood = {
  hydration: 55,
  neatness: 60,
  light: 50,
  joy: 45,
  lastAction: null,
  lastAt: 0,
  soundEnabled: false,
  totalCare: 0,
  growthStage: 'mature',
  unlockedActions: ALL_ACTIONS,
}

const SEEDLING_MOOD: PlantMood = {
  ...DEFAULT_MOOD,
  hydration: 42,
  neatness: 48,
  light: 44,
  joy: 40,
  growthStage: 'seedling',
  unlockedActions: ['water', 'sunlight', 'sing'],
}

function clamp(n: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, n))
}

function driftDown(value: number, amount: number) {
  return clamp(value - amount, DRIFT_FLOOR, 100)
}

export function isLocalDaytime(date = new Date()) {
  const hour = date.getHours()
  return hour >= DAY_START_HOUR && hour < DAY_END_HOUR
}

function lightStep(current: number, daytime: boolean) {
  const step = 1 + Math.floor(Math.random() * 2)
  if (daytime) {
    return clamp(current + step, DRIFT_FLOOR, LIGHT_DAY_CEILING)
  }
  return clamp(current - step, LIGHT_NIGHT_FLOOR, 100)
}

function fromApi(plant: ApiPlant, soundEnabled: boolean, prev?: PlantMood): PlantMood {
  return {
    hydration: plant.hydration,
    neatness: plant.neatness,
    light: plant.light,
    joy: plant.joy,
    totalCare: plant.totalCare,
    growthStage: plant.growthStage,
    unlockedActions: plant.unlockedActions?.length
      ? plant.unlockedActions
      : ALL_ACTIONS,
    soundEnabled,
    lastAction: prev?.lastAction ?? null,
    lastAt: prev?.lastAt ?? 0,
  }
}

export function moodLabel(mood: PlantMood): string {
  if (mood.growthStage === 'seedling') return 'Seedling'
  if (mood.growthStage === 'growing') return 'Growing'
  const avg = (mood.hydration + mood.neatness + mood.light + mood.joy) / 4
  if (avg >= 80) return 'Radiant'
  if (avg >= 65) return 'Content'
  if (avg >= 45) return 'Settling'
  return 'Thirsty'
}

export function usePlantMood(opts: {
  scope: PlantScope
  authed: boolean
}) {
  const [mood, setMood] = useState<PlantMood>(
    opts.scope === 'personal' ? SEEDLING_MOOD : DEFAULT_MOOD,
  )
  const [hydrated, setHydrated] = useState(false)
  const [activeEffect, setActiveEffect] = useState<CareActionId | null>(null)
  const [daytime, setDaytime] = useState(() => isLocalDaytime())
  const [apiError, setApiError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setApiError(null)
    let soundEnabled = false
    try {
      soundEnabled = localStorage.getItem(SOUND_KEY) === '1'
    } catch {
      soundEnabled = false
    }

    if (opts.scope === 'personal' && !opts.authed) {
      setMood((prev) => ({
        ...SEEDLING_MOOD,
        soundEnabled,
        lastAction: prev.lastAction,
        lastAt: prev.lastAt,
      }))
      setHydrated(true)
      return
    }

    const res =
      opts.scope === 'global'
        ? await fetchGlobalPlant()
        : await fetchPersonalPlant()

    if (res.error || !res.data) {
      setApiError(res.error || 'Could not load plant.')
      setMood({
        ...(opts.scope === 'personal' ? SEEDLING_MOOD : DEFAULT_MOOD),
        soundEnabled,
      })
      setHydrated(true)
      return
    }

    setMood((prev) => fromApi(res.data!.plant, soundEnabled, prev))
    setHydrated(true)
  }, [opts.authed, opts.scope])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(SOUND_KEY, mood.soundEnabled ? '1' : '0')
    } catch {
      // ignore
    }
  }, [mood.soundEnabled, hydrated])

  useEffect(() => {
    if (!hydrated) return
    if (opts.scope === 'personal' && !opts.authed) return

    const tick = () => {
      if (document.visibilityState !== 'visible') return
      const nowDay = isLocalDaytime()
      setDaytime(nowDay)
      setMood((prev) => {
        const drop = () => 1 + Math.floor(Math.random() * 2)
        return {
          ...prev,
          hydration: driftDown(prev.hydration, drop()),
          neatness: driftDown(prev.neatness, drop()),
          joy: driftDown(prev.joy, drop()),
          light: lightStep(prev.light, nowDay),
        }
      })
    }

    const id = window.setInterval(tick, TICK_MS)
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        setDaytime(isLocalDaytime())
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [hydrated, opts.authed, opts.scope])

  const clearEffect = useCallback(() => setActiveEffect(null), [])

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setMood((prev) => ({ ...prev, soundEnabled: enabled }))
  }, [])

  const tend = useCallback(
    async (action: CareActionId) => {
      if (busy || activeEffect) return
      if (opts.scope === 'personal' && !opts.authed) {
        setApiError('Sign in to tend your own Zenna.')
        return
      }
      if (
        opts.scope === 'personal' &&
        !mood.unlockedActions.includes(action)
      ) {
        setApiError('Your plant needs to grow before that care action.')
        return
      }
      setBusy(true)
      setApiError(null)
      const res = await postCare(opts.scope, action)
      setBusy(false)
      if (res.error || !res.data) {
        setApiError(res.error || 'Care action failed.')
        return
      }
      setMood((prev) => ({
        ...fromApi(res.data!.plant, prev.soundEnabled, prev),
        lastAction: action,
        lastAt: Date.now(),
      }))
      setActiveEffect(action)
    },
    [
      activeEffect,
      busy,
      mood.unlockedActions,
      opts.authed,
      opts.scope,
    ],
  )

  const applyExternalPlant = useCallback((plant: ApiPlant) => {
    setMood((prev) => fromApi(plant, prev.soundEnabled, prev))
  }, [])

  return {
    mood,
    hydrated,
    activeEffect,
    clearEffect,
    tend,
    setSoundEnabled,
    label: moodLabel(mood),
    daytime,
    apiError,
    setApiError,
    busy,
    reload: load,
    applyExternalPlant,
  }
}
