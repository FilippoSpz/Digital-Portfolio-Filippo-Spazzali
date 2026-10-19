import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SECTION_IDS } from '@/data/navigation';

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------ Device capability */

const media = (q: string) => typeof window !== 'undefined' && window.matchMedia(q).matches;

/** Users who asked for less motion get the calm, static site. */
export const reducedMotion = () => media('(prefers-reduced-motion: reduce)');

/**
 * Phones, tablets and modest machines get a lighter version of the 3D (fewer particles, no
 * post-processing): the same look, at a frame rate that stays smooth.
 */
export const lowPower = (() => {
  let cached: boolean | null = null;
  return () => {
    if (cached !== null) return cached;
    const nav = navigator as Navigator & { deviceMemory?: number };
    cached =
      media('(pointer: coarse)') ||
      window.innerWidth < 900 ||
      (nav.hardwareConcurrency ?? 8) <= 4 ||
      (nav.deviceMemory ?? 8) <= 4;
    return cached;
  };
})();

export const supportsWebGL = () => {
  try {
    const canvas = document.createElement('canvas');
    const gl = window.WebGLRenderingContext ? canvas.getContext('webgl2') || canvas.getContext('webgl') : null;
    // The test context is given back at once (browsers allow only a few at a time).
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
};

/**
 * Test drive (`?drive` in the address, for checking the 3D in a browser that is not on screen):
 * the scenes stop running by themselves and advance only when window.__advance(seconds) is called.
 */
export const testDrive = typeof location !== 'undefined' && new URLSearchParams(location.search).has('drive');

/** The full 3D experience: WebGL available and motion welcome. */
export const rich3D = () => !reducedMotion() && supportsWebGL();

/* ------------------------------------------------------------------ The journey */

/** A menu jump in progress: the page glides from y0 to y1, the sky goes straight from one stop to the other. */
interface Jump {
  id: number;
  from: number;
  to: number;
  fromPos: number;
  toPos: number;
  y0: number;
  y1: number;
}

/**
 * Where the page is in the trip through the solar system, read every frame by the scene and by the menu.
 * `t` is the stop on stage, as a continuous index: 0 = the Sun (home), 1 = Mercury (about) … 7 = Uranus
 * (contact). `pos` is how far the page has been read, section by section (3.4 = 40% through the
 * fourth): each planet comes closer while its section is read and stays close until it leaves.
 * During a jump `travel` goes straight from the old stop to the new one (the menu's satellite and
 * the stars follow it), while `t` only lets the current planet leave and the new one arrive: the
 * ones in between are skipped. `shown`/`shownPos` are what the scene shows right now (written by
 * it), so a jump starts exactly from there.
 */
export const journey = {
  t: 0,
  local: 0,
  pos: 0,
  travel: 0,
  max: SECTION_IDS.length - 1,
  shown: Number.NaN,
  shownPos: Number.NaN,
  /** The jump in progress (null when the page is just scrolled), and how far it has gone (0–1). */
  jump: null as Jump | null,
  jumpP: 0,
};

const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/**
 * Where each section starts in the trip (a little before its top reaches the top of the screen) and
 * its top on the page. Measured once and again only when the page changes size: reading the layout
 * on every scroll made the browser recompute it while the page was moving.
 */
const layout = { starts: [] as number[], tops: [] as number[], leave: [] as number[], max: 0 };

function measure() {
  const vh = window.innerHeight;
  const y = window.scrollY;
  // Phones and tablets (no menu column: the planet sits above the title, in the empty band left
  // for it): a stop is reached as its section's top meets the top of the screen, and the trip there
  // takes only the last screen before it, so the planet rises in together with its band.
  const narrow = window.innerWidth < 1024;
  layout.max = Math.max(0, document.documentElement.scrollHeight - vh);
  layout.tops = SECTION_IDS.map((id) => {
    const el = document.getElementById(id);
    return el ? el.getBoundingClientRect().top + y : 0;
  });
  layout.starts = layout.tops.map((top) => top - vh * (narrow ? 0 : 0.35));
  layout.starts[0] = 0;
  // The last stop is reached at the very bottom at the latest.
  const last = layout.starts.length - 1;
  layout.starts[last] = Math.min(layout.starts[last], layout.max);
  // How far into each section (0…1) the trip to the next stop begins.
  layout.leave = layout.starts.map((start, i) => {
    if (!narrow || i === last) return 0.45;
    return Math.max(0.45, 1 - (vh * 0.85) / Math.max(1, layout.starts[i + 1] - start));
  });
}

/**
 * Scroll position → stop and reading position. The camera lingers at a planet while most of its
 * section is on screen, then travels to the next one during the last stretch.
 */
function mapScroll(y: number) {
  const { starts, max } = layout;
  const last = starts.length - 1;
  if (last < 0) return { t: 0, local: 0, pos: 0 };
  if (y >= starts[last]) {
    const local = max > starts[last] ? clamp01((y - starts[last]) / (max - starts[last])) : 1;
    return { t: last, local, pos: last + local };
  }
  for (let i = 0; i < last; i++) {
    if (y < starts[i + 1]) {
      const local = clamp01((y - starts[i]) / Math.max(1, starts[i + 1] - starts[i]));
      return { t: i + smoothstep(layout.leave[i] ?? 0.45, 1, local), local, pos: i + local };
    }
  }
  return { t: last, local: 0, pos: last };
}

/* Who wants to know when a jump starts or ends (the menu marks the target at once). */
const jumpListeners = new Set<(target: string | null) => void>();
export function onJump(cb: (target: string | null) => void) {
  jumpListeners.add(cb);
  return () => void jumpListeners.delete(cb);
}

let jumpCount = 0;

function endJump() {
  if (!journey.jump) return;
  journey.jump = null;
  updateJourney();
  jumpListeners.forEach((cb) => cb(null));
}

function updateJourney() {
  const y = window.scrollY;
  const m = mapScroll(y);
  journey.local = m.local;
  const j = journey.jump;
  if (j) {
    const span = j.y1 - j.y0;
    const p = span === 0 ? 1 : (y - j.y0) / span;
    if (p >= -0.02 && p <= 1.02) {
      const q = clamp01(p);
      const half = j.to > j.from ? 0.5 : -0.5;
      // First half: the planet on stage leaves. Second half: the new one arrives.
      journey.t = q < 0.5 ? lerp(j.from, Math.round(j.from) + half, q * 2) : lerp(Math.round(j.to) - half, j.to, q * 2 - 1);
      journey.pos = q < 0.5 ? j.fromPos : j.toPos;
      journey.travel = lerp(j.from, j.to, q);
      journey.jumpP = q;
      return;
    }
    // The page went somewhere else (resized, or moved by other means): back to following it.
    journey.jump = null;
    jumpListeners.forEach((cb) => cb(null));
  }
  journey.t = Math.min(journey.max, Math.max(0, m.t));
  journey.pos = m.pos;
  journey.travel = journey.t;
  journey.jumpP = 0;
}

/* ------------------------------------------------------------------ Smooth scroll */

let lenis: Lenis | null = null;

const INPUTS = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;

/** Starts smooth scrolling (desktop wheel/trackpad; touch keeps its native feel) and the journey tracking. */
export function startMotion() {
  const onScroll = () => updateJourney();
  const onResize = () => (measure(), updateJourney());
  // Any input of the reader's own ends a jump: the page is theirs again.
  const onInput = () => endJump();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('load', onResize);
  for (const type of INPUTS) window.addEventListener(type, onInput, { passive: true });
  // Content that changes height (images, fonts) moves the sections below it.
  const resizer = new ResizeObserver(onResize);
  resizer.observe(document.body);
  onResize();

  let tick: ((time: number) => void) | null = null;
  if (!reducedMotion()) {
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.9 });
    lenis.on('scroll', ScrollTrigger.update);
    tick = (time: number) => lenis?.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
  }

  return () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('load', onResize);
    for (const type of INPUTS) window.removeEventListener(type, onInput);
    resizer.disconnect();
    if (tick) gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = null;
  };
}

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * A glide to a section. When it leads to another stop the sky does not run through every planet in
 * between: the current one leaves, the stars turn, the new one arrives.
 */
