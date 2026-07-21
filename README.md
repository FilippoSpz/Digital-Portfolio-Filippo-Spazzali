# 🌐 Digital Portfolio — Filippo Spazzali

A modern, responsive, bilingual (🇮🇹 / 🇬🇧) portfolio with a cosmic "solar‑system" theme.
Live: **https://filippospz.netlify.app/**

---

## 🛠️ Tech Stack

- **React 18** + **TypeScript** (strict mode)
- **Vite** (SWC) as build tool and dev server
- **Tailwind CSS** for styling + a small design‑system layer
- **shadcn/ui** (Button) on top of **Radix UI**
- **lucide-react** for icons
- Canvas‑based animated **cosmic background** (stars + nebulae), respects `prefers-reduced-motion`
- Lightweight custom **i18n** with `localStorage` persistence and browser‑language detection

No heavy 3D dependencies, no dead UI kit — only what the site actually uses.

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
