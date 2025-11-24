import { Course } from '../../types/course';

interface SectionSelectorModalProps {
  sections: Course[];
  onSelect: (section: Course) => void;
  onClose: () => void;
}

export default function SectionSelectorModal({ 
  sections, 
  onSelect, 
  onClose 
}: SectionSelectorModalProps) {
  if (sections.length === 0) return null;

  const courseCode = sections[0].subjectCourse;
  const courseTitle = sections[0].courseTitle;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold">Selecciona una sección</h2>
              <p className="text-purple-100 mt-1">{courseCode} - {courseTitle}</p>
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

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Hay <span className="font-bold text-purple-600">{sections.length} secciones disponibles</span> en este horario. 
            Selecciona una para ver sus detalles:
          </p>

          <div className="space-y-3">
            {sections.map((section) => {
              const seatsAvailable = section.seatsAvailable;
              const isOpen = section.openSection;
              const professor = section.faculty[0]?.displayName || 'Por Asignar';

              return (
                <button
                  key={section.courseReferenceNumber}
                  onClick={() => onSelect(section)}
                  className="w-full text-left bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-purple-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl font-bold text-purple-600">
                          Sección {section.section}
                        </span>
                        {section.cycle && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                            Ciclo {section.cycle}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded font-medium ${
                          isOpen 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {isOpen ? 'Abierta' : 'Cerrada'}
                        </span>
                      </div>

                      <div className="text-sm text-gray-700 space-y-1">
                        <div>
                          <span className="font-medium">👨‍🏫 Profesor:</span> {professor}
                        </div>
                        <div>
                          <span className="font-medium">📊 Cupos:</span>{' '}
                          <span className={seatsAvailable > 0 ? 'text-green-600' : 'text-red-600'}>
                            {seatsAvailable} de {section.maximumEnrollment} disponibles
                          </span>
                        </div>
                        {section.meetingTimes[0]?.room && (
                          <div>
                            <span className="font-medium">📍 Salón:</span> {section.meetingTimes[0].room}
                          </div>
                        )}
                        {section.waitAvailable > 0 && (
                          <div className="text-orange-600">
                            <span className="font-medium">⏳ Lista de espera:</span> {section.waitAvailable} cupos
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ml-4">
                      <svg 
                        className="w-6 h-6 text-purple-500" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M9 5l7 7-7 7" 
                        />
                      </svg>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
