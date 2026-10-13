import Parallax from '@/components/common/Parallax';
import { cn } from '@/lib/utils';

interface SectionNumberProps {
  /** The section's place in the page, e.g. "03" (same order as the planets in the menu). */
  value: string;
  className?: string;
}

/** The big background number of a section: a watermark in the planet's colour, faint but readable. */
const SectionNumber = ({ value, className }: SectionNumberProps) => (
  <Parallax speed={0.3} className={cn('pointer-events-none absolute -top-20 right-0 lg:-right-10 -z-10 select-none', className)}>
    <span aria-hidden="true" className="font-display font-bold text-[26vw] lg:text-[13rem] leading-none tracking-tighter text-primary/[0.28]">
      {value}
    </span>
  </Parallax>
);

export default SectionNumber;
