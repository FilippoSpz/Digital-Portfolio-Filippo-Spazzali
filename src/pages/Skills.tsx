import { Code2, Database, Server, Wrench } from "lucide-react";
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

const Skills = () => {
  const skillCategories = [
    {
      category: "Software Programming",
      icon: <Code2 className="h-8 w-8" />,
      color: "from-primary to-secondary",
      skills: [
        { name: "IntelliJ", icon: intellijIcon },
        { name: "Java", icon: javaIcon },
      ],
    },
    {
      category: "Web Programming",
      icon: <Code2 className="h-8 w-8" />,
      color: "from-secondary to-accent",
      skills: [
        { name: "HTML", icon: htmlIcon },
        { name: "CSS", icon: cssIcon },
        { name: "JavaScript", icon: jsIcon },
        { name: "TypeScript", placeholder: true },
      ],
    },
    {
      category: "Databases",
      icon: <Database className="h-8 w-8" />,
      color: "from-accent to-primary",
      skills: [
        { name: "SQL", icon: mysqlIcon },
        { name: "PHP", placeholder: true },
      ],
    },
    {
      category: "Hardware & Networking",
      icon: <Server className="h-8 w-8" />,
      color: "from-primary to-accent",
      skills: [
        { name: "Cisco", icon: ciscoIcon },
      ],
    },
    {
      category: "Office & Productivity",
      icon: <Wrench className="h-8 w-8" />,
      color: "from-secondary to-primary",
      skills: [
        { name: "Word", placeholder: true },
        { name: "Excel", icon: excelIcon },
        { name: "Teams", placeholder: true },
        { name: "SharePoint", placeholder: true },
        { name: "Outlook", placeholder: true },
        { name: "PowerPoint", placeholder: true },
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
            Technical <span className="gradient-text">Skills</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            A comprehensive overview of the technologies and tools I work with
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
                    {category.category}
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {category.skills.map((skill, skillIndex) => (
                    <div
                      key={skillIndex}
                      className="group relative"
                    >
                      <div className="glass-card p-6 hover-lift text-center h-full flex flex-col items-center justify-center gap-4 group-hover:border-primary/50 transition-colors">
                        {skill.placeholder ? (
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                            <div className="text-xs text-muted-foreground text-center px-2">
                              Icon
                            </div>
                          </div>
                        ) : (
                          <img 
                            src={skill.icon} 
                            alt={skill.name}
                            className="w-16 h-16 object-contain"
                          />
                        )}
                        <p className="font-semibold text-sm">{skill.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Note about remaining skill icons */}
        <div className="mt-12 text-center">
          <div className="glass-card p-6 max-w-2xl mx-auto">
            <p className="text-muted-foreground">
              <span className="font-semibold text-primary">Note:</span> Some skill icons are still placeholders 
              and will be displayed once you upload the remaining images.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;
