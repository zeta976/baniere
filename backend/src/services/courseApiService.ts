/**
 * Live course data source.
 *
 * Fetches from the Universidad de los Andes "oferta de cursos" API
 * (https://ofertadecursos.uniandes.edu.co/api/courses) and adapts the compact
 * API payload into the Banner/Ellucian `BannerCourse` shape that the rest of
 * the backend (normalizer, filterEngine, generator) already understands.
 *
 * - `loadCourses()` returns the full catalog (cached with a TTL) for search/listing.
 * - `fetchCourseSections()` fetches the exact requested courses fresh from the API
 *   on every call, giving truly real-time seat availability during generation.
 * - Both fall back to the bundled `courses.json` if the API is unreachable.
 */

import fs from 'fs/promises';
import {
  ApiCourse,
  ApiInstructor,
  ApiSchedule,
  BannerCourse,
  BannerFaculty,
  BannerMeetingsFaculty,
  BannerMeetingTime,
  BannerResponse
} from '../models/Course';
import { config } from '../config';

/** Maps the API's Spanish single-letter day flags to Banner boolean day fields. */
const DAY_FLAGS: Array<[keyof ApiSchedule, keyof BannerMeetingTime]> = [
  ['l', 'monday'],
  ['m', 'tuesday'],
  ['i', 'wednesday'],
  ['j', 'thursday'],
  ['v', 'friday'],
  ['s', 'saturday'],
  ['d', 'sunday']
];

const EMPTY_ROOM = '- -';

/**
 * Convert the API date "YYYY-MM-DD HH:mm:ss" to Banner's "DD/MM/YYYY".
 * The normalizer expects DD/MM/YYYY and converts it back to ISO downstream.
 */
