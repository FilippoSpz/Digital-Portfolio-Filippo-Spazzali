import { Home, User, Code2, Award, Briefcase, Github, Mail, type LucideIcon } from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations/en';

export const SECTION_IDS = ['home', 'about', 'skills', 'certifications', 'portfolio', 'projects', 'contact'] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export interface NavItem {
  id: SectionId;
  icon: LucideIcon;
  labelKey: TranslationKey;
  /** Planet accent color (hex). */
  color: string;
  /** Planet diameter in px. */
  size: number;
  /** Orbit radius in px. */
  orbitRadius: number;
  /** Relative angular speed. */
  speed: number;
}

export const navItems: NavItem[] = [
  { id: 'home', icon: Home, labelKey: 'nav.home', color: '#bd93f9', size: 28, orbitRadius: 46, speed: 1 },
  { id: 'about', icon: User, labelKey: 'nav.about', color: '#8be9fd', size: 26, orbitRadius: 65, speed: 0.85 },
  { id: 'skills', icon: Code2, labelKey: 'nav.skills', color: '#50fa7b', size: 24, orbitRadius: 84, speed: 0.7 },
  { id: 'certifications', icon: Award, labelKey: 'nav.certifications', color: '#ffb86c', size: 22, orbitRadius: 103, speed: 0.6 },
  { id: 'portfolio', icon: Briefcase, labelKey: 'nav.portfolio', color: '#ff79c6', size: 20, orbitRadius: 122, speed: 0.5 },
  { id: 'projects', icon: Github, labelKey: 'nav.projects', color: '#ff5555', size: 19, orbitRadius: 141, speed: 0.42 },
  { id: 'contact', icon: Mail, labelKey: 'nav.contact', color: '#f1fa8c', size: 18, orbitRadius: 160, speed: 0.35 },
];

export const RESUME_URL = '/certificates/Filippo_Spazzali_Resume.pdf';
