import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Course } from '../../types/course';
import { DAYS, DAY_ABBR_ES } from '../../types/filter';
import { timeToMinutes } from '../../utils/timeFormatter';
import CourseDetailsModal from './CourseDetailsModal';
import SectionSelectorModal from './SectionSelectorModal';
import TimeBlockOverlay from './TimeBlockOverlay';
import { GroupedSchedule, GroupedCourseSlot } from '../../utils/scheduleGrouping';
import { TimeBlock } from '../../types/timeBlock';

interface WeeklyGridProps {
  groupedSchedule: GroupedSchedule;
  timeBlocks?: TimeBlock[];
  onRemoveTimeBlock?: (blockId: string) => void;
  onEditTimeBlock?: (block: TimeBlock) => void;
  onRequireSection?: (crn: string) => void;
  onForbidSection?: (crn: string) => void;
  requiredSections?: string[];
  forbiddenSections?: string[];
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM to 8 PM
const COLORS = [
  'bg-blue-100 border-blue-300 text-blue-900',
  'bg-green-100 border-green-300 text-green-900',
  'bg-purple-100 border-purple-300 text-purple-900',
  'bg-orange-100 border-orange-300 text-orange-900',
  'bg-pink-100 border-pink-300 text-pink-900',
  'bg-indigo-100 border-indigo-300 text-indigo-900',
];

export default function WeeklyGrid({ 
  groupedSchedule, 
  timeBlocks = [], 
  onRemoveTimeBlock,
  onEditTimeBlock,
  onRequireSection,
  onForbidSection,
  requiredSections = [],
  forbiddenSections = []
}: WeeklyGridProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectorSlot, setSelectorSlot] = useState<GroupedCourseSlot | null>(null);
  
  const courseColors = new Map<string, string>();
  groupedSchedule.sections.forEach((slot, idx) => {
    courseColors.set(slot.subjectCourse, COLORS[idx % COLORS.length]);
  });

  const handleBlockClick = (slot: GroupedCourseSlot) => {
    if (slot.sections.length === 1) {
      // Only one section, show details directly
      setSelectedCourse(slot.sections[0]);
    } else {
      // Multiple sections, show selector first
      setSelectorSlot(slot);
    }
  };

  const handleSectionSelect = (section: Course) => {
    setSelectorSlot(null);
    setSelectedCourse(section);
  };

