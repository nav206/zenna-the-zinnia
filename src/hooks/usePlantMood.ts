import { useCallback, useEffect, useState } from 'react'

export type CareActionId = 'water' | 'prune' | 'sunlight' | 'sing'

export type PlantMood = {
  hydration: number
  neatness: number
  light: number
  joy: number
  lastAction: CareActionId | null
  lastAt: number
  soundEnabled: boolean
  totalCare: number
}

const STORAGE_KEY = 'zenna-plant-mood-v1'

/** Soft floor so drift never feels punishing or hits zero. */
const DRIFT_FLOOR = 8

/**
 * Live tick while the page is open (paused when the tab is hidden).
 * Moisture / joy / neatness ease down; light follows local day/night.
 */
const TICK_MS = 6000

/**
 * Browser-local day window (weather-agnostic, no IP/geo).
 * Day: 06:00–17:59 → light drifts brighter toward a soft ceiling.
 * Night: 18:00–05:59 → light drifts dimmer toward the floor.
 */
const DAY_START_HOUR = 6
const DAY_END_HOUR = 18
const LIGHT_DAY_CEILING = 88
const LIGHT_NIGHT_FLOOR = DRIFT_FLOOR

const DEFAULT_MOOD: PlantMood = {
  hydration: 55,
  neatness: 60,
  light: 50,
  joy: 45,
  lastAction: null,
  lastAt: 0,
  soundEnabled: false,
  totalCare: 0,
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
  const step = 1 + Math.floor(Math.random() * 2) // 1–2
  if (daytime) {
    return clamp(current + step, DRIFT_FLOOR, LIGHT_DAY_CEILING)
  }
  return clamp(current - step, LIGHT_NIGHT_FLOOR, 100)
}

function readStored(): PlantMood {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_MOOD
    const parsed = JSON.parse(raw) as Partial<PlantMood>
    return {
      ...DEFAULT_MOOD,
      ...parsed,
      hydration: clamp(Number(parsed.hydration ?? DEFAULT_MOOD.hydration)),
      neatness: clamp(Number(parsed.neatness ?? DEFAULT_MOOD.neatness)),
      light: clamp(Number(parsed.light ?? DEFAULT_MOOD.light)),
      joy: clamp(Number(parsed.joy ?? DEFAULT_MOOD.joy)),
      soundEnabled: Boolean(parsed.soundEnabled),
      totalCare: Math.max(0, Number(parsed.totalCare ?? 0)),
    }
  } catch {
    return DEFAULT_MOOD
  }
}

export function moodLabel(mood: PlantMood): string {
  const avg = (mood.hydration + mood.neatness + mood.light + mood.joy) / 4
  if (avg >= 80) return 'Radiant'
  if (avg >= 65) return 'Content'
  if (avg >= 45) return 'Settling'
  return 'Thirsty'
}

export function usePlantMood() {
  const [mood, setMood] = useState<PlantMood>(DEFAULT_MOOD)
  const [hydrated, setHydrated] = useState(false)
  const [activeEffect, setActiveEffect] = useState<CareActionId | null>(null)
  const [daytime, setDaytime] = useState(() => isLocalDaytime())

  useEffect(() => {
    setMood(readStored())
    setDaytime(isLocalDaytime())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mood))
  }, [mood, hydrated])

  // Live drift: only while the tab is visible so background tabs don't punish.
  useEffect(() => {
    if (!hydrated) return

    const tick = () => {
      if (document.visibilityState !== 'visible') return
      const nowDay = isLocalDaytime()
      setDaytime(nowDay)
      setMood((prev) => {
        const drop = () => 1 + Math.floor(Math.random() * 2) // 1–2
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
  }, [hydrated])

  const clearEffect = useCallback(() => setActiveEffect(null), [])

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setMood((prev) => ({ ...prev, soundEnabled: enabled }))
  }, [])

  const tend = useCallback((action: CareActionId) => {
    setMood((prev) => {
      const next = {
        ...prev,
        lastAction: action,
        lastAt: Date.now(),
        totalCare: prev.totalCare + 1,
      }
      switch (action) {
        case 'water':
          next.hydration = clamp(prev.hydration + 18)
          next.joy = clamp(prev.joy + 4)
          next.light = clamp(prev.light - 2)
          break
        case 'prune':
          next.neatness = clamp(prev.neatness + 16)
          next.joy = clamp(prev.joy + 3)
          next.hydration = clamp(prev.hydration - 3)
          break
        case 'sunlight':
          next.light = clamp(prev.light + 18)
          next.hydration = clamp(prev.hydration - 4)
          next.joy = clamp(prev.joy + 5)
          break
        case 'sing':
          next.joy = clamp(prev.joy + 14)
          next.neatness = clamp(prev.neatness + 2)
          break
      }
      return next
    })
    setActiveEffect(action)
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
  }
}
