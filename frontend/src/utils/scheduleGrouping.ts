import { Schedule } from '../types/schedule';
import { Course } from '../types/course';

/**
 * Represents a grouped schedule where multiple sections can exist for the same course slot
 */
export interface GroupedSchedule {
  id: string;
  sections: GroupedCourseSlot[];
  score: number;
  metadata: Schedule['metadata'];
  originalScheduleIds: string[];
}

/**
 * A course slot that may have multiple equivalent sections
 */
export interface GroupedCourseSlot {
  subjectCourse: string;
  sections: Course[];
  // The "representative" section used for display
  displaySection: Course;
}

/**
 * Creates a unique key for a schedule based on meeting times, ignoring section numbers
 */
function getSchedulePattern(schedule: Schedule): string {
  const patterns: string[] = [];
  
  // Sort sections by subjectCourse for consistent ordering
  const sortedSections = [...schedule.sections].sort((a, b) => 
    a.subjectCourse.localeCompare(b.subjectCourse)
  );
  
  sortedSections.forEach((section) => {
    // For each course, create a pattern of its meeting times
    // NOTE: We ignore building/room because different sections can have different rooms
    // but the same time slots, and we want to group those
    const coursePattern: string[] = [];
    
    section.meetingTimes.forEach((meeting) => {
      // Sort days for consistency
      const days = [...meeting.days].sort().join(',');
      coursePattern.push(
        `${section.subjectCourse}:${days}:${meeting.beginTime}-${meeting.endTime}`
      );
    });
    
    patterns.push(coursePattern.sort().join('|'));
  });
  
  return patterns.join('||');
}

/**
 * Groups schedules that are identical except for section numbers
 */
export function groupEquivalentSchedules(schedules: Schedule[]): GroupedSchedule[] {
  // Map from schedule pattern to list of schedules with that pattern
  const patternMap = new Map<string, Schedule[]>();
  
  schedules.forEach((schedule) => {
    const pattern = getSchedulePattern(schedule);
    if (!patternMap.has(pattern)) {
      patternMap.set(pattern, []);
    }
    patternMap.get(pattern)!.push(schedule);
  });
  
  // Convert grouped schedules to GroupedSchedule format
  const groupedSchedules: GroupedSchedule[] = [];
  
  patternMap.forEach((schedulesGroup) => {
    // Take the first schedule as the base
    const baseSchedule = schedulesGroup[0];
    
    // Group sections by subjectCourse
    const courseMap = new Map<string, Course[]>();
    
    schedulesGroup.forEach((schedule) => {
      schedule.sections.forEach((section) => {
        if (!courseMap.has(section.subjectCourse)) {
          courseMap.set(section.subjectCourse, []);
        }
        // Add this section if it's not already in the list
        const existingSections = courseMap.get(section.subjectCourse)!;
        if (!existingSections.some(s => s.courseReferenceNumber === section.courseReferenceNumber)) {
          existingSections.push(section);
        }
      });
    });
    
    // Build grouped course slots
    const groupedSlots: GroupedCourseSlot[] = [];
    
    baseSchedule.sections.forEach((baseSection) => {
      const allSections = courseMap.get(baseSection.subjectCourse) || [baseSection];
      
      // Sort sections by section number
      allSections.sort((a, b) => {
        const sectionA = parseInt(a.section) || 0;
        const sectionB = parseInt(b.section) || 0;
        return sectionA - sectionB;
      });
      
      groupedSlots.push({
        subjectCourse: baseSection.subjectCourse,
        sections: allSections,
        displaySection: allSections[0] // Use first section as display
      });
    });
    
    groupedSchedules.push({
      id: baseSchedule.id,
      sections: groupedSlots,
      score: baseSchedule.score,
      metadata: baseSchedule.metadata,
      originalScheduleIds: schedulesGroup.map(s => s.id)
    });
  });
  
  return groupedSchedules;
}

/**
 * Gets all unique sections across all grouped schedules for a specific course
 */
export function getAvailableSections(
  groupedSchedules: GroupedSchedule[],
  subjectCourse: string
): Course[] {
  const allSections: Course[] = [];
  
  groupedSchedules.forEach((schedule) => {
    const slot = schedule.sections.find(s => s.subjectCourse === subjectCourse);
    if (slot) {
      slot.sections.forEach((section) => {
        if (!allSections.some(s => s.courseReferenceNumber === section.courseReferenceNumber)) {
          allSections.push(section);
        }
      });
    }
  });
  
  return allSections;
}
