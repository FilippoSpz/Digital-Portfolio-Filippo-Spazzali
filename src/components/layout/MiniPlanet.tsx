import type { CSSProperties } from 'react';
import type { Body } from '@/data/navigation';
import './menu.css';
import mercuryMap from '@/assets/space/mercury-512.webp';
import venusMap from '@/assets/space/venus-atmosphere-512.webp';
import earthMap from '@/assets/space/earth-day-1k.webp';
import marsMap from '@/assets/space/mars-512.webp';
import jupiterMap from '@/assets/space/jupiter-512.webp';
import saturnMap from '@/assets/space/saturn-512.webp';
import uranusMap from '@/assets/space/uranus-512.webp';
import neptuneMap from '@/assets/space/neptune-512.webp';
import sunMap from '@/assets/space/sun-512.webp';

/* A small planet without WebGL (phone menu, and the desktop menu when 3D is off): the real map
   sliding behind a round window, so it turns, with the night side shaded away from the light. */

const MAPS: Partial<Record<Body, string>> = {
  sun: sunMap,
  mercury: mercuryMap,
  venus: venusMap,
  earth: earthMap,
  mars: marsMap,
  jupiter: jupiterMap,
  saturn: saturnMap,
  uranus: uranusMap,
  neptune: neptuneMap,
};

interface MiniPlanetProps {
  body: Body;
  size: number;
  /** Seconds for a full turn. */
  period?: number;
}

const MiniPlanet = ({ body, size, period = 40 }: MiniPlanetProps) => {
  const map = MAPS[body];
  return (
    <span className="relative inline-block shrink-0" style={{ width: size, height: size }} aria-hidden="true">
      {body === 'saturn' && (
        <span
          className="absolute left-1/2 top-1/2 rounded-[50%] border-[2px] border-[#d9c49b]/70"
          style={{ width: size * 2, height: size * 0.62, transform: 'translate(-50%, -50%) rotate(-18deg)' }}
        />
      )}
      <span
        className="absolute inset-0 rounded-full overflow-hidden animate-planet-turn"
        style={{
          backgroundColor: body === 'pluto' ? '#b89c84' : '#222',
          backgroundImage: map ? `url(${map})` : undefined,
          backgroundSize: 'auto 100%',
          animationDuration: `${period}s`,
          ['--size' as string]: `${size}px`,
        } as CSSProperties}
      />
      {body !== 'sun' && (
        <span
          className="absolute inset-0 rounded-full"
          style={{ background: 'radial-gradient(circle at 32% 30%, transparent 38%, rgba(0,0,0,0.55) 64%, rgba(0,0,0,0.92) 86%)' }}
        />
      )}
    </span>
  );
};

export default MiniPlanet;
