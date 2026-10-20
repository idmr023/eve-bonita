import { useEffect } from 'react'
import Watermarks from './components/Watermarks'
import Navbar from './components/Navbar'
import HeroCountdown from './components/HeroCountdown'
import Planes from './components/Planes'
import Avatar3D from './components/Avatar3D'
import Cartita from './components/Cartita'
import FotoCreativa from './components/FotoCreativa'
import Galeria from './components/Galeria'
import Razones from './components/Razones'
import MusicVinyl from './components/MusicVinyl'
import TheaterCurtainScene from './components/TheaterCurtainScene'
import { NOMBRES } from './data/contenido'

export default function App() {
  // El navegador hace el scroll al ancla antes de que React monte -> lo forzamos
  useEffect(() => {
    const irAlHash = () => {
      const id = window.location.hash.replace(/^#/, '')
      // sin ancla (p.ej. al volver desde /cartas) -> arriba del todo
      if (!id || id === '/' || id === 'admin' || id === 'cartas') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      requestAnimationFrame(() => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
    irAlHash()
    window.addEventListener('hashchange', irAlHash)
    return () => window.removeEventListener('hashchange', irAlHash)
  }, [])

  return (
    <div className="relative min-h-screen">
      <Watermarks />
      <Navbar />

      {/* mobile nav */}
      <div className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-50 bg-tinta text-white rounded-full px-2 py-2 flex gap-1 shadow-xl">
        <a href="#cuenta" className="px-3 py-1 rounded-full text-xs">Inicio</a>
        <a href="#planes" className="px-3 py-1 rounded-full text-xs">Planes</a>
        <a href="#avatars" className="px-3 py-1 rounded-full text-xs">3D</a>
        <a href="#carta" className="px-3 py-1 rounded-full text-xs">Carta</a>
        <a href="#/cartitas" className="px-3 py-1 bg-rosa rounded-full text-xs">Cartitas</a>
        <a href="#galeria" className="px-3 py-1 rounded-full text-xs">Fotos</a>
        <a href="#theater" className="px-3 py-1 rounded-full text-xs">Historia</a>
      </div>

      <main className="relative z-10">
        <HeroCountdown />
        <div className="bg-white/70 backdrop-blur border-y border-rosa-claro">
          <Planes />
        </div>
        <Avatar3D />
        <Cartita />
        <FotoCreativa />
        <MusicVinyl />
        <Galeria />
        <Razones />
        <TheaterCurtainScene />

        <footer className="py-10 px-4 text-center bg-noche text-white/70">
          <div className="font-display font-bold text-white text-lg">Hecho con mucho amor por {NOMBRES.el} para {NOMBRES.apodo} 💛</div>
          <div className="font-hand text-dorado text-xl mt-1">eres perfecta así • nunca cambies • amo tus ojitos • me encantan tus pecas</div>
        </footer>
      </main>
    </div>
  )
}