import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import NutritionCard from '@/components/NutritionCard';

const CATEGORIES = [
  { key: 'protein', label: 'Proteins', desc: 'Lean, high-quality sources' },
  { key: 'fats', label: 'Good Fats', desc: 'Healthy, essential fats' },
  { key: 'simple_carbs', label: 'Simple Carbs', desc: 'Fast-digesting energy' },
  { key: 'complex_carbs', label: 'Complex Carbs', desc: 'Slow-burning fuel' },
  { key: 'fiber', label: 'Fiber-Rich', desc: 'Digestive health' },
  { key: 'recipes', label: 'Recipes', desc: 'Community creations' },
];

export default function NutritionHub() {
  const navigate = useNavigate();
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="px-5 pt-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-light">Nutrition Hub</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Swipe to explore · Tap for details</p>
        </div>
        <button onClick={() => navigate('/submit-recipe')} className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center glow-gold active:scale-95 transition-transform">
          <Plus size={20} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          {CATEGORIES.map((cat) => {
            const catItems = items[cat.key] || [];
            if (catItems.length === 0) return null;
            return (
              <div key={cat.key} className="animate-fade-in">
                <div className="mb-3">
                  <h2 className="text-lg font-heading font-light text-gradient-gold">{cat.label}</h2>
                  <p className="text-xs text-muted-foreground">{cat.desc}</p>
                </div>
                <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x pb-2 -mx-5 px-5">
                  {catItems.map((item) => (
                    <NutritionCard key={item.id} item={item} onClick={() => navigate(`/nutrition-hub/${item.id}`)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}