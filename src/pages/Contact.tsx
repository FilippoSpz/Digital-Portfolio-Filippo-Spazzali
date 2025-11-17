import { Mail, Phone, Linkedin, Github, Instagram } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Contact = () => {
  const { t } = useLanguage();
  
  const contactMethods = [
    {
      icon: <Mail className="h-8 w-8" />,
      label: t('contact.email'),
      value: "spazzalifilippo@icloud.com",
      link: "mailto:spazzalifilippo@icloud.com",
    },
    {
      icon: <Phone className="h-8 w-8" />,
      label: t('contact.phone'),
      value: "+39 377 689 3133",
      link: "tel:+393776893133",
    },
    {
      icon: <Linkedin className="h-8 w-8" />,
      label: t('contact.linkedin'),
      value: "filippospazzali",
      link: "https://www.linkedin.com/in/filippospazzali/",
    },
    {
      icon: <Github className="h-8 w-8" />,
      label: t('contact.github'),
      value: "filippospz",
      link: "https://github.com/filippospz/",
    },
    {
      icon: <Instagram className="h-8 w-8" />,
      label: t('contact.instagram'),
      value: "@filippo_spz",
      link: "https://www.instagram.com/filippo_spz/",
    },
  ];

  return (
    <section id="contact" className="min-h-screen pt-24 pb-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t('contact.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {contactMethods.map((method, index) => (
            <a
              key={index}
              href={method.link}
              target={method.link.startsWith('http') ? '_blank' : undefined}
              rel={method.link.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="glass-card p-6 hover-lift transition-all"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground mb-4">
                {method.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2">{method.label}</h3>
              <p className="text-muted-foreground">{method.value}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Contact;
