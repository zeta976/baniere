/**
 * Direct client for the Universidad de los Andes "oferta de cursos" API.
 *
 * The API (https://ofertadecursos.uniandes.edu.co/api/courses) is only
 * reachable from Colombian IPs and is CORS-enabled (`access-control-allow-origin: *`),
 * so we call it straight from the student's browser. This gives real-time seat
 * availability without depending on the backend host being able to reach it.
 *
 * Requests are kept "simple" (GET, only safelisted headers) to avoid CORS
 * preflight, since the API only allows `Content-Type, X-Auth-Token, Origin`.
 */

import { ApiCourse, ApiSchedule, Course, CourseSearchResult, MeetingTime } from '../types/course';

const API_URL =
  import.meta.env.VITE_COURSE_API_URL || 'https://ofertadecursos.uniandes.edu.co/api/courses';
const TERM = import.meta.env.VITE_TERM || '202620';

const EMPTY_ROOM = '- -';

/** Spanish day-flag (l/m/i/j/v/s/d) -> English day name used across the app. */
const DAY_FLAGS: Array<[keyof ApiSchedule, string]> = [
  ['l', 'monday'],
  ['m', 'tuesday'],
  ['i', 'wednesday'],
  ['j', 'thursday'],
  ['v', 'friday'],
  ['s', 'saturday'],
  ['d', 'sunday']
];

function toInt(value: string | null | undefined): number {
  const n = parseInt(value ?? '', 10);
  return Number.isFinite(n) ? n : 0;
}

/** "2026-08-03 00:00:00" -> "2026-08-03" */
function toIsoDate(value: string | null): string {
  if (!value) return '';
  return value.split(' ')[0];
}

/** Strip accents for accent-insensitive search. */
function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * A section can have paper seats but be flagged unavailable ("cupo cero",
 * "no se abre", "sección cerrada", ...). Treat those as closed.
 */
function isFlaggedClosed(comments: string | null): boolean {
  if (!comments) return false;
  const c = normalizeText(comments);
  return (
    c.includes('cupo cero') ||
    c.includes('no se abre') ||
    c.includes('no hacer planes') ||
    c.includes('seccion cerrada')
  );
}

function cycleFromPtrm(apiCourse: ApiCourse): 1 | 2 | undefined {
  const desc = normalizeText(apiCourse.ptrmdesc || '');
  if (desc.includes('8') && desc.includes('semanas')) {
    if (desc.includes('ciclo 1')) return 1;
    if (desc.includes('ciclo 2')) return 2;
  }
  return undefined;
}

/** Transform a raw API course into the app's normalized `Course` shape. */
export function apiToCourse(apiCourse: ApiCourse): Course {
  const credits = toInt(apiCourse.credits);
  const seatsAvailable = toInt(apiCourse.seatsavail);

  const meetingTimes: MeetingTime[] = apiCourse.schedules
    .map((s): MeetingTime => {
      const days = DAY_FLAGS.filter(([flag]) => s[flag]).map(([, day]) => day);
      return {
        beginTime: s.time_ini || 'TBA',
        endTime: s.time_fin || 'TBA',
        days,
        building: s.building && s.building !== EMPTY_ROOM ? s.building : '',
        buildingDescription: '',
        room: s.classroom && s.classroom !== EMPTY_ROOM ? s.classroom : '',
        startDate: toIsoDate(s.date_ini),
        endDate: toIsoDate(s.date_fin)
      };
    })
    .filter(mt => mt.days.length > 0 || (mt.beginTime !== 'TBA' && mt.endTime !== 'TBA'));

  const faculty =
    apiCourse.instructors.length > 0
      ? apiCourse.instructors.map(i => ({
          bannerId: '',
          displayName: (i.name || '').trim(),
          email: '',
          isPrimary: i.ind === 'Y'
        }))
      : [{ bannerId: '', displayName: 'Por Asignar', email: '', isPrimary: true }];

  const course: Course = {
    id: Number(apiCourse.llave) || toInt(apiCourse.nrc),
    term: apiCourse.term,
    courseReferenceNumber: apiCourse.nrc,
    subjectCourse: `${apiCourse.class}${apiCourse.course}`.toUpperCase(),
    courseTitle: (apiCourse.title || '').trim(),
    subject: apiCourse.class,
    courseNumber: apiCourse.course,
    section: apiCourse.section,
    creditHours: credits,
    maximumEnrollment: toInt(apiCourse.maxenrol),
    enrollment: toInt(apiCourse.enrolled),
    seatsAvailable,
    openSection: seatsAvailable > 0 && !isFlaggedClosed(apiCourse.comments),
    scheduleType: '',
    waitAvailable: 0,
    faculty,
    meetingTimes
  };

  const cycle = cycleFromPtrm(apiCourse);
  if (cycle) course.cycle = cycle;

  return course;
}

function buildUrl(params: Record<string, string>): string {
  const query: Record<string, string> = {
    term: TERM,
    ptrm: '',
    prefix: '',
    attr: '',
    nameInput: '',
    campus: '',
    attrs: '',
    timeStart: '',
    offset: '0',
    limit: '100',
    courseQuotas: '',
    days: '',
    courseRestrictions: '',
    programNew: '',
    profesorName: '',
    ...params
  };
  const search = Object.entries(query)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return `${API_URL}?${search}`;
}

