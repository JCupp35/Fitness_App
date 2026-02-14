import {
  STORAGE_KEY,
  createPlan,
  deletePlan,
  getPlans,
  updatePlan,
} from '@/services/planStorage';
import type { FitnessPlan } from '@/types/fitnessPlan';

const samplePlan: FitnessPlan = {
  id: 'plan-1',
  createdAt: '2026-02-13T00:00:00.000Z',
  input: {
    height: { value: 70, unit: 'in' },
    weight: { value: 180, unit: 'lb' },
    goal: 'build_muscle',
    daysPerWeek: 3,
    workoutLocation: 'home',
    homeEquipment: { pullUpBar: true, dipStation: false },
  },
  title: 'Sample Plan',
  days: [{ day: 'Monday', focus: 'Upper', exercises: ['Push-ups'] }],
  notes: 'Sample notes',
};

describe('planStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('returns empty array for empty storage', () => {
    expect(getPlans()).toEqual([]);
  });

  test('returns empty array for malformed payload', () => {
    window.localStorage.setItem(STORAGE_KEY, '{broken json');
    expect(getPlans()).toEqual([]);
  });

  test('creates and reads plans', () => {
    createPlan(samplePlan);
    expect(getPlans()).toEqual([samplePlan]);
  });

  test('updates plan fields', () => {
    createPlan(samplePlan);
    const updated = updatePlan(samplePlan.id, {
      title: 'Updated Plan Title',
      notes: 'Updated notes',
    });

    expect(updated?.title).toBe('Updated Plan Title');
    expect(updated?.notes).toBe('Updated notes');
    expect(getPlans()[0]?.title).toBe('Updated Plan Title');
  });

  test('deletes plans', () => {
    createPlan(samplePlan);
    deletePlan(samplePlan.id);
    expect(getPlans()).toEqual([]);
  });
});
