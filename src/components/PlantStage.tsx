import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect } from 'react'
import heroArt from '../assets/illustrations/zenna-plant-hero.jpg'
import type { CareActionId, PlantMood } from '../hooks/usePlantMood'
import { moodLabel } from '../hooks/usePlantMood'

type PlantStageProps = {
  mood?: PlantMood
  activeEffect?: CareActionId | null
  onEffectComplete?: () => void
  compact?: boolean
}

function WaterOverlay({ reduce }: { reduce: boolean | null }) {
  return (
    <motion.div
      className="effect effect--water"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0.15 : 0.4 }}
    >
      {!reduce &&
        Array.from({ length: 22 }).map((_, i) => (
          <span
            key={i}
            className="effect__drop"
            style={{
              left: `${6 + ((i * 9) % 88)}%`,
              width: `${4 + (i % 3)}px`,
              height: `${12 + (i % 4) * 3}px`,
              animationDelay: `${(i % 9) * 0.06}s`,
              animationDuration: `${0.85 + (i % 5) * 0.1}s`,
            }}
          />
        ))}
      <div className="effect__soil-darken" />
      <div className="effect__mist effect__mist--cool" />
    </motion.div>
  )
}

function PruneOverlay({ reduce }: { reduce: boolean | null }) {
  return (
    <motion.div
      className="effect effect--prune"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.span
        className="effect__snip"
        initial={reduce ? false : { scale: 0.55, opacity: 0, rotate: -28 }}
        animate={{ scale: [0.7, 1.05, 1], opacity: [0, 1, 0], rotate: [ -28, 8, 18] }}
        transition={{ duration: reduce ? 0.2 : 0.7 }}
      />
      {!reduce &&
        Array.from({ length: 8 }).map((_, i) => (
          <motion.span
            key={i}
            className="effect__leaf"
            initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
            animate={{
              opacity: 0,
              x: (i - 3.5) * 26,
              y: 70 + i * 16,
              rotate: (i - 3.5) * 42,
              scale: 0.7,
            }}
            transition={{ duration: 1.05, delay: 0.05 * i, ease: 'easeIn' }}
          />
        ))}
    </motion.div>
  )
}

function SunlightOverlay({ reduce }: { reduce: boolean | null }) {
  return (
    <motion.div
      className="effect effect--sun"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0.2 : 0.55 }}
    >
      <div className="effect__wash" />
      {!reduce && <div className="effect__rays" />}
      <motion.div
        className="effect__sun-core"
        animate={
          reduce
            ? undefined
            : { scale: [0.85, 1.1, 1], opacity: [0.2, 0.55, 0.25] }
        }
        transition={{ duration: 1.2 }}
      />
    </motion.div>
  )
}

function SingOverlay({ reduce }: { reduce: boolean | null }) {
  return (
    <motion.div
      className="effect effect--sing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {!reduce &&
        Array.from({ length: 8 }).map((_, i) => (
          <motion.span
            key={i}
            className="effect__note"
            initial={{ opacity: 0, y: 24, scale: 0.5 }}
            animate={{
              opacity: [0, 1, 0],
              y: -80 - i * 10,
              scale: 1,
              x: Math.sin(i) * 18,
            }}
            transition={{ duration: 1.25, delay: i * 0.08 }}
            style={{ left: `${16 + i * 9}%` }}
          />
        ))}
      <motion.div
        className="effect__pulse"
        animate={
          reduce
            ? undefined
            : { scale: [1, 1.1, 1], opacity: [0.3, 0.75, 0.3] }
        }
        transition={{ duration: 0.95, repeat: 2 }}
      />
    </motion.div>
  )
}

