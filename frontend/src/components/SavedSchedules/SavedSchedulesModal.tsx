import { X, Trash2, Calendar, Clock, BookOpen, Star } from 'lucide-react';
import WeeklyGrid from '../ScheduleViewer/WeeklyGrid';
import { GroupedSchedule } from '../../utils/scheduleGrouping';
import { TimeBlock } from '../../types/timeBlock';

interface SavedSchedule {
  id: string;
  groupedSchedule: GroupedSchedule;
  savedAt: string;
  name?: string;
}

interface SavedSchedulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedSchedules: SavedSchedule[];
  onRemove: (scheduleId: string) => void;
  onClearAll: () => void;
  timeBlocks?: TimeBlock[];
  onRemoveTimeBlock?: (blockId: string) => void;
  onEditTimeBlock?: (block: TimeBlock) => void;
}

export default function SavedSchedulesModal({
  isOpen,
  onClose,
  savedSchedules,
  onRemove,
  onClearAll,
  timeBlocks = [],
  onRemoveTimeBlock,
  onEditTimeBlock
}: SavedSchedulesModalProps) {
  if (!isOpen) return null;

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 fill-current" />
              <div>
                <h2 className="text-2xl font-bold">Horarios Guardados</h2>
                <p className="text-purple-100 text-sm mt-1">
                  {savedSchedules.length} {savedSchedules.length === 1 ? 'horario guardado' : 'horarios guardados'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {savedSchedules.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar Todos
                </button>
              )}
              <button 
                onClick={onClose}
                className="text-white hover:text-gray-200 text-2xl font-bold leading-none p-2"
                aria-label="Cerrar"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {savedSchedules.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">
                No tienes horarios guardados
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Usa el botón de estrella en cualquier horario para guardarlo aquí
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {savedSchedules.map((saved, index) => {
                const groupedSchedule = saved.groupedSchedule;
                
                // Count total alternative sections
                const totalSections = groupedSchedule.sections.reduce(
                  (sum, slot) => sum + slot.sections.length,
                  0
                );
                
                return (
                  <div 
                    key={saved.id}
                    className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-purple-300 transition-colors"
                  >
                    {/* Schedule Header */}
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg font-bold text-gray-800">
                              Horario {index + 1}
                            </span>
                            {saved.name && (
                              <span className="text-sm text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full font-medium">
                                {saved.name}
                              </span>
                            )}
                            {totalSections > groupedSchedule.sections.length && (
                              <span className="text-sm bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-medium">
                                {totalSections} secciones disponibles
                              </span>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <BookOpen className="w-4 h-4" />
                              <span>{groupedSchedule.metadata.totalCredits} créditos</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4" />
                              <span>{groupedSchedule.metadata.daysOnCampus} días</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              <span>
                                Sale a las {groupedSchedule.metadata.latestEndTime.substring(0, 2)}:
                                {groupedSchedule.metadata.latestEndTime.substring(2)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-500 mt-2">
                            Guardado el {formatDate(saved.savedAt)}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => onRemove(saved.id)}
                          className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar de guardados"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Schedule Grid */}
                    <div className="bg-white p-4">
                      <WeeklyGrid 
                        groupedSchedule={groupedSchedule}
                        timeBlocks={timeBlocks}
                        onRemoveTimeBlock={onRemoveTimeBlock}
                        onEditTimeBlock={onEditTimeBlock}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
