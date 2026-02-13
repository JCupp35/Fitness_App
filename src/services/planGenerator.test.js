import { generatePlan } from './planGenerator';

const input = {
  height: { value: 70, unit: 'in' },
  weight: { value: 180, unit: 'lb' },
  goal: 'build_muscle',
  daysPerWeek: 3,
  workoutLocation: 'home',
  homeEquipment: {
    pullUpBar: true,
    dipStation: false,
  },
};

describe('generatePlan', () => {
  test('returns deterministic structured output', () => {
    const firstPlan = generatePlan(input);
    const secondPlan = generatePlan(input);
    expect(firstPlan).toEqual(secondPlan);
  });

  test('respects requested number of days', () => {
    const plan = generatePlan({ ...input, daysPerWeek: 5 });
    expect(plan.days).toHaveLength(5);
    expect(plan.days[0]).toEqual(
      expect.objectContaining({
        day: expect.any(String),
        focus: expect.any(String),
        exercises: expect.any(Array),
      }),
    );
  });
});
