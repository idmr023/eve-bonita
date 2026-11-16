import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { CalendarHeart, Check, Clock, Heart, MapPin, PartyPopper, Pencil, Plus, Sparkles, Trash2, X } from 'lucide-react'
import { escuchar, escucharDoc, guardarDoc, actualizar, borrar } from '../lib/db'
import { FULL_DAY, NOMBRES, getProximoDomingo1630 } from '../data/contenido'

const ICONOS = ['🥐', '⛪', '🍃', '🎡', '🧁', '🎬', '🌙', '💌', '💛', '❤️', '🍽️', '🎶', '📸', '🎁', '🌸', '⭐', '🏟️', '⚽', '🐶', '☕', '🍕', '🎤', '🛍️', '🚶', '🌅']
const VACIO = { hora: '', titulo: '', lugar: '', emoji: '💛', detalle: '' }
const CLASE_INPUT = 'w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-white outline-none focus:border-rosa placeholder:text-white/40 [color-scheme:dark]'
const CLASE_LABEL = 'block text-[11px] font-bold uppercase tracking-widest text-white/50'

function infoBase() {
  const base = FULL_DAY.fechaFija ? FULL_DAY.fechaFija.slice(0, 10) : getProximoDomingo1630()
  const fecha = typeof base === 'string' ? base : `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}-${String(base.getDate()).padStart(2, '0')}`
  return { fecha, hora: FULL_DAY.hora, lugar: FULL_DAY.lugar }
}

function Tarjeta({ icono, titulo, valor }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur">
      <div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-dorado/15 text-dorado">{icono}</div>
      <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-white/50">{titulo}</p>
      <p className="mt-1 font-display text-base font-bold capitalize text-white sm:text-lg">{valor}</p>
    </div>
  )
}

