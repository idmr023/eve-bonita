import { useEffect, useState } from 'react'
import { escuchar, agregar, actualizar, borrar, guardarDoc, porOrden } from '../lib/db.js'
import { CARTAS_INICIALES } from '../data/contenido.js'

const EMOJIS = ['💌', '💛', '🌹', '💐', '✨', '🥰', '😻', '🎀', '🌙', '⭐', '💍', '🍫', '🎂', '🌻', '🕊️', '💋']

const VACIA = {
  titulo: '',
  sub: '',
  emoji: '💌',
  fecha: '',
  texto: '',
  firma: '',
  destacado: false,
}

export default function CartasPanel() {
  const [lista, setLista] = useState([])
  const [nueva, setNueva] = useState(VACIA)
  const [editando, setEditando] = useState(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const unsub = escuchar('cartas', (d) => { if (d) setLista([...d].sort(porOrden)) })
    return unsub
  }, [])

  const avisar = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }

  const crear = async () => {
    if (!nueva.titulo.trim() && !nueva.texto.trim()) { avisar('escribe algo primero'); return }
    try {
      const orden = Math.max(0, ...lista.map((c) => c.orden ?? 0)) + 1
      await agregar('cartas', { ...nueva, orden, creado: Date.now() })
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
    try {
      await Promise.all([
        actualizar('cartas', a.id, { orden: j + 1 }),
        actualizar('cartas', b.id, { orden: i + 1 }),
      ])
    } catch (e) { avisar('error: ' + e.message) }
  }

  const eliminar = (c) => {
    if (!confirm(`¿Borrar la cartita "${c.titulo}"?`)) return
    borrar('cartas', c.id).catch((e) => avisar('error: ' + e.message))
  }

  const restaurar = async () => {
    if (!confirm('¿Cargar la cartita inicial? Si ya existe, se sobrescribe.')) return
    try {
      for (const c of CARTAS_INICIALES) {
        await guardarDoc('cartas', c.id, { ...c, creado: c.creado ?? Date.now() })
      }
      avisar('cartita inicial cargada ✓')
    } catch (e) { avisar('error: ' + e.message) }
  }

  return (
    <div className="space-y-4">
      {/* nueva cartita */}
      <div className="bg-white rounded-[24px] border border-rosa-claro p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display font-bold text-2xl">Escribir nueva cartita</h2>
          <button onClick={restaurar} className="text-sm bg-crema border border-rosa-claro px-4 py-2 rounded-full hover:bg-rosa-claro/40">
            ♻︎ cargar cartita inicial
          </button>
        </div>
        <p className="text-sm text-tinta/60 mt-1">
          Esto se guarda en Firestore y aparece al instante en la página de cartitas.
        </p>

        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          <input
            value={nueva.titulo}
            onChange={(e) => setNueva({ ...nueva, titulo: e.target.value })}
            placeholder="Título (ej: Para cuando estés triste)"
            className="bg-crema border border-rosa-claro rounded-full px-4 py-2.5 outline-none focus:border-rosa"
          />
          <input
            value={nueva.sub}
            onChange={(e) => setNueva({ ...nueva, sub: e.target.value })}
            placeholder="Subtítulo (ej: para leer en la madrugada)"
            className="bg-crema border border-rosa-claro rounded-full px-4 py-2.5 outline-none focus:border-rosa"
          />
          <input
            type="date"
            value={nueva.fecha}
            onChange={(e) => setNueva({ ...nueva, fecha: e.target.value })}
            className="bg-crema border border-rosa-claro rounded-full px-4 py-2.5 outline-none focus:border-rosa"
          />
          <input
            value={nueva.firma}
            onChange={(e) => setNueva({ ...nueva, firma: e.target.value })}
            placeholder="Firma (ej: siempre tuyo, Iván)"
            className="bg-crema border border-rosa-claro rounded-full px-4 py-2.5 outline-none focus:border-rosa"
          />
        </div>

        {/* emojis */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => setNueva({ ...nueva, emoji: e })}
              className={`w-9 h-9 rounded-full text-lg grid place-items-center border transition ${
                nueva.emoji === e ? 'bg-rosa border-rosa scale-110' : 'bg-crema border-rosa-claro hover:bg-rosa-claro/40'
              }`}
            >
              {e}
            </button>
          ))}
        </div>

        <textarea
          value={nueva.texto}
          onChange={(e) => setNueva({ ...nueva, texto: e.target.value })}
          rows={14}
          placeholder="Escribe la cartita aquí…"
          className="w-full mt-3 bg-crema border border-rosa-claro rounded-2xl p-4 text-[14px] leading-relaxed outline-none focus:border-rosa resize-y"
        />

        <div className="flex flex-wrap items-center gap-3 mt-3">
          <label className="flex items-center gap-2 text-sm text-tinta/70 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={nueva.destacado}
              onChange={(e) => setNueva({ ...nueva, destacado: e.target.checked })}
              className="w-4 h-4 accent-[#FF8FA3]"
            />
            destacar (sale primero)
          </label>
          <button onClick={crear} className="ml-auto bg-rosa text-white px-6 py-2.5 rounded-full font-bold hover:bg-rosa/90">
            publicar cartita
          </button>
          {msg && <span className="text-sm font-semibold text-cancha">{msg}</span>}
        </div>
      </div>

      {/* lista */}
      <div className="bg-white rounded-[24px] border border-rosa-claro p-5 shadow-sm">
        <h2 className="font-display font-bold text-xl mb-3">
          Todas las cartitas <span className="bg-rosa text-white text-xs px-2 py-1 rounded-full align-middle">{lista.length}</span>
        </h2>
        {lista.length === 0 && (
          <p className="text-sm text-tinta/50">
            Firestore está vacío. Escribe una arriba o usa “cargar cartita inicial”.
          </p>
        )}

        <div className="space-y-3">
          {lista.map((c, i) => {
            const abierto = editando === c.id
            return (
              <div key={c.id} className="rounded-2xl border border-rosa-claro/70 bg-crema p-3">
                <div className="flex flex-wrap gap-2 items-center">
                  <button
                    onClick={() => set(c.id, 'destacado', !c.destacado)}
                    className={`w-9 h-9 rounded-full border-2 grid place-items-center font-bold shrink-0 ${
                      c.destacado ? 'bg-dorado border-dorado text-tinta' : 'border-rosa-claro text-tinta/40 hover:border-rosa'
                    }`}
                    title="destacar"
                  >
                    {c.destacado ? '★' : '☆'}
                  </button>

                  <input
                    defaultValue={c.emoji || '💌'}
                    onBlur={(e) => set(c.id, 'emoji', e.target.value)}
                    className="w-11 h-9 text-center bg-white border border-rosa-claro rounded-full outline-none focus:border-rosa shrink-0"
                  />

                  <input
                    defaultValue={c.titulo || ''}
                    placeholder="título"
                    onBlur={(e) => set(c.id, 'titulo', e.target.value)}
                    className="flex-1 min-w-[160px] bg-white border border-rosa-claro rounded-full px-4 py-2 text-sm outline-none focus:border-rosa"
                  />

                  <input
                    defaultValue={c.sub || ''}
                    placeholder="subtítulo"
                    onBlur={(e) => set(c.id, 'sub', e.target.value)}
                    className="flex-1 min-w-[140px] bg-white border border-rosa-claro rounded-full px-4 py-2 text-sm outline-none focus:border-rosa"
                  />

                  <input
                    type="date"
                    defaultValue={c.fecha || ''}
                    onBlur={(e) => set(c.id, 'fecha', e.target.value)}
                    className="bg-white border border-rosa-claro rounded-full px-3 py-2 text-sm outline-none focus:border-rosa"
                  />

                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => mover(i, -1)} className="w-8 h-8 rounded-full border bg-white hover:bg-rosa-claro/40">↑</button>
                    <button onClick={() => mover(i, 1)} className="w-8 h-8 rounded-full border bg-white hover:bg-rosa-claro/40">↓</button>
                    <button
                      onClick={() => setEditando(abierto ? null : c.id)}
                      className={`w-8 h-8 rounded-full border ${abierto ? 'bg-rosa text-white border-rosa' : 'bg-white hover:bg-rosa-claro/40'}`}
                      title="editar texto"
                    >
                      ✎
                    </button>
                    <button onClick={() => eliminar(c)} className="w-8 h-8 rounded-full border bg-white text-tinta/50 hover:text-white hover:bg-rosa hover:border-rosa">✕</button>
                  </div>
                </div>

                {abierto && (
                  <div className="mt-3 space-y-2">
                    <textarea
                      defaultValue={c.texto || ''}
                      onBlur={(e) => set(c.id, 'texto', e.target.value)}
                      rows={12}
                      placeholder="texto de la cartita…"
                      className="w-full bg-white border border-rosa-claro rounded-2xl p-4 text-[14px] leading-relaxed outline-none focus:border-rosa resize-y"
                    />
                    <input
                      defaultValue={c.firma || ''}
                      placeholder="firma"
                      onBlur={(e) => set(c.id, 'firma', e.target.value)}
                      className="w-full bg-white border border-rosa-claro rounded-full px-4 py-2 text-sm outline-none focus:border-rosa"
                    />
                    <p className="text-[11px] text-tinta/50">Los cambios se guardan al salir del campo.</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
