# 🌐 Digital Portfolio — Filippo Spazzali

A modern, responsive, bilingual (🇮🇹 / 🇬🇧) portfolio with a cosmic "solar‑system" theme.
Live: **https://filippospz.netlify.app/**

---

## 🛠️ Tech Stack

- **React 18** + **TypeScript** (strict mode)
- **Vite** (SWC) as build tool and dev server
- **Tailwind CSS** + a small design‑system layer (deep‑space theme)
- **Space Grotesk** (display) + **Inter** (body)
- **shadcn/ui** (Button) on top of **Radix UI**, **lucide-react** icons
- **react-three-fiber / three.js** — a lazy‑loaded WebGL scene (3D starfield + planet) with a graceful 2D canvas fallback; respects `prefers-reduced-motion`
- Cinematic scroll reveals via IntersectionObserver
- Lightweight custom **i18n** (EN/IT) with `localStorage` persistence and browser‑language detection

The 3D bundle is code‑split, so the initial load stays light and only pulls in three.js when WebGL is available.

---

## 📂 Project Structure

```
src/
├── main.tsx                # entry point
├── App.tsx                 # providers + layout
├── styles/index.css        # design system + globals
├── assets/                 # images, portfolio screenshots, skill icons
├── components/
│   ├── layout/             # OrbitalNavigation, ScrollToTop
│   ├── background/         # CosmicBackground (canvas)
│   ├── sections/           # Home, About, Skills, Certifications, Portfolio, Contact
│   ├── common/             # SectionHeader (shared)
│   └── ui/                 # button (shadcn)
├── data/                   # navigation, experiences, skills, certifications, projects, contact
├── i18n/                   # LanguageContext + translations/{en,it}
├── hooks/                  # useIsMobile, useActiveSection (IntersectionObserver)
├── lib/                    # utils
└── pages/                  # Index
```

Content (experiences, skills, projects, certifications, contacts) lives in `src/data/`,
kept separate from presentation. Copy lives in `src/i18n/translations/`.

---

## 🚀 Getting Started

```bash
npm install       # install dependencies
npm run dev       # start dev server (http://localhost:8080)
npm run build     # production build
npm run preview   # preview the production build
npm run lint      # eslint
npm run typecheck # TypeScript type checking
```

---

## 🌍 Deployment

Deployed on **Netlify** with continuous integration from GitHub, automatic HTTPS and SSL.

---

## 📧 Contact

- Email: spazzalifilippo@icloud.com
- LinkedIn: https://www.linkedin.com/in/filippospazzali/
- GitHub: https://github.com/FilippoSpz/
