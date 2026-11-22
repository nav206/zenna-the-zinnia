import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { fetchRootsStats } from '../lib/api'

const PORTFOLIO_URL =
  'https://sidesofnav.pages.dev/projects/zenna-the-zinnia/'

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
    if (next === 7) {
      onEgg?.('The soil remembers. Quiet finds count toward a real-plant giveaway.')
      setRootClicks(0)
    }
  }

  return (
    <footer className="site-footer site-footer--roots" id="roots">
      <div className="site-footer__copy">
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
        <p className="project-link project-link--footer">
          <a href={PORTFOLIO_URL} target="_blank" rel="noreferrer">
            Learn more about the project
          </a>
        </p>
        <p>Zenna, the Zinnia — growth story &amp; care garden</p>
      </div>
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
    </footer>
  )
}
