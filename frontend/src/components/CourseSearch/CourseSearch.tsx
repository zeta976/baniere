import { useState } from 'react';
import { Search, X, Plus } from 'lucide-react';
import { useCourseSearch } from '../../hooks/useCourses';
import Input from '../common/Input';
import Loading from '../common/Loading';

interface CourseSearchProps {
  selectedCourses: string[];
  onCoursesChange: (courses: string[]) => void;
}

export default function CourseSearch({ selectedCourses, onCoursesChange }: CourseSearchProps) {
  const [query, setQuery] = useState('');
  const { data: results, isLoading } = useCourseSearch(query);

  const addCourse = (courseCode: string) => {
    if (!selectedCourses.includes(courseCode)) {
      onCoursesChange([...selectedCourses, courseCode]);
    }
    setQuery('');
  };

  const removeCourse = (courseCode: string) => {
    onCoursesChange(selectedCourses.filter(c => c !== courseCode));
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Buscar Cursos</h2>
      
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="Buscar por código o nombre..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading && query.length >= 2 && <Loading message="Buscando cursos..." />}

      {results && results.length > 0 && (
        <div className="mb-4 max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
          {results.map((course) => (
            <div
              key={course.subjectCourse}
              className="p-3 hover:bg-gray-50 border-b last:border-b-0 cursor-pointer"
              onClick={() => addCourse(course.subjectCourse)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-semibold text-sm">{course.subjectCourse}</div>
                  <div className="text-xs text-gray-600 mt-1">{course.courseTitle}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {course.sectionCount} secciones • {course.openSections} abiertas
                  </div>
                </div>
                <Plus className="w-5 h-5 text-primary-600 flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}

      {query.length >= 2 && results && results.length === 0 && !isLoading && (
        <p className="text-sm text-gray-500 text-center py-4">
          No se encontraron resultados
        </p>
      )}

      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">
          Cursos Seleccionados ({selectedCourses.length})
        </h3>
        {selectedCourses.length === 0 ? (
          <p className="text-sm text-gray-500">No hay cursos seleccionados</p>
        ) : (
          <div className="space-y-2">
            {selectedCourses.map((courseCode) => (
              <div
                key={courseCode}
                className="flex items-center justify-between bg-primary-50 px-3 py-2 rounded"
              >
                <span className="text-sm font-medium text-primary-900">{courseCode}</span>
                <button
                  onClick={() => removeCourse(courseCode)}
                  className="text-primary-600 hover:text-primary-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
