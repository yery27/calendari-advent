import confetti from 'canvas-confetti'

const colors = ['#e9c46a', '#e8453a', '#f4ece1', '#fff3c4']
const base = { colors, disableForReducedMotion: true, zIndex: 100 }

// Ràfega de confeti des d'un punt (x, y en fracció de pantalla)
export const festa = (x = 0.5, y = 0.6) =>
  confetti({ ...base, particleCount: 90, spread: 85, startVelocity: 38, scalar: 0.9, origin: { x, y } })

// Focs artificials durant uns segons. Retorna la funció per aturar-los.
export function focs(ms = 5000) {
  const fi = Date.now() + ms
  const id = setInterval(() => {
    if (Date.now() > fi) return clearInterval(id)
    confetti({ ...base, particleCount: 45, spread: 360, startVelocity: 28, ticks: 70, origin: { x: 0.15 + Math.random() * 0.7, y: 0.1 + Math.random() * 0.4 } })
  }, 260)
  return () => clearInterval(id)
}
