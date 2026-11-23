import { useState } from 'react'
import { per } from './config'

export default function Entrada({ prova }) {
  const [v, setV] = useState('')
  const [error, setError] = useState(false)
  const [carrega, setCarrega] = useState(false)

  const envia = async (e) => {
    e.preventDefault()
    setCarrega(true)
    setError(!(await prova(v)))
    setCarrega(false)
  }

  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <form onSubmit={envia} className="vel w-full max-w-[340px] text-center">
        <p className="text-[11px] font-extrabold uppercase tracking-[.35em] text-or/90">Per a</p>
        <h1 className="my-1 text-6xl font-extrabold tracking-[-.05em]">{per}</h1>
        <p className="mb-6 font-serif text-lg italic text-or">Quin és el nostre dia?</p>
        <input
          value={v}
          onChange={(e) => { setV(e.target.value); setError(false) }}
          inputMode="numeric"
          autoComplete="off"
          placeholder="dd/mm/aaaa"
          aria-label="Data"
          className={`w-full rounded-full border bg-black/20 px-5 py-3.5 text-center text-[18px] tracking-widest text-crema outline-none placeholder:tracking-normal placeholder:text-crema/35 focus:border-or ${error ? 'border-vermell' : 'border-crema/25'}`}
        />
        <p className="mt-3 h-5 text-sm text-vermell">{error && 'Aquesta no és la data, torna-ho a provar.'}</p>
        <button disabled={carrega} className="mt-2 w-full rounded-full bg-vermell py-3.5 font-extrabold active:scale-[.98] disabled:opacity-60">
          {carrega ? 'Obrint…' : 'Entrar'}
        </button>
      </form>
    </main>
  )
}
