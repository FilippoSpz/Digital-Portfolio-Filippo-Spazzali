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
  /** Whether the planet has a Saturn-like ring. */
  ring?: boolean;
}

export const navItems: NavItem[] = [
  { id: 'home', icon: Home, labelKey: 'nav.home', color: '#a78bfa', size: 32, orbitRadius: 44, speed: 1 },
  { id: 'about', icon: User, labelKey: 'nav.about', color: '#38bdf8', size: 28, orbitRadius: 66, speed: 0.82 },
  { id: 'skills', icon: Code2, labelKey: 'nav.skills', color: '#34d399', size: 26, orbitRadius: 88, speed: 0.68 },
  { id: 'certifications', icon: Award, labelKey: 'nav.certifications', color: '#fbbf24', size: 24, orbitRadius: 110, speed: 0.58, ring: true },
  { id: 'portfolio', icon: Briefcase, labelKey: 'nav.portfolio', color: '#f472b6', size: 23, orbitRadius: 132, speed: 0.5 },
  { id: 'projects', icon: Github, labelKey: 'nav.projects', color: '#fb7185', size: 22, orbitRadius: 154, speed: 0.43 },
  { id: 'contact', icon: Mail, labelKey: 'nav.contact', color: '#22d3ee', size: 22, orbitRadius: 176, speed: 0.36, ring: true },
];

export const RESUME_URL = '/certificates/Filippo_Spazzali_Resume.pdf';
