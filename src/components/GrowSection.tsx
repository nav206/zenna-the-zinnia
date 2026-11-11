import { motion, useReducedMotion } from 'motion/react'
import week01 from '../assets/illustrations/zenna-week-01.jpg'
import week02 from '../assets/illustrations/zenna-week-02.jpg'
import week03 from '../assets/illustrations/zenna-week-03.jpg'
import growth from '../data/growth.json'
import type { GrowthDiary } from '../types/growth'

const diary = growth as GrowthDiary

const WEEK_ART: Record<number, string> = {
  1: week01,
  2: week02,
  3: week03,
}

const maxHeight = Math.max(...diary.weeks.map((w) => w.heightCm), 1)

/**
 * Growth as a botanical stem story — not a BI line chart.
 * Each week is a node along a rising stem; height becomes presence.
 */
export function GrowSection() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="chapter chapter--grow" id="grow" aria-labelledby="grow-title">
      <div className="grow-intro">
        <p className="eyebrow">Grow</p>
        <h2 id="grow-title">Weeks of becoming</h2>
        <p className="section-lede">
          Real diary entries for {diary.plant.name} ({diary.plant.species}),
          adopted {diary.plant.adopted}. Sample weeks until measurements catch
          up — edit <code>src/data/growth.json</code> to add more.
        </p>
      </div>

      <div className="growth-story" role="list">
        <div className="growth-story__stem" aria-hidden="true">
          <svg
            className="growth-story__path"
            viewBox="0 0 80 1000"
            preserveAspectRatio="none"
          >
            <path
              d="M40 20 C 28 120, 52 220, 40 320 S 28 520, 40 620 S 55 820, 40 980"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {diary.weeks.map((week, index) => {
          const rise = week.heightCm / maxHeight
          const art = WEEK_ART[week.week]
          const flip = index % 2 === 1

          return (
            <motion.article
              key={week.week}
              className={`growth-node${flip ? ' growth-node--flip' : ''}`}
              role="listitem"
              style={{ ['--rise' as string]: rise }}
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{
                duration: 0.7,
                delay: reduceMotion ? 0 : index * 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="growth-node__marker" aria-hidden="true">
                <span
                  className="growth-node__bloom"
                  style={{ transform: `scale(${0.7 + rise * 0.45})` }}
                />
                <span className="growth-node__height">{week.heightCm} cm</span>
              </div>

              <div className="growth-node__panel">
                {art && (
                  <figure className="growth-node__figure">
                    <img
                      src={art}
                      alt=""
                      width={648}
                      height={864}
                      loading="lazy"
                    />
                    <figcaption>Week {week.week}</figcaption>
                  </figure>
                )}
                <div className="growth-node__copy">
                  <div className="growth-node__meta">
                    <span className="growth-entry__week">Week {week.week}</span>
                    <time dateTime={week.date}>{week.date}</time>
                  </div>
                  <p className="growth-entry__note">{week.note}</p>
                  <div
                    className="growth-node__bar"
                    aria-hidden="true"
                    title={`${week.heightCm} cm`}
                  >
                    <span style={{ width: `${Math.round(rise * 100)}%` }} />
                  </div>
                </div>
              </div>
            </motion.article>
          )
        })}
      </div>
    </section>
  )
}
