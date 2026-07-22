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
  /** Whether the planet has a Saturn-like ring. */
  ring?: boolean;
  /** Constellation node position on the desktop nav, as a percentage of the column. */
  x: number;
  y: number;
}

export const navItems: NavItem[] = [
  { id: 'home', icon: Home, labelKey: 'nav.home', color: '#a78bfa', size: 64, x: 33, y: 9 },
  { id: 'about', icon: User, labelKey: 'nav.about', color: '#38bdf8', size: 52, x: 50, y: 22 },
  { id: 'skills', icon: Code2, labelKey: 'nav.skills', color: '#34d399', size: 48, x: 29, y: 35 },
  { id: 'certifications', icon: Award, labelKey: 'nav.certifications', color: '#fbbf24', size: 50, ring: true, x: 47, y: 48 },
  { id: 'portfolio', icon: Briefcase, labelKey: 'nav.portfolio', color: '#f472b6', size: 52, x: 30, y: 61 },
  { id: 'projects', icon: Github, labelKey: 'nav.projects', color: '#fb7185', size: 48, x: 48, y: 74 },
  { id: 'contact', icon: Mail, labelKey: 'nav.contact', color: '#22d3ee', size: 50, ring: true, x: 33, y: 86 },
];

export const RESUME_URL = '/certificates/Filippo_Spazzali_Resume.pdf';
