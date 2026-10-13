import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { journey, testDrive } from '@/lib/motion';
import type { Body } from '@/data/navigation';
import { coronaFragment, coronaVertex, planetFragment, ringTexFragment, ringVertex, sphereVertex } from '@/components/background/shaders';
import { menuSky, type MenuLayout, type MenuNode } from './menuLayout';
import mercuryMap from '@/assets/space/mercury-512.webp';
import venusMap from '@/assets/space/venus-atmosphere-512.webp';
import earthMap from '@/assets/space/earth-day-1k.webp';
import moonMap from '@/assets/space/moon-512.webp';
import marsMap from '@/assets/space/mars-512.webp';
import jupiterMap from '@/assets/space/jupiter-512.webp';
import saturnMap from '@/assets/space/saturn-512.webp';
import saturnRing from '@/assets/space/saturn-ring.png';
import uranusMap from '@/assets/space/uranus-512.webp';
import neptuneMap from '@/assets/space/neptune-512.webp';

/* The menu's own little sky, drawn in real 3D over the column (1 unit = 1 px): the planets from their
   maps, lit from the Sun (the photo), arriving along their orbits from off-screen when the site
   opens; flames rising from the rim of the photo; the Moon and Jupiter's moons going round; and a
   probe, a dot of light, travelling from planet to planet as the page scrolls. */

const MAPS: Partial<Record<Body, string>> = {
  mercury: mercuryMap,
  venus: venusMap,
  earth: earthMap,
  mars: marsMap,
  jupiter: jupiterMap,
  saturn: saturnMap,
  uranus: uranusMap,
  neptune: neptuneMap,
};

const LOOK: Partial<Record<Body, { atmo?: string; atmoStrength?: number; tilt: number; spin: number }>> = {
  mercury: { tilt: 0.03, spin: 0.25 },
  venus: { atmo: '#ffe2a8', atmoStrength: 0.6, tilt: 0.05, spin: 0.12 },
  earth: { atmo: '#5a9cff', atmoStrength: 1.1, tilt: 0.41, spin: 0.3 },
  mars: { atmo: '#ff9a6a', atmoStrength: 0.35, tilt: 0.44, spin: 0.28 },
  jupiter: { atmo: '#f0cfa0', atmoStrength: 0.3, tilt: 0.05, spin: 0.4 },
  saturn: { atmo: '#f2dca8', atmoStrength: 0.25, tilt: 0.47, spin: 0.35 },
  uranus: { atmo: '#a8f4f4', atmoStrength: 0.7, tilt: 1.71, spin: 0.2 },
  neptune: { atmo: '#7f9cff', atmoStrength: 0.8, tilt: 0.49, spin: 0.22 },
  pluto: { tilt: 0.3, spin: 0.15 },
};

const time = { value: 0 };

/** Light that only adds (the shaders hand out premultiplied colour): bright on the see-through canvas too. */
const pureAdd = { blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor } as const;

