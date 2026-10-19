/* GLSL for the solar system: every planet from real maps (NASA / Solar System Scope), with what the
   maps cannot show drawn on top of them (Jupiter's turning storm, Saturn's hexagon, Venus' polar
   vortex, Uranus' cap and rings, Earth's aurora, the moons), the Sun drawn entirely here, the stars. */

/** 3D simplex noise (Ashima Arts / Stefan Gustavson, MIT) + fractal sum. */
export const noise = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
float fbm(vec3 p) {
  float f = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) { f += a * snoise(p); p *= 2.03; a *= 0.5; }
  return f;
}
`;

/** Cells (Worley): distances to the nearest and the second-nearest of points scattered one per unit
 *  cube, each wandering a little in time. Hash without sine (Dave Hoskins, MIT): steady on every GPU. */
const cells = /* glsl */ `
vec3 hash33(vec3 p3) {
  p3 = fract(p3 * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yxz + 33.33);
  return fract((p3.xxy + p3.yxx) * p3.zyx);
}
vec2 cells(vec3 x, float t) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  float f1 = 8.0;
  float f2 = 8.0;
  for (int k = -1; k <= 1; k++)
    for (int j = -1; j <= 1; j++)
      for (int m = -1; m <= 1; m++) {
        vec3 g = vec3(float(m), float(j), float(k));
        vec3 o = 0.5 + 0.4 * sin(t + 6.2831853 * hash33(i + g));
        vec3 r = g + o - f;
        float d = dot(r, r);
        if (d < f1) { f2 = f1; f1 = d; }
        else if (d < f2) { f2 = d; }
      }
  return sqrt(vec2(f1, f2));
}
`;

/**
 * Map sampling with the gradients of the mesh's own map coordinates: coordinates bent by a flow, or
 * worked out again from the direction, stay sharp and show no seam where they wrap round.
 */
const sampling = /* glsl */ `
vec2 gdx;
vec2 gdy;
#if __VERSION__ >= 300
#define GRADS gdx = dFdx(vUv); gdy = dFdy(vUv);
#define SAMPLE(t, uv) textureGrad(t, uv, gdx, gdy)
#define TEXEL(t) (1.0 / vec2(textureSize(t, 0)))
#else
#define GRADS
#define SAMPLE(t, uv) texture2D(t, uv)
#define TEXEL(t) vec2(1.0 / 2048.0, 1.0 / 1024.0)
#endif
`;

/** Directions on the sphere ↔ map coordinates (as three's SphereGeometry lays them out), and turns. */
const sphereMath = /* glsl */ `
const float M_PI = 3.14159265;
const float M_TAU = 6.2831853;
vec2 dirUv(vec3 p) { return vec2(fract(atan(p.z, -p.x) / M_TAU), 1.0 - acos(clamp(p.y, -1.0, 1.0)) / M_PI); }
vec3 turnAbout(vec3 p, vec3 k, float a) {
  float c = cos(a);
  float s = sin(a);
  return p * c + cross(k, p) * s + k * dot(k, p) * (1.0 - c);
}
`;

/**
 * Every body: object-space position (for the noise), world position, normal and east direction
 * (towards growing map u: for relief and for the light along the ground), direction to the camera.
 */
export const sphereVertex = /* glsl */ `
varying vec3 vObj;
varying vec3 vWorld;
varying vec3 vNormalW;
varying vec3 vTangentW;
varying vec3 vViewW;
varying vec2 vUv;
void main() {
  vObj = position;
  vUv = uv;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vec3 east = vec3(position.z, 0.0, -position.x);
  vTangentW = normalize(mat3(modelMatrix) * (dot(east, east) > 1e-8 ? east : vec3(1.0, 0.0, 0.0)));
  vViewW = normalize(cameraPosition - world.xyz);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const outro = /* glsl */ `
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
`;

/** Light falloff across the terminator, soft like a real atmosphere-less limb. */
const lighting = /* glsl */ `
float daylight(vec3 n, vec3 l) { return smoothstep(-0.18, 0.55, dot(n, l)); }
float fresnel(vec3 n, vec3 v, float p) { return pow(1.0 - max(dot(n, v), 0.0), p); }
`;

/**
 * Earth from NASA maps: day side, city lights on the night side (dimmed under the clouds), shining
 * oceans, the clouds' shadows on the ground, a warm line at the terminator, blue limb.
 */
export const earthFragment = /* glsl */ `
uniform vec3 uLight;
uniform sampler2D uDay;
uniform sampler2D uNight;
uniform sampler2D uSpec;
uniform sampler2D uClouds;
uniform float uCloudShift;
varying vec2 vUv;
varying vec3 vObj;
varying vec3 vNormalW;
varying vec3 vTangentW;
varying vec3 vViewW;
${sampling}
${sphereMath}
${lighting}
void main() {
  GRADS
  vec3 n = normalize(vNormalW);
  vec3 v = normalize(vViewW);
  vec3 l = normalize(uLight);
  float ndl = dot(n, l);
  float day = smoothstep(-0.15, 0.3, ndl);
  // The clouds over this point, and the cloud whose shadow falls here (towards the Sun, further the lower the Sun).
  vec3 p = normalize(vObj);
  vec3 east = normalize(vTangentW - n * dot(n, vTangentW));
  vec3 north = cross(n, east);
  vec2 sun = vec2(dot(l, east), dot(l, north));
  vec2 over = vUv + vec2(uCloudShift, 0.0);
  vec2 lift = sun * (0.012 / max(ndl, 0.3)) / vec2(M_TAU * max(length(p.xz), 0.2), M_PI);
  float cloudHere = SAMPLE(uClouds, over).r;
  float cloudShade = SAMPLE(uClouds, over + lift).r;
  vec3 dayCol = SAMPLE(uDay, vUv).rgb * (0.1 + max(ndl, 0.0) * 1.15) * (1.0 - 0.38 * cloudShade);
  // The night map's faint grey land is cut away: only the cities shine, the ground stays dark,
  // just picked out by a little moonlight.
  float lights = max(SAMPLE(uNight, vUv).r - 0.1, 0.0) / 0.9 * (1.0 - 0.7 * cloudHere);
  vec3 nightCol = vec3(1.0, 0.74, 0.45) * pow(lights, 1.3) * 2.0 + SAMPLE(uDay, vUv).rgb * vec3(0.012, 0.014, 0.02);
  vec3 col = mix(nightCol, dayCol, day);
  float ocean = SAMPLE(uSpec, vUv).r * (1.0 - cloudHere);
  vec3 hv = normalize(l + v);
  // The Sun's glint on the oceans: a small bright spot, not a blur.
  float nh = max(dot(n, hv), 0.0);
  col += vec3(1.0, 0.93, 0.82) * (pow(nh, 260.0) * 0.5 + pow(nh, 60.0) * 0.015) * ocean * smoothstep(0.05, 0.4, ndl);
  col *= mix(vec3(1.0), vec3(1.1, 0.92, 0.8), exp(-ndl * ndl / 0.012) * day * 0.6);
  col += vec3(0.32, 0.6, 1.0) * fresnel(n, v, 2.4) * (0.015 + day * 0.75);
  gl_FragColor = vec4(col, 1.0);
  ${outro}
}
`;

/** Earth's clouds: a slightly bigger shell, lit, see-through where there are none. */
export const cloudsFragment = /* glsl */ `
uniform vec3 uLight;
uniform sampler2D uClouds;
varying vec2 vUv;
varying vec3 vNormalW;
void main() {
  float a = texture2D(uClouds, vUv).r;
  float d = smoothstep(-0.12, 0.45, dot(normalize(vNormalW), normalize(uLight)));
  gl_FragColor = vec4(vec3(1.0) * (0.05 + d * 1.05), a * (0.25 + d * 0.65));
  ${outro}
}
`;

/**
 * The aurora over Earth's north: a ring of light round the magnetic pole, wavering, with rays, seen
 * only on the night side. Two shells: the green curtain and, a little higher, its faint red top.
 */
export const auroraFragment = /* glsl */ `
uniform vec3 uLight;
uniform float uTime;
uniform float uStrength;
uniform float uTop;
varying vec3 vObj;
varying vec3 vNormalW;
varying vec3 vViewW;
${noise}
void main() {
  vec3 p = normalize(vObj);
  vec3 axis = normalize(vec3(0.0, 1.0, -0.16));
  vec3 e1 = normalize(cross(axis, vec3(1.0, 0.0, 0.0)));
  vec3 e2 = cross(axis, e1);
  float c = acos(clamp(dot(p, axis), -1.0, 1.0));
  float az = atan(dot(p, e2), dot(p, e1));
  vec2 ring = vec2(cos(az), sin(az));
  float wob = 0.035 * snoise(vec3(ring * 2.2, uTime * 0.03)) + 0.014 * snoise(vec3(ring * 7.0, uTime * 0.07));
  float band = exp(-pow((c - 0.36 - wob) / mix(0.02, 0.03, uTop), 2.0));
  float rays = 0.5 + 0.5 * snoise(vec3(ring * 40.0, uTime * 0.22));
  vec3 n = normalize(vNormalW);
  float night = 1.0 - smoothstep(-0.2, 0.12, dot(n, normalize(uLight)));
  // Seen edge-on, at the limb, the curtain is longer along the line of sight: brighter.
  float graze = min(1.0 / max(dot(n, normalize(vViewW)), 0.45), 2.2);
  float k = band * (0.35 + 0.65 * rays) * night * graze * uStrength * mix(1.0, 0.25, uTop);
  // Compressed, never clipped: a soft green, not a white streak.
  gl_FragColor = vec4(1.0 - exp(-mix(vec3(0.12, 0.85, 0.38), vec3(0.7, 0.18, 0.22), uTop) * k * 0.7), 1.0);
  #include <colorspace_fragment>
}
`;

/** The Moon (and any textured body): its map, lit from the Sun. */
export const texturedFragment = /* glsl */ `
uniform vec3 uLight;
uniform sampler2D uMap;
varying vec2 vUv;
varying vec3 vNormalW;
${lighting}
void main() {
  vec3 col = texture2D(uMap, vUv).rgb;
  float d = daylight(normalize(vNormalW), normalize(uLight));
  gl_FragColor = vec4(col * (0.015 + d * 1.15), 1.0);
  ${outro}
}
`;

/**
 * Moons without a map, each from its own recipe (uKind): 0 Io, sulphur yellow with dark volcanoes;
 * 1 Europa, cream ice crossed by brown lines; 2 Ganymede, dark with light grooved land; 3 Callisto,
 * dark, sprinkled with bright craters; 4 bare rock (Mars' and Uranus' moons). They darken in their
 * planet's shadow (uShadow: its centre and radius, radius 0 = none).
 */
export const moonFragment = /* glsl */ `
uniform vec3 uLight;
uniform float uKind;
uniform vec3 uColA;
uniform vec3 uColB;
uniform float uSeed;
uniform vec4 uShadow;
varying vec3 vObj;
varying vec3 vWorld;
varying vec3 vNormalW;
${noise}
void main() {
  vec3 p = normalize(vObj);
  float m = fbm(p * 2.2 + uSeed) * 0.5 + 0.5;
  vec3 col = mix(uColA, uColB, smoothstep(0.25, 0.75, m));
  if (uKind < 0.5) {
    col = mix(col, vec3(0.95, 0.93, 0.8), smoothstep(0.3, 0.6, snoise(p * 3.0 - uSeed)) * 0.35);
    col = mix(col, vec3(0.16, 0.1, 0.06), smoothstep(0.55, 0.75, snoise(p * 7.0 + uSeed)) * 0.85);
  } else if (uKind < 1.5) {
    float lines = 1.0 - smoothstep(0.0, 0.05, abs(snoise(p * 4.0 + uSeed)));
    lines = max(lines, (1.0 - smoothstep(0.0, 0.04, abs(snoise(p * 7.0 - uSeed)))) * 0.7);
    col = mix(col, vec3(0.5, 0.33, 0.2), lines * 0.6);
  } else if (uKind < 2.5) {
    col = mix(col, vec3(0.72, 0.68, 0.62), smoothstep(-0.05, 0.25, fbm(p * 2.5 + uSeed)) * 0.7);
  } else if (uKind < 3.5) {
    col = mix(col, vec3(0.75, 0.73, 0.7), smoothstep(0.7, 0.85, snoise(p * 16.0 + uSeed)));
  }
  vec3 l = normalize(uLight);
  float d = smoothstep(-0.08, 0.5, dot(normalize(vNormalW), l));
  if (uShadow.w > 0.0) {
    vec3 o = uShadow.xyz - vWorld;
    float t = dot(o, l);
    d *= t > 0.0 ? smoothstep(uShadow.w * 0.97, uShadow.w * 1.03, length(o - t * l)) : 1.0;
  }
  gl_FragColor = vec4(col * (0.01 + d * 1.15), 1.0);
  ${outro}
}
`;

/** A glowing shell around a planet (rendered on its back faces, additive). */
export const atmosphereFragment = /* glsl */ `
uniform vec3 uLight;
uniform vec3 uColor;
uniform float uPower;
uniform float uIntensity;
varying vec3 vNormalW;
varying vec3 vViewW;
void main() {
  vec3 n = normalize(vNormalW);
  vec3 v = normalize(vViewW);
  // Back faces: strongest right outside the planet's edge, fading to nothing at the shell's rim.
  float rim = pow(clamp(-dot(n, v), 0.0, 1.0), uPower);
  float lit = smoothstep(-0.45, 0.5, dot(n, normalize(uLight)));
  gl_FragColor = vec4(uColor * rim * uIntensity * (0.03 + lit), 1.0);
  ${outro}
}
`;

/**
 * The Sun as a telescope with a solar filter shows it: granulation (hot cells rising, darker lanes
 * where the gas sinks back, at two scales, each fading out before its cells get smaller than ~2 px
 * so nothing shimmers), bright faculae near the edge, and the edge darker and redder, as on the real
 * one. No map, no gloss, no sunspots (at this size they read as holes). uTint is the colour in the
 * middle, uLimb1/uLimb2 how much darker the edge gets in red, green and blue.
 */
export const sunFragment = /* glsl */ `
uniform float uTime;
uniform vec3 uTint;
uniform vec3 uLimb1;
uniform vec3 uLimb2;
varying vec3 vObj;
varying vec3 vNormalW;
varying vec3 vViewW;
${noise}
${cells}
void main() {
  vec3 p = normalize(vObj);
  float mu = max(dot(normalize(vNormalW), normalize(vViewW)), 0.0);
  float fw = max(length(fwidth(p)), 1e-5);

  float bright = 1.0;
  vec2 g1 = cells(p * 72.0, uTime * 0.18);
  float see1 = smoothstep(1.6, 3.5, 1.0 / (72.0 * fw));
  bright *= 1.0 + see1 * (0.05 * (0.5 - g1.x) - 0.12 * (1.0 - smoothstep(0.02, 0.14, g1.y - g1.x)));
  vec2 g2 = cells(p * 26.0 + 17.0, uTime * 0.07);
  float see2 = smoothstep(1.6, 3.5, 1.0 / (26.0 * fw));
  bright *= 1.0 + see2 * (0.05 * (0.5 - g2.x) - 0.06 * (1.0 - smoothstep(0.01, 0.1, g2.y - g2.x)));
  bright *= 1.0 + 0.07 * fbm(p * 5.0 + vec3(0.0, uTime * 0.004, 0.0));

  float belt = smoothstep(0.1, 0.25, abs(p.y)) * (1.0 - smoothstep(0.4, 0.6, abs(p.y)));
  bright *= 1.0 + 0.35 * pow(1.0 - mu, 2.0) * max(snoise(p * 18.0 + 3.0), 0.0) * belt;

  // Limb darkening, stronger in blue. The response stays linear, so the granulation keeps its
  // contrast (a saturating curve flattened it).
  float e = 1.0 - mu;
  vec3 col = uTint * (1.0 - uLimb1 * e - uLimb2 * e * e) * bright;
  gl_FragColor = vec4(min(col, vec3(1.0)), 1.0);
  #include <colorspace_fragment>
}
`;

/**
 * Around the Sun's edge, on a square facing the camera (uDisc = the disc's radius in the square's
 * units, 0.5 = the square's edge): the chromosphere, a thin ragged fringe of spicules that rise and
 * fall all round (uRim, its colour); prominences (uProm, 0 = none), see-through clouds of glowing
 * gas drawn out in fine threads that stream outwards, low along most of the edge and taller in a
 * few places that wander and change over the minutes (no shapes placed by hand, so nothing looks
 * stuck on); the warm light spilling past the edge (uGlow) and a faint, smooth pearly corona.
 * Everything moves slowly and smoothly, and nothing is finer than a few pixels, so nothing flickers.
 */
export const sunHaloFragment = /* glsl */ `
uniform float uTime;
uniform float uDisc;
uniform vec3 uRim;
uniform float uProm;
uniform float uGlow;
varying vec2 vUv;
${noise}
void main() {
  vec2 c = vUv - 0.5;
  float r = length(c);
  float h = (r - uDisc) / uDisc;
  if (h < -0.004) discard;
  float a = atan(c.y, c.x);
  vec2 ring = vec2(cos(a), sin(a));
  float t = uTime;
  float foot = smoothstep(-0.004, 0.002, h);
  float up = max(h, 0.0);

  float spic = 0.008 + 0.006 * (0.5 + 0.5 * snoise(vec3(ring * 32.0, t * 0.35))) + 0.01 * max(snoise(vec3(ring * 9.0, t * 0.12)), 0.0);
  float chrom = (1.0 - smoothstep(0.25 * spic, spic, h)) * foot;

  float prom = 0.0;
  if (uProm > 0.0 && h < 0.4) {
    // How high the gas reaches here: low almost everywhere, tall where the slow noise peaks.
    float tall = smoothstep(0.05, 0.5, fbm(vec3(ring * 1.4, t * 0.008)));
    float reach = 0.025 + 0.2 * tall;
    // The threads lean and bend more the higher they go, each plume its own way.
    float aw = a + h * 0.6 * snoise(vec3(ring * 2.0, 5.0 + t * 0.02));
    vec2 rw = vec2(cos(aw), sin(aw));
    float threads = 0.5 + 0.5 * snoise(vec3(rw * 24.0, h * 8.0 - t * 0.22));
    float cloud = fbm(vec3(rw * 7.0, h * 10.0 - t * 0.1));
    float body = 1.0 - smoothstep(0.0, 1.0, h / max(reach * (0.75 + 0.5 * cloud), 1e-3));
    prom = body * (0.25 + 0.75 * threads * threads) * (0.75 + 0.35 * cloud) * foot * uProm;
  }

  float glow = (0.7 * exp(-up / 0.035) + 0.3 * exp(-up / 0.15)) * 0.14 * uGlow * foot;
  float corona = exp(-up / 0.3) * 0.022 * (0.8 + 0.2 * snoise(vec3(ring * 2.0, 9.0))) * foot;

  // The gas glows deep red where it is thin, orange only where it is dense (never brown).
  vec3 gas = mix(vec3(1.0, 0.06, 0.01), vec3(1.0, 0.36, 0.06), smoothstep(0.45, 1.0, prom)) * prom;
  vec3 col = max(uRim * chrom, gas) + vec3(1.0, 0.55, 0.2) * glow + vec3(1.0, 0.88, 0.76) * corona;
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`;

/**
 * Flames around a disc (the profile photo in the menu): tongues of plasma that rise from the rim,
 * curl and fall back, never twice the same. Drawn on a square facing the camera; uDisc is the
 * radius of the disc in the square's units (0.5 = the square's edge).
 */
export const coronaVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const coronaFragment = /* glsl */ `
uniform float uTime;
uniform float uDisc;
uniform float uReach;
uniform float uStrength;
uniform float uRim;
varying vec2 vUv;
${noise}
void main() {
  vec2 c = vUv - 0.5;
  float r = length(c);
  float a = atan(c.y, c.x);
  // Height of the flames around the rim: a few big tongues, many small licks, all drifting.
  vec2 ring = vec2(cos(a), sin(a));
  float big = fbm(vec3(ring * 1.6, uTime * 0.11));
  float small = snoise(vec3(ring * 6.0, uTime * 0.35));
  float tongue = pow(max(big * 0.5 + 0.5, 0.0), 1.9) * 1.35 + max(small, 0.0) * 0.18;
  // Turbulence inside the flames, rising outwards.
  float h = (r - uDisc) / uReach;
  float flow = fbm(vec3(c * 9.0 / (0.55 + r), uTime * 0.5 - r * 7.0));
  float flame = smoothstep(tongue + 0.05, 0.0, h) * smoothstep(-0.06, 0.02, h);
  flame *= 0.6 + 0.55 * flow;
  // A thin, steady glow hugging the rim, under the flames.
  float rim = exp(-max(h, 0.0) * 9.0) * smoothstep(-0.05, 0.0, h);
  float k = clamp(flame + rim * uRim, 0.0, 1.4) * uStrength;
  // Hot yellow at the base, deep orange-red at the tips.
  vec3 col = mix(vec3(1.0, 0.27, 0.04), vec3(1.0, 0.78, 0.36), smoothstep(0.65, 0.0, h + (1.0 - flow) * 0.25));
  gl_FragColor = vec4(col * k, k);
}
`;

/** Rings: drawn on a flat ring in the planet's equator. */
export const ringVertex = /* glsl */ `
varying vec3 vLocal;
varying vec3 vWorld;
void main() {
  vLocal = position;
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

/** Saturn's rings from their real map (brightness and see-through across the radius), lit by the Sun,
 *  darkened in the planet's soft-edged shadow; uFade lets the rocks take over when the camera is close. */
export const ringTexFragment = /* glsl */ `
uniform vec3 uLight;
uniform vec3 uPlanet;
uniform float uPlanetR;
uniform float uInner;
uniform float uOuter;
uniform sampler2D uMap;
uniform float uFade;
varying vec3 vLocal;
varying vec3 vWorld;
void main() {
  float r = (length(vLocal.xy) - uInner) / (uOuter - uInner);
  if (r < 0.0 || r > 1.0) discard;
  vec4 tex = texture2D(uMap, vec2(r, 0.5));
  vec3 l = normalize(uLight);
  vec3 o = uPlanet - vWorld;
  float t = dot(o, l);
  float lit = t > 0.0 ? smoothstep(uPlanetR * 0.97, uPlanetR * 1.02, length(o - t * l)) : 1.0;
  gl_FragColor = vec4(tex.rgb * (0.12 + 1.01 * lit), tex.a * uFade);
  ${outro}
}
`;

/**
 * Uranus' rings, as they are: ten narrow ones (6, 5, 4, α, β, η, γ, δ, λ and the brightest, ε, wider
 * on one side), at their real radii. Each is at least a pixel wide on screen and fainter the
 * thinner it really is, so none flickers; faint dust between them; the planet's shadow across them.
 */
export const uranusRingFragment = /* glsl */ `
uniform vec3 uLight;
uniform vec3 uPlanet;
uniform float uPlanetR;
uniform float uOpacity;
varying vec3 vLocal;
varying vec3 vWorld;
float thin(float r, float fw, float at, float w, float k) {
  float hw = max(w * 0.5, fw * 0.7);
  return k * sqrt(min(1.0, w / (2.0 * hw))) * (1.0 - smoothstep(hw - fw * 0.5, hw + fw * 0.5, abs(r - at)));
}
void main() {
  float r = length(vLocal.xy);
  float fw = max(fwidth(r), 1e-5);
  float eps = 0.009 + 0.006 * cos(atan(vLocal.y, vLocal.x));
  float a = thin(r, fw, 1.637, 0.0025, 0.35)
          + thin(r, fw, 1.652, 0.0025, 0.35)
          + thin(r, fw, 1.666, 0.003, 0.4)
          + thin(r, fw, 1.750, 0.005, 0.55)
          + thin(r, fw, 1.786, 0.005, 0.55)
          + thin(r, fw, 1.846, 0.0025, 0.35)
          + thin(r, fw, 1.863, 0.0035, 0.45)
          + thin(r, fw, 1.890, 0.004, 0.5)
          + thin(r, fw, 1.957, 0.0025, 0.25)
          + thin(r, fw, 2.001, eps, 1.0);
  a += 0.035 * smoothstep(1.62, 1.7, r) * (1.0 - smoothstep(1.98, 2.03, r));
  vec3 l = normalize(uLight);
  vec3 o = uPlanet - vWorld;
  float t = dot(o, l);
  float lit = t > 0.0 ? smoothstep(uPlanetR * 0.97, uPlanetR * 1.03, length(o - t * l)) : 1.0;
  gl_FragColor = vec4(vec3(0.78, 0.84, 0.88) * (0.12 + 0.88 * lit), clamp(a, 0.0, 1.0) * uOpacity);
  ${outro}
}
`;

/**
 * Planets from their maps: soft terminator, a hint of atmosphere on the lit limb, and, switched on
 * per planet with defines, what makes each one itself:
 * BUMP (relief from the map, strongest where the light grazes), FLOW (the clouds carried by the
 * winds, latitude by latitude: 1 Jupiter, 2 Saturn, 3 Venus), SPOT (Jupiter's Great Red Spot,
 * turning), HEXAGON (Saturn's north pole), VORTEX (Venus' polar vortex), ICEGIANT (Uranus' bright
 * polar cap and faint bands), OCCLUDERS n (moons' shadows), RINGSHADOW (the rings' shadow on the
 * planet), GAS (fine detail along the bands rather than in every direction).
 * uLimb darkens the limb of gas giants; uDetail adds a fine grain when the planet is close.
 */
export const planetFragment = /* glsl */ `
uniform vec3 uLight;
uniform sampler2D uMap;
uniform vec3 uAtmo;
uniform float uAtmoStrength;
uniform float uAmbient;
uniform float uTerminator;
uniform float uLimb;
uniform float uDetail;
uniform float uTime;
#ifdef BUMP
uniform float uBump;
#endif
#ifdef OCCLUDERS
uniform vec4 uOcc[OCCLUDERS];
#endif
#ifdef SPOT
uniform vec3 uSpot;
uniform float uSpotR;
#endif
#ifdef RINGSHADOW
uniform sampler2D uRingMap;
uniform vec3 uRingNormal;
uniform vec3 uCentre;
uniform vec2 uRingSpan;
#endif
varying vec2 vUv;
varying vec3 vObj;
varying vec3 vWorld;
varying vec3 vNormalW;
varying vec3 vTangentW;
varying vec3 vViewW;
${noise}
${sampling}
${sphereMath}
float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

#ifdef FLOW
/** How far the clouds drift east or west in one flow period, by latitude (in map widths). */
float zonal(float lat) {
#if FLOW == 1
  return 0.006 * (sin(lat * 13.0) + 0.45 * sin(lat * 29.0 + 1.3)) * cos(lat);
#elif FLOW == 2
  return 0.0035 * sin(lat * 9.0 + 0.4) * cos(lat);
#else
  return 0.007 * cos(lat * 2.0) + 0.012 * smoothstep(0.85, 1.35, lat);
#endif
}
#endif

void main() {
  GRADS
  vec3 p = normalize(vObj);
  vec3 n = normalize(vNormalW);
  vec3 v = normalize(vViewW);
  vec3 l = normalize(uLight);
  float lat = asin(clamp(p.y, -1.0, 1.0));
  float colat = M_PI * 0.5 - lat;

#ifdef SPOT
  float sr = acos(clamp(dot(p, uSpot), -1.0, 1.0)) / uSpotR;
#endif

#ifdef FLOW
  // Two copies of the map, each carried along by the winds and set back in turn while the other
  // one shows: the clouds keep moving and the map never tears.
  float ph0 = fract(uTime / 14.0);
  float ph1 = fract(uTime / 14.0 + 0.5);
  vec3 q0 = p;
  vec3 q1 = p;
  float calm = 0.0;
#ifdef SPOT
  // The storm turns on itself (anticlockwise, fastest in its collar, calm at its eye), and the
  // bands flow round it rather than through it.
  float swirl = 0.28 * (1.0 - smoothstep(0.7, 1.35, sr)) * (0.35 + 0.65 * smoothstep(0.0, 0.8, sr));
  q0 = turnAbout(p, uSpot, -swirl * (ph0 - 0.5));
  q1 = turnAbout(p, uSpot, -swirl * (ph1 - 0.5));
  calm = 1.0 - smoothstep(1.0, 1.6, sr);
#endif
  float drift = zonal(lat) * (1.0 - calm);
  vec2 uv0 = dirUv(q0) + vec2(drift * (ph0 - 0.5), 0.0);
  vec2 uv1 = dirUv(q1) + vec2(drift * (ph1 - 0.5), 0.0);
  vec3 col = mix(SAMPLE(uMap, uv0).rgb, SAMPLE(uMap, uv1).rgb, abs(1.0 - 2.0 * ph0));
#else
  vec3 col = SAMPLE(uMap, vUv).rgb;
#endif

#ifdef SPOT
  col = mix(col, col * vec3(1.05, 0.97, 0.92), (1.0 - smoothstep(0.4, 1.0, sr)) * 0.5);
  col *= 1.0 - 0.06 * exp(-pow((sr - 1.12) / 0.16, 2.0));
#endif

#ifdef HEXAGON
  if (colat < 0.5) {
    // The jet stream round the north pole runs in a hexagon; inside it the air is clearer and
    // bluer, and the pole itself is a dark eye.
    float az = atan(p.z, p.x) + uTime * 0.004;
    float seg = mod(az, M_TAU / 6.0) - M_TAU / 12.0;
    float edge = 0.2 * cos(M_TAU / 12.0) / cos(seg) + 0.006 * snoise(vec3(p.xz * 30.0, uTime * 0.05));
    float inside = 1.0 - smoothstep(edge - 0.012, edge + 0.012, colat);
    col = mix(col, col * vec3(0.86, 0.92, 1.0) + vec3(0.0, 0.004, 0.012), inside * 0.6);
    col *= 1.0 - 0.18 * exp(-pow((colat - edge) / 0.01, 2.0));
    col *= mix(1.0, 0.55, 1.0 - smoothstep(0.015, 0.07, colat));
  }
#endif

#ifdef VORTEX
  if (colat < 0.75) {
    // Venus' polar vortex: two arms wound round the pole, turning, inside a darker cold collar.
    float az = atan(p.z, p.x);
    float sp = 2.0 * az - 11.0 * colat + uTime * 0.12 + 1.5 * snoise(p * 5.0 + uTime * 0.02);
    float arms = smoothstep(0.1, 0.9, 0.5 + 0.5 * cos(sp));
    col *= 1.0 + 0.16 * (arms - 0.5) * (1.0 - smoothstep(0.12, 0.5, colat));
    col *= 1.0 + 0.12 * (1.0 - smoothstep(0.0, 0.12, colat));
    col *= 1.0 - 0.12 * exp(-pow((colat - 0.55) / 0.08, 2.0));
  }
#endif

#ifdef ICEGIANT
  // Uranus' north: a bright hood over the pole with a faint darker collar, faint bands, a few small
  // bright clouds at mid latitudes.
  col = mix(col, col * 1.12 + vec3(0.035, 0.045, 0.045), (1.0 - smoothstep(0.42, 0.62, colat)) * 0.7);
  col *= 1.0 - 0.05 * exp(-pow((colat - 0.7) / 0.06, 2.0));
  col *= 1.0 + 0.025 * sin(lat * 18.0 + snoise(p * 3.0) * 0.8);
  col += vec3(0.05) * smoothstep(0.78, 0.9, snoise(p * 9.0)) * smoothstep(0.3, 0.6, lat) * (1.0 - smoothstep(0.8, 1.0, lat));
#endif

  vec3 nb = n;
#ifdef BUMP
  {
    vec2 e = TEXEL(uMap);
    float hx = luma(SAMPLE(uMap, vUv + vec2(e.x, 0.0)).rgb) - luma(SAMPLE(uMap, vUv - vec2(e.x, 0.0)).rgb);
    float hy = luma(SAMPLE(uMap, vUv + vec2(0.0, e.y)).rgb) - luma(SAMPLE(uMap, vUv - vec2(0.0, e.y)).rgb);
    // Slopes per unit of length on the sphere (a step along a parallel is shorter near the poles).
    float su = hx / (2.0 * e.x * M_TAU * max(cos(lat), 0.15));
    float sv = hy / (2.0 * e.y * M_PI);
    vec3 east = normalize(vTangentW - n * dot(n, vTangentW));
    vec3 north = cross(n, east);
    nb = normalize(n - uBump * (su * east + sv * north));
  }
#endif

  float ndl = dot(n, l);
  float ndlB = dot(nb, l);
  float day = smoothstep(-uTerminator, 0.65, ndlB) * clamp(1.0 + (ndlB - ndl) * 1.4, 0.35, 1.8);

#ifdef OCCLUDERS
  for (int i = 0; i < OCCLUDERS; i++) {
    vec4 o = uOcc[i];
    if (o.w <= 0.0) continue;
    vec3 d = o.xyz - vWorld;
    float t = dot(d, l);
    if (t <= 0.0) continue;
    day *= mix(0.06, 1.0, smoothstep(o.w * 0.8, o.w * 1.2, length(d - t * l)));
  }
#endif

#ifdef RINGSHADOW
  {
    float dn = dot(l, uRingNormal);
    float t = dot(uCentre - vWorld, uRingNormal) / (abs(dn) < 1e-4 ? 1e-4 : dn);
    float x = (length(vWorld + t * l - uCentre) - uRingSpan.x) / (uRingSpan.y - uRingSpan.x);
    float a = texture2D(uRingMap, vec2(clamp(x, 0.0, 1.0), 0.5)).a;
    day *= 1.0 - a * 0.85 * step(0.0, t) * step(0.0, x) * step(x, 1.0);
  }
#endif

  if (uDetail > 0.0) {
    float fw = length(fwidth(vObj));
#ifdef GAS
    vec3 dq = vec3(p.x * 70.0, p.y * 320.0, p.z * 70.0);
    float freq = 320.0;
#else
    vec3 dq = p * 140.0;
    float freq = 140.0;
#endif
    float g = snoise(dq) * 0.65 + snoise(dq * 2.03 + 11.0) * 0.35;
    col *= 1.0 + g * 0.08 * uDetail * (1.0 - smoothstep(0.2, 0.55, fw * freq));
  }

  // Real limbs are a touch darker (gas giants much more), and, with an atmosphere, softly coloured.
  float mu = max(dot(n, v), 0.0);
  float limb = mix(0.82 + 0.18 * mu, 0.45 + 0.55 * sqrt(mu), uLimb);
  vec3 lit = col * (uAmbient + day * 1.15) * limb;
  lit += uAtmo * pow(1.0 - mu, 3.0) * uAtmoStrength * smoothstep(-0.25, 0.6, ndl);
  gl_FragColor = vec4(lit, 1.0);
  ${outro}
}
`;

/**
 * Stars: steady, round, soft. They are as good as infinitely far, so their size does not depend on
 * distance, and none is smaller than ~2 px: a sub-pixel point jumps from pixel to pixel as the sky
 * turns, and that is what makes stars flicker.
 */
export const starsVertex = /* glsl */ `
attribute float aSize;
attribute vec3 aColor;
uniform float uPixelRatio;
varying vec3 vColor;
void main() {
  vColor = aColor;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = (1.3 + aSize * 0.6) * uPixelRatio;
  gl_Position = projectionMatrix * mv;
}
`;

export const starsFragment = /* glsl */ `
varying vec3 vColor;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.1, d);
  gl_FragColor = vec4(vColor * a, a);
}
`;
