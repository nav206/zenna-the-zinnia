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
      transition={{ duration: reduce ? 0.15 : 0.35 }}
    >
      {!reduce &&
        Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className="effect__drop"
            style={{
              left: `${8 + ((i * 7) % 84)}%`,
              animationDelay: `${(i % 7) * 0.08}s`,
              animationDuration: `${0.7 + (i % 4) * 0.12}s`,
            }}
          />
        ))}
      <div className="effect__soil-darken" />
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
        initial={reduce ? false : { scale: 0.6, opacity: 0, rotate: -20 }}
        animate={{ scale: 1, opacity: [0, 1, 0], rotate: 12 }}
        transition={{ duration: reduce ? 0.2 : 0.55 }}
      />
      {!reduce &&
        Array.from({ length: 5 }).map((_, i) => (
          <motion.span
            key={i}
            className="effect__leaf"
            initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
            animate={{
              opacity: 0,
              x: (i - 2) * 28,
              y: 90 + i * 12,
              rotate: (i - 2) * 35,
            }}
            transition={{ duration: 0.9, delay: 0.08 * i, ease: 'easeIn' }}
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
      transition={{ duration: reduce ? 0.2 : 0.5 }}
    >
      <div className="effect__wash" />
      {!reduce && <div className="effect__rays" />}
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
        Array.from({ length: 6 }).map((_, i) => (
          <motion.span
            key={i}
            className="effect__note"
            initial={{ opacity: 0, y: 20, scale: 0.6 }}
            animate={{ opacity: [0, 1, 0], y: -70 - i * 8, scale: 1 }}
            transition={{ duration: 1.1, delay: i * 0.1 }}
            style={{ left: `${20 + i * 12}%` }}
          />
        ))}
      <motion.div
        className="effect__pulse"
        animate={
          reduce
            ? undefined
            : { scale: [1, 1.08, 1], opacity: [0.35, 0.7, 0.35] }
        }
        transition={{ duration: 0.9, repeat: 2 }}
      />
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
    const ms = reduceMotion ? 280 : 1200
    const id = window.setTimeout(onEffectComplete, ms)
    return () => window.clearTimeout(id)
  }, [activeEffect, onEffectComplete, reduceMotion])

  const sway =
    !reduceMotion &&
    (activeEffect === 'water' || activeEffect === 'sing'
      ? { rotate: [-1.5, 1.8, -1.2, 0] }
      : activeEffect === 'sunlight'
        ? { rotate: [-0.5, 2.5, 1.2, 0], y: [0, -6, -2, 0] }
        : activeEffect === 'prune'
          ? { scale: [1, 0.985, 1.01, 1] }
          : { rotate: [-0.6, 0.6, -0.6], y: [0, -3, 0] })

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
              ? { duration: reduceMotion ? 0.2 : 1.1, ease: 'easeInOut' }
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
