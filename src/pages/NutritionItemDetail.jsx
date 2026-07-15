import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Flame, Beef, Droplet, Wheat } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/LanguageContext';
import MobileHeader from '@/components/MobileHeader';

const CATEGORY_LABELS = {
  protein: 'nutri.proteins',
  fats: 'nutri.good_fats',
  simple_carbs: 'nutri.simple_carbs',
  complex_carbs: 'nutri.complex_carbs',
  fiber: 'nutri.fiber',
  supplements: 'nutri.supplements',
  recipes: 'nutri.recipes',
};

export default function NutritionItemDetail() {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.NutritionItem.get(id)
      .then(setItem)
      .finally(() => setLoading(false));
  }, [id]);

  const goBack = () => navigate('/nutrition-hub');

  if (loading) {
    return (
      <>
        <MobileHeader showBack onBack={goBack} />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (!item) {
    return (
      <>
        <MobileHeader showBack onBack={goBack} />
        <div className="px-5">
          <p className="text-sm text-muted-foreground">{t('nutri.not_found')}</p>
        </div>
      </>
    );
  }

  const macros = [
    { label: t('dash.calories'), val: item.calories, unit: 'cal', icon: Flame, color: 'text-primary' },
    { label: t('dash.protein'), val: item.protein, unit: 'g', icon: Beef, color: 'text-red-400' },
    { label: t('dash.fat'), val: item.fat, unit: 'g', icon: Droplet, color: 'text-yellow-400' },
    { label: t('dash.carbs'), val: item.carbs, unit: 'g', icon: Wheat, color: 'text-blue-400' },
  ];

  return (
    <>
      <MobileHeader title={item.name} showBack onBack={goBack} />
      <div className="px-5">
        <p className="text-xs text-primary tracking-wide uppercase mb-1">{t(CATEGORY_LABELS[item.category] || item.category)}</p>
        <h1 className="text-3xl font-heading font-light mb-4">{item.name}</h1>

        {item.diet_tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {item.diet_tags.map((tag) => (
              <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary capitalize">
                {t(`nutri.${tag}`)}
              </span>
            ))}
          </div>
        )}

        {item.benefits && (
          <div className="glass-card rounded-2xl p-4 mb-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{t('nutri.benefits')}</h3>
            <p className="text-sm text-foreground/90 leading-relaxed">{item.benefits}</p>
          </div>
        )}

        {item.where_to_buy && (
          <div className="glass-card rounded-2xl p-4 mb-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{t('nutri.where_to_buy')}</h3>
            <p className="text-sm text-foreground/90">{item.where_to_buy}</p>
          </div>
        )}

        {item.recommended_brands && (
          <div className="glass-card rounded-2xl p-4 mb-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{t('nutri.recommended_brands')}</h3>
            <p className="text-sm text-foreground/90 leading-relaxed">{item.recommended_brands}</p>
          </div>
        )}

        {item.calories != null && (
          <div className="grid grid-cols-4 gap-2 mt-4">
            {macros.map((m) => (
              <div key={m.label} className="glass-card rounded-2xl p-3 text-center">
                <m.icon size={18} className={`${m.color} mx-auto`} />
                <p className="text-lg font-heading font-light mt-1">{m.val || 0}<span className="text-xs text-muted-foreground">{m.unit}</span></p>
                <p className="text-[10px] text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}