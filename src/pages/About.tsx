import { Briefcase, GraduationCap, ExternalLink, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const About = () => {
  const { t } = useLanguage();
  const experiences = [
    {
      roleKey: "experience.webDeveloper",
      company: "ViaGlut",
      period: "2025",
      location: "Trieste, Italy",
      link: "https://magento-1168665-4085035.cloudwaysapps.com/italiano/index",
      descriptionKeys: [
        "experience.viaglut.desc1",
        "experience.viaglut.desc2",
      ],
    },
    {
      roleKey: "experience.webDeveloper",
      company: "CIRCOLO AZIENDALE FINCANTIERI - WÄRTSILÄ ITALIA - APS",
      period: "2022 – 2023",
      location: "Trieste, Italy",
      link: "https://www.circolofinwar.it/",
      descriptionKeys: [
        "experience.circolo.desc1",
        "experience.circolo.desc2",
      ],
    },
    {
      roleKey: "experience.intern",
      company: "Wärtsilä Italia (School Work Experience - PCTO)",
      period: "January 2022 – February 2022",
      location: "Trieste, Italy",
      link: "https://www.wartsila.com/ita",
      descriptionKeys: [
        "experience.wartsila.desc1",
        "experience.wartsila.desc2",
      ],
    },
  ];

  const education = [
    {
      degreeKey: "education.bachelors",
      institutionKey: "education.university",
      periodKey: "education.expectedGraduation",
      location: "Trieste, Italy",
      link: "https://lauree.units.it/it/0320106200800001",
    },
    {
      degreeKey: "education.highSchool",
      institutionKey: "education.technicalInstitute",
      periodKey: "education.graduated",
      location: "Trieste, Italy",
      link: "https://www.voltatrieste.edu.it/",
    },
  ];

  return (
    <section id="about" className="min-h-screen pt-24 pb-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t('about.title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('about.intro')}
          </p>
        </div>

        {/* Professional Summary */}
        <section className="mb-20 animate-slide-up">
          <div className="glass-card p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 gradient-text">{t('about.professionalSummary')}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t('about.professionalSummaryText')}
            </p>
          </div>
        </section>

        {/* Work Experience */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center">
            <Briefcase className="inline-block mr-3 mb-1 h-8 w-8 text-primary" />
            {t('about.experience')}
          </h2>
          <div className="space-y-6 max-w-4xl mx-auto">
            {experiences.map((exp, index) => (
              <div
                key={index}
                className="glass-card p-6 hover-lift"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-primary">{t(exp.roleKey)}</h3>
                    <p className="text-lg font-semibold">{exp.company}</p>
                  </div>
                  <div className="text-muted-foreground mt-2 md:mt-0 md:text-right">
                    <p>{exp.period}</p>
                    <p className="text-sm">{exp.location}</p>
                  </div>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  {exp.descriptionKeys.map((key, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-primary mr-2">▸</span>
                      <span>{t(key)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center">
            <GraduationCap className="inline-block mr-3 mb-1 h-8 w-8 text-secondary" />
            {t('about.education')}
          </h2>
          <div className="space-y-6 max-w-4xl mx-auto">
            {education.map((edu, index) => (
              <div
                key={index}
                className="glass-card p-6 hover-lift"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-secondary">{t(edu.degreeKey)}</h3>
                    <p className="text-lg font-semibold text-muted-foreground">{t(edu.institutionKey)}</p>
                  </div>
                  <div className="text-muted-foreground mt-2 md:mt-0 md:text-right">
                    <p>{t(edu.periodKey)}</p>
                    <p className="text-sm">{edu.location}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-secondary/50 hover:bg-secondary/10"
                  asChild
                >
                  <a href={edu.link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {t('about.viewInstitute')}
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Languages */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center">
            <Languages className="inline-block mr-3 mb-1 h-8 w-8 text-accent" />
            <span className="gradient-text">{t('about.languages')}</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="glass-card p-6 text-center">
              <h3 className="text-xl font-semibold mb-2">Italiano</h3>
              <p className="text-muted-foreground">{t('about.nativeLevel')}</p>
            </div>
            <div className="glass-card p-6 text-center">
              <h3 className="text-xl font-semibold mb-2">English</h3>
              <p className="text-muted-foreground">{t('about.languagesText')}</p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <div className="text-center">
          <div className="glass-card p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 gradient-text">{t('contact.title')}</h3>
            <p className="text-muted-foreground mb-6">
              {t('about.contactCTA')}
            </p>
            <Button
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              asChild
            >
              <a href="#contact">{t('about.getInTouch')}</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
