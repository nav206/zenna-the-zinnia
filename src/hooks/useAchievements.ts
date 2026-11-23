import { useCallback, useEffect, useState } from 'react'
import {
  ACHIEVEMENT_BY_ID,
  isAchievementId,
  type AchievementId,
} from '../data/achievements'
import { syncAchievements } from '../lib/api'
import {
  allEggsFound,
  bumpLifetimeCare,
  markEgg,
  mergeUnlocked,
  readEggs,
  readLifetimeCare,
  readUnlocked,
  type EggId,
} from '../lib/achievementsStore'

type UnlockToast = (message: string) => void

function toastFor(ids: AchievementId[], onToast?: UnlockToast) {
  if (!onToast || !ids.length) return
  if (ids.length === 1) {
    const def = ACHIEVEMENT_BY_ID[ids[0]]
    onToast(`Achievement unlocked: ${def.title}`)
    return
  }
  onToast(`Achievements unlocked: ${ids.map((id) => ACHIEVEMENT_BY_ID[id].title).join(', ')}`)
}

export function useAchievements(opts: {
  authed: boolean
  serverIds?: string[] | null
  onToast?: UnlockToast
}) {
  const [unlocked, setUnlocked] = useState<AchievementId[]>(() => readUnlocked())
  const [eggs, setEggs] = useState<EggId[]>(() => readEggs())
  const [lifetimeCare, setLifetimeCare] = useState(() => readLifetimeCare())

  useEffect(() => {
    if (!opts.serverIds) return
    const server = opts.serverIds.filter(isAchievementId)
    if (!server.length && !opts.authed) return
    const merged = mergeUnlocked(server)
    setUnlocked(merged)
    if (opts.authed) {
      void syncAchievements(merged)
    }
  }, [opts.authed, opts.serverIds])

  const unlock = useCallback(
    (ids: AchievementId[]) => {
      if (!ids.length) return
      const before = new Set(readUnlocked())
      const merged = mergeUnlocked(ids)
      setUnlocked(merged)
      const fresh = ids.filter((id) => !before.has(id))
      toastFor(fresh, opts.onToast)
      if (opts.authed) {
        void syncAchievements(merged)
      }
    },
    [opts.authed, opts.onToast],
  )

  const noteEgg = useCallback(
    (egg: EggId) => {
      const nextEggs = markEgg(egg)
      setEggs(nextEggs)
      if (allEggsFound(nextEggs)) {
        unlock(['bounty_hunter'])
      }
    },
    [unlock],
  )

  const noteCare = useCallback(
    (input: {
      action: string
      daytime: boolean
      personalStage?: string | null
      personalTotalCare?: number | null
    }) => {
      const nextCare = bumpLifetimeCare(1)
      setLifetimeCare(nextCare)

      const careCount = Math.max(nextCare, input.personalTotalCare ?? 0)
      const next: AchievementId[] = []
      if (careCount >= 3) next.push('herb_hugger')
      if (careCount >= 100) next.push('hands_muddy')
      if (careCount >= 1000) next.push('dedicated')
      if (input.action === 'sunlight' && !input.daytime) next.push('night_light')
      if (input.personalStage === 'mature') next.push('green_thumb')
      unlock(next)
    },
    [unlock],
  )

  const noteDonation = useCallback(() => {
    unlock(['farmer_philanthropist'])
  }, [unlock])

  return {
    unlocked,
    eggs,
    lifetimeCare,
    noteEgg,
    noteCare,
    noteDonation,
    unlock,
  }
}
