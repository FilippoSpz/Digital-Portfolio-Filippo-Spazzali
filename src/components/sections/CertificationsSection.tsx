import { Award, Download, ExternalLink, ShieldCheck } from 'lucide-react';
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
            <Reveal key={cert.titleKey} variant="zoom" delay={index * 90}>
              <div className="group holo-sheen relative flex flex-col h-full glass border-gradient rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1.5">
                {/* Verified chip */}
                <div className="absolute top-5 right-5 flex items-center gap-1 text-[10px] uppercase tracking-wider text-secondary/80">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified
                </div>

                <div className="flex flex-col items-center text-center">
                  {/* Holographic seal */}
                  <div className="relative w-20 h-20 mb-5">
                    <div className={`absolute inset-0 rounded-full opacity-80 animate-spin-slow bg-gradient-to-br ${cert.gradient}`} style={{ WebkitMask: 'radial-gradient(transparent 58%, #000 60%)', mask: 'radial-gradient(transparent 58%, #000 60%)' }} />
                    <div className={`absolute inset-2 rounded-full bg-gradient-to-br ${cert.gradient} flex items-center justify-center shadow-lg`}>
                      <Award className="w-8 h-8 text-background" />
                    </div>
                    <div className={`absolute inset-2 rounded-full blur-lg opacity-50 bg-gradient-to-br ${cert.gradient}`} />
                  </div>

                  <h3 className="font-display text-lg font-bold mb-1 line-clamp-2">{t(cert.titleKey)}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{t(cert.issuerKey)}</p>
                  <span className="inline-block px-3 py-1 mb-4 glass rounded-full text-xs font-semibold text-primary">{t(cert.dateKey)}</span>
                  <p className="text-sm text-muted-foreground mb-6 line-clamp-3">{t(cert.descriptionKey)}</p>
                </div>

                <div className="flex gap-3 mt-auto">
                  <Button variant="default" size="sm" className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90" asChild>
                    <a href={cert.file} download>
                      <Download className="mr-2 h-4 w-4" />
                      {t('certifications.download')}
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 glass hover:bg-primary/10" asChild>
                    <a href={cert.file} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      {t('certifications.view')}
                    </a>
                  </Button>
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
