// Sube las cartitas iniciales a Firestore (coleccion "cartas").
// Uso: node scripts/subir-cartas.mjs
import fs from 'node:fs'
import crypto from 'node:crypto'
import { CARTAS_INICIALES } from '../src/data/contenido.js'

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
  `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/cartas/${id}`

const S = (v) => ({ stringValue: v })
const I = (n) => ({ integerValue: String(n) })
const B = (v) => ({ booleanValue: !!v })

try {
  let creados = 0, saltados = 0
  for (const c of CARTAS_INICIALES) {
    const existe = await api(FS(c.id))
    if (existe.ok) { console.log(`• "${c.titulo}" ya existía, la salto`); saltados++; continue }
    const r = await api(FS(c.id) + '?currentDocument.exists=false', {
      method: 'PATCH',
      body: JSON.stringify({
        fields: {
          titulo: S(c.titulo || ''),
          sub: S(c.sub || ''),
          emoji: S(c.emoji || '💌'),
          fecha: S(c.fecha || ''),
          texto: S(c.texto || ''),
          firma: S(c.firma || ''),
          destacado: B(c.destacado),
          orden: I(c.orden || 1),
        },
      }),
    })
    if (!r.ok) throw new Error(`${c.id}: ${await r.text()}`)
    creados++
    console.log(`✓ creado: ${c.titulo}`)
  }
  console.log(`\nListo: ${creados} cartitas creadas, ${saltados} ya existían.`)
  console.log('Verlas en: /cartas')
} catch (e) {
  console.error('ERROR:', e.message)
  process.exit(1)
}
