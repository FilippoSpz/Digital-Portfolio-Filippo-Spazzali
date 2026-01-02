import { useEffect, useState, useRef } from "react";
import { Briefcase, Clock, Code2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface StatItemProps {
  icon: React.ReactNode;
  value: number;
  suffix: string;
  labelKey: string;
  color: string;
}

const StatItem = ({ icon, value, suffix, labelKey, color }: StatItemProps) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  return (
    <div
      ref={ref}
      className="group relative flex flex-col items-center p-6 bg-card/30 rounded-2xl border border-border/30 hover:border-primary/50 transition-all duration-300 hover:scale-105"
    >
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">
        {count}{suffix}
      </div>
      <p className="text-sm text-muted-foreground text-center">{t(labelKey)}</p>
    </div>
  );
};

const StatsCounter = () => {
  const stats = [
    {
      icon: <Briefcase className="w-6 h-6 text-background" />,
      value: 5,
      suffix: "+",
      labelKey: "stats.projects",
      color: "from-primary to-secondary",
    },
    {
      icon: <Clock className="w-6 h-6 text-background" />,
      value: 3,
      suffix: "+",
      labelKey: "stats.yearsExperience",
      color: "from-secondary to-accent",
    },
    {
      icon: <Code2 className="w-6 h-6 text-background" />,
      value: 10,
      suffix: "+",
      labelKey: "stats.technologies",
      color: "from-accent to-primary",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <StatItem key={index} {...stat} />
      ))}
    </div>
  );
};

export default StatsCounter;
