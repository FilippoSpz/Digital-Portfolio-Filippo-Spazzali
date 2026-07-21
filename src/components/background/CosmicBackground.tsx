import { lazy, Suspense, useEffect, useState } from 'react';
import StarfieldFallback from './StarfieldFallback';

const SpaceScene = lazy(() => import('./SpaceScene'));

interface CosmicBackgroundProps {
  activeSection: string;
}

// Subtle ambient tint per section (radial glow behind everything).
const sectionTint: Record<string, string> = {
  home: '246 100% 71%',
  about: '209 100% 65%',
  skills: '160 84% 55%',
  certifications: '38 96% 60%',
  portfolio: '326 90% 68%',
  projects: '0 84% 66%',
  contact: '190 90% 60%',
};

const supportsWebGL = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!window.WebGLRenderingContext && !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    return false;
  }
};

const CosmicBackground = ({ activeSection }: CosmicBackgroundProps) => {
  const [use3D, setUse3D] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setUse3D(!reduced && supportsWebGL());
  }, []);

  const tint = sectionTint[activeSection] ?? sectionTint.home;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      {/* Deep-space base */}
      <div className="absolute inset-0 bg-background" />

      {/* Ambient section-tinted glow */}
      <div
        className="absolute inset-0 transition-[background] duration-1000 ease-out"
        style={{
          background: `radial-gradient(1100px 800px at 78% 18%, hsl(${tint} / 0.16), transparent 60%),
                       radial-gradient(900px 700px at 10% 90%, hsl(${tint} / 0.10), transparent 55%)`,
        }}
      />

      {/* Stars / 3D scene */}
      {use3D ? (
        <Suspense fallback={<StarfieldFallback />}>
          <SpaceScene />
        </Suspense>
      ) : (
        <StarfieldFallback />
      )}

      {/* Vignette for depth + text legibility */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(120% 120% at 50% 40%, transparent 55%, hsl(228 42% 4% / 0.85) 100%)' }}
      />
    </div>
  );
};

export default CosmicBackground;
