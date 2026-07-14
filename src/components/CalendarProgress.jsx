import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const LOCALE_MAP = { en: 'en-US', es: 'es-ES', fr: 'fr-FR', de: 'de-DE', pt: 'pt-BR', it: 'it-IT', zh: 'zh-CN', ja: 'ja-JP', ar: 'ar-SA', hi: 'hi-IN' };

export default function CalendarProgress({ mealsByDate, selectedDate, onSelectDate, calorieTarget }) {
  const { lang } = useLanguage();
  const today = new Date().toISOString().split('T')[0];
  const [viewDate, setViewDate] = useState(new Date(selectedDate + 'T00:00:00'));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = viewDate.toLocaleDateString(LOCALE_MAP[lang] || 'en-US', { month: 'long', year: 'numeric' });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const goPrev = () => setViewDate(new Date(year, month - 1, 1));
  const goNext = () => setViewDate(new Date(year, month + 1, 1));

  const getDayData = (d) => {
    const dateStr = new Date(year, month, d).toISOString().split('T')[0];
    const data = mealsByDate[dateStr];
    if (!data) return null;
    if (calorieTarget > 0) {
      const pct = Math.min((data.calories / calorieTarget) * 100, 100);
      return { pct, hasMeals: data.count > 0 };
    }
    return { pct: 0, hasMeals: data.count > 0 };
  };

  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={goPrev} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-medium">{monthLabel}</span>
        <button onClick={goNext} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="text-center text-[10px] text-muted-foreground font-medium py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const dateStr = new Date(year, month, d).toISOString().split('T')[0];
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const isFuture = dateStr > today;
          const dayData = getDayData(d);

          return (
            <button
              key={i}
              onClick={() => onSelectDate(dateStr)}
              className={`relative aspect-square rounded-lg flex items-center justify-center text-xs transition-all
                ${isSelected ? 'bg-primary text-primary-foreground font-semibold' : isFuture ? 'text-muted-foreground/30' : 'text-muted-foreground hover:bg-accent'}
                ${isToday && !isSelected ? 'ring-1 ring-primary/50' : ''}
              `}
            >
              {d}
              {dayData?.hasMeals && !isSelected && (
                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
              {dayData?.hasMeals && isSelected && (
                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary-foreground" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}