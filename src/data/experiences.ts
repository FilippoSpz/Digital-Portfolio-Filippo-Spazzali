import type { TranslationKey } from '@/i18n/translations/en';

interface BaseExperience {
  location: string;
  link?: string;
  descriptionKeys: TranslationKey[];
}

export interface EducationExperience extends BaseExperience {
  type: 'education';
  degreeKey: TranslationKey;
  institutionKey: TranslationKey;
  periodKey: TranslationKey;
}

export interface WorkExperience extends BaseExperience {
  type: 'work';
  roleKey: TranslationKey;
  company: string;
  period: string;
}

export type Experience = EducationExperience | WorkExperience;

/** Ordered most-recent first, matching the CV timeline. */
export const experiences: Experience[] = [
  {
    type: 'work',
    roleKey: 'experience.testIntern',
    company: 'INNOVA',
    period: '2026 – Present',
    location: 'Trieste, Italy',
    link: 'https://www.innovatrieste.it/',
    descriptionKeys: ['experience.innova.desc1', 'experience.innova.desc2', 'experience.innova.desc3'],
  },
  {
    type: 'education',
    degreeKey: 'education.bachelors',
    institutionKey: 'education.university',
    periodKey: 'education.expectedGraduation',
    location: 'Trieste, Italy',
    link: 'https://lauree.units.it/it/0320106200800001',
    descriptionKeys: ['education.bachelors.desc1', 'education.bachelors.desc2'],
  },
  {
    type: 'work',
    roleKey: 'experience.webDeveloper',
    company: 'VOLT Srl',
    period: 'Nov 2025 – Jan 2026',
    location: 'Trieste, Italy',
    descriptionKeys: ['experience.volt.desc1', 'experience.volt.desc2'],
  },
  {
    type: 'work',
    roleKey: 'experience.webDeveloper',
    company: 'ViaGlut (Freelancer)',
    period: 'Oct 2025 – Nov 2025',
    location: 'Trieste, Italy',
    link: 'https://magento-1168665-4085035.cloudwaysapps.com/italiano/index',
    descriptionKeys: ['experience.viaglut.desc1', 'experience.viaglut.desc2'],
  },
  {
    type: 'work',
    roleKey: 'experience.webDeveloper',
    company: 'Circolo Aziendale Fincantieri - Wärtsilä Italia - APS',
    period: 'Sep 2022 – Jul 2023',
    location: 'Trieste, Italy',
    link: 'https://www.circolofinwar.it/',
    descriptionKeys: ['experience.circolo.desc1', 'experience.circolo.desc2'],
  },
  {
    type: 'education',
    degreeKey: 'education.highSchool',
    institutionKey: 'education.technicalInstitute',
    periodKey: 'education.graduated',
    location: 'Trieste, Italy',
    link: 'https://www.voltatrieste.edu.it/',
    descriptionKeys: ['education.highSchool.desc1', 'education.highSchool.desc2'],
  },
  {
    type: 'work',
    roleKey: 'experience.intern',
    company: 'Wärtsilä Italia',
    period: 'Jan 2022 – Feb 2022',
    location: 'Trieste, Italy',
    link: 'https://www.wartsila.com/ita',
    descriptionKeys: ['experience.wartsila.desc1', 'experience.wartsila.desc2'],
  },
];
