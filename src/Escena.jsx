import { useEffect, useRef, useState } from 'react'
import { Peca } from './Decor'
import { obreSo, calla } from './so'

// Escena d'obertura (només la primera vegada de cada porta/regal):
// vola al mig de la pantalla -> tremola amb tensió -> s'obre amb un esclat de llum -> surt el contingut.
// Tocant la pantalla es pot saltar.
export default function Escena({ n, r, regal, v, col, onFi }) {
  const fons = useRef(), item = useRef(), aura = useRef(), flaix = useRef()
  const [oberta, setOberta] = useState(false)
  const fet = useRef(false)
  const fi = (salta) => {
    if (fet.current) return
    fet.current = true
    if (salta) calla()
    onFi()
  }

  useEffect(() => {
    let viu = true
    const anims = []
    const A = (el, kf, o) => { const a = el.animate(kf, o); anims.push(a); return a.finished.catch(() => {}) }

    // Salvaguarda: passi el que passi, l'escena acaba sola (no pot deixar la pantalla bloquejada)
    const guarda = setTimeout(() => { if (viu) fi() }, 4200)

    ;(async () => {
      const vw = innerWidth, vh = innerHeight
      const s = Math.min((vw * 0.7) / r.width, (vh * 0.46) / r.height, 3.4)
      const dx = vw / 2 - (r.left + r.width / 2), dy = vh * 0.44 - (r.top + r.height / 2)
      const base = `translate(${dx}px, ${dy}px) scale(${s})`

      A(fons.current, [{ opacity: 0 }, { opacity: 1 }], { duration: 350, fill: 'forwards' })
      await A(item.current, [{ transform: 'none' }, { transform: base }], { duration: 430, easing: 'cubic-bezier(.3, .9, .3, 1)', fill: 'forwards' })
      if (!viu) return

      // Tensió: l'aura creix i la peça tremola cada cop més fort
      A(aura.current, [{ opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1.2 }], { duration: 800, easing: 'ease-in', fill: 'forwards' })
      const tremol = Array.from({ length: 14 }, (_, i) => {
        const k = i + 1, sg = i % 2 ? 1 : -1
        return { transform: `${base} rotate(${sg * (0.8 + k * 0.5)}deg) translateX(${sg * k * 0.8}px)` }
      })
      await A(item.current, [{ transform: base }, ...tremol, { transform: base }], { duration: 750, fill: 'forwards' })
      if (!viu) return

      // S'obre: transicions CSS (porta gira / tapa salta) + esclat de llum + so
      setOberta(true)
      obreSo(regal)
      A(flaix.current, [{ opacity: 0 }, { opacity: 1, offset: 0.35 }, { opacity: 0 }], { duration: 700 })
      A(item.current, [{ transform: base }, { transform: `translate(${dx}px, ${dy}px) scale(${s * 1.07})`, offset: 0.3 }, { transform: base }], { duration: 500, fill: 'forwards' })
      await new Promise((ok) => setTimeout(ok, 650))
      if (viu) fi()
    })()

    return () => { viu = false; clearTimeout(guarda); anims.forEach((a) => a.cancel()) }
  }, [])

  return (
    <div className="escena" onClick={() => fi(true)} aria-hidden>
      <div ref={fons} className="escena-fons" />
      <div ref={aura} className="escena-aura" />
      <div
        ref={item}
        className={`porta c-${col} ${regal ? 'porta-r' : 'porta-d'} ${v ? (regal ? 'v' : 'd') + v : ''} ${n === 24 ? 'gran' : ''} ${oberta ? 'oberta' : ''} escena-item`}
        style={{ left: r.left, top: r.top, width: r.width, height: r.height }}
      >
        <Peca n={n} regal={regal} />
        {n === 24 && <span className="absolute bottom-3 left-3 z-[2] text-[9px] font-extrabold leading-tight tracking-[.15em] text-[#5a1a10]">EL GRAN<br />DIA</span>}
      </div>
      <div ref={flaix} className="escena-flaix" />
      <p className="escena-salta">Toca per saltar</p>
    </div>
  )
}
