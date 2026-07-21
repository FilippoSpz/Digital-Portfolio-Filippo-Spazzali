import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type Pointer = { x: number; y: number };
const scrollRef = { current: 0 };
/** 0 at top of page, 1 at the bottom. */
const progressRef = { current: 0 };

/* ------------------------------------------------------------------ Starfield */

const Starfield = ({ count = 2000 }: { count?: number }) => {
  const ref = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const color = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const r = 12 + Math.random() * 38;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const t = Math.random();
      if (t > 0.9) color.setHSL(0.72, 0.7, 0.8);
      else if (t > 0.74) color.setHSL(0.57, 0.65, 0.8);
      else color.setHSL(0.6, 0.1, 0.95);
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
    ref.current.rotation.y += delta * 0.008;
    ref.current.rotation.x += delta * 0.003;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial size={0.05} sizeAttenuation vertexColors transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} />
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
      { tex: makeNebulaTexture('rgba(124,108,255,0.4)', 'rgba(88,70,200,0.12)'), pos: [-9, 4, -16] as const, scale: 24 },
      { tex: makeNebulaTexture('rgba(74,168,255,0.35)', 'rgba(40,90,180,0.1)'), pos: [10, -5, -20] as const, scale: 28 },
    ],
    [],
  );

  useEffect(() => () => clouds.forEach((c) => c.tex.dispose()), [clouds]);

  return (
    <group>
      {clouds.map((c, i) => (
        <sprite key={i} position={c.pos} scale={[c.scale, c.scale, 1]}>
          <spriteMaterial map={c.tex} transparent opacity={0.45} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      ))}
    </group>
  );
};

/* ------------------------------------------------------------------ Planet (travels with scroll) */

const atmosphereMaterial = () =>
  new THREE.ShaderMaterial({
    uniforms: { glowColor: { value: new THREE.Color('#7c8cff') }, intensity: { value: 1.0 } },
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
    const p = progressRef.current;
    if (core.current) core.current.rotation.y += 0.0015;
    if (group.current) {
      // Travel across the sky from upper-right to left as the page progresses.
      const targetX = 3.2 - p * 6;
      const targetY = 1.4 - p * 1.2 + Math.sin(state.clock.elapsedTime * 0.15) * 0.06;
      const targetS = 1 + Math.sin(p * Math.PI) * 0.18;
      group.current.position.x += (targetX - group.current.position.x) * 0.04;
      group.current.position.y += (targetY - group.current.position.y) * 0.04;
      const s = group.current.scale.x + (targetS - group.current.scale.x) * 0.04;
      group.current.scale.setScalar(s);
      group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.03;
    }
    if (moon.current) {
      const a = state.clock.elapsedTime * 0.3;
      moon.current.position.set(Math.cos(a) * 2.4, Math.sin(a) * 0.6, Math.sin(a) * 2.4);
    }
  });

  return (
    <group ref={group} position={[3.2, 1.4, -2]}>
      <mesh scale={1.3} material={atmo}>
        <sphereGeometry args={[1, 48, 48]} />
      </mesh>
      <mesh ref={core}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial color="#3c2f82" emissive="#221a52" emissiveIntensity={0.5} roughness={0.68} metalness={0.2} />
      </mesh>
      <mesh rotation={[1.94, 0.3, 0]}>
        <ringGeometry args={[1.5, 2.2, 128]} />
        <meshBasicMaterial color="#8ab4ff" transparent opacity={0.18} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <group ref={moon}>
        <mesh scale={0.16}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="#c9c6e6" emissive="#6a6a90" emissiveIntensity={0.25} roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
};

/* ------------------------------------------------------------------ Shooting star (single, occasional) */

const Meteor = () => {
  const ref = useRef<THREE.Mesh>(null);
  const state = useRef({ t: 5, active: false, x: 0, y: 0, dx: 0, dy: 0 });

  useFrame((_, delta) => {
    const m = state.current;
    m.t -= delta;
    if (!m.active) {
      if (m.t <= 0) {
        m.active = true;
        m.x = 9 + Math.random() * 5;
        m.y = 4 + Math.random() * 4;
        m.dx = -(6 + Math.random() * 4);
        m.dy = -(2 + Math.random() * 2);
      }
    } else {
      m.x += m.dx * delta;
      m.y += m.dy * delta;
      if (m.x < -12) {
        m.active = false;
        m.t = 7 + Math.random() * 8;
      }
    }
    if (ref.current) {
      ref.current.visible = m.active;
      ref.current.position.set(m.x, m.y, -6);
      ref.current.rotation.z = Math.atan2(m.dy, m.dx);
    }
  });

  return (
    <mesh ref={ref} visible={false}>
      <planeGeometry args={[1.4, 0.02]} />
      <meshBasicMaterial color="#dfe6ff" transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
};

/* ------------------------------------------------------------------ Rig (gentle, slow parallax) */

const Rig = ({ pointer }: { pointer: MutableRefObject<Pointer> }) => {
  useFrame((state) => {
    const { camera } = state;
    const targetX = pointer.current.x * 0.45;
    const targetY = pointer.current.y * 0.3;
    camera.position.x += (targetX - camera.position.x) * 0.018;
    camera.position.y += (targetY - camera.position.y) * 0.018;
    camera.position.z = 6 - progressRef.current * 0.8;
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
      const max = document.body.scrollHeight - window.innerHeight;
      progressRef.current = max > 0 ? Math.min(Math.max(scrollRef.current / max, 0), 1) : 0;
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
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 3, 5]} intensity={1.2} color="#aab8ff" />
      <pointLight position={[3, 1, -1]} intensity={2} color="#7c6cff" distance={16} />
      <Nebulae />
      <Starfield />
      <Planet />
      <Meteor />
      <Rig pointer={pointer} />
    </Canvas>
  );
};

export default SpaceScene;
