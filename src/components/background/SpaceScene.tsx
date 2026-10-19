import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { advance, Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { journey, lowPower, testDrive } from '@/lib/motion';
import { boot, bootError, diagnosing } from '@/lib/diag';
import { navItems, type Body } from '@/data/navigation';
import {
  atmosphereFragment,
  auroraFragment,
  cloudsFragment,
  coronaVertex,
  earthFragment,
  moonFragment,
  planetFragment,
  ringTexFragment,
  ringVertex,
  sphereVertex,
  starsFragment,
  starsVertex,
  sunFragment,
  sunHaloFragment,
  texturedFragment,
  uranusRingFragment,
} from './shaders';
import { mapsReady, mapUniform, pumpMaps } from './maps';
import type { MapId } from './mapQueue';

if (testDrive) {
  let clock = 0;
  const w = window as unknown as { __advance: (s: number) => void; __journey: typeof journey };
  w.__advance = (seconds: number) => {
    for (let i = 0; i < Math.round(seconds * 60); i++) advance((clock += 1 / 60));
  };
  w.__journey = journey;
}

/* One body per section, alone on the stage: when you move to the next section the current planet
   leaves the screen upwards, and only then the next one rises in from below. While its section is
   read the planet comes closer and shows what makes it itself, and stays close until it leaves.
   The stars drift a little meanwhile, just enough to feel the movement. */

type Stop = Exclude<Body, 'neptune' | 'pluto'>;
const STOPS = navItems.map((n) => n.body) as Stop[];
const at = (stop: Stop) => STOPS.indexOf(stop);

const FOV = 50;
const TAN = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
const TAU = Math.PI * 2;

/** The planets are lit from the front-left: the night side shows as a crescent on the right. */
const LIGHT = new THREE.Vector3(-0.78, 0.3, 0.55).normalize();

const shared = { uLight: { value: LIGHT.clone() } };
const time = { value: 0 };

/** Where the page is, smoothed, and the screen's shape: written by the rig, read by every body. */
const stage = { t: journey.t, pos: journey.pos, travel: journey.t, aspect: 1, wide: 1 };

/** How close each body has come (0 = at rest, 1 = as close as it gets): written by the rig. */
const zoom = Object.fromEntries(STOPS.map((s) => [s, 0])) as Record<Stop, number>;

/**
 * The bodies are seen by their own camera, which looks straight at the one on stage and shifts the
 * picture to where it sits on the screen (a shifted lens, like an architect's camera): the planet is
 * seen face-on wherever it is, round, and its moons around it as from right in front.
 */
const bodyCamera = new THREE.PerspectiveCamera(FOV, 1, 0.05, 2000);
const lens = { x: 0, y: 0 };

const sunLight = new THREE.DirectionalLight('#fff4e6', 2.4);
sunLight.layers.enableAll();

const SPHERE = new THREE.SphereGeometry(1, 128, 128);
const SHELL = new THREE.SphereGeometry(1, 96, 64);
const SMALL_SPHERE = new THREE.SphereGeometry(1, 48, 32);
const SQUARE = new THREE.PlaneGeometry(1, 1);

const lerp = THREE.MathUtils.lerp;
const smoothstep = THREE.MathUtils.smoothstep;
const clamp = THREE.MathUtils.clamp;
const easeOut = (u: number) => 1 - Math.pow(1 - u, 3);
const easeIn = (u: number) => u * u * u;
const wrap = (a: number) => a - TAU * Math.floor((a + Math.PI) / TAU);

const color = (hex: string) => ({ value: new THREE.Color(hex) });

function sphereMaterial(fragmentShader: string, uniforms: Record<string, THREE.IUniform>, defines: Record<string, string | number> = {}) {
  const m = new THREE.ShaderMaterial({ vertexShader: sphereVertex, fragmentShader, uniforms: { ...shared, uTime: time, ...uniforms }, defines });
  m.extensions.derivatives = true;
  return m;
}

/** Light added on top (glows, aurorae): never darkens what is behind it, never tone-mapped. */
function glowMaterial(fragmentShader: string, uniforms: Record<string, THREE.IUniform>) {
  const m = sphereMaterial(fragmentShader, uniforms);
  m.transparent = true;
  m.blending = THREE.AdditiveBlending;
  m.depthWrite = false;
  m.toneMapped = false;
  return m;
}

/**
 * Turns a body so that one of its places faces us as it comes close (z → 1), freely otherwise: the
 * turn still to make is fixed while the body is at rest, and given back in step with the zoom.
 */
function facer(target: number, spin: number, start = 0) {
  let free = start;
  let offset = NaN;
  return (dt: number, z: number) => {
    // Also on the first frame: the page may open already close to the planet (a reload, a link).
    if (z <= 0 || Number.isNaN(offset)) offset = wrap(target - free);
    free += dt * spin * (1 - 0.8 * z);
    return free + offset * z;
  };
}

/** The rotation that brings map coordinate u in front of the camera (three's sphere layout). */
const facing = (u: number) => Math.PI / 2 - TAU * u;

/* ------------------------------------------------------------------ The stage */

/** Centre (in screen units, -1…1) and apparent radius (fraction of half the screen height) at rest. */
interface Pose {
  x: number;
  y: number;
  size: number;
}

/**
 * Wide screens: the planet on the right of the text. Phones: big, in the empty band above the title
 * (SectionHeader), whole when the section's top reaches the top of the screen. The Sun peeks in
 * from the top-right corner.
 */
const REST: Record<Stop, { wide: Pose; tall: Pose }> = {
  sun: { wide: { x: 0.84, y: 0.74, size: 0.3 }, tall: { x: 0.62, y: 0.82, size: 0.3 } },
  mercury: { wide: { x: 0.5, y: 0.04, size: 0.4 }, tall: { x: 0, y: 0.38, size: 0.29 } },
  venus: { wide: { x: 0.5, y: 0.04, size: 0.46 }, tall: { x: 0, y: 0.38, size: 0.32 } },
  earth: { wide: { x: 0.5, y: 0.04, size: 0.44 }, tall: { x: -0.06, y: 0.38, size: 0.3 } },
  mars: { wide: { x: 0.5, y: 0.04, size: 0.42 }, tall: { x: 0, y: 0.38, size: 0.3 } },
  jupiter: { wide: { x: 0.6, y: 0.02, size: 0.47 }, tall: { x: 0, y: 0.38, size: 0.33 } },
  saturn: { wide: { x: 0.48, y: 0.06, size: 0.3 }, tall: { x: 0, y: 0.38, size: 0.2 } },
  uranus: { wide: { x: 0.5, y: 0.04, size: 0.42 }, tall: { x: 0, y: 0.38, size: 0.3 } },
};

/** How far beyond the screen edge a body hides, counting its glow, rings or moons (in radii). */
const REACH: Partial<Record<Stop, number>> = { sun: 2.4, saturn: 2.5, earth: 2.6, jupiter: 2.2, mars: 2, uranus: 2.4 };

/**
 * How each body comes close while its section is read: how much nearer (near), where it slides
 * (dx, dy), over which stretch of the section (window), and where the light goes meanwhile.
 */
interface Focus {
  near: number;
  dx?: number;
  dy?: number;
  window?: [number, number];
  light?: THREE.Vector3;
}

const FOCUS: Record<Stop, Focus> = {
  sun: { near: 0.4, dx: 0.1, dy: 0.1 },
  // The light swings round to graze the surface, every crater stands out; it slides right, half off
  // the screen, a big crescent beside the text.
  mercury: { near: 0.35, dx: 0.3, light: new THREE.Vector3(-0.9, 0.25, 0.3).normalize() },
  venus: { near: 0.28, dx: 0.06 },
  // The Sun goes behind the Earth: its night side, the cities and the aurora.
  earth: { near: 0.25, dx: 0.06, light: new THREE.Vector3(-0.95, -0.25, -0.2).normalize() },
  // Morning comes from the right: the side beside the certificates is lit, Phobos crossing it.
  mars: { near: 0.3, dx: 0.16, light: new THREE.Vector3(0.5, 0.35, 0.79).normalize() },
  // A higher Sun: the whole face lit, Io's shadow a round black dot just beside it.
  jupiter: { near: 0.3, dx: 0.02, light: new THREE.Vector3(-0.35, 0.25, 0.9).normalize() },
  // Closer, and slid down-right so the near side of the rings crosses the screen.
  saturn: { near: 0.62, dx: 0.14, dy: -0.34, window: [0.16, 0.6] },
  uranus: { near: 0.2, dx: 0.04, window: [0.15, 1] },
};

/**
 * How close body i is: it comes closer while its section is read and stays close while it leaves
 * (the reading position is past its section by then). When a jump brings it in already partly
 * read, it comes close as it arrives.
 */
function zoomAt(i: number, stop: Stop) {
  const s = stage.t - i;
  const [a, b] = FOCUS[stop].window ?? [0.08, 0.42];
  const enter = s < 0 ? smoothstep(s, -0.5, 0) : 1;
  return smoothstep(clamp(stage.pos - i, 0, 1), a, b) * enter;
}

interface Placed {
  group: THREE.Group;
  index: number;
  stop: Stop;
  maps: readonly MapId[];
}

const placed: Placed[] = [];

/**
 * Body i at the current point of the page: resting, rising in from below (the second half of the
 * way from the section before), or leaving upwards (the first half of the way to the next); hidden
 * while it is off stage or its maps have not arrived yet.
 */
function place({ group, index, stop, maps }: Placed) {
  const s = stage.t - index;
  if (s <= -0.5 || s >= 0.5 || !mapsReady(maps)) {
    group.visible = false;
    return;
  }
  group.visible = true;
  const r = REST[stop];
  const f = FOCUS[stop];
  const z = zoom[stop];
  const w = stage.wide;
  const mul = 1 - f.near * z;
  const size = lerp(r.tall.size, r.wide.size, w);
  let x = lerp(r.tall.x, r.wide.x, w) + (f.dx ?? 0) * z;
  let y = lerp(r.tall.y, r.wide.y, w) + (f.dy ?? 0) * z;
  const edge = 1.08 + (size / mul) * (REACH[stop] ?? 1.2);
  if (s < 0) {
    const u = easeOut((s + 0.5) / 0.5);
    x += (1 - u) * 0.16;
    y = lerp(-edge, y, u);
  } else {
    const u = easeIn(s / 0.5);
    x -= u * 0.1;
    y = lerp(y, edge + (stop === 'sun' ? 0.2 : 0), u);
  }
  // Distance that gives the wanted apparent size (nearer as it comes close).
  group.position.set(0, 0, -mul / (size * TAN));
  lens.x = x;
  lens.y = y;
}

/** Puts its body (radius 1) on the stage; the rig places it every frame. */
const OnStage = ({ stop, maps, children }: { stop: Stop; maps: readonly MapId[]; children: ReactNode }) => {
  const ref = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    const group = ref.current;
    if (!group) return;
    group.visible = false;
    const p: Placed = { group, index: at(stop), stop, maps };
    placed.push(p);
    return () => void placed.splice(placed.indexOf(p), 1);
  }, [stop, maps]);
  return <group ref={ref}>{children}</group>;
};