function toBannerDate(apiDate: string | null): string {
  if (!apiDate) return '';
  const datePart = apiDate.split(' ')[0]; // "2026-08-03"
  const parts = datePart.split('-');
  if (parts.length !== 3) return '';
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

function toInt(value: string | null | undefined): number {
  const n = parseInt(value ?? '', 10);
  return Number.isFinite(n) ? n : 0;
}

/**
 * A section can have paper seats but still be effectively unavailable when the
 * registrar flags it ("cupo cero", "no se abre", "sección cerrada", etc.).
 */
function isFlaggedClosed(comments: string | null): boolean {
  if (!comments) return false;
  const c = comments.toLowerCase();
  return (
    c.includes('cupo cero') ||
    c.includes('no se abre') ||
    c.includes('no hacer planes') ||
    c.includes('seccion cerrada') ||
    c.includes('sección cerrada')
  );
}

function transformSchedule(schedule: ApiSchedule, apiCourse: ApiCourse): BannerMeetingsFaculty {
  const room = schedule.classroom && schedule.classroom !== EMPTY_ROOM ? schedule.classroom : '';
  const building = schedule.building && schedule.building !== EMPTY_ROOM ? schedule.building : '';

  const meetingTime: BannerMeetingTime = {
    beginTime: schedule.time_ini || '',
    building,
    buildingDescription: building,
    campus: '',
    campusDescription: apiCourse.campus || '',
    category: '01',
    class: 'net.hedtech.banner.general.overall.MeetingTimeDecorator',
    courseReferenceNumber: apiCourse.nrc,
    creditHourSession: 0,
    endDate: toBannerDate(schedule.date_fin),
    endTime: schedule.time_fin || '',
    friday: false,
    hoursWeek: 0,
    meetingScheduleType: '',
    meetingType: 'CLAS',
    meetingTypeDescription: 'Class',
    monday: false,
    room,
    saturday: false,
    startDate: toBannerDate(schedule.date_ini),
    sunday: false,
    term: apiCourse.term,
    thursday: false,
    tuesday: false,
    wednesday: false
  };

  // Set day booleans from the API's letter flags (e.g. "M" => tuesday: true)
  for (const [flag, dayField] of DAY_FLAGS) {
    if (schedule[flag]) {
      (meetingTime[dayField] as boolean) = true;
    }
  }

  return {
    category: '01',
    class: 'net.hedtech.banner.student.schedule.SectionSessionDecorator',
    courseReferenceNumber: apiCourse.nrc,
    faculty: [],
    meetingTime,
    term: apiCourse.term
  };
}

function transformFaculty(instructor: ApiInstructor, apiCourse: ApiCourse): BannerFaculty {
  return {
    bannerId: '',
    category: null,
    class: 'net.hedtech.banner.student.faculty.FacultyResultDecorator',
    courseReferenceNumber: apiCourse.nrc,
    displayName: (instructor.name || '').trim(),
    emailAddress: '',
    primaryIndicator: instructor.ind === 'Y',
    term: apiCourse.term
  };
}

/**
 * Detect 8-week cycle from the part-of-term description so the normalizer's
 * `extractCycle` (which keys off '8A'/'8B') keeps working.
 */
function derivePartOfTerm(apiCourse: ApiCourse): string {
  const desc = (apiCourse.ptrmdesc || '').toLowerCase();
  if (desc.includes('8') && desc.includes('semanas')) {
    if (desc.includes('ciclo 1') || desc.includes('cico 1')) return '8A';
    if (desc.includes('ciclo 2')) return '8B';
  }
  return apiCourse.ptrm || '1';
}

/** Adapt a single API course into the Banner shape used throughout the backend. */
export function transformApiCourse(apiCourse: ApiCourse): BannerCourse {
  const credits = toInt(apiCourse.credits);
  const seatsAvailable = toInt(apiCourse.seatsavail);
  const openSection = seatsAvailable > 0 && !isFlaggedClosed(apiCourse.comments);
  const subjectCourse = `${apiCourse.class}${apiCourse.course}`.toUpperCase();

  return {
    id: Number(apiCourse.llave) || toInt(apiCourse.nrc),
    term: apiCourse.term,
    termDesc: apiCourse.ptrmdesc || '',
    courseReferenceNumber: apiCourse.nrc,
    partOfTerm: derivePartOfTerm(apiCourse),
    courseNumber: apiCourse.course,
    subject: apiCourse.class,
    subjectDescription: apiCourse.class,
    sequenceNumber: apiCourse.section,
    campusDescription: apiCourse.campus || '',
    scheduleTypeDescription: '',
    courseTitle: apiCourse.title || '',
    creditHours: credits,
    maximumEnrollment: toInt(apiCourse.maxenrol),
    enrollment: toInt(apiCourse.enrolled),
    seatsAvailable,
    waitCapacity: 0,
    waitCount: 0,
    waitAvailable: 0,
    crossList: null,
    crossListCapacity: null,
    crossListCount: null,
    crossListAvailable: null,
    creditHourHigh: null,
    creditHourLow: credits,
    creditHourIndicator: null,
    openSection,
    linkIdentifier: null,
    isSectionLinked: false,
    subjectCourse,
    faculty: apiCourse.instructors.map(i => transformFaculty(i, apiCourse)),
    meetingsFaculty: apiCourse.schedules.map(s => transformSchedule(s, apiCourse)),
    reservedSeatSummary: null,
    sectionAttributes: null
  };
}

/** Build a request URL for the oferta de cursos API. */
function buildUrl(params: Record<string, string>): string {
  const query: Record<string, string> = {
    term: config.term,
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
  return `${config.courseApiUrl}?${search}`;
}

async function fetchApi(params: Record<string, string>): Promise<ApiCourse[]> {
  const url = buildUrl(params);
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`Course API responded with ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error('Unexpected course API response (expected an array)');
  }
  return data as ApiCourse[];
}

const PAGE_LIMIT = 2000;
const MAX_PAGES = 50;

/** Fetch the entire catalog for the configured term, paging through the API. */
async function fetchAllApiCourses(): Promise<ApiCourse[]> {
  const seen = new Set<string>();
  const all: ApiCourse[] = [];
  let offset = 0;

  for (let page = 0; page < MAX_PAGES; page++) {
    const batch = await fetchApi({ offset: String(offset), limit: String(PAGE_LIMIT) });
    if (batch.length === 0) break;

    let added = 0;
    for (const course of batch) {
      if (!seen.has(course.llave)) {
        seen.add(course.llave);
        all.push(course);
        added++;
      }
    }

    // Stop when the last page is short, or the API ignored `offset` (no new rows).
    if (batch.length < PAGE_LIMIT || added === 0) break;
    offset += PAGE_LIMIT;
  }

  return all;
}

// ---- Full catalog cache (used by search/listing) --------------------------

let cache: BannerResponse | null = null;
let cacheTimestamp = 0;

async function loadFromLocalFile(): Promise<BannerResponse> {
  const data = await fs.readFile(config.coursesJsonPath, 'utf-8');
  return JSON.parse(data) as BannerResponse;
}

/**
 * Return the full course catalog as a BannerResponse.
 * Uses the live API (cached for `coursesCacheTtlMs`) and falls back to the
 * bundled JSON file if the API is disabled or unreachable.
 */
export async function loadCourses(): Promise<BannerResponse> {
  if (!config.useLiveApi) {
    return loadFromLocalFile();
  }

  const now = Date.now();
  if (cache && now - cacheTimestamp < config.coursesCacheTtlMs) {
    return cache;
  }

  try {
    const apiCourses = await fetchAllApiCourses();
    const data = apiCourses.map(transformApiCourse);
    cache = { success: true, totalCount: data.length, data };
    cacheTimestamp = now;
    console.log(`✅ Loaded ${data.length} courses from live API (term ${config.term})`);
    return cache;
  } catch (error) {
    console.error('⚠️  Live course API fetch failed, falling back:', error);
    if (cache) return cache; // serve stale cache if we have it
    return loadFromLocalFile();
  }
}

// ---- Live per-course fetch (used by schedule generation) ------------------

/** Split "ISIS1226" into subject prefix ("ISIS") and number ("1226"). */
function splitCourseCode(code: string): { prefix: string; number: string } {
  const match = code.toUpperCase().match(/^([A-Z]+)(.*)$/);
  if (!match) return { prefix: code.toUpperCase(), number: '' };
  return { prefix: match[1], number: match[2] };
}

async function fetchOneCourse(code: string): Promise<BannerCourse[]> {
  const upper = code.toUpperCase();
  const { prefix, number } = splitCourseCode(upper);
  const nameInput = number ? `${prefix}-${number}` : '';

  const apiCourses = await fetchApi({ prefix, nameInput, limit: '500' });
  // The API matches by prefix; keep only exact subjectCourse matches.
  return apiCourses
    .filter(c => `${c.class}${c.course}`.toUpperCase() === upper)
    .map(transformApiCourse);
}

/**
 * Fetch the requested course codes fresh from the live API (real-time seats).
 * Falls back to the cached/local catalog for any code that fails to load live.
 */
export async function fetchCourseSections(codes: string[]): Promise<BannerCourse[]> {
  if (!config.useLiveApi) {
    const all = await loadCourses();
    const wanted = new Set(codes.map(c => c.toUpperCase()));
    return all.data.filter(c => wanted.has(c.subjectCourse.toUpperCase()));
  }

  const results = await Promise.all(
    codes.map(async code => {
      try {
        return await fetchOneCourse(code);
      } catch (error) {
        console.error(`⚠️  Live fetch failed for ${code}, using cached catalog:`, error);
        const all = await loadCourses();
        return all.data.filter(c => c.subjectCourse.toUpperCase() === code.toUpperCase());
      }
    })
  );

  return results.flat();
}
