import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
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
const ELLIPSE = 0.78;
/** Orbit speed multiplier while the pointer hovers the nav (lets the user aim planets). */
const HOVER_SLOWDOWN = 0.15;

/** Central avatar: photo framed by counter-rotating gradient arcs and a breathing glow. */
const HubAvatar = ({
  variant,
  size,
  label,
  onClick,
}: {
  variant: 'desktop' | 'mobile';
  size: number;
  label: string;
  onClick: () => void;
}) => {
  const gradientId = `hub-grad-${variant}`;
  return (
    <button type="button" onClick={onClick} aria-label={label} className="absolute z-20 group">
      {/* Breathing glow */}
      <div
        className="absolute inset-[-22px] rounded-full animate-pulse"
        style={{
          background:
            'radial-gradient(circle, hsl(246 100% 71% / 0.4) 0%, hsl(255 92% 76% / 0.18) 45%, transparent 70%)',
        }}
      />

      {/* Counter-rotating gradient arcs */}
      <svg className="absolute inset-[-14px] animate-spin-slow" viewBox="0 0 100 100" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(246 100% 71%)" />
            <stop offset="50%" stopColor="hsl(255 92% 76%)" />
            <stop offset="100%" stopColor="hsl(209 100% 65%)" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" stroke={`url(#${gradientId})`} strokeWidth="1.6" strokeLinecap="round" strokeDasharray="82 210" />
      </svg>
      <svg className="absolute inset-[-8px] animate-spin-reverse" viewBox="0 0 100 100" fill="none" aria-hidden="true">
        <circle cx="50" cy="50" r="48" stroke={`url(#${gradientId})`} strokeWidth="1" strokeLinecap="round" strokeDasharray="30 250" opacity="0.7" />
      </svg>

      {/* Photo */}
      <div
        className="relative rounded-full overflow-hidden border-2 border-primary/50 group-hover:border-primary transition-all duration-500 group-hover:scale-105"
        style={{ width: size, height: size, boxShadow: '0 0 28px hsl(246 100% 71% / 0.4)' }}
      >
        <img src={profilePhoto} alt="Filippo Spazzali" className="w-full h-full object-cover" />
      </div>
    </button>
  );
};

/**
 * Renders the orbit rings (SVG) + orbiting planets.
 * Positions, depth, bob and blur are updated imperatively via rAF (no React re-renders).
 */
