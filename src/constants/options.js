export const GOAL_OPTIONS = [
  { value: 'build_muscle', label: 'Build muscle' },
  { value: 'lose_weight', label: 'Lose weight' },
  { value: 'endurance', label: 'Endurance' },
  { value: 'general_fitness', label: 'General fitness' },
];

export const MEASUREMENT_SYSTEM_OPTIONS = [
  { value: 'imperial', label: 'Imperial' },
  { value: 'metric', label: 'Metric' },
];

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

export const WORKOUT_LOCATION_OPTIONS = [
  { value: 'home', label: 'Home' },
  { value: 'gym', label: 'Gym' },
];

const toImperialHeightLabel = (inches) => {
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  return `${feet}ft ${remainingInches}in`;
};

export const IMPERIAL_HEIGHT_OPTIONS = Array.from({ length: 37 }, (_, index) => {
  const inches = 48 + index;
  return {
    value: String(inches),
    label: toImperialHeightLabel(inches),
  };
});

export const DAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
