import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'it';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.skills': 'Skills',
    'nav.certifications': 'Certifications',
    'nav.portfolio': 'Portfolio',
    'nav.contact': 'Contact',
    'nav.downloadCV': 'Download CV',
    
    // Home
    'home.greeting': "Hi, I'm",
    'home.name': 'Filippo Spazzali',
    'home.title': 'Software Developer & Web Developer',
    'home.tagline': 'Building digital experiences that inspire.',
    'home.getInTouch': 'Get In Touch',
    'home.downloadCV': 'Download CV',
    
    // About
    'about.title': 'About Me',
    'about.intro': "I'm a passionate software developer with a strong foundation in web technologies and a keen eye for creating seamless user experiences.",
    'about.education': 'Education',
    'about.university': 'Computer Science',
    'about.universityName': 'University of Trieste',
    'about.universityPeriod': '2020 - Present',
    'about.highSchool': 'Information Technology',
    'about.highSchoolName': 'I.T.I. Alessandro Volta',
    'about.highSchoolPeriod': '2015 - 2020',
    'about.experience': 'Work Experience',
    'about.internship': 'IT Support Intern',
    'about.internshipCompany': 'Wärtsilä Italia S.p.A.',
    'about.internshipPeriod': 'Summer 2019',
    
    // Skills
    'skills.title': 'Skills & Technologies',
    'skills.subtitle': 'Technologies I work with',
    
    // Certifications
    'certifications.title': 'Certifications',
    'certifications.subtitle': 'Professional certifications and achievements',
    'certifications.view': 'View Certificate',
    
    // Portfolio
    'portfolio.title': 'Portfolio',
    'portfolio.subtitle': 'Some of my recent projects',
    'portfolio.viewProject': 'View Project',
    'portfolio.viewDetails': 'View Details',
    
    // Contact
    'contact.title': "Let's Connect",
    'contact.subtitle': "Feel free to reach out to me using any of the contact methods below. I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.",
    'contact.email': 'Email',
    'contact.phone': 'Phone',
    'contact.linkedin': 'LinkedIn',
    'contact.github': 'GitHub',
    'contact.instagram': 'Instagram',
  },
  it: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'Chi Sono',
    'nav.skills': 'Competenze',
    'nav.certifications': 'Certificazioni',
    'nav.portfolio': 'Portfolio',
    'nav.contact': 'Contatti',
    'nav.downloadCV': 'Scarica CV',
    
    // Home
    'home.greeting': 'Ciao, sono',
    'home.name': 'Filippo Spazzali',
    'home.title': 'Sviluppatore Software & Web Developer',
    'home.tagline': 'Creo esperienze digitali che ispirano.',
    'home.getInTouch': 'Contattami',
    'home.downloadCV': 'Scarica CV',
    
    // About
    'about.title': 'Chi Sono',
    'about.intro': 'Sono uno sviluppatore software appassionato con una solida base nelle tecnologie web e un occhio attento alla creazione di esperienze utente fluide.',
    'about.education': 'Formazione',
    'about.university': 'Informatica',
    'about.universityName': 'Università degli Studi di Trieste',
    'about.universityPeriod': '2020 - Presente',
    'about.highSchool': 'Informatica e Telecomunicazioni',
    'about.highSchoolName': 'I.T.I. Alessandro Volta',
    'about.highSchoolPeriod': '2015 - 2020',
    'about.experience': 'Esperienza Lavorativa',
    'about.internship': 'Stage IT Support',
    'about.internshipCompany': 'Wärtsilä Italia S.p.A.',
    'about.internshipPeriod': 'Estate 2019',
    
    // Skills
    'skills.title': 'Competenze & Tecnologie',
    'skills.subtitle': 'Tecnologie con cui lavoro',
    
    // Certifications
    'certifications.title': 'Certificazioni',
    'certifications.subtitle': 'Certificazioni professionali e riconoscimenti',
    'certifications.view': 'Vedi Certificato',
    
    // Portfolio
    'portfolio.title': 'Portfolio',
    'portfolio.subtitle': 'Alcuni dei miei progetti recenti',
    'portfolio.viewProject': 'Vedi Progetto',
    'portfolio.viewDetails': 'Vedi Dettagli',
    
    // Contact
    'contact.title': 'Contattami',
    'contact.subtitle': 'Non esitare a contattarmi utilizzando uno dei metodi qui sotto. Sono sempre aperto a discutere nuovi progetti, idee creative o opportunità per far parte della tua visione.',
    'contact.email': 'Email',
    'contact.phone': 'Telefono',
    'contact.linkedin': 'LinkedIn',
    'contact.github': 'GitHub',
    'contact.instagram': 'Instagram',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
