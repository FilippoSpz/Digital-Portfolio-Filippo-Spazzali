import { LanguageProvider } from '@/i18n/LanguageContext';
import ScrollToTop from '@/components/layout/ScrollToTop';
import Index from '@/pages/Index';

const App = () => (
  <LanguageProvider>
    <Index />
    <ScrollToTop />
  </LanguageProvider>
);

export default App;
