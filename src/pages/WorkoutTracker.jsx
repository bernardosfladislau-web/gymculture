import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Dumbbell, Edit3, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { calculateStreak, DISPLAY_ORDER, getMuscleLabel } from '@/lib/workoutData';
import MobileHeader from '@/components/MobileHeader';
import WorkoutSetup from '@/components/workout/WorkoutSetup';
import WeeklySchedule from '@/components/workout/WeeklySchedule';
import WorkoutStreak from '@/components/workout/WorkoutStreak';
import ExerciseLogger from '@/components/workout/ExerciseLogger';

export default function WorkoutTracker() {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogger, setShowLogger] = useState(false);
  const [editPlan, setEditPlan] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    const [plans, allLogs] = await Promise.all([
      base44.entities.WorkoutPlan.filter({ created_by_id: user.id }),
      base44.entities.WorkoutLog.filter({ created_by_id: user.id }, '-log_date'),
    ]);
    setPlan(plans[0] || null);
    setLogs(allLogs);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const schedule = useMemo(() => {
    if (!plan?.weekly_schedule) return [];
    try {
      return JSON.parse(plan.weekly_schedule);
    } catch {
      return [];
    }
  }, [plan]);

  const streak = useMemo(() => calculateStreak(logs, schedule), [logs, schedule]);

  const weekDates = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    return DISPLAY_ORDER.map((dayIdx, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      return {
        day: dayIdx,
        dateStr,
        isToday: dateStr === todayStr,
        isPast: dateStr < todayStr,
        isFuture: dateStr > todayStr,
      };
    });
  }, []);

  const selectedLog = logs.find((l) => l.log_date === selectedDate);
  const selectedDateObj = weekDates.find((d) => d.dateStr === selectedDate);
  const selectedDaySchedule = schedule.find((s) => s.day === (selectedDateObj?.day ?? new Date(selectedDate + 'T00:00:00').getDay()));

  const handleLogSaved = (log) => {
    setLogs((prev) => {
      const filtered = prev.filter((l) => l.id !== log.id);
      return [log, ...filtered].sort((a, b) => b.log_date.localeCompare(a.log_date));
    });
    setShowLogger(false);
  };

  const handleDeleteLog = async (logId) => {
    await base44.entities.WorkoutLog.delete(logId);
    setLogs((prev) => prev.filter((l) => l.id !== logId));
  };

  if (loading) {
    return (
      <>
        <MobileHeader title="Workout Tracker" showBack onBack={() => navigate('/profile')} />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (!plan || editPlan) {
    return (
      <>
        <MobileHeader
          title={editPlan ? 'Edit Plan' : 'Workout Tracker'}
          showBack
          onBack={editPlan ? () => setEditPlan(false) : () => navigate('/profile')}
        />
        <WorkoutSetup
          existingPlan={editPlan ? plan : null}
          onComplete={(updatedPlan) => {
            setPlan(updatedPlan);
            setEditPlan(false);
          }}
        />
      </>
    );
  }

  return (
    <>
      <MobileHeader
        title="Workout Tracker"
        showBack
        onBack={() => navigate('/profile')}
        right={
          <button onClick={() => setEditPlan(true)} className="text-xs text-primary flex items-center gap-1">
            <Edit3 size={14} /> Edit
          </button>
        }
      />
      <div className="px-5">
        <WorkoutStreak streak={streak} totalWorkouts={logs.length} />

        <WeeklySchedule
          weekDates={weekDates}
          schedule={schedule}
          logs={logs}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        <div className="mt-6">
          <div className="mb-3">
            <h2 className="text-sm font-medium text-muted-foreground tracking-wide">
              {selectedDateObj?.isToday
                ? 'Today'
                : new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </h2>
            {selectedDaySchedule?.is_workout_day && (
              <p className="text-xs text-primary">{selectedDaySchedule.muscle_groups.map(getMuscleLabel).join(' · ')}</p>
            )}
          </div>

          {selectedLog ? (
            <div className="space-y-3">
              {(() => {
                try {
                  return JSON.parse(selectedLog.exercises || '[]');
                } catch {
                  return [];
                }
              })().map((ex, i) => (
                <div key={i} className="glass-card rounded-2xl p-4">
                  <p className="text-sm font-medium mb-2">{ex.name}</p>
                  <div className="space-y-1">
                    {ex.sets.map((s, si) => (
                      <div key={si} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="w-5 text-muted-foreground/50">{si + 1}</span>
                        <span className="text-foreground/80">{s.weight} lbs</span>
                        <span>×</span>
                        <span className="text-foreground/80">{s.reps} reps</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-4">
                <button onClick={() => setShowLogger(true)} className="text-xs text-primary flex items-center gap-1">
                  <Edit3 size={12} /> Edit workout
                </button>
                <button onClick={() => handleDeleteLog(selectedLog.id)} className="text-xs text-destructive flex items-center gap-1">
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ) : selectedDateObj?.isFuture ? (
            <p className="text-sm text-muted-foreground text-center py-8">Can't log future workouts.</p>
          ) : selectedDaySchedule?.is_workout_day ? (
            <button
              onClick={() => setShowLogger(true)}
              className="w-full glass-card rounded-2xl p-6 flex flex-col items-center gap-2 active:scale-[0.98] transition-transform"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Plus size={24} className="text-primary" />
              </div>
              <span className="text-sm font-medium">Log Workout</span>
            </button>
          ) : (
            <div className="glass-card rounded-2xl p-8 text-center">
              <p className="text-sm text-muted-foreground">Rest day</p>
              <p className="text-xs text-muted-foreground mt-1">Recovery is just as important.</p>
            </div>
          )}
        </div>

        {logs.length > 0 && (
          <div className="mt-8 mb-4">
            <h2 className="text-sm font-medium text-muted-foreground tracking-wide mb-3">Recent Workouts</h2>
            <div className="space-y-2">
              {logs.slice(0, 5).map((log) => (
                <button
                  key={log.id}
                  onClick={() => setSelectedDate(log.log_date)}
                  className="w-full glass-card rounded-2xl p-3 flex items-center gap-3 active:scale-[0.98] transition-transform"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Dumbbell size={18} className="text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">
                      {new Date(log.log_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(log.muscle_groups || []).map(getMuscleLabel).join(', ')}
                    </p>
                  </div>
                  <Check size={16} className="text-primary" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <ExerciseLogger
        open={showLogger}
        onClose={() => setShowLogger(false)}
        onSave={handleLogSaved}
        selectedDate={selectedDate}
        muscleGroups={selectedDaySchedule?.muscle_groups || []}
        existingLog={selectedLog}
      />
    </>
  );
}