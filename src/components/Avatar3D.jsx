import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float, Text, Environment, ContactShadows } from '@react-three/drei'
import { useRef, useState } from 'react'
import * as THREE from 'three'
import { GUSTOS_CHEVA } from '../data/contenido'

function ChevaAvatar({ barcaMode }) {
  const ref = useRef()
  useFrame((_, d) => { if (ref.current) ref.current.rotation.y += d * 0.35 })
  const camiseta = barcaMode ? '#A50044' : '#F6E8A6'
  const secondary = barcaMode ? '#004D98' : '#D32F2F'
  return (
    <group ref={ref}>
      {/* cuerpo */}
      <mesh position={[0, 0.25, 0]}><capsuleGeometry args={[0.42, 1.05, 12, 24]} /><meshStandardMaterial color={camiseta} /></mesh>
      {/* franja barça / U */}
      <mesh position={[0, 0.4, 0.43]}><planeGeometry args={[0.82, 0.45]} /><meshStandardMaterial color={secondary} transparent opacity={0.92} /></mesh>
      <mesh position={[0, -0.05, 0.44]}><planeGeometry args={[0.82, 0.12]} /><meshStandardMaterial color="#FFF8F0" /></mesh>
      {/* cabeza */}
      <mesh position={[0, 1.28, 0]}><sphereGeometry args={[0.38, 24, 24]} /><meshStandardMaterial color="#FFD9B0" /></mesh>
      {/* pelo */}
      <mesh position={[0, 1.45, -0.05]}><sphereGeometry args={[0.42, 24, 16, 0, Math.PI*2, 0, Math.PI*0.62]} /><meshStandardMaterial color="#2B1B12" /></mesh>
      {/* pecas */}
      <mesh position={[0.11, 1.24, 0.31]}><sphereGeometry args={[0.02, 8, 8]} /><meshStandardMaterial color="#C6866A" /></mesh>
      <mesh position={[0.16, 1.21, 0.29]}><sphereGeometry args={[0.015, 8, 8]} /><meshStandardMaterial color="#C6866A" /></mesh>
      <mesh position={[-0.09, 1.23, 0.31]}><sphereGeometry args={[0.018, 8, 8]} /><meshStandardMaterial color="#C6866A" /></mesh>
      {/* ojos */}
      <mesh position={[0.14, 1.33, 0.32]}><sphereGeometry args={[0.045, 10, 10]} /><meshStandardMaterial color="#4A2C12" /></mesh>
      <mesh position={[-0.14, 1.33, 0.32]}><sphereGeometry args={[0.045, 10, 10]} /><meshStandardMaterial color="#4A2C12" /></mesh>
      {/* sonrisa */}
      <mesh position={[0, 1.18, 0.32]} rotation={[0,0,0]}><torusGeometry args={[0.07, 0.01, 6, 12, Math.PI]} /><meshStandardMaterial color="#8B3A2E" /></mesh>
      {/* pantalón suelto */}
      <mesh position={[0, -0.68, 0]}><capsuleGeometry args={[0.46, 0.9, 10, 16]} /><meshStandardMaterial color="#6B7280" /></mesh>
      {/* zapatillas */}
      <mesh position={[-0.18, -1.25, 0.08]}><boxGeometry args={[0.22, 0.12, 0.32]} /><meshStandardMaterial color="#FFF8F0" /></mesh>
      <mesh position={[0.18, -1.25, 0.08]}><boxGeometry args={[0.22, 0.12, 0.32]} /><meshStandardMaterial color="#FFF8F0" /></mesh>
      {/* balón al lado */}
      <mesh position={[0.75, -0.6, 0]}><sphereGeometry args={[0.22, 16, 16]} /><meshStandardMaterial color="white" /><mesh position={[0,0,0.12]}><circleGeometry args={[0.08,5]} /><meshStandardMaterial color="black" /></mesh></mesh>
    </group>
  )
}

function IvanAvatar() {
  const ref = useRef()
  useFrame((_, d) => { if (ref.current) ref.current.rotation.y -= d * 0.28 })
  return (
    <group ref={ref} position={[0,0,0]}>
      <mesh position={[0,0.25,0]}><capsuleGeometry args={[0.44, 1.06, 12, 24]} /><meshStandardMaterial color="#2B2D42" /></mesh>
      <mesh position={[0,0.45,0.43]}><planeGeometry args={[0.86,0.5]} /><meshStandardMaterial color="#FF8FA3" /></mesh>
      <mesh position={[0,1.28,0]}><sphereGeometry args={[0.38,24,24]} /><meshStandardMaterial color="#FFDBB8" /></mesh>
      <mesh position={[0,1.5,-0.02]}><sphereGeometry args={[0.4,16,12,0,Math.PI*2,0,Math.PI*0.55]} /><meshStandardMaterial color="#111827" /></mesh>
      <mesh position={[0.14,1.33,0.32]}><sphereGeometry args={[0.042,10,10]} /><meshStandardMaterial color="#2B1B12" /></mesh>
      <mesh position={[-0.14,1.33,0.32]}><sphereGeometry args={[0.042,10,10]} /><meshStandardMaterial color="#2B1B12" /></mesh>
      <mesh position={[0,-0.68,0]}><capsuleGeometry args={[0.45,0.9,10,16]} /><meshStandardMaterial color="#1F2937" /></mesh>
      <Text position={[0,0.45,0.46]} fontSize={0.12} color="white" anchorX="center" anchorY="middle">TE QUIERO CHEVA</Text>
    </group>
  )
}

