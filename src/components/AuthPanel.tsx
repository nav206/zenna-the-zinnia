import { useEffect, useState, type FormEvent } from 'react'
import type { ApiUser } from '../lib/api'

type AuthPanelProps = {
  user: ApiUser | null
  loading: boolean
  error: string | null
  onSignup: (input: {
    email: string
    password: string
    displayName: string
    plantName: string
  }) => Promise<boolean>
  onLogin: (input: { email: string; password: string }) => Promise<boolean>
  onLogout: () => Promise<void>
  onClearError: () => void
  plantName?: string | null
  onForgotPassword?: (email: string) => Promise<{
    ok: boolean
    message: string
    resetPath?: string
  }>
  onResetPassword?: (input: {
    token: string
    password: string
  }) => Promise<boolean>
  resetToken?: string | null
  onClearResetToken?: () => void
}

type Mode = 'login' | 'signup' | 'forgot' | 'reset'

export function AuthPanel({
  user,
  loading,
  error,
  onSignup,
  onLogin,
  onLogout,
  onClearError,
  plantName: savedPlantName = null,
  onForgotPassword,
  onResetPassword,
  resetToken = null,
  onClearResetToken,
}: AuthPanelProps) {
  const [mode, setMode] = useState<Mode>(resetToken ? 'reset' : 'signup')
  const [displayName, setDisplayName] = useState('')
  const [plantName, setPlantName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [info, setInfo] = useState<string | null>(null)
  const [devResetPath, setDevResetPath] = useState<string | null>(null)

  useEffect(() => {
    if (resetToken) {
      setMode('reset')
      setInfo(null)
      setDevResetPath(null)
      onClearError()
    }
  }, [resetToken, onClearError])

  if (loading) {
    return (
      <div className="auth-panel" aria-busy="true">
        <p className="auth-panel__muted">Checking your plot…</p>
      </div>
    )
  }

  if (user) {
    return (
      <div className="auth-panel auth-panel--in">
        <p className="auth-panel__hello">
          Signed in as <strong>{user.displayName}</strong>
          {savedPlantName ? (
            <>
              {' '}
              · tending <strong>{savedPlantName}</strong>
            </>
          ) : null}
        </p>
        <button
          type="button"
          className="cta cta--ghost auth-panel__btn"
          onClick={() => void onLogout()}
        >
          Sign out
        </button>
      </div>
    )
  }

  function switchMode(next: Mode) {
    setMode(next)
    setInfo(null)
    setDevResetPath(null)
    onClearError()
    if (next !== 'reset') onClearResetToken?.()
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    onClearError()
    setInfo(null)
    setDevResetPath(null)
    setPending(true)

    if (mode === 'signup') {
      const ok = await onSignup({ email, password, displayName, plantName })
      setPending(false)
      if (ok) setPassword('')
      return
    }

    if (mode === 'login') {
      const ok = await onLogin({ email, password })
      setPending(false)
      if (ok) setPassword('')
      return
    }

    if (mode === 'forgot') {
      if (!onForgotPassword) {
        setPending(false)
        return
      }
      const res = await onForgotPassword(email)
      setPending(false)
      if (res.ok) {
        setInfo(res.message)
        if (res.resetPath) setDevResetPath(res.resetPath)
      }
      return
    }

    if (mode === 'reset') {
      if (!onResetPassword || !resetToken) {
        setPending(false)
        return
      }
      const ok = await onResetPassword({ token: resetToken, password })
      setPending(false)
      if (ok) {
        setPassword('')
        onClearResetToken?.()
      }
    }
  }

  const title =
    mode === 'signup'
      ? 'Create account'
      : mode === 'login'
        ? 'Sign in'
        : mode === 'forgot'
          ? 'Forgot password'
          : 'Choose a new password'

  return (
    <div className="auth-panel">
      {(mode === 'login' || mode === 'signup') && (
        <div className="auth-panel__tabs" role="tablist" aria-label="Account">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signup'}
            className={mode === 'signup' ? 'is-active' : ''}
            onClick={() => switchMode('signup')}
          >
            Create account
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={mode === 'login' ? 'is-active' : ''}
            onClick={() => switchMode('login')}
          >
            Sign in
          </button>
        </div>
      )}

      {(mode === 'forgot' || mode === 'reset') && (
        <p className="auth-panel__mode-title">{title}</p>
      )}

      <form className="auth-form" onSubmit={(e) => void submit(e)}>
        {mode === 'signup' && (
          <>
            <label className="auth-form__field">
              <span>Your name</span>
              <input
                name="displayName"
                autoComplete="nickname"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                minLength={2}
                maxLength={40}
              />
            </label>
            <label className="auth-form__field">
              <span>Plant name</span>
              <input
                name="plantName"
                autoComplete="off"
                placeholder="e.g. Zenna, Pepita, Sunny"
                value={plantName}
                onChange={(e) => setPlantName(e.target.value)}
                required
                minLength={2}
                maxLength={40}
              />
            </label>
          </>
        )}

        {(mode === 'signup' || mode === 'login' || mode === 'forgot') && (
          <label className="auth-form__field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
        )}

        {(mode === 'signup' || mode === 'login' || mode === 'reset') && (
          <label className="auth-form__field">
            <span>{mode === 'reset' ? 'New password' : 'Password'}</span>
            <input
              type="password"
              name="password"
              autoComplete={
                mode === 'login' ? 'current-password' : 'new-password'
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </label>
        )}

        {error && (
          <p className="auth-form__error" role="alert">
            {error}
          </p>
        )}
        {info && (
          <p className="auth-form__info" role="status">
            {info}
          </p>
        )}
        {devResetPath && (
          <p className="auth-form__info">
            Dev reset link:{' '}
            <a href={devResetPath} className="text-link">
              open reset form
            </a>
          </p>
        )}

        <button
          type="submit"
          className="cta cta--primary auth-panel__btn"
          disabled={pending}
        >
          {pending
            ? 'Growing…'
            : mode === 'signup'
              ? 'Plant my Zenna'
              : mode === 'login'
                ? 'Return to my plot'
                : mode === 'forgot'
                  ? 'Email reset link'
                  : 'Save new password'}
        </button>
      </form>

      {mode === 'login' && (
        <p className="auth-panel__links">
          <button
            type="button"
            className="text-link"
            onClick={() => switchMode('forgot')}
          >
            Forgot password?
          </button>
        </p>
      )}

      {(mode === 'forgot' || mode === 'reset') && (
        <p className="auth-panel__links">
          <button
            type="button"
            className="text-link"
            onClick={() => switchMode('login')}
          >
            Back to sign in
          </button>
        </p>
      )}
    </div>
  )
}
