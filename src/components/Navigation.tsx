import { useState, useEffect } from "react";
import { Menu, X, Download, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const Navigation = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Update active section based on scroll position
      const sections = ["home", "about", "skills", "certifications", "portfolio", "contact"];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsOpen(false);
    }
  };

  const navLinks = [
    { id: "home", label: t('nav.home') },
    { id: "about", label: t('nav.about') },
    { id: "skills", label: t('nav.skills') },
    { id: "certifications", label: t('nav.certifications') },
    { id: "portfolio", label: t('nav.portfolio') },
    { id: "contact", label: t('nav.contact') },
  ];
  
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'it' : 'en');
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        isScrolled ? "glass-card shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <button 
            onClick={() => scrollToSection("home")} 
            className="text-xl font-bold gradient-text cursor-pointer z-50 relative"
          >
            FS
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`transition-colors hover:text-primary ${
                  activeSection === link.id
                    ? "text-primary font-semibold"
                    : "text-foreground/80"
                }`}
              >
                {link.label}
              </button>
            ))}
            <Button
              variant="default"
              size="sm"
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              asChild
            >
              <a href="/certificates/Filippo_Spazzali_Resume.pdf" download>
                <Download className="mr-2 h-4 w-4" />
                {t('nav.downloadCV')}
              </a>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="border border-primary/30 hover:bg-primary/10"
            >
              <Languages className="h-4 w-4 mr-2" />
              {language.toUpperCase()}
            </Button>
          </div>

          {/* Mobile Menu Button and Language Switcher */}
          <div className="md:hidden flex items-center gap-2 z-50">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="border border-primary/30 hover:bg-primary/10 px-3"
            >
              <Languages className="h-4 w-4 mr-1" />
              {language.toUpperCase()}
            </Button>
            <button
              className="text-foreground hover:text-primary transition-colors p-2"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 animate-fade-in glass-card mt-2 rounded-lg p-4">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`block w-full text-left py-2 transition-colors hover:text-primary ${
                  activeSection === link.id
                    ? "text-primary font-semibold"
                    : "text-foreground/80"
                }`}
              >
                {link.label}
              </button>
            ))}
            <Button
              variant="default"
              size="sm"
              className="w-full mt-4 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              asChild
            >
              <a href="/certificates/Filippo_Spazzali_Resume.pdf" download>
                <Download className="mr-2 h-4 w-4" />
                {t('nav.downloadCV')}
              </a>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
