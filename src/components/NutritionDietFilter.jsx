import { useLanguage } from '@/lib/LanguageContext';

const DIETS = ['all', 'vegan', 'vegetarian', 'keto', 'carnivore', 'paleo', 'mediterranean', 'gluten_free', 'dairy_free'];

export default function NutritionDietFilter({ selected, onSelect }) {
  const { t } = useLanguage();

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5 pb-2">
      {DIETS.map((diet) => (
        <button
          key={diet}
          onClick={() => onSelect(diet)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${
            selected === diet ? 'bg-primary text-primary-foreground' : 'glass-card text-muted-foreground'
          }`}
        >
          {t(`nutri.${diet}`)}
        </button>
      ))}
    </div>
  );
}