import type { FitnessPlan } from '@/types/fitnessPlan';

export const STORAGE_KEY = 'fitness_plan_maker.v1.plans';

const hasLocalStorage = (): boolean =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const parsePlans = (value: string | null): FitnessPlan[] => {
  if (!value) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as FitnessPlan[]) : [];
  } catch {
    return [];
  }
};

const savePlans = (plans: FitnessPlan[]): void => {
  if (!hasLocalStorage()) {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
};

export const getPlans = (): FitnessPlan[] => {
  if (!hasLocalStorage()) {
    return [];
  }
  return parsePlans(window.localStorage.getItem(STORAGE_KEY));
};

export const createPlan = (plan: FitnessPlan): FitnessPlan => {
  const currentPlans = getPlans();
  const nextPlans = [plan, ...currentPlans];
  savePlans(nextPlans);
  return plan;
};

export const updatePlan = (
  id: string,
  partial: Partial<Pick<FitnessPlan, 'title' | 'notes'>>,
): FitnessPlan | null => {
  const currentPlans = getPlans();
  let updatedPlan: FitnessPlan | null = null;

  const nextPlans = currentPlans.map((plan) => {
    if (plan.id !== id) {
      return plan;
    }

    updatedPlan = {
      ...plan,
      ...partial,
    };
    return updatedPlan;
  });

  if (updatedPlan) {
    savePlans(nextPlans);
  }

  return updatedPlan;
};

export const deletePlan = (id: string): void => {
  const currentPlans = getPlans();
  const nextPlans = currentPlans.filter((plan) => plan.id !== id);
  savePlans(nextPlans);
};
