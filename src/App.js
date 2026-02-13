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

const IMPERIAL_DEFAULT_HEIGHT_INCHES = '69';

const getMeasurementDefaults = (measurementSystem) =>
  measurementSystem === 'metric'
    ? {
        height: {
          value: '',
          unit: 'cm',
        },
        weight: {
          value: '',
          unit: 'kg',
        },
      }
    : {
        height: {
          value: IMPERIAL_DEFAULT_HEIGHT_INCHES,
          unit: 'in',
        },
        weight: {
          value: '',
          unit: 'lb',
        },
      };

const createInitialFormData = () => ({
  measurementSystem: 'imperial',
  gender: 'male',
  ...getMeasurementDefaults('imperial'),
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
  gender: formData.gender || undefined,
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
  const [generationError, setGenerationError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    setPlans(getPlans());
  }, []);

  const handleFieldChange = (field, value) => {
    setFormData((current) => {
      if (field === 'height.value') {
        return {
          ...current,
          height: {
            ...current.height,
            value,
          },
        };
      }

      if (field === 'weight.value') {
        return {
          ...current,
          weight: {
            ...current.weight,
            value,
          },
        };
      }

      return {
        ...current,
        [field]: value,
      };
    });
  };

  const handleMeasurementSystemChange = (measurementSystem) => {
    setFormData((current) => ({
      ...current,
      measurementSystem,
      ...getMeasurementDefaults(measurementSystem),
    }));
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

  const handleGeneratePlan = async (event) => {
    event.preventDefault();

    if (isGenerating) {
      return;
    }

    const input = normalizeInput(formData);
    const nextErrors = validateFitnessInput(input);
    setErrors(nextErrors);
    setGenerationError('');

    if (hasValidationErrors(nextErrors)) {
      return;
    }

    setIsGenerating(true);
    try {
      const generated = await generatePlan(input);
      const plan = {
        id: createPlanId(),
        createdAt: new Date().toISOString(),
        input,
        ...generated,
      };

      createPlan(plan);
      setPlans((existing) => [plan, ...existing]);
      setFormData(createInitialFormData());
      setErrors({});
    } catch (error) {
      const rawMessage =
        error instanceof Error
          ? error.message
          : 'Unable to generate a plan right now. Please try again.';
      const message = /after retry/i.test(rawMessage)
        ? 'Agent returned an invalid day count twice. Please try again.'
        : rawMessage;
      setGenerationError(message);
    } finally {
      setIsGenerating(false);
    }
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
          Create and manage personalized workout plans generated by your Archia
          agent.
        </p>
      </section>

      <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="mb-4 text-2xl font-bold text-slate-900">Intake Form</h2>
        {generationError ? (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
          >
            {generationError}
          </div>
        ) : null}
        <FitnessForm
          formData={formData}
          errors={errors}
          isGenerating={isGenerating}
          onFieldChange={handleFieldChange}
          onMeasurementSystemChange={handleMeasurementSystemChange}
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