/* ------------------------------------------------------------------ Atmospheres */

const Atmosphere = ({ tint, scale = 1.1, power = 1.8, intensity = 1.4 }: { tint: string; scale?: number; power?: number; intensity?: number }) => {
  const [material] = useState(() => {
    const m = sphereMaterial(atmosphereFragment, { uColor: color(tint), uPower: { value: power }, uIntensity: { value: intensity } });
    m.side = THREE.BackSide;
    m.transparent = true;
    m.blending = THREE.AdditiveBlending;
    m.depthWrite = false;
    return m;
  });
  useEffect(() => () => material.dispose(), [material]);
  return <mesh scale={scale} material={material} geometry={SHELL} renderOrder={3} />;
};

/* ------------------------------------------------------------------ The Sun */

type V3 = [number, number, number];
interface SunLook {
  /** Colour in the middle of the disc (linear, may pass 1: the middle then saturates), and how much darker the edge gets. */
  tint: V3;
  limb1: V3;
  limb2: V3;
  /** The fringe's colour, how much gas rises above the edge, the light spilling past it. */
  rim: V3;
  prom: number;
  glow: number;
}

/**
 * Three looks to choose from (`?sole=1`, `2`, `3` in the address; no choice = 2), until one is picked:
 * 1 the earlier one a little brighter, with a clean edge; 2 brighter and golden, gas above the edge and
 * the light spilling past it; 3 deep orange, as in photos through a hydrogen filter.
 */
