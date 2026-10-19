import { navItems, outerBodies, type Body } from '@/data/navigation';

/* Where everything sits in the desktop menu (px, from the column's top-left corner): the Sun (the
   profile photo) in the top-left, each planet resting on its own orbit around it, fanning down and
   to the right, and the two outer bodies (language, CV) at the bottom, beyond the last orbit. */

export interface MenuNode {
  body: Body;
  x: number;
  y: number;
  /** Radius of the body, px. */
  r: number;
  /** Radius of its orbit around the Sun, px. */
  orbit: number;
}

/** What the little 3D sky draws: the desktop menu, or the phone's dock (no outer bodies there). */
export interface SkyLayout {
  width: number;
  height: number;
  sun: MenuNode;
  /** One per section after Home, in order (Mercury … Uranus). */
  planets: MenuNode[];
  language?: MenuNode;
  resume?: MenuNode;
}

export interface MenuLayout extends SkyLayout {
  language: MenuNode;
  resume: MenuNode;
}

export const MENU_WIDTH = 400;

/** Shared between the menu's buttons and its 3D sky: how much the Sun flares (hovering Home), and
 *  how much Neptune still has to turn after a language change (radians). */
export const menuSky = { heat: 0, flip: 0 };

/** Horizontal positions of the planets: moving out, then holding, so every label has room on the right. */
const XS = [156, 178, 194, 204, 206, 200, 192];

export function menuLayout(height: number): MenuLayout {
  // Short screens: everything a little smaller, the spacing follows.
  const k = Math.min(1, Math.max(0.74, height / 900));
  const sx = 88;
  const sy = 100 * k + 4;
  const sun: MenuNode = { body: 'sun', x: sx, y: sy, r: (navItems[0].size / 2) * k, orbit: 0 };
  const top = sy + 104 * k;
  const bottom = height - 196 * k;
  const step = (bottom - top) / (navItems.length - 2);
  const planets = navItems.slice(1).map((item, i): MenuNode => {
    const x = XS[i];
    const y = top + step * i;
    return { body: item.body, x, y, r: (item.size / 2) * k, orbit: Math.hypot(x - sx, y - sy) };
  });
  const place = (body: Body, size: number, x: number, y: number): MenuNode => ({ body, x, y, r: (size / 2) * k, orbit: Math.hypot(x - sx, y - sy) });
  return {
    width: MENU_WIDTH,
    height,
    sun,
    planets,
    language: place(outerBodies.language.body, outerBodies.language.size, 132, height - 104 * k),
    resume: place(outerBodies.resume.body, outerBodies.resume.size, 238, height - 78 * k),
  };
}

/* The phone's dock: the same little solar system laid out in a row along the bottom of the screen,
   the photo on the left. The canvas reaches a little above the bar, for the flames of the photo. */

export const DOCK_BAR = 68;
export const DOCK_RISE = 14;
/** The dock spans the screen less a margin each side, up to this width (tablets). */
export const DOCK_MAX = 520;

/** How far a body reaches sideways in the dock, in radii: the Moon, Jupiter's moons, Saturn's rings. */
const DOCK_REACH: Partial<Record<Body, number>> = { earth: 2.4, jupiter: 2.1, saturn: 2.1 };

export const dockReach = (node: MenuNode) => node.r * (DOCK_REACH[node.body] ?? 1);

export function dockLayout(width: number): SkyLayout {
  const k = Math.min(1.5, Math.max(0.85, width / 366));
  // A little above the middle of the bar: the section numbers go under the bodies.
  const y = DOCK_RISE + DOCK_BAR / 2 - 5;
  const sunR = 19 * Math.min(k, 1.2);
  const sun: MenuNode = { body: 'sun', x: 12 + sunR, y, r: sunR, orbit: 0 };
  const bodies = navItems.slice(1).map((item): MenuNode => ({ body: item.body, x: 0, y, r: (item.size / 2) * 0.48 * k, orbit: 0 }));
  const used = bodies.reduce((sum, n) => sum + 2 * dockReach(n), 0);
  // The room left is shared out evenly: between the bodies, and after the last one.
  const start = sun.x + sun.r;
  const gap = Math.max(4, (width - 10 - start - used) / bodies.length);
  let cursor = start;
  const planets = bodies.map((n) => {
    cursor += gap + dockReach(n);
    const x = cursor;
    cursor += dockReach(n);
    return { ...n, x, orbit: x - sun.x };
  });
  return { width, height: DOCK_RISE + DOCK_BAR, sun, planets };
}
