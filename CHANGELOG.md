# Changelog

## [1.1.0] - 2025-10-26

### Added - 8-Week Course Cycle Support

**Problem Solved:**
Many university courses are 8-week courses divided into two cycles:
- **Ciclo 1 de 8 semanas**: Weeks 1-8 of the semester
- **Ciclo 2 de 8 semanas**: Weeks 9-16 of the semester

Students often prefer to take courses from both cycles in the same schedule (e.g., "Escritura 1" in Ciclo 1 and "Escritura 2" in Ciclo 2) since they don't overlap temporally, even though they may meet at the same time slots.

**Implementation:**

Backend Changes:
- Added `cycle?: 1 | 2` field to `NormalizedCourse` interface
- Created `extractCycle()` function in normalizer to detect cycle from course title
- Updated conflict detection logic to allow courses from different cycles to coexist
- Modified `sectionsConflict()` to return `false` when comparing Ciclo 1 vs Ciclo 2

Frontend Changes:
- Added `cycle` property to frontend `Course` type
- Added visual cycle indicators ("C1", "C2") in schedule grid blocks
- Cycles displayed as small badges on course blocks for easy identification

**Benefits:**
- Students can now mix Ciclo 1 and Ciclo 2 courses without conflicts
- More scheduling flexibility for 8-week courses
- Clear visual indication of which cycle each course belongs to
- No manual intervention needed - cycles are automatically detected from course titles

---

### Added - Advanced Filter Options

**New Filters Exposed in UI:**

1. **Minimum Start Time** (`minStartTime`)
   - Prevent early morning classes
   - Example: Set to 08:00 to avoid 7 AM classes
   - Use case: Students who prefer later start times

2. **Maximum Gap Between Classes** (`maxGapMinutes`)
   - Limit idle time between consecutive classes
   - Example: Set to 120 minutes (2 hours) for compact schedules
   - Use case: Students who want minimal downtime on campus

3. **Required Professors** (`requiredProfessors`)
   - Comma-separated list of preferred professor names
   - Only includes sections taught by these professors
   - Example: "García, López, Martínez"
   - Use case: Take classes with favorite instructors

4. **Forbidden Professors** (`forbiddenProfessors`)
   - Comma-separated list of professors to avoid
   - Filters out sections taught by these professors
   - Example: "Pérez, Rodríguez"
   - Use case: Avoid specific instructors

**UI/UX Improvements:**
- Collapsible "Filtros Avanzados" section to avoid overwhelming users
- Clear labels in Spanish with placeholder examples
- Input validation for numeric fields (time, gap minutes)
- Filter persistence via localStorage
- Real-time filter application during schedule generation

**Backend Coverage:**
- All advanced filters were already implemented in `filterEngine.ts`
- No backend changes required - only UI exposure
- Filters are applied during pre-filtering phase before schedule generation
- Efficient filtering reduces search space for generation algorithm

---

## Technical Details

### Cycle Detection Logic
```typescript
function extractCycle(courseTitle: string): 1 | 2 | undefined {
  if (courseTitle.includes('Ciclo 1 de 8 semanas')) return 1;
  if (courseTitle.includes('Ciclo 2 de 8 semanas')) return 2;
  return undefined;
}
```

### Conflict Detection with Cycles
```typescript
export function sectionsConflict(section1, section2): boolean {
  // Different cycles don't conflict (8-week courses)
  if (section1.cycle && section2.cycle && section1.cycle !== section2.cycle) {
    return false;
  }
  // ... rest of conflict logic
}
```

### Filter Application
All filters are applied in `filterEngine.ts` before schedule generation:
- Pre-filters sections to reduce search space
- O(n) filtering vs O(n!) schedule generation
- Significant performance improvement for constrained searches

---

## Testing Recommendations

1. **Test Cycle Handling:**
   - Search for courses with "Ciclo 1 de 8 semanas"
   - Search for courses with "Ciclo 2 de 8 semanas"
   - Generate schedules with both cycles included
   - Verify no conflict errors for different cycles at same time

2. **Test Advanced Filters:**
   - Set minStartTime to 08:00, verify no 7 AM classes
   - Set maxGapMinutes to 60, verify compact schedules
   - Add professor names to requiredProfessors, verify only those professors appear
   - Add professor names to forbiddenProfessors, verify they're excluded

3. **Test Filter Persistence:**
   - Set filters
   - Refresh page
   - Verify filters are still applied

4. **Test UI:**
   - Toggle "Filtros Avanzados" section
   - Verify all inputs work correctly
   - Check cycle badges appear on schedule grid

---

## Known Limitations

1. Cycle detection is based on string matching in course titles
   - If title format changes, detection may fail
   - Could be enhanced with explicit cycle field from data source

2. Professor name matching is case-insensitive but requires exact substring
   - Partial names work ("Garc" matches "García")
   - Typos will cause mismatches

3. Cycle indicators in UI are small badges
   - May be hard to see on mobile devices
   - Could be enhanced with hover tooltips

---

## Future Enhancements

1. **Required/Forbidden Sections UI:**
   - Currently available in API but not exposed in UI
   - Could add section selector in course search results

2. **Specific Day Filters:**
   - Backend supports per-day time constraints
   - Could add "Lunes: no antes de 10:00" type filters

3. **Preferred Gap Time:**
   - Backend supports lunch break preference
   - Could add "Prefer gap around 12:00" option

4. **Course Cycle Filtering:**
   - Add checkbox: "Solo Ciclo 1" or "Solo Ciclo 2"
   - Would help students who can't take both cycles

---

## Performance Impact

**Cycle Support:**
- Minimal performance impact
- Single string check per course during normalization
- O(1) cycle comparison during conflict detection

**Advanced Filters:**
- Positive performance impact!
- Pre-filtering reduces search space
- Fewer sections = faster schedule generation
- More constraints = fewer combinations to explore

**Estimated improvements:**
- 20-30% faster generation with minStartTime
- 40-50% faster with professor filters
- Combined filters can reduce generation time by 60-70%
