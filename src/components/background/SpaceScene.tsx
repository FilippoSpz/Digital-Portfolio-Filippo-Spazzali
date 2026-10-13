import { Suspense, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { advance, Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { journey, lowPower, testDrive } from '@/lib/motion';
import { navItems, type Body } from '@/data/navigation';
import {
  atmosphereFragment,
  cloudsFragment,
  coronaFragment,
  coronaVertex,
  earthFragment,
  planetFragment,
  ringFragment,
  ringTexFragment,
  ringVertex,
  sphereVertex,
  starsFragment,
  starsVertex,
  sunFragment,
  texturedFragment,
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
import sunMap from '@/assets/space/sun.webp';
import sunSmall from '@/assets/space/sun-1k.webp';
import mercuryMap from '@/assets/space/mercury.webp';
import mercurySmall from '@/assets/space/mercury-1k.webp';
import venusMap from '@/assets/space/venus-atmosphere.webp';
import venusSmall from '@/assets/space/venus-atmosphere-1k.webp';
import marsMap from '@/assets/space/mars.webp';
import marsSmall from '@/assets/space/mars-1k.webp';
import jupiterMap from '@/assets/space/jupiter.webp';
import jupiterSmall from '@/assets/space/jupiter-1k.webp';
import saturnMap from '@/assets/space/saturn.webp';
import saturnSmall from '@/assets/space/saturn-1k.webp';
import saturnRing from '@/assets/space/saturn-ring.png';
import uranusMap from '@/assets/space/uranus.webp';
import uranusSmall from '@/assets/space/uranus-1k.webp';

if (testDrive) {
  let clock = 0;
  const w = window as unknown as { __advance: (s: number) => void; __journey: typeof journey };
  w.__advance = (seconds: number) => {
    for (let i = 0; i < Math.round(seconds * 60); i++) advance((clock += 1 / 60));
  };
  w.__journey = journey;
}

/* One body per section, alone on the stage: when you move to the next section the current planet
   leaves the screen upwards, and only then the next one rises in from below. The stars drift a
   little meanwhile — just enough to feel the movement. Every planet comes from its real map. */

type Stop = Exclude<Body, 'neptune' | 'pluto'>;
const STOPS = navItems.map((n) => n.body) as Stop[];

const FOV = 50;
const TAN = Math.tan(THREE.MathUtils.degToRad(FOV / 2));

/** The planets are lit from the front-left: the night side shows as a crescent on the right. */
const LIGHT = new THREE.Vector3(-0.78, 0.3, 0.55).normalize();

const shared = { uLight: { value: LIGHT } };
const time = { value: 0 };

/** Where the page is, smoothed, and the screen's shape: written by the rig, read by every body. */
const stage = { t: journey.t, local: 0, aspect: 1, wide: 1 };

const sphereMaterial = (fragmentShader: string, uniforms: Record<string, THREE.IUniform>) =>
  new THREE.ShaderMaterial({ vertexShader: sphereVertex, fragmentShader, uniforms: { ...shared, uTime: time, ...uniforms } });

const color = (hex: string) => ({ value: new THREE.Color(hex) });

/** Maps for this device: phones get them at half size (a quarter of the download, the same look). */
const pick = (big: string, small: string) => (lowPower() ? small : big);

function useMap(url: string) {
  const tex = useLoader(THREE.TextureLoader, url);
  useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
  }, [tex]);
  return tex;
}

/* ------------------------------------------------------------------ The stage */

/** Centre (in screen units, -1…1) and apparent radius (fraction of half the screen height) at rest. */
interface Pose {
  x: number;
  y: number;
  size: number;
}

/** Wide screens: the planet on the right of the text. Phones: above it, smaller. The Sun peeks in from the top-right corner. */
const REST: Record<Stop, { wide: Pose; tall: Pose }> = {
  sun: { wide: { x: 0.84, y: 0.74, size: 0.3 }, tall: { x: 0.62, y: 0.84, size: 0.24 } },
  mercury: { wide: { x: 0.5, y: 0.04, size: 0.4 }, tall: { x: 0.08, y: 0.55, size: 0.24 } },
  venus: { wide: { x: 0.5, y: 0.04, size: 0.46 }, tall: { x: 0.08, y: 0.55, size: 0.28 } },
  earth: { wide: { x: 0.5, y: 0.04, size: 0.44 }, tall: { x: 0.05, y: 0.55, size: 0.26 } },
  mars: { wide: { x: 0.5, y: 0.04, size: 0.42 }, tall: { x: 0.08, y: 0.55, size: 0.25 } },
  jupiter: { wide: { x: 0.6, y: 0.02, size: 0.47 }, tall: { x: 0.08, y: 0.52, size: 0.3 } },
  saturn: { wide: { x: 0.48, y: 0.06, size: 0.3 }, tall: { x: 0.05, y: 0.55, size: 0.17 } },
  uranus: { wide: { x: 0.5, y: 0.04, size: 0.42 }, tall: { x: 0.08, y: 0.55, size: 0.25 } },
};

/** How far beyond the screen edge a body hides, counting its glow or rings (in radii). */
const REACH: Partial<Record<Stop, number>> = { sun: 2.4, saturn: 2.5, earth: 2.6 };

const lerp = THREE.MathUtils.lerp;
const easeOut = (u: number) => 1 - Math.pow(1 - u, 3);
const easeIn = (u: number) => u * u * u;

function restPose(stop: Stop): Pose {
  const r = REST[stop];
  return { x: lerp(r.tall.x, r.wide.x, stage.wide), y: lerp(r.tall.y, r.wide.y, stage.wide), size: lerp(r.tall.size, r.wide.size, stage.wide) };
}

/**
 * Body i at the current point of the page: resting, rising in from below (the second half of the
 * way from the section before), or leaving upwards (the first half of the way to the next); null
 * while it is off stage.
 */
function stagePose(i: number, stop: Stop): Pose | null {
  const s = stage.t - i;
  if (s <= -0.5 || s >= 0.5) return null;
  const rest = restPose(stop);
  const edge = 1.08 + rest.size * (REACH[stop] ?? 1.2);
  if (s < 0) {
    const u = easeOut((s + 0.5) / 0.5);
    return { x: rest.x + (1 - u) * 0.16, y: lerp(-edge, rest.y, u), size: rest.size };
  }
  const u = easeIn(s / 0.5);
  return { x: rest.x - u * 0.1, y: lerp(rest.y, edge + (stop === 'sun' ? 0.2 : 0), u), size: rest.size };
}

/** Places its body (radius 1) on the stage every frame; hides it while it is off stage. */
const OnStage = ({ index, stop, zoom, children }: { index: number; stop: Stop; zoom?: (g: THREE.Group, pose: Pose) => number; children: ReactNode }) => {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const pose = stagePose(index, stop);
    g.visible = !!pose;
    if (!pose) return;
    // Distance that gives the wanted apparent size; a body may come closer (Saturn's zoom).
    const d = (1 / (pose.size * TAN)) * (zoom ? zoom(g, pose) : 1);
    const hh = d * TAN;
    g.position.set(pose.x * hh * stage.aspect, pose.y * hh, -d);
  });
  return <group ref={ref}>{children}</group>;
};

