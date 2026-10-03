import { motion } from 'framer-motion'

const links = [
  { href: '#cuenta', label: 'Cuenta regresiva' },
  { href: '#planes', label: 'Planes' },
  { href: '#avatars', label: 'Nosotros 3D' },
  { href: '#carta', label: 'Cartita' },
  { href: '#galeria', label: 'Galería' },
  { href: '#contigo', label: 'Cuenta conmigo' },
]

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-3 left-1/2 -translate-x-1/2 z-50 hidden md:flex items-center gap-2 bg-white/80 backdrop-blur rounded-full px-2 py-2 shadow-lg border border-rosa-claro/60"
    >
      {links.map((l) => (
        <a key={l.href} href={l.href} className="px-3 py-1.5 rounded-full text-sm font-ui font-semibold text-tinta hover:bg-rosa hover:text-white transition">
          {l.label}
        </a>
      ))}
      <span className="ml-1 bg-gradient-to-br from-barca1 to-barca2 text-white text-xs px-3 py-1.5 rounded-full font-bold">Iván × Cheva</span>
    </motion.nav>
  )
}
