import OrbitalNavigation from '@/components/layout/OrbitalNavigation';
import CosmicBackground from '@/components/background/CosmicBackground';
import HomeSection from '@/components/sections/HomeSection';
import AboutSection from '@/components/sections/AboutSection';
import ExperienceSection from '@/components/sections/ExperienceSection';
import SkillsSection from '@/components/sections/SkillsSection';
import CertificationsSection from '@/components/sections/CertificationsSection';
import PortfolioSection from '@/components/sections/PortfolioSection';
import ProjectsSection from '@/components/sections/ProjectsSection';
import ContactSection from '@/components/sections/ContactSection';
import { useActiveSection } from '@/hooks/useActiveSection';
import { useEffect } from 'react';
import { jumpToSection, startMotion } from '@/lib/motion';

const Index = () => {
  const { activeSection } = useActiveSection();

  // Smooth scrolling and the camera's trip through the solar system follow the page.
  useEffect(() => startMotion(), []);

  return (
    <div className="relative">
      <CosmicBackground activeSection={activeSection} />

      <OrbitalNavigation activeSection={activeSection} onSectionChange={jumpToSection} />

      {/* Mobile/tablet header spacer */}
      <div className="lg:hidden h-16" />

      <main className="relative z-10">
        <HomeSection isActive={activeSection === 'home'} />
        <AboutSection isActive={activeSection === 'about'} />
        <ExperienceSection isActive={activeSection === 'experience'} />
        <SkillsSection isActive={activeSection === 'skills'} />
        <CertificationsSection isActive={activeSection === 'certifications'} />
        <PortfolioSection isActive={activeSection === 'portfolio'} />
        <ProjectsSection isActive={activeSection === 'projects'} />
        <ContactSection isActive={activeSection === 'contact'} />
      </main>
    </div>
  );
};

export default Index;
