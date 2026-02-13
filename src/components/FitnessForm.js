import {
  GOAL_OPTIONS,
  HEIGHT_UNITS,
  WEIGHT_UNITS,
  WORKOUT_LOCATION_OPTIONS,
} from '../constants/options';

const FieldError = ({ message }) =>
  message ? <p className="mt-1 text-xs font-medium text-rose-600">{message}</p> : null;

function FitnessForm({
  formData,
  errors,
  onFieldChange,
  onEquipmentChange,
  onGeneratePlan,
}) {
  const isHome = formData.workoutLocation === 'home';

  return (
    <form className="space-y-5" onSubmit={onGeneratePlan} noValidate>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="height-value"
            className="mb-1 block text-sm font-semibold text-slate-700"
          >
            Height
          </label>
          <div className="flex gap-2">
            <input
              id="height-value"
              type="number"
              min="0"
              step="0.1"
              value={formData.height.value}
              onChange={(event) => onFieldChange('height.value', event.target.value)}
              placeholder="Enter height"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-700 focus:outline-none"
            />
            <select
              id="height-unit"
              aria-label="Height Unit"
              value={formData.height.unit}
              onChange={(event) => onFieldChange('height.unit', event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-700 focus:outline-none"
            >
              {HEIGHT_UNITS.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>
          <FieldError message={errors.height} />
        </div>

        <div>
          <label
            htmlFor="weight-value"
            className="mb-1 block text-sm font-semibold text-slate-700"
          >
            Weight
          </label>
          <div className="flex gap-2">
            <input
              id="weight-value"
              type="number"
              min="0"
              step="0.1"
              value={formData.weight.value}
              onChange={(event) => onFieldChange('weight.value', event.target.value)}
              placeholder="Enter weight"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-700 focus:outline-none"
            />
            <select
              id="weight-unit"
              aria-label="Weight Unit"
              value={formData.weight.unit}
              onChange={(event) => onFieldChange('weight.unit', event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-700 focus:outline-none"
            >
              {WEIGHT_UNITS.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>
          <FieldError message={errors.weight} />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="goal" className="mb-1 block text-sm font-semibold text-slate-700">
            Goal
          </label>
          <select
            id="goal"
            value={formData.goal}
            onChange={(event) => onFieldChange('goal', event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-700 focus:outline-none"
          >
            <option value="">Select a goal</option>
            {GOAL_OPTIONS.map((goal) => (
              <option key={goal.value} value={goal.value}>
                {goal.label}
              </option>
            ))}
          </select>
          <FieldError message={errors.goal} />
        </div>

        <div>
          <label
            htmlFor="days-per-week"
            className="mb-1 block text-sm font-semibold text-slate-700"
          >
            Days per week
          </label>
          <input
            id="days-per-week"
            type="number"
            min="1"
            max="7"
            value={formData.daysPerWeek}
            onChange={(event) => onFieldChange('daysPerWeek', event.target.value)}
            placeholder="1 - 7"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-700 focus:outline-none"
          />
          <FieldError message={errors.daysPerWeek} />
        </div>
      </div>

      <div>
        <label
          htmlFor="workout-location"
          className="mb-1 block text-sm font-semibold text-slate-700"
        >
          Workout location
        </label>
        <select
          id="workout-location"
          value={formData.workoutLocation}
          onChange={(event) => onFieldChange('workoutLocation', event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-700 focus:outline-none md:max-w-xs"
        >
          <option value="">Select location</option>
          {WORKOUT_LOCATION_OPTIONS.map((location) => (
            <option key={location.value} value={location.value}>
              {location.label}
            </option>
          ))}
        </select>
        <FieldError message={errors.workoutLocation} />
      </div>

      {isHome ? (
        <fieldset className="rounded-xl border border-slate-200 p-4">
          <legend className="px-2 text-sm font-semibold text-slate-700">Home equipment</legend>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:gap-6">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={formData.homeEquipment.pullUpBar}
                onChange={(event) =>
                  onEquipmentChange('pullUpBar', event.target.checked)
                }
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-600"
              />
              Pull-up bar
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={formData.homeEquipment.dipStation}
                onChange={(event) =>
                  onEquipmentChange('dipStation', event.target.checked)
                }
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-600"
              />
              Dip station
            </label>
          </div>
        </fieldset>
      ) : null}

      <button
        type="submit"
        className="inline-flex items-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
      >
        Generate Plan
      </button>
    </form>
  );
}

export default FitnessForm;
