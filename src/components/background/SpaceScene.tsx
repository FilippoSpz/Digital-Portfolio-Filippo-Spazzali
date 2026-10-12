import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { advance, Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Bloom, ChromaticAberration, EffectComposer, GodRays, Noise, ToneMapping, Vignette } from '@react-three/postprocessing';
import { BlendFunction, ToneMappingMode } from 'postprocessing';
import * as THREE from 'three';
import { journey, lowPower, testDrive, warp } from '@/lib/motion';

if (testDrive) {
  let clock = 0;
  const w = window as unknown as { __advance: (s: number) => void; __warp: typeof warp; __journey: typeof journey };
  w.__advance = (seconds: number) => {
    for (let i = 0; i < Math.round(seconds * 60); i++) advance((clock += 1 / 60));
  };
  w.__warp = warp;
  w.__journey = journey;
}
import {
  atmosphereFragment,
  cloudsFragment,
  earthFragment,
  gasGiantFragment,
  ringFragment,
  ringVertex,
  rockyFragment,
  sphereVertex,
  starsFragment,
  starsVertex,
  sunFragment,
  texturedFragment,
  warpFragment,
  warpVertex,
} from './shaders';
import earthDay from '@/assets/space/earth-day.webp';
import earthNight from '@/assets/space/earth-night.webp';
import earthClouds from '@/assets/space/earth-clouds.webp';
import earthSpec from '@/assets/space/earth-specular.webp';
import moonMap from '@/assets/space/moon.webp';
import earthDaySmall from '@/assets/space/earth-day-1k.webp';
import earthNightSmall from '@/assets/space/earth-night-1k.webp';
import earthSpecSmall from '@/assets/space/earth-specular-1k.webp';
import moonSmall from '@/assets/space/moon-512.webp';

/* A trip through the solar system, one stop per section of the page:
   the Sun (home), Earth (about), Jupiter (skills), Saturn (certifications), Mars (portfolio),
   Neptune (projects), Uranus (contact) — the same planets as the menu. */

type Vec3 = [number, number, number];
interface Body {
  key: 'sun' | 'earth' | 'jupiter' | 'saturn' | 'mars' | 'neptune' | 'uranus';
  r: number;
  pos: Vec3;
}

const BODIES: Body[] = [
  { key: 'sun', r: 6.5, pos: [15, 3, 0] },
  { key: 'earth', r: 2.2, pos: [5, 0.4, -80] },
  { key: 'jupiter', r: 5, pos: [11, -1, -165] },
  { key: 'saturn', r: 3.9, pos: [9, 1.2, -250] },
  { key: 'mars', r: 1.7, pos: [4, -0.4, -330] },
  { key: 'neptune', r: 3, pos: [7.5, 0.6, -410] },
  { key: 'uranus', r: 2.9, pos: [7, -0.8, -490] },
];

/** The planets are lit from the front-left: the night side shows as a crescent on the right. */
const LIGHT = new THREE.Vector3(-0.55, 0.28, 0.79).normalize();

const shared = { uLight: { value: LIGHT } };
const time = { value: 0 };

const sphereMaterial = (fragmentShader: string, uniforms: Record<string, THREE.IUniform>) =>
  new THREE.ShaderMaterial({ vertexShader: sphereVertex, fragmentShader, uniforms: { ...shared, uTime: time, ...uniforms } });

const color = (hex: string) => ({ value: new THREE.Color(hex) });

/* ------------------------------------------------------------------ Atmospheres */

const Atmosphere = ({ r, tint, scale = 1.14, power = 1.6, intensity = 1.6 }: { r: number; tint: string; scale?: number; power?: number; intensity?: number }) => {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: sphereVertex,
        fragmentShader: atmosphereFragment,
        uniforms: { ...shared, uColor: color(tint), uPower: { value: power }, uIntensity: { value: intensity } },
        side: THREE.BackSide,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [tint, power, intensity],
  );
  useEffect(() => () => material.dispose(), [material]);
  return (
    <mesh scale={r * scale} material={material}>
      <sphereGeometry args={[1, 64, 64]} />
    </mesh>
  );
};

/* ------------------------------------------------------------------ The Sun */

