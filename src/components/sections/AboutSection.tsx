import { useEffect, useState, useCallback, useMemo } from "react";
import { Briefcase, GraduationCap, ExternalLink, Languages, MapPin, Calendar, User, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import useEmblaCarousel from "embla-carousel-react";

interface AboutSectionProps {
  isActive: boolean;
}

const AboutSection = ({ isActive }: AboutSectionProps) => {
  const { t, language } = useLanguage();
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false, 
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps"
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const experiences = [
    {
      roleKey: "experience.webDeveloper",
      company: "Colori di Sicilia",
      period: "2025",
      location: "Trieste, Italy",
      link: "https://coloridisicilia1.odoo.com/",
      descriptionKeys: ["experience.ceramiche.desc1", "experience.ceramiche.desc2"],
      type: "work",
    },
    {
      roleKey: "experience.webDeveloper",
      company: "Artigiani della Pipa",
      period: "2025",
      location: "Trieste, Italy",
      link: "https://artigianidellapipa.odoo.com/",
      descriptionKeys: ["experience.artigiani.desc1", "experience.artigiani.desc2"],
      type: "work",
    },
    {
      roleKey: "experience.webDeveloper",
      company: "ViaGlut",
      period: "2025",
      location: "Trieste, Italy",
      link: "https://magento-1168665-4085035.cloudwaysapps.com/italiano/index",
      descriptionKeys: ["experience.viaglut.desc1", "experience.viaglut.desc2"],
      type: "work",
    },
    {
      roleKey: "experience.webDeveloper",
      company: "CIRCOLO AZIENDALE FINCANTIERI - WÄRTSILÄ ITALIA - APS",
      period: "2022 – 2023",
      location: "Trieste, Italy",
      link: "https://www.circolofinwar.it/",
      descriptionKeys: ["experience.circolo.desc1", "experience.circolo.desc2"],
      type: "work",
    },
    {
      roleKey: "experience.intern",
      company: "Wärtsilä Italia (School Work Experience - PCTO)",
      period: "January 2022 – February 2022",
      location: "Trieste, Italy",
      link: "https://www.wartsila.com/ita",
      descriptionKeys: ["experience.wartsila.desc1", "experience.wartsila.desc2"],
      type: "work",
    },
  ];

  const education = [
    {
      degreeKey: "education.bachelors",
      institutionKey: "education.university",
      periodKey: "education.expectedGraduation",
      location: "Trieste, Italy",
      link: "https://lauree.units.it/it/0320106200800001",
      type: "education",
    },
    {
      degreeKey: "education.highSchool",
      institutionKey: "education.technicalInstitute",
      periodKey: "education.graduated",
      location: "Trieste, Italy",
      link: "https://www.voltatrieste.edu.it/",
      type: "education",
    },
  ];

  // Combine experiences and education for the carousel
  const allItems = [...experiences, ...education];

  // Generate stable nebula particles
  const nebulaParticles = useMemo(() => 
    [...Array(30)].map((_, i) => ({
      id: i,
      size: 2 + Math.random() * 4,
      top: 10 + Math.random() * 80,
      right: Math.random() * 40,
      delay: Math.random() * 4,
      duration: 3 + Math.random() * 2,
      opacity: 0.2 + Math.random() * 0.6,
    })), []
  );

  // Language names based on current language
  const languageNames = {
    italian: language === 'en' ? 'Italian' : 'Italiano',
    english: language === 'en' ? 'English' : 'Inglese',
  };

  return (
    <section
      id="about"
      className={`
        min-h-screen py-24 relative overflow-hidden
        transition-all duration-700
        ${isActive ? "opacity-100" : "opacity-50"}
      `}
    >
      {/* Container for header content */}
      <div className="container mx-auto px-4 md:px-8 lg:pl-40 relative z-10">
        {/* Section Header */}
        <div className="max-w-4xl mb-12 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/30 mb-6">
            <User className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-secondary">{t('nav.about')}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t('about.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0">
            {t('about.intro')}
          </p>
        </div>

        {/* Professional Summary Card */}
        <div className="mb-12">
          <div className="relative overflow-hidden rounded-2xl bg-card/50 border border-border/50 p-8 md:p-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-secondary/20 to-transparent rounded-full blur-3xl" />
            <h3 className="text-2xl font-bold gradient-text mb-4">{t('about.professionalSummary')}</h3>
            <p className="text-lg text-muted-foreground leading-relaxed relative z-10">
              {t('about.professionalSummaryText')}
            </p>
          </div>
        </div>

        {/* Carousel Header with Navigation and View Portfolio Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-background" />
            </div>
            <h3 className="text-2xl font-bold">{t('about.experience')} & {t('about.education')}</h3>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="default"
              size="sm"
              onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t('about.viewPortfolio')}
              <ChevronRight className="ml-1 w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={scrollPrev}
                disabled={!canScrollPrev}
                className="rounded-full border-primary/50 hover:bg-primary/10 disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={scrollNext}
                disabled={!canScrollNext}
                className="rounded-full border-primary/50 hover:bg-primary/10 disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width Horizontal Timeline Carousel Section */}
      <div className="relative w-full mb-12">
        {/* Nebula Origin - Right side where cards emerge from */}
        <div className="absolute top-0 bottom-0 right-0 w-[400px] pointer-events-none z-20 hidden lg:block">
          {/* Main nebula cloud */}
          <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/3 w-[500px] h-[600px]">
            {/* Core glow layers */}
            <div className="absolute inset-0 bg-gradient-radial from-primary/30 via-primary/10 to-transparent rounded-full blur-3xl animate-pulse" />
            <div className="absolute inset-0 bg-gradient-radial from-secondary/25 via-secondary/5 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
            <div className="absolute inset-0 bg-gradient-radial from-accent/20 via-accent/5 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
            
            {/* Swirling inner nebula */}
            <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-gradient-conic from-primary/40 via-secondary/30 to-accent/40 rounded-full blur-2xl animate-spin-slow opacity-60" />
            
            {/* Bright core */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-radial from-white/30 via-primary/40 to-transparent rounded-full blur-xl animate-pulse" />
          </div>
          
          {/* Floating cosmic particles emerging from nebula */}
          {nebulaParticles.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-full bg-gradient-to-l from-primary via-secondary to-accent animate-pulse"
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                top: `${particle.top}%`,
                right: `${particle.right}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
                opacity: particle.opacity,
              }}
            />
          ))}
          
          {/* Fade gradient from nebula to cards */}
          <div className="absolute inset-0 bg-gradient-to-l from-background via-background/80 to-transparent" />
        </div>

        {/* Timeline line - horizontal, full width */}
        <div className="absolute top-[42px] left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-secondary to-accent z-10">
          {/* Animated glow on timeline */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent blur-sm opacity-50" />
        </div>
        
        {/* Fade overlay on left side (desktop) - before solar system */}
        <div className="hidden lg:block absolute top-0 bottom-0 left-0 w-40 bg-gradient-to-r from-background via-background/90 to-transparent z-30 pointer-events-none" />
        
        {/* Fade overlay on right side (desktop) - transition to nebula */}
        <div className="hidden lg:block absolute top-0 bottom-0 right-0 w-48 bg-gradient-to-l from-background via-background/60 to-transparent z-10 pointer-events-none" />
        
        {/* Embla Carousel - Full width */}
        <div className="overflow-hidden pl-4 md:pl-8 lg:pl-40" ref={emblaRef}>
          <div className="flex gap-6 pr-[200px] lg:pr-[400px]">
            {allItems.map((item, index) => {
              const isEducation = item.type === "education";
              const edu = isEducation ? item as typeof education[0] : null;
              const exp = !isEducation ? item as typeof experiences[0] : null;
              
              return (
                <div
                  key={index}
                  className="flex-shrink-0 w-[320px] md:w-[380px] pt-20 relative"
                >
                  {/* Timeline dot - centered on the timeline */}
                  <div className="absolute top-[34px] left-1/2 -translate-x-1/2 z-20">
                    <div className={`w-4 h-4 rounded-full border-4 border-background shadow-lg ${isEducation ? 'bg-secondary' : 'bg-primary'}`}>
                      {/* Glow effect around dot */}
                      <div className={`absolute -inset-2 rounded-full blur-md ${isEducation ? 'bg-secondary/40' : 'bg-primary/40'}`} />
                    </div>
                    {/* Connecting line from dot to card */}
                    <div className={`absolute top-4 left-1/2 -translate-x-1/2 w-px h-6 ${isEducation ? 'bg-gradient-to-b from-secondary to-transparent' : 'bg-gradient-to-b from-primary to-transparent'}`} />
                  </div>
                  
                  {/* Icon badge - positioned above the card */}
                  <div className={`absolute top-[70px] left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 z-10 ${
                    isEducation 
                      ? 'bg-secondary/20 text-secondary border border-secondary/30 backdrop-blur-sm' 
                      : 'bg-primary/20 text-primary border border-primary/30 backdrop-blur-sm'
                  }`}>
                    {isEducation ? <GraduationCap className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
                    {isEducation ? t('about.education') : t('about.experience')}
                  </div>
                  
                  {/* Card */}
                  <div className={`mt-8 bg-card/40 backdrop-blur-sm rounded-xl p-6 border transition-all duration-300 hover:scale-[1.02] ${
                    isEducation 
                      ? 'border-secondary/20 hover:border-secondary/40 hover:shadow-lg hover:shadow-secondary/10' 
                      : 'border-primary/20 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10'
                  }`}>
                    {isEducation && edu ? (
                      <>
                        <h4 className="text-lg font-semibold text-secondary mb-2">{t(edu.degreeKey)}</h4>
                        <p className="text-foreground font-medium mb-2">{t(edu.institutionKey)}</p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {t(edu.periodKey)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {edu.location}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-secondary/50 hover:bg-secondary/10 text-foreground"
                          asChild
                        >
                          <a href={edu.link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-3 w-3" />
                            {t('about.viewInstitute')}
                          </a>
                        </Button>
                      </>
                    ) : exp ? (
                      <>
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <h4 className="text-lg font-semibold text-primary">{t(exp.roleKey)}</h4>
                        </div>
                        <p className="font-medium text-foreground mb-1">{exp.company}</p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {exp.period}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {exp.location}
                          </span>
                        </div>
                        <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                          {exp.descriptionKeys.map((key, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-primary mt-0.5">▸</span>
                              <span className="line-clamp-2">{t(key)}</span>
                            </li>
                          ))}
                        </ul>
                        {exp.link && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-primary/50 hover:bg-primary/10 text-foreground"
                            asChild
                          >
                            <a href={exp.link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2 h-3 w-3" />
                              {t('about.viewProject')}
                            </a>
                          </Button>
                        )}
                      </>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Languages Section - Static below carousel */}
      <div className="container mx-auto px-4 md:px-8 lg:pl-40 relative z-10">
        <div className="max-w-2xl mx-auto lg:mx-0">
          <div className="flex items-center gap-3 mb-8 justify-center lg:justify-start">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
              <Languages className="w-6 h-6 text-background" />
            </div>
            <h3 className="text-2xl font-bold">{t('about.languages')}</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card/30 backdrop-blur-sm rounded-xl p-6 border border-border/30 text-center hover:border-accent/30 transition-all duration-300 hover:scale-[1.02] group">
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🇮🇹</div>
              <h4 className="text-xl font-semibold mb-2">{languageNames.italian}</h4>
              <p className="text-sm text-muted-foreground">{t('about.nativeLevel')}</p>
            </div>
            <div className="bg-card/30 backdrop-blur-sm rounded-xl p-6 border border-border/30 text-center hover:border-accent/30 transition-all duration-300 hover:scale-[1.02] group">
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🇬🇧</div>
              <h4 className="text-xl font-semibold mb-2">{languageNames.english}</h4>
              <p className="text-sm text-muted-foreground">{t('about.languagesText')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
