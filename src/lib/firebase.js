import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyA4iZa_eCJuhF-gtgPG2DlnBCrbk1egUHU',
  authDomain: 'eve-bonita.firebaseapp.com',
  projectId: 'eve-bonita',
  storageBucket: 'eve-bonita.firebasestorage.app',
  messagingSenderId: '854501252978',
  appId: '1:854501252978:web:895bbe997cfe6ace72c7eb',
  measurementId: 'G-WTH0J6LGMM',
}

export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const storage = getStorage(app)

isSupported()
  .then((ok) => { if (ok) getAnalytics(app) })
  .catch(() => {})
