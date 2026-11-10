import { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import Chat from './Chat'

export default function ChatFlotante() {
  const [abierto, setAbierto] = useState(false)

  return (
    <div className="fixed bottom-20 right-3 z-[70] flex flex-col items-end gap-3 md:bottom-5 md:right-5">
      {abierto && (
        <section id="chat-flotante" aria-label="Ventana del chat" className="w-[min(390px,calc(100vw-1.5rem))] max-h-[calc(100dvh-8rem)] overflow-y-auto rounded-[24px] bg-crema shadow-2xl">
          <div className="flex items-center justify-between bg-tinta px-4 py-3 text-white">
            <span className="font-display font-bold">Nuestro chat</span>
            <button type="button" aria-label="Cerrar chat" onClick={() => setAbierto(false)} className="rounded-full p-1 hover:bg-white/20"><X size={20} /></button>
          </div>
          <Chat flotante />
        </section>
      )}
      <button type="button" aria-label={abierto ? 'Minimizar chat' : 'Abrir chat'} aria-expanded={abierto} aria-controls="chat-flotante" onClick={() => setAbierto(!abierto)} className="flex h-14 w-14 items-center justify-center rounded-full bg-rosa text-white shadow-xl transition hover:bg-barca1">
        {abierto ? <X size={24} aria-hidden="true" /> : <MessageCircle size={24} aria-hidden="true" />}
      </button>
    </div>
  )
}
