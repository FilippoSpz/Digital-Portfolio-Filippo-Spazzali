import { useRef, useEffect, useState } from "react";
import { Briefcase, GraduationCap, Calendar, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface TimelineItemProps {
  type: "work" | "education";
  titleKey: string;
  company?: string;
  institutionKey?: string;
  periodKey?: string;
  period?: string;
  location: string;
  link?: string;
  descriptionKeys?: string[];
  index: number;
}

const TimelineItem = ({
  type,
  titleKey,
  company,
  institutionKey,
  periodKey,
  period,
  location,
  link,
  descriptionKeys,
  index,
}: TimelineItemProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const isWork = type === "work";
  const gradientColor = isWork ? "from-primary to-secondary" : "from-secondary to-accent";
  const dotColor = isWork ? "bg-primary" : "bg-secondary";
  const borderHover = isWork ? "hover:border-primary/30" : "hover:border-secondary/30";

  return (
    <div
      ref={ref}
      className={`relative pl-16 transition-all duration-700 ${
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Timeline dot */}
      <div className={`absolute left-4 top-2 w-4 h-4 rounded-full ${dotColor} border-4 border-background transition-transform duration-300 ${isVisible ? "scale-100" : "scale-0"}`} 
           style={{ transitionDelay: `${index * 100 + 200}ms` }} />
      
      {/* Type badge */}
      <div className={`absolute left-0 top-8 w-8 h-8 rounded-lg bg-gradient-to-br ${gradientColor} flex items-center justify-center`}>
        {isWork ? (
          <Briefcase className="w-4 h-4 text-background" />
        ) : (
          <GraduationCap className="w-4 h-4 text-background" />
        )}
      </div>

      <div className={`bg-card/30 rounded-xl p-6 border border-border/30 ${borderHover} transition-all duration-300 hover:scale-[1.02]`}>
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <h4 className={`text-lg font-semibold ${isWork ? "text-primary" : "text-secondary"}`}>
            {t(titleKey)}
          </h4>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {periodKey ? t(periodKey) : period}
          </span>
        </div>
        
        <p className="font-medium mb-2">
          {company || (institutionKey && t(institutionKey))}
        </p>
        
        <p className="text-sm text-muted-foreground flex items-center gap-1 mb-4">
          <MapPin className="w-3 h-3" />
          {location}
        </p>

        {descriptionKeys && descriptionKeys.length > 0 && (
          <ul className="space-y-2 text-sm text-muted-foreground mb-4">
            {descriptionKeys.map((key, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className={`${isWork ? "text-primary" : "text-secondary"} mt-1`}>▸</span>
                <span>{t(key)}</span>
              </li>
            ))}
          </ul>
        )}

        {link && (
          <Button
            variant="outline"
            size="sm"
            className={`border-${isWork ? "primary" : "secondary"}/50 hover:bg-${isWork ? "primary" : "secondary"}/10`}
            asChild
          >
            <a href={link} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-3 w-3" />
              {t(isWork ? "portfolio.viewProject" : "about.viewInstitute")}
            </a>
          </Button>
        )}
      </div>
    </div>
  );
};

const Timeline = () => {
  const { t } = useLanguage();

  const timelineItems: TimelineItemProps[] = [
    // Education first
    {
      type: "education",
      titleKey: "education.bachelors",
      institutionKey: "education.university",
      periodKey: "education.expectedGraduation",
      location: "Trieste, Italy",
      link: "https://lauree.units.it/it/0320106200800001",
      index: 0,
    },
    // Work experiences
    {
      type: "work",
      titleKey: "experience.webDeveloper",
      company: "Ceramiche De Simone",
      period: "2025",
      location: "Sicily, Italy",
      link: "https://coloridisicilia1.odoo.com/",
      descriptionKeys: ["experience.ceramiche.desc1", "experience.ceramiche.desc2"],
      index: 1,
    },
    {
      type: "work",
      titleKey: "experience.webDeveloper",
      company: "Artigiani della Pipa",
      period: "2025",
      location: "Italy",
      link: "https://artigianidellapipa.odoo.com/",
      descriptionKeys: ["experience.artigiani.desc1", "experience.artigiani.desc2"],
      index: 2,
    },
    {
      type: "work",
      titleKey: "experience.webDeveloper",
      company: "ViaGlut",
      period: "2025",
      location: "Trieste, Italy",
      link: "https://magento-1168665-4085035.cloudwaysapps.com/italiano/index",
      descriptionKeys: ["experience.viaglut.desc1", "experience.viaglut.desc2"],
      index: 3,
    },
    {
      type: "work",
      titleKey: "experience.webDeveloper",
      company: "CIRCOLO AZIENDALE FINCANTIERI - WÄRTSILÄ ITALIA - APS",
      period: "2022 – 2023",
      location: "Trieste, Italy",
      link: "https://www.circolofinwar.it/",
      descriptionKeys: ["experience.circolo.desc1", "experience.circolo.desc2"],
      index: 4,
    },
    // High school
    {
      type: "education",
      titleKey: "education.highSchool",
      institutionKey: "education.technicalInstitute",
      periodKey: "education.graduated",
      location: "Trieste, Italy",
      link: "https://www.voltatrieste.edu.it/",
      index: 5,
    },
    {
      type: "work",
      titleKey: "experience.intern",
      company: "Wärtsilä Italia (School Work Experience - PCTO)",
      period: "January 2022 – February 2022",
      location: "Trieste, Italy",
      link: "https://www.wartsila.com/ita",
      descriptionKeys: ["experience.wartsila.desc1", "experience.wartsila.desc2"],
      index: 6,
    },
  ];

  return (
    <div className="py-16">
      <div className="text-center mb-12">
        <h3 className="text-2xl md:text-3xl font-bold gradient-text mb-2">
          {t("timeline.title")}
        </h3>
        <p className="text-muted-foreground">{t("timeline.subtitle")}</p>
      </div>

      <div className="relative max-w-3xl mx-auto">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-secondary to-accent" />

        <div className="space-y-8">
          {timelineItems.map((item, index) => (
            <TimelineItem key={index} {...item} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
