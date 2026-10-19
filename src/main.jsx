import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Admin from './admin/Admin.jsx'
import Cartas from './components/Cartas.jsx'
import useRuta from './hooks/useRuta.js'
import './index.css'

function Root() {
  const ruta = useRuta()
  // "cartas", "/cartas", "/eve-bonita/cartas" -> todas equivalen a la página de cartitas
  const limpio = ruta.replace(/^\/+|\/+$/g, '').replace(/^.*?(\/|^)(admin|cartas)\b.*$/, '$2')
  const esAdmin = limpio === 'admin' || limpio.startsWith('admin/')
  const esCartas = limpio === 'cartas' || limpio.startsWith('cartas/')
  if (esAdmin) return <Admin />
  if (esCartas) return <Cartas />
  return <App />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
