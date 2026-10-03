// Sube public/img_citas/*.jpeg a Storage y crea los docs en Firestore (fotos).
// Vincula cada foto con su actividad para que la galería no repita tarjetas.
// Uso: node scripts/subir-citas.mjs
import fs from 'node:fs'
import crypto from 'node:crypto'

const PROJECT = 'eve-bonita'
const BUCKETS = ['eve-bonita.firebasestorage.app', 'eve-bonita.appspot.com']
const KEY_PATH = new URL('../SDKFirebase.json', import.meta.url)
const DIR = new URL('../public/img_citas/', import.meta.url)

const MANIFEST = [
  { archivo: 'salida_restaurant.jpeg', doc: 'foto_restaurant', titulo: 'Cita Restaurant & Valetodo', orden: 2, actividad: 'act-restaurant' },
  { archivo: 'salida_dia_de_las_floressamarillas.jpeg', doc: 'foto_flores_1', titulo: 'Cita Flores Amarillas', orden: 3, actividad: 'act-flores' },
  { archivo: 'salida_dia_de_las_floressamarillas.jpeg2.jpeg', doc: 'foto_flores_2', titulo: 'Cita Flores Amarillas', orden: 4, actividad: 'act-flores' },
  { archivo: 'teatro.jpeg', doc: 'foto_teatro_1', titulo: 'Cita en el Teatro', orden: 5, actividad: 'act-teatro' },
  { archivo: 'teatro2.jpeg', doc: 'foto_teatro_2', titulo: 'Cita en el Teatro', orden: 6, actividad: 'act-teatro' },
]

const sa = JSON.parse(fs.readFileSync(KEY_PATH, 'utf8'))
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')

async function obtenerToken() {
  const now = Math.floor(Date.now() / 1000)
  const unsigned = b64({ alg: 'RS256', typ: 'JWT' }) + '.' + b64({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/devstorage.full_control',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600,
  })
  const sign = crypto.createSign('RSA-SHA256')
  sign.update(unsigned)
  const jwt = unsigned + '.' + sign.sign(sa.private_key).toString('base64url')
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(JSON.stringify(data))
  return data.access_token
}

const tok = await obtenerToken()
const api = (url, init = {}) => fetch(url, {
  ...init,
  headers: { Authorization: `Bearer ${tok}`, ...(init.headers || {}) },
})
const FS = (id) =>
  `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/fotos/${id}`
const S = (stringValue) => ({ stringValue })
const I = (n) => ({ integerValue: String(n) })

async function subir(m) {
  const archivo = new URL(m.archivo, DIR)
  if (!fs.existsSync(archivo)) throw new Error(`Falta public/img_citas/${m.archivo}`)
  const objPath = `fotos/${m.doc}.jpg`
  const body = fs.readFileSync(archivo)

  let bucket = null
  for (const b of BUCKETS) {
    const meta = await api(`https://storage.googleapis.com/storage/v1/b/${b}/o/${encodeURIComponent(objPath)}`)
    if (meta.ok) { bucket = b; break }
    const up = await api(
      `https://storage.googleapis.com/upload/storage/v1/b/${b}/o?uploadType=media&name=${encodeURIComponent(objPath)}`,
      { method: 'POST', headers: { 'Content-Type': 'image/jpeg' }, body },
    )
    if (up.ok) { bucket = b; break }
  }
  if (!bucket) throw new Error(`No se pudo subir ${m.archivo}`)

  const token = crypto.randomUUID()
  await api(
    `https://storage.googleapis.com/storage/v1/b/${bucket}/o/${encodeURIComponent(objPath)}`,
    { method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metadata: { firebaseStorageDownloadTokens: token } }) },
  )
  const url = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(objPath)}?alt=media&token=${token}`

  const existente = await api(FS(m.doc))
  if (existente.ok) { console.log(`• "${m.titulo}" (${m.doc}) ya tenía doc, lo salto`); return }

  const r = await api(FS(m.doc) + '?currentDocument.exists=false', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        url: S(url),
        titulo: S(m.titulo),
        sub: S(''),
        orden: I(m.orden),
        actividad: S(m.actividad),
      },
    }),
  })
  if (!r.ok) throw new Error(`${m.doc}: ${await r.text()}`)
  console.log(`✓ ${m.titulo} (${m.archivo})`)
}

try {
  for (const m of MANIFEST) await subir(m)
  console.log('\nListo. 5 fotos de citas en la galería.')
} catch (e) {
  console.error('ERROR:', e.message)
  process.exit(1)
}
