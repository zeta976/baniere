/**
 * Time formatting utilities
 */

/**
 * Format HHMM to HH:MM
 */
export function formatTime(time: string): string {
  if (!time || time === 'TBA' || time.length !== 4) {
    return time;
  }
  return `${time.substring(0, 2)}:${time.substring(2)}`;
}

/**
 * Format time range
 */
export function formatTimeRange(beginTime: string, endTime: string): string {
  return `${formatTime(beginTime)} - ${formatTime(endTime)}`;
}

/**
 * Convert HHMM to minutes since midnight
 */
export function timeToMinutes(time: string): number {
  if (!time || time.length !== 4) return 0;
  const hours = parseInt(time.substring(0, 2), 10);
  const minutes = parseInt(time.substring(2), 10);
  return hours * 60 + minutes;
}

/**
 * Convert minutes to HHMM
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}${mins.toString().padStart(2, '0')}`;
}

/**
 * Format gap duration
 */
export function formatGapDuration(minutes: number): string {
  if (minutes === 0) return '0 min';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

/**
 * Get time label for grid position
 */
export function getTimeLabel(hour: number): string {
  const isPM = hour >= 12;
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:00 ${isPM ? 'PM' : 'AM'}`;
}
