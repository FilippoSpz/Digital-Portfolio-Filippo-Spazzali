import * as THREE from 'three';
import { onMap, startMapQueue, type Arrival, type MapId } from './mapQueue';

/* The maps as the shaders see them: one uniform per map that never changes, whose texture is
   swapped for a sharper one when it arrives. Uploads to the graphics card are spread out, one per
   frame, so a big map never holds a frame up together with other work. */

const COLOR: Partial<Record<MapId, boolean>> = { earthNight: false, earthSpec: false, earthClouds: false };

const live = new Map<MapId, { value: THREE.Texture | null }>();
const level = new Map<MapId, number>();
const queue: Arrival[] = [];

export function mapUniform(id: MapId) {
  let u = live.get(id);
  if (!u) live.set(id, (u = { value: null }));
  return u;
}

/** True once every one of these maps is on the graphics card (a planet shows only then). */
export const mapsReady = (ids: readonly MapId[]) => ids.every((id) => live.get(id)?.value);

let subscribed = false;

function subscribe() {
  if (subscribed) return;
  subscribed = true;
  startMapQueue();
  onMap((a) => {
    if ((level.get(a.id) ?? -1) >= a.level) return;
    // A newer version of a map still waiting replaces it in the line.
    const waiting = queue.findIndex((q) => q.id === a.id);
    if (waiting >= 0) queue.splice(waiting, 1);
    queue.push(a);
  });
}

let maxAnisotropy = 8;

/**
 * Called once per frame by the scene: uploads at most one waiting map. Light versions go first,
 * so every planet can show as early as possible.
 */
export function pumpMaps(gl: THREE.WebGLRenderer) {
  subscribe();
  if (!queue.length) return;
  maxAnisotropy = gl.capabilities.getMaxAnisotropy();
  let pick = 0;
  queue.forEach((q, i) => {
    if (q.level < queue[pick].level) pick = i;
  });
  const a = queue.splice(pick, 1)[0];
  const tex = new THREE.Texture(a.image as HTMLImageElement);
  tex.flipY = !a.flipped;
  tex.colorSpace = COLOR[a.id] === false ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  // Around the planet the map wraps; along the rings it does not.
  tex.wrapS = a.id === 'saturnRing' ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
  tex.anisotropy = Math.min(maxAnisotropy, 16);
  tex.needsUpdate = true;
  gl.initTexture(tex);
  const u = mapUniform(a.id);
  u.value?.dispose();
  u.value = tex;
  level.set(a.id, a.level);
}

/** Starts the downloads right away (before the scene's first frame). */
export const preloadMaps = subscribe;
