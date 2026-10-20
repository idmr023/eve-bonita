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

// Fecha objetivo: próximo sábado 15:00. Se auto-calcula.
// Si quieres fijar: cambia a '2026-10-03T15:00:00-05:00' (ajusta zona)
export function getProximoDomingo1630() {
  const now = new Date()
  const d = new Date(now)
  const day = d.getDay() // 6 sáb
  let diff = (6 - day + 7) % 7
  if (diff === 0) {
    // es sábado: si ya pasó las 15:00, apuntar al próximo
    const hoy1500 = new Date(d)
    hoy1500.setHours(15, 0, 0, 0)
    if (now >= hoy1500) diff = 7
    else return hoy1500
  }
  d.setDate(d.getDate() + diff)
  d.setHours(15, 0, 0, 0)
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

// Todas las cartitas guardadas. La 1 ya la teníamos; la 2 y 3 son nuevas.
export const CARTAS_INICIALES = [
  {
    id: 'carta-1',
    titulo: 'La cartita del sobre',
    sub: 'la primera, la que ya tenías',
    emoji: '💌',
    color: '#FF8FA3',
    orden: 1,
    texto: CARTA_TEXTO,
    firma: 'siempre tuyo, Iván',
  },
  {
    id: 'carta-2',
    titulo: 'Para cuando dudes de ti',
    sub: 'porque te veo y no me cabe en el pecho',
    emoji: '🌟',
    color: '#C9A0DC',
    orden: 2,
    texto: `Cheva,

Hay días en los que no te ves como yo te veo, y por eso te escribo esta.

Para mí no existes "a veces bonita". Existes bonita siempre: con el pelo recogido y sin maquillaje, con tus pantalones sueltos que tanto amas, con la camiseta de la U o del Barça arrugada después del partido, riendo a carcajadas con una comedia o con la mano en el pecho con una romántica. Todas esas versiones son mi favorita, y ninguna es casualidad.

Tus pecas no son "detalles": son constelaciones. Tus ojitos no son "lindos": son mi lugar favorito para perderme. Tu forma de ser — random, libre, sin molde, sin vergüenza — no es algo que debas corregir: es exactamente lo que me enamoró.

No tienes que cambiar nada. Ni un pelo. Ni un pensamiento. Nunca cambies.

Con todo mi amor,
Iván 💛`,
    firma: 'tu Iván, siempre',
  },
  {
    id: 'carta-3',
    titulo: 'Lo que quiero seguir haciendo contigo',
    sub: 'esto no es una despedida, es un "nos vemos pronto"',
    emoji: '📅',
    color: '#F5D67B',
    orden: 3,
    texto: `Mi Cheva,

Esto no es una despedida, es un "nos vemos pronto".

Quiero seguir yendo a la iglesia contigo y escucharte cantar bajito. Quiero seguir leyendo un versículo contigo y pelearnos por cuál es el mejor. Quiero seguir gritando goles en el estadio, aunque el Barça juegue mal — porque contigo hasta perder sabe a victoria.

Quiero seguir corriendo a tu lado aunque me ganes siempre, ir al parque de las aguas en un día caluroso, probar postres nuevos y fingir que no me gustan tanto. Quiero ver mil pelis contigo, aunque te duermas en la última. Quiero cantar desafinando a Taylor, a Airbag, a Oasis y a Green Day, y que me mires como si fuera un concierto.

Quiero seguir tachando planes de nuestra lista y agregando nuevos. Quiero sábados de citas, días de fútbol, y todos los días que haya en medio.

Siempre te voy a elegir a ti, Cheva. Otra vez y otra vez.

Tuyo,
Iván 💛`,
    firma: 'el que te elige siempre',
  },
]

export const RAZONES = [
  { titulo: 'Porque brillas', texto: 'Tu hermosa personalidad hace que me enamore cada día un poquito más.' },
  { titulo: 'Porque eres valiente', texto: 'En la cancha no te achicas. Esa garra tuya me enamora.' },
  { titulo: 'Porque eres tú', texto: 'Con pecas, con random, con estilo propio. No te cambiaría nada.' },
  { titulo: 'Porque eres random', texto: 'No sigues un molde. Dejas fluir tus pensamientos y no tienes vergüenza de ello.' },
]

export const VERSICULO = { ref: '1 Corintios 13:7', texto: 'El amor todo lo cree, todo lo espera, todo lo soporta.' }
