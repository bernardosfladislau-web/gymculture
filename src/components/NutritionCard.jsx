export default function NutritionCard({ item, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-44 glass-card rounded-2xl p-3 text-left active:scale-95 transition-transform"
    >
      <h4 className="text-sm font-medium truncate">{item.name}</h4>
      {item.diet_tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {item.diet_tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
              {tag.replace('_', ' ')}
            </span>
          ))}
        </div>
      )}
      {item.benefits && (
        <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2">{item.benefits}</p>
      )}
    </button>
  );
}