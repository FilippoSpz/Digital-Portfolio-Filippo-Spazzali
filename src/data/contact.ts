import { Mail, Phone, Linkedin, Github, Instagram, type LucideIcon } from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations/en';

export interface ContactMethod {
  icon: LucideIcon;
  labelKey: TranslationKey;
  value: string;
  link: string;
  /** Full Tailwind gradient classes (kept verbatim for the JIT). */
  gradient: string;
}

export const EMAIL = 'spazzalifilippo@icloud.com';
export const PHONE = '+39 377 689 3133';

export const socialLinks = {
  linkedin: 'https://www.linkedin.com/in/filippospazzali/',
  github: 'https://github.com/FilippoSpz/',
  instagram: 'https://www.instagram.com/filippo_spz/',
} as const;

export const contactMethods: ContactMethod[] = [
  { icon: Mail, labelKey: 'contact.email', value: EMAIL, link: `mailto:${EMAIL}`, gradient: 'from-primary to-secondary' },
  { icon: Phone, labelKey: 'contact.phone', value: PHONE, link: 'tel:+393776893133', gradient: 'from-secondary to-accent' },
  { icon: Linkedin, labelKey: 'contact.linkedin', value: 'filippospazzali', link: socialLinks.linkedin, gradient: 'from-accent to-primary' },
  { icon: Github, labelKey: 'contact.github', value: 'FilippoSpz', link: socialLinks.github, gradient: 'from-primary to-accent' },
  { icon: Instagram, labelKey: 'contact.instagram', value: '@filippo_spz', link: socialLinks.instagram, gradient: 'from-secondary to-primary' },
];

export const socialIconLinks = [
  { icon: Linkedin, href: socialLinks.linkedin, label: 'LinkedIn' },
  { icon: Github, href: socialLinks.github, label: 'GitHub' },
  { icon: Instagram, href: socialLinks.instagram, label: 'Instagram' },
];
