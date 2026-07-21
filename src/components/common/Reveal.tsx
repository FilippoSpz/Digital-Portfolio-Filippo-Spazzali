import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type RevealVariant = 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade';

const hiddenState: Record<RevealVariant, string> = {
  up: 'opacity-0 translate-y-12',
  down: 'opacity-0 -translate-y-12',
  left: 'opacity-0 translate-x-12',
  right: 'opacity-0 -translate-x-12',
  scale: 'opacity-0 scale-95',
  fade: 'opacity-0',
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
const Reveal = ({ children, variant = 'up', delay = 0, duration = 700, className }: RevealProps) => {
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
        visible ? 'opacity-100 translate-x-0 translate-y-0 scale-100' : hiddenState[variant],
        className,
      )}
      style={{ transitionProperty: 'opacity, transform', transitionDuration: `${duration}ms`, transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default Reveal;
