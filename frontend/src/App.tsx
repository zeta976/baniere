import { useState, useEffect, useRef } from 'react';
import { Calendar, Star } from 'lucide-react';
import CourseSearch from './components/CourseSearch/CourseSearch';
import FilterPanel from './components/FilterPanel/FilterPanel';
import ScheduleViewer from './components/ScheduleViewer/ScheduleViewer';
import { useFilters } from './hooks/useFilters';
import { useScheduleGenerator } from './hooks/useScheduleGenerator';
import { Schedule } from './types/schedule';
import { TimeBlock } from './types/timeBlock';
import { useSavedSchedules } from './hooks/useSavedSchedules';
import SavedSchedulesModal from './components/SavedSchedules/SavedSchedulesModal';
import AddTimeBlockModal from './components/ScheduleViewer/AddTimeBlockModal';

const SELECTED_COURSES_KEY = 'baniere_selected_courses';

function App() {
  // Load selected courses from localStorage
  const [selectedCourses, setSelectedCourses] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(SELECTED_COURSES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log(`📚 Loaded ${parsed.length} selected courses from localStorage`);
        return parsed;
      }
    } catch (error) {
      console.error('Error loading selected courses:', error);
    }
    return [];
  });
  
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showAddBlockModal, setShowAddBlockModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | undefined>();
  const { filters: filtersState, updateFilter } = useFilters();
  const generator = useScheduleGenerator();
  const isFirstRender = useRef(true);
  const {
    savedSchedules,
    saveSchedule,
    unsaveSchedule,
    isSaved,
    clearAllSaved,
    count: savedCount
  } = useSavedSchedules();

  // Save selected courses to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(SELECTED_COURSES_KEY, JSON.stringify(selectedCourses));
    } catch (error) {
      console.error('Error saving selected courses:', error);
    }
  }, [selectedCourses]);

  // Clean up orphaned section constraints when courses are removed
  useEffect(() => {
    // Build a mapping of CRN -> course code from current schedules
    const crnToCourse = new Map<string, string>();
    
    for (const schedule of schedules) {
      for (const section of schedule.sections) {
        crnToCourse.set(section.courseReferenceNumber, section.subjectCourse);
      }
    }
    
    // If we don't have schedules yet, can't clean up (backend will ignore anyway)
    if (crnToCourse.size === 0) return;
    
    // Filter required sections - keep only those from selected courses
    const requiredSections = filtersState.requiredSections || [];
    const validRequired = requiredSections.filter(crn => {
      const courseCode = crnToCourse.get(crn);
      if (!courseCode) return true; // Keep unknown CRNs (edge case)
      return selectedCourses.includes(courseCode);
    });
    
    // Filter forbidden sections - keep only those from selected courses
    const forbiddenSections = filtersState.forbiddenSections || [];
    const validForbidden = forbiddenSections.filter(crn => {
      const courseCode = crnToCourse.get(crn);
      if (!courseCode) return true; // Keep unknown CRNs (edge case)
      return selectedCourses.includes(courseCode);
    });
    
    // Update filters if any orphaned constraints were found
    if (validRequired.length !== requiredSections.length) {
      console.log(`🧹 Cleaning ${requiredSections.length - validRequired.length} orphaned required sections`);
      updateFilter('requiredSections', validRequired);
    }
    
    if (validForbidden.length !== forbiddenSections.length) {
      console.log(`🧹 Cleaning ${forbiddenSections.length - validForbidden.length} orphaned forbidden sections`);
      updateFilter('forbiddenSections', validForbidden);
    }
  }, [selectedCourses, schedules, filtersState.requiredSections, filtersState.forbiddenSections, updateFilter]);

  const handleGenerate = (silent = false) => {
    if (selectedCourses.length === 0) {
      if (!silent) {
        alert('Por favor selecciona al menos un curso');
      }
      return;
    }

    // Read fresh filters from localStorage to avoid stale closure
    const STORAGE_KEY = 'baniere_filters';
    let freshFilters = filtersState;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        freshFilters = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error reading fresh filters:', error);
    }

    // Add timeBlocks to filters
    const filtersWithBlocks = {
      ...freshFilters,
      timeBlocks: timeBlocks.map(block => ({
        day: block.day,
        startTime: block.startTime,
        endTime: block.endTime,
        label: block.label
      }))
    };

    if (!silent) {
      console.log('🔍 Generating schedules with filters:', JSON.stringify(filtersWithBlocks, null, 2));
      console.log('📚 Selected courses:', selectedCourses);
      console.log('🚫 Time blocks:', timeBlocks);
      console.log(`📋 Current schedules count: ${schedules.length}`);
    } else {
      console.log('🔄 Auto-regenerating with updated time blocks...');
    }

    generator.mutate(
      { courses: selectedCourses, filters: filtersWithBlocks, maxResults: 500 },
      {
        onSuccess: (data) => {
          console.log(`✅ Received ${data.schedules.length} schedules`);
          
          if (data.schedules.length === 0) {
            console.warn('⚠️ No schedules found! Clearing current schedules...');
          }
          
          // Always update schedules, even if empty
          setSchedules(data.schedules);
          console.log('📊 Schedules state updated');
          
          // Show feedback when no schedules found
          if (data.schedules.length === 0 && !silent) {
            alert('⚠️ No se encontraron horarios posibles con los cursos y filtros seleccionados.\n\nIntenta:\n• Quitar algún filtro restrictivo\n• Verificar que los cursos no tengan conflictos de horario\n• Revisar las secciones obligatorias/excluidas');
          }
        },
        onError: (error) => {
          console.error('❌ Error generating schedules:', error);
          // Clear schedules on error
          setSchedules([]);
          if (!silent) {
            alert('Error al generar horarios. Por favor intenta de nuevo.');
          }
        }
      }
    );
  };

  // Auto-regenerate when timeBlocks change (but not on first render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Only auto-regenerate if we already have schedules
    if (schedules.length > 0 && selectedCourses.length > 0) {
      console.log('⚡ Time blocks changed, auto-regenerating...');
      handleGenerate(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeBlocks]);

  // Auto-regenerate when section constraints change
  useEffect(() => {
    if (isFirstRender.current) {
      return;
    }

    // Only auto-regenerate if we already have schedules
    if (schedules.length > 0 && selectedCourses.length > 0) {
      console.log('⚡ Section constraints changed, auto-regenerating...');
      handleGenerate(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersState.requiredSections, filtersState.forbiddenSections]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-primary-600" />
              <h1 className="text-3xl font-bold text-gray-900">Baniere</h1>
              <span className="text-sm text-gray-500">Generador de Horarios</span>
            </div>
            
            {/* Saved Schedules Button */}
            <button
              onClick={() => setShowSavedModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 relative"
            >
              <Star className="w-5 h-5 fill-current" />
              <span>Horarios Guardados</span>
              {savedCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <CourseSearch
              selectedCourses={selectedCourses}
              onCoursesChange={setSelectedCourses}
            />
            <FilterPanel 
              filters={filtersState}
              onUpdateFilter={updateFilter}
              timeBlocks={timeBlocks}
              onAddTimeBlock={() => {
                setEditingBlock(undefined);
                setShowAddBlockModal(true);
              }}
              onEditTimeBlock={(block) => {
                setEditingBlock(block);
                setShowAddBlockModal(true);
              }}
              onRemoveTimeBlock={(blockId) => {
                setTimeBlocks(timeBlocks.filter(b => b.id !== blockId));
              }}
            />
            <button
              onClick={() => handleGenerate(false)}
              disabled={generator.isPending || selectedCourses.length === 0}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {generator.isPending ? 'Generando...' : 'Generar Horarios'}
            </button>
          </div>

          <div className="lg:col-span-2">
            <ScheduleViewer 
              schedules={schedules} 
              isLoading={generator.isPending}
              timeBlocks={timeBlocks}
              onTimeBlocksChange={setTimeBlocks}
              onSaveSchedule={saveSchedule}
              onUnsaveSchedule={unsaveSchedule}
              isSaved={isSaved}
              onRequireSection={(crn) => {
                const current = filtersState.requiredSections || [];
                const forbidden = filtersState.forbiddenSections || [];
                
                if (current.includes(crn)) {
                  // Toggle off: Remove from required
                  console.log('🔄 Removing section from required:', crn);
                  updateFilter('requiredSections', current.filter(c => c !== crn));
                } else {
                  // Toggle on: Add to required, remove from forbidden if present
                  console.log('✅ Adding section to required:', crn);
                  updateFilter('requiredSections', [...current, crn]);
                  if (forbidden.includes(crn)) {
                    console.log('🔄 Removing from forbidden:', crn);
                    updateFilter('forbiddenSections', forbidden.filter(c => c !== crn));
                  }
                }
              }}
              onForbidSection={(crn) => {
                const current = filtersState.forbiddenSections || [];
                const required = filtersState.requiredSections || [];
                
                if (current.includes(crn)) {
                  // Toggle off: Remove from forbidden
                  console.log('🔄 Removing section from forbidden:', crn);
                  updateFilter('forbiddenSections', current.filter(c => c !== crn));
                } else {
                  // Toggle on: Add to forbidden, remove from required if present
                  console.log('❌ Adding section to forbidden:', crn);
                  updateFilter('forbiddenSections', [...current, crn]);
                  if (required.includes(crn)) {
                    console.log('🔄 Removing from required:', crn);
                    updateFilter('requiredSections', required.filter(c => c !== crn));
                  }
                }
              }}
              requiredSections={filtersState.requiredSections || []}
              forbiddenSections={filtersState.forbiddenSections || []}
            />
          </div>
        </div>
      </main>
      
      {/* Saved Schedules Modal */}
      <SavedSchedulesModal 
        isOpen={showSavedModal}
        onClose={() => setShowSavedModal(false)}
        savedSchedules={savedSchedules}
        onRemove={unsaveSchedule}
        onClearAll={clearAllSaved}
      />
      
      {/* Add/Edit Time Block Modal */}
      <AddTimeBlockModal
        isOpen={showAddBlockModal}
        onClose={() => {
          setShowAddBlockModal(false);
          setEditingBlock(undefined);
        }}
        onAddBlock={(blocks) => {
          setTimeBlocks([...timeBlocks, ...blocks]);
        }}
        editBlock={editingBlock}
        onEditBlock={(block) => {
          setTimeBlocks(timeBlocks.map(b => b.id === block.id ? block : b));
        }}
      />
    </div>
  );
}

export default App;
