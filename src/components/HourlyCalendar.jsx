import { useMemo, useState } from 'react'

export const HORAS = Array.from({ length: 15 }, (_, i) => String(i + 8).padStart(2, '0') + ':00')

const ESTILOS = {
  libre: { bg: 'bg-cancha', ring: '', text: 'text-white', etiqueta: 'bg-cancha text-white', nombre: 'libre' },
  uno: { bg: 'bg-rosa-claro', ring: '', text: 'text-rosa/90', etiqueta: 'bg-rosa text-white', nombre: 'ocupado' },
  ambos: { bg: 'bg-tinta/25', ring: '', text: 'text-tinta/60', etiqueta: 'bg-tinta text-white', nombre: 'ocupados ambos' },
}

function ocupadoEn(lista, fecha, hora) {
  return lista.includes(`${fecha}T${hora}`)
}

function key(fecha, hora) {
  return `${fecha}T${hora}`
}

export function HoraSlot({ hora, estado, plan, onClick, seleccionado }) {
  const s = estado === 'ambos' ? ESTILOS.ambos : estado === 'uno' ? ESTILOS.uno : ESTILOS.libre
  const clickable = estado !== 'ambos'
  return (
    <button
      onClick={() => clickable && onClick?.(hora)}
      className={`relative h-12 rounded-xl border border-transparent transition-all cursor-pointer text-center ${s.bg} ${s.text} hover:scale-[1.02] ${plan ? 'ring-2 ring-rosa' : ''} ${seleccionado ? 'outline outline-2 outline-tinta' : ''} ${!clickable ? 'cursor-not-allowed opacity-60' : ''}`}
    >
      <span className="font-semibold leading-none">{String(hora).slice(0, 2)}h</span>
      {plan && <span className="block text-[10px] opacity-90 truncate px-1 mt-0.5">{plan}</span>}
      <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${s.etiqueta}`} />
    </button>
  )
}

export default function HourlyCalendar({ fecha, onPlan, onToggleOcupado, ocupadosIvan = [], ocupadosCheva = [], planes = [] }) {
  const [selectedHour, setSelectedHour] = useState(null)
  const [tituloPlan, setTituloPlan] = useState('')
  const [prioridad, setPrioridad] = useState('media')

  const planesFecha = useMemo(
    () => planes.filter(p => p.fecha === fecha && !p.hecho),
    [planes, fecha],
  )

  const planesPorHora = useMemo(() => {
    const map = {}
    planesFecha.forEach(p => {
      if (p.hora) {
        map[p.hora] ??= []
        map[p.hora].push(p.titulo)
      }
    })
    return map
  }, [planesFecha])

  const horasLibresAmbos = useMemo(
    () => HORAS.filter(h => !ocupadoEn(ocupadosIvan, fecha, h) && !ocupadoEn(ocupadosCheva, fecha, h)),
    [fecha, ocupadosIvan, ocupadosCheva],
  )

  const handleSlotClick = (hora, estado) => {
    if (estado === 'libre' || estado === 'uno') {
      onToggleOcupado?.(hora)
      setSelectedHour(selectedHour === hora ? null : hora)
    }
  }

  const agregarPlan = (e) => {
    e.preventDefault()
    if (!tituloPlan.trim()) return
    onPlan?.({
      titulo: tituloPlan.trim(),
      prior: prioridad,
      fecha,
      hora: selectedHour,
      categoria: 'citas',
      hecho: false,
    })
    setTituloPlan('')
    setSelectedHour(null)
  }

  return (
    <div className="bg-white rounded-[20px] border border-rosa-claro p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="font-display font-bold capitalize text-xl">
          {fecha ? new Date(fecha + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' }) : ''}
        </div>
        {selectedHour && (
          <button onClick={() => setSelectedHour(null)} className="text-xs text-rosa underline underline-offset-2">limpiar</button>
        )}
      </div>

      {horasLibresAmbos.length > 0 ? (
        <p className="text-xs text-cancha font-bold mb-3">
          ✨ Horas libres para ambos hoy: {horasLibresAmbos.map(h => h.slice(0, 2)).join(', ')}
        </p>
      ) : (
        <p className="text-xs text-tinta/50 mb-3">No quedan horas libres para ambos este día.</p>
      )}

      <div className="grid grid-cols-2 gap-2 mb-4">
        {HORAS.map(hora => {
          const oI = ocupadoEn(ocupadosIvan, fecha, hora)
          const oC = ocupadoEn(ocupadosCheva, fecha, hora)
          const estado = oI && oC ? 'ambos' : oI || oC ? 'uno' : 'libre'
          const plan = planesPorHora[hora]?.[0]
          return (
            <HoraSlot
              key={hora}
              hora={hora}
              estado={estado}
              plan={plan}
              seleccionado={selectedHour === hora}
              onClick={() => handleSlotClick(hora, estado)}
            />
          )
        })}
      </div>

      {selectedHour && (
        <div className="pt-3 border-t border-rosa-claro/30">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-tinta">Hora elegida:</span>
            <span className="font-display font-bold text-rosa">{selectedHour}</span>
          </div>
          <form onSubmit={agregarPlan} className="flex flex-wrap gap-2 items-end">
            <input
              value={tituloPlan}
              onChange={e => setTituloPlan(e.target.value)}
              placeholder="¿qué harán?"
              className="flex-1 min-w-[180px] bg-crema border border-rosa-claro rounded-full px-4 py-2 outline-none focus:border-rosa"
            />
            <select
              value={prioridad}
              onChange={e => setPrioridad(e.target.value)}
              className="bg-crema border border-rosa-claro rounded-full px-3 py-2 outline-none focus:border-rosa"
            >
              <option value="alta">alta</option>
              <option value="media">media</option>
              <option value="baja">baja</option>
            </select>
            <button type="submit" className="bg-rosa text-white px-5 py-2 rounded-full font-bold hover:bg-rosa/90">
              asignar
            </button>
          </form>
        </div>
      )}

      {planesFecha.length > 0 && (
        <div className="mt-3 space-y-1">
          {planesFecha.map(p => (
            <div key={p.id} className="text-xs bg-crema rounded-full px-3 py-2 flex justify-between">
              <span>{p.hora ? `${p.hora.slice(0, 2)}h • ` : ''}{p.titulo}</span>
              <span className={p.hecho ? 'text-cancha' : 'text-rosa'}>{p.hecho ? 'hecha' : 'pendiente'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
