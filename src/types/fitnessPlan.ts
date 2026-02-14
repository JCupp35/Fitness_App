export type HeightUnit = 'in' | 'cm';
export type WeightUnit = 'lb' | 'kg';
export type Gender = 'male' | 'female';
export type GoalType =
  | 'build_muscle'
  | 'lose_weight'
  | 'endurance'
  | 'general_fitness';
export type WorkoutLocation = 'home' | 'gym';
export type MeasurementSystem = 'imperial' | 'metric';

export interface HeightMeasurement {
  value: number;
  unit: HeightUnit;
}

export interface WeightMeasurement {
  value: number;
  unit: WeightUnit;
}

export interface HomeEquipment {
  pullUpBar: boolean;
  dipStation: boolean;
}

export interface FitnessInput {
  gender?: Gender;
  height: HeightMeasurement;
  weight: WeightMeasurement;
  goal: GoalType;
  daysPerWeek: number;
  workoutLocation: WorkoutLocation;
  homeEquipment: HomeEquipment;
}

export interface PlanDay {
  day: string;
  focus: string;
  exercises: string[];
}

export interface GeneratedPlanResponse {
  title: string;
  days: PlanDay[];
  notes: string;
}

export interface FitnessPlan extends GeneratedPlanResponse {
  id: string;
  createdAt: string;
  input: FitnessInput;
}

export interface FitnessFormData {
  measurementSystem: MeasurementSystem;
  gender: Gender;
  height: {
    value: string;
    unit: HeightUnit;
  };
  weight: {
    value: string;
    unit: WeightUnit;
  };
  goal: GoalType | '';
  daysPerWeek: string;
  workoutLocation: WorkoutLocation | '';
  homeEquipment: HomeEquipment;
}

export type FitnessFormField =
  | 'height.value'
  | 'weight.value'
  | 'gender'
  | 'goal'
  | 'daysPerWeek'
  | 'workoutLocation';

export type ValidationErrors = Partial<
  Record<'height' | 'weight' | 'goal' | 'daysPerWeek' | 'workoutLocation', string>
>;

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}