const Sun = ({ body, onDisc }: { body: Body; onDisc: (m: THREE.Mesh) => void }) => {
  const surface = useMemo(() => {
    const m = sphereMaterial(sunFragment, {});
    m.toneMapped = false;
    return m;
  }, []);
  const corona = useMemo(() => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.12, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(255,170,90,0.55)');
    g.addColorStop(0.25, 'rgba(255,110,40,0.22)');
    g.addColorStop(0.6, 'rgba(255,70,30,0.05)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
  const ref = useRef<THREE.Mesh>(null);
  useEffect(() => () => (surface.dispose(), corona.dispose()), [surface, corona]);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.02;
  });
  return (
    <group position={body.pos}>
      <mesh ref={ref} scale={body.r} material={surface}>
        <sphereGeometry args={[1, 96, 96]} />
      </mesh>
      {/* The bright disc the god rays come from: just inside the surface, so it only shows in their pass. */}
      <mesh ref={(m) => m && onDisc(m)} scale={body.r * 0.985}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color="#ffb070" transparent opacity={0.9} depthWrite={false} toneMapped={false} />
      </mesh>
      <sprite scale={[body.r * 5, body.r * 5, 1]}>
        <spriteMaterial map={corona} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
    </group>
  );
};

/* ------------------------------------------------------------------ Earth and the Moon */

const Earth = ({ body }: { body: Body }) => {
  // Phones get the maps at half size: a quarter of the download, the same look on a small screen.
  const small = lowPower();
  const [day, night, clouds, spec, moon] = useLoader(
    THREE.TextureLoader,
    small ? [earthDaySmall, earthNightSmall, earthClouds, earthSpecSmall, moonSmall] : [earthDay, earthNight, earthClouds, earthSpec, moonMap],
  );
  useMemo(() => {
    day.colorSpace = THREE.SRGBColorSpace;
    moon.colorSpace = THREE.SRGBColorSpace;
    for (const t of [day, night, clouds, spec, moon]) t.anisotropy = 4;
  }, [day, night, clouds, spec, moon]);
  const surface = useMemo(() => sphereMaterial(earthFragment, { uDay: { value: day }, uNight: { value: night }, uSpec: { value: spec } }), [day, night, spec]);
  const cloudMat = useMemo(() => {
    const m = sphereMaterial(cloudsFragment, { uClouds: { value: clouds } });
    m.transparent = true;
    m.depthWrite = false;
    return m;
  }, [clouds]);
  const moonMat = useMemo(() => sphereMaterial(texturedFragment, { uMap: { value: moon } }), [moon]);
  useEffect(() => () => (surface.dispose(), cloudMat.dispose(), moonMat.dispose()), [surface, cloudMat, moonMat]);

  const planet = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const moonRef = useRef<THREE.Group>(null);
  useFrame((state, dt) => {
    if (planet.current) planet.current.rotation.y += dt * 0.03;
    if (cloudRef.current) cloudRef.current.rotation.y += dt * 0.038;
    if (moonRef.current) {
      const a = state.clock.elapsedTime * 0.06 + 2.2;
      moonRef.current.position.set(Math.cos(a) * body.r * 3.4, Math.sin(a * 0.7) * body.r * 0.5, Math.sin(a) * body.r * 3.4);
    }
  });

  return (
    <group position={body.pos} rotation={[0.41, 0, 0.12]}>
      <mesh ref={planet} scale={body.r} material={surface} rotation={[0, 3.6, 0]}>
        <sphereGeometry args={[1, 128, 128]} />
      </mesh>
      <mesh ref={cloudRef} scale={body.r * 1.012} material={cloudMat}>
        <sphereGeometry args={[1, 96, 96]} />
      </mesh>
      <Atmosphere r={body.r} tint="#4f8dff" scale={1.12} power={1.4} intensity={2.4} />
      <group ref={moonRef}>
        <mesh scale={body.r * 0.27} material={moonMat}>
          <sphereGeometry args={[1, 64, 64]} />
        </mesh>
      </group>
    </group>
  );
};

/* ------------------------------------------------------------------ Gas giants, rings, Mars */

