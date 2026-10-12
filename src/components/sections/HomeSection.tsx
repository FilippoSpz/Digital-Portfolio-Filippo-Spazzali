import { lazy, Suspense, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { ArrowRight, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { RESUME_URL } from '@/data/navigation';
import { socialIconLinks } from '@/data/contact';
import Reveal from '@/components/common/Reveal';
import profilePhoto from '@/assets/images/profile-photo.jpeg';
import { gsap, reducedMotion, rich3D, scrollToSection } from '@/lib/motion';
import Magnetic from '@/components/common/Magnetic';

const ParticlePortrait = lazy(() => import('@/components/home/ParticlePortrait'));

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
  const [particles] = useState(rich3D);
  const [particlesReady, setParticlesReady] = useState(false);
  const onParticlesReady = useCallback(() => setParticlesReady(true), []);

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
      className={`min-h-screen flex items-center relative overflow-hidden transition-opacity duration-700 ${
        isActive ? 'opacity-100' : 'opacity-60'
      }`}
    >
      <div className="container mx-auto px-4 lg:pl-[25rem] py-28">
        <div className="grid xl:grid-cols-[1.05fr_0.95fr] gap-12 xl:gap-16 items-center max-w-6xl">
          {/* Portrait (first on mobile/tablet for impact) */}
          <div className="order-1 xl:order-2 flex justify-center">
            <Reveal variant="zoom" delay={150} duration={900}>
              <div className="relative w-60 h-60 sm:w-72 sm:h-72 xl:w-[24rem] xl:h-[24rem]">
                {!particles && (
                  <>
                    <div className="absolute inset-[-16px] rounded-full bg-gradient-to-tr from-primary via-secondary to-accent opacity-70 blur-md animate-spin-slow" />
                    <div className="absolute inset-[-8px] rounded-full bg-gradient-to-br from-primary/40 to-secondary/40 blur-2xl animate-pulse" />
                  </>
                )}
                {particles && (
                  // Dark sky right behind the points: the face reads even with the Sun nearby.
                  <div className="absolute inset-[-14%] rounded-full bg-[radial-gradient(circle,rgba(4,5,12,0.9)_42%,rgba(4,5,12,0.55)_58%,transparent_72%)]" />
                )}
                <div className="absolute inset-[-34px] rounded-full border border-primary/20 animate-spin-reverse" />
                <div className="absolute inset-[-54px] rounded-full border border-secondary/10 animate-spin-slow" style={{ animationDuration: '40s' }} />
                {/* The photo stays until the particles are ready, then they take its place. */}
                <img
                  src={profilePhoto}
                  alt="Filippo Spazzali"
                  width={384}
                  height={384}
                  className={`relative w-full h-full rounded-full object-cover border-2 border-white/10 shadow-2xl transition-opacity duration-1000 ${
                    particlesReady ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                {particles && (
                  <Suspense fallback={null}>
                    <ParticlePortrait photo={profilePhoto} onReady={onParticlesReady} />
                  </Suspense>
                )}
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
              <h1
                ref={nameRef}
                className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold italic uppercase tracking-tight leading-[0.95] text-foreground text-glow whitespace-nowrap [perspective:700px]"
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
                <Magnetic>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground font-semibold px-8 group shadow-lg shadow-primary/25"
                    onClick={scrollToContact}
                  >
                    {t('home.getInTouch')}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Magnetic>
                <Magnetic>
                  <Button size="lg" variant="outline" className="glass border-primary/40 hover:border-primary/70 hover:bg-primary/10 px-8 group" asChild>
                    <a href={RESUME_URL} download className="text-foreground">
                      <FileDown className="mr-2 h-5 w-5 group-hover:animate-bounce text-foreground" />
                      <span className="text-foreground">{t('home.downloadCV')}</span>
                    </a>
                  </Button>
                </Magnetic>
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
