import { memo } from 'react';
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
      data-planet="contact"
      className={`min-h-screen py-24 relative flex items-center transition-opacity duration-700 ${isActive ? 'opacity-100' : 'opacity-50'}`}
    >
      <div className="container mx-auto px-4 md:px-8 lg:pl-[25rem] w-full">
        <SectionHeader
          icon={Send}
          badge={t('nav.contact')}
          title={t('contact.title')}
          subtitle={t('contact.subtitle')}
          index="08"
          className="mb-14"
        />

        {/* Transmission console */}
        <Reveal variant="up" className="max-w-4xl mx-auto lg:mx-0">
          <div className="glass border-gradient rounded-2xl p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 font-mono text-xs uppercase text-muted-foreground">
              <span className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-primary animate-pulse" />
                {t('contact.channels')}
              </span>
              <span className="flex items-center gap-1.5">
                {t('contact.status')}:
                <span className="text-primary">{t('contact.online')}</span>
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
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
                      className="group flex items-center gap-4 glass rounded-xl p-4 transition-colors duration-300 hover:border-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      {/* Still on hover: the whole channel fills with Uranus' cyan, the icon tile turns dark. */}
                      <div
                        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${method.gradient} flex items-center justify-center shrink-0 text-background transition-colors duration-300 group-hover:bg-none group-hover:bg-background group-hover:text-primary`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground transition-colors duration-300 group-hover:text-primary-foreground/75">
                          {t(method.labelKey)}
                        </div>
                        <div className="font-medium break-words">{method.value}</div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
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

        {/* The planet maps are CC BY 4.0: their source is credited here. */}
        <p className="mt-10 text-center text-[11px] text-muted-foreground/70">
          {t('contact.credits')}{' '}
          <a href="https://www.solarsystemscope.com/textures/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 transition-colors hover:text-primary">
            Solar System Scope
          </a>{' '}
          (CC BY 4.0)
        </p>
      </div>
    </section>
  );
};

export default memo(ContactSection);
