import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Flame, Beef, Droplet, Wheat } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { ACTIVITY_LEVELS, GOAL_TYPES, calculateAllMetrics } from '@/lib/macroUtils';
import { Button } from '@/components/ui/button';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, updateUser } = useCurrentUser();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    gender: 'male',
    age: 25,
    weight_lbs: 170,
    height_in: 69,
    activity_level: 'moderate',
    body_fat_pct: '',
    goal_type: 'deficit_moderate',
  });
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (user) {
      setForm({
        gender: user.gender || 'male',
        age: user.age || 25,
        weight_lbs: user.weight_lbs || 170,
        height_in: user.height_in || 69,
        activity_level: user.activity_level || 'moderate',
        body_fat_pct: user.body_fat_pct || '',
        goal_type: user.goal_type || 'deficit_moderate',
      });
    }
  }, [user]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const steps = ['Gender & Age', 'Body Stats', 'Activity', 'Body Fat %', 'Goal', 'Results'];

  const calcResults = () => {
    const metrics = calculateAllMetrics({
      age: Number(form.age),
      weightLbs: Number(form.weight_lbs),
      heightIn: Number(form.height_in),
      gender: form.gender,
      activityLevel: form.activity_level,
      bodyFatPct: form.body_fat_pct ? Number(form.body_fat_pct) : undefined,
      goalType: form.goal_type,
    });
    setResults(metrics);
    setStep(5);
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      await updateUser({
        ...form,
        age: Number(form.age),
        weight_lbs: Number(form.weight_lbs),
        height_in: Number(form.height_in),
        body_fat_pct: form.body_fat_pct ? Number(form.body_fat_pct) : undefined,
        has_onboarded: true,
        bmr: results.bmr,
        tdee: results.tdee,
        calorie_target: results.calorieTarget,
        protein_target: results.proteinTarget,
        fat_target: results.fatTarget,
        carb_target: results.carbTarget,
      });
      navigate('/');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col px-6 pt-16 pb-8">
        <div className="flex items-center gap-2 mb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-border'}`} />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mb-8">{steps[step]}</p>

        {step === 0 && (
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-heading font-light text-gradient-gold">Welcome to GymCulture</h1>
            <p className="text-sm text-muted-foreground">Let's set up your macro targets. This takes less than a minute.</p>
            <div>
              <label className="text-sm font-medium mb-3 block">Gender</label>
              <div className="grid grid-cols-2 gap-3">
                {['male', 'female'].map((g) => (
                  <button key={g} onClick={() => set('gender', g)}
                    className={`py-4 rounded-2xl border transition-all ${form.gender === g ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>
                    <span className="capitalize text-sm font-medium">{g}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Age</label>
              <input type="number" value={form.age} onChange={(e) => set('age', e.target.value)}
                className="w-full glass-card rounded-2xl px-4 py-3.5 bg-transparent outline-none focus:border-primary/50 border border-border/50" />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-heading font-light">Body Stats</h2>
            <div>
              <label className="text-sm font-medium mb-2 block">Weight (lbs)</label>
              <input type="number" value={form.weight_lbs} onChange={(e) => set('weight_lbs', e.target.value)}
                className="w-full glass-card rounded-2xl px-4 py-3.5 bg-transparent outline-none focus:border-primary/50 border border-border/50" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Height (inches)</label>
              <input type="number" value={form.height_in} onChange={(e) => set('height_in', e.target.value)}
                className="w-full glass-card rounded-2xl px-4 py-3.5 bg-transparent outline-none focus:border-primary/50 border border-border/50" />
              <p className="text-xs text-muted-foreground mt-1">e.g., 5'9" = 69 inches</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-2xl font-heading font-light">Activity Level</h2>
            {Object.entries(ACTIVITY_LEVELS).map(([key, val]) => (
              <button key={key} onClick={() => set('activity_level', key)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${form.activity_level === key ? 'border-primary bg-primary/10' : 'border-border'}`}>
                <span className="text-sm font-medium block">{val.label}</span>
                <span className="text-xs text-muted-foreground">{val.description}</span>
              </button>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-heading font-light">Body Fat %</h2>
            <p className="text-sm text-muted-foreground">Optional — enables the more accurate Katch-McArdle formula. Skip if unsure.</p>
            <input type="number" value={form.body_fat_pct} onChange={(e) => set('body_fat_pct', e.target.value)}
              placeholder="e.g., 15" className="w-full glass-card rounded-2xl px-4 py-3.5 bg-transparent outline-none focus:border-primary/50 border border-border/50" />
            <button onClick={() => { set('body_fat_pct', ''); setStep(4); }} className="text-sm text-primary">Skip this step</button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-2xl font-heading font-light">Your Goal</h2>
            {Object.entries(GOAL_TYPES).map(([key, val]) => (
              <button key={key} onClick={() => set('goal_type', key)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${form.goal_type === key ? 'border-primary bg-primary/10' : 'border-border'}`}>
                <span className="text-sm font-medium block">{val.label}</span>
                <span className="text-xs text-muted-foreground">{val.description}</span>
                {key === 'deficit_aggressive' && (
                  <span className="block mt-2 text-xs text-amber-500">
                    Recommended for experienced lifters only
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {step === 5 && results && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-heading font-light text-gradient-gold">Your Daily Targets</h2>
            <div className="glass-card rounded-3xl p-6 text-center glow-gold">
              <p className="text-xs text-muted-foreground mb-1">Daily Calories</p>
              <p className="text-5xl font-heading font-light text-primary">{results.calorieTarget}</p>
              <p className="text-xs text-muted-foreground mt-1">Maintenance: {results.tdee} cal</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Protein', val: results.proteinTarget, unit: 'g', icon: Beef, color: 'text-red-400' },
                { label: 'Fat', val: results.fatTarget, unit: 'g', icon: Droplet, color: 'text-yellow-400' },
                { label: 'Carbs', val: results.carbTarget, unit: 'g', icon: Wheat, color: 'text-blue-400' },
              ].map((m) => (
                <div key={m.label} className="glass-card rounded-2xl p-4">
                  <m.icon size={18} className={m.color} />
                  <p className="text-2xl font-heading font-light mt-2">{m.val}<span className="text-sm text-muted-foreground">{m.unit}</span></p>
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 mt-auto pt-8">
          {step > 0 && step < 5 && (
            <Button variant="ghost" onClick={() => setStep(step - 1)} className="px-4">
              <ChevronLeft size={18} />
            </Button>
          )}
          {step === 5 && (
            <Button variant="ghost" onClick={() => setStep(4)} className="px-4">
              <ChevronLeft size={18} /> Edit
            </Button>
          )}
          {step < 4 && (
            <Button onClick={() => setStep(step + 1)} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
              Continue <ChevronRight size={18} />
            </Button>
          )}
          {step === 4 && (
            <Button onClick={calcResults} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
              Calculate <ChevronRight size={18} />
            </Button>
          )}
          {step === 5 && (
            <Button onClick={handleFinish} disabled={saving} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
              {saving ? 'Saving...' : 'Start Journey'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}