import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { journey, testDrive } from '@/lib/motion';
import type { Body } from '@/data/navigation';
import { coronaFragment, coronaVertex, moonFragment, planetFragment, ringTexFragment, ringVertex, sphereVertex } from '@/components/background/shaders';
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
   little satellite circling the planet of the section you are reading, flying to the next as the
   page scrolls. */

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

interface Look {
  atmo?: string;
  atmoStrength?: number;
  tilt: number;
  spin: number;
  /** 0 rocky limb, 1 a gas giant's dark limb. */
  limb?: number;
  /** The big scene's own recipes (see planetFragment), where they still show at this size. */
  defines?: Record<string, string | number>;
  bump?: number;
}

const LOOK: Partial<Record<Body, Look>> = {
  mercury: { tilt: 0.03, spin: 0.25, defines: { BUMP: '' }, bump: 0.01 },
  venus: { atmo: '#ffe2a8', atmoStrength: 0.6, tilt: 0.05, spin: 0.12, limb: 0.4, defines: { VORTEX: '' } },
  earth: { atmo: '#5a9cff', atmoStrength: 1.1, tilt: 0.41, spin: 0.3 },
  mars: { atmo: '#ff9a6a', atmoStrength: 0.35, tilt: 0.44, spin: 0.28, defines: { BUMP: '' }, bump: 0.006 },
  jupiter: { atmo: '#f0cfa0', atmoStrength: 0.3, tilt: 0.05, spin: 0.4, limb: 1 },
  saturn: { atmo: '#f2dca8', atmoStrength: 0.25, tilt: 0.47, spin: 0.35, limb: 1, defines: { HEXAGON: '' } },
  uranus: { atmo: '#a8f4f4', atmoStrength: 0.7, tilt: 1.71, spin: 0.2, limb: 0.6, defines: { ICEGIANT: '' } },
  neptune: { atmo: '#7f9cff', atmoStrength: 0.8, tilt: 0.49, spin: 0.22, limb: 0.6 },
  pluto: { tilt: 0.3, spin: 0.15 },
};