const SUN_LOOKS: Record<string, SunLook> = {
  1: { tint: [1.1, 0.66, 0.22], limb1: [0.5, 0.64, 0.8], limb2: [0.12, 0.15, 0.12], rim: [0.68, 0.2, 0.03], prom: 0, glow: 0 },
  2: { tint: [1.12, 0.78, 0.34], limb1: [0.42, 0.62, 0.85], limb2: [0.16, 0.16, 0.1], rim: [0.75, 0.26, 0.045], prom: 1, glow: 1 },
  3: { tint: [1.05, 0.62, 0.15], limb1: [0, 0.36, 1.7], limb2: [0.3, 0.5, -0.74], rim: [0.8, 0.17, 0.02], prom: 1, glow: 0.6 },
};
const sunLook = SUN_LOOKS[new URLSearchParams(location.search).get('sole') ?? ''] ?? SUN_LOOKS[2];
const vec3 = (v: V3) => ({ value: new THREE.Vector3(...v) });

const Sun = () => {
  const [surface] = useState(() => {
    const m = sphereMaterial(sunFragment, { uTint: vec3(sunLook.tint), uLimb1: vec3(sunLook.limb1), uLimb2: vec3(sunLook.limb2) });
    m.toneMapped = false;
    return m;
  });
  const [halo] = useState(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: coronaVertex,
        fragmentShader: sunHaloFragment,
        uniforms: { uTime: time, uDisc: { value: 0.25 }, uRim: vec3(sunLook.rim), uProm: { value: sunLook.prom }, uGlow: { value: sunLook.glow } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
  );
  useEffect(() => () => (surface.dispose(), halo.dispose()), [surface, halo]);
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    const sun = ref.current;
    if (!sun) return;
    sun.rotation.y += dt * 0.015;
    // The disc as seen from this distance is a little bigger than the Sun's cross-section.
    const d = Math.max(-(sun.parent?.position.z ?? -10), 1.5);
    halo.uniforms.uDisc.value = 0.25 / Math.sqrt(1 - 1 / (d * d));
  });
  return (
    <>
      <mesh ref={ref} material={surface} geometry={SPHERE} />
      {/* The square already faces the camera: this camera always looks straight at the body on stage. */}
      <mesh material={halo} scale={4} geometry={SQUARE} renderOrder={2} />
    </>
  );
};

/* ------------------------------------------------------------------ Planets from their maps */

interface Look {
  atmo?: string;
  atmoStrength?: number;
  ambient?: number;
  terminator?: number;
  /** 0 rocky limb, 1 a gas giant's dark limb. */
  limb?: number;
}

function planetMaterial(map: MapId, look: Look, defines: Record<string, string | number> = {}, extra: Record<string, THREE.IUniform> = {}) {
  return sphereMaterial(
    planetFragment,
    {
      uMap: mapUniform(map),
      uAtmo: color(look.atmo ?? '#000000'),
      uAtmoStrength: { value: look.atmoStrength ?? 0 },
      uAmbient: { value: look.ambient ?? 0.015 },
      uTerminator: { value: look.terminator ?? 0.1 },
      uLimb: { value: look.limb ?? 0 },
      uDetail: { value: 0 },
      ...extra,
    },
    defines,
  );
}

/* ------------------------------------------------------------------ Moons */

interface MoonLook {
  /** 0 Io, 1 Europa, 2 Ganymede, 3 Callisto, 4 bare rock (see moonFragment). */
  kind: number;
  a: string;
  b: string;
  seed: number;
}

interface MoonSpec {
  r: number;
  orbit: number;
  /** Radians per second, and where it starts. */
  speed: number;
  phase: number;
  look: MoonLook;
  geometry?: THREE.BufferGeometry;
}

/** A small moon that is not round: a fine sphere pushed in and out, stretched, with a big crater. */
function lumpyGeometry(stretch: [number, number, number], seed: number) {
  let g: THREE.BufferGeometry = new THREE.IcosahedronGeometry(1, 4);
  g.deleteAttribute('normal');
  g.deleteAttribute('uv');
  g = mergeVertices(g);
  const p = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  const crater = new THREE.Vector3(0.7, 0.3, 0.65).normalize();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    let k = 1 + 0.08 * Math.sin(v.x * 3.1 + seed) * Math.cos(v.y * 2.3 - seed) + 0.04 * Math.sin(v.z * 7.7 + v.x * 5.3 + seed * 2);
    k -= 0.14 * Math.exp(-v.distanceToSquared(crater) / 0.09);
    p.setXYZ(i, v.x * k * stretch[0], v.y * k * stretch[1], v.z * k * stretch[2]);
  }
  g.computeVertexNormals();
  return g;
}

