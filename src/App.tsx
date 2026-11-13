import footerRoots from './assets/illustrations/footer-roots.jpg'
import { GrowSection } from './components/GrowSection'
import { MeetSection } from './components/MeetSection'
import { TendSection } from './components/TendSection'
import { usePlantMood } from './hooks/usePlantMood'

export default function App() {
  const { mood, activeEffect, clearEffect, tend, setSoundEnabled, daytime } =
    usePlantMood()

  return (
    <main className="story">
      <MeetSection mood={mood} activeEffect={activeEffect} />
      <GrowSection />
      <TendSection
        mood={mood}
        daytime={daytime}
        activeEffect={activeEffect}
        onTend={tend}
        onEffectComplete={clearEffect}
        onSoundToggle={setSoundEnabled}
      />
      <footer className="site-footer">
        <img
          className="site-footer__roots"
          src={footerRoots}
          alt=""
          width={1280}
          height={720}
        />
        <p>Zenna, the Zinnia — growth story &amp; care mini-game</p>
        <p className="site-footer__note">
          Roots deepen in v2 — global care, your own plant, and a friendly rivalry.
        </p>
      </footer>
    </main>
  )
}
