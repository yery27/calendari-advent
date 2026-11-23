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

// Llaç del regal (el color ve de la cinta de cada caixa)
export const Llaç = () => (
  <svg viewBox="0 0 60 40" aria-hidden className="llac" fill="currentColor">
    <path d="M30 26C20 6 2 6 4 20c2 12 20 10 26 6Zm0 0c10-20 28-20 26-6-2 12-20 10-26 6Z" />
    <circle cx="30" cy="25" r="6.5" />
  </svg>
)

// Peces d'una porta o d'un regal (les fan servir la graella i l'escena d'obertura)
export function Peca({ n, regal }) {
  return (
    <>
      {regal ? (
        <>
          <i className="g-glow" />
          <i className="g-cos" />
          <i className="g-tapa"><Llaç /></i>
        </>
      ) : (
        <>
          <i className="dins" />
          <i className="fulla-d" data-n={n}><i className="pom" /></i>
        </>
      )}
      <b className="num">{n}</b>
    </>
  )
}
