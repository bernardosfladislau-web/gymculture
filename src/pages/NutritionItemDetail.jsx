import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Flame, Beef, Droplet, Wheat } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function NutritionItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    base44.entities.NutritionItem.get(id)
      .then(setItem)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="px-5 pt-12">
        <button onClick={() => navigate('/nutrition-hub')} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
          <ChevronLeft size={16} /> Back
        </button>
        <p className="text-sm text-muted-foreground">Item not found.</p>
      </div>
    );
  }

  const macros = [
    { label: 'Calories', val: item.calories, unit: 'cal', icon: Flame, color: 'text-primary' },
    { label: 'Protein', val: item.protein, unit: 'g', icon: Beef, color: 'text-red-400' },
    { label: 'Fat', val: item.fat, unit: 'g', icon: Droplet, color: 'text-yellow-400' },
    { label: 'Carbs', val: item.carbs, unit: 'g', icon: Wheat, color: 'text-blue-400' },
  ];

  return (
    <div className="min-h-screen">
      {item.photo_url && !imgError && (
        <div className="relative h-72 -mx-0 -mt-0">
          <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover" onError={() => setImgError(true)} />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <button onClick={() => navigate('/nutrition-hub')} className="absolute top-12 left-5 w-9 h-9 rounded-full glass-card flex items-center justify-center">
            <ChevronLeft size={18} />
          </button>
        </div>
      )}

      <div className={`px-5 ${item.photo_url && !imgError ? '-mt-12 relative' : 'pt-12'}`}>
        {(!item.photo_url || imgError) && (
          <button onClick={() => navigate('/nutrition-hub')} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
            <ChevronLeft size={16} /> Back
          </button>
        )}
        <p className="text-xs text-primary tracking-wide uppercase mb-1">{item.category.replace('_', ' ')}</p>
        <h1 className="text-3xl font-heading font-light mb-4">{item.name}</h1>

        <div className="grid grid-cols-4 gap-2 mb-6">
          {macros.map((m) => (
            <div key={m.label} className="glass-card rounded-2xl p-3 text-center">
              <m.icon size={18} className={`${m.color} mx-auto`} />
              <p className="text-lg font-heading font-light mt-1">{m.val || 0}<span className="text-xs text-muted-foreground">{m.unit}</span></p>
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>

        {item.fiber != null && (
          <div className="glass-card rounded-2xl p-4 mb-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Fiber</span>
            <span className="text-sm font-medium">{item.fiber}g</span>
          </div>
        )}

        {item.description && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
            <p className="text-sm text-foreground/90 leading-relaxed">{item.description}</p>
          </div>
        )}

        {item.source && (
          <p className="text-xs text-muted-foreground">Source: {item.source}</p>
        )}
        {item.submitter_name && (
          <p className="text-xs text-muted-foreground mt-1">Suggested by {item.submitter_name}</p>
        )}
      </div>
    </div>
  );
}