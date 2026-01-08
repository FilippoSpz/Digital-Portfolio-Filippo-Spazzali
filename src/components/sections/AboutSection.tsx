import { useRef, useEffect, useState, useMemo } from "react";
import { Briefcase, GraduationCap, Languages, MapPin, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface AboutSectionProps {
  isActive: boolean;
}

// Natural asteroid component with smoother, rock-like shape
const Asteroid = ({ style, size, rotation }: { style: React.CSSProperties; size: number; rotation: number }) => {
  const clipPath = useMemo(() => {
    const points = 10 + Math.floor(Math.random() * 4);
    return Array.from({ length: points }, (_, i) => {
      const angle = (i / points) * 360;
      const variance = 8 + Math.random() * 12;
      const r = 45 + Math.random() * variance;
      const x = 50 + r * Math.cos((angle * Math.PI) / 180);
      const y = 50 + r * Math.sin((angle * Math.PI) / 180);
      return `${x}% ${y}%`;
    }).join(', ');
  }, []);

  return (
    <div
      className="absolute asteroid-float"
      style={{
        ...style,
        width: size,
        height: size,
        borderRadius: '40%',
        clipPath: `polygon(${clipPath})`,
        background: `radial-gradient(ellipse at 35% 35%, #9a8a7a 0%, #6a5a4a 25%, #4a3d32 50%, #2a2018 80%, #1a1410 100%)`,
        boxShadow: `
          inset -${size/5}px -${size/5}px ${size/3}px rgba(0,0,0,0.6),
          inset ${size/10}px ${size/10}px ${size/5}px rgba(180,160,140,0.15)
        `,
        transform: `rotate(${rotation}deg)`,
      }}
    />
  );
};

const AboutSection = ({ isActive }: AboutSectionProps) => {
  const { t, language } = useLanguage();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Trigger animation when section becomes active
  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  // Track scroll position for conditional shadow
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollPosition(container.scrollLeft);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth horizontal scroll on mouse wheel
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let scrollVelocity = 0;
    let animationId: number;

    const smoothScroll = () => {
      if (Math.abs(scrollVelocity) > 0.5) {
        container.scrollLeft += scrollVelocity;
        scrollVelocity *= 0.92;
        animationId = requestAnimationFrame(smoothScroll);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        scrollVelocity += e.deltaY * 0.4;
        cancelAnimationFrame(animationId);
        animationId = requestAnimationFrame(smoothScroll);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Experiences sorted by date (most recent first)
  const experiences = [
    {
      type: "work",
      roleKey: "experience.webDeveloper",
      company: "Colori di Sicilia",
      period: "2025",
      sortDate: 2025.3,
      location: "Trieste, Italy",
      link: "https://coloridisicilia1.odoo.com/",
      descriptionKeys: ["experience.ceramiche.desc1", "experience.ceramiche.desc2"],
    },
    {
      type: "work",
      roleKey: "experience.webDeveloper",
      company: "Artigiani della Pipa",
      period: "2025",
      sortDate: 2025.2,
      location: "Trieste, Italy",
      link: "https://artigianidellapipa.odoo.com/",
      descriptionKeys: ["experience.artigiani.desc1", "experience.artigiani.desc2"],
    },
    {
      type: "work",
      roleKey: "experience.webDeveloper",
      company: "ViaGlut",
      period: "2025",
      sortDate: 2025.1,
      location: "Trieste, Italy",
      link: "https://magento-1168665-4085035.cloudwaysapps.com/italiano/index",
      descriptionKeys: ["experience.viaglut.desc1", "experience.viaglut.desc2"],
    },
    {
      type: "education",
      degreeKey: "education.bachelors",
      institutionKey: "education.university",
      periodKey: "education.expectedGraduation",
      sortDate: 2024,
      location: "Trieste, Italy",
      link: "https://lauree.units.it/it/0320106200800001",
    },
    {
      type: "work",
      roleKey: "experience.webDeveloper",
      company: "CIRCOLO AZIENDALE FINCANTIERI - WÄRTSILÄ ITALIA - APS",
      period: "2022 – 2023",
      sortDate: 2023,
      location: "Trieste, Italy",
      link: "https://www.circolofinwar.it/",
      descriptionKeys: ["experience.circolo.desc1", "experience.circolo.desc2"],
    },
    {
      type: "work",
      roleKey: "experience.intern",
      company: "Wärtsilä Italia (School Work Experience - PCTO)",
      period: "January 2022 – February 2022",
      sortDate: 2022.1,
      location: "Trieste, Italy",
      link: "https://www.wartsila.com/ita",
      descriptionKeys: ["experience.wartsila.desc1", "experience.wartsila.desc2"],
    },
    {
      type: "education",
      degreeKey: "education.highSchool",
      institutionKey: "education.technicalInstitute",
      periodKey: "education.graduated",
      sortDate: 2022,
      location: "Trieste, Italy",
      link: "https://www.voltatrieste.edu.it/",
    },
  ].sort((a, b) => b.sortDate - a.sortDate);

  // Language names based on current language
  const languageNames = {
    italian: language === 'en' ? 'Italian' : 'Italiano',
    english: language === 'en' ? 'English' : 'Inglese',
  };

  // Generate asteroids with pre-computed values - reduced width by 30%
  const asteroids = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
    id: i,
    top: `${5 + Math.random() * 90}%`,
    right: `${Math.random() * 35}%`,
    size: 12 + Math.random() * 28,
    rotation: Math.random() * 360,
    animationDelay: `${Math.random() * 10}s`,
    animationDuration: `${6 + Math.random() * 10}s`,
  })), []);

  // Show left shadow only when scrolled
  const showLeftShadow = scrollPosition > 50;

  return (
    <section
      id="about"
      className={`
        min-h-screen py-24 relative overflow-hidden
        transition-all duration-700
        ${isActive ? "opacity-100" : "opacity-50"}
      `}
    >
      {/* Header Section - contained width, aligned with skills container */}
      <div className="container mx-auto px-4 md:px-8 lg:pl-48 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 max-w-5xl">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/30 mb-4">
              <User className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium text-secondary">{t('nav.about')}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold italic">
              {t('about.workExperience')} & {t('about.education')}
            </h2>
            <p className="text-lg text-muted-foreground mt-2">
              {t('about.careerJourney')}
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

        {/* Professional Summary Card - contained width */}
        <div className="mt-8 max-w-4xl">
          <div className="relative overflow-hidden rounded-2xl bg-card/50 border border-border/50 p-8 md:p-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-secondary/20 to-transparent rounded-full blur-3xl" />
            <h3 className="text-2xl font-bold gradient-text mb-4">{t('about.professionalSummary')}</h3>
            <p className="text-lg text-muted-foreground leading-relaxed relative z-10">
              {t('about.professionalSummaryText')}
            </p>
          </div>
        </div>
      </div>

      {/* Full-width Timeline Container */}
      <div className="relative w-full">
        {/* Left shadow gradient - only visible when scrolled (near menu) */}
        <div 
          className={`hidden lg:block absolute left-0 top-0 h-full z-20 pointer-events-none transition-opacity duration-500 ${showLeftShadow ? 'opacity-100' : 'opacity-0'}`}
          style={{
            width: '400px',
            background: 'linear-gradient(to right, hsl(var(--background)) 0%, hsl(var(--background)) 50%, transparent 100%)',
          }}
        />

        {/* Right shadow with asteroids */}
        <div 
          className="absolute right-0 top-0 h-full z-20 pointer-events-none"
          style={{
            width: '180px',
            background: 'linear-gradient(to left, hsl(var(--background)) 0%, transparent 100%)',
          }}
        />

        {/* Asteroids in carousel area - reduced width by 30% */}
        <div className="absolute right-0 top-0 h-full pointer-events-none z-10 overflow-visible" style={{ width: '42%' }}>
          {asteroids.map((asteroid) => (
            <Asteroid
              key={asteroid.id}
              size={asteroid.size}
              rotation={asteroid.rotation}
              style={{
                top: asteroid.top,
                right: asteroid.right,
                animationDelay: asteroid.animationDelay,
                animationDuration: asteroid.animationDuration,
              }}
            />
          ))}
        </div>

        {/* Timeline line at TOP */}
        <div className="absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent z-0" />
        
        {/* Scrollable container - full width */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-8 pt-20 hide-scrollbar w-full"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            paddingLeft: 'calc(350px)',
            paddingRight: '250px',
          }}
        >
          {experiences.map((exp, index) => {
            const isEducation = exp.type === "education";
            const Icon = isEducation ? GraduationCap : Briefcase;
            const typeLabel = isEducation 
              ? (language === 'en' ? 'Education' : 'Istruzione')
              : (language === 'en' ? 'Work' : 'Lavoro');
            
            return (
              <div
                key={index}
                className={`
                  flex-shrink-0 w-[340px] relative
                  transition-all duration-700 ease-out
                  ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}
                `}
                style={{
                  transitionDelay: `${index * 80}ms`,
                }}
              >
                {/* Pin label above dot */}
                <div 
                  className={`absolute -top-[52px] left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider z-10 ${isEducation ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'}`}
                >
                  {typeLabel}
                </div>

                {/* Timeline dot at TOP */}
                <div 
                  className={`absolute -top-8 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-background z-10 ${isEducation ? 'bg-secondary' : 'bg-primary'}`}
                  style={{
                    boxShadow: `0 0 15px ${isEducation ? 'hsl(var(--secondary))' : 'hsl(var(--primary))'}`,
                  }}
                />
                
                {/* Card - auto height */}
                <a 
                  href={exp.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`
                    block bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border/50 
                    hover:border-${isEducation ? 'secondary' : 'primary'}/50 transition-all duration-300 hover:scale-[1.02]
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
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {t(exp.descriptionKeys[0])}
                    </p>
                  )}
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* Languages at Bottom - contained width, aligned with skills container */}
      <div className="container mx-auto px-4 md:px-8 lg:pl-48 mt-12">
        <div className="flex items-center gap-3 mb-6 justify-center lg:justify-start max-w-5xl">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
            <Languages className="w-5 h-5 text-background" />
          </div>
          <h3 className="text-xl font-bold">{t('about.languages')}</h3>
        </div>

        <div className="flex flex-wrap gap-6 justify-center lg:justify-start max-w-5xl">
          <div className="bg-card/30 rounded-xl px-8 py-6 border border-border/30 flex items-center gap-5 hover:border-accent/30 transition-all duration-300 hover:scale-[1.02] group min-w-[220px]">
            <span className="text-4xl group-hover:scale-110 transition-transform">🇮🇹</span>
            <div>
              <h4 className="font-semibold text-lg">{languageNames.italian}</h4>
              <p className="text-sm text-muted-foreground">{t('about.nativeLevel')}</p>
            </div>
          </div>
          <div className="bg-card/30 rounded-xl px-8 py-6 border border-border/30 flex items-center gap-5 hover:border-accent/30 transition-all duration-300 hover:scale-[1.02] group min-w-[220px]">
            <span className="text-4xl group-hover:scale-110 transition-transform">🇬🇧</span>
            <div>
              <h4 className="font-semibold text-lg">{languageNames.english}</h4>
              <p className="text-sm text-muted-foreground">{t('about.languagesText')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;