import { useCallback, useEffect, useState } from 'react'
import { CompeteSection } from './components/CompeteSection'
import { FooterRoots } from './components/FooterRoots'
import { GrowSection } from './components/GrowSection'
import { MeetSection } from './components/MeetSection'
import { TendSection } from './components/TendSection'
import { useAuth } from './hooks/useAuth'
import { usePlantMood, type PlantScope } from './hooks/usePlantMood'
import { fetchCompeteStats, type ApiPlant } from './lib/api'

export default function App() {
  const [scope, setScope] = useState<PlantScope>('global')
  const [rootsKey, setRootsKey] = useState(0)
  const [globalSnapshot, setGlobalSnapshot] = useState<ApiPlant | null>(null)
  const auth = useAuth()

  const plant = usePlantMood({
    scope,
    authed: Boolean(auth.user),
  })

  const setPersonalPlant = auth.setPersonalPlant

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
    if (scope !== 'global' || !plant.hydrated || plant.apiError) return
    setGlobalSnapshot({
      id: 'global',
      scope: 'global',
      hydration: plant.mood.hydration,
      neatness: plant.mood.neatness,
      light: plant.mood.light,
      joy: plant.mood.joy,
      totalCare: plant.mood.totalCare,
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
  ])

  const handleScopeChange = (next: PlantScope) => {
    setScope(next)
    plant.setApiError(null)
  }

  const handleSignup = async (input: {
    email: string
    password: string
    displayName: string
  }) => {
    const ok = await auth.signup(input)
    if (ok) {
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
      setScope('personal')
      await plant.reload()
      await refreshCompete()
    }
    return ok
  }

  const handleCompete = () => {
    setScope('personal')
    document.getElementById('tend')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className="story">
      <MeetSection mood={plant.mood} activeEffect={plant.activeEffect} />
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
        onTend={async (action) => {
          await plant.tend(action)
          await refreshCompete()
        }}
        onEffectComplete={plant.clearEffect}
        onSoundToggle={plant.setSoundEnabled}
        apiError={plant.apiError}
        busy={plant.busy}
        user={auth.user}
        authLoading={auth.loading}
        authError={auth.error}
        onSignup={handleSignup}
        onLogin={handleLogin}
        onLogout={async () => {
          await auth.logout()
          setScope('global')
          await plant.reload()
          await refreshCompete()
        }}
        onClearAuthError={() => auth.setError(null)}
      />
      <FooterRoots refreshKey={rootsKey} />
    </main>
  )
}
