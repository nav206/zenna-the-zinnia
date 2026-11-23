import { motion, useReducedMotion } from 'motion/react'
import { useRef, useState } from 'react'
import zennaWordmark from '../assets/illustrations/zenna-wordmark-frida.jpg'
import type { CareActionId, PlantMood } from '../hooks/usePlantMood'
import { trackCtaClick } from '../lib/analytics'
import { MeetPlantCard } from './MeetPlantCard'

const PORTFOLIO_URL =
  'https://sidesofnav.pages.dev/projects/zenna-the-zinnia/'

type MeetSectionProps = {
  mood: PlantMood
  activeEffect: CareActionId | null
  onEgg?: (message: string) => void
  onPortraitFlipEgg?: () => void
  onGrowOwn?: () => void
}

export function MeetSection({
  mood,
  activeEffect,
  onEgg,
  onPortraitFlipEgg,
  onGrowOwn,
}: MeetSectionProps) {
  const reduceMotion = useReducedMotion()
  const [markClicks, setMarkClicks] = useState(0)
  const markTimer = useRef<number | null>(null)

  function onWordmarkClick() {
    const next = markClicks + 1
    setMarkClicks(next)
    if (markTimer.current) window.clearTimeout(markTimer.current)
    markTimer.current = window.setTimeout(() => setMarkClicks(0), 1800)
    if (next >= 7) {
      onEgg?.(
        'Quiet gardener tip: real flowers beat tabs. Someone you love might need one.',
      )
      setMarkClicks(0)
    }
  }

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
          <button
            type="button"
            className="brand-mark__hit"
            onClick={onWordmarkClick}
            aria-label="Zenna wordmark"
          >
            <img
              className="brand-mark__art"
              src={zennaWordmark}
              alt="Zenna — letters wrapped in Frida-style zinnias"
              width={1280}
              height={720}
            />
          </button>
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
          An adopted plant that teaches me what it is like to show up every day,
          patiently trust the process, find beauty in steady growth, and bloom
          even on gloomy days.
        </motion.p>
        <motion.div
          className="cta-row"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.28 }}
        >
          <a
            className="cta cta--primary"
            href="#grow"
            onClick={() => trackCtaClick('witness_her_growth', '#grow')}
          >
            Witness her growth
          </a>
          <a
            className="cta cta--ghost"
            href="#tend"
            onClick={(e) => {
              e.preventDefault()
              trackCtaClick('grow_my_own_zinnia', '#tend')
              onGrowOwn?.()
            }}
          >
            Grow my own Zinnia
          </a>
        </motion.div>
        <motion.p
          className="project-link"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.36 }}
        >
          <a
            className="ext-link"
            href={PORTFOLIO_URL}
            target="_blank"
            rel="noreferrer"
          >
            Learn more about the project
            <span className="ext-link__arrow" aria-hidden="true">
              ↗
            </span>
          </a>
        </motion.p>
      </div>
      <MeetPlantCard
        mood={mood}
        activeEffect={activeEffect}
        onEgg={onEgg}
        onPortraitFlipEgg={onPortraitFlipEgg}
      />
    </section>
  )
}
