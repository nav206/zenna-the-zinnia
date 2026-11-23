export type CareActionId =
  | 'water'
  | 'prune'
  | 'sunlight'
  | 'sing'
  | 'deadhead'

export type PlantScope = 'global' | 'personal'

export type GrowthStage = 'seedling' | 'growing' | 'mature'

export type ApiPlant = {
  id: string
  scope: PlantScope
  hydration: number
  neatness: number
  light: number
  joy: number
  totalCare: number
  growthStage: GrowthStage
  unlockedActions: CareActionId[]
  plantName: string | null
  updatedAt: string
}

export type ApiUser = {
  id: string
  email: string
  displayName: string
}

export type RootsStats = {
  signupCount: number
  globalCareEvents: number
  personalCareEvents: number
}

export type CompeteStats = {
  global: ApiPlant
  personal: ApiPlant | null
  totals: {
    globalCareEvents: number
    personalCareEvents: number
  }
  user: ApiUser | null
}

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<{ data?: T; error?: string; status: number }> {
  try {
    const res = await fetch(path, {
      credentials: 'include',
      headers: {
        'content-type': 'application/json',
        ...(init?.headers ?? {}),
      },
      ...init,
    })
    const json = (await res.json().catch(() => ({}))) as T & { error?: string }
    if (!res.ok) {
      return {
        error: json.error || `Request failed (${res.status})`,
        status: res.status,
      }
    }
    return { data: json, status: res.status }
  } catch {
    return { error: 'Could not reach the garden API.', status: 0 }
  }
}

export function fetchMe() {
  return request<{
    user: ApiUser | null
    plant?: ApiPlant
    achievements?: string[]
  }>('/api/me')
}

export function signup(input: {
  email: string
  password: string
  displayName: string
  plantName: string
}) {
  return request<{
    user: ApiUser
    plant: ApiPlant
    achievements?: string[]
    signupCount: number
  }>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function login(input: { email: string; password: string }) {
  return request<{
    user: ApiUser
    plant: ApiPlant
    achievements?: string[]
  }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function syncAchievements(ids: string[]) {
  return request<{ achievements: string[] }>('/api/achievements', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  })
}

export function logout() {
  return request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' })
}

export function forgotPassword(email: string) {
  return request<{ ok: boolean; message: string; resetPath?: string }>(
    '/api/auth/forgot-password',
    {
      method: 'POST',
      body: JSON.stringify({ email }),
    },
  )
}

export function resetPassword(input: { token: string; password: string }) {
  return request<{
    ok: boolean
    user: ApiUser
    plant: ApiPlant
    achievements?: string[]
  }>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function fetchGlobalPlant() {
  return request<{ plant: ApiPlant }>('/api/plants/global')
}

export function fetchPersonalPlant() {
  return request<{ plant: ApiPlant }>('/api/plants/personal')
}

export function postCare(scope: PlantScope, action: CareActionId) {
  return request<{ plant: ApiPlant; global?: ApiPlant }>('/api/care', {
    method: 'POST',
    body: JSON.stringify({ scope, action }),
  })
}

export function fetchRootsStats() {
  return request<RootsStats>('/api/stats/roots')
}

export function fetchCompeteStats() {
  return request<CompeteStats>('/api/stats/compete')
}