interface GiantLook {
  c: [string, string, string, string];
  bands: number;
  turb: number;
  atmo: string;
  spot?: string;
  tilt: number;
  spin: number;
}

const LOOKS: Record<'jupiter' | 'saturn' | 'neptune' | 'uranus', GiantLook> = {
  jupiter: { c: ['#c79a6b', '#efe0c6', '#8f5a3a', '#d8b48b'], bands: 7.5, turb: 0.55, atmo: '#d9a066', spot: '#c4553a', tilt: 0.05, spin: 0.05 },
  saturn: { c: ['#d8c08b', '#f2e4bd', '#b49461', '#e6d3a3'], bands: 6, turb: 0.25, atmo: '#e8cf90', tilt: 0.47, spin: 0.045 },
  neptune: { c: ['#2a4fc7', '#4f7df0', '#1b2f8a', '#7fa6ff'], bands: 4, turb: 0.4, atmo: '#5c86f2', spot: '#16246b', tilt: 0.49, spin: 0.04 },
  uranus: { c: ['#8fdbe0', '#b8eef0', '#6cc4cc', '#d2f6f6'], bands: 2.5, turb: 0.12, atmo: '#5fd6d8', tilt: 1.7, spin: 0.03 },
};

const Giant = ({ body, look }: { body: Body; look: GiantLook }) => {
  const material = useMemo(
    () =>
      sphereMaterial(gasGiantFragment, {
        uC1: color(look.c[0]),
        uC2: color(look.c[1]),
        uC3: color(look.c[2]),
        uC4: color(look.c[3]),
        uBands: { value: look.bands },
        uTurb: { value: look.turb },
        uAtmo: color(look.atmo),
        uSpot: { value: look.spot ? 1 : 0 },
        uSpotColor: color(look.spot ?? '#000000'),
      }),
    [look],
  );
  useEffect(() => () => material.dispose(), [material]);
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * look.spin;
  });
  return (
    <group position={body.pos} rotation={[0, 0, look.tilt]}>
      <mesh ref={ref} scale={body.r} material={material}>
        <sphereGeometry args={[1, 128, 128]} />
      </mesh>
      <Atmosphere r={body.r} tint={look.atmo} scale={1.08} power={1.8} intensity={1.1} />
      {body.key === 'saturn' && <Rings body={body} inner={1.25} outer={2.35} a="#cdb88a" b="#f4e7c4" opacity={0.95} />}
      {body.key === 'uranus' && <Rings body={body} inner={1.7} outer={1.95} a="#9ab8c4" b="#d8eef2" opacity={0.14} />}
    </group>
  );
};

const Rings = ({ body, inner, outer, a, b, opacity }: { body: Body; inner: number; outer: number; a: string; b: string; opacity: number }) => {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: ringVertex,
        fragmentShader: ringFragment,
        uniforms: {
          ...shared,
          uPlanet: { value: new THREE.Vector3(...body.pos) },
          uPlanetR: { value: body.r },
          uInner: { value: inner * body.r },
          uOuter: { value: outer * body.r },
          uColA: color(a),
          uColB: color(b),
          uOpacity: { value: opacity },
        },
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    [body, inner, outer, a, b, opacity],
  );
  useEffect(() => () => material.dispose(), [material]);
  return (
    <mesh rotation={[Math.PI / 2 - 0.12, 0, 0]} material={material}>
      <ringGeometry args={[inner * body.r, outer * body.r, 256, 1]} />
    </mesh>
  );
};

const Mars = ({ body }: { body: Body }) => {
  const material = useMemo(
    () => sphereMaterial(rockyFragment, { uC1: color('#7a2f17'), uC2: color('#d0743e'), uC3: color('#4a2116'), uAtmo: color('#ff9a6a') }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.04;
  });
  return (
    <group position={body.pos} rotation={[0, 0, 0.44]}>
      <mesh ref={ref} scale={body.r} material={material}>
        <sphereGeometry args={[1, 128, 128]} />
      </mesh>
      <Atmosphere r={body.r} tint="#ff8a5c" scale={1.07} power={2.2} intensity={0.9} />
    </group>
  );
};

/* ------------------------------------------------------------------ Stars, nebulae, asteroids */

