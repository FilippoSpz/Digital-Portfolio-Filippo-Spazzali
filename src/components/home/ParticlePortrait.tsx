import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { lowPower, testDrive } from '@/lib/motion';

/* The portrait as tens of thousands of points of light. In turn they become a ringed planet,
   the </> of code and the name, then the face again; scrolling away scatters them into space. */

type Shapes = { p0: Float32Array; p1: Float32Array; p2: Float32Array; p3: Float32Array; color: Float32Array; seed: Float32Array };

const SPAN = 2.2;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Points where a drawing is filled (text, symbols): positions in [-SPAN/2, SPAN/2]. */
function sampleDrawing(n: number, w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void, depth = 0.08) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  draw(ctx);
  const data = ctx.getImageData(0, 0, w, h).data;
  const filled: number[] = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (data[(y * w + x) * 4 + 3] > 128) filled.push(x, y);
  const out = new Float32Array(n * 3);
  const scale = SPAN / Math.max(w, h);
  for (let i = 0; i < n; i++) {
    const k = Math.floor(Math.random() * (filled.length / 2)) * 2;
    out[i * 3] = (filled[k] + Math.random() - w / 2) * scale;
    out[i * 3 + 1] = -(filled[k + 1] + Math.random() - h / 2) * scale;
    out[i * 3 + 2] = (Math.random() - 0.5) * depth;
  }
  return out;
}

async function buildShapes(n: number, photo: string): Promise<Shapes> {
  const p0 = new Float32Array(n * 3);
  const color = new Float32Array(n * 3);
  const seed = new Float32Array(n);
  // The face: points on the photo, coloured by it, brighter areas a little closer.
  const img = await loadImage(photo);
  const size = 220;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, size, size);
  const px = ctx.getImageData(0, 0, size, size).data;
  for (let i = 0; i < n; i++) {
    // More points where the photo is bright: the face and the light, less in the shadows.
    let x = 0;
    let y = 0;
    let k = 0;
    let lum = 0;
    for (let tries = 0; tries < 40; tries++) {
      x = Math.random();
      y = Math.random();
      if ((x - 0.5) ** 2 + (y - 0.5) ** 2 > 0.25) continue;
      k = (Math.floor(y * size) * size + Math.floor(x * size)) * 4;
      lum = (0.3 * px[k] + 0.59 * px[k + 1] + 0.11 * px[k + 2]) / 255;
      if (Math.random() < 0.12 + 0.88 * Math.pow(lum, 0.9)) break;
    }
    const r = px[k] / 255;
    const g = px[k + 1] / 255;
    const b = px[k + 2] / 255;
    p0.set([(x - 0.5) * SPAN, -(y - 0.5) * SPAN, (lum - 0.5) * 0.3], i * 3);
    // A touch brighter and more saturated: points on a dark sky.
    color.set([Math.min(1, r * 1.15 + 0.04), Math.min(1, g * 1.12 + 0.04), Math.min(1, b * 1.15 + 0.06)], i * 3);
    seed[i] = Math.random();
  }

  // A ringed planet.
  const p1 = new Float32Array(n * 3);
  const tilt = new THREE.Euler(1.18, 0, 0.32);
  const v = new THREE.Vector3();
  const ga = Math.PI * (3 - Math.sqrt(5));
  const onSphere = Math.floor(n * 0.7);
  for (let i = 0; i < n; i++) {
    if (i < onSphere) {
      const y = 1 - (i / (onSphere - 1)) * 2;
      const rad = Math.sqrt(1 - y * y);
      const th = ga * i;
      v.set(Math.cos(th) * rad, y, Math.sin(th) * rad).multiplyScalar(0.62 + Math.random() * 0.012);
    } else {
      const a = Math.random() * Math.PI * 2;
      const rr = 0.86 + Math.pow(Math.random(), 0.8) * 0.5;
      v.set(Math.cos(a) * rr, Math.sin(a) * rr, (Math.random() - 0.5) * 0.02).applyEuler(tilt);
    }
    p1.set([v.x, v.y, v.z], i * 3);
  }

  const font = (px: number) => `800 ${px}px "Space Grotesk", "Inter", system-ui, sans-serif`;
  const p2 = sampleDrawing(n, 320, 320, (g) => {
    g.fillStyle = '#fff';
    g.font = font(205);
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('</>', 160, 172);
  });
  const p3 = sampleDrawing(n, 420, 420, (g) => {
    g.fillStyle = '#fff';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = font(104);
    g.fillText('FILIPPO', 210, 158);
    g.font = font(78);
    g.fillText('SPAZZALI', 210, 268);
  });
  return { p0, p1, p2, p3, color, seed };
}

