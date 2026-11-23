import { createClient } from '@supabase/supabase-js'
import { hora } from './config'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
const sb = url && key ? createClient(url, key) : null

const ls = (k, v) => {
  try {
    if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null')
    localStorage.setItem(k, JSON.stringify(v))
  } catch { return null }
}

// Dia d'avui dins del calendari: la porta N s'obre el N de desembre a partir de l'hora definida a config.js.
// ?dia=15 a l'URL per provar, només en local (a la web publicada s'ignora).
export function avui(ara = new Date()) {
  const q = import.meta.env.DEV ? +new URLSearchParams(location.search).get('dia') : 0
  if (q) return q
  if (ara.getMonth() === 0) return 24 // gener: tot obert
  if (ara.getMonth() < 11) return 0 // abans de desembre: tot tancat
  return Math.min(Math.max(ara.getDate() - (ara.getHours() < hora ? 1 : 0), 0), 24)
}

export const obertes = () => ls('obertes') || []
export const marcaOberta = (n) => ls('obertes', [...new Set([...obertes(), n])])

// Cupons canviats: { [dia]: { nota, canviat_at } }
export async function carregaCupons() {
  if (!sb) return ls('cupons') || {}
  const { data } = await sb.from('cupons').select('*')
  return Object.fromEntries((data || []).map((r) => [r.dia, r]))
}

export async function canviaCupo(dia, nota) {
  const fila = { dia, nota: nota || null, canviat_at: new Date().toISOString() }
  if (!sb) return ls('cupons', { ...(ls('cupons') || {}), [dia]: fila })
  const { error } = await sb.from('cupons').insert(fila)
  if (error) throw error
}
