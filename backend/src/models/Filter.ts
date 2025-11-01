/**
 * Filter validation and types
 */

export const VALID_DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
] as const;

export type DayOfWeek = typeof VALID_DAYS[number];

export const VALID_TIME_FORMAT = /^([0-1][0-9]|2[0-3])[0-5][0-9]$/;

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
