import { motion, useReducedMotion } from 'motion/react'
import growth from '../data/growth.json'
import type { ApiPlant, ApiUser } from '../lib/api'
import type { GrowthDiary } from '../types/growth'

const diary = growth as GrowthDiary

type CompeteSectionProps = {
  user: ApiUser | null
  globalPlant: ApiPlant | null
  personalPlant: ApiPlant | null
  onCompete: () => void
}

export function CompeteSection({
  user,
  globalPlant,
  personalPlant,
  onCompete,
}: CompeteSectionProps) {
  const reduceMotion = useReducedMotion()
  const irlCareProxy = diary.stats
    ? Math.round(
        diary.stats.sunbathingHours / 4 +
          diary.stats.waterDrunkMl / 80 +
          diary.stats.flowers * 12 +
          diary.stats.buds * 6,
      )
    : 0

  const rows = [
    {
      id: 'irl',
      label: 'IRL Zenna',
      detail: diary.stats
        ? `${diary.stats.flowers} blooms · ${diary.weeks.at(-1)?.heightCm ?? '—'} cm`
        : 'Canonical diary in growth.json',
      score: irlCareProxy,
      accent: 'petal' as const,
    },
    {
      id: 'global',
      label: 'Global Zenna',
      detail: globalPlant
        ? `${globalPlant.totalCare} care moments from visitors`
        : 'Loading the shared plot…',
      score: globalPlant?.totalCare ?? 0,
      accent: 'leaf' as const,
    },
    {
      id: 'you',
      label: user ? `${user.displayName}'s Zenna` : 'Your Zenna',
      detail: user
        ? personalPlant
          ? `${personalPlant.totalCare} care moments on your plot`
          : 'Your personal plant awaits'
        : 'Create an account to plant your own',
      score: personalPlant?.totalCare ?? 0,
      accent: 'sun' as const,
    },
  ]

  return (
    <section
      className="chapter chapter--compete"
      id="compete"
      aria-labelledby="compete-title"
    >
      <div className="chapter__inner">
        <p className="eyebrow">Compete</p>
        <h2 id="compete-title">Against me — and my Zenna IRL</h2>
        <p className="section-lede">
          The diary is the real plant. Global Zenna gathers every visitor’s
          care. Your account grows a personal plot you can stack against both.
        </p>

        <ul className="compete-grid" role="list">
          {rows.map((row, index) => (
            <motion.li
              key={row.id}
              className={`compete-card compete-card--${row.accent}`}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                duration: 0.55,
                delay: reduceMotion ? 0 : index * 0.06,
              }}
            >
              <span className="compete-card__label">{row.label}</span>
              <strong className="compete-card__score">{row.score}</strong>
              <span className="compete-card__detail">{row.detail}</span>
            </motion.li>
          ))}
        </ul>

        <div className="compete-cta">
          <button type="button" className="cta cta--primary" onClick={onCompete}>
            Compete against me
          </button>
          <p>
            Jump to Tend — care for Global Zenna, or sign in and grow yours.
          </p>
        </div>
      </div>
    </section>
  )
}
