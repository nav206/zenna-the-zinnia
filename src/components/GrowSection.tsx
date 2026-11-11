import growth from '../data/growth.json'
import type { GrowthDiary } from '../types/growth'

const diary = growth as GrowthDiary

/**
 * Growth storytelling shell — creative timeline/stage viz comes next.
 * Canonical weeks live in `src/data/growth.json`.
 */
export function GrowSection() {
  return (
    <section className="chapter chapter--grow" id="grow" aria-labelledby="grow-title">
      <div className="chapter__inner">
        <p className="eyebrow">Grow</p>
        <h2 id="grow-title">Weeks of becoming</h2>
        <p className="section-lede">
          Real diary entries for {diary.plant.name} ({diary.plant.species}).
          Sample weeks until measurements catch up — edit the JSON to add more.
        </p>
        <ol className="growth-list">
          {diary.weeks.map((week) => (
            <li key={week.week} className="growth-entry">
              <div className="growth-entry__meta">
                <span className="growth-entry__week">Week {week.week}</span>
                <time dateTime={week.date}>{week.date}</time>
                <span className="growth-entry__height">{week.heightCm} cm</span>
              </div>
              <p className="growth-entry__note">{week.note}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
