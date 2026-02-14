import type { ValidationErrors } from '@/types/fitnessPlan';

const isPositiveNumber = (value: unknown): value is number =>
  Number.isFinite(value) && Number(value) > 0;

const isWholeNumberInRange = (value: unknown, min: number, max: number): boolean =>
  Number.isInteger(value) && Number(value) >= min && Number(value) <= max;

type ValidationInput = {
  height?: { value?: unknown; unit?: unknown };
  weight?: { value?: unknown; unit?: unknown };
  goal?: unknown;
  daysPerWeek?: unknown;
  workoutLocation?: unknown;
  gender?: unknown;
  homeEquipment?: unknown;
};

export const validateFitnessInput = (
  input: ValidationInput | null | undefined,
): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!isPositiveNumber(input?.height?.value)) {
    errors.height = 'Height must be a positive number.';
  }

  if (!isPositiveNumber(input?.weight?.value)) {
    errors.weight = 'Weight must be a positive number.';
  }

  if (!input?.goal || typeof input.goal !== 'string') {
    errors.goal = 'Goal is required.';
  }

  if (!isWholeNumberInRange(input?.daysPerWeek, 1, 7)) {
    errors.daysPerWeek = 'Days per week must be an integer between 1 and 7.';
  }

  if (!input?.workoutLocation || typeof input.workoutLocation !== 'string') {
    errors.workoutLocation = 'Workout location is required.';
  }

  return errors;
};

export const hasValidationErrors = (errors: ValidationErrors): boolean =>
  Object.keys(errors).length > 0;
