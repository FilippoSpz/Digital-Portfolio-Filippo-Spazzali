import { lazy, memo, Suspense, useCallback, useEffect, useState } from 'react';
import { rich3D } from '@/lib/motion';
import { diagnosing } from '@/lib/diag';
import { startMapQueue } from './mapQueue';
import StarfieldFallback from './StarfieldFallback';

const SpaceScene = lazy(() => import('./SpaceScene'));
const DiagPanel = lazy(() => import('./DiagPanel'));

interface CosmicBackgroundProps {
  /** Not needed any more (the sky is the same black everywhere); kept so callers stay valid. */
  activeSection?: string;
}

const CosmicBackground = (_props: CosmicBackgroundProps) => {
  // Decided at once, so the 3D code and the planets' maps start downloading with the page.
  const [use3D] = useState(rich3D);
  // The flat starfield stays until the 3D has drawn its first full picture, then fades away under it.
  const [ready, setReady] = useState(false);
  const [fallbackGone, setFallbackGone] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    if (use3D) startMapQueue();
  }, [use3D]);

  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => setFallbackGone(true), 800);
    return () => window.clearTimeout(t);
  }, [ready]);

  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        {/* Black sky: the only light comes from the stars, the Sun and the planets. */}
        <div className="absolute inset-0 bg-black" />

        {(!use3D || !fallbackGone) && <StarfieldFallback />}
        {use3D && (
          <div className="absolute inset-0 transition-opacity duration-700 ease-out" style={{ opacity: ready ? 1 : 0 }}>
            <Suspense fallback={null}>
              <SpaceScene onReady={onReady} />
            </Suspense>
          </div>
        )}

        {/* A light veil keeps the text legible over the planets. */}
        <div className="absolute inset-0 sky-veil" />
      </div>

      {diagnosing && (
        <Suspense fallback={null}>
          <DiagPanel use3D={use3D} />
        </Suspense>
      )}
    </>
  );
};

// Its prop is unused: the sky never redraws when the section changes.
export default memo(CosmicBackground);
