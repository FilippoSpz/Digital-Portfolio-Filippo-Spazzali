import { Briefcase, GraduationCap, Languages, MapPin, Calendar, User, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { experiences } from '@/data/experiences';
import Reveal from '@/components/common/Reveal';
import Parallax from '@/components/common/Parallax';

interface AboutSectionProps {
  isActive: boolean;
}

const AboutSection = ({ isActive }: AboutSectionProps) => {
  const { t, language } = useLanguage();

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
      <div className="relative container mx-auto px-4 md:px-8 lg:pl-[25rem] mb-14">
        <Parallax speed={0.3} className="pointer-events-none absolute -top-20 right-0 lg:-right-10 -z-10 select-none">
          <span className="font-display font-bold text-[26vw] lg:text-[13rem] leading-none tracking-tighter text-foreground/[0.05]">01</span>
        </Parallax>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-center lg:text-left">
          <Reveal variant="up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <User className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium tracking-wide text-secondary">{t('nav.about')}</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold italic uppercase tracking-tight text-glow">
              {t('about.workExperience')} & {t('about.education')}
            </h2>
          </Reveal>
          <Reveal variant="up" delay={120}>
            <Button
              variant="outline"
              className="glass border-primary/40 hover:border-primary/70 hover:bg-primary/10 text-foreground whitespace-nowrap"
              onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t('about.viewPortfolio')}
            </Button>
          </Reveal>
        </div>

        {/* Professional summary */}
        <Reveal variant="blur" delay={100} className="mt-8 max-w-4xl mx-auto lg:mx-0">
          <div className="relative overflow-hidden rounded-2xl glass border-gradient p-8 md:p-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-secondary/20 to-transparent rounded-full blur-3xl" />
            <h3 className="font-display text-2xl font-bold gradient-text mb-4">{t('about.professionalSummary')}</h3>
            <p className="text-lg text-muted-foreground leading-relaxed relative z-10">{t('about.professionalSummaryText')}</p>
          </div>
        </Reveal>
      </div>

      {/* Constellation timeline */}
      <div className="container mx-auto px-4 md:px-8 lg:pl-[25rem]">
        <p className="lg:hidden text-center text-xs text-muted-foreground mb-8 tracking-widest uppercase">{t('about.careerJourney')}</p>

        <div className="relative max-w-4xl mx-auto lg:mx-0">
          {/* Spine */}
          <div className="absolute top-0 bottom-0 left-5 md:left-1/2 w-0.5 -translate-x-1/2 bg-gradient-to-b from-transparent via-primary/40 to-transparent" />

          <div className="space-y-10 md:space-y-14">
            {experiences.map((exp, index) => {
              const isEducation = exp.type === 'education';
              const Icon = isEducation ? GraduationCap : Briefcase;
              const typeLabel = isEducation ? t('about.type.education') : t('about.type.work');
              const side = index % 2 === 0 ? 'left' : 'right';
              const enter = side === 'left' ? 'right' : 'left';
              const accent = isEducation ? 'secondary' : 'primary';

              return (
                <div key={index} className="relative pl-16 md:pl-0 md:grid md:grid-cols-2 md:gap-10">
                  {/* Node */}
                  <div
                    className={`absolute left-5 md:left-1/2 -translate-x-1/2 top-1.5 z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 border-background ${
                      isEducation ? 'bg-secondary' : 'bg-primary'
                    }`}
                    style={{ boxShadow: `0 0 18px hsl(var(--${accent}) / 0.8)` }}
                  >
                    <Icon className="w-4 h-4 text-background" />
                  </div>

                  <Reveal
                    variant={enter}
                    delay={40}
                    className={side === 'left' ? 'md:col-start-1 md:pr-12' : 'md:col-start-2 md:pl-12'}
                  >
                    <div
                      className={`relative glass rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 ${
                        isEducation ? 'hover:border-secondary/50' : 'hover:border-primary/50'
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
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                              isEducation ? 'bg-secondary/15 hover:bg-secondary/30 text-secondary' : 'bg-primary/15 hover:bg-primary/30 text-primary'
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
      </div>

      {/* Languages */}
      <div className="container mx-auto px-4 md:px-8 lg:pl-[25rem] mt-16">
        <Reveal variant="up">
          <div className="flex items-center gap-3 mb-6 justify-center lg:justify-start">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
              <Languages className="w-5 h-5 text-background" />
            </div>
            <h3 className="font-display text-xl font-bold">{t('about.languages')}</h3>
          </div>
        </Reveal>

        <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
          {[
            { flag: '🇮🇹', name: languageNames.italian, level: t('about.nativeLevel') },
            { flag: '🇬🇧', name: languageNames.english, level: t('about.languagesText') },
          ].map((lang, i) => (
            <Reveal key={lang.name} variant="up" delay={i * 100}>
              <div className="glass rounded-xl px-8 py-6 flex items-center gap-5 hover:border-accent/40 transition-all duration-300 hover:scale-[1.02] group min-w-[240px]">
                <span className="text-4xl group-hover:scale-110 transition-transform">{lang.flag}</span>
                <div>
                  <h4 className="font-semibold text-lg">{lang.name}</h4>
                  <p className="text-sm text-muted-foreground">{lang.level}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
