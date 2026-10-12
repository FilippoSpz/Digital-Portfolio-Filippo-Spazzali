/* GLSL for the solar system: planets drawn procedurally (bands, storms, terrain), Earth from real
   NASA maps, the Sun, Saturn's rings, the stars and the hyperspace streaks. */

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

/** Gas giants: latitude bands bent by turbulence, an optional oval storm (Jupiter's Great Red Spot). */
export const gasGiantFragment = /* glsl */ `
uniform vec3 uLight;
uniform float uTime;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
uniform vec3 uC4;
uniform float uBands;
uniform float uTurb;
uniform vec3 uAtmo;
uniform float uSpot;
uniform vec3 uSpotColor;
varying vec3 vObj;
varying vec3 vNormalW;
varying vec3 vViewW;
${noise}
${lighting}
void main() {
  vec3 p = normalize(vObj);
  float lat = p.y;
  float flow = fbm(vec3(p.x * 1.6, p.y * 9.0, p.z * 1.6) + vec3(uTime * 0.012, 0.0, uTime * 0.008));
  float b = lat * uBands + flow * uTurb;
  float s = sin(b * 3.14159);
  float s2 = sin(b * 1.73 + 1.3);
  vec3 col = mix(uC1, uC2, smoothstep(-0.9, 0.9, s));
  col = mix(col, uC3, smoothstep(0.35, 1.0, s2) * 0.65);
  float fine = fbm(p * 7.0 + flow * 2.0);
  col = mix(col, uC4, smoothstep(0.25, 0.9, fine) * 0.35);
  col *= 0.88 + 0.24 * fbm(vec3(p.x * 3.0, p.y * 30.0, p.z * 3.0));

  if (uSpot > 0.5) {
    float lon = atan(p.z, p.x);
    float dlon = lon - 0.9;
    dlon = mod(dlon + 3.14159, 6.28318) - 3.14159;
    float dlat = asin(clamp(p.y, -1.0, 1.0)) + 0.38;
    float e = sqrt(dlon * dlon * 0.32 + dlat * dlat * 1.6);
    float swirl = sin(e * 55.0 - atan(dlat, dlon) * 2.0 + flow * 6.0) * 0.5 + 0.5;
    float m = smoothstep(0.17, 0.09, e);
    col = mix(col, uSpotColor * (0.75 + 0.35 * swirl), m);
  }

  vec3 n = normalize(vNormalW);
  vec3 v = normalize(vViewW);
  float d = daylight(n, normalize(uLight));
  vec3 lit = col * (0.025 + d * 1.1);
  lit += uAtmo * fresnel(n, v, 2.6) * (0.08 + d * 0.9);
  gl_FragColor = vec4(lit, 1.0);
  ${outro}
}
`;

/** Rocky worlds (Mars): terrain from fractal noise, dark maria, polar caps. */
export const rockyFragment = /* glsl */ `
uniform vec3 uLight;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
uniform vec3 uAtmo;
varying vec3 vObj;
varying vec3 vNormalW;
varying vec3 vViewW;
${noise}
${lighting}
void main() {
  vec3 p = normalize(vObj);
  float h = fbm(p * 2.6);
  float h2 = fbm(p * 11.0 + 7.0);
  vec3 col = mix(uC1, uC2, smoothstep(-0.45, 0.45, h + h2 * 0.35));
  col = mix(col, uC3, smoothstep(0.15, 0.55, fbm(p * 1.4 + 3.0)) * 0.55);
  // Craters as small dark rings.
  float c = snoise(p * 22.0);
  col *= 1.0 - smoothstep(0.55, 0.75, c) * 0.25 + smoothstep(0.75, 0.8, c) * 0.12;
  float cap = smoothstep(0.91, 0.96, abs(p.y) + h * 0.05);
  col = mix(col, vec3(0.86, 0.8, 0.74), cap * 0.85);

  vec3 n = normalize(vNormalW);
  vec3 v = normalize(vViewW);
  // A little relief: the noise tilts the light.
  float relief = (h2 - fbm(p * 11.0 + vec3(7.03, 7.0, 7.0))) * 6.0;
  float d = daylight(n, normalize(uLight)) * (0.92 + relief * 0.25);
  vec3 lit = col * (0.02 + max(d, 0.0) * 1.1);
  lit += uAtmo * fresnel(n, v, 3.0) * (0.05 + d * 0.5);
  gl_FragColor = vec4(lit, 1.0);
  ${outro}
}
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
  col += vec3(1.0, 0.95, 0.85) * pow(max(dot(n, hv), 0.0), 60.0) * ocean * 0.9 * day;
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

/** The Sun: boiling granulation, bright enough (above 1.0) for the bloom to catch. */
export const sunFragment = /* glsl */ `
uniform float uTime;
varying vec3 vObj;
varying vec3 vNormalW;
varying vec3 vViewW;
${noise}
void main() {
  vec3 p = normalize(vObj);
  float g = fbm(p * 3.2 + vec3(0.0, uTime * 0.04, uTime * 0.025));
  float g2 = fbm(p * 22.0 - vec3(uTime * 0.07));
  float heat = 0.55 + 0.45 * g + 0.25 * g2;
  vec3 col = mix(vec3(0.85, 0.16, 0.01), vec3(1.0, 0.52, 0.12), smoothstep(0.25, 1.05, heat));
  col = mix(col, vec3(0.5, 0.06, 0.0), smoothstep(0.45, 0.15, heat) * 0.6);
  float limb = pow(max(dot(normalize(vNormalW), normalize(vViewW)), 0.0), 0.5);
  // Bright enough for the bloom, not so bright that it all turns white.
  gl_FragColor = vec4(col * (0.95 + heat * 0.85) * (0.5 + 0.5 * limb), 1.0);
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

/** Stars: round, soft, each at its own size and twinkling at its own pace. */
export const starsVertex = /* glsl */ `
attribute float aSize;
attribute float aSeed;
attribute vec3 aColor;
uniform float uTime;
uniform float uPixelRatio;
varying vec3 vColor;
varying float vTwinkle;
void main() {
  vColor = aColor;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vTwinkle = 0.65 + 0.35 * sin(uTime * (0.6 + aSeed * 2.4) + aSeed * 40.0);
  gl_PointSize = clamp(aSize * uPixelRatio * (90.0 / -mv.z), 0.8, 7.0 * uPixelRatio);
  gl_Position = projectionMatrix * mv;
}
`;

export const starsFragment = /* glsl */ `
varying vec3 vColor;
varying float vTwinkle;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(vColor * vTwinkle * (0.6 + a), a);
}
`;

/** Hyperspace: streaks rushing past the camera, longer and brighter as the jump builds. */
export const warpVertex = /* glsl */ `
attribute float aTail;
attribute float aSpeed;
uniform float uTime;
uniform float uWarp;
varying float vTail;
void main() {
  vTail = aTail;
  vec3 p = position;
  float span = 140.0;
  p.z = mod(p.z + uTime * aSpeed * (20.0 + uWarp * 220.0), span) - span + 4.0;
  p.z += aTail * (1.5 + uWarp * 26.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

export const warpFragment = /* glsl */ `
uniform float uWarp;
uniform vec3 uColor;
varying float vTail;
void main() {
  gl_FragColor = vec4(uColor * (1.0 + uWarp * 1.5), uWarp * (1.0 - vTail * 0.9));
}
`;
