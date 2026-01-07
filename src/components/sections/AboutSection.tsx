import { useRef, useEffect, useState } from "react";
import { Briefcase, GraduationCap, ExternalLink, Languages, MapPin, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface AboutSectionProps {
  isActive: boolean;
}

// Asteroid component
const Asteroid = ({ style, size }: { style: React.CSSProperties; size: number }) => (
  <div
    className="absolute rounded-full opacity-60"
    style={{
      ...style,
      width: size,
      height: size,
      background: `radial-gradient(ellipse at 30% 30%, #8b7355 0%, #5c4a3a 50%, #3d3027 100%)`,
      boxShadow: `inset -${size/4}px -${size/4}px ${size/2}px rgba(0,0,0,0.5), inset ${size/8}px ${size/8}px ${size/4}px rgba(255,255,255,0.1)`,
    }}
  />
);

const AboutSection = ({ isActive }: AboutSectionProps) => {
  const { t, language } = useLanguage();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Trigger animation when section becomes active
  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  // Horizontal scroll on mouse wheel
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Only handle if we're scrolling vertically
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  const experiences = [
    {
      type: "work",
      roleKey: "experience.webDeveloper",
      company: "Colori di Sicilia",
      period: "2025",
      location: "Trieste, Italy",
      link: "https://coloridisicilia1.odoo.com/",
      descriptionKeys: ["experience.ceramiche.desc1", "experience.ceramiche.desc2"],
    },
    {
      type: "work",
      roleKey: "experience.webDeveloper",
      company: "Artigiani della Pipa",
      period: "2025",
      location: "Trieste, Italy",
      link: "https://artigianidellapipa.odoo.com/",
      descriptionKeys: ["experience.artigiani.desc1", "experience.artigiani.desc2"],
    },
    {
      type: "work",
      roleKey: "experience.webDeveloper",
      company: "ViaGlut",
      period: "2025",
      location: "Trieste, Italy",
      link: "https://magento-1168665-4085035.cloudwaysapps.com/italiano/index",
      descriptionKeys: ["experience.viaglut.desc1", "experience.viaglut.desc2"],
    },
    {
      type: "work",
      roleKey: "experience.webDeveloper",
      company: "CIRCOLO AZIENDALE FINCANTIERI - WÄRTSILÄ ITALIA - APS",
      period: "2022 – 2023",
      location: "Trieste, Italy",
      link: "https://www.circolofinwar.it/",
      descriptionKeys: ["experience.circolo.desc1", "experience.circolo.desc2"],
    },
    {
      type: "work",
      roleKey: "experience.intern",
      company: "Wärtsilä Italia (School Work Experience - PCTO)",
      period: "January 2022 – February 2022",
      location: "Trieste, Italy",
      link: "https://www.wartsila.com/ita",
      descriptionKeys: ["experience.wartsila.desc1", "experience.wartsila.desc2"],
    },
    {
      type: "education",
      degreeKey: "education.bachelors",
      institutionKey: "education.university",
      periodKey: "education.expectedGraduation",
      location: "Trieste, Italy",
      link: "https://lauree.units.it/it/0320106200800001",
    },
    {
      type: "education",
      degreeKey: "education.highSchool",
      institutionKey: "education.technicalInstitute",
      periodKey: "education.graduated",
      location: "Trieste, Italy",
      link: "https://www.voltatrieste.edu.it/",
    },
  ];

  // Language names based on current language
  const languageNames = {
    italian: language === 'en' ? 'Italian' : 'Italiano',
    english: language === 'en' ? 'English' : 'Inglese',
  };

  // Generate asteroids
  const asteroids = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    top: `${5 + Math.random() * 90}%`,
    right: `${Math.random() * 15}%`,
    size: 8 + Math.random() * 30,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${15 + Math.random() * 20}s`,
  }));

  return (
    <section
      id="about"
      className={`
        min-h-screen py-24 relative overflow-hidden
        transition-all duration-700
        ${isActive ? "opacity-100" : "opacity-50"}
      `}
    >
      {/* Left shadow gradient for solar system */}
      <div className="hidden lg:block absolute left-0 top-0 h-full w-[350px] bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none" />

      {/* Asteroids on the right */}
      <div className="absolute right-0 top-0 h-full w-[200px] pointer-events-none overflow-hidden">
        {asteroids.map((asteroid) => (
          <Asteroid
            key={asteroid.id}
            size={asteroid.size}
            style={{
              top: asteroid.top,
              right: asteroid.right,
              animation: `float ${asteroid.animationDuration} ease-in-out infinite`,
              animationDelay: asteroid.animationDelay,
            }}
          />
        ))}
      </div>

      {/* Content Container */}
      <div className="container mx-auto px-4 md:px-8 lg:pl-40">
        {/* Section Header with View Portfolio Button */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/30 mb-4">
              <User className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium text-secondary">{t('nav.about')}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold italic">
              Journey Through Space & Time
            </h2>
            <p className="text-lg text-muted-foreground mt-2">
              Scroll horizontally to explore my experience timeline
            </p>
          </div>
          <Button
            variant="outline"
            className="border-primary/50 hover:bg-primary/10 text-foreground whitespace-nowrap"
            onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}
          >
            {t('about.viewPortfolio')}
          </Button>
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

        {/* Horizontal Scrolling Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-secondary to-accent transform -translate-y-1/2 z-0" />
          
          {/* Scrollable container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-8 pt-4 scroll-smooth hide-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {experiences.map((exp, index) => {
              const isEducation = exp.type === "education";
              const Icon = isEducation ? GraduationCap : Briefcase;
              const accentColor = isEducation ? "secondary" : "primary";
              
              return (
                <div
                  key={index}
                  className={`
                    flex-shrink-0 w-[340px] relative
                    transition-all duration-700
                    ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                  `}
                  style={{
                    transitionDelay: `${index * 100}ms`,
                  }}
                >
                  {/* Timeline dot */}
                  <div 
                    className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 w-4 h-4 rounded-full border-4 border-background z-10 ${isEducation ? 'bg-secondary' : 'bg-primary'}`}
                    style={{
                      boxShadow: `0 0 10px ${isEducation ? 'hsl(var(--secondary))' : 'hsl(var(--primary))'}`,
                    }}
                  />
                  
                  {/* Card */}
                  <div 
                    className={`
                      bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border/50 
                      hover:border-${accentColor}/50 transition-all duration-300 hover:scale-[1.02]
                      mt-6 h-[280px] flex flex-col
                    `}
                  >
                    {/* Icon */}
                    <div 
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isEducation ? 'bg-secondary/20' : 'bg-primary/20'}`}
                    >
                      <Icon className={`w-6 h-6 ${isEducation ? 'text-secondary' : 'text-primary'}`} />
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar className="w-3 h-3" />
                      <span>{isEducation ? t(exp.periodKey!) : exp.period}</span>
                    </div>

                    {/* Title */}
                    <h4 className={`text-lg font-semibold mb-1 ${isEducation ? 'text-secondary' : 'text-primary'}`}>
                      {isEducation ? t(exp.degreeKey!) : t(exp.roleKey!)}
                    </h4>
                    
                    {/* Company/Institution */}
                    <p className="text-sm text-foreground mb-2">
                      {isEducation ? t(exp.institutionKey!) : exp.company}
                    </p>

                    {/* Location */}
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                      <MapPin className="w-3 h-3" />
                      <span>{exp.location}</span>
                    </div>

                    {/* Description (work only) */}
                    {!isEducation && exp.descriptionKeys && (
                      <p className="text-sm text-muted-foreground line-clamp-2 flex-grow">
                        {t(exp.descriptionKeys[0])}
                      </p>
                    )}

                    {/* View Link */}
                    <Button
                      variant="link"
                      size="sm"
                      className={`p-0 h-auto mt-auto ${isEducation ? 'text-secondary' : 'text-primary'}`}
                      asChild
                    >
                      <a href={exp.link} target="_blank" rel="noopener noreferrer">
                        Click to expand
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Languages at Bottom */}
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-6 justify-center lg:justify-start">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
              <Languages className="w-5 h-5 text-background" />
            </div>
            <h3 className="text-xl font-bold">{t('about.languages')}</h3>
          </div>

          <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <div className="bg-card/30 rounded-xl px-6 py-4 border border-border/30 flex items-center gap-4 hover:border-accent/30 transition-all duration-300 hover:scale-[1.02] group">
              <span className="text-2xl group-hover:scale-110 transition-transform">🇮🇹</span>
              <div>
                <h4 className="font-semibold">{languageNames.italian}</h4>
                <p className="text-sm text-muted-foreground">{t('about.nativeLevel')}</p>
              </div>
            </div>
            <div className="bg-card/30 rounded-xl px-6 py-4 border border-border/30 flex items-center gap-4 hover:border-accent/30 transition-all duration-300 hover:scale-[1.02] group">
              <span className="text-2xl group-hover:scale-110 transition-transform">🇬🇧</span>
              <div>
                <h4 className="font-semibold">{languageNames.english}</h4>
                <p className="text-sm text-muted-foreground">{t('about.languagesText')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;