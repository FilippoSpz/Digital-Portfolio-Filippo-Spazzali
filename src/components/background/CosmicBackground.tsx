import { useEffect, useMemo, useRef } from 'react';

interface CosmicBackgroundProps {
  activeSection: string;
}

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

interface Nebula {
  x: number;
  y: number;
  radius: number;
  color: string;
  opacity: number;
  drift: number;
}

const STAR_COUNT = 140;
const NEBULA_COUNT = 5;

const nebulaColors = [
  { r: 189, g: 147, b: 249 },
  { r: 139, g: 233, b: 253 },
  { r: 80, g: 250, b: 123 },
  { r: 255, g: 184, b: 108 },
  { r: 255, g: 121, b: 198 },
  { r: 241, g: 250, b: 140 },
];

const CosmicBackground = ({ activeSection }: CosmicBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentColorRef = useRef({ h: 265, s: 5, l: 3 });
  const targetColorRef = useRef({ h: 265, s: 5, l: 3 });

  const sectionColors = useMemo(
    () => ({
      home: { h: 265, s: 5, l: 3 },
      about: { h: 187, s: 5, l: 3 },
      skills: { h: 135, s: 5, l: 3 },
      certifications: { h: 30, s: 5, l: 3 },
      portfolio: { h: 326, s: 5, l: 3 },
      projects: { h: 0, s: 5, l: 3 },
      contact: { h: 65, s: 5, l: 3 },
    }),
    [],
  );

  useEffect(() => {
    targetColorRef.current = sectionColors[activeSection as keyof typeof sectionColors] ?? sectionColors.home;
  }, [activeSection, sectionColors]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();

    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2.5 + 0.3,
      opacity: Math.random() * 0.8 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinkleOffset: Math.random() * Math.PI * 2,
    }));

    const nebulae: Nebula[] = Array.from({ length: NEBULA_COUNT }, () => {
      const color = nebulaColors[Math.floor(Math.random() * nebulaColors.length)];
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 300 + 150,
        color: `${color.r}, ${color.g}, ${color.b}`,
        opacity: Math.random() * 0.02 + 0.005,
        drift: (Math.random() - 0.5) * 0.06,
      };
    });

    let animationFrame = 0;
    let time = 0;

    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

    const draw = () => {
      time += 0.016;

      const current = currentColorRef.current;
      const target = targetColorRef.current;
      current.h = lerp(current.h, target.h, 0.02);
      current.s = lerp(current.s, target.s, 0.02);
      current.l = lerp(current.l, target.l, 0.02);

      ctx.fillStyle = `hsl(${current.h}, ${current.s}%, ${current.l}%)`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      nebulae.forEach((nebula) => {
        const gradient = ctx.createRadialGradient(nebula.x, nebula.y, 0, nebula.x, nebula.y, nebula.radius);
        const dynamicOpacity = nebula.opacity * (1 + Math.sin(time * 0.5) * 0.2);
        gradient.addColorStop(0, `rgba(${nebula.color}, ${dynamicOpacity})`);
        gradient.addColorStop(0.5, `rgba(${nebula.color}, ${dynamicOpacity * 0.4})`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(nebula.x, nebula.y, nebula.radius, 0, Math.PI * 2);
        ctx.fill();

        nebula.x += nebula.drift;
        nebula.y += nebula.drift * 0.3;
        if (nebula.x > canvas.width + nebula.radius) nebula.x = -nebula.radius;
        if (nebula.x < -nebula.radius) nebula.x = canvas.width + nebula.radius;
        if (nebula.y > canvas.height + nebula.radius) nebula.y = -nebula.radius;
        if (nebula.y < -nebula.radius) nebula.y = canvas.height + nebula.radius;
      });

      stars.forEach((star) => {
        const twinkle = Math.sin(time * star.twinkleSpeed * 100 + star.twinkleOffset) * 0.4 + 0.6;
        const finalOpacity = star.opacity * twinkle;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`;
        ctx.fill();

        if (star.size > 1.8) {
          const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 4);
          glow.addColorStop(0, `rgba(255, 255, 255, ${finalOpacity * 0.3})`);
          glow.addColorStop(1, 'transparent');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    };

    const renderStatic = () => {
      currentColorRef.current = { ...targetColorRef.current };
      draw();
    };

    const loop = () => {
      draw();
      animationFrame = requestAnimationFrame(loop);
    };

    const start = () => {
      cancelAnimationFrame(animationFrame);
      if (prefersReduced) {
        renderStatic();
      } else {
        animationFrame = requestAnimationFrame(loop);
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrame);
      } else {
        start();
      }
    };

    const handleResize = () => {
      setCanvasSize();
      stars.forEach((star) => {
        star.x = Math.random() * canvas.width;
        star.y = Math.random() * canvas.height;
      });
      nebulae.forEach((nebula) => {
        nebula.x = Math.random() * canvas.width;
        nebula.y = Math.random() * canvas.height;
      });
    };

    start();
    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" aria-hidden="true" />;
};

export default CosmicBackground;
