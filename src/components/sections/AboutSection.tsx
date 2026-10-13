import { Languages, User } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import SectionHeader from '@/components/common/SectionHeader';
import Reveal from '@/components/common/Reveal';

interface AboutSectionProps {
  isActive: boolean;
}

/** Who I am: the short intro, the professional summary and the languages I speak (the timeline is in Experience). */
const AboutSection = ({ isActive }: AboutSectionProps) => {
  const { t, language } = useLanguage();

  const languageNames = {
    italian: language === 'en' ? 'Italian' : 'Italiano',
    english: language === 'en' ? 'English' : 'Inglese',
  };

  return (
    <section
      id="about"
      data-planet="about"
      className={`min-h-screen py-24 relative overflow-hidden flex items-center transition-opacity duration-700 ${isActive ? 'opacity-100' : 'opacity-50'}`}
    >
      <div className="container mx-auto px-4 md:px-8 lg:pl-[25rem] w-full">
        <SectionHeader icon={User} badge={t('nav.about')} title={t('about.title')} subtitle={t('about.intro')} index="02" className="mb-12" />

        {/* Professional summary */}
        <Reveal variant="blur" delay={100} className="max-w-4xl mx-auto lg:mx-0">
          <div className="relative rounded-2xl glass border-gradient p-8 md:p-10">
            <h3 className="font-display text-2xl font-bold gradient-text mb-4">{t('about.professionalSummary')}</h3>
            <p className="text-lg text-muted-foreground leading-relaxed">{t('about.professionalSummaryText')}</p>
          </div>
        </Reveal>

        {/* Languages */}
        <div className="mt-14">
          <Reveal variant="up">
            <div className="flex items-center gap-3 mb-6 justify-center lg:justify-start">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                <Languages className="w-5 h-5 text-background" />
              </div>
              <h3 className="font-display text-xl font-bold">{t('about.languages')}</h3>
            </div>
          </Reveal>

          <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
            {[
              { flag: '🇮🇹', name: languageNames.italian, level: t('about.nativeLevel') },
              { flag: '🇬🇧', name: languageNames.english, level: t('about.languagesText') },
            ].map((lang, i) => (
              <Reveal key={lang.name} variant="up" delay={i * 100}>
                <div className="glass rounded-xl px-8 py-6 flex items-center gap-5 transition-colors duration-300 hover:border-primary/60 min-w-[240px]">
                  <span className="text-4xl">{lang.flag}</span>
                  <div>
                    <h4 className="font-semibold text-lg">{lang.name}</h4>
                    <p className="text-sm text-muted-foreground">{lang.level}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
