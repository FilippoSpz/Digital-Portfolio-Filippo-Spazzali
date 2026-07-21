import OrbitalNavigation from '@/components/layout/OrbitalNavigation';
import CosmicBackground from '@/components/background/CosmicBackground';
import HomeSection from '@/components/sections/HomeSection';
import AboutSection from '@/components/sections/AboutSection';
import SkillsSection from '@/components/sections/SkillsSection';
import CertificationsSection from '@/components/sections/CertificationsSection';
import PortfolioSection from '@/components/sections/PortfolioSection';
import ProjectsSection from '@/components/sections/ProjectsSection';
import ContactSection from '@/components/sections/ContactSection';
import { useActiveSection } from '@/hooks/useActiveSection';

const Index = () => {
  const { activeSection } = useActiveSection();

  return (
    <div className="relative">
      <CosmicBackground activeSection={activeSection} />

      <OrbitalNavigation activeSection={activeSection} onSectionChange={(id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })} />

      {/* Mobile/tablet header spacer */}
      <div className="lg:hidden h-16" />

      <main className="relative z-10">
        <HomeSection isActive={activeSection === 'home'} />
        <AboutSection isActive={activeSection === 'about'} />
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
