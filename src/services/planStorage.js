export const STORAGE_KEY = 'fitness_plan_maker.v1.plans';

const hasLocalStorage = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const parsePlans = (value) => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const savePlans = (plans) => {
  if (!hasLocalStorage()) {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
};

export const getPlans = () => {
  if (!hasLocalStorage()) {
    return [];
  }
  return parsePlans(window.localStorage.getItem(STORAGE_KEY));
};

export const createPlan = (plan) => {
  const currentPlans = getPlans();
  const nextPlans = [plan, ...currentPlans];
  savePlans(nextPlans);
  return plan;
};

export const updatePlan = (id, partial) => {
  const currentPlans = getPlans();
  let updatedPlan = null;

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

export const deletePlan = (id) => {
  const currentPlans = getPlans();
  const nextPlans = currentPlans.filter((plan) => plan.id !== id);
  savePlans(nextPlans);
};
