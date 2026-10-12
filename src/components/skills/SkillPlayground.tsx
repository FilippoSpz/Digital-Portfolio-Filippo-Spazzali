import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { CuboidCollider, Physics, RigidBody, type RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { skillCategories, type SkillLevel } from '@/data/skills';
import { gradientColors } from '@/lib/tailwindColors';
import { lowPower, testDrive } from '@/lib/motion';

/* Every skill as a glossy token with its logo, in a tray with real physics: they rain in when the
   section appears, you can grab and throw them with the mouse, tap them on a phone to make them jump. */

interface Token {
  name: string;
  icon: string;
  level: SkillLevel;
  color: string;
}

const RADIUS = 0.62;
const THICK = 0.17;

/** The face of a token: a dark disc, a coloured ring, the logo in the middle. */
function faceTexture(icon: HTMLImageElement, color: string) {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  const bg = g.createRadialGradient(size * 0.4, size * 0.35, 10, size / 2, size / 2, size / 2);
  bg.addColorStop(0, '#22284a');
  bg.addColorStop(1, '#0b0e1f');
  g.fillStyle = bg;
  g.fillRect(0, 0, size, size);
  g.lineWidth = 14;
  g.strokeStyle = color;
  g.beginPath();
  g.arc(size / 2, size / 2, size / 2 - 10, 0, Math.PI * 2);
  g.stroke();
  const box = size * 0.5;
  const k = Math.min(box / icon.width, box / icon.height);
  const w = icon.width * k;
  const h = icon.height * k;
  g.drawImage(icon, (size - w) / 2, (size - h) / 2, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(img);
    img.src = src;
  });

const geometry = new THREE.CylinderGeometry(RADIUS, RADIUS, THICK, 48, 1);

/** Reflections for the glossy tokens, from a soft studio room. */
const Environment = () => {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
};

interface Grab {
  body: RapierRigidBody;
  target: THREE.Vector3;
}

const TokenBody = ({
  token,
  texture,
  start,
  grab,
  onHover,
}: {
  token: Token;
  texture: THREE.Texture;
  start: [number, number, number];
  grab: React.MutableRefObject<Grab | null>;
  onHover: (t: Token | null, e?: ThreeEvent<PointerEvent>) => void;
}) => {
  const body = useRef<RapierRigidBody>(null);
  const materials = useMemo(() => {
    const side = new THREE.MeshPhysicalMaterial({ color: token.color, metalness: 0.85, roughness: 0.28, clearcoat: 0.6 });
    const face = new THREE.MeshPhysicalMaterial({ map: texture, metalness: 0.15, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.12 });
    return [side, face, face];
  }, [token.color, texture]);
  useEffect(() => () => materials.forEach((m) => m.dispose()), [materials]);

  const down = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const b = body.current;
    if (!b) return;
    if (e.pointerType === 'mouse') {
      grab.current = { body: b, target: new THREE.Vector3().copy(b.translation() as THREE.Vector3) };
      b.setGravityScale(0, true);
      (e.target as Element | null)?.setPointerCapture?.(e.pointerId);
    } else {
      // On a phone: a tap makes it jump and spin.
      b.applyImpulse({ x: (Math.random() - 0.5) * 2, y: 7 + Math.random() * 3, z: (Math.random() - 0.5) * 1.5 }, true);
      b.applyTorqueImpulse({ x: (Math.random() - 0.5) * 0.4, y: (Math.random() - 0.5) * 0.4, z: (Math.random() - 0.5) * 0.4 }, true);
    }
  };

  return (
    <RigidBody ref={body} position={start} rotation={[Math.random() * 3, Math.random() * 3, Math.random() * 3]} colliders="hull" restitution={0.45} friction={0.6} linearDamping={0.2} angularDamping={0.4}>
      <mesh
        geometry={geometry}
        material={materials}
        castShadow
        onPointerDown={down}
        onPointerOver={(e) => onHover(token, e)}
        onPointerMove={(e) => onHover(token, e)}
        onPointerOut={() => onHover(null)}
      />
    </RigidBody>
  );
};

/** While dragging: the token follows the pointer over the tray; letting go throws it. */
const Dragger = ({ grab }: { grab: React.MutableRefObject<Grab | null> }) => {
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.4), []);
  const hit = useMemo(() => new THREE.Vector3(), []);
  useEffect(() => {
    const release = () => {
      if (grab.current) grab.current.body.setGravityScale(1, true);
      grab.current = null;
    };
    window.addEventListener('pointerup', release);
    return () => window.removeEventListener('pointerup', release);
  }, [grab]);
  useFrame(({ raycaster, pointer, camera }) => {
    const g = grab.current;
    if (!g) return;
    raycaster.setFromCamera(pointer, camera);
    if (raycaster.ray.intersectPlane(plane, hit)) g.target.copy(hit);
    const p = g.body.translation();
    g.body.setLinvel({ x: (g.target.x - p.x) * 14, y: (g.target.y - p.y) * 14, z: (g.target.z - p.z) * 14 }, true);
    g.body.setAngvel({ x: 0, y: 2, z: 0 }, true);
  });
  return null;
};

