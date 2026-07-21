import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

/** Lightweight 2D canvas starfield used when WebGL / motion is unavailable. */
const StarfieldFallback = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const stars: Star[] = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.8 + 0.3,
      opacity: Math.random() * 0.7 + 0.3,
      twinkleSpeed: Math.random() * 1.5 + 0.5,
      twinkleOffset: Math.random() * Math.PI * 2,
    }));

    let raf = 0;
    let time = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        const twinkle = prefersReduced ? 1 : Math.sin(time * s.twinkleSpeed + s.twinkleOffset) * 0.4 + 0.6;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232, 236, 255, ${s.opacity * twinkle})`;
        ctx.fill();
      });
    };

    const loop = () => {
      time += 0.016;
      draw();
      raf = requestAnimationFrame(loop);
    };

    if (prefersReduced) draw();
    else raf = requestAnimationFrame(loop);

    const onResize = () => {
      resize();
      stars.forEach((s) => {
        s.x = Math.random() * canvas.width;
        s.y = Math.random() * canvas.height;
      });
      if (prefersReduced) draw();
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" aria-hidden="true" />;
};

export default StarfieldFallback;
