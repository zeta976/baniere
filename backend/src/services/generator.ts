/**
 * Schedule generation algorithm
 * Implements backtracking DFS with pruning
 */

import crypto from 'crypto';
import { NormalizedCourse } from '../models/Course';
import { Schedule, ScheduleFilters, ScheduleMetadata, GenerationResult } from '../models/Schedule';
import { hasConflictWithAny, buildConflictMatrix, hasConflictInMatrix } from './conflictChecker';
import { filterSectionsForCourse, hasPreferredProfessor } from './filterEngine';
import { sectionToTimeIntervals } from './conflictChecker';
import { calculateGapMinutes } from '../utils/timeUtils';

/**
 * Calculate schedule metadata and score
 */
function calculateScheduleMetadata(
  sections: NormalizedCourse[],
  filters: ScheduleFilters
): ScheduleMetadata {
  let latestEndTime = '0000';
  let earliestStartTime = '2359';
  const daysUsed = new Set<string>();
  let totalCredits = 0;
  let preferredProfessorsCount = 0;
  
  // Collect all time intervals
  const allIntervals: Array<{ day: string; begin: string; end: string }> = [];
  
  for (const section of sections) {
    totalCredits += section.creditHours;
    
    if (hasPreferredProfessor(section, filters.requiredProfessors)) {
      preferredProfessorsCount++;
    }
    
    const intervals = sectionToTimeIntervals(section);
    for (const interval of intervals) {
      daysUsed.add(interval.day);
      allIntervals.push({
        day: interval.day,
        begin: interval.beginTime,
        end: interval.endTime
      });
      
      if (interval.endTime > latestEndTime) latestEndTime = interval.endTime;
      if (interval.beginTime < earliestStartTime) earliestStartTime = interval.beginTime;
    }
  }
  
  // Calculate gaps (time between classes on same day)
  let totalGaps = 0;
  const intervalsByDay = new Map<string, Array<{ begin: string; end: string }>>();
  
  for (const interval of allIntervals) {
    if (!intervalsByDay.has(interval.day)) {
      intervalsByDay.set(interval.day, []);
    }
    intervalsByDay.get(interval.day)!.push({ begin: interval.begin, end: interval.end });
  }
  
  // For each day, sort intervals and calculate gaps
  for (const [day, intervals] of intervalsByDay) {
    intervals.sort((a, b) => a.begin.localeCompare(b.begin));
    
    for (let i = 0; i < intervals.length - 1; i++) {
      const gap = calculateGapMinutes(intervals[i].end, intervals[i + 1].begin);
      if (gap > 0) totalGaps += gap;
    }
  }
  
  return {
    latestEndTime,
    earliestStartTime,
    totalGaps,
    daysOnCampus: daysUsed.size,
    totalCredits,
    preferredProfessorsCount
  };
}

/**
 * Calculate schedule score (lower is better for most metrics)
 */
function calculateScore(metadata: ScheduleMetadata, filters: ScheduleFilters): number {
  let score = 0;
  
  // Weight factors (adjust based on preferences)
  const LATEST_TIME_WEIGHT = 10;
  const GAP_WEIGHT = 1;
  const DAYS_WEIGHT = 50;
  const PREFERRED_PROF_WEIGHT = -100; // Negative = bonus
  
  // Latest end time (prefer earlier)
  const latestHour = parseInt(metadata.latestEndTime.substring(0, 2));
  score += latestHour * LATEST_TIME_WEIGHT;
  
  // Total gaps (prefer fewer/shorter gaps)
  score += metadata.totalGaps * GAP_WEIGHT;
  
  // Days on campus (prefer fewer days)
  score += metadata.daysOnCampus * DAYS_WEIGHT;
  
  // Preferred professors (bonus for more)
  score += metadata.preferredProfessorsCount * PREFERRED_PROF_WEIGHT;
  
  // Compact schedule bonus (if prefer compact)
  if (filters.preferCompact) {
    score -= 50; // Bonus
  }
  
  return score;
}

/**
 * Generate schedule ID (hash of section reference numbers)
 */
function generateScheduleId(sections: NormalizedCourse[]): string {
  const refNums = sections
    .map(s => s.courseReferenceNumber)
    .sort()
    .join('-');
  return crypto.createHash('md5').update(refNums).digest('hex').substring(0, 16);
}

