import { useEffect, useState } from 'react'
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore'
import { MessageCircle, X } from 'lucide-react'
import Chat from './Chat'
import { db } from '../lib/firebase'
import { leerNombre, leerVisto, sonarAviso } from '../lib/chat'

const MAX_CONTADOS = 30

export default function ChatFlotante() {
  const [abierto, setAbierto] = useState(false)
  const [sinLeer, setSinLeer] = useState(0)

  // Con el chat cerrado, cuenta los mensajes ajenos posteriores al último visto.
  // Solo si este navegador ya usó el chat (tiene nombre guardado).
  useEffect(() => {
    if (abierto) {
      setSinLeer(0)
      return
    }
    const nombre = leerNombre()
    if (!nombre) return
    let previo = null
    const consulta = query(collection(db, 'chat_mensajes'), orderBy('creado', 'desc'), limit(MAX_CONTADOS))
    return onSnapshot(consulta, (snapshot) => {
      const visto = leerVisto()
      const nuevos = snapshot.docs.filter((documento) => {
        const mensaje = documento.data()
        return mensaje.nombre !== nombre && mensaje.creado && mensaje.creado.toMillis() > visto
      }).length
      if (previo !== null && nuevos > previo) sonarAviso()
      previo = nuevos
      setSinLeer(nuevos)
    }, (error) => {
      console.warn('No se pudieron contar los mensajes nuevos:', error)
    })
  }, [abierto])

  const etiqueta = abierto
    ? 'Minimizar chat'
    : sinLeer ? `Abrir chat, ${sinLeer} mensajes nuevos` : 'Abrir chat'

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
      <button type="button" aria-label={etiqueta} aria-expanded={abierto} aria-controls="chat-flotante" onClick={() => setAbierto(!abierto)} className="relative flex h-14 w-14 items-center justify-center rounded-full bg-rosa text-white shadow-xl transition hover:bg-barca1">
        {abierto ? <X size={24} aria-hidden="true" /> : <MessageCircle size={24} aria-hidden="true" />}
        {!abierto && sinLeer > 0 && (
          <span aria-hidden="true" className="absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full border-2 border-white bg-barca1 px-1 text-xs font-bold text-white">
            {sinLeer >= MAX_CONTADOS ? `${MAX_CONTADOS}+` : sinLeer}
          </span>
        )}
      </button>
    </div>
  )
}
