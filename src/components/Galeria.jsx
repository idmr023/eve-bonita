import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { escuchar, urlDe, porOrden } from '../lib/db.js'
import { PLANES_INICIALES } from '../data/contenido.js'

const EMOJI = { estadio: '🏟️', futbol: '⚽', postres: '🧁', pelis: '🎬', iglesia: '⛪', selva: '🍃', barca: '🔵🔴', musica: '🎸', perritos: '🐶', paseo: '🎡', correr: '🏃', citas: '💑' }
const COLORES = ['bg-rosa', 'bg-tinta', 'bg-dorado', 'bg-selva', 'bg-barca2', 'bg-[#8B5CF6]']

export default function Galeria() {
  const [light, setLight] = useState(null)
  const [fotos, setFotos] = useState([])
  const [urls, setUrls] = useState({})
  const [planes, setPlanes] = useState([])

  useEffect(() => {
    const unsubFotos = escuchar('fotos', (d) => { if (d) setFotos([...d].sort(porOrden)) })
    const unsubPlanes = escuchar('planes', (d) => { if (d && d.length) setPlanes(d) })
    return () => { unsubFotos?.(); unsubPlanes?.() }
  }, [])

  useEffect(() => {
    if (!fotos.length) return
    let cancelado = false
    Promise.all(fotos.map((f) => urlDe(f.url).then((u) => [f.id, u])))
      .then((pairs) => { if (!cancelado) setUrls(Object.fromEntries(pairs)) })
    return () => { cancelado = true }
  }, [fotos])

  const conFoto = fotos.filter((f) => urls[f.id])
  const listaPlanes = planes.length ? planes : PLANES_INICIALES

  // tarjetas = actividades sin foto vinculada (pendientes y hechas sin foto)
  const conFotoVinculada = new Set(conFoto.map((f) => f.actividad).filter(Boolean))
  const tarjetas = listaPlanes.filter((p) => !conFotoVinculada.has(p.id))

  return (
    <section id="galeria" className="py-14 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-6">
        <p className="font-hand text-2xl text-rosa">nuestros recuerdos</p>
        <h2 className="font-display font-bold text-4xl">Galería</h2>
        <p className="font-ui text-tinta/60 mt-2">
          {conFoto.length ? 'Toca una foto para ampliarla.' : 'Una foto real + todo lo que vamos a llenar juntos. Toca para ampliar.'}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[180px]">
        {conFoto.length === 0 && (
          <motion.button onClick={() => setLight('/foto_personaje.jpg')} whileHover={{ y: -4 }} className="col-span-2 row-span-2 relative overflow-hidden rounded-[24px] border-4 border-white shadow-xl text-left">
            <img src="/foto_personaje.jpg" alt="Nosotros" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-tinta/60 to-transparent" />
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-3 py-2 rounded-full text-sm font-bold">Cheva 💛 — mi foto favorita</div>
          </motion.button>
        )}

        {conFoto.map((f, i) => (
          <motion.button
            key={f.id}
            onClick={() => setLight(urls[f.id])}
            whileHover={{ y: -4 }}
            className={`${conFoto.length && i === 0 ? 'col-span-2 row-span-2' : ''} relative overflow-hidden rounded-[24px] border-4 border-white shadow-xl text-left`}
          >
            <img src={urls[f.id]} alt={f.titulo || 'foto'} className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-tinta/70 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-sm font-bold inline-block max-w-full truncate">
                {f.titulo || 'nuestra foto'} 💛
              </div>
              {f.sub && <div className="text-white text-xs mt-1 drop-shadow">{f.sub}</div>}
            </div>
          </motion.button>
        ))}

        {tarjetas.map((p, i) => {
          const emo = EMOJI[p.categoria] || '💛'
          const hecho = !!p.hecho
          const color = hecho ? 'bg-cancha' : COLORES[i % COLORES.length]
          return (
            <div key={p.id} className={`${color} rounded-[24px] p-4 text-white flex flex-col justify-between shadow-sm border border-white/20 relative overflow-hidden`}>
              <div className="absolute -right-6 -top-6 w-20 h-20 bg-white/15 rounded-full" />
              <div className="font-display font-bold leading-tight">
                {hecho ? '✓ ' : 'Próxima: '}{emo} {p.titulo}
              </div>
              <div className="text-sm opacity-80">{hecho ? 'ya la vivimos 💛' : 'nos falta vivirla'}</div>
              <div className={`text-xs self-start px-2 py-1 rounded-full ${hecho ? 'bg-white/25' : 'bg-white/20'}`}>
                {hecho ? 'hecha' : 'pronto'}
              </div>
            </div>
          )
        })}
      </div>

      {light && (
        <div onClick={() => setLight(null)} className="fixed inset-0 z-50 bg-tinta/80 backdrop-blur grid place-items-center p-4 cursor-pointer">
          <img src={light} alt="lightbox" className="max-h-[86vh] max-w-[92vw] rounded-[18px] shadow-2xl border-4 border-white" />
        </div>
      )}
    </section>
  )
}
