import type { TranslationKey } from '@/i18n/translations/en';

import viaglutImage from '@/assets/portfolio/viaglut.png';
import wartsilaImage from '@/assets/portfolio/wartsila.webp';
import circoloImage from '@/assets/portfolio/circolo.webp';
import ceramicheImage from '@/assets/portfolio/ceramiche.png';
import artigianiImage from '@/assets/portfolio/artigiani.png';

export interface Project {
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  categoryKey: TranslationKey;
  /** Either a static list of technologies or a translation key holding a comma-separated list. */
  technologies?: string[];
  techKey?: TranslationKey;
  year: string;
  link: string;
  image: string;
  /** Full Tailwind gradient classes (kept verbatim for the JIT). */
  gradient: string;
  rounded?: boolean;
  whiteBg?: boolean;
}

export const projects: Project[] = [
  {
    titleKey: 'portfolio.ceramiche.title',
    descriptionKey: 'portfolio.ceramiche.description',
    categoryKey: 'portfolio.ceramiche.category',
    technologies: ['Odoo', 'HTML', 'CSS', 'TypeScript'],
    year: '2025',
    link: 'https://coloridisicilia1.odoo.com/',
    image: ceramicheImage,
    gradient: 'from-orange-500 to-amber-500',
    rounded: true,
    whiteBg: true,
  },
  {
    titleKey: 'portfolio.artigiani.title',
    descriptionKey: 'portfolio.artigiani.description',
    categoryKey: 'portfolio.artigiani.category',
    technologies: ['Odoo', 'HTML', 'CSS', 'TypeScript'],
    year: '2025',
    link: 'https://artigianidellapipa.odoo.com/',
    image: artigianiImage,
    gradient: 'from-cyan-500 to-purple-600',
    rounded: true,
    whiteBg: true,
  },
  {
    titleKey: 'portfolio.viaglut.title',
    descriptionKey: 'portfolio.viaglut.description',
    categoryKey: 'portfolio.viaglut.category',
    technologies: ['Magento', 'HTML', 'CSS', 'JavaScript'],
    year: '2025',
    link: 'https://magento-1168665-4085035.cloudwaysapps.com/italiano/index',
    image: viaglutImage,
    gradient: 'from-orange-500 to-amber-500',
    rounded: true,
  },
  {
    titleKey: 'portfolio.circolo.title',
    descriptionKey: 'portfolio.circolo.description',
    categoryKey: 'portfolio.circolo.category',
    techKey: 'portfolio.circolo.tech',
    year: '2022-2023',
    link: 'https://www.circolofinwar.it/',
    image: circoloImage,
    gradient: 'from-cyan-500 to-purple-600',
  },
  {
    titleKey: 'portfolio.wartsila.title',
    descriptionKey: 'portfolio.wartsila.description',
    categoryKey: 'portfolio.wartsila.category',
    technologies: ['HTML', 'CSS', 'JavaScript', 'UI/UX Design'],
    year: '2022',
    link: 'https://www.wartsila.com/ita',
    image: wartsilaImage,
    gradient: 'from-orange-500 to-amber-500',
  },
];
