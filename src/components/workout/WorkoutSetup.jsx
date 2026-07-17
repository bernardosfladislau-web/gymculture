import { useState } from 'react';
import { ChevronLeft, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { MUSCLE_GROUPS, SPLIT_PRESETS, SPLIT_TYPES, DISPLAY_ORDER, DAY_NAMES } from '@/lib/workoutData';
import { Button } from '@/components/ui/button';

export default function WorkoutSetup({ existingPlan, onComplete }) {
  const [step, setStep] = useState(0);
  const [splitType, setSplitType] = useState(existingPlan?.split_type || '');
  const [schedule, setSchedule] = useState(
    existingPlan?.weekly_schedule
      ? JSON.parse(existingPlan.weekly_schedule)
      : JSON.parse(JSON.stringify(SPLIT_PRESETS.custom.schedule))
  );
  const [saving, setSaving] = useState(false);

  const handleSelectSplit = (key) => {
    setSplitType(key);
    setSchedule(JSON.parse(JSON.stringify(SPLIT_PRESETS[key].schedule)));
    setStep(1);
  };

  const toggleWorkoutDay = (dayIdx) => {
    setSchedule((prev) => prev.map((s) =>
      s.day === dayIdx
        ? { ...s, is_workout_day: !s.is_workout_day, muscle_groups: !s.is_workout_day ? [] : s.muscle_groups }
        : s
    ));
  };

  const toggleMuscleGroup = (dayIdx, muscleKey) => {
    setSchedule((prev) => prev.map((s) => {
      if (s.day !== dayIdx || !s.is_workout_day) return s;
      const groups = s.muscle_groups.includes(muscleKey)
        ? s.muscle_groups.filter((g) => g !== muscleKey)
        : [...s.muscle_groups, muscleKey];
      return { ...s, muscle_groups: groups };
    }));
  };

  const daysPerWeek = schedule.filter((s) => s.is_workout_day).length;

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        split_type: splitType,
        days_per_week: daysPerWeek,
        weekly_schedule: JSON.stringify(schedule),
      };
      let result;
      if (existingPlan) {
        result = await base44.entities.WorkoutPlan.update(existingPlan.id, data);
      } else {
        result = await base44.entities.WorkoutPlan.create(data);
      }
      onComplete(result);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-5 pt-4 pb-8">
      {step === 0 && (
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-2xl font-heading font-light text-gradient-gold">Set Up Your Workout Plan</h2>
          <p className="text-sm text-muted-foreground">Choose your workout split to get started.</p>
          <div className="space-y-3">
            {Object.entries(SPLIT_TYPES).map(([key, val]) => (
              <button
                key={key}
                onClick={() => handleSelectSplit(key)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${splitType === key ? 'border-primary bg-primary/10' : 'border-border'}`}
              >
                <span className="text-sm font-medium block">{val.label}</span>
                <span className="text-xs text-muted-foreground">
                  {SPLIT_PRESETS[key].days > 0 ? `${SPLIT_PRESETS[key].days} days/week` : 'Choose your own days'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <button onClick={() => setStep(0)} className="flex items-center gap-1 text-sm text-muted-foreground">
              <ChevronLeft size={16} /> Back
            </button>
            <span className="text-xs text-muted-foreground">{daysPerWeek} days/week</span>
          </div>
          <h2 className="text-2xl font-heading font-light">Weekly Schedule</h2>
          <p className="text-sm text-muted-foreground">Toggle workout days and select muscle groups for each.</p>

          <div className="space-y-3">
            {DISPLAY_ORDER.map((dayIdx) => {
              const entry = schedule.find((s) => s.day === dayIdx);
              return (
                <div key={dayIdx} className="glass-card rounded-2xl p-4">
                  <button
                    onClick={() => toggleWorkoutDay(dayIdx)}
                    className="flex items-center justify-between w-full mb-2"
                  >
                    <span className="text-sm font-medium">{DAY_NAMES[dayIdx]}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${entry?.is_workout_day ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                      {entry?.is_workout_day ? 'Workout' : 'Rest'}
                    </span>
                  </button>
                  {entry?.is_workout_day && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {MUSCLE_GROUPS.map((mg) => (
                        <button
                          key={mg.key}
                          onClick={() => toggleMuscleGroup(dayIdx, mg.key)}
                          className={`text-xs px-2.5 py-1 rounded-full transition-all ${entry.muscle_groups.includes(mg.key) ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}
                        >
                          {mg.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || daysPerWeek === 0}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {saving ? 'Saving...' : existingPlan ? 'Update Plan' : 'Save Plan'}
          </Button>
        </div>
      )}
    </div>
  );
}