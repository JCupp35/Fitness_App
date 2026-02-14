import {
  GENDER_OPTIONS,
  GOAL_OPTIONS,
  IMPERIAL_HEIGHT_OPTIONS,
  MEASUREMENT_SYSTEM_OPTIONS,
  WORKOUT_LOCATION_OPTIONS,
} from '@/constants/options';
import type {
  FitnessFormData,
  FitnessFormField,
  ValidationErrors,
} from '@/types/fitnessPlan';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const FieldError = ({ message }: { message: string | undefined }) =>
  message ? <p className="mt-1 text-xs font-medium text-rose-600">{message}</p> : null;

interface FitnessFormProps {
  formData: FitnessFormData;
  errors: ValidationErrors;
  isGenerating: boolean;
  onFieldChange: (field: FitnessFormField, value: string) => void;
  onMeasurementSystemChange: (measurementSystem: FitnessFormData['measurementSystem']) => void;
  onEquipmentChange: (
    equipmentKey: keyof FitnessFormData['homeEquipment'],
    checked: boolean,
  ) => void;
  onGeneratePlan: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

function FitnessForm({
  formData,
  errors,
  isGenerating,
  onFieldChange,
  onMeasurementSystemChange,
  onEquipmentChange,
  onGeneratePlan,
}: FitnessFormProps) {
  const isHome = formData.workoutLocation === 'home';
  const isImperial = formData.measurementSystem === 'imperial';

  return (
    <form className="space-y-5" onSubmit={onGeneratePlan} noValidate>
      <div>
        <p className="mb-2 block text-sm font-semibold text-slate-700">Units</p>
        <div
          className="inline-grid w-full max-w-xs grid-cols-2 rounded-full border border-slate-300 bg-slate-100 p-1"
          role="group"
          aria-label="Measurement system"
        >
          {MEASUREMENT_SYSTEM_OPTIONS.map((option) => {
            const isSelected = formData.measurementSystem === option.value;

            return (
              <Button
                key={option.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onMeasurementSystemChange(option.value)}
                variant={isSelected ? 'default' : 'secondary'}
                size="sm"
                className="rounded-full"
              >
                {option.label}
              </Button>
            );
          })}
        </div>
      </div>

      <fieldset>
        <legend className="mb-2 block text-sm font-semibold text-slate-700">Gender</legend>
        <div className="flex gap-6">
          {GENDER_OPTIONS.map((gender) => (
            <Label
              key={gender.value}
              className="inline-flex items-center gap-2 text-sm font-normal text-slate-700"
            >
              <input
                type="radio"
                name="gender"
                value={gender.value}
                checked={formData.gender === gender.value}
                onChange={(event) => onFieldChange('gender', event.target.value)}
                className="h-4 w-4 border-slate-300 text-slate-900 focus:ring-slate-600"
              />
              {gender.label}
            </Label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="height-value" className="mb-1 block text-sm font-semibold text-slate-700">
            Height
          </Label>
          {isImperial ? (
            <Select
              value={formData.height.value}
              onValueChange={(value) => onFieldChange('height.value', value)}
            >
              <SelectTrigger id="height-value">
                <SelectValue placeholder="Select height" />
              </SelectTrigger>
              <SelectContent>
                {IMPERIAL_HEIGHT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="height-value"
              type="number"
              min="0"
              step="0.1"
              value={formData.height.value}
              onChange={(event) => onFieldChange('height.value', event.target.value)}
              placeholder="Enter height in cm"
            />
          )}
          <FieldError message={errors.height} />
        </div>

        <div>
          <Label htmlFor="weight-value" className="mb-1 block text-sm font-semibold text-slate-700">
            Weight
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="weight-value"
              type="text"
              inputMode="decimal"
              pattern="[0-9]*[.]?[0-9]*"
              value={formData.weight.value}
              onChange={(event) => onFieldChange('weight.value', event.target.value)}
              placeholder="Enter weight"
            />
            <span className="rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
              {isImperial ? 'lb' : 'kg'}
            </span>
          </div>
          <FieldError message={errors.weight} />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="goal" className="mb-1 block text-sm font-semibold text-slate-700">
            Goal
          </Label>
          <Select
            value={formData.goal}
            onValueChange={(value) => onFieldChange('goal', value)}
          >
            <SelectTrigger id="goal">
              <SelectValue placeholder="Select a goal" />
            </SelectTrigger>
            <SelectContent>
              {GOAL_OPTIONS.map((goal) => (
                <SelectItem key={goal.value} value={goal.value}>
                  {goal.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={errors.goal} />
        </div>

        <div>
          <Label
            htmlFor="days-per-week"
            className="mb-1 block text-sm font-semibold text-slate-700"
          >
            Days per week
          </Label>
          <Input
            id="days-per-week"
            type="number"
            min="1"
            max="7"
            value={formData.daysPerWeek}
            onChange={(event) => onFieldChange('daysPerWeek', event.target.value)}
            placeholder="1 - 7"
          />
          <FieldError message={errors.daysPerWeek} />
        </div>
      </div>

      <div>
        <Label
          htmlFor="workout-location"
          className="mb-1 block text-sm font-semibold text-slate-700"
        >
          Workout location
        </Label>
        <Select
          value={formData.workoutLocation}
          onValueChange={(value) => onFieldChange('workoutLocation', value)}
        >
          <SelectTrigger id="workout-location" className="md:max-w-xs">
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            {WORKOUT_LOCATION_OPTIONS.map((location) => (
              <SelectItem key={location.value} value={location.value}>
                {location.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError message={errors.workoutLocation} />
      </div>

      {isHome ? (
        <fieldset className="rounded-xl border border-slate-200 p-4">
          <legend className="px-2 text-sm font-semibold text-slate-700">Home equipment</legend>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:gap-6">
            <div className="inline-flex items-center gap-2">
              <Checkbox
                id="pull-up-bar"
                checked={formData.homeEquipment.pullUpBar}
                onCheckedChange={(checked) => onEquipmentChange('pullUpBar', checked === true)}
              />
              <Label
                htmlFor="pull-up-bar"
                className="text-sm font-normal text-slate-700"
              >
                Pull-up bar
              </Label>
            </div>
            <div className="inline-flex items-center gap-2">
              <Checkbox
                id="dip-station"
                checked={formData.homeEquipment.dipStation}
                onCheckedChange={(checked) => onEquipmentChange('dipStation', checked === true)}
              />
              <Label
                htmlFor="dip-station"
                className="text-sm font-normal text-slate-700"
              >
                Dip station
              </Label>
            </div>
          </div>
        </fieldset>
      ) : null}

      <Button type="submit" disabled={isGenerating}>
        {isGenerating ? 'Generating...' : 'Generate Plan'}
      </Button>
    </form>
  );
}

export default FitnessForm;
