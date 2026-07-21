import { useState } from 'react';
import { ArrowRight, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { RESUME_URL } from '@/data/navigation';
import { socialIconLinks } from '@/data/contact';
import Reveal from '@/components/common/Reveal';

interface HomeSectionProps {
  isActive: boolean;
}

/** A single letter that scales up and fades on hover. */
const AnimatedLetter = ({ letter }: { letter: string }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (letter === ' ') return <span className="inline-block w-3 md:w-5">&nbsp;</span>;

  return (
    <span
      className="inline-block cursor-default transition-all duration-100 ease-out"
      style={{
        transform: isHovered ? 'scale(1.25) translateY(-6px)' : 'scale(1) translateY(0)',
        opacity: isHovered ? 0.5 : 1,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {letter}
    </span>
  );
};

const HomeSection = ({ isActive }: HomeSectionProps) => {
  const { t } = useLanguage();

  const scrollToContact = () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section
      id="home"
      className={`min-h-screen flex items-center relative overflow-hidden transition-opacity duration-700 ${
        isActive ? 'opacity-100' : 'opacity-60'
      }`}
    >
      <div className="container mx-auto px-4 lg:pl-40 py-24">
        <div className="max-w-3xl text-center lg:text-left space-y-7">
          <Reveal variant="fade" duration={600}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-primary tracking-wide">{t('home.greeting')}</span>
            </div>
          </Reveal>

          <Reveal variant="up" delay={80}>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold italic uppercase tracking-tight leading-[0.95] text-foreground text-glow whitespace-nowrap">
              {t('home.name')
                .split('')
                .map((letter, i) => (
                  <AnimatedLetter key={i} letter={letter} />
                ))}
            </h1>
          </Reveal>

          <Reveal variant="up" delay={160}>
            <div className="relative inline-block lg:block">
              <div className="absolute -left-4 top-1 bottom-1 w-1 bg-gradient-to-b from-primary via-secondary to-accent rounded-full hidden lg:block" />
              <p className="font-display text-2xl md:text-3xl font-semibold gradient-text lg:pl-4">{t('home.title')}</p>
            </div>
          </Reveal>

          <Reveal variant="up" delay={240}>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed mx-auto lg:mx-0">{t('home.tagline')}</p>
          </Reveal>

          <Reveal variant="up" delay={320}>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground font-semibold px-8 group shadow-lg shadow-primary/25"
                onClick={scrollToContact}
              >
                {t('home.getInTouch')}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="glass border-primary/40 hover:border-primary/70 hover:bg-primary/10 px-8 group" asChild>
                <a href={RESUME_URL} download className="text-foreground">
                  <FileDown className="mr-2 h-5 w-5 group-hover:animate-bounce text-foreground" />
                  <span className="text-foreground">{t('home.downloadCV')}</span>
                </a>
              </Button>
            </div>
          </Reveal>

          <Reveal variant="up" delay={400}>
            <div className="flex items-center gap-6 pt-2 justify-center lg:justify-start">
              <span className="text-sm text-muted-foreground">{t('contact.title')}</span>
              <div className="flex gap-3">
                {socialIconLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-11 h-11 rounded-xl glass flex items-center justify-center hover:border-primary/60 hover:bg-primary/10 transition-all duration-300 hover:scale-110 hover:-translate-y-0.5"
                      aria-label={social.label}
                    >
                      <Icon className="w-4 h-4 text-foreground" />
                    </a>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-xs text-muted-foreground tracking-widest uppercase">{t('home.scroll')}</span>
        <div className="w-6 h-10 rounded-full border-2 border-primary/50 flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HomeSection;
