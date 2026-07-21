import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type RevealVariant = 'up' | 'down' | 'left' | 'right' | 'scale' | 'zoom' | 'fade' | 'blur';

const hiddenState: Record<RevealVariant, string> = {
  up: 'opacity-0 translate-y-16',
  down: 'opacity-0 -translate-y-16',
  left: 'opacity-0 translate-x-16',
  right: 'opacity-0 -translate-x-16',
  scale: 'opacity-0 scale-95',
  zoom: 'opacity-0 scale-[0.8]',
  fade: 'opacity-0',
  blur: 'opacity-0 blur-lg translate-y-10',
};

interface RevealProps {
  children: ReactNode;
  variant?: RevealVariant;
  /** Delay in ms (useful for staggering lists). */
  delay?: number;
  /** Transition duration in ms. */
  duration?: number;
  className?: string;
}

/** Reveals its children once they scroll into view (respects prefers-reduced-motion). */
const Reveal = ({ children, variant = 'up', delay = 0, duration = 800, className }: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        'ease-out will-change-transform motion-reduce:transition-none',
        visible ? 'opacity-100 translate-x-0 translate-y-0 scale-100 blur-0' : hiddenState[variant],
        className,
      )}
      style={{ transitionProperty: 'opacity, transform, filter', transitionDuration: `${duration}ms`, transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default Reveal;
