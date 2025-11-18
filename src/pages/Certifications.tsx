import { Award, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const Certifications = () => {
  const { t } = useLanguage();
  const certificates = [
    {
      titleKey: "certifications.ccna.title",
      issuerKey: "certifications.ccna.issuer",
      dateKey: "certifications.ccna.date",
      descriptionKey: "certifications.ccna.description",
      file: "/certificates/FilippoSpazzaliCCNAv7_-_certificate.pdf",
      color: "from-primary to-secondary",
    },
    {
      titleKey: "certifications.itEssentials.title",
      issuerKey: "certifications.itEssentials.issuer",
      dateKey: "certifications.itEssentials.date",
      descriptionKey: "certifications.itEssentials.description",
      file: "/certificates/CISCO_IT_Essential.pdf",
      color: "from-secondary to-accent",
    },
    {
      titleKey: "certifications.safety.title",
      issuerKey: "certifications.safety.issuer",
      dateKey: "certifications.safety.date",
      descriptionKey: "certifications.safety.description",
      file: "/certificates/certificato_sicurezza_lavoro.pdf",
      color: "from-accent to-primary",
    },
    {
      titleKey: "certifications.internship.title",
      issuerKey: "certifications.internship.issuer",
      dateKey: "certifications.internship.date",
      descriptionKey: "certifications.internship.description",
      file: "/certificates/certificazione_wartsila.pdf",
      color: "from-primary to-accent",
    },
  ];

  return (
    <section id="certifications" className="min-h-screen pt-24 pb-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <Award className="inline-block mr-3 mb-2 h-10 w-10 text-primary" />
            {t('certifications.title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('certifications.subtitle')}
          </p>
        </div>

        {/* Certificates Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {certificates.map((cert, index) => (
            <div
              key={index}
              className="glass-card p-8 hover-lift group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Header with gradient */}
              <div className={`mb-6 p-4 rounded-xl bg-gradient-to-br ${cert.color} text-white`}>
                <h3 className="text-xl font-bold mb-2">{t(cert.titleKey)}</h3>
                <p className="text-sm opacity-90">{t(cert.issuerKey)}</p>
              </div>

              {/* Date */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                  {t(cert.dateKey)}
                </span>
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {t(cert.descriptionKey)}
              </p>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="default"
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
                  className="flex-1 border-primary/50 hover:bg-primary/10"
                  asChild
                >
                  <a href={cert.file} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {t('certifications.view')}
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Certifications;
