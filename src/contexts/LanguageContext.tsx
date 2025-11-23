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
    'home.tagline': 'Passionate software developer with expertise in web technologies and a keen eye for crafting delightful user experiences.',
    'home.getInTouch': 'Get In Touch',
    'home.downloadCV': 'Download CV',
    
    // About
    'about.title': 'About Me',
    'about.intro': "I'm a passionate software developer with a strong foundation in web technologies and a keen eye for creating seamless user experiences.",
    'about.professionalSummary': 'Professional Summary',
    'about.professionalSummaryText': 'Software Developer, in particular Web Developer, holding Cisco IT Essentials and CCNA Certifications with 4 years of experience in web development and software management. Demonstrated ability in developing user-friendly management software using HTML, CSS and TypeScript to significantly improve system performance and usability.',
    'about.experience': 'Work Experience',
    'about.education': 'Education',
    'about.languages': 'Languages',
    'about.languagesText': 'Proficient',
    'about.nativeLevel': 'Native',
    'about.viewInstitute': 'View Institute',
    'about.contactCTA': "Interested in working together? Let's connect and discuss your project.",
    'about.getInTouch': 'Get In Touch',
    
    // Work Experience
    'experience.webDeveloper': 'Web Developer',
    'experience.intern': 'Intern',
    'experience.viaglut.desc1': 'Identified and resolved various issues, revamping and optimizing site sections using Magento and effectively integrating HTML and CSS.',
    'experience.viaglut.desc2': 'Created intuitive and user-oriented web pages to enhance browsing experience, managing the entire process independently.',
    'experience.circolo.desc1': 'Developed a private management software from scratch using HTML, CSS, and JavaScript',
    'experience.circolo.desc2': 'Replaced an old program and significantly improved performance and usability',
    'experience.wartsila.desc1': 'Designed and developed the initial user interface of a management program using HTML, CSS, and JavaScript',
    'experience.wartsila.desc2': 'Participated in daily team meetings to review progress and gather feedback, enhancing collaboration and learning',
    
    // Education
    'education.bachelors': "Bachelor's Degree in Computer Engineering",
    'education.university': 'University of Trieste',
    'education.expectedGraduation': 'Expected July 2026',
    'education.highSchool': 'High School Diploma',
    'education.technicalInstitute': 'Alessandro Volta Technical Institute',
    'education.graduated': 'July 2022',
    
    // Skills
    'skills.title': 'Skills & Technologies',
    'skills.subtitle': 'Technologies I work with',
    
    // Certifications
    'certifications.title': 'Certifications',
    'certifications.subtitle': 'Professional certifications and achievements',
    'certifications.view': 'View Certificate',
    'certifications.download': 'Download',
    'certifications.ccna.title': 'Cisco CCNA Certification',
    'certifications.ccna.issuer': 'Cisco Networking Academy',
    'certifications.ccna.date': 'April 2022',
    'certifications.ccna.description': 'CCNAv7: Introduction to Networks - Comprehensive networking certification covering network fundamentals, routing, switching, and security.',
    'certifications.itEssentials.title': 'Cisco IT Essentials Certification',
    'certifications.itEssentials.issuer': 'Cisco Networking Academy',
    'certifications.itEssentials.date': 'November 2020',
    'certifications.itEssentials.description': 'Comprehensive IT hardware and software certification covering computer assembly, troubleshooting, and maintenance.',
    'certifications.safety.title': 'Safety Course Certificate',
    'certifications.safety.issuer': 'Wärtsilä Italia / Mega Italia Media',
    'certifications.safety.date': 'February 2022',
    'certifications.safety.description': 'Specific Training for Low Risk Offices - Occupational health and safety training in accordance with Italian regulations.',
    'certifications.internship.title': 'Internship Completion Certificate',
    'certifications.internship.issuer': 'Wärtsilä Italia S.p.A.',
    'certifications.internship.date': 'February 2022',
    'certifications.internship.description': 'Successfully completed internship at Wärtsilä Italia R&D Engineering, working on UI development and team collaboration.',
    
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
    'portfolio.circolo.description': 'Developed a comprehensive private management software from scratch for CIRCOLO AZIENDALE FINCANTIERI - WÄRTSILÄ ITALIA. Replaced legacy system and significantly improved performance and usability.',
    'portfolio.circolo.category': 'Software Development',
    'portfolio.circolo.tech': 'HTML, CSS, JavaScript, PHP, MySQL',
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
    'home.tagline': 'Sono uno sviluppatore software entusiasta, con una forte competenza nel mondo delle tecnologie web e una cura particolare per la progettazione di interfacce piacevoli da utilizzare.',
    'home.getInTouch': 'Contattami',
    'home.downloadCV': 'Scarica CV',
    
    // About
    'about.title': 'Chi Sono',
    'about.intro': 'Sono uno sviluppatore software appassionato con una solida base nelle tecnologie web e un occhio attento alla creazione di esperienze utente fluide.',
    'about.professionalSummary': 'Profilo Professionale',
    'about.professionalSummaryText': 'Sviluppatore Software, in particolare Web Developer, in possesso delle Certificazioni Cisco IT Essentials e CCNA con 4 anni di esperienza nello sviluppo web e nella gestione software. Comprovata capacità nello sviluppo di software gestionali user-friendly utilizzando HTML, CSS e TypeScript per migliorare significativamente le prestazioni e l\'usabilità dei sistemi.',
    'about.experience': 'Esperienza Lavorativa',
    'about.education': 'Formazione',
    'about.languages': 'Lingue',
    'about.languagesText': 'Avanzato',
    'about.nativeLevel': 'Madrelingua',
    'about.viewInstitute': 'Visualizza Istituto',
    'about.contactCTA': 'Interessato a lavorare insieme? Mettiamoci in contatto per discutere del tuo progetto.',
    'about.getInTouch': 'Contattami',
    
    // Work Experience
    'experience.webDeveloper': 'Web Developer',
    'experience.intern': 'Stagista',
    'experience.viaglut.desc1': 'Ho individuato e risolto diverse problematiche, rinnovando e ottimizzando sezioni del sito utilizzando Magento e integrando efficacemente HTML e CSS.',
    'experience.viaglut.desc2': 'Ho realizzato pagine web intuitive e orientate all\'utente per migliorare l\'esperienza di navigazione, gestendo l\'intero processo in autonomia.',
    'experience.circolo.desc1': 'Ho sviluppato da zero un software gestionale privato utilizzando HTML, CSS e JavaScript',
    'experience.circolo.desc2': 'Ho sostituito un vecchio programma migliorando significativamente le prestazioni e l\'usabilità',
    'experience.wartsila.desc1': 'Ho progettato e sviluppato l\'interfaccia utente iniziale di un programma gestionale utilizzando HTML, CSS e JavaScript',
    'experience.wartsila.desc2': 'Ho partecipato alle riunioni quotidiane del team per rivedere i progressi e raccogliere feedback, migliorando la collaborazione e l\'apprendimento',
    
    // Education
    'education.bachelors': 'Laurea Triennale in Ingegneria Informatica',
    'education.university': 'Università degli Studi di Trieste',
    'education.expectedGraduation': 'Prevista Luglio 2026',
    'education.highSchool': 'Diploma di Scuola Superiore',
    'education.technicalInstitute': 'Istituto Tecnico Alessandro Volta',
    'education.graduated': 'Luglio 2022',
    
    // Skills
    'skills.title': 'Competenze & Tecnologie',
    'skills.subtitle': 'Tecnologie con cui lavoro',
    
    // Certifications
    'certifications.title': 'Certificazioni',
    'certifications.subtitle': 'Certificazioni professionali e riconoscimenti',
    'certifications.view': 'Vedi Certificato',
    'certifications.download': 'Scarica',
    'certifications.ccna.title': 'Certificazione Cisco CCNA',
    'certifications.ccna.issuer': 'Cisco Networking Academy',
    'certifications.ccna.date': 'Aprile 2022',
    'certifications.ccna.description': 'CCNAv7: Introduzione alle Reti - Certificazione completa di networking che copre fondamenti di rete, routing, switching e sicurezza.',
    'certifications.itEssentials.title': 'Certificazione Cisco IT Essentials',
    'certifications.itEssentials.issuer': 'Cisco Networking Academy',
    'certifications.itEssentials.date': 'Novembre 2020',
    'certifications.itEssentials.description': 'Certificazione completa su hardware e software IT che copre assemblaggio computer, risoluzione problemi e manutenzione.',
    'certifications.safety.title': 'Certificato Corso Sicurezza',
    'certifications.safety.issuer': 'Wärtsilä Italia / Mega Italia Media',
    'certifications.safety.date': 'Febbraio 2022',
    'certifications.safety.description': 'Formazione Specifica per Uffici a Rischio Basso - Formazione sulla salute e sicurezza sul lavoro secondo le normative italiane.',
    'certifications.internship.title': 'Certificato Completamento Stage',
    'certifications.internship.issuer': 'Wärtsilä Italia S.p.A.',
    'certifications.internship.date': 'Febbraio 2022',
    'certifications.internship.description': 'Ho completato con successo lo stage presso Wärtsilä Italia R&D Engineering, lavorando sullo sviluppo UI e sulla collaborazione di team.',
    
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
    'portfolio.circolo.description': 'Ho sviluppato da zero un software gestionale privato completo per il CIRCOLO AZIENDALE FINCANTIERI - WÄRTSILÄ ITALIA. Ho sostituito il sistema legacy migliorando significativamente le prestazioni e l\'usabilità.',
    'portfolio.circolo.category': 'Sviluppo Software',
    'portfolio.circolo.tech': 'HTML, CSS, JavaScript, PHP, MySQL',
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
