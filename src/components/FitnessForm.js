import {
  GENDER_OPTIONS,
  GOAL_OPTIONS,
  IMPERIAL_HEIGHT_OPTIONS,
  MEASUREMENT_SYSTEM_OPTIONS,
  WORKOUT_LOCATION_OPTIONS,
} from '../constants/options';

const FieldError = ({ message }) =>
  message ? <p className="mt-1 text-xs font-medium text-rose-600">{message}</p> : null;

function FitnessForm({
  formData,
  errors,
  onFieldChange,
  onMeasurementSystemChange,
  onEquipmentChange,
  onGeneratePlan,
}) {
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
              <button
                key={option.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onMeasurementSystemChange(option.value)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition focus:outline-none ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <fieldset>
        <legend className="mb-2 block text-sm font-semibold text-slate-700">Gender</legend>
        <div className="flex gap-6">
          {GENDER_OPTIONS.map((gender) => (
            <label key={gender.value} className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name="gender"
                value={gender.value}
                checked={formData.gender === gender.value}
                onChange={(event) => onFieldChange('gender', event.target.value)}
                className="h-4 w-4 border-slate-300 text-slate-900 focus:ring-slate-600"
              />
              {gender.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="height-value"
            className="mb-1 block text-sm font-semibold text-slate-700"
          >
            Height
          </label>
          {isImperial ? (
            <select
              id="height-value"
              value={formData.height.value}
              onChange={(event) => onFieldChange('height.value', event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-700 focus:outline-none"
            >
              {IMPERIAL_HEIGHT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="height-value"
              type="number"
              min="0"
              step="0.1"
              value={formData.height.value}
              onChange={(event) => onFieldChange('height.value', event.target.value)}
              placeholder="Enter height in cm"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-700 focus:outline-none"
            />
          )}
          <FieldError message={errors.height} />
        </div>

        <div>
          <label
            htmlFor="weight-value"
            className="mb-1 block text-sm font-semibold text-slate-700"
          >
            Weight
          </label>
          <div className="flex items-center gap-2">
            <input
              id="weight-value"
              type="text"
              inputMode="decimal"
              pattern="[0-9]*[.]?[0-9]*"
              value={formData.weight.value}
              onChange={(event) => onFieldChange('weight.value', event.target.value)}
              placeholder="Enter weight"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-700 focus:outline-none"
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
