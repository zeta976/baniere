import { useState } from 'react';
import { TimeBlock, generateTimeBlockId, formatTimeForDisplay, timeToMinutes } from '../../types/timeBlock';
import { DAYS, DAY_NAMES_ES, DayOfWeek } from '../../types/filter';

interface AddTimeBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBlock: (blocks: TimeBlock[]) => void;
  editBlock?: TimeBlock;
  onEditBlock?: (block: TimeBlock) => void;
  preselectedDay?: DayOfWeek;
  preselectedStartTime?: string;
  preselectedEndTime?: string;
}

export default function AddTimeBlockModal({
  isOpen,
  onClose,
  onAddBlock,
  editBlock,
  onEditBlock,
  preselectedDay,
  preselectedStartTime,
  preselectedEndTime
}: AddTimeBlockModalProps) {
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(
    editBlock ? [editBlock.day as DayOfWeek] : preselectedDay ? [preselectedDay] : []
  );
  const [startTime, setStartTime] = useState(editBlock?.startTime || preselectedStartTime || '0800');
  const [endTime, setEndTime] = useState(editBlock?.endTime || preselectedEndTime || '1000');
  const [label, setLabel] = useState(editBlock?.label || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (selectedDays.length === 0) {
      alert('Debes seleccionar al menos un día');
      return;
    }

    if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
      alert('La hora de inicio debe ser antes de la hora de fin');
      return;
    }

    // Edit mode
    if (editBlock && onEditBlock) {
      const updatedBlock: TimeBlock = {
        ...editBlock,
        day: selectedDays[0], // In edit mode, only one day
        startTime,
        endTime,
        label: label.trim() || undefined
      };
      onEditBlock(updatedBlock);
      onClose();
      return;
    }

    // Create mode - one block per selected day
    const newBlocks: TimeBlock[] = selectedDays.map(day => ({
      id: generateTimeBlockId(),
      day,
      startTime,
      endTime,
      label: label.trim() || undefined
    }));

    onAddBlock(newBlocks);
    onClose();
    
    // Reset form
    setSelectedDays([]);
    setStartTime('0800');
    setEndTime('1000');
    setLabel('');
  };

  const toggleDay = (day: DayOfWeek) => {
    // In edit mode, only allow single day selection
    if (editBlock) {
      setSelectedDays([day]);
      return;
    }
    
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  // Generate time options (every 30 minutes from 7 AM to 9 PM)
  const timeOptions: string[] = [];
  for (let hour = 7; hour <= 21; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}${minute.toString().padStart(2, '0')}`;
      timeOptions.push(time);
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold">🚫 {editBlock ? 'Editar' : 'Bloquear'} Franja</h2>
              <p className="text-red-100 text-sm mt-1">
                {editBlock ? 'Modifica esta franja bloqueada' : 'Evita secciones en estas franjas horarias'}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold leading-none"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Day Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {editBlock ? 'Día de la semana (solo uno)' : 'Días de la semana (puedes seleccionar varios)'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DAYS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(d)}
                  className={`px-3 py-2 rounded-lg border-2 font-medium text-sm transition-colors ${
                    selectedDays.includes(d)
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {DAY_NAMES_ES[d]}
                </button>
              ))}
            </div>
            {editBlock && (
              <p className="text-xs text-gray-500 mt-1">
                En modo edición solo puedes seleccionar un día
              </p>
            )}
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora de inicio
              </label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {formatTimeForDisplay(time)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora de fin
              </label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {formatTimeForDisplay(time)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Label (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Etiqueta (opcional)
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ej: Almuerzo, Trabajo, Gimnasio..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              maxLength={30}
            />
          </div>

          {/* Preview */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Vista previa:</span>
            </p>
            {selectedDays.length > 0 ? (
              <div className="text-sm text-red-700 mt-1">
                {selectedDays.map((d, i) => (
                  <div key={d}>
                    {i > 0 && <span className="text-gray-400"> • </span>}
                    <span>{DAY_NAMES_ES[d]}</span>
                  </div>
                ))}
                <div className="mt-1">
                  {formatTimeForDisplay(startTime)} a {formatTimeForDisplay(endTime)}
                  {label && ` - ${label}`}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-1">Selecciona al menos un día</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              {editBlock ? 'Guardar Cambios' : 'Bloquear Franja'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
