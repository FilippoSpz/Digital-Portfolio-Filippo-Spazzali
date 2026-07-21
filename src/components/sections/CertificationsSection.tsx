import { Award, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import SectionHeader from '@/components/common/SectionHeader';
import Reveal from '@/components/common/Reveal';
import { certifications } from '@/data/certifications';

interface CertificationsSectionProps {
  isActive: boolean;
}

const CertificationsSection = ({ isActive }: CertificationsSectionProps) => {
  const { t } = useLanguage();

  return (
    <section
      id="certifications"
      className={`min-h-screen py-24 relative transition-opacity duration-700 ${isActive ? 'opacity-100' : 'opacity-50'}`}
    >
      <div className="container mx-auto px-4 md:px-8 lg:pl-[25rem]">
        <SectionHeader
          icon={Award}
          badge={t('nav.certifications')}
          title={t('certifications.title')}
          subtitle={t('certifications.subtitle')}
          accent="primary"
          index="03"
          className="mb-16"
        />

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto lg:mx-0">
          {certifications.map((cert, index) => (
            <Reveal key={cert.titleKey} variant="up" delay={index * 90}>
              <div className="group relative glass border-gradient rounded-2xl overflow-hidden h-full transition-all duration-500 hover:-translate-y-1">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${cert.gradient}`} />
              <div className={`absolute inset-0 bg-gradient-to-br ${cert.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

              <div className="relative p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${cert.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <Award className="w-6 h-6 text-background" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold mb-1 line-clamp-2">{t(cert.titleKey)}</h3>
                    <p className="text-sm text-muted-foreground">{t(cert.issuerKey)}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">{t(cert.dateKey)}</span>
                </div>

                <p className="text-sm text-muted-foreground mb-6 line-clamp-3">{t(cert.descriptionKey)}</p>

                <div className="flex gap-3">
                  <Button variant="default" size="sm" className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90" asChild>
                    <a href={cert.file} download>
                      <Download className="mr-2 h-4 w-4" />
                      {t('certifications.download')}
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 border-border/50 hover:bg-primary/10" asChild>
                    <a href={cert.file} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      {t('certifications.view')}
                    </a>
                  </Button>
                </div>
              </div>
            </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CertificationsSection;
