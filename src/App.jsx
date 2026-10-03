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
import { NOMBRES } from './data/contenido'

export default function App() {
  return (
    <div className="relative min-h-screen">
      <Watermarks />
      <Navbar />

      {/* mobile nav */}
      <div className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-50 bg-tinta text-white rounded-full px-2 py-2 flex gap-1 shadow-xl">
        <a href="#cuenta" className="px-3 py-1 rounded-full text-xs">Inicio</a>
        <a href="#planes" className="px-3 py-1 rounded-full text-xs">Planes</a>
        <a href="#avatars" className="px-3 py-1 rounded-full text-xs">3D</a>
        <a href="#carta" className="px-3 py-1 bg-rosa rounded-full text-xs">Carta</a>
        <a href="#galeria" className="px-3 py-1 rounded-full text-xs">Fotos</a>
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

        <footer className="py-10 px-4 text-center bg-noche text-white/70">
          <div className="font-display font-bold text-white text-lg">Hecho con mucho amor por {NOMBRES.el} para {NOMBRES.apodo} 💛</div>
          <div className="font-hand text-dorado text-xl mt-1">eres perfecta así • nunca cambies • amo tus ojitos • me encantan tus pecas</div>
        </footer>
      </main>
    </div>
  )
}