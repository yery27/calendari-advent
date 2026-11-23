import { useEffect } from 'react'

const quan = (d) => new Date(d).toLocaleString('ca', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })

// Tauler només per a tu: /#admin
export default function Admin({ portes, cupons, refresca }) {
  useEffect(() => {
    refresca()
    const id = setInterval(refresca, 20000)
    return () => clearInterval(id)
  }, [])

  const llista = Object.entries(portes).filter(([, p]) => p.tipus === 'cupo').map(([d, p]) => ({ dia: +d, ...p, c: cupons[d] })).sort((a, b) => a.dia - b.dia)
  const fets = llista.filter((x) => x.c).length

  return (
    <main className="relative z-[1] mx-auto max-w-[560px] px-4 pb-16 pt-[max(2rem,env(safe-area-inset-top))]">
      <a href="#" className="text-sm text-or">← Calendari</a>
      <h1 className="mt-4 text-5xl font-extrabold tracking-[-.05em]">Tauler</h1>
      <p className="mb-6 mt-1 font-serif italic text-or">{fets} de {llista.length} cupons canviats</p>
      <ul className="space-y-3">
        {llista.map((x) => (
          <li key={x.dia} className={`flex gap-4 rounded-2xl p-4 ${x.c ? 'bg-crema text-vi' : 'bg-granat/80 text-crema/80'}`}>
            <span className="text-3xl font-extrabold leading-none tracking-[-.05em] text-vermell">{x.dia}</span>
            <div className="min-w-0 flex-1">
              <p className="font-serif italic">{x.titol}</p>
              {x.c ? (
                <>
                  <p className="mt-1 text-sm font-bold text-vermell">Canviat · {quan(x.c.canviat_at)}</p>
                  {x.c.nota && <p className="mt-1 text-[15px]">“{x.c.nota}”</p>}
                </>
              ) : <p className="mt-1 text-sm opacity-60">Pendent</p>}
            </div>
          </li>
        ))}
      </ul>
      <button onClick={refresca} className="mt-6 w-full rounded-full bg-vermell py-3.5 font-extrabold active:scale-[.98]">Actualitzar</button>
    </main>
  )
}
