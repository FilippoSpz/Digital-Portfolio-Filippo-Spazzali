import { useEffect, useRef, useMemo } from "react";

interface CosmicBackgroundProps {
  activeSection: string;
}

const CosmicBackground = ({ activeSection }: CosmicBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentColorRef = useRef({ h: 231, s: 15, l: 18 });
  const targetColorRef = useRef({ h: 231, s: 15, l: 18 });

  // Section-specific background colors (HSL values)
  const sectionColors = useMemo(() => ({
    home: { h: 231, s: 15, l: 18 },      // Deep space purple-black
    about: { h: 245, s: 20, l: 16 },     // Deeper purple
    skills: { h: 200, s: 25, l: 14 },    // Deep ocean blue
    certifications: { h: 280, s: 20, l: 15 }, // Royal purple
    portfolio: { h: 320, s: 18, l: 14 }, // Deep magenta
    contact: { h: 260, s: 22, l: 16 },   // Violet space
  }), []);

  // Update target color when section changes
  useEffect(() => {
    const color = sectionColors[activeSection as keyof typeof sectionColors] || sectionColors.home;
    targetColorRef.current = color;
  }, [activeSection, sectionColors]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();

    interface Star {
      x: number;
      y: number;
      size: number;
      opacity: number;
      twinkleSpeed: number;
      twinkleOffset: number;
      color: string;
    }

    interface Nebula {
      x: number;
      y: number;
      radius: number;
      color: string;
      opacity: number;
      drift: number;
    }

    const stars: Star[] = [];
    const nebulae: Nebula[] = [];

    // Star colors with variety
    const starColors = [
      "248, 248, 242", // White
      "189, 147, 249", // Purple
      "139, 233, 253", // Cyan
      "255, 121, 198", // Pink
    ];

    // Create stars
    for (let i = 0; i < 250; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2.5 + 0.3,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
        color: starColors[Math.floor(Math.random() * starColors.length)],
      });
    }

    // Nebula colors
    const nebulaColors = [
      { r: 189, g: 147, b: 249 }, // Primary purple
      { r: 255, g: 121, b: 198 }, // Accent pink
      { r: 139, g: 233, b: 253 }, // Secondary cyan
      { r: 80, g: 250, b: 123 },  // Green
    ];

    for (let i = 0; i < 6; i++) {
      const color = nebulaColors[Math.floor(Math.random() * nebulaColors.length)];
      nebulae.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 350 + 150,
        color: `${color.r}, ${color.g}, ${color.b}`,
        opacity: Math.random() * 0.04 + 0.015,
        drift: (Math.random() - 0.5) * 0.08,
      });
    }

    let animationFrame: number;
    let time = 0;

    // Smooth color interpolation
    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const animate = () => {
      time += 0.016;

      // Smoothly transition background color
      const lerpFactor = 0.02; // Slow, smooth transition
      currentColorRef.current.h = lerp(currentColorRef.current.h, targetColorRef.current.h, lerpFactor);
      currentColorRef.current.s = lerp(currentColorRef.current.s, targetColorRef.current.s, lerpFactor);
      currentColorRef.current.l = lerp(currentColorRef.current.l, targetColorRef.current.l, lerpFactor);

      const bgColor = `hsl(${currentColorRef.current.h}, ${currentColorRef.current.s}%, ${currentColorRef.current.l}%)`;
      
      // Clear with current background color
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw nebulae with dynamic opacity based on section
      nebulae.forEach((nebula) => {
        const gradient = ctx.createRadialGradient(
          nebula.x,
          nebula.y,
          0,
          nebula.x,
          nebula.y,
          nebula.radius
        );
        
        const dynamicOpacity = nebula.opacity * (1 + Math.sin(time * 0.5) * 0.3);
        gradient.addColorStop(0, `rgba(${nebula.color}, ${dynamicOpacity})`);
        gradient.addColorStop(0.5, `rgba(${nebula.color}, ${dynamicOpacity * 0.5})`);
        gradient.addColorStop(1, "transparent");
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(nebula.x, nebula.y, nebula.radius, 0, Math.PI * 2);
        ctx.fill();

        // Drift nebulae
        nebula.x += nebula.drift;
        nebula.y += nebula.drift * 0.3;

        // Wrap around
        if (nebula.x > canvas.width + nebula.radius) nebula.x = -nebula.radius;
        if (nebula.x < -nebula.radius) nebula.x = canvas.width + nebula.radius;
        if (nebula.y > canvas.height + nebula.radius) nebula.y = -nebula.radius;
        if (nebula.y < -nebula.radius) nebula.y = canvas.height + nebula.radius;
      });

      // Draw stars with twinkling
      stars.forEach((star) => {
        const twinkle = Math.sin(time * star.twinkleSpeed * 100 + star.twinkleOffset) * 0.4 + 0.6;
        const finalOpacity = star.opacity * twinkle;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${star.color}, ${finalOpacity})`;
        ctx.fill();

        // Glow for brighter stars
        if (star.size > 1.8) {
          const glow = ctx.createRadialGradient(
            star.x,
            star.y,
            0,
            star.x,
            star.y,
            star.size * 5
          );
          glow.addColorStop(0, `rgba(${star.color}, ${finalOpacity * 0.4})`);
          glow.addColorStop(1, "transparent");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

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

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
};

export default CosmicBackground;
