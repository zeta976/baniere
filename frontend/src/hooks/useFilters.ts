import { useState, useEffect } from 'react';
import { ScheduleFilters } from '../types/schedule';

const STORAGE_KEY = 'baniere_filters';
const DEFAULT_FILTERS: ScheduleFilters = {
  onlyOpenSections: true,
  preferCompact: false,
  freeDays: [],
  requiredSections: [],
  forbiddenSections: [],
  requiredProfessors: [],
  forbiddenProfessors: []
};

export function useFilters() {
  const [filters, setFilters] = useState<ScheduleFilters>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return { ...DEFAULT_FILTERS, ...JSON.parse(stored) };
    } catch (error) {
      console.error('Error loading filters:', error);
    }
    return DEFAULT_FILTERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error('Error saving filters:', error);
    }
  }, [filters]);

  return {
    filters,
    updateFilter: <K extends keyof ScheduleFilters>(key: K, value: ScheduleFilters[K]) => {
      setFilters(prev => ({ ...prev, [key]: value }));
    },
    resetFilters: () => setFilters(DEFAULT_FILTERS),
    setFilters
  };
}
