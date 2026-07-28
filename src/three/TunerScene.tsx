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
  color: '#b9b29f',
  metalness: 0.94,
  roughness: 0.2,
} as const

function createHeadstockShape() {
  const shape = new Shape()
  shape.moveTo(-0.48, -1.76)
  shape.bezierCurveTo(-0.5, -1.1, -0.56, -0.55, -0.67, 0.02)
  shape.bezierCurveTo(-0.78, 0.58, -0.78, 1.12, -0.6, 1.56)
  shape.bezierCurveTo(-0.5, 1.8, -0.29, 1.93, -0.12, 1.78)
  shape.quadraticCurveTo(0, 1.67, 0.12, 1.78)
  shape.bezierCurveTo(0.29, 1.93, 0.5, 1.8, 0.6, 1.56)
  shape.bezierCurveTo(0.78, 1.12, 0.78, 0.58, 0.67, 0.02)
  shape.bezierCurveTo(0.56, -0.55, 0.5, -1.1, 0.48, -1.76)
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
        [nutX, -2.28, 0.36],
        [nutX, -1.58, 0.36],
        [nutX + (pegX - nutX) * 0.32, pegY - 0.42, 0.36],
        [pegX, pegY, 0.36],
      ] as [number, number, number][],
    [nutX, pegX, pegY],
  )

  useFrame(({ clock }) => {
    if (!stringGroup.current) return
    const energy = active ? Math.max(0.1, inputLevel) * intensity : 0
    const speed = tuned ? 6 : 15 + index
    stringGroup.current.position.x = Math.sin(clock.elapsedTime * speed) * energy * 0.008
    stringGroup.current.position.z = active ? 0.008 + energy * 0.01 : 0
  })

  return (
    <group ref={stringGroup}>
      <Line
        points={points}
        color={active ? activeColor : index < 3 ? '#9b8061' : '#a7a094'}
        lineWidth={active ? 1.85 : 0.8 + (5 - index) * 0.12}
        transparent
        opacity={active ? 1 : 0.72}
      />
      <mesh position={[pegX, pegY, 0.365]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.09, 0.009, 8, 30]} />
        <meshStandardMaterial
          color={active ? activeColor : '#827865'}
          emissive={active ? activeColor : '#000000'}
          emissiveIntensity={active ? 0.9 : 0}
          metalness={0.85}
          roughness={0.28}
        />
      </mesh>
    </group>
  )
}

function TuningMachine({ x, y, side }: { x: number; y: number; side: -1 | 1 }) {
  return (
    <group position={[x, y, 0.04]}>
      <mesh position={[0, 0, 0.25]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.135, 0.135, 0.115, 32]} />
        <meshStandardMaterial {...metalMaterial} />
      </mesh>
      <mesh position={[0, 0, 0.326]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.062, 0.062, 0.16, 24]} />
        <meshStandardMaterial color="#d7d0bd" metalness={0.96} roughness={0.16} />
      </mesh>
      <mesh position={[side * 0.075, 0, -0.11]}>
        <sphereGeometry args={[0.15, 20, 14]} />
        <meshStandardMaterial color="#625f58" metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh position={[side * 0.27, 0, -0.11]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.32, 14]} />
        <meshStandardMaterial {...metalMaterial} />
      </mesh>
      <RoundedBox
        args={[0.19, 0.34, 0.11]}
        radius={0.07}
        smoothness={4}
        position={[side * 0.47, 0, -0.11]}
        rotation={[0, 0, side * 0.07]}
      >
        <meshPhysicalMaterial color="#d2cbb9" metalness={0.92} roughness={0.18} clearcoat={0.5} />
      </RoundedBox>
      <mesh position={[side * 0.055, 0.095, 0.317]}>
        <sphereGeometry args={[0.012, 10, 8]} />
        <meshStandardMaterial color="#45443f" metalness={0.9} />
      </mesh>
    </group>
  )
}

