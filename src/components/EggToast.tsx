import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

type EggToastProps = {
  message: string | null
}

/** Quiet toast for easter-egg finds — brief, no chrome clutter. */
export function EggToast({ message }: EggToastProps) {
  const reduceMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {message ? (
        <motion.p
          key={message}
          className="egg-toast"
          role="status"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: 8 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {message}
        </motion.p>
      ) : null}
    </AnimatePresence>
  )
}
