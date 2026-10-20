import { useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, ContactShadows, Environment, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

// ---------------------------------------------------------------------------
// Escenas de la historia: de desconocidos a pareja
// ---------------------------------------------------------------------------
const ESCENAS = [
  {
    id: 'conocimiento',
    etiqueta: 'Capítulo 1',
    titulo: 'Amigos de oficina',
    lugar: 'Teleperformance · lockers',
    cheva: { x: -1.5, z: 0.2, rot: 0.42 },
    ivan: { x: 1.5, z: 0.5, rot: -0.45 },
    camara: { pos: [0, 1.9, 8.4], look: [0, 1.5, 1.4] },
    dialogo: { autor: 'Evelyn', texto: '¡Hola! Soy Cheva' },
  },
  {
    id: 'amigos',
    etiqueta: 'Capítulo 2',
    titulo: 'Fuimos conocidos',
    lugar: 'Torre Entel · comedor piso 2',
    cheva: { x: -1.5, z: 0.2, rot: 0.42 },
    ivan: { x: 1.5, z: 0.5, rot: -0.45 },
    camara: { pos: [0, 1.75, 7.4], look: [0, 1.42, 1.5] },
    dialogo: { autor: 'Cheva', texto: 'Almorcemos juntos, tengo chimi chimi' },
  },
  {
    id: 'salientes',
    etiqueta: 'Capítulo 3',
    titulo: 'Salientes',
    lugar: 'Teleperformance · salida de la oficina',
    cheva: { x: -0.95, z: 0.35, rot: 0.28 },
    ivan: { x: 0.95, z: 0.3, rot: -0.3 },
    camara: { pos: [0, 1.6, 6.5], look: [0, 1.35, 1.6] },
    dialogo: { autor: 'Ivan', texto: '¿Te gusta la comida mexicana, vamos a comer Tacos?' },
  },
  {
    id: 'besos',
    etiqueta: 'Capítulo 4',
    titulo: 'Y hasta hoy',
    lugar: 'Contigo, desde siempre',
    cheva: { x: -0.42, z: 0.45, rot: 0.12 },
    ivan: { x: 0.42, z: 0.45, rot: -0.12 },
    camara: { pos: [0, 1.5, 5.2], look: [0, 1.28, 1.8] },
    dialogo: { autor: 'Iván', texto: 'Te quiero, Cheva. ¿un besito?' },
    beso: true,
  },
]

// ---------------------------------------------------------------------------
// Proscenio: arco de teatro fijo en 3D (marco del escenario, nunca se mueve)
// ---------------------------------------------------------------------------
function Proscenio() {
  const columnas = [-3.2, 3.2]
  return (
    <group position={[0, 0, 0.2]}>
      {/* columnas laterales doradas */}
      {columnas.map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          <mesh position={[0, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.36, 3.0, 20]} />
            <meshStandardMaterial color="#C89B2C" roughness={0.45} metalness={0.55} />
          </mesh>
          <mesh position={[0, 3.12, 0]} castShadow>
            <cylinderGeometry args={[0.42, 0.32, 0.28, 20]} />
            <meshStandardMaterial color="#F5D67B" roughness={0.35} metalness={0.6} />
          </mesh>
          <mesh position={[0, -0.1, 0]} castShadow>
            <cylinderGeometry args={[0.44, 0.5, 0.3, 20]} />
            <meshStandardMaterial color="#F5D67B" roughness={0.35} metalness={0.6} />
          </mesh>
        </group>
      ))}

      {/* dintel superior */}
      <mesh position={[0, 3.3, 0]} castShadow>
        <boxGeometry args={[7.1, 0.38, 0.6]} />
        <meshStandardMaterial color="#C89B2C" roughness={0.45} metalness={0.5} />
      </mesh>
      <mesh position={[0, 3.58, 0]} castShadow>
        <boxGeometry args={[7.6, 0.22, 0.75]} />
        <meshStandardMaterial color="#F5D67B" roughness={0.35} metalness={0.6} />
      </mesh>

      {/* zócalo / tarima del proscenio */}
      <mesh position={[0, -0.14, 0.25]} receiveShadow>
        <boxGeometry args={[7.4, 0.28, 1.1]} />
        <meshStandardMaterial color="#5B3A22" roughness={0.8} />
      </mesh>

      {/* focos de luz del teatro colgados del dintel */}
      {[-2.2, 0, 2.2].map((x, i) => (
        <group key={i} position={[x, 3.05, 0.55]}>
          <mesh rotation={[0.5, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.22, 0.32, 14]} />
            <meshStandardMaterial color="#2A2E3A" roughness={0.5} metalness={0.4} />
          </mesh>
          <mesh position={[0, -0.15, 0.08]}>
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshStandardMaterial color="#FFF3D6" emissive="#FFD98A" emissiveIntensity={1.8} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ---------------------------------------------------------------------------
// Escenario de oficinas tipo Teleperformance
// ---------------------------------------------------------------------------
function Oficina() {
  const mesas = []
  for (let f = 0; f < 3; f++) {
    for (let c = 0; c < 4; c++) {
      const x = -4.2 + c * 2.8
      const z = -2.2 - f * 2.5
      mesas.push(
        <group key={`${f}-${c}`} position={[x, 0, z]}>
          <mesh position={[0, 0.36, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.9, 0.09, 0.95]} />
            <meshStandardMaterial color="#E9E4DA" />
          </mesh>
          <mesh position={[-0.55, 0.18, 0]}>
            <boxGeometry args={[0.08, 0.36, 0.08]} />
            <meshStandardMaterial color="#9AA3B2" />
          </mesh>
          <mesh position={[0.55, 0.18, 0]}>
            <boxGeometry args={[0.08, 0.36, 0.08]} />
            <meshStandardMaterial color="#9AA3B2" />
          </mesh>
          <mesh position={[0, 0.66, -0.12]} castShadow>
            <boxGeometry args={[0.82, 0.5, 0.06]} />
            <meshStandardMaterial color="#2A2E3A" emissive="#3D5A80" emissiveIntensity={0.35} />
          </mesh>
          <mesh position={[0, 0.5, -0.12]}>
            <cylinderGeometry args={[0.03, 0.03, 0.22, 8]} />
            <meshStandardMaterial color="#3A3F4B" />
          </mesh>
        </group>
      )
    }
  }

  return (
    <group>
      {/* pared de fondo de la oficina */}
      <mesh position={[0, 2.2, -8.4]} receiveShadow>
        <boxGeometry args={[24, 7, 0.3]} />
        <meshStandardMaterial color="#DCE6F2" />
      </mesh>
      {/* ventanales */}
      {[-6.4, -3.2, 0, 3.2, 6.4].map((x, i) => (
        <mesh key={i} position={[x, 2.6, -8.2]}>
          <boxGeometry args={[2.5, 2.7, 0.12]} />
          <meshStandardMaterial color="#9FD3F7" emissive="#7FC4F0" emissiveIntensity={0.5} roughness={0.2} />
        </mesh>
      ))}
      {/* logo de la empresa */}
      <mesh position={[0, 4.5, -8.15]}>
        <boxGeometry args={[5.4, 0.95, 0.16]} />
        <meshStandardMaterial color="#1B4F9C" emissive="#1B4F9C" emissiveIntensity={0.45} />
      </mesh>
      {/* mesas */}
      {mesas}
      {/* suelo de la oficina (detrás del proscenio) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -6.5]} receiveShadow>
        <planeGeometry args={[26, 13]} />
        <meshStandardMaterial color="#C9D4E2" roughness={0.9} />
      </mesh>
    </group>
  )
}

// ---------------------------------------------------------------------------
// Personajes tipo "muñequito" / Wow
// ---------------------------------------------------------------------------
function BaseMuneco({ color, pelo, acento, cara }) {
  return (
    <group>
      {/* piernas */}
      <mesh position={[-0.16, 0.16, 0]} castShadow>
        <capsuleGeometry args={[0.11, 0.16, 6, 12]} />
        <meshStandardMaterial color="#2C3E50" />
      </mesh>
      <mesh position={[0.16, 0.16, 0]} castShadow>
        <capsuleGeometry args={[0.11, 0.16, 6, 12]} />
        <meshStandardMaterial color="#2C3E50" />
      </mesh>
      {/* zapatos */}
      <mesh position={[-0.16, 0.05, 0.05]} castShadow>
        <boxGeometry args={[0.24, 0.1, 0.32]} />
        <meshStandardMaterial color="#FFF8F0" />
      </mesh>
      <mesh position={[0.16, 0.05, 0.05]} castShadow>
        <boxGeometry args={[0.24, 0.1, 0.32]} />
        <meshStandardMaterial color="#FFF8F0" />
      </mesh>
      {/* cuerpo */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <capsuleGeometry args={[0.2, 0.34, 8, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* franja / detalle de camiseta */}
      <mesh position={[0, 0.62, 0.2]}>
        <planeGeometry args={[0.34, 0.16]} />
        <meshStandardMaterial color={acento} />
      </mesh>
      {/* brazos */}
      <mesh position={[-0.27, 0.58, 0]} rotation={[0, 0, 0.45]} castShadow>
        <capsuleGeometry args={[0.075, 0.28, 6, 10]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.27, 0.58, 0]} rotation={[0, 0, -0.45]} castShadow>
        <capsuleGeometry args={[0.075, 0.28, 6, 10]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* cabeza */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <sphereGeometry args={[0.28, 24, 20]} />
        <meshStandardMaterial color={cara} />
      </mesh>
      {/* pelo */}
      <mesh position={[0, 1.02, -0.02]} rotation={[0.12, 0, 0]} castShadow>
        <sphereGeometry args={[0.295, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
        <meshStandardMaterial color={pelo} />
      </mesh>
      {/* ojos */}
      <mesh position={[-0.1, 0.97, 0.25]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial color="#2B1B12" />
      </mesh>
      <mesh position={[0.1, 0.97, 0.25]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial color="#2B1B12" />
      </mesh>
      {/* brillos en los ojos */}
      <mesh position={[-0.085, 0.995, 0.288]}>
        <sphereGeometry args={[0.016, 8, 8]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0.115, 0.995, 0.288]}>
        <sphereGeometry args={[0.016, 8, 8]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      {/* sonrisa */}
      <mesh position={[0, 0.87, 0.255]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.07, 0.014, 6, 14, Math.PI]} />
        <meshStandardMaterial color="#8B3A2E" />
      </mesh>
    </group>
  )
}

function MunecoCheva({ pos, rot }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Float speed={1.6} floatIntensity={0.05} rotationIntensity={0.02}>
        <BaseMuneco color="#A50044" pelo="#2B1B12" acento="#004D98" cara="#FFD9B0" />
      </Float>
      {/* pecas */}
      <mesh position={[-0.13, 0.9, 0.26]}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshStandardMaterial color="#C6866A" />
      </mesh>
      <mesh position={[-0.07, 0.885, 0.268]}>
        <sphereGeometry args={[0.014, 8, 8]} />
        <meshStandardMaterial color="#C6866A" />
      </mesh>
      <mesh position={[0.13, 0.9, 0.26]}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshStandardMaterial color="#C6866A" />
      </mesh>
      {/* coleta */}
      <mesh position={[-0.26, 0.7, -0.02]} rotation={[0, 0, 0.2]}>
        <capsuleGeometry args={[0.09, 0.5, 6, 10]} />
        <meshStandardMaterial color="#2B1B12" />
      </mesh>
      <mesh position={[0.26, 0.7, -0.02]} rotation={[0, 0, -0.2]}>
        <capsuleGeometry args={[0.09, 0.5, 6, 10]} />
        <meshStandardMaterial color="#2B1B12" />
      </mesh>
    </group>
  )
}

function MunecoIvan({ pos, rot }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Float speed={1.6} floatIntensity={0.05} rotationIntensity={0.02}>
        <BaseMuneco color="#2B2D42" pelo="#111827" acento="#FF8FA3" cara="#FFDBB8" />
      </Float>
    </group>
  )
}

// ---------------------------------------------------------------------------
// Wow chars de fondo (los muñequitos de la oficina)
// ---------------------------------------------------------------------------
function WowFondo() {
  const posiciones = [
    [-4.6, 0, -3.4, 0.6],
    [4.4, 0, -3.9, -0.5],
    [-2.6, 0, -6.2, 0.2],
    [2.9, 0, -6.5, -0.3],
    [6.2, 0, -6.0, 0.4],
  ]
  return (
    <group>
      {posiciones.map(([x, y, z, r], i) => (
        <group key={i} position={[x, y, z]} rotation={[0, r, 0]}>
          <Float speed={1.2 + i * 0.25} floatIntensity={0.14} rotationIntensity={0.06}>
            <mesh position={[0, 0.3, 0]} castShadow>
              <boxGeometry args={[0.4, 0.55, 0.28]} />
              <meshStandardMaterial color="#FF69B4" />
            </mesh>
            <mesh position={[0, 0.72, 0]} castShadow>
              <boxGeometry args={[0.34, 0.32, 0.3]} />
              <meshStandardMaterial color="#FF69B4" />
            </mesh>
            <mesh position={[-0.08, 0.75, 0.16]}>
              <sphereGeometry args={[0.032, 8, 8]} />
              <meshStandardMaterial color="#111827" />
            </mesh>
            <mesh position={[0.08, 0.75, 0.16]}>
              <sphereGeometry args={[0.032, 8, 8]} />
              <meshStandardMaterial color="#111827" />
            </mesh>
            <mesh position={[-0.1, 0.04, 0]} castShadow>
              <boxGeometry args={[0.16, 0.2, 0.2]} />
              <meshStandardMaterial color="#FF69B4" />
            </mesh>
            <mesh position={[0.1, 0.04, 0]} castShadow>
              <boxGeometry args={[0.16, 0.2, 0.2]} />
              <meshStandardMaterial color="#FF69B4" />
            </mesh>
          </Float>
        </group>
      ))}
    </group>
  )
}

// ---------------------------------------------------------------------------
// Corazones del beso
// ---------------------------------------------------------------------------
function Corazones({ activo }) {
  const grupo = useRef()
  useFrame((s, d) => {
    if (!grupo.current) return
    grupo.current.children.forEach((c, i) => {
      c.position.y += d * (0.35 + i * 0.06)
      c.position.x += Math.sin(s.clock.elapsedTime * 1.4 + i) * d * 0.16
      if (c.position.y > 2.4) c.position.y = 0.5
      c.material.opacity = activo ? 0.9 : 0
    })
  })
  if (!activo) return null
  return (
    <group ref={grupo}>
      {[
        [0, 0.6, 0.6, '#FF4D7D', 0.16],
        [-0.28, 0.5, 0.5, '#FF8FA3', 0.12],
        [0.3, 0.55, 0.5, '#FF4D7D', 0.13],
      ].map(([x, y, z, c, s], i) => (
        <mesh key={i} position={[x, y, z]} scale={[s, s, s]}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshStandardMaterial color={c} transparent opacity={0.9} emissive={c} emissiveIntensity={0.4} />
        </mesh>
      ))}
    </group>
  )
}

// ---------------------------------------------------------------------------
// Escena 3D
// ---------------------------------------------------------------------------
function Escena3D({ indice, orbitando }) {
  const escena = ESCENAS[indice]
  const camara = useRef()
  const controles = useRef()
  const objetivo = useRef(new THREE.Vector3())
  const mirada = useRef(new THREE.Vector3())
  const size = useThree((s) => s.size)
  const camara3 = useThree((s) => s.camera)

  // celular en vertical: abrimos el FOV y alejamos la cámara para que quepa el arco
  const aspecto = size.width / Math.max(size.height, 1)
  const escala = aspecto < 0.9 ? 1.55 : aspecto < 1.3 ? 1.2 : 1

  useEffect(() => {
    camara3.fov = aspecto < 0.9 ? 56 : aspecto < 1.3 ? 48 : 42
    camara3.updateProjectionMatrix()
  }, [aspecto, camara3])

  useFrame((s, d) => {
    if (!camara.current) return
    objetivo.current.set(
      escena.camara.pos[0],
      escena.camara.pos[1],
      escena.camara.pos[2] * escala
    )
    mirada.current.set(...escena.camara.look)
    if (!orbitando.current) {
      camara.current.position.x = THREE.MathUtils.damp(camara.current.position.x, objetivo.current.x, 1.6, d)
      camara.current.position.y = THREE.MathUtils.damp(camara.current.position.y, objetivo.current.y, 1.6, d)
      camara.current.position.z = THREE.MathUtils.damp(camara.current.position.z, objetivo.current.z, 1.6, d)
    }
    if (controles.current) {
      controles.current.target.x = THREE.MathUtils.damp(controles.current.target.x, mirada.current.x, 1.6, d)
      controles.current.target.y = THREE.MathUtils.damp(controles.current.target.y, mirada.current.y, 1.6, d)
      controles.current.target.z = THREE.MathUtils.damp(controles.current.target.z, mirada.current.z, 1.6, d)
    }
  })

  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[4, 7, 5]} intensity={1.15} castShadow />
      <pointLight position={[-4, 2.6, 3]} intensity={0.7} color="#F5D67B" />
      <spotLight
        position={[0, 6, 4]}
        angle={0.7}
        penumbra={0.6}
        intensity={22}
        color="#FFF3D6"
        castShadow
      />

      <Oficina />
      <WowFondo />

      <group position={[0, 0, 1.9]}>
        <MunecoCheva pos={[escena.cheva.x, 0, escena.cheva.z]} rot={escena.cheva.rot} />
        <MunecoIvan pos={[escena.ivan.x, 0, escena.ivan.z]} rot={escena.ivan.rot} />
        <Corazones activo={!!escena.beso} />
      </group>

      {/* tarima de madera del escenario (delante del proscenio) */}
      <mesh position={[0, -0.02, 3.2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial color="#6B4A2F" roughness={0.85} />
      </mesh>

      <Proscenio />

      <ContactShadows position={[0, 0.01, 0.6]} opacity={0.42} scale={8} blur={2.2} far={3} />
      <Environment preset="city" />
      <OrbitControls
        ref={controles}
        makeDefault
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 2.6}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 1.5, 1.4]}
        onStart={() => (orbitando.current = true)}
        onEnd={() => (orbitando.current = false)}
      />
    </>
  )
}

// ---------------------------------------------------------------------------
// Telón fijo: overlay 2D siempre visible, nunca se mueve
// ---------------------------------------------------------------------------
function TelonFijo({ pantallaCompleta = false }) {
  return (
    <div
      className={`absolute inset-0 z-20 pointer-events-none overflow-hidden ${
        pantallaCompleta ? 'rounded-none' : 'rounded-[22px] sm:rounded-[28px]'
      }`}
    >
      {/* hornacina oscura de fondo */}
      <div className="telon-fondo" />

      {/* dintel superior (bajo el riel dorado) */}
      <div className="telon-dintel">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
          <path
            d="M0,0 H100 V42 Q91,66 82,42 Q73,66 64,42 Q55,66 46,42 Q37,66 28,42 Q19,66 10,42 Q5,54 0,42 Z"
            fill="#7C1830"
          />
        </svg>
        <div className="telon-dintel-pliegues" />
      </div>

      {/* riel dorado del dintel */}
      <div className="telon-riel" />

      {/* telón lateral izquierdo */}
      <div className="telon-lateral telon-izq telon-folds" />
      <div className="telon-cinta telon-cinta-izq" />

      {/* telón lateral derecho */}
      <div className="telon-lateral telon-der telon-folds" />
      <div className="telon-cinta telon-cinta-der" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
export default function TheaterCurtainScene() {
  const [indice, setIndice] = useState(0)
  const [pantallaCompleta, setPantallaCompleta] = useState(false)
  const [nativo, setNativo] = useState(false)
  const orbitando = useRef(false)
  const cajaRef = useRef(null)
  const escena = ESCENAS[indice]

  useEffect(() => {
    const t = setInterval(() => setIndice((i) => (i + 1) % ESCENAS.length), 9000)
    return () => clearInterval(t)
  }, [])

  // pantalla completa: usa la API nativa si existe; en iPhone no existe,
  // así que caemos a un "falso fullscreen" con CSS (position fixed).
  const alternarPantalla = async () => {
    const el = cajaRef.current
    if (!el) return
    const req = el.requestFullscreen || el.webkitRequestFullscreen

    if (!pantallaCompleta) {
      if (req) {
        try {
          await req.call(el)
          setNativo(true)
        } catch {
          setNativo(false) // API existe pero fue rechazada → falso fullscreen
        }
      } else {
        setNativo(false) // iPhone: sin API → falso fullscreen
      }
      setPantallaCompleta(true)
      document.documentElement.style.overflow = 'hidden'
    } else {
      try {
        const exit = document.exitFullscreen || document.webkitExitFullscreen
        if (document.fullscreenElement || document.webkitFullscreenElement) {
          await exit?.call(document)
        }
      } catch { /* ignorar */ }
      setNativo(false)
      setPantallaCompleta(false)
      document.documentElement.style.overflow = ''
    }
  }

  // si ella sale con ESC o gesto del sistema, sincronizamos el estado
  useEffect(() => {
    const sinc = () => {
      const activo = !!(document.fullscreenElement || document.webkitFullscreenElement)
      setPantallaCompleta(activo)
      setNativo(activo)
      document.documentElement.style.overflow = activo ? 'hidden' : ''
    }
    document.addEventListener('fullscreenchange', sinc)
    document.addEventListener('webkitfullscreenchange', sinc)
    return () => {
      document.removeEventListener('fullscreenchange', sinc)
      document.removeEventListener('webkitfullscreenchange', sinc)
      document.documentElement.style.overflow = ''
    }
  }, [])

  const IrA = ({ i, children }) => (
    <button
      onClick={() => setIndice(i)}
      className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition whitespace-nowrap ${
        indice === i
          ? 'bg-rosa text-white shadow-lg scale-105'
          : 'bg-white/85 text-tinta hover:bg-white'
      }`}
    >
      {children}
    </button>
  )

  return (
    <section id="theater" className="relative py-10 sm:py-14 px-3 sm:px-4 max-w-6xl mx-auto scroll-mt-24">
      <div className="text-center mb-5 sm:mb-6">
        <p className="font-hand text-2xl text-rosa">nuestra historia en 3D</p>
        <h2 className="font-display font-bold text-3xl sm:text-4xl">De strangers a amor</h2>
        <p className="font-ui text-tinta/60 mt-2 text-sm sm:text-base">
          Un telón, dos muñequitos y todos los capítulos de nosotros
        </p>
      </div>

      <div
        ref={cajaRef}
        className={`relative overflow-hidden border border-white/10 shadow-2xl bg-noche ${
          pantallaCompleta
            ? nativo
              ? 'rounded-none border-0'
              : 'fixed inset-0 z-[100] rounded-none border-0'
            : 'rounded-[22px] sm:rounded-[28px]'
        }`}
      >
        <div
          className={
            pantallaCompleta
              ? 'h-full w-full'
              : 'h-[460px] sm:h-[560px] lg:h-[600px]'
          }
        >
          <Canvas camera={{ position: [0, 1.9, 8.4], fov: 42 }} shadows dpr={[1, 1.75]}>
            <Escena3D indice={indice} orbitando={orbitando} />
          </Canvas>
        </div>

        {/* telón fijo: siempre visible, nunca se mueve */}
        <TelonFijo pantallaCompleta={pantallaCompleta} />

        {/* cartel de escena */}
        <div className="absolute top-20 sm:top-28 left-2 sm:left-3 z-30 flex flex-col gap-1.5">
          <span className="px-3 py-1 rounded-full bg-rosa text-white text-[10px] sm:text-[11px] font-bold w-fit shadow">
            {escena.etiqueta}
          </span>
          <span className="px-3 py-1 rounded-full bg-white/90 text-tinta text-[10px] sm:text-[11px] font-semibold w-fit shadow max-w-[70vw] truncate">
            {escena.lugar}
          </span>
        </div>

        {/* burbuja de diálogo */}
        <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-30 w-[88%] sm:w-[84%] max-w-md">
          <div className="bg-white rounded-2xl rounded-bl-md shadow-xl px-3 sm:px-4 py-2.5 sm:py-3 text-center">
            <div className="text-[10px] sm:text-[11px] font-bold text-rosa uppercase tracking-wide">{escena.dialogo.autor}</div>
            <div className="font-hand text-lg sm:text-xl text-tinta leading-tight mt-0.5">{escena.dialogo.texto}</div>
          </div>
        </div>

        {/* barra de capítulos */}
        <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-30 flex gap-1.5 sm:gap-2 bg-black/45 backdrop-blur rounded-full px-1.5 sm:px-2 py-1 sm:py-1.5 max-w-[96%] overflow-x-auto scrollbar-none">
          {ESCENAS.map((e, i) => (
            <IrA key={e.id} i={i}>
              <span className="sm:hidden">{e.etiqueta.replace('Capítulo ', '')}</span>
              <span className="hidden sm:inline">{e.titulo}</span>
            </IrA>
          ))}
        </div>

        {!pantallaCompleta && (
          <div className="absolute top-20 sm:top-28 right-2 sm:right-3 z-30 bg-white/85 rounded-full px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-[11px] font-semibold text-tinta shadow">
            arrastra para girar
          </div>
        )}

        {/* botón de pantalla completa (mismo botón para entrar y salir) */}
        <button
          onClick={alternarPantalla}
          aria-label={pantallaCompleta ? 'Salir de pantalla completa' : 'Ver en pantalla completa'}
          aria-pressed={pantallaCompleta}
          className={`absolute z-40 flex items-center gap-1.5 rounded-full font-bold shadow-xl transition active:scale-95 ${
            pantallaCompleta
              ? 'top-3 right-3 bg-white/95 text-tinta hover:bg-white px-4 py-2.5 text-sm'
              : 'top-3 right-3 bg-rosa text-white hover:bg-rosa/90 px-3 py-2 sm:px-3.5 sm:py-2 text-[11px] sm:text-xs'
          }`}
        >
          {pantallaCompleta ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
              salir
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
              <span className="hidden sm:inline">pantalla completa</span>
              <span className="sm:hidden">ampliar</span>
            </>
          )}
        </button>
      </div>

      <p className="text-center font-hand text-lg sm:text-xl text-tinta/60 mt-3 sm:mt-4">
        de la primera hora compartida hasta los besitos de hoy 💛
      </p>
    </section>
  )
}
