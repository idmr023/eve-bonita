import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Admin from './admin/Admin.jsx'
import useRuta from './hooks/useRuta.js'
import './index.css'

function Root() {
  const ruta = useRuta()
  const esAdmin = ruta === '/admin' || ruta.startsWith('/admin/') || ruta === 'admin'
  return esAdmin ? <Admin /> : <App />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
