import { Award, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const Certifications = () => {
  const certificates = [
    {
      title: "Cisco CCNA Certification",
      issuer: "Cisco Networking Academy",
      date: "April 2022",
      description: "CCNAv7: Introduction to Networks - Comprehensive networking certification covering network fundamentals, routing, switching, and security.",
      file: "/certificates/FilippoSpazzaliCCNAv7_-_certificate.pdf",
      color: "from-primary to-secondary",
    },
    {
      title: "Cisco IT Essentials Certification",
      issuer: "Cisco Networking Academy",
      date: "November 2020",
      description: "Comprehensive IT hardware and software certification covering computer assembly, troubleshooting, and maintenance.",
      file: "/certificates/CISCO_IT_Essential.pdf",
      color: "from-secondary to-accent",
    },
    {
      title: "Safety Course Certificate",
      issuer: "Wärtsilä Italia / Mega Italia Media",
      date: "February 2022",
      description: "Specific Training for Low Risk Offices - Occupational health and safety training in accordance with Italian regulations.",
      file: "/certificates/certificato_sicurezza_lavoro.pdf",
      color: "from-accent to-primary",
    },
    {
      title: "Internship Completion Certificate",
      issuer: "Wärtsilä Italia S.p.A.",
      date: "February 2022",
      description: "Successfully completed internship at Wärtsilä Italia R&D Engineering, working on UI development and team collaboration.",
      file: "/certificates/certificazione_wartsila.pdf",
      color: "from-primary to-accent",
    },
  ];

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <Award className="inline-block mr-3 mb-2 h-10 w-10 text-primary" />
            <span className="gradient-text">Certifications</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Professional certifications and achievements that demonstrate my expertise and commitment to continuous learning
          </p>
        </div>

        {/* Certificates Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {certificates.map((cert, index) => (
            <div
              key={index}
              className="glass-card p-8 hover-lift group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Header with gradient */}
              <div className={`mb-6 p-4 rounded-xl bg-gradient-to-br ${cert.color} text-white`}>
                <h3 className="text-xl font-bold mb-2">{cert.title}</h3>
                <p className="text-sm opacity-90">{cert.issuer}</p>
              </div>

              {/* Date */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                  {cert.date}
                </span>
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {cert.description}
              </p>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="default"
                  className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  asChild
                >
                  <a href={cert.file} download>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-primary/50 hover:bg-primary/10"
                  asChild
                >
                  <a href={cert.file} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold mb-6 text-center gradient-text">
              Certification Highlights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold gradient-text mb-2">4</div>
                <p className="text-muted-foreground">Total Certifications</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold gradient-text mb-2">2</div>
                <p className="text-muted-foreground">Cisco Certifications</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold gradient-text mb-2">2022</div>
                <p className="text-muted-foreground">Most Recent Year</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Certifications;
