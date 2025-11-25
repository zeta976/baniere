import { CheckCircle2, XCircle } from 'lucide-react';
import { Course } from '../../types/course';
import { DAY_NAMES_ES, DayOfWeek } from '../../types/filter';

interface CourseDetailsModalProps {
  course: Course | null;
  onClose: () => void;
  onRequireSection?: (crn: string) => void;
  onForbidSection?: (crn: string) => void;
  isRequired?: boolean;
  isForbidden?: boolean;
}

export default function CourseDetailsModal({ 
  course, 
  onClose,
  onRequireSection,
  onForbidSection,
  isRequired = false,
  isForbidden = false
}: CourseDetailsModalProps) {
  if (!course) return null;

  const formatTime = (time: string): string => {
    if (time === 'TBA') return 'Por definir';
    const hours = time.slice(0, 2);
    const minutes = time.slice(2, 4);
    return `${hours}:${minutes}`;
  };

  const seatsInfo = course.seatsAvailable > 0
    ? `${course.seatsAvailable} de ${course.maximumEnrollment} disponibles`
    : 'Sección llena';

  const waitlistInfo = course.waitAvailable > 0
    ? `Lista de espera: ${course.waitAvailable} cupos`
    : '';

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{course.subjectCourse}</h2>
              <p className="text-blue-100 mt-1">{course.courseTitle}</p>
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
        <div className="px-6 py-5 space-y-5">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 font-medium">Sección</p>
              <p className="text-lg font-semibold">{course.section}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Créditos</p>
              <p className="text-lg font-semibold">{course.creditHours}</p>
            </div>
            {course.cycle && (
              <div>
                <p className="text-sm text-gray-500 font-medium">Ciclo</p>
                <p className="text-lg font-semibold">
                  {course.cycle === 1 ? 'Ciclo 1 (8 semanas)' : 'Ciclo 2 (8 semanas)'}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500 font-medium">Tipo</p>
              <p className="text-lg font-semibold">{course.scheduleType}</p>
            </div>
          </div>

          {/* Enrollment */}
          <div className="border-t pt-4">
            <p className="text-sm text-gray-500 font-medium mb-2">Cupos</p>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span>Inscritos: {course.enrollment}</span>
                  <span className={course.seatsAvailable > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {seatsInfo}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${course.seatsAvailable > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${(course.enrollment / course.maximumEnrollment) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            {waitlistInfo && (
              <p className="text-sm text-orange-600 mt-2">{waitlistInfo}</p>
            )}
          </div>

          {/* Professors */}
          <div className="border-t pt-4">
            <p className="text-sm text-gray-500 font-medium mb-2">Profesor(es)</p>
            <div className="space-y-2">
              {course.faculty.map((prof, idx) => (
                <div key={idx} className="flex items-start space-x-2">
                  <div className="flex-1">
                    <p className="font-medium">{prof.displayName}</p>
                    {prof.email && (
                      <a 
                        href={`mailto:${prof.email}`} 
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {prof.email}
                      </a>
                    )}
                  </div>
                  {prof.isPrimary && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Principal
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Meeting Times */}
          <div className="border-t pt-4">
            <p className="text-sm text-gray-500 font-medium mb-3">Horarios de clase</p>
            <div className="space-y-3">
              {course.meetingTimes.map((meeting, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-gray-900">
                          {meeting.beginTime === 'TBA' 
                            ? 'Por definir' 
                            : `${formatTime(meeting.beginTime)} - ${formatTime(meeting.endTime)}`
                          }
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {meeting.days.map((day) => (
                          <span 
                            key={day}
                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium"
                          >
                            {DAY_NAMES_ES[day as DayOfWeek]}
                          </span>
                        ))}
                      </div>
                      {meeting.buildingDescription && meeting.room && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">📍 </span>
                          {meeting.buildingDescription} - Salón {meeting.room}
                        </div>
                      )}
                      {meeting.startDate && meeting.endDate && (
                        <div className="text-xs text-gray-500 mt-1">
                          {meeting.startDate} → {meeting.endDate}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cross-listed info if available */}
          {course.crossList && (
            <div className="border-t pt-4">
              <p className="text-sm text-gray-500 font-medium">Lista cruzada</p>
              <p className="text-sm text-gray-700">{course.crossList}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg border-t">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              CRN: {course.courseReferenceNumber}
            </p>
            <div className="flex gap-2">
              {onRequireSection && (
                <button
                  onClick={() => {
                    onRequireSection(course.courseReferenceNumber);
                    onClose();
                  }}
                  disabled={isForbidden}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                    isRequired
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-300'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={isRequired ? 'Quitar como obligatoria' : 'Marcar como obligatoria'}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isRequired ? 'Obligatoria' : 'Requerir'}
                </button>
              )}
              {onForbidSection && (
                <button
                  onClick={() => {
                    onForbidSection(course.courseReferenceNumber);
                    onClose();
                  }}
                  disabled={isRequired}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                    isForbidden
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-300'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={isForbidden ? 'Quitar exclusión' : 'Excluir sección'}
                >
                  <XCircle className="w-4 h-4" />
                  {isForbidden ? 'Excluida' : 'Excluir'}
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
