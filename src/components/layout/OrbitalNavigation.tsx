import { useCallback, useMemo, useState } from 'react';
import { Languages, Menu, X, FileDown } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { navItems, RESUME_URL, type NavItem, type SectionId } from '@/data/navigation';
import profilePhoto from '@/assets/images/profile-photo.jpeg';

interface OrbitalNavigationProps {
  activeSection: string;
  onSectionChange: (section: SectionId) => void;
}

type LocalizedNavItem = NavItem & { label: string };

/** Decorative twinkling specks scattered across the constellation. */
const SPARKS = [
  { x: '14%', y: '15%', s: 2, d: '0s' },
  { x: '72%', y: '12%', s: 2, d: '1.4s' },
  { x: '84%', y: '40%', s: 2, d: '0.6s' },
  { x: '10%', y: '52%', s: 2, d: '2.1s' },
  { x: '78%', y: '66%', s: 2, d: '0.9s' },
  { x: '16%', y: '80%', s: 3, d: '1.8s' },
  { x: '66%', y: '90%', s: 2, d: '2.6s' },
];

/** A premium pseudo-3D planet: lit sphere + atmosphere + rotating sheen + optional ring + section icon. */
const Planet = ({ item, size, active }: { item: LocalizedNavItem; size: number; active: boolean }) => {
  const Icon = item.icon;
  const c = item.color;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Atmosphere glow */}
      <div
        className="absolute rounded-full pointer-events-none transition-all duration-300"
        style={{ inset: active ? '-46%' : '-32%', background: `radial-gradient(circle, ${c}66 0%, ${c}22 45%, transparent 70%)` }}
      />

      {/* Active halo pulse */}
      {active && (
        <span
          className="absolute inset-[-12%] rounded-full pointer-events-none animate-halo"
          style={{ border: `2px solid ${c}`, boxShadow: `0 0 16px ${c}` }}
        />
      )}

      {/* Saturn-like ring (sits behind the sphere so it reads as two side arcs) */}
      {item.ring && (
        <div
          className="absolute left-1/2 top-1/2 rounded-[50%] pointer-events-none"
          style={{
            width: size * 2.4,
            height: size * 0.86,
            transform: 'translate(-50%, -50%) rotate(-24deg)',
            border: `2px solid ${c}90`,
            boxShadow: `0 0 12px ${c}55`,
          }}
        />
      )}

      {/* Sphere body */}
      <div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          background: `radial-gradient(circle at 30% 24%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.12) 20%, transparent 44%), radial-gradient(circle at 72% 80%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.18) 40%, transparent 64%), radial-gradient(circle at 50% 46%, ${c} 0%, ${c} 52%, ${c}b3 100%)`,
          boxShadow: `inset -3px -5px 11px rgba(0,0,0,0.5), inset 3px 4px 9px rgba(255,255,255,0.28), 0 0 ${active ? 26 : 15}px ${c}${active ? '' : 'aa'}`,
        }}
      >
        {/* Slowly rotating surface sheen */}
        <span
          className="absolute inset-0 animate-surface"
          style={{ background: `conic-gradient(from 0deg, transparent 0deg, ${c}77 60deg, transparent 150deg)`, mixBlendMode: 'screen' }}
        />
      </div>

      {/* Specular highlight */}
      <span
        className="absolute rounded-full pointer-events-none"
        style={{ width: '30%', height: '30%', top: '15%', left: '20%', background: 'radial-gradient(circle, rgba(255,255,255,0.95), transparent 70%)' }}
      />

      {/* Section icon */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Icon style={{ width: size * 0.42, height: size * 0.42, color: 'rgba(9,11,28,0.9)' }} strokeWidth={2.2} />
      </div>
    </div>
  );
};

