import { useState } from "react";
import { ArrowRight, Download, Linkedin, Github, Instagram, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import profilePhoto from "@/assets/profile-photo.jpeg";

interface HomeSectionProps {
  isActive: boolean;
}

// Animated letter component - scales up and fades on hover, returns to normal on leave
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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const fullName = t('home.name'); // "Filippo Spazzali"

  return (
    <section
      id="home"
      className={`
        min-h-screen flex items-center justify-center relative overflow-hidden
        transition-all duration-700
        ${isActive ? "opacity-100" : "opacity-50"}
      `}
    >
      {/* Mobile/Tablet centered, Desktop with left padding */}
      <div className="container mx-auto px-4 md:pl-40 lg:pl-40">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left - Text Content */}
          <div className="space-y-8 animate-fade-in text-center lg:text-left">
            {/* Section Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">{t('nav.home')}</span>
            </div>

            {/* Main Title with animated letters - Full name on one line */}
            <div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-none tracking-tight text-foreground">
                {fullName.split('').map((letter, i) => (
                  <AnimatedLetter key={i} letter={letter} />
                ))}
              </h1>
            </div>

            {/* Role */}
            <div className="relative inline-block lg:block">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-secondary to-accent rounded-full hidden lg:block" />
              <p className="text-xl md:text-2xl text-muted-foreground lg:pl-4">
                {t('home.title')}
              </p>
            </div>

            {/* Tagline */}
            <p className="text-lg text-muted-foreground/80 max-w-lg leading-relaxed mx-auto lg:mx-0">
              {t('home.tagline')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-background font-semibold px-8 group"
                onClick={() => scrollToSection('contact')}
              >
                {t('home.getInTouch')}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary/50 hover:bg-primary/10 px-8 group relative overflow-hidden"
                asChild
              >
                <a href="/certificates/Filippo_Spazzali_Resume.pdf" download>
                  <FileDown className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                  {t('home.downloadCV')}
                  <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </a>
              </Button>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-6 pt-4 justify-center lg:justify-start">
              <span className="text-sm text-muted-foreground">{t('contact.title')}</span>
              <div className="flex gap-3">
                {[
                  { icon: Linkedin, href: "https://www.linkedin.com/in/filippospazzali/", label: "LinkedIn" },
                  { icon: Github, href: "https://github.com/filippospz/", label: "GitHub" },
                  { icon: Instagram, href: "https://www.instagram.com/filippo_spz/", label: "Instagram" },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-card/50 border border-border/50 flex items-center justify-center hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 hover:scale-110"
                    aria-label={social.label}
                  >
                    <social.icon className="w-4 h-4 text-foreground" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Visual Element */}
          <div className="relative hidden lg:flex items-center justify-center">
            {/* Orbital rings */}
            <div className="absolute w-[400px] h-[400px] rounded-full border border-primary/20 animate-spin-slow" />
            <div className="absolute w-[500px] h-[500px] rounded-full border border-secondary/10 animate-spin-reverse" />
            <div className="absolute w-[300px] h-[300px] rounded-full border border-accent/20 animate-spin-slow" style={{ animationDuration: "30s" }} />

            {/* Glowing orbs */}
            <div className="absolute top-10 right-20 w-4 h-4 rounded-full bg-primary blur-sm animate-float" />
            <div className="absolute bottom-20 left-10 w-3 h-3 rounded-full bg-secondary blur-sm animate-float" style={{ animationDelay: "1s" }} />
            <div className="absolute top-1/2 right-0 w-2 h-2 rounded-full bg-accent blur-sm animate-float" style={{ animationDelay: "2s" }} />

            {/* Central profile with cosmic glow */}
            <div className="relative">
              <div className="absolute inset-[-20px] rounded-full bg-gradient-to-r from-primary via-secondary to-accent opacity-30 blur-2xl animate-pulse" />
              <div className="absolute inset-[-10px] rounded-full bg-gradient-to-r from-accent via-primary to-secondary opacity-20 blur-xl animate-spin-slow" />
              <img
                src={profilePhoto}
                alt="Filippo Spazzali"
                className="relative w-64 h-64 rounded-full object-cover border-4 border-primary/30 shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-xs text-muted-foreground">Scroll</span>
        <div className="w-6 h-10 rounded-full border-2 border-primary/50 flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HomeSection;
