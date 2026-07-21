import { Code2 } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import SectionHeader from '@/components/common/SectionHeader';
import { skillCategories, type SkillCategory, type SkillLevel } from '@/data/skills';

interface SkillsSectionProps {
  isActive: boolean;
}

const ProficiencyDots = ({ level, gradient }: { level: SkillLevel; gradient: string }) => (
  <div className="flex gap-1 mt-1">
    {[1, 2, 3, 4, 5].map((dot) => (
      <div
        key={dot}
        className={`w-2 h-2 rounded-full transition-all ${dot <= level ? `bg-gradient-to-r ${gradient}` : 'bg-muted-foreground/30'}`}
      />
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

  const renderCard = (category: SkillCategory) => {
    const CategoryIcon = category.icon;
    return (
      <div key={category.categoryKey} className="relative flex-1">
        <div className="bg-card/30 rounded-2xl border border-border/30 overflow-hidden h-full">
          <div className="p-4 lg:p-6 border-b border-border/30">
            <div className="flex items-center gap-4 justify-center lg:justify-start">
              <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center text-background`}>
                <CategoryIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg lg:text-xl font-bold">{t(category.categoryKey)}</h3>
            </div>
          </div>

          <div className="p-4 lg:p-6">
            <div className="flex flex-wrap gap-4 lg:gap-6 justify-center lg:justify-start">
              {category.skills.map((skill) => (
                <div key={skill.name} className="group relative">
                  <div className="relative flex flex-col items-center gap-2 px-4 py-3 bg-background/50 rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 min-w-[100px]">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-lg bg-foreground/5" />
                      <img src={skill.icon} alt={skill.name} loading="lazy" className="relative w-10 h-10 object-contain" />
                    </div>
                    <span className="font-medium text-sm text-center">{skill.name}</span>
                    <ProficiencyDots level={skill.level} gradient={category.gradient} />
                    <span className="text-xs text-muted-foreground">{levelLabel(skill.level)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      id="skills"
      className={`min-h-screen py-24 relative transition-opacity duration-700 ${isActive ? 'opacity-100' : 'opacity-50'}`}
    >
      <div className="container mx-auto px-4 md:px-8 lg:pl-40">
        <SectionHeader icon={Code2} badge={t('nav.skills')} title={t('skills.title')} subtitle={t('skills.subtitle')} accent="accent" className="mb-16" />

        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">{skillCategories.slice(0, 2).map(renderCard)}</div>
          <div className="flex flex-col lg:flex-row gap-6">{skillCategories.slice(2, 4).map(renderCard)}</div>
          <div className="flex flex-col gap-6">{skillCategories.slice(4).map(renderCard)}</div>
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
