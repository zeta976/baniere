import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Ban, Star } from 'lucide-react';
import { Schedule } from '../../types/schedule';
import WeeklyGrid from './WeeklyGrid';
import Loading from '../common/Loading';
import AddTimeBlockModal from './AddTimeBlockModal';
import { groupEquivalentSchedules } from '../../utils/scheduleGrouping';
import { TimeBlock } from '../../types/timeBlock';

import { GroupedSchedule } from '../../utils/scheduleGrouping';

interface ScheduleViewerProps {
  schedules: Schedule[];
  isLoading: boolean;
  timeBlocks?: TimeBlock[];
  onTimeBlocksChange?: (blocks: TimeBlock[]) => void;
  onSaveSchedule?: (groupedSchedule: GroupedSchedule) => void;
  onUnsaveSchedule?: (scheduleId: string) => void;
  isSaved?: (scheduleId: string) => boolean;
}

export default function ScheduleViewer({ 
  schedules, 
  isLoading,
  timeBlocks = [],
  onTimeBlocksChange,
  onSaveSchedule,
  onUnsaveSchedule,
  isSaved
}: ScheduleViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAddBlockModal, setShowAddBlockModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | undefined>();

  // Group equivalent schedules
  const groupedSchedules = useMemo(() => {
    return groupEquivalentSchedules(schedules);
  }, [schedules]);

  const handleAddTimeBlock = (blocks: TimeBlock[]) => {
    if (onTimeBlocksChange) {
      onTimeBlocksChange([...timeBlocks, ...blocks]);
    }
  };

  const handleRemoveTimeBlock = (blockId: string) => {
    if (onTimeBlocksChange) {
      onTimeBlocksChange(timeBlocks.filter(b => b.id !== blockId));
    }
  };

  const handleEditTimeBlock = (updatedBlock: TimeBlock) => {
    if (onTimeBlocksChange) {
      onTimeBlocksChange(timeBlocks.map(b => b.id === updatedBlock.id ? updatedBlock : b));
    }
  };

  const openEditModal = (block: TimeBlock) => {
    setEditingBlock(block);
    setShowAddBlockModal(true);
  };

  const closeModal = () => {
    setShowAddBlockModal(false);
    setEditingBlock(undefined);
  };

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

  if (groupedSchedules.length === 0) {
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

  const currentGroupedSchedule = groupedSchedules[currentIndex];
  const isCurrentSaved = isSaved ? isSaved(currentGroupedSchedule?.id) : false;

  const handleToggleSave = () => {
    if (!currentGroupedSchedule) return;
    
    if (isCurrentSaved) {
      onUnsaveSchedule?.(currentGroupedSchedule.id);
    } else {
      onSaveSchedule?.(currentGroupedSchedule);
    }
  };
  
  // Count total sections across all courses
  const totalAlternativeSections = currentGroupedSchedule.sections.reduce(
    (sum, slot) => sum + slot.sections.length, 
    0
  );

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">
                Horario {currentIndex + 1} de {groupedSchedules.length}
              </h2>
              {totalAlternativeSections > currentGroupedSchedule.sections.length && (
                <span className="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">
                  {totalAlternativeSections} secciones disponibles
                </span>
              )}
            </div>
            <div className="flex gap-4 mt-2 text-sm text-gray-600">
              <span>Créditos: {currentGroupedSchedule.metadata.totalCredits}</span>
              <span>Días: {currentGroupedSchedule.metadata.daysOnCampus}</span>
              <span>
                Sale a las: {currentGroupedSchedule.metadata.latestEndTime.substring(0, 2)}:
                {currentGroupedSchedule.metadata.latestEndTime.substring(2)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {schedules.length} combinaciones agrupadas en {groupedSchedules.length} horarios únicos
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Save/Unsave Button */}
            {onSaveSchedule && currentGroupedSchedule && (
              <button
                onClick={handleToggleSave}
                className={`px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${
                  isCurrentSaved
                    ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
                title={isCurrentSaved ? 'Quitar de guardados' : 'Guardar horario'}
              >
                <Star className={`w-4 h-4 ${isCurrentSaved ? 'fill-current' : ''}`} />
                {isCurrentSaved ? 'Guardado' : 'Guardar'}
              </button>
            )}
            
            {/* Time Block Controls */}
            <button
              onClick={() => setShowAddBlockModal(true)}
              className="px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
              title="Bloquear franja horaria"
            >
              <Ban className="w-4 h-4" />
              Bloquear Franja
            </button>
            
            <div className="border-l border-gray-300 h-8 mx-2"></div>
            
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentIndex(Math.min(groupedSchedules.length - 1, currentIndex + 1))}
              disabled={currentIndex === groupedSchedules.length - 1}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="p-4">
        <WeeklyGrid 
          groupedSchedule={currentGroupedSchedule} 
          timeBlocks={timeBlocks}
          onRemoveTimeBlock={handleRemoveTimeBlock}
          onEditTimeBlock={openEditModal}
        />
      </div>
      
      {/* Add Time Block Modal */}
      <AddTimeBlockModal 
        isOpen={showAddBlockModal}
        onClose={closeModal}
        onAddBlock={handleAddTimeBlock}
        editBlock={editingBlock}
        onEditBlock={handleEditTimeBlock}
      />
    </div>
  );
}
