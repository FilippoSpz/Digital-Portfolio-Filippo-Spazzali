import { ArrowRight, Download, Linkedin, Github, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import profilePhoto from "@/assets/profile-photo.jpeg";

interface HomeSectionProps {
  isActive: boolean;
}

const HomeSection = ({ isActive }: HomeSectionProps) => {
  const { t } = useLanguage();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="home"
      className={`
        min-h-screen flex items-center justify-center relative overflow-hidden
        transition-all duration-700
        ${isActive ? "opacity-100" : "opacity-50"}
      `}
    >
      <div className="container mx-auto px-4 pl-28 md:pl-40">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left - Text Content */}
          <div className="space-y-8 animate-fade-in">
            {/* Greeting Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">{t('home.greeting')}</span>
            </div>

            {/* Main Title */}
            <div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-none tracking-tight">
                <span className="block text-foreground mb-2">{t('home.name').split(' ')[0]}</span>
                <span className="block gradient-text">{t('home.name').split(' ')[1]}</span>
              </h1>
            </div>

            {/* Role */}
            <div className="relative">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-secondary to-accent rounded-full" />
              <p className="text-xl md:text-2xl text-muted-foreground pl-4">
                {t('home.title')}
              </p>
            </div>

            {/* Tagline */}
            <p className="text-lg text-muted-foreground/80 max-w-lg leading-relaxed">
              {t('home.tagline')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
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
                className="border-primary/50 hover:bg-primary/10 px-8"
                asChild
              >
                <a href="/certificates/Filippo_Spazzali_Resume.pdf" download>
                  <Download className="mr-2 h-5 w-5" />
                  {t('home.downloadCV')}
                </a>
              </Button>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-6 pt-4">
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
