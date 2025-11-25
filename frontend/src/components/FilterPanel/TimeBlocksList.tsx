import { Edit3, Trash2, Ban } from 'lucide-react';
import { TimeBlock, formatTimeForDisplay } from '../../types/timeBlock';
import { DAY_NAMES_ES, DayOfWeek } from '../../types/filter';

interface TimeBlocksListProps {
  timeBlocks: TimeBlock[];
  onEdit: (block: TimeBlock) => void;
  onRemove: (blockId: string) => void;
  onAdd: () => void;
}

export default function TimeBlocksList({
  timeBlocks,
  onEdit,
  onRemove,
  onAdd
}: TimeBlocksListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <Ban className="w-4 h-4 mr-2 text-red-600" />
          Franjas Bloqueadas
        </label>
        <button
          onClick={onAdd}
          className="text-xs px-2 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded font-medium transition-colors"
          title="Agregar franja bloqueada"
        >
          + Agregar
        </button>
      </div>

      {timeBlocks.length === 0 ? (
        <p className="text-xs text-gray-500 italic">
          No hay franjas bloqueadas
        </p>
      ) : (
        <div className="space-y-2">
          {timeBlocks.map((block) => (
            <div
              key={block.id}
              className="bg-red-50 border border-red-200 rounded-lg p-2 group hover:bg-red-100 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-red-700">
                      {DAY_NAMES_ES[block.day as DayOfWeek]}
                    </span>
                    {block.label && (
                      <span className="text-xs text-red-600 italic truncate">
                        {block.label}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-red-600 mt-0.5">
                    {formatTimeForDisplay(block.startTime)} - {formatTimeForDisplay(block.endTime)}
                  </div>
                </div>
                
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(block)}
                    className="p-1 bg-white hover:bg-blue-50 text-blue-600 rounded transition-colors"
                    title="Editar franja"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onRemove(block.id)}
                    className="p-1 bg-white hover:bg-red-50 text-red-600 rounded transition-colors"
                    title="Eliminar franja"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
