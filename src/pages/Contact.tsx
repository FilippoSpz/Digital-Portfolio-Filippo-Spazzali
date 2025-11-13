import { useState } from "react";
import { Mail, Phone, Linkedin, Github, Instagram, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create mailto link with form data
    const mailtoLink = `mailto:spazzalifilippo@icloud.com?subject=${encodeURIComponent(
      formData.subject
    )}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    )}`;
    
    window.location.href = mailtoLink;
    
    toast({
      title: "Opening email client",
      description: "Your default email client will open with the message pre-filled.",
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6" />,
      label: "Email",
      value: "spazzalifilippo@icloud.com",
      link: "mailto:spazzalifilippo@icloud.com",
      color: "from-primary to-secondary",
    },
    {
      icon: <Phone className="h-6 w-6" />,
      label: "Phone",
      value: "+39 377 689 3133",
      link: "tel:+393776893133",
      color: "from-secondary to-accent",
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      label: "Location",
      value: "Trieste, Italy",
      link: null,
      color: "from-accent to-primary",
    },
  ];

  const socialLinks = [
    {
      icon: <Linkedin className="h-6 w-6" />,
      label: "LinkedIn",
      link: "https://www.linkedin.com/in/filippo-spazzali",
      color: "hover:text-primary",
    },
    {
      icon: <Github className="h-6 w-6" />,
      label: "GitHub",
      link: "https://github.com/filippospazzali",
      color: "hover:text-secondary",
    },
  ];

  return (
    <section id="contact" className="min-h-screen pt-24 pb-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Get In <span className="gradient-text">Touch</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Have a project in mind or want to collaborate? I'd love to hear from you!
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Cards */}
            {contactInfo.map((info, index) => (
              <div
                key={index}
                className="glass-card p-6 hover-lift"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${info.color} text-white mb-4`}>
                  {info.icon}
                </div>
                <h3 className="font-semibold mb-2">{info.label}</h3>
                {info.link ? (
                  <a
                    href={info.link}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {info.value}
                  </a>
                ) : (
                  <p className="text-muted-foreground">{info.value}</p>
                )}
              </div>
            ))}

            {/* Social Links */}
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4">Connect With Me</h3>
              <div className="flex gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-3 glass-card hover-lift rounded-full ${social.color} transition-colors`}
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="glass-card p-8 animate-slide-up">
              <h2 className="text-2xl font-bold mb-6 gradient-text">Send Me a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Your Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Your Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Project Discussion"
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell me about your project..."
                    rows={6}
                    className="w-full"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white"
                >
                  <Send className="mr-2 h-5 w-5" />
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
