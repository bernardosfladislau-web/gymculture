import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getMuscleLabel } from '@/lib/workoutData';

export default function ExerciseLogger({ open, onClose, onSave, selectedDate, muscleGroups, existingLog }) {
  const [exercises, setExercises] = useState([{ name: '', sets: [{ weight: '', reps: '' }] }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (existingLog) {
      try {
        const parsed = JSON.parse(existingLog.exercises || '[]');
        if (parsed.length > 0) {
          setExercises(parsed.map((ex) => ({
            name: ex.name || '',
            sets: (ex.sets || []).map((s) => ({ weight: String(s.weight ?? ''), reps: String(s.reps ?? '') })),
          })));
          return;
        }
      } catch {}
    }
    setExercises([{ name: '', sets: [{ weight: '', reps: '' }] }]);
  }, [open, existingLog?.id]);

  const addExercise = () => {
    setExercises((prev) => [...prev, { name: '', sets: [{ weight: '', reps: '' }] }]);
  };

  const removeExercise = (idx) => {
    setExercises((prev) => prev.filter((_, i) => i !== idx));
  };

  const addSet = (exerciseIdx) => {
    setExercises((prev) => prev.map((ex, i) =>
      i === exerciseIdx ? { ...ex, sets: [...ex.sets, { weight: '', reps: '' }] } : ex
    ));
  };

  const removeSet = (exerciseIdx, setIdx) => {
    setExercises((prev) => prev.map((ex, i) => {
      if (i !== exerciseIdx) return ex;
      return { ...ex, sets: ex.sets.filter((_, si) => si !== setIdx) };
    }));
  };

  const updateExerciseName = (exerciseIdx, name) => {
    setExercises((prev) => prev.map((ex, i) =>
      i === exerciseIdx ? { ...ex, name } : ex
    ));
  };

  const updateSet = (exerciseIdx, setIdx, field, value) => {
    setExercises((prev) => prev.map((ex, i) => {
      if (i !== exerciseIdx) return ex;
      return {
        ...ex,
        sets: ex.sets.map((s, si) => (si === setIdx ? { ...s, [field]: value } : s)),
      };
    }));
  };

  const handleSave = async () => {
    const validExercises = exercises
      .filter((ex) => ex.name.trim())
      .map((ex) => ({
        name: ex.name.trim(),
        sets: ex.sets
          .filter((s) => s.weight !== '' || s.reps !== '')
          .map((s) => ({ weight: Number(s.weight) || 0, reps: Number(s.reps) || 0 })),
      }));

    if (validExercises.length === 0) return;

    setSaving(true);
    try {
      const exerciseData = JSON.stringify(validExercises);
      let result;
      if (existingLog) {
        result = await base44.entities.WorkoutLog.update(existingLog.id, {
          exercises: exerciseData,
          muscle_groups: muscleGroups,
        });
      } else {
        result = await base44.entities.WorkoutLog.create({
          log_date: selectedDate,
          muscle_groups: muscleGroups,
          exercises: exerciseData,
        });
      }
      onSave(result);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="glass-card rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] animate-fade-in max-h-[85vh] overflow-y-auto no-bounce"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-light">{existingLog ? 'Edit Workout' : 'Log Workout'}</h2>
          <button onClick={onClose}><X size={20} className="text-muted-foreground" /></button>
        </div>

        {muscleGroups.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {muscleGroups.map((mg) => (
              <span key={mg} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary">{getMuscleLabel(mg)}</span>
            ))}
          </div>
        )}

        <div className="space-y-4">
          {exercises.map((ex, exerciseIdx) => (
            <div key={exerciseIdx} className="glass-card rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  value={ex.name}
                  onChange={(e) => updateExerciseName(exerciseIdx, e.target.value)}
                  placeholder="Exercise name"
                  className="flex-1 bg-transparent outline-none text-sm font-medium border-b border-border/50 pb-1 focus:border-primary/50"
                />
                {exercises.length > 1 && (
                  <button onClick={() => removeExercise(exerciseIdx)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {ex.sets.map((set, setIdx) => (
                  <div key={setIdx} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-5">{setIdx + 1}</span>
                    <input
                      type="number"
                      value={set.weight}
                      onChange={(e) => updateSet(exerciseIdx, setIdx, 'weight', e.target.value)}
                      placeholder="lbs"
                      className="w-20 glass-card rounded-lg px-2 py-1.5 bg-transparent outline-none text-xs text-center border border-border/50 focus:border-primary/50"
                    />
                    <span className="text-xs text-muted-foreground">×</span>
                    <input
                      type="number"
                      value={set.reps}
                      onChange={(e) => updateSet(exerciseIdx, setIdx, 'reps', e.target.value)}
                      placeholder="reps"
                      className="w-20 glass-card rounded-lg px-2 py-1.5 bg-transparent outline-none text-xs text-center border border-border/50 focus:border-primary/50"
                    />
                    {ex.sets.length > 1 && (
                      <button onClick={() => removeSet(exerciseIdx, setIdx)} className="text-muted-foreground hover:text-destructive">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={() => addSet(exerciseIdx)} className="text-xs text-primary flex items-center gap-1">
                  <Plus size={12} /> Add set
                </button>
              </div>
            </div>
          ))}
        </div>

        <button onClick={addExercise} className="w-full mt-4 rounded-2xl border border-dashed border-border py-3 text-sm text-muted-foreground flex items-center justify-center gap-1">
          <Plus size={16} /> Add Exercise
        </button>

        <button
          onClick={handleSave}
          disabled={saving || exercises.filter((ex) => ex.name.trim()).length === 0}
          className="w-full mt-4 rounded-2xl bg-primary text-primary-foreground py-3 text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : null}
          {existingLog ? 'Update Workout' : 'Save Workout'}
        </button>
      </div>
    </div>
  );
}