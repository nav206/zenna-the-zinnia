import { motion, useReducedMotion } from 'motion/react'
import leafFrame from '../assets/illustrations/growth-leaf-frame.jpg'
import weekAdopt from '../assets/illustrations/zenna-week-adopt.jpg'
import weekBloom from '../assets/illustrations/zenna-week-bloom.jpg'
import weekNow from '../assets/illustrations/zenna-week-now.jpg'
import growth from '../data/growth.json'
import type { GrowthDiary } from '../types/growth'

const diary = growth as GrowthDiary

const WEEK_ART: Record<number, string> = {
  1: weekAdopt,
  2: weekBloom,
  3: weekNow,
}

const maxHeight = Math.max(...diary.weeks.map((w) => w.heightCm), 1)

const STAT_ROWS = diary.stats
  ? [
      {
        label: 'Sunbathing',
        value: `${diary.stats.sunbathingHours.toLocaleString()} h`,
      },
      {
        label: 'Water drunk',
        value: `${diary.stats.waterDrunkMl.toLocaleString()} ml`,
      },
      {
        label: 'Leaves grown / shed',
        value: `${diary.stats.leavesGrown} / ${diary.stats.leavesShed}`,
      },
      {
        label: 'Buds & flowers',
        value: `${diary.stats.buds} buds · ${diary.stats.flowers} blooms`,
      },
    ]
  : []

/**
 * Growth as a botanical stem story — not a BI line chart.
 * Leaf-shaped checkpoint cards; stats live in growth.json for easy edits.
 */
export function GrowSection() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="chapter chapter--grow" id="grow" aria-labelledby="grow-title">
      <div className="grow-intro">
        <p className="eyebrow">Grow</p>
        <h2 id="grow-title">Weeks of becoming</h2>
        <p className="section-lede">
          The record first — {diary.plant.name} ({diary.plant.species}), adopted{' '}
          {diary.plant.adopted}. Real checkpoints; edit{' '}
          <code>src/data/growth.json</code> when she changes again.
        </p>
      </div>

      {diary.stats && (
        <div className="plant-stats" aria-label="Plant care totals">
          <p className="plant-stats__updated">
            Totals as of {diary.stats.updated}
          </p>
          <ul className="plant-stats__grid" role="list">
            {STAT_ROWS.map((row) => (
              <li key={row.label} className="plant-stats__item">
                <span className="plant-stats__label">{row.label}</span>
                <strong className="plant-stats__value">{row.value}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}

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
                <figure className="growth-node__leaf">
                  <img
                    className="growth-node__leaf-frame"
                    src={leafFrame}
                    alt=""
                    width={768}
                    height={1024}
                    aria-hidden="true"
                  />
                  {art && (
                    <img
                      className="growth-node__leaf-photo"
                      src={art}
                      alt=""
                      width={648}
                      height={864}
                      loading="lazy"
                    />
                  )}
                  <figcaption>
                    {week.title ?? `Week ${week.week}`}
                  </figcaption>
                </figure>
                <div className="growth-node__copy">
                  <div className="growth-node__meta">
                    <span className="growth-entry__week">
                      {week.title ?? `Week ${week.week}`}
                    </span>
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

      <div className="grow-handoff">
        <p>Now that you’ve seen her weeks —</p>
        <a className="cta cta--primary" href="#tend">
          Tend Zenna
        </a>
      </div>
    </section>
  )
}
