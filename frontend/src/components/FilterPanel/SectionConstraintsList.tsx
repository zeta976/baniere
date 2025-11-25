import { CheckCircle2, XCircle, Trash2 } from 'lucide-react';

interface SectionConstraintsListProps {
  requiredSections: string[];
  forbiddenSections: string[];
  onRemoveRequired: (crn: string) => void;
  onRemoveForbidden: (crn: string) => void;
}

export default function SectionConstraintsList({
  requiredSections,
  forbiddenSections,
  onRemoveRequired,
  onRemoveForbidden
}: SectionConstraintsListProps) {
  const hasConstraints = requiredSections.length > 0 || forbiddenSections.length > 0;

  // Always show the section when there are constraints
  if (!hasConstraints) {
    return null;
  }

  return (
    <div className="space-y-3 border-t pt-4">
      <label className="block text-sm font-medium text-gray-700">
        🎯 Restricciones de Secciones
      </label>

      {/* Required Sections */}
      {requiredSections.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-green-600" />
            Obligatorias ({requiredSections.length})
          </p>
          {requiredSections.map((crn) => (
            <div
              key={crn}
              className="bg-green-50 border border-green-200 rounded-lg p-2 group hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-green-700 truncate">
                    CRN: {crn}
                  </span>
                </div>
                <button
                  onClick={() => onRemoveRequired(crn)}
                  className="p-1 bg-white hover:bg-red-50 text-red-600 rounded transition-colors opacity-0 group-hover:opacity-100"
                  title="Quitar restricción"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Forbidden Sections */}
      {forbiddenSections.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-600 font-medium flex items-center gap-1">
            <XCircle className="w-3 h-3 text-red-600" />
            Excluidas ({forbiddenSections.length})
          </p>
          {forbiddenSections.map((crn) => (
            <div
              key={crn}
              className="bg-red-50 border border-red-200 rounded-lg p-2 group hover:bg-red-100 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-red-700 truncate">
                    CRN: {crn}
                  </span>
                </div>
                <button
                  onClick={() => onRemoveForbidden(crn)}
                  className="p-1 bg-white hover:bg-red-50 text-red-600 rounded transition-colors opacity-0 group-hover:opacity-100"
                  title="Quitar restricción"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
