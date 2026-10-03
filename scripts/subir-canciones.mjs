// Sube songs/*.mp3 a Storage y crea los docs en Firestore (colección canciones).
// Uso: node scripts/subir-canciones.mjs
import fs from 'node:fs'
import crypto from 'node:crypto'

const PROJECT = 'eve-bonita'
const BUCKETS = ['eve-bonita.firebasestorage.app', 'eve-bonita.appspot.com']
const KEY_PATH = new URL('../SDKFirebase.json', import.meta.url)
const SONGS_DIR = new URL('../songs/', import.meta.url)

// id de YouTube → datos de la canción
const MANIFEST = [
  { id: 'scxnZBevycs', artista: 'Taylor Swift',      titulo: 'Begin Again',       color: '#C9A0DC', orden: 1 },
  { id: 'Oosig2vTdsY', artista: 'Airbag',            titulo: 'Y Tu',              color: '#7EB8A2', orden: 2 },
  { id: 'GCdwKhTtNNw', artista: 'The Neighbourhood', titulo: 'Sweater Weather',    color: '#2B2D42', orden: 3 },
  { id: 'qNHcVevz7wo', artista: 'Oasis',             titulo: 'Wonderwall',        color: '#F5D67B', orden: 4 },
  { id: 'BzWo-VxJU5I', artista: 'Green Day',         titulo: 'Last Night On Earth', color: '#3A7D44', orden: 5 },
  { id: 'nLnp0tpZ0ok', artista: 'Public',            titulo: 'Make You Mine',     color: '#FF8FA3', orden: 6 },
]

const sa = JSON.parse(fs.readFileSync(KEY_PATH, 'utf8'))
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')

async function obtenerToken() {
  const now = Math.floor(Date.now() / 1000)
  const unsigned = b64({ alg: 'RS256', typ: 'JWT' }) + '.' + b64({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/devstorage.full_control',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
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
  if (!res.ok) throw new Error('OAuth: ' + JSON.stringify(data))
  return data.access_token
}

const tok = await obtenerToken()
const api = (url, init = {}) => fetch(url, {
  ...init,
  headers: { Authorization: `Bearer ${tok}`, ...(init.headers || {}) },
})
const FS = (coll, id) =>
  `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/${coll}/${id}`
const S = (stringValue) => ({ stringValue })
const I = (n) => ({ integerValue: String(n) })

async function subirCancion(m) {
  const archivo = new URL(`${m.id}.mp3`, SONGS_DIR)
  if (!fs.existsSync(archivo)) throw new Error(`Falta songs/${m.id}.mp3`)
  const objPath = `canciones/${m.id}.mp3`
  const body = fs.readFileSync(archivo)

  let bucket = null
  for (const b of BUCKETS) {
    const meta = await api(`https://storage.googleapis.com/storage/v1/b/${b}/o/${encodeURIComponent(objPath)}`)
    if (meta.ok) { bucket = b; break }
    const up = await api(
      `https://storage.googleapis.com/upload/storage/v1/b/${b}/o?uploadType=media&name=${encodeURIComponent(objPath)}`,
      { method: 'POST', headers: { 'Content-Type': 'audio/mpeg' }, body },
    )
    if (up.ok) { bucket = b; break }
    console.log(`  (bucket ${b} falló: ${up.status})`)
  }
  if (!bucket) throw new Error('No se pudo subir a Storage')

  const token = crypto.randomUUID()
  await api(
    `https://storage.googleapis.com/storage/v1/b/${bucket}/o/${encodeURIComponent(objPath)}`,
    { method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metadata: { firebaseStorageDownloadTokens: token } }) },
  )
  const url = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(objPath)}?alt=media&token=${token}`

  const docId = `canc_${m.id}`
  const existente = await api(FS('canciones', docId))
  if (existente.ok) { console.log(`• "${m.titulo}" ya tenía doc, lo salto`); return }

  const r = await api(FS('canciones', docId) + '?currentDocument.exists=false', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        artista: S(m.artista),
        titulo: S(m.titulo),
        color: S(m.color),
        url: S(url),
        orden: I(m.orden),
      },
    }),
  })
  if (!r.ok) throw new Error(`doc ${docId}: ${await r.text()}`)
  console.log(`✓ ${m.artista} — ${m.titulo} (${(body.length / 1048576).toFixed(1)} MB)`)
}

try {
  for (const m of MANIFEST) await subirCancion(m)
  console.log('\nListo. Recarga el sitio: la banda sonora ya suena.')
} catch (e) {
  console.error('ERROR:', e.message)
  process.exit(1)
}
