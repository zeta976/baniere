import { useState } from 'react';
import { Clock, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { useFilters } from '../../hooks/useFilters';
import { DAYS, DAY_NAMES_ES } from '../../types/filter';
import Input from '../common/Input';

export default function FilterPanel() {
  const { filters, updateFilter } = useFilters();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const toggleFreeDay = (day: string) => {
    const current = filters.freeDays || [];
    if (current.includes(day)) {
      updateFilter('freeDays', current.filter(d => d !== day));
    } else {
      updateFilter('freeDays', [...current, day]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Filtros</h2>

      <div className="space-y-4">
        {/* Only Open Sections */}
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={filters.onlyOpenSections || false}
            onChange={(e) => updateFilter('onlyOpenSections', e.target.checked)}
            className="rounded text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm">Solo secciones abiertas</span>
        </label>

        {/* Prefer Compact */}
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={filters.preferCompact || false}
            onChange={(e) => updateFilter('preferCompact', e.target.checked)}
            className="rounded text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm">Preferir horarios compactos</span>
        </label>

        {/* Time Constraints */}
        <div className="space-y-3">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 mr-1" />
              Hora mínima de inicio
            </label>
            <Input
              type="time"
              value={filters.minStartTime ? `${filters.minStartTime.substring(0, 2)}:${filters.minStartTime.substring(2)}` : ''}
              onChange={(e) => {
                const value = e.target.value.replace(':', '');
                updateFilter('minStartTime', value || undefined);
              }}
              placeholder="Ej: 08:00"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 mr-1" />
              Hora máxima de finalización
            </label>
            <Input
              type="time"
              value={filters.maxEndTime ? `${filters.maxEndTime.substring(0, 2)}:${filters.maxEndTime.substring(2)}` : ''}
              onChange={(e) => {
                const value = e.target.value.replace(':', '');
                updateFilter('maxEndTime', value || undefined);
              }}
              placeholder="Ej: 18:00"
            />
          </div>
        </div>

        {/* Free Days */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 mr-1" />
            Días libres
          </label>
          <div className="grid grid-cols-2 gap-2">
            {DAYS.map((day) => (
              <button
                key={day}
                onClick={() => toggleFreeDay(day)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  filters.freeDays?.includes(day)
                    ? 'bg-primary-100 border-primary-600 text-primary-900'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {DAY_NAMES_ES[day]}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors pt-2 border-t"
        >
          <span>Filtros Avanzados</span>
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gap máximo entre clases (minutos)
              </label>
              <Input
                type="number"
                value={filters.maxGapMinutes || ''}
                onChange={(e) => updateFilter('maxGapMinutes', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Ej: 120"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profesores preferidos (separados por coma)
              </label>
              <Input
                type="text"
                value={filters.requiredProfessors?.join(', ') || ''}
                onChange={(e) => {
                  const value = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                  updateFilter('requiredProfessors', value.length > 0 ? value : undefined);
                }}
                placeholder="Ej: García, López"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profesores a evitar (separados por coma)
              </label>
              <Input
                type="text"
                value={filters.forbiddenProfessors?.join(', ') || ''}
                onChange={(e) => {
                  const value = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                  updateFilter('forbiddenProfessors', value.length > 0 ? value : undefined);
                }}
                placeholder="Ej: Pérez, Martínez"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