/* ------------------------------------------------------------------ Atmospheres */

const Atmosphere = ({ tint, scale = 1.1, power = 1.8, intensity = 1.4 }: { tint: string; scale?: number; power?: number; intensity?: number }) => {
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
    <mesh scale={scale} material={material}>
      <sphereGeometry args={[1, 96, 96]} />
    </mesh>
  );
};

/* ------------------------------------------------------------------ The Sun */

/** A smooth radial glow (drawn at high resolution, so it never shows steps). */
function glowTexture(stops: [number, string][]) {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [at, c] of stops) g.addColorStop(at, c);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const Sun = () => {
  const map = useMap(pick(sunMap, sunSmall));
  const surface = useMemo(() => {
    const m = sphereMaterial(sunFragment, { uMap: { value: map } });
    m.toneMapped = false;
    return m;
  }, [map]);
  const flames = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: coronaVertex,
        fragmentShader: coronaFragment,
        uniforms: { uTime: time, uDisc: { value: 0.25 }, uReach: { value: 0.1 }, uStrength: { value: 1.1 }, uRim: { value: 0.25 } },
        transparent: true,
        depthWrite: false,
        blending: THREE.CustomBlending,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneFactor,
        toneMapped: false,
      }),
    [],
  );
  const glow = useMemo(
    () =>
      glowTexture([
        [0, 'rgba(255,190,120,0.55)'],
        [0.2, 'rgba(255,140,60,0.28)'],
        [0.42, 'rgba(255,100,40,0.08)'],
        [1, 'rgba(0,0,0,0)'],
      ]),
    [],
  );
  useEffect(() => () => (surface.dispose(), flames.dispose(), glow.dispose()), [surface, flames, glow]);
  const ref = useRef<THREE.Mesh>(null);
  const face = useRef<THREE.Mesh>(null);
  useFrame(({ camera }, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.015;
    // The flames always face the camera itself (not just its direction), so they ring the disc as we see it.
    if (face.current) face.current.lookAt(camera.position);
  });
  return (
    <>
      <mesh ref={ref} material={surface}>
        <sphereGeometry args={[1, 128, 128]} />
      </mesh>
      <mesh ref={face} material={flames} scale={4}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      <sprite scale={[6.5, 6.5, 1]}>
        <spriteMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
    </>
  );
};

