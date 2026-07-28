import { Float, RoundedBox, Sparkles } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group, Mesh } from 'three'
import type { GuitarString, PitchStatus } from '../domain/tunerTypes'

interface SceneProps {
  strings: GuitarString[]
  activeStringId: number
  cents: number
  status: PitchStatus
  inputLevel: number
  intensity: number
  reducedEffects: boolean
}

function AnimatedString({
  index,
  active,
  status,
  inputLevel,
  intensity,
}: {
  index: number
  active: boolean
  status: PitchStatus
  inputLevel: number
  intensity: number
}) {
  const string = useRef<Mesh>(null)
  const baseX = -0.38 + index * 0.152

  useFrame(({ clock }) => {
    if (!string.current) return
    const tuned = status === 'in-tune'
    const energy = active ? Math.max(0.1, inputLevel) * intensity : 0.015
    const frequency = tuned ? 5 : 13 + index
    string.current.position.x =
      baseX + Math.sin(clock.elapsedTime * frequency) * energy * (tuned ? 0.006 : 0.018)
    string.current.scale.x = 1 + energy * 0.25
  })

  return (
    <mesh ref={string} position={[baseX, 0.08, 0.2]}>
      <cylinderGeometry args={[0.007 + index * 0.0012, 0.007 + index * 0.0012, 4.9, 10]} />
      <meshStandardMaterial
        color={active ? (status === 'in-tune' ? '#d2ff72' : '#f1b86a') : '#a29b8f'}
        emissive={active ? (status === 'in-tune' ? '#83bf25' : '#a4521e') : '#171410'}
        emissiveIntensity={active ? 1.7 : 0.12}
        metalness={0.9}
        roughness={0.2}
      />
    </mesh>
  )
}

function Instrument(props: SceneProps) {
  const group = useRef<Group>(null)
  const pegPositions = useMemo(
    () =>
      Array.from({ length: 6 }, (_, index) => ({
        x: index % 2 === 0 ? -0.63 : 0.63,
        y: 1.72 - Math.floor(index / 2) * 0.78,
      })),
    [],
  )

  useFrame(({ clock, pointer }) => {
    if (!group.current) return
    const lean = Math.max(-1, Math.min(1, props.cents / 50))
    group.current.rotation.z = -0.08 + lean * 0.035
    group.current.rotation.y = 0.15 + pointer.x * 0.04 * props.intensity
    group.current.position.y = Math.sin(clock.elapsedTime * 0.65) * 0.018 * props.intensity
  })

  return (
    <Float speed={0.7} rotationIntensity={0.03} floatIntensity={0.08}>
      <group ref={group} rotation={[-0.03, 0.15, -0.08]} position={[0.2, -0.1, 0]}>
        <RoundedBox args={[1.28, 3.42, 0.32]} radius={0.22} smoothness={5} position={[0, 0.33, 0]}>
          <meshPhysicalMaterial
            color="#482518"
            roughness={0.3}
            metalness={0.08}
            clearcoat={0.65}
            clearcoatRoughness={0.22}
          />
        </RoundedBox>
        <RoundedBox args={[0.98, 0.5, 0.34]} radius={0.12} position={[0, -1.53, -0.01]}>
          <meshStandardMaterial color="#201713" roughness={0.48} metalness={0.15} />
        </RoundedBox>
        <mesh position={[0, -1.36, 0.205]}>
          <boxGeometry args={[0.88, 0.1, 0.07]} />
          <meshStandardMaterial color="#ded4ba" roughness={0.35} metalness={0.4} />
        </mesh>
        {props.strings.map((guitarString, index) => (
          <AnimatedString
            key={guitarString.id}
            index={index}
            active={guitarString.id === props.activeStringId}
            status={props.status}
            inputLevel={props.inputLevel}
            intensity={props.intensity}
          />
        ))}
        {pegPositions.map((position, index) => (
          <group key={index} position={[position.x, position.y, 0.02]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.15, 0.15, 0.23, 18]} />
              <meshStandardMaterial color="#8d887c" metalness={0.92} roughness={0.24} />
            </mesh>
            <mesh position={[position.x < 0 ? -0.14 : 0.14, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <boxGeometry args={[0.25, 0.09, 0.13]} />
              <meshStandardMaterial color="#c1baaa" metalness={0.94} roughness={0.2} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 0.65, 0.19]}>
          <ringGeometry args={[0.17, 0.2, 32]} />
          <meshStandardMaterial
            color={props.status === 'in-tune' ? '#d2ff72' : '#d39a55'}
            emissive={props.status === 'in-tune' ? '#81bd20' : '#6e3118'}
            emissiveIntensity={1.2}
            metalness={0.5}
          />
        </mesh>
      </group>
    </Float>
  )
}

export default function TunerScene(props: SceneProps) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.1, 5.5], fov: 37 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      frameloop={document.hidden ? 'demand' : 'always'}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 5]} intensity={2.4} color="#ffd5a1" />
      <pointLight position={[-3, -2, 2]} intensity={7} distance={7} color="#a84024" />
      <pointLight position={[2, 2, -1]} intensity={4} distance={6} color="#d0ff72" />
      <Instrument {...props} />
      {!props.reducedEffects && (
        <Sparkles
          count={32}
          scale={[3.8, 5, 2]}
          size={1.1}
          speed={0.18 + props.inputLevel * 0.6}
          opacity={0.22}
          color="#f3c786"
        />
      )}
    </Canvas>
  )
}
