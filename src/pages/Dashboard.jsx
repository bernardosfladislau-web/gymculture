import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import MacroRing from '@/components/MacroRing';
import MealCard from '@/components/MealCard';

export default function Dashboard() {
  const { user } = useCurrentUser();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!user) return;
    base44.entities.MealLog.filter({ log_date: today, created_by_id: user.id }, '-created_date')
      .then(setMeals)
      .finally(() => setLoading(false));
  }, [user, today]);

  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + (m.calories || 0),
      protein: acc.protein + (m.protein || 0),
      fat: acc.fat + (m.fat || 0),
      carbs: acc.carbs + (m.carbs || 0),
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  );

  const remaining = {
    calories: (user?.calorie_target || 0) - totals.calories,
    protein: (user?.protein_target || 0) - totals.protein,
    fat: (user?.fat_target || 0) - totals.fat,
    carbs: (user?.carb_target || 0) - totals.carbs,
  };

  const handleDelete = async (meal) => {
    await base44.entities.MealLog.delete(meal.id);
    setMeals((m) => m.filter((x) => x.id !== meal.id));
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="px-5 pt-12">
      <div className="mb-6 animate-fade-in">
        <p className="text-xs text-muted-foreground tracking-wide">{greeting}</p>
        <h1 className="text-2xl font-heading font-light">{user?.full_name?.split(' ')[0] || 'Athlete'}</h1>
      </div>

      <div className="glass-card rounded-3xl p-6 mb-6 animate-fade-in">
        <div className="flex items-center justify-center gap-8">
          <div className="flex flex-col items-center">
            <MacroRing
              consumed={totals.calories}
              target={user?.calorie_target || 2000}
              label="Calories"
              sublabel={`/${user?.calorie_target || 0}`}
              color="hsl(43 58% 53%)"
              size={120}
            />
          </div>
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-2xl font-heading font-light text-primary">{remaining.calories > 0 ? remaining.calories : 0}</p>
              <p className="text-[10px] text-muted-foreground">calories left</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-around mt-6 pt-6 border-t border-border/40">
          <MacroRing consumed={totals.protein} target={user?.protein_target || 0} label="Protein" sublabel={`/${user?.protein_target || 0}g`} color="hsl(0 70% 55%)" size={72} />
          <MacroRing consumed={totals.fat} target={user?.fat_target || 0} label="Fat" sublabel={`/${user?.fat_target || 0}g`} color="hsl(45 80% 55%)" size={72} />
          <MacroRing consumed={totals.carbs} target={user?.carb_target || 0} label="Carbs" sublabel={`/${user?.carb_target || 0}g`} color="hsl(210 70% 55%)" size={72} />
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-muted-foreground tracking-wide">TODAY'S MEALS</h2>
        <Link to="/log-meal" className="flex items-center gap-1 text-xs text-primary">
          <Plus size={14} /> Log meal
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : meals.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-sm text-muted-foreground">No meals logged yet today.</p>
          <Link to="/log-meal" className="inline-flex items-center gap-1 text-sm text-primary mt-2">
            <Plus size={14} /> Log your first meal
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {meals.map((meal) => (
            <MealCard key={meal.id} meal={meal} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}