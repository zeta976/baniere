/**
 * Input validation utilities
 */

import { ScheduleFilters, DayFilter } from '../models/Schedule';
import { VALID_DAYS, VALID_TIME_FORMAT, ValidationResult } from '../models/Filter';
import { isValidTimeFormat } from './timeUtils';

export function validateFilters(filters: ScheduleFilters): ValidationResult {
  const errors: string[] = [];

  // Validate time formats
  if (filters.maxEndTime && !isValidTimeFormat(filters.maxEndTime)) {
    errors.push(`Invalid maxEndTime format: ${filters.maxEndTime}. Expected HHMM.`);
  }

  if (filters.minStartTime && !isValidTimeFormat(filters.minStartTime)) {
    errors.push(`Invalid minStartTime format: ${filters.minStartTime}. Expected HHMM.`);
  }

  // Validate free days
  if (filters.freeDays) {
    for (const day of filters.freeDays) {
      if (!VALID_DAYS.includes(day as any)) {
        errors.push(`Invalid day: ${day}. Must be one of: ${VALID_DAYS.join(', ')}`);
      }
    }
  }

  // Validate specific day filters
  if (filters.specificDayFilters) {
    for (const dayFilter of filters.specificDayFilters) {
      if (!VALID_DAYS.includes(dayFilter.day as any)) {
        errors.push(`Invalid day in specificDayFilters: ${dayFilter.day}`);
      }
      if (dayFilter.maxEndTime && !isValidTimeFormat(dayFilter.maxEndTime)) {
        errors.push(`Invalid maxEndTime in specificDayFilters for ${dayFilter.day}`);
      }
      if (dayFilter.minStartTime && !isValidTimeFormat(dayFilter.minStartTime)) {
        errors.push(`Invalid minStartTime in specificDayFilters for ${dayFilter.day}`);
      }
    }
  }

  // Validate logical constraints
  if (
    filters.minStartTime &&
    filters.maxEndTime &&
    filters.minStartTime >= filters.maxEndTime
  ) {
    errors.push('minStartTime must be less than maxEndTime');
  }

  if (filters.maxGapMinutes !== undefined && filters.maxGapMinutes < 0) {
    errors.push('maxGapMinutes must be non-negative');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateCourseCode(code: string): boolean {
  // Course codes typically: LETTERS + NUMBERS (e.g., ADMI1101)
  return /^[A-Z]{2,6}\d{4}$/.test(code);
}

export function sanitizeString(str: string): string {
  return str.trim().replace(/[<>]/g, '');
}
