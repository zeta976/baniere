/**
 * Frontend TypeScript types (matching backend models)
 */

export interface Course {
  id: number;
  term: string;
  courseReferenceNumber: string;
  subjectCourse: string;
  courseTitle: string;
  subject: string;
  courseNumber: string;
  section: string;
  creditHours: number;
  maximumEnrollment: number;
  enrollment: number;
  seatsAvailable: number;
  openSection: boolean;
  scheduleType: string;
  waitAvailable: number;
  faculty: Faculty[];
  meetingTimes: MeetingTime[];
  crossList?: string;
  cycle?: 1 | 2; // For 8-week courses
}

export interface Faculty {
  bannerId: string;
  displayName: string;
  email: string;
  isPrimary: boolean;
}

export interface MeetingTime {
  beginTime: string;
  endTime: string;
  days: string[];
  building: string;
  buildingDescription: string;
  room: string;
  startDate: string;
  endDate: string;
}

export interface CourseSearchResult {
  subjectCourse: string;
  courseTitle: string;
  subject: string;
  courseNumber: string;
  creditHours: number;
  sectionCount: number;
  openSections: number;
  sections: Course[];
}