/* ------------------------------------------------------------------ Planets from their maps */

interface Look {
  map: [string, string];
  atmo?: string;
  atmoStrength?: number;
  /** Shell around the planet (Venus' thick air, Mars' thin one). */
  shell?: { tint: string; scale: number; power: number; intensity: number };
  ambient?: number;
  terminator?: number;
  tilt: number;
  spin: number;
}

const LOOKS: Record<'mercury' | 'venus' | 'mars' | 'jupiter' | 'uranus', Look> = {
  mercury: { map: [mercuryMap, mercurySmall], ambient: 0.012, terminator: 0.04, tilt: 0.02, spin: 0.02 },
  venus: {
    map: [venusMap, venusSmall],
    atmo: '#ffe2a8',
    atmoStrength: 0.7,
    shell: { tint: '#ffd38a', scale: 1.06, power: 2.2, intensity: 1.1 },
    ambient: 0.02,
    terminator: 0.22,
    tilt: 0.05,
    spin: 0.012,
  },
  mars: {
    map: [marsMap, marsSmall],
    atmo: '#ff9a6a',
    atmoStrength: 0.35,
    shell: { tint: '#ff8a5c', scale: 1.04, power: 2.6, intensity: 0.7 },
    ambient: 0.012,
    terminator: 0.08,
    tilt: 0.44,
    spin: 0.035,
  },
  jupiter: {
    map: [jupiterMap, jupiterSmall],
    atmo: '#f0cfa0',
    atmoStrength: 0.35,
    shell: { tint: '#e8b880', scale: 1.035, power: 2.6, intensity: 0.55 },
    ambient: 0.015,
    terminator: 0.12,
    tilt: 0.05,
    spin: 0.05,
  },
  uranus: {
    map: [uranusMap, uranusSmall],
    atmo: '#a8f4f4',
    atmoStrength: 0.8,
    shell: { tint: '#7fe6e6', scale: 1.05, power: 2.2, intensity: 0.9 },
    ambient: 0.02,
    terminator: 0.18,
    tilt: 1.71,
    spin: 0.03,
  },
};

function planetMaterial(map: THREE.Texture, look: Pick<Look, 'atmo' | 'atmoStrength' | 'ambient' | 'terminator'>) {
  return sphereMaterial(planetFragment, {
    uMap: { value: map },
    uAtmo: color(look.atmo ?? '#000000'),
    uAtmoStrength: { value: look.atmoStrength ?? 0 },
    uAmbient: { value: look.ambient ?? 0.015 },
    uTerminator: { value: look.terminator ?? 0.1 },
  });
}

const Planet = ({ look, children }: { look: Look; children?: ReactNode }) => {
  const map = useMap(pick(...look.map));
  const material = useMemo(() => planetMaterial(map, look), [map, look]);
  useEffect(() => () => material.dispose(), [material]);
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * look.spin;
  });
  return (
    <group rotation={[0, 0, look.tilt]}>
      <mesh ref={ref} material={material}>
        <sphereGeometry args={[1, 128, 128]} />
      </mesh>
      {look.shell && <Atmosphere {...look.shell} />}
      {children}
    </group>
  );
};