const Tray = ({ halfW, halfD }: { halfW: number; halfD: number }) => (
  <RigidBody type="fixed" colliders={false}>
    <CuboidCollider args={[halfW + 2, 0.5, halfD + 2]} position={[0, -0.5, 0]} />
    <CuboidCollider args={[0.5, 8, halfD + 2]} position={[-halfW - 0.5, 7, 0]} />
    <CuboidCollider args={[0.5, 8, halfD + 2]} position={[halfW + 0.5, 7, 0]} />
    <CuboidCollider args={[halfW + 2, 8, 0.5]} position={[0, 7, -halfD - 0.5]} />
    <CuboidCollider args={[halfW + 2, 8, 0.5]} position={[0, 7, halfD + 0.5]} />
  </RigidBody>
);

const World = ({ tokens, textures, onHover, shake }: { tokens: Token[]; textures: THREE.Texture[]; onHover: (t: Token | null, e?: ThreeEvent<PointerEvent>) => void; shake: number }) => {
  const { size } = useThree();
  const halfW = THREE.MathUtils.clamp((size.width / size.height) * 2.05, 2.6, 7.2);
  const halfD = 3.1;
  const grab = useRef<Grab | null>(null);
  const starts = useMemo(
    () => tokens.map((_, i) => [(Math.random() - 0.5) * halfW * 1.7, 4 + i * 0.55, (Math.random() - 0.5) * halfD * 1.6] as [number, number, number]),
    // Positions are picked once, when the tokens first fall in.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tokens],
  );
  return (
    <Physics gravity={[0, -18, 0]} timeStep="vary">
      <Tray halfW={halfW} halfD={halfD} />
      {tokens.map((t, i) => (
        <TokenBody key={`${t.name}-${shake}`} token={t} texture={textures[i]} start={starts[i]} grab={grab} onHover={onHover} />
      ))}
      <Dragger grab={grab} />
    </Physics>
  );
};

const SkillPlayground = ({ shakeLabel, hint, levelLabel }: { shakeLabel: string; hint: string; levelLabel: (l: SkillLevel) => string }) => {
  const tokens = useMemo<Token[]>(
    () => skillCategories.flatMap((c) => c.skills.map((s) => ({ name: s.name, icon: s.icon, level: s.level, color: gradientColors(c.gradient)[0] }))),
    [],
  );
  const [textures, setTextures] = useState<THREE.Texture[] | null>(null);
  const [hover, setHover] = useState<{ token: Token; x: number; y: number } | null>(null);
  const [shake, setShake] = useState(0);
  const [visible, setVisible] = useState(true);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    Promise.all(tokens.map((t) => loadImage(t.icon))).then((imgs) => {
      if (alive) setTextures(imgs.map((img, i) => faceTexture(img, tokens[i].color)));
    });
    return () => {
      alive = false;
    };
  }, [tokens]);
  useEffect(() => () => textures?.forEach((t) => t.dispose()), [textures]);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '100px' });
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  const onHover = (t: Token | null, e?: ThreeEvent<PointerEvent>) => {
    if (!t || !e || e.pointerType !== 'mouse' || !wrap.current) return setHover(null);
    const r = wrap.current.getBoundingClientRect();
    setHover({ token: t, x: e.nativeEvent.clientX - r.left, y: e.nativeEvent.clientY - r.top });
  };

  return (
    <div ref={wrap} className="relative h-[360px] md:h-[440px] rounded-3xl overflow-hidden glass">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,hsl(var(--primary)/0.18),transparent_70%)] pointer-events-none" />
      {textures && (
        <Canvas
          frameloop={visible && !testDrive ? 'always' : 'never'}
          shadows={!lowPower()}
          dpr={[1, 1.75]}
          camera={{ position: [0, 7.2, 6.6], fov: 40 }}
          onCreated={({ camera }) => camera.lookAt(0, 0, 0.4)}
          style={{ touchAction: 'pan-y' }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[4, 9, 5]} intensity={2.2} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={6} shadow-camera-bottom={-6} />
          <Environment />
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[40, 20]} />
            <shadowMaterial opacity={0.35} />
          </mesh>
          <Suspense fallback={null}>
            <World tokens={tokens} textures={textures} onHover={onHover} shake={shake} />
          </Suspense>
        </Canvas>
      )}
      <div className="absolute left-4 top-4 right-4 flex items-center justify-between gap-3 pointer-events-none">
        <span className="text-xs md:text-sm text-muted-foreground">{hint}</span>
        <button
          type="button"
          onClick={() => setShake((n) => n + 1)}
          className="pointer-events-auto px-3 py-1.5 rounded-full glass text-xs font-semibold hover:bg-primary/15 transition-colors"
        >
          {shakeLabel}
        </button>
      </div>
      {hover && (
        <div className="absolute pointer-events-none px-3 py-1.5 rounded-xl glass text-sm whitespace-nowrap -translate-x-1/2" style={{ left: hover.x, top: hover.y - 54 }}>
          <span className="font-semibold">{hover.token.name}</span>
          <span className="text-muted-foreground"> · {levelLabel(hover.token.level)}</span>
        </div>
      )}
    </div>
  );
};

export default SkillPlayground;
