import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { calculateAllMetrics } from '@/lib/macroUtils';
import MacroRing from '@/components/MacroRing';
import MealCard from '@/components/MealCard';
import DailyStatsSheet from '@/components/DailyStatsSheet';
import WaterTracker from '@/components/WaterTracker';
import CalendarProgress from '@/components/CalendarProgress';

export default function Dashboard() {
  const { user, updateUser } = useCurrentUser();
  const [allMeals, setAllMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    if (!user) return;
    base44.entities.MealLog.filter({ created_by_id: user.id }, '-log_date')
      .then(setAllMeals)
      .finally(() => setLoading(false));
  }, [user]);

  let targets = {
    calories: user?.calorie_target || 0,
    protein: user?.protein_target || 0,
    fat: user?.fat_target || 0,
    carbs: user?.carb_target || 0,
  };

  if (targets.calories === 0 && user?.age && user?.weight_lbs && user?.height_in) {
    const computed = calculateAllMetrics({
      age: user.age,
      weightLbs: user.weight_lbs,
      heightIn: user.height_in,
      gender: user.gender || 'male',
      activityLevel: user.activity_level || 'moderate',
      bodyFatPct: user.body_fat_pct,
      goalType: user.goal_type || 'deficit_moderate',
    });
    targets = {
      calories: computed.calorieTarget,
      protein: computed.proteinTarget,
      fat: computed.fatTarget,
      carbs: computed.carbTarget,
    };
  }

  const mealsByDate = {};
  allMeals.forEach((m) => {
    const d = m.log_date;
    if (!mealsByDate[d]) mealsByDate[d] = { calories: 0, protein: 0, fat: 0, carbs: 0, count: 0 };
    mealsByDate[d].calories += m.calories || 0;
    mealsByDate[d].protein += m.protein || 0;
    mealsByDate[d].fat += m.fat || 0;
    mealsByDate[d].carbs += m.carbs || 0;
    mealsByDate[d].count++;
  });

  const dayMeals = allMeals.filter((m) => m.log_date === selectedDate);

  const totals = dayMeals.reduce(
    (acc, m) => ({
      calories: acc.calories + (m.calories || 0),
      protein: acc.protein + (m.protein || 0),
      fat: acc.fat + (m.fat || 0),
      carbs: acc.carbs + (m.carbs || 0),
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  );

  const remaining = {
    calories: targets.calories - totals.calories,
    protein: targets.protein - totals.protein,
    fat: targets.fat - totals.fat,
    carbs: targets.carbs - totals.carbs,
  };

  const handleDelete = async (meal) => {
    await base44.entities.MealLog.delete(meal.id);
    setAllMeals((m) => m.filter((x) => x.id !== meal.id));
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const dateLabel = isToday ? 'Today' : new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="px-5 pt-12">
      <div className="mb-6 animate-fade-in">
        <p className="text-xs text-muted-foreground tracking-wide">{greeting}</p>
        <h1 className="text-2xl font-heading font-light">{user?.full_name?.split(' ')[0] || 'Athlete'}</h1>
      </div>

      <button onClick={() => setShowStats(true)} className="w-full text-left mb-6 animate-fade-in active:scale-[0.98] transition-transform">
        <div className="glass-card rounded-3xl p-6 glow-gold">
          <div className="flex items-center justify-center gap-8">
            <MacroRing
              consumed={totals.calories}
              target={targets.calories || 2000}
              label="Calories"
              sublabel={`/${Math.round(targets.calories || 0)}`}
              color="hsl(43 58% 53%)"
              size={120}
            />
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-2xl font-heading font-light text-primary">{remaining.calories > 0 ? Math.round(remaining.calories) : 0}</p>
                <p className="text-[10px] text-muted-foreground">calories left</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-around mt-6 pt-6 border-t border-border/40">
            <MacroRing consumed={totals.protein} target={targets.protein} label="Protein" sublabel={`/${Math.round(targets.protein)}g`} color="hsl(0 70% 55%)" size={72} />
            <MacroRing consumed={totals.fat} target={targets.fat} label="Fat" sublabel={`/${Math.round(targets.fat)}g`} color="hsl(45 80% 55%)" size={72} />
            <MacroRing consumed={totals.carbs} target={targets.carbs} label="Carbs" sublabel={`/${Math.round(targets.carbs)}g`} color="hsl(210 70% 55%)" size={72} />
          </div>
          <p className="text-center text-[11px] text-muted-foreground mt-4">Tap to view detailed breakdown</p>
        </div>
      </button>

      <WaterTracker selectedDate={selectedDate} user={user} updateUser={updateUser} />

      <div className="mb-6">
        <CalendarProgress
          mealsByDate={mealsByDate}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          calorieTarget={targets.calories}
        />
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-muted-foreground tracking-wide">{dateLabel.toUpperCase()}'S MEALS</h2>
        {isToday && (
          <Link to="/log-meal" className="flex items-center gap-1 text-xs text-primary">
            <Plus size={14} /> Log meal
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : dayMeals.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-sm text-muted-foreground">No meals logged on {dateLabel}.</p>
          {isToday && (
            <Link to="/log-meal" className="inline-flex items-center gap-1 text-sm text-primary mt-2">
              <Plus size={14} /> Log your first meal
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {dayMeals.map((meal) => (
            <MealCard key={meal.id} meal={meal} onDelete={isToday ? handleDelete : undefined} />
          ))}
        </div>
      )}

      <DailyStatsSheet
        open={showStats}
        onOpenChange={setShowStats}
        totals={totals}
        targets={targets}
        dateLabel={dateLabel}
        meals={dayMeals}
        gender={user?.gender}
        selectedDate={selectedDate}
      />
    </div>
  );
}