async function fetchApiCourses(params: Record<string, string>): Promise<ApiCourse[]> {
  // Plain GET, no custom headers -> CORS "simple request", no preflight.
  const res = await fetch(buildUrl(params));
  if (!res.ok) {
    throw new Error(`Uniandes API responded with ${res.status}`);
  }
  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error('Unexpected Uniandes API response (expected an array)');
  }
  return data as ApiCourse[];
}

// ---- Full catalog (cached in-module for search/listing) -------------------

const PAGE_LIMIT = 2000;
const MAX_PAGES = 50;
const CATALOG_TTL_MS = 10 * 60 * 1000;

let catalogCache: ApiCourse[] | null = null;
let catalogTimestamp = 0;
let catalogPromise: Promise<ApiCourse[]> | null = null;

async function fetchFullCatalog(): Promise<ApiCourse[]> {
  const seen = new Set<string>();
  const all: ApiCourse[] = [];
  let offset = 0;

  for (let page = 0; page < MAX_PAGES; page++) {
    const batch = await fetchApiCourses({ offset: String(offset), limit: String(PAGE_LIMIT) });
    if (batch.length === 0) break;

    let added = 0;
    for (const course of batch) {
      if (!seen.has(course.llave)) {
        seen.add(course.llave);
        all.push(course);
        added++;
      }
    }

    if (batch.length < PAGE_LIMIT || added === 0) break;
    offset += PAGE_LIMIT;
  }

  return all;
}

async function getCatalog(): Promise<ApiCourse[]> {
  const now = Date.now();
  if (catalogCache && now - catalogTimestamp < CATALOG_TTL_MS) {
    return catalogCache;
  }
  // De-duplicate concurrent catalog fetches.
  if (!catalogPromise) {
    catalogPromise = fetchFullCatalog()
      .then(catalog => {
        catalogCache = catalog;
        catalogTimestamp = Date.now();
        return catalog;
      })
      .finally(() => {
        catalogPromise = null;
      });
  }
  return catalogPromise;
}

// ---- Public API (mirrors the previous backend-backed coursesApi) ----------

/** Search the catalog by course code or title, grouped by course. */
export async function searchCourses(query: string): Promise<CourseSearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const catalog = await getCatalog();
  const qUpper = q.toUpperCase();
  const qNorm = normalizeText(q);

  const matches = catalog.filter(c => {
    const code = `${c.class}${c.course}`.toUpperCase();
    return code.includes(qUpper) || normalizeText(c.title || '').includes(qNorm);
  });

  // Group by subjectCourse
  const grouped = new Map<string, ApiCourse[]>();
  for (const c of matches) {
    const code = `${c.class}${c.course}`.toUpperCase();
    const list = grouped.get(code) || [];
    list.push(c);
    grouped.set(code, list);
  }

  return Array.from(grouped.entries())
    .map(([code, apiSections]) => {
      const sections = apiSections.map(apiToCourse);
      return {
        subjectCourse: code,
        courseTitle: sections[0].courseTitle,
        subject: sections[0].subject,
        courseNumber: sections[0].courseNumber,
        creditHours: sections[0].creditHours,
        sectionCount: sections.length,
        openSections: sections.filter(s => s.openSection).length,
        sections: sections.slice(0, 5)
      };
    })
    .sort((a, b) => a.subjectCourse.localeCompare(b.subjectCourse));
}

/** Split "ISIS1226" into { prefix: "ISIS", number: "1226" }. */
function splitCourseCode(code: string): { prefix: string; number: string } {
  const match = code.toUpperCase().match(/^([A-Z]+)(.*)$/);
  if (!match) return { prefix: code.toUpperCase(), number: '' };
  return { prefix: match[1], number: match[2] };
}

/** Fetch the raw API sections for a single course code (real-time). */
export async function fetchRawSectionsForCode(code: string): Promise<ApiCourse[]> {
  const upper = code.toUpperCase();
  const { prefix, number } = splitCourseCode(upper);
  const nameInput = number ? `${prefix}-${number}` : '';
  const apiCourses = await fetchApiCourses({ prefix, nameInput, limit: '500' });
  return apiCourses.filter(c => `${c.class}${c.course}`.toUpperCase() === upper);
}

/** Fetch raw sections for several course codes (used to POST to the generator). */
export async function fetchRawSections(codes: string[]): Promise<ApiCourse[]> {
  const results = await Promise.all(codes.map(fetchRawSectionsForCode));
  return results.flat();
}

/** Get normalized sections for a course code. */
export async function getSections(code: string): Promise<Course[]> {
  const raw = await fetchRawSectionsForCode(code);
  return raw.map(apiToCourse);
}

/** Get all courses (optionally filtered), normalized. */
export async function getAllCourses(filters?: {
  subject?: string;
  openOnly?: boolean;
}): Promise<Course[]> {
  const catalog = await getCatalog();
  let courses = catalog.map(apiToCourse);
  if (filters?.subject) {
    courses = courses.filter(c => c.subject === filters.subject);
  }
  if (filters?.openOnly) {
    courses = courses.filter(c => c.openSection);
  }
  return courses;
}

/** Unique subject prefixes present in the catalog. */
export async function getSubjects(): Promise<string[]> {
  const catalog = await getCatalog();
  return Array.from(new Set(catalog.map(c => c.class))).sort();
}
