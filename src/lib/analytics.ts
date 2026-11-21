/**
 * Google Analytics 4 (gtag) — free visitor + engagement tracking.
 * Enable by setting VITE_GA_MEASUREMENT_ID (e.g. G-XXXXXXXXXX).
 * When unset, all helpers are no-ops so local/dev stays quiet.
 */

export type AnalyticsParams = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

const MEASUREMENT_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID ?? '').trim()

let booted = false

export function isAnalyticsEnabled() {
  return Boolean(MEASUREMENT_ID) && typeof window !== 'undefined'
}

export function initAnalytics() {
  if (booted || !isAnalyticsEnabled()) return
  booted = true

  window.dataLayer = window.dataLayer ?? []
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args)
  }

  window.gtag('js', new Date())
  window.gtag('config', MEASUREMENT_ID, {
    anonymize_ip: true,
    send_page_view: true,
  })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`
  document.head.appendChild(script)
}

export function trackEvent(name: string, params?: AnalyticsParams) {
  if (!isAnalyticsEnabled() || !window.gtag) return
  window.gtag('event', name, params)
}

export function trackCtaClick(label: string, destination?: string) {
  trackEvent('cta_click', {
    cta_label: label,
    cta_destination: destination,
  })
}

export function trackCareAction(action: string, scope: string) {
  trackEvent('care_action', {
    care_action: action,
    plant_scope: scope,
  })
}

export function trackAuth(action: 'signup' | 'login' | 'logout') {
  trackEvent(`auth_${action}`)
}

export function trackScopeChange(scope: string) {
  trackEvent('scope_change', { plant_scope: scope })
}

export function trackSectionView(section: string) {
  trackEvent('section_view', { section_id: section })
}

export function trackPlantCardFlip(flipped: boolean) {
  trackEvent('plant_card_flip', { flipped })
}

export function trackSoundToggle(enabled: boolean) {
  trackEvent('sound_toggle', { enabled })
}

/** Fire once per section when it first enters the viewport (~40% visible). */
export function observeSectionViews(sectionIds: string[]) {
  if (!isAnalyticsEnabled() || typeof IntersectionObserver === 'undefined') {
    return () => {}
  }

  const seen = new Set<string>()
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const id = entry.target.id
        if (!id || seen.has(id)) continue
        seen.add(id)
        trackSectionView(id)
        observer.unobserve(entry.target)
      }
    },
    { threshold: 0.4 },
  )

  for (const id of sectionIds) {
    const el = document.getElementById(id)
    if (el) observer.observe(el)
  }

  return () => observer.disconnect()
}
