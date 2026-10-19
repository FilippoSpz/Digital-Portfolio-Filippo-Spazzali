import { useEffect, useState } from 'react';
import { boot } from '@/lib/diag';
import { lowPower, reducedMotion, supportsWebGL } from '@/lib/motion';
import { MAP_COUNT } from './mapQueue';

const ms = (v: number) => (Number.isNaN(v) ? '…' : `${Math.round(v)} ms`);

/** The `?diag` panel: what the 3D found on this device and how its start went, refreshed twice a second. */
const DiagPanel = ({ use3D }: { use3D: boolean }) => {
  const [, setTick] = useState(0);
  const [fps, setFps] = useState(0);
  const [env] = useState(() => ({ reduced: reducedMotion(), webgl: supportsWebGL(), light: lowPower() }));

  useEffect(() => {
    let frames = 0;
    let raf = 0;
    const count = () => {
      frames++;
      raf = requestAnimationFrame(count);
    };
    raf = requestAnimationFrame(count);
    const timer = window.setInterval(() => {
      setFps(frames * 2);
      frames = 0;
      setTick((t) => t + 1);
    }, 500);
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(timer);
    };
  }, []);

  const why = env.reduced ? 'no: "riduci movimento" è attivo sul dispositivo' : env.webgl ? 'no' : 'no: WebGL non disponibile';
  const rows: [string, string][] = [
    ['3D attivo', use3D ? 'sì' : why],
    ['Fase', boot.phase],
    [
      'Shader compilati in',
      boot.capped
        ? `oltre 1,5 s (${Number.isNaN(boot.compileEnd) ? 'non ancora finiti' : `finiti in ${ms(boot.compileEnd - boot.compileStart)}`})`
        : ms(boot.compileEnd - boot.compileStart),
    ],
    ['Scena pronta a', ms(boot.ready)],
    ['Mappe sulla scheda', `${boot.maps} di ${MAP_COUNT}`],
    ['Scheda grafica', `${boot.gpu || '…'}${boot.webgl2 ? ' (WebGL 2)' : ''}`],
    ['Contesto perso', `${boot.lost} volte`],
    ['Fotogrammi al secondo', String(fps)],
    ['Schermo', `${window.innerWidth}×${window.innerHeight} a ${window.devicePixelRatio}x, versione leggera: ${env.light ? 'sì' : 'no'}`],
    ['Browser', navigator.userAgent],
  ];

  return (
    // Low on the screen, above the phone's dock: the Sun stays in sight at the top.
    <div className="fixed z-[300] left-2 right-2 bottom-[calc(7.5rem+env(safe-area-inset-bottom))] lg:left-auto lg:right-4 lg:bottom-4 lg:w-[26rem] pointer-events-none rounded-lg bg-black/90 border border-white/25 p-3 font-mono text-[11px] leading-snug text-white">
      <p className="font-bold mb-1.5">Diagnosi 3D</p>
      {rows.map(([k, v]) => (
        <p key={k} className="break-words">
          <span className="text-white/55">{k}: </span>
          {v}
        </p>
      ))}
      {boot.errors.map((e, i) => (
        <p key={i} className="mt-1 break-words">
          <span className="text-white/55">Errore: </span>
          {e}
        </p>
      ))}
    </div>
  );
};

export default DiagPanel;
