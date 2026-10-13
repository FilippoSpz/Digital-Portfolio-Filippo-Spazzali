/* GLSL for the solar system: every planet from real maps (NASA / Solar System Scope), the Sun with its
   boiling surface and flames, Saturn's rings, the stars. */

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

/** Every body: object-space position (for the noise), world normal, direction to the camera. */
export const sphereVertex = /* glsl */ `
varying vec3 vObj;
varying vec3 vNormalW;
varying vec3 vViewW;
varying vec2 vUv;
void main() {
  vObj = position;
  vUv = uv;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vNormalW = normalize(mat3(modelMatrix) * normal);
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

/** Earth from NASA maps: day side, city lights on the night side, shining oceans, blue limb. */
export const earthFragment = /* glsl */ `
uniform vec3 uLight;
uniform sampler2D uDay;
uniform sampler2D uNight;
uniform sampler2D uSpec;
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vViewW;
${lighting}
void main() {
  vec3 n = normalize(vNormalW);
  vec3 v = normalize(vViewW);
  vec3 l = normalize(uLight);
  float ndl = dot(n, l);
  float day = smoothstep(-0.15, 0.3, ndl);
  vec3 dayCol = texture2D(uDay, vUv).rgb * (0.12 + max(ndl, 0.0) * 1.15);
  float lights = texture2D(uNight, vUv).r;
  vec3 nightCol = vec3(1.0, 0.72, 0.42) * pow(lights, 1.4) * 2.2;
  vec3 col = mix(nightCol, dayCol, day);
  float ocean = texture2D(uSpec, vUv).r;
  vec3 hv = normalize(l + v);
  // The Sun's glint on the oceans: a small bright spot, not a blur.
  float nh = max(dot(n, hv), 0.0);
  col += vec3(1.0, 0.93, 0.82) * (pow(nh, 260.0) * 0.55 + pow(nh, 40.0) * 0.05) * ocean * day;
  col += vec3(0.32, 0.6, 1.0) * fresnel(n, v, 2.4) * (0.06 + day * 0.85);
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
  gl_FragColor = vec4(uColor * rim * uIntensity * (0.12 + lit), 1.0);
  ${outro}
}
`;

/** The Sun from its map, slowly boiling (the map drifts on noise), darker towards the rim. */
export const sunFragment = /* glsl */ `
uniform float uTime;
uniform sampler2D uMap;
varying vec2 vUv;
varying vec3 vObj;
varying vec3 vNormalW;
varying vec3 vViewW;
${noise}
void main() {
  vec3 p = normalize(vObj);
  vec2 drift = vec2(snoise(p * 4.0 + uTime * 0.05), snoise(p * 4.0 - uTime * 0.04)) * 0.004;
  vec3 map = texture2D(uMap, vUv + drift).rgb;
  float boil = 0.85 + 0.3 * fbm(p * 18.0 + vec3(uTime * 0.06));
  float mu = max(dot(normalize(vNormalW), normalize(vViewW)), 0.0);
  float limb = 0.42 + 0.58 * pow(mu, 0.45);
  vec3 col = map * vec3(1.35, 0.95, 0.62) * boil * limb * 1.6;
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`;

/**
 * Flames around a disc (the Sun in the sky, the profile photo in the menu): tongues of plasma that
 * rise from the rim, curl and fall back, never twice the same. Drawn on a square facing the camera;
 * uDisc is the radius of the disc in the square's units (0.5 = the square's edge).
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

/**
 * Saturn's rings: density bands across the radius, the Cassini division, lit by the Sun and
 * darkened where the planet casts its shadow.
 */
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

export const ringFragment = /* glsl */ `
uniform vec3 uLight;
uniform vec3 uPlanet;
uniform float uPlanetR;
uniform float uInner;
uniform float uOuter;
uniform vec3 uColA;
uniform vec3 uColB;
uniform float uOpacity;
varying vec3 vLocal;
varying vec3 vWorld;
${noise}
void main() {
  float r = (length(vLocal.xy) - uInner) / (uOuter - uInner);
  if (r < 0.0 || r > 1.0) discard;
  float bands = 0.5 + 0.5 * sin(r * 140.0) * 0.4 + 0.5 * snoise(vec3(r * 40.0, 0.0, 0.0)) * 0.5;
  float density = smoothstep(0.0, 0.08, r) * (1.0 - smoothstep(0.94, 1.0, r));
  density *= 1.0 - smoothstep(0.6, 0.62, r) * (1.0 - smoothstep(0.67, 0.69, r)) * 0.92; // Cassini division
  density *= 0.55 + bands * 0.6;
  vec3 col = mix(uColA, uColB, bands);
  // Shadow of the planet on the rings.
  vec3 l = normalize(uLight);
  vec3 oc = vWorld - uPlanet;
  float b = dot(oc, l);
  float c = dot(oc, oc) - uPlanetR * uPlanetR;
  float shadow = (b < 0.0 && b * b - c > 0.0) ? 0.12 : 1.0;
  gl_FragColor = vec4(col * (0.25 + 0.9 * shadow), density * uOpacity);
  ${outro}
}
`;

/** Saturn's rings from their real map (brightness and see-through across the radius), lit by the Sun,
 *  darkened in the planet's shadow; uFade lets the rocks take over when the camera is close. */
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
  vec3 oc = vWorld - uPlanet;
  float b = dot(oc, l);
  float c = dot(oc, oc) - uPlanetR * uPlanetR;
  float shadow = (b < 0.0 && b * b - c > 0.0) ? 0.1 : 1.0;
  gl_FragColor = vec4(tex.rgb * (0.18 + 0.95 * shadow), tex.a * uFade);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/** Planets from their maps: soft terminator, a hint of atmosphere on the lit limb. */
export const planetFragment = /* glsl */ `
uniform vec3 uLight;
uniform sampler2D uMap;
uniform vec3 uAtmo;
uniform float uAtmoStrength;
uniform float uAmbient;
uniform float uTerminator;
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vViewW;
void main() {
  vec3 n = normalize(vNormalW);
  vec3 v = normalize(vViewW);
  vec3 l = normalize(uLight);
  vec3 col = texture2D(uMap, vUv).rgb;
  float ndl = dot(n, l);
  float day = smoothstep(-uTerminator, 0.65, ndl);
  // Real limbs are a touch darker (and, with an atmosphere, softly coloured).
  float mu = max(dot(n, v), 0.0);
  vec3 lit = col * (uAmbient + day * 1.15) * (0.82 + 0.18 * mu);
  lit += uAtmo * pow(1.0 - mu, 3.0) * uAtmoStrength * smoothstep(-0.25, 0.6, ndl);
  gl_FragColor = vec4(lit, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
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
