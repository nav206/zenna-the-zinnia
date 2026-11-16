import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { fetchRootsStats } from '../lib/api'

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
}

export function FooterRoots({ refreshKey = 0 }: FooterRootsProps) {
  const reduceMotion = useReducedMotion()
  const [signupCount, setSignupCount] = useState(0)
  const [ready, setReady] = useState(false)

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

  return (
    <footer className="site-footer site-footer--roots">
      <div className="footer-roots" aria-hidden="true">
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
        <p>Zenna, the Zinnia — growth story &amp; care garden</p>
        <p className="site-footer__roots-note">
          {ready
            ? signupCount === 0
              ? 'Roots waiting — each account deepens the footer.'
              : `Roots from ${signupCount} gardener${signupCount === 1 ? '' : 's'}.`
            : 'Listening for roots…'}
        </p>
      </div>
    </footer>
  )
}