/** Moons come at most NEAR_KNEE + NEAR_ROOM planet radii towards the camera. */
const NEAR_KNEE = 1.3;
const NEAR_ROOM = 0.6;

/**
 * Moons going round their planet (in its equator, seen a little from above: `inc`), darkened in its
 * shadow. One of them (`transit`) is eased, as the planet comes close, to a set place in front of the
 * disc (`at`: planet radii from its centre, x right, y up, z towards us); `occ` receives where they
 * are, for their shadows on the planet.
 */
const Moons = ({ specs, stop, inc = 0, transit, occ }: { specs: MoonSpec[]; stop: Stop; inc?: number; transit?: { index: number; at: THREE.Vector3 }; occ?: THREE.Vector4[] }) => {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const [shadow] = useState(() => new THREE.Vector4(0, 0, 0, 1));
  const [materials] = useState(() =>
    specs.map((s) => sphereMaterial(moonFragment, { uKind: { value: s.look.kind }, uColA: color(s.look.a), uColB: color(s.look.b), uSeed: { value: s.look.seed }, uShadow: { value: shadow } })),
  );
  useEffect(() => () => materials.forEach((m) => m.dispose()), [materials]);
  const [angles] = useState(() => specs.map((s) => ({ free: s.phase, offset: NaN })));
  const [w] = useState(() => new THREE.Vector3());
  const [q] = useState(() => new THREE.Quaternion());
  const [back] = useState(() => new THREE.Quaternion());
  const [target] = useState(() => new THREE.Vector3());
  useFrame((_, dt) => {
    const z = zoom[stop];
    const parent = refs.current[0]?.parent;
    if (!parent) return;
    parent.getWorldPosition(w);
    shadow.set(w.x, w.y, w.z, 1);
    parent.getWorldQuaternion(q);
    back.copy(q).invert();
    if (transit) target.copy(transit.at).applyQuaternion(back);
    specs.forEach((s, i) => {
      const mesh = refs.current[i];
      if (!mesh) return;
      const a = angles[i];
      let angle = a.free;
      let tilt = inc;
      let radius = s.orbit;
      let lift = 0;
      if (transit?.index === i) {
        // Along its orbit to the place in front of the disc, drifting only a little once there.
        if (z <= 0 || Number.isNaN(a.offset)) a.offset = wrap(Math.atan2(target.z, target.x) - a.free);
        a.free += dt * s.speed * (1 - 0.92 * z);
        angle = a.free + a.offset * z;
        tilt = inc * (1 - z);
        radius = THREE.MathUtils.lerp(s.orbit, Math.hypot(target.x, target.z), z);
        lift = target.y * z;
      } else a.free += dt * s.speed;
      mesh.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius * Math.sin(tilt) + lift, Math.sin(angle) * radius * Math.cos(tilt));
      // The near side of a wide orbit is pulled back a little, so a moon never sweeps past right in
      // front of the camera when the planet is close (it would fill the screen).
      mesh.position.applyQuaternion(q);
      const near = mesh.position.z - NEAR_KNEE;
      if (near > 0) mesh.position.z = NEAR_KNEE + NEAR_ROOM * (1 - Math.exp(-near / NEAR_ROOM));
      mesh.position.applyQuaternion(back);
      // Always the same face to the planet.
      mesh.rotation.y = -angle;
      if (occ) {
        mesh.getWorldPosition(w);
        occ[i].set(w.x, w.y, w.z, s.r);
      }
    });
  });
  return (
    <>
      {specs.map((s, i) => (
        <mesh
          key={i}
          ref={(m) => {
            refs.current[i] = m;
          }}
          material={materials[i]}
          geometry={s.geometry ?? SMALL_SPHERE}
          scale={s.r}
        />
      ))}
    </>
  );
};

/* ------------------------------------------------------------------ Mercury: craters under a grazing Sun */

const Mercury = () => {
  const [surface] = useState(() => planetMaterial('mercury', { ambient: 0.012, terminator: 0.04 }, { BUMP: '' }, { uBump: { value: 0.01 } }));
  useEffect(() => () => surface.dispose(), [surface]);
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    const z = zoom.mercury;
    if (ref.current) ref.current.rotation.y += dt * 0.02 * (1 - 0.6 * z);
    surface.uniforms.uDetail.value = z;
  });
  return (
    <group rotation={[0, 0, 0.02]}>
      <mesh ref={ref} material={surface} geometry={SPHERE} />
    </group>
  );
};

/* ------------------------------------------------------------------ Venus: the clouds racing round, the polar vortex */

const Venus = () => {
  const [surface] = useState(() =>
    planetMaterial('venus', { atmo: '#ffe2a8', atmoStrength: 0.7, ambient: 0.02, terminator: 0.22, limb: 0.4 }, { FLOW: 3, VORTEX: '' }),
  );
  useEffect(() => () => surface.dispose(), [surface]);
  const pole = useRef<THREE.Group>(null);
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    const z = zoom.venus;
    // It leans towards us, showing its north pole.
    if (pole.current) pole.current.rotation.x = 0.6 * z;
    if (ref.current) ref.current.rotation.y += dt * 0.012;
  });
  return (
    <group ref={pole}>
      <group rotation={[0, 0, 0.05]}>
        <mesh ref={ref} material={surface} geometry={SPHERE} />
        <Atmosphere tint="#ffd38a" scale={1.06} power={2.2} intensity={1.1} />
      </group>
    </group>
  );
};