/**
 * Backtracking DFS to generate schedules
 */
function backtrack(
  courseSections: NormalizedCourse[][],
  currentSchedule: NormalizedCourse[],
  courseIndex: number,
  filters: ScheduleFilters,
  results: Schedule[],
  maxResults: number,
  conflictMatrix: Map<string, Set<string>>
): boolean {
  // Base case: all courses assigned
  if (courseIndex === courseSections.length) {
    const metadata = calculateScheduleMetadata(currentSchedule, filters);
    const score = calculateScore(metadata, filters);
    const id = generateScheduleId(currentSchedule);
    
    results.push({
      id,
      sections: [...currentSchedule],
      score,
      metadata
    });
    
    return results.length >= maxResults;
  }
  
  // Try each section for current course
  const sections = courseSections[courseIndex];
  
  for (const section of sections) {
    // Check required sections filter
    if (filters.requiredSections && filters.requiredSections.length > 0) {
      const currentCourse = section.subjectCourse;
      const requiredForThisCourse = filters.requiredSections.find(refNum => {
        // Find if this refNum belongs to current course
        return sections.some(s => s.courseReferenceNumber === refNum);
      });
      
      if (requiredForThisCourse && section.courseReferenceNumber !== requiredForThisCourse) {
        continue; // Skip non-required sections
      }
    }
    
    // Check conflicts using matrix
    const existingRefNums = currentSchedule.map(s => s.courseReferenceNumber);
    if (hasConflictInMatrix(section.courseReferenceNumber, existingRefNums, conflictMatrix)) {
      continue; // Skip conflicting section
    }
    
    // Check max gap constraint
    if (filters.maxGapMinutes !== undefined) {
      // Calculate if this section would create gaps exceeding limit
      // (Simplified check - full implementation would check per day)
      const testSchedule = [...currentSchedule, section];
      const metadata = calculateScheduleMetadata(testSchedule, filters);
      
      if (metadata.totalGaps > filters.maxGapMinutes * (metadata.daysOnCampus || 1)) {
        continue;
      }
    }
    
    // Add section and recurse
    currentSchedule.push(section);
    const shouldStop = backtrack(
      courseSections,
      currentSchedule,
      courseIndex + 1,
      filters,
      results,
      maxResults,
      conflictMatrix
    );
    currentSchedule.pop();
    
    if (shouldStop) return true;
  }
  
  return false;
}

/**
 * Main schedule generation function
 */
export function generateSchedules(
  courseSections: Map<string, NormalizedCourse[]>,
  filters: ScheduleFilters,
  maxResults: number = 500
): GenerationResult {
  const startTime = Date.now();
  
  // Pre-filter sections
  const filteredCourseSections: NormalizedCourse[][] = [];
  for (const [course, sections] of courseSections) {
    const filtered = filterSectionsForCourse(sections, filters);
    
    if (filtered.length === 0) {
      // No valid sections for this course - cannot generate schedules
      return {
        schedules: [],
        totalFound: 0,
        searchTimeMs: Date.now() - startTime,
        limitReached: false
      };
    }
    
    filteredCourseSections.push(filtered);
  }
  
  // Sort by number of sections (smallest branching first)
  filteredCourseSections.sort((a, b) => a.length - b.length);
  
  // Build conflict matrix for all sections
  const allSections = filteredCourseSections.flat();
  const conflictMatrix = buildConflictMatrix(allSections);
  
  // Check for combinatorial explosion
  const totalCombinations = filteredCourseSections.reduce(
    (acc, sections) => acc * sections.length,
    1
  );
  
  if (totalCombinations > 100000) {
    console.warn(`Large search space: ${totalCombinations} combinations`);
  }
  
  // Generate schedules
  const results: Schedule[] = [];
  backtrack(filteredCourseSections, [], 0, filters, results, maxResults, conflictMatrix);
  
  // Sort by score (best first)
  results.sort((a, b) => a.score - b.score);
  
  const searchTimeMs = Date.now() - startTime;
  
  return {
    schedules: results,
    totalFound: results.length,
    searchTimeMs,
    limitReached: results.length >= maxResults
  };
}