function DeadheadOverlay({ reduce }: { reduce: boolean | null }) {
  return (
    <motion.div
      className="effect effect--deadhead"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.span
        className="effect__snip effect__snip--bloom"
        initial={reduce ? false : { scale: 0.5, opacity: 0, rotate: -40 }}
        animate={{ scale: 1, opacity: [0, 1, 0], rotate: 16 }}
        transition={{ duration: reduce ? 0.2 : 0.65 }}
      />
      {!reduce &&
        Array.from({ length: 10 }).map((_, i) => (
          <motion.span
            key={i}
            className="effect__petal"
            initial={{
              opacity: 1,
              x: 0,
              y: 0,
              rotate: i * 36,
              scale: 1,
            }}
            animate={{
              opacity: 0,
              x: Math.cos((i / 10) * Math.PI * 2) * (70 + (i % 3) * 18),
              y: 40 + Math.sin((i / 10) * Math.PI * 2) * 30 + i * 10,
              rotate: i * 36 + 140,
              scale: 0.55,
            }}
            transition={{ duration: 1.15, delay: 0.04 * i, ease: 'easeOut' }}
          />
        ))}
      <div className="effect__mist effect__mist--warm" />
    </motion.div>
  )
}

export function PlantStage({
  mood,
  activeEffect = null,
  onEffectComplete,
  compact = false,
}: PlantStageProps) {
  const reduceMotion = useReducedMotion()
  const label = mood ? moodLabel(mood) : null

  useEffect(() => {
    if (!activeEffect || !onEffectComplete) return
    const ms = reduceMotion
      ? 280
      : activeEffect === 'deadhead' || activeEffect === 'water'
        ? 1400
        : 1250
    const id = window.setTimeout(onEffectComplete, ms)
    return () => window.clearTimeout(id)
  }, [activeEffect, onEffectComplete, reduceMotion])

  const sway =
    !reduceMotion &&
    (activeEffect === 'water' || activeEffect === 'sing'
      ? { rotate: [-1.8, 2.1, -1.4, 0] }
      : activeEffect === 'sunlight'
        ? { rotate: [-0.5, 2.8, 1.2, 0], y: [0, -8, -2, 0] }
        : activeEffect === 'prune'
          ? { scale: [1, 0.982, 1.012, 1] }
          : activeEffect === 'deadhead'
            ? { rotate: [0, -2.2, 1.5, 0], scale: [1, 0.99, 1.02, 1] }
            : { rotate: [-0.7, 0.7, -0.7], y: [0, -3, 0] })

  return (
    <div
      className={`plant-stage${compact ? ' plant-stage--compact' : ''}`}
      aria-hidden={mood ? undefined : true}
      role={mood ? 'img' : undefined}
      aria-label={mood ? `Zenna looking ${label?.toLowerCase()}` : undefined}
    >
      <div className="plant-stage__glow" />
      <motion.div
        className="plant-stage__frame"
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="plant-stage__halo"
          animate={
            reduceMotion
              ? undefined
              : { scale: [1, 1.04, 1], opacity: [0.45, 0.7, 0.45] }
          }
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          className="plant-stage__art-wrap"
          animate={sway || undefined}
          transition={
            activeEffect
              ? { duration: reduceMotion ? 0.2 : 1.2, ease: 'easeInOut' }
              : {
                  duration: 5.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
          }
        >
          <img
            className="plant-stage__art"
            src={heroArt}
            alt=""
            width={864}
            height={1152}
            draggable={false}
          />
        </motion.div>

        <AnimatePresence>
          {activeEffect === 'water' && (
            <WaterOverlay key="water" reduce={reduceMotion} />
          )}
          {activeEffect === 'prune' && (
            <PruneOverlay key="prune" reduce={reduceMotion} />
          )}
          {activeEffect === 'sunlight' && (
            <SunlightOverlay key="sun" reduce={reduceMotion} />
          )}
          {activeEffect === 'sing' && (
            <SingOverlay key="sing" reduce={reduceMotion} />
          )}
          {activeEffect === 'deadhead' && (
            <DeadheadOverlay key="deadhead" reduce={reduceMotion} />
          )}
        </AnimatePresence>

        {label && (
          <p className="plant-stage__mood">
            <span className="plant-stage__mood-label">{label}</span>
          </p>
        )}
      </motion.div>
    </div>
  )
}
