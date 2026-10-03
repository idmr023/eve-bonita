import { FRASES_FONDO } from '../data/contenido'

export default function Watermarks() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* marquee diagonales */}
      <div className="absolute top-[8%] -rotate-2 w-[200%] -left-1/4 opacity-[0.07]">
        <div className="marquee-track gap-8 text-tinta font-hand text-xl md:text-2xl">
          {[...FRASES_FONDO, ...FRASES_FONDO, ...FRASES_FONDO].map((f, i) => (
            <span key={i} className="whitespace-nowrap px-6 py-1 border border-rosa/20 rounded-full bg-white/40">
              {f} ♡
            </span>
          ))}
        </div>
      </div>
      <div className="absolute top-[42%] rotate-1 w-[200%] -left-1/4 opacity-[0.05]">
        <div className="marquee-track gap-8 text-tinta font-hand text-lg" style={{ animationDirection: 'reverse', animationDuration: '34s' }}>
          {[...FRASES_FONDO].reverse().concat(FRASES_FONDO).map((f, i) => (
            <span key={i} className="whitespace-nowrap">{f} —</span>
          ))}
        </div>
      </div>
      {/* gigante detrás */}
      <div className="absolute inset-0 flex flex-col justify-around opacity-[0.035] font-display font-bold text-[10vw] leading-none text-center">
        <div>TE QUIERO</div>
        <div>ERES PERFECTA ASÍ</div>
        <div className="text-rosa">CHE♡VA</div>
      </div>
      {/* confetti textura cancha sutil */}
      <svg className="absolute bottom-0 w-full h-24 opacity-[0.06] text-cancha" viewBox="0 0 1000 100" preserveAspectRatio="none">
        <line x1="0" y1="50" x2="1000" y2="50" stroke="currentColor" strokeWidth="1" />
        <circle cx="500" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1" />
        <rect x="0" y="15" width="140" height="70" fill="none" stroke="currentColor" strokeWidth="1" />
        <rect x="860" y="15" width="140" height="70" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
    </div>
  )
}
