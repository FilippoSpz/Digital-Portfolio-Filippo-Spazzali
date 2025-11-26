import { useState, useEffect } from "react";
import OrbitalNavigation from "@/components/OrbitalNavigation";
import HomeSection from "@/components/sections/HomeSection";
import AboutSection from "@/components/sections/AboutSection";
import SkillsSection from "@/components/sections/SkillsSection";
import CertificationsSection from "@/components/sections/CertificationsSection";
import PortfolioSection from "@/components/sections/PortfolioSection";
import ContactSection from "@/components/sections/ContactSection";

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
    handleScroll(); // Initial check
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
      <OrbitalNavigation 
        activeSection={activeSection} 
        onSectionChange={handleSectionChange} 
      />
      
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
