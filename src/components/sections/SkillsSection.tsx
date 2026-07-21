import { Code2 } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import SectionHeader from '@/components/common/SectionHeader';
import Reveal from '@/components/common/Reveal';
import { skillCategories, type SkillLevel } from '@/data/skills';

interface SkillsSectionProps {
  isActive: boolean;
}

const ProficiencyDots = ({ level, gradient }: { level: SkillLevel; gradient: string }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((dot) => (
      <span key={dot} className={`w-1.5 h-1.5 rounded-full ${dot <= level ? `bg-gradient-to-r ${gradient}` : 'bg-muted-foreground/30'}`} />
    ))}
  </div>
);

const SkillsSection = ({ isActive }: SkillsSectionProps) => {
  const { t } = useLanguage();

  const levelLabel = (level: SkillLevel) => {
    if (level === 5) return t('skills.level.expert');
    if (level === 4) return t('skills.level.advanced');
    return t('skills.level.intermediate');
  };

  return (
    <section
      id="skills"
      className={`min-h-screen py-24 relative transition-opacity duration-700 ${isActive ? 'opacity-100' : 'opacity-50'}`}
    >
      <div className="container mx-auto px-4 md:px-8 lg:pl-[25rem]">
        <SectionHeader icon={Code2} badge={t('nav.skills')} title={t('skills.title')} subtitle={t('skills.subtitle')} accent="accent" index="02" className="mb-14" />

        <div className="space-y-12">
          {skillCategories.map((category, ci) => {
            const CategoryIcon = category.icon;
            return (
              <Reveal key={category.categoryKey} variant="up" delay={ci * 60}>
                <div>
                  {/* Cluster header */}
                  <div className="flex items-center gap-4 mb-7">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center text-background shadow-lg`}>
                      <CategoryIcon className="w-6 h-6" />
                    </div>
                    <h3 className="font-display text-xl md:text-2xl font-bold whitespace-nowrap">{t(category.categoryKey)}</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
                  </div>

                  {/* Skill planets */}
                  <div className="flex flex-wrap gap-x-6 gap-y-8 justify-center sm:justify-start">
                    {category.skills.map((skill) => (
                      <div key={skill.name} className="group relative flex flex-col items-center gap-2 w-[92px]">
                        {/* Gradient-ring node */}
                        <div className={`relative rounded-full bg-gradient-to-br ${category.gradient} p-[2px] transition-transform duration-300 group-hover:scale-110`}>
                          <div className="w-16 h-16 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center">
                            <img src={skill.icon} alt={skill.name} loading="lazy" className="w-9 h-9 object-contain" />
                          </div>
                          <div className={`absolute inset-0 rounded-full opacity-0 group-hover:opacity-60 blur-lg transition-opacity duration-300 bg-gradient-to-br ${category.gradient}`} />
                        </div>

                        <span className="text-sm font-medium text-center leading-tight">{skill.name}</span>
                        <ProficiencyDots level={skill.level} gradient={category.gradient} />

                        {/* Tooltip */}
                        <span className="absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[10px] uppercase tracking-wider text-muted-foreground pointer-events-none">
                          {levelLabel(skill.level)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
