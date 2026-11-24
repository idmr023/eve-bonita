import { useEffect, useMemo, useState } from 'react'

export const HORAS = Array.from({ length: 15 }, (_, i) => String(i + 8).padStart(2, '0') + ':00')
export const PERSONAS = [
  { id: 'ivan', nombre: 'Iván' },
  { id: 'cheva', nombre: 'Cheva' },
]

const QUIEN_KEY = 'eve-horario-quien'

const ESTILOS = {
  libre: 'bg-cancha text-white',
  uno: 'bg-rosa-claro text-tinta',
  ambos: 'bg-tinta/20 text-tinta/70',
}

function leerQuien() {
  try {
    const guardado = localStorage.getItem(QUIEN_KEY)
    return PERSONAS.some((p) => p.id === guardado) ? guardado : ''
  } catch {
    return ''
  }
}

export default function HourlyCalendar({ fecha, onPlan, onToggleOcupado, ocupados = { ivan: [], cheva: [] }, planes = [] }) {
  const [quien, setQuien] = useState(leerQuien)
  const [modo, setModo] = useState('horario')
  const [horaPlan, setHoraPlan] = useState(null)
  const [tituloPlan, setTituloPlan] = useState('')
  const [prioridad, setPrioridad] = useState('media')

  // Al cambiar de día no se arrastra la hora elegida del día anterior.
  useEffect(() => { setHoraPlan(null) }, [fecha])

  const planesFecha = useMemo(
    () => planes.filter((p) => p.fecha === fecha && !p.hecho),
    [planes, fecha],
  )

  const planesPorHora = useMemo(() => {
    const map = {}
    planesFecha.forEach((p) => { if (p.hora) (map[p.hora] ??= []).push(p.titulo) })
    return map
  }, [planesFecha])

  const ocupadoPor = (hora) => PERSONAS.filter((p) => (ocupados[p.id] || []).includes(`${fecha}T${hora}`))
  const libresAmbos = HORAS.filter((h) => ocupadoPor(h).length === 0)

  const elegirQuien = (id) => {
    setQuien(id)
    try { localStorage.setItem(QUIEN_KEY, id) } catch { /* se recuerda solo en esta visita */ }
  }

  const tocarHora = (hora) => {
    if (modo === 'horario') {
      if (quien) onToggleOcupado?.(quien, hora)
      return
    }
    setHoraPlan(horaPlan === hora ? null : hora)
  }

  const agregarPlan = (e) => {
    e.preventDefault()
    if (!tituloPlan.trim() || !horaPlan) return
    onPlan?.({ titulo: tituloPlan.trim(), prior: prioridad, fecha, hora: horaPlan, categoria: 'citas', hecho: false })
    setTituloPlan('')
    setHoraPlan(null)
  }

  const pestana = (id) => `flex-1 rounded-full px-3 py-2 text-xs font-bold transition ${modo === id ? 'bg-tinta text-white' : 'text-tinta/60 hover:text-tinta'}`
  const nombreQuien = PERSONAS.find((p) => p.id === quien)?.nombre

  return (
    <div className="bg-white rounded-[20px] border border-rosa-claro p-4 shadow-sm">
      <div className="font-display font-bold capitalize text-xl mb-3">
        {fecha ? new Date(fecha + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' }) : ''}
      </div>

      <div className="flex rounded-full bg-crema p-1 mb-3" role="tablist" aria-label="Qué quieres hacer">
        <button type="button" role="tab" aria-selected={modo === 'horario'} onClick={() => setModo('horario')} className={pestana('horario')}>🕒 Mi horario</button>
        <button type="button" role="tab" aria-selected={modo === 'plan'} onClick={() => setModo('plan')} className={pestana('plan')}>💕 Agendar plan</button>
      </div>

      {modo === 'horario' ? (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-tinta/70">Soy</span>
            {PERSONAS.map((p) => (
              <button key={p.id} type="button" aria-pressed={quien === p.id} onClick={() => elegirQuien(p.id)}
                className={`rounded-full border px-3 py-1 text-xs font-bold transition ${quien === p.id ? 'bg-rosa text-white border-rosa' : 'bg-white text-tinta/70 border-rosa-claro hover:bg-rosa-claro/40'}`}>
                {p.nombre}
              </button>
            ))}
          </div>
          <p className="text-xs text-tinta/60">
            {quien
              ? <>Toca las horas en que <b>{nombreQuien}</b> no puede. Toca otra vez para dejarla libre.</>
              : 'Primero elige quién eres. Luego toca las horas en que no puedes.'}
          </p>
        </div>
      ) : (
        <p className="text-xs text-tinta/60 mb-3">
          {libresAmbos.length > 0
            ? 'Toca una hora verde (libres los dos) y escribe el plan.'
            : 'No quedan horas libres para los dos este día.'}
        </p>
      )}

      <div className="grid grid-cols-3 gap-2 mb-3">
        {HORAS.map((hora) => {
          const quienes = ocupadoPor(hora)
          const estado = quienes.length === 2 ? 'ambos' : quienes.length === 1 ? 'uno' : 'libre'
          const mio = quienes.some((p) => p.id === quien)
          const plan = planesPorHora[hora]?.[0]
          const bloqueada = modo === 'plan' ? estado !== 'libre' : !quien
          const detalle = plan || (estado === 'libre' ? 'libre' : estado === 'ambos' ? 'los dos ocupados' : `ocupado: ${quienes[0].nombre}`)
          return (
            <button
              key={hora}
              type="button"
              disabled={bloqueada}
              aria-pressed={modo === 'horario' ? mio : horaPlan === hora}
              onClick={() => tocarHora(hora)}
              className={`h-14 rounded-xl px-1 text-center transition ${ESTILOS[estado]} ${plan ? 'ring-2 ring-rosa' : ''} ${modo === 'plan' && horaPlan === hora ? 'outline outline-2 outline-offset-1 outline-tinta' : ''} ${modo === 'horario' && mio ? 'outline outline-2 outline-offset-1 outline-rosa' : ''} ${bloqueada ? 'cursor-not-allowed opacity-50' : 'hover:scale-[1.03]'}`}
            >
              <span className="block text-sm font-bold leading-none">{hora}</span>
              <span className="mt-1 block truncate text-[10px] leading-tight">{detalle}</span>
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-tinta/60 mb-1">
        <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-cancha" /> libres los dos</span>
        <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-rosa-claro border border-rosa" /> uno ocupado</span>
        <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-tinta/30" /> los dos ocupados</span>
      </div>

      {modo === 'plan' && horaPlan && (
        <form onSubmit={agregarPlan} className="mt-3 pt-3 border-t border-rosa-claro/40">
          <p className="mb-2 text-sm"><span className="font-semibold">Plan para las</span> <span className="font-display font-bold text-rosa">{horaPlan}</span></p>
          <div className="flex flex-wrap gap-2">
            <input
              value={tituloPlan}
              onChange={(e) => setTituloPlan(e.target.value)}
              placeholder="¿qué harán?"
              aria-label="Título del plan"
              className="flex-1 min-w-[150px] bg-crema border border-rosa-claro rounded-full px-4 py-2 outline-none focus:border-rosa"
            />
            <select value={prioridad} onChange={(e) => setPrioridad(e.target.value)} aria-label="Prioridad" className="bg-crema border border-rosa-claro rounded-full px-3 py-2 outline-none focus:border-rosa">
              <option value="alta">alta</option>
              <option value="media">media</option>
              <option value="baja">baja</option>
            </select>
            <button type="submit" disabled={!tituloPlan.trim()} className="bg-rosa text-white px-5 py-2 rounded-full font-bold hover:bg-rosa/90 disabled:opacity-50">agendar</button>
          </div>
        </form>
      )}

      {planesFecha.length > 0 && (
        <div className="mt-3 space-y-1">
          <p className="text-xs font-semibold text-tinta/70">Planes de este día</p>
          {planesFecha.map((p) => (
            <div key={p.id} className="text-xs bg-crema rounded-full px-3 py-2">
              {p.hora ? `${p.hora} • ` : ''}{p.titulo}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
