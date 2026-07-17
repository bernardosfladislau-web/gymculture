export const MUSCLE_GROUPS = [
  { key: 'chest', label: 'Chest' },
  { key: 'back', label: 'Back' },
  { key: 'shoulders', label: 'Shoulders' },
  { key: 'biceps', label: 'Biceps' },
  { key: 'triceps', label: 'Triceps' },
  { key: 'quads', label: 'Quads' },
  { key: 'hamstrings', label: 'Hamstrings' },
  { key: 'glutes', label: 'Glutes' },
  { key: 'calves', label: 'Calves' },
  { key: 'core', label: 'Core' },
  { key: 'forearms', label: 'Forearms' },
];

export const SPLIT_TYPES = {
  push_pull_legs: { label: 'Push / Pull / Legs' },
  upper_lower: { label: 'Upper / Lower' },
  bro_split: { label: 'Bro Split' },
  full_body: { label: 'Full Body' },
  custom: { label: 'Custom' },
};

const emptyWeek = [
  { day: 1, is_workout_day: false, muscle_groups: [] },
  { day: 2, is_workout_day: false, muscle_groups: [] },
  { day: 3, is_workout_day: false, muscle_groups: [] },
  { day: 4, is_workout_day: false, muscle_groups: [] },
  { day: 5, is_workout_day: false, muscle_groups: [] },
  { day: 6, is_workout_day: false, muscle_groups: [] },
  { day: 0, is_workout_day: false, muscle_groups: [] },
];

export const SPLIT_PRESETS = {
  push_pull_legs: {
    days: 6,
    schedule: [
      { day: 1, is_workout_day: true, muscle_groups: ['chest', 'shoulders', 'triceps'] },
      { day: 2, is_workout_day: true, muscle_groups: ['back', 'biceps'] },
      { day: 3, is_workout_day: true, muscle_groups: ['quads', 'hamstrings', 'calves'] },
      { day: 4, is_workout_day: false, muscle_groups: [] },
      { day: 5, is_workout_day: true, muscle_groups: ['chest', 'shoulders', 'triceps'] },
      { day: 6, is_workout_day: true, muscle_groups: ['back', 'biceps'] },
      { day: 0, is_workout_day: false, muscle_groups: [] },
    ],
  },
  upper_lower: {
    days: 4,
    schedule: [
      { day: 1, is_workout_day: true, muscle_groups: ['chest', 'back', 'shoulders', 'biceps', 'triceps'] },
      { day: 2, is_workout_day: true, muscle_groups: ['quads', 'hamstrings', 'glutes', 'calves'] },
      { day: 3, is_workout_day: false, muscle_groups: [] },
      { day: 4, is_workout_day: true, muscle_groups: ['chest', 'back', 'shoulders', 'biceps', 'triceps'] },
      { day: 5, is_workout_day: true, muscle_groups: ['quads', 'hamstrings', 'glutes', 'calves'] },
      { day: 6, is_workout_day: false, muscle_groups: [] },
      { day: 0, is_workout_day: false, muscle_groups: [] },
    ],
  },
  bro_split: {
    days: 5,
    schedule: [
      { day: 1, is_workout_day: true, muscle_groups: ['chest'] },
      { day: 2, is_workout_day: true, muscle_groups: ['back'] },
      { day: 3, is_workout_day: true, muscle_groups: ['shoulders'] },
      { day: 4, is_workout_day: true, muscle_groups: ['biceps', 'triceps'] },
      { day: 5, is_workout_day: true, muscle_groups: ['quads', 'hamstrings', 'calves'] },
      { day: 6, is_workout_day: false, muscle_groups: [] },
      { day: 0, is_workout_day: false, muscle_groups: [] },
    ],
  },
  full_body: {
    days: 3,
    schedule: [
      { day: 1, is_workout_day: true, muscle_groups: ['chest', 'back', 'quads', 'hamstrings'] },
      { day: 2, is_workout_day: false, muscle_groups: [] },
      { day: 3, is_workout_day: true, muscle_groups: ['shoulders', 'biceps', 'triceps', 'glutes'] },
      { day: 4, is_workout_day: false, muscle_groups: [] },
      { day: 5, is_workout_day: true, muscle_groups: ['chest', 'back', 'quads', 'core'] },
      { day: 6, is_workout_day: false, muscle_groups: [] },
      { day: 0, is_workout_day: false, muscle_groups: [] },
    ],
  },
  custom: {
    days: 0,
    schedule: emptyWeek,
  },
};

export const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
export const DAY_NAMES = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 0: 'Sun' };
export const DAY_NAMES_FULL = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday', 0: 'Sunday' };

export function getMuscleLabel(key) {
  const m = MUSCLE_GROUPS.find((mg) => mg.key === key);
  return m ? m.label : key;
}

export function calculateStreak(workoutLogs, weeklySchedule) {
  if (!workoutLogs.length || !weeklySchedule?.length) return 0;

  const logDates = new Set(workoutLogs.map((l) => l.log_date));
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();

    const entry = weeklySchedule.find((s) => s.day === dayOfWeek);
    if (!entry || !entry.is_workout_day) continue;

    if (logDates.has(dateStr)) {
      streak++;
    } else {
      if (i > 0) break;
    }
  }

  return streak;
}