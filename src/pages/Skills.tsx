import { Code2, Database, Server, Wrench } from "lucide-react";

const Skills = () => {
  const skillCategories = [
    {
      category: "Software Programming",
      icon: <Code2 className="h-8 w-8" />,
      color: "from-primary to-secondary",
      skills: [
        { name: "IntelliJ", placeholder: true },
        { name: "Java", placeholder: true },
      ],
    },
    {
      category: "Web Programming",
      icon: <Code2 className="h-8 w-8" />,
      color: "from-secondary to-accent",
      skills: [
        { name: "HTML", placeholder: true },
        { name: "CSS", placeholder: true },
        { name: "JavaScript", placeholder: true },
        { name: "TypeScript", placeholder: true },
      ],
    },
    {
      category: "Databases",
      icon: <Database className="h-8 w-8" />,
      color: "from-accent to-primary",
      skills: [
        { name: "SQL", placeholder: true },
        { name: "PHP", placeholder: true },
      ],
    },
    {
      category: "Hardware & Networking",
      icon: <Server className="h-8 w-8" />,
      color: "from-primary to-accent",
      skills: [
        { name: "Cisco", placeholder: true },
      ],
    },
    {
      category: "Office & Productivity",
      icon: <Wrench className="h-8 w-8" />,
      color: "from-secondary to-primary",
      skills: [
        { name: "Word", placeholder: true },
        { name: "Excel", placeholder: true },
        { name: "Teams", placeholder: true },
        { name: "SharePoint", placeholder: true },
        { name: "Outlook", placeholder: true },
        { name: "PowerPoint", placeholder: true },
        { name: "OneNote", placeholder: true },
        { name: "Access", placeholder: true },
      ],
    },
  ];

  return (
    <main className="min-h-screen pt-24 pb-16">
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
            <section
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
                        {/* Placeholder for skill icon - to be uploaded by user */}
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                          <div className="text-xs text-muted-foreground text-center px-2">
                            Icon
                          </div>
                        </div>
                        <p className="font-semibold text-sm">{skill.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* Note about skill icons */}
        <div className="mt-12 text-center">
          <div className="glass-card p-6 max-w-2xl mx-auto">
            <p className="text-muted-foreground">
              <span className="font-semibold text-primary">Note:</span> Skill icons will be displayed 
              here once you upload the 17 skill icon images. Each icon will replace the placeholder shown above.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Skills;
