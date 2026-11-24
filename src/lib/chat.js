export const NOMBRE_KEY = 'eve-bonita-chat-nombre'
export const VISTO_KEY = 'eve-bonita-chat-visto'
export const MAX_NOMBRE = 40

export function leerNombre() {
  try {
    return (localStorage.getItem(NOMBRE_KEY) || '').trim().slice(0, MAX_NOMBRE)
  } catch (error) {
    console.warn('No se pudo recuperar el nombre del chat:', error)
    return ''
  }
}

// Marca de tiempo (ms) del último mensaje que este navegador ya mostró.
export function leerVisto() {
  try {
    return Number(localStorage.getItem(VISTO_KEY)) || 0
  } catch (error) {
    console.warn('No se pudo recuperar el último mensaje visto:', error)
    return 0
  }
}

export function guardarVisto(ms) {
  try {
    localStorage.setItem(VISTO_KEY, String(ms))
  } catch (error) {
    console.warn('No se pudo guardar el último mensaje visto:', error)
  }
}

let contexto

// Dos notas cortas. El navegador puede bloquear el sonido si aún no hubo interacción.
export function sonarAviso() {
  try {
    const Audio = window.AudioContext || window.webkitAudioContext
    if (!Audio) return
    contexto ??= new Audio()
    if (contexto.state === 'suspended') contexto.resume().catch(() => {})
    const inicio = contexto.currentTime
    ;[880, 1175].forEach((frecuencia, i) => {
      const t = inicio + i * 0.14
      const oscilador = contexto.createOscillator()
      const volumen = contexto.createGain()
      oscilador.type = 'sine'
      oscilador.frequency.value = frecuencia
      volumen.gain.setValueAtTime(0.0001, t)
      volumen.gain.exponentialRampToValueAtTime(0.15, t + 0.02)
      volumen.gain.exponentialRampToValueAtTime(0.0001, t + 0.25)
      oscilador.connect(volumen).connect(contexto.destination)
      oscilador.start(t)
      oscilador.stop(t + 0.27)
    })
  } catch (error) {
    console.warn('No se pudo reproducir el aviso del chat:', error)
  }
}
