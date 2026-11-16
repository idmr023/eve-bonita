import { useEffect, useRef, useState } from 'react'
import { collection, addDoc, arrayRemove, arrayUnion, limit, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { ArrowLeft, Heart, MessageCircle, Reply, Send, Smile, UserRound, X } from 'lucide-react'
import { db } from '../lib/firebase'
import { actualizar } from '../lib/db'

const NOMBRE_KEY = 'eve-bonita-chat-nombre'
const MAX_NOMBRE = 40
const MAX_MENSAJE = 1000
const REACCIONES = ['❤️', '😂', '😍', '🥹', '🔥', '💛']
const claveChat = import.meta.env.VITE_CHAT_PASSWORD
const SESION_KEY = 'eve-bonita-chat-desbloqueado'

function leerNombre() {
  try {
    return (localStorage.getItem(NOMBRE_KEY) || '').trim().slice(0, MAX_NOMBRE)
  } catch (error) {
    console.warn('No se pudo recuperar el nombre del chat:', error)
    return ''
  }
}

function hora(fecha) {
  if (!fecha) return 'Enviando…'
  return new Intl.DateTimeFormat('es', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  }).format(fecha.toDate())
}

export default function Chat({ flotante = false }) {
  const [desbloqueado, setDesbloqueado] = useState(() => {
    try {
      return sessionStorage.getItem(SESION_KEY) === 'si'
    } catch (error) {
      console.warn('No se pudo recuperar el acceso al chat:', error)
      return false
    }
  })
  const [clave, setClave] = useState('')
  const [errorAcceso, setErrorAcceso] = useState('')

  function entrar(evento) {
    evento.preventDefault()
    if (!clave || !claveChat) return
    if (clave !== claveChat) {
      setErrorAcceso('Contraseña incorrecta. Inténtalo de nuevo.')
      return
    }
    setErrorAcceso('')
    setClave('')
    setDesbloqueado(true)
    try {
      sessionStorage.setItem(SESION_KEY, 'si')
    } catch (error) {
      console.warn('No se pudo recordar el acceso al chat:', error)
      setErrorAcceso('No se pudo recordar el acceso. Tendrás que escribir la contraseña al volver a abrir el chat.')
    }
  }

  function salir() {
    try {
      sessionStorage.removeItem(SESION_KEY)
    } catch (error) {
      console.error('No se pudo cerrar el acceso al chat:', error)
      setErrorAcceso('No se pudo cerrar el acceso. Comprueba la configuración de almacenamiento del navegador.')
      return
    }
    setDesbloqueado(false)
    setErrorAcceso('')
  }

  return (
    <div className={flotante ? 'bg-crema' : 'min-h-screen bg-crema px-4 py-6 sm:py-10'}>
      <div className={flotante ? '' : 'mx-auto max-w-3xl'}>
        {!flotante && (
          <>
            <a href="#/" className="inline-flex items-center gap-2 rounded-full border border-rosa-claro bg-white px-4 py-2 text-sm font-semibold text-tinta transition hover:bg-rosa-claro/40">
              <ArrowLeft size={16} aria-hidden="true" /> volver al inicio
            </a>
            <header className="my-7 text-center sm:my-10">
              <p className="font-hand text-3xl text-rosa">un rinconcito para nosotros</p>
              <h1 className="mt-1 font-display text-4xl font-bold text-tinta sm:text-5xl">Nuestro chat</h1>
              <p className="mt-3 text-sm text-tinta/60 sm:text-base">Un mensaje, una sonrisa y un poquito más cerca 💛</p>
            </header>
          </>
        )}
        {desbloqueado && claveChat ? (
          <>
            <Conversacion flotante={flotante} salir={salir} />
            {errorAcceso && <p role="alert" className="p-3 text-sm text-barca1">{errorAcceso}</p>}
          </>
        ) : (
          <form onSubmit={entrar} className="mx-auto flex min-h-[300px] max-w-sm flex-col justify-center rounded-[24px] border border-rosa-claro bg-white px-6 py-8 shadow-xl">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-rosa-claro/50 text-rosa"><Heart size={30} aria-hidden="true" /></span>
            <h2 className="mt-5 text-center font-display text-2xl font-bold">Nuestro chat</h2>
            <p className="mt-2 text-center text-sm text-tinta/60">Escribe la contraseña para entrar.</p>
            <label htmlFor="chat-clave" className="mt-6 text-sm font-semibold">Contraseña</label>
            <input id="chat-clave" type="password" autoComplete="current-password" value={clave} onChange={(e) => setClave(e.target.value)} className="mt-2 w-full rounded-2xl border border-rosa-claro px-4 py-3 outline-none focus:ring-2 focus:ring-rosa" />
            {errorAcceso && <p role="alert" className="mt-3 text-sm text-barca1">{errorAcceso}</p>}
            {!claveChat && <p role="alert" className="mt-3 text-sm text-barca1">Falta configurar la contraseña del chat.</p>}
            <button type="submit" disabled={!clave || !claveChat} className="mt-4 rounded-2xl bg-rosa px-5 py-3 font-semibold text-white transition hover:bg-barca1 disabled:cursor-not-allowed disabled:opacity-50">Entrar</button>
          </form>
        )}
      </div>
    </div>
  )
}

