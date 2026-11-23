import { ACHIEVEMENTS, type AchievementId } from '../data/achievements'

type AchievementGalleryProps = {
  unlocked: AchievementId[]
}

export function AchievementGallery({ unlocked }: AchievementGalleryProps) {
  const set = new Set(unlocked)
  const earned = unlocked.length

  return (
    <section
      className="achievements"
      aria-labelledby="achievements-title"
      id="achievements"
    >
      <div className="achievements__head">
        <h3 id="achievements-title">Achievement gallery</h3>
        <p>
          {earned === 0
            ? 'Hidden finds and care streaks live here.'
            : `${earned} of ${ACHIEVEMENTS.length} collected`}
        </p>
      </div>
      <ul className="achievements__grid" role="list">
        {ACHIEVEMENTS.map((item) => {
          const got = set.has(item.id)
          return (
            <li
              key={item.id}
              className={got ? 'achievement is-unlocked' : 'achievement'}
            >
              <span className="achievement__mark" aria-hidden="true">
                {got ? '◆' : '◇'}
              </span>
              <span className="achievement__body">
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
