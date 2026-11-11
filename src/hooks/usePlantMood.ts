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

  useEffect(() => {
    setMood(readStored())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mood))
  }, [mood, hydrated])

  const clearEffect = useCallback(() => setActiveEffect(null), [])

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setMood((prev) => ({ ...prev, soundEnabled: enabled }))
  }, [])

  const tend = useCallback((action: CareActionId) => {
    setMood((prev) => {
      const next = { ...prev, lastAction: action, lastAt: Date.now(), totalCare: prev.totalCare + 1 }
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
  }
}
