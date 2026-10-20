import { useEffect, useRef, useState } from 'react'
import { escucharDoc, guardarDoc, escuchar, stamp } from '../lib/db.js'
import { CARTAS_INICIALES } from '../data/contenido.js'

export default function CartaPanel() {
  const [texto, setTexto] = useState('')
  const [firma, setFirma] = useState('')
  const [cargando, setCargando] = useState(true)
  const [estado, setEstado] = useState('')
  const [hayCartas, setHayCartas] = useState(false)
  const timer = useRef(null)

  useEffect(() => {
    const unsub = escucharDoc('carta', 'actual', (d) => {
      if (d) {
        setTexto(d.texto ?? '')
        setFirma(d.firma ?? '')
      }
      setCargando(false)
    })
    const unsub2 = escuchar('cartas', (d) => { if (d) setHayCartas(d.length > 0) })
    return () => { unsub?.(); unsub2?.() }
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

  // Copia esta carta al documento de la colección "cartas"
  const migrar = async () => {
    const inicial = CARTAS_INICIALES[0]
    try {
      await guardarDoc('cartas', inicial.id, {
        ...inicial,
        texto: texto || inicial.texto,
        firma: firma || inicial.firma,
        creado: Date.now(),
      })
      avisar('copiada a Cartitas ✓')
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

      <div className="bg-white rounded-[24px] border border-rosa-claro p-5 shadow-sm">
        <h3 className="font-display font-bold text-lg">¿Llevarla a la página de cartitas?</h3>
        <p className="text-sm text-tinta/60 mt-1">
          Las cartitas nuevas se escriben en la pestaña <strong>📜 Cartitas</strong>. Esta carta principal
          también puede copiarse allí para que quede junto a las demás.
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-3">
          <button
            onClick={migrar}
            className="bg-tinta text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-tinta/90"
          >
            📜 copiar a Cartitas
          </button>
          {hayCartas && (
            <span className="text-xs text-tinta/50">ya hay cartitas en la colección (no se borra nada)</span>
          )}
        </div>
      </div>
    </div>
  )
}
