/** Soft opt-in chime for Sing — Web Audio only, no external assets. */

let ctx: AudioContext | null = null

function getCtx() {
  if (!ctx) {
    ctx = new AudioContext()
  }
  return ctx
}

export async function playSingChime() {
  const audio = getCtx()
  if (audio.state === 'suspended') {
    await audio.resume()
  }

  const now = audio.currentTime
  const notes = [392, 493.88, 587.33, 659.25] // G4 B4 D5 E5

  notes.forEach((freq, i) => {
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.045, now + 0.04 + i * 0.12)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55 + i * 0.12)
    osc.connect(gain)
    gain.connect(audio.destination)
    osc.start(now + i * 0.12)
    osc.stop(now + 0.7 + i * 0.12)
  })
}
