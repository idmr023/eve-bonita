import { Fragment, useEffect, useRef, useState } from 'react'
import { collection, addDoc, arrayRemove, arrayUnion, limit, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { ArrowLeft, Check, CheckCheck, Heart, ImagePlus, MessageCircle, Mic, Pencil, Reply, Send, Smile, Trash2, UserRound, X } from 'lucide-react'
import { db } from '../lib/firebase'
import { actualizar, borrar, borrarArchivo, escuchar, guardarDoc, subirArchivo } from '../lib/db'
import { MAX_NOMBRE, NOMBRE_KEY, guardarVisto, leerNombre, sonarAviso } from '../lib/chat'

const MAX_MENSAJE = 1000
const PAGINA = 100
const MAX_FOTO = 8 * 1024 * 1024
const MAX_VOZ = 120
const VENTANA_ESCRIBIENDO = 6000
const REACCIONES = ['❤️', '😂', '😍', '🥹', '🔥', '💛', '😘', '🥰', '😭', '😮', '😡', '👍', '👏', '🙏', '🎉', '💯', '🤭', '🫶']
const EMOJIS = [
  '😀', '😁', '😂', '🤣', '😊', '😉', '😍', '🥰', '😘', '😚', '🤗', '🤭',
  '😋', '😜', '🤪', '😎', '🥹', '🥺', '😢', '😭', '😤', '😡', '😴', '🤒',
  '😳', '😱', '🤔', '🙄', '😇', '🤤', '😏', '🫠', '❤️', '💛', '💙', '💜',
  '🩷', '🤍', '💖', '💕', '💞', '💘', '💔', '💌', '💋', '🫶', '🤝', '🙏',
  '👍', '👎', '👏', '🙌', '💪', '👀', '🌹', '🌻', '🌷', '🌸', '🌙', '⭐',
  '✨', '🔥', '🎉', '🎂', '🎁', '🎶', '🍕', '🍫', '☕', '⚽', '🐶', '🐱',
]
const claveChat = import.meta.env.VITE_CHAT_PASSWORD
const SESION_KEY = 'eve-bonita-chat-desbloqueado'
const URL_RE = /(https?:\/\/[^\s<]*[^\s<.,;:!?)\]'"])/g

function hora(fecha) {
  if (!fecha) return 'Enviando…'
  return new Intl.DateTimeFormat('es', { hour: '2-digit', minute: '2-digit' }).format(fecha.toDate())
}

function etiquetaDia(fecha) {
  const hoy = new Date()
  const ayer = new Date()
  ayer.setDate(hoy.getDate() - 1)
  if (fecha.toDateString() === hoy.toDateString()) return 'Hoy'
  if (fecha.toDateString() === ayer.toDateString()) return 'Ayer'
  return new Intl.DateTimeFormat('es', {
    weekday: 'long', day: 'numeric', month: 'long',
    ...(fecha.getFullYear() !== hoy.getFullYear() ? { year: 'numeric' } : {}),
  }).format(fecha)
}

// Los mensajes aún sin fecha del servidor se están enviando ahora mismo.
function fechaDe(mensaje) {
  return mensaje.creado ? mensaje.creado.toDate() : new Date()
}

function resumen(mensaje) {
  return mensaje.texto || (mensaje.imagen ? '📷 Foto' : mensaje.audio ? '🎤 Nota de voz' : '')
}

function idEstado(nombre) {
  return 'u_' + encodeURIComponent(nombre)
}

function duracion(segundos) {
  return `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, '0')}`
}

function conEnlaces(texto) {
  return texto.split(URL_RE).map((parte, i) => (i % 2
    ? <a key={i} href={parte} target="_blank" rel="noopener noreferrer" className="break-all underline">{parte}</a>
    : parte))
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
  const [errorAccion, setErrorAccion] = useState('')
  const [emojisAbierto, setEmojisAbierto] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [textoEdicion, setTextoEdicion] = useState('')
  const [guardandoEdicion, setGuardandoEdicion] = useState(false)
  const [errorEdicion, setErrorEdicion] = useState('')
  const [intentoLectura, setIntentoLectura] = useState(0)
  const [limite, setLimite] = useState(PAGINA)
  const [cargandoMas, setCargandoMas] = useState(false)
  const [estados, setEstados] = useState([])
  const [, setTic] = useState(0)
  const [adjunto, setAdjunto] = useState(null)
  const [progreso, setProgreso] = useState(null)
  const [grabando, setGrabando] = useState(false)
  const [segundos, setSegundos] = useState(0)
  const listaRef = useRef(null)
  const textareaRef = useRef(null)
  const fotoRef = useRef(null)
  const cercaDelFinal = useRef(true)
  const alturaPrevia = useRef(null)
  const ultimoAvisoEscribiendo = useRef(0)
  const vistoEscrito = useRef(0)
  const previoMs = useRef(0)
  const grabadorRef = useRef(null)
  const grabacionCancelada = useRef(false)
  const enviarRef = useRef(null)

  useEffect(() => {
    if (!flotante) window.scrollTo({ top: 0 })
  }, [flotante])

  useEffect(() => {
    const consulta = query(collection(db, 'chat_mensajes'), orderBy('creado', 'desc'), limit(limite))
    return onSnapshot(consulta, { includeMetadataChanges: true }, (snapshot) => {
      setMensajes(snapshot.docs.map((documento) => ({
        id: documento.id,
        ...documento.data(),
        pendiente: documento.metadata.hasPendingWrites,
      })).reverse())
      setCargando(false)
      setErrorLectura('')
      if (!snapshot.metadata.fromCache || snapshot.docs.length >= limite) setCargandoMas(false)
    }, (error) => {
      console.error('No se pudieron cargar los mensajes:', error)
      setErrorLectura('No se pudieron cargar los mensajes. Revisa tu conexión y los permisos de Firebase.')
      setCargando(false)
      setCargandoMas(false)
    })
  }, [intentoLectura, limite])

  // Estado compartido de cada persona: si está escribiendo y hasta qué mensaje leyó.
  useEffect(() => escuchar('chat_estado', (docs) => setEstados(docs || [])), [])

  useEffect(() => {
    const lista = listaRef.current
    if (!lista) return
    if (alturaPrevia.current != null) {
      // Al cargar mensajes anteriores se mantiene a la vista el mismo mensaje.
      const diferencia = lista.scrollHeight - alturaPrevia.current
      if (diferencia > 0) lista.scrollTop += diferencia
      alturaPrevia.current = cargandoMas ? lista.scrollHeight : null
      return
    }
    if (cercaDelFinal.current) lista.scrollTop = lista.scrollHeight
  }, [mensajes, editandoNombre, cargandoMas])

  let ultimo = null
  for (let i = mensajes.length - 1; i >= 0 && !ultimo; i -= 1) {
    if (mensajes[i].creado) ultimo = mensajes[i]
  }
  const ultimoMs = ultimo ? ultimo.creado.toMillis() : 0
  const ultimoAjeno = !!ultimo && ultimo.nombre !== nombre

  useEffect(() => {
    if (!ultimoMs) return
    if (previoMs.current && ultimoMs > previoMs.current && ultimoAjeno) sonarAviso()
    previoMs.current = ultimoMs
  }, [ultimoMs, ultimoAjeno])

  useEffect(() => {
    if (!nombre || editandoNombre || !ultimoMs) return
    const marcarVisto = () => {
      if (document.visibilityState !== 'visible' || vistoEscrito.current >= ultimoMs) return
      vistoEscrito.current = ultimoMs
      guardarVisto(ultimoMs)
      guardarDoc('chat_estado', idEstado(nombre), { nombre, visto: ultimoMs })
        .catch((error) => console.warn('No se pudo marcar como visto:', error))
    }
    marcarVisto()
    document.addEventListener('visibilitychange', marcarVisto)
    return () => document.removeEventListener('visibilitychange', marcarVisto)
  }, [ultimoMs, nombre, editandoNombre])

  const otros = estados.filter((estado) => estado.nombre && estado.nombre !== nombre)
  const vistoPorOtros = otros.reduce((maximo, estado) => Math.max(maximo, estado.visto || 0), 0)
  const escribiendo = otros.filter((estado) => Date.now() - (estado.escribiendo || 0) < VENTANA_ESCRIBIENDO)
  const hayEscribiendo = escribiendo.length > 0

  // El aviso de "escribiendo" caduca solo: se vuelve a dibujar al pasar la ventana.
  useEffect(() => {
    if (!hayEscribiendo) return
    const temporizador = window.setTimeout(() => setTic((n) => n + 1), VENTANA_ESCRIBIENDO + 200)
    return () => window.clearTimeout(temporizador)
  }, [hayEscribiendo, estados])

  useEffect(() => {
    if (!grabando) return
    const intervalo = window.setInterval(() => setSegundos((s) => s + 1), 1000)
    return () => window.clearInterval(intervalo)
  }, [grabando])

  useEffect(() => {
    if (grabando && segundos >= MAX_VOZ) detenerGrabacion(false)
  }, [grabando, segundos])

  useEffect(() => () => {
    grabacionCancelada.current = true
    const grabador = grabadorRef.current
    if (grabador && grabador.state !== 'inactive') grabador.stop()
  }, [])

  function avisarEscribiendo(activo) {
    if (!nombre) return
    const ahora = Date.now()
    if (activo && ahora - ultimoAvisoEscribiendo.current < VENTANA_ESCRIBIENDO / 2) return
    if (!activo && !ultimoAvisoEscribiendo.current) return
    ultimoAvisoEscribiendo.current = activo ? ahora : 0
    guardarDoc('chat_estado', idEstado(nombre), { nombre, escribiendo: activo ? ahora : 0 })
      .catch((error) => console.warn('No se pudo avisar que estás escribiendo:', error))
  }

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
    setErrorAccion('')
    actualizar('chat_mensajes', mensaje.id, {
      [`reacciones.${emoji}`]: ya ? arrayRemove(nombre) : arrayUnion(nombre),
    }).catch((error) => {
      console.error('No se pudo guardar la reacción:', error)
      setErrorAccion('No se pudo guardar tu reacción. Inténtalo otra vez.')
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

  function cargarAnteriores() {
    if (cargandoMas) return
    alturaPrevia.current = listaRef.current?.scrollHeight ?? null
    setCargandoMas(true)
    setLimite((actual) => actual + PAGINA)
  }

  function insertarEmoji(emoji) {
    const area = textareaRef.current
    const inicio = area?.selectionStart ?? texto.length
    const fin = area?.selectionEnd ?? texto.length
    const nuevo = texto.slice(0, inicio) + emoji + texto.slice(fin)
    if (nuevo.length > MAX_MENSAJE) return
    setTexto(nuevo)
    window.requestAnimationFrame(() => {
      if (!area) return
      area.focus()
      area.setSelectionRange(inicio + emoji.length, inicio + emoji.length)
    })
  }

  function elegirFoto(evento) {
    const archivo = evento.target.files?.[0]
    evento.target.value = ''
    if (!archivo) return
    if (!archivo.type.startsWith('image/')) {
      setErrorEnvio('Solo se pueden enviar imágenes.')
      return
    }
    if (archivo.size > MAX_FOTO) {
      setErrorEnvio('La foto pesa más de 8 MB. Elige una más ligera.')
      return
    }
    setErrorEnvio('')
    setAdjunto((previo) => {
      if (previo) URL.revokeObjectURL(previo.url)
      return { archivo, url: URL.createObjectURL(archivo) }
    })
  }

  function quitarAdjunto() {
    setAdjunto((previo) => {
      if (previo) URL.revokeObjectURL(previo.url)
      return null
    })
  }

  function empezarEdicion(mensaje) {
    setEditandoId(mensaje.id)
    setTextoEdicion(mensaje.texto || '')
    setErrorEdicion('')
    setPickerPara(null)
  }

  function cancelarEdicion() {
    setEditandoId(null)
    setTextoEdicion('')
    setErrorEdicion('')
  }

  async function guardarEdicion(mensaje) {
    const nuevo = textoEdicion.trim()
    const tieneAdjunto = !!(mensaje.imagen || mensaje.audio)
    if ((!nuevo && !tieneAdjunto) || guardandoEdicion) return
    if (nuevo === (mensaje.texto || '')) {
      cancelarEdicion()
      return
    }
    setGuardandoEdicion(true)
    setErrorEdicion('')
    try {
      await actualizar('chat_mensajes', mensaje.id, { texto: nuevo, editado: serverTimestamp() })
      cancelarEdicion()
    } catch (error) {
      console.error('No se pudo editar el mensaje:', error)
      setErrorEdicion('No se pudo guardar el cambio. Revisa tu conexión y los permisos de Firebase.')
    } finally {
      setGuardandoEdicion(false)
    }
  }

  async function eliminarMensaje(mensaje) {
    if (!window.confirm('¿Borrar este mensaje? No se puede deshacer.')) return
    setErrorAccion('')
    try {
      await borrar('chat_mensajes', mensaje.id)
    } catch (error) {
      console.error('No se pudo borrar el mensaje:', error)
      setErrorAccion('No se pudo borrar el mensaje. Revisa tu conexión y los permisos de Firebase.')
      return
    }
    if (respondiendo?.id === mensaje.id) setRespondiendo(null)
    ;[mensaje.imagen, mensaje.audio].filter(Boolean).forEach((url) => {
      borrarArchivo(url).catch((error) => console.warn('El mensaje se borró, pero su archivo sigue en Storage:', error))
    })
  }

  async function empezarGrabacion() {
    if (grabando || enviando) return
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setErrorEnvio('Este navegador no permite grabar notas de voz.')
      return
    }
    setErrorEnvio('')
    let flujo
    try {
      flujo = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (error) {
      console.warn('No se pudo usar el micrófono:', error)
      setErrorEnvio('No se pudo usar el micrófono. Revisa los permisos del navegador.')
      return
    }
    try {
      const tipo = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'].find((t) => MediaRecorder.isTypeSupported(t))
      const grabador = new MediaRecorder(flujo, tipo ? { mimeType: tipo } : undefined)
      const trozos = []
      grabador.ondataavailable = (e) => { if (e.data.size) trozos.push(e.data) }
      grabador.onstop = () => {
        flujo.getTracks().forEach((pista) => pista.stop())
        setGrabando(false)
        if (grabacionCancelada.current) return
        const nota = new Blob(trozos, { type: grabador.mimeType || tipo || 'audio/webm' })
        if (nota.size) enviarRef.current?.({ nota })
        else setErrorEnvio('La nota de voz salió vacía. Inténtalo otra vez.')
      }
      grabacionCancelada.current = false
      grabadorRef.current = grabador
      grabador.start()
      setSegundos(0)
      setGrabando(true)
    } catch (error) {
      console.error('No se pudo iniciar la grabación:', error)
      flujo.getTracks().forEach((pista) => pista.stop())
      setErrorEnvio('No se pudo iniciar la grabación en este navegador.')
    }
  }

  function detenerGrabacion(cancelar) {
    grabacionCancelada.current = cancelar
    const grabador = grabadorRef.current
    if (grabador && grabador.state !== 'inactive') grabador.stop()
  }

  // Sin argumentos envía el texto y la foto adjunta; con `nota` envía una nota de voz.
  async function enviarMensaje({ nota } = {}) {
    const mensaje = nota ? '' : texto.trim()
    const foto = nota ? null : adjunto
    if ((!mensaje && !foto && !nota) || !nombre || enviando) return
    if (!navigator.onLine) {
      setErrorEnvio('No tienes conexión. Tu mensaje sigue aquí para que puedas enviarlo después.')
      return
    }
    // Solo las subidas bloquean el envío; el texto sale al instante.
    const subiendo = !!(foto || nota)
    if (subiendo) setEnviando(true)
    setErrorEnvio('')
    cercaDelFinal.current = true
    const respuestaPrevia = respondiendo
    const datos = { nombre, texto: mensaje, creado: serverTimestamp() }
    if (respondiendo) {
      datos.respuestaA = {
        id: respondiendo.id,
        nombre: respondiendo.nombre,
        texto: resumen(respondiendo),
      }
    }
    // El cuadro se vacía sin esperar al servidor: el mensaje ya aparece en la lista como "Enviando…".
    if (!nota) {
      setTexto('')
      avisarEscribiendo(false)
    }
    setRespondiendo(null)
    setPickerPara(null)
    setEmojisAbierto(false)
    try {
      if (foto) {
        const limpio = foto.archivo.name.replace(/[^\w.-]+/g, '_').slice(-60)
        datos.imagen = await subirArchivo(`chat/${Date.now()}_${limpio}`, foto.archivo, setProgreso)
      }
      if (nota) {
        const extension = nota.type.includes('mp4') ? 'm4a' : nota.type.includes('ogg') ? 'ogg' : 'webm'
        datos.audio = await subirArchivo(`chat/voz_${Date.now()}.${extension}`, nota, setProgreso)
      }
      await addDoc(collection(db, 'chat_mensajes'), datos)
      if (foto) quitarAdjunto()
    } catch (error) {
      console.error('No se pudo enviar el mensaje:', error)
      // Se devuelve lo escrito para no perderlo, salvo que ya haya texto nuevo.
      if (!nota) setTexto((actual) => actual || mensaje)
      setRespondiendo((actual) => actual || respuestaPrevia)
      setErrorEnvio(nota
        ? 'No se pudo enviar la nota de voz. Revisa tu conexión y los permisos de Firebase.'
        : 'No se pudo enviar el mensaje. Revisa tu conexión y los permisos de Firebase.')
    } finally {
      if (subiendo) {
        setEnviando(false)
        setProgreso(null)
      }
    }
  }
  enviarRef.current = enviarMensaje

  function enviar(evento) {
    evento.preventDefault()
    enviarMensaje()
  }

  const puedeEnviar = !!(texto.trim() || adjunto)
  const hayMas = mensajes.length >= limite

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
                className={`${flotante ? 'h-[min(32vh,300px)] min-h-[160px]' : 'h-[min(55vh,480px)] min-h-[280px]'} space-y-4 overflow-y-auto bg-crema/50 px-4 py-5 [overflow-anchor:none] sm:px-6`}
              >
                {cargando && <p className="text-center text-sm text-tinta/60">Cargando mensajes…</p>}
                {!cargando && !errorLectura && mensajes.length === 0 && (
                  <div className="flex h-full flex-col items-center justify-center text-center text-tinta/60">
                    <MessageCircle size={36} className="text-rosa" aria-hidden="true" />
                    <p className="mt-3 font-display text-lg font-bold text-tinta">Aquí empieza nuestra conversación</p>
                    <p className="mt-1 text-sm">Envía el primer mensaje 💌</p>
                  </div>
                )}
                {hayMas && (
                  <div className="text-center">
                    <button type="button" onClick={cargarAnteriores} disabled={cargandoMas} className="rounded-full border border-rosa-claro bg-white px-4 py-1.5 text-xs font-semibold text-tinta/70 transition hover:bg-rosa-claro/40 disabled:opacity-60">
                      {cargandoMas ? 'Cargando…' : 'Cargar mensajes anteriores'}
                    </button>
                  </div>
                )}
                {mensajes.map((mensaje, indice) => {
                  const propio = mensaje.nombre === nombre
                  const reacciones = Object.entries(mensaje.reacciones || {}).filter(([, quienes]) => quienes?.length)
                  const fecha = fechaDe(mensaje)
                  const cambiaDia = indice === 0 || fechaDe(mensajes[indice - 1]).toDateString() !== fecha.toDateString()
                  const visto = propio && !!mensaje.creado && mensaje.creado.toMillis() <= vistoPorOtros
                  return (
                    <Fragment key={mensaje.id}>
                    {cambiaDia && (
                      <div className="flex justify-center">
                        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-tinta/60 shadow-sm first-letter:uppercase">{etiquetaDia(fecha)}</span>
                      </div>
                    )}
                    <article id={`msg-${mensaje.id}`} className={`flex ${propio ? 'justify-end' : 'justify-start'}`}>
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
                          {mensaje.imagen && (
                            <a href={mensaje.imagen} target="_blank" rel="noopener noreferrer" className="mt-2 block">
                              <img
                                src={mensaje.imagen}
                                alt={`Foto enviada por ${mensaje.nombre}`}
                                loading="lazy"
                                onLoad={() => {
                                  const lista = listaRef.current
                                  if (lista && cercaDelFinal.current) lista.scrollTop = lista.scrollHeight
                                }}
                                className="max-h-64 max-w-full rounded-xl"
                              />
                            </a>
                          )}
                          {mensaje.audio && (
                            <audio controls preload="metadata" src={mensaje.audio} className="mt-2 h-10 w-56 max-w-full">
                              <a href={mensaje.audio} className="underline">Escuchar nota de voz</a>
                            </audio>
                          )}
                          {editandoId === mensaje.id ? (
                            <div className="mt-1">
                              <label htmlFor={`editar-${mensaje.id}`} className="sr-only">Editar mensaje</label>
                              <textarea
                                id={`editar-${mensaje.id}`}
                                autoFocus
                                rows={3}
                                maxLength={MAX_MENSAJE}
                                value={textoEdicion}
                                onChange={(e) => setTextoEdicion(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Escape') cancelarEdicion()
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    guardarEdicion(mensaje)
                                  }
                                }}
                                className="w-full min-w-[200px] resize-none rounded-xl border border-rosa-claro bg-white px-3 py-2 text-sm text-tinta outline-none focus:ring-2 focus:ring-dorado"
                              />
                              <div className="mt-1 flex justify-end gap-2">
                                <button type="button" onClick={cancelarEdicion} className="inline-flex items-center gap-1 rounded-full border border-white/40 bg-white/15 px-3 py-1 text-xs font-semibold text-white hover:bg-white/25">
                                  <X size={13} aria-hidden="true" /> Cancelar
                                </button>
                                <button type="button" onClick={() => guardarEdicion(mensaje)} disabled={(!textoEdicion.trim() && !mensaje.imagen && !mensaje.audio) || guardandoEdicion} className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-rosa hover:bg-crema disabled:cursor-not-allowed disabled:opacity-50">
                                  <Check size={13} aria-hidden="true" /> {guardandoEdicion ? 'Guardando…' : 'Guardar'}
                                </button>
                              </div>
                              {errorEdicion && <p role="alert" className="mt-2 text-xs font-semibold text-white">{errorEdicion}</p>}
                            </div>
                          ) : (
                            mensaje.texto && <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed">{conEnlaces(mensaje.texto)}</p>
                          )}
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
                            <div className={`mt-2 flex flex-wrap gap-1 rounded-2xl border px-2 py-1 ${propio ? 'border-white/25 bg-white/10' : 'border-rosa-claro bg-crema'}`}>
                              {REACCIONES.map((emoji) => (
                                <button key={emoji} type="button" onClick={() => toggleReaccion(mensaje, emoji)} className="rounded-full px-1.5 py-0.5 text-base leading-none transition hover:scale-125">
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                          <p className={`mt-2 flex items-center justify-end gap-1 text-[11px] ${propio ? 'text-white/80' : 'text-tinta/50'}`}>
                            <span>{mensaje.pendiente ? 'Enviando…' : hora(mensaje.creado)}{mensaje.editado && !mensaje.pendiente ? ' · editado' : ''}</span>
                            {propio && !mensaje.pendiente && (visto
                              ? <CheckCheck size={14} role="img" aria-label="Visto" />
                              : <Check size={14} role="img" aria-label="Enviado" />)}
                          </p>
                        </div>
                        <div className={`mt-1 flex gap-3 ${propio ? 'justify-end' : 'justify-start'}`}>
                          {propio && !mensaje.pendiente && editandoId !== mensaje.id && (
                            <>
                              <button type="button" onClick={() => empezarEdicion(mensaje)} className="inline-flex items-center gap-1 text-[11px] font-semibold text-tinta/50 hover:text-rosa">
                                <Pencil size={12} aria-hidden="true" /> editar
                              </button>
                              <button type="button" onClick={() => eliminarMensaje(mensaje)} className="inline-flex items-center gap-1 text-[11px] font-semibold text-tinta/50 hover:text-barca1">
                                <Trash2 size={12} aria-hidden="true" /> borrar
                              </button>
                            </>
                          )}
                          <button type="button" onClick={() => responder(mensaje)} className="inline-flex items-center gap-1 text-[11px] font-semibold text-tinta/50 hover:text-rosa">
                            <Reply size={12} aria-hidden="true" /> responder
                          </button>
                        </div>
                      </div>
                    </article>
                    </Fragment>
                  )
                })}
              </div>
              <form onSubmit={enviar} className="border-t border-rosa-claro px-4 pb-4 pt-2 sm:px-6">
                <p role="status" className="mb-2 h-4 text-xs italic text-tinta/60">
                  {hayEscribiendo && `${escribiendo.map((estado) => estado.nombre).join(', ')} ${escribiendo.length > 1 ? 'están' : 'está'} escribiendo…`}
                </p>
                {errorLectura && (
                  <div className="mb-3 text-sm text-barca1">
                    <p role="alert">{errorLectura}</p>
                    <button type="button" onClick={() => { setErrorLectura(''); setCargando(true); setIntentoLectura((intento) => intento + 1) }} className="mt-1 font-semibold underline">Reintentar</button>
                  </div>
                )}
                {errorEnvio && <p role="alert" className="mb-3 text-sm text-barca1">{errorEnvio}</p>}
                {errorAccion && <p role="alert" className="mb-3 text-sm text-barca1">{errorAccion}</p>}
                {avisoNombre && <p role="status" className="mb-3 text-sm text-tinta/70">{avisoNombre}</p>}
                {respondiendo && (
                  <div className="mb-3 flex items-start gap-2 rounded-2xl border border-rosa-claro bg-rosa-claro/30 px-3 py-2">
                    <Reply size={16} className="mt-0.5 shrink-0 text-rosa" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-rosa">Respondiendo a {respondiendo.nombre}</p>
                      <p className="text-xs leading-snug text-tinta/70 line-clamp-2">{resumen(respondiendo)}</p>
                    </div>
                    <button type="button" onClick={() => setRespondiendo(null)} aria-label="Cancelar respuesta" className="shrink-0 text-tinta/50 transition hover:text-tinta">
                      <X size={16} aria-hidden="true" />
                    </button>
                  </div>
                )}
                {adjunto && (
                  <div className="mb-3 flex items-center gap-3 rounded-2xl border border-rosa-claro bg-rosa-claro/30 px-3 py-2">
                    <img src={adjunto.url} alt="Foto por enviar" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                    <p className="min-w-0 flex-1 truncate text-xs text-tinta/70">{progreso != null ? `Subiendo… ${progreso}%` : adjunto.archivo.name}</p>
                    <button type="button" onClick={quitarAdjunto} disabled={enviando} aria-label="Quitar foto" className="shrink-0 text-tinta/50 transition hover:text-tinta disabled:opacity-40">
                      <X size={16} aria-hidden="true" />
                    </button>
                  </div>
                )}
                {emojisAbierto && !grabando && (
                  <div role="group" aria-label="Emojis" className="mb-3 grid max-h-36 grid-cols-8 gap-1 overflow-y-auto rounded-2xl border border-rosa-claro bg-crema/60 p-2 sm:grid-cols-12">
                    {EMOJIS.map((emoji) => (
                      <button key={emoji} type="button" onClick={() => insertarEmoji(emoji)} className="rounded-lg py-1 text-xl leading-none transition hover:scale-125 hover:bg-white">
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
                {grabando ? (
                  <div className="flex h-[52px] items-center gap-3 rounded-2xl border border-rosa-claro bg-rosa-claro/30 px-4">
                    <span className="h-3 w-3 shrink-0 animate-pulse rounded-full bg-barca1" aria-hidden="true" />
                    <p role="status" className="flex-1 text-sm font-semibold text-tinta">Grabando… {duracion(segundos)} <span className="font-normal text-tinta/50">/ {duracion(MAX_VOZ)}</span></p>
                    <button type="button" onClick={() => detenerGrabacion(true)} className="rounded-full border border-rosa-claro bg-white px-3 py-1.5 text-xs font-semibold text-tinta/70 hover:text-tinta">Cancelar</button>
                    <button type="button" onClick={() => detenerGrabacion(false)} className="inline-flex items-center gap-1 rounded-full bg-rosa px-3 py-1.5 text-xs font-semibold text-white hover:bg-barca1">
                      <Send size={13} aria-hidden="true" /> Enviar
                    </button>
                  </div>
                ) : (
                  <div className="flex items-end gap-2">
                    <div className="flex shrink-0 flex-col gap-1">
                      <button type="button" onClick={() => setEmojisAbierto((abierto) => !abierto)} aria-label="Emojis" aria-expanded={emojisAbierto} className={`grid h-6 w-9 place-items-center rounded-lg border border-rosa-claro transition hover:text-rosa ${emojisAbierto ? 'bg-rosa-claro/50 text-rosa' : 'bg-white text-tinta/60'}`}>
                        <Smile size={16} aria-hidden="true" />
                      </button>
                      <button type="button" onClick={() => fotoRef.current?.click()} disabled={enviando} aria-label="Adjuntar foto" className="grid h-6 w-9 place-items-center rounded-lg border border-rosa-claro bg-white text-tinta/60 transition hover:text-rosa disabled:opacity-50">
                        <ImagePlus size={16} aria-hidden="true" />
                      </button>
                      <input ref={fotoRef} type="file" accept="image/*" onChange={elegirFoto} className="hidden" tabIndex={-1} aria-hidden="true" />
                    </div>
                    <label htmlFor="chat-mensaje" className="sr-only">Tu mensaje</label>
                    <textarea
                      ref={textareaRef}
                      id="chat-mensaje"
                      rows={2}
                      maxLength={MAX_MENSAJE}
                      value={texto}
                      onChange={(e) => {
                        setTexto(e.target.value)
                        avisarEscribiendo(!!e.target.value.trim())
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          enviarMensaje()
                        }
                      }}
                      placeholder="Escribe algo bonito…"
                      className="min-h-[52px] min-w-0 flex-1 resize-none rounded-2xl border border-rosa-claro px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-rosa"
                    />
                    {puedeEnviar || enviando ? (
                      <button type="submit" disabled={!puedeEnviar || enviando} className="flex h-[52px] shrink-0 items-center gap-2 rounded-2xl bg-rosa px-4 font-semibold text-white transition hover:bg-barca1 disabled:cursor-not-allowed disabled:opacity-50">
                        <Send size={17} aria-hidden="true" /><span className="hidden sm:inline">{enviando ? 'Enviando…' : 'Enviar'}</span><span className="sr-only sm:hidden">{enviando ? 'Enviando mensaje' : 'Enviar mensaje'}</span>
                      </button>
                    ) : (
                      <button type="button" onClick={empezarGrabacion} aria-label="Grabar nota de voz" className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-2xl bg-rosa text-white transition hover:bg-barca1">
                        <Mic size={19} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                )}
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
