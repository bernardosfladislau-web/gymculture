import useEmblaCarousel from 'embla-carousel-react';
import NutritionCard from './NutritionCard';

export default function NutritionCarousel({ items, onItemClick }) {
  const [emblaRef] = useEmblaCarousel({
    align: 'start',
    dragFree: true,
    containScroll: 'trimSnaps',
  });

  return (
    <div className="overflow-hidden -mx-5 px-5 cursor-grab active:cursor-grabbing" ref={emblaRef}>
      <div className="flex gap-3">
        {items.map((item) => (
          <NutritionCard key={item.id} item={item} onClick={() => onItemClick(item)} />
        ))}
      </div>
    </div>
  );
}