function OrbitIcons() {
  const items = GUSTOS_CHEVA.slice(0, 8)
  return (
    <group>
      {items.map((g, i) => {
        const angle = (i / items.length) * Math.PI * 2
        const r = 1.65
        const x = Math.cos(angle) * r
        const z = Math.sin(angle) * r
        return (
          <Float key={g.id} speed={2} rotationIntensity={0.2} floatIntensity={0.6} position={[x, 0.35 + Math.sin(i)*0.2, z]}>
            <mesh>
              <sphereGeometry args={[0.18, 12, 12]} />
              <meshStandardMaterial color={g.color} emissive={g.color} emissiveIntensity={0.15} />
            </mesh>
            <Text position={[0, 0.34, 0]} fontSize={0.14} anchorX="center" color="#2B2D42">{g.emoji}</Text>
            <Text position={[0, -0.28, 0]} fontSize={0.06} anchorX="center" color="#2B2D42" maxWidth={1.2}>{g.label}</Text>
          </Float>
        )
      })}
    </group>
  )
}

export default function Avatar3D() {
  const [barca, setBarca] = useState(true)
  const [active, setActive] = useState('cheva')
  return (
    <section id="avatars" className="relative py-12 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-6">
        <p className="font-hand text-2xl text-rosa">nosotros en 3D</p>
        <h2 className="font-display font-bold text-4xl">Cheva & Iván</h2>
        <p className="font-ui text-tinta/60 mt-2">Gira, haz zoom, arrastra • Toca los botones para cambiar camiseta • Los iconos flotando son sus gustos</p>
      </div>

      <div className="grid lg:grid-cols-[1.35fr_0.85fr] gap-6">
        <div className="bg-noche rounded-[28px] overflow-hidden border border-white/10 shadow-xl relative">
          <div className="absolute top-3 left-3 z-10 flex gap-2">
            <button onClick={()=>setActive('cheva')} className={`px-4 py-2 rounded-full text-sm font-bold ${active==='cheva' ? 'bg-rosa text-white' : 'bg-white/90'}`}>Cheva 💛</button>
            <button onClick={()=>setActive('ivan')} className={`px-4 py-2 rounded-full text-sm font-bold ${active==='ivan' ? 'bg-rosa text-white' : 'bg-white/90'}`}>Iván</button>
            {active==='cheva' && <button onClick={()=>setBarca(v=>!v)} className="px-4 py-2 rounded-full text-sm font-bold bg-white border">{barca ? '🔵🔴 Barça' : '🟡🔴 La U'}</button>}
          </div>
          <div className="absolute top-3 right-3 z-10 bg-white/90 rounded-full px-3 py-1.5 text-xs font-semibold">arrastra para girar • scroll para zoom</div>

          <div className="h-[520px]">
            <Canvas camera={{ position: [0, 1.2, 3.6], fov: 45 }} shadows>
              <ambientLight intensity={0.7} />
              <directionalLight position={[4, 6, 3]} intensity={1.1} castShadow />
              <pointLight position={[-3, 2, -2]} intensity={0.6} color="#F5D67B" />
              {active==='cheva' ? (
                <>
                  <ChevaAvatar barcaMode={barca} />
                  <OrbitIcons />
                </>
              ) : <IvanAvatar />}
              <ContactShadows position={[0, -1.45, 0]} opacity={0.45} scale={6} blur={2.4} far={4} />
              <Environment preset="city" />
              <OrbitControls enablePan={false} minDistance={1.8} maxDistance={6} target={[0,0.2,0]} />
            </Canvas>
          </div>

          <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/50 to-transparent p-4 flex justify-between items-end text-white">
            <div>
              <div className="font-display font-bold">{active==='cheva' ? 'Evelyn "Cheva"' : 'Iván'}</div>
              <div className="text-xs opacity-80 font-ui">{active==='cheva' ? 'Pecas • ojitos • sonrisa • estilo único' : 'Tu chico que te quiere y está para ti'}</div>
            </div>
            <div className="text-xs opacity-70">modelo detallado cuerpo completo • gira 360°</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-[24px] border border-rosa-claro p-5 shadow-sm">
            <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2">Lo que ama Cheva <span className="text-rosa">♡</span></h3>
            <div className="grid grid-cols-2 gap-2">
              {GUSTOS_CHEVA.map(g=>(
                <div key={g.id} className="rounded-2xl border border-rosa-claro/60 bg-crema px-3 py-2.5 flex gap-2 items-center">
                  <span className="w-9 h-9 rounded-full grid place-items-center text-lg" style={{ background: g.color + '22', border: `1px solid ${g.color}40` }}>{g.emoji}</span>
                  <div className="leading-tight">
                    <div className="text-sm font-semibold">{g.label}</div>
                    <div className="text-[11px] text-tinta/60">{g.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-tinta/50 mt-3 font-hand text-center">Todo esto vive en ella — y yo lo amo todo</p>
          </div>
          <div className="bg-gradient-to-br from-tinta to-[#2a2e55] text-white rounded-[24px] p-5">
            <div className="font-display font-bold">Mini historia 3D</div>
            <p className="text-sm opacity-80 mt-1 leading-relaxed">Cheva con su camiseta intercambiable Barça/La U, pantalones sueltos, balón cerquita y sus canciones girando alrededor. Iván a su lado, con su corazón en la camiseta. Dos avatares que giran juntos, como nosotros.</p>
            <div className="mt-3 flex gap-2 text-xs">
              <span className="px-2 py-1 bg-white/15 rounded-full">⚽ fútbol juntos</span>
              <span className="px-2 py-1 bg-white/15 rounded-full">⛪ fe que los une</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
