/**
 * @typedef {"in" | "cm"} HeightUnit
 * @typedef {"lb" | "kg"} WeightUnit
 * @typedef {"male" | "female"} Gender
 * @typedef {"build_muscle" | "lose_weight" | "endurance" | "general_fitness"} GoalType
 * @typedef {"home" | "gym"} WorkoutLocation
 *
 * @typedef {Object} Measurement
 * @property {number} value
 * @property {HeightUnit | WeightUnit} unit
 *
 * @typedef {Object} HomeEquipment
 * @property {boolean} pullUpBar
 * @property {boolean} dipStation
 *
 * @typedef {Object} FitnessInput
 * @property {Gender=} gender
 * @property {Measurement} height
 * @property {Measurement} weight
 * @property {GoalType} goal
 * @property {number} daysPerWeek
 * @property {WorkoutLocation} workoutLocation
 * @property {HomeEquipment} homeEquipment
 *
 * @typedef {Object} WorkoutDay
 * @property {string} day
 * @property {string} focus
 * @property {string[]} exercises
 *
 * @typedef {Object} FitnessPlan
 * @property {string} id
 * @property {string} createdAt
 * @property {FitnessInput} input
 * @property {string} title
 * @property {WorkoutDay[]} days
 * @property {string} notes
 */

export const fitnessPlanTypes = {};
