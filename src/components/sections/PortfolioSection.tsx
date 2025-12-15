import { ExternalLink, Briefcase, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import viaglutImage from "@/assets/portfolio/viaglut.png";
import wartsilaImage from "@/assets/portfolio/wartsila.webp";
import circoloImage from "@/assets/portfolio/circolo.webp";
import ceramicheImage from "@/assets/portfolio/ceramiche.png";

interface PortfolioSectionProps {
  isActive: boolean;
}

const PortfolioSection = ({ isActive }: PortfolioSectionProps) => {
  const { t } = useLanguage();

  const projects = [
    {
      titleKey: "portfolio.ceramiche.title",
      descriptionKey: "portfolio.ceramiche.description",
      technologies: ["Odoo", "HTML", "CSS", "TypeScript"],
      categoryKey: "portfolio.ceramiche.category",
      year: "2025",
      link: "https://coloridisicilia1.odoo.com/",
      image: ceramicheImage,
      color: "from-orange-500 to-amber-500",
    },
    {
      titleKey: "portfolio.viaglut.title",
      descriptionKey: "portfolio.viaglut.description",
      technologies: ["Magento", "HTML", "CSS", "JavaScript"],
      categoryKey: "portfolio.viaglut.category",
      year: "2025",
      link: "https://magento-1168665-4085035.cloudwaysapps.com/italiano/index",
      image: viaglutImage,
      color: "from-cyan-500 to-purple-600",
    },
    {
      titleKey: "portfolio.circolo.title",
      descriptionKey: "portfolio.circolo.description",
      techKey: "portfolio.circolo.tech",
      categoryKey: "portfolio.circolo.category",
      year: "2022-2023",
      link: "https://www.circolofinwar.it/",
      image: circoloImage,
      color: "from-orange-500 to-amber-500",
    },
    {
      titleKey: "portfolio.wartsila.title",
      descriptionKey: "portfolio.wartsila.description",
      technologies: ["HTML", "CSS", "JavaScript", "UI/UX Design"],
      categoryKey: "portfolio.wartsila.category",
      year: "2022",
      link: "https://www.wartsila.com/ita",
      image: wartsilaImage,
      color: "from-cyan-500 to-purple-600",
    },
  ];

  return (
    <section
      id="portfolio"
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
            <Briefcase className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-secondary">{t('nav.portfolio')}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t('portfolio.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0">
            {t('portfolio.subtitle')}
          </p>
        </div>

        {/* Projects */}
        <div className="space-y-8 max-w-5xl mx-auto lg:mx-0">
          {projects.map((project, index) => (
            <div
              key={index}
              className="group relative bg-card/30 rounded-2xl border border-border/30 overflow-hidden hover:border-secondary/30 transition-all duration-500"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="grid md:grid-cols-3 gap-0">
                {/* Image Column */}
                <div className="relative md:col-span-1 aspect-square md:aspect-auto overflow-hidden">
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-20`} />
                  
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <img
                      src={project.image}
                      alt={t(project.titleKey)}
                      className="w-full h-full object-contain max-w-[200px] max-h-[200px]"
                    />
                  </div>

                  {/* Year badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-background/80 backdrop-blur-sm rounded-full text-xs font-semibold">
                      {project.year}
                    </span>
                  </div>
                </div>

                {/* Content Column */}
                <div className="md:col-span-2 p-6 md:p-8 flex flex-col justify-between">
                  <div>
                    {/* Category */}
                    <span className={`inline-block px-3 py-1 bg-gradient-to-r ${project.color} text-background rounded-full text-xs font-semibold mb-4`}>
                      {t(project.categoryKey)}
                    </span>

                    {/* Title */}
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {t(project.titleKey)}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground mb-6 line-clamp-3">
                      {t(project.descriptionKey)}
                    </p>

                    {/* Technologies */}
                    <div className="mb-6">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        {t('portfolio.technologiesUsed')}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(project.techKey ? t(project.techKey).split(', ') : project.technologies || []).map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className="px-3 py-1 bg-muted/50 rounded-lg text-xs font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <div>
                    <Button
                      className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 group/btn"
                      asChild
                    >
                      <a href={project.link} target="_blank" rel="noopener noreferrer">
                        {t('portfolio.viewProject')}
                        <ArrowUpRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Coming Soon */}
        <div className="mt-12 max-w-5xl mx-auto lg:mx-0">
          <div className="bg-card/20 rounded-2xl border border-dashed border-border/50 p-8 text-center">
            <h3 className="text-xl font-bold gradient-text mb-2">{t('portfolio.moreComingSoon')}</h3>
            <p className="text-muted-foreground text-sm">{t('portfolio.moreComingSoonDesc')}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
