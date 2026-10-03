// Carga inicial: foto a Storage + docs en Firestore (planes).
// Uso: node scripts/cargar-inicial.mjs
import fs from 'node:fs'
import crypto from 'node:crypto'
import { PLANES_INICIALES } from '../src/data/contenido.js'

const PROJECT = 'eve-bonita'
const BUCKETS = ['eve-bonita.firebasestorage.app', 'eve-bonita.appspot.com']
const KEY_PATH = new URL('../SDKFirebase.json', import.meta.url)

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

const FS = (coll, id = '') =>
  `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/${coll}${id ? '/' + id : ''}`

async function existeDoc(coll, id) {
  const r = await api(FS(coll, id))
  return r.status === 200
}

async function crearDoc(coll, id, fields) {
  const url = id
    ? FS(coll, id) + '?currentDocument.exists=false'
    : FS(coll)
  const r = await api(url, {
    method: id ? 'PATCH' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  })
  if (!r.ok) throw new Error(`${coll}/${id || '?'}: ${await r.text()}`)
  return (await r.json()).name?.split('/').pop()
}

const S = (stringValue) => ({ stringValue })
const I = (n) => ({ integerValue: String(n) })

// ---------- 1. Foto a Storage ----------
const FOTO = 'public/foto_personaje.jpg'
const OBJ = 'fotos/foto_personaje.jpg'

async function subirFoto() {
  const existente = await existeDoc('fotos', 'foto_personaje')
  if (existente) { console.log('• La foto ya está en Firestore, la salto'); return }

  const body = fs.readFileSync(FOTO)
  let obj = null
  for (const bucket of BUCKETS) {
    const up = await api(
      `https://storage.googleapis.com/upload/storage/v1/b/${bucket}/o?uploadType=media&name=${encodeURIComponent(OBJ)}`,
      { method: 'POST', headers: { 'Content-Type': 'image/jpeg' }, body },
    )
    if (up.ok) { obj = { bucket, data: await up.json() }; break }
    console.log(`  (bucket ${bucket} falló: ${up.status})`)
  }
  if (!obj) throw new Error('No se pudo subir a ningún bucket')

  const token = crypto.randomUUID()
  await api(
    `https://storage.googleapis.com/storage/v1/b/${obj.bucket}/o/${encodeURIComponent(OBJ)}`,
    { method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metadata: { firebaseStorageDownloadTokens: token } }) },
  )
  const url = `https://firebasestorage.googleapis.com/v0/b/${obj.bucket}/o/${encodeURIComponent(OBJ)}?alt=media&token=${token}`

  await crearDoc('fotos', 'foto_personaje', {
    url: S(url),
    titulo: S('Cheva 💛'),
    sub: S('mi foto favorita'),
    orden: I(1),
  })
  console.log('✓ Foto subida a Storage + doc "fotos/foto_personaje" creado')
  console.log('  ' + url.slice(0, 90) + '…')
}

// ---------- 2. Planes / actividades ----------
async function subirPlanes() {
  let creados = 0, saltados = 0
  for (const p of PLANES_INICIALES) {
    if (await existeDoc('planes', p.id)) { saltados++; continue }
    await crearDoc('planes', p.id, {
      titulo: S(p.titulo),
      prior: S(p.prior),
      fecha: S(p.fecha || ''),
      categoria: S(p.categoria),
      hecho: { booleanValue: !!p.hecho },
    })
    creados++
  }
  console.log(`✓ Planes: ${creados} creados, ${saltados} ya existían`)
}

// ---------- main ----------
try {
  await subirFoto()
  await subirPlanes()
  console.log('\nListo. Recarga el sitio para verlo.')
} catch (e) {
  console.error('ERROR:', e.message)
  process.exit(1)
}
