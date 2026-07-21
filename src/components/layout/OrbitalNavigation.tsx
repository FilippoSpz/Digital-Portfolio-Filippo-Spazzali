import { useCallback, useEffect, useRef, useState } from 'react';
import { Languages, Menu, X, FileDown } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { navItems, RESUME_URL, type NavItem, type SectionId } from '@/data/navigation';
import profilePhoto from '@/assets/images/profile-photo.jpeg';

interface OrbitalNavigationProps {
  activeSection: string;
  onSectionChange: (section: SectionId) => void;
}

type LocalizedNavItem = NavItem & { label: string };

const DEG_PER_SEC = 6;
const BASE_ANGLE_STEP = 60;
/** Vertical squash to give the orbital plane a tilted, 3D-like perspective. */
const ELLIPSE = 0.6;

/** Renders orbit rings + orbiting planets. Positions update imperatively via rAF (no React re-renders). */
const SolarSystem = ({
  items,
  activeSection,
  onSelect,
  variant,
  enabled = true,
}: {
  items: LocalizedNavItem[];
  activeSection: string;
  onSelect: (id: SectionId) => void;
  variant: 'desktop' | 'mobile';
  enabled?: boolean;
}) => {
  const planetRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const isDesktop = variant === 'desktop';

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let last = performance.now();
    let rotation = 0;

    const apply = () => {
      items.forEach((item, i) => {
        const el = planetRefs.current[i];
        if (!el) return;
        const angle = (rotation * item.speed + i * BASE_ANGLE_STEP) * (Math.PI / 180);
        const x = Math.cos(angle) * item.orbitRadius;
        const y = Math.sin(angle) * item.orbitRadius * ELLIPSE;
        // Planets nearer the viewer (front of the ellipse) sit slightly larger/brighter.
        const depth = 0.9 + ((Math.sin(angle) + 1) / 2) * 0.2;
        el.style.transform = `translate(${x}px, ${y}px) scale(${depth})`;
        el.style.zIndex = String(10 + Math.round(Math.sin(angle) * 5));
      });
    };

    apply();

    if (!prefersReduced && enabled) {
      const tick = (now: number) => {
        rotation = (rotation + (DEG_PER_SEC * (now - last)) / 1000) % 360;
        last = now;
        apply();
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }

    return () => cancelAnimationFrame(raf);
  }, [items, enabled]);

  return (
    <>
      {items.map((item) => {
        const isActive = activeSection === item.id;
        return (
          <div
            key={`orbit-${variant}-${item.id}`}
            className="absolute rounded-[50%] border transition-all duration-500"
            style={{
              width: item.orbitRadius * 2,
              height: item.orbitRadius * 2 * ELLIPSE,
              borderColor: isActive ? `${item.color}55` : 'rgba(180,190,255,0.10)',
              borderWidth: isActive ? 2 : 1,
              boxShadow: isActive ? `0 0 24px ${item.color}35, inset 0 0 24px ${item.color}12` : 'none',
            }}
          />
        );
      })}

      {items.map((item, index) => {
        const Icon = item.icon;
        const isActive = activeSection === item.id;
        const baseAngle = index * BASE_ANGLE_STEP * (Math.PI / 180);
        const initialX = Math.cos(baseAngle) * item.orbitRadius;
        const initialY = Math.sin(baseAngle) * item.orbitRadius * ELLIPSE;

        return (
          <button
            key={`planet-${variant}-${item.id}`}
            ref={(el) => {
              planetRefs.current[index] = el;
            }}
            type="button"
            onClick={() => onSelect(item.id)}
            aria-label={item.label}
            aria-current={isActive ? 'true' : undefined}
            className="absolute z-10 group"
            style={{ transform: `translate(${initialX}px, ${initialY}px)` }}
          >
            <div
              className={`absolute inset-[-5px] rounded-full transition-all duration-500 ${
                isActive ? 'opacity-100 scale-125' : 'opacity-0 group-hover:opacity-60 group-hover:scale-110'
              }`}
              style={{
                background: `radial-gradient(circle, ${item.color}60 0%, ${item.color}20 50%, transparent 70%)`,
                boxShadow: isActive ? `0 0 25px ${item.color}80` : 'none',
              }}
            />

            <div
              className={`relative rounded-full flex items-center justify-center transition-all duration-300 ${
                isActive ? 'scale-125' : 'group-hover:scale-110'
              }`}
              style={{
                width: item.size,
                height: item.size,
                background: isActive
                  ? `linear-gradient(135deg, ${item.color}, ${item.color}99)`
                  : `linear-gradient(135deg, ${item.color}80, ${item.color}40)`,
                boxShadow: isActive
                  ? `0 0 20px ${item.color}60, inset -3px -3px 10px rgba(0,0,0,0.3), inset 3px 3px 10px rgba(255,255,255,0.2)`
                  : `inset -2px -2px 8px rgba(0,0,0,0.3), inset 2px 2px 8px rgba(255,255,255,0.1)`,
              }}
            >
              <Icon style={{ width: item.size * 0.5, height: item.size * 0.5, color: isActive ? '#282a36' : 'rgba(40,42,54,0.8)' }} />
            </div>

            {isDesktop && (
              <div
                className={`glass absolute left-full ml-3 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all duration-300 pointer-events-none ${
                  isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
                }`}
                style={{ boxShadow: `0 0 18px ${item.color}30` }}
              >
                <span className="text-sm font-medium" style={{ color: item.color }}>
                  {item.label}
                </span>
              </div>
            )}

            {!isDesktop && isActive && (
              <div
                className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg whitespace-nowrap bg-card/95 backdrop-blur-sm border border-border/50 text-xs font-medium"
                style={{ color: item.color }}
              >
                {item.label}
              </div>
            )}
          </button>
        );
      })}
    </>
  );
};

