/**
 * Filter engine for pre-filtering sections based on constraints
 */

import { NormalizedCourse } from '../models/Course';
import { ScheduleFilters } from '../models/Schedule';
import { sectionToTimeIntervals } from './conflictChecker';

/**
 * Apply filters to a section to determine if it should be included
 */
export function sectionPassesFilters(
  section: NormalizedCourse,
  filters: ScheduleFilters
): boolean {
  // Only open sections filter
  if (filters.onlyOpenSections && !section.openSection) {
    return false;
  }
  
  // Forbidden sections
  if (filters.forbiddenSections?.includes(section.courseReferenceNumber)) {
    return false;
  }
  
  // Forbidden professors
  if (filters.forbiddenProfessors) {
    const hasForbiddenProf = section.faculty.some(prof =>
      filters.forbiddenProfessors!.some(forbidden =>
        prof.bannerId === forbidden || prof.displayName.includes(forbidden)
      )
    );
    if (hasForbiddenProf) return false;
  }
  
  // Check meeting times against filters
  const intervals = sectionToTimeIntervals(section);
  
  // If section has no meeting times (TBA/online) and time-based filters are active,
  // exclude it to avoid bypassing user constraints
  const hasTimeBasedFilters = 
    filters.freeDays?.length || 
    filters.maxEndTime || 
    filters.minStartTime || 
    filters.specificDayFilters?.length;
  
  if (intervals.length === 0 && hasTimeBasedFilters) {
    // TBA sections should be excluded when user has specific time preferences
    // They can still appear if no time filters are set
    return false;
  }
  
  for (const interval of intervals) {
    // Free days - section cannot meet on these days
    if (filters.freeDays?.includes(interval.day)) {
      console.log(`❌ Section ${section.subjectCourse}-${section.section} excluded: meets on ${interval.day} (free day)`);
      return false;
    }
    
    // Max end time
    if (filters.maxEndTime && interval.endTime > filters.maxEndTime) {
      console.log(`❌ Section ${section.subjectCourse}-${section.section} excluded: ends at ${interval.endTime} (max: ${filters.maxEndTime})`);
      return false;
    }
    
    // Min start time
    if (filters.minStartTime && interval.beginTime < filters.minStartTime) {
      console.log(`❌ Section ${section.subjectCourse}-${section.section} excluded: starts at ${interval.beginTime} (min: ${filters.minStartTime})`);
      return false;
    }
    
    // Specific day filters
    if (filters.specificDayFilters) {
      const dayFilter = filters.specificDayFilters.find(df => df.day === interval.day);
      if (dayFilter) {
        if (dayFilter.maxEndTime && interval.endTime > dayFilter.maxEndTime) {
          return false;
        }
        if (dayFilter.minStartTime && interval.beginTime < dayFilter.minStartTime) {
          return false;
        }
      }
    }
  }
  
  return true;
}

/**
 * Pre-filter sections for a course based on constraints
 */
export function filterSectionsForCourse(
  sections: NormalizedCourse[],
  filters: ScheduleFilters
): NormalizedCourse[] {
  return sections.filter(section => sectionPassesFilters(section, filters));
}

/**
 * Group sections by course code
 */
export function groupSectionsByCourse(
  sections: NormalizedCourse[]
): Map<string, NormalizedCourse[]> {
  const grouped = new Map<string, NormalizedCourse[]>();
  
  for (const section of sections) {
    const existing = grouped.get(section.subjectCourse) || [];
    existing.push(section);
    grouped.set(section.subjectCourse, existing);
  }
  
  return grouped;
}

/**
 * Check if section has preferred professor
 */
export function hasPreferredProfessor(
  section: NormalizedCourse,
  preferredProfessors?: string[]
): boolean {
  if (!preferredProfessors || preferredProfessors.length === 0) return false;
  
  return section.faculty.some(prof =>
    preferredProfessors.some(preferred =>
      prof.bannerId === preferred || prof.displayName.includes(preferred)
    )
  );
}
