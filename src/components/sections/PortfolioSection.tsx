import { Briefcase, ArrowUpRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import SectionHeader from '@/components/common/SectionHeader';
import Reveal from '@/components/common/Reveal';
import Parallax from '@/components/common/Parallax';
import { projects } from '@/data/projects';

interface PortfolioSectionProps {
  isActive: boolean;
}

const PortfolioSection = ({ isActive }: PortfolioSectionProps) => {
  const { t } = useLanguage();

  return (
    <section
      id="portfolio"
      className={`min-h-screen py-24 relative transition-opacity duration-700 ${isActive ? 'opacity-100' : 'opacity-50'}`}
    >
      <div className="container mx-auto px-4 md:px-8 lg:pl-[25rem]">
        <SectionHeader
          icon={Briefcase}
          badge={t('nav.portfolio')}
          title={t('portfolio.title')}
          subtitle={t('portfolio.subtitle')}
          accent="secondary"
          index="04"
          className="mb-16"
        />

        <div className="space-y-20 md:space-y-28 max-w-5xl mx-auto lg:mx-0">
          {projects.map((project, index) => {
            const technologies = project.techKey ? t(project.techKey).split(', ') : project.technologies ?? [];
            const imageLeft = index % 2 === 0;
            const CardIcon = project.icon;

            return (
              <Reveal key={project.titleKey} variant={imageLeft ? 'right' : 'left'} duration={900}>
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
                  {/* Visual */}
                  <div className={imageLeft ? 'md:order-1' : 'md:order-2'}>
                    <Parallax speed={0.1}>
                      <div className="group relative aspect-[4/3] rounded-3xl overflow-hidden glass border-gradient">
                        <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-25`} />
                        <div className="absolute inset-0 flex items-center justify-center p-10">
                          {CardIcon ? (
                            <div className="flex flex-col items-center justify-center gap-5 transition-transform duration-500 group-hover:scale-105">
                              <div
                                className={`flex items-center justify-center w-28 h-28 md:w-32 md:h-32 rounded-[1.75rem] bg-gradient-to-br ${project.gradient} shadow-2xl`}
                              >
                                <CardIcon className="w-14 h-14 md:w-16 md:h-16 text-background" strokeWidth={1.5} />
                              </div>
                              {project.iconLabel && (
                                <span className="font-display text-2xl font-bold tracking-wide text-foreground">
                                  {project.iconLabel}
                                </span>
                              )}
                            </div>
                          ) : (
                            <img
                              src={project.image}
                              alt={t(project.titleKey)}
                              loading="lazy"
                              className={`max-w-[62%] max-h-[62%] object-contain transition-transform duration-500 group-hover:scale-105 ${
                                project.rounded ? 'rounded-2xl' : ''
                              } ${project.whiteBg ? 'bg-white p-3' : ''}`}
                            />
                          )}
                        </div>
                        <div className="absolute top-4 left-4 px-3 py-1 glass rounded-full text-xs font-semibold">{project.year}</div>
                        <div className={`absolute bottom-0 right-0 font-display font-bold text-[7rem] leading-none pr-4 pb-1 text-transparent bg-clip-text bg-gradient-to-br ${project.gradient} opacity-20`}>
                          {String(index + 1).padStart(2, '0')}
                        </div>
                      </div>
                    </Parallax>
                  </div>

                  {/* Content */}
                  <div className={imageLeft ? 'md:order-2' : 'md:order-1'}>
                    <span className={`inline-block px-3 py-1 bg-gradient-to-r ${project.gradient} text-background rounded-full text-xs font-semibold mb-4`}>
                      {t(project.categoryKey)}
                    </span>
                    <h3 className="font-display text-3xl md:text-4xl font-bold mb-4 leading-tight">
                      {t(project.titleKey)
                        .split(' — ')
                        .map((line) => (
                          <span key={line} className="block">
                            {line}
                          </span>
                        ))}
                    </h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">{t(project.descriptionKey)}</p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {technologies.map((tech) => (
                        <span key={tech} className="px-3 py-1 glass rounded-lg text-xs font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>

                    {project.link ? (
                      <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 group/btn" asChild>
                        <a href={project.link} target="_blank" rel="noopener noreferrer">
                          {t('portfolio.viewProject')}
                          <ArrowUpRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                        </a>
                      </Button>
                    ) : (
                      project.statusKey && (
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg glass text-sm text-muted-foreground">
                          <Lock className="h-4 w-4" />
                          {t(project.statusKey)}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal variant="up" className="mt-20 max-w-5xl mx-auto lg:mx-0">
          <div className="glass rounded-2xl border border-dashed border-border/60 p-8 text-center">
            <h3 className="font-display text-xl font-bold gradient-text mb-2">{t('portfolio.moreComingSoon')}</h3>
            <p className="text-muted-foreground text-sm">{t('portfolio.moreComingSoonDesc')}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default PortfolioSection;
