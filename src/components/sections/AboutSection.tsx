import { useEffect, useRef, useState } from 'react';
import { Briefcase, GraduationCap, Languages, MapPin, Calendar, User, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { experiences } from '@/data/experiences';

interface AboutSectionProps {
  isActive: boolean;
}

const AboutSection = ({ isActive }: AboutSectionProps) => {
  const { t, language } = useLanguage();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showLeftShadow, setShowLeftShadow] = useState(false);

  // Reveal cards once the section becomes active.
  useEffect(() => {
    if (!isActive) return;
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [isActive]);

  // Show the left fade only once the timeline is scrolled (lightweight, container-scoped).
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handleScroll = () => setShowLeftShadow(container.scrollLeft > 50);
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const languageNames = {
    italian: language === 'en' ? 'Italian' : 'Italiano',
    english: language === 'en' ? 'English' : 'Inglese',
  };

  return (
    <section
      id="about"
      className={`min-h-screen py-24 relative overflow-hidden transition-opacity duration-700 ${isActive ? 'opacity-100' : 'opacity-50'}`}
    >
      {/* Header */}
      <div className="container mx-auto px-4 md:px-8 lg:pl-40 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-center lg:text-left">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/30 mb-4">
              <User className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium text-secondary">{t('nav.about')}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold italic uppercase tracking-wide">
              {t('about.workExperience')} & {t('about.education')}
            </h2>
          </div>
          <Button
            variant="outline"
            className="border-primary/50 hover:bg-primary/10 text-foreground whitespace-nowrap"
            onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}
          >
            {t('about.viewPortfolio')}
          </Button>
        </div>

        {/* Professional summary */}
        <div className="mt-8 max-w-4xl mx-auto lg:mx-0">
          <div className="relative overflow-hidden rounded-2xl bg-card/50 border border-border/50 p-8 md:p-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-secondary/20 to-transparent rounded-full blur-3xl" />
            <h3 className="text-2xl font-bold gradient-text mb-4">{t('about.professionalSummary')}</h3>
            <p className="text-lg text-muted-foreground leading-relaxed relative z-10">{t('about.professionalSummaryText')}</p>
          </div>
        </div>
      </div>

      {/* Horizontal timeline */}
      <div className="relative w-full">
        <div
          className={`hidden lg:block absolute left-0 top-0 h-full z-20 pointer-events-none transition-opacity duration-500 ${
            showLeftShadow ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            width: '350px',
            background: 'radial-gradient(ellipse 100% 100% at 0% 50%, hsl(var(--background)) 0%, hsl(var(--background) / 0.9) 40%, transparent 100%)',
          }}
        />

        {/* Timeline line */}
        <div className="absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent z-0" />

        <p className="lg:hidden text-center text-xs text-muted-foreground mb-2">{t('about.careerJourney')}</p>

        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-8 pt-20 hide-scrollbar w-full relative z-10"
          style={{ paddingLeft: '24px', paddingRight: '24px' }}
        >
          {experiences.map((exp, index) => {
            const isEducation = exp.type === 'education';
            const Icon = isEducation ? GraduationCap : Briefcase;
            const typeLabel = isEducation ? t('about.type.education') : t('about.type.work');

            return (
              <div
                key={index}
                className={`flex-shrink-0 relative transition-all duration-700 ease-out ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'
                } ${index === 0 ? 'lg:ml-[350px]' : ''}`}
                style={{ transitionDelay: `${index * 80}ms`, width: isEducation ? '300px' : '360px' }}
              >
                <div
                  className={`absolute -top-[52px] left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider z-10 ${
                    isEducation ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'
                  }`}
                >
                  {typeLabel}
                </div>

                <div
                  className={`absolute -top-8 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-background z-10 ${
                    isEducation ? 'bg-secondary' : 'bg-primary'
                  }`}
                  style={{ boxShadow: `0 0 15px ${isEducation ? 'hsl(var(--secondary))' : 'hsl(var(--primary))'}` }}
                />

                <div
                  className={`bg-card/50 backdrop-blur-sm rounded-xl p-5 border border-border/50 transition-all duration-300 hover:scale-[1.02] relative ${
                    isEducation ? 'hover:border-secondary/50' : 'hover:border-primary/50'
                  }`}
                >
                  {exp.link && (
                    <a
                      href={exp.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t('about.viewInstitute')}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                        isEducation ? 'bg-secondary/20 hover:bg-secondary/30 text-secondary' : 'bg-primary/20 hover:bg-primary/30 text-primary'
                      }`}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${isEducation ? 'bg-secondary/20' : 'bg-primary/20'}`}>
                    <Icon className={`w-5 h-5 ${isEducation ? 'text-secondary' : 'text-primary'}`} />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Calendar className="w-3 h-3" />
                    <span>{exp.type === 'education' ? t(exp.periodKey) : exp.period}</span>
                  </div>

                  <h4 className={`text-base font-semibold mb-1 ${isEducation ? 'text-secondary' : 'text-primary'}`}>
                    {exp.type === 'education' ? t(exp.degreeKey) : t(exp.roleKey)}
                  </h4>

                  <p className="text-sm text-foreground mb-2 pr-8">
                    {exp.type === 'education' ? t(exp.institutionKey) : exp.company}
                  </p>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                    <MapPin className="w-3 h-3" />
                    <span>{exp.location}</span>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    {exp.descriptionKeys.map((key) => (
                      <p key={key}>{t(key)}</p>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Languages */}
      <div className="container mx-auto px-4 md:px-8 lg:pl-40 mt-12">
        <div className="flex items-center gap-3 mb-6 justify-center lg:justify-start">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
            <Languages className="w-5 h-5 text-background" />
          </div>
          <h3 className="text-xl font-bold">{t('about.languages')}</h3>
        </div>

        <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
          <div className="bg-card/30 rounded-xl px-8 py-6 border border-border/30 flex items-center gap-5 hover:border-accent/30 transition-all duration-300 hover:scale-[1.02] group min-w-[240px]">
            <span className="text-4xl group-hover:scale-110 transition-transform">🇮🇹</span>
            <div>
              <h4 className="font-semibold text-lg">{languageNames.italian}</h4>
              <p className="text-sm text-muted-foreground">{t('about.nativeLevel')}</p>
            </div>
          </div>
          <div className="bg-card/30 rounded-xl px-8 py-6 border border-border/30 flex items-center gap-5 hover:border-accent/30 transition-all duration-300 hover:scale-[1.02] group min-w-[240px]">
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
