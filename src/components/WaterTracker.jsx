import { useState, useEffect } from 'react';
import { Droplets, Plus, Undo2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import MacroRing from '@/components/MacroRing';

const QUICK_AMOUNTS = [250, 500, 750];
const ACTIVITY_MULTIPLIERS = { sedentary: 1.0, light: 1.1, moderate: 1.2, very: 1.3, extreme: 1.5 };

export default function WaterTracker({ selectedDate, user, updateUser }) {
  const [waterLogs, setWaterLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState(0);
  const [fetchingTarget, setFetchingTarget] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchWaterLogs();
    if (user.water_target_ml) {
      setTarget(user.water_target_ml);
    } else {
      fetchWaterTarget();
    }
  }, [user, selectedDate]);

  const fetchWaterLogs = async () => {
    try {
      const logs = await base44.entities.WaterLog.filter(
        { log_date: selectedDate, created_by_id: user.id },
        '-created_date'
      );
      setWaterLogs(logs);
    } finally {
      setLoading(false);
    }
  };

  const fetchWaterTarget = async () => {
    setFetchingTarget(true);
    try {
      const activityDescriptions = {
        sedentary: 'sedentary (little to no exercise)',
        light: 'lightly active (light exercise 1-3 days/week)',
        moderate: 'moderately active (moderate exercise 3-5 days/week)',
        very: 'very active (hard exercise 6-7 days/week)',
        extreme: 'extremely active (intense daily exercise)',
      };
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on current hydration science and guidelines from health organizations (NIH, WHO, etc.), what is the recommended daily water intake in milliliters for a ${user.age}-year-old ${user.gender || 'male'}, weighing ${user.weight_lbs} lbs (${Math.round((user.weight_lbs || 150) * 0.453592)} kg), with a ${activityDescriptions[user.activity_level] || 'moderately active'} lifestyle? Consider body weight, activity level, and general climate factors. Return only the recommended amount in milliliters.`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            recommended_ml: { type: 'number' },
            reasoning: { type: 'string' },
          },
        },
      });
      const recommended = Math.round(result.recommended_ml);
      setTarget(recommended);
      await updateUser({ water_target_ml: recommended });
    } catch {
      const fallback = Math.round((user.weight_lbs || 150) * 0.5 * 29.5735 * (ACTIVITY_MULTIPLIERS[user.activity_level] || 1.2));
      setTarget(fallback);
    } finally {
      setFetchingTarget(false);
    }
  };

  const consumed = waterLogs.reduce((sum, log) => sum + (log.amount_ml || 0), 0);

  const addWater = async (amount) => {
    const log = await base44.entities.WaterLog.create({ log_date: selectedDate, amount_ml: amount });
    setWaterLogs((prev) => [log, ...prev]);
  };

  const undoLast = async () => {
    if (waterLogs.length === 0) return;
    const last = waterLogs[0];
    await base44.entities.WaterLog.delete(last.id);
    setWaterLogs((prev) => prev.filter((l) => l.id !== last.id));
  };

  if (!user) return null;

  return (
    <div className="glass-card rounded-2xl p-4 mb-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <MacroRing
          consumed={consumed}
          target={target || 2000}
          label="Water"
          sublabel={`/${target || 0}ml`}
          color="hsl(200 80% 55%)"
          size={80}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Droplets size={16} className="text-blue-400" />
            <span className="text-sm font-medium">Hydration</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {fetchingTarget ? 'Calculating your target...' : `${consumed}ml of ${target}ml`}
          </p>
          <div className="flex items-center gap-2">
            {QUICK_AMOUNTS.map((amt) => (
              <button
                key={amt}
                onClick={() => addWater(amt)}
                className="flex-1 rounded-xl bg-secondary hover:bg-secondary/80 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1"
              >
                <Plus size={12} /> {amt}
              </button>
            ))}
            {waterLogs.length > 0 && (
              <button onClick={undoLast} className="rounded-xl bg-secondary hover:bg-destructive/20 py-2 px-3 text-xs transition-colors">
                <Undo2 size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}