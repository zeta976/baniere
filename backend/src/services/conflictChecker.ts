/**
 * Schedule conflict detection service
 */

import { NormalizedCourse, TimeInterval } from '../models/Course';
import { timesOverlap } from '../utils/timeUtils';

/**
 * Convert a section's meeting times to flat time intervals
 */
export function sectionToTimeIntervals(section: NormalizedCourse): TimeInterval[] {
  const intervals: TimeInterval[] = [];
  
  for (const meeting of section.meetingTimes) {
    // Skip TBA/online sections
    if (meeting.beginTime === 'TBA' || meeting.endTime === 'TBA' || meeting.days.length === 0) {
      continue;
    }
    
    for (const day of meeting.days) {
      intervals.push({
        day,
        beginTime: meeting.beginTime,
        endTime: meeting.endTime,
        building: meeting.building,
        room: meeting.room
      });
    }
  }
  
  return intervals;
}

/**
 * Check if two sections have time conflicts
 * Sections in different cycles (Ciclo 1 vs Ciclo 2) don't conflict even if times overlap
 */
export function sectionsConflict(section1: NormalizedCourse, section2: NormalizedCourse): boolean {
  // Different cycles don't conflict (8-week courses)
  if (section1.cycle && section2.cycle && section1.cycle !== section2.cycle) {
    return false;
  }
  
  const intervals1 = sectionToTimeIntervals(section1);
  const intervals2 = sectionToTimeIntervals(section2);
  
  // TBA/online sections never conflict
  if (intervals1.length === 0 || intervals2.length === 0) {
    return false;
  }
  
  // Check all interval pairs
  for (const int1 of intervals1) {
    for (const int2 of intervals2) {
      // Same day and time overlap = conflict
      if (int1.day === int2.day && timesOverlap(int1.beginTime, int1.endTime, int2.beginTime, int2.endTime)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Check if a section conflicts with any in a list
 */
export function hasConflictWithAny(
  section: NormalizedCourse,
  existingSections: NormalizedCourse[]
): boolean {
  return existingSections.some(existing => sectionsConflict(section, existing));
}

/**
 * Build conflict adjacency matrix for optimization
 * Returns Map<courseRefNum, Set<courseRefNum>> of conflicting sections
 */
export function buildConflictMatrix(sections: NormalizedCourse[]): Map<string, Set<string>> {
  const matrix = new Map<string, Set<string>>();
  
  for (let i = 0; i < sections.length; i++) {
    const section1 = sections[i];
    const conflicts = new Set<string>();
    
    for (let j = 0; j < sections.length; j++) {
      if (i === j) continue;
      const section2 = sections[j];
      
      if (sectionsConflict(section1, section2)) {
        conflicts.add(section2.courseReferenceNumber);
      }
    }
    
    matrix.set(section1.courseReferenceNumber, conflicts);
  }
  
  return matrix;
}

/**
 * Check conflicts using pre-computed matrix (O(1) lookup)
 */
export function hasConflictInMatrix(
  sectionRefNum: string,
  existingRefNums: string[],
  conflictMatrix: Map<string, Set<string>>
): boolean {
  const conflicts = conflictMatrix.get(sectionRefNum);
  if (!conflicts) return false;
  
  return existingRefNums.some(refNum => conflicts.has(refNum));
}
