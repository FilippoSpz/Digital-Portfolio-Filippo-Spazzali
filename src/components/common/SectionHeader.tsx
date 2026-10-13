import { useRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useSplitReveal } from '@/hooks/useSplitReveal';
import { cn } from '@/lib/utils';
import Reveal from '@/components/common/Reveal';
import SectionNumber from '@/components/common/SectionNumber';

type Accent = 'primary' | 'secondary' | 'accent';

const accentText: Record<Accent, string> = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  accent: 'text-accent',
};

interface SectionHeaderProps {
  icon: LucideIcon;
  badge: string;
  title: string;
  subtitle?: string;
  accent?: Accent;
  /** Large watermark number: the section's place in the page (e.g. "02"). */
  index?: string;
  className?: string;
}

const SectionHeader = ({ icon: Icon, badge, title, subtitle, accent = 'primary', index, className }: SectionHeaderProps) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useSplitReveal(titleRef);
  return (
  <div className={cn('relative max-w-4xl text-center lg:text-left', className)}>
    {index && <SectionNumber value={index} />}
    <Reveal variant="up">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
        <Icon className={cn('w-4 h-4', accentText[accent])} />
        <span className={cn('text-sm font-medium tracking-wide', accentText[accent])}>{badge}</span>
      </div>
    </Reveal>
    <h2 ref={titleRef} key={title} className="font-display text-4xl md:text-5xl lg:text-6xl font-bold italic uppercase tracking-tight mb-4 [perspective:600px]">
      {title}
    </h2>
    {subtitle && (
      <Reveal variant="up" delay={160}>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0">{subtitle}</p>
      </Reveal>
    )}
  </div>
  );
};

export default SectionHeader;