function glideTo(index: number) {
  const el = document.getElementById(SECTION_IDS[index]);
  if (!el) return;
  if (!lenis || reducedMotion()) {
    el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
    return;
  }
  if (!layout.tops.length) measure();
  const y0 = window.scrollY;
  const y1 = index === 0 ? 0 : Math.min(Math.max(0, layout.tops[index]), layout.max);
  const from = Number.isFinite(journey.shown) ? journey.shown : journey.t;
  const fromPos = Number.isFinite(journey.shownPos) ? journey.shownPos : journey.pos;
  const end = mapScroll(y1);
  const duration = 1.15 + Math.min(Math.abs(end.t - from), 7) * 0.1;
  if (Math.round(from) !== Math.round(end.t)) {
    journey.jump = { id: ++jumpCount, from, to: end.t, fromPos, toPos: end.pos, y0, y1 };
    updateJourney();
    jumpListeners.forEach((cb) => cb(SECTION_IDS[index]));
  } else endJump();
  const id = jumpCount;
  lenis.scrollTo(y1, {
    duration,
    easing: easeInOutCubic,
    force: true,
    onComplete: () => {
      if (journey.jump?.id === id) endJump();
    },
  });
}

const indexOf = (id: string) => SECTION_IDS.indexOf(id as (typeof SECTION_IDS)[number]);

/** A smooth glide to a section (the menu, and buttons inside the page). */
export function scrollToSection(id: string) {
  const i = indexOf(id);
  if (i >= 0) glideTo(i);
}

export function scrollToTop() {
  glideTo(0);
}

/** The menu jump: the same glide, from wherever the page is. */
export const jumpToSection = scrollToSection;

export { gsap, ScrollTrigger };
