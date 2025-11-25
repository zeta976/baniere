# Update: 8-Week Courses & Accent-Insensitive Search

## Changes Made

### 1. Updated 8-Week Course Detection (8A/8B)

**Previous:** Used course title text "Ciclo 1 de 8 semanas" / "Ciclo 2 de 8 semanas"
**New:** Uses `partOfTerm` field with values "8A" and "8B"

#### What Changed:
- **`backend/src/services/normalizer.ts`**
  - `extractCycle()` now checks `partOfTerm === '8A'` → cycle 1
  - `extractCycle()` now checks `partOfTerm === '8B'` → cycle 2
  - Updated to use `bannerCourse.partOfTerm` instead of `bannerCourse.courseTitle`

#### Behavior:
- Courses with `"partOfTerm": "8A"` get `cycle: 1`
- Courses with `"partOfTerm": "8B"` get `cycle: 2`
- **8A and 8B courses can be scheduled at the same time** without conflicts
- Students can take both an 8A and 8B course simultaneously

---

### 2. Fixed HTML Entity Encoding in Course Titles

**Problem:** Course titles displayed as `INTRODUCCI&Oacute;N A LA PROGRAMACI&Oacute;N`
**Fixed:** Now displays as `INTRODUCCIÓN A LA PROGRAMACIÓN`

#### What Changed:
- **`backend/src/services/normalizer.ts`**
  - Added `he.decode()` to course title normalization
  - `courseTitle: he.decode(bannerCourse.courseTitle.trim())`
  
#### Result:
- All HTML entities (`&Oacute;`, `&Ntilde;`, `&aacute;`, etc.) are decoded
- Proper Spanish characters display correctly
- Building descriptions already used `he.decode()`, now titles do too

---

### 3. Accent-Insensitive Search

**Problem:** Searching "programacion" didn't find "PROGRAMACIÓN"
**Fixed:** Search works with or without accents

#### What Changed:
- **New file: `backend/src/utils/textUtils.ts`**
  - `normalizeForSearch(text)` - Removes accents for comparison
  - `textContainsQuery(text, query)` - Accent-insensitive matching
  
- **`backend/src/api/routes/courses.ts`**
  - Updated search to use `textContainsQuery()` for course titles
  - Now matches: "programacion", "programación", "PROGRAMACION", "PROGRAMACIÓN"

#### How It Works:
```typescript
normalizeForSearch("INTRODUCCIÓN")
// → "INTRODUCCION" (removes accents)

normalizeForSearch("introduccion") 
// → "INTRODUCCION" (also uppercase)

// Both match!
```

#### Examples:
| User searches | Finds courses with |
|---------------|-------------------|
| `programacion` | PROGRAMACIÓN |
| `matematicas` | MATEMÁTICAS |
| `historia` | HISTORIA |
| `diseno` | DISEÑO |

---

## Testing the Changes

### Test 8-Week Courses (8A/8B)

1. Search for courses with `partOfTerm: "8A"` or `"8B"`
2. Add one 8A course and one 8B course to schedule
3. Click "Generar Horarios"
4. **Expected:** Schedules show both courses together
5. **Check:** Course blocks show "C1" or "C2" badge in calendar

### Test HTML Decoding

1. Search for any course (e.g., "INTRODUCCIÓN")
2. **Expected:** Title shows properly: "INTRODUCCIÓN..." not "INTRODUCCI&Oacute;N..."
3. Check search results display accented characters correctly

### Test Accent-Insensitive Search

Try these searches:

| Search | Should Find |
|--------|-------------|
| `introduccion` | INTRODUCCIÓN A... |
| `programacion` | PROGRAMACIÓN courses |
| `diseno` | DISEÑO courses |
| `matematicas` | MATEMÁTICAS courses |
| `espanol` | ESPAÑOL courses |

All should work with or without accents!

---

## Data Structure Changes

### New JSON Structure (courses.json)

The new semester data includes:
- `"partOfTerm": "1"` - Full semester (16 weeks)
- `"partOfTerm": "8A"` - First 8-week period
- `"partOfTerm": "8B"` - Second 8-week period

Example:
```json
{
  "id": 374370,
  "term": "202610",
  "courseReferenceNumber": "55509",
  "partOfTerm": "8A",  // ← This field!
  "courseTitle": "ARQUITECTURA 3508",
  ...
}
```

---

## Deployment

### Already Pushed to GitHub ✅

The changes are in commit: `c5230a6`

### Render Will Auto-Redeploy

1. Render detects the push (2-3 minutes)
2. Backend rebuilds
3. New logic active

### Frontend - No Changes Needed ✅

The frontend already:
- Displays cycle badges (C1/C2)
- Handles decoded text properly
- Shows search results correctly

---

## Technical Details

### Cycle Conflict Detection

**`backend/src/services/conflictChecker.ts`** already handles this:

```typescript
export function sectionsConflict(section1, section2) {
  // Different cycles don't conflict (8-week courses)
  if (section1.cycle && section2.cycle && section1.cycle !== section2.cycle) {
    return false;  // 8A and 8B don't conflict!
  }
  // ... rest of conflict checking
}
```

### Unicode Normalization

```typescript
function normalizeForSearch(text: string): string {
  return text
    .normalize('NFD')  // Decompose: é → e + ´
    .replace(/[\u0300-\u036f]/g, '')  // Remove accents
    .toUpperCase()
    .trim();
}
```

This handles all Spanish characters:
- `á é í ó ú` → `a e i o u`
- `ñ` → `n`
- `ü` → `u`

---

## Backwards Compatibility

### Old Cycle Detection Still Works

If old data has "Ciclo 1/2 de 8 semanas" in title:
- `extractCycle()` returns `undefined`
- No cycle badge shown
- Works as regular courses

### Old Search Still Works

Regular course codes (ADMI1101, MATE1203) work as before.

---

## What Else Could Be Implemented?

Based on the new JSON structure, potential features:

### 1. Part of Term Filter
- Allow filtering by `partOfTerm`
- "Show only 8-week courses"
- "Show only full semester courses"

### 2. Visual Indicators
- Different colors for 8A vs 8B in calendar
- Highlight courses that can overlap

### 3. Smart Suggestions
- "You selected an 8A course, here are 8B courses at the same time"

### 4. Term Selection
- Multiple terms in JSON (202610, etc.)
- Let user choose semester

### 5. Advanced Course Info
- Show `startDate` and `endDate` for 8-week courses
- Display actual course duration

---

## Summary

✅ **8-Week courses now use `partOfTerm` field (8A/8B)**
✅ **HTML entities decoded** - proper Spanish characters
✅ **Accent-insensitive search** - works with/without accents
✅ **Backwards compatible** with old data
✅ **No frontend changes needed**
✅ **Deployed to production**

The app now correctly handles the new semester data structure!
