import { useCallback, useEffect, useState } from 'react'
import {
  fetchMe,
  login as apiLogin,
  logout as apiLogout,
  signup as apiSignup,
  type ApiPlant,
  type ApiUser,
} from '../lib/api'

export function useAuth() {
  const [user, setUser] = useState<ApiUser | null>(null)
  const [personalPlant, setPersonalPlant] = useState<ApiPlant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    const res = await fetchMe()
    if (res.data?.user) {
      setUser(res.data.user)
      setPersonalPlant(res.data.plant ?? null)
    } else {
      setUser(null)
      setPersonalPlant(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const signup = useCallback(
    async (input: {
      email: string
      password: string
      displayName: string
    }) => {
      setError(null)
      const res = await apiSignup(input)
      if (res.error || !res.data) {
        setError(res.error || 'Signup failed.')
        return false
      }
      setUser(res.data.user)
      setPersonalPlant(res.data.plant)
      return true
    },
    [],
  )

  const login = useCallback(async (input: { email: string; password: string }) => {
    setError(null)
    const res = await apiLogin(input)
    if (res.error || !res.data) {
      setError(res.error || 'Login failed.')
      return false
    }
    setUser(res.data.user)
    setPersonalPlant(res.data.plant)
    return true
  }, [])

  const logout = useCallback(async () => {
    await apiLogout()
    setUser(null)
    setPersonalPlant(null)
  }, [])

  return {
    user,
    personalPlant,
    setPersonalPlant,
    loading,
    error,
    setError,
    signup,
    login,
    logout,
    refresh,
  }
}
