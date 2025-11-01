import { useState } from 'react';
import { Calendar } from 'lucide-react';
import CourseSearch from './components/CourseSearch/CourseSearch';
import FilterPanel from './components/FilterPanel/FilterPanel';
import ScheduleViewer from './components/ScheduleViewer/ScheduleViewer';
import { useFilters } from './hooks/useFilters';
import { useScheduleGenerator } from './hooks/useScheduleGenerator';
import { Schedule } from './types/schedule';

function App() {
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const { filters: filtersState } = useFilters();
  const generator = useScheduleGenerator();

  const handleGenerate = () => {
    if (selectedCourses.length === 0) {
      alert('Por favor selecciona al menos un curso');
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

    console.log('🔍 Generating schedules with filters:', JSON.stringify(freshFilters, null, 2));
    console.log('📚 Selected courses:', selectedCourses);

    generator.mutate(
      { courses: selectedCourses, filters: freshFilters, maxResults: 500 },
      {
        onSuccess: (data) => {
          console.log(`✅ Received ${data.schedules.length} schedules`);
          setSchedules(data.schedules);
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Baniere</h1>
            <span className="text-sm text-gray-500">Generador de Horarios</span>
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
            <FilterPanel />
            <button
              onClick={handleGenerate}
              disabled={generator.isPending || selectedCourses.length === 0}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {generator.isPending ? 'Generando...' : 'Generar Horarios'}
            </button>
          </div>

          <div className="lg:col-span-2">
            <ScheduleViewer schedules={schedules} isLoading={generator.isPending} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
