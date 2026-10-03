import { useSyncExternalStore } from 'react'

function suscribir(cb) {
  window.addEventListener('hashchange', cb)
  window.addEventListener('popstate', cb)
  return () => {
    window.removeEventListener('hashchange', cb)
    window.removeEventListener('popstate', cb)
  }
}

function leer() {
  const hash = window.location.hash.replace(/^#/, '')
  return hash || window.location.pathname
}

export default function useRuta() {
  return useSyncExternalStore(suscribir, leer, leer)
}