const vertex = /* glsl */ `
attribute vec3 aP0;
attribute vec3 aP1;
attribute vec3 aP2;
attribute vec3 aP3;
attribute vec3 aColor;
attribute float aSeed;
uniform float uFrom;
uniform float uTo;
uniform float uMix;
uniform float uTime;
uniform float uScatter;
uniform vec2 uPointer;
uniform float uPointerOn;
uniform float uSize;
uniform float uPixelRatio;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
varying vec3 vColor;
varying float vAlpha;
vec3 shapeAt(float k) { return k < 0.5 ? aP0 : (k < 1.5 ? aP1 : (k < 2.5 ? aP2 : aP3)); }
void main() {
  float local = clamp((uMix - aSeed * 0.35) / 0.65, 0.0, 1.0);
  float e = local * local * (3.0 - 2.0 * local);
  vec3 p = mix(shapeAt(uFrom), shapeAt(uTo), e);
  float mid = sin(e * 3.14159);
  p += vec3(sin(aSeed * 91.0 + uTime * 0.7), cos(aSeed * 53.0 + uTime * 0.6), sin(aSeed * 17.0 + uTime)) * 0.42 * mid;
  p += vec3(sin(uTime * 0.8 + aSeed * 30.0), cos(uTime * 0.7 + aSeed * 20.0), 0.0) * 0.005;
  vec3 dir = normalize(p + vec3(0.0001, 0.0001, 0.0));
  p += dir * uScatter * (1.2 + aSeed * 3.5);
  p.z += uScatter * (aSeed - 0.3) * 5.0;
  vec2 d = p.xy - uPointer;
  float push = uPointerOn * smoothstep(0.32, 0.0, length(d));
  p.xy += normalize(d + 0.0001) * push * 0.22;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uSize * uPixelRatio * (0.8 + aSeed * 0.5) / -mv.z;
  gl_Position = projectionMatrix * mv;
  float fromPhoto = uFrom < 0.5 ? 1.0 : 0.0;
  float toPhoto = uTo < 0.5 ? 1.0 : 0.0;
  vec3 grad = mix(uC1, uC2, smoothstep(-1.1, 1.1, p.y + p.x * 0.4));
  grad = mix(grad, uC3, step(0.9, aSeed));
  vColor = mix(grad, aColor, mix(fromPhoto, toPhoto, e));
  vAlpha = (1.0 - uScatter) * (0.9 + 0.1 * sin(uTime * 2.0 + aSeed * 50.0));
}
`;