const Stars = ({ count }: { count: number }) => {
  const { geometry, material } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const seed = new Float32Array(count);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      let x = 0;
      let y = 0;
      // Not right on the camera's path: no star flies through the lens.
      do {
        x = (Math.random() - 0.5) * 520;
        y = (Math.random() - 0.5) * 380;
      } while (Math.hypot(x - 2, y - 1) < 10);
      pos.set([x, y, 80 - Math.random() * 820], i * 3);
      const t = Math.random();
      if (t > 0.92) c.setHSL(0.08, 0.8, 0.82);
      else if (t > 0.8) c.setHSL(0.6, 0.7, 0.85);
      else if (t > 0.7) c.setHSL(0.72, 0.6, 0.85);
      else c.setHSL(0.6, 0.1, 0.96);
      col.set([c.r, c.g, c.b], i * 3);
      size[i] = Math.random() < 0.04 ? 3 + Math.random() * 3 : 0.8 + Math.random() * 1.8;
      seed[i] = Math.random();
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    const m = new THREE.ShaderMaterial({
      vertexShader: starsVertex,
      fragmentShader: starsFragment,
      uniforms: { uTime: time, uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geometry: g, material: m };
  }, [count]);
  useEffect(() => () => (geometry.dispose(), material.dispose()), [geometry, material]);
  return <points geometry={geometry} material={material} frustumCulled={false} />;
};

const nebulaTexture = (inner: string, mid: string) => {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, inner);
  g.addColorStop(0.45, mid);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

/** A coloured glow far behind each stop: the background changes colour with the section. */
const Nebulae = () => {
  const clouds = useMemo(
    () =>
      [
        ['rgba(124,108,255,0.5)', 'rgba(88,70,200,0.14)', [40, 30, -160], 220],
        ['rgba(60,140,255,0.45)', 'rgba(30,80,180,0.12)', [-60, 20, -230], 200],
        ['rgba(255,150,70,0.35)', 'rgba(170,80,40,0.1)', [70, -30, -320], 240],
        ['rgba(240,210,140,0.32)', 'rgba(150,120,60,0.08)', [-50, 40, -400], 220],
        ['rgba(255,90,60,0.32)', 'rgba(150,40,30,0.1)', [60, 10, -480], 220],
        ['rgba(70,110,255,0.42)', 'rgba(30,50,170,0.12)', [-70, -20, -560], 260],
        ['rgba(80,220,220,0.36)', 'rgba(30,120,130,0.1)', [50, 30, -650], 260],
      ].map(([a, b, pos, scale]) => ({ tex: nebulaTexture(a as string, b as string), pos: pos as Vec3, scale: scale as number })),
    [],
  );
  useEffect(() => () => clouds.forEach((c) => c.tex.dispose()), [clouds]);
  return (
    <group>
      {clouds.map((c, i) => (
        <sprite key={i} position={c.pos} scale={[c.scale, c.scale, 1]}>
          <spriteMaterial map={c.tex} transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      ))}
    </group>
  );
};

