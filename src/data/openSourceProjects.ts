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
  /** Full Tailwind gradient classes (kept verbatim for the JIT). */
  gradient: string;
  tags: string[];
  repos: RepoLink[];
}

export const projectGroups: ProjectGroup[] = [
  {
    titleKey: 'projects.web.title',
    descriptionKey: 'projects.web.description',
    icon: Globe,
    gradient: 'from-cyan-500 to-blue-600',
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
    gradient: 'from-emerald-500 to-green-600',
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
    gradient: 'from-violet-500 to-purple-600',
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
    gradient: 'from-orange-500 to-amber-600',
    tags: ['MySQL', 'SQL', 'LaTeX'],
    repos: [{ name: 'Progetto Basi di Dati', url: 'https://github.com/FilippoSpz/Progetto-Basi-di-Dati' }],
  },
];
