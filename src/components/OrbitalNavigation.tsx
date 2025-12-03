import { useState, useEffect } from "react";
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
  const [rotation, setRotation] = useState(0);

  // Planet colors matching solar system theme
  const sections = [
    { id: "home", icon: Home, label: t('nav.home'), color: "#bd93f9", size: 36, orbitRadius: 70, speed: 1 },
    { id: "about", icon: User, label: t('nav.about'), color: "#8be9fd", size: 32, orbitRadius: 100, speed: 0.8 },
    { id: "skills", icon: Code2, label: t('nav.skills'), color: "#50fa7b", size: 30, orbitRadius: 130, speed: 0.6 },
    { id: "certifications", icon: Award, label: t('nav.certifications'), color: "#ffb86c", size: 28, orbitRadius: 160, speed: 0.5 },
    { id: "portfolio", icon: Briefcase, label: t('nav.portfolio'), color: "#ff79c6", size: 26, orbitRadius: 190, speed: 0.4 },
    { id: "contact", icon: Mail, label: t('nav.contact'), color: "#f1fa8c", size: 24, orbitRadius: 220, speed: 0.35 },
  ];

  // Continuous rotation animation
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.3) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'it' : 'en');
  };

  const handleSectionClick = (sectionId: string) => {
    onSectionChange(sectionId);
    setMobileMenuOpen(false);
  };

  const activeIndex = sections.findIndex(s => s.id === activeSection);

  // Calculate planet position on orbit
  const getPlanetPosition = (orbitRadius: number, speed: number, baseAngle: number) => {
    const angle = (rotation * speed + baseAngle) * (Math.PI / 180);
    return {
      x: Math.cos(angle) * orbitRadius,
      y: Math.sin(angle) * orbitRadius,
    };
  };

  return (
    <>
      {/* Desktop Solar System Navigation */}
      <nav className="fixed left-0 top-0 h-screen w-[280px] z-[100] hidden md:flex items-center justify-center pointer-events-none">
        {/* Background fade */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent pointer-events-none" />
        
        {/* Solar System Container */}
        <div className="relative w-[500px] h-[500px] flex items-center justify-center pointer-events-auto" style={{ marginLeft: '-110px' }}>
          
          {/* Orbit Rings */}
          {sections.map((section, index) => (
            <div
              key={`orbit-${section.id}`}
              className="absolute rounded-full border transition-all duration-500"
              style={{
                width: section.orbitRadius * 2,
                height: section.orbitRadius * 2,
                borderColor: activeSection === section.id 
                  ? `${section.color}40` 
                  : 'rgba(255,255,255,0.08)',
                borderWidth: activeSection === section.id ? 2 : 1,
                boxShadow: activeSection === section.id 
                  ? `0 0 20px ${section.color}30, inset 0 0 20px ${section.color}10` 
                  : 'none',
              }}
            />
          ))}

          {/* Central Sun (Profile) */}
          <button
            onClick={() => handleSectionClick("home")}
            className="absolute z-20 group"
          >
            {/* Sun corona effect */}
            <div 
              className="absolute inset-[-20px] rounded-full animate-pulse"
              style={{
                background: 'radial-gradient(circle, rgba(189,147,249,0.4) 0%, rgba(255,121,198,0.2) 50%, transparent 70%)',
              }}
            />
            <div 
              className="absolute inset-[-12px] rounded-full animate-spin-slow"
              style={{
                background: 'conic-gradient(from 0deg, rgba(189,147,249,0.3), rgba(139,233,253,0.3), rgba(255,121,198,0.3), rgba(189,147,249,0.3))',
              }}
            />
            
            {/* Profile photo (Sun) */}
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-3 border-primary/60 group-hover:border-primary transition-all duration-500 group-hover:scale-110">
              <img
                src={profilePhoto}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </button>

          {/* Orbiting Planets */}
          {sections.map((section, index) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            const baseAngle = index * 60; // Spread planets evenly
            const pos = getPlanetPosition(section.orbitRadius, section.speed, baseAngle);

            return (
              <button
                key={section.id}
                onClick={() => handleSectionClick(section.id)}
                className="absolute z-10 group transition-transform duration-300"
                style={{
                  transform: `translate(${pos.x}px, ${pos.y}px)`,
                }}
              >
                {/* Planet glow */}
                <div 
                  className={`
                    absolute inset-[-6px] rounded-full transition-all duration-500
                    ${isActive ? 'opacity-100 scale-125' : 'opacity-0 scale-100 group-hover:opacity-60 group-hover:scale-110'}
                  `}
                  style={{
                    background: `radial-gradient(circle, ${section.color}60 0%, ${section.color}20 50%, transparent 70%)`,
                    boxShadow: isActive ? `0 0 30px ${section.color}80` : 'none',
                  }}
                />
                
                {/* Planet body */}
                <div
                  className={`
                    relative rounded-full flex items-center justify-center transition-all duration-300
                    ${isActive ? 'scale-125' : 'group-hover:scale-110'}
                  `}
                  style={{
                    width: section.size,
                    height: section.size,
                    background: isActive 
                      ? `linear-gradient(135deg, ${section.color}, ${section.color}99)`
                      : `linear-gradient(135deg, ${section.color}80, ${section.color}40)`,
                    boxShadow: isActive 
                      ? `0 0 20px ${section.color}60, inset -3px -3px 10px rgba(0,0,0,0.3), inset 3px 3px 10px rgba(255,255,255,0.2)`
                      : `inset -2px -2px 8px rgba(0,0,0,0.3), inset 2px 2px 8px rgba(255,255,255,0.1)`,
                  }}
                >
                  <Icon 
                    className="transition-all duration-300"
                    style={{
                      width: section.size * 0.5,
                      height: section.size * 0.5,
                      color: isActive ? '#282a36' : 'rgba(40,42,54,0.8)',
                    }}
                  />
                </div>

                {/* Label tooltip */}
                <div
                  className={`
                    absolute left-full ml-3 px-3 py-1.5 rounded-lg whitespace-nowrap
                    bg-card/95 backdrop-blur-sm border border-border/50
                    transition-all duration-300 pointer-events-none
                    ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}
                  `}
                  style={{
                    boxShadow: `0 0 15px ${section.color}30`,
                  }}
                >
                  <span className="text-sm font-medium" style={{ color: section.color }}>
                    {section.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Actions - Fixed Position */}
        <div className="absolute bottom-8 left-8 flex flex-col gap-3 z-20">
          <button
            onClick={toggleLanguage}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-card/80 border border-border/50 hover:bg-primary/20 hover:border-primary/50 transition-all duration-300 backdrop-blur-sm"
            title={language === 'en' ? 'Switch to Italian' : 'Switch to English'}
          >
            <span className="text-sm font-bold text-foreground">{language.toUpperCase()}</span>
          </button>

          <a
            href="/certificates/Filippo_Spazzali_Resume.pdf"
            download
            className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-secondary hover:opacity-90 transition-all duration-300 hover:scale-110"
            title={t('nav.downloadCV')}
            style={{
              boxShadow: '0 0 20px rgba(189,147,249,0.4)',
            }}
          >
            <Download className="w-5 h-5 text-background" />
          </a>
        </div>
      </nav>

      {/* Mobile Header with Menu Button */}
      <header className="fixed top-0 left-0 right-0 z-[100] md:hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-background/95 backdrop-blur-xl border-b border-border/30">
          <button onClick={() => handleSectionClick("home")} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/50">
              <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <span className="font-semibold text-foreground">Filippo Spazzali</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-card/50 border border-border/50"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`
            absolute top-full left-0 right-0 bg-background/98 backdrop-blur-xl border-b border-border/30
            transition-all duration-500 overflow-hidden
            ${mobileMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}
          `}
        >
          <div className="p-4 space-y-2">
            {sections.map((section, index) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => handleSectionClick(section.id)}
                  className={`
                    w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300
                    ${isActive ? "bg-card/80" : "hover:bg-card/50"}
                  `}
                  style={{
                    borderLeft: isActive ? `3px solid ${section.color}` : '3px solid transparent',
                  }}
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
                    style={{
                      background: isActive 
                        ? `linear-gradient(135deg, ${section.color}, ${section.color}80)`
                        : `${section.color}30`,
                      boxShadow: isActive ? `0 0 15px ${section.color}50` : 'none',
                    }}
                  >
                    <Icon 
                      className="w-5 h-5" 
                      style={{ color: isActive ? '#282a36' : section.color }}
                    />
                  </div>
                  
                  <span 
                    className="font-medium"
                    style={{ color: isActive ? section.color : 'inherit' }}
                  >
                    {section.label}
                  </span>
                </button>
              );
            })}

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
