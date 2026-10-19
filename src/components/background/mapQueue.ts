import { journey, lowPower } from '@/lib/motion';
import mercury512 from '@/assets/space/mercury-512.webp';
import mercury1k from '@/assets/space/mercury-1k.webp';
import mercury2k from '@/assets/space/mercury.webp';
import venus512 from '@/assets/space/venus-atmosphere-512.webp';
import venus1k from '@/assets/space/venus-atmosphere-1k.webp';
import venus2k from '@/assets/space/venus-atmosphere.webp';
import earthDay1k from '@/assets/space/earth-day-1k.webp';
import earthDay2k from '@/assets/space/earth-day.webp';
import earthNight1k from '@/assets/space/earth-night-1k.webp';
import earthNight2k from '@/assets/space/earth-night.webp';
import earthSpec1k from '@/assets/space/earth-specular-1k.webp';
import earthSpec2k from '@/assets/space/earth-specular.webp';
import earthClouds from '@/assets/space/earth-clouds.webp';
import moon512 from '@/assets/space/moon-512.webp';
import moon1k from '@/assets/space/moon.webp';
import mars512 from '@/assets/space/mars-512.webp';
import mars1k from '@/assets/space/mars-1k.webp';
import mars2k from '@/assets/space/mars.webp';
import jupiter512 from '@/assets/space/jupiter-512.webp';
import jupiter1k from '@/assets/space/jupiter-1k.webp';
import jupiter2k from '@/assets/space/jupiter.webp';
import saturn512 from '@/assets/space/saturn-512.webp';
import saturn1k from '@/assets/space/saturn-1k.webp';
import saturn2k from '@/assets/space/saturn.webp';
import saturnRing from '@/assets/space/saturn-ring.png';
import uranus512 from '@/assets/space/uranus-512.webp';
import uranus1k from '@/assets/space/uranus-1k.webp';
import uranus2k from '@/assets/space/uranus.webp';

/* The planets' maps, downloaded in the order they are needed: first a light version of every map,
   the nearest planets first, then the sharp versions, again the nearest first. Nothing waits for
   the 3D code: the queue starts with the page, and the scene picks up whatever has arrived. */

export type MapId =
  | 'mercury'
  | 'venus'
  | 'earthDay'
  | 'earthNight'
  | 'earthSpec'
  | 'earthClouds'
  | 'moon'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'saturnRing'
  | 'uranus';

interface Source {
  /** The stop where the map is seen (for the order). */
  stop: number;
  /** Light → sharp; phones and modest machines get the ladder one step down. */
  big: string[];
  small: string[];
}

const SOURCES: Record<MapId, Source> = {
  mercury: { stop: 1, big: [mercury1k, mercury2k], small: [mercury512, mercury1k] },
  venus: { stop: 2, big: [venus1k, venus2k], small: [venus512, venus1k] },
  earthDay: { stop: 3, big: [earthDay1k, earthDay2k], small: [earthDay1k] },
  earthNight: { stop: 3, big: [earthNight1k, earthNight2k], small: [earthNight1k] },
  earthSpec: { stop: 3, big: [earthSpec1k, earthSpec2k], small: [earthSpec1k] },
  earthClouds: { stop: 3, big: [earthClouds], small: [earthClouds] },
  moon: { stop: 3, big: [moon512, moon1k], small: [moon512] },
  mars: { stop: 4, big: [mars1k, mars2k], small: [mars512, mars1k] },
  jupiter: { stop: 5, big: [jupiter1k, jupiter2k], small: [jupiter512, jupiter1k] },
  saturn: { stop: 6, big: [saturn1k, saturn2k], small: [saturn512, saturn1k] },
  saturnRing: { stop: 6, big: [saturnRing], small: [saturnRing] },
  uranus: { stop: 7, big: [uranus1k, uranus2k], small: [uranus512, uranus1k] },
};

export const MAP_COUNT = Object.keys(SOURCES).length;

/** A decoded map, ready to go to the graphics card. */
export interface Arrival {
  id: MapId;
  level: number;
  /** ImageBitmaps come already flipped for WebGL; plain images are flipped on upload. */
  image: ImageBitmap | HTMLImageElement;
  flipped: boolean;
}

const arrived: Arrival[] = [];
const listeners = new Set<(a: Arrival) => void>();

/** Every map decoded so far, then each new one as it arrives. */
export function onMap(cb: (a: Arrival) => void) {
  arrived.forEach(cb);
  listeners.add(cb);
  return () => void listeners.delete(cb);
}

/* createImageBitmap decodes off the main thread and hands over a bitmap that uploads without a
   copy; Safari and older Firefox do not honour its options, so they get plain decoded images. */
const bitmaps = (() => {
  if (typeof createImageBitmap === 'undefined') return false;
  const ua = navigator.userAgent;
  if (/^((?!chrome|android).)*safari/i.test(ua)) return false;
  const ff = ua.match(/Firefox\/(\d+)/);
  return !ff || Number(ff[1]) >= 98;
})();

async function decode(url: string): Promise<{ image: ImageBitmap | HTMLImageElement; flipped: boolean }> {
  if (bitmaps) {
    const blob = await fetch(url).then((r) => {
      if (!r.ok) throw new Error(url);
      return r.blob();
    });
    const image = await createImageBitmap(blob, { imageOrientation: 'flipY', premultiplyAlpha: 'none', colorSpaceConversion: 'none' });
    return { image, flipped: true };
  }
  const img = new Image();
  img.decoding = 'async';
  img.src = url;
  await img.decode();
  return { image: img, flipped: false };
}

let started = false;

/** Starts the downloads (once). Cheap to call from anywhere that knows the 3D is coming. */
export function startMapQueue() {
  if (started) return;
  started = true;
  const small = lowPower();
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  const thrifty = !!conn?.saveData || /(^|-)2g|3g/.test(conn?.effectiveType ?? '');

  const pending: { id: MapId; level: number; url: string; stop: number }[] = [];
  for (const id of Object.keys(SOURCES) as MapId[]) {
    const src = SOURCES[id];
    const ladder = small ? src.small : src.big;
    ladder.slice(0, thrifty ? 1 : ladder.length).forEach((url, level) => pending.push({ id, level, url, stop: src.stop }));
  }

  // The next map: light versions before sharp ones, the planet you are at (or next to) first.
  const next = () => {
    let best = -1;
    let bestScore = Infinity;
    pending.forEach((p, i) => {
      const score = p.level * 3 + Math.abs(p.stop - journey.t);
      if (score < bestScore) {
        bestScore = score;
        best = i;
      }
    });
    return best < 0 ? null : pending.splice(best, 1)[0];
  };

  const worker = async () => {
    for (let job = next(); job; job = next()) {
      try {
        const { image, flipped } = await decode(job.url);
        const a: Arrival = { id: job.id, level: job.level, image, flipped };
        // Only the sharpest version so far is kept (one may finish before a lighter one).
        const old = arrived.findIndex((x) => x.id === a.id);
        if (old >= 0 && arrived[old].level > a.level) continue;
        if (old >= 0) arrived.splice(old, 1);
        arrived.push(a);
        listeners.forEach((cb) => cb(a));
      } catch {
        // A map that does not arrive leaves the lighter one in place (or the planet hidden).
      }
    }
  };
  for (let i = 0; i < 3; i++) void worker();
}
