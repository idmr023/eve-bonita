import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Admin from './admin/Admin.jsx'
import Cartitas from './components/Cartitas.jsx'
import useRuta from './hooks/useRuta.js'
import './index.css'

function Root() {
  const ruta = useRuta()
  const esAdmin = ruta === '/admin' || ruta.startsWith('/admin/') || ruta === 'admin'
  const esCartitas = ruta === '/cartitas' || ruta.startsWith('/cartitas/')
  if (esAdmin) return <Admin />
  if (esCartitas) return <Cartitas />
  return <App />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