/** Pluto has no public map at this size: a pale, mottled world with its bright heart. */
function plutoTexture() {
  const w = 256;
  const h = 128;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#b89c84';
  ctx.fillRect(0, 0, w, h);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 260; i++) {
    const shade = 60 + rnd() * 120;
    ctx.fillStyle = `rgba(${shade + 40}, ${shade + 20}, ${shade}, ${0.12 + rnd() * 0.2})`;
    ctx.beginPath();
    ctx.ellipse(rnd() * w, rnd() * h, 3 + rnd() * 14, 2 + rnd() * 8, rnd() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(245, 236, 222, 0.85)';
  ctx.beginPath();
  ctx.ellipse(150, 70, 22, 18, 0.3, 0, Math.PI * 2);
  ctx.ellipse(170, 66, 16, 14, -0.2, 0, Math.PI * 2);
  ctx.fill();
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Screen px → world units of the orthographic camera (centred, y up). */
const toWorld = (x: number, y: number, w: number, h: number) => new THREE.Vector3(x - w / 2, h / 2 - y, 0);

const easeOut = (u: number) => 1 - Math.pow(1 - u, 3);

/**
 * Where a body is on its orbit while it arrives: it starts beyond the column's left edge (or from
 * behind the Sun for the innermost orbits) and glides along the orbit into place.
 */
function arrivalAngle(node: MenuNode, sun: MenuNode, u: number) {
  const target = Math.atan2(node.y - sun.y, node.x - sun.x);
  const reach = (-60 - sun.x) / node.orbit;
  const start = reach > -1 ? Math.acos(reach) : target + 2.2;
  return start + (target - start) * easeOut(u);
}

interface SkyBodyProps {
  node: MenuNode;
  sun: MenuNode;
  map: THREE.Texture;
  delay: number;
  moons?: 'moon' | 'jupiter';
  ring?: boolean;
  spinOnFlip?: boolean;
}

const SkyBody = ({ node, sun, map, delay, moons, ring, spinOnFlip }: SkyBodyProps) => {
  const { size } = useThree();
  const look = LOOK[node.body]!;
  const group = useRef<THREE.Group>(null);
  const sphere = useRef<THREE.Mesh>(null);
  const moonRefs = useRef<(THREE.Mesh | null)[]>([]);
  const light = useMemo(() => new THREE.Vector3(), []);
  const planetPos = useMemo(() => new THREE.Vector3(), []);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: sphereVertex,
        fragmentShader: planetFragment,
        uniforms: {
          uLight: { value: light },
          uMap: { value: map },
          uAtmo: { value: new THREE.Color(look.atmo ?? '#000000') },
          uAtmoStrength: { value: look.atmoStrength ?? 0 },
          uAmbient: { value: 0.03 },
          uTerminator: { value: 0.12 },
        },
      }),
    [map, light, look],
  );
  const ringMap = useLoader(THREE.TextureLoader, saturnRing);
  const ringMaterial = useMemo(() => {
    if (!ring) return null;
    ringMap.colorSpace = THREE.SRGBColorSpace;
    return new THREE.ShaderMaterial({
      vertexShader: ringVertex,
      fragmentShader: ringTexFragment,
      uniforms: {
        uLight: { value: light },
        uPlanet: { value: planetPos },
        uPlanetR: { value: node.r },
        uInner: { value: node.r * 1.24 },
        uOuter: { value: node.r * 2.27 },
        uMap: { value: ringMap },
        uFade: { value: 1 },
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
  }, [ring, ringMap, light, planetPos, node.r]);
  useEffect(() => () => (material.dispose(), ringMaterial?.dispose()), [material, ringMaterial]);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const u = Math.min(1, Math.max(0, (t - delay) / 1.6));
    g.visible = u > 0;
    const a = arrivalAngle(node, sun, u);
    const x = sun.x + Math.cos(a) * node.orbit;
    const y = sun.y + Math.sin(a) * node.orbit;
    g.position.copy(toWorld(x, y, size.width, size.height));
    g.getWorldPosition(planetPos);
    // Lit from the Sun, and a little from the front, so the day side faces the photo.
    const sunW = toWorld(sun.x, sun.y, size.width, size.height);
    light.set(sunW.x - g.position.x, sunW.y - g.position.y, 0).normalize();
    light.z = 0.85;
    light.normalize();
    if (sphere.current) {
      let spin = look.spin * dt;
      // Neptune turns a full circle when the language changes.
      if (spinOnFlip && menuSky.flip > 0) {
        const step = Math.min(menuSky.flip, dt * 7);
        menuSky.flip -= step;
        spin += step;
      }
      sphere.current.rotation.y += spin;
    }
    moonRefs.current.forEach((m, i) => {
      if (!m) return;
      if (moons === 'moon') {
        const ang = t * 0.6 + 1.3;
        m.position.set(Math.cos(ang) * node.r * 2.1, Math.sin(ang) * node.r * 0.55, Math.sin(ang) * node.r * 2.1);
      } else {
        const dist = [1.35, 1.55, 1.75, 1.95][i];
        const ang = t * [1.1, 0.7, 0.45, 0.28][i] + i * 1.7;
        m.position.set(Math.cos(ang) * node.r * dist, Math.sin(ang) * node.r * dist * 0.12, Math.sin(ang) * node.r * dist);
      }
    });
  });

  return (
    <group ref={group}>
      <group rotation={[0, 0, look.tilt]}>
        <mesh ref={sphere} material={material} scale={node.r}>
          <sphereGeometry args={[1, 64, 64]} />
        </mesh>
        {ringMaterial && (
          <mesh rotation={[Math.PI / 2 - 0.32, 0, 0]} material={ringMaterial}>
            <ringGeometry args={[node.r * 1.24, node.r * 2.27, 128, 1]} />
          </mesh>
        )}
      </group>
      {moons === 'moon' && <MoonBall refFn={(m) => (moonRefs.current[0] = m)} r={node.r * 0.27} light={light} />}
      {moons === 'jupiter' &&
        [0, 1, 2, 3].map((i) => (
          <mesh key={i} ref={(m) => (moonRefs.current[i] = m)}>
            <sphereGeometry args={[[1.2, 1.1, 1.5, 1.35][i], 12, 12]} />
            <meshBasicMaterial color={['#e9d9a6', '#d8d2c6', '#cfc5b4', '#a9a093'][i]} />
          </mesh>
        ))}
    </group>
  );
};

