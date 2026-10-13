import { Home, User, Rocket, Code2, Award, Briefcase, Github, Mail, type LucideIcon } from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations/en';

/** The bodies of the solar system the site is made of: one per section, plus the two outer controls. */
export type Body = 'sun' | 'mercury' | 'venus' | 'earth' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'pluto';

/** The sections in page order — the same order as the planets from the Sun outwards. */
export const SECTION_IDS = ['home', 'about', 'experience', 'skills', 'certifications', 'portfolio', 'projects', 'contact'] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export interface NavItem {
  id: SectionId;
  icon: LucideIcon;
  labelKey: TranslationKey;
  /** The body that stands for this section, in the menu and in the 3D background. */
  body: Body;
  /** The section's accent (hex), taken from its planet: the same hue as the section's palette in index.css. */
  color: string;
  /** Diameter in the menu, in px: roughly in proportion, so Jupiter is big and Mercury small. */
  size: number;
}

export const navItems: NavItem[] = [
  { id: 'home', icon: Home, labelKey: 'nav.home', body: 'sun', color: '#ff8a33', size: 92 },
  { id: 'about', icon: User, labelKey: 'nav.about', body: 'mercury', color: '#9eaabb', size: 24 },
  { id: 'experience', icon: Rocket, labelKey: 'nav.experience', body: 'venus', color: '#f2d27a', size: 32 },
  { id: 'skills', icon: Code2, labelKey: 'nav.skills', body: 'earth', color: '#3da5f5', size: 34 },
  { id: 'certifications', icon: Award, labelKey: 'nav.certifications', body: 'mars', color: '#e5533d', size: 28 },
  { id: 'portfolio', icon: Briefcase, labelKey: 'nav.portfolio', body: 'jupiter', color: '#dda06a', size: 54 },
  { id: 'projects', icon: Github, labelKey: 'nav.projects', body: 'saturn', color: '#d9be8c', size: 44 },
  { id: 'contact', icon: Mail, labelKey: 'nav.contact', body: 'uranus', color: '#6ce0e0', size: 36 },
];

/** Beyond the last section: Neptune switches the language, Pluto downloads the CV. */
export const outerBodies = {
  language: { body: 'neptune' as const, color: '#5b7cf0', size: 30 },
  resume: { body: 'pluto' as const, color: '#cdb8a0', size: 18 },
};

export const RESUME_URL = '/certificates/Filippo_Spazzali_Resume.pdf';
