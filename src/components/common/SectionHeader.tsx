import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Reveal from '@/components/common/Reveal';
import Parallax from '@/components/common/Parallax';

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
  /** Large faint watermark number (e.g. "02"). */
  index?: string;
  className?: string;
}

const SectionHeader = ({ icon: Icon, badge, title, subtitle, accent = 'primary', index, className }: SectionHeaderProps) => (
  <div className={cn('relative max-w-4xl text-center lg:text-left', className)}>
    {index && (
      <Parallax speed={0.3} className="pointer-events-none absolute -top-20 right-0 lg:-right-10 -z-10 select-none">
        <span className="font-display font-bold text-[26vw] lg:text-[13rem] leading-none tracking-tighter text-foreground/[0.05]">{index}</span>
      </Parallax>
    )}
    <Reveal variant="up">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
        <Icon className={cn('w-4 h-4', accentText[accent])} />
        <span className={cn('text-sm font-medium tracking-wide', accentText[accent])}>{badge}</span>
      </div>
    </Reveal>
    <Reveal variant="up" delay={80}>
      <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold italic uppercase tracking-tight mb-4 text-glow">{title}</h2>
    </Reveal>
    {subtitle && (
      <Reveal variant="up" delay={160}>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0">{subtitle}</p>
      </Reveal>
    )}
  </div>
);

export default SectionHeader;
