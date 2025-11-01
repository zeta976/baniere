# Developer Instructions — University Schedule Builder (product UI in Spanish)

**Language:** English (app UI and copy: Spanish)

---

## Objective
Build a lightweight web tool that lets university students enter course codes/names and filters (max latest hour, preferred days off, required/forbidden sections or professors, etc.) and generates **all** feasible schedules that satisfy the constraints. The tool should show those schedules visually (weekly grid + compact list), allow quick comparison and ranking, and let the user export or save the selected schedule.

The final product will be used by students at a Spanish-speaking university — all UX copy must be Spanish.

---

## High level user stories
- As a student, I can paste or type course codes/names and see matching sections.
- As a student, I can add filters: latest end time, days off (e.g., viernes libre), required professor/section, avoid overlapping labs, min/max credits, only open sections, etc.
- As a student, I can generate all possible conflict-free schedules that meet my filters.
- As a student, I can preview each schedule in a weekly grid and in a compact list, compare multiple schedules, bookmark/save them, and export to iCal/CSV.
- As an admin, I can import or refresh the course JSON feed and validate data.

---

## Simple recommended tech stack (keep it simple)
- Frontend: **React** + **TypeScript** (Create React App or Vite) + component library (Tailwind CSS for quick, consistent Spanish UI). Use React Query for data fetching and caching.
- Backend: **Node.js** + **TypeScript** + **Express** (or Fastify) — minimal API layer to normalize the upstream JSON, run schedule generation if heavy, and handle caching / exports.
- Persistence/cache: **Postgres** (if you need saved schedules/users) + **Redis** for caching generated results and the parsed course feed.
- Deployment: Docker + a small cloud provider (e.g., DigitalOcean App Platform, Render, or Heroku) — keep infra minimal.
- Authentication: Not required for MVP
- Dev tooling: GitHub, GitHub Actions (CI), Docker Compose for local dev.

---

## Data contract / input expectations
The upstream JSON feed is the authoritative source (Banner/Ellucian format). The backend should ingest and normalize it into a simpler shape for the frontend.

### Actual Banner JSON Structure (from courses.json):
- Root has: `success`, `totalCount`, `data[]`
- Each course has: `id`, `term`, `courseReferenceNumber`, `subject`, `courseNumber`, `subjectCourse`, `courseTitle`, `creditHourLow`, `maximumEnrollment`, `enrollment`, `seatsAvailable`, `openSection`, `sequenceNumber` (section number), `faculty[]`, `meetingsFaculty[]`
- `faculty[]`: array of instructors with `bannerId`, `displayName`, `emailAddress`, `primaryIndicator`
- `meetingsFaculty[]`: array of session objects, each with `meetingTime` containing `beginTime`, `endTime`, `building`, `buildingDescription`, `room`, `startDate`, `endDate`, and day booleans (`monday`, `tuesday`, etc.)

### Normalized Structure for Frontend API:
```json
{
  "id": 365816,
  "term": "202520",
  "courseReferenceNumber": "39342",
  "subjectCourse": "ADMI1101",
  "courseTitle": "FUNDAMENTOS DE ADMINISTRACION Y GERENCIA (PARA ADMINISTRADORES)",
  "subject": "ADMI",
  "courseNumber": "1101",
  "section": "1",
  "creditHours": 3,
  "maximumEnrollment": 101,
  "enrollment": 97,
  "seatsAvailable": 4,
  "openSection": true,
  "scheduleType": "TEORICA",
  "faculty": [
    {
      "bannerId": "189",
      "displayName": "DURAN AMOROCHO, XAVIER",
      "email": "xh.duran21@uniandes.edu.co",
      "isPrimary": true
    }
  ],
  "meetingTimes": [
    {
      "beginTime": "0800",
      "endTime": "0920",
      "days": ["tuesday", "thursday"],
      "building": "CJ",
      "buildingDescription": "Centro del Japón (CJ)",
      "room": "CJ_001",
      "startDate": "2025-08-04",
      "endDate": "2025-11-29"
    },
    {
      "beginTime": "0800",
      "endTime": "0920",
      "days": ["wednesday"],
      "building": "ML",
      "buildingDescription": "Edif. Mario Laserna (ML)",
      "room": "ML_608",
      "startDate": "2025-08-04",
      "endDate": "2025-11-29"
    }
  ]
}
```

