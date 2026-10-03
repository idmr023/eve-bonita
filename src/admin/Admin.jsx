import { useState } from 'react'
import CartaPanel from './CartaPanel.jsx'
import CancionesPanel from './CancionesPanel.jsx'
import FotosPanel from './FotosPanel.jsx'
import PlanesPanel from './PlanesPanel.jsx'

const TABS = [
  { id: 'carta', label: 'Carta', emoji: '💌' },
  { id: 'canciones', label: 'Canciones', emoji: '🎵' },
  { id: 'fotos', label: 'Fotos', emoji: '📸' },
  { id: 'planes', label: 'Planes', emoji: '🗓️' },
]

export default function Admin() {
  const [tab, setTab] = useState('carta')

  return (
    <div className="min-h-screen bg-crema">
      <header className="bg-tinta text-white sticky top-0 z-20 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-full bg-rosa grid place-items-center font-display font-bold">♡</span>
            <div className="leading-tight">
              <div className="font-display font-bold">Admin • eve-bonita</div>
              <div className="text-[11px] text-white/50">los cambios se ven al instante</div>
            </div>
          </div>
          <nav className="flex gap-1 flex-wrap ml-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition ${
                  tab === t.id ? 'bg-rosa text-white' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </nav>
          <a href="#/" className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full">
            ← ver sitio
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {tab === 'carta' && <CartaPanel />}
        {tab === 'canciones' && <CancionesPanel />}
        {tab === 'fotos' && <FotosPanel />}
        {tab === 'planes' && <PlanesPanel />}
      </main>
    </div>
  )
}
