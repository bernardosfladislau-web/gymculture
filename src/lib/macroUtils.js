export const ACTIVITY_LEVELS = {
  sedentary: { label: 'Sedentary', multiplier: 1.2, description: 'Little to no exercise' },
  light: { label: 'Lightly Active', multiplier: 1.375, description: 'Light exercise 1-3 days/week' },
  moderate: { label: 'Moderately Active', multiplier: 1.55, description: 'Moderate exercise 3-5 days/week' },
  very: { label: 'Very Active', multiplier: 1.725, description: 'Hard exercise 6-7 days/week' },
  extreme: { label: 'Extremely Active', multiplier: 1.9, description: 'For runners & intense athletes — not typical bodybuilders' },
};

export const GOAL_TYPES = {
  deficit_aggressive: { label: 'Aggressive Deficit', adjustment: -500, description: '500 cal below maintenance — experienced lifters only' },
  deficit_moderate: { label: 'Moderate Deficit', adjustment: -300, description: '300 cal below maintenance' },
  maintain: { label: 'Maintain Weight', adjustment: 0, description: 'Eat at maintenance to keep your current weight' },
  surplus: { label: 'Surplus', adjustment: 250, description: '200-300 cal above maintenance' },
};

export function calculateBMR(weightLbs, heightIn, age, gender, bodyFatPct) {
  const weightKg = weightLbs / 2.2046;
  const heightCm = heightIn * 2.54;

  if (bodyFatPct) {
    const leanMassKg = weightKg * (1 - bodyFatPct / 100);
    return 370 + 21.6 * leanMassKg;
  }

  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === 'male' ? base + 5 : base - 161;
}

export function calculateMacros(weightLbs, tdee, goalAdjustment) {
  const calorieTarget = Math.max(1200, tdee + goalAdjustment);
  const proteinTarget = Math.round(weightLbs * 1);
  const fatCalories = Math.round(calorieTarget * 0.25);
  const fatTarget = Math.round(fatCalories / 9);
  const proteinCalories = proteinTarget * 4;
  const remainingCalories = calorieTarget - proteinCalories - fatCalories;
  const carbTarget = Math.max(0, Math.round(remainingCalories / 4));

  return { calorieTarget, proteinTarget, fatTarget, carbTarget };
}

export function calculateAllMetrics({ age, weightLbs, heightIn, gender, activityLevel, bodyFatPct, goalType }) {
  const activity = ACTIVITY_LEVELS[activityLevel];
  const goal = GOAL_TYPES[goalType];

  const bmr = calculateBMR(weightLbs, heightIn, age, gender, bodyFatPct);
  const tdee = Math.round(bmr * activity.multiplier);
  const macros = calculateMacros(weightLbs, tdee, goal.adjustment);

  return { bmr: Math.round(bmr), tdee, ...macros };
}