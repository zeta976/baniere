import { DayOfWeek } from './filter';

/**
 * Represents a blocked time period in the schedule
 */
export interface TimeBlock {
  id: string;
  day: DayOfWeek;
  startTime: string; // Format: "HHMM" (e.g., "0800")
  endTime: string;   // Format: "HHMM" (e.g., "1400")
  label?: string;    // Optional label (e.g., "Almuerzo", "Trabajo")
}

/**
 * Generates a unique ID for a time block
 */
export function generateTimeBlockId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Converts time in HHMM format to minutes from midnight
 */
export function timeToMinutes(time: string): number {
  const hours = parseInt(time.substring(0, 2), 10);
  const minutes = parseInt(time.substring(2, 4), 10);
  return hours * 60 + minutes;
}

/**
 * Converts minutes from midnight to HHMM format
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}${mins.toString().padStart(2, '0')}`;
}

/**
 * Formats time for display (e.g., "0800" -> "8:00 AM")
 */
export function formatTimeForDisplay(time: string): string {
  const hours = parseInt(time.substring(0, 2), 10);
  const minutes = time.substring(2, 4);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:${minutes} ${period}`;
}

/**
 * Checks if two time blocks overlap
 */
export function timeBlocksOverlap(block1: TimeBlock, block2: TimeBlock): boolean {
  if (block1.day !== block2.day) return false;
  
  const start1 = timeToMinutes(block1.startTime);
  const end1 = timeToMinutes(block1.endTime);
  const start2 = timeToMinutes(block2.startTime);
  const end2 = timeToMinutes(block2.endTime);
  
  return start1 < end2 && end1 > start2;
}

/**
 * Checks if a meeting time conflicts with any time blocks
 */
export function meetingConflictsWithBlocks(
  days: string[],
  startTime: string,
  endTime: string,
  blocks: TimeBlock[]
): boolean {
  return blocks.some(block => {
    if (!days.includes(block.day)) return false;
    
    const meetingStart = timeToMinutes(startTime);
    const meetingEnd = timeToMinutes(endTime);
    const blockStart = timeToMinutes(block.startTime);
    const blockEnd = timeToMinutes(block.endTime);
    
    return meetingStart < blockEnd && meetingEnd > blockStart;
  });
}
