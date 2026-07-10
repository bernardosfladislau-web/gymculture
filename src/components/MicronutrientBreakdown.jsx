import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { MICRONUTRIENT_RDAS, getRDATarget } from '@/lib/nutritionRDAs';

const microCache = {};

export default function MicronutrientBreakdown({ meals, gender, selectedDate }) {
  const [micros, setMicros] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (meals.length === 0) {
      setMicros(null);
      setLoading(false);
      return;
    }

    if (microCache[selectedDate]) {
      setMicros(microCache[selectedDate]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const foodList = meals
      .map((m) => `- ${m.food_name} (${m.portion || '1 serving'}, ${m.calories} cal, ${m.protein || 0}g protein, ${m.fat || 0}g fat, ${m.carbs || 0}g carbs)`)
      .join('\n');

    base44.integrations.Core.InvokeLLM({
      prompt: `You are a nutrition database expert with knowledge of USDA food composition data. Based on the following foods consumed today, estimate the TOTAL micronutrient content across all foods combined. Use standard nutrition databases (USDA FoodData Central) as your reference.\n\nFoods:\n${foodList}\n\nReturn the total estimated micronutrient values for each nutrient. Use 0 if you cannot estimate a nutrient for the given foods.`,
      response_json_schema: {
        type: 'object',
        properties: {
          vitamin_a: { type: 'number', description: 'mcg RAE' },
          vitamin_c: { type: 'number', description: 'mg' },
          vitamin_d: { type: 'number', description: 'mcg' },
          vitamin_e: { type: 'number', description: 'mg' },
          vitamin_k: { type: 'number', description: 'mcg' },
          thiamin: { type: 'number', description: 'mg' },
          riboflavin: { type: 'number', description: 'mg' },
          niacin: { type: 'number', description: 'mg' },
          vitamin_b6: { type: 'number', description: 'mg' },
          folate: { type: 'number', description: 'mcg DFE' },
          vitamin_b12: { type: 'number', description: 'mcg' },
          calcium: { type: 'number', description: 'mg' },
          iron: { type: 'number', description: 'mg' },
          magnesium: { type: 'number', description: 'mg' },
          potassium: { type: 'number', description: 'mg' },
          sodium: { type: 'number', description: 'mg' },
          zinc: { type: 'number', description: 'mg' },
          selenium: { type: 'number', description: 'mcg' },
          phosphorus: { type: 'number', description: 'mg' },
        },
      },
    })
      .then((result) => {
        microCache[selectedDate] = result;
        setMicros(result);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [meals, selectedDate]);

  if (meals.length === 0) {
    return <p className="text-xs text-muted-foreground text-center py-4">No meals logged to analyze.</p>;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-6">
        <Loader2 size={20} className="animate-spin text-primary mb-2" />
        <p className="text-xs text-muted-foreground">Analyzing micronutrients...</p>
      </div>
    );
  }

  if (!micros) {
    return <p className="text-xs text-muted-foreground text-center py-4">Could not analyze micronutrients.</p>;
  }

  const renderSection = (title, nutrients) => (
    <div>
      <h4 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">{title}</h4>
      <div className="space-y-2.5">
        {nutrients.map((n) => {
          const consumed = micros[n.key] || 0;
          const rdaTarget = getRDATarget(n, gender);
          const pct = rdaTarget > 0 ? Math.min((consumed / rdaTarget) * 100, 100) : 0;
          const barColor = pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500';
          return (
            <div key={n.key}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-foreground/90">{n.name}</span>
                <span className="text-muted-foreground">
                  {Math.round(consumed * 10) / 10}/{rdaTarget}{n.unit}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {renderSection('Vitamins', MICRONUTRIENT_RDAS.vitamins)}
      {renderSection('Minerals', MICRONUTRIENT_RDAS.minerals)}
      <p className="text-[10px] text-muted-foreground/60 text-center pt-1">
        Estimates based on food names. For informational purposes only.
      </p>
    </div>
  );
}