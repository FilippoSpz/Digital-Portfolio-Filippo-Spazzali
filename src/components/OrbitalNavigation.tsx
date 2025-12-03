import { useState } from "react";
import { Home, User, Code2, Award, Briefcase, Mail, Download, Languages, Menu, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import profilePhoto from "@/assets/profile-photo.jpeg";

interface OrbitalNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const OrbitalNavigation = ({ activeSection, onSectionChange }: OrbitalNavigationProps) => {
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sections = [
    { id: "home", icon: Home, label: t('nav.home'), orbitIndex: 0 },
    { id: "about", icon: User, label: t('nav.about'), orbitIndex: 1 },
    { id: "skills", icon: Code2, label: t('nav.skills'), orbitIndex: 2 },
    { id: "certifications", icon: Award, label: t('nav.certifications'), orbitIndex: 3 },
    { id: "portfolio", icon: Briefcase, label: t('nav.portfolio'), orbitIndex: 4 },
    { id: "contact", icon: Mail, label: t('nav.contact'), orbitIndex: 5 },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'it' : 'en');
  };

  const handleSectionClick = (sectionId: string) => {
    onSectionChange(sectionId);
    setMobileMenuOpen(false);
  };

  // Get active section index for orbit animation
  const activeIndex = sections.findIndex(s => s.id === activeSection);

  return (
    <>
      {/* Desktop Orbital Navigation */}
      <nav className="fixed left-0 top-0 h-screen w-28 md:w-36 z-[100] hidden md:flex flex-col items-center justify-center">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-transparent" />
        
        {/* Solar System Container */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Central Sun (Profile) */}
          <button
            onClick={() => handleSectionClick("home")}
            className="relative group mb-6"
          >
            {/* Sun glow rings */}
            <div className="absolute inset-[-12px] rounded-full bg-gradient-to-r from-primary via-secondary to-accent opacity-50 blur-lg animate-pulse" />
            <div className="absolute inset-[-6px] rounded-full bg-gradient-to-r from-accent via-primary to-secondary opacity-30 blur-md animate-spin-slow" />
            
            {/* Profile photo (Sun) */}
            <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-primary/60 group-hover:border-primary transition-all duration-500 group-hover:scale-110">
              <img
                src={profilePhoto}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </button>

          {/* Orbital System */}
          <div className="relative w-full flex flex-col items-center gap-2">
            {sections.map((section, index) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              const isPassed = index <= activeIndex;
              
              // Calculate orbit size based on index
              const orbitSize = 40 + (index * 8);

              return (
                <div key={section.id} className="relative w-full flex items-center justify-center">
                  {/* Orbit ring indicator */}
                  <div 
                    className={`
                      absolute left-2 w-3 h-3 rounded-full transition-all duration-700
                      ${isPassed ? 'bg-gradient-to-r from-primary to-secondary scale-100' : 'bg-muted/30 scale-75'}
                    `}
                    style={{
                      boxShadow: isPassed ? '0 0 12px hsl(var(--primary) / 0.6)' : 'none'
                    }}
                  />
                  
                  {/* Connecting line */}
                  {index < sections.length - 1 && (
                    <div 
                      className={`
                        absolute left-[14px] top-full w-0.5 h-2 transition-all duration-700
                        ${isPassed ? 'bg-gradient-to-b from-primary/60 to-secondary/30' : 'bg-muted/20'}
                      `}
                    />
                  )}

                  {/* Planet button */}
                  <button
                    onClick={() => handleSectionClick(section.id)}
                    className={`
                      relative group flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-all duration-500
                      ${isActive ? "translate-x-2" : "hover:translate-x-1"}
                    `}
                  >
                    {/* Planet glow */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 blur-sm" />
                    )}
                    
                    {/* Planet icon */}
                    <div
                      className={`
                        relative rounded-xl flex items-center justify-center transition-all duration-500 ml-4
                        ${isActive 
                          ? "w-12 h-12 bg-gradient-to-br from-primary via-secondary to-accent shadow-lg" 
                          : "w-10 h-10 bg-card/80 border border-border/50 hover:bg-primary/20 hover:border-primary/50"
                        }
                      `}
                      style={{
                        boxShadow: isActive ? `0 0 20px hsl(var(--primary) / 0.5)` : 'none'
                      }}
                    >
                      <Icon className={`
                        transition-all duration-300
                        ${isActive ? "w-6 h-6 text-background" : "w-5 h-5 text-foreground/70"}
                      `} />
                    </div>

                    {/* Label */}
                    <span
                      className={`
                        text-sm font-medium whitespace-nowrap transition-all duration-300
                        ${isActive ? "text-foreground opacity-100" : "text-muted-foreground opacity-0 group-hover:opacity-100"}
                      `}
                    >
                      {section.label}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Bottom Actions */}
          <div className="relative z-10 mt-6 flex flex-col gap-3">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-card/50 border border-border/50 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
              title={language === 'en' ? 'Switch to Italian' : 'Switch to English'}
            >
              <span className="text-xs font-bold text-foreground">{language.toUpperCase()}</span>
            </button>

            {/* Download CV */}
            <a
              href="/certificates/Filippo_Spazzali_Resume.pdf"
              download
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary to-secondary hover:opacity-90 transition-all duration-300 hover:scale-105"
              title={t('nav.downloadCV')}
            >
              <Download className="w-5 h-5 text-background" />
            </a>
          </div>
        </div>
      </nav>

      {/* Mobile Header with Menu Button */}
      <header className="fixed top-0 left-0 right-0 z-[100] md:hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-background/90 backdrop-blur-xl border-b border-border/30">
          {/* Profile mini */}
          <button onClick={() => handleSectionClick("home")} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/50">
              <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <span className="font-semibold text-foreground">Filippo Spazzali</span>
          </button>

          {/* Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-card/50 border border-border/50"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`
            absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border/30
            transition-all duration-500 overflow-hidden
            ${mobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}
          `}
        >
          <div className="p-4 space-y-2">
            {sections.map((section, index) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              const isPassed = index <= activeIndex;

              return (
                <button
                  key={section.id}
                  onClick={() => handleSectionClick(section.id)}
                  className={`
                    w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300
                    ${isActive 
                      ? "bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30" 
                      : "hover:bg-card/50"
                    }
                  `}
                >
                  {/* Orbit indicator */}
                  <div 
                    className={`
                      w-3 h-3 rounded-full transition-all duration-500
                      ${isPassed ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-muted/30'}
                    `}
                    style={{
                      boxShadow: isPassed ? '0 0 8px hsl(var(--primary) / 0.5)' : 'none'
                    }}
                  />
                  
                  <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                    ${isActive 
                      ? "bg-gradient-to-br from-primary to-secondary" 
                      : "bg-card border border-border/50"
                    }
                  `}>
                    <Icon className={`w-5 h-5 ${isActive ? "text-background" : "text-foreground/70"}`} />
                  </div>
                  
                  <span className={`font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                    {section.label}
                  </span>
                </button>
              );
            })}

            {/* Mobile actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-border/30">
              <button
                onClick={toggleLanguage}
                className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 bg-card/50 border border-border/50"
              >
                <Languages className="w-4 h-4" />
                <span className="text-sm">{language === 'en' ? 'Italiano' : 'English'}</span>
              </button>
              <a
                href="/certificates/Filippo_Spazzali_Resume.pdf"
                download
                className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-secondary"
              >
                <Download className="w-4 h-4 text-background" />
                <span className="text-sm text-background font-medium">{t('nav.downloadCV')}</span>
              </a>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default OrbitalNavigation;
