import { Briefcase, GraduationCap, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const About = () => {
  const { t } = useLanguage();
  const experiences = [
    {
      role: "Web Developer",
      company: "ViaGlut",
      period: "2025",
      location: "Trieste, Italy",
      link: "https://magento-1168665-4085035.cloudwaysapps.com/italiano/index",
      description: [
        "Fixed, reinvented, and redesigned parts of the website using Magento, integrating HTML and CSS",
        "Designed user-friendly and intuitive web pages to enhance customer experience, working independently",
      ],
    },
    {
      role: "Web Developer",
      company: "CIRCOLO AZIENDALE FINCANTIERI - WÄRTSILÄ ITALIA - APS",
      period: "2022 – 2023",
      location: "Trieste, Italy",
      link: "https://www.circolofinwar.it/",
      description: [
        "Developed a management software from scratch using HTML, CSS, and JavaScript",
        "Replaced an old program and significantly improved performance and usability",
      ],
    },
    {
      role: "Intern",
      company: "Wärtsilä Italia (School Work Experience - PCTO)",
      period: "January 2022 – February 2022",
      location: "Trieste, Italy",
      link: "https://www.wartsila.com/ita",
      description: [
        "Designed and developed the initial user interface of a management program using HTML, CSS, and JavaScript",
        "Participated in daily team meetings to review progress and gather feedback, enhancing collaboration and learning",
      ],
    },
  ];

  const education = [
    {
      degree: "Bachelor's Degree in Computer Engineering",
      institution: "University of Trieste",
      period: "Expected July 2026",
      location: "Trieste, Italy",
      link: "https://lauree.units.it/it/0320106200800001",
    },
    {
      degree: "High School Diploma",
      institution: "Alessandro Volta Technical Institute",
      period: "July 2022",
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
            <h2 className="text-2xl font-bold mb-4 gradient-text">Professional Summary</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Software Developer, in particular Web Developer, holding Cisco IT Essentials and CCNA Certifications 
              with 4 years of experience in web development and software management. Demonstrated ability in developing 
              user-friendly management software using HTML, CSS and TypeScript to significantly improve system performance 
              and usability.
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
                    <h3 className="text-xl font-bold text-primary">{exp.role}</h3>
                    <p className="text-lg font-semibold">{exp.company}</p>
                  </div>
                  <div className="text-muted-foreground mt-2 md:mt-0 md:text-right">
                    <p>{exp.period}</p>
                    <p className="text-sm">{exp.location}</p>
                  </div>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  {exp.description.map((item, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-primary mr-2">▸</span>
                      <span>{item}</span>
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
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <a href={edu.link} target="_blank" rel="noopener noreferrer" className="hover:underline"><h3 className="text-xl font-bold text-secondary hover:opacity-80 transition-opacity">{edu.degree}</h3></a>
                    <a href={edu.link} target="_blank" rel="noopener noreferrer" className="hover:underline"><p className="text-lg font-semibold hover:text-primary transition-colors">{edu.institution}</p></a>
                  </div>
                  <div className="text-muted-foreground mt-2 md:mt-0 md:text-right">
                    <p>{edu.period}</p>
                    <p className="text-sm">{edu.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Languages */}
        <section>
          <h2 className="text-3xl font-bold mb-8 text-center">
            <Globe className="inline-block mr-3 mb-1 h-8 w-8 text-accent" />
            <span className="gradient-text">Languages</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="glass-card p-6 text-center hover-lift">
              <h3 className="text-xl font-bold mb-2">Italian</h3>
              <p className="text-muted-foreground">Native Speaker</p>
            </div>
            <div className="glass-card p-6 text-center hover-lift">
              <h3 className="text-xl font-bold mb-2">English</h3>
              <p className="text-muted-foreground">C1 Level</p>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
};

export default About;
