/**
 * Text utilities for search and normalization
 */

/**
 * Normalize a string for accent-insensitive comparison
 * Converts "programación" → "programacion"
 * Converts "INTRODUCCIÓN" → "INTRODUCCION"
 */
export function normalizeForSearch(text: string): string {
  return text
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
    .toUpperCase()
    .trim();
}

/**
 * Check if a text contains a query (accent-insensitive)
 * Supports searching "programacion" to find "PROGRAMACIÓN"
 */
export function textContainsQuery(text: string, query: string): boolean {
  const normalizedText = normalizeForSearch(text);
  const normalizedQuery = normalizeForSearch(query);
  return normalizedText.includes(normalizedQuery);
}
