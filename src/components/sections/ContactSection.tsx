import { Mail, Phone, Linkedin, Github, Instagram, Send } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ContactSectionProps {
  isActive: boolean;
}

const ContactSection = ({ isActive }: ContactSectionProps) => {
  const { t } = useLanguage();

  const contactMethods = [
    {
      icon: Mail,
      label: t('contact.email'),
      value: "spazzalifilippo@icloud.com",
      link: "mailto:spazzalifilippo@icloud.com",
      color: "from-primary to-secondary",
    },
    {
      icon: Phone,
      label: t('contact.phone'),
      value: "+39 377 689 3133",
      link: "tel:+393776893133",
      color: "from-secondary to-accent",
    },
    {
      icon: Linkedin,
      label: t('contact.linkedin'),
      value: "filippospazzali",
      link: "https://www.linkedin.com/in/filippospazzali/",
      color: "from-accent to-primary",
    },
    {
      icon: Github,
      label: t('contact.github'),
      value: "filippospz",
      link: "https://github.com/filippospz/",
      color: "from-primary to-accent",
    },
    {
      icon: Instagram,
      label: t('contact.instagram'),
      value: "@filippo_spz",
      link: "https://www.instagram.com/filippo_spz/",
      color: "from-secondary to-primary",
    },
  ];

  return (
    <section
      id="contact"
      className={`
        min-h-screen py-24 relative flex items-center
        transition-all duration-700
        ${isActive ? "opacity-100" : "opacity-50"}
      `}
    >
      {/* Mobile/Tablet centered, Desktop with left padding */}
      <div className="container mx-auto px-4 md:px-8 lg:pl-40">
        {/* Section Header */}
        <div className="max-w-4xl mb-16 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 mb-6">
            <Send className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">{t('nav.contact')}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold italic uppercase tracking-wide mb-4">
            {t('contact.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0">
            {t('contact.subtitle')}
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto lg:mx-0">
          {contactMethods.map((method, index) => {
            const Icon = method.icon;
            return (
              <a
                key={index}
                href={method.link}
                target={method.link.startsWith('http') ? '_blank' : undefined}
                rel={method.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="group relative bg-card/30 rounded-2xl border border-border/30 p-6 hover:border-primary/30 transition-all duration-500 hover:scale-[1.02]"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Hover gradient */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${method.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                <div className="relative">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5 text-background" />
                  </div>

                  {/* Label */}
                  <h3 className="font-semibold mb-1">{method.label}</h3>

                  {/* Value */}
                  <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    {method.value}
                  </p>
                </div>
              </a>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-16 max-w-4xl mx-auto lg:mx-0">
          <div className="bg-card/20 rounded-2xl border border-border/30 p-8 text-center">
            <p className="text-muted-foreground">
              {t('about.contactCTA')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
