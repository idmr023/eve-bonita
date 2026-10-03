import { useState } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { RAZONES } from '../data/contenido'

export default function Razones() {
  const [lluvia, setLluvia] = useState(false)

  const abrazar = () => {
    setLluvia(true)
    confetti({ particleCount: 140, spread: 100, origin: { y: 0.6 }, colors: ['#FF8FA3','#FFF8F0','#F5D67B'] })
    setTimeout(()=>setLluvia(false), 2600)
  }

  return (
    <section id="contigo" className="relative py-14 px-4 bg-gradient-to-b from-crema to-rosa-claro/30 overflow-hidden">
      {lluvia && (
        <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
          {Array.from({ length: 18 }).map((_, i)=>(
            <motion.div key={i} initial={{ y: -40, x: Math.random()*100+'vw', rotate: 0 }} animate={{ y: '110vh', rotate: 360 }} transition={{ duration: 2.2 + Math.random(), ease: 'linear' }}
              className="absolute text-sm md:text-base bg-white border border-rosa-claro px-3 py-1.5 rounded-full shadow">
              {['te quiero','eres perfecta así','amo tus ojitos','nunca cambies','mi Cheva'][i%5]} ♡
            </motion.div>
          ))}
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="text-center">
          <p className="font-hand text-2xl text-rosa">para cuando lo necesites</p>
          <h2 className="font-display font-bold text-4xl">Puedes contar conmigo</h2>
          <p className="font-ui text-tinta/60 mt-2 max-w-2xl mx-auto">No solo en los planes bonitos. También cuando tengas un día malo, cuando extrañes, cuando quieras reír o llorar. Aquí estoy, Iván, para ti.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-8">
          {RAZONES.map(r=>(
            <div key={r.titulo} className="bg-white rounded-[20px] border border-rosa-claro p-5 shadow-sm">
              <div className="font-display font-bold text-lg text-tinta">{r.titulo}</div>
              <div className="font-ui text-tinta/70 text-sm mt-1 leading-relaxed">{r.texto}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-white rounded-[24px] border border-rosa-claro p-6 grid md:grid-cols-[1.2fr_0.8fr] gap-6 items-center shadow-sm">
          <div>
            <div className="font-display font-bold text-xl">Mi promesa</div>
            <p className="font-ui text-tinta/70 text-sm mt-2 leading-relaxed">
              Te prometo escucharte sin juzgar, celebrar tus metas como si fueran míos, apoyarte cuando requieras y darte espacio cuando gustes, quererte tal como eres, y hacerte sentir preciosa cada día. Si algo te pesa, lo cargamos entre dos.
            </p>
            <div className="flex gap-2 mt-3 flex-wrap text-xs">
              <span className="px-3 py-1 bg-rosa text-white rounded-full">siempre voy a estar</span>
              <span className="px-3 py-1 bg-crema border rounded-full">en las buenas y en las no tan buenas</span>
            </div>
          </div>
          <div className="text-center">
            <button onClick={abrazar} className="w-full bg-gradient-to-br from-rosa to-tinta text-white rounded-[18px] p-6 font-bold shadow hover:scale-[1.01] transition">
              <div className="text-2xl">apriétame si tienes un mal día</div>
              <div className="font-hand text-dorado text-xl mt-1">— un abrazo de Iván —</div>
            </button>
            <p className="text-xs text-tinta/50 mt-2">te lloverán mis “te quiero”</p>
          </div>
        </div>
      </div>
    </section>
  )
}
