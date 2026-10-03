import { useEffect, useRef, useState } from 'react'
import { escuchar, agregar, actualizar, borrar, subirArchivo, porOrden } from '../lib/db.js'

export default function CancionesPanel() {
  const [lista, setLista] = useState([])
  const [nueva, setNueva] = useState({ artista: '', titulo: '', color: '#FF8FA3', url: '' })
  const [prog, setProg] = useState(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const unsub = escuchar('canciones', (d) => { if (d) setLista([...d].sort(porOrden)) })
    return unsub
  }, [])

  const avisar = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }

  const onArchivo = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setProg({ pct: 0, nombre: f.name })
    try {
      const url = await subirArchivo(`canciones/${Date.now()}_${f.name}`, f, (pct) => setProg({ pct, nombre: f.name }))
      setNueva((n) => ({ ...n, url }))
      avisar('archivo subido ✓')
    } catch (err) {
      avisar('error al subir: ' + err.message)
    } finally {
      setProg(null)
      e.target.value = ''
    }
  }

  const crear = async () => {
    if (!nueva.titulo.trim()) { avisar('ponle un título'); return }
    const orden = Math.max(0, ...lista.map((x) => x.orden ?? 0)) + 1
    try {
      await agregar('canciones', { ...nueva, orden })
      setNueva({ artista: '', titulo: '', color: '#FF8FA3', url: '' })
      avisar('canción agregada ✓')
    } catch (e) { avisar('error: ' + e.message) }
  }

  const set = (id, campo, valor) =>
    actualizar('canciones', id, { [campo]: valor }).catch((e) => avisar('error: ' + e.message))

  const mover = async (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= lista.length) return
    const a = lista[i], b = lista[j]
    await Promise.all([
      actualizar('canciones', a.id, { orden: j + 1 }),
      actualizar('canciones', b.id, { orden: i + 1 }),
    ])
  }

  const eliminar = (c) => {
    if (!confirm(`¿Borrar "${c.titulo}"?`)) return
    borrar('canciones', c.id).catch((e) => avisar('error: ' + e.message))
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-[24px] border border-rosa-claro p-5 shadow-sm">
        <h2 className="font-display font-bold text-2xl">Agregar canción</h2>
        <div className="grid md:grid-cols-2 gap-3 mt-4">
          <input value={nueva.artista} onChange={(e) => setNueva({ ...nueva, artista: e.target.value })}
            placeholder="Artista" className="bg-crema border border-rosa-claro rounded-full px-4 py-2.5 outline-none focus:border-rosa" />
          <input value={nueva.titulo} onChange={(e) => setNueva({ ...nueva, titulo: e.target.value })}
            placeholder="Título" className="bg-crema border border-rosa-claro rounded-full px-4 py-2.5 outline-none focus:border-rosa" />
          <div className="flex items-center gap-2">
            <input type="color" value={nueva.color} onChange={(e) => setNueva({ ...nueva, color: e.target.value })}
              className="w-12 h-10 rounded cursor-pointer bg-crema border border-rosa-claro" />
            <span className="text-xs text-tinta/60">color del vinilo</span>
          </div>
          <input value={nueva.url} onChange={(e) => setNueva({ ...nueva, url: e.target.value })}
            placeholder="URL del audio (o se llena al subir)" className="bg-crema border border-rosa-claro rounded-full px-4 py-2.5 outline-none focus:border-rosa" />
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4">
          <label className="bg-tinta text-white px-5 py-2.5 rounded-full text-sm font-bold cursor-pointer hover:bg-tinta/90">
            🎵 subir MP3
            <input type="file" accept="audio/*" className="hidden" onChange={onArchivo} />
          </label>
          <button onClick={crear} className="bg-rosa text-white px-6 py-2.5 rounded-full font-bold hover:bg-rosa/90">
            agregar
          </button>
          {msg && <span className="text-sm font-semibold text-cancha">{msg}</span>}
        </div>

        {prog && (
          <div className="mt-3">
            <div className="text-xs text-tinta/60 mb-1">subiendo {prog.nombre} — {prog.pct}%</div>
            <div className="h-2 bg-crema rounded-full overflow-hidden">
              <div className="h-full bg-rosa transition-all" style={{ width: prog.pct + '%' }} />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[24px] border border-rosa-claro p-5 shadow-sm">
        <h2 className="font-display font-bold text-xl mb-3">
          Canciones <span className="bg-rosa text-white text-xs px-2 py-1 rounded-full align-middle">{lista.length}</span>
        </h2>
        {lista.length === 0 && (
          <p className="text-sm text-tinta/50">Aún no hay canciones. Sube tu primer MP3 arriba 👆</p>
        )}
        <div className="space-y-3">
          {lista.map((c, i) => (
            <div key={c.id} className="rounded-2xl border border-rosa-claro/70 bg-crema p-3 grid md:grid-cols-[auto_1fr_1fr_auto_auto_auto] gap-2 items-center">
              <input type="color" defaultValue={c.color || '#FF8FA3'} onBlur={(e) => set(c.id, 'color', e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border border-white" title="color" />
              <input defaultValue={c.artista || ''} placeholder="artista" onBlur={(e) => set(c.id, 'artista', e.target.value)}
                className="bg-white border border-rosa-claro rounded-full px-3 py-2 text-sm outline-none focus:border-rosa" />
              <input defaultValue={c.titulo || ''} placeholder="título" onBlur={(e) => set(c.id, 'titulo', e.target.value)}
                className="bg-white border border-rosa-claro rounded-full px-3 py-2 text-sm outline-none focus:border-rosa" />
              <div className="flex gap-1">
                <button onClick={() => mover(i, -1)} className="w-8 h-8 rounded-full border bg-white hover:bg-rosa-claro/40" title="subir">↑</button>
                <button onClick={() => mover(i, 1)} className="w-8 h-8 rounded-full border bg-white hover:bg-rosa-claro/40" title="bajar">↓</button>
              </div>
              <input defaultValue={c.url || ''} placeholder="ruta/URL del audio" onBlur={(e) => set(c.id, 'url', e.target.value)}
                className="bg-white border border-rosa-claro rounded-full px-3 py-2 text-xs outline-none focus:border-rosa md:w-56" />
              <button onClick={() => eliminar(c)} className="w-9 h-9 rounded-full border bg-white text-tinta/50 hover:text-white hover:bg-rosa hover:border-rosa" title="borrar">✕</button>
            </div>
          ))}
        </div>
        <p className="text-xs text-tinta/50 mt-3">Los cambios se guardan solitos al salir del campo.</p>
      </div>
    </div>
  )
}