/* ------------------------------------------------------------------ Earth and the Moon */

const Earth = () => {
  const small = lowPower();
  const [day, night, clouds, spec, moon] = useLoader(
    THREE.TextureLoader,
    small ? [earthDaySmall, earthNightSmall, earthClouds, earthSpecSmall, moonSmall] : [earthDay, earthNight, earthClouds, earthSpec, moonMap],
  );
  useMemo(() => {
    day.colorSpace = THREE.SRGBColorSpace;
    moon.colorSpace = THREE.SRGBColorSpace;
    for (const t of [day, night, clouds, spec, moon]) t.anisotropy = 8;
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
  const moonRef = useRef<THREE.Mesh>(null);
  useFrame((state, dt) => {
    if (planet.current) planet.current.rotation.y += dt * 0.03;
    if (cloudRef.current) cloudRef.current.rotation.y += dt * 0.038;
    if (moonRef.current) {
      // The Moon goes round, passing in front of the Earth and behind it, on a tilted orbit.
      const a = state.clock.elapsedTime * 0.22 + 2.4;
      moonRef.current.position.set(Math.cos(a) * 2.05, Math.sin(a) * 0.55, Math.sin(a) * 1.5);
      moonRef.current.rotation.y = -a;
    }
  });

  return (
    <group rotation={[0.18, 0, 0.12]}>
      <group rotation={[0.41, 0, 0]}>
        <mesh ref={planet} material={surface} rotation={[0, 3.6, 0]}>
          <sphereGeometry args={[1, 128, 128]} />
        </mesh>
        <mesh ref={cloudRef} scale={1.012} material={cloudMat}>
          <sphereGeometry args={[1, 96, 96]} />
        </mesh>
        <Atmosphere tint="#4f8dff" scale={1.1} power={1.6} intensity={2.2} />
      </group>
      <mesh ref={moonRef} scale={0.27} material={moonMat}>
        <sphereGeometry args={[1, 64, 64]} />
      </mesh>
    </group>
  );
};

/* ------------------------------------------------------------------ Saturn: rings made of rocks */

/** How densely the rings are packed at a radius (planet radii): the C, B and A rings, the Cassini division, the Encke gap. */
function ringDensity(r: number) {
  if (r < 1.24 || r > 2.27) return 0;
  if (r < 1.52) return 0.22;
  if (r < 1.95) return 1;
  if (r < 2.03) return 0.04;
  if (r > 2.205 && r < 2.218) return 0.05;
  return 0.72;
}

/** A lumpy rock: an icosahedron pushed in and out. */
function rockGeometry(detail: number) {
  const g = new THREE.IcosahedronGeometry(1, detail);
  const p = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const k = 0.7 + 0.45 * Math.abs(Math.sin(v.x * 4.1 + v.y * 2.7) * Math.cos(v.z * 3.3 - v.y * 1.9));
    p.setXYZ(i, v.x * k * 1.15, v.y * k * 0.8, v.z * k);
  }
  g.computeVertexNormals();
  return g;
}

const RingRocks = ({ count, detail, min, max, power }: { count: number; detail: number; min: number; max: number; power: number }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => rockGeometry(detail), [detail]);
  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const pos = new THREE.Vector3();
    const scl = new THREE.Vector3();
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      let r = 0;
      do r = 1.24 + Math.random() * 1.03;
      while (Math.random() > ringDensity(r));
      const a = Math.random() * Math.PI * 2;
      pos.set(Math.cos(a) * r, (Math.random() - 0.5) * 0.012, Math.sin(a) * r);
      const s = min + Math.pow(Math.random(), power) * (max - min);
      scl.set(s, s * (0.6 + Math.random() * 0.5), s * (0.8 + Math.random() * 0.4));
      q.setFromEuler(e.set(Math.random() * 6.3, Math.random() * 6.3, Math.random() * 6.3));
      mesh.setMatrixAt(i, m.compose(pos, q, scl));
      // Ice and dust: from bright grey-white to warm beige.
      c.setHSL(0.09 + Math.random() * 0.04, 0.18 + Math.random() * 0.2, 0.55 + Math.random() * 0.3);
      mesh.setColorAt(i, c);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [count, min, max, power]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  // The rings turn slowly: close up you see the rocks drift past.
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.01;
  });
  return (
    <instancedMesh ref={ref} args={[geometry, undefined, count]} frustumCulled={false}>
      <meshStandardMaterial roughness={0.95} metalness={0} />
    </instancedMesh>
  );
};

