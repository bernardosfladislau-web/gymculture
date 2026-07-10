import { useState } from 'react';
import { Flame, Beef, Droplet, Wheat, Trash2 } from 'lucide-react';

export default function MealCard({ meal, onDelete }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="glass-card rounded-2xl p-4 animate-fade-in">
      <div className="flex items-start gap-3">
        {meal.photo_url && !imgError ? (
          <img src={meal.photo_url} alt={meal.food_name} className="w-14 h-14 rounded-xl object-cover" onError={() => setImgError(true)} />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
            <Flame size={20} className="text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="font-medium text-sm text-foreground truncate">{meal.food_name}</h4>
              {meal.brand && <p className="text-[11px] text-muted-foreground truncate">{meal.brand}</p>}
              {meal.portion && <p className="text-[11px] text-muted-foreground">{meal.portion}</p>}
            </div>
            {onDelete && (
              <button onClick={() => onDelete(meal)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                <Trash2 size={16} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1 text-[11px]">
              <Flame size={13} className="text-primary" />
              <span className="font-medium">{Math.round(meal.calories)}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Beef size={13} className="text-red-400" />
              <span>{Math.round(meal.protein || 0)}g</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Droplet size={13} className="text-yellow-400" />
              <span>{Math.round(meal.fat || 0)}g</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Wheat size={13} className="text-blue-400" />
              <span>{Math.round(meal.carbs || 0)}g</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}