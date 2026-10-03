import { useEffect, useState } from 'react'
import { escuchar, agregar, actualizar, borrar, guardarDoc } from '../lib/db.js'
import { PLANES_INICIALES } from '../data/contenido.js'

const CATEGORIAS = ['citas', 'pelis', 'paseo', 'correr', 'postres', 'estadio', 'futbol', 'iglesia', 'selva', 'musica', 'barca', 'perritos']

export default function PlanesPanel() {
  const [lista, setLista] = useState([])
  const [nuevo, setNuevo] = useState({ titulo: '', prior: 'media', fecha: '', categoria: 'postres' })
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const unsub = escuchar('planes', (d) => { if (d) setLista(d) })
    return unsub
  }, [])

  const avisar = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }

  const crear = async () => {
    if (!nuevo.titulo.trim()) { avisar('escribe un plan'); return }
    try {
      await agregar('planes', { ...nuevo, hecho: false, creado: Date.now() })
      setNuevo({ titulo: '', prior: 'media', fecha: '', categoria: 'postres' })
      avisar('plan agregado ✓')
    } catch (e) { avisar('error: ' + e.message) }
  }

  const set = (id, campo, valor) =>
    actualizar('planes', id, { [campo]: valor }).catch((e) => avisar('error: ' + e.message))

  const eliminar = (p) => {
    if (!confirm(`¿Borrar el plan "${p.titulo}"?`)) return
    borrar('planes', p.id).catch((e) => avisar('error: ' + e.message))
  }

  const restaurar = async () => {
    if (!confirm('¿Agregar los 9 planes iniciales? Los existentes no se borran.')) return
    try {
      await Promise.all(PLANES_INICIALES.map((p) => guardarDoc('planes', p.id, p)))
      avisar('planes iniciales cargados ✓')
    } catch (e) { avisar('error: ' + e.message) }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-[24px] border border-rosa-claro p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display font-bold text-2xl">Agregar plan</h2>
          <button onClick={restaurar} className="text-sm bg-crema border border-rosa-claro px-4 py-2 rounded-full hover:bg-rosa-claro/40">
            ♻︎ restaurar planes iniciales
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <input value={nuevo.titulo} onChange={(e) => setNuevo({ ...nuevo, titulo: e.target.value })}
            placeholder="ej: Ver la final del Barça en el estadio"
            className="flex-1 min-w-[220px] bg-crema border border-rosa-claro rounded-full px-4 py-2.5 outline-none focus:border-rosa" />
          <select value={nuevo.prior} onChange={(e) => setNuevo({ ...nuevo, prior: e.target.value })}
            className="bg-crema border border-rosa-claro rounded-full px-3 py-2.5">
            <option value="alta">prior alta</option><option value="media">prior media</option><option value="baja">prior baja</option>
          </select>
          <select value={nuevo.categoria} onChange={(e) => setNuevo({ ...nuevo, categoria: e.target.value })}
            className="bg-crema border border-rosa-claro rounded-full px-3 py-2.5">
            {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="date" value={nuevo.fecha} onChange={(e) => setNuevo({ ...nuevo, fecha: e.target.value })}
            className="bg-crema border border-rosa-claro rounded-full px-3 py-2.5" />
          <button onClick={crear} className="bg-rosa text-white px-6 py-2.5 rounded-full font-bold hover:bg-rosa/90">agregar</button>
        </div>
        {msg && <p className="text-sm font-semibold text-cancha mt-2">{msg}</p>}
      </div>

      <div className="bg-white rounded-[24px] border border-rosa-claro p-5 shadow-sm">
        <h2 className="font-display font-bold text-xl mb-3">
          Todos los planes <span className="bg-rosa text-white text-xs px-2 py-1 rounded-full align-middle">{lista.length}</span>
        </h2>
        {lista.length === 0 && <p className="text-sm text-tinta/50">Firestore está vacío. Usa “restaurar planes iniciales” o agrega uno.</p>}
        <div className="space-y-3">
          {lista.map((p) => (
            <div key={p.id} className="rounded-2xl border border-rosa-claro/70 bg-crema p-3 flex flex-wrap gap-2 items-center">
              <button
                onClick={() => set(p.id, 'hecho', !p.hecho)}
                className={`w-9 h-9 rounded-full border-2 grid place-items-center font-bold ${
                  p.hecho ? 'bg-cancha border-cancha text-white' : 'border-rosa-claro hover:bg-rosa hover:text-white hover:border-rosa'
                }`}
                title="marcar hecho"
              >{p.hecho ? '✓' : '✔'}</button>
              <input defaultValue={p.titulo || ''} placeholder="título" onBlur={(e) => set(p.id, 'titulo', e.target.value)}
                className="flex-1 min-w-[180px] bg-white border border-rosa-claro rounded-full px-4 py-2 text-sm outline-none focus:border-rosa" />
              <select defaultValue={p.prior || 'media'} onBlur={(e) => set(p.id, 'prior', e.target.value)}
                className="bg-white border border-rosa-claro rounded-full px-3 py-2 text-sm">
                <option value="alta">alta</option><option value="media">media</option><option value="baja">baja</option>
              </select>
              <select defaultValue={p.categoria || 'postres'} onBlur={(e) => set(p.id, 'categoria', e.target.value)}
                className="bg-white border border-rosa-claro rounded-full px-3 py-2 text-sm">
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="date" defaultValue={p.fecha || ''} onBlur={(e) => set(p.id, 'fecha', e.target.value)}
                className="bg-white border border-rosa-claro rounded-full px-3 py-2 text-sm" />
              <button onClick={() => eliminar(p)}
                className="w-9 h-9 rounded-full border bg-white text-tinta/50 hover:text-white hover:bg-rosa hover:border-rosa">✕</button>
            </div>
          ))}
        </div>
        <p className="text-xs text-tinta/50 mt-3">Cambios guardados al salir del campo • se sincronizan en tiempo real con el sitio.</p>
      </div>
    </div>
  )
}
