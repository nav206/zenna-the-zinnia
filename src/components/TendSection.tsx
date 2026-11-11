const ACTIONS = [
  { id: 'water', label: 'Water', hint: 'Droplets, soil darkens, happy sway' },
  { id: 'prune', label: 'Prune', hint: 'Snip + leaf fall, cleaner silhouette' },
  {
    id: 'sunlight',
    label: 'Sunlight',
    hint: 'Warm wash / ray drift, stretch toward light',
  },
  {
    id: 'sing',
    label: 'Sing',
    hint: 'Opt-in audio + rhythmic petal pulse (muted by default)',
  },
] as const

/**
 * Care mini-game shell — actions and feedback land in a later pass.
 * Keep mood in localStorage; diary growth stays in growth.json.
 */
export function TendSection() {
  return (
    <section className="chapter chapter--tend" id="tend" aria-labelledby="tend-title">
      <div className="chapter__inner">
        <p className="eyebrow">Tend</p>
        <h2 id="tend-title">A little care goes a long way</h2>
        <p className="section-lede">
          Water, prune, offer sunlight, or sing — each action will animate the
          plant stage. Scaffold only for now.
        </p>
        <ul className="care-actions" role="list">
          {ACTIONS.map((action) => (
            <li key={action.id}>
              <button
                type="button"
                className="care-action"
                disabled
                title="Coming soon"
                aria-disabled="true"
              >
                <span className="care-action__label">{action.label}</span>
                <span className="care-action__hint">{action.hint}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