const MoonBall = ({ refFn, r, light }: { refFn: (m: THREE.Mesh | null) => void; r: number; light: THREE.Vector3 }) => {
  const map = useLoader(THREE.TextureLoader, moonMap);
  const material = useMemo(() => {
    map.colorSpace = THREE.SRGBColorSpace;
    return new THREE.ShaderMaterial({
      vertexShader: sphereVertex,
      fragmentShader: planetFragment,
      uniforms: {
        uLight: { value: light },
        uMap: { value: map },
        uAtmo: { value: new THREE.Color('#000000') },
        uAtmoStrength: { value: 0 },
        uAmbient: { value: 0.03 },
        uTerminator: { value: 0.06 },
      },
    });
  }, [map, light]);
  useEffect(() => () => material.dispose(), [material]);
  return (
    <mesh ref={refFn} material={material} scale={r}>
      <sphereGeometry args={[1, 32, 32]} />
    </mesh>
  );
};

/** Tongues of magma rising from the rim of the photo; brighter while the pointer is on Home. */
const SunFlames = ({ sun }: { sun: MenuNode }) => {
  const { size } = useThree();
  const strength = useMemo(() => ({ value: 0 }), []);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: coronaVertex,
        fragmentShader: coronaFragment,
        uniforms: { uTime: time, uDisc: { value: 1 / (2 * 3.4) }, uReach: { value: 0.105 }, uStrength: strength, uRim: { value: 0.55 } },
        transparent: true,
        depthWrite: false,
        ...pureAdd,
      }),
    [strength],
  );
  useEffect(() => () => material.dispose(), [material]);
  useFrame((state, dt) => {
    // The flames light up as the site opens, then breathe; hovering Home stokes them.
    const intro = Math.min(1, state.clock.elapsedTime / 1.2);
    const target = intro * (1 + menuSky.heat * 0.6);
    strength.value += (target - strength.value) * Math.min(1, dt * 4);
  });
  const p = toWorld(sun.x, sun.y, size.width, size.height);
  return (
    <mesh position={[p.x, p.y, -40]} scale={sun.r * 2 * 3.4} material={material}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
};

