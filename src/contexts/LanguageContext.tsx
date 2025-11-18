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
    'portfolio.viewProject': 'See More',
    'portfolio.viewDetails': 'View Details',
    'portfolio.moreComingSoon': 'More Projects Coming Soon',
    'portfolio.moreComingSoonDesc': "I'm constantly working on new projects and expanding my portfolio. These projects represent my professional experience and demonstrate my ability to build scalable, user-friendly applications. Feel free to contact me to learn more about any of these projects or to discuss potential collaborations.",
    
    // Portfolio Projects
    'portfolio.viaglut.title': 'ViaGlut Website Redesign',
    'portfolio.viaglut.description': 'Redesigned and optimized parts of the ViaGlut website using Magento, HTML, and CSS. Focused on creating user-friendly and intuitive interfaces to enhance customer experience.',
    'portfolio.viaglut.category': 'Web Development',
    'portfolio.circolo.title': 'Management Software System',
    'portfolio.circolo.description': 'Developed a comprehensive management software from scratch for CIRCOLO AZIENDALE FINCANTIERI - WÄRTSILÄ ITALIA. Replaced legacy system and significantly improved performance and usability.',
    'portfolio.circolo.category': 'Software Development',
    'portfolio.wartsila.title': 'Wärtsilä UI Development',
    'portfolio.wartsila.description': 'Designed and developed the initial user interface for a management program during internship at Wärtsilä Italia. Collaborated with the R&D Engineering team.',
    'portfolio.wartsila.category': 'Internship Project',
    'portfolio.technologiesUsed': 'Technologies Used:',
    
    // Skills Categories
    'skills.category.softwareProgramming': 'Software Programming',
    'skills.category.webProgramming': 'Web Programming',
    'skills.category.databases': 'Databases',
    'skills.category.hardware': 'Hardware & Networking',
    'skills.category.office': 'Office & Productivity',
    
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
    'portfolio.viewProject': 'Scopri di più',
    'portfolio.viewDetails': 'Vedi Dettagli',
    'portfolio.moreComingSoon': 'Altri Progetti in Arrivo',
    'portfolio.moreComingSoonDesc': 'Sto costantemente lavorando su nuovi progetti ed espandendo il mio portfolio. Questi progetti rappresentano la mia esperienza professionale e dimostrano la mia capacità di costruire applicazioni scalabili e user-friendly. Non esitare a contattarmi per saperne di più su questi progetti o per discutere potenziali collaborazioni.',
    
    // Portfolio Projects
    'portfolio.viaglut.title': 'Redesign Sito Web ViaGlut',
    'portfolio.viaglut.description': 'Ho riprogettato e ottimizzato parti del sito web ViaGlut utilizzando Magento, HTML e CSS. Mi sono concentrato sulla creazione di interfacce user-friendly e intuitive per migliorare l\'esperienza del cliente.',
    'portfolio.viaglut.category': 'Sviluppo Web',
    'portfolio.circolo.title': 'Sistema Software Gestionale',
    'portfolio.circolo.description': 'Ho sviluppato da zero un software gestionale completo per il CIRCOLO AZIENDALE FINCANTIERI - WÄRTSILÄ ITALIA. Ho sostituito il sistema legacy migliorando significativamente le prestazioni e l\'usabilità.',
    'portfolio.circolo.category': 'Sviluppo Software',
    'portfolio.wartsila.title': 'Sviluppo UI Wärtsilä',
    'portfolio.wartsila.description': 'Ho progettato e sviluppato l\'interfaccia utente iniziale per un programma gestionale durante il tirocinio presso Wärtsilä Italia. Ho collaborato con il team di Ingegneria R&D.',
    'portfolio.wartsila.category': 'Progetto di Stage',
    'portfolio.technologiesUsed': 'Tecnologie Utilizzate:',
    
    // Skills Categories
    'skills.category.softwareProgramming': 'Programmazione Software',
    'skills.category.webProgramming': 'Programmazione Web',
    'skills.category.databases': 'Database',
    'skills.category.hardware': 'Hardware & Networking',
    'skills.category.office': 'Office & Produttività',
    
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