/** A belt of rocks between Earth and Jupiter: the camera flies right through it. */
const Asteroids = ({ count }: { count: number }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(1, 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const k = 0.72 + 0.35 * Math.abs(Math.sin(v.x * 3.1 + v.y * 2.3) * Math.cos(v.z * 2.7 - v.x));
      p.setXYZ(i, v.x * k, v.y * k * 0.85, v.z * k);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  const rocks = useMemo(
    () =>
      Array.from({ length: count }, () => {
        const a = Math.random() * Math.PI * 2;
        const rad = 5 + Math.random() * 28;
        return {
          pos: new THREE.Vector3(1.5 + Math.cos(a) * rad, 1 + Math.sin(a) * rad * 0.6, -95 - Math.random() * 55),
          rot: new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6),
          spin: new THREE.Vector3((Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, 0),
          s: Math.random() < 0.06 ? 0.5 + Math.random() * 0.5 : 0.08 + Math.random() * 0.3,
        };
      }),
    [count],
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ camera }, dt) => {
    const mesh = ref.current;
    if (!mesh) return;
    rocks.forEach((r, i) => {
      r.rot.x += r.spin.x * dt;
      r.rot.y += r.spin.y * dt;
      dummy.position.copy(r.pos);
      dummy.rotation.copy(r.rot);
      // Only around the camera while it flies through: at the planets the view stays clear.
      const near = THREE.MathUtils.smoothstep(42 - camera.position.distanceTo(r.pos), 0, 20);
      dummy.scale.setScalar(r.s * near);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <instancedMesh ref={ref} args={[geometry, undefined, count]} frustumCulled={false}>
      <meshStandardMaterial color="#8a7d72" roughness={0.95} metalness={0.05} flatShading />
    </instancedMesh>
  );
};

/* ------------------------------------------------------------------ Hyperspace */

const WarpStreaks = ({ count }: { count: number }) => {
  const group = useRef<THREE.Group>(null);
  const { geometry, material } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 6);
    const tail = new Float32Array(count * 2);
    const speed = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 1.6 + Math.pow(Math.random(), 0.6) * 14;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      const z = -Math.random() * 140;
      pos.set([x, y, z, x, y, z], i * 6);
      tail.set([0, 1], i * 2);
      const s = 0.6 + Math.random() * 0.8;
      speed.set([s, s], i * 2);
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aTail', new THREE.BufferAttribute(tail, 1));
    g.setAttribute('aSpeed', new THREE.BufferAttribute(speed, 1));
    const m = new THREE.ShaderMaterial({
      vertexShader: warpVertex,
      fragmentShader: warpFragment,
      uniforms: { uTime: time, uWarp: { value: 0 }, uColor: color('#cfd8ff') },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geometry: g, material: m };
  }, [count]);
  useEffect(() => () => (geometry.dispose(), material.dispose()), [geometry, material]);
  useFrame(({ camera }) => {
    material.uniforms.uWarp.value = warp.value;
    if (group.current) {
      group.current.visible = warp.value > 0.01;
      group.current.position.copy(camera.position);
      group.current.quaternion.copy(camera.quaternion);
    }
  });
  return (
    <group ref={group}>
      <lineSegments geometry={geometry} material={material} frustumCulled={false} />
    </group>
  );
};

/* ------------------------------------------------------------------ Camera */

/** Where the camera stands and looks for each stop: the planet sits to the right on wide screens,
 *  above the text on tall (phone) screens. */
function framing(aspect: number) {
  const wide = THREE.MathUtils.smoothstep(aspect, 0.8, 1.35);
  const eye: THREE.Vector3[] = [];
  const look: THREE.Vector3[] = [];
  for (const b of BODIES) {
    const p = new THREE.Vector3(...b.pos);
    const r = b.key === 'sun' ? b.r * 1.25 : b.r;
    const sun = b.key === 'sun';
    // The Sun rises in the top-right corner, so the portrait in the home page sits on dark sky.
    const eyeWide = sun ? new THREE.Vector3(-1.6 * r, -0.9 * r, 4.4 * r) : new THREE.Vector3(-1.9 * r, 0.22 * r, 3.1 * r);
    const eyeTall = sun ? new THREE.Vector3(-0.6 * r, -1.1 * r, 5.2 * r) : new THREE.Vector3(-0.25 * r, -0.1 * r, 4.6 * r);
    const lookWide = sun ? new THREE.Vector3(-2.6 * r, -1.5 * r, 0) : new THREE.Vector3(-1.35 * r, 0, 0);
    const lookTall = sun ? new THREE.Vector3(-0.8 * r, -1.9 * r, 0) : new THREE.Vector3(-0.15 * r, -0.85 * r, 0);
    eye.push(p.clone().add(eyeTall.lerp(eyeWide, wide)));
    look.push(p.clone().add(lookTall.lerp(lookWide, wide)));
  }
  return { eye: new THREE.CatmullRomCurve3(eye, false, 'centripetal'), look: new THREE.CatmullRomCurve3(look, false, 'centripetal') };
}

