import { Send, Radio, ArrowUpRight } from 'lucide-react';
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
      <div className="container mx-auto px-4 md:px-8 lg:pl-[25rem] w-full">
        <SectionHeader
          icon={Send}
          badge={t('nav.contact')}
          title={t('contact.title')}
          subtitle={t('contact.subtitle')}
          accent="accent"
          index="06"
          className="mb-14"
        />

        {/* Transmission console */}
        <Reveal variant="up" className="max-w-4xl mx-auto lg:mx-0">
          <div className="glass border-gradient rounded-2xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-6 font-mono text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-secondary animate-pulse" />
                INCOMING CHANNELS
              </span>
              <span className="flex items-center gap-1.5">
                STATUS:
                <span className="text-secondary">ONLINE</span>
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {contactMethods.map((method, index) => {
                const Icon = method.icon;
                const isExternal = method.link.startsWith('http');
                return (
                  <Reveal key={method.labelKey} variant="up" delay={index * 70}>
                    <a
                      href={method.link}
                      target={isExternal ? '_blank' : undefined}
                      rel={isExternal ? 'noopener noreferrer' : undefined}
                      className="group relative flex items-center gap-4 glass rounded-xl p-4 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
                    >
                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br ${method.gradient}`} />
                      <div className={`relative w-11 h-11 rounded-xl bg-gradient-to-br ${method.gradient} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-5 h-5 text-background" />
                      </div>
                      <div className="relative min-w-0 flex-1">
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{t(method.labelKey)}</div>
                        <div className="font-medium truncate">{method.value}</div>
                      </div>
                      <ArrowUpRight className="relative w-4 h-4 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </a>
                  </Reveal>
                );
              })}
            </div>

            <div className="mt-7 pt-6 border-t border-border/50 text-center">
              <p className="text-muted-foreground">{t('about.contactCTA')}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default ContactSection;
