import { useEffect, useState } from 'react';
import FitnessForm from './components/FitnessForm';
import PlanList from './components/PlanList';
import { generatePlan } from './services/planGenerator';
import {
  createPlan,
  deletePlan as deleteStoredPlan,
  getPlans,
  updatePlan,
} from './services/planStorage';
import { hasValidationErrors, validateFitnessInput } from './utils/validation';

const createInitialFormData = () => ({
  height: {
    value: '',
    unit: 'in',
  },
  weight: {
    value: '',
    unit: 'lb',
  },
  goal: '',
  daysPerWeek: '',
  workoutLocation: '',
  homeEquipment: {
    pullUpBar: false,
    dipStation: false,
  },
});

const toNumber = (value) => {
  if (value === '' || value === null || value === undefined) {
    return Number.NaN;
  }
  return Number(value);
};

const toInteger = (value) => {
  if (value === '' || value === null || value === undefined) {
    return Number.NaN;
  }
  return parseInt(value, 10);
};

const normalizeInput = (formData) => ({
  height: {
    value: toNumber(formData.height.value),
    unit: formData.height.unit,
  },
  weight: {
    value: toNumber(formData.weight.value),
    unit: formData.weight.unit,
  },
  goal: formData.goal,
  daysPerWeek: toInteger(formData.daysPerWeek),
  workoutLocation: formData.workoutLocation,
  homeEquipment:
    formData.workoutLocation === 'home'
      ? {
          pullUpBar: Boolean(formData.homeEquipment.pullUpBar),
          dipStation: Boolean(formData.homeEquipment.dipStation),
        }
      : {
          pullUpBar: false,
          dipStation: false,
        },
});

const createPlanId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

function App() {
  const [formData, setFormData] = useState(createInitialFormData);
  const [errors, setErrors] = useState({});
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    setPlans(getPlans());
  }, []);

  const handleFieldChange = (field, value) => {
    setFormData((current) => {
      if (field === 'height.value' || field === 'height.unit') {
        return {
          ...current,
          height: {
            ...current.height,
            [field.split('.')[1]]: value,
          },
        };
      }

      if (field === 'weight.value' || field === 'weight.unit') {
        return {
          ...current,
          weight: {
            ...current.weight,
            [field.split('.')[1]]: value,
          },
        };
      }

      return {
        ...current,
        [field]: value,
      };
    });
  };

  const handleEquipmentChange = (equipmentKey, checked) => {
    setFormData((current) => ({
      ...current,
      homeEquipment: {
        ...current.homeEquipment,
        [equipmentKey]: checked,
      },
    }));
  };

  const handleGeneratePlan = (event) => {
    event.preventDefault();

    const input = normalizeInput(formData);
    const nextErrors = validateFitnessInput(input);
    setErrors(nextErrors);

    if (hasValidationErrors(nextErrors)) {
      return;
    }

    const generated = generatePlan(input);
    const plan = {
      id: createPlanId(),
      createdAt: new Date().toISOString(),
      input,
      ...generated,
    };

    createPlan(plan);
    setPlans((existing) => [plan, ...existing]);
    setFormData(createInitialFormData());
  };

  const handlePlanUpdate = (id, partial) => {
    const updated = updatePlan(id, partial);
    if (!updated) {
      return;
    }

    setPlans((current) =>
      current.map((plan) => (plan.id === id ? updated : plan)),
    );
  };

  const handlePlanDelete = (id) => {
    deleteStoredPlan(id);
    setPlans((current) => current.filter((plan) => plan.id !== id));
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-10 sm:px-6">
      <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          Fitness Plan Maker
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
          Create and manage personalized workout plans. AI plan generation will
          be plugged in later; this version uses a deterministic mock planner.
        </p>
      </section>

      <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="mb-4 text-2xl font-bold text-slate-900">Intake Form</h2>
        <FitnessForm
          formData={formData}
          errors={errors}
          onFieldChange={handleFieldChange}
          onEquipmentChange={handleEquipmentChange}
          onGeneratePlan={handleGeneratePlan}
        />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Saved Plans</h2>
          <p className="text-sm text-slate-500">
            {plans.length} {plans.length === 1 ? 'plan' : 'plans'}
          </p>
        </div>
        <PlanList plans={plans} onUpdate={handlePlanUpdate} onDelete={handlePlanDelete} />
      </section>
    </main>
  );
}

export default App;
