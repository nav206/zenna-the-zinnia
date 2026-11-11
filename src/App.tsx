import { GrowSection } from './components/GrowSection'
import { MeetSection } from './components/MeetSection'
import { TendSection } from './components/TendSection'
import { usePlantMood } from './hooks/usePlantMood'

export default function App() {
  const { mood, activeEffect, clearEffect, tend, setSoundEnabled } =
    usePlantMood()

  return (
    <main className="story">
      <MeetSection mood={mood} activeEffect={activeEffect} />
      <TendSection
        mood={mood}
        activeEffect={activeEffect}
        onTend={tend}
        onEffectComplete={clearEffect}
        onSoundToggle={setSoundEnabled}
      />
      <GrowSection />
      <footer className="site-footer">
        <p>Zenna, the Zinnia — growth story &amp; care mini-game</p>
      </footer>
    </main>
  )
}
