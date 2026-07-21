import { useCallback, useEffect, useState } from 'react';
import { SECTION_IDS, type SectionId } from '@/data/navigation';

/**
 * Scroll-spy built on IntersectionObserver (no per-scroll-event work).
 * A section becomes active when it crosses a horizontal line at ~40% of the viewport.
 */
export function useActiveSection() {
  const [activeSection, setActiveSection] = useState<SectionId>('home');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id as SectionId);
          }
        }
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
    );

    const elements = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const scrollToSection = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return { activeSection, scrollToSection };
}
