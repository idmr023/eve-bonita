// Todo editable aquí, Iván
export const NOMBRES = {
  el: 'Iván',
  ella: 'Evelyn',
  apodo: 'Cheva',
}

export const FRASES_FONDO = [
  'te quiero',
  'eres perfecta así',
  'me encantan tus pecas',
  'nunca cambies',
  'eres preciosa',
  'amo tus ojitos',
  'mi Cheva hermosa',
  'contigo todo es mejor',
  'eres mi lugar favorito',
  'me haces muy feliz',
]

// Fecha objetivo: próximo domingo 16:30. Se auto-calcula.
// Si quieres fijar: cambia a '2026-09-28T16:30:00-05:00' (ajusta zona)
export function getProximoDomingo1630() {
  const now = new Date()
  const d = new Date(now)
  const day = d.getDay() // 0 dom
  let diff = (7 - day) % 7
  if (diff === 0) {
    // es domingo: si ya pasó las 16:30, apuntar al próximo
    const hoy1630 = new Date(d)
    hoy1630.setHours(16, 30, 0, 0)
    if (now >= hoy1630) diff = 7
    else return hoy1630
  }
  d.setDate(d.getDate() + diff)
  d.setHours(16, 30, 0, 0)
  d.setMilliseconds(0)
  return d
}

export const GUSTOS_CHEVA = [
  { id: 'iglesia', label: 'Ir a la iglesia', emoji: '⛪', color: '#F5D67B', desc: 'Su luz, su fe' },
  { id: 'biblia', label: 'Leer la Biblia', emoji: '📖', color: '#E8D5B7', desc: 'Palabra que la guía' },
  { id: 'futbol', label: 'Jugar fútbol', emoji: '⚽', color: '#2D6A4F', desc: 'Con garra y sonrisa' },
  { id: 'estadio', label: 'Ir al estadio', emoji: '🏟️', color: '#2D6A4F', desc: 'Gritar los goles juntos' },
  { id: 'barca', label: 'Barça', emoji: '🔵🔴', color: '#A50044', desc: 'Visca el Barça!' },
  { id: 'laU', label: 'La U', emoji: '🟡🔴', color: '#D32F2F', desc: 'Y dale U!' },
  { id: 'oversize', label: 'Pantalones sueltos', emoji: '👖', color: '#8E8EA0', desc: 'Su estilo único' },
  { id: 'perritos', label: 'Los perritos', emoji: '🐶', color: '#FFB88C', desc: 'Amor incondicional' },
  { id: 'postres', label: 'Postres dulces', emoji: '🧁', color: '#FF8FA3', desc: 'Tan dulce como ella' },
  { id: 'taylor', label: 'Taylor Swift', emoji: '🎤', color: '#C9A0DC', desc: 'All Too Well' },
  { id: 'airbag', label: 'Airbag', emoji: '🎸', color: '#7EB8A2', desc: 'Rock del bueno' },
  { id: 'neighbourhood', label: 'The Neighbourhood', emoji: '🌙', color: '#2B2D42', desc: 'Sweater Weather' },
  { id: 'oasis', label: 'Oasis', emoji: '⭐', color: '#F5D67B', desc: 'Wonderwall' },
  { id: 'greenday', label: 'Green Day', emoji: '💚', color: '#3A7D44', desc: 'Boulevard' },
  { id: 'pelis', label: 'Pelis románticas y comedia', emoji: '🎬', color: '#FF8FA3', desc: 'Contigo, cualquiera' },
  { id: 'selva', label: 'Comida de la selva', emoji: '🍃', color: '#3A7D44', desc: 'Sabor a casa' },
]

export const GUSTOS_IVAN = [
  { label: 'Amar a Cheva', emoji: '💛' },
  { label: 'Fútbol contigo', emoji: '⚽' },
  { label: 'Hacerte reír', emoji: '😂' },
  { label: 'Cuidarte siempre', emoji: '🫶' },
]

export const PLANES_INICIALES = [
  { id: 'act-cine', titulo: 'Ir al cine', prior: 'media', fecha: '', categoria: 'pelis', hecho: false },
  { id: 'act-aguas', titulo: 'Ir al parque de las aguas', prior: 'media', fecha: '', categoria: 'paseo', hecho: false },
  { id: 'act-correr', titulo: 'Correr juntos', prior: 'media', fecha: '', categoria: 'correr', hecho: false },
  { id: 'act-restaurant', titulo: 'Cita Restaurant & Valetodo', prior: 'media', fecha: '', categoria: 'citas', hecho: true },
  { id: 'act-flores', titulo: 'Cita Flores Amarillas', prior: 'media', fecha: '', categoria: 'citas', hecho: true },
  { id: 'act-teatro', titulo: 'Cita en el Teatro', prior: 'media', fecha: '', categoria: 'citas', hecho: true },
]

export const CARTA_TEXTO = `Mi Cheva hermosa,

No sé si esta cartita alcance a decir todo lo que siento, pero quiero intentarlo.

Desde que llegaste, mis domingos tienen otro color. Me encanta cómo amas a Dios, cómo lees tu Biblia con esa paz que me contagia. Me encanta verte jugar fútbol, verte gritar un gol en el estadio, verte con tus pantalones sueltos y tu camiseta del Barça o de la U — en todas te ves preciosa.

Amo tus pecas. Amo tus ojitos. Amo cómo te ríes con una peli romántica y cómo te ríes más fuerte con una de comedia. Amo lo dulce que eres, tan dulce como esos postres que tanto te gustan. Amo cantar bajito contigo un pedacito de Taylor, de Airbag, de Oasis, de Green Day — aunque desafine, si es contigo suena bien.

Quiero que sepas algo: puedes contar conmigo. En tus días buenos para celebrarlos, y en los no tan buenos para abrazarte más fuerte. Nunca cambies, eres perfecta así. Quiero seguir sumando planes contigo, tachando juntos cada cosita de nuestra lista, yendo al estadio, a la iglesia, a donde sea — pero juntos.

Gracias por dejarme quererte.

Tuyo,
Iván 💛`

export const RAZONES = [
  { titulo: 'Porque brillas', texto: 'Tu hermosa personalidad hace que me enamore cada día un poquito más.' },
  { titulo: 'Porque eres valiente', texto: 'En la cancha no te achicas. Esa garra tuya me enamora.' },
  { titulo: 'Porque eres tú', texto: 'Con pecas, con random, con estilo propio. No te cambiaría nada.' },
  { titulo: 'Porque eres random', texto: 'No sigues un molde. Dejas fluir tus pensamientos y no tienes vergüenza de ello.' },
]

export const VERSICULO = { ref: '1 Corintios 13:7', texto: 'El amor todo lo cree, todo lo espera, todo lo soporta.' }