/* ------------------------------------------------------------------ Earth: Italy by night, the aurora, the Moon */

const Earth = () => {
  const [surface] = useState(() =>
    sphereMaterial(earthFragment, {
      uDay: mapUniform('earthDay'),
      uNight: mapUniform('earthNight'),
      uSpec: mapUniform('earthSpec'),
      uClouds: mapUniform('earthClouds'),
      uCloudShift: { value: 0 },
    }),
  );
  const [clouds] = useState(() => {
    const m = sphereMaterial(cloudsFragment, { uClouds: mapUniform('earthClouds') });
    m.transparent = true;
    m.depthWrite = false;
    return m;
  });
  const [moon] = useState(() => sphereMaterial(texturedFragment, { uMap: mapUniform('moon') }));
  const [aurora] = useState(() => [0, 1].map((top) => glowMaterial(auroraFragment, { uStrength: { value: 0 }, uTop: { value: top } })));
  useEffect(() => () => [surface, clouds, moon, ...aurora].forEach((m) => m.dispose()), [surface, clouds, moon, aurora]);

  // Italy (about 12.5° E) turns to face us as the Earth comes close.
  const [face] = useState(() => facer(facing(0.538), 0.03, 3.6));
  const cloudAngle = useRef(0);
  const planet = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const moonRef = useRef<THREE.Mesh>(null);
  useFrame((state, dt) => {
    const z = zoom.earth;
    const rs = face(dt, z);
    cloudAngle.current += dt * 0.038;
    if (planet.current) planet.current.rotation.y = rs;
    if (cloudRef.current) cloudRef.current.rotation.y = cloudAngle.current;
    // Where the clouds are over the ground (for their shadows and to dim the cities under them).
    const shift = (rs - cloudAngle.current) / TAU;
    surface.uniforms.uCloudShift.value = shift - Math.floor(shift);
    aurora.forEach((m) => (m.uniforms.uStrength.value = 0.15 + 0.4 * z));
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
        <mesh ref={planet} material={surface} geometry={SPHERE} />
        <mesh ref={cloudRef} scale={1.012} material={clouds} geometry={SPHERE} renderOrder={1} />
        <mesh scale={1.025} material={aurora[0]} geometry={SHELL} renderOrder={2} />
        <mesh scale={1.042} material={aurora[1]} geometry={SHELL} renderOrder={2} />
        <Atmosphere tint="#5a94ff" scale={1.08} power={1.8} intensity={1.6} />
      </group>
      <mesh ref={moonRef} scale={0.27} material={moon} geometry={SMALL_SPHERE} />
    </group>
  );
};

/* ------------------------------------------------------------------ Mars: Valles Marineris, Phobos and Deimos */

const MARS_MOONS: MoonSpec[] = [
  { r: 0.05, orbit: 2.76, speed: 0.11, phase: 1, look: { kind: 4, a: '#3d342d', b: '#5e5045', seed: 1.7 }, geometry: lumpyGeometry([1.3, 0.9, 1.05], 1.7) },
  { r: 0.03, orbit: 3.4, speed: 0.028, phase: 4, look: { kind: 4, a: '#4a4038', b: '#6b5d50', seed: 5.1 }, geometry: lumpyGeometry([1.2, 0.85, 1], 5.1) },
];

/** In front of the right half of the disc, its shadow on the lit ground beside it. */
const PHOBOS_AT = new THREE.Vector3(0.455, 0.17, 1.14);

const Mars = () => {
  const [occ] = useState(() => MARS_MOONS.map(() => new THREE.Vector4()));
  const [surface] = useState(() =>
    planetMaterial(
      'mars',
      { atmo: '#ff9a6a', atmoStrength: 0.35, ambient: 0.012, terminator: 0.08 },
      { BUMP: '', OCCLUDERS: MARS_MOONS.length },
      { uBump: { value: 0.006 }, uOcc: { value: occ } },
    ),
  );
  useEffect(() => () => surface.dispose(), [surface]);
  // The great canyon turns to face us, a little right of the centre (in the morning light).
  const [face] = useState(() => facer(facing(0.3) + 0.4, 0.035));
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    const z = zoom.mars;
    if (ref.current) ref.current.rotation.y = face(dt, z);
    surface.uniforms.uDetail.value = z;
  });
  return (
    <group rotation={[0, 0, 0.44]}>
      <mesh ref={ref} material={surface} geometry={SPHERE} />
      <Atmosphere tint="#ff8a5c" scale={1.04} power={2.6} intensity={0.7} />
      {/* Phobos crosses in front of the disc as Mars comes close. */}
      <Moons specs={MARS_MOONS} stop="mars" inc={0.1} transit={{ index: 0, at: PHOBOS_AT }} occ={occ} />
    </group>
  );
};

/* ------------------------------------------------------------------ Jupiter: the Great Red Spot, the four moons */

const GALILEANS: MoonSpec[] = [
  { r: 0.045, orbit: 1.6, speed: 0.12, phase: 0.8, look: { kind: 0, a: '#c2ad66', b: '#e6d9a0', seed: 1.3 } },
  { r: 0.04, orbit: 2, speed: 0.06, phase: 3.4, look: { kind: 1, a: '#d4c9b4', b: '#efe8dc', seed: 4.1 } },
  { r: 0.06, orbit: 2.6, speed: 0.03, phase: 5.2, look: { kind: 2, a: '#5f574e', b: '#82786c', seed: 7.7 } },
  { r: 0.055, orbit: 3.1, speed: 0.0128, phase: 2.1, look: { kind: 3, a: '#3b342d', b: '#554c43', seed: 9.2 } },
];