function Conversacion({ flotante, salir }) {
  const [nombre, setNombre] = useState(leerNombre)
  const [nombreInput, setNombreInput] = useState(nombre)
  const [editandoNombre, setEditandoNombre] = useState(!nombre)
  const [mensajes, setMensajes] = useState([])
  const [texto, setTexto] = useState('')
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [errorLectura, setErrorLectura] = useState('')
  const [errorEnvio, setErrorEnvio] = useState('')
  const [avisoNombre, setAvisoNombre] = useState('')
  const [respondiendo, setRespondiendo] = useState(null)
  const [pickerPara, setPickerPara] = useState(null)
  const [destacado, setDestacado] = useState(null)
  const [errorReaccion, setErrorReaccion] = useState('')
  const [intentoLectura, setIntentoLectura] = useState(0)
  const listaRef = useRef(null)
  const textareaRef = useRef(null)
  const cercaDelFinal = useRef(true)

  useEffect(() => {
    if (!flotante) window.scrollTo({ top: 0 })
    const consulta = query(collection(db, 'chat_mensajes'), orderBy('creado', 'desc'), limit(100))
    return onSnapshot(consulta, { includeMetadataChanges: true }, (snapshot) => {
      setMensajes(snapshot.docs.map((documento) => ({
        id: documento.id,
        ...documento.data(),
        pendiente: documento.metadata.hasPendingWrites,
      })).reverse())
      setCargando(false)
      setErrorLectura('')
    }, (error) => {
      console.error('No se pudieron cargar los mensajes:', error)
      setErrorLectura('No se pudieron cargar los mensajes. Revisa tu conexión y los permisos de Firebase.')
      setCargando(false)
    })
  }, [intentoLectura, flotante])

  useEffect(() => {
    const lista = listaRef.current
    if (lista && cercaDelFinal.current) lista.scrollTop = lista.scrollHeight
  }, [mensajes, editandoNombre])

  function guardarNombre(evento) {
    evento.preventDefault()
    const nuevoNombre = nombreInput.trim()
    if (!nuevoNombre) return
    setNombre(nuevoNombre)
    setNombreInput(nuevoNombre)
    setEditandoNombre(false)
    setAvisoNombre('')
    try {
      localStorage.setItem(NOMBRE_KEY, nuevoNombre)
    } catch (error) {
      console.warn('No se pudo guardar el nombre del chat:', error)
      setAvisoNombre('Tu nombre no se pudo guardar en este navegador; tendrás que volver a escribirlo.')
    }
  }

  function toggleReaccion(mensaje, emoji) {
    if (!nombre) return
    const quienes = mensaje.reacciones?.[emoji] || []
    const ya = quienes.includes(nombre)
    setErrorReaccion('')
    actualizar('chat_mensajes', mensaje.id, {
      [`reacciones.${emoji}`]: ya ? arrayRemove(nombre) : arrayUnion(nombre),
    }).catch((error) => {
      console.error('No se pudo guardar la reacción:', error)
      setErrorReaccion('No se pudo guardar tu reacción. Inténtalo otra vez.')
    })
  }

  function irAMensaje(id) {
    setDestacado(id)
    document.getElementById(`msg-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    window.setTimeout(() => {
      setDestacado((actual) => (actual === id ? null : actual))
    }, 1800)
  }

  function responder(mensaje) {
    setRespondiendo(mensaje)
    textareaRef.current?.focus()
  }

  async function enviar(evento) {
    evento.preventDefault()
    const mensaje = texto.trim()
    if (!mensaje || !nombre || enviando) return
    if (!navigator.onLine) {
      setErrorEnvio('No tienes conexión. Tu mensaje sigue aquí para que puedas enviarlo después.')
      return
    }
    setEnviando(true)
    setErrorEnvio('')
    cercaDelFinal.current = true
    const datos = { nombre, texto: mensaje, creado: serverTimestamp() }
    if (respondiendo) {
      datos.respuestaA = {
        id: respondiendo.id,
        nombre: respondiendo.nombre,
        texto: respondiendo.texto,
      }
    }
    try {
      await addDoc(collection(db, 'chat_mensajes'), datos)
      setTexto((actual) => actual === texto ? '' : actual)
      setRespondiendo(null)
      setPickerPara(null)
    } catch (error) {
      console.error('No se pudo enviar el mensaje:', error)
      setErrorEnvio('No se pudo enviar el mensaje. Revisa tu conexión y los permisos de Firebase.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div>
        <section aria-label="Chat compartido" className="overflow-hidden rounded-[24px] border border-rosa-claro bg-white shadow-xl">
          <div className="flex items-center justify-between gap-3 border-b border-rosa-claro bg-rosa-claro/20 px-4 py-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-rosa text-white"><Heart size={20} aria-hidden="true" /></span>
              <div className="min-w-0">
                <h2 className="font-display font-bold">Nuestra conversación</h2>
                <p className="truncate text-xs text-tinta/60">{nombre ? `Escribes como ${nombre}` : 'Elige tu nombre para comenzar'}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
            {nombre && !editandoNombre && (
              <button type="button" onClick={() => setEditandoNombre(true)} className="shrink-0 rounded-full border border-rosa-claro bg-white px-3 py-2 text-xs font-semibold hover:bg-rosa-claro/40">
                Cambiar nombre
              </button>
            )}
            <button type="button" onClick={salir} className="text-xs font-semibold text-tinta/60 underline hover:text-tinta">Cerrar sesión</button>
            </div>
          </div>

          {editandoNombre ? (
            <form onSubmit={guardarNombre} className="mx-auto flex min-h-[360px] max-w-sm flex-col justify-center px-6 py-10">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-rosa-claro/50 text-rosa"><UserRound size={30} aria-hidden="true" /></span>
              <h3 className="mt-5 text-center font-display text-2xl font-bold">¿Cómo te llamas?</h3>
              <p className="mt-2 text-center text-sm text-tinta/60">Tu nombre acompañará cada mensaje que envíes.</p>
              <label htmlFor="chat-nombre" className="mt-6 text-sm font-semibold">Tu nombre</label>
              <input id="chat-nombre" autoComplete="nickname" maxLength={MAX_NOMBRE} value={nombreInput} onChange={(e) => setNombreInput(e.target.value)} placeholder="Escribe tu nombre" className="mt-2 w-full rounded-2xl border border-rosa-claro px-4 py-3 outline-none focus:ring-2 focus:ring-rosa" />
              <button type="submit" disabled={!nombreInput.trim()} className="mt-4 rounded-2xl bg-rosa px-5 py-3 font-semibold text-white transition hover:bg-barca1 disabled:cursor-not-allowed disabled:opacity-50">Entrar al chat</button>
              {nombre && <button type="button" onClick={() => { setNombreInput(nombre); setEditandoNombre(false) }} className="mt-3 text-sm text-tinta/60 hover:text-tinta">Cancelar</button>}
            </form>
          ) : (
            <>
              <div
                ref={listaRef}
                onScroll={(e) => {
                  const lista = e.currentTarget
                  cercaDelFinal.current = lista.scrollHeight - lista.scrollTop - lista.clientHeight < 100
                }}
                role="log"
                aria-label="Mensajes"
                aria-live="polite"
                className={`${flotante ? 'h-[min(32vh,300px)] min-h-[160px]' : 'h-[min(55vh,480px)] min-h-[280px]'} space-y-4 overflow-y-auto bg-crema/50 px-4 py-5 sm:px-6`}
              >
                {cargando && <p className="text-center text-sm text-tinta/60">Cargando mensajes…</p>}
                {!cargando && !errorLectura && mensajes.length === 0 && (
                  <div className="flex h-full flex-col items-center justify-center text-center text-tinta/60">
                    <MessageCircle size={36} className="text-rosa" aria-hidden="true" />
                    <p className="mt-3 font-display text-lg font-bold text-tinta">Aquí empieza nuestra conversación</p>
                    <p className="mt-1 text-sm">Envía el primer mensaje 💌</p>
                  </div>
                )}
                {mensajes.map((mensaje) => {
                  const propio = mensaje.nombre === nombre
                  const reacciones = Object.entries(mensaje.reacciones || {}).filter(([, quienes]) => quienes?.length)
                  return (
                    <article key={mensaje.id} id={`msg-${mensaje.id}`} className={`flex ${propio ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] sm:max-w-[75%] ${destacado === mensaje.id ? 'rounded-2xl ring-2 ring-dorado' : ''}`}>
                        <div className={`rounded-2xl px-4 py-3 shadow-sm ${propio ? 'rounded-br-sm bg-rosa text-white' : 'rounded-bl-sm border border-rosa-claro bg-white text-tinta'}`}>
                          {mensaje.respuestaA && (
                            <button
                              type="button"
                              onClick={() => irAMensaje(mensaje.respuestaA.id)}
                              className={`mb-2 block w-full rounded-xl border-l-4 px-3 py-1.5 text-left transition hover:brightness-95 ${propio ? 'border-white/60 bg-white/15' : 'border-rosa/60 bg-rosa-claro/40'}`}
                            >
                              <span className={`block text-[11px] font-bold ${propio ? 'text-white/85' : 'text-rosa'}`}>Respondiendo a {mensaje.respuestaA.nombre}</span>
                              <span className={`block text-xs leading-snug line-clamp-2 ${propio ? 'text-white/80' : 'text-tinta/70'}`}>{mensaje.respuestaA.texto}</span>
                            </button>
                          )}
                          <p className={`text-xs font-bold ${propio ? 'text-white/80' : 'text-rosa'}`}>{mensaje.nombre}</p>
                          <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed">{mensaje.texto}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            {reacciones.map(([emoji, quienes]) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => toggleReaccion(mensaje, emoji)}
                                aria-pressed={quienes.includes(nombre)}
                                className={`rounded-full border px-2 py-0.5 text-xs transition ${quienes.includes(nombre) ? 'border-rosa bg-rosa text-white' : propio ? 'border-white/40 bg-white/15 text-white' : 'border-rosa-claro bg-crema text-tinta'}`}
                              >
                                {emoji} {quienes.length}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => setPickerPara(pickerPara === mensaje.id ? null : mensaje.id)}
                              aria-label="Agregar reacción"
                              aria-expanded={pickerPara === mensaje.id}
                              className={`rounded-full border p-1 transition ${propio ? 'border-white/40 bg-white/15 text-white hover:bg-white/25' : 'border-rosa-claro bg-crema text-tinta/60 hover:text-rosa'}`}
                            >
                              <Smile size={15} aria-hidden="true" />
                            </button>
                          </div>
                          {pickerPara === mensaje.id && (
                            <div className={`mt-2 flex flex-wrap gap-1 rounded-full border px-2 py-1 ${propio ? 'border-white/25 bg-white/10' : 'border-rosa-claro bg-crema'}`}>
                              {REACCIONES.map((emoji) => (
                                <button key={emoji} type="button" onClick={() => toggleReaccion(mensaje, emoji)} className="rounded-full px-1.5 py-0.5 text-base leading-none transition hover:scale-125">
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                          <p className={`mt-2 text-right text-[11px] ${propio ? 'text-white/80' : 'text-tinta/50'}`}>{mensaje.pendiente ? 'Enviando…' : hora(mensaje.creado)}</p>
                        </div>
                        <div className={`mt-1 flex ${propio ? 'justify-end' : 'justify-start'}`}>
                          <button type="button" onClick={() => responder(mensaje)} className={`inline-flex items-center gap-1 text-[11px] font-semibold ${propio ? 'text-white/70' : 'text-tinta/50'} hover:text-rosa`}>
                            <Reply size={12} aria-hidden="true" /> responder
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
              <form onSubmit={enviar} className="border-t border-rosa-claro p-4 sm:px-6">
                {errorLectura && (
                  <div className="mb-3 text-sm text-barca1">
                    <p role="alert">{errorLectura}</p>
                    <button type="button" onClick={() => { setErrorLectura(''); setCargando(true); setIntentoLectura((intento) => intento + 1) }} className="mt-1 font-semibold underline">Reintentar</button>
                  </div>
                )}
                {errorEnvio && <p role="alert" className="mb-3 text-sm text-barca1">{errorEnvio}</p>}
                {errorReaccion && <p role="alert" className="mb-3 text-sm text-barca1">{errorReaccion}</p>}
                {avisoNombre && <p role="status" className="mb-3 text-sm text-tinta/70">{avisoNombre}</p>}
                {respondiendo && (
                  <div className="mb-3 flex items-start gap-2 rounded-2xl border border-rosa-claro bg-rosa-claro/30 px-3 py-2">
                    <Reply size={16} className="mt-0.5 shrink-0 text-rosa" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-rosa">Respondiendo a {respondiendo.nombre}</p>
                      <p className="text-xs leading-snug text-tinta/70 line-clamp-2">{respondiendo.texto}</p>
                    </div>
                    <button type="button" onClick={() => setRespondiendo(null)} aria-label="Cancelar respuesta" className="shrink-0 text-tinta/50 transition hover:text-tinta">
                      <X size={16} aria-hidden="true" />
                    </button>
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <label htmlFor="chat-mensaje" className="sr-only">Tu mensaje</label>
                  <textarea
                    ref={textareaRef}
                    id="chat-mensaje"
                    rows={2}
                    maxLength={MAX_MENSAJE}
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        enviar(e)
                      }
                    }}
                    placeholder="Escribe algo bonito…"
                    className="min-h-[52px] flex-1 resize-none rounded-2xl border border-rosa-claro px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-rosa"
                  />
                  <button type="submit" disabled={!texto.trim() || enviando} className="flex h-[52px] items-center gap-2 rounded-2xl bg-rosa px-4 font-semibold text-white transition hover:bg-barca1 disabled:cursor-not-allowed disabled:opacity-50">
                    <Send size={17} aria-hidden="true" /><span className="hidden sm:inline">{enviando ? 'Enviando…' : 'Enviar'}</span><span className="sr-only sm:hidden">{enviando ? 'Enviando mensaje' : 'Enviar mensaje'}</span>
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="text-xs text-tinta/40">Enter para enviar · Shift + Enter para nueva línea</p>
                  <p className="text-right text-xs text-tinta/50">{texto.length}/{MAX_MENSAJE}</p>
                </div>
              </form>
            </>
          )}
        </section>
        <p className="p-3 text-center text-xs text-tinta/60">El nombre mostrado no verifica la identidad de quien escribe.</p>
    </div>
  )
}
