import { useState, type FormEvent } from 'react'
import type { ApiUser } from '../lib/api'

type AuthPanelProps = {
  user: ApiUser | null
  loading: boolean
  error: string | null
  onSignup: (input: {
    email: string
    password: string
    displayName: string
  }) => Promise<boolean>
  onLogin: (input: { email: string; password: string }) => Promise<boolean>
  onLogout: () => Promise<void>
  onClearError: () => void
}

export function AuthPanel({
  user,
  loading,
  error,
  onSignup,
  onLogin,
  onLogout,
  onClearError,
}: AuthPanelProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('signup')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)

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

  async function submit(e: FormEvent) {
    e.preventDefault()
    onClearError()
    setPending(true)
    const ok =
      mode === 'signup'
        ? await onSignup({ email, password, displayName })
        : await onLogin({ email, password })
    setPending(false)
    if (ok) {
      setPassword('')
    }
  }

  return (
    <div className="auth-panel">
      <div className="auth-panel__tabs" role="tablist" aria-label="Account">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'signup'}
          className={mode === 'signup' ? 'is-active' : ''}
          onClick={() => {
            setMode('signup')
            onClearError()
          }}
        >
          Create account
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'login'}
          className={mode === 'login' ? 'is-active' : ''}
          onClick={() => {
            setMode('login')
            onClearError()
          }}
        >
          Sign in
        </button>
      </div>

      <form className="auth-form" onSubmit={(e) => void submit(e)}>
        {mode === 'signup' && (
          <label className="auth-form__field">
            <span>Display name</span>
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
        )}
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
        <label className="auth-form__field">
          <span>Password</span>
          <input
            type="password"
            name="password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </label>
        {error && (
          <p className="auth-form__error" role="alert">
            {error}
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
              : 'Return to my plot'}
        </button>
      </form>
    </div>
  )
}
