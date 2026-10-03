import { useEffect, useState } from 'react'
import { escuchar, agregar, actualizar, borrar, subirArchivo, porOrden, urlDe } from '../lib/db.js'

export default function FotosPanel() {
  const [lista, setLista] = useState([])
  const [urls, setUrls] = useState({})
  const [planes, setPlanes] = useState([])
  const [prog, setProg] = useState(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const unsubFotos = escuchar('fotos', (d) => { if (d) setLista([...d].sort(porOrden)) })
    const unsubPlanes = escuchar('planes', (d) => { if (d) setPlanes(d) })
    return () => { unsubFotos?.(); unsubPlanes?.() }
  }, [])

  useEffect(() => {
    let cancelado = false
    Promise.all(lista.map((f) => urlDe(f.url).then((u) => [f.id, u])))
      .then((pairs) => { if (!cancelado) setUrls(Object.fromEntries(pairs)) })
    return () => { cancelado = true }
  }, [lista])

  const avisar = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }

  const subir = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    let orden = Math.max(0, ...lista.map((x) => x.orden ?? 0))
    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      setProg({ pct: 0, nombre: f.name, idx: i + 1, total: files.length })
      try {
        const url = await subirArchivo(`fotos/${Date.now()}_${f.name}`, f, (pct) =>
          setProg({ pct, nombre: f.name, idx: i + 1, total: files.length }))
        orden += 1
        await agregar('fotos', { url, titulo: f.name.replace(/\.[^.]+$/, ''), sub: '', orden })
      } catch (err) {
        avisar('error con ' + f.name + ': ' + err.message)
      }
    }
    setProg(null)
    avisar('fotos subidas ✓')
    e.target.value = ''
  }

  const set = (id, campo, valor) =>
    actualizar('fotos', id, { [campo]: valor }).catch((e) => avisar('error: ' + e.message))

  const mover = async (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= lista.length) return
    const a = lista[i], b = lista[j]
    await Promise.all([
      actualizar('fotos', a.id, { orden: j + 1 }),
      actualizar('fotos', b.id, { orden: i + 1 }),
    ])
  }

  const eliminar = (f) => {
    if (!confirm(`¿Borrar la foto "${f.titulo}"?`)) return
    borrar('fotos', f.id).catch((e) => avisar('error: ' + e.message))
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-[24px] border border-rosa-claro p-5 shadow-sm">
        <h2 className="font-display font-bold text-2xl">Subir fotos</h2>
        <p className="text-sm text-tinta/60 mt-1">Puedes elegir varias a la vez. Aparecen en la galería al instante.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="bg-tinta text-white px-5 py-2.5 rounded-full text-sm font-bold cursor-pointer hover:bg-tinta/90">
            📸 subir imágenes
            <input type="file" accept="image/*" multiple className="hidden" onChange={subir} />
          </label>
          {msg && <span className="text-sm font-semibold text-cancha">{msg}</span>}
        </div>
        {prog && (
          <div className="mt-3">
            <div className="text-xs text-tinta/60 mb-1">
              subiendo {prog.nombre} — foto {prog.idx}/{prog.total} — {prog.pct}%
            </div>
            <div className="h-2 bg-crema rounded-full overflow-hidden">
              <div className="h-full bg-rosa transition-all" style={{ width: prog.pct + '%' }} />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[24px] border border-rosa-claro p-5 shadow-sm">
        <h2 className="font-display font-bold text-xl mb-3">
          Galería <span className="bg-rosa text-white text-xs px-2 py-1 rounded-full align-middle">{lista.length}</span>
        </h2>
        {lista.length === 0 && <p className="text-sm text-tinta/50">Aún no hay fotos en Firebase.</p>}
        <div className="grid sm:grid-cols-2 gap-3">
          {lista.map((f, i) => (
            <div key={f.id} className="rounded-2xl border border-rosa-claro/70 bg-crema p-3">
              <div className="flex gap-3">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-white border border-white shadow-sm shrink-0">
                  {urls[f.id] && <img src={urls[f.id]} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <input defaultValue={f.titulo || ''} placeholder="título" onBlur={(e) => set(f.id, 'titulo', e.target.value)}
                    className="w-full bg-white border border-rosa-claro rounded-full px-3 py-1.5 text-sm outline-none focus:border-rosa" />
                <input defaultValue={f.sub || ''} placeholder="subtítulo" onBlur={(e) => set(f.id, 'sub', e.target.value)}
                  className="w-full bg-white border border-rosa-claro rounded-full px-3 py-1.5 text-sm outline-none focus:border-rosa" />
                <select defaultValue={f.actividad || ''} onBlur={(e) => set(f.id, 'actividad', e.target.value)}
                  className="w-full bg-white border border-rosa-claro rounded-full px-3 py-1.5 text-sm outline-none focus:border-rosa">
                  <option value="">sin actividad vinculada</option>
                  {planes.map((p) => <option key={p.id} value={p.id}>{p.hecho ? '✓' : '○'} {p.titulo}</option>)}
                </select>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex gap-1">
                  <button onClick={() => mover(i, -1)} className="w-8 h-8 rounded-full border bg-white hover:bg-rosa-claro/40">↑</button>
                  <button onClick={() => mover(i, 1)} className="w-8 h-8 rounded-full border bg-white hover:bg-rosa-claro/40">↓</button>
                </div>
                <input defaultValue={f.url || ''} placeholder="ruta/URL" onBlur={(e) => set(f.id, 'url', e.target.value)}
                  className="bg-white border border-rosa-claro rounded-full px-3 py-1.5 text-xs outline-none focus:border-rosa flex-1 mx-2 min-w-0" />
                <button onClick={() => eliminar(f)} className="w-9 h-9 rounded-full border bg-white text-tinta/50 hover:text-white hover:bg-rosa hover:border-rosa">✕</button>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-tinta/50 mt-3">El primer orden es la foto grande de la galería.</p>
      </div>
    </div>
  )
}