function Formulario({ inicial, onGuardar, onCancelar }) {
  const [forma, setForma] = useState(inicial)
  const listo = forma.hora && forma.titulo.trim() && forma.lugar.trim()

  const cambiar = (campo, valor) => setForma((actual) => ({ ...actual, [campo]: valor }))

  const enviar = (e) => {
    e.preventDefault()
    if (!listo) return
    onGuardar(forma)
  }

  return (
    <form onSubmit={enviar} className="flex-1 rounded-3xl border border-rosa/40 bg-white/10 p-4 backdrop-blur md:p-5">
      <div className="grid gap-3 sm:grid-cols-[110px_1fr_1fr]">
        <div>
          <label htmlFor="fd-hora" className={CLASE_LABEL}>hora</label>
          <input id="fd-hora" type="time" value={forma.hora} onChange={(e) => cambiar('hora', e.target.value)} className={`mt-1 ${CLASE_INPUT}`} />
        </div>
        <div>
          <label htmlFor="fd-titulo" className={CLASE_LABEL}>actividad</label>
          <input id="fd-titulo" value={forma.titulo} onChange={(e) => cambiar('titulo', e.target.value)} placeholder="¿qué haremos?" className={`mt-1 ${CLASE_INPUT}`} />
        </div>
        <div>
          <label htmlFor="fd-lugar" className={CLASE_LABEL}>lugar</label>
          <input id="fd-lugar" value={forma.lugar} onChange={(e) => cambiar('lugar', e.target.value)} placeholder="¿dónde?" className={`mt-1 ${CLASE_INPUT}`} />
        </div>
      </div>

      <p className={`${CLASE_LABEL} mt-4`}>icono</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {ICONOS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => cambiar('emoji', emoji)}
            aria-pressed={forma.emoji === emoji}
            className={`grid h-9 w-9 place-items-center rounded-full border text-lg transition ${forma.emoji === emoji ? 'border-rosa bg-rosa/25 ring-2 ring-rosa' : 'border-white/15 bg-white/5 hover:bg-white/15'}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      <label htmlFor="fd-detalle" className={`${CLASE_LABEL} mt-4`}>detalle (opcional)</label>
      <textarea id="fd-detalle" rows={2} value={forma.detalle} onChange={(e) => cambiar('detalle', e.target.value)} placeholder="un detallito bonito…" className={`mt-1 resize-none ${CLASE_INPUT}`} />

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button type="button" onClick={onCancelar} className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10">
          <X size={15} aria-hidden="true" /> cancelar
        </button>
        <button type="submit" disabled={!listo} className="inline-flex items-center gap-1.5 rounded-full bg-rosa px-5 py-2 text-sm font-bold text-white transition hover:bg-rosa/90 disabled:cursor-not-allowed disabled:opacity-50">
          <Check size={15} aria-hidden="true" /> guardar
        </button>
      </div>
    </form>
  )
}

export default function FullDay() {
  const [momentos, setMomentos] = useState(() => {
    const saved = localStorage.getItem('eve-fullday')
    if (saved) try { return JSON.parse(saved) } catch {}
    return FULL_DAY.momentos
  })
  const [remoto, setRemoto] = useState(false)
  const [editando, setEditando] = useState('')
  const [confirmarId, setConfirmarId] = useState('')
  const [info, setInfo] = useState(() => {
    const saved = localStorage.getItem('eve-fullday-info')
    if (saved) try { return JSON.parse(saved) } catch {}
    return infoBase()
  })
  const [infoForm, setInfoForm] = useState(infoBase)
  const [infoRemoto, setInfoRemoto] = useState(false)
  const [editandoInfo, setEditandoInfo] = useState(false)

  useEffect(() => {
    const unsub = escuchar('fullday_momentos', (docs, err) => {
      if (err || !docs) { setRemoto(false); return }
      setRemoto(true)
      if (docs.length === 0) {
        FULL_DAY.momentos.forEach((m, i) => guardarDoc('fullday_momentos', m.id, { ...m, orden: i }).catch(() => {}))
        return
      }
      setMomentos(docs.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0) || String(a.hora).localeCompare(String(b.hora))))
    })
    return unsub
  }, [])

  useEffect(() => {
    if (!remoto) localStorage.setItem('eve-fullday', JSON.stringify(momentos))
  }, [momentos, remoto])

  useEffect(() => {
    const unsub = escucharDoc('fullday_info', 'principal', (doc, err) => {
      if (err) { setInfoRemoto(false); return }
      setInfoRemoto(true)
      if (!doc) {
        guardarDoc('fullday_info', 'principal', info).catch(() => {})
        return
      }
      setInfo({ fecha: doc.fecha || '', hora: doc.hora || '', lugar: doc.lugar || '' })
    })
    return unsub
  }, [])

  useEffect(() => {
    if (!infoRemoto) localStorage.setItem('eve-fullday-info', JSON.stringify(info))
  }, [info, infoRemoto])

  const fecha = info.fecha ? new Date(info.fecha + 'T12:00:00') : getProximoDomingo1630()
  const fechaLinda = fecha.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const celebrar = () => {
    confetti({
      particleCount: 140,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#FF8FA3', '#F5D67B', '#A50044', '#004D98', '#2D6A4F', '#FFF8F0'],
    })
  }

  function guardar(forma) {
    const limpio = {
      hora: forma.hora,
      titulo: forma.titulo.trim(),
      lugar: forma.lugar.trim(),
      emoji: forma.emoji,
      detalle: forma.detalle.trim(),
    }
    if (!limpio.hora || !limpio.titulo || !limpio.lugar) return

    if (editando === 'nuevo') {
      const id = 'fd' + Date.now()
      const orden = momentos.length ? Math.max(...momentos.map((m) => m.orden ?? 0)) + 1 : 0
      const nuevo = { id, ...limpio, orden }
      setMomentos((actual) => [...actual, nuevo].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0) || String(a.hora).localeCompare(String(b.hora))))
      if (remoto) guardarDoc('fullday_momentos', id, nuevo).catch(() => {})
    } else {
      setMomentos((actual) => actual.map((m) => (m.id === editando ? { ...m, ...limpio } : m)))
      if (remoto) actualizar('fullday_momentos', editando, limpio).catch(() => {})
    }
    setEditando('')
    setConfirmarId('')
  }

  function pedirEliminar(id) {
    if (confirmarId === id) {
      setMomentos((actual) => actual.filter((m) => m.id !== id))
      if (remoto) borrar('fullday_momentos', id).catch(() => {})
      setConfirmarId('')
      if (editando === id) setEditando('')
      return
    }
    setConfirmarId(id)
    window.setTimeout(() => {
      setConfirmarId((actual) => (actual === id ? '' : actual))
    }, 3000)
  }

  const empezarEdicion = (momento) => {
    setEditando(momento.id)
    setConfirmarId('')
  }

  function guardarInfo(forma) {
    const limpio = { fecha: forma.fecha, hora: forma.hora.trim(), lugar: forma.lugar.trim() }
    if (!limpio.fecha || !limpio.lugar) return
    setInfo(limpio)
    if (infoRemoto) guardarDoc('fullday_info', 'principal', limpio).catch(() => {})
    setEditandoInfo(false)
  }

  const empezarEditarInfo = () => {
    setInfoForm({ ...info })
    setEditandoInfo(true)
  }

  return (
    <section id="fullday" className="relative overflow-hidden bg-noche py-16 px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-noche via-[#241a2e] to-noche" />
      <div className="absolute -top-24 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-rosa/15 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-[320px] w-[520px] rounded-full bg-dorado/10 blur-3xl" />

      <div className="relative max-w-5xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-hand text-3xl text-dorado rotate-[-1deg]"
        >
          una fecha que no es una salida más
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-1 font-display text-5xl md:text-6xl font-bold text-white"
        >
          Full day <span className="text-rosa">en pareja</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-3 max-w-2xl font-ui text-white/70"
        >
          {FULL_DAY.lema}
        </motion.p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-dorado/40 bg-dorado/10 px-4 py-2 text-sm font-semibold text-dorado">
            <Sparkles size={16} aria-hidden="true" /> no es una salida más
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80">
            <Heart size={16} className="text-rosa" aria-hidden="true" /> es un momento muy especial
          </span>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <Tarjeta icono={<CalendarHeart size={22} aria-hidden="true" />} titulo="la fecha" valor={fechaLinda} />
          <Tarjeta icono={<Clock size={22} aria-hidden="true" />} titulo="la hora" valor={info.hora} />
          <Tarjeta icono={<MapPin size={22} aria-hidden="true" />} titulo="el lugar" valor={info.lugar} />
        </div>

        {editandoInfo ? (
          <form
            onSubmit={(e) => { e.preventDefault(); guardarInfo(infoForm) }}
            className="mx-auto mt-6 max-w-2xl rounded-3xl border border-rosa/40 bg-white/10 p-4 text-left backdrop-blur md:p-5"
          >
            <div className="grid gap-3 sm:grid-cols-[150px_1fr]">
              <div>
                <label htmlFor="fdi-fecha" className={CLASE_LABEL}>fecha</label>
                <input id="fdi-fecha" type="date" value={infoForm.fecha} onChange={(e) => setInfoForm({ ...infoForm, fecha: e.target.value })} className={`mt-1 ${CLASE_INPUT}`} />
              </div>
              <div>
                <label htmlFor="fdi-hora" className={CLASE_LABEL}>hora</label>
                <input id="fdi-hora" value={infoForm.hora} onChange={(e) => setInfoForm({ ...infoForm, hora: e.target.value })} placeholder="de 9:00 am a 10:00 pm" className={`mt-1 ${CLASE_INPUT}`} />
              </div>
            </div>
            <div className="mt-3">
              <label htmlFor="fdi-lugar" className={CLASE_LABEL}>lugar</label>
              <input id="fdi-lugar" value={infoForm.lugar} onChange={(e) => setInfoForm({ ...infoForm, lugar: e.target.value })} placeholder="¿dónde será?" className={`mt-1 ${CLASE_INPUT}`} />
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => setEditandoInfo(false)} className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10">
                <X size={15} aria-hidden="true" /> cancelar
              </button>
              <button type="submit" disabled={!infoForm.fecha || !infoForm.lugar.trim()} className="inline-flex items-center gap-1.5 rounded-full bg-rosa px-5 py-2 text-sm font-bold text-white transition hover:bg-rosa/90 disabled:cursor-not-allowed disabled:opacity-50">
                <Check size={15} aria-hidden="true" /> guardar
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={empezarEditarInfo}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-dashed border-white/25 px-4 py-2 text-sm font-semibold text-white/70 transition hover:border-rosa hover:text-rosa"
          >
            <Pencil size={14} aria-hidden="true" /> editar fecha, hora y lugar
          </button>
        )}

        <button
          type="button"
          onClick={celebrar}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rosa to-dorado px-7 py-3 font-bold text-white shadow-xl transition hover:scale-[1.03]"
        >
          <PartyPopper size={18} aria-hidden="true" /> celebrar que llegue ✨
        </button>
      </div>

      {/* marquee */}
      <div className="relative mt-14 overflow-hidden border-y border-white/10 bg-white/5 py-3">
        <div className="marquee-track whitespace-nowrap font-hand text-2xl text-white/70">
          {Array.from({ length: 2 }).map((_, copia) => (
            <span key={copia} className="flex items-center gap-8 pr-8">
              <span>esto no es una salida más</span><span className="text-dorado">✦</span>
              <span>es un momento muy especial</span><span className="text-rosa">✦</span>
              <span>solo nosotros dos</span><span className="text-dorado">✦</span>
              <span>un día entero para querernos</span><span className="text-rosa">✦</span>
            </span>
          ))}
        </div>
      </div>

      <div className="relative mx-auto mt-14 max-w-3xl">
        <h3 className="text-center font-display text-3xl font-bold text-white">El plan del día</h3>
        <p className="mt-2 text-center font-ui text-sm text-white/60">
          Cada hora pensada con detalle: qué haremos, dónde y por qué importa. Toca <Pencil size={12} className="inline" aria-hidden="true" /> para editar o <Plus size={12} className="inline" aria-hidden="true" /> para añadir.
        </p>

        <div className="relative mt-10">
          <div className="absolute bottom-3 left-[19px] top-3 w-px bg-gradient-to-b from-dorado via-rosa to-barca2 md:left-[23px]" />
          <div className="space-y-6">
            {momentos.map((momento, i) => (
              <motion.div
                key={momento.id}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: Math.min(i * 0.04, 0.3) }}
                className="relative flex gap-4 md:gap-6"
              >
                <div className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-dorado/50 bg-noche text-lg shadow-lg md:h-12 md:w-12">
                  {momento.emoji}
                </div>

                {editando === momento.id ? (
                  <Formulario
                    key={momento.id}
                    inicial={{ hora: momento.hora || '', titulo: momento.titulo || '', lugar: momento.lugar || '', emoji: momento.emoji || '💛', detalle: momento.detalle || '' }}
                    onGuardar={guardar}
                    onCancelar={() => setEditando('')}
                  />
                ) : (
                  <div className="flex-1 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur md:p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-dorado/15 px-3 py-1 font-display text-sm font-bold text-dorado">{momento.hora}</span>
                      <h4 className="font-display text-xl font-bold text-white">{momento.titulo}</h4>
                    </div>
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-rosa">
                      <MapPin size={13} aria-hidden="true" /> {momento.lugar}
                    </p>
                    {momento.detalle && <p className="mt-2 text-sm leading-relaxed text-white/70">{momento.detalle}</p>}
                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => empezarEdicion(momento)}
                        className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/70 transition hover:border-rosa hover:text-rosa"
                      >
                        <Pencil size={12} aria-hidden="true" /> editar
                      </button>
                      <button
                        type="button"
                        onClick={() => pedirEliminar(momento.id)}
                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${confirmarId === momento.id ? 'border-barca1 bg-barca1 text-white' : 'border-white/15 text-white/70 hover:border-barca1 hover:text-barca1'}`}
                      >
                        <Trash2 size={12} aria-hidden="true" /> {confirmarId === momento.id ? '¿seguro?' : 'eliminar'}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}

            {editando === 'nuevo' ? (
              <div className="relative flex gap-4 md:gap-6">
                <div className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-rosa/60 bg-noche text-lg shadow-lg md:h-12 md:w-12">
                  ✨
                </div>
                <Formulario key="nuevo" inicial={VACIO} onGuardar={guardar} onCancelar={() => setEditando('')} />
              </div>
            ) : (
              <div className="relative pl-14 md:pl-16">
                <button
                  type="button"
                  onClick={() => { setEditando('nuevo'); setConfirmarId('') }}
                  className="inline-flex items-center gap-2 rounded-full border border-dashed border-white/25 px-5 py-2.5 text-sm font-semibold text-white/70 transition hover:border-rosa hover:text-rosa"
                >
                  <Plus size={16} aria-hidden="true" /> añadir actividad
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative mx-auto mt-16 max-w-4xl">
        <h3 className="text-center font-display text-3xl font-bold text-white">Las reglas de este día</h3>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {FULL_DAY.reglas.map((regla) => (
            <div key={regla.titulo} className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-5">
              <p className="font-display text-lg font-bold text-dorado">{regla.titulo}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-white/70">{regla.texto}</p>
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mt-12 max-w-2xl rounded-[28px] border border-rosa/30 bg-gradient-to-br from-rosa/15 via-white/5 to-dorado/10 p-8 text-center"
        >
          <p className="font-hand text-3xl text-rosa">Cheva, esto no es una salida más 💛</p>
          <p className="mt-3 font-ui text-white/75">
            Es un día entero para querernos sin prisa, para guardar recuerdos que no caben en una tarde
            y para recordarte, una vez más, que eres mi persona favorita.
          </p>
          <p className="mt-4 font-display text-white">
            te espera <span className="text-dorado">{NOMBRES.el}</span> ♡
          </p>
        </motion.div>
      </div>
    </section>
  )
}