const SolarSystem = ({
  items,
  activeSection,
  onSelect,
  variant,
  enabled = true,
  speedRef,
}: {
  items: LocalizedNavItem[];
  activeSection: string;
  onSelect: (id: SectionId) => void;
  variant: 'desktop' | 'mobile';
  enabled?: boolean;
  speedRef?: MutableRefObject<number>;
}) => {
  const planetRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const rotationRef = useRef(0);
  const activeRef = useRef(activeSection);
  activeRef.current = activeSection;
  const isDesktop = variant === 'desktop';

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let last = performance.now();

    const apply = (time: number) => {
      const active = activeRef.current;
      items.forEach((item, i) => {
        const el = planetRefs.current[i];
        if (!el) return;
        const angle = (rotationRef.current * item.speed + i * BASE_ANGLE_STEP) * (Math.PI / 180);
        const x = Math.cos(angle) * item.orbitRadius;
        const y = Math.sin(angle) * item.orbitRadius * ELLIPSE;
        const bob = Math.sin((time / 1000) * (0.8 + item.speed) + i) * 3;
        const sin = Math.sin(angle);
        // 0 = far side of the ellipse (behind the hub), 1 = near side (toward viewer).
        const frontness = (sin + 1) / 2;
        const isActive = item.id === active;
        const depth = 0.86 + frontness * 0.3;
        el.style.transform = `translate(${x}px, ${y + bob}px) scale(${depth})`;
        el.style.zIndex = isActive ? '40' : String(12 + Math.round(sin * 6));
        el.style.filter = isActive ? 'none' : `blur(${((1 - frontness) * 2.2).toFixed(2)}px)`;
        el.style.opacity = isActive ? '1' : (0.55 + frontness * 0.45).toFixed(3);
      });
    };

    apply(0);

    if (!prefersReduced && enabled) {
      const tick = (now: number) => {
        const factor = speedRef?.current ?? 1;
        rotationRef.current = (rotationRef.current + (DEG_PER_SEC * factor * (now - last)) / 1000) % 360;
        last = now;
        apply(now);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }

    return () => cancelAnimationFrame(raf);
  }, [items, enabled, speedRef]);

  return (
    <>
      {/* Orbit rings — the active one becomes a flowing gradient energy arc. */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" aria-hidden="true">
        <defs>
          {items.map((item) => (
            <linearGradient key={`grad-${variant}-${item.id}`} id={`orbit-${variant}-${item.id}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={item.color} stopOpacity="0" />
              <stop offset="50%" stopColor={item.color} stopOpacity="0.9" />
              <stop offset="100%" stopColor={item.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        {items.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <ellipse
              key={`orbit-${variant}-${item.id}`}
              cx="50%"
              cy="50%"
              rx={item.orbitRadius}
              ry={item.orbitRadius * ELLIPSE}
              fill="none"
              stroke={isActive ? `url(#orbit-${variant}-${item.id})` : 'rgba(180,190,255,0.12)'}
              strokeWidth={isActive ? 1.8 : 1}
              strokeDasharray={isActive ? '5 9' : undefined}
              className={isActive ? 'animate-orbit-flow' : undefined}
              style={isActive ? { filter: `drop-shadow(0 0 6px ${item.color})` } : undefined}
            />
          );
        })}
      </svg>

      {/* Planets */}
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
            {/* Soft hover/active glow */}
            <div
              className={`absolute inset-[-6px] rounded-full transition-opacity duration-500 ${
                isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'
              }`}
              style={{ background: `radial-gradient(circle, ${item.color}66 0%, ${item.color}22 55%, transparent 72%)` }}
            />

            {/* Pulsing halo on the active planet */}
            {isActive && (
              <span
                className="absolute inset-[-6px] rounded-full pointer-events-none animate-halo"
                style={{ border: `2px solid ${item.color}`, boxShadow: `0 0 16px ${item.color}` }}
              />
            )}

            {/* Saturn-like ring */}
            {item.ring && (
              <div
                className="absolute left-1/2 top-1/2 rounded-[50%] pointer-events-none"
                style={{
                  width: item.size * 2.6,
                  height: item.size * 0.95,
                  transform: 'translate(-50%, -50%) rotate(-22deg)',
                  border: `1.5px solid ${item.color}70`,
                  boxShadow: `0 0 10px ${item.color}45`,
                }}
              />
            )}

            {/* Planet body */}
            <div
              className={`relative rounded-full flex items-center justify-center transition-transform duration-300 ${
                isActive ? 'scale-125' : 'group-hover:scale-110'
              }`}
              style={{
                width: item.size,
                height: item.size,
                background: `radial-gradient(circle at 32% 26%, ${item.color}, ${item.color}cc 46%, ${item.color}55 100%)`,
                boxShadow: isActive
                  ? `0 0 30px ${item.color}, inset -3px -4px 10px rgba(0,0,0,0.55), inset 3px 3px 9px rgba(255,255,255,0.45)`
                  : `0 0 14px ${item.color}66, inset -3px -4px 9px rgba(0,0,0,0.45), inset 2px 2px 7px rgba(255,255,255,0.3)`,
              }}
            >
              {/* Rotating surface sheen */}
              <span
                className="absolute inset-0 rounded-full pointer-events-none animate-surface"
                style={{
                  background: `conic-gradient(from 0deg, transparent 0deg, ${item.color}88 55deg, transparent 150deg)`,
                  mixBlendMode: 'screen',
                }}
              />
              {/* Specular highlight */}
              <span
                className="absolute rounded-full pointer-events-none"
                style={{ width: '40%', height: '40%', top: '14%', left: '18%', background: 'radial-gradient(circle, rgba(255,255,255,0.95), transparent 70%)' }}
              />
              <Icon className="relative z-10" style={{ width: item.size * 0.46, height: item.size * 0.46, color: 'rgba(10,12,32,0.92)' }} />
            </div>

            {/* Desktop label pill (index + name) */}
            {isDesktop && (
              <div
                className={`absolute left-full ml-4 top-1/2 -translate-y-1/2 flex items-center gap-2.5 pl-2.5 pr-3.5 py-1.5 rounded-full glass whitespace-nowrap transition-all duration-300 pointer-events-none ${
                  isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
                }`}
                style={{ boxShadow: `0 0 22px ${item.color}30` }}
              >
                <span className="text-[10px] font-mono font-bold tabular-nums" style={{ color: item.color }}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="w-px h-3.5 bg-white/15" />
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </div>
            )}

            {/* Mobile active label */}
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
  const speedRef = useRef(1);

  const items: LocalizedNavItem[] = useMemo(
    () => navItems.map((item) => ({ ...item, label: t(item.labelKey) })),
    // t is recreated every render; language is the only thing that changes the labels.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language],
  );

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
      <nav className="fixed left-0 top-0 h-screen w-[400px] z-[100] hidden lg:flex items-center justify-center">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 30% 50%, hsl(228 42% 4% / 0.92) 0%, hsl(228 42% 4% / 0.55) 46%, transparent 74%)' }}
        />

        <div
          className="relative w-[420px] h-[460px] shrink-0 flex items-center justify-center"
          onMouseEnter={() => {
            speedRef.current = HOVER_SLOWDOWN;
          }}
          onMouseLeave={() => {
            speedRef.current = 1;
          }}
        >
          <HubAvatar variant="desktop" size={76} label={t('nav.home')} onClick={() => handleSectionClick('home')} />
          <SolarSystem items={items} activeSection={activeSection} onSelect={handleSectionClick} variant="desktop" speedRef={speedRef} />
        </div>

        {/* Floating controls dock */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-2xl glass z-[101]">
          <button
            onClick={toggleLanguage}
            type="button"
            className="flex items-center gap-2 h-11 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 transition-all duration-300 hover:scale-[1.03]"
            aria-label={language === 'en' ? 'Switch to Italian' : 'Passa all’inglese'}
          >
            <Languages className="w-4 h-4 text-secondary" />
            <span className="text-sm font-semibold text-foreground">{language === 'en' ? 'EN' : 'IT'}</span>
          </button>

          <a
            href={RESUME_URL}
            download
            className="flex items-center gap-2 h-11 px-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-background text-sm font-semibold hover:opacity-90 transition-all duration-300 hover:scale-[1.03] group"
            title={t('nav.downloadCV')}
            aria-label={t('nav.downloadCV')}
            style={{ boxShadow: '0 0 20px hsl(246 100% 71% / 0.35)' }}
          >
            <FileDown className="w-4 h-4 group-hover:animate-bounce" />
            CV
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
            mobileMenuOpen ? 'max-h-[560px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="p-4">
            <div className="relative w-full h-[420px] flex items-center justify-center">
              <HubAvatar variant="mobile" size={62} label={t('nav.home')} onClick={() => handleSectionClick('home')} />
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
