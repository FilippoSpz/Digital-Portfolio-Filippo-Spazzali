import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "./contexts/LanguageContext";
import CosmicBackground from "./components/CosmicBackground";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <CosmicBackground />
        <Index />
        <ScrollToTop />
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