### Normalization Rules:
1. **Convert day booleans to array**: Extract `monday`, `tuesday`, etc. from `meetingTime` and create `days: ["monday", "tuesday"]` array with only true days
2. **Flatten meetingsFaculty**: Convert `meetingsFaculty[].meetingTime` to `meetingTimes[]`
3. **Clean faculty array**: Map `displayName`, `emailAddress` → `displayName`, `email`; `primaryIndicator` → `isPrimary`
4. **Date format**: Convert DD/MM/YYYY to ISO 8601 (YYYY-MM-DD)
5. **Time format**: Keep as 4-digit string "HHMM" for easy parsing
6. **Section number**: Use `sequenceNumber` field as `section`
7. **Handle nulls**: `creditHours` may be null, use `creditHourLow` as fallback

### Edge Cases & Data Validation:
- **TBA/Online courses**: If `meetingTime` is missing or all day booleans are false, mark as "TBA" or "Online"
- **Multiple meeting times**: Sections can have 2+ meeting slots (e.g., different rooms for different days)
- **No faculty**: Some sections may have empty `faculty[]` array (mark as "Por Asignar")
- **Invalid times**: Validate `beginTime < endTime` and both are valid HHMM format
- **Duplicate detection**: Use `courseReferenceNumber` as unique identifier per section
- **Cross-listed courses**: `crossList` field may link multiple course codes (display both codes)
- **Waitlist**: Show `waitAvailable` if `seatsAvailable <= 0` but waitlist is open
## Core features / functional requirements
1. **Course input & discovery**
   - Allow bulk paste of course codes (one per line) OR typed search by name/code.
   - Autocomplete and fuzzy search for course names.
   - Show matching sections with total seats, professors, and meeting times.

2. **Filter UI**
   - Max end time (e.g., no class after 18:00).
   - Desired free days (e.g., lunes libre, viernes libre).
   - Required courses/sections (must include this section(s)).
   - Forbidden sections/professors.
   - Only open sections (seatsAvailable > 0).
   - Prefer compact schedules (minimize idle gaps).
   - Specific filters per day (e.g., end time before 18:00 on Monday).
   - Prefered gap time (e.g., around 12:00).

3. **Schedule generation engine**
   - Input: selected courses (each may have 1..N sections), filters.
   - Output: all feasible non-overlapping combinations of one section per course that meet filters.
   - Support `maxResults` limit and lazy/enumerated generation to avoid combinatorial explosion.
   - Ranking/scoring function to sort schedules by user preference (earliest end, fewest gaps, fewest days on campus, preferred professors, etc.).
   - Provide a reproducible identifier (hash) for each schedule so users can save/share.

4. **Visualization**
   - Weekly grid (Monday–Friday or Monday–Saturday depending on campus) showing blocks with course code, section, room, and professor. Tooltips show full info.
   - Compact list view with start/end times and quick comparison (e.g., three schedules side-by-side).
   - Conflict highlighting (if user forces conflicting sections during manual adjustments).

5. **Export & Save**
   - Export single schedule to **iCalendar (.ics)** and **CSV**.
   - Quick export to Google Calendar (OAuth) — optional.
   - Allow logged users to save named schedules to their account (if auth implemented).

6. **UX niceties**
   - Persist last filters locally (localStorage).
   - Show seatsAvailable in red if low (<=5) and auto-filter option to hide full sections.
   - Keyboard shortcuts (generate, next/prev schedule, export).

