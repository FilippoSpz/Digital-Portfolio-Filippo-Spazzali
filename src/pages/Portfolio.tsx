import { ExternalLink, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import viaglutImage from "@/assets/portfolio/viaglut.png";
import wartsilaImage from "@/assets/portfolio/wartsila.webp";
import circoloImage from "@/assets/portfolio/circolo.webp";

const Portfolio = () => {
  const { t } = useLanguage();
  
  const projects = [
    {
      titleKey: "portfolio.viaglut.title",
      descriptionKey: "portfolio.viaglut.description",
      technologies: ["Magento", "HTML", "CSS", "JavaScript"],
      categoryKey: "portfolio.viaglut.category",
      year: "2025",
      link: "https://magento-1168665-4085035.cloudwaysapps.com/italiano/index",
      image: viaglutImage,
    },
    {
      titleKey: "portfolio.circolo.title",
      descriptionKey: "portfolio.circolo.description",
      technologies: ["HTML", "CSS", "JavaScript"],
      categoryKey: "portfolio.circolo.category",
      year: "2022-2023",
      link: "https://www.circolofinwar.it/",
      image: circoloImage,
    },
    {
      titleKey: "portfolio.wartsila.title",
      descriptionKey: "portfolio.wartsila.description",
      technologies: ["HTML", "CSS", "JavaScript", "UI/UX Design"],
      categoryKey: "portfolio.wartsila.category",
      year: "2022",
      link: "https://www.wartsila.com/ita",
      image: wartsilaImage,
    },
  ];

  return (
    <section id="portfolio" className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t('portfolio.title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('portfolio.subtitle')}
          </p>
        </div>

        {/* Projects Grid */}
        <div className="space-y-8 max-w-5xl mx-auto">
          {projects.map((project, index) => (
            <div
              key={index}
              className="glass-card p-8 hover-lift group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="grid md:grid-cols-3 gap-6">
                {/* Left Column - Project Image */}
                <div className="md:col-span-1">
                  <div className="aspect-square rounded-xl overflow-hidden border-2 border-primary/30 group-hover:border-primary/60 transition-colors">
                    <img 
                      src={project.image} 
                      alt={t(project.titleKey)}
                      className="w-full h-full object-contain bg-gradient-to-br from-primary/10 to-secondary/10 p-4"
                    />
                  </div>
                </div>

                {/* Right Column - Project Details */}
                <div className="md:col-span-2 space-y-4">
                  {/* Title and Category */}
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-2xl font-bold gradient-text">{t(project.titleKey)}</h3>
                      <span className="text-sm text-muted-foreground whitespace-nowrap ml-4">
                        {project.year}
                      </span>
                    </div>
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                      {t(project.categoryKey)}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed">
                    {t(project.descriptionKey)}
                  </p>

                  {/* Technologies */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-foreground/80">{t('portfolio.technologiesUsed')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className="px-3 py-1 bg-muted rounded-full text-sm font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="default"
                      className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                      asChild
                    >
                      <a href={project.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        {t('portfolio.viewProject')}
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="glass-card p-8 max-w-3xl mx-auto">
            <h3 className="text-xl font-bold mb-4 gradient-text">{t('portfolio.moreComingSoon')}</h3>
            <p className="text-muted-foreground">
              {t('portfolio.moreComingSoonDesc')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
