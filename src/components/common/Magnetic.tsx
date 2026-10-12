import { useEffect, useRef, type ReactNode } from 'react';
import { gsap, reducedMotion } from '@/lib/motion';

/**
 * A button that leans toward the cursor when it comes close, and springs back when it leaves.
 * Mouse only: on touch screens it is just the button.
 */
const Magnetic = ({ children, strength = 0.32, className }: { children: ReactNode; strength?: number; className?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion() || !window.matchMedia('(pointer: fine)').matches) return;
    const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.45)' });
    const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.45)' });
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const reach = Math.max(r.width, r.height) * 0.9;
      if (Math.abs(dx) < reach && Math.abs(dy) < reach) {
        x(dx * strength);
        y(dy * strength);
      } else {
        x(0);
        y(0);
      }
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      gsap.set(el, { x: 0, y: 0 });
    };
  }, [strength]);

  return (
    <span ref={ref} className={`inline-block will-change-transform ${className ?? ''}`}>
      {children}
    </span>
  );
};

export default Magnetic;
