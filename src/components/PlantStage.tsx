import { motion, useReducedMotion } from 'motion/react'

/**
 * Placeholder stage for the authored plant illustration.
 * Drop sketches into `src/assets/illustrations/` and replace this slot —
 * avoid cheap polygon plant figures; motion + assets are the intended path.
 */
export function PlantStage() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="plant-stage" aria-hidden="true">
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
        <div className="plant-stage__slot">
          <p className="plant-stage__label">Illustration stage</p>
          <p className="plant-stage__hint">
            Authored sketch lives in{' '}
            <code>src/assets/illustrations/</code>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
