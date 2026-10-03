import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { escuchar, urlDe, porOrden } from '../lib/db.js'

const FALLBACK = [
  { id: 'f1', artista: 'Taylor Swift', titulo: 'All Too Well', color: '#C9A0DC' },
  { id: 'f2', artista: 'Airbag', titulo: 'Por mil noches', color: '#7EB8A2' },
  { id: 'f3', artista: 'The Neighbourhood', titulo: 'Sweater Weather', color: '#2B2D42' },
  { id: 'f4', artista: 'Oasis', titulo: 'Wonderwall', color: '#F5D67B' },
  { id: 'f5', artista: 'Green Day', titulo: 'Boulevard', color: '#3A7D44' },
]

const fmt = (t) => {
  if (!isFinite(t) || t < 0) return '0:00'
  return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`
}

export default function MusicVinyl() {
  const [canciones, setCanciones] = useState([])
  const [actualId, setActualId] = useState(null)
  const [sonando, setSonando] = useState(false)
  const [prog, setProg] = useState(0)
  const [dur, setDur] = useState(0)
  const [aviso, setAviso] = useState('')
  const audioRef = useRef(null)
  if (!audioRef.current && typeof Audio !== 'undefined') audioRef.current = new Audio()

  useEffect(() => {
    const unsub = escuchar('canciones', (d) => {
      if (d && d.length) setCanciones([...d].sort(porOrden))
    })
    return () => { unsub?.(); audioRef.current?.pause() }
  }, [])

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    const onTime = () => setProg(a.currentTime)
    const onMeta = () => setDur(a.duration || 0)
    const onEnd = () => { setSonando(false); setProg(0) }
    const onErr = () => { setSonando(false); setAviso('no se pudo reproducir esa pista'); setTimeout(() => setAviso(''), 3000) }
    a.addEventListener('timeupdate', onTime)
    a.addEventListener('loadedmetadata', onMeta)
    a.addEventListener('ended', onEnd)
    a.addEventListener('error', onErr)
    return () => {
      a.removeEventListener('timeupdate', onTime)
      a.removeEventListener('loadedmetadata', onMeta)
      a.removeEventListener('ended', onEnd)
      a.removeEventListener('error', onErr)
    }
  }, [])

  const lista = canciones.length ? canciones : FALLBACK

  const tocar = async (c) => {
    const a = audioRef.current
    if (!a) return
    if (actualId === c.id) {
      if (sonando) { a.pause(); setSonando(false) }
      else { try { await a.play(); setSonando(true) } catch {} }
      return
    }
    if (!c.url) { setAviso('sube este MP3 desde #/admin'); setTimeout(() => setAviso(''), 3000); return }
    const url = await urlDe(c.url)
    if (!url) { setAviso('audio no encontrado'); setTimeout(() => setAviso(''), 3000); return }
    a.src = url
    a.currentTime = 0
    try {
      await a.play()
      setActualId(c.id)
      setSonando(true)
      setProg(0)
    } catch (e) {
      setAviso('no se pudo reproducir'); setTimeout(() => setAviso(''), 3000)
    }
  }

  const buscar = (e) => {
    const a = audioRef.current
    if (!a || !dur) return
    const r = e.currentTarget.getBoundingClientRect()
    a.currentTime = ((e.clientX - r.left) / r.width) * dur
  }

  const actual = lista.find((x) => x.id === actualId)
  const pct = dur ? (prog / dur) * 100 : 0

  return (
    <section className="py-10 px-4 max-w-6xl mx-auto">
      <div className="bg-white rounded-[24px] border border-rosa-claro p-5 md:p-6 shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-bold text-xl">Nuestra banda sonora</h3>
            <p className="text-sm text-tinta/60">Lo que te gusta escuchar — lo que quiero escuchar contigo</p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full ${canciones.length ? 'bg-cancha text-white' : 'bg-tinta text-white/80'}`}>
            {canciones.length ? '♪ suena de verdad' : 'sube tus MP3 en #/admin'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          {lista.map((a) => {
            const activa = actualId === a.id && sonando
            return (
              <button key={a.id} onClick={() => tocar(a)} className="text-center group focus:outline-none">
                <motion.div
                  animate={activa ? { rotate: 360 } : { rotate: 0 }}
                  transition={activa ? { duration: 8, repeat: Infinity, ease: 'linear' } : { duration: 0.5 }}
                  className="mx-auto w-28 h-24 md:h-28 rounded-full flex items-center justify-center border-[8px] border-white shadow relative"
                  style={{ background: `radial-gradient(circle at 30% 30%, ${a.color || '#FF8FA3'}, #111)` }}
                >
                  <div className="w-6 h-6 bg-dorado rounded-full border-2 border-white" />
                  <span className={`absolute inset-0 grid place-items-center text-white text-xl bg-black/25 rounded-full transition ${activa ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    {activa ? '❚❚' : '▶'}
                  </span>
                </motion.div>
                <div className="font-ui font-bold text-sm mt-2 leading-tight">{a.artista}</div>
                <div className="text-xs text-tinta/60 font-hand text-lg leading-none">{a.titulo}</div>
              </button>
            )
          })}
        </div>

        {actual && (
          <div className="mt-5 bg-crema rounded-2xl p-3 flex items-center gap-3">
            <button onClick={() => tocar(actual)} className="w-10 h-10 rounded-full bg-rosa text-white grid place-items-center font-bold shrink-0">
              {sonando ? '❚❚' : '▶'}
            </button>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold truncate">{actual.artista} — {actual.titulo}</div>
              <div className="h-2 bg-white rounded-full mt-1 cursor-pointer relative overflow-hidden" onClick={buscar}>
                <div className="h-full bg-rosa rounded-full" style={{ width: pct + '%' }} />
              </div>
            </div>
            <div className="text-xs text-tinta/60 tabular-nums shrink-0">{fmt(prog)} / {fmt(dur)}</div>
          </div>
        )}

        {aviso && <div className="mt-2 text-xs text-rosa font-semibold text-center">{aviso}</div>}

        <div className="mt-4 h-8 flex items-end gap-[3px] justify-center opacity-60">
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.div
              key={i}
              animate={sonando ? { height: [8, 28 + Math.random() * 12, 10] } : { height: 8 }}
              transition={{ duration: 0.5 + Math.random() * 0.6, repeat: sonando ? Infinity : 0, repeatType: 'reverse' }}
              className="w-[4px] bg-rosa rounded-full"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
