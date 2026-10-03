// Reemplaza las actividades en Firestore: borra p1..p9 y crea las 3 nuevas.
// Uso: node scripts/reemplazar-actividades.mjs
import fs from 'node:fs'
import crypto from 'node:crypto'
import { PLANES_INICIALES } from '../src/data/contenido.js'

const PROJECT = 'eve-bonita'
const sa = JSON.parse(fs.readFileSync(new URL('../SDKFirebase.json', import.meta.url), 'utf8'))
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')

async function obtenerToken() {
  const now = Math.floor(Date.now() / 1000)
  const unsigned = b64({ alg: 'RS256', typ: 'JWT' }) + '.' + b64({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/datastore',
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
  headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
})
const FS = (id) =>
  `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/planes/${id}`

const VIEJOS = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9']

try {
  let borrados = 0
  for (const id of VIEJOS) {
    const r = await api(FS(id), { method: 'DELETE' })
    if (r.status === 200 || r.status === 404) { if (r.status === 200) borrados++ }
    else console.log(`  (no se pudo borrar ${id}: ${r.status})`)
  }
  console.log(`✓ ${borrados} planes viejos borrados`)

  let creados = 0
  for (const p of PLANES_INICIALES) {
    const existe = await api(FS(p.id))
    if (existe.ok) { console.log(`• "${p.titulo}" ya existía`); continue }
    const r = await api(FS(p.id) + '?currentDocument.exists=false', {
      method: 'PATCH',
      body: JSON.stringify({
        fields: {
          titulo: { stringValue: p.titulo },
          prior: { stringValue: p.prior },
          fecha: { stringValue: p.fecha },
          categoria: { stringValue: p.categoria },
          hecho: { booleanValue: p.hecho },
        },
      }),
    })
    if (!r.ok) throw new Error(`${p.id}: ${await r.text()}`)
    creados++
    console.log(`✓ creado: ${p.titulo}`)
  }
  console.log(`\nListo: ${creados} actividades nuevas, ${borrados} viejas.`)
} catch (e) {
  console.error('ERROR:', e.message)
  process.exit(1)
}
