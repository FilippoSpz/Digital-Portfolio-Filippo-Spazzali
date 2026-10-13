import { lazy, Suspense, useEffect, useState } from 'react';
import StarfieldFallback from './StarfieldFallback';

const SpaceScene = lazy(() => import('./SpaceScene'));

interface CosmicBackgroundProps {
  /** Not needed any more (the sky is the same black everywhere); kept so callers stay valid. */
  activeSection?: string;
}

const supportsWebGL = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!window.WebGLRenderingContext && !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    return false;
  }
};

const CosmicBackground = (_props: CosmicBackgroundProps) => {
  const [use3D, setUse3D] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setUse3D(!reduced && supportsWebGL());
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      {/* Black sky: the only light comes from the stars, the Sun and the planets. */}
      <div className="absolute inset-0 bg-black" />

      {/* Stars / 3D scene */}
      {use3D ? (
        <Suspense fallback={<StarfieldFallback />}>
          <SpaceScene />
        </Suspense>
      ) : (
        <StarfieldFallback />
      )}

      {/* A light veil keeps the text legible over the planets. */}
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
};

export default CosmicBackground;