  const getBlocksForDay = (day: string) => {
    const blocks: Array<{
      slot: GroupedCourseSlot;
      course: Course;
      start: number;
      end: number;
      duration: number;
      color: string;
      lane: number;
      totalLanes: number;
    }> = [];

    // First, collect all blocks with their time ranges
    const rawBlocks: Array<{
      slot: GroupedCourseSlot;
      course: Course;
      start: number;
      end: number;
      duration: number;
      color: string;
    }> = [];

    groupedSchedule.sections.forEach((slot) => {
      const section = slot.displaySection;
      section.meetingTimes.forEach((meeting) => {
        if (meeting.days.includes(day) && meeting.beginTime !== 'TBA') {
          const start = timeToMinutes(meeting.beginTime);
          const end = timeToMinutes(meeting.endTime);
          const duration = end - start;

          rawBlocks.push({
            slot,
            course: section,
            start,
            end,
            duration,
            color: courseColors.get(section.subjectCourse) || COLORS[0]
          });
        }
      });
    });

    // Sort blocks by start time, then by end time
    rawBlocks.sort((a, b) => a.start - b.start || a.end - b.end);

    // Assign lanes to overlapping blocks
    const lanes: Array<Array<typeof rawBlocks[0]>> = [];
    
    rawBlocks.forEach((block) => {
      // Find the first lane where this block doesn't overlap with the last block
      let assignedLane = -1;
      for (let i = 0; i < lanes.length; i++) {
        const lastBlockInLane = lanes[i][lanes[i].length - 1];
        // Blocks overlap if start < otherEnd AND end > otherStart
        if (block.start >= lastBlockInLane.end) {
          assignedLane = i;
          break;
        }
      }
      
      // If no suitable lane found, create a new one
      if (assignedLane === -1) {
        assignedLane = lanes.length;
        lanes.push([]);
      }
      
      lanes[assignedLane].push(block);
    });

    // Calculate total lanes needed for each time slot
    const getMaxOverlappingLanes = (start: number, end: number): number => {
      let maxLanes = 0;
      lanes.forEach((lane) => {
        const hasOverlap = lane.some((b) => b.start < end && b.end > start);
        if (hasOverlap) maxLanes++;
      });
      return maxLanes;
    };

    // Build final blocks with lane information
    lanes.forEach((lane, laneIndex) => {
      lane.forEach((block) => {
        const totalLanes = getMaxOverlappingLanes(block.start, block.end);
        blocks.push({
          ...block,
          lane: laneIndex,
          totalLanes
        });
      });
    });

    return blocks;
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header */}
        <div className="grid grid-cols-7 border-b">
          <div className="p-2 text-sm font-medium text-gray-500"></div>
          {DAYS.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-semibold text-gray-700">
              {DAY_ABBR_ES[day]}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7">
          {/* Time labels */}
          <div className="border-r">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="h-16 border-b text-xs text-gray-500 pr-2 text-right pt-1"
              >
                {hour}:00
              </div>
            ))}
          </div>

          {/* Days */}
          {DAYS.map((day) => (
            <div key={day} className="border-r relative">
              {HOURS.map((hour) => (
                <div key={hour} className="h-16 border-b"></div>
              ))}

              {/* Course blocks */}
              {getBlocksForDay(day).map((block, idx) => {
                const topOffset = ((block.start - 7 * 60) / 60) * 64; // 64px per hour
                const height = (block.duration / 60) * 64;
                
                // Calculate width and position based on lanes
                const widthPercent = 100 / block.totalLanes;
                const leftPercent = (block.lane / block.totalLanes) * 100;
                
                // Check if this section is required or forbidden
                const isRequired = requiredSections.includes(block.course.courseReferenceNumber);
                const isForbidden = forbiddenSections.includes(block.course.courseReferenceNumber);

                return (
                  <div
                    key={idx}
                    className={`absolute px-2 py-1 rounded border ${block.color} overflow-hidden cursor-pointer hover:shadow-lg hover:z-10 transition-shadow ${
                      isRequired ? 'ring-2 ring-green-500 ring-offset-1' : ''
                    } ${
                      isForbidden ? 'ring-2 ring-red-500 ring-offset-1 opacity-60' : ''
                    }`}
                    style={{
                      top: `${topOffset}px`,
                      height: `${height}px`,
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`
                    }}
                    onClick={() => handleBlockClick(block.slot)}
                    title={block.slot.sections.length > 1 
                      ? `Click para ver ${block.slot.sections.length} secciones disponibles` 
                      : "Click para ver detalles"}
                  >
                    <div className="text-xs font-semibold flex items-center justify-between">
                      <span className="truncate">{block.course.subjectCourse}</span>
                      <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                        {isRequired && (
                          <span title="Sección obligatoria">
                            <CheckCircle2 className="w-3 h-3 text-green-600" />
                          </span>
                        )}
                        {isForbidden && (
                          <span title="Sección excluida">
                            <XCircle className="w-3 h-3 text-red-600" />
                          </span>
                        )}
                        {block.course.cycle && (
                          <span className="text-[10px] bg-white bg-opacity-70 px-1 rounded">
                            C{block.course.cycle}
                          </span>
                        )}
                        {block.slot.sections.length > 1 && (
                          <span className="text-[10px] bg-purple-200 text-purple-800 px-1 rounded font-bold">
                            {block.slot.sections.length}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs truncate">
                      {block.slot.sections.length > 1 
                        ? `${block.slot.sections.length} secciones`
                        : `Sec. ${block.course.section}`}
                    </div>
                    {block.course.meetingTimes[0]?.room && (
                      <div className="text-xs truncate">{block.course.meetingTimes[0].room}</div>
                    )}
                  </div>
                );
              })}
              
              {/* Time Blocks Overlay */}
              <TimeBlockOverlay 
                blocks={timeBlocks.filter(block => block.day === day)}
                onRemoveBlock={onRemoveTimeBlock || (() => {})}
                onEditBlock={onEditTimeBlock || (() => {})}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Section Selector Modal */}
      {selectorSlot && (
        <SectionSelectorModal 
          sections={selectorSlot.sections}
          onSelect={handleSectionSelect}
          onClose={() => setSelectorSlot(null)}
        />
      )}
      
      {/* Course Details Modal */}
      <CourseDetailsModal 
        course={selectedCourse}
        onClose={() => setSelectedCourse(null)}
        onRequireSection={onRequireSection}
        onForbidSection={onForbidSection}
        isRequired={selectedCourse ? requiredSections.includes(selectedCourse.courseReferenceNumber) : false}
        isForbidden={selectedCourse ? forbiddenSections.includes(selectedCourse.courseReferenceNumber) : false}
      />
    </div>
  );
}
