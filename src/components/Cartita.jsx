import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { CARTA_TEXTO, NOMBRES } from '../data/contenido'
import { escucharDoc } from '../lib/db'

export default function Cartita() {
  const [open, setOpen] = useState(false)
  const [remota, setRemota] = useState(null)

  useEffect(() => {
    const unsub = escucharDoc('carta', 'actual', (d) => setRemota(d))
    return unsub
  }, [])

  const texto = remota?.texto || CARTA_TEXTO
  const firma = remota?.firma || `siempre tuyo, ${NOMBRES.el}`

  const toggle = () => {
    const next = !open
    setOpen(next)
    if (next) confetti({ particleCount: 90, spread: 80, origin: { y: 0.65 }, colors: ['#FF8FA3','#F5D67B','#FFF8F0'] })
  }

  return (
    <section id="carta" className="relative py-14 px-4 bg-noche overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-noche via-[#1e1c33] to-noche" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-rosa/10 blur-3xl rounded-full" />
      <div className="relative max-w-5xl mx-auto text-center">
        <p className="font-hand text-3xl text-dorado">una cartita para ti</p>
        <h2 className="font-display font-bold text-4xl md:text-5xl text-white mt-1">Abre el sobre, Cheva</h2>
        <p className="font-ui text-white/60 mt-2">Hecha con todo mi corazón • toca el sobre</p>

        <div className="mt-10 flex justify-center">
          <div className="relative w-[360px] md:w-[520px]">
            {/* sobre */}
            <motion.button
              onClick={toggle}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.99 }}
              className="relative w-full h-[280px] md:h-[320px] cursor-pointer"
              aria-label="Abrir carta"
            >
              {/* cuerpo sobre */}
              <div className="absolute inset-0 top-[40px] bg-[#FFF8F0] rounded-b-[18px] rounded-t-[6px] shadow-2xl border border-white/20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white to-[#FFF0E6]" />
                {/* líneas cancha sutil */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[86%] h-[1px] bg-cancha/10" />
              </div>
              {/* solapa */}
              <motion.div
                animate={{ rotateX: open ? -180 : 0 }}
                transition={{ duration: 0.7, ease: 'easeInOut' }}
                style={{ transformOrigin: 'top' }}
                className="absolute left-0 right-0 top-[40px] h-[140px] bg-[#FFE4D6] border border-[#FFD6C2] rounded-t-[18px]"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent rounded-t-[18px]" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[180px] border-r-[180px] border-b-[0px] border-t-[70px] border-t-[#FFE4D6] md:border-l-[260px] md:border-r-[260px]" />
              </motion.div>
              {/* sello */}
              <div className="absolute left-1/2 -translate-x-1/2 top-[98px] w-14 h-14 bg-rosa rounded-full border-4 border-white shadow-lg grid place-items-center text-white font-display font-bold z-10">
                ♡
              </div>
              {/* carta que sale */}
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ y: 60, opacity: 0 }}
                    animate={{ y: -26, opacity: 1 }}
                    exit={{ y: 60, opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="absolute left-1/2 -translate-x-1/2 top-[34px] w-[88%] bg-white rounded-[14px] shadow-2xl border border-rosa-claro p-6 md:p-7 text-left max-h-[420px] overflow-auto"
                  >
                    <div className="font-hand text-dorado text-sm tracking-widest uppercase">Para Evelyn “Cheva” — de Iván</div>
                    <div className="font-display italic text-rosa mt-1">mi niña de pecas y ojitos bonitos,</div>
                    <pre className="whitespace-pre-wrap font-ui text-[13px] md:text-[14px] leading-relaxed text-tinta mt-3">{texto}</pre>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="font-hand text-xl text-rosa">{firma}</span>
                      <button onClick={() => { navigator.clipboard.writeText(texto); confetti({ particleCount: 40, origin: { y: 0.7 } }) }} className="text-xs bg-crema border border-rosa-claro px-3 py-1.5 rounded-full">copiar cartita</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {!open && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-6 bg-tinta text-white text-sm px-5 py-2.5 rounded-full font-semibold shadow">toca para abrir 💌</div>
              )}
            </motion.button>
            <p className="font-hand text-white/50 text-center mt-3">{open ? 'vuelve a tocar para cerrar' : 'hay algo que quiero decirte...'}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
