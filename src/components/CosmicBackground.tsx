import { useEffect, useRef } from "react";

const CosmicBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();

    // Stars
    interface Star {
      x: number;
      y: number;
      size: number;
      opacity: number;
      twinkleSpeed: number;
      twinkleOffset: number;
    }

    // Nebula particles
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

    // Create stars
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }

    // Create nebula clouds
    const nebulaColors = [
      "hsl(265, 89%, 78%)", // primary purple
      "hsl(326, 100%, 74%)", // accent pink
      "hsl(191, 97%, 77%)", // secondary cyan
    ];

    for (let i = 0; i < 5; i++) {
      nebulae.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 300 + 150,
        color: nebulaColors[Math.floor(Math.random() * nebulaColors.length)],
        opacity: Math.random() * 0.05 + 0.02,
        drift: (Math.random() - 0.5) * 0.1,
      });
    }

    let animationFrame: number;
    let time = 0;

    const animate = () => {
      time += 0.016;
      ctx.fillStyle = "hsl(231, 15%, 18%)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw nebulae
      nebulae.forEach((nebula) => {
        const gradient = ctx.createRadialGradient(
          nebula.x,
          nebula.y,
          0,
          nebula.x,
          nebula.y,
          nebula.radius
        );
        gradient.addColorStop(0, nebula.color.replace(")", `, ${nebula.opacity})`).replace("hsl", "hsla"));
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(nebula.x, nebula.y, nebula.radius, 0, Math.PI * 2);
        ctx.fill();

        // Slowly drift nebulae
        nebula.x += nebula.drift;
        nebula.y += nebula.drift * 0.5;

        // Wrap around
        if (nebula.x > canvas.width + nebula.radius) nebula.x = -nebula.radius;
        if (nebula.x < -nebula.radius) nebula.x = canvas.width + nebula.radius;
        if (nebula.y > canvas.height + nebula.radius) nebula.y = -nebula.radius;
        if (nebula.y < -nebula.radius) nebula.y = canvas.height + nebula.radius;
      });

      // Draw stars with twinkling
      stars.forEach((star) => {
        const twinkle = Math.sin(time * star.twinkleSpeed * 100 + star.twinkleOffset) * 0.3 + 0.7;
        const finalOpacity = star.opacity * twinkle;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(248, 248, 242, ${finalOpacity})`;
        ctx.fill();

        // Add glow to brighter stars
        if (star.size > 1.5) {
          const glow = ctx.createRadialGradient(
            star.x,
            star.y,
            0,
            star.x,
            star.y,
            star.size * 4
          );
          glow.addColorStop(0, `rgba(189, 147, 249, ${finalOpacity * 0.3})`);
          glow.addColorStop(1, "transparent");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      setCanvasSize();
      // Redistribute stars on resize
      stars.forEach((star) => {
        star.x = Math.random() * canvas.width;
        star.y = Math.random() * canvas.height;
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
      style={{ background: "hsl(231, 15%, 18%)" }}
    />
  );
};

export default CosmicBackground;
