const isPositiveNumber = (value) => Number.isFinite(value) && value > 0;

const isWholeNumberInRange = (value, min, max) =>
  Number.isInteger(value) && value >= min && value <= max;

export const validateFitnessInput = (input) => {
  const errors = {};

  if (!isPositiveNumber(input?.height?.value)) {
    errors.height = 'Height must be a positive number.';
  }

  if (!isPositiveNumber(input?.weight?.value)) {
    errors.weight = 'Weight must be a positive number.';
  }

  if (!input?.goal) {
    errors.goal = 'Goal is required.';
  }

  if (!isWholeNumberInRange(input?.daysPerWeek, 1, 7)) {
    errors.daysPerWeek = 'Days per week must be an integer between 1 and 7.';
  }

  if (!input?.workoutLocation) {
    errors.workoutLocation = 'Workout location is required.';
  }

  return errors;
};

export const hasValidationErrors = (errors) => Object.keys(errors).length > 0;
