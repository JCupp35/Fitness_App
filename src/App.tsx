import { useEffect, useState } from 'react';
import FitnessForm from '@/components/FitnessForm';
import PlanList from '@/components/PlanList';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { generatePlan } from '@/services/planGenerator';
import {
  createPlan,
  deletePlan as deleteStoredPlan,
  getPlans,
  updatePlan,
} from '@/services/planStorage';
import type {
  FitnessFormData,
  FitnessInput,
  FitnessPlan,
  ValidationErrors,
} from '@/types/fitnessPlan';
import { hasValidationErrors, validateFitnessInput } from '@/utils/validation';

const IMPERIAL_DEFAULT_HEIGHT_INCHES = '69';

type NormalizedInput = Omit<FitnessInput, 'goal' | 'workoutLocation'> & {
  goal: FitnessInput['goal'] | '';
  workoutLocation: FitnessInput['workoutLocation'] | '';
};

const getMeasurementDefaults = (
  measurementSystem: FitnessFormData['measurementSystem'],
): Pick<FitnessFormData, 'height' | 'weight'> =>
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

const createInitialFormData = (): FitnessFormData => ({
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

const toNumber = (value: string): number => {
  if (value === '') {
    return Number.NaN;
  }
  return Number(value);
};

const toInteger = (value: string): number => {
  if (value === '') {
    return Number.NaN;
  }
  return parseInt(value, 10);
};

const normalizeInput = (formData: FitnessFormData): NormalizedInput => ({
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

const isValidatedFitnessInput = (input: NormalizedInput): input is FitnessInput =>
  input.goal !== '' &&
  input.workoutLocation !== '' &&
  Number.isFinite(input.height.value) &&
  input.height.value > 0 &&
  Number.isFinite(input.weight.value) &&
  input.weight.value > 0 &&
  Number.isInteger(input.daysPerWeek) &&
  input.daysPerWeek >= 1 &&
  input.daysPerWeek <= 7;

const createPlanId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

function App() {
  const [formData, setFormData] = useState<FitnessFormData>(createInitialFormData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [generationError, setGenerationError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [plans, setPlans] = useState<FitnessPlan[]>([]);

  useEffect(() => {
    setPlans(getPlans());
  }, []);

  const handleFieldChange = (
    field:
      | 'height.value'
      | 'weight.value'
      | 'gender'
      | 'goal'
      | 'daysPerWeek'
      | 'workoutLocation',
    value: string,
  ) => {
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
      } as FitnessFormData;
    });
  };

  const handleMeasurementSystemChange = (
    measurementSystem: FitnessFormData['measurementSystem'],
  ) => {
    setFormData((current) => ({
      ...current,
      measurementSystem,
      ...getMeasurementDefaults(measurementSystem),
    }));
  };

  const handleEquipmentChange = (
    equipmentKey: keyof FitnessFormData['homeEquipment'],
    checked: boolean,
  ) => {
    setFormData((current) => ({
      ...current,
      homeEquipment: {
        ...current.homeEquipment,
        [equipmentKey]: checked,
      },
    }));
  };

  const handleGeneratePlan = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    if (isGenerating) {
      return;
    }

    const normalizedInput = normalizeInput(formData);
    const nextErrors = validateFitnessInput(normalizedInput);
    setErrors(nextErrors);
    setGenerationError('');

    if (hasValidationErrors(nextErrors)) {
      return;
    }

    if (!isValidatedFitnessInput(normalizedInput)) {
      setGenerationError('Unable to submit due to invalid form values.');
      return;
    }

    const input: FitnessInput = normalizedInput;

    setIsGenerating(true);
    try {
      const generated = await generatePlan(input);
      const plan: FitnessPlan = {
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

  const handlePlanUpdate = (
    id: string,
    partial: Partial<Pick<FitnessPlan, 'title' | 'notes'>>,
  ) => {
    const updated = updatePlan(id, partial);
    if (!updated) {
      return;
    }

    setPlans((current) => current.map((plan) => (plan.id === id ? updated : plan)));
  };

  const handlePlanDelete = (id: string) => {
    deleteStoredPlan(id);
    setPlans((current) => current.filter((plan) => plan.id !== id));
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-10 sm:px-6">
      <Card className="mb-8 rounded-3xl border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Fitness Plan Maker
          </CardTitle>
          <CardDescription className="max-w-2xl text-sm text-slate-600 sm:text-base">
            Create and manage personalized workout plans generated by your Archia
            agent.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="mb-8 rounded-3xl border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-900">Intake Form</CardTitle>
        </CardHeader>
        <CardContent>
          {generationError ? (
            <Alert className="mb-4 border-rose-200 bg-rose-50 text-rose-700">
              <AlertDescription>{generationError}</AlertDescription>
            </Alert>
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
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-slate-200 bg-white">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-2xl font-bold text-slate-900">Saved Plans</CardTitle>
          <p className="text-sm text-slate-500">
            {plans.length} {plans.length === 1 ? 'plan' : 'plans'}
          </p>
        </CardHeader>
        <CardContent>
          <PlanList
            plans={plans}
            onUpdate={handlePlanUpdate}
            onDelete={handlePlanDelete}
          />
        </CardContent>
      </Card>
    </main>
  );
}

export default App;