7. **Admin & Data**
   - Admin endpoint to re-ingest/update the JSON feed and run data validation.
   - Health checks and a small dashboard showing number of courses, last updated timestamp.

---

## Algorithm design & practical considerations
- **Representation:** Convert each `meetingTime` into per-day time intervals. Since sections can have multiple meeting times, create a flat list of all (day, beginTime, endTime) tuples per section.
  - Example: Section with Tu/Th 08:00-09:20 → `[("tuesday", "0800", "0920"), ("thursday", "0800", "0920")]`
  - Multi-day sessions with different rooms (e.g., Tu/Th in CJ, Wed in ML) → flatten all into individual day-time-location tuples

- **Constraint check:** Two sections conflict when:
  1. They share any weekday AND
  2. Their time ranges overlap: `beginA < endB && beginB < endA`
  3. Compare all meeting time combinations between the two sections

- **Search algorithm:** Backtracking DFS:
  1. Pre-process: Group sections by `subjectCourse` (e.g., all ADMI1101 sections together)
  2. Order courses by number of available sections ascending (smallest-branching-first heuristic)
  3. For each course, try each section:
     - Check conflicts with already-selected sections (all meeting times)
     - Check filters (latest time, free days, professor preferences)
     - If valid, recurse to next course
     - Prune branch immediately on first conflict or filter violation
  4. When all courses assigned, record the schedule with a hash ID

- **Handling TBA/Online sections:**
  - Sections without meeting times never conflict with anything
  - Include in schedule generation but mark clearly in UI

- **Optimizations:**
  - **Pre-filtering**: Remove sections violating hard constraints before search:
    - `openSection == false` (if "only open" filter enabled)
    - Professor not in allowed list / in forbidden list
    - Any meeting time ends after max end time
    - Section meets on forbidden days
  - **Conflict pre-computation**: Build adjacency matrix of conflicting sections for O(1) lookup
  - **Memoization**: Cache partial assignments by sorted section ID tuple to avoid recomputing
  - **Progressive generation**: Yield results as found; stop at `maxResults` (default 500)
  - **Ranking score**: Calculate score = weighted sum of:
    - Latest end time (lower = better)
    - Number of gaps (fewer = better)
    - Number of campus days (fewer = better)
    - Preferred professors count (more = better)
    - Compact schedule (minimize time span = better)
  - **Early termination**: If search space > 100K combinations, warn user and suggest adding filters

---

## Non-functional requirements
- **Performance:** generate results with reasonable latency for common use cases (<= 3s for typical 5-course inputs). Use backend generation for heavy cases.
- **Scalability:** support hundreds of concurrent users with caching; scale generator endpoints if CPU-bound.
- **Accessibility:** keyboard navigable, semantic HTML, alt text for icons.
- **Security & privacy:** do not store personal data unless users opt-in; sanitize inputs; protect admin endpoints; use HTTPS.
- **Internationalization:** UI text in Spanish; codebase should support i18n if later needed.

---

## Testing & QA
- Unit tests for time overlap logic, normalization, and generator pruning.
- Integration tests for API endpoints with representative sample JSON data (use the sample you provided).
- End-to-end tests for main flows (input courses, set filters, generate, export).

---

## Acceptance criteria
- Given a sample JSON feed, the system correctly generates all conflict-free schedules for a 4-course input and returns the top 200 by score.
- Frontend shows weekly grid and compact comparison view; exports .ics that import correctly into Google Calendar.
- Admin can refresh the feed and the backend normalizes it without manual fixes.

---

## Minimal viable product (MVP) roadmap / milestones
1. Data ingestion & normalization + small API (GET /courses).
2. Frontend search UI and course selection component.
3. Basic schedule generator (backtracking), weekly grid view, CSV export.
4. Filters UI and ranking/scoring.
5. ICS export and saving/bookmarking schedules.
6. Admin ingestion endpoint and monitoring.

