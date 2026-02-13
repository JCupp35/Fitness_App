import { DAY_NAMES, GOAL_OPTIONS } from '../constants/options';

const GOAL_LABELS = GOAL_OPTIONS.reduce((map, option) => {
  map[option.value] = option.label;
  return map;
}, {});

const SESSION_LIBRARY = [
  {
    focus: {
      build_muscle: 'Upper Body Strength',
      lose_weight: 'Upper Body Conditioning',
      endurance: 'Pacing Intervals',
      general_fitness: 'Balanced Push Session',
    },
    gymExercises: [
      'Bench press - 4 sets of 6',
      'Seated cable row - 3 sets of 10',
      'Dumbbell shoulder press - 3 sets of 10',
      'Plank - 3 rounds of 45 sec',
    ],
    homeExercises: [
      'Push-ups - 4 sets of 10',
      'Backpack rows - 3 sets of 12',
      'Pike push-ups - 3 sets of 8',
      'Plank - 3 rounds of 45 sec',
    ],
  },
  {
    focus: {
      build_muscle: 'Lower Body Strength',
      lose_weight: 'Lower Body Conditioning',
      endurance: 'Leg Endurance',
      general_fitness: 'Balanced Lower Body',
    },
    gymExercises: [
      'Back squat - 4 sets of 6',
      'Romanian deadlift - 3 sets of 8',
      'Walking lunges - 3 sets of 12 each side',
      'Calf raises - 3 sets of 15',
    ],
    homeExercises: [
      'Tempo squats - 4 sets of 12',
      'Reverse lunges - 3 sets of 12 each side',
      'Single-leg hip bridge - 3 sets of 12 each side',
      'Calf raises - 3 sets of 18',
    ],
  },
  {
    focus: {
      build_muscle: 'Pull and Core',
      lose_weight: 'Pull and Cardio',
      endurance: 'Zone 2 + Pull Work',
      general_fitness: 'Pull and Core Balance',
    },
    gymExercises: [
      'Lat pulldown - 4 sets of 8',
      'Chest-supported row - 3 sets of 10',
      'Face pulls - 3 sets of 15',
      'Bike intervals - 10 minutes',
    ],
    homeExercises: [
      'Inverted rows (table) - 4 sets of 8',
      'Doorframe towel row - 3 sets of 10',
      'Superman hold - 3 rounds of 30 sec',
      'Brisk walk or jog - 15 minutes',
    ],
  },
  {
    focus: {
      build_muscle: 'Full-Body Volume',
      lose_weight: 'Circuit Conditioning',
      endurance: 'Long Mixed Session',
      general_fitness: 'Full-Body Foundation',
    },
    gymExercises: [
      'Leg press - 3 sets of 12',
      'Incline dumbbell press - 3 sets of 12',
      'Cable woodchop - 3 sets of 12',
      'Rowing machine - 12 minutes',
    ],
    homeExercises: [
      'Split squat - 3 sets of 12',
      'Decline push-ups - 3 sets of 10',
      'Bodyweight good mornings - 3 sets of 15',
      'Fast walk intervals - 12 minutes',
    ],
  },
];

const getGoalLabel = (goal) => GOAL_LABELS[goal] || 'Personalized';

const withHomeEquipmentAdjustments = (exercises, homeEquipment) => {
  const adjusted = [...exercises];

  if (homeEquipment.pullUpBar) {
    adjusted.splice(1, 0, 'Pull-ups or assisted pull-ups - 3 sets of 5 to 8');
  }

  if (homeEquipment.dipStation) {
    adjusted.push('Dips or assisted dips - 3 sets of 6 to 10');
  }

  return adjusted;
};

const createDayPlan = (index, input) => {
  const template = SESSION_LIBRARY[index % SESSION_LIBRARY.length];
  const focus = template.focus[input.goal] || template.focus.general_fitness;
  const exercises =
    input.workoutLocation === 'gym'
      ? template.gymExercises
      : withHomeEquipmentAdjustments(template.homeExercises, input.homeEquipment);

  return {
    day: DAY_NAMES[index],
    focus,
    exercises,
  };
};

export const generatePlan = (input) => {
  const title = `${getGoalLabel(input.goal)} ${input.daysPerWeek}-Day Workout Plan`;
  const days = Array.from({ length: input.daysPerWeek }, (_, index) =>
    createDayPlan(index, input),
  );

  return {
    title,
    days,
    notes:
      'Static starter plan. AI agent integration is pending and will replace this generator.',
  };
};
