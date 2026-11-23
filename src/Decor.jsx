import { useEffect, useRef } from 'react'

// Neu: ~50 flocs en un sol canvas. S'atura amb `pausa` i amb prefers-reduced-motion.
export function Neu({ pausa }) {
  const ref = useRef()
  useEffect(() => {
    if (pausa || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const c = ref.current
    const x = c.getContext('2d')
    let w, h, id
    const mida = () => { w = c.width = innerWidth; h = c.height = innerHeight }
    mida()
    addEventListener('resize', mida)
    const n = Array.from({ length: innerWidth < 600 ? 40 : 70 }, () => ({
      x: Math.random() * w, y: Math.random() * h, r: 1 + Math.random() * 2.2, v: 0.3 + Math.random() * 0.8, f: Math.random() * 6,
    }))
    const pinta = (t) => {
      x.clearRect(0, 0, w, h)
      x.fillStyle = 'rgba(255,255,255,.75)'
      x.beginPath()
      for (const p of n) {
        p.y += p.v
        if (p.y > h + 5) { p.y = -5; p.x = Math.random() * w }
        const px = p.x + Math.sin(t / 1500 + p.f) * 14
        x.moveTo(px + p.r, p.y)
        x.arc(px, p.y, p.r, 0, 6.3)
      }
      x.fill()
      id = requestAnimationFrame(pinta)
    }
    id = requestAnimationFrame(pinta)
    return () => { cancelAnimationFrame(id); removeEventListener('resize', mida) }
  }, [pausa])
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-0" />
}

// Garlanda de llums que parpellegen (només anima opacitat)
const colors = ['#e8453a', '#e9c46a', '#f4ece1', '#e9c46a']
export function Llums() {
  const n = 12, w = 560 / n
  let fil = 'M0 6'
  for (let i = 0; i < n; i++) fil += ` Q${w * i + w / 2} 40 ${w * (i + 1)} 6`
  return (
    <svg viewBox="0 0 560 60" aria-hidden className="pointer-events-none absolute inset-x-0 top-0 w-full">
      <path d={fil} fill="none" stroke="#e9c46a" strokeOpacity=".4" strokeWidth="1.2" />
      {Array.from({ length: n }, (_, i) => (
        <g key={i} style={{ '--d': `${(i * 370) % 2100}ms` }}>
          <circle className="llum-glow" cx={w * i + w / 2} cy="27" r="11" fill={colors[i % 4]} fillOpacity=".35" />
          <circle cx={w * i + w / 2} cy="23.5" r="4.2" fill={colors[i % 4]} />
        </g>
      ))}
    </svg>
  )
}
