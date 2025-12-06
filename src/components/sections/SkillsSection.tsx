import { Code2, Database, Server, Wrench } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import intellijIcon from "@/assets/skills/intellij.png";
import javaIcon from "@/assets/skills/java.png";
import htmlIcon from "@/assets/skills/html.png";
import cssIcon from "@/assets/skills/css.png";
import jsIcon from "@/assets/skills/js.png";
import mysqlIcon from "@/assets/skills/mysql.png";
import ciscoIcon from "@/assets/skills/cisco.png";
import excelIcon from "@/assets/skills/excel.png";
import accessIcon from "@/assets/skills/access.png";
import onenoteIcon from "@/assets/skills/note.png";
import phpIcon from "@/assets/skills/php-transparent.png";
import typescriptIcon from "@/assets/skills/typescript.png";
import wordIcon from "@/assets/skills/word.png";
import powerpointIcon from "@/assets/skills/powerpoint.png";
import outlookIcon from "@/assets/skills/outlook.png";
import teamsIcon from "@/assets/skills/teams.png";
import sharepointIcon from "@/assets/skills/sharepoint.png";
import bashIcon from "@/assets/skills/bash.png";
import cIcon from "@/assets/skills/c.png";
import cppIcon from "@/assets/skills/cpp.png";
import latexIcon from "@/assets/skills/latex.png";

interface SkillsSectionProps {
  isActive: boolean;
}

const SkillsSection = ({ isActive }: SkillsSectionProps) => {
  const { t } = useLanguage();

  const skillCategories = [
    {
      categoryKey: "skills.category.softwareProgramming",
      icon: <Code2 className="w-6 h-6" />,
      color: "from-primary to-secondary",
      skills: [
        { name: "IntelliJ", icon: intellijIcon },
        { name: "Java", icon: javaIcon },
        { name: "C", icon: cIcon },
        { name: "C++", icon: cppIcon },
        { name: "Bash", icon: bashIcon },
        { name: "LaTeX", icon: latexIcon },
      ],
    },
    {
      categoryKey: "skills.category.webProgramming",
      icon: <Code2 className="w-6 h-6" />,
      color: "from-secondary to-accent",
      skills: [
        { name: "HTML", icon: htmlIcon },
        { name: "CSS", icon: cssIcon },
        { name: "JavaScript", icon: jsIcon },
        { name: "TypeScript", icon: typescriptIcon },
      ],
    },
    {
      categoryKey: "skills.category.databases",
      icon: <Database className="w-6 h-6" />,
      color: "from-accent to-primary",
      skills: [
        { name: "SQL", icon: mysqlIcon },
        { name: "PHP", icon: phpIcon },
      ],
    },
    {
      categoryKey: "skills.category.hardware",
      icon: <Server className="w-6 h-6" />,
      color: "from-primary to-accent",
      skills: [
        { name: "Cisco", icon: ciscoIcon },
      ],
    },
    {
      categoryKey: "skills.category.office",
      icon: <Wrench className="w-6 h-6" />,
      color: "from-secondary to-primary",
      skills: [
        { name: "Word", icon: wordIcon },
        { name: "Excel", icon: excelIcon },
        { name: "Teams", icon: teamsIcon },
        { name: "SharePoint", icon: sharepointIcon },
        { name: "Outlook", icon: outlookIcon },
        { name: "PowerPoint", icon: powerpointIcon },
        { name: "OneNote", icon: onenoteIcon },
        { name: "Access", icon: accessIcon },
      ],
    },
  ];

  // First row: Software Programming + Web Programming
  const row1 = skillCategories.slice(0, 2);
  // Second row: Databases + Hardware
  const row2 = skillCategories.slice(2, 4);
  // Third row: Office alone
  const row3 = skillCategories.slice(4);

  const renderCard = (category: typeof skillCategories[0], categoryIndex: number) => (
    <div
      key={categoryIndex}
      className="relative flex-1"
      style={{ animationDelay: `${categoryIndex * 0.1}s` }}
    >
      {/* Category Card */}
      <div className="bg-card/30 rounded-2xl border border-border/30 overflow-hidden h-full">
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-border/30">
          <div className="flex items-center gap-4 justify-center lg:justify-start">
            <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-background`}>
              {category.icon}
            </div>
            <h3 className="text-lg lg:text-xl font-bold">{t(category.categoryKey)}</h3>
          </div>
        </div>

        {/* Skills Grid */}
        <div className="p-4 lg:p-6">
          <div className="flex flex-wrap gap-3 lg:gap-4 justify-center lg:justify-start">
            {category.skills.map((skill, skillIndex) => (
              <div
                key={skillIndex}
                className="group relative"
              >
                <div className="relative flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 bg-background/50 rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105">
                  {/* Skill Icon Container */}
                  <div className="relative w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center">
                    {/* Transparent background circle for icons */}
                    <div className="absolute inset-0 rounded-lg bg-foreground/5" />
                    <img
                      src={skill.icon}
                      alt={skill.name}
                      className="relative w-6 h-6 lg:w-8 lg:h-8 object-contain"
                    />
                  </div>
                  
                  {/* Skill Name */}
                  <span className="font-medium text-xs lg:text-sm">{skill.name}</span>

                  {/* Hover glow */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section
      id="skills"
      className={`
        min-h-screen py-24 relative
        transition-all duration-700
        ${isActive ? "opacity-100" : "opacity-50"}
      `}
    >
      {/* Mobile/Tablet centered, Desktop with left padding */}
      <div className="container mx-auto px-4 md:px-8 lg:pl-40">
        {/* Section Header */}
        <div className="max-w-4xl mb-16 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 mb-6">
            <Code2 className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">{t('nav.skills')}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t('skills.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0">
            {t('skills.subtitle')}
          </p>
        </div>

        {/* Skills Grid - Two column layout except for Office */}
        <div className="space-y-6">
          {/* Row 1: Software Programming + Web Programming */}
          <div className="flex flex-col lg:flex-row gap-6">
            {row1.map((category, index) => renderCard(category, index))}
          </div>
          
          {/* Row 2: Databases + Hardware */}
          <div className="flex flex-col lg:flex-row gap-6">
            {row2.map((category, index) => renderCard(category, index + 2))}
          </div>
          
          {/* Row 3: Office alone (full width) */}
          <div className="flex flex-col gap-6">
            {row3.map((category, index) => renderCard(category, index + 4))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
