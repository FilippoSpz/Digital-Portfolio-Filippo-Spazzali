import { Github, ExternalLink, FolderGit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import SectionHeader from '@/components/common/SectionHeader';
import Reveal from '@/components/common/Reveal';
import { projectGroups, GITHUB_PROFILE } from '@/data/openSourceProjects';

interface ProjectsSectionProps {
  isActive: boolean;
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

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

        <Reveal variant="up" className="max-w-4xl mx-auto lg:mx-0">
          <div className="glass border-gradient rounded-2xl overflow-hidden font-mono text-sm shadow-2xl">
            {/* Title bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60 bg-background/40">
              <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <span className="w-3 h-3 rounded-full bg-[#28c840]" />
              <span className="ml-3 text-xs text-muted-foreground">filippo@portfolio: ~/projects</span>
            </div>

            {/* Log */}
            <div className="p-5 md:p-7 space-y-7">
              {projectGroups.map((group, gi) => {
                const GroupIcon = group.icon;
                return (
                  <Reveal key={group.titleKey} variant="up" delay={gi * 70}>
                    <div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-secondary">➜</span>
                        <span className="text-primary">~/projects</span>
                        <span className="text-muted-foreground">ls</span>
                        <span className="text-accent inline-flex items-center gap-1.5">
                          <GroupIcon className="w-4 h-4" />
                          {slug(t(group.titleKey))}/
                        </span>
                      </div>

                      <p className="mt-1.5 text-muted-foreground/70"># {t(group.descriptionKey)}</p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {group.repos.map((repo) => (
                          <a
                            key={repo.url}
                            href={repo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background/60 border border-border/60 text-foreground/90 hover:border-primary/60 hover:bg-primary/10 hover:text-primary transition-colors"
                          >
                            <FolderGit2 className="w-3.5 h-3.5" />
                            {repo.name}
                          </a>
                        ))}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground/70">
                        {group.tags.map((tag) => (
                          <span key={tag}>#{tag.toLowerCase().replace(/\s+/g, '')}</span>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                );
              })}

              {/* Prompt caret */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-secondary">➜</span>
                <span className="text-primary">~/projects</span>
                <span className="inline-block w-2 h-4 bg-foreground/80 animate-blink" />
              </div>
            </div>
          </div>
        </Reveal>

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
