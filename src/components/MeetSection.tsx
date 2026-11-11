import { motion, useReducedMotion } from 'motion/react'
import { PlantStage } from './PlantStage'

export function MeetSection() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="chapter chapter--meet" id="meet" aria-labelledby="meet-title">
      <div className="chapter__copy">
        <motion.p
          className="brand"
          id="meet-title"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          Zenna
        </motion.p>
        <motion.h1
          className="headline"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          the Zinnia
        </motion.h1>
        <motion.p
          className="lede"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
        >
          An adopted flower learning the light — her growth story and a quiet
          care ritual, on one page.
        </motion.p>
        <motion.div
          className="cta-row"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.28 }}
        >
          <a className="cta cta--primary" href="#tend">
            Tend Zenna
          </a>
          <a className="cta cta--ghost" href="#grow">
            Watch her grow
          </a>
        </motion.div>
      </div>
      <PlantStage />
    </section>
  )
}
