import { useState } from 'react';
import { ArrowRight, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { RESUME_URL } from '@/data/navigation';
import { socialIconLinks } from '@/data/contact';
import Reveal from '@/components/common/Reveal';
import profilePhoto from '@/assets/images/profile-photo.jpeg';

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
      <div className="container mx-auto px-4 lg:pl-[25rem] py-28">
        <div className="grid xl:grid-cols-[1.05fr_0.95fr] gap-12 xl:gap-16 items-center max-w-6xl">
          {/* Portrait (first on mobile/tablet for impact) */}
          <div className="order-1 xl:order-2 flex justify-center">
            <Reveal variant="zoom" delay={150} duration={900}>
              <div className="relative w-56 h-56 sm:w-72 sm:h-72 xl:w-[22rem] xl:h-[22rem]">
                <div className="absolute inset-[-16px] rounded-full bg-gradient-to-tr from-primary via-secondary to-accent opacity-70 blur-md animate-spin-slow" />
                <div className="absolute inset-[-8px] rounded-full bg-gradient-to-br from-primary/40 to-secondary/40 blur-2xl animate-pulse" />
                <div className="absolute inset-[-34px] rounded-full border border-primary/20 animate-spin-reverse" />
                <div className="absolute inset-[-54px] rounded-full border border-secondary/10 animate-spin-slow" style={{ animationDuration: '40s' }} />
                <img
                  src={profilePhoto}
                  alt="Filippo Spazzali"
                  width={352}
                  height={352}
                  className="relative w-full h-full rounded-full object-cover border-2 border-white/10 shadow-2xl"
                />
                <div className="absolute inset-[-34px] animate-spin-slow">
                  <span className="absolute left-1/2 top-0 w-3 h-3 -translate-x-1/2 rounded-full bg-secondary shadow-[0_0_14px_hsl(var(--secondary))]" />
                </div>
                <div className="absolute inset-[-54px] animate-spin-reverse">
                  <span className="absolute left-1/2 top-0 w-2 h-2 -translate-x-1/2 rounded-full bg-accent shadow-[0_0_12px_hsl(var(--accent))]" />
                </div>
              </div>
            </Reveal>
          </div>

          {/* Text */}
          <div className="order-2 xl:order-1 text-center xl:text-left space-y-7">
            <Reveal variant="fade" duration={600}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium text-primary tracking-wide">{t('home.greeting')}</span>
              </div>
            </Reveal>

            <Reveal variant="up" delay={80}>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold italic uppercase tracking-tight leading-[0.95] text-foreground text-glow whitespace-nowrap">
                {t('home.name')
                  .split('')
                  .map((letter, i) => (
                    <AnimatedLetter key={i} letter={letter} />
                  ))}
              </h1>
            </Reveal>

            <Reveal variant="up" delay={160}>
              <div className="relative inline-block xl:block">
                <div className="absolute -left-4 top-1 bottom-1 w-1 bg-gradient-to-b from-primary via-secondary to-accent rounded-full hidden xl:block" />
                <p className="font-display text-2xl md:text-3xl font-semibold gradient-text xl:pl-4">{t('home.title')}</p>
              </div>
            </Reveal>

            <Reveal variant="up" delay={240}>
              <p className="text-lg text-muted-foreground max-w-xl leading-relaxed mx-auto xl:mx-0">{t('home.tagline')}</p>
            </Reveal>

            <Reveal variant="up" delay={320}>
              <div className="flex flex-wrap gap-4 justify-center xl:justify-start">
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
              <div className="flex items-center gap-6 pt-2 justify-center xl:justify-start">
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
