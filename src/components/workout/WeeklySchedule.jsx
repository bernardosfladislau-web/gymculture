import { Check } from 'lucide-react';
import { DAY_NAMES } from '@/lib/workoutData';

export default function WeeklySchedule({ weekDates, schedule, logs, selectedDate, onSelectDate }) {
  const logDates = new Set(logs.map((l) => l.log_date));

  return (
    <div className="mb-4">
      <div className="grid grid-cols-7 gap-1.5">
        {weekDates.map(({ day, dateStr, isToday, isPast, isFuture }) => {
          const entry = schedule.find((s) => s.day === day);
          const isWorkoutDay = entry?.is_workout_day;
          const isLogged = logDates.has(dateStr);
          const isSelected = selectedDate === dateStr;
          const dayNum = new Date(dateStr + 'T00:00:00').getDate();

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`relative rounded-2xl p-2 flex flex-col items-center gap-1 transition-all ${
                isSelected ? 'bg-primary/15 border border-primary/40' :
                isWorkoutDay ? 'glass-card' : 'bg-secondary/30'
              }`}
            >
              <span className="text-[10px] text-muted-foreground">{DAY_NAMES[day]}</span>
              <span className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>{dayNum}</span>
              {isWorkoutDay ? (
                isLogged ? (
                  <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Check size={10} className="text-primary-foreground" strokeWidth={3} />
                  </div>
                ) : (
                  <div className={`w-4 h-4 rounded-full border-2 ${isPast && !isFuture ? 'border-destructive/40' : 'border-primary/30'}`} />
                )
              ) : (
                <div className="w-4 h-4" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}