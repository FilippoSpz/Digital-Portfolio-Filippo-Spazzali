import { Github, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import SectionHeader from '@/components/common/SectionHeader';
import Reveal from '@/components/common/Reveal';
import { projectGroups, GITHUB_PROFILE } from '@/data/openSourceProjects';

interface ProjectsSectionProps {
  isActive: boolean;
}

const ProjectsSection = ({ isActive }: ProjectsSectionProps) => {
  const { t } = useLanguage();

  return (
    <section
      id="projects"
      className={`min-h-screen py-24 relative transition-opacity duration-700 ${isActive ? 'opacity-100' : 'opacity-50'}`}
    >
      <div className="container mx-auto px-4 md:px-8 lg:pl-40">
        <SectionHeader
          icon={Github}
          badge={t('nav.projects')}
          title={t('projects.title')}
          subtitle={t('projects.subtitle')}
          accent="accent"
          className="mb-16"
        />

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto lg:mx-0">
          {projectGroups.map((group, index) => {
            const Icon = group.icon;
            return (
              <Reveal key={group.titleKey} variant="up" delay={index * 90} className="h-full">
                <div className="group relative flex flex-col h-full glass border-gradient rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1">
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${group.gradient}`} />
                <div className={`absolute inset-0 bg-gradient-to-br ${group.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                <div className="relative p-6 flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${group.gradient} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-background" />
                    </div>
                    <h3 className="text-xl font-bold">{t(group.titleKey)}</h3>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{t(group.descriptionKey)}</p>

                  <div className="flex flex-wrap gap-2 mb-5">
                    {group.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-muted/50 rounded-lg text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto flex flex-wrap gap-2">
                    {group.repos.map((repo) => (
                      <a
                        key={repo.url}
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background/50 border border-border/50 text-xs font-medium hover:border-primary/50 hover:bg-primary/10 transition-all duration-300"
                      >
                        <Github className="w-3.5 h-3.5" />
                        {repo.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center lg:justify-start">
          <Button variant="outline" className="border-primary/50 hover:bg-primary/10 text-foreground" asChild>
            <a href={GITHUB_PROFILE} target="_blank" rel="noopener noreferrer">
              <Github className="mr-2 h-4 w-4" />
              {t('projects.viewAll')}
              <ExternalLink className="ml-2 h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
