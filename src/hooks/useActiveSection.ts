import { useCallback, useEffect, useState } from 'react';
import { SECTION_IDS, type SectionId } from '@/data/navigation';
import { onJump, scrollToSection as smoothScrollTo } from '@/lib/motion';

/** The section that crosses the line at ~40% of the screen right now. */
function sectionAtLine(): SectionId {
  const line = window.innerHeight * 0.4;
  let current: SectionId = SECTION_IDS[0];
  for (const id of SECTION_IDS) {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= line) current = id;
  }
  return current;
}

/**
 * Scroll-spy built on IntersectionObserver (no per-scroll-event work).
 * A section becomes active when it crosses a horizontal line at ~40% of the viewport.
 * During a menu jump the target is active from the click on, and the sections the page glides
 * past are ignored: the menu does not flicker through them.
 */
export function useActiveSection() {
  const [activeSection, setActiveSection] = useState<SectionId>('home');

  useEffect(() => {
    let jumping = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (jumping) return;
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

    const stopListening = onJump((target) => {
      jumping = target !== null;
      setActiveSection(target ? (target as SectionId) : sectionAtLine());
    });

    return () => {
      observer.disconnect();
      stopListening();
    };
  }, []);

  const scrollToSection = useCallback((id: string) => {
    smoothScrollTo(id);
  }, []);

  return { activeSection, scrollToSection };
}
