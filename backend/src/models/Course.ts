/**
 * TypeScript interfaces for Banner/Ellucian course data
 */

// Raw Banner JSON structure
export interface BannerCourse {
  id: number;
  term: string;
  termDesc: string;
  courseReferenceNumber: string;
  partOfTerm: string;
  courseNumber: string;
  subject: string;
  subjectDescription: string;
  sequenceNumber: string;
  campusDescription: string;
  scheduleTypeDescription: string;
  courseTitle: string;
  creditHours: number | null;
  maximumEnrollment: number;
  enrollment: number;
  seatsAvailable: number;
  waitCapacity: number;
  waitCount: number;
  waitAvailable: number;
  crossList: string | null;
  crossListCapacity: number | null;
  crossListCount: number | null;
  crossListAvailable: number | null;
  creditHourHigh: number | null;
  creditHourLow: number;
  creditHourIndicator: string | null;
  openSection: boolean;
  linkIdentifier: string | null;
  isSectionLinked: boolean;
  subjectCourse: string;
  faculty: BannerFaculty[];
  meetingsFaculty: BannerMeetingsFaculty[];
  reservedSeatSummary: unknown;
  sectionAttributes: unknown;
}

export interface BannerFaculty {
  bannerId: string;
  category: string | null;
  class: string;
  courseReferenceNumber: string;
  displayName: string;
  emailAddress: string;
  primaryIndicator: boolean;
  term: string;
}

export interface BannerMeetingsFaculty {
  category: string;
  class: string;
  courseReferenceNumber: string;
  faculty: unknown[];
  meetingTime: BannerMeetingTime;
  term: string;
}

export interface BannerMeetingTime {
  beginTime: string;
  building: string;
  buildingDescription: string;
  campus: string;
  campusDescription: string;
  category: string;
  class: string;
  courseReferenceNumber: string;
  creditHourSession: number;
  endDate: string;
  endTime: string;
  friday: boolean;
  hoursWeek: number;
  meetingScheduleType: string;
  meetingType: string;
  meetingTypeDescription: string;
  monday: boolean;
  room: string;
  saturday: boolean;
  startDate: string;
  sunday: boolean;
  term: string;
  thursday: boolean;
  tuesday: boolean;
  wednesday: boolean;
}

export interface BannerResponse {
  success: boolean;
  totalCount: number;
  data: BannerCourse[];
}

// Normalized structure for frontend API
export interface NormalizedCourse {
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
  cycle?: 1 | 2; // For 8-week courses: Ciclo 1 or Ciclo 2
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

// Helper type for time intervals (used in conflict detection)
export interface TimeInterval {
  day: string;
  beginTime: string;
  endTime: string;
  building: string;
  room: string;
}