---

## Recommended Project Structure

```
baniere/
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── courses.ts          # GET /api/courses, /api/courses/:id
│   │   │   │   ├── schedules.ts        # POST /api/schedules/generate
│   │   │   │   ├── export.ts           # POST /api/export/ics, /api/export/csv
│   │   │   │   └── admin.ts            # POST /api/admin/ingest (protected)
│   │   │   └── middleware/
│   │   │       ├── errorHandler.ts
│   │   │       └── validation.ts
│   │   ├── services/
│   │   │   ├── normalizer.ts           # Banner JSON → normalized format
│   │   │   ├── generator.ts            # Schedule generation algorithm
│   │   │   ├── conflictChecker.ts      # Time overlap detection
│   │   │   ├── filterEngine.ts         # Apply user filters
│   │   │   └── exportService.ts        # iCal/CSV generation
│   │   ├── models/
│   │   │   ├── Course.ts               # TypeScript interfaces
│   │   │   ├── Schedule.ts
│   │   │   └── Filter.ts
│   │   ├── utils/
│   │   │   ├── timeUtils.ts            # Time parsing/comparison
│   │   │   ├── validation.ts
│   │   │   └── cache.ts                # Redis wrapper
│   │   ├── config/
│   │   │   └── index.ts                # Environment config
│   │   └── index.ts                    # Express app entry
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── conflictChecker.test.ts
│   │   │   ├── generator.test.ts
│   │   │   └── normalizer.test.ts
│   │   └── integration/
│   │       └── api.test.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CourseSearch/
│   │   │   │   ├── CourseSearch.tsx
│   │   │   │   └── CourseAutocomplete.tsx
│   │   │   ├── FilterPanel/
│   │   │   │   ├── FilterPanel.tsx
│   │   │   │   ├── TimeFilter.tsx
│   │   │   │   ├── DayFilter.tsx
│   │   │   │   └── ProfessorFilter.tsx
│   │   │   ├── ScheduleViewer/
│   │   │   │   ├── WeeklyGrid.tsx       # Visual grid view
│   │   │   │   ├── CompactList.tsx      # List view
│   │   │   │   ├── ScheduleCard.tsx     # Individual schedule
│   │   │   │   └── CourseBlock.tsx      # Time block in grid
│   │   │   ├── Export/
│   │   │   │   └── ExportButtons.tsx
│   │   │   └── common/
│   │   │       ├── Button.tsx
│   │   │       ├── Input.tsx
│   │   │       └── Loading.tsx
│   │   ├── hooks/
│   │   │   ├── useCourses.ts           # React Query hook
│   │   │   ├── useScheduleGenerator.ts
│   │   │   └── useFilters.ts           # Filter state management
│   │   ├── services/
│   │   │   └── api.ts                   # API client (axios/fetch)
│   │   ├── types/
│   │   │   ├── course.ts
│   │   │   ├── schedule.ts
│   │   │   └── filter.ts
│   │   ├── utils/
│   │   │   ├── timeFormatter.ts
│   │   │   └── scheduleHash.ts
│   │   ├── i18n/
│   │   │   └── es.json                  # Spanish strings
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   └── styles/
│   │       └── tailwind.css
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── vite.config.ts (or craco.config.js for CRA)
│
├── docker-compose.yml                   # Local dev setup (backend, frontend, redis, postgres)
├── README.md
└── courses.json                         # Sample data for testing
```

### Key Architecture Decisions:
1. **Separation of concerns**: API routes → Services → Models keeps logic testable
2. **Schedule generation**: Run in backend for heavy operations, cache results in Redis
3. **Frontend state**: React Query for server state, local state for UI filters
4. **Type safety**: Shared TypeScript types between frontend/backend (consider monorepo or shared package)
5. **Performance**: Cache normalized courses in Redis, invalidate on admin re-ingest

---