/** The home node: the profile photo framed by a rotating gradient arc + breathing glow. */
const AvatarOrb = ({ size, active }: { size: number; active: boolean }) => (
  <div className="relative" style={{ width: size, height: size }}>
    <div
      className="absolute inset-[-30%] rounded-full animate-pulse pointer-events-none"
      style={{ background: 'radial-gradient(circle, hsl(246 100% 71% / 0.4) 0%, hsl(255 92% 76% / 0.16) 45%, transparent 70%)' }}
    />
    <svg className="absolute inset-[-12%] animate-spin-slow" viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="avatar-orb-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(246 100% 71%)" />
          <stop offset="50%" stopColor="hsl(255 92% 76%)" />
          <stop offset="100%" stopColor="hsl(209 100% 65%)" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" stroke="url(#avatar-orb-grad)" strokeWidth="2" strokeLinecap="round" strokeDasharray="84 210" />
    </svg>
    {active && (
      <span
        className="absolute inset-[-8%] rounded-full pointer-events-none animate-halo"
        style={{ border: '2px solid hsl(246 100% 71%)', boxShadow: '0 0 16px hsl(246 100% 71%)' }}
      />
    )}
    <div
      className="absolute inset-[7%] rounded-full overflow-hidden border-2 border-primary/60"
      style={{ boxShadow: '0 0 22px hsl(246 100% 71% / 0.4)' }}
    >
      <img src={profilePhoto} alt="Filippo Spazzali" className="w-full h-full object-cover" />
    </div>
  </div>
);

const OrbitalNavigation = ({ activeSection, onSectionChange }: OrbitalNavigationProps) => {
  const { language, toggleLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const pathD = useMemo(() => items.map((n, i) => `${i ? 'L' : 'M'}${n.x} ${n.y}`).join(' '), [items]);

  const renderNode = (item: LocalizedNavItem) => {
    const isActive = activeSection === item.id;
    return item.id === 'home' ? <AvatarOrb size={item.size} active={isActive} /> : <Planet item={item} size={item.size} active={isActive} />;
  };

  return (
    <>
      {/* Desktop constellation navigation */}
      <nav className="fixed left-0 top-0 h-screen w-[400px] z-[100] hidden lg:block">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 32% 50%, hsl(228 42% 4% / 0.9) 0%, hsl(228 42% 4% / 0.5) 46%, transparent 74%)' }}
        />

        <div className="relative w-full h-full">
          {SPARKS.map((s, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-white animate-twinkle pointer-events-none"
              style={{ left: s.x, top: s.y, width: s.s, height: s.s, animationDelay: s.d }}
            />
          ))}

          {/* Connecting lines + travelling light pulse */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="constellation-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="hsl(246 100% 71%)" />
                <stop offset="50%" stopColor="hsl(209 100% 65%)" />
                <stop offset="100%" stopColor="hsl(255 92% 76%)" />
              </linearGradient>
            </defs>
            <path d={pathD} fill="none" stroke="rgba(180,190,255,0.18)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <path
              d={pathD}
              fill="none"
              stroke="url(#constellation-grad)"
              strokeWidth="2.2"
              strokeLinecap="round"
              pathLength={1000}
              strokeDasharray="26 974"
              vectorEffect="non-scaling-stroke"
              className="animate-constellation-flow"
            />
          </svg>

          {/* Planet nodes */}
          {items.map((item, index) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSectionClick(item.id)}
                aria-label={item.label}
                aria-current={isActive ? 'true' : undefined}
                className="absolute group"
                style={{ left: `${item.x}%`, top: `${item.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                <div className="animate-float-soft" style={{ animationDelay: `${index * 0.6}s` }}>
                  <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {renderNode(item)}
                  </div>
                </div>

                <div
                  className={`absolute left-full ml-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pl-2 pr-3 py-1 rounded-full glass whitespace-nowrap transition-all duration-300 pointer-events-none ${
                    isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
                  }`}
                  style={{ boxShadow: isActive ? `0 0 18px ${item.color}44` : undefined }}
                >
                  <span className="text-[10px] font-mono font-bold tabular-nums" style={{ color: item.color }}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="w-px h-3 bg-white/15" />
                  <span className={`text-sm ${isActive ? 'font-semibold text-foreground' : 'font-medium text-foreground/85'}`}>{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Floating controls dock */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-2xl glass z-[101]">
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
            mobileMenuOpen ? 'max-h-[620px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="p-4">
            {/* Constellation as a vertical timeline menu */}
            <div className="relative flex flex-col gap-1">
              <div className="absolute top-7 bottom-7 w-px bg-[rgba(180,190,255,0.16)]" style={{ left: '30px' }} />
              {items.map((item, index) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSectionClick(item.id)}
                    aria-current={isActive ? 'true' : undefined}
                    className={`relative flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors ${isActive ? 'bg-white/[0.06]' : ''} active:bg-white/[0.08]`}
                  >
                    <span className="relative shrink-0 flex items-center justify-center" style={{ width: 44, height: 44 }}>
                      {renderNode(item)}
                    </span>
                    <span className="text-[10px] font-mono font-bold tabular-nums" style={{ color: item.color }}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className={`text-sm ${isActive ? 'font-semibold text-foreground' : 'font-medium text-foreground/85'}`}>{item.label}</span>
                  </button>
                );
              })}
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
