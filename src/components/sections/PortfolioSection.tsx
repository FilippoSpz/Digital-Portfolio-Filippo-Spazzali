import { Briefcase, ArrowUpRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import SectionHeader from '@/components/common/SectionHeader';
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
      <div className="container mx-auto px-4 md:px-8 lg:pl-40">
        <SectionHeader
          icon={Briefcase}
          badge={t('nav.portfolio')}
          title={t('portfolio.title')}
          subtitle={t('portfolio.subtitle')}
          accent="secondary"
          className="mb-16"
        />

        <div className="space-y-8 max-w-5xl mx-auto lg:mx-0">
          {projects.map((project) => {
            const technologies = project.techKey ? t(project.techKey).split(', ') : project.technologies ?? [];

            return (
              <div
                key={project.titleKey}
                className="group relative bg-card/30 rounded-2xl border border-border/30 overflow-hidden hover:border-secondary/30 transition-all duration-500"
              >
                <div className="grid md:grid-cols-3 gap-0">
                  <div className="relative md:col-span-1 aspect-square md:aspect-auto overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-20`} />
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                      <img
                        src={project.image}
                        alt={t(project.titleKey)}
                        loading="lazy"
                        className={`w-full h-full object-contain max-w-[200px] max-h-[200px] ${project.rounded ? 'rounded-2xl' : ''} ${
                          project.whiteBg ? 'bg-white p-2' : ''
                        }`}
                      />
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-background/80 backdrop-blur-sm rounded-full text-xs font-semibold">{project.year}</span>
                    </div>
                  </div>

                  <div className="md:col-span-2 p-6 md:p-8 flex flex-col justify-between">
                    <div>
                      <span className={`inline-block px-3 py-1 bg-gradient-to-r ${project.gradient} text-background rounded-full text-xs font-semibold mb-4`}>
                        {t(project.categoryKey)}
                      </span>
                      <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{t(project.titleKey)}</h3>
                      <p className="text-muted-foreground mb-6 line-clamp-3">{t(project.descriptionKey)}</p>

                      <div className="mb-6">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{t('portfolio.technologiesUsed')}</h4>
                        <div className="flex flex-wrap gap-2">
                          {technologies.map((tech) => (
                            <span key={tech} className="px-3 py-1 bg-muted/50 rounded-lg text-xs font-medium">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      {project.link ? (
                        <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 group/btn" asChild>
                          <a href={project.link} target="_blank" rel="noopener noreferrer">
                            {t('portfolio.viewProject')}
                            <ArrowUpRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                          </a>
                        </Button>
                      ) : (
                        project.statusKey && (
                          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/40 border border-border/50 text-sm text-muted-foreground">
                            <Lock className="h-4 w-4" />
                            {t(project.statusKey)}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 max-w-5xl mx-auto lg:mx-0">
          <div className="bg-card/20 rounded-2xl border border-dashed border-border/50 p-8 text-center">
            <h3 className="text-xl font-bold gradient-text mb-2">{t('portfolio.moreComingSoon')}</h3>
            <p className="text-muted-foreground text-sm">{t('portfolio.moreComingSoonDesc')}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
