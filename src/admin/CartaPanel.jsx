import { useEffect, useRef, useState } from 'react'
import { escucharDoc, guardarDoc, stamp } from '../lib/db.js'

export default function CartaPanel() {
  const [texto, setTexto] = useState('')
  const [firma, setFirma] = useState('')
  const [cargando, setCargando] = useState(true)
  const [estado, setEstado] = useState('')
  const timer = useRef(null)

  useEffect(() => {
    const unsub = escucharDoc('carta', 'actual', (d) => {
      if (d) {
        setTexto(d.texto ?? '')
        setFirma(d.firma ?? '')
      }
      setCargando(false)
    })
    return unsub
  }, [])

  const avisar = (msg) => {
    setEstado(msg)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setEstado(''), 2500)
  }

  const guardar = async () => {
    try {
      await guardarDoc('carta', 'actual', { texto, firma, ...stamp() })
      avisar('guardado ✓')
    } catch (e) {
      avisar('error: ' + e.message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-[24px] border border-rosa-claro p-5 shadow-sm">
        <h2 className="font-display font-bold text-2xl">La cartita</h2>
        <p className="text-sm text-tinta/60 mt-1">
          Esto es lo que ella lee al abrir el sobre. Si está vacío, el sitio muestra el texto local de respaldo.
        </p>

        {cargando && <p className="text-sm text-tinta/50 mt-4">cargando…</p>}

        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={16}
          placeholder="Escribe aquí la carta…"
          className="w-full mt-4 bg-crema border border-rosa-claro rounded-2xl p-4 text-[14px] leading-relaxed outline-none focus:border-rosa resize-y"
        />

        <div className="flex flex-wrap items-center gap-3 mt-3">
          <label className="text-sm text-tinta/70">
            firma:{' '}
            <input
              value={firma}
              onChange={(e) => setFirma(e.target.value)}
              placeholder="siempre tuyo, Iván"
              className="bg-crema border border-rosa-claro rounded-full px-4 py-2 outline-none focus:border-rosa"
            />
          </label>
          <button
            onClick={guardar}
            className="ml-auto bg-rosa text-white px-6 py-2.5 rounded-full font-bold hover:bg-rosa/90"
          >
            guardar carta
          </button>
          {estado && <span className="text-sm text-cancha font-semibold">{estado}</span>}
        </div>
      </div>
    </div>
  )
}
