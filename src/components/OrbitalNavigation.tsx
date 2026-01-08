import { useState, useEffect, useCallback } from "react";
import { Home, User, Code2, Award, Briefcase, Mail, Download, Languages, Menu, X, FileDown } from "lucide-react";
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

  // Planet colors matching solar system theme - reduced orbit radii to stay on screen
  const sections = [
    { id: "home", icon: Home, label: t('nav.home'), color: "#bd93f9", size: 28, orbitRadius: 50, speed: 1 },
    { id: "about", icon: User, label: t('nav.about'), color: "#8be9fd", size: 26, orbitRadius: 70, speed: 0.8 },
    { id: "skills", icon: Code2, label: t('nav.skills'), color: "#50fa7b", size: 24, orbitRadius: 90, speed: 0.6 },
    { id: "certifications", icon: Award, label: t('nav.certifications'), color: "#ffb86c", size: 22, orbitRadius: 110, speed: 0.5 },
    { id: "portfolio", icon: Briefcase, label: t('nav.portfolio'), color: "#ff79c6", size: 20, orbitRadius: 130, speed: 0.4 },
    { id: "contact", icon: Mail, label: t('nav.contact'), color: "#f1fa8c", size: 18, orbitRadius: 150, speed: 0.35 },
  ];

  // Continuous rotation animation
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.3) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'it' : 'en');
  }, [language, setLanguage]);

  const handleSectionClick = useCallback((sectionId: string) => {
    onSectionChange(sectionId);
    setMobileMenuOpen(false);
  }, [onSectionChange]);

  const handleMobileMenuToggle = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  // Calculate planet position on orbit - keeping planets in visible area
  const getPlanetPosition = (orbitRadius: number, speed: number, baseAngle: number) => {
    const angle = (rotation * speed + baseAngle) * (Math.PI / 180);
    // Keep planets on right half of orbit (visible area)
    const clampedX = Math.cos(angle) * orbitRadius;
    const clampedY = Math.sin(angle) * orbitRadius;
    return { x: clampedX, y: clampedY };
  };

  // Mobile solar system component
  const MobileSolarSystem = () => (
    <div className="relative w-full h-[400px] flex items-center justify-center">
      {/* Orbit Rings */}
      {sections.map((section) => (
        <div
          key={`mobile-orbit-${section.id}`}
          className="absolute rounded-full border transition-all duration-500"
          style={{
            width: section.orbitRadius * 2,
            height: section.orbitRadius * 2,
            borderColor: activeSection === section.id 
              ? `${section.color}40` 
              : 'rgba(255,255,255,0.08)',
            borderWidth: activeSection === section.id ? 2 : 1,
          }}
        />
      ))}

      {/* Central Sun (Profile) */}
      <button
        type="button"
        onClick={() => handleSectionClick("home")}
        className="absolute z-20 group touch-manipulation"
      >
        <div 
          className="absolute inset-[-15px] rounded-full animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(189,147,249,0.4) 0%, rgba(255,121,198,0.2) 50%, transparent 70%)',
          }}
        />
        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary/60">
          <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
        </div>
      </button>

      {/* Orbiting Planets */}
      {sections.map((section, index) => {
        const Icon = section.icon;
        const isActive = activeSection === section.id;
        const baseAngle = index * 60;
        const pos = getPlanetPosition(section.orbitRadius, section.speed, baseAngle);

        return (
          <button
            key={`mobile-planet-${section.id}`}
            type="button"
            onClick={() => handleSectionClick(section.id)}
            onPointerDown={(e) => {
              e.preventDefault();
              handleSectionClick(section.id);
            }}
            className="absolute z-10 transition-transform duration-300 touch-manipulation select-none"
            style={{
              transform: `translate(${pos.x}px, ${pos.y}px)`,
              WebkitTapHighlightColor: 'transparent',
              cursor: 'pointer',
            }}
          >
            <div 
              className={`
                absolute inset-[-4px] rounded-full transition-all duration-500
                ${isActive ? 'opacity-100 scale-125' : 'opacity-0'}
              `}
              style={{
                background: `radial-gradient(circle, ${section.color}60 0%, transparent 70%)`,
                boxShadow: isActive ? `0 0 20px ${section.color}80` : 'none',
              }}
            />
            
            <div
              className={`
                relative rounded-full flex items-center justify-center transition-all duration-300
                ${isActive ? 'scale-125' : ''}
              `}
              style={{
                width: section.size,
                height: section.size,
                background: isActive 
                  ? `linear-gradient(135deg, ${section.color}, ${section.color}99)`
                  : `linear-gradient(135deg, ${section.color}80, ${section.color}40)`,
                boxShadow: isActive 
                  ? `0 0 15px ${section.color}60`
                  : `inset -2px -2px 6px rgba(0,0,0,0.3)`,
              }}
            >
              <Icon 
                style={{
                  width: section.size * 0.5,
                  height: section.size * 0.5,
                  color: isActive ? '#282a36' : 'rgba(40,42,54,0.8)',
                }}
              />
            </div>

            {/* Label */}
            {isActive && (
              <div
                className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg whitespace-nowrap bg-card/95 backdrop-blur-sm border border-border/50 text-xs font-medium"
                style={{ color: section.color }}
              >
                {section.label}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Desktop Solar System Navigation */}
      <nav className="fixed left-0 top-0 h-screen w-[320px] z-[100] hidden lg:flex items-center justify-center">
        {/* Background shadow - dark gradient on left */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.4) 70%, transparent 100%)',
            boxShadow: '20px 0 60px 30px rgba(0,0,0,0.5)',
          }}
        />
        
        {/* Solar System Container - centered and contained */}
        <div className="relative w-[340px] h-[340px] flex items-center justify-center" style={{ marginLeft: '10px' }}>
          
          {/* Orbit Rings */}
          {sections.map((section) => (
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
              className="absolute inset-[-16px] rounded-full animate-pulse"
              style={{
                background: 'radial-gradient(circle, rgba(189,147,249,0.4) 0%, rgba(255,121,198,0.2) 50%, transparent 70%)',
              }}
            />
            <div 
              className="absolute inset-[-10px] rounded-full animate-spin-slow"
              style={{
                background: 'conic-gradient(from 0deg, rgba(189,147,249,0.3), rgba(139,233,253,0.3), rgba(255,121,198,0.3), rgba(189,147,249,0.3))',
              }}
            />
            
            {/* Profile photo (Sun) */}
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary/60 group-hover:border-primary transition-all duration-500 group-hover:scale-110">
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
            const baseAngle = index * 60;
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
                    absolute inset-[-5px] rounded-full transition-all duration-500
                    ${isActive ? 'opacity-100 scale-125' : 'opacity-0 scale-100 group-hover:opacity-60 group-hover:scale-110'}
                  `}
                  style={{
                    background: `radial-gradient(circle, ${section.color}60 0%, ${section.color}20 50%, transparent 70%)`,
                    boxShadow: isActive ? `0 0 25px ${section.color}80` : 'none',
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

        {/* Bottom Actions - Fixed Position with proper pointer events */}
        <div className="absolute bottom-8 left-8 flex flex-col gap-3 z-[101]">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleLanguage();
            }}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-card/90 border border-border/50 hover:bg-primary/20 hover:border-primary/50 transition-all duration-300 backdrop-blur-sm hover:scale-110 cursor-pointer"
            title={language === 'en' ? 'Switch to Italian' : 'Switch to English'}
            type="button"
          >
            <span className="text-sm font-bold text-foreground">{language === 'en' ? 'EN' : 'IT'}</span>
          </button>

          <a
            href="/certificates/Filippo_Spazzali_Resume.pdf"
            download="Filippo_Spazzali_Resume.pdf"
            className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-secondary hover:opacity-90 transition-all duration-300 hover:scale-110 group relative overflow-hidden cursor-pointer"
            title={t('nav.downloadCV')}
            style={{
              boxShadow: '0 0 20px rgba(189,147,249,0.4)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <FileDown className="w-5 h-5 text-background group-hover:animate-bounce" />
            <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-full" />
          </a>
        </div>
      </nav>

      {/* Mobile/Tablet Header with Menu Button */}
      <header className="fixed top-0 left-0 right-0 z-[100] lg:hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-background/95 backdrop-blur-xl border-b border-border/30">
          <button 
            type="button"
            onClick={() => handleSectionClick("home")} 
            className="flex items-center gap-3 touch-manipulation"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/50">
              <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <span className="font-semibold text-foreground">Filippo Spazzali</span>
          </button>

          <button
            type="button"
            onClick={handleMobileMenuToggle}
            onPointerDown={(e) => e.currentTarget.click()}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-card/50 border border-border/50 touch-manipulation select-none active:bg-primary/20"
            style={{ WebkitTapHighlightColor: 'transparent', cursor: 'pointer' }}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu with Solar System */}
        <div
          className={`
            absolute top-full left-0 right-0 bg-background/98 backdrop-blur-xl border-b border-border/30
            transition-all duration-500 overflow-hidden
            ${mobileMenuOpen ? "max-h-[550px] opacity-100" : "max-h-0 opacity-0"}
          `}
        >
          <div className="p-4">
            {/* Solar System Navigation */}
            <MobileSolarSystem />

            {/* Bottom Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-border/30 mt-4">
              <button
                type="button"
                onClick={toggleLanguage}
                onPointerDown={(e) => {
                  e.preventDefault();
                  toggleLanguage();
                }}
                className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 bg-card/50 border border-border/50 active:bg-primary/20 transition-colors touch-manipulation select-none"
                style={{ WebkitTapHighlightColor: 'transparent', cursor: 'pointer' }}
              >
                <Languages className="w-4 h-4" />
                <span className="text-sm font-medium">{language === 'en' ? 'Italiano' : 'English'}</span>
              </button>
              <a
                href="/certificates/Filippo_Spazzali_Resume.pdf"
                download="Filippo_Spazzali_Resume.pdf"
                onPointerDown={(e) => {
                  e.currentTarget.click();
                }}
                className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-secondary relative overflow-hidden touch-manipulation select-none"
                style={{ WebkitTapHighlightColor: 'transparent', cursor: 'pointer' }}
              >
                <FileDown className="w-4 h-4 text-background" />
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
