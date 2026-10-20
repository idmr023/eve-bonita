import { useEffect, useRef, useState } from 'react'
import { escuchar, agregar, actualizar, borrar, guardarDoc, porOrden } from '../lib/db.js'
import { CARTAS_INICIALES } from '../data/contenido.js'

const COLORES = ['#FF8FA3', '#F5D67B', '#7EB8A2', '#C9A0DC', '#FFB88C', '#2B2D42']

const VACIA = { titulo: '', sub: '', emoji: '💌', color: '#FF8FA3', texto: '', firma: 'siempre tuyo, Iván' }

export default function CartasPanel() {
  const [lista, setLista] = useState([])
  const [nueva, setNueva] = useState(VACIA)
  const [editando, setEditando] = useState(null)
  const [msg, setMsg] = useState('')
  const timer = useRef(null)

  useEffect(() => {
    const unsub = escuchar('cartas', (d) => { if (d) setLista([...d].sort(porOrden)) })
    return unsub
  }, [])

  const avisar = (m) => {
    setMsg(m)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setMsg(''), 3000)
  }

  const crear = async () => {
    if (!nueva.titulo.trim()) { avisar('ponle un título'); return }
    if (!nueva.texto.trim()) { avisar('escribe el texto de la cartita'); return }
    const id = 'carta-' + Date.now()
    const orden = Math.max(0, ...lista.map((x) => x.orden ?? 0)) + 1
    try {
      await agregar('cartas', { id, ...nueva, orden })
      setNueva(VACIA)
      avisar('cartita agregada ✓')
    } catch (e) { avisar('error: ' + e.message) }
  }

  const set = (id, campo, valor) =>
    actualizar('cartas', id, { [campo]: valor }).catch((e) => avisar('error: ' + e.message))

  const mover = async (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= lista.length) return
    const a = lista[i], b = lista[j]
    await Promise.all([
      actualizar('cartas', a.id, { orden: j + 1 }),
      actualizar('cartas', b.id, { orden: i + 1 }),
    ])
  }

  const eliminar = (c) => {
    if (!confirm(`¿Borrar la cartita "${c.titulo}"?`)) return
    borrar('cartas', c.id).catch((e) => avisar('error: ' + e.message))
  }

  const restaurar = async () => {
    if (!confirm('¿Cargar las 3 cartitas iniciales? Las existentes no se borran.')) return
    try {
      await Promise.all(CARTAS_INICIALES.map((c) => guardarDoc('cartas', c.id, c)))
      avisar('cartitas iniciales cargadas ✓')
    } catch (e) { avisar('error: ' + e.message) }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-[24px] border border-rosa-claro p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display font-bold text-2xl">Agregar cartita</h2>
          <button onClick={restaurar} className="text-sm bg-crema border border-rosa-claro px-4 py-2 rounded-full hover:bg-rosa-claro/40">
            ♻︎ restaurar 3 iniciales
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-3 mt-4">
          <input value={nueva.titulo} onChange={(e) => setNueva({ ...nueva, titulo: e.target.value })}
            placeholder="Título (ej: Para cuando dudes de ti)"
            className="bg-crema border border-rosa-claro rounded-full px-4 py-2.5 outline-none focus:border-rosa" />
          <input value={nueva.sub} onChange={(e) => setNueva({ ...nueva, sub: e.target.value })}
            placeholder="Subtítulo (ej: porque te veo y no me cabe en el pecho)"
            className="bg-crema border border-rosa-claro rounded-full px-4 py-2.5 outline-none focus:border-rosa" />
          <div className="flex items-center gap-2">
            <input value={nueva.emoji} onChange={(e) => setNueva({ ...nueva, emoji: e.target.value })}
              placeholder="💌" className="w-20 bg-crema border border-rosa-claro rounded-full px-3 py-2.5 outline-none focus:border-rosa text-center" />
            <input type="color" value={nueva.color} onChange={(e) => setNueva({ ...nueva, color: e.target.value })}
              className="w-12 h-10 rounded cursor-pointer bg-crema border border-rosa-claro" title="color" />
            <input value={nueva.firma} onChange={(e) => setNueva({ ...nueva, firma: e.target.value })}
              placeholder="firma" className="flex-1 bg-crema border border-rosa-claro rounded-full px-4 py-2.5 outline-none focus:border-rosa" />
          </div>
        </div>

        <textarea value={nueva.texto} onChange={(e) => setNueva({ ...nueva, texto: e.target.value })}
          rows={8} placeholder="Escribe aquí la cartita… (los saltos de línea se respetan)"
          className="w-full mt-3 bg-crema border border-rosa-claro rounded-2xl p-4 text-[14px] leading-relaxed outline-none focus:border-rosa resize-y" />

        <div className="flex flex-wrap items-center gap-3 mt-3">
          <button onClick={crear} className="bg-rosa text-white px-6 py-2.5 rounded-full font-bold hover:bg-rosa/90">agregar cartita</button>
          {msg && <span className="text-sm font-semibold text-cancha">{msg}</span>}
        </div>
      </div>

      <div className="bg-white rounded-[24px] border border-rosa-claro p-5 shadow-sm">
        <h2 className="font-display font-bold text-xl mb-3">
          Cartitas <span className="bg-rosa text-white text-xs px-2 py-1 rounded-full align-middle">{lista.length}</span>
        </h2>
        {lista.length === 0 && (
          <p className="text-sm text-tinta/50">Aún no hay cartitas. Usa “restaurar 3 iniciales” o agrega una arriba 👆</p>
        )}
        <div className="space-y-3">
          {lista.map((c, i) => (
            <div key={c.id} className="rounded-2xl border border-rosa-claro/70 bg-crema p-4">
              <div className="flex flex-wrap items-center gap-2">
                <input value={c.emoji || '💌'} onBlur={(e) => set(c.id, 'emoji', e.target.value)}
                  className="w-16 bg-white border border-rosa-claro rounded-full px-2 py-1.5 text-center outline-none focus:border-rosa" />
                <input defaultValue={c.titulo || ''} placeholder="título" onBlur={(e) => set(c.id, 'titulo', e.target.value)}
                  className="flex-1 min-w-[180px] bg-white border border-rosa-claro rounded-full px-4 py-2 text-sm outline-none focus:border-rosa" />
                <input type="color" defaultValue={c.color || '#FF8FA3'} onBlur={(e) => set(c.id, 'color', e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border border-white" title="color" />
                <div className="flex gap-1">
                  <button onClick={() => mover(i, -1)} className="w-8 h-8 rounded-full border bg-white hover:bg-rosa-claro/40" title="subir">↑</button>
                  <button onClick={() => mover(i, 1)} className="w-8 h-8 rounded-full border bg-white hover:bg-rosa-claro/40" title="bajar">↓</button>
                </div>
                <button onClick={() => eliminar(c)} className="w-9 h-9 rounded-full border bg-white text-tinta/50 hover:text-white hover:bg-rosa hover:border-rosa" title="borrar">✕</button>
              </div>

              <input defaultValue={c.sub || ''} placeholder="subtítulo" onBlur={(e) => set(c.id, 'sub', e.target.value)}
                className="w-full mt-2 bg-white border border-rosa-claro rounded-full px-4 py-2 text-sm outline-none focus:border-rosa" />
              <input defaultValue={c.firma || ''} placeholder="firma" onBlur={(e) => set(c.id, 'firma', e.target.value)}
                className="w-full mt-2 bg-white border border-rosa-claro rounded-full px-4 py-2 text-sm outline-none focus:border-rosa" />

              <textarea
                defaultValue={c.texto || ''}
                rows={editando === c.id ? 10 : 3}
                placeholder="texto de la cartita…"
                onFocus={() => setEditando(c.id)}
                onBlur={(e) => { set(c.id, 'texto', e.target.value); setEditando(null) }}
                className="w-full mt-2 bg-white border border-rosa-claro rounded-2xl p-4 text-[14px] leading-relaxed outline-none focus:border-rosa resize-y"
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-tinta/50 mt-3">Cambios guardados al salir del campo • se sincronizan en tiempo real con el sitio.</p>
      </div>
    </div>
  )
}