/** Io over the upper half of the disc, its shadow on the clouds just below it, clear of the storm. */
const IO_AT = new THREE.Vector3(0.015, 0.355, 1.22);

/** The Great Red Spot on the map (u, v) → a direction on the planet. */
function dirOf(u: number, v: number) {
  const y = -Math.cos(v * Math.PI);
  const r = Math.sqrt(1 - y * y);
  return new THREE.Vector3(-Math.cos(TAU * u) * r, y, Math.sin(TAU * u) * r);
}

const Jupiter = () => {
  const [occ] = useState(() => GALILEANS.map(() => new THREE.Vector4()));
  const [surface] = useState(() =>
    planetMaterial(
      'jupiter',
      { atmo: '#f0cfa0', atmoStrength: 0.35, ambient: 0.015, terminator: 0.12, limb: 1 },
      { FLOW: 1, SPOT: '', GAS: '', OCCLUDERS: GALILEANS.length },
      { uSpot: { value: dirOf(0.365, 0.385) }, uSpotR: { value: 0.11 }, uOcc: { value: occ } },
    ),
  );
  useEffect(() => () => surface.dispose(), [surface]);
  // The storm turns to face us, a little left of the centre (where Io's shadow does not cover it).
  const [face] = useState(() => facer(facing(0.365) - 0.35, 0.05));
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    const z = zoom.jupiter;
    if (ref.current) ref.current.rotation.y = face(dt, z);
    surface.uniforms.uDetail.value = z;
  });
  return (
    <group rotation={[0, 0, 0.05]}>
      <mesh ref={ref} material={surface} geometry={SPHERE} />
      <Atmosphere tint="#e8b880" scale={1.035} power={2.6} intensity={0.55} />
      {/* Io comes in front of the disc, its shadow on the clouds beside it. */}
      <Moons specs={GALILEANS} stop="jupiter" inc={0.12} transit={{ index: 0, at: IO_AT }} occ={occ} />
    </group>
  );
};

/* ------------------------------------------------------------------ Saturn: the hexagon, rings made of rocks */

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
  const [geometry] = useState(() => rockGeometry(detail));
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

/** The rings give way to the rocks as the camera comes close. */
const saturnFade = { value: 1 };

const Saturn = ({ rocks }: { rocks: number }) => {
  const [centre] = useState(() => new THREE.Vector3());
  const [normal] = useState(() => new THREE.Vector3(0, 1, 0));
  const [surface] = useState(() =>
    planetMaterial(
      'saturn',
      { atmo: '#f2dca8', atmoStrength: 0.3, ambient: 0.015, terminator: 0.12, limb: 1 },
      { FLOW: 2, GAS: '', HEXAGON: '', RINGSHADOW: '' },
      { uRingMap: mapUniform('saturnRing'), uRingNormal: { value: normal }, uCentre: { value: centre }, uRingSpan: { value: new THREE.Vector2(1.24, 2.27) } },
    ),
  );
  const [ring] = useState(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: ringVertex,
        fragmentShader: ringTexFragment,
        uniforms: {
          ...shared,
          uPlanet: { value: centre },
          uPlanetR: { value: 1 },
          uInner: { value: 1.24 },
          uOuter: { value: 2.27 },
          uMap: mapUniform('saturnRing'),
          uFade: saturnFade,
        },
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
  );
  useEffect(() => () => (surface.dispose(), ring.dispose()), [surface, ring]);
  const lean = useRef<THREE.Group>(null);
  const axis = useRef<THREE.Group>(null);
  const body = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    const z = zoom.saturn;
    saturnFade.value = 1 - z * 0.4;
    surface.uniforms.uDetail.value = z;
    if (lean.current) lean.current.rotation.x = z * 0.16;
    if (body.current) body.current.rotation.y += dt * 0.045;
    const g = axis.current;
    if (!g) return;
    g.updateWorldMatrix(true, false);
    centre.setFromMatrixPosition(g.matrixWorld);
    normal.set(0, 1, 0).transformDirection(g.matrixWorld);
  });
  return (
    <group ref={lean}>
      <group ref={axis} rotation={[0.42, 0, -0.32]}>
        <mesh ref={body} material={surface} geometry={SPHERE} />
        <mesh rotation={[Math.PI / 2, 0, 0]} material={ring} renderOrder={1}>
          <ringGeometry args={[1.24, 2.27, 256, 1]} />
        </mesh>
        {/* Mostly gravel (simple shapes, many), a few boulders (finer shapes). */}
        <RingRocks count={rocks} detail={0} min={0.0018} max={0.0065} power={1.6} />
        <RingRocks count={Math.round(rocks / 12)} detail={1} min={0.007} max={0.028} power={3} />
      </group>
    </group>
  );
};

/* ------------------------------------------------------------------ Uranus: rolling on its side, rings and moons round its pole */

const URANIANS: MoonSpec[] = [
  { r: 0.022, orbit: 2.3, speed: 0.09, phase: 0.3, look: { kind: 4, a: '#6f6c69', b: '#9a9590', seed: 2.2 } },
  { r: 0.034, orbit: 2.7, speed: 0.06, phase: 2, look: { kind: 4, a: '#7d7a76', b: '#a8a39d', seed: 3.3 } },
  { r: 0.034, orbit: 3.1, speed: 0.04, phase: 4.1, look: { kind: 4, a: '#4a4845', b: '#625f5b', seed: 5.5 } },
  { r: 0.045, orbit: 3.55, speed: 0.025, phase: 5.6, look: { kind: 4, a: '#6e6862', b: '#938b83', seed: 6.6 } },
  { r: 0.043, orbit: 4, speed: 0.018, phase: 1.1, look: { kind: 4, a: '#635d58', b: '#857d76', seed: 8.8 } },
];

