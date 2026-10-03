import {
  collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { db, storage } from './firebase'

export function escuchar(coleccion, cb) {
  return onSnapshot(
    collection(db, coleccion),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => { console.warn('Firestore [' + coleccion + ']:', err.message); cb(null, err) },
  )
}

export function escucharDoc(coleccion, id, cb) {
  return onSnapshot(
    doc(db, coleccion, id),
    (snap) => cb(snap.exists() ? { id: snap.id, ...snap.data() } : null),
    (err) => { console.warn('Firestore [' + coleccion + '/' + id + ']:', err.message); cb(null, err) },
  )
}

export const agregar = (coleccion, data) => addDoc(collection(db, coleccion), data)
export const actualizar = (coleccion, id, data) => updateDoc(doc(db, coleccion, id), data)
export const borrar = (coleccion, id) => deleteDoc(doc(db, coleccion, id))
export const guardarDoc = (coleccion, id, data) =>
  setDoc(doc(db, coleccion, id), data, { merge: true })

export function stamp() {
  return { actualizado: serverTimestamp() }
}

export function subirArchivo(ruta, file, onProgress) {
  return new Promise((resolve, reject) => {
    const tarea = uploadBytesResumable(ref(storage, ruta), file)
    tarea.on(
      'state_changed',
      (s) => onProgress?.(Math.round((s.bytesTransferred / s.totalBytes) * 100)),
      reject,
      async () => { try { resolve(await getDownloadURL(tarea.snapshot.ref)) } catch (e) { reject(e) } },
    )
  })
}

// Acepta URL https completa, gs://... o ruta simple ("canciones/x.mp3")
export async function urlDe(u) {
  if (!u) return ''
  if (/^https?:\/\//i.test(u)) return u
  try {
    if (u.startsWith('gs://')) {
      return await getDownloadURL(ref(storage, u.replace(/^gs:\/\/[^/]+\//, '')))
    }
    return await getDownloadURL(ref(storage, u))
  } catch (e) {
    console.warn('No se pudo resolver la ruta:', u, e.message)
    return ''
  }
}

export const porOrden = (a, b) => (a.orden ?? 0) - (b.orden ?? 0)
