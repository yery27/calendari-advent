import { useState } from 'react'
import { per } from './config'

const MESOS = ['gener', 'febrer', 'març', 'abril', 'maig', 'juny', 'juliol', 'agost', 'setembre', 'octubre', 'novembre', 'desembre']
const DIES = Array.from({ length: 31 }, (_, i) => i + 1)
const ANYS = Array.from({ length: 13 }, (_, i) => 2027 - i) // 2027 ... 2015
const pad = (n) => String(n).padStart(2, '0')

const Selector = ({ valor, canvia, buit, children, etiqueta }) => (
  <select
    value={valor}
    onChange={(e) => canvia(e.target.value)}
    aria-label={etiqueta}
    className={`w-full appearance-none rounded-full border bg-black/20 px-2 py-3.5 text-center text-[16px] outline-none focus:border-or ${valor ? 'text-crema' : 'text-crema/45'} border-crema/25`}
  >
    <option value="" className="bg-vi text-crema/60">{buit}</option>
    {children}
  </select>
)

export default function Entrada({ prova }) {
  const [d, setD] = useState('')
  const [m, setM] = useState('')
  const [a, setA] = useState('')
  const [error, setError] = useState(false)
  const [carrega, setCarrega] = useState(false)
  const complet = d && m && a

  const tria = (set) => (v) => { set(v); setError(false) }
  const envia = async (e) => {
    e.preventDefault()
    if (!complet) return
    setCarrega(true)
    setError(!(await prova(`${pad(d)}${pad(m)}${a}`)))
    setCarrega(false)
  }

  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <form onSubmit={envia} className="vel w-full max-w-[360px] text-center" style={{ colorScheme: 'dark' }}>
        <p className="text-[11px] font-extrabold uppercase tracking-[.35em] text-or/90">Per a</p>
        <h1 className="my-1 text-6xl font-extrabold tracking-[-.05em]">{per}</h1>
        <p className="mb-6 font-serif text-lg italic text-or">Quin és el nostre dia?</p>
        <div className="grid grid-cols-[1fr_1.7fr_1.2fr] gap-2">
          <Selector valor={d} canvia={tria(setD)} buit="Dia" etiqueta="Dia">
            {DIES.map((x) => <option key={x} value={x} className="bg-vi text-crema">{x}</option>)}
          </Selector>
          <Selector valor={m} canvia={tria(setM)} buit="Mes" etiqueta="Mes">
            {MESOS.map((x, i) => <option key={x} value={i + 1} className="bg-vi text-crema">{x}</option>)}
          </Selector>
          <Selector valor={a} canvia={tria(setA)} buit="Any" etiqueta="Any">
            {ANYS.map((x) => <option key={x} value={x} className="bg-vi text-crema">{x}</option>)}
          </Selector>
        </div>
        <p className="mt-3 h-5 text-sm text-vermell">{error && 'Aquesta no és la data, torna-ho a provar.'}</p>
        <button disabled={carrega || !complet} className="mt-2 w-full rounded-full bg-vermell py-3.5 font-extrabold active:scale-[.98] disabled:opacity-50">
          {carrega ? 'Obrint…' : 'Entrar'}
        </button>
      </form>
    </main>
  )
}
