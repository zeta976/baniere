/**
 * Banner JSON to Normalized Format Converter
 * Implements normalization rules from instructions.md
 */

import he from 'he';
import {
  BannerCourse,
  BannerMeetingTime,
  NormalizedCourse,
  Faculty,
  MeetingTime
} from '../models/Course';
import { convertDateFormat } from '../utils/timeUtils';

/**
 * Extract days from Banner meetingTime boolean flags
 */
function extractDays(meetingTime: BannerMeetingTime): string[] {
  const days: string[] = [];
  
  if (meetingTime.monday) days.push('monday');
  if (meetingTime.tuesday) days.push('tuesday');
  if (meetingTime.wednesday) days.push('wednesday');
  if (meetingTime.thursday) days.push('thursday');
  if (meetingTime.friday) days.push('friday');
  if (meetingTime.saturday) days.push('saturday');
  if (meetingTime.sunday) days.push('sunday');
  
  return days;
}

/**
 * Extract cycle information from course title
 * Returns 1 for "Ciclo 1 de 8 semanas", 2 for "Ciclo 2 de 8 semanas", undefined otherwise
 */
function extractCycle(courseTitle: string): 1 | 2 | undefined {
  if (courseTitle.includes('Ciclo 1 de 8 semanas')) {
    return 1;
  }
  if (courseTitle.includes('Ciclo 2 de 8 semanas')) {
    return 2;
  }
  return undefined;
}

/**
 * Normalize Banner faculty to simplified structure
 */
function normalizeFaculty(bannerCourse: BannerCourse): Faculty[] {
  return bannerCourse.faculty.map(faculty => ({
    bannerId: faculty.bannerId,
    displayName: faculty.displayName,
    email: faculty.emailAddress,
    isPrimary: faculty.primaryIndicator
  }));
}

/**
 * Normalize Banner meetingsFaculty to meetingTimes array
 */
function normalizeMeetingTimes(bannerCourse: BannerCourse): MeetingTime[] {
  const meetingTimes: MeetingTime[] = [];
  
  for (const meetingFaculty of bannerCourse.meetingsFaculty) {
    const mt = meetingFaculty.meetingTime;
    
    // Check if this is TBA/Online (no days or invalid times)
    const days = extractDays(mt);
    
    // Skip if no meeting times (TBA/Online will be handled separately)
    if (days.length === 0 && (!mt.beginTime || !mt.endTime)) {
      continue;
    }
    
    meetingTimes.push({
      beginTime: mt.beginTime || 'TBA',
      endTime: mt.endTime || 'TBA',
      days: days,
      building: mt.building || '',
      buildingDescription: he.decode(mt.buildingDescription || ''),
      room: mt.room || '',
      startDate: mt.startDate ? convertDateFormat(mt.startDate) : '',
      endDate: mt.endDate ? convertDateFormat(mt.endDate) : ''
    });
  }
  
  return meetingTimes;
}

/**
 * Main normalization function
 * Converts Banner course to normalized format
 */
export function normalizeCourse(bannerCourse: BannerCourse): NormalizedCourse {
  const creditHours = bannerCourse.creditHours ?? bannerCourse.creditHourLow;
  const faculty = normalizeFaculty(bannerCourse);
  const meetingTimes = normalizeMeetingTimes(bannerCourse);
  const cycle = extractCycle(bannerCourse.courseTitle);
  
  const normalized: NormalizedCourse = {
    id: bannerCourse.id,
    term: bannerCourse.term,
    courseReferenceNumber: bannerCourse.courseReferenceNumber,
    subjectCourse: bannerCourse.subjectCourse,
    courseTitle: bannerCourse.courseTitle,
    subject: bannerCourse.subject,
    courseNumber: bannerCourse.courseNumber,
    section: bannerCourse.sequenceNumber,
    creditHours: creditHours,
    maximumEnrollment: bannerCourse.maximumEnrollment,
    enrollment: bannerCourse.enrollment,
    seatsAvailable: bannerCourse.seatsAvailable,
    openSection: bannerCourse.openSection,
    scheduleType: bannerCourse.scheduleTypeDescription,
    waitAvailable: bannerCourse.waitAvailable,
    faculty: faculty.length > 0 ? faculty : [{
      bannerId: '',
      displayName: 'Por Asignar',
      email: '',
      isPrimary: true
    }],
    meetingTimes: meetingTimes
  };
  
  // Add cross-list if exists
  if (bannerCourse.crossList) {
    normalized.crossList = bannerCourse.crossList;
  }
  
  // Add cycle if exists
  if (cycle) {
    normalized.cycle = cycle;
  }
  
  return normalized;
}

/**
 * Normalize array of Banner courses
 */
export function normalizeCourses(bannerCourses: BannerCourse[]): NormalizedCourse[] {
  return bannerCourses.map(normalizeCourse);
}

/**
 * Validate Banner course data
 */
export function validateBannerCourse(course: BannerCourse): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required fields
  if (!course.id) errors.push('Missing id');
  if (!course.courseReferenceNumber) errors.push('Missing courseReferenceNumber');
  if (!course.subjectCourse) errors.push('Missing subjectCourse');
  if (!course.courseTitle) errors.push('Missing courseTitle');
  
  // Validate enrollment numbers
  if (course.maximumEnrollment < 0) errors.push('Invalid maximumEnrollment');
  if (course.enrollment < 0) errors.push('Invalid enrollment');
  if (course.seatsAvailable < 0) errors.push('Invalid seatsAvailable');
  
  // Validate meeting times
  for (const meetingFaculty of course.meetingsFaculty || []) {
    const mt = meetingFaculty.meetingTime;
    if (mt && mt.beginTime && mt.endTime) {
      if (mt.beginTime >= mt.endTime) {
        errors.push(`Invalid time range: ${mt.beginTime} - ${mt.endTime}`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
