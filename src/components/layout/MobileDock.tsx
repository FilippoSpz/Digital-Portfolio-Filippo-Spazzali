import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import type { NavItem, SectionId } from '@/data/navigation';
import { DOCK_BAR, DOCK_MAX, DOCK_RISE, dockLayout, dockReach, type MenuNode } from './menuLayout';
import MiniPlanet from './MiniPlanet';
import profilePhoto from '@/assets/images/profile-photo.jpeg';
import './menu.css';

const MenuSky = lazy(() => import('./MenuSky'));

/* The phone's menu: the little solar system of the desktop, in a row at the bottom of the screen,
   always at hand. The photo is the Sun, every planet a section; the satellite circles the one you
   are reading and flies along the row as you scroll, or in one sweep when you tap another. */

interface MobileDockProps {
  items: (NavItem & { label: string })[];
  activeIndex: number;
  onSelect: (id: SectionId) => void;
  use3D: boolean;
}

const MobileDock = ({ items, activeIndex, onSelect, use3D }: MobileDockProps) => {
  const ref = useRef<HTMLElement>(null);
  const [width, setWidth] = useState(() => Math.min(window.innerWidth - 24, DOCK_MAX));
  // Measured, not worked out from the window: a scrollbar (desktop browsers, narrowed) takes room too.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setWidth(Math.round(el.clientWidth)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const layout = useMemo(() => dockLayout(width), [width]);
  const { sun, planets } = layout;
  const nodes = [sun, ...planets];

  // Every body owns the strip up to half-way to its neighbours: easy to hit, even the small ones.
  const footprint = (n: MenuNode) => (n.body === 'sun' ? n.r : dockReach(n));
  const edges = nodes.map((n, i) => (i === 0 ? 0 : (nodes[i - 1].x + footprint(nodes[i - 1]) + n.x - footprint(n)) / 2));
  edges.push(width);

  return (
    <nav
      ref={ref}
      className="fixed left-3 right-3 mx-auto z-[100] lg:hidden"
      style={{ bottom: 'calc(10px + env(safe-area-inset-bottom))', height: DOCK_RISE + DOCK_BAR, maxWidth: DOCK_MAX }}
    >
      <div
        className="absolute inset-x-0 bottom-0 rounded-2xl bg-black overflow-hidden"
        style={{ height: DOCK_BAR, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)' }}
      >
        {/* The orbits round the photo, seen as arcs across the bar; the one you are in takes its planet's colour */}
        <svg className="absolute inset-0 pointer-events-none" width={width} height={DOCK_BAR} aria-hidden="true">
          {planets.map((p, i) => {
            const isActive = activeIndex === i + 1;
            return (
              <circle
                key={p.body}
                cx={sun.x}
                cy={sun.y - DOCK_RISE}
                r={p.orbit}
                fill="none"
                stroke={isActive ? items[i + 1].color : 'rgba(255,255,255,0.1)'}
                strokeOpacity={isActive ? 0.75 : 1}
                strokeWidth={isActive ? 1.4 : 1}
                style={{ transition: 'stroke 0.6s, stroke-opacity 0.6s' }}
              />
            );
          })}
        </svg>

        {/* Under every body its section number, in the planet's colour for the one you are in */}
        {nodes.map((n, i) => (
          <span
            key={n.body}
            className="absolute bottom-1.5 -translate-x-1/2 text-[9px] leading-none font-mono font-bold tabular-nums pointer-events-none"
            style={{ left: n.x, color: activeIndex === i ? items[i].color : 'rgba(255,255,255,0.55)', transition: 'color 0.6s' }}
            aria-hidden="true"
          >
            {String(i + 1).padStart(2, '0')}
          </span>
        ))}

        {nodes.map((n, i) => (
          <button
            key={n.body}
            type="button"
            onClick={() => onSelect(items[i].id)}
            aria-label={items[i].label}
            aria-current={activeIndex === i ? 'true' : undefined}
            className="absolute inset-y-0 transition-colors active:bg-white/[0.06]"
            style={{ left: edges[i], width: edges[i + 1] - edges[i] }}
          />
        ))}
      </div>

      {use3D ? (
        <Suspense fallback={null}>
          <MenuSky layout={layout} dock />
        </Suspense>
      ) : (
        planets.map((p) => (
          <span key={p.body} className="absolute pointer-events-none" style={{ left: p.x - p.r, top: p.y - p.r }}>
            <MiniPlanet body={p.body} size={p.r * 2} />
          </span>
        ))
      )}

      {/* The Sun: the photo, ringed in orange, flames rising from its rim (drawn by MenuSky) */}
      <span
        className="menu-sun absolute block rounded-full overflow-hidden pointer-events-none"
        style={{ left: sun.x - sun.r, top: sun.y - sun.r, width: sun.r * 2, height: sun.r * 2 }}
        aria-hidden="true"
      >
        <img src={profilePhoto} alt="" className="w-full h-full object-cover" />
      </span>
    </nav>
  );
};

export default MobileDock;
