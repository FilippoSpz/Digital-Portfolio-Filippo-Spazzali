import { ArrowRight, Download, Linkedin, Github, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import profilePhoto from "@/assets/profile-photo.jpeg";

const Home = () => {
  const { t } = useLanguage();
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-hero-bg via-background to-hero-bg" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                <span className="block text-foreground">{t('home.greeting')}</span>
                <span className="block gradient-text">{t('home.name')}</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground">
                {t('home.title')}
              </p>
              <p className="text-lg text-muted-foreground max-w-xl">
                {t('home.tagline')}
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white"
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  {t('home.getInTouch')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary/50 hover:bg-primary/10"
                  asChild
                >
                  <a href="/certificates/Filippo_Spazzali_Resume.pdf" download>
                    <Download className="mr-2 h-5 w-5" />
                    {t('home.downloadCV')}
                  </a>
                </Button>
              </div>

              {/* Social Links */}
              <div className="flex gap-4 pt-4">
                <a
                  href="https://www.linkedin.com/in/filippospazzali/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 glass-card hover-lift rounded-full"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5 text-primary" />
                </a>
                <a
                  href="https://github.com/filippospz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 glass-card hover-lift rounded-full"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5 text-primary" />
                </a>
                <a
                  href="https://www.instagram.com/filippo_spz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 glass-card hover-lift rounded-full"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5 text-primary" />
                </a>
              </div>
            </div>

            {/* Right Column - Image */}
            <div className="relative animate-float">
              <div className="relative w-full max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-3xl opacity-30 animate-glow" />
                <img
                  src={profilePhoto}
                  alt="Filippo Spazzali"
                  className="relative rounded-full w-full h-auto shadow-2xl border-4 border-primary/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-primary/50 flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-primary rounded-full animate-pulse" />
          </div>
        </div>
      </section>
  );
};

export default Home;
