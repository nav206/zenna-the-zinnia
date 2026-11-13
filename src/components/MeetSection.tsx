import { motion, useReducedMotion } from 'motion/react'
import zennaWordmark from '../assets/illustrations/zenna-wordmark-frida.jpg'
import type { CareActionId, PlantMood } from '../hooks/usePlantMood'
import { MeetPlantCard } from './MeetPlantCard'

type MeetSectionProps = {
  mood: PlantMood
  activeEffect: CareActionId | null
}

export function MeetSection({ mood, activeEffect }: MeetSectionProps) {
  const reduceMotion = useReducedMotion()

  return (
    <section className="chapter chapter--meet" id="meet" aria-labelledby="meet-title">
      <div className="chapter__copy">
        <motion.div
          className="brand-mark"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 id="meet-title" className="visually-hidden">
            Zenna
          </h1>
          <img
            className="brand-mark__art"
            src={zennaWordmark}
            alt="Zenna — letters wrapped in Frida-style zinnias"
            width={1280}
            height={720}
          />
        </motion.div>
        <motion.p
          className="headline"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          the Zinnia
        </motion.p>
        <motion.p
          className="lede"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
        >
          An adopted flower learning the light — first her growth story, then a
          quiet care ritual, on one page. Flip her portrait for a pocket field
          guide.
        </motion.p>
        <motion.div
          className="cta-row"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.28 }}
        >
          <a className="cta cta--primary" href="#grow">
            Watch her grow
          </a>
          <a className="cta cta--ghost" href="#tend">
            Tend Zenna
          </a>
        </motion.div>
      </div>
      <MeetPlantCard mood={mood} activeEffect={activeEffect} />
    </section>
  )
}
