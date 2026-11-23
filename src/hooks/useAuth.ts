import { useCallback, useEffect, useState } from 'react'
import {
  fetchMe,
  forgotPassword as apiForgotPassword,
  login as apiLogin,
  logout as apiLogout,
  resetPassword as apiResetPassword,
  signup as apiSignup,
  type ApiPlant,
  type ApiUser,
} from '../lib/api'

export function useAuth() {
  const [user, setUser] = useState<ApiUser | null>(null)
  const [personalPlant, setPersonalPlant] = useState<ApiPlant | null>(null)
  const [achievements, setAchievements] = useState<string[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    const res = await fetchMe()
    if (res.data?.user) {
      setUser(res.data.user)
      setPersonalPlant(res.data.plant ?? null)
      setAchievements(res.data.achievements ?? [])
    } else {
      setUser(null)
      setPersonalPlant(null)
      setAchievements(null)
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
      plantName: string
    }) => {
      setError(null)
      const res = await apiSignup(input)
      if (res.error || !res.data) {
        setError(res.error || 'Signup failed.')
        return false
      }
      setUser(res.data.user)
      setPersonalPlant(res.data.plant)
      setAchievements(res.data.achievements ?? [])
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
    setAchievements(res.data.achievements ?? [])
    return true
  }, [])

  const logout = useCallback(async () => {
    await apiLogout()
    setUser(null)
    setPersonalPlant(null)
    setAchievements(null)
  }, [])

  const forgotPassword = useCallback(async (email: string) => {
    setError(null)
    const res = await apiForgotPassword(email)
    if (res.error || !res.data) {
      setError(res.error || 'Could not start password reset.')
      return { ok: false as const, message: res.error || 'Could not start password reset.' }
    }
    return {
      ok: true as const,
      message: res.data.message,
      resetPath: res.data.resetPath,
    }
  }, [])

  const resetPassword = useCallback(
    async (input: { token: string; password: string }) => {
      setError(null)
      const res = await apiResetPassword(input)
      if (res.error || !res.data) {
        setError(res.error || 'Could not reset password.')
        return false
      }
      setUser(res.data.user)
      setPersonalPlant(res.data.plant)
      setAchievements(res.data.achievements ?? [])
      return true
    },
    [],
  )

  return {
    user,
    personalPlant,
    setPersonalPlant,
    achievements,
    loading,
    error,
    setError,
    signup,
    login,
    logout,
    forgotPassword,
    resetPassword,
    refresh,
  }
}
