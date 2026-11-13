import { motion, useReducedMotion } from 'motion/react'
import { useId, useState } from 'react'
import heroArt from '../assets/illustrations/zenna-plant-hero.jpg'
import { plantProfile } from '../data/plantProfile'
import type { CareActionId, PlantMood } from '../hooks/usePlantMood'
import { moodLabel } from '../hooks/usePlantMood'

type MeetPlantCardProps = {
  mood: PlantMood
  activeEffect: CareActionId | null
}

function FlipIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 7h7a4 4 0 0 1 0 8H9" />
      <path d="M10 4 7 7l3 3" />
      <path d="M17 17H10a4 4 0 0 1 0-8h5" />
      <path d="M14 20 17 17l-3-3" />
    </svg>
  )
}

export function MeetPlantCard({ mood, activeEffect }: MeetPlantCardProps) {
  const reduceMotion = useReducedMotion()
  const [flipped, setFlipped] = useState(false)
  const titleId = useId()
  const label = moodLabel(mood)

  function toggle() {
    setFlipped((v) => !v)
  }

  return (
    <div className="plant-stage meet-card-stage">
      <div className="plant-stage__glow" aria-hidden="true" />
      <div className="meet-card" style={{ perspective: reduceMotion ? undefined : 1200 }}>
        <motion.button
          type="button"
          className="meet-card__flipper"
          aria-pressed={flipped}
          aria-labelledby={titleId}
          title={flipped ? 'Flip back to plant portrait' : 'Flip for field guide'}
          onClick={toggle}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              toggle()
            }
          }}
          animate={
            reduceMotion ? { opacity: 1 } : { rotateY: flipped ? 180 : 0 }
          }
          transition={
            reduceMotion
              ? { duration: 0.2 }
              : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
          }
          style={{ transformStyle: reduceMotion ? undefined : 'preserve-3d' }}
        >
          <span id={titleId} className="visually-hidden">
            {flipped
              ? `${plantProfile.commonName} field guide card`
              : `${plantProfile.commonName} portrait — flip for facts`}
          </span>

          <motion.span
            className="meet-card__face meet-card__face--front"
            aria-hidden={flipped}
            initial={false}
            animate={
              reduceMotion
                ? { opacity: flipped ? 0 : 1, zIndex: flipped ? 0 : 1 }
                : undefined
            }
            transition={{ duration: 0.2 }}
            style={
              reduceMotion
                ? undefined
                : {
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }
            }
          >
            <span className="plant-stage__frame meet-card__frame">
              {!flipped && (
                <span className="meet-card__flip-badge" aria-hidden="true">
                  <FlipIcon />
                </span>
              )}
              <span className="plant-stage__halo" aria-hidden="true" />
              <motion.span
                className="plant-stage__art-wrap"
                animate={
                  reduceMotion || flipped || activeEffect
                    ? undefined
                    : { rotate: [-0.6, 0.6, -0.6], y: [0, -3, 0] }
                }
                transition={{
                  duration: 5.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <img
                  className="plant-stage__art"
                  src={heroArt}
                  alt=""
                  width={864}
                  height={1152}
                  draggable={false}
                />
              </motion.span>
              <span className="plant-stage__mood">
                <span className="plant-stage__mood-label">{label}</span>
              </span>
            </span>
          </motion.span>

          <motion.span
            className="meet-card__face meet-card__face--back"
            aria-hidden={!flipped}
            initial={false}
            animate={
              reduceMotion
                ? { opacity: flipped ? 1 : 0, zIndex: flipped ? 1 : 0 }
                : undefined
            }
            transition={{ duration: 0.2 }}
            style={
              reduceMotion
                ? undefined
                : {
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }
            }
          >
            <span className="dex-card">
              <span className="dex-card__top">
                <span className="dex-card__name">{plantProfile.commonName}</span>
                <span className="dex-card__type">{plantProfile.type}</span>
              </span>
              <span className="dex-card__species">
                <em>{plantProfile.scientificName}</em>
              </span>
              <span className="dex-card__portrait">
                <img
                  src={heroArt}
                  alt=""
                  width={216}
                  height={288}
                  draggable={false}
                />
              </span>
              <span className="dex-card__tax">
                {plantProfile.order} · {plantProfile.family} · {plantProfile.genus}
                <br />
                {plantProfile.origin}
              </span>
              <span className="dex-card__block">
                <span className="dex-card__label">Needs</span>
                <span className="dex-card__chips">
                  {plantProfile.needs.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </span>
              </span>
              <span className="dex-card__block">
                <span className="dex-card__label">Strengths</span>
                <span className="dex-card__chips">
                  {plantProfile.strengths.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </span>
              </span>
              <span className="dex-card__block">
                <span className="dex-card__label">Weaknesses</span>
                <span className="dex-card__chips">
                  {plantProfile.weaknesses.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </span>
              </span>
              <span className="dex-card__block">
                <span className="dex-card__label">Field notes</span>
                <span className="dex-card__chips">
                  {plantProfile.funFacts.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </span>
              </span>
            </span>
          </motion.span>
        </motion.button>
      </div>
    </div>
  )
}
