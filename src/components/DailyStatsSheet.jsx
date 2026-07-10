import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Flame, Beef, Droplet, Wheat } from 'lucide-react';
import MicronutrientBreakdown from '@/components/MicronutrientBreakdown';

export default function DailyStatsSheet({ open, onOpenChange, totals, targets, dateLabel, meals, gender, selectedDate }) {
  const macros = [
    { label: 'Calories', consumed: totals.calories, target: targets.calories, unit: '', icon: Flame, color: 'text-primary', bar: 'bg-primary' },
    { label: 'Protein', consumed: totals.protein, target: targets.protein, unit: 'g', icon: Beef, color: 'text-red-400', bar: 'bg-red-400' },
    { label: 'Fat', consumed: totals.fat, target: targets.fat, unit: 'g', icon: Droplet, color: 'text-yellow-400', bar: 'bg-yellow-400' },
    { label: 'Carbs', consumed: totals.carbs, target: targets.carbs, unit: 'g', icon: Wheat, color: 'text-blue-400', bar: 'bg-blue-400' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border/50 max-w-md rounded-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-heading font-light text-gradient-gold">
            {dateLabel || 'Today'} Progress
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {macros.map((m) => {
            const pct = m.target > 0 ? Math.min((m.consumed / m.target) * 100, 100) : 0;
            const remaining = Math.max(m.target - m.consumed, 0);
            return (
              <div key={m.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <m.icon size={16} className={m.color} />
                    <span className="text-sm font-medium">{m.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(m.consumed)}{m.unit} / {Math.round(m.target)}{m.unit}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div className={`h-full ${m.bar} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {remaining > 0 ? `${Math.round(remaining)}${m.unit} left` : `Target reached`}
                </p>
              </div>
            );
          })}
        </div>

        <div className="border-t border-border/40 pt-4 mt-2">
          <h3 className="text-sm font-heading font-light text-gradient-violet mb-3">Micronutrients</h3>
          <MicronutrientBreakdown meals={meals} gender={gender} selectedDate={selectedDate} />
        </div>
      </DialogContent>
    </Dialog>
  );
}