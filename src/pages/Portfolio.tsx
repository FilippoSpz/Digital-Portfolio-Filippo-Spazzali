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
      title: "ViaGlut Website Redesign",
      description: "Redesigned and optimized parts of the ViaGlut website using Magento, HTML, and CSS. Focused on creating user-friendly and intuitive interfaces to enhance customer experience.",
      technologies: ["Magento", "HTML", "CSS", "JavaScript"],
      category: "Web Development",
      year: "2025",
      link: "https://magento-1168665-4085035.cloudwaysapps.com/italiano/index",
      image: viaglutImage,
    },
    {
      title: "Management Software System",
      description: "Developed a comprehensive management software from scratch for CIRCOLO AZIENDALE FINCANTIERI - WÄRTSILÄ ITALIA. Replaced legacy system and significantly improved performance and usability.",
      technologies: ["HTML", "CSS", "JavaScript"],
      category: "Software Development",
      year: "2022-2023",
      link: "https://www.circolofinwar.it/",
      image: circoloImage,
    },
    {
      title: "Wärtsilä UI Development",
      description: "Designed and developed the initial user interface for a management program during internship at Wärtsilä Italia. Collaborated with the R&D Engineering team.",
      technologies: ["HTML", "CSS", "JavaScript", "UI/UX Design"],
      category: "Internship Project",
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
                      alt={project.title}
                      className="w-full h-full object-contain bg-gradient-to-br from-primary/10 to-secondary/10 p-4"
                    />
                  </div>
                </div>

                {/* Right Column - Project Details */}
                <div className="md:col-span-2 space-y-4">
                  {/* Title and Category */}
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-2xl font-bold gradient-text">{project.title}</h3>
                      <span className="text-sm text-muted-foreground whitespace-nowrap ml-4">
                        {project.year}
                      </span>
                    </div>
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                      {project.category}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>

                  {/* Technologies */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-foreground/80">Technologies Used:</h4>
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
            <h3 className="text-xl font-bold mb-4 gradient-text">More Projects Coming Soon</h3>
            <p className="text-muted-foreground">
              I'm constantly working on new projects and expanding my portfolio. 
              These projects represent my professional experience and demonstrate my ability 
              to build scalable, user-friendly applications. Feel free to contact me to learn 
              more about any of these projects or to discuss potential collaborations.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
