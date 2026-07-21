import { Send } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import SectionHeader from '@/components/common/SectionHeader';
import Reveal from '@/components/common/Reveal';
import { contactMethods } from '@/data/contact';

interface ContactSectionProps {
  isActive: boolean;
}

const ContactSection = ({ isActive }: ContactSectionProps) => {
  const { t } = useLanguage();

  return (
    <section
      id="contact"
      className={`min-h-screen py-24 relative flex items-center transition-opacity duration-700 ${isActive ? 'opacity-100' : 'opacity-50'}`}
    >
      <div className="container mx-auto px-4 md:px-8 lg:pl-40">
        <SectionHeader
          icon={Send}
          badge={t('nav.contact')}
          title={t('contact.title')}
          subtitle={t('contact.subtitle')}
          accent="accent"
          className="mb-16"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto lg:mx-0">
          {contactMethods.map((method, index) => {
            const Icon = method.icon;
            const isExternal = method.link.startsWith('http');
            return (
              <Reveal key={method.labelKey} variant="up" delay={index * 80}>
                <a
                  href={method.link}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  className="group relative block h-full glass border-gradient rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1 hover:scale-[1.02]"
                >
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${method.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  <div className="relative">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${method.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5 text-background" />
                  </div>
                  <h3 className="font-semibold mb-1">{t(method.labelKey)}</h3>
                  <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{method.value}</p>
                </div>
                </a>
              </Reveal>
            );
          })}
        </div>

        <Reveal variant="up" className="mt-16 max-w-4xl mx-auto lg:mx-0">
          <div className="glass border-gradient rounded-2xl p-8 text-center">
            <p className="text-muted-foreground">{t('about.contactCTA')}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default ContactSection;
