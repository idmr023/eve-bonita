import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PLANES_INICIALES } from '../data/contenido'
import { escuchar, guardarDoc, actualizar, borrar } from '../lib/db'
import { arrayRemove, arrayUnion } from 'firebase/firestore'
import HourlyCalendar, { HORAS } from './HourlyCalendar'

const PRIOR = { alta: 'bg-rosa text-white', media: 'bg-dorado text-tinta', baja: 'bg-white border text-tinta' }
const CAT_EMOJI = { estadio: '🏟️', futbol: '⚽', postres: '🧁', pelis: '🎬', iglesia: '⛪', selva: '🍃', barca: '🔵🔴', musica: '🎸', perritos: '🐶', paseo: '🎡', correr: '🏃', citas: '💑' }

const CATEGORIAS = [
  ['postres', '🧁 postre'], ['estadio', '🏟️ estadio'], ['futbol', '⚽ fútbol'], ['iglesia', '⛪ iglesia'],
  ['pelis', '🎬 peli'], ['selva', '🍃 selva'], ['musica', '🎸 música'], ['barca', '🔵🔴 barça/u'],
  ['perritos', '🐶 perritos'], ['paseo', '🎡 paseo'], ['correr', '🏃 correr'], ['citas', '💑 cita'],
]
const ORDEN_PRIOR = { alta: 0, media: 1, baja: 2 }

