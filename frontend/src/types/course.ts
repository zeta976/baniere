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

// Raw "oferta de cursos" API structures (fetched directly from the browser)
export interface ApiSchedule {
  time_ini: string | null;
  time_fin: string | null;
  classroom: string | null;
  l: string | null;
  m: string | null;
  i: string | null;
  j: string | null;
  v: string | null;
  s: string | null;
  d: string | null;
  date_ini: string | null;
  date_fin: string | null;
  building: string | null;
  patron: string | null;
}

export interface ApiInstructor {
  name: string;
  ind: string | null;
}

export interface ApiCourse {
  rn: string;
  llave: string;
  nrc: string;
  class: string;
  course: string;
  section: string;
  credits: string;
  title: string;
  maxenrol: string;
  enrolled: string;
  term: string;
  ptrm: string;
  ptrmdesc: string;
  seatsavail: string;
  campus: string;
  projenrl: string;
  schedules: ApiSchedule[];
  instructors: ApiInstructor[];
  levele: string | null;
  comments: string | null;
  attr: unknown[];
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
