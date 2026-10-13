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
    return !!window.WebGLRenderingContext && !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
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

/**
 * Where the page is in the trip through the solar system, as a continuous stop index:
 * 0 = the Sun (home), 1 = Mercury (about) … 7 = Uranus (contact); `local` is how far the current
 * section has been read (0–1), for effects inside a stop (the zoom on Saturn's rings).
 * Read every frame by the scene and by the menu.
 */
export const journey = { t: 0, local: 0, max: SECTION_IDS.length - 1 };

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

/**
 * Scroll position → stop index. The camera lingers at a planet while most of its section is on
 * screen, then travels to the next one during the last stretch.
 */
function updateJourney() {
  const vh = window.innerHeight;
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - vh;
  const starts = SECTION_IDS.map((id) => {
    const el = document.getElementById(id);
    return el ? el.getBoundingClientRect().top + y - vh * 0.35 : 0;
  });
  starts[0] = 0;
  // The last stop is reached at the very bottom at the latest.
  starts[starts.length - 1] = Math.min(starts[starts.length - 1], max);
  let t = 0;
  let local = 1;
  for (let i = 0; i < starts.length - 1; i++) {
    const a = starts[i];
    const b = starts[i + 1];
    if (y >= b) {
      t = i + 1;
      continue;
    }
    if (y >= a) {
      local = (y - a) / Math.max(1, b - a);
      t = i + smoothstep(0.45, 1, local);
    }
    break;
  }
  journey.t = Math.min(journey.max, Math.max(0, t));
  journey.local = local;
}

/* ------------------------------------------------------------------ Smooth scroll */

let lenis: Lenis | null = null;

/** Starts smooth scrolling (desktop wheel/trackpad; touch keeps its native feel) and the journey tracking. */
export function startMotion() {
  const onScroll = () => updateJourney();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  updateJourney();

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
    window.removeEventListener('resize', onScroll);
    if (tick) gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = null;
  };
}

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** A plain smooth scroll to a section (buttons inside the page). */
export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { duration: 1.4, easing: easeInOutCubic });
  else el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
}

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { duration: 1.6, easing: easeInOutCubic });
  else window.scrollTo({ top: 0, behavior: 'smooth' });
}

/** The menu jump: a smooth glide to the section, a little longer the farther it is. */
export function jumpToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (!lenis || reducedMotion()) return scrollToSection(id);
  const distance = Math.abs(SECTION_IDS.indexOf(id as (typeof SECTION_IDS)[number]) - journey.t);
  lenis.scrollTo(el, { duration: 1.1 + Math.min(distance, 7) * 0.16, easing: easeInOutCubic });
}

export { gsap, ScrollTrigger };
