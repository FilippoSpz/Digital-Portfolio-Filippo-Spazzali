import type { TranslationKey } from '@/i18n/translations/en';

export interface Certification {
  titleKey: TranslationKey;
  issuerKey: TranslationKey;
  dateKey: TranslationKey;
  descriptionKey: TranslationKey;
  file: string;
  /** Full Tailwind gradient classes (kept verbatim for the JIT). */
  gradient: string;
  iconBg: string;
}

export const certifications: Certification[] = [
  {
    titleKey: 'certifications.ccna.title',
    issuerKey: 'certifications.ccna.issuer',
    dateKey: 'certifications.ccna.date',
    descriptionKey: 'certifications.ccna.description',
    file: '/certificates/FilippoSpazzaliCCNAv7_-_certificate.pdf',
    gradient: 'from-primary to-secondary',
    iconBg: 'bg-primary',
  },
  {
    titleKey: 'certifications.itEssentials.title',
    issuerKey: 'certifications.itEssentials.issuer',
    dateKey: 'certifications.itEssentials.date',
    descriptionKey: 'certifications.itEssentials.description',
    file: '/certificates/CISCO_IT_Essential.pdf',
    gradient: 'from-secondary to-accent',
    iconBg: 'bg-secondary',
  },
  {
    titleKey: 'certifications.safety.title',
    issuerKey: 'certifications.safety.issuer',
    dateKey: 'certifications.safety.date',
    descriptionKey: 'certifications.safety.description',
    file: '/certificates/certificato_sicurezza_lavoro.pdf',
    gradient: 'from-accent to-primary',
    iconBg: 'bg-accent',
  },
  {
    titleKey: 'certifications.internship.title',
    issuerKey: 'certifications.internship.issuer',
    dateKey: 'certifications.internship.date',
    descriptionKey: 'certifications.internship.description',
    file: '/certificates/certificazione_wartsila.pdf',
    gradient: 'from-primary to-accent',
    iconBg: 'bg-primary',
  },
];
