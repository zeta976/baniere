import { Course } from './course';

export interface Schedule {
  id: string;
  sections: Course[];
  score: number;
  metadata: ScheduleMetadata;
}

export interface ScheduleMetadata {
  latestEndTime: string;
  earliestStartTime: string;
  totalGaps: number;
  daysOnCampus: number;
  totalCredits: number;
  preferredProfessorsCount: number;
}

export interface ScheduleFilters {
  maxEndTime?: string;
  minStartTime?: string;
  freeDays?: string[];
  requiredSections?: string[];
  forbiddenSections?: string[];
  requiredProfessors?: string[];
  forbiddenProfessors?: string[];
  onlyOpenSections?: boolean;
  preferCompact?: boolean;
  maxGapMinutes?: number;
  preferredGapTime?: string;
  specificDayFilters?: DayFilter[];
}

export interface DayFilter {
  day: string;
  maxEndTime?: string;
  minStartTime?: string;
}

export interface GenerateScheduleRequest {
  courses: string[];
  filters: ScheduleFilters;
  maxResults?: number;
}

export interface GenerateScheduleResponse {
  success: boolean;
  schedules: Schedule[];
  totalFound: number;
  searchTimeMs: number;
  limitReached: boolean;
}
