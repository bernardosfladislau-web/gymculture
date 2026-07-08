import { Flame, Beef, Droplet, Wheat } from 'lucide-react';

export default function NutritionCard({ item, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-44 glass-card rounded-2xl overflow-hidden text-left active:scale-95 transition-transform"
    >
      <div className="relative h-32">
        {item.photo_url ? (
          <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <Wheat size={32} className="text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="p-3">
        <h4 className="text-sm font-medium truncate">{item.name}</h4>
        <div className="flex items-center gap-1 mt-1.5">
          <Flame size={12} className="text-primary" />
          <span className="text-[11px] text-muted-foreground">{item.calories || 0} cal</span>
          <span className="text-[11px] text-muted-foreground mx-1">·</span>
          <Beef size={12} className="text-red-400" />
          <span className="text-[11px] text-muted-foreground">{item.protein || 0}g</span>
        </div>
      </div>
    </button>
  );
}