const fragment = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  gl_FragColor = vec4(vColor, vAlpha * smoothstep(0.5, 0.3, d));
  #include <colorspace_fragment>
}
`;

/** Photo → planet → code → name → photo; how long each one stays, then the morph. */
const HOLD = [5.5, 3.2, 2.6, 3.2];
const MORPH = 1.7;

const Points = ({ shapes, scatter, pointer }: { shapes: Shapes; scatter: { current: number }; pointer: { current: { x: number; y: number; on: number } } }) => {
  const { geometry, material } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(shapes.p0, 3));
    g.setAttribute('aP0', new THREE.BufferAttribute(shapes.p0, 3));
    g.setAttribute('aP1', new THREE.BufferAttribute(shapes.p1, 3));
    g.setAttribute('aP2', new THREE.BufferAttribute(shapes.p2, 3));
    g.setAttribute('aP3', new THREE.BufferAttribute(shapes.p3, 3));
    g.setAttribute('aColor', new THREE.BufferAttribute(shapes.color, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(shapes.seed, 1));
    const m = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uFrom: { value: 0 },
        uTo: { value: 0 },
        uMix: { value: 0 },
        uTime: { value: 0 },
        uScatter: { value: 0 },
        uPointer: { value: new THREE.Vector2(9, 9) },
        uPointerOn: { value: 0 },
        uSize: { value: lowPower() ? 11 : 9.5 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uC1: { value: new THREE.Color('#8f86ff') },
        uC2: { value: new THREE.Color('#5fb0ff') },
        uC3: { value: new THREE.Color('#f0c8ff') },
      },
      transparent: true,
      depthWrite: false,
    });
    return { geometry: g, material: m };
  }, [shapes]);
  useEffect(() => () => (geometry.dispose(), material.dispose()), [geometry, material]);

  const clock = useRef({ stage: 0, t: 0 });
  useFrame((state, dt) => {
    const u = material.uniforms;
    const c = clock.current;
    c.t += Math.min(dt, 0.1);
    const hold = HOLD[c.stage];
    const next = (c.stage + 1) % HOLD.length;
    u.uFrom.value = c.stage;
    u.uTo.value = next;
    u.uMix.value = THREE.MathUtils.clamp((c.t - hold) / MORPH, 0, 1);
    if (c.t >= hold + MORPH) {
      c.stage = next;
      c.t = 0;
      u.uFrom.value = u.uTo.value = next;
      u.uMix.value = 0;
    }
    u.uTime.value = state.clock.elapsedTime;
    u.uScatter.value += (scatter.current - u.uScatter.value) * 0.12;
    u.uPointer.value.set(pointer.current.x, pointer.current.y);
    u.uPointerOn.value += (pointer.current.on - u.uPointerOn.value) * 0.1;
  });
  return <points geometry={geometry} material={material} frustumCulled={false} />;
};

const ParticlePortrait = ({ photo, onReady }: { photo: string; onReady?: () => void }) => {
  const wrap = useRef<HTMLDivElement>(null);
  const [shapes, setShapes] = useState<Shapes | null>(null);
  const [visible, setVisible] = useState(true);
  const scatter = useRef(0);
  const pointer = useRef({ x: 9, y: 9, on: 0 });

  useEffect(() => {
    let alive = true;
    // The name is drawn in the site's font: wait for it, so the letters come out right.
    document.fonts.ready
      .then(() => buildShapes(lowPower() ? 10000 : 26000, photo))
      .then((s) => {
        if (alive) {
          setShapes(s);
          onReady?.();
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [photo, onReady]);

  // Scrolling away scatters the points; off screen, nothing is drawn.
  useEffect(() => {
    const onScroll = () => {
      scatter.current = THREE.MathUtils.clamp(window.scrollY / (window.innerHeight * 0.75), 0, 1);
    };
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '120px' });
    if (wrap.current) io.observe(wrap.current);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !wrap.current) return;
    const r = wrap.current.getBoundingClientRect();
    // The face spans the box (SPAN units): the canvas around it is 36% bigger, for the planet's ring and the scatter.
    const k = SPAN;
    pointer.current = { x: ((e.clientX - r.left) / r.width - 0.5) * k, y: -((e.clientY - r.top) / r.height - 0.5) * k, on: 1 };
  };

  return (
    <div ref={wrap} className="absolute inset-0" onPointerMove={onMove} onPointerLeave={() => (pointer.current.on = 0)} role="img" aria-label="Filippo Spazzali">
      {shapes && (
        <Canvas
          frameloop={visible && !testDrive ? 'always' : 'never'}
          camera={{ position: [0, 0, 3.6], fov: 45 }}
          gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
          dpr={[1, 2]}
          style={{ position: 'absolute', inset: '-18%', width: '136%', height: '136%' }}
        >
          <Points shapes={shapes} scatter={scatter} pointer={pointer} />
        </Canvas>
      )}
    </div>
  );
};

export default ParticlePortrait;
