"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Float, Environment, MeshDistortMaterial } from "@react-three/drei"
import * as THREE from "three"

function Particles({ count = 500 }) {
  const mesh = useRef<THREE.Points>(null)
  const { viewport } = useThree()

  const [positions, sizes] = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * viewport.width * 2
      positions[i * 3 + 1] = (Math.random() - 0.5) * viewport.height * 2
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10
      sizes[i] = Math.random() * 2 + 0.5
    }
    
    return [positions, sizes]
  }, [count, viewport])

  useFrame((state) => {
    if (!mesh.current) return
    mesh.current.rotation.y = state.clock.elapsedTime * 0.02
    mesh.current.rotation.x = state.clock.elapsedTime * 0.01
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#B89E84"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

function FloatingPanel({ position, rotation, scale }: { 
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number 
}) {
  const mesh = useRef<THREE.Mesh>(null)
  const { pointer } = useThree()

  useFrame((state) => {
    if (!mesh.current) return
    mesh.current.rotation.x = THREE.MathUtils.lerp(
      mesh.current.rotation.x,
      rotation[0] + pointer.y * 0.1,
      0.05
    )
    mesh.current.rotation.y = THREE.MathUtils.lerp(
      mesh.current.rotation.y,
      rotation[1] + pointer.x * 0.1,
      0.05
    )
    mesh.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1
  })

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={mesh} position={position} scale={scale}>
        <planeGeometry args={[1, 1.4]} />
        <MeshDistortMaterial
          color="#2A2622"
          transparent
          opacity={0.8}
          distort={0.1}
          speed={2}
        />
      </mesh>
    </Float>
  )
}

function Scene() {
  const { pointer } = useThree()
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      pointer.x * 0.15,
      0.05
    )
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      pointer.y * 0.1,
      0.05
    )
  })

  return (
    <group ref={groupRef}>
      <Particles count={300} />
      <FloatingPanel position={[-2, 0.5, -2]} rotation={[0.1, 0.2, 0]} scale={1.2} />
      <FloatingPanel position={[2, -0.3, -3]} rotation={[-0.1, -0.2, 0]} scale={0.9} />
      <FloatingPanel position={[0, 0, -4]} rotation={[0, 0, 0]} scale={1.5} />
      <FloatingPanel position={[-1.5, -0.8, -2.5]} rotation={[0.05, 0.1, 0]} scale={0.7} />
      <FloatingPanel position={[1.8, 0.8, -3.5]} rotation={[-0.05, -0.1, 0]} scale={0.8} />
      
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#B89E84" />
      <pointLight position={[-5, -5, 5]} intensity={0.3} color="#F5F1EA" />
    </group>
  )
}

export function HeroScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene />
        <Environment preset="night" />
      </Canvas>
    </div>
  )
}
