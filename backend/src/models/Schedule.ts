import { NormalizedCourse } from './Course';

/**
 * Schedule generation types
 */

export interface Schedule {
  id: string; // Hash of section IDs
  sections: NormalizedCourse[];
  score: number;
  metadata: ScheduleMetadata;
}

export interface ScheduleMetadata {
  latestEndTime: string;
  earliestStartTime: string;
  totalGaps: number; // Minutes of idle time
  daysOnCampus: number;
  totalCredits: number;
  preferredProfessorsCount: number;
}

export interface ScheduleGenerationRequest {
  courses: string[]; // Array of subjectCourse codes (e.g., ["ADMI1101", "MATE1203"])
  filters: ScheduleFilters;
  maxResults?: number;
}

export interface ScheduleFilters {
  maxEndTime?: string; // "1800" = 6:00 PM
  minStartTime?: string; // "0800" = 8:00 AM
  freeDays?: string[]; // ["monday", "friday"]
  requiredSections?: string[]; // courseReferenceNumbers
  forbiddenSections?: string[]; // courseReferenceNumbers
  requiredProfessors?: string[]; // bannerId or displayName
  forbiddenProfessors?: string[]; // bannerId or displayName
  onlyOpenSections?: boolean;
  preferCompact?: boolean; // Minimize gaps
  maxGapMinutes?: number; // Max gap between classes
  preferredGapTime?: string; // "1200" = prefer lunch break around noon
  specificDayFilters?: DayFilter[]; // Per-day constraints
}

export interface DayFilter {
  day: string; // "monday", "tuesday", etc.
  maxEndTime?: string;
  minStartTime?: string;
}

export interface GenerationResult {
  schedules: Schedule[];
  totalFound: number;
  searchTimeMs: number;
  limitReached: boolean;
}
