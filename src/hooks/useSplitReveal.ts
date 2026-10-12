import { useLayoutEffect, type RefObject } from 'react';
import { SplitText } from 'gsap/SplitText';
import { gsap, reducedMotion } from '@/lib/motion';

gsap.registerPlugin(SplitText);

interface Options {
  /** Animate when it scrolls into view (default) or right away, after `delay`. */
  onScroll?: boolean;
  delay?: number;
}

/**
 * Letter by letter: each character rises out of a blur, tilting into place, one after the other.
 * Nothing happens for people who prefer less motion.
 */
export function useSplitReveal(ref: RefObject<HTMLElement>, { onScroll = true, delay = 0 }: Options = {}) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    const ctx = gsap.context(() => {
      const split = SplitText.create(el, { type: 'chars,words', charsClass: 'split-char' });
      gsap.from(split.chars, {
        opacity: 0,
        yPercent: 70,
        rotationX: -75,
        filter: 'blur(10px)',
        transformOrigin: '50% 100%',
        stagger: 0.028,
        duration: 1.05,
        delay,
        ease: 'expo.out',
        clearProps: 'filter',
        ...(onScroll ? { scrollTrigger: { trigger: el, start: 'top 88%', once: true } } : {}),
      });
      return () => split.revert();
    }, el);
    return () => ctx.revert();
  }, [ref, onScroll, delay]);
}
