import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { escuchar } from '../lib/db'
import { CARTAS_INICIALES, NOMBRES } from '../data/contenido'

export default function Cartita() {
  const [lista, setLista] = useState([])

  useEffect(() => {
    const unsub = escuchar('cartas', (d, err) => {
      if (err || !d || !d.length) setLista(CARTAS_INICIALES)
      else setLista(d)
    })
    return unsub
  }, [])

  const destacada = lista.find((c) => c.destacado) || lista[0] || CARTAS_INICIALES[0]
  const total = lista.length || CARTAS_INICIALES.length

  return (
    <section id="carta" className="relative py-14 px-4 bg-noche overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-noche via-[#1e1c33] to-noche" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-rosa/10 blur-3xl rounded-full" />

      <div className="relative max-w-5xl mx-auto text-center">
        <p className="font-hand text-3xl text-dorado">las cartitas que te escribo</p>
        <h2 className="font-display font-bold text-4xl md:text-5xl text-white mt-1">
          Cartitas para Cheva
        </h2>
        <p className="font-ui text-white/60 mt-2">
          Hecha con todo mi corazón • {total} {total === 1 ? 'cartita' : 'cartitas'} y contando
        </p>

        {/* sobres apilados */}
        <div className="mt-10 flex justify-center">
          <div className="relative w-[300px] md:w-[360px]">
            {/* sombra de sobres atrás */}
            <div className="absolute inset-0 translate-x-4 translate-y-3 rounded-[18px] bg-white/10 border border-white/10 rotate-3" />
            <div className="absolute inset-0 -translate-x-3 translate-y-1.5 rounded-[18px] bg-white/10 border border-white/10 -rotate-2" />

            {/* sobre principal */}
            <motion.a
              href="#cartas"
              onClick={() =>
                confetti({
                  particleCount: 70,
                  spread: 90,
                  origin: { y: 0.6 },
                  colors: ['#FF8FA3', '#F5D67B', '#FFF8F0'],
                })
              }
              whileHover={{ y: -6, rotate: 1 }}
              whileTap={{ scale: 0.99 }}
              className="relative block w-full h-[240px] md:h-[280px] cursor-pointer"
            >
              <div className="absolute inset-0 top-[34px] bg-[#FFF8F0] rounded-b-[18px] rounded-t-[6px] shadow-2xl border border-white/20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white to-[#FFF0E6]" />
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[86%] h-[1px] bg-cancha/10" />
              </div>

              {/* solapa */}
              <div className="absolute left-0 right-0 top-[34px] h-[130px] bg-[#FFE4D6] border border-[#FFD6C2] rounded-t-[18px]">
                <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent rounded-t-[18px]" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[150px] border-r-[150px] border-t-[65px] border-t-[#FFE4D6] md:border-l-[180px] md:border-r-[180px]" />
              </div>

              {/* sello */}
              <div className="absolute left-1/2 -translate-x-1/2 top-[88px] w-14 h-14 bg-rosa rounded-full border-4 border-white shadow-lg grid place-items-center text-white font-display font-bold z-10">
                ♡
              </div>

              {/* etiqueta del sobre */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-5 bg-white/95 text-tinta text-xs px-4 py-1.5 rounded-full font-semibold shadow max-w-[85%] truncate">
                {destacada?.titulo || 'Mi Cheva hermosa'}
              </div>
            </motion.a>

            <p className="font-hand text-white/50 text-center mt-4">
              toca el sobre para ver todas las cartitas
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href="#/cartitas" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-full font-semibold transition">
            💌 ver todas mis cartitas guardadas
          </a>
          <p className="font-ui text-white/50 text-sm self-center">las 3 cartitas que te escribí, en un solo lugar</p>
        </div>
      </div>
    </section>
  )
}
