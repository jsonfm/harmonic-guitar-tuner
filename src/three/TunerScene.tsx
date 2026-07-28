import { Float, Line, RoundedBox, Sparkles } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Shape } from 'three'
import type { Group } from 'three'
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

interface StringPathProps {
  index: number
  active: boolean
  status: PitchStatus
  inputLevel: number
  intensity: number
  pegX: number
  pegY: number
}

const metalMaterial = {
  color: '#a49b8b',
  metalness: 0.96,
  roughness: 0.18,
} as const

function createHeadstockShape() {
  const shape = new Shape()
  shape.moveTo(-0.42, -1.78)
  shape.bezierCurveTo(-0.45, -1.08, -0.51, -0.46, -0.59, 0.18)
  shape.lineTo(-0.68, 1.23)
  shape.quadraticCurveTo(-0.7, 1.52, -0.48, 1.67)
  shape.quadraticCurveTo(-0.1, 1.89, 0.34, 1.74)
  shape.quadraticCurveTo(0.66, 1.65, 0.69, 1.38)
  shape.quadraticCurveTo(0.7, 1.26, 0.68, 1.14)
  shape.lineTo(0.59, 0.18)
  shape.bezierCurveTo(0.51, -0.46, 0.45, -1.08, 0.42, -1.78)
  shape.closePath()
  return shape
}

function StringPath({ index, active, status, inputLevel, intensity, pegX, pegY }: StringPathProps) {
  const stringGroup = useRef<Group>(null)
  const nutX = -0.25 + index * 0.1
  const tuned = status === 'in-tune'
  const activeColor = tuned ? '#d7ff78' : '#ffbd72'
  const points = useMemo(
    () =>
      [
        [nutX, -2.28, 0.34],
        [nutX, -1.58, 0.34],
        [nutX + (pegX - nutX) * 0.18, -1.18, 0.34],
        [pegX, pegY, 0.34],
      ] as [number, number, number][],
    [nutX, pegX, pegY],
  )

  useFrame(({ clock }) => {
    if (!stringGroup.current) return
    const energy = active ? Math.max(0.1, inputLevel) * intensity : 0
    const speed = tuned ? 6 : 15 + index
    stringGroup.current.position.x = Math.sin(clock.elapsedTime * speed) * energy * 0.006
    stringGroup.current.position.z = active ? 0.008 + energy * 0.01 : 0
  })

  return (
    <group ref={stringGroup}>
      <Line
        points={points}
        color={active ? activeColor : index < 3 ? '#9d8668' : '#aaa59a'}
        lineWidth={active ? 1.6 : 0.66 + (5 - index) * 0.1}
        transparent
        opacity={active ? 1 : 0.72}
      />
      <mesh position={[pegX, pegY, 0.352]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.06, 0.006, 8, 30]} />
        <meshStandardMaterial
          color={active ? activeColor : '#827865'}
          emissive={active ? activeColor : '#000000'}
          emissiveIntensity={active ? 0.8 : 0}
          metalness={0.88}
          roughness={0.25}
        />
      </mesh>
    </group>
  )
}

function TuningMachine({ x, y, side }: { x: number; y: number; side: -1 | 1 }) {
  return (
    <group position={[x, y, 0.04]}>
      <mesh position={[0, 0, 0.265]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.102, 0.102, 0.07, 32]} />
        <meshStandardMaterial color="#8b806e" metalness={0.95} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.335]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.047, 0.047, 0.15, 24]} />
        <meshPhysicalMaterial color="#c2ab82" metalness={0.96} roughness={0.14} clearcoat={0.5} />
      </mesh>
      <RoundedBox
        args={[0.19, 0.24, 0.12]}
        radius={0.05}
        smoothness={3}
        position={[side * 0.085, 0, -0.1]}
      >
        <meshStandardMaterial color="#51483e" metalness={0.88} roughness={0.25} />
      </RoundedBox>
      <mesh position={[side * 0.245, 0, -0.1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.032, 0.032, 0.28, 14]} />
        <meshStandardMaterial {...metalMaterial} />
      </mesh>
      <RoundedBox
        args={[0.15, 0.28, 0.1]}
        radius={0.055}
        smoothness={4}
        position={[side * 0.415, 0, -0.1]}
        rotation={[0, 0, side * 0.07]}
      >
        <meshPhysicalMaterial color="#6d5741" metalness={0.82} roughness={0.22} clearcoat={0.7} />
      </RoundedBox>
    </group>
  )
}

