import { Mail, Phone, Linkedin, Github, Instagram } from "lucide-react";

const Contact = () => {
  const contactMethods = [
    {
      icon: <Mail className="h-8 w-8" />,
      label: "Email",
      value: "filippospazzali@gmail.com",
      link: "mailto:filippospazzali@gmail.com",
    },
    {
      icon: <Phone className="h-8 w-8" />,
      label: "Phone",
      value: "+39 320 171 0095",
      link: "tel:+393201710095",
    },
    {
      icon: <Linkedin className="h-8 w-8" />,
      label: "LinkedIn",
      value: "filippospazzali",
      link: "https://www.linkedin.com/in/filippospazzali/",
    },
    {
      icon: <Github className="h-8 w-8" />,
      label: "GitHub",
      value: "filippospz",
      link: "https://github.com/filippospz/",
    },
    {
      icon: <Instagram className="h-8 w-8" />,
      label: "Instagram",
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
            Let's <span className="gradient-text">Connect</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Feel free to reach out to me using any of the contact methods below. I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
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
