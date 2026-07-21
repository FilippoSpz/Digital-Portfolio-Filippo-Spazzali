import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Accent = 'primary' | 'secondary' | 'accent';

const accentClasses: Record<Accent, { badge: string; text: string }> = {
  primary: { badge: 'bg-primary/10 border-primary/30', text: 'text-primary' },
  secondary: { badge: 'bg-secondary/10 border-secondary/30', text: 'text-secondary' },
  accent: { badge: 'bg-accent/10 border-accent/30', text: 'text-accent' },
};

interface SectionHeaderProps {
  icon: LucideIcon;
  badge: string;
  title: string;
  subtitle?: string;
  accent?: Accent;
  className?: string;
}

const SectionHeader = ({ icon: Icon, badge, title, subtitle, accent = 'primary', className }: SectionHeaderProps) => {
  const classes = accentClasses[accent];

  return (
    <div className={cn('max-w-4xl text-center lg:text-left', className)}>
      <div className={cn('inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6', classes.badge)}>
        <Icon className={cn('w-4 h-4', classes.text)} />
        <span className={cn('text-sm font-medium', classes.text)}>{badge}</span>
      </div>
      <h2 className="text-4xl md:text-5xl font-bold italic uppercase tracking-wide mb-4">{title}</h2>
      {subtitle && <p className="text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0">{subtitle}</p>}
    </div>
  );
};

export default SectionHeader;