/** Jupiter's four big moons, as in the big scene: Io, Europa, Ganymede, Callisto (see moonFragment). */
const GALILEANS = [
  { r: 1.5, dist: 1.38, speed: 1.1, kind: 0, a: '#c2ad66', b: '#e6d9a0', seed: 1.3 },
  { r: 1.35, dist: 1.6, speed: 0.7, kind: 1, a: '#d4c9b4', b: '#efe8dc', seed: 4.1 },
  { r: 1.9, dist: 1.82, speed: 0.45, kind: 2, a: '#5f574e', b: '#82786c', seed: 7.7 },
  { r: 1.7, dist: 2.02, speed: 0.28, kind: 3, a: '#3b342d', b: '#554c43', seed: 9.2 },
];

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
  // Jupiter's shadow, for the moons that pass behind it.
  const shadow = useMemo(() => new THREE.Vector4(), []);
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
          uLimb: { value: look.limb ?? 0 },
          uDetail: { value: 0 },
          uTime: time,
          uBump: { value: look.bump ?? 0 },
        },
        defines: look.defines ?? {},
      }),
    [map, light, look],
  );
  const moonMaterials = useMemo(
    () =>
      moons === 'jupiter'
        ? GALILEANS.map(
            (m) =>
              new THREE.ShaderMaterial({
                vertexShader: sphereVertex,
                fragmentShader: moonFragment,
                uniforms: {
                  uLight: { value: light },
                  uKind: { value: m.kind },
                  uColA: { value: new THREE.Color(m.a) },
                  uColB: { value: new THREE.Color(m.b) },
                  uSeed: { value: m.seed },
                  uShadow: { value: shadow },
                },
              }),
          )
        : [],
    [moons, light, shadow],
  );
  useEffect(() => () => moonMaterials.forEach((m) => m.dispose()), [moonMaterials]);
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
    shadow.set(planetPos.x, planetPos.y, planetPos.z, node.r);
    // Lit from the Sun, and partly from the front: the day side faces the photo, a thin night side
    // on the far edge shows the ball's roundness.
    const sunW = toWorld(sun.x, sun.y, size.width, size.height);
    light.set(sunW.x - g.position.x, sunW.y - g.position.y, 0).normalize();
    light.z = 0.7;
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
        const { dist, speed } = GALILEANS[i];
        const ang = t * speed + i * 1.7;
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
      {moonMaterials.map((m, i) => (
        <mesh key={i} ref={(mesh) => (moonRefs.current[i] = mesh)} material={m} scale={GALILEANS[i].r}>
          <sphereGeometry args={[1, 24, 16]} />
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
        uLimb: { value: 0 },
        uDetail: { value: 0 },
        uTime: time,
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

/** Px beyond a body's rim where the satellite circles it; px left of the planets where its lane runs. */
const ORBIT_GAP = 12;
const LANE_GAP = 20;
/** On its lane the satellite flies in front of everything (Saturn's rings reach that far left). */
const LANE_Z = 80;

const smooth01 = (a: number, b: number, x: number) => {
  const k = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return k * k * (3 - 2 * k);
};

/** The point at parameter s (0 … pts.length − 1) on the smooth curve through pts (Catmull-Rom). */
function throughPoints(pts: THREE.Vector2[], s: number, out: THREE.Vector3) {
  const n = pts.length - 1;
  const i = Math.min(n - 1, Math.max(0, Math.floor(s)));
  const f = Math.min(1, Math.max(0, s - i));
  const p0 = pts[Math.max(0, i - 1)];
  const p1 = pts[i];
  const p2 = pts[i + 1];
  const p3 = pts[Math.min(n, i + 2)];
  const f2 = f * f;
  const f3 = f2 * f;
  const k = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (c - a) * f + (2 * a - 5 * b + 4 * c - d) * f2 + (3 * b - a - 3 * c + d) * f3);
  return out.set(k(p0.x, p1.x, p2.x, p3.x), k(p0.y, p1.y, p2.y, p3.y), LANE_Z);
}

/** The solar panels: dark blue cells in a lighter frame. */
function panelTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 40;
  canvas.height = 100;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#16233d';
  ctx.fillRect(0, 0, 40, 100);
  ctx.fillStyle = '#4c6390';
  for (let x = 0; x <= 40; x += 20) ctx.fillRect(Math.min(x, 38), 0, 2, 100);
  for (let y = 0; y <= 100; y += 20) ctx.fillRect(0, Math.min(y, 98), 40, 2);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

/**
 * A little satellite: gold foil body, two solar panels, a dish in front. It circles the planet of the
 * section you are reading and flies on to the next as you scroll. On a jump from the menu it leaves
 * its orbit, glides in one sweep along a lane just left of the planets (never stopping at the ones it
 * passes), and settles into orbit round the new one. Its nose follows its course.
 */
const Satellite = ({ layout }: { layout: MenuLayout }) => {
  const { size } = useThree();
  const ref = useRef<THREE.Group>(null);
  const stops = useMemo(() => [layout.sun, ...layout.planets], [layout]);
  const lane = useMemo(
    () =>
      stops.map((n, k) => {
        if (k > 0) return new THREE.Vector2(n.x - n.r - LANE_GAP, n.y);
        // Below the photo, towards Mercury.
        const next = stops[1];
        const d = new THREE.Vector2(next.x - n.x, next.y - n.y).normalize().multiplyScalar(n.r + LANE_GAP);
        return new THREE.Vector2(n.x + d.x, n.y + d.y);
      }),
    [stops],
  );
  const [st] = useState(() => ({
    s: journey.travel,
    jump: -1,
    from: new THREE.Vector3(),
    last: new THREE.Vector3(),
    carry: new THREE.Vector3(),
    heading: 0,
    shown: 0,
  }));
  const [tmp] = useState(() => ({
    a: new THREE.Vector3(),
    b: new THREE.Vector3(),
    c: new THREE.Vector3(),
    p: new THREE.Vector3(),
    // parked() only
    oi: new THREE.Vector3(),
    oj: new THREE.Vector3(),
    oc: new THREE.Vector3(),
  }));
  const [materials] = useState(() => ({
    foil: new THREE.MeshLambertMaterial({ color: '#c9a458', emissive: '#1c1406' }),
    panel: new THREE.MeshLambertMaterial({ map: panelTexture() }),
    white: new THREE.MeshLambertMaterial({ color: '#dedbd4', side: THREE.DoubleSide }),
    metal: new THREE.MeshLambertMaterial({ color: '#8d8f94' }),
  }));
  useEffect(
    () => () => {
      materials.panel.map?.dispose();
      Object.values(materials).forEach((m) => m.dispose());
    },
    [materials],
  );
  // Test drive: where it is (menu px), to check that a jump never stops on the way.
  if (testDrive) (window as unknown as { __sat: THREE.Vector3 }).__sat = st.last;

  useFrame((state, dt) => {
    const g = ref.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const spin = t * 1.3;
    const last = stops.length - 1;

    // Circling stop k: a tilted orbit, in front of the planet on its lower half, behind it on the upper.
    const orbit = (k: number, out: THREE.Vector3) => {
      const n = stops[k];
      const R = n.r + ORBIT_GAP;
      return out.set(n.x + Math.cos(spin) * R, n.y + Math.sin(spin) * R * 0.45, Math.sin(spin) * R * 0.9);
    };
    // Reading position s: in orbit at a stop; between two stops, out on the lane and back in.
    const parked = (s: number, out: THREE.Vector3) => {
      const i = Math.min(last - 1, Math.max(0, Math.floor(s)));
      const f = Math.min(1, Math.max(0, s - i));
      const u = f * f * (3 - 2 * f);
      const w = 1 - Math.sin(Math.PI * f) ** 2;
      const offI = orbit(i, tmp.oi).sub(throughPoints(lane, i, tmp.oc));
      const offJ = orbit(i + 1, tmp.oj).sub(throughPoints(lane, i + 1, tmp.oc));
      return throughPoints(lane, s, out).addScaledVector(offI.lerp(offJ, u), w);
    };

    const p = tmp.p;
    const jump = journey.jump;
    if (jump) {
      if (st.jump !== jump.id) {
        st.jump = jump.id;
        st.from.copy(st.last);
        st.carry.set(0, 0, 0);
      }
      const q = journey.jumpP;
      // Off the orbit it was on at the click, along the lane, and into the new orbit at the end.
      const endOff = parked(jump.to, tmp.b).sub(throughPoints(lane, jump.to, tmp.c));
      const startOff = tmp.a.copy(st.from).sub(throughPoints(lane, jump.from, tmp.c));
      throughPoints(lane, journey.travel, p)
        .addScaledVector(startOff, 1 - smooth01(0, 0.45, q))
        .addScaledVector(endOff, smooth01(0.55, 1, q));
      st.s = journey.travel;
    } else {
      if (st.jump !== -1) {
        // A jump just ended (or the reader took over half-way): no leap, the gap closes softly.
        st.jump = -1;
        st.s = journey.travel;
        st.carry.copy(st.last).sub(parked(st.s, tmp.a));
      }
      st.s += (journey.travel - st.s) * Math.min(1, dt * 8);
      parked(st.s, p);
      st.carry.multiplyScalar(Math.exp(-dt * 5));
      p.add(st.carry);
    }

    // The nose follows the course (screen y points down, the world's up).
    const vx = p.x - st.last.x;
    const vy = p.y - st.last.y;
    if (st.shown > 0 && vx * vx + vy * vy > 1e-4) {
      st.heading += wrapAngle(Math.atan2(-vy, vx) - st.heading) * Math.min(1, dt * 8);
    }
    st.last.copy(p);

    // It appears once the planets are in place.
    st.shown = Math.min(1, st.shown + (t > 2.2 ? dt * 2.5 : 0));
    g.visible = st.shown > 0;
    g.scale.setScalar(0.85 * easeOut(st.shown));
    g.position.set(p.x - size.width / 2, size.height / 2 - p.y, p.z);
    // Panels swaying slowly round the body's axis, the nose a little towards us: it reads as 3D.
    g.rotation.set(0.45 + 0.35 * Math.sin(t * 0.6), 0.35, st.heading, 'ZYX');
  });

  return (
    <group ref={ref} visible={false}>
      <mesh material={materials.foil}>
        <boxGeometry args={[6, 4.6, 4.6]} />
      </mesh>
      {/* The dish in front, its feed in the middle */}
      <mesh material={materials.white} position={[3.9, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[3, 0.9, 1.6, 20, 1, true]} />
      </mesh>
      <mesh material={materials.metal} position={[4.6, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 2.6, 6]} />
      </mesh>
      {/* An antenna at the back */}
      <mesh material={materials.metal} position={[-4.4, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 2.8, 6]} />
      </mesh>
      {/* Two solar panels on their struts */}
      {[1, -1].map((side) => (
        <group key={side}>
          <mesh material={materials.metal} position={[0, side * 3, 0]}>
            <boxGeometry args={[0.6, 1.6, 0.6]} />
          </mesh>
          <mesh material={materials.panel} position={[0, side * 8.3, 0]}>
            <boxGeometry args={[4, 9.6, 0.4]} />
          </mesh>
        </group>
      ))}
    </group>
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
  const { size } = useThree();
  const sunWorld = toWorld(sun.x, sun.y, size.width, size.height);
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
      {/* Light for the satellite (the planets light themselves): from the photo, and from the front */}
      <ambientLight intensity={0.9} />
      <pointLight position={[sunWorld.x, sunWorld.y, 260]} intensity={3.2} decay={0} />
      <Satellite layout={layout} />
    </>
  );
};

const MenuSky = ({ layout }: { layout: MenuLayout }) => (
  <Canvas
    orthographic
    frameloop={testDrive ? 'never' : 'always'}
    // Drawn at twice the screen's resolution (and scaled down): bodies a few px wide come out smooth
    // and sharp. The canvas is only the menu column, and mostly empty.
    dpr={Math.min(3, (typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1) * 2)}
    gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    camera={{ position: [0, 0, 2000], zoom: 1, near: 1, far: 4000 }}
    style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
  >
    <Sky layout={layout} />
  </Canvas>
);

export default MenuSky;