const CameraRig = () => {
  const { camera, size } = useThree();
  const curves = useMemo(() => framing(size.width / Math.max(1, size.height)), [size.width, size.height]);
  const t = useRef(journey.t);
  const eye = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    time.value = state.clock.elapsedTime;
    // Back from a hidden tab (or a long stall): be where the page is, no slow catch-up.
    const snap = dt > 0.25;
    warp.value = snap ? warp.target : warp.value + (warp.target - warp.value) * (1 - Math.exp(-d * (warp.target > warp.value ? 5 : 2.2)));
    t.current = snap ? journey.t : t.current + (journey.t - t.current) * (1 - Math.exp(-d * (3 + warp.value * 6)));
    const u = THREE.MathUtils.clamp(t.current / journey.max, 0, 1);
    curves.eye.getPoint(u, eye);
    curves.look.getPoint(u, look);
    // A slight drift with the mouse, just enough to feel the depth.
    eye.x += pointer.current.x * 0.25;
    eye.y -= pointer.current.y * 0.18;
    camera.position.copy(eye);
    camera.lookAt(look);
    // Banking gently while travelling between two planets.
    const travel = Math.sin((t.current % 1) * Math.PI);
    camera.rotateZ(travel * 0.05);
    const cam = camera as THREE.PerspectiveCamera;
    const fov = 52 + warp.value * 28;
    if (Math.abs(cam.fov - fov) > 0.01) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }
  });
  return null;
};

/* ------------------------------------------------------------------ Look */

const Effects = ({ sun }: { sun: THREE.Mesh | null }) => {
  const aberration = useMemo(() => new THREE.Vector2(0.0004, 0.0004), []);
  useFrame(() => {
    const k = 0.0004 + warp.value * 0.0045;
    aberration.set(k, k);
  });
  const effects = [
    <Bloom key="bloom" mipmapBlur luminanceThreshold={0.42} luminanceSmoothing={0.35} intensity={1.7} radius={0.82} />,
    <ChromaticAberration key="ca" offset={aberration} radialModulation modulationOffset={0.25} />,
    <ToneMapping key="tone" mode={ToneMappingMode.ACES_FILMIC} />,
    <Vignette key="vignette" offset={0.28} darkness={0.72} />,
    <Noise key="grain" opacity={0.05} premultiply blendFunction={BlendFunction.SCREEN} />,
  ];
  if (sun) effects.unshift(<GodRays key="rays" sun={sun} samples={60} density={0.96} decay={0.94} weight={0.55} exposure={0.5} clampMax={1} blur />);
  return (
    <EffectComposer key={sun ? 'with-sun' : 'no-sun'} multisampling={0}>
      {effects}
    </EffectComposer>
  );
};

/* ------------------------------------------------------------------ Scene */

const SpaceScene = () => {
  const light = lowPower();
  const [sun, setSun] = useState<THREE.Mesh | null>(null);
  const byKey = (k: Body['key']) => BODIES.find((b) => b.key === k)!;

  return (
    <Canvas
      frameloop={testDrive ? 'never' : 'always'}
      camera={{ position: [0, 0, 30], fov: 52, near: 0.1, far: 2000 }}
      gl={{ antialias: !light, alpha: false, powerPreference: 'high-performance', stencil: false }}
      dpr={light ? [1, 1.5] : [1, 1.75]}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}
      onCreated={({ gl }) => gl.setClearColor('#04050c')}
    >
      <ambientLight intensity={0.12} />
      <directionalLight position={LIGHT.clone().multiplyScalar(100).toArray() as Vec3} intensity={2.2} color="#fff1dc" />
      <Stars count={light ? 2600 : 7000} />
      <Nebulae />
      <Sun body={byKey('sun')} onDisc={(m) => setSun((cur) => cur ?? m)} />
      <Suspense fallback={null}>
        <Earth body={byKey('earth')} />
      </Suspense>
      <Asteroids count={light ? 90 : 260} />
      <Giant body={byKey('jupiter')} look={LOOKS.jupiter} />
      <Giant body={byKey('saturn')} look={LOOKS.saturn} />
      <Mars body={byKey('mars')} />
      <Giant body={byKey('neptune')} look={LOOKS.neptune} />
      <Giant body={byKey('uranus')} look={LOOKS.uranus} />
      <WarpStreaks count={light ? 260 : 600} />
      <CameraRig />
      {!light && <Effects sun={sun} />}
    </Canvas>
  );
};

export default SpaceScene;
