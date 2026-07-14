import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/LanguageContext';
import NutritionCard from '@/components/NutritionCard';
import NutritionCarousel from '@/components/NutritionCarousel';
import NutritionDietFilter from '@/components/NutritionDietFilter';

const CATEGORIES = [
  { key: 'protein', labelKey: 'nutri.proteins' },
  { key: 'fats', labelKey: 'nutri.good_fats' },
  { key: 'simple_carbs', labelKey: 'nutri.simple_carbs' },
  { key: 'complex_carbs', labelKey: 'nutri.complex_carbs' },
  { key: 'fiber', labelKey: 'nutri.fiber' },
  { key: 'supplements', labelKey: 'nutri.supplements' },
  { key: 'recipes', labelKey: 'nutri.recipes' },
];

export default function NutritionHub() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [dietFilter, setDietFilter] = useState('all');

  useEffect(() => {
    base44.entities.NutritionItem.filter({ status: 'approved' }, '-created_date', 100)
      .then((all) => {
        const grouped = {};
        CATEGORIES.forEach((c) => { grouped[c.key] = []; });
        all.forEach((item) => {
          if (grouped[item.category]) grouped[item.category].push(item);
        });
        setItems(grouped);
      })
      .finally(() => setLoading(false));
  }, []);

  const filterByDiet = (list) => {
    if (dietFilter === 'all') return list;
    return list.filter((item) => item.diet_tags?.includes(dietFilter));
  };

  return (
    <div className="px-5 pt-12">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-heading font-light">{t('nutri.title')}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{t('nutri.subtitle')}</p>
        </div>
        <button onClick={() => navigate('/submit-recipe')} className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center glow-gold active:scale-95 transition-transform">
          <Plus size={20} />
        </button>
      </div>

      <div className="mb-6">
        <NutritionDietFilter selected={dietFilter} onSelect={setDietFilter} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          {CATEGORIES.map((cat) => {
            const catItems = filterByDiet(items[cat.key] || []);
            if (catItems.length === 0) return null;
            return (
              <div key={cat.key} className="animate-fade-in">
                <h2 className="text-lg font-heading font-light text-gradient-gold mb-3">{t(cat.labelKey)}</h2>
                <NutritionCarousel items={catItems} onItemClick={(item) => navigate(`/nutrition-hub/${item.id}`)} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}