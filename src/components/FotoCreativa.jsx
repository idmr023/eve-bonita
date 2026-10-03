import { motion } from 'framer-motion'

export default function FotoCreativa() {
  return (
    <section className="py-14 px-4 max-w-6xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="relative mx-auto w-[86%] md:w-full max-w-[420px] aspect-[3/4] rounded-t-[170px] rounded-b-[28px] overflow-hidden border-[10px] border-white shadow-2xl bg-crema">
            <img src="/foto_personaje.jpg" alt="Evelyn Cheva" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-tinta/35 via-transparent to-transparent" />
            <div className="absolute bottom-0 w-full p-4 text-white">
              <div className="font-hand text-2xl leading-none">así te veo yo</div>
              <div className="font-display font-bold text-lg -mt-1">Cheva, mi preciosa</div>
            </div>
            {/* halo dorado iglesia */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-28 h-28 border border-dorado/30 rounded-full" />
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-20 h-20 border border-dorado/20 rounded-full" />
          </div>
          {/* stickers flotando */}
          {[
            { e: '⚽', t: '12px', l: '4%', r: 'auto', d: 0 },
            { e: '📖', t: '18%', l: 'auto', r: '2%', d: 0.6 },
            { e: '🧁', t: '68%', l: '0%', r: 'auto', d: 1.1 },
            { e: '🎸', t: '78%', l: 'auto', r: '6%', d: 1.6 },
            { e: '🐶', t: '44%', l: '-6%', r: 'auto', d: 2 },
          ].map((s, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3 + s.d, repeat: Infinity, ease: 'easeInOut', delay: s.d }}
              className="absolute w-11 h-11 bg-white rounded-full shadow-lg border border-rosa-claro grid place-items-center text-xl"
              style={{ top: s.t, left: s.l, right: s.r }}
            >{s.e}</motion.div>
          ))}
        </motion.div>

        <div>
          <p className="font-hand text-2xl text-rosa">tu foto, mi favorita</p>
          <h3 className="font-display font-bold text-3xl md:text-4xl leading-tight">Usé tu foto para hacerte un altar chiquito</h3>
          <p className="font-ui text-tinta/70 mt-3 leading-relaxed">
            La puse en forma de arco, como una capilla, con luz dorada, porque así te veo: luminosa. Alrededor puse lo que amas: el balón, la Biblia, lo dulce, la música y los perritos.
            Es mi forma de decir que todo lo que te gusta también me gusta, porque viene de ti.
          </p>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            {[
              { k: 'pecas', v: 'me encantan' },
              { k: 'ojitos', v: 'amo verlos' },
              { k: 'risa', v: 'me salva' },
            ].map(x=>(
              <div key={x.k} className="bg-white rounded-2xl border border-rosa-claro p-3">
                <div className="font-display font-bold text-rosa">{x.k}</div><div className="text-xs text-tinta/60">{x.v}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-gradient-to-br from-rosa to-dorado text-white rounded-2xl p-4 font-hand text-xl text-center">nunca cambies, eres perfecta así 💛</div>
        </div>
      </div>
    </section>
  )
}
