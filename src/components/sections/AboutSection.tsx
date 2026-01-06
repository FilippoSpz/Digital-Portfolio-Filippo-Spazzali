import { Briefcase, GraduationCap, ExternalLink, Languages, MapPin, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface AboutSectionProps {
  isActive: boolean;
}

const AboutSection = ({ isActive }: AboutSectionProps) => {
  const { t, language } = useLanguage();

  const experiences = [
    {
      roleKey: "experience.webDeveloper",
      company: "Colori di Sicilia",
      period: "2025",
      location: "Trieste, Italy",
      link: "https://coloridisicilia1.odoo.com/",
      descriptionKeys: ["experience.ceramiche.desc1", "experience.ceramiche.desc2"],
    },
    {
      roleKey: "experience.webDeveloper",
      company: "Artigiani della Pipa",
      period: "2025",
      location: "Trieste, Italy",
      link: "https://artigianidellapipa.odoo.com/",
      descriptionKeys: ["experience.artigiani.desc1", "experience.artigiani.desc2"],
    },
    {
      roleKey: "experience.webDeveloper",
      company: "ViaGlut",
      period: "2025",
      location: "Trieste, Italy",
      link: "https://magento-1168665-4085035.cloudwaysapps.com/italiano/index",
      descriptionKeys: ["experience.viaglut.desc1", "experience.viaglut.desc2"],
    },
    {
      roleKey: "experience.webDeveloper",
      company: "CIRCOLO AZIENDALE FINCANTIERI - WÄRTSILÄ ITALIA - APS",
      period: "2022 – 2023",
      location: "Trieste, Italy",
      link: "https://www.circolofinwar.it/",
      descriptionKeys: ["experience.circolo.desc1", "experience.circolo.desc2"],
    },
    {
      roleKey: "experience.intern",
      company: "Wärtsilä Italia (School Work Experience - PCTO)",
      period: "January 2022 – February 2022",
      location: "Trieste, Italy",
      link: "https://www.wartsila.com/ita",
      descriptionKeys: ["experience.wartsila.desc1", "experience.wartsila.desc2"],
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

  // Language names based on current language
  const languageNames = {
    italian: language === 'en' ? 'Italian' : 'Italiano',
    english: language === 'en' ? 'English' : 'Inglese',
  };

  return (
    <section
      id="about"
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/30 mb-6">
            <User className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-secondary">{t('nav.about')}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t('about.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0">
            {t('about.intro')}
          </p>
        </div>

        {/* Professional Summary Card */}
        <div className="mb-16">
          <div className="relative overflow-hidden rounded-2xl bg-card/50 border border-border/50 p-8 md:p-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-secondary/20 to-transparent rounded-full blur-3xl" />
            <h3 className="text-2xl font-bold gradient-text mb-4">{t('about.professionalSummary')}</h3>
            <p className="text-lg text-muted-foreground leading-relaxed relative z-10">
              {t('about.professionalSummaryText')}
            </p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Experience Column */}
          <div>
            <div className="flex items-center gap-3 mb-8 justify-center lg:justify-start">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-background" />
              </div>
              <h3 className="text-2xl font-bold">{t('about.experience')}</h3>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto border-primary/50 hover:bg-primary/10 text-foreground"
                onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {t('about.viewPortfolio')}
              </Button>
            </div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-secondary to-accent" />

              <div className="space-y-8">
                {experiences.map((exp, index) => (
                  <div key={index} className="relative pl-16">
                    {/* Timeline dot */}
                    <div className="absolute left-4 top-2 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                    
                    <div className="bg-card/30 rounded-xl p-6 border border-border/30 hover:border-primary/30 transition-all duration-300 hover:scale-[1.02]">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                        <h4 className="text-lg font-semibold text-primary">{t(exp.roleKey)}</h4>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {exp.period}
                        </span>
                      </div>
                      <p className="font-medium mb-2">{exp.company}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mb-4">
                        <MapPin className="w-3 h-3" />
                        {exp.location}
                      </p>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {exp.descriptionKeys.map((key, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-primary mt-1">▸</span>
                            <span>{t(key)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Education & Languages Column */}
          <div className="space-y-12">
            {/* Education */}
            <div>
              <div className="flex items-center gap-3 mb-8 justify-center lg:justify-start">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-background" />
                </div>
                <h3 className="text-2xl font-bold">{t('about.education')}</h3>
              </div>

              {/* Education with timeline */}
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-secondary via-accent to-primary" />

                <div className="space-y-6">
                  {education.map((edu, index) => (
                    <div key={index} className="relative pl-16">
                      {/* Timeline dot */}
                      <div className="absolute left-4 top-2 w-4 h-4 rounded-full bg-secondary border-4 border-background" />
                      
                      <div className="bg-card/30 rounded-xl p-6 border border-border/30 hover:border-secondary/30 transition-all duration-300 hover:scale-[1.02]">
                        <h4 className="text-lg font-semibold text-secondary mb-1">{t(edu.degreeKey)}</h4>
                        <p className="text-muted-foreground mb-2">{t(edu.institutionKey)}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {t(edu.periodKey)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {edu.location}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-secondary/50 hover:bg-secondary/10 text-foreground"
                          asChild
                        >
                          <a href={edu.link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-3 w-3" />
                            {t('about.viewInstitute')}
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Languages */}
            <div>
              <div className="flex items-center gap-3 mb-8 justify-center lg:justify-start">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                  <Languages className="w-6 h-6 text-background" />
                </div>
                <h3 className="text-2xl font-bold">{t('about.languages')}</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card/30 rounded-xl p-6 border border-border/30 text-center hover:border-accent/30 transition-all duration-300 hover:scale-[1.02] group">
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🇮🇹</div>
                  <h4 className="text-xl font-semibold mb-2">{languageNames.italian}</h4>
                  <p className="text-sm text-muted-foreground">{t('about.nativeLevel')}</p>
                </div>
                <div className="bg-card/30 rounded-xl p-6 border border-border/30 text-center hover:border-accent/30 transition-all duration-300 hover:scale-[1.02] group">
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🇬🇧</div>
                  <h4 className="text-xl font-semibold mb-2">{languageNames.english}</h4>
                  <p className="text-sm text-muted-foreground">{t('about.languagesText')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