function fechaBonita(fecha) {
  const d = new Date(fecha + 'T12:00:00')
  if (Number.isNaN(d.getTime())) return fecha
  return d.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

function EditorPlan({ plan, onGuardar, onCancelar }) {
  const [b, setB] = useState({
    titulo: plan.titulo || '',
    prior: plan.prior || 'media',
    categoria: plan.categoria || 'postres',
    fecha: plan.fecha || '',
    hora: plan.hora || '',
  })
  const campo = 'mt-0.5 w-full bg-crema border border-rosa-claro rounded-full px-3 py-2 text-sm font-normal text-tinta outline-none focus:border-rosa'
  const etiqueta = 'block text-[11px] font-semibold text-tinta/60'
  const horas = b.hora && !HORAS.includes(b.hora) ? [b.hora, ...HORAS] : HORAS

  const guardar = (e) => {
    e.preventDefault()
    if (!b.titulo.trim()) return
    onGuardar({ ...b, titulo: b.titulo.trim() })
  }

  return (
    <form onSubmit={guardar} className="space-y-2">
      <label className={etiqueta}>Plan
        <input autoFocus value={b.titulo} onChange={e => setB({ ...b, titulo: e.target.value })} className={campo} />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className={etiqueta}>Fecha
          <input type="date" value={b.fecha} onChange={e => setB({ ...b, fecha: e.target.value })} className={campo} />
        </label>
        <label className={etiqueta}>Hora
          <select value={b.hora} onChange={e => setB({ ...b, hora: e.target.value })} className={campo}>
            <option value="">sin hora</option>
            {horas.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </label>
        <label className={etiqueta}>Prioridad
          <select value={b.prior} onChange={e => setB({ ...b, prior: e.target.value })} className={campo}>
            <option value="alta">alta</option><option value="media">media</option><option value="baja">baja</option>
          </select>
        </label>
        <label className={etiqueta}>Categoría
          <select value={b.categoria} onChange={e => setB({ ...b, categoria: e.target.value })} className={campo}>
            {CATEGORIAS.map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
          </select>
        </label>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancelar} className="px-4 py-1.5 rounded-full border border-rosa-claro text-sm font-semibold text-tinta/70 hover:bg-rosa-claro/40">cancelar</button>
        <button type="submit" disabled={!b.titulo.trim()} className="px-4 py-1.5 rounded-full bg-rosa text-white text-sm font-bold hover:bg-rosa/90 disabled:opacity-50">guardar</button>
      </div>
    </form>
  )
}

function Calendar({ planes, selected, onSelect }) {
  const [cur, setCur] = useState(new Date())
  const y = cur.getFullYear(), m = cur.getMonth()
  const first = new Date(y, m, 1).getDay()
  const days = new Date(y, m + 1, 0).getDate()
  const monthName = cur.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })

  const byDate = useMemo(() => {
    const map = {}
    planes.forEach(p => { if (p.fecha) (map[p.fecha] ??= []).push(p) })
    return map
  }, [planes])

  const cells = []
  for (let i = 0; i < first; i++) cells.push(null)
  for (let d = 1; d <= days; d++) cells.push(d)

  return (
    <div className="bg-white rounded-[20px] border border-rosa-claro p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setCur(new Date(y, m - 1, 1))} className="w-8 h-8 rounded-full border hover:bg-rosa-claro/40">‹</button>
        <div className="font-display font-bold capitalize">{monthName}</div>
        <button onClick={() => setCur(new Date(y, m + 1, 1))} className="w-8 h-8 rounded-full border hover:bg-rosa-claro/40">›</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-tinta/50 mb-1"><span>D</span><span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span></div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d == null) return <div key={i} />
          const key = `${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
          const has = byDate[key]
          const isSel = selected === key
          return (
            <button
              key={i}
              onClick={() => onSelect(key)}
              className={`relative h-9 rounded-xl text-sm font-semibold border ${isSel ? 'bg-tinta text-white border-tinta' : has ? 'bg-rosa-claro/50 border-rosa-claro' : 'bg-crema border-transparent hover:border-rosa-claro'}`}
            >
              {d}
              {has && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rosa rounded-full border-2 border-white" />}
            </button>
          )
        })}
      </div>
      <p className="text-xs text-tinta/50 mt-3 font-ui">Toca un día para ver las horas libres y asignar un plan.</p>
    </div>
  )
}

export default function Planes() {
  const [planes, setPlanes] = useState(() => {
    const saved = localStorage.getItem('eve-planes')
    if (saved) try { return JSON.parse(saved) } catch {}
    return PLANES_INICIALES
  })
  const [filtro, setFiltro] = useState('')
  const [nuevo, setNuevo] = useState({ titulo: '', prior: 'media', fecha: '', categoria: 'postres', hora: '' })
  const [selFecha, setSelFecha] = useState('')
  const [remoto, setRemoto] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  // Horas ocupadas de cada uno, como "2026-11-24T18:00".
  const [ocupados, setOcupados] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('eve-ocupados'))
      if (Array.isArray(saved?.ivan) && Array.isArray(saved?.cheva)) return saved
    } catch {}
    return { ivan: [], cheva: [] }
  })

  useEffect(() => {
    const unsub = escuchar('planes', (docs, err) => {
      if (err || !docs) { setRemoto(false); return }
      setRemoto(true)
      if (docs.length === 0) {
        PLANES_INICIALES.forEach((p) => guardarDoc('planes', p.id, p).catch(() => {}))
        return
      }
      setPlanes(docs)
    })
    return unsub
  }, [])

  useEffect(() => {
    if (!remoto) localStorage.setItem('eve-planes', JSON.stringify(planes))
  }, [planes, remoto])

  // Los horarios se comparten en Firestore (horarios/ivan y horarios/cheva).
  // Si no hay permiso, quedan solo en este navegador.
  useEffect(() => escuchar('horarios', (docs) => {
    if (!docs) return
    setOcupados((previo) => {
      const nuevo = { ...previo }
      docs.forEach((d) => { if (d.id in nuevo && Array.isArray(d.horas)) nuevo[d.id] = d.horas })
      return nuevo
    })
  }), [])

  useEffect(() => {
    try { localStorage.setItem('eve-ocupados', JSON.stringify(ocupados)) } catch {}
  }, [ocupados])

  const toggleHecho = (id) => {
    const x = planes.find((y) => y.id === id)
    if (!x) return
    const hecho = !x.hecho
    setPlanes((p) => p.map((y) => (y.id === id ? { ...y, hecho } : y)))
    if (remoto) actualizar('planes', id, { hecho }).catch(() => {})
  }

  const toggleOcupado = (persona, hora) => {
    if (!(persona in ocupados) || !selFecha) return
    const key = `${selFecha}T${hora}`
    const ya = ocupados[persona].includes(key)
    setOcupados((o) => ({ ...o, [persona]: ya ? o[persona].filter((k) => k !== key) : [...o[persona], key] }))
    guardarDoc('horarios', persona, { horas: ya ? arrayRemove(key) : arrayUnion(key) })
      .catch((e) => console.warn('El horario se guardó solo en este navegador:', e.message))
  }

  const guardarPlan = (id, cambios) => {
    setPlanes((p) => p.map((y) => (y.id === id ? { ...y, ...cambios } : y)))
    if (remoto) actualizar('planes', id, cambios).catch((e) => console.warn('No se pudo guardar el plan:', e.message))
    setEditandoId(null)
  }

  const eliminar = (id) => {
    setPlanes((p) => p.filter((y) => y.id !== id))
    if (remoto) borrar('planes', id).catch(() => {})
  }

  const agregar = () => {
    if (!nuevo.titulo.trim()) return
    const id = 'p' + Date.now()
    const plan = { id, ...nuevo, fecha: nuevo.fecha || selFecha, hecho: false }
    setPlanes((p) => [plan, ...p])
    if (remoto) guardarDoc('planes', id, plan).catch(() => {})
    setNuevo({ titulo: '', prior: 'media', fecha: selFecha || '', categoria: 'postres', hora: '' })
  }

  const agregarPlanAHora = (plan) => {
    const id = 'p' + Date.now()
    const p = { id, ...plan, fecha: selFecha, hecho: false }
    setPlanes((pp) => [p, ...pp])
    if (remoto) guardarDoc('planes', id, p).catch(() => {})
  }

  const porHacer = planes.filter(p => !p.hecho).sort((a,b)=> (ORDEN_PRIOR[a.prior] ?? 1) - (ORDEN_PRIOR[b.prior] ?? 1))
  const hechas = planes.filter(p => p.hecho)

  return (
    <section id="planes" className="relative py-14 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <p className="font-hand text-2xl text-rosa">lo que soñamos</p>
        <h2 className="font-display font-bold text-4xl md:text-5xl">Nuestros planes</h2>
        <p className="font-ui text-tinta/60 mt-2">Ordenados por prioridad • toca ✔️ para mover a “hechas” • ✎ para editar • todo se guarda solito</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
        <div className="space-y-6">
          {/* agregar */}
          <div className="bg-white rounded-[20px] border border-rosa-claro p-4 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <input value={nuevo.titulo} onChange={e=>setNuevo({...nuevo,titulo:e.target.value})} placeholder="Agregar plan... ej: Ver la final del Barça en el estadio"
                className="flex-1 min-w-[220px] bg-crema border border-rosa-claro rounded-full px-4 py-2.5 outline-none focus:border-rosa" />
              <select value={nuevo.prior} onChange={e=>setNuevo({...nuevo,prior:e.target.value})} className="bg-crema border border-rosa-claro rounded-full px-3 py-2.5">
                <option value="alta">prior alta</option><option value="media">media</option><option value="baja">baja</option>
              </select>
              <select value={nuevo.categoria} onChange={e=>setNuevo({...nuevo,categoria:e.target.value})} className="bg-crema border border-rosa-claro rounded-full px-3 py-2.5">
                {CATEGORIAS.map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
              </select>
              <input type="date" value={nuevo.fecha || selFecha} onChange={e=>setNuevo({...nuevo,fecha:e.target.value})} className="bg-crema border border-rosa-claro rounded-full px-3 py-2.5" />
              <button onClick={agregar} className="bg-rosa text-white px-6 py-2.5 rounded-full font-bold hover:bg-rosa/90">agregar</button>
            </div>
            {selFecha && <p className="text-xs text-tinta/60 mt-2">Fecha seleccionada del calendario: <b>{selFecha}</b> (se usará al agregar)</p>}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-display font-bold text-xl mb-3 flex items-center gap-2">Por hacer <span className="bg-rosa text-white text-xs px-2 py-1 rounded-full">{porHacer.length}</span></h3>
              <div className="space-y-3">
                <AnimatePresence>
                {porHacer.map(p=>(
                  <motion.div key={p.id} layout initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,scale:0.96}} className="bg-white rounded-2xl border border-rosa-claro p-3 shadow-sm">
                    {editandoId === p.id ? (
                      <EditorPlan plan={p} onGuardar={(c)=>guardarPlan(p.id, c)} onCancelar={()=>setEditandoId(null)} />
                    ) : (
                    <div className="flex gap-3 items-center">
                    <button aria-label="Marcar como hecha" onClick={()=>toggleHecho(p.id)} className="w-9 h-9 rounded-full border-2 border-rosa-claro hover:bg-rosa hover:text-white hover:border-rosa grid place-items-center">✔</button>
                    <div className="flex-1 min-w-0">
                      <div className="font-ui font-semibold leading-tight truncate">{CAT_EMOJI[p.categoria]||'♡'} {p.titulo}</div>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wide ${PRIOR[p.prior]}`}>{p.prior}</span>
                        {p.fecha && <span className="text-[11px] px-2 py-1 rounded-full bg-cancha text-white">{fechaBonita(p.fecha)}</span>}
                        {p.hora && <span className="text-[11px] px-2 py-1 rounded-full bg-rosa text-white">{p.hora}</span>}
                      </div>
                    </div>
                    <button aria-label={`Editar ${p.titulo}`} title="Editar" onClick={()=>setEditandoId(p.id)} className="text-tinta/40 hover:text-rosa px-1 text-lg">✎</button>
                    <button aria-label={`Eliminar ${p.titulo}`} title="Eliminar" onClick={()=>eliminar(p.id)} className="text-tinta/40 hover:text-rosa px-1">✕</button>
                    </div>
                    )}
                  </motion.div>
                ))}
                </AnimatePresence>
                {porHacer.length===0 && <div className="text-center py-8 bg-white rounded-2xl border border-dashed">¡Todo hecho, amor! Agrega más 💛</div>}
              </div>
            </div>
            <div>
              <h3 className="font-display font-bold text-xl mb-3 flex items-center gap-2">Hechas <span className="bg-cancha text-white text-xs px-2 py-1 rounded-full">{hechas.length}</span></h3>
              <div className="space-y-3">
                {hechas.map(p=>(
                  <div key={p.id} className="bg-cancha/10 rounded-2xl border border-cancha/20 p-3">
                    {editandoId === p.id ? (
                      <EditorPlan plan={p} onGuardar={(c)=>guardarPlan(p.id, c)} onCancelar={()=>setEditandoId(null)} />
                    ) : (
                    <div className="flex gap-3 items-center">
                    <button aria-label="Volver a por hacer" onClick={()=>toggleHecho(p.id)} className="w-9 h-9 rounded-full bg-cancha text-white grid place-items-center">✓</button>
                    <div className="flex-1 min-w-0">
                      <div className="font-ui font-semibold line-through decoration-cancha/60 opacity-70">{CAT_EMOJI[p.categoria]||''} {p.titulo}</div>
                      {p.fecha && <div className="text-xs text-cancha">{fechaBonita(p.fecha)}</div>}
                      {p.hora && <div className="text-xs text-tinta/50">{p.hora}</div>}
                    </div>
                    <button aria-label={`Editar ${p.titulo}`} title="Editar" onClick={()=>setEditandoId(p.id)} className="text-tinta/40 hover:text-rosa px-1 text-lg">✎</button>
                    <button aria-label={`Eliminar ${p.titulo}`} title="Eliminar" onClick={()=>eliminar(p.id)} className="text-tinta/40 hover:text-rosa px-1">✕</button>
                    </div>
                    )}
                  </div>
                ))}
                {hechas.length===0 && <div className="text-center py-8 bg-white rounded-2xl border border-dashed text-tinta/50">Aquí aparecerán tus recuerdos cumplidos</div>}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:sticky lg:top-20">
          <Calendar planes={planes} selected={selFecha} onSelect={setSelFecha} />
          {selFecha && (
            <HourlyCalendar
              fecha={selFecha}
              onPlan={agregarPlanAHora}
              onToggleOcupado={toggleOcupado}
              ocupados={ocupados}
              planes={planes}
            />
          )}
        </div>
      </div>
    </section>
  )
}