function Instrument(props: SceneProps) {
  const group = useRef<Group>(null)
  const headstockShape = useMemo(createHeadstockShape, [])
  const pegPositions = useMemo(
    () => [
      { side: -1 as const, x: -0.55, y: -0.47 },
      { side: -1 as const, x: -0.59, y: 0.35 },
      { side: -1 as const, x: -0.63, y: 1.17 },
      { side: 1 as const, x: 0.64, y: 1.17 },
      { side: 1 as const, x: 0.59, y: 0.35 },
      { side: 1 as const, x: 0.55, y: -0.47 },
    ],
    [],
  )
  const extrudeSettings = useMemo(
    () => ({
      depth: 0.25,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 1,
      bevelSize: 0.055,
      bevelThickness: 0.055,
    }),
    [],
  )
  const veneerSettings = useMemo(
    () => ({
      depth: 0.035,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.025,
      bevelThickness: 0.025,
    }),
    [],
  )

  useFrame(({ clock, pointer }) => {
    if (!group.current) return
    const lean = Math.max(-1, Math.min(1, props.cents / 50))
    group.current.rotation.z = -0.055 + lean * 0.02
    group.current.rotation.y = -0.16 + pointer.x * 0.035 * props.intensity
    group.current.rotation.x = -0.04 + pointer.y * 0.014 * props.intensity
    group.current.position.y = Math.sin(clock.elapsedTime * 0.65) * 0.012 * props.intensity
  })

  return (
    <Float speed={0.5} rotationIntensity={0.012} floatIntensity={0.05}>
      <group ref={group} rotation={[-0.04, -0.16, -0.055]} position={[0.24, 0.02, 0]} scale={0.91}>
        <mesh position={[0, 0, -0.2]} scale={[1.025, 1.015, 1]}>
          <extrudeGeometry args={[headstockShape, extrudeSettings]} />
          <meshPhysicalMaterial
            color="#20130e"
            roughness={0.31}
            metalness={0.03}
            clearcoat={0.65}
            clearcoatRoughness={0.2}
          />
        </mesh>

        <mesh position={[0, 0, 0.09]} scale={[0.975, 0.982, 1]}>
          <extrudeGeometry args={[headstockShape, veneerSettings]} />
          <meshPhysicalMaterial
            color="#a7622f"
            roughness={0.24}
            metalness={0.08}
            clearcoat={0.88}
            clearcoatRoughness={0.13}
          />
        </mesh>

        <mesh position={[0, -0.01, 0.17]} scale={[0.935, 0.955, 1]}>
          <extrudeGeometry args={[headstockShape, veneerSettings]} />
          <meshPhysicalMaterial
            color="#4b281a"
            roughness={0.29}
            metalness={0.03}
            clearcoat={0.88}
            clearcoatRoughness={0.16}
          />
        </mesh>

        {[-0.31, -0.18, -0.03, 0.13, 0.29].map((x, index) => (
          <Line
            key={x}
            points={[
              [x, -1.46, 0.26],
              [x + (index % 2 === 0 ? 0.025 : -0.02), 0.1, 0.26],
              [x + (index % 2 === 0 ? -0.012 : 0.03), 1.43, 0.26],
            ]}
            color={index % 2 === 0 ? '#27140f' : '#7a4027'}
            lineWidth={0.35}
            transparent
            opacity={0.34}
          />
        ))}

        <RoundedBox args={[0.86, 0.78, 0.27]} radius={0.08} position={[0, -2.0, -0.01]}>
          <meshPhysicalMaterial color="#171311" roughness={0.43} metalness={0.04} clearcoat={0.4} />
        </RoundedBox>
        {[-2.17, -2.0, -1.83].map((y) => (
          <mesh key={y} position={[0, y, 0.17]}>
            <boxGeometry args={[0.86, 0.018, 0.025]} />
            <meshStandardMaterial color="#817b70" metalness={0.9} roughness={0.28} />
          </mesh>
        ))}
        <RoundedBox args={[0.74, 0.105, 0.09]} radius={0.022} position={[0, -1.59, 0.28]}>
          <meshPhysicalMaterial color="#dfd3b6" roughness={0.28} clearcoat={0.45} />
        </RoundedBox>

        {pegPositions.map((position, index) => (
          <TuningMachine key={index} x={position.x} y={position.y} side={position.side} />
        ))}

        {props.strings.map((guitarString, index) => (
          <StringPath
            key={guitarString.id}
            index={index}
            active={guitarString.id === props.activeStringId}
            status={props.status}
            inputLevel={props.inputLevel}
            intensity={props.intensity}
            pegX={pegPositions[index].x}
            pegY={pegPositions[index].y}
          />
        ))}
      </group>
    </Float>
  )
}

export default function TunerScene(props: SceneProps) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.05, 7.1], fov: 32 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      frameloop={document.hidden ? 'demand' : 'always'}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[3.5, 4.5, 5]} intensity={3.1} color="#ffe1ba" />
      <directionalLight position={[-2.5, 1, 3]} intensity={0.9} color="#a64a28" />
      <pointLight position={[-3, -2, 2]} intensity={3.8} distance={7} color="#d16b35" />
      <pointLight position={[2.3, 2.2, 2]} intensity={2.8} distance={6} color="#d0ff72" />
      <Instrument {...props} />
      {!props.reducedEffects && (
        <Sparkles
          count={18}
          scale={[3.8, 5, 2]}
          size={0.75}
          speed={0.1 + props.inputLevel * 0.4}
          opacity={0.13}
          color="#f3c786"
        />
      )}
    </Canvas>
  )
}
