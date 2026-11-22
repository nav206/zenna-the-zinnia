const SOURCES = [
  {
    label: 'Zinnia — Wikipedia',
    href: 'https://en.wikipedia.org/wiki/Zinnia',
  },
  {
    label: 'Deadheading — Wikipedia',
    href: 'https://en.wikipedia.org/wiki/Deadheading_(botany)',
  },
  {
    label: 'Zinnias — Old Farmer’s Almanac',
    href: 'https://www.almanac.com/plant/zinnias',
  },
] as const

export function SourcesSection() {
  return (
    <section
      className="chapter chapter--sources"
      id="sources"
      aria-labelledby="sources-title"
    >
      <div className="chapter__inner sources">
        <p className="eyebrow">Sources</p>
        <h2 id="sources-title">Sources you might enjoy</h2>
        <ul className="sources__list" role="list">
          {SOURCES.map((source) => (
            <li key={source.href}>
              <a href={source.href} target="_blank" rel="noreferrer">
                {source.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="sources__note">
          If this reminded you of someone — buy them flowers, or send them this
          page. Small care travels farther than tabs.
        </p>
      </div>
    </section>
  )
}
