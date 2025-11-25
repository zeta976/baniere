import { useState, useEffect } from 'react';
import { GroupedSchedule } from '../utils/scheduleGrouping';

const STORAGE_KEY = 'baniere_saved_schedules';

interface SavedSchedule {
  id: string;
  groupedSchedule: GroupedSchedule;
  savedAt: string;
  name?: string;
}

export function useSavedSchedules() {
  // Initialize state directly from localStorage
  const [savedSchedules, setSavedSchedules] = useState<SavedSchedule[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log(`📋 Loaded ${parsed.length} saved schedules from localStorage`);
        return parsed;
      }
    } catch (error) {
      console.error('Error loading saved schedules:', error);
    }
    return [];
  });

  // Save to localStorage whenever savedSchedules changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedSchedules));
      console.log(`💾 Synced ${savedSchedules.length} schedules to localStorage`);
    } catch (error) {
      console.error('Error saving schedules to localStorage:', error);
    }
  }, [savedSchedules]);

  const saveSchedule = (groupedSchedule: GroupedSchedule, customName?: string) => {
    // Use groupedSchedule.id as the unique identifier
    const id = groupedSchedule.id;
    
    const savedSchedule: SavedSchedule = {
      id,
      groupedSchedule,
      savedAt: new Date().toISOString(),
      name: customName
    };

    // Check if already saved (by id)
    const exists = savedSchedules.find(s => s.id === id);
    if (exists) {
      console.log('⚠️ Schedule already saved');
      return false;
    }

    setSavedSchedules([...savedSchedules, savedSchedule]);
    console.log('💾 Schedule saved with', groupedSchedule.sections.reduce((sum, slot) => sum + slot.sections.length, 0), 'total sections!');
    return true;
  };

  const unsaveSchedule = (scheduleId: string) => {
    setSavedSchedules(savedSchedules.filter(s => s.id !== scheduleId));
    console.log('🗑️ Schedule removed from saved');
  };

  const isSaved = (scheduleId: string): boolean => {
    return savedSchedules.some(s => s.id === scheduleId);
  };

  const updateScheduleName = (scheduleId: string, name: string) => {
    setSavedSchedules(
      savedSchedules.map(s => 
        s.id === scheduleId ? { ...s, name } : s
      )
    );
  };

  const clearAllSaved = () => {
    if (window.confirm('¿Estás seguro de eliminar todos los horarios guardados?')) {
      setSavedSchedules([]);
      console.log('🗑️ All saved schedules cleared');
    }
  };

  return {
    savedSchedules,
    saveSchedule,
    unsaveSchedule,
    isSaved,
    updateScheduleName,
    clearAllSaved,
    count: savedSchedules.length
  };
}
