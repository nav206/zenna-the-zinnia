import { motion, useReducedMotion } from 'motion/react'
import type { ApiUser } from '../lib/api'
import type { CareActionId, PlantMood, PlantScope } from '../hooks/usePlantMood'
import { playSingChime } from '../lib/singAudio'
import { AuthPanel } from './AuthPanel'
import { PlantStage } from './PlantStage'

const ACTIONS: {
  id: CareActionId
  label: string
  hint: string
  lockedHint: string
}[] = [
  {
    id: 'water',
    label: 'Water',
    hint: 'Droplets fall; soil darkens; a happy sway.',
    lockedHint: '',
  },
  {
    id: 'prune',
    label: 'Prune',
    hint: 'A soft snip — spent leaves drift away.',
    lockedHint: 'Unlocks when your seedling reaches growing (6 care moments).',
  },
  {
    id: 'sunlight',
    label: 'Sunlight',
    hint: 'Warm wash and a stretch toward the window.',
    lockedHint: '',
  },
  {
    id: 'sing',
    label: 'Sing',
    hint: 'A quiet chime — enable sound if you want to hear it.',
    lockedHint: '',
  },
  {
    id: 'deadhead',
    label: 'Deadhead',
    hint: 'Spent blooms loosen and petal-fall — room for the next flush.',
    lockedHint: 'Unlocks at mature (12 care moments).',
  },
]

type TendSectionProps = {
  scope: PlantScope
  onScopeChange: (scope: PlantScope) => void
  mood: PlantMood
  daytime: boolean
  activeEffect: CareActionId | null
  onTend: (action: CareActionId) => void | Promise<void>
  onEffectComplete: () => void
  onSoundToggle: (enabled: boolean) => void
  apiError: string | null
  busy: boolean
  user: ApiUser | null
  authLoading: boolean
  authError: string | null
  onSignup: (input: {
    email: string
    password: string
    displayName: string
  }) => Promise<boolean>
  onLogin: (input: { email: string; password: string }) => Promise<boolean>
  onLogout: () => Promise<void>
  onClearAuthError: () => void
}

export function TendSection({
  scope,
  onScopeChange,
  mood,
  daytime,
  activeEffect,
  onTend,
  onEffectComplete,
  onSoundToggle,
  apiError,
  busy,
  user,
  authLoading,
  authError,
  onSignup,
  onLogin,
  onLogout,
  onClearAuthError,
}: TendSectionProps) {
  const reduceMotion = useReducedMotion()
  const needsAuth = scope === 'personal' && !user

  async function handleAction(id: CareActionId) {
    if (activeEffect || busy || needsAuth) return
    if (scope === 'personal' && !mood.unlockedActions.includes(id)) return
    if (id === 'sing' && mood.soundEnabled) {
      try {
        await playSingChime()
      } catch {
        // Autoplay policies — visual feedback still runs.
      }
    }
    await onTend(id)
  }

  return (
    <section className="chapter chapter--tend" id="tend" aria-labelledby="tend-title">
      <div className="tend-layout">
        <div className="chapter__inner tend-copy">
          <p className="eyebrow">Tend</p>
          <h2 id="tend-title">Now that you know her</h2>
          <p className="section-lede">
            Visitors can freely tend Global Zenna. Your own plot needs an
            account — and starts as a seedling. Water, sunlight, and song first;
            prune and deadhead unlock as she grows. Personal care also feeds
            the global garden.
          </p>

          <div className="tend-modes" role="tablist" aria-label="Which Zenna to tend">
            <button
              type="button"
              role="tab"
              aria-selected={scope === 'global'}
              className={scope === 'global' ? 'is-active' : ''}
              onClick={() => onScopeChange('global')}
            >
              Care for Global
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={scope === 'personal'}
              className={scope === 'personal' ? 'is-active' : ''}
              onClick={() => onScopeChange('personal')}
            >
              Care for Mine
            </button>
          </div>

          {scope === 'personal' && (
            <AuthPanel
              user={user}
              loading={authLoading}
              error={authError}
              onSignup={onSignup}
              onLogin={onLogin}
              onLogout={onLogout}
              onClearError={onClearAuthError}
            />
          )}

          <p className="tend-sky" aria-live="polite">
            {scope === 'global'
              ? 'Shared plot — open to every visitor'
              : user
                ? `Personal plot — ${user.displayName} · ${mood.growthStage}`
                : 'Personal plot — sign in to begin'}
            {' · '}
            {daytime ? 'Local day' : 'Local night'}
          </p>

          {!needsAuth && (
            <div className="tend-status" aria-live="polite">
              <span className="tend-status__stat">
                Care moments <strong>{mood.totalCare}</strong>
              </span>
              {scope === 'personal' && (
                <span className="tend-status__stat">
                  Stage <strong>{mood.growthStage}</strong>
                </span>
              )}
              <span className="tend-status__stat">
                Moisture <strong>{Math.round(mood.hydration)}</strong>
              </span>
              <span className="tend-status__stat">
                Neatness <strong>{Math.round(mood.neatness)}</strong>
              </span>
              <span className="tend-status__stat">
                Light <strong>{Math.round(mood.light)}</strong>
              </span>
              <span className="tend-status__stat">
                Joy <strong>{Math.round(mood.joy)}</strong>
              </span>
            </div>
          )}

          {apiError && (
            <p className="tend-error" role="alert">
              {apiError}
            </p>
          )}

          <label className="sound-toggle">
            <input
              type="checkbox"
              checked={mood.soundEnabled}
              onChange={(e) => onSoundToggle(e.target.checked)}
            />
            <span>Enable Sing sound</span>
            <em>Muted by default</em>
          </label>

          <ul className="care-actions" role="list">
            {ACTIONS.map((action, index) => {
              const locked =
                scope === 'personal' &&
                !needsAuth &&
                !mood.unlockedActions.includes(action.id)
              const disabled =
                Boolean(activeEffect) || busy || needsAuth || locked

              return (
                <li key={action.id}>
                  <motion.button
                    type="button"
                    className={`care-action care-action--live${
                      activeEffect === action.id ? ' is-active' : ''
                    }${locked ? ' is-locked' : ''}`}
                    disabled={disabled}
                    onClick={() => void handleAction(action.id)}
                    initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{
                      duration: 0.45,
                      delay: reduceMotion ? 0 : index * 0.05,
                    }}
                    whileTap={
                      reduceMotion || locked ? undefined : { scale: 0.98 }
                    }
                  >
                    <span className="care-action__label">
                      {action.label}
                      {locked ? ' · locked' : ''}
                    </span>
                    <span className="care-action__hint">
                      {locked ? action.lockedHint : action.hint}
                    </span>
                  </motion.button>
                </li>
              )
            })}
          </ul>
        </div>

        <PlantStage
          mood={needsAuth ? undefined : mood}
          activeEffect={activeEffect}
          onEffectComplete={onEffectComplete}
          compact
        />
      </div>
    </section>
  )
}
