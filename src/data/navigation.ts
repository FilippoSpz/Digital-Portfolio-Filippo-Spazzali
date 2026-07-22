import { Home, User, Code2, Award, Briefcase, Github, Mail, type LucideIcon } from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations/en';
import type { PlanetVariant } from '@/components/layout/Planet';

export const SECTION_IDS = ['home', 'about', 'skills', 'certifications', 'portfolio', 'projects', 'contact'] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export interface NavItem {
  id: SectionId;
  icon: LucideIcon;
  labelKey: TranslationKey;
  /** Planet accent color (hex) — drives the atmosphere glow, label + active halo. */
  color: string;
  /** Planet diameter in px. */
  size: number;
  /** Which solar-system body models this node (omitted for the home/avatar node). */
  planet?: PlanetVariant;
  /** Constellation node position on the desktop nav, as a percentage of the column. */
  x: number;
  y: number;
}

export const navItems: NavItem[] = [
  { id: 'home', icon: Home, labelKey: 'nav.home', color: '#a78bfa', size: 64, x: 33, y: 9 },
  { id: 'about', icon: User, labelKey: 'nav.about', color: '#38bdf8', size: 52, planet: 'earth', x: 50, y: 22 },
  { id: 'skills', icon: Code2, labelKey: 'nav.skills', color: '#e0a15a', size: 48, planet: 'jupiter', x: 29, y: 35 },
  { id: 'certifications', icon: Award, labelKey: 'nav.certifications', color: '#e8cf90', size: 50, planet: 'saturn', x: 47, y: 48 },
  { id: 'portfolio', icon: Briefcase, labelKey: 'nav.portfolio', color: '#e2693f', size: 52, planet: 'mars', x: 30, y: 61 },
  { id: 'projects', icon: Github, labelKey: 'nav.projects', color: '#5c86f2', size: 48, planet: 'neptune', x: 48, y: 74 },
  { id: 'contact', icon: Mail, labelKey: 'nav.contact', color: '#5fd6d8', size: 50, planet: 'uranus', x: 33, y: 86 },
];

export const RESUME_URL = '/certificates/Filippo_Spazzali_Resume.pdf';
