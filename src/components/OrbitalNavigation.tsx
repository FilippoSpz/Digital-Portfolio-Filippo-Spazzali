import { useState, useEffect } from "react";
import { Home, User, Code2, Award, Briefcase, Mail, Download, Languages } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import profilePhoto from "@/assets/profile-photo.jpeg";

interface OrbitalNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const OrbitalNavigation = ({ activeSection, onSectionChange }: OrbitalNavigationProps) => {
  const { language, setLanguage, t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);

  const sections = [
    { id: "home", icon: Home, label: t('nav.home'), color: "from-primary to-secondary", angle: 0 },
    { id: "about", icon: User, label: t('nav.about'), color: "from-secondary to-accent", angle: 60 },
    { id: "skills", icon: Code2, label: t('nav.skills'), color: "from-accent to-primary", angle: 120 },
    { id: "certifications", icon: Award, label: t('nav.certifications'), color: "from-primary to-accent", angle: 180 },
    { id: "portfolio", icon: Briefcase, label: t('nav.portfolio'), color: "from-secondary to-primary", angle: 240 },
    { id: "contact", icon: Mail, label: t('nav.contact'), color: "from-accent to-secondary", angle: 300 },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'it' : 'en');
  };

  // Calculate position on orbit based on angle
  const getPosition = (angle: number, radius: number) => {
    const radians = (angle - 90) * (Math.PI / 180);
    return {
      x: Math.cos(radians) * radius,
      y: Math.sin(radians) * radius,
    };
  };

  return (
    <>
      {/* Orbital Navigation - Fixed Left Side */}
      <nav className="fixed left-0 top-0 h-screen w-24 md:w-32 z-[100] flex flex-col items-center justify-center">
        {/* Cosmic Background for nav */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-transparent" />
        
        {/* Central Sun (Profile) */}
        <div className="relative z-10">
          <button
            onClick={() => onSectionChange("home")}
            className="relative group"
          >
            {/* Glow rings */}
            <div className="absolute inset-[-8px] rounded-full bg-gradient-to-r from-primary via-secondary to-accent opacity-60 blur-md animate-spin-slow" />
            <div className="absolute inset-[-4px] rounded-full bg-gradient-to-r from-accent via-primary to-secondary opacity-40 blur-sm animate-spin-reverse" />
            
            {/* Profile photo */}
            <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-primary/50 group-hover:border-primary transition-all duration-300 group-hover:scale-110">
              <img
                src={profilePhoto}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </button>
        </div>

        {/* Orbiting Planets (Sections) */}
        <div className="relative mt-8 flex flex-col gap-3">
          {sections.map((section, index) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            const isHovered = hoveredPlanet === section.id;

            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                onMouseEnter={() => setHoveredPlanet(section.id)}
                onMouseLeave={() => setHoveredPlanet(null)}
                className={`
                  relative group flex items-center gap-3 p-2 rounded-xl transition-all duration-500
                  ${isActive ? "scale-110" : "scale-100 hover:scale-105"}
                `}
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                {/* Planet glow */}
                <div 
                  className={`
                    absolute inset-0 rounded-xl bg-gradient-to-r ${section.color} opacity-0 blur-md transition-opacity duration-300
                    ${isActive || isHovered ? "opacity-50" : ""}
                  `}
                />
                
                {/* Planet icon */}
                <div
                  className={`
                    relative w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all duration-300
                    bg-gradient-to-br ${section.color}
                    ${isActive ? "shadow-lg shadow-primary/30" : "opacity-70 hover:opacity-100"}
                  `}
                >
                  <Icon className="w-5 h-5 md:w-6 md:h-6 text-background" />
                </div>

                {/* Label tooltip */}
                <span
                  className={`
                    absolute left-full ml-4 px-3 py-1.5 rounded-lg bg-card/90 backdrop-blur-sm
                    text-sm font-medium whitespace-nowrap border border-border/50
                    transition-all duration-300 pointer-events-none
                    ${isActive || isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}
                  `}
                >
                  {section.label}
                </span>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-gradient-to-b from-primary to-secondary" />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="relative z-10 mt-8 flex flex-col gap-3">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center bg-card/50 border border-border/50 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
          >
            <Languages className="w-5 h-5 text-foreground" />
          </button>

          {/* Download CV */}
          <a
            href="/certificates/Filippo_Spazzali_Resume.pdf"
            download
            className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary to-secondary hover:opacity-90 transition-all duration-300 hover:scale-105"
          >
            <Download className="w-5 h-5 text-background" />
          </a>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden">
        <div className="bg-card/90 backdrop-blur-xl border-t border-border/50 px-2 py-2">
          <div className="flex items-center justify-around">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => onSectionChange(section.id)}
                  className={`
                    relative p-2 rounded-xl transition-all duration-300
                    ${isActive ? "scale-110" : ""}
                  `}
                >
                  {isActive && (
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${section.color} opacity-20 blur-sm`} />
                  )}
                  <Icon 
                    className={`
                      w-5 h-5 relative z-10 transition-colors duration-300
                      ${isActive ? "text-primary" : "text-muted-foreground"}
                    `}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};

export default OrbitalNavigation;
