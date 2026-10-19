import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { escuchar } from '../lib/db'
import { CARTAS_INICIALES, NOMBRES } from '../data/contenido'

const COLORES = [
  { fondo: 'from-[#FFF8F0] to-[#FFE9DE]', sobre: '#FFB3C1', sello: '#FF8FA3' },
  { fondo: 'from-[#F3F0FF] to-[#E4DFFF]', sobre: '#B9A7F0', sello: '#8E6FE0' },
  { fondo: 'from-[#EAF7FF] to-[#D6ECFB]', sobre: '#8FC9EE', sello: '#3B82C4' },
  { fondo: 'from-[#FFF6DF] to-[#FBE7B8]', sobre: '#F0C964', sello: '#C89B2C' },
  { fondo: 'from-[#E9F7EC] to-[#D3EFD9]', sobre: '#8FD3A4', sello: '#3A7D44' },
]

function Sobre({ carta, i, onAbrir }) {
  const c = COLORES[i % COLORES.length]
  return (
    <motion.button
      onClick={onAbrir}
      initial={{ opacity: 0, y: 24, rotate: (i % 2 ? 1 : -1) * 1.5 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (i % 6) * 0.06, type: 'spring', stiffness: 180 }}
      whileHover={{ y: -8, rotate: i % 2 ? 1.5 : -1.5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group relative w-full text-left"
    >
      {/* sobre */}
      <div className={`relative aspect-[4/3] rounded-[18px] bg-gradient-to-br ${c.fondo} shadow-lg border border-white/70 overflow-hidden transition-shadow group-hover:shadow-2xl`}>
        {/* solapa */}
        <svg viewBox="0 0 200 150" className="absolute inset-0 w-full h-full">
          <polygon points="0,0 100,78 200,0" fill={c.sobre} opacity="0.55" />
          <polygon points="0,150 0,88 74,150" fill="#fff" opacity="0.45" />
          <polygon points="200,150 200,88 126,150" fill="#fff" opacity="0.45" />
        </svg>
        {/* sello */}
        <div
          className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full grid place-items-center text-2xl shadow-md border-4 border-white/90 rotate-[-8deg] transition-transform group-hover:rotate-0"
          style={{ background: c.sello }}
        >
          {carta.emoji || '💌'}
        </div>
        {/* cinta */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-white/55 backdrop-blur-[1px] flex items-center justify-center gap-2">
          <span className="font-hand text-lg text-tinta/80 truncate px-3">
            {carta.titulo || 'Sin título'}
          </span>
        </div>
        {carta.destacado && (
          <span className="absolute top-2 right-2 bg-dorado text-tinta text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
            ★
          </span>
        )}
      </div>
      {/* pie */}
      <div className="mt-2 px-1">
        <div className="font-display font-bold text-sm text-tinta truncate">{carta.titulo || 'Sin título'}</div>
        <div className="text-[11px] text-tinta/50 font-ui truncate">
          {carta.sub || carta.firma || ''}
        </div>
      </div>
    </motion.button>
  )
}

function Lectura({ carta, onCerrar }) {
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', esc)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', esc)
      document.body.style.overflow = ''
    }
  }, [onCerrar])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noche/80 backdrop-blur-sm"
      onClick={onCerrar}
    >
      <motion.article
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[86vh] overflow-y-auto rounded-[26px] bg-gradient-to-b from-white to-[#FFF0E6] shadow-2xl border border-rosa-claro"
      >
        {/* cabeza */}
        <div className="sticky top-0 z-10 bg-gradient-to-b from-white to-white/90 backdrop-blur px-6 pt-6 pb-4 border-b border-rosa-claro/60">
          <button
            onClick={onCerrar}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-crema border border-rosa-claro text-tinta/60 hover:bg-rosa hover:text-white hover:border-rosa transition"
            aria-label="Cerrar"
          >
            ✕
          </button>
          <div className="text-3xl mb-1">{carta.emoji || '💌'}</div>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-tinta pr-10">
            {carta.titulo || 'Sin título'}
          </h2>
          {carta.sub && <p className="font-hand text-xl text-rosa mt-0.5">{carta.sub}</p>}
          {carta.fecha && (
            <p className="text-[11px] text-tinta/45 font-ui mt-1">{carta.fecha}</p>
          )}
        </div>

        {/* cuerpo */}
        <div className="px-6 py-6 md:px-10">
          <pre className="whitespace-pre-wrap font-ui text-[14px] md:text-[15px] leading-relaxed text-tinta">
            {carta.texto || ''}
          </pre>
          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-rosa-claro/60 pt-4">
            <span className="font-hand text-2xl text-rosa">{carta.firma || `siempre tuyo, ${NOMBRES.el}`}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(carta.texto || '')
                confetti({ particleCount: 45, origin: { y: 0.7 }, colors: ['#FF8FA3', '#F5D67B'] })
              }}
              className="text-xs bg-crema border border-rosa-claro px-4 py-2 rounded-full hover:bg-rosa-claro/40"
            >
              copiar cartita
            </button>
          </div>
        </div>
      </motion.article>
    </motion.div>
  )
}

