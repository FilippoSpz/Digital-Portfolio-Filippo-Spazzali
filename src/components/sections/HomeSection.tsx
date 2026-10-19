import { memo, useLayoutEffect, useRef, useState } from 'react';
import { ArrowRight, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { RESUME_URL } from '@/data/navigation';
import { socialIconLinks } from '@/data/contact';
import Reveal from '@/components/common/Reveal';
import profilePhoto from '@/assets/images/profile-photo.jpeg';
import SectionNumber from '@/components/common/SectionNumber';
import { gsap, reducedMotion, scrollToSection } from '@/lib/motion';

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

  const scrollToContact = () => scrollToSection('contact');

  // The name assembles itself letter by letter when the page opens.
  const nameRef = useRef<HTMLHeadingElement>(null);
  useLayoutEffect(() => {
    const el = nameRef.current;
    if (!el || reducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll(':scope > span'), {
        opacity: 0,
        yPercent: 90,
        rotationX: -90,
        filter: 'blur(12px)',
        transformOrigin: '50% 100%',
        stagger: 0.045,
        duration: 1.2,
        delay: 0.25,
        ease: 'expo.out',
        clearProps: 'filter,transform',
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="home"
      data-planet="home"
      className={`min-h-screen flex items-center relative overflow-hidden transition-opacity duration-700 ${
        isActive ? 'opacity-100' : 'opacity-60'
      }`}
    >
      <div className="container mx-auto px-4 lg:pl-[25rem] py-28">
        <div className="grid xl:grid-cols-[1.05fr_0.95fr] gap-12 xl:gap-16 items-center max-w-6xl">
          {/* Portrait (first on mobile/tablet for impact): just the photo, with a thin ring in the Sun's orange. */}
          <div className="order-1 xl:order-2 flex justify-center">
            <Reveal variant="zoom" delay={150} duration={900}>
              <img
                src={profilePhoto}
                alt="Filippo Spazzali"
                width={384}
                height={384}
                className="w-60 sm:w-72 xl:w-[24rem] max-w-full h-auto aspect-square rounded-full object-cover border-2 border-primary"
              />
            </Reveal>
          </div>

          {/* Text */}
          <div className="relative order-2 xl:order-1 text-center xl:text-left">
            <SectionNumber value="01" />
            <div className="space-y-7">
              <Reveal variant="fade" duration={600}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm font-medium text-primary tracking-wide">{t('home.greeting')}</span>
                </div>
              </Reveal>

              <Reveal variant="up" delay={80}>
                <h1
                  ref={nameRef}
                  className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold italic uppercase tracking-tight leading-[0.95] text-foreground whitespace-nowrap [perspective:700px]"
                >
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
                  <Button size="lg" className="font-semibold px-8" onClick={scrollToContact}>
                    {t('home.getInTouch')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button size="lg" variant="outline" className="px-8" asChild>
                    <a href={RESUME_URL} download>
                      <FileDown className="mr-2 h-5 w-5" />
                      {t('home.downloadCV')}
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
                          className="w-11 h-11 rounded-xl glass flex items-center justify-center text-foreground transition-colors duration-300 hover:border-primary hover:bg-primary hover:text-primary-foreground"
                          aria-label={social.label}
                        >
                          <Icon className="w-4 h-4" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              </Reveal>
            </div>
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

export default memo(HomeSection);
