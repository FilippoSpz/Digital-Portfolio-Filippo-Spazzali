import { ArrowRight, Download, Mail, Linkedin, Github } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import profilePhoto from "@/assets/profile-photo.jpeg";

const Home = () => {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-hero-bg via-background to-hero-bg" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                <span className="block text-foreground">Hi, I'm</span>
                <span className="block gradient-text">Filippo Spazzali</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground">
                Software Developer & Web Developer
              </p>
              <p className="text-lg text-muted-foreground max-w-xl">
                Building digital experiences that inspire. Specialized in web development with 
                4 years of experience creating innovative solutions using modern technologies.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white"
                  asChild
                >
                  <Link to="/contact">
                    Get In Touch
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary/50 hover:bg-primary/10"
                  asChild
                >
                  <a href="/certificates/Filippo_Spazzali_Resume.pdf" download>
                    <Download className="mr-2 h-5 w-5" />
                    Download CV
                  </a>
                </Button>
              </div>

              {/* Social Links */}
              <div className="flex gap-4 pt-4">
                <a
                  href="mailto:spazzalifilippo@icloud.com"
                  className="p-3 glass-card hover-lift rounded-full"
                  aria-label="Email"
                >
                  <Mail className="h-5 w-5 text-primary" />
                </a>
                <a
                  href="https://www.linkedin.com/in/filippo-spazzali"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 glass-card hover-lift rounded-full"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5 text-primary" />
                </a>
                <a
                  href="https://github.com/filippospazzali"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 glass-card hover-lift rounded-full"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5 text-primary" />
                </a>
              </div>
            </div>

            {/* Right Column - Image */}
            <div className="relative animate-float">
              <div className="relative w-full max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-3xl opacity-30 animate-glow" />
                <img
                  src={profilePhoto}
                  alt="Filippo Spazzali"
                  className="relative rounded-full w-full h-auto shadow-2xl border-4 border-primary/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-primary/50 flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-primary rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center glass-card p-6 hover-lift">
              <div className="text-4xl font-bold gradient-text">4+</div>
              <div className="text-muted-foreground mt-2">Years Experience</div>
            </div>
            <div className="text-center glass-card p-6 hover-lift">
              <div className="text-4xl font-bold gradient-text">3+</div>
              <div className="text-muted-foreground mt-2">Companies Worked</div>
            </div>
            <div className="text-center glass-card p-6 hover-lift">
              <div className="text-4xl font-bold gradient-text">4</div>
              <div className="text-muted-foreground mt-2">Certifications</div>
            </div>
            <div className="text-center glass-card p-6 hover-lift">
              <div className="text-4xl font-bold gradient-text">17+</div>
              <div className="text-muted-foreground mt-2">Technologies</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
