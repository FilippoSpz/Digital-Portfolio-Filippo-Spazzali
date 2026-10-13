import { Globe, Terminal, Braces, Database, type LucideIcon } from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations/en';

export const GITHUB_PROFILE = 'https://github.com/FilippoSpz';

export interface RepoLink {
  name: string;
  url: string;
}

export interface ProjectGroup {
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  icon: LucideIcon;
  /**
   * Full Tailwind gradient classes (kept verbatim for the JIT). They use the section's colour tokens,
   * so in Projects they are Saturn's: pale gold rings (primary), sand (secondary), cream (accent).
   */
  gradient: string;
  tags: string[];
  repos: RepoLink[];
}

export const projectGroups: ProjectGroup[] = [
  {
    titleKey: 'projects.web.title',
    descriptionKey: 'projects.web.description',
    icon: Globe,
    gradient: 'from-primary to-secondary',
    tags: ['HTML', 'CSS', 'JavaScript', 'TypeScript'],
    repos: [
      { name: 'EcoScoot', url: 'https://github.com/FilippoSpz/EcoScootProject' },
      { name: 'ReFueler', url: 'https://github.com/FilippoSpz/ReFueler' },
    ],
  },
  {
    titleKey: 'projects.os.title',
    descriptionKey: 'projects.os.description',
    icon: Terminal,
    gradient: 'from-accent to-primary',
    tags: ['C', 'Bash', 'Linux'],
    repos: [
      { name: 'Lab 1', url: 'https://github.com/FilippoSpz/SO-Lab1' },
      { name: 'Lab 2', url: 'https://github.com/FilippoSpz/SO-Lab2' },
      { name: 'Lab 3', url: 'https://github.com/FilippoSpz/SO-Lab3' },
      { name: 'Lab 4', url: 'https://github.com/FilippoSpz/SO-Lab4' },
      { name: 'Lab 5', url: 'https://github.com/FilippoSpz/SO-Lab5' },
    ],
  },
  {
    titleKey: 'projects.pa.title',
    descriptionKey: 'projects.pa.description',
    icon: Braces,
    gradient: 'from-secondary to-primary',
    tags: ['Java', 'Sockets', 'Data Structures', 'Algorithms'],
    repos: [
      { name: 'WordCounterServer', url: 'https://github.com/FilippoSpz/PA-WordCounterServer' },
      { name: 'FileArray', url: 'https://github.com/FilippoSpz/PA-FileArray' },
      { name: 'Anagrams', url: 'https://github.com/FilippoSpz/PA-Anagrams' },
      { name: 'Equivalence', url: 'https://github.com/FilippoSpz/PA-Equivalence' },
    ],
  },
  {
    titleKey: 'projects.db.title',
    descriptionKey: 'projects.db.description',
    icon: Database,
    gradient: 'from-primary to-accent',
    tags: ['MySQL', 'SQL', 'LaTeX'],
    repos: [{ name: 'Progetto Basi di Dati', url: 'https://github.com/FilippoSpz/Progetto-Basi-di-Dati' }],
  },
];
