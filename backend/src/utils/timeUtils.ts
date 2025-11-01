/**
 * Time parsing and comparison utilities
 */

import { VALID_TIME_FORMAT } from '../models/Filter';

/**
 * Check if two time ranges overlap
 * @param beginA Start time A (HHMM format)
 * @param endA End time A (HHMM format)
 * @param beginB Start time B (HHMM format)
 * @param endB End time B (HHMM format)
 * @returns true if times overlap
 */
export function timesOverlap(
  beginA: string,
  endA: string,
  beginB: string,
  endB: string
): boolean {
  return beginA < endB && beginB < endA;
}

/**
 * Validate time format (HHMM)
 */
export function isValidTimeFormat(time: string): boolean {
  return VALID_TIME_FORMAT.test(time);
}

/**
 * Convert DD/MM/YYYY to YYYY-MM-DD (ISO 8601)
 */
export function convertDateFormat(dateStr: string): string {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return dateStr;
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Format time HHMM to HH:MM for display
 */
export function formatTime(time: string): string {
  if (time.length !== 4) return time;
  return `${time.substring(0, 2)}:${time.substring(2)}`;
}

/**
 * Calculate gap in minutes between two time ranges
 */
export function calculateGapMinutes(endTime1: string, startTime2: string): number {
  const end = parseInt(endTime1, 10);
  const start = parseInt(startTime2, 10);
  
  const endHour = Math.floor(end / 100);
  const endMin = end % 100;
  const startHour = Math.floor(start / 100);
  const startMin = start % 100;
  
  return (startHour * 60 + startMin) - (endHour * 60 + endMin);
}

/**
 * Compare times (returns -1 if a < b, 0 if equal, 1 if a > b)
 */
export function compareTime(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 * Check if time is within range
 */
export function isTimeInRange(
  time: string,
  minTime?: string,
  maxTime?: string
): boolean {
  if (minTime && time < minTime) return false;
  if (maxTime && time > maxTime) return false;
  return true;
}
