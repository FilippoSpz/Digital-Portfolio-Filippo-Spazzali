import { Code2, Database, Server, Wrench, type LucideIcon } from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations/en';

import intellijIcon from '@/assets/skills/intellij.png';
import javaIcon from '@/assets/skills/java.png';
import htmlIcon from '@/assets/skills/html.png';
import cssIcon from '@/assets/skills/css.png';
import jsIcon from '@/assets/skills/js.png';
import mysqlIcon from '@/assets/skills/mysql.png';
import ciscoIcon from '@/assets/skills/cisco.png';
import excelIcon from '@/assets/skills/excel.png';
import accessIcon from '@/assets/skills/access.png';
import onenoteIcon from '@/assets/skills/note.png';
import phpIcon from '@/assets/skills/php-transparent.png';
import typescriptIcon from '@/assets/skills/typescript.png';
import wordIcon from '@/assets/skills/word.png';
import powerpointIcon from '@/assets/skills/powerpoint.png';
import outlookIcon from '@/assets/skills/outlook.png';
import teamsIcon from '@/assets/skills/teams.png';
import sharepointIcon from '@/assets/skills/sharepoint.png';
import bashIcon from '@/assets/skills/bash.png';
import cIcon from '@/assets/skills/c.png';
import cppIcon from '@/assets/skills/cpp.png';
import latexIcon from '@/assets/skills/latex.png';

/** 5 = Expert, 4 = Advanced. */
export type SkillLevel = 4 | 5;

export interface Skill {
  name: string;
  icon: string;
  level: SkillLevel;
}

export interface SkillCategory {
  categoryKey: TranslationKey;
  icon: LucideIcon;
  /** Full Tailwind gradient classes (kept verbatim so the JIT can detect them). */
  gradient: string;
  skills: Skill[];
}

export const skillCategories: SkillCategory[] = [
  {
    categoryKey: 'skills.category.softwareProgramming',
    icon: Code2,
    gradient: 'from-violet-500 to-purple-600',
    skills: [
      { name: 'IntelliJ', icon: intellijIcon, level: 5 },
      { name: 'Java', icon: javaIcon, level: 5 },
      { name: 'C', icon: cIcon, level: 4 },
      { name: 'C++', icon: cppIcon, level: 5 },
      { name: 'Bash', icon: bashIcon, level: 4 },
      { name: 'LaTeX', icon: latexIcon, level: 5 },
    ],
  },
  {
    categoryKey: 'skills.category.webProgramming',
    icon: Code2,
    gradient: 'from-cyan-500 to-blue-600',
    skills: [
      { name: 'HTML', icon: htmlIcon, level: 5 },
      { name: 'CSS', icon: cssIcon, level: 5 },
      { name: 'JavaScript', icon: jsIcon, level: 5 },
      { name: 'TypeScript', icon: typescriptIcon, level: 5 },
    ],
  },
  {
    categoryKey: 'skills.category.databases',
    icon: Database,
    gradient: 'from-emerald-500 to-green-600',
    skills: [
      { name: 'SQL', icon: mysqlIcon, level: 5 },
      { name: 'PHP', icon: phpIcon, level: 5 },
    ],
  },
  {
    categoryKey: 'skills.category.hardware',
    icon: Server,
    gradient: 'from-orange-500 to-amber-600',
    skills: [{ name: 'Cisco', icon: ciscoIcon, level: 4 }],
  },
  {
    categoryKey: 'skills.category.office',
    icon: Wrench,
    gradient: 'from-pink-500 to-rose-600',
    skills: [
      { name: 'Word', icon: wordIcon, level: 5 },
      { name: 'Excel', icon: excelIcon, level: 5 },
      { name: 'Teams', icon: teamsIcon, level: 5 },
      { name: 'SharePoint', icon: sharepointIcon, level: 5 },
      { name: 'Outlook', icon: outlookIcon, level: 5 },
      { name: 'PowerPoint', icon: powerpointIcon, level: 5 },
      { name: 'OneNote', icon: onenoteIcon, level: 4 },
      { name: 'Access', icon: accessIcon, level: 4 },
    ],
  },
];
