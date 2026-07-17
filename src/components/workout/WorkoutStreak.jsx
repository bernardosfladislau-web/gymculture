import { Flame } from 'lucide-react';

export default function WorkoutStreak({ streak, totalWorkouts }) {
  return (
    <div className="glass-card rounded-2xl p-5 mb-4 flex items-center justify-between animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Flame size={28} className={streak > 0 ? 'text-primary' : 'text-muted-foreground'} fill={streak > 0 ? 'currentColor' : 'none'} />
        </div>
        <div>
          <p className="text-2xl font-heading font-light text-primary">{streak}</p>
          <p className="text-xs text-muted-foreground">Day Streak</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-2xl font-heading font-light">{totalWorkouts}</p>
        <p className="text-xs text-muted-foreground">Workouts Logged</p>
      </div>
    </div>
  );
}