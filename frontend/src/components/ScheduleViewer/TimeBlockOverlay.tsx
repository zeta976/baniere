import { TimeBlock, formatTimeForDisplay } from '../../types/timeBlock';
import { Trash2, Edit3 } from 'lucide-react';

interface TimeBlockOverlayProps {
  blocks: TimeBlock[];
  onRemoveBlock: (blockId: string) => void;
  onEditBlock: (block: TimeBlock) => void;
}

export default function TimeBlockOverlay({ 
  blocks, 
  onRemoveBlock,
  onEditBlock
}: TimeBlockOverlayProps) {
  
  const getBlockPosition = (block: TimeBlock) => {
    const startMinutes = parseInt(block.startTime.substring(0, 2)) * 60 + 
                        parseInt(block.startTime.substring(2, 4));
    const endMinutes = parseInt(block.endTime.substring(0, 2)) * 60 + 
                      parseInt(block.endTime.substring(2, 4));
    
    const topOffset = ((startMinutes - 7 * 60) / 60) * 64; // 64px per hour
    const height = ((endMinutes - startMinutes) / 60) * 64;
    
    return { topOffset, height };
  };

  return (
    <>
      {blocks.map((block) => {
        const { topOffset, height } = getBlockPosition(block);
        
        return (
          <div
            key={block.id}
            className="absolute left-0 right-0 border-2 border-red-400 bg-red-50 bg-opacity-70 rounded z-20 group"
            style={{
              top: `${topOffset}px`,
              height: `${height}px`,
            }}
          >
            <div className="relative h-full pointer-events-none">
              {/* Action buttons - top right corner */}
              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditBlock(block);
                  }}
                  className="p-1.5 bg-white/90 hover:bg-blue-100 text-blue-700 rounded shadow-sm transition-colors"
                  title="Editar franja"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveBlock(block.id);
                  }}
                  className="p-1.5 bg-white/90 hover:bg-red-100 text-red-700 rounded shadow-sm transition-colors"
                  title="Eliminar franja"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Block content */}
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xs font-semibold text-red-700 mb-1">
                    🚫 Bloqueado
                  </div>
                  {block.label && (
                    <div className="text-xs text-red-600 font-medium mb-1">
                      {block.label}
                    </div>
                  )}
                  <div className="text-xs text-red-600">
                    {formatTimeForDisplay(block.startTime)} - {formatTimeForDisplay(block.endTime)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
