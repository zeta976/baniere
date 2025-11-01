import { Schedule } from '../../types/schedule';
import { Course } from '../../types/course';
import { DAYS, DAY_ABBR_ES } from '../../types/filter';
import { timeToMinutes } from '../../utils/timeFormatter';

interface WeeklyGridProps {
  schedule: Schedule;
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

export default function WeeklyGrid({ schedule }: WeeklyGridProps) {
  const courseColors = new Map<string, string>();
  schedule.sections.forEach((section, idx) => {
    courseColors.set(section.subjectCourse, COLORS[idx % COLORS.length]);
  });

  const getBlocksForDay = (day: string) => {
    const blocks: Array<{
      course: Course;
      start: number;
      duration: number;
      color: string;
    }> = [];

    schedule.sections.forEach((section) => {
      section.meetingTimes.forEach((meeting) => {
        if (meeting.days.includes(day) && meeting.beginTime !== 'TBA') {
          const start = timeToMinutes(meeting.beginTime);
          const end = timeToMinutes(meeting.endTime);
          const duration = end - start;

          blocks.push({
            course: section,
            start,
            duration,
            color: courseColors.get(section.subjectCourse) || COLORS[0]
          });
        }
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

                return (
                  <div
                    key={idx}
                    className={`absolute left-0 right-0 mx-1 px-2 py-1 rounded border ${block.color} overflow-hidden`}
                    style={{
                      top: `${topOffset}px`,
                      height: `${height}px`
                    }}
                  >
                    <div className="text-xs font-semibold flex items-center justify-between">
                      <span>{block.course.subjectCourse}</span>
                      {block.course.cycle && (
                        <span className="text-[10px] bg-white bg-opacity-70 px-1 rounded">
                          C{block.course.cycle}
                        </span>
                      )}
                    </div>
                    <div className="text-xs">Sec. {block.course.section}</div>
                    {block.course.meetingTimes[0]?.room && (
                      <div className="text-xs">{block.course.meetingTimes[0].room}</div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
