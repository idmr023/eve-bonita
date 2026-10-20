import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useCountdown } from '../hooks/useCountdown'
import { getProximoDomingo1630, NOMBRES, VERSICULO } from '../data/contenido'

function Box({ v, label }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-rosa-claro px-4 md:px-6 py-4 text-center min-w-[72px] md:min-w-[92px]">
      <div className="font-display font-bold text-3xl md:text-4xl text-tinta leading-none">{String(v).padStart(2, '0')}</div>
      <div className="text-xs tracking-widest uppercase text-tinta/60 font-ui mt-1">{label}</div>
    </div>
  )
}

export default function HeroCountdown() {
  const target = getProximoDomingo1630()
  const t = useCountdown(target)
  const fechaLinda = target.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' })

  const lanzar = () => {
    confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 }, colors: ['#FF8FA3','#F5D67B','#A50044','#004D98','#2D6A4F'] })
  }

  return (
    <section id="cuenta" className="relative min-h-[88vh] flex flex-col items-center justify-center px-4 pt-20 pb-10 text-center overflow-hidden">
      {/* halo dorado iglesia/biblia */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[520px] bg-gradient-to-b from-dorado/25 via-rosa-claro/15 to-transparent rounded-full blur-3xl" />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative z-10 max-w-3xl w-full">
        <p className="font-hand text-2xl md:text-3xl text-rosa rotate-[-1deg]">para mi Cheva hermosa —</p>
        <h1 className="font-display font-bold leading-[0.9] text-[44px] md:text-[72px] text-tinta mt-2">
          faltan <span className="text-rosa inline-block rotate-[-1deg]">poquitos</span> <br /> para vernos
        </h1>
        <p className="mt-4 font-ui text-tinta/70">
          <span className="inline-flex items-center gap-2 bg-white border border-rosa-claro px-4 py-2 rounded-full text-sm shadow-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> {fechaLinda} • {NOMBRES.el} espera a {NOMBRES.apodo}
          </span>
        </p>

        {t.done ? (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="mt-8 bg-gradient-to-br from-rosa to-dorado text-white rounded-[28px] p-8 shadow-xl">
            <div className="text-4xl">¡Es hoy! 💛</div>
            <p className="font-hand text-2xl mt-2">Cheva, ya es sábado 3pm — te veo pronto</p>
            <button onClick={lanzar} className="mt-4 bg-white text-rosa px-6 py-2 rounded-full font-bold">celebrar ✨</button>
          </motion.div>
        ) : (
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Box v={t.d} label="días" />
            <Box v={t.h} label="horas" />
            <Box v={t.m} label="min" />
            <Box v={t.s} label="seg" />
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a href="#carta" onClick={lanzar} className="bg-tinta text-white px-6 py-3 rounded-full font-semibold shadow hover:bg-tinta/90 transition">abrir mi cartita para ti ↓</a>
          <a href="#planes" className="bg-white border border-rosa-claro px-6 py-3 rounded-full font-semibold shadow-sm hover:bg-rosa-claro/40 transition">ver nuestros planes</a>
        </div>

        <div className="mt-8 max-w-xl mx-auto bg-white/70 backdrop-blur rounded-2xl border border-white p-4">
          <p className="font-display italic text-tinta/80">“{VERSICULO.texto}”</p>
          <p className="font-ui text-xs tracking-widest uppercase text-tinta/50 mt-1">{VERSICULO.ref} • como tú me enseñas</p>
        </div>

        <div className="mt-6 flex justify-center gap-2 text-xs font-ui text-tinta/50">
          <span className="px-2 py-1 bg-barca1 text-white rounded-full">Barça</span>
          <span className="px-2 py-1 bg-barca2 text-white rounded-full">Barça</span>
          <span className="px-2 py-1 bg-[#FFF8E7] text-[#8B0000] border border-[#D32F2F]/30 rounded-full">La U</span>
          <span className="px-2 py-1 bg-cancha text-white rounded-full">estadio</span>
          <span className="px-2 py-1 bg-rosa text-white rounded-full">postres</span>
        </div>
      </motion.div>

      {/* vinilo decorativo taylor/airbag etc girando muy sutil */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="absolute -right-10 md:right-8 bottom-0 w-40 h-40 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-tinta to-[#3d3a5a] border-[10px] border-white shadow-xl flex items-center justify-center opacity-90"
      >
        <div className="w-12 h-12 rounded-full bg-dorado border-4 border-white" />
        <span className="absolute text-[10px] tracking-[0.3em] text-white/60 rotate-90">TAYLOR • AIRBAG • OASIS • GREEN DAY</span>
      </motion.div>
    </section>
  )
}
