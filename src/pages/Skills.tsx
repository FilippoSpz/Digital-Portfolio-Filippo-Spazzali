import { Code2, Database, Server, Wrench } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import intellijIcon from "@/assets/skills/intellij.jpg";
import javaIcon from "@/assets/skills/java.png";
import htmlIcon from "@/assets/skills/html.png";
import cssIcon from "@/assets/skills/css.png";
import jsIcon from "@/assets/skills/js.png";
import mysqlIcon from "@/assets/skills/mysql.png";
import ciscoIcon from "@/assets/skills/cisco.png";
import excelIcon from "@/assets/skills/excel.png";
import accessIcon from "@/assets/skills/access.png";
import onenoteIcon from "@/assets/skills/note.png";
import phpIcon from "@/assets/skills/php.png";
import typescriptIcon from "@/assets/skills/typescript.png";
import wordIcon from "@/assets/skills/word.png";
import powerpointIcon from "@/assets/skills/powerpoint.png";
import outlookIcon from "@/assets/skills/outlook.jpg";
import teamsIcon from "@/assets/skills/teams.png";
import sharepointIcon from "@/assets/skills/sharepoint.png";

const Skills = () => {
  const { t } = useLanguage();
  
  const skillCategories = [
    {
      categoryKey: "skills.category.softwareProgramming",
      icon: <Code2 className="h-8 w-8" />,
      color: "from-primary to-secondary",
      skills: [
        { name: "IntelliJ", icon: intellijIcon, className: "mix-blend-multiply dark:mix-blend-normal dark:invert" },
        { name: "Java", icon: javaIcon },
      ],
    },
    {
      categoryKey: "skills.category.webProgramming",
      icon: <Code2 className="h-8 w-8" />,
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
      icon: <Database className="h-8 w-8" />,
      color: "from-accent to-primary",
      skills: [
        { name: "SQL", icon: mysqlIcon },
        { name: "PHP", icon: phpIcon },
      ],
    },
    {
      categoryKey: "skills.category.hardware",
      icon: <Server className="h-8 w-8" />,
      color: "from-primary to-accent",
      skills: [
        { name: "Cisco", icon: ciscoIcon },
      ],
    },
    {
      categoryKey: "skills.category.office",
      icon: <Wrench className="h-8 w-8" />,
      color: "from-secondary to-primary",
      skills: [
        { name: "Word", icon: wordIcon },
        { name: "Excel", icon: excelIcon },
        { name: "Teams", icon: teamsIcon },
        { name: "SharePoint", icon: sharepointIcon },
        { name: "Outlook", icon: outlookIcon, className: "mix-blend-multiply dark:mix-blend-normal dark:invert" },
        { name: "PowerPoint", icon: powerpointIcon },
        { name: "OneNote", icon: onenoteIcon },
        { name: "Access", icon: accessIcon },
      ],
    },
  ];

  return (
    <section id="skills" className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t('skills.title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('skills.subtitle')}
          </p>
        </div>

        {/* Skills Grid */}
        <div className="space-y-12">
          {skillCategories.map((category, categoryIndex) => (
            <div
              key={categoryIndex}
              className="animate-slide-up"
              style={{ animationDelay: `${categoryIndex * 0.1}s` }}
            >
              <div className="glass-card p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className={`p-4 rounded-xl bg-gradient-to-br ${category.color} text-white`}>
                    {category.icon}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold gradient-text">
                    {t(category.categoryKey)}
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {category.skills.map((skill, skillIndex) => (
                    <div
                      key={skillIndex}
                      className="group relative"
                    >
                      <div className="glass-card p-6 hover-lift text-center h-full flex flex-col items-center justify-center gap-4 group-hover:border-primary/50 transition-colors">
                        <img 
                          src={skill.icon} 
                          alt={skill.name}
                          className={`w-16 h-16 object-contain ${(skill as any).className || ''}`}
                        />
                        <p className="font-semibold text-sm">{skill.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Skills;
