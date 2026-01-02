import { useState, useEffect } from "react";
import OrbitalNavigation from "@/components/OrbitalNavigation";
import CosmicBackground from "@/components/CosmicBackground";
import HomeSection from "@/components/sections/HomeSection";
import AboutSection from "@/components/sections/AboutSection";
import SkillsSection from "@/components/sections/SkillsSection";
import CertificationsSection from "@/components/sections/CertificationsSection";
import PortfolioSection from "@/components/sections/PortfolioSection";
import ContactSection from "@/components/sections/ContactSection";
import ThemeToggle from "@/components/ThemeToggle";

const Index = () => {
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "about", "skills", "certifications", "portfolio", "contact"];
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="relative">
      {/* Dynamic Cosmic Background */}
      <CosmicBackground activeSection={activeSection} />
      
      <OrbitalNavigation 
        activeSection={activeSection} 
        onSectionChange={handleSectionChange} 
      />
      
      {/* Floating Theme Toggle */}
      <ThemeToggle />
      
      {/* Mobile/Tablet top padding for header */}
      <div className="lg:hidden h-16" />
      
      <main className="relative z-10">
        <HomeSection isActive={activeSection === "home"} />
        <AboutSection isActive={activeSection === "about"} />
        <SkillsSection isActive={activeSection === "skills"} />
        <CertificationsSection isActive={activeSection === "certifications"} />
        <PortfolioSection isActive={activeSection === "portfolio"} />
        <ContactSection isActive={activeSection === "contact"} />
      </main>
    </div>
  );
};

export default Index;
