import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type Pointer = { x: number; y: number };
const scrollRef = { current: 0 };

/* ------------------------------------------------------------------ Starfield */

const Starfield = ({ count = 3600 }: { count?: number }) => {
  const ref = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const color = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const r = 10 + Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const t = Math.random();
      if (t > 0.88) color.setHSL(0.72, 0.8, 0.82);
      else if (t > 0.7) color.setHSL(0.57, 0.75, 0.82);
      else color.setHSL(0.6, 0.12, 0.97);
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
    const boost = 1 + Math.min(scrollRef.current / 4000, 1.5);
    ref.current.rotation.y += delta * 0.01 * boost;
    ref.current.rotation.x += delta * 0.004;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial size={0.06} sizeAttenuation vertexColors transparent opacity={0.92} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
};

/* ------------------------------------------------------------------ Nebulae */

const makeNebulaTexture = (inner: string, mid: string) => {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, inner);
    g.addColorStop(0.45, mid);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

const Nebulae = () => {
  const clouds = useMemo(
    () => [
      { tex: makeNebulaTexture('rgba(124,108,255,0.55)', 'rgba(88,70,200,0.18)'), pos: [-7, 3, -12] as const, scale: 20 },
      { tex: makeNebulaTexture('rgba(74,168,255,0.5)', 'rgba(40,90,180,0.15)'), pos: [9, -4, -16] as const, scale: 26 },
      { tex: makeNebulaTexture('rgba(236,110,220,0.4)', 'rgba(150,50,160,0.12)'), pos: [3, 6, -20] as const, scale: 22 },
    ],
    [],
  );

  useEffect(() => () => clouds.forEach((c) => c.tex.dispose()), [clouds]);

  return (
    <group>
      {clouds.map((c, i) => (
        <sprite key={i} position={c.pos} scale={[c.scale, c.scale, 1]}>
          <spriteMaterial map={c.tex} transparent opacity={0.6} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      ))}
    </group>
  );
};

/* ------------------------------------------------------------------ Planet + atmosphere + moon */

const atmosphereMaterial = () =>
  new THREE.ShaderMaterial({
    uniforms: { glowColor: { value: new THREE.Color('#7c8cff') }, intensity: { value: 1.05 } },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vView;
      uniform vec3 glowColor;
      uniform float intensity;
      void main() {
        float f = pow(1.0 - abs(dot(vNormal, vView)), 3.0);
        gl_FragColor = vec4(glowColor, f * intensity);
      }
    `,
    transparent: true,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

const Planet = () => {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const moon = useRef<THREE.Group>(null);
  const atmo = useMemo(atmosphereMaterial, []);

  useEffect(() => () => atmo.dispose(), [atmo]);

  useFrame((state) => {
    const scroll = scrollRef.current;
    if (core.current) core.current.rotation.y += 0.0016;
    if (group.current) {
      group.current.position.y = 0.7 - scroll * 0.0022;
      group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.12) * 0.03;
    }
    if (moon.current) {
      const a = state.clock.elapsedTime * 0.35;
      moon.current.position.set(Math.cos(a) * 2.5, Math.sin(a) * 0.7, Math.sin(a) * 2.5);
    }
  });

  return (
    <group ref={group} position={[3, 0.7, -1.8]}>
      {/* Atmosphere glow */}
      <mesh scale={1.28} material={atmo}>
        <sphereGeometry args={[1, 48, 48]} />
      </mesh>
      {/* Core */}
      <mesh ref={core}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial color="#3c2f82" emissive="#221a52" emissiveIntensity={0.5} roughness={0.68} metalness={0.2} />
      </mesh>
      {/* Ring */}
      <mesh rotation={[1.94, 0.3, 0]}>
        <ringGeometry args={[1.5, 2.25, 128]} />
        <meshBasicMaterial color="#8ab4ff" transparent opacity={0.22} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Moon */}
      <group ref={moon}>
        <mesh scale={0.18}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="#c9c6e6" emissive="#6a6a90" emissiveIntensity={0.25} roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
};

/* ------------------------------------------------------------------ Asteroid belt */

const AsteroidBelt = ({ count = 70 }: { count?: number }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(0.06, 0), []);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: '#6b6a86', roughness: 1, metalness: 0.1 }), []);

  useEffect(() => {
    if (!ref.current) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + Math.random() * 0.2;
      const radius = 4.2 + Math.random() * 1.4;
      dummy.position.set(Math.cos(a) * radius, (Math.random() - 0.5) * 0.5, Math.sin(a) * radius - 6);
      const s = 0.5 + Math.random() * 1.2;
      dummy.scale.setScalar(s);
      dummy.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, [count]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.03;
  });

  return <instancedMesh ref={ref} args={[geometry, material, count]} />;
};

/* ------------------------------------------------------------------ Shooting stars */

const Meteor = ({ seed }: { seed: number }) => {
  const ref = useRef<THREE.Mesh>(null);
  const state = useRef({ t: seed * 3, active: false, x: 0, y: 0, z: -8, dx: 0, dy: 0 });

  useFrame((_, delta) => {
    const m = state.current;
    m.t -= delta;
    if (!m.active) {
      if (m.t <= 0) {
        m.active = true;
        m.x = 8 + Math.random() * 6;
        m.y = 4 + Math.random() * 4;
        m.z = -6 - Math.random() * 6;
        m.dx = -(6 + Math.random() * 4);
        m.dy = -(2 + Math.random() * 2);
      }
    } else {
      m.x += m.dx * delta;
      m.y += m.dy * delta;
      if (m.x < -12) {
        m.active = false;
        m.t = 4 + Math.random() * 6;
      }
    }
    if (ref.current) {
      ref.current.visible = m.active;
      ref.current.position.set(m.x, m.y, m.z);
      ref.current.rotation.z = Math.atan2(m.dy, m.dx);
    }
  });

  return (
    <mesh ref={ref} visible={false}>
      <planeGeometry args={[1.4, 0.02]} />
      <meshBasicMaterial color="#dfe6ff" transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
};

/* ------------------------------------------------------------------ Rig */

const Rig = ({ pointer }: { pointer: MutableRefObject<Pointer> }) => {
  useFrame((state) => {
    const { camera } = state;
    const scroll = scrollRef.current;
    const targetX = pointer.current.x * 0.8;
    const targetY = pointer.current.y * 0.5 + Math.min(scroll / 6000, 1) * 0.6;
    camera.position.x += (targetX - camera.position.x) * 0.03;
    camera.position.y += (targetY - camera.position.y) * 0.03;
    camera.position.z = 6 - Math.min(scroll / 8000, 1) * 1.2;
    camera.lookAt(0, 0, -2);
  });
  return null;
};

/* ------------------------------------------------------------------ Scene */

const SpaceScene = () => {
  const pointer = useRef<Pointer>({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onScroll = () => {
      scrollRef.current = window.scrollY || 0;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      dpr={[1, 1.8]}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 3, 5]} intensity={1.3} color="#aab8ff" />
      <pointLight position={[3, 1, -1]} intensity={2.4} color="#7c6cff" distance={16} />
      <Nebulae />
      <Starfield />
      <Planet />
      <AsteroidBelt />
      <Meteor seed={0} />
      <Meteor seed={1.7} />
      <Rig pointer={pointer} />
    </Canvas>
  );
};

export default SpaceScene;
