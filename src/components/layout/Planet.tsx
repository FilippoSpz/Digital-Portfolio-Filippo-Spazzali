import { useEffect, useId, useState, type ReactNode } from 'react';

/** Solar-system bodies modelled by the constellation nav. */
export type PlanetVariant = 'earth' | 'mars' | 'jupiter' | 'saturn' | 'neptune' | 'uranus';

/** Disables the surface rotation for users who ask for less motion. */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

interface RingSpec {
  /** Tilt of the ring plane, in degrees. */
  tilt: number;
  /** Ring geometry + stroke(s), drawn centred on (50,50). */
  shape: (id: string) => ReactNode;
  /** Gradient stops along the ring (lit centre, faded tips). */
  grad: (id: string) => ReactNode;
}

interface PlanetSpec {
  /** Seconds for one full surface rotation. */
  spin: number;
  /** Atmospheric limb-glow colour. */
  atmo: string;
  /** Variant-specific gradient defs. */
  defs: (id: string) => ReactNode;
  /** Static body fill (colour / cloud bands / polar caps). */
  base: (id: string) => ReactNode;
  /** One periodic surface tile (features live in x ∈ [14,86] so the wrap seam stays hidden). */
  surface: (id: string) => ReactNode;
  ring?: RingSpec;
}

/* ------------------------------------------------------------------ */
/*  Per-planet recipes                                                 */
/* ------------------------------------------------------------------ */

