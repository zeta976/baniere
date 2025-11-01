import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Schedule } from '../../types/schedule';
import WeeklyGrid from './WeeklyGrid';
import Loading from '../common/Loading';

interface ScheduleViewerProps {
  schedules: Schedule[];
  isLoading: boolean;
}

export default function ScheduleViewer({ schedules, isLoading }: ScheduleViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset index when schedules change
  useEffect(() => {
    setCurrentIndex(0);
  }, [schedules]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <Loading message="Generando horarios..." />
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">No hay horarios para mostrar</p>
          <p className="text-sm mt-2">
            Selecciona cursos y aplica filtros, luego haz clic en "Generar Horarios"
          </p>
        </div>
      </div>
    );
  }

  const currentSchedule = schedules[currentIndex];

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              Horario {currentIndex + 1} de {schedules.length}
            </h2>
            <div className="flex gap-4 mt-2 text-sm text-gray-600">
              <span>Créditos: {currentSchedule.metadata.totalCredits}</span>
              <span>Días: {currentSchedule.metadata.daysOnCampus}</span>
              <span>
                Sale a las: {currentSchedule.metadata.latestEndTime.substring(0, 2)}:
                {currentSchedule.metadata.latestEndTime.substring(2)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentIndex(Math.min(schedules.length - 1, currentIndex + 1))}
              disabled={currentIndex === schedules.length - 1}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="p-4">
        <WeeklyGrid schedule={currentSchedule} />
      </div>
    </div>
  );
}
