import { memo } from 'react';
import { Briefcase, GraduationCap, MapPin, Calendar, Rocket, ExternalLink, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { experiences } from '@/data/experiences';
import SectionHeader from '@/components/common/SectionHeader';
import Reveal from '@/components/common/Reveal';
import { scrollToSection } from '@/lib/motion';

interface ExperienceSectionProps {
  isActive: boolean;
}

/** Work and education as a constellation timeline: one star per step, alternating sides on wide screens. */
const ExperienceSection = ({ isActive }: ExperienceSectionProps) => {
  const { t } = useLanguage();

  return (
    <section
      id="experience"
      data-planet="experience"
      className={`min-h-screen py-24 relative overflow-hidden transition-opacity duration-700 ${isActive ? 'opacity-100' : 'opacity-50'}`}
    >
      <div className="container mx-auto px-4 md:px-8 lg:pl-[25rem]">
        <SectionHeader
          icon={Rocket}
          badge={t('nav.experience')}
          title={t('experience.title')}
          subtitle={t('experience.subtitle')}
          index="03"
          className="mb-16"
        />

        {/* Constellation timeline */}
        <div className="relative max-w-4xl mx-auto lg:mx-0">
          {/* Spine */}
          <div className="absolute top-0 bottom-0 left-5 md:left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-primary/50 to-transparent" />

          <div className="space-y-10 md:space-y-14">
            {experiences.map((exp, index) => {
              const isEducation = exp.type === 'education';
              const Icon = isEducation ? GraduationCap : Briefcase;
              const typeLabel = isEducation ? t('about.type.education') : t('about.type.work');
              const side = index % 2 === 0 ? 'left' : 'right';
              const enter = side === 'left' ? 'right' : 'left';

              return (
                <div key={index} className="relative pl-16 md:pl-0 md:grid md:grid-cols-2 md:gap-10">
                  {/* Node: solid star, work in the primary tone, education in the secondary one */}
                  <div
                    className={`absolute left-5 md:left-1/2 -translate-x-1/2 top-1.5 z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 border-background ring-1 ${
                      isEducation ? 'bg-secondary ring-secondary/60' : 'bg-primary ring-primary/60'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-background" />
                  </div>

                  <Reveal
                    variant={enter}
                    delay={40}
                    className={side === 'left' ? 'md:col-start-1 md:pr-12' : 'md:col-start-2 md:pl-12'}
                  >
                    <div
                      className={`relative glass rounded-2xl p-6 transition-colors duration-300 ${
                        isEducation ? 'hover:border-secondary/60' : 'hover:border-primary/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            isEducation ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'
                          }`}
                        >
                          {typeLabel}
                        </span>
                        {exp.link && (
                          <a
                            href={exp.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={t('about.viewInstitute')}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                              isEducation
                                ? 'bg-secondary/15 text-secondary hover:bg-secondary hover:text-secondary-foreground'
                                : 'bg-primary/15 text-primary hover:bg-primary hover:text-primary-foreground'
                            }`}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <Calendar className="w-3 h-3" />
                        <span>{exp.type === 'education' ? t(exp.periodKey) : exp.period}</span>
                      </div>

                      <h4 className={`font-display text-lg font-semibold mb-1 ${isEducation ? 'text-secondary' : 'text-primary'}`}>
                        {exp.type === 'education' ? t(exp.degreeKey) : t(exp.roleKey)}
                      </h4>
                      <p className="text-sm text-foreground mb-2">{exp.type === 'education' ? t(exp.institutionKey) : exp.company}</p>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                        <MapPin className="w-3 h-3" />
                        <span>{exp.location}</span>
                      </div>

                      <div className="text-sm text-muted-foreground space-y-1.5">
                        {exp.descriptionKeys.map((key) => (
                          <p key={key}>{t(key)}</p>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                </div>
              );
            })}
          </div>
        </div>

        <Reveal variant="up" delay={120} className="mt-14 flex justify-center lg:justify-start">
          <Button variant="outline" className="whitespace-nowrap" onClick={() => scrollToSection('portfolio')}>
            {t('about.viewPortfolio')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Reveal>
      </div>
    </section>
  );
};

export default memo(ExperienceSection);
