import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type Pointer = { x: number; y: number };

const Starfield = ({ count = 2800 }: { count?: number }) => {
  const ref = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const color = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const r = 9 + Math.random() * 32;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const t = Math.random();
      if (t > 0.86) color.setHSL(0.7, 0.75, 0.82);
      else if (t > 0.68) color.setHSL(0.58, 0.7, 0.82);
      else color.setHSL(0.6, 0.12, 0.96);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, [count]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.012;
    ref.current.rotation.x += delta * 0.004;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.055}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const Planet = () => {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (core.current) core.current.rotation.y += 0.0016;
    if (group.current) {
      const scroll = window.scrollY || 0;
      group.current.position.y = 0.6 - scroll * 0.0018;
      group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.12) * 0.03;
    }
  });

  return (
    <group ref={group} position={[2.9, 0.6, -1.8]}>
      {/* Atmosphere halo */}
      <mesh scale={1.4}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color="#6d6cff" transparent opacity={0.13} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Core */}
      <mesh ref={core}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial color="#3b2f78" emissive="#241d4a" emissiveIntensity={0.45} roughness={0.72} metalness={0.15} />
      </mesh>
      {/* Ring */}
      <mesh rotation={[1.92, 0.32, 0]}>
        <ringGeometry args={[1.55, 2.15, 96]} />
        <meshBasicMaterial color="#7ba6ff" transparent opacity={0.2} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
};

const Rig = ({ pointer }: { pointer: MutableRefObject<Pointer> }) => {
  useFrame((state) => {
    const { camera } = state;
    camera.position.x += (pointer.current.x * 0.7 - camera.position.x) * 0.03;
    camera.position.y += (pointer.current.y * 0.45 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
  });
  return null;
};

const SpaceScene = () => {
  const pointer = useRef<Pointer>({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      dpr={[1, 1.8]}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 3, 5]} intensity={1.2} color="#aab8ff" />
      <pointLight position={[3, 1, -1]} intensity={2.2} color="#7c6cff" distance={14} />
      <Starfield />
      <Planet />
      <Rig pointer={pointer} />
    </Canvas>
  );
};

export default SpaceScene;