const Saturn = ({ rocks, fade }: { rocks: number; fade: { value: number } }) => {
  const [map, ringMap] = useLoader(THREE.TextureLoader, [pick(saturnMap, saturnSmall), saturnRing]);
  useMemo(() => {
    map.colorSpace = THREE.SRGBColorSpace;
    ringMap.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 8;
  }, [map, ringMap]);
  const surface = useMemo(() => planetMaterial(map, { atmo: '#f2dca8', atmoStrength: 0.3, ambient: 0.015, terminator: 0.12 }), [map]);
  const planetPos = useMemo(() => new THREE.Vector3(), []);
  const ring = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: ringVertex,
        fragmentShader: ringTexFragment,
        uniforms: {
          ...shared,
          uPlanet: { value: planetPos },
          uPlanetR: { value: 1 },
          uInner: { value: 1.24 },
          uOuter: { value: 2.27 },
          uMap: { value: ringMap },
          uFade: fade,
        },
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    [ringMap, planetPos, fade],
  );
  useEffect(() => () => (surface.dispose(), ring.dispose()), [surface, ring]);
  const body = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (!body.current) return;
    body.current.rotation.y += dt * 0.045;
    body.current.getWorldPosition(planetPos);
  });
  return (
    <group rotation={[0.42, 0, -0.32]}>
      <mesh ref={body} material={surface}>
        <sphereGeometry args={[1, 128, 128]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={ring}>
        <ringGeometry args={[1.24, 2.27, 256, 1]} />
      </mesh>
      {/* Mostly gravel (simple shapes, many), a few boulders (finer shapes). */}
      <RingRocks count={rocks} detail={0} min={0.0018} max={0.0065} power={1.6} />
      <RingRocks count={Math.round(rocks / 12)} detail={1} min={0.007} max={0.028} power={3} />
    </group>
  );
};

/** Uranus' faint rings, almost edge-on like the planet's spin. */
const FaintRings = () => {
  const planetPos = useMemo(() => new THREE.Vector3(), []);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: ringVertex,
        fragmentShader: ringFragment,
        uniforms: {
          ...shared,
          uPlanet: { value: planetPos },
          uPlanetR: { value: 1 },
          uInner: { value: 1.7 },
          uOuter: { value: 1.98 },
          uColA: color('#8fa8b0'),
          uColB: color('#d8eef2'),
          uOpacity: { value: 0.16 },
        },
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    [planetPos],
  );
  useEffect(() => () => material.dispose(), [material]);
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => ref.current?.parent?.getWorldPosition(planetPos));
  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]} material={material}>
      <ringGeometry args={[1.7, 1.98, 256, 1]} />
    </mesh>
  );
};

/* ------------------------------------------------------------------ Stars */

/** White stars all around, each at its own steady brightness. They turn a little as the page goes on. */
const Stars = ({ count }: { count: number }) => {
  const ref = useRef<THREE.Points>(null);
  const { geometry, material } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const v = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      v.randomDirection().multiplyScalar(260 + Math.random() * 420);
      pos.set([v.x, v.y, v.z], i * 3);
      const b = 0.55 + Math.random() * 0.45;
      col.set([b, b, b], i * 3);
      size[i] = Math.random() < 0.035 ? 2.6 + Math.random() * 2.2 : 0.7 + Math.random() * 1.5;
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    const m = new THREE.ShaderMaterial({
      vertexShader: starsVertex,
      fragmentShader: starsFragment,
      uniforms: { uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geometry: g, material: m };
  }, [count]);
  useEffect(() => () => (geometry.dispose(), material.dispose()), [geometry, material]);
  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.x = -stage.t * 0.03;
    ref.current.rotation.y = stage.t * 0.018;
  });
  return <points ref={ref} geometry={geometry} material={material} frustumCulled={false} />;
};

