import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Admin from './admin/Admin.jsx'
import Cartitas from './components/Cartitas.jsx'
import Chat from './components/Chat.jsx'
import ChatFlotante from './components/ChatFlotante.jsx'
import useRuta from './hooks/useRuta.js'
import './index.css'

function Root() {
  const ruta = useRuta()
  const esAdmin = ruta === '/admin' || ruta.startsWith('/admin/') || ruta === 'admin'
  const esCartitas = ruta === '/cartitas' || ruta.startsWith('/cartitas/')
  const esChat = ruta === '/chat' || ruta.startsWith('/chat/')
  if (esAdmin) return <Admin />
  if (esChat) return <Chat />
  return <>{esCartitas ? <Cartitas /> : <App />}<ChatFlotante /></>
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
