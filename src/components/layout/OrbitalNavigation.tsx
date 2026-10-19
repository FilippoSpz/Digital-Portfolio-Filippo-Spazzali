import { lazy, Suspense, useCallback, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { FileDown } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { navItems, outerBodies, RESUME_URL, type NavItem, type SectionId } from '@/data/navigation';
import { rich3D } from '@/lib/motion';
import { menuLayout, menuSky, MENU_WIDTH, type MenuNode } from './menuLayout';
import MiniPlanet from './MiniPlanet';
import MobileDock from './MobileDock';
import profilePhoto from '@/assets/images/profile-photo.jpeg';
import './menu.css';

const MenuSky = lazy(() => import('./MenuSky'));

interface OrbitalNavigationProps {
  activeSection: string;
  onSectionChange: (section: SectionId) => void;
}

type LocalizedNavItem = NavItem & { label: string };

/** When each planet's label appears: once the planet has glided into place (see MenuSky). */
const arrival = (i: number) => 0.35 + i * 0.13 + 1.15;

/** Room a body takes on its right (rings, moons), so its label starts clear of it. */
const reach = (node: MenuNode) => node.r * (node.body === 'saturn' ? 2.3 : node.body === 'jupiter' ? 2.0 : node.body === 'earth' ? 2.25 : 1) + 12;

/** The pill with the section number and name: always still; it fills with the planet's colour on hover. */
const Label = ({ color, index, text, active, delay, animate }: { color: string; index?: string; text: ReactNode; active: boolean; delay: number; animate: boolean }) => (
  <span
    className={`flex items-center gap-2 h-8 pl-2.5 pr-3 rounded-full border whitespace-nowrap text-sm transition-colors duration-300 ${
      active ? 'border-[var(--c)] bg-black text-white font-semibold' : 'border-white/10 bg-black/70 text-white/80 font-medium'
    } group-hover:bg-[var(--c)] group-hover:border-[var(--c)] group-hover:text-black ${animate ? 'menu-arrive' : ''}`}
    style={{ '--c': color, animationDelay: `${delay}s` } as CSSProperties}
  >
    {index && (
      <>
        <span className="text-[10px] font-mono font-bold tabular-nums text-[var(--c)] group-hover:text-black transition-colors duration-300">{index}</span>
        <span className="w-px h-3 bg-white/15 group-hover:bg-black/25" />
      </>
    )}
    {text}
  </span>
);

/** Wide enough for the menu column on the left; below this, the phone's bars. */
const WIDE = '(min-width: 1024px)';

const OrbitalNavigation = ({ activeSection, onSectionChange }: OrbitalNavigationProps) => {
  const { language, toggleLanguage, t } = useLanguage();
  const [height, setHeight] = useState(() => (typeof window === 'undefined' ? 900 : window.innerHeight));
  const [use3D] = useState(() => typeof window !== 'undefined' && rich3D());
  // Only one of the two little skies runs: the hidden one would still draw every frame.
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia(WIDE).matches);

  useEffect(() => {
    const onResize = () => setHeight(window.innerHeight);
    window.addEventListener('resize', onResize, { passive: true });
    const query = window.matchMedia(WIDE);
    const onWide = () => setWide(query.matches);
    query.addEventListener('change', onWide);
    return () => {
      window.removeEventListener('resize', onResize);
      query.removeEventListener('change', onWide);
    };
  }, []);

  const items: LocalizedNavItem[] = useMemo(
    () => navItems.map((item) => ({ ...item, label: t(item.labelKey) })),
    // t is recreated every render; language is the only thing that changes the labels.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language],
  );
  const layout = useMemo(() => menuLayout(height), [height]);

  const handleSectionClick = useCallback(
    (sectionId: SectionId) => onSectionChange(sectionId),
    [onSectionChange],
  );

  const switchLanguage = () => {
    toggleLanguage();
    menuSky.flip = Math.PI * 2;
  };

  const { sun, planets } = layout;
  const activeIndex = items.findIndex((i) => i.id === activeSection);
  const active = items[activeIndex];
  const languageLabel = (
    <span>
      <span className={language === 'it' ? 'font-bold' : 'opacity-50'}>IT</span>
      <span className="opacity-40"> / </span>
      <span className={language === 'en' ? 'font-bold' : 'opacity-50'}>EN</span>
    </span>
  );

  return (
    <>
      {/* Desktop: a small solar system, the photo as its Sun */}
      <nav className="fixed left-0 top-0 h-screen z-[100] hidden lg:block" style={{ width: MENU_WIDTH }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to right, #000 0%, rgba(0,0,0,0.88) 55%, transparent 100%)' }} />

        {/* Orbits: hairlines around the Sun; the one of the section you are in takes its planet's colour */}
        <svg className="menu-orbits absolute inset-0 pointer-events-none" width={MENU_WIDTH} height={height} aria-hidden="true">
          {planets.map((p, i) => {
            const isActive = activeIndex === i + 1;
            return (
              <circle
                key={p.body}
                cx={sun.x}
                cy={sun.y}
                r={p.orbit}
                fill="none"
                stroke={isActive ? items[i + 1].color : 'rgba(255,255,255,0.1)'}
                strokeOpacity={isActive ? 0.75 : 1}
                strokeWidth={isActive ? 1.4 : 1}
                style={{ transition: 'stroke 0.6s, stroke-opacity 0.6s' }}
              />
            );
          })}
          {[layout.language, layout.resume].map((p) => (
            <circle key={p.body} cx={sun.x} cy={sun.y} r={p.orbit} fill="none" stroke="rgba(255,255,255,0.07)" strokeDasharray="2 6" />
          ))}
        </svg>

        {use3D ? (
          wide && (
            <Suspense fallback={null}>
              <MenuSky layout={layout} />
            </Suspense>
          )
        ) : (
          [...planets, layout.language, layout.resume].map((p) => (
            <span key={p.body} className="absolute pointer-events-none" style={{ left: p.x - p.r, top: p.y - p.r }}>
              <MiniPlanet body={p.body} size={p.r * 2} />
            </span>
          ))
        )}

        {/* The Sun: the photo, ringed in orange, flames rising from its rim (drawn by MenuSky) */}
        <button
          type="button"
          onClick={() => handleSectionClick('home')}
          onMouseEnter={() => (menuSky.heat = 1)}
          onMouseLeave={() => (menuSky.heat = 0)}
          aria-label={items[0].label}
          aria-current={activeIndex === 0 ? 'true' : undefined}
          className="group absolute flex items-center"
          style={{ left: sun.x - sun.r, top: sun.y - sun.r, height: sun.r * 2 }}
        >
          <span className="menu-sun block rounded-full overflow-hidden shrink-0" style={{ width: sun.r * 2, height: sun.r * 2 }}>
            <img src={profilePhoto} alt="Filippo Spazzali" className="w-full h-full object-cover" />
          </span>
          <span className="ml-12">
            <Label color={items[0].color} index="01" text={items[0].label} active={activeIndex === 0} delay={0.5} animate={use3D} />
          </span>
        </button>

        {/* The planets, one per section */}
        {planets.map((p, i) => {
          const item = items[i + 1];
          const isActive = activeIndex === i + 1;
          const box = Math.max(p.r, 16);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSectionClick(item.id)}
              aria-label={item.label}
              aria-current={isActive ? 'true' : undefined}
              className="group absolute flex items-center"
              style={{ left: p.x - p.r, top: p.y - box, height: box * 2 }}
            >
              <span className="shrink-0" style={{ width: p.r + reach(p) }} />
              <Label
                color={item.color}
                index={String(i + 2).padStart(2, '0')}
                text={item.label}
                active={isActive}
                delay={arrival(i)}
                animate={use3D}
              />
            </button>
          );
        })}

        {/* Beyond the last orbit: Neptune switches the language, Pluto downloads the CV */}
        <button
          type="button"
          onClick={switchLanguage}
          aria-label={language === 'en' ? 'Switch to Italian' : 'Passa all’inglese'}
          className="group absolute flex items-center"
          style={{ left: layout.language.x - layout.language.r, top: layout.language.y - 16, height: 32 }}
        >
          <span className="shrink-0" style={{ width: layout.language.r * 2 + 12 }} />
          <Label color={outerBodies.language.color} text={languageLabel} active={false} delay={arrival(7.6)} animate={use3D} />
        </button>
        <a
          href={RESUME_URL}
          download
          aria-label={t('nav.downloadCV')}
          title={t('nav.downloadCV')}
          className="group absolute flex items-center"
          style={{ left: layout.resume.x - layout.resume.r, top: layout.resume.y - 16, height: 32 }}
        >
          <span className="shrink-0" style={{ width: layout.resume.r * 2 + 12 }} />
          <Label
            color={outerBodies.resume.color}
            text={
              <span className="flex items-center gap-1.5">
                <FileDown className="w-3.5 h-3.5" />
                CV
              </span>
            }
            active={false}
            delay={arrival(8.6)}
            animate={use3D}
          />
        </a>
      </nav>

      {/* Phone / tablet: a slim bar on top (where you are, language, CV), the planets in the dock below */}
      <header className="fixed top-0 inset-x-0 z-[100] lg:hidden bg-black/90 border-b border-white/10" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center justify-between gap-3 h-14 px-4">
          <button type="button" onClick={() => handleSectionClick('home')} className="flex flex-col items-start min-w-0 text-left" aria-label={items[0].label}>
            <span className="text-[15px] font-semibold leading-tight text-foreground">Filippo Spazzali</span>
            {active && (
              <span key={active.id} className="menu-arrive flex items-center gap-1.5 max-w-full text-xs leading-tight text-white/75">
                <span className="text-[10px] font-mono font-bold tabular-nums" style={{ color: active.color }}>
                  {String(activeIndex + 1).padStart(2, '0')}
                </span>
                <span className="truncate">{active.label}</span>
              </span>
            )}
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={switchLanguage}
              className="h-9 px-3 rounded-full border border-white/10 bg-black/60 text-xs transition-colors active:bg-[#5b7cf0] active:text-black"
              aria-label={language === 'en' ? 'Switch to Italian' : 'Passa all’inglese'}
            >
              {languageLabel}
            </button>
            <a
              href={RESUME_URL}
              download
              aria-label={t('nav.downloadCV')}
              title={t('nav.downloadCV')}
              className="h-9 px-3 rounded-full border border-white/10 bg-black/60 flex items-center gap-1.5 text-xs font-medium transition-colors active:bg-[#cdb8a0] active:text-black"
            >
              <FileDown className="w-3.5 h-3.5" />
              CV
            </a>
          </div>
        </div>
      </header>

      <MobileDock items={items} activeIndex={activeIndex} onSelect={handleSectionClick} use3D={use3D && !wide} />
    </>
  );
};

export default OrbitalNavigation;
