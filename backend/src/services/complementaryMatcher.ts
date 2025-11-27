/**
 * Complementary Course Matcher
 * Ensures complementary courses (labs, complementary sections) match the main section
 * 
 * Examples:
 * - FISI1518 section 'D' can only be with FISI1518P sections 'D1', 'D2', 'D3'
 * - MATE1203 section 'F' can only be with MATE1203C sections 'F1', 'F2', 'F3'
 */

import { NormalizedCourse } from '../models/Course';

/**
 * Identify complementary course pairs (course code -> complementary code)
 * Based on common patterns at Universidad de los Andes
 */
const COMPLEMENTARY_PATTERNS: Array<{
  pattern: RegExp;
  complementaryPattern: RegExp;
  isComplementary: (baseCode: string, compCode: string) => boolean;
}> = [
  // Lab courses ending in P (e.g., FISI1518 -> FISI1518P)
  {
    pattern: /^([A-Z]{4}\d{4})$/,
    complementaryPattern: /^([A-Z]{4}\d{4})P$/,
    isComplementary: (base, comp) => comp === `${base}P`
  },
  // Complementary sections ending in C (e.g., MATE1203 -> MATE1203C)
  {
    pattern: /^([A-Z]{4}\d{4})$/,
    complementaryPattern: /^([A-Z]{4}\d{4})C$/,
    isComplementary: (base, comp) => comp === `${base}C`
  },
  // Lab courses ending in L (e.g., QUIM1101 -> QUIM1101L)
  {
    pattern: /^([A-Z]{4}\d{4})$/,
    complementaryPattern: /^([A-Z]{4}\d{4})L$/,
    isComplementary: (base, comp) => comp === `${base}L`
  }
];

/**
 * Extract section prefix (the letter part without numbers)
 * Examples: 'D' -> 'D', 'D1' -> 'D', 'D2' -> 'D', 'F3' -> 'F'
 */
export function extractSectionPrefix(section: string): string {
  // Match the leading letters before any numbers
  const match = section.match(/^([A-Z]+)/);
  return match ? match[1] : section;
}

/**
 * Check if two course codes are complementary (one is the lab/complementary of the other)
 */
export function areCoursesComplementary(courseCode1: string, courseCode2: string): boolean {
  for (const pattern of COMPLEMENTARY_PATTERNS) {
    const match1 = courseCode1.match(pattern.pattern);
    const match2 = courseCode2.match(pattern.complementaryPattern);
    
    if (match1 && match2) {
      const baseCode = match1[1];
      if (pattern.isComplementary(baseCode, courseCode2)) {
        return true;
      }
    }
    
    // Check reverse (comp -> base)
    const match3 = courseCode1.match(pattern.complementaryPattern);
    const match4 = courseCode2.match(pattern.pattern);
    
    if (match3 && match4) {
      const baseCode = match4[1];
      if (pattern.isComplementary(baseCode, courseCode1)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Find the base course code for a complementary course
 * Examples: 'FISI1518P' -> 'FISI1518', 'MATE1203C' -> 'MATE1203'
 */
export function getBaseCourseCode(courseCode: string): string | null {
  for (const pattern of COMPLEMENTARY_PATTERNS) {
    const match = courseCode.match(pattern.complementaryPattern);
    if (match) {
      return match[1]; // Return the base part without suffix
    }
  }
  return null; // Not a complementary course
}

/**
 * Validate that a section is compatible with existing sections in the schedule
 * regarding complementary course matching rules
 * 
 * @param newSection - The section to add to the schedule
 * @param existingSections - Sections already in the schedule
 * @returns true if compatible, false if violates complementary matching rules
 */
export function isComplementaryCompatible(
  newSection: NormalizedCourse,
  existingSections: NormalizedCourse[]
): boolean {
  const newCourse = newSection.subjectCourse;
  const newSectionPrefix = extractSectionPrefix(newSection.section);
  
  // Check if new course is complementary to any existing course
  for (const existing of existingSections) {
    const existingCourse = existing.subjectCourse;
    
    if (!areCoursesComplementary(newCourse, existingCourse)) {
      continue; // Not related, no restriction
    }
    
    // They are complementary - check section prefix match
    const existingSectionPrefix = extractSectionPrefix(existing.section);
    
    // Determine which is base and which is complementary
    const isNewComplementary = getBaseCourseCode(newCourse) !== null;
    const isExistingComplementary = getBaseCourseCode(existingCourse) !== null;
    
    if (isNewComplementary && !isExistingComplementary) {
      // New is complementary (e.g., FISI1518P 'D1'), existing is base (e.g., FISI1518 'D')
      // Complementary prefix must match base prefix
      if (!newSectionPrefix.startsWith(existingSectionPrefix)) {
        console.log(`❌ Complementary mismatch: ${newCourse} section '${newSection.section}' (prefix: ${newSectionPrefix}) doesn't match base ${existingCourse} section '${existing.section}' (prefix: ${existingSectionPrefix})`);
        return false;
      }
    } else if (!isNewComplementary && isExistingComplementary) {
      // New is base (e.g., FISI1518 'D'), existing is complementary (e.g., FISI1518P 'D1')
      // Complementary prefix must match base prefix
      if (!existingSectionPrefix.startsWith(newSectionPrefix)) {
        console.log(`❌ Complementary mismatch: base ${newCourse} section '${newSection.section}' (prefix: ${newSectionPrefix}) doesn't match complementary ${existingCourse} section '${existing.section}' (prefix: ${existingSectionPrefix})`);
        return false;
      }
    }
    // If both are base or both are complementary, no special restriction
  }
  
  return true; // All checks passed
}

/**
 * Pre-filter complementary sections based on main course sections
 * Used to reduce search space by only including valid complementary sections
 * 
 * @param mainSections - Sections of the main course
 * @param complementarySections - Sections of the complementary course
 * @returns Map of main section prefix -> valid complementary sections
 */
export function buildComplementaryMap(
  mainSections: NormalizedCourse[],
  complementarySections: NormalizedCourse[]
): Map<string, NormalizedCourse[]> {
  const map = new Map<string, NormalizedCourse[]>();
  
  // Group main sections by prefix
  const mainPrefixes = new Set<string>();
  for (const section of mainSections) {
    const prefix = extractSectionPrefix(section.section);
    mainPrefixes.add(prefix);
  }
  
  // For each main prefix, find compatible complementary sections
  for (const prefix of mainPrefixes) {
    const compatible = complementarySections.filter(compSection => {
      const compPrefix = extractSectionPrefix(compSection.section);
      return compPrefix.startsWith(prefix);
    });
    map.set(prefix, compatible);
  }
  
  return map;
}
