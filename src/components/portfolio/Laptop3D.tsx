import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { testDrive } from '@/lib/motion';

/* A laptop modelled in code (aluminium, keyboard, trackpad, hinge) with the project on its screen.
   The lid opens as the card scrolls into view. */

interface Props {
  image?: string;
  label?: string;
  title: string;
  colors: [string, string];
  whiteBg?: boolean;
  /** Turned the other way (cards alternate left and right). */
  flip?: boolean;
}

const W = 3.2;
const D = 2.2;

const loadImage = (src: string) =>
  new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

/** What the screen shows: a browser window with the project in it. */
async function screenTexture({ image, label, title, colors, whiteBg }: Props) {
  const w = 1280;
  const h = 800;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  const bg = g.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#0b1020');
  bg.addColorStop(1, '#161c38');
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  const glow = g.createRadialGradient(w * 0.75, h * 0.25, 20, w * 0.75, h * 0.25, w * 0.7);
  glow.addColorStop(0, `${colors[0]}55`);
  glow.addColorStop(1, 'transparent');
  g.fillStyle = glow;
  g.fillRect(0, 0, w, h);

  // Browser bar.
  g.fillStyle = '#1c2344';
  g.fillRect(0, 0, w, 64);
  ['#ff5f57', '#febc2e', '#28c840'].forEach((col, i) => {
    g.fillStyle = col;
    g.beginPath();
    g.arc(40 + i * 34, 32, 11, 0, Math.PI * 2);
    g.fill();
  });
  g.fillStyle = '#2a3260';
  roundRect(g, 220, 14, w - 440, 36, 18);
  g.fill();
  g.fillStyle = '#aab4e6';
  g.font = '500 20px "Inter", system-ui, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(title, w / 2, 33);

  const img = image ? await loadImage(image) : null;
  if (img) {
    const boxW = w * 0.62;
    const boxH = (h - 64) * 0.68;
    const k = Math.min(boxW / img.width, boxH / img.height);
    const iw = img.width * k;
    const ih = img.height * k;
    const x = (w - iw) / 2;
    const y = 64 + (h - 64 - ih) / 2;
    if (whiteBg) {
      g.fillStyle = '#fff';
      roundRect(g, x - 24, y - 24, iw + 48, ih + 48, 24);
      g.fill();
    }
    g.save();
    roundRect(g, x, y, iw, ih, 18);
    g.clip();
    g.drawImage(img, x, y, iw, ih);
    g.restore();
  } else {
    // A big app icon in the project's colours, and its name.
    const s = 220;
    const x = (w - s) / 2;
    const y = 64 + (h - 64) / 2 - s / 2 - 50;
    const grad = g.createLinearGradient(x, y, x + s, y + s);
    grad.addColorStop(0, colors[0]);
    grad.addColorStop(1, colors[1]);
    g.fillStyle = grad;
    roundRect(g, x, y, s, s, 48);
    g.fill();
    g.fillStyle = '#0b1020';
    if (/sales/i.test(label ?? '')) {
      // A map pin.
      const cx = w / 2;
      const cy = y + s * 0.42;
      g.beginPath();
      g.arc(cx, cy, 56, Math.PI * 0.8, Math.PI * 2.2);
      g.lineTo(cx, cy + 96);
      g.closePath();
      g.fill();
      g.fillStyle = grad;
      g.beginPath();
      g.arc(cx, cy, 22, 0, Math.PI * 2);
      g.fill();
    } else {
      g.font = '800 104px "Space Grotesk", "Inter", sans-serif';
      g.fillText('</>', w / 2, y + s / 2 + 6);
    }
    g.fillStyle = '#e8ecff';
    g.font = '700 64px "Space Grotesk", "Inter", sans-serif';
    g.fillText(label ?? title, w / 2, y + s + 80);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function keyboardTexture() {
  const w = 1024;
  const h = 380;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  g.fillStyle = '#1a1d24';
  g.fillRect(0, 0, w, h);
  const rows = [14, 14, 13, 12, 9];
  rows.forEach((n, r) => {
    const keyW = (w - 40) / 14.5;
    const offset = (w - n * keyW) / 2;
    for (let i = 0; i < n; i++) {
      const wide = r === 4 && i === 4 ? 4 : 1;
      if (r === 4 && i > 4 && i < 8) continue;
      g.fillStyle = '#0d0f14';
      roundRect(g, offset + i * keyW + 3, 16 + r * 70 + 3, keyW * wide - 6, 62, 8);
      g.fill();
    }
  });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

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

const Laptop = ({ screen, flip, progress }: { screen: THREE.Texture; flip: boolean; progress: () => number }) => {
  const group = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);
  const parts = useMemo(() => {
    const aluminium = new THREE.MeshPhysicalMaterial({ color: '#7a8296', metalness: 0.9, roughness: 0.3, clearcoat: 0.3 });
    return {
      aluminium,
      base: new RoundedBoxGeometry(W, 0.11, D, 4, 0.05),
      lid: new RoundedBoxGeometry(W, 0.07, D, 4, 0.04),
      keys: new THREE.MeshStandardMaterial({ map: keyboardTexture(), roughness: 0.8 }),
      pad: new THREE.MeshPhysicalMaterial({ color: '#6b7386', metalness: 0.6, roughness: 0.45 }),
      screen: new THREE.MeshBasicMaterial({ map: screen, toneMapped: false }),
      bezel: new THREE.MeshBasicMaterial({ color: '#05060a' }),
    };
  }, [screen]);
  useEffect(
    () => () => {
      parts.aluminium.dispose();
      parts.base.dispose();
      parts.lid.dispose();
      parts.keys.map?.dispose();
      parts.keys.dispose();
      parts.pad.dispose();
      parts.screen.dispose();
      parts.bezel.dispose();
    },
    [parts],
  );

  const shown = useRef(0);
  useFrame((state) => {
    // Follows the scroll with a little lag, like a real hinge.
    shown.current += (progress() - shown.current) * 0.12;
    const p = shown.current;
    const e = 1 - Math.pow(1 - p, 3);
    if (lid.current) lid.current.rotation.x = -1.92 * e;
    if (group.current) {
      const side = flip ? 1 : -1;
      group.current.rotation.y = side * (0.62 - 0.42 * e);
      group.current.position.y = -0.55 + Math.sin(state.clock.elapsedTime * 0.8) * 0.03;
    }
  });

  return (
    <group ref={group} rotation={[0.12, 0, 0]}>
      <mesh geometry={parts.base} material={parts.aluminium} position={[0, 0, 0]} />
      <mesh material={parts.keys} position={[0, 0.0565, -0.22]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W * 0.86, 1.02]} />
      </mesh>
      <mesh material={parts.pad} position={[0, 0.0565, 0.66]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.15, 0.66]} />
      </mesh>
      {/* The lid turns on the hinge along the back edge. */}
      <group ref={lid} position={[0, 0.055, -D / 2]}>
        <group position={[0, 0.04, D / 2]}>
          <mesh geometry={parts.lid} material={parts.aluminium} />
          <mesh material={parts.bezel} position={[0, -0.0356, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[W - 0.08, D - 0.08]} />
          </mesh>
          <mesh material={parts.screen} position={[0, -0.0358, -0.02]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[W - 0.24, (W - 0.24) * 0.625]} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

const Laptop3D = (props: Props) => {
  const wrap = useRef<HTMLDivElement>(null);
  const [screen, setScreen] = useState<THREE.Texture | null>(null);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let alive = true;
    let tex: THREE.Texture | null = null;
    document.fonts.ready
      .then(() => screenTexture(props))
      .then((t) => {
        tex = t;
        if (alive) setScreen(t);
        else t.dispose();
      });
    return () => {
      alive = false;
      tex?.dispose();
    };
    // The screen is drawn once per project.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.title, props.image, props.label]);

  // Only the laptops near the screen exist (a browser allows a limited number of 3D canvases).
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const nearIo = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: '500px 0px' });
    const visIo = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    nearIo.observe(el);
    visIo.observe(el);
    return () => {
      nearIo.disconnect();
      visIo.disconnect();
    };
  }, []);

  /** 0 when the card enters at the bottom, 1 when it has risen to a third of the screen. */
  const progress = () => {
    const el = wrap.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    return THREE.MathUtils.clamp((vh * 0.95 - r.top) / (vh * 0.6), 0, 1);
  };

  return (
    <div ref={wrap} className="absolute inset-0">
      {near && screen && (
        <Canvas
          frameloop={visible && !testDrive ? 'always' : 'never'}
          dpr={[1, 1.75]}
          camera={{ position: [0, 2.4, 6.1], fov: 38 }}
          onCreated={({ camera }) => camera.lookAt(0, 0.25, 0)}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.35} />
          <directionalLight position={[3, 5, 4]} intensity={1.6} />
          <pointLight position={[-3, 2, 3]} intensity={6} color={props.colors[0]} distance={12} />
          <Environment />
          <Laptop screen={screen} flip={!!props.flip} progress={progress} />
        </Canvas>
      )}
    </div>
  );
};

export default Laptop3D;
