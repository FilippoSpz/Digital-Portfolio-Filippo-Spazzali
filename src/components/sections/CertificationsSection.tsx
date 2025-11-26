import { Award, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface CertificationsSectionProps {
  isActive: boolean;
}

const CertificationsSection = ({ isActive }: CertificationsSectionProps) => {
  const { t } = useLanguage();

  const certificates = [
    {
      titleKey: "certifications.ccna.title",
      issuerKey: "certifications.ccna.issuer",
      dateKey: "certifications.ccna.date",
      descriptionKey: "certifications.ccna.description",
      file: "/certificates/FilippoSpazzaliCCNAv7_-_certificate.pdf",
      color: "from-primary to-secondary",
      iconBg: "bg-primary",
    },
    {
      titleKey: "certifications.itEssentials.title",
      issuerKey: "certifications.itEssentials.issuer",
      dateKey: "certifications.itEssentials.date",
      descriptionKey: "certifications.itEssentials.description",
      file: "/certificates/CISCO_IT_Essential.pdf",
      color: "from-secondary to-accent",
      iconBg: "bg-secondary",
    },
    {
      titleKey: "certifications.safety.title",
      issuerKey: "certifications.safety.issuer",
      dateKey: "certifications.safety.date",
      descriptionKey: "certifications.safety.description",
      file: "/certificates/certificato_sicurezza_lavoro.pdf",
      color: "from-accent to-primary",
      iconBg: "bg-accent",
    },
    {
      titleKey: "certifications.internship.title",
      issuerKey: "certifications.internship.issuer",
      dateKey: "certifications.internship.date",
      descriptionKey: "certifications.internship.description",
      file: "/certificates/certificazione_wartsila.pdf",
      color: "from-primary to-accent",
      iconBg: "bg-primary",
    },
  ];

  return (
    <section
      id="certifications"
      className={`
        min-h-screen py-24 relative
        transition-all duration-700
        ${isActive ? "opacity-100" : "opacity-50"}
      `}
    >
      <div className="container mx-auto px-4 pl-28 md:pl-40">
        {/* Section Header */}
        <div className="max-w-4xl mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">{t('nav.certifications')}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t('certifications.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {t('certifications.subtitle')}
          </p>
        </div>

        {/* Certificates Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl">
          {certificates.map((cert, index) => (
            <div
              key={index}
              className="group relative bg-card/30 rounded-2xl border border-border/30 overflow-hidden hover:border-primary/30 transition-all duration-500"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Gradient accent */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${cert.color}`} />
              
              {/* Background glow on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${cert.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

              <div className="relative p-6">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${cert.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <Award className="w-6 h-6 text-background" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold mb-1 line-clamp-2">{t(cert.titleKey)}</h3>
                    <p className="text-sm text-muted-foreground">{t(cert.issuerKey)}</p>
                  </div>
                </div>

                {/* Date badge */}
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                    {t(cert.dateKey)}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-6 line-clamp-3">
                  {t(cert.descriptionKey)}
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                    asChild
                  >
                    <a href={cert.file} download>
                      <Download className="mr-2 h-4 w-4" />
                      {t('certifications.download')}
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border/50 hover:bg-primary/10"
                    asChild
                  >
                    <a href={cert.file} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CertificationsSection;
