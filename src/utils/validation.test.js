import { validateFitnessInput } from './validation';

describe('validateFitnessInput', () => {
  test('rejects missing required fields', () => {
    const errors = validateFitnessInput({});
    expect(errors).toEqual({
      height: 'Height must be a positive number.',
      weight: 'Weight must be a positive number.',
      goal: 'Goal is required.',
      daysPerWeek: 'Days per week must be an integer between 1 and 7.',
      workoutLocation: 'Workout location is required.',
    });
  });

  test('rejects invalid numeric ranges and days', () => {
    const errors = validateFitnessInput({
      height: { value: -1, unit: 'in' },
      weight: { value: 0, unit: 'lb' },
      goal: 'build_muscle',
      daysPerWeek: 9,
      workoutLocation: 'gym',
      homeEquipment: {
        pullUpBar: false,
        dipStation: false,
      },
    });

    expect(errors.height).toMatch(/positive number/i);
    expect(errors.weight).toMatch(/positive number/i);
    expect(errors.daysPerWeek).toMatch(/between 1 and 7/i);
  });

  test('accepts valid gym submission', () => {
    const errors = validateFitnessInput({
      gender: 'female',
      height: { value: 182, unit: 'cm' },
      weight: { value: 82, unit: 'kg' },
      goal: 'endurance',
      daysPerWeek: 4,
      workoutLocation: 'gym',
      homeEquipment: {
        pullUpBar: false,
        dipStation: false,
      },
    });

    expect(errors).toEqual({});
  });

  test('accepts valid home submission without gender', () => {
    const errors = validateFitnessInput({
      height: { value: 70, unit: 'in' },
      weight: { value: 175, unit: 'lb' },
      goal: 'general_fitness',
      daysPerWeek: 3,
      workoutLocation: 'home',
      homeEquipment: {
        pullUpBar: true,
        dipStation: false,
      },
    });

    expect(errors).toEqual({});
  });
});
