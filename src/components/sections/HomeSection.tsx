import { useState } from 'react';
import { ArrowRight, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { RESUME_URL } from '@/data/navigation';
import { socialIconLinks } from '@/data/contact';
import profilePhoto from '@/assets/images/profile-photo.jpeg';

interface HomeSectionProps {
  isActive: boolean;
}

/** A single letter that scales up and fades on hover. */
const AnimatedLetter = ({ letter }: { letter: string }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (letter === ' ') return <span className="inline-block w-4">&nbsp;</span>;

  return (
    <span
      className="inline-block cursor-default transition-all duration-75 ease-out"
      style={{
        transform: isHovered ? 'scale(1.3) translateY(-4px)' : 'scale(1) translateY(0)',
        opacity: isHovered ? 0.4 : 1,
        filter: isHovered ? 'blur(1px)' : 'blur(0)',
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
      className={`min-h-screen flex items-center justify-center relative overflow-hidden transition-opacity duration-700 ${
        isActive ? 'opacity-100' : 'opacity-50'
      }`}
    >
      <div className="container mx-auto px-4 lg:pl-40">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Text content */}
          <div className="space-y-8 animate-fade-in text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">{t('nav.home')}</span>
            </div>

            <h1 className="text-3xl md:text-6xl lg:text-7xl font-bold italic uppercase tracking-wide leading-none text-foreground whitespace-nowrap">
              {t('home.name')
                .split('')
                .map((letter, i) => (
                  <AnimatedLetter key={i} letter={letter} />
                ))}
            </h1>

            <div className="relative inline-block lg:block">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-secondary to-accent rounded-full hidden lg:block" />
              <p className="text-xl md:text-2xl text-muted-foreground lg:pl-4">{t('home.title')}</p>
            </div>

            <p className="text-lg text-muted-foreground/80 max-w-lg leading-relaxed mx-auto lg:mx-0">{t('home.tagline')}</p>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-background font-semibold px-8 group"
                onClick={scrollToContact}
              >
                {t('home.getInTouch')}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10 hover:text-foreground px-8 group" asChild>
                <a href={RESUME_URL} download className="text-foreground">
                  <FileDown className="mr-2 h-5 w-5 group-hover:animate-bounce text-foreground" />
                  <span className="text-foreground">{t('home.downloadCV')}</span>
                </a>
              </Button>
            </div>

            <div className="flex items-center gap-6 pt-4 justify-center lg:justify-start">
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
                      className="w-10 h-10 rounded-xl bg-card/50 border border-border/50 flex items-center justify-center hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 hover:scale-110"
                      aria-label={social.label}
                    >
                      <Icon className="w-4 h-4 text-foreground" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Visual element */}
          <div className="relative hidden lg:flex items-center justify-center">
            <div className="absolute w-[400px] h-[400px] rounded-full border border-primary/20 animate-spin-slow" />
            <div className="absolute w-[500px] h-[500px] rounded-full border border-secondary/10 animate-spin-reverse" />
            <div className="absolute w-[300px] h-[300px] rounded-full border border-accent/20 animate-spin-slow" style={{ animationDuration: '30s' }} />

            <div className="absolute top-10 right-20 w-4 h-4 rounded-full bg-primary blur-sm animate-float" />
            <div className="absolute bottom-20 left-10 w-3 h-3 rounded-full bg-secondary blur-sm animate-float" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 right-0 w-2 h-2 rounded-full bg-accent blur-sm animate-float" style={{ animationDelay: '2s' }} />

            <div className="relative">
              <div className="absolute inset-[-20px] rounded-full bg-gradient-to-r from-primary via-secondary to-accent opacity-30 blur-2xl animate-pulse" />
              <div className="absolute inset-[-10px] rounded-full bg-gradient-to-r from-accent via-primary to-secondary opacity-20 blur-xl animate-spin-slow" />
              <img
                src={profilePhoto}
                alt="Filippo Spazzali"
                width={256}
                height={256}
                className="relative w-64 h-64 rounded-full object-cover border-4 border-primary/30 shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-xs text-muted-foreground">{t('home.scroll')}</span>
        <div className="w-6 h-10 rounded-full border-2 border-primary/50 flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HomeSection;
