import { GrowSection } from './components/GrowSection'
import { MeetSection } from './components/MeetSection'
import { TendSection } from './components/TendSection'

export default function App() {
  return (
    <main className="story">
      <MeetSection />
      <TendSection />
      <GrowSection />
      <footer className="site-footer">
        <p>Zenna, the Zinnia — growth story &amp; care mini-game</p>
      </footer>
    </main>
  )
}