function Instrument(props: SceneProps) {
  const group = useRef<Group>(null)
  const headstockShape = useMemo(createHeadstockShape, [])
  const pegPositions = useMemo(
    () =>
      Array.from({ length: 6 }, (_, index) => {
        const side = (index % 2 === 0 ? -1 : 1) as -1 | 1
        return {
          side,
          x: side * (0.55 + Math.floor(index / 2) * 0.035),
          y: 1.23 - Math.floor(index / 2) * 0.8,
        }
      }),
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
    group.current.rotation.z = -0.075 + lean * 0.025
    group.current.rotation.y = -0.12 + pointer.x * 0.045 * props.intensity
    group.current.rotation.x = -0.045 + pointer.y * 0.018 * props.intensity
    group.current.position.y = Math.sin(clock.elapsedTime * 0.65) * 0.014 * props.intensity
  })

  return (
    <Float speed={0.55} rotationIntensity={0.015} floatIntensity={0.06}>
      <group ref={group} rotation={[-0.045, -0.12, -0.075]} position={[0.25, 0.05, 0]} scale={0.92}>
        <mesh position={[0, 0, -0.18]}>
          <extrudeGeometry args={[headstockShape, extrudeSettings]} />
          <meshPhysicalMaterial
            color="#24140f"
            roughness={0.34}
            metalness={0.03}
            clearcoat={0.48}
            clearcoatRoughness={0.25}
          />
        </mesh>

        <mesh position={[0, 0, 0.11]} scale={[0.94, 0.96, 1]}>
          <extrudeGeometry args={[headstockShape, veneerSettings]} />
          <meshPhysicalMaterial
            color="#6f321d"
            roughness={0.27}
            metalness={0.02}
            clearcoat={0.92}
            clearcoatRoughness={0.16}
          />
        </mesh>

        <mesh position={[0, -0.02, 0.188]} scale={[0.87, 0.94, 1]}>
          <extrudeGeometry args={[headstockShape, veneerSettings]} />
          <meshPhysicalMaterial
            color="#3b1d15"
            roughness={0.36}
            metalness={0.04}
            clearcoat={0.72}
            clearcoatRoughness={0.2}
          />
        </mesh>

        <RoundedBox args={[0.86, 0.84, 0.055]} radius={0.16} position={[0, -0.19, 0.288]}>
          <meshPhysicalMaterial color="#1c1815" metalness={0.5} roughness={0.24} clearcoat={0.6} />
        </RoundedBox>

        <mesh position={[0, 0.68, 0.33]}>
          <ringGeometry args={[0.115, 0.137, 48]} />
          <meshStandardMaterial
            color={props.status === 'in-tune' ? '#d8ff7c' : '#d39a55'}
            emissive={props.status === 'in-tune' ? '#85bd27' : '#552713'}
            emissiveIntensity={props.status === 'in-tune' ? 1.5 : 0.5}
            metalness={0.78}
            roughness={0.22}
          />
        </mesh>
        <mesh position={[0, 0.68, 0.334]}>
          <circleGeometry args={[0.055, 32]} />
          <meshStandardMaterial color="#0f1010" metalness={0.55} roughness={0.3} />
        </mesh>
        {[-0.038, 0, 0.038].map((x, index) => (
          <mesh key={x} position={[x, 0.68, 0.344]}>
            <boxGeometry args={[index === 1 ? 0.009 : 0.006, index === 1 ? 0.082 : 0.048, 0.008]} />
            <meshStandardMaterial color={index === 1 ? '#efae62' : '#77624b'} metalness={0.7} />
          </mesh>
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

        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.39, -0.12, 0.31]}>
            <boxGeometry args={[0.015, 2.45, 0.025]} />
            <meshStandardMaterial color="#a65c2d" emissive="#3e160b" emissiveIntensity={0.3} />
          </mesh>
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
      <ambientLight intensity={0.42} />
      <directionalLight position={[3.5, 4.5, 5]} intensity={2.6} color="#ffe0b8" />
      <directionalLight position={[-2.5, 1, 3]} intensity={1.2} color="#a64a28" />
      <pointLight position={[-3, -2, 2]} intensity={4.8} distance={7} color="#d16b35" />
      <pointLight position={[2.3, 2.2, 2]} intensity={3.5} distance={6} color="#d0ff72" />
      <Instrument {...props} />
      {!props.reducedEffects && (
        <Sparkles
          count={22}
          scale={[3.8, 5, 2]}
          size={0.8}
          speed={0.12 + props.inputLevel * 0.45}
          opacity={0.16}
          color="#f3c786"
        />
      )}
    </Canvas>
  )
}