const UP = new THREE.Vector3(0, 1, 0);
/** At rest its axis lies almost across the view, the rings nearly edge-on; up close its pole faces us. */
const URANUS_REST = new THREE.Quaternion().setFromUnitVectors(UP, new THREE.Vector3(-0.92, -0.13, 0.36).normalize());
const URANUS_POLE = new THREE.Quaternion().setFromUnitVectors(UP, new THREE.Vector3(0, 0, 1));

const Uranus = () => {
  const [centre] = useState(() => new THREE.Vector3());
  const [surface] = useState(() =>
    planetMaterial('uranus', { atmo: '#a8f4f4', atmoStrength: 0.8, ambient: 0.02, terminator: 0.18, limb: 0.6 }, { ICEGIANT: '' }),
  );
  const [rings] = useState(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: ringVertex,
        fragmentShader: uranusRingFragment,
        uniforms: { ...shared, uPlanet: { value: centre }, uPlanetR: { value: 1 }, uOpacity: { value: 0.55 } },
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        extensions: { derivatives: true },
      }),
  );
  useEffect(() => () => (surface.dispose(), rings.dispose()), [surface, rings]);
  const axis = useRef<THREE.Group>(null);
  const body = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    const z = zoom.uranus;
    if (body.current) body.current.rotation.y += dt * 0.03;
    const g = axis.current;
    if (!g) return;
    g.quaternion.slerpQuaternions(URANUS_REST, URANUS_POLE, z * z * (3 - 2 * z));
    g.getWorldPosition(centre);
  });
  return (
    <group ref={axis}>
      <mesh ref={body} material={surface} geometry={SPHERE} />
      <Atmosphere tint="#7fe6e6" scale={1.05} power={2.2} intensity={0.9} />
      <mesh rotation={[Math.PI / 2, 0, 0]} material={rings} renderOrder={1}>
        <ringGeometry args={[1.6, 2.05, 256, 1]} />
      </mesh>
      <Moons specs={URANIANS} stop="uranus" />
    </group>
  );
};

/* ------------------------------------------------------------------ Stars */

/** White stars all around, each at its own steady brightness. They turn a little as the trip goes on. */
const Stars = ({ count }: { count: number }) => {
  const [points] = useState(() => {
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
    const p = new THREE.Points(g, m);
    p.frustumCulled = false;
    // Seen by the sky's own camera only, which never shifts: the stars stay put while planets move.
    p.layers.set(1);
    return p;
  });
  useEffect(() => () => (points.geometry.dispose(), (points.material as THREE.Material).dispose()), [points]);
  useFrame(() => {
    points.rotation.x = -stage.travel * 0.03;
    points.rotation.y = stage.travel * 0.018;
  });
  return <primitive object={points} />;
};

/* ------------------------------------------------------------------ Rig and render */

/** The veil over the sky (CosmicBackground) opens round the Sun on phones while it is on stage. */
let veil: HTMLElement | null = null;
let veilSun = -1;
function openVeil() {
  const v = Math.round((1 - smoothstep(stage.t, 0.15, 0.5)) * 20) / 20;
  if (v === veilSun) return;
  veil ??= document.querySelector<HTMLElement>('.sky-veil');
  if (!veil) return;
  veil.style.setProperty('--sun', String(v));
  veilSun = v;
}

/** The camera never moves (not even with the mouse): only the page moves the sky. */
const Rig = () => {
  const { size, gl } = useThree();
  // Runs before the bodies (negative priority), so they all read the same moment.
  useFrame((state, dt) => {
    const d = Math.min(Math.max(dt, 0), 0.05);
    time.value = state.clock.elapsedTime;
    if (testDrive) Object.assign(window, { __stage: stage, __scene: state.scene, __zoom: zoom, __camB: bodyCamera });
    pumpMaps(gl);
    stage.aspect = size.width / Math.max(1, size.height);
    stage.wide = smoothstep(stage.aspect, 0.8, 1.35);
    if (journey.jump) {
      // A menu jump: the page glides already eased, the sky follows it exactly.
      stage.t = journey.t;
      stage.pos = journey.pos;
      stage.travel = journey.travel;
    } else {
      // Back from a hidden tab (or a long stall): be where the page is, no slow catch-up.
      const k = dt > 0.25 || dt < 0 ? 1 : 1 - Math.exp(-d * 3.2);
      stage.t += (journey.t - stage.t) * k;
      stage.pos += (journey.pos - stage.pos) * k;
      stage.travel += (journey.travel - stage.travel) * k;
    }
    journey.shown = stage.t;
    journey.shownPos = stage.pos;
    STOPS.forEach((stop, i) => (zoom[stop] = zoomAt(i, stop)));

    const on = STOPS[clamp(Math.round(stage.t), 0, STOPS.length - 1)];
    const towards = FOCUS[on].light;
    shared.uLight.value.copy(LIGHT);
    if (towards) shared.uLight.value.lerp(towards, zoom[on]).normalize();
    sunLight.position.copy(shared.uLight.value).multiplyScalar(100);

    placed.forEach(place);
    openVeil();
  }, -1);
  return null;
};

/**
 * Draws the sky (stars, from the fixed camera), then the body on stage (from its camera). Before
 * the first picture every shader is compiled in the background and every body drawn once into a
 * single pixel: no section ever stalls the first time its planet shows.
 */
