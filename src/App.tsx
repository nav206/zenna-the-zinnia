import { useCallback, useEffect, useRef, useState } from 'react'
import { CompeteSection } from './components/CompeteSection'
import { EggToast } from './components/EggToast'
import { FooterRoots } from './components/FooterRoots'
import { GrowSection } from './components/GrowSection'
import { MeetSection } from './components/MeetSection'
import { SourcesSection } from './components/SourcesSection'
import { TendSection } from './components/TendSection'
import { useAuth } from './hooks/useAuth'
import { usePlantMood, type PlantScope } from './hooks/usePlantMood'
import {
  observeSectionViews,
  trackAuth,
  trackCareAction,
  trackCtaClick,
  trackScopeChange,
  trackSoundToggle,
} from './lib/analytics'
import { fetchCompeteStats, type ApiPlant } from './lib/api'

const SESSION_CARE_KEY = 'zenna-session-care-v1'

function readSessionCare() {
  try {
    const raw = sessionStorage.getItem(SESSION_CARE_KEY)
    const n = raw ? Number(raw) : 0
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
  } catch {
    return 0
  }
}

function writeSessionCare(n: number) {
  try {
    sessionStorage.setItem(SESSION_CARE_KEY, String(n))
  } catch {
    // ignore
  }
}

export default function App() {
  const [scope, setScope] = useState<PlantScope>('global')
  const [rootsKey, setRootsKey] = useState(0)
  const [globalSnapshot, setGlobalSnapshot] = useState<ApiPlant | null>(null)
  const [sessionCare, setSessionCare] = useState(() => readSessionCare())
  const [eggMessage, setEggMessage] = useState<string | null>(null)
  const eggTimer = useRef<number | null>(null)
  const auth = useAuth()

  const plant = usePlantMood({
    scope,
    authed: Boolean(auth.user),
  })

  const setPersonalPlant = auth.setPersonalPlant

  const showEgg = useCallback((message: string) => {
    setEggMessage(message)
    if (eggTimer.current) window.clearTimeout(eggTimer.current)
    eggTimer.current = window.setTimeout(() => setEggMessage(null), 4200)
  }, [])

  const refreshCompete = useCallback(async () => {
    const res = await fetchCompeteStats()
    if (!res.data) return
    setGlobalSnapshot(res.data.global)
    if (res.data.personal) setPersonalPlant(res.data.personal)
  }, [setPersonalPlant])

  useEffect(() => {
    void refreshCompete()
  }, [refreshCompete, auth.user?.id])

  useEffect(() => {
    return observeSectionViews([
      'meet',
      'grow',
      'compete',
      'tend',
      'sources',
      'roots',
    ])
  }, [])

  useEffect(() => {
    if (scope !== 'global' || !plant.hydrated || plant.apiError) return
    setGlobalSnapshot({
      id: 'global',
      scope: 'global',
      hydration: plant.mood.hydration,
      neatness: plant.mood.neatness,
      light: plant.mood.light,
      joy: plant.mood.joy,
      totalCare: plant.mood.totalCare,
      growthStage: 'mature',
      unlockedActions: plant.mood.unlockedActions,
      updatedAt: new Date().toISOString(),
    })
  }, [
    scope,
    plant.hydrated,
    plant.apiError,
    plant.mood.hydration,
    plant.mood.neatness,
    plant.mood.light,
    plant.mood.joy,
    plant.mood.totalCare,
    plant.mood.unlockedActions,
  ])

  const handleScopeChange = (next: PlantScope) => {
    setScope(next)
    plant.setApiError(null)
    trackScopeChange(next)
  }

  const handleSignup = async (input: {
    email: string
    password: string
    displayName: string
  }) => {
    const ok = await auth.signup(input)
    if (ok) {
      trackAuth('signup')
      setScope('personal')
      setRootsKey((k) => k + 1)
      await plant.reload()
      await refreshCompete()
    }
    return ok
  }

  const handleLogin = async (input: { email: string; password: string }) => {
    const ok = await auth.login(input)
    if (ok) {
      trackAuth('login')
      setScope('personal')
      await plant.reload()
      await refreshCompete()
    }
    return ok
  }

  const handleCompete = () => {
    trackCtaClick('compete_against_me', '#tend')
    setScope('personal')
    document.getElementById('tend')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleJoin = () => {
    setScope('personal')
    document.getElementById('tend')?.scrollIntoView({ behavior: 'smooth' })
  }

  const yourCareMoments = auth.user
    ? (auth.personalPlant?.totalCare ??
      (scope === 'personal' ? plant.mood.totalCare : 0))
    : sessionCare

  return (
    <main className="story">
      <MeetSection
        mood={plant.mood}
        activeEffect={plant.activeEffect}
        onEgg={showEgg}
      />
      <GrowSection />
      <CompeteSection
        user={auth.user}
        globalPlant={globalSnapshot}
        personalPlant={auth.personalPlant}
        onCompete={handleCompete}
      />
      <TendSection
        scope={scope}
        onScopeChange={handleScopeChange}
        mood={plant.mood}
        daytime={plant.daytime}
        activeEffect={plant.activeEffect}
        yourCareMoments={yourCareMoments}
        onTend={async (action) => {
          const ok = await plant.tend(action)
          if (!ok) return
          // Guests: count this browser’s care toward “Your care”.
          if (!auth.user) {
            setSessionCare((c) => {
              const next = c + 1
              writeSessionCare(next)
              return next
            })
          }
          trackCareAction(action, scope)
          await refreshCompete()
        }}
        onEffectComplete={plant.clearEffect}
        onSoundToggle={(enabled) => {
          plant.setSoundEnabled(enabled)
          trackSoundToggle(enabled)
        }}
        apiError={plant.apiError}
        busy={plant.busy}
        user={auth.user}
        authLoading={auth.loading}
        authError={auth.error}
        onSignup={handleSignup}
        onLogin={handleLogin}
        onLogout={async () => {
          await auth.logout()
          trackAuth('logout')
          setScope('global')
          await plant.reload()
          await refreshCompete()
        }}
        onClearAuthError={() => auth.setError(null)}
      />
      <SourcesSection />
      <FooterRoots
        refreshKey={rootsKey}
        onJoin={handleJoin}
        onEgg={showEgg}
      />
      <EggToast message={eggMessage} />
    </main>
  )
}