/* ------------------------------------------------------------------ Rig */

/** The camera never moves (not even with the mouse): only the page moves the sky. */
const Rig = () => {
  const { size } = useThree();
  // Runs before the bodies (negative priority), so they all read the same moment.
  useFrame((state, dt) => {
    const d = Math.min(Math.max(dt, 0), 0.05);
    time.value = state.clock.elapsedTime;
    if (testDrive) Object.assign(window, { __stage: stage, __scene: state.scene });
    stage.aspect = size.width / Math.max(1, size.height);
    stage.wide = THREE.MathUtils.smoothstep(stage.aspect, 0.8, 1.35);
    // Back from a hidden tab (or a long stall): be where the page is, no slow catch-up.
    const k = dt > 0.25 || dt < 0 ? 1 : 1 - Math.exp(-d * 3.2);
    stage.t += (journey.t - stage.t) * k;
    stage.local += (journey.local - stage.local) * k;
  }, -1);
  return null;
};

/* ------------------------------------------------------------------ Scene */

/** Saturn's zoom: while you read the Projects section it comes close, until the rocks of the rings show. */
const saturnFade = { value: 1 };
function saturnZoom(g: THREE.Group, pose: Pose) {
  const i = STOPS.indexOf('saturn');
  const resting = 1 - Math.min(1, Math.abs(stage.t - i) * 2);
  const z = THREE.MathUtils.smoothstep(stage.local, 0.16, 0.6) * resting;
  // Closer, and slid down-right so the near side of the rings crosses the screen.
  pose.x += z * 0.14;
  pose.y -= z * 0.34;
  saturnFade.value = 1 - z * 0.4;
  g.rotation.x = z * 0.16;
  return 1 - z * 0.62;
}

const SpaceScene = () => {
  const light = lowPower();
  const at = (stop: Stop) => STOPS.indexOf(stop);
  return (
    <Canvas
      frameloop={testDrive ? 'never' : 'always'}
      camera={{ position: [0, 0, 0], rotation: [0, 0, 0], fov: FOV, near: 0.05, far: 2000 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance', stencil: false }}
      dpr={light ? [1, 1.5] : [1, 2]}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}
      onCreated={({ gl }) => gl.setClearColor('#000000')}
    >
      <ambientLight intensity={0.05} />
      <directionalLight position={LIGHT.clone().multiplyScalar(100).toArray() as [number, number, number]} intensity={2.4} color="#fff4e6" />
      <Rig />
      <Stars count={light ? 2200 : 6000} />
      <Suspense fallback={null}>
        <OnStage index={at('sun')} stop="sun">
          <Sun />
        </OnStage>
      </Suspense>
      <Suspense fallback={null}>
        <OnStage index={at('mercury')} stop="mercury">
          <Planet look={LOOKS.mercury} />
        </OnStage>
      </Suspense>
      <Suspense fallback={null}>
        <OnStage index={at('venus')} stop="venus">
          <Planet look={LOOKS.venus} />
        </OnStage>
      </Suspense>
      <Suspense fallback={null}>
        <OnStage index={at('earth')} stop="earth">
          <Earth />
        </OnStage>
      </Suspense>
      <Suspense fallback={null}>
        <OnStage index={at('mars')} stop="mars">
          <Planet look={LOOKS.mars} />
        </OnStage>
      </Suspense>
      <Suspense fallback={null}>
        <OnStage index={at('jupiter')} stop="jupiter">
          <Planet look={LOOKS.jupiter} />
        </OnStage>
      </Suspense>
      <Suspense fallback={null}>
        <OnStage index={at('saturn')} stop="saturn" zoom={saturnZoom}>
          <Saturn rocks={light ? 6000 : 22000} fade={saturnFade} />
        </OnStage>
      </Suspense>
      <Suspense fallback={null}>
        <OnStage index={at('uranus')} stop="uranus">
          <Planet look={LOOKS.uranus}>
            <FaintRings />
          </Planet>
        </OnStage>
      </Suspense>
    </Canvas>
  );
};

export default SpaceScene;