const SPECS: Record<PlanetVariant, PlanetSpec> = {
  /* 🌍 Earth — blue oceans, green land, drifting clouds, ice caps. */
  earth: {
    spin: 26,
    atmo: '#5ab8ff',
    defs: (id) => (
      <radialGradient id={`ocean-${id}`} cx="0.35" cy="0.3" r="0.9">
        <stop offset="0%" stopColor="#8fd0ff" />
        <stop offset="48%" stopColor="#2b7fe6" />
        <stop offset="100%" stopColor="#0a2c72" />
      </radialGradient>
    ),
    base: (id) => (
      <>
        <circle cx="50" cy="50" r="40" fill={`url(#ocean-${id})`} />
        <ellipse cx="50" cy="14" rx="15" ry="6" fill="#eaf4ff" opacity="0.75" />
        <ellipse cx="50" cy="86" rx="13" ry="5" fill="#eaf4ff" opacity="0.7" />
      </>
    ),
    surface: () => (
      <>
        <g fill="#3f9350">
          <path d="M22 40q8-8 18-4q10 4 8 14q-2 10-14 8q-14-2-12-18z" />
          <path d="M60 30q10-2 12 8q2 10-8 12q-12 2-12-10q0-8 8-10z" />
          <path d="M44 60q11-4 17 6q4 10-8 14q-14 4-16-8q-2-8 7-12z" />
        </g>
        <g fill="#2f6f3c" opacity="0.55">
          <path d="M28 44q6-4 12 0q4 5-2 9q-8 4-11-3q-1-4 1-6z" />
          <path d="M62 36q6 0 6 6q0 6-8 6q-6 0-4-8z" />
        </g>
        <g fill="#ffffff" opacity="0.3">
          <ellipse cx="34" cy="30" rx="10" ry="3.6" />
          <ellipse cx="66" cy="54" rx="12" ry="4" />
          <ellipse cx="40" cy="72" rx="9" ry="3.2" />
        </g>
      </>
    ),
  },

  /* ♃ Jupiter — banded gas giant with the Great Red Spot. */
  jupiter: {
    spin: 15,
    atmo: '#e0a15a',
    defs: (id) => (
      <linearGradient id={`jbands-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#cda069" />
        <stop offset="12%" stopColor="#e6d3a4" />
        <stop offset="22%" stopColor="#c1894f" />
        <stop offset="33%" stopColor="#e4c58f" />
        <stop offset="45%" stopColor="#b0703a" />
        <stop offset="54%" stopColor="#ddb072" />
        <stop offset="65%" stopColor="#9c5f34" />
        <stop offset="76%" stopColor="#e0bd86" />
        <stop offset="87%" stopColor="#bd8850" />
        <stop offset="100%" stopColor="#a5683a" />
      </linearGradient>
    ),
    base: (id) => <rect x="0" y="0" width="100" height="100" fill={`url(#jbands-${id})`} />,
    surface: () => (
      <>
        <g transform="rotate(-8 60 60)">
          <ellipse cx="60" cy="60" rx="11" ry="6.4" fill="#b23a12" />
          <ellipse cx="60" cy="60" rx="6.6" ry="3.4" fill="#d9663a" />
        </g>
        <ellipse cx="36" cy="40" rx="8" ry="2.6" fill="#f0dcae" opacity="0.5" />
        <ellipse cx="46" cy="74" rx="9" ry="2.6" fill="#8a5227" opacity="0.5" />
      </>
    ),
  },

  /* ♄ Saturn — pale golden bands + the iconic ring with a Cassini gap. */
  saturn: {
    spin: 19,
    atmo: '#e8cf90',
    defs: (id) => (
      <linearGradient id={`sbands-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#d8c48a" />
        <stop offset="20%" stopColor="#ece0b4" />
        <stop offset="40%" stopColor="#d0b877" />
        <stop offset="60%" stopColor="#e6d59c" />
        <stop offset="80%" stopColor="#c9ac6c" />
        <stop offset="100%" stopColor="#dcc88c" />
      </linearGradient>
    ),
    base: (id) => <rect x="0" y="0" width="100" height="100" fill={`url(#sbands-${id})`} />,
    surface: () => (
      <ellipse cx="44" cy="42" rx="9" ry="2.2" fill="#f3e7bd" opacity="0.45" />
    ),
    ring: {
      tilt: -18,
      grad: (id) => (
        <linearGradient id={`ring-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#efdcac" stopOpacity="0.15" />
          <stop offset="22%" stopColor="#efdcac" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#fff4d4" stopOpacity="1" />
          <stop offset="78%" stopColor="#efdcac" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#efdcac" stopOpacity="0.15" />
        </linearGradient>
      ),
      shape: (id) => (
        <>
          <ellipse cx="50" cy="50" rx="57" ry="15" fill="none" stroke={`url(#ring-${id})`} strokeWidth="4" />
          <ellipse cx="50" cy="50" rx="47" ry="12.2" fill="none" stroke={`url(#ring-${id})`} strokeWidth="2.4" opacity="0.85" />
        </>
      ),
    },
  },

  /* ♂ Mars — rusty desert, dark maria, craters, a polar cap. */
  mars: {
    spin: 30,
    atmo: '#e0693f',
    defs: (id) => (
      <radialGradient id={`rust-${id}`} cx="0.35" cy="0.3" r="0.9">
        <stop offset="0%" stopColor="#e79063" />
        <stop offset="48%" stopColor="#c25a34" />
        <stop offset="100%" stopColor="#5e2415" />
      </radialGradient>
    ),
    base: (id) => (
      <>
        <circle cx="50" cy="50" r="40" fill={`url(#rust-${id})`} />
        <ellipse cx="50" cy="14" rx="11" ry="4.4" fill="#f2e9e0" opacity="0.82" />
        <ellipse cx="50" cy="87" rx="7" ry="3" fill="#f2e9e0" opacity="0.6" />
      </>
    ),
    surface: () => (
      <>
        <g fill="#8f3d22" opacity="0.55">
          <path d="M26 44q10-6 18 2q6 8-4 14q-14 6-18-6q-2-6 4-10z" />
          <path d="M58 34q8 0 8 8q0 8-10 8q-8 0-8-8q0-8 10-8z" />
          <ellipse cx="66" cy="62" rx="9" ry="6" />
        </g>
        <g fill="#b5522f" stroke="#7a2f18" strokeWidth="0.6">
          <circle cx="40" cy="64" r="3" />
          <circle cx="70" cy="46" r="2.4" />
          <circle cx="52" cy="52" r="1.8" />
        </g>
      </>
    ),
  },

  /* ♆ Neptune — deep blue with the Great Dark Spot and cloud streaks. */
  neptune: {
    spin: 17,
    atmo: '#5c86f2',
    defs: (id) => (
      <radialGradient id={`nep-${id}`} cx="0.35" cy="0.3" r="0.9">
        <stop offset="0%" stopColor="#6c9bff" />
        <stop offset="48%" stopColor="#2b52d0" />
        <stop offset="100%" stopColor="#10205e" />
      </radialGradient>
    ),
    base: (id) => <circle cx="50" cy="50" r="40" fill={`url(#nep-${id})`} />,
    surface: () => (
      <>
        <ellipse cx="58" cy="58" rx="8" ry="5" fill="#0f1a54" opacity="0.7" transform="rotate(-6 58 58)" />
        <g fill="#eaf1ff" opacity="0.5">
          <ellipse cx="40" cy="40" rx="8" ry="1.8" />
          <ellipse cx="62" cy="44" rx="6" ry="1.5" />
          <ellipse cx="44" cy="70" rx="7" ry="1.7" />
        </g>
      </>
    ),
  },

  /* ⛢ Uranus — smooth pale cyan with a thin, near-vertical ring. */
  uranus: {
    spin: 34,
    atmo: '#5fd6d8',
    defs: (id) => (
      <radialGradient id={`ura-${id}`} cx="0.36" cy="0.3" r="0.9">
        <stop offset="0%" stopColor="#c4f2f0" />
        <stop offset="50%" stopColor="#63cfce" />
        <stop offset="100%" stopColor="#1f6f7c" />
      </radialGradient>
    ),
    base: (id) => <circle cx="50" cy="50" r="40" fill={`url(#ura-${id})`} />,
    surface: () => (
      <g fill="#ffffff" opacity="0.12">
        <ellipse cx="50" cy="42" rx="30" ry="3" />
        <ellipse cx="50" cy="58" rx="28" ry="2.4" />
      </g>
    ),
    ring: {
      tilt: -74,
      grad: (id) => (
        <linearGradient id={`ring-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#cdf6f4" stopOpacity="0.1" />
          <stop offset="30%" stopColor="#cdf6f4" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#eafffe" stopOpacity="1" />
          <stop offset="70%" stopColor="#cdf6f4" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#cdf6f4" stopOpacity="0.1" />
        </linearGradient>
      ),
      shape: (id) => (
        <ellipse cx="50" cy="50" rx="53" ry="9" fill="none" stroke={`url(#ring-${id})`} strokeWidth="2" />
      ),
    },
  },
};

interface PlanetProps {
  variant: PlanetVariant;
  /** Diameter in px. */
  size: number;
  /** Accent colour (drives the atmosphere + active halo). */
  color: string;
  active?: boolean;
}

/**
 * A pseudo-3D solar-system planet: a lit sphere with a variant-specific,
 * slowly-rotating surface, spherical shading, atmospheric limb glow and an
 * optional tilted ring — all pure SVG so it stays crisp at any size.
 */
const Planet = ({ variant, size, color, active = false }: PlanetProps) => {
  const uid = useId().replace(/:/g, '');
  const reduced = usePrefersReducedMotion();
  const spec = SPECS[variant];
  const ring = spec.ring;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Atmosphere glow */}
      <div
        className="absolute rounded-full pointer-events-none transition-all duration-300"
        style={{
          inset: active ? '-44%' : '-30%',
          background: `radial-gradient(circle, ${color}66 0%, ${color}22 45%, transparent 70%)`,
        }}
      />

      {/* Active halo pulse */}
      {active && (
        <span
          className="absolute inset-[-12%] rounded-full pointer-events-none animate-halo"
          style={{ border: `2px solid ${color}`, boxShadow: `0 0 16px ${color}` }}
        />
      )}

      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="absolute inset-0 overflow-visible"
        style={{ filter: `drop-shadow(0 0 ${active ? 12 : 7}px ${color}${active ? 'aa' : '77'})` }}
        aria-hidden="true"
      >
        <defs>
          {spec.defs(uid)}
          {ring?.grad(uid)}

          {/* Spherical volume: highlight top-left, shadow bottom-right. */}
          <radialGradient id={`vol-${uid}`} cx="0.5" cy="0.5" r="0.62" fx="0.32" fy="0.28">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="36%" stopColor="#ffffff" stopOpacity="0.02" />
            <stop offset="62%" stopColor="#000000" stopOpacity="0" />
            <stop offset="82%" stopColor="#000000" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.62" />
          </radialGradient>

          {/* Coloured atmospheric limb. */}
          <radialGradient id={`atmo-${uid}`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="74%" stopColor={spec.atmo} stopOpacity="0" />
            <stop offset="93%" stopColor={spec.atmo} stopOpacity="0.55" />
            <stop offset="100%" stopColor={spec.atmo} stopOpacity="0" />
          </radialGradient>

          {/* Specular hotspot. */}
          <radialGradient id={`spec-${uid}`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          <clipPath id={`clip-${uid}`}>
            <circle cx="50" cy="50" r="40" />
          </clipPath>
          {/* Front half of the ring (near side), drawn over the sphere. */}
          <clipPath id={`ringFront-${uid}`} clipPathUnits="userSpaceOnUse">
            <rect x="-40" y="50" width="180" height="140" />
          </clipPath>
        </defs>

        {/* Ring — far side, behind the sphere. */}
        {ring && (
          <g transform={`rotate(${ring.tilt} 50 50)`} opacity="0.9">
            {ring.shape(uid)}
          </g>
        )}

        {/* Planet body. */}
        <g clipPath={`url(#clip-${uid})`}>
          {spec.base(uid)}

          {/* Rotating surface: two identical tiles scrolled seamlessly. */}
          <g>
            <g>{spec.surface(uid)}</g>
            <g transform="translate(100 0)">{spec.surface(uid)}</g>
            {!reduced && (
              <animateTransform
                attributeName="transform"
                type="translate"
                from="0 0"
                to="-100 0"
                dur={`${spec.spin}s`}
                repeatCount="indefinite"
              />
            )}
          </g>

          <circle cx="50" cy="50" r="40" fill={`url(#vol-${uid})`} />
          <circle cx="50" cy="50" r="40" fill={`url(#atmo-${uid})`} style={{ mixBlendMode: 'screen' }} />
          <ellipse cx="36" cy="32" rx="9" ry="7" fill={`url(#spec-${uid})`} />
        </g>

        {/* Ring — near side, in front of the sphere. */}
        {ring && (
          <g clipPath={`url(#ringFront-${uid})`}>
            <g transform={`rotate(${ring.tilt} 50 50)`}>{ring.shape(uid)}</g>
          </g>
        )}
      </svg>
    </div>
  );
};

export default Planet;