const OrbitalNavigation = ({ activeSection, onSectionChange }: OrbitalNavigationProps) => {
  const { language, toggleLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const items: LocalizedNavItem[] = navItems.map((item) => ({ ...item, label: t(item.labelKey) }));

  const handleSectionClick = useCallback(
    (sectionId: SectionId) => {
      onSectionChange(sectionId);
      setMobileMenuOpen(false);
    },
    [onSectionChange],
  );

  return (
    <>
      {/* Desktop solar-system navigation */}
      <nav className="fixed left-0 top-0 h-screen w-[320px] z-[100] hidden lg:flex items-center justify-center">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at -20% 50%, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 40%, transparent 70%)' }}
        />

        <div className="relative w-[340px] h-[340px] flex items-center justify-center" style={{ marginLeft: '10px' }}>
          <button onClick={() => handleSectionClick('home')} className="absolute z-20 group" type="button" aria-label={t('nav.home')}>
            <div
              className="absolute inset-[-16px] rounded-full animate-pulse"
              style={{ background: 'radial-gradient(circle, rgba(189,147,249,0.4) 0%, rgba(255,121,198,0.2) 50%, transparent 70%)' }}
            />
            <div
              className="absolute inset-[-10px] rounded-full animate-spin-slow"
              style={{ background: 'conic-gradient(from 0deg, rgba(189,147,249,0.3), rgba(139,233,253,0.3), rgba(255,121,198,0.3), rgba(189,147,249,0.3))' }}
            />
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary/60 group-hover:border-primary transition-all duration-500 group-hover:scale-110">
              <img src={profilePhoto} alt="Filippo Spazzali" className="w-full h-full object-cover" />
            </div>
          </button>

          <SolarSystem items={items} activeSection={activeSection} onSelect={handleSectionClick} variant="desktop" />
        </div>

        <div className="absolute bottom-8 left-8 flex flex-col gap-3 z-[101]">
          <button
            onClick={toggleLanguage}
            type="button"
            className="w-12 h-12 rounded-full flex items-center justify-center bg-card/90 border border-border/50 hover:bg-primary/20 hover:border-primary/50 transition-all duration-300 backdrop-blur-sm hover:scale-110"
            aria-label={language === 'en' ? 'Switch to Italian' : 'Passa all’inglese'}
          >
            <span className="text-sm font-bold text-foreground">{language === 'en' ? 'EN' : 'IT'}</span>
          </button>

          <a
            href={RESUME_URL}
            download
            className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-secondary hover:opacity-90 transition-all duration-300 hover:scale-110 group relative overflow-hidden"
            title={t('nav.downloadCV')}
            aria-label={t('nav.downloadCV')}
            style={{ boxShadow: '0 0 20px rgba(189,147,249,0.4)' }}
          >
            <FileDown className="w-5 h-5 text-background group-hover:animate-bounce" />
          </a>
        </div>
      </nav>

      {/* Mobile / tablet header */}
      <header className="fixed top-0 left-0 right-0 z-[100] lg:hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-background/95 backdrop-blur-xl border-b border-border/30">
          <button type="button" onClick={() => handleSectionClick('home')} className="flex items-center gap-3" aria-label={t('nav.home')}>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/50">
              <img src={profilePhoto} alt="Filippo Spazzali" className="w-full h-full object-cover" />
            </div>
            <span className="font-semibold text-foreground">Filippo Spazzali</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-card/50 border border-border/50 active:bg-primary/20"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <div
          className={`absolute top-full left-0 right-0 bg-background/98 backdrop-blur-xl border-b border-border/30 transition-all duration-500 overflow-hidden ${
            mobileMenuOpen ? 'max-h-[550px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="p-4">
            <div className="relative w-full h-[400px] flex items-center justify-center">
              <button type="button" onClick={() => handleSectionClick('home')} className="absolute z-20" aria-label={t('nav.home')}>
                <div
                  className="absolute inset-[-15px] rounded-full animate-pulse"
                  style={{ background: 'radial-gradient(circle, rgba(189,147,249,0.4) 0%, rgba(255,121,198,0.2) 50%, transparent 70%)' }}
                />
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary/60">
                  <img src={profilePhoto} alt="Filippo Spazzali" className="w-full h-full object-cover" />
                </div>
              </button>

              <SolarSystem items={items} activeSection={activeSection} onSelect={handleSectionClick} variant="mobile" enabled={mobileMenuOpen} />
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-border/30 mt-4">
              <button
                type="button"
                onClick={toggleLanguage}
                className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 bg-card/50 border border-border/50 active:bg-primary/20 transition-colors"
                aria-label={language === 'en' ? 'Switch to Italian' : 'Passa all’inglese'}
              >
                <Languages className="w-4 h-4" />
                <span className="text-sm font-medium">{language === 'en' ? 'Italiano' : 'English'}</span>
              </button>
              <a
                href={RESUME_URL}
                download
                className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-secondary"
                aria-label={t('nav.downloadCV')}
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
