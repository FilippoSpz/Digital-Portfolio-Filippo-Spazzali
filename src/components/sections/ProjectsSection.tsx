import { Github, ExternalLink, GitBranch, ArrowUpRight } from 'lucide-react';
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
      <div className="container mx-auto px-4 md:px-8 lg:pl-[25rem]">
        <SectionHeader
          icon={Github}
          badge={t('nav.projects')}
          title={t('projects.title')}
          subtitle={t('projects.subtitle')}
          accent="accent"
          index="05"
          className="mb-16"
        />

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto lg:mx-0">
          {projectGroups.map((group, gi) => {
            const GroupIcon = group.icon;
            return (
              <Reveal key={group.titleKey} variant="up" delay={gi * 80}>
                <div className="group relative flex flex-col h-full glass border-gradient rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${group.gradient} flex items-center justify-center shadow-lg`}>
                        <GroupIcon className="w-6 h-6 text-background" />
                      </div>
                      <h3 className="font-display text-xl font-bold leading-tight">{t(group.titleKey)}</h3>
                    </div>
                    <span className="shrink-0 glass-soft rounded-full px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                      {group.repos.length} {group.repos.length === 1 ? 'repo' : 'repos'}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{t(group.descriptionKey)}</p>

                  {/* Repo list */}
                  <div className="space-y-2 mb-5">
                    {group.repos.map((repo) => (
                      <a
                        key={repo.url}
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/repo flex items-center gap-3 rounded-lg bg-background/50 border border-border/50 px-3 py-2 transition-all hover:border-primary/50 hover:bg-primary/10"
                      >
                        <GitBranch className="w-4 h-4 text-muted-foreground group-hover/repo:text-primary transition-colors" />
                        <span className="text-sm font-medium flex-1 truncate">{repo.name}</span>
                        <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-1 group-hover/repo:opacity-100 group-hover/repo:translate-x-0 transition-all" />
                      </a>
                    ))}
                  </div>

                  {/* Tags */}
                  <div className="mt-auto flex flex-wrap gap-2">
                    {group.tags.map((tag) => (
                      <span key={tag} className="glass-soft rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal variant="up" delay={120} className="mt-10 flex justify-center lg:justify-start">
          <Button variant="outline" className="glass border-primary/40 hover:border-primary/70 hover:bg-primary/10 text-foreground" asChild>
            <a href={GITHUB_PROFILE} target="_blank" rel="noopener noreferrer">
              <Github className="mr-2 h-4 w-4" />
              {t('projects.viewAll')}
              <ExternalLink className="ml-2 h-3.5 w-3.5" />
            </a>
          </Button>
        </Reveal>
      </div>
    </section>
  );
};

export default ProjectsSection;
