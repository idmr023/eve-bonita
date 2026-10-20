import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { escuchar, guardarDoc, porOrden } from '../lib/db'
import { CARTAS_INICIALES } from '../data/contenido'

const CONFETTI = ['#FF8FA3', '#F5D67B', '#FFF8F0', '#C9A0DC', '#7EB8A2']

export default function Cartitas() {
  const [lista, setLista] = useState(CARTAS_INICIALES)
  const [remota, setRemota] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [selId, setSelId] = useState(null)

  const sel = lista.find((c) => c.id === selId) || null

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    const unsub = escuchar('cartas', (docs, err) => {
      if (err || !docs) { setCargando(false); return }
      setRemota(true)
      if (docs.length === 0) {
        CARTAS_INICIALES.forEach((c) => guardarDoc('cartas', c.id, c).catch(() => {}))
        setLista(CARTAS_INICIALES)
      } else {
        setLista([...docs].sort(porOrden))
      }
      setCargando(false)
    })
    return unsub
  }, [])

  const abrir = (c) => {
    setSelId(c.id)
    confetti({ particleCount: 90, spread: 85, origin: { y: 0.4 }, colors: CONFETTI })
  }

  const copiar = (texto) => {
    navigator.clipboard?.writeText(texto)
    confetti({ particleCount: 40, origin: { y: 0.7 }, colors: CONFETTI })
  }

  return (
    <section className="relative min-h-screen bg-crema overflow-hidden">
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[520px] bg-gradient-to-b from-dorado/20 via-rosa-claro/15 to-transparent rounded-full blur-3xl" />

      <div className="relative max-w-5xl mx-auto px-4 pt-8 pb-16">
        <a href="#/" className="inline-flex items-center gap-2 bg-white border border-rosa-claro px-4 py-2 rounded-full text-sm font-semibold text-tinta hover:bg-rosa-claro/40 transition">
          ← volver al inicio
        </a>

        <div className="text-center mt-10">
          <p className="font-hand text-3xl text-rosa rotate-[-1deg]">todo lo que te quiero decir</p>
          <h1 className="font-display font-bold text-4xl md:text-6xl text-tinta mt-2">Cartitas para Evelyn</h1>
          <p className="font-ui text-tinta/60 mt-3 max-w-xl mx-auto">
            Este es el lugar donde las guardo. Cada una es un pedacito de mí para ti, Cheva. Toca una para abrirla.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-white border border-rosa-claro px-4 py-2 rounded-full text-sm shadow-sm">
            <span className="w-2 h-2 bg-rosa rounded-full animate-pulse" />
            {remota ? `${lista.length} cartitas guardadas` : 'tus cartitas están listas'}
            {cargando && <span className="text-tinta/50">cargando…</span>}
          </div>
        </div>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {lista.map((c, i) => (
              <motion.button
                key={c.id}
                layout
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -6, rotate: -0.5 }}
                onClick={() => abrir(c)}
                className="text-left bg-white rounded-[22px] border border-rosa-claro p-6 shadow-sm hover:shadow-xl transition"
              >
                <div
                  className="w-14 h-14 rounded-2xl grid place-items-center text-2xl shadow-inner"
                  style={{ backgroundColor: (c.color || '#FF8FA3') + '22', border: `1px solid ${c.color || '#FF8FA3'}55` }}
                >
                  {c.emoji || '💌'}
                </div>
                <div className="mt-4 font-display font-bold text-lg text-tinta leading-tight">{c.titulo}</div>
                <div className="font-ui text-sm text-tinta/55 mt-1">{c.sub}</div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-hand text-sm" style={{ color: c.color || '#FF8FA3' }}>leer cartita</span>
                  <span className="w-8 h-8 rounded-full grid place-items-center text-white" style={{ backgroundColor: c.color || '#FF8FA3' }}>→</span>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        <p className="text-center font-hand text-xl text-tinta/40 mt-12">con todo mi corazón, Iván 💛</p>
      </div>

      {/* carta abierta */}
      <AnimatePresence>
        {sel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-noche/80 backdrop-blur-sm grid place-items-center p-4 overflow-auto"
            onClick={() => setSelId(null)}
          >
            <motion.div
              initial={{ y: 40, scale: 0.96, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 40, scale: 0.96, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-[#FFF8F0] rounded-[24px] border border-rosa-claro shadow-2xl overflow-hidden"
            >
              <div className="h-2 w-full" style={{ backgroundColor: sel.color || '#FF8FA3' }} />
              <div className="p-6 md:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-hand text-lg" style={{ color: sel.color || '#FF8FA3' }}>{sel.emoji} {sel.titulo}</div>
                    <div className="font-display italic text-tinta mt-1">para Evelyn “Cheva” — de Iván</div>
                  </div>
                  <button
                    onClick={() => setSelId(null)}
                    className="w-9 h-9 shrink-0 rounded-full border border-rosa-claro bg-white text-tinta/60 hover:text-white hover:bg-rosa hover:border-rosa transition"
                  >✕</button>
                </div>
                <pre className="whitespace-pre-wrap font-ui text-[14px] md:text-[15px] leading-relaxed text-tinta mt-4 max-h-[52vh] overflow-auto pr-1">{sel.texto}</pre>
                <div className="mt-5 flex justify-between items-center gap-3">
                  <span className="font-hand text-xl" style={{ color: sel.color || '#FF8FA3' }}>{sel.firma || 'siempre tuyo, Iván'}</span>
                  <button
                    onClick={() => copiar(sel.texto)}
                    className="text-xs bg-white border border-rosa-claro px-4 py-2 rounded-full font-semibold text-tinta hover:bg-rosa hover:text-white hover:border-rosa transition"
                  >copiar cartita</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