const Render = ({ onReady }: { onReady?: () => void }) => {
  const { gl, scene, camera, size } = useThree();
  const phase = useRef<'compile' | 'warm' | 'live'>('compile');
  useEffect(() => {
    camera.layers.set(1);
    let alive = true;
    const warm = (capped: boolean) => {
      if (!alive || phase.current !== 'compile') return;
      phase.current = 'warm';
      boot.capped = capped;
      boot.phase = capped ? 'shader lenti, si parte senza aspettarli' : 'shader pronti';
    };
    boot.phase = 'compilazione degli shader';
    boot.compileStart = performance.now();
    try {
      gl.compileAsync(scene, bodyCamera)
        .catch(() => undefined)
        .then(() => {
          boot.compileEnd = performance.now();
          warm(false);
        });
    } catch (e) {
      bootError(`compileAsync: ${String(e)}`);
      warm(false);
    }
    // A graphics card that takes its time (or never says it is done) does not keep the sky empty:
    // past this, the warm-up draw below compiles whatever is left, all at once.
    const cap = window.setTimeout(() => warm(true), 1500);
    return () => {
      alive = false;
      window.clearTimeout(cap);
    };
  }, [gl, scene, camera]);

  useFrame(() => {
    const cam = bodyCamera;
    cam.aspect = size.width / Math.max(1, size.height);
    cam.updateProjectionMatrix();
    gl.autoClear = false;
    gl.clear();
    gl.render(scene, camera);
    if (phase.current === 'compile') return;
    if (phase.current === 'warm') {
      // Once only, whatever happens: a body that cannot be drawn must not keep the others hidden.
      phase.current = 'live';
      const saved = placed.map((p) => ({ visible: p.group.visible, z: p.group.position.z }));
      try {
        placed.forEach((p) => {
          p.group.visible = true;
          p.group.position.set(0, 0, -14);
        });
        gl.setScissorTest(true);
        gl.setScissor(0, 0, 1, 1);
        gl.render(scene, cam);
      } catch (e) {
        bootError(`warm-up: ${String(e)}`);
      } finally {
        gl.setScissorTest(false);
        placed.forEach((p, i) => {
          p.group.visible = saved[i].visible;
          p.group.position.z = saved[i].z;
        });
        boot.phase = 'in funzione';
        boot.ready = performance.now();
        onReady?.();
      }
    }
    cam.projectionMatrix.elements[8] = -lens.x;
    cam.projectionMatrix.elements[9] = -lens.y;
    cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
    gl.render(scene, cam);
  }, 1);
  return null;
};

/** What the diagnosis panel (`?diag`) shows about the graphics card and the start. */
function watchBoot(gl: THREE.WebGLRenderer) {
  boot.webgl2 = gl.capabilities.isWebGL2;
  gl.domElement.addEventListener('webglcontextlost', () => {
    boot.lost++;
    boot.phase = 'contesto WebGL perso';
  });
  gl.domElement.addEventListener('webglcontextrestored', () => (boot.phase = 'contesto WebGL ripristinato'));
  if (!diagnosing) return;
  const ctx = gl.getContext();
  const info = ctx.getExtension('WEBGL_debug_renderer_info');
  boot.gpu = String(ctx.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : ctx.RENDERER));
  gl.debug.onShaderError = (c, program, vs, fs) => {
    const log = c.getShaderInfoLog(fs) || c.getShaderInfoLog(vs) || c.getProgramInfoLog(program) || 'sconosciuto';
    console.error('THREE.WebGLProgram: shader error', log);
    bootError(`shader: ${log}`);
  };
}

/* ------------------------------------------------------------------ Scene */

const SUN_MAPS: readonly MapId[] = [];
const MERCURY_MAPS: readonly MapId[] = ['mercury'];
const VENUS_MAPS: readonly MapId[] = ['venus'];
const EARTH_MAPS: readonly MapId[] = ['earthDay', 'earthNight', 'earthSpec', 'earthClouds', 'moon'];
const MARS_MAPS: readonly MapId[] = ['mars'];
const JUPITER_MAPS: readonly MapId[] = ['jupiter'];
const SATURN_MAPS: readonly MapId[] = ['saturn', 'saturnRing'];
const URANUS_MAPS: readonly MapId[] = ['uranus'];

const SpaceScene = ({ onReady }: { onReady?: () => void }) => {
  const light = lowPower();
  return (
    <Canvas
      frameloop={testDrive ? 'never' : 'always'}
      camera={{ position: [0, 0, 0], rotation: [0, 0, 0], fov: FOV, near: 0.05, far: 2000 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance', stencil: false }}
      dpr={light ? [1, 1.75] : [1, 2]}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}
      onCreated={({ gl }) => {
        gl.setClearColor('#000000');
        watchBoot(gl);
      }}
    >
      <ambientLight intensity={0.05} />
      <primitive object={sunLight} />
      <Rig />
      <Stars count={light ? 2200 : 6000} />
      <OnStage stop="sun" maps={SUN_MAPS}>
        <Sun />
      </OnStage>
      <OnStage stop="mercury" maps={MERCURY_MAPS}>
        <Mercury />
      </OnStage>
      <OnStage stop="venus" maps={VENUS_MAPS}>
        <Venus />
      </OnStage>
      <OnStage stop="earth" maps={EARTH_MAPS}>
        <Earth />
      </OnStage>
      <OnStage stop="mars" maps={MARS_MAPS}>
        <Mars />
      </OnStage>
      <OnStage stop="jupiter" maps={JUPITER_MAPS}>
        <Jupiter />
      </OnStage>
      <OnStage stop="saturn" maps={SATURN_MAPS}>
        <Saturn rocks={light ? 6000 : 22000} />
      </OnStage>
      <OnStage stop="uranus" maps={URANUS_MAPS}>
        <Uranus />
      </OnStage>
      <Render onReady={onReady} />
    </Canvas>
  );
};

export default SpaceScene;