export default function Cartas() {
  const [lista, setLista] = useState([])
  const [cargando, setCargando] = useState(true)
  const [abierta, setAbierta] = useState(null)

  useEffect(() => {
    const unsub = escuchar('cartas', (d, err) => {
      if (err) {
        // Firestore no disponible -> respaldo local
        setLista(CARTAS_INICIALES.map((c) => ({ ...c, id: c.id })))
      } else if (d && d.length) {
        setLista(
          [...d].sort(
            (a, b) =>
              (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0) ||
              (a.orden ?? 0) - (b.orden ?? 0) ||
              (a.creado ?? 0) - (b.creado ?? 0)
          )
        )
      } else {
        // colección vacía -> respaldo local
        setLista(CARTAS_INICIALES.map((c) => ({ ...c, id: c.id })))
      }
      setCargando(false)
    })
    return unsub
  }, [])

  const cartas = useMemo(() => lista, [lista])

  return (
    <div className="min-h-screen bg-crema">
      {/* cabecera */}
      <header className="relative overflow-hidden bg-gradient-to-b from-noche to-[#2a2545] text-white">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[320px] bg-rosa/20 blur-3xl rounded-full" />
        <div className="relative max-w-5xl mx-auto px-4 pt-10 pb-12">
          <a
            href="#/"
            className="inline-flex items-center gap-2 text-xs bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition mb-6"
          >
            ← volver al inicio
          </a>

          <p className="font-hand text-3xl text-dorado">todas las que te he escrito</p>
          <h1 className="font-display font-bold text-4xl md:text-5xl mt-1">Cartitas para Cheva</h1>
          <p className="font-ui text-white/65 mt-3 max-w-xl leading-relaxed">
            Cada sobre es una carta. Ábrelas cuando quieras, en el orden que tú elijas.
            <br />
            <span className="text-dorado">{cartas.length} {cartas.length === 1 ? 'cartita' : 'cartitas'} para ti 💛</span>
          </p>

          {/* accesos a las demás secciones */}
          <nav className="mt-6 flex flex-wrap gap-2">
            {[
              { href: '#cuenta', label: '⏳ Cuenta' },
              { href: '#planes', label: '🗓️ Planes' },
              { href: '#avatars', label: '🧊 Nosotros 3D' },
              { href: '#theater', label: '🎬 Nuestra historia' },
              { href: '#galeria', label: '📸 Galería' },
              { href: '#contigo', label: '💗 Contigo' },
            ].map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-xs bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full text-white/90 transition"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* grid */}
      <main className="max-w-5xl mx-auto px-4 py-10">
        {cargando ? (
          <p className="text-center text-tinta/50 font-ui">cargando cartitas…</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 sm:gap-6">
            {cartas.map((c, i) => (
              <Sobre key={c.id} carta={c} i={i} onAbrir={() => setAbierta(c)} />
            ))}
          </div>
        )}

        <p className="text-center font-hand text-2xl text-tinta/55 mt-12">
          te las voy a seguir escribiendo, una por una 💌
        </p>

        <div className="text-center mt-6 flex justify-center gap-3">
          <a
            href="#/"
            className="text-xs bg-rosa/10 hover:bg-rosa/20 text-rosa px-5 py-2.5 rounded-full font-semibold transition"
          >
            💗 sitio principal
          </a>
          <a
            href="#admin"
            className="text-xs bg-white border border-tinta/15 hover:border-rosa hover:text-rosa text-tinta/60 px-5 py-2.5 rounded-full font-semibold transition"
          >
            ✏️ escribir cartita
          </a>
        </div>
      </main>

      <AnimatePresence>
        {abierta && <Lectura carta={abierta} onCerrar={() => setAbierta(null)} />}
      </AnimatePresence>
    </div>
  )
}
