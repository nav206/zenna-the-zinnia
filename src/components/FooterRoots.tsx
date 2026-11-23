import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { fetchRootsStats } from '../lib/api'

const SOURCES = [
  {
    label: 'Zinnias — Old Farmer’s Almanac',
    href: 'https://www.almanac.com/plant/zinnias',
  },
  {
    label: 'Story behind the project',
    href: 'https://sidesofnav.pages.dev/projects/zenna-the-zinnia/',
  },
] as const

function rootPath(i: number, total: number, strength: number) {
  const t = total <= 1 ? 0.5 : i / (total - 1)
  const startX = 8 + t * 84
  const lean = (t - 0.5) * (70 + strength * 40) + (i % 2 === 0 ? -8 : 8)
  const depth = 48 + strength * 60 + (i % 4) * 10
  const midX = startX + lean * 0.45
  const endX = startX + lean
  return `M ${startX.toFixed(1)} 2 C ${startX.toFixed(1)} ${(depth * 0.32).toFixed(1)}, ${midX.toFixed(1)} ${(depth * 0.62).toFixed(1)}, ${endX.toFixed(1)} ${depth.toFixed(1)}`
}

type FooterRootsProps = {
  refreshKey?: number
  onJoin?: () => void
  onEgg?: (message: string) => void
}

export function FooterRoots({
  refreshKey = 0,
  onJoin,
  onEgg,
}: FooterRootsProps) {
  const reduceMotion = useReducedMotion()
  const [signupCount, setSignupCount] = useState(0)
  const [ready, setReady] = useState(false)
  const [rootClicks, setRootClicks] = useState(0)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const res = await fetchRootsStats()
      if (cancelled) return
      if (res.data) setSignupCount(res.data.signupCount)
      setReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const strength = Math.min(1, Math.max(0.28, signupCount / 24))
  const rootCount = Math.min(15, 5 + Math.floor(signupCount / 2))

  const roots = useMemo(
    () =>
      Array.from({ length: rootCount }, (_, i) =>
        rootPath(i, rootCount, strength),
      ),
    [rootCount, strength],
  )

  function onRootsClick() {
    const next = rootClicks + 1
    setRootClicks(next)
    if (next === 5) {
      onEgg?.(
        'The soil remembers. Quiet finds count toward a real-plant giveaway.',
      )
      setRootClicks(0)
    }
  }

  return (
    <footer className="site-footer site-footer--roots" id="roots">
      <div
        className="footer-roots"
        aria-hidden="true"
        onClick={onRootsClick}
      >
        <svg
          className="footer-roots__svg"
          viewBox="0 0 100 120"
          preserveAspectRatio="none"
        >
          {roots.map((d, i) => (
            <motion.path
              key={`${refreshKey}-${i}-${d}`}
              d={d}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5 + (i % 3) * 0.4}
              strokeLinecap="round"
              initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.5 + strength * 0.45 }}
              transition={{
                duration: reduceMotion ? 0 : 1.4,
                delay: reduceMotion ? 0 : i * 0.04,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          ))}
        </svg>
      </div>

      <div className="site-footer__copy">
        <div className="site-footer__left">
          <p className="site-footer__gardeners">
            {ready
              ? signupCount === 0
                ? 'No gardeners signed up so far.'
                : `${signupCount} gardener${signupCount === 1 ? '' : 's'} signed up so far.`
              : 'Counting gardeners…'}{' '}
            {onJoin ? (
              <button type="button" className="text-link" onClick={onJoin}>
                Join them.
              </button>
            ) : (
              <a className="text-link" href="#tend">
                Join them.
              </a>
            )}
          </p>

          <div className="footer-sources" id="sources">
            <h5 className="footer-sources__title">Learn more</h5>
            <ul className="footer-sources__list" role="list">
              {SOURCES.map((source) => (
                <li key={source.href}>
                  <a href={source.href} target="_blank" rel="noreferrer">
                    {source.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="footer-sources__note">
          <span>If this reminded you of someone —</span>
          <span>buy them flowers, or send them this page.</span>
        </p>
      </div>
    </footer>
  )
}