/** A dot of light: it circles the planet of the section you are reading, and flies to the next as you scroll. */
const Probe = ({ layout }: { layout: MenuLayout }) => {
  const { size } = useThree();
  const ref = useRef<THREE.Sprite>(null);
  const smooth = useRef(journey.t);
  const texture = useMemo(() => {
    const s = 64;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = s;
    const ctx = canvas.getContext('2d')!;
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.18, 'rgba(255,255,255,0.95)');
    g.addColorStop(0.35, 'rgba(255,236,210,0.35)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    return new THREE.CanvasTexture(canvas);
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  const stops = useMemo(() => [layout.sun, ...layout.planets], [layout]);
  const a = useMemo(() => new THREE.Vector2(), []);
  const b = useMemo(() => new THREE.Vector2(), []);
  useFrame((state, dt) => {
    const sprite = ref.current;
    if (!sprite) return;
    const t = state.clock.elapsedTime;
    sprite.visible = t > 2.2;
    smooth.current += (journey.t - smooth.current) * Math.min(1, dt * 3.5);
    const i = Math.min(stops.length - 1, Math.floor(smooth.current));
    const j = Math.min(stops.length - 1, i + 1);
    const f = smooth.current - i;
    const u = f * f * (3 - 2 * f);
    const spin = t * 1.3;
    const around = (n: MenuNode, out: THREE.Vector2) => out.set(n.x + Math.cos(spin) * (n.r + 8), n.y + Math.sin(spin) * (n.r + 8) * 0.45);
    around(stops[i], a);
    around(stops[j], b);
    // On the way, a gentle arc away from the Sun.
    const mx = (a.x + b.x) / 2 + 26;
    const my = (a.y + b.y) / 2;
    const x = (1 - u) * (1 - u) * a.x + 2 * (1 - u) * u * mx + u * u * b.x;
    const y = (1 - u) * (1 - u) * a.y + 2 * (1 - u) * u * my + u * u * b.y;
    // In front of the planet on the near half of its little orbit, behind it on the far half.
    const front = Math.sin(spin) > 0 || (f > 0.05 && f < 0.95);
    sprite.position.copy(toWorld(x, y, size.width, size.height));
    sprite.position.z = front ? 60 : -60;
  });
  return (
    <sprite ref={ref} scale={[14, 14, 1]}>
      <spriteMaterial map={texture} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </sprite>
  );
};

const Sky = ({ layout }: { layout: MenuLayout }) => {
  const maps = useLoader(THREE.TextureLoader, Object.values(MAPS) as string[]);
  const byBody = useMemo(() => {
    const out: Partial<Record<Body, THREE.Texture>> = {};
    (Object.keys(MAPS) as Body[]).forEach((k, i) => {
      maps[i].colorSpace = THREE.SRGBColorSpace;
      maps[i].anisotropy = 4;
      out[k] = maps[i];
    });
    out.pluto = plutoTexture();
    return out;
  }, [maps]);
  useEffect(() => () => byBody.pluto?.dispose(), [byBody]);
  useFrame((state) => {
    time.value = state.clock.elapsedTime;
  });
  const { sun, planets, language, resume } = layout;
  return (
    <>
      <SunFlames sun={sun} />
      {planets.map((node, i) => (
        <SkyBody
          key={node.body}
          node={node}
          sun={sun}
          map={byBody[node.body]!}
          delay={0.35 + i * 0.13}
          moons={node.body === 'earth' ? 'moon' : node.body === 'jupiter' ? 'jupiter' : undefined}
          ring={node.body === 'saturn'}
        />
      ))}
      <SkyBody node={language} sun={sun} map={byBody.neptune!} delay={1.35} spinOnFlip />
      <SkyBody node={resume} sun={sun} map={byBody.pluto!} delay={1.48} />
      <Probe layout={layout} />
    </>
  );
};

const MenuSky = ({ layout }: { layout: MenuLayout }) => (
  <Canvas
    orthographic
    frameloop={testDrive ? 'never' : 'always'}
    dpr={[1, 2]}
    gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    camera={{ position: [0, 0, 2000], zoom: 1, near: 1, far: 4000 }}
    style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
  >
    <Sky layout={layout} />
  </Canvas>
);

export default MenuSky;