## Notes for developers
- Keep the UI copy in Spanish from day one. Use short, clear labels.
- Use the provided JSON sample structure (courses.json) to build fixtures for local testing.
- Instrument the generator to produce metrics (time to generate, results returned) so you can tune performance.
- HTML entities in building descriptions (e.g., `&oacute;`) must be decoded for display.

### Spanish UI Glossary (English → Spanish):
| English | Spanish |
|---------|--------|
| Course | Curso |
| Section | Sección |
| Filter / Filter by | Filtrar / Filtrar por |
| Generate schedules | Generar horarios |
| Export to calendar | Exportar a calendario |
| Professor / Instructor | Profesor(a) |
| Schedule | Horario |
| Available seats | Cupos disponibles |
| Enrolled | Inscritos |
| Capacity | Capacidad |
| Credits | Créditos |
| Building | Edificio |
| Room | Salón |
| Time | Horario / Hora |
| Start time | Hora de inicio |
| End time | Hora de fin |
| Days | Días |
| Monday | Lunes |
| Tuesday | Martes |
| Wednesday | Miércoles |
| Thursday | Jueves |
| Friday | Viernes |
| Saturday | Sábado |
| Free day | Día libre |
| Open section | Sección abierta |
| Closed section | Sección cerrada |
| Waitlist | Lista de espera |
| Search | Buscar |
| Add course | Agregar curso |
| Remove course | Quitar curso |
| No conflicts | Sin conflictos |
| Conflict | Conflicto |
| Preferences | Preferencias |
| Save schedule | Guardar horario |
| Compare | Comparar |
| Results | Resultados |
| Loading | Cargando |
| No results found | No se encontraron resultados |
| Try different filters | Intenta con otros filtros |
| To be announced (TBA) | Por definir / Por asignar |

---

## Recent Improvements

### 1. 8-Week Course Cycle Support (Implemented)

**Problem:** Some courses last only 8 weeks and are labeled "(Ciclo 1 de 8 semanas)" or "(Ciclo 2 de 8 semanas)" in the course title. Students often want to take a Ciclo 1 course and a Ciclo 2 course in the same schedule since they don't overlap in time (Ciclo 1 runs weeks 1-8, Ciclo 2 runs weeks 9-16).

**Solution:**
- Added `cycle` field to `NormalizedCourse` interface (1 | 2 | undefined)
- Updated normalizer to extract cycle information from course titles
- Modified conflict checker to allow courses from different cycles to coexist even if they have overlapping meeting times
- Added visual indicators (C1, C2) in the schedule grid to show which cycle each course belongs to

**Usage:**
- Students can now select courses from both cycles
- Schedules will correctly include both Ciclo 1 and Ciclo 2 courses without marking them as conflicts
- The UI shows a small "C1" or "C2" badge on course blocks in the weekly grid

### 2. Advanced Filters (Implemented)

**New filters added to the UI:**

1. **Minimum Start Time** (`minStartTime`)
   - Students can specify they don't want classes before a certain time (e.g., no classes before 8:00 AM)
   - Format: "0800" for 8:00 AM

2. **Maximum Gap Between Classes** (`maxGapMinutes`)
   - Limit the idle time between consecutive classes
   - Useful for students who prefer compact schedules without long breaks

3. **Required Professors** (`requiredProfessors`)
   - Comma-separated list of professor names
   - Only generate schedules that include sections taught by these professors
   - Matches by display name (supports partial matches)

4. **Forbidden Professors** (`forbiddenProfessors`)
   - Comma-separated list of professor names to avoid
   - Filters out sections taught by these professors
   - Useful for avoiding specific instructors

**UI Design:**
- Basic filters shown by default
- Advanced filters in a collapsible section to avoid overwhelming users
- All filters persist in localStorage for convenience

**Backend Support:**
- All filters were already implemented in the filter engine
- No changes needed to schedule generation logic
- Frontend now exposes these capabilities in the UI
