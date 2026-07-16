import React, { useState, useMemo } from 'react';
import { Shoot } from '../types';
import { formatTime } from '../utils';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  User, 
  CheckCircle,
  FileText
} from 'lucide-react';

interface CalendarViewProps {
  shoots: Shoot[];
  onSelectShoot: (shoot: Shoot) => void;
  onAddShoot: (dateStr: string) => void;
}

export default function CalendarView({
  shoots,
  onSelectShoot,
  onAddShoot
}: CalendarViewProps) {
const indiaNow = new Date(
  new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata',
  })
);

const todayStr = `${indiaNow.getFullYear()}-${String(
  indiaNow.getMonth() + 1
).padStart(2, '0')}-${String(indiaNow.getDate()).padStart(2, '0')}`;

const [currentDate, setCurrentDate] = useState<Date>(
  new Date(indiaNow.getFullYear(), indiaNow.getMonth(), 1)
);

const [selectedDateStr, setSelectedDateStr] =
  useState<string>(todayStr);
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Grid dates generation
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const days: { date: Date; dateStr: string; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1, prevMonthDays - i);
      const mStr = String(d.getMonth() + 1).padStart(2, '0');
      const dStr = String(d.getDate()).padStart(2, '0');
      days.push({
        date: d,
        dateStr: `${d.getFullYear()}-${mStr}-${dStr}`,
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(currentYear, currentMonth, i);
      const mStr = String(currentMonth + 1).padStart(2, '0');
      const dStr = String(i).padStart(2, '0');
      days.push({
        date: d,
        dateStr: `${currentYear}-${mStr}-${dStr}`,
        isCurrentMonth: true
      });
    }

    // Next month padding (to fill 42 cells)
    const totalCells = 42; // standard 6 rows
    const nextPadding = totalCells - days.length;
    for (let i = 1; i <= nextPadding; i++) {
      const d = new Date(currentYear, currentMonth + 1, i);
      const mStr = String(d.getMonth() + 1).padStart(2, '0');
      const dStr = String(i).padStart(2, '0');
      days.push({
        date: d,
        dateStr: `${d.getFullYear()}-${mStr}-${dStr}`,
        isCurrentMonth: false
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Map dates to shoots
  const shootsByDate = useMemo(() => {
    const map: Record<string, Shoot[]> = {};
    shoots.forEach(shoot => {
      if (!map[shoot.date]) {
        map[shoot.date] = [];
      }
      map[shoot.date].push(shoot);
    });
    return map;
  }, [shoots]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleSelectDay = (dateStr: string) => {
    setSelectedDateStr(dateStr);
  };

  // Get shoots for the selected date
  const selectedDayShoots = shootsByDate[selectedDateStr] || [];

  // Parse selected day for human reading
  const formattedSelectedDay = useMemo(() => {
    const [y, m, d] = selectedDateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }, [selectedDateStr]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
      
      {/* Calendar Section (7 Columns) */}
      <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col justify-between">
        
        {/* Month Selector Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-zinc-100 text-zinc-800 rounded-xl">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
                {monthNames[currentMonth]} {currentYear}
              </h2>
              <p className="text-xs text-zinc-500">Master Production Calendar</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-zinc-50 border border-zinc-200 text-zinc-600 hover:text-zinc-900 rounded-xl transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setCurrentDate(new Date(2026, 6, 1)); // Back to July 2026
                setSelectedDateStr('2026-07-16');
              }}
              className="px-3 py-1.5 hover:bg-zinc-50 border border-zinc-200 text-zinc-700 hover:text-zinc-900 text-xs font-mono rounded-xl transition"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-zinc-50 border border-zinc-200 text-zinc-600 hover:text-zinc-900 rounded-xl transition"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-mono tracking-wider text-zinc-400 mb-2">
          <div>SUN</div>
          <div>MON</div>
          <div>TUE</div>
          <div>WED</div>
          <div>THU</div>
          <div>FRI</div>
          <div>SAT</div>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map(({ date, dateStr, isCurrentMonth }) => {
            const dayShoots = shootsByDate[dateStr] || [];
            const hasShoots = dayShoots.length > 0;
            const isSelected = dateStr === selectedDateStr;
            const isToday = dateStr === '2026-07-16';
            const isPast = dateStr < '2026-07-16';

            // Determine border color for completed/shoot types
            let borderClass = 'border-zinc-200';
            let dotClass = '';
            
            if (hasShoots) {
              const allCompleted = dayShoots.every(s => s.isCompleted);
              if (allCompleted) {
                borderClass = 'border-emerald-200 bg-emerald-50/50';
                dotClass = 'bg-emerald-500';
              } else {
                const types = dayShoots.map(s => s.shootType);
                if (types.includes('Reels')) {
                  borderClass = 'border-purple-200 bg-purple-50/50';
                  dotClass = 'bg-purple-500';
                } else if (types.includes('Videography')) {
                  borderClass = 'border-red-200 bg-red-50/50';
                  dotClass = 'bg-red-500';
                } else {
                  borderClass = 'border-blue-200 bg-blue-50/50';
                  dotClass = 'bg-blue-500';
                }
              }
            }

            return (
              <button
                key={dateStr}
                onClick={() => handleSelectDay(dateStr)}
                className={`min-h-[75px] md:min-h-[90px] p-1.5 flex flex-col justify-between items-stretch rounded-xl border text-left transition-all duration-200 relative overflow-hidden ${
                  isSelected 
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-md ring-1 ring-zinc-900' 
                    : isCurrentMonth 
                      ? 'bg-white text-zinc-800 hover:bg-zinc-50 ' + borderClass
                      : 'bg-zinc-50/40 text-zinc-400 ' + borderClass
                } ${isPast && !isSelected ? 'opacity-80' : ''}`}
                id={`calendar-cell-${dateStr}`}
              >
                {/* Date & Indicator Row */}
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-mono font-medium rounded-md px-1.5 py-0.5 ${
                    isToday 
                      ? isSelected ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-white font-semibold' 
                      : isSelected 
                        ? 'text-zinc-100' 
                        : isCurrentMonth 
                          ? 'text-zinc-800' 
                          : 'text-zinc-400'
                  }`}>
                    {date.getDate()}
                  </span>

                  {/* Shoot count indicator dot if multiple */}
                  {hasShoots && (
                    <span className={`w-1.5 h-1.5 rounded-full ${dotClass} animate-pulse`} />
                  )}
                </div>

                {/* Event text preview */}
                <div className="mt-1 flex-grow flex flex-col justify-end text-[10px] leading-tight">
                  {dayShoots.length === 1 && (
                    <div className={`truncate px-1 py-0.5 rounded font-medium ${
                      dayShoots[0].isCompleted 
                        ? 'text-emerald-700 border border-emerald-200 bg-emerald-50' 
                        : dayShoots[0].shootType === 'Photography' 
                          ? 'text-blue-700 bg-blue-50 border border-blue-100' 
                          : dayShoots[0].shootType === 'Videography' 
                            ? 'text-red-700 bg-red-50 border border-red-100' 
                            : 'text-purple-700 bg-purple-50 border border-purple-100'
                    }`}>
                      {dayShoots[0].title}
                    </div>
                  )}

                  {dayShoots.length > 1 && (
                    <div className={`font-mono font-semibold px-1 py-0.5 rounded border text-center ${
                      isSelected 
                        ? 'text-zinc-200 bg-zinc-800 border-zinc-700' 
                        : 'text-zinc-700 bg-zinc-100 border-zinc-200'
                    }`}>
                      {dayShoots.length} Shoots
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Shoots Sidebar (4 Columns) */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        
        {/* Day Details Header */}
        <div className="bg-white border border-zinc-200 p-5 rounded-2xl">
          <div className="flex justify-between items-start gap-2 mb-4">
            <div>
              <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Schedule For</h3>
              <p className="text-base font-bold text-zinc-900 leading-snug mt-1">{formattedSelectedDay}</p>
            </div>
            <button
              onClick={() => onAddShoot(selectedDateStr)}
              className="p-2.5 bg-zinc-900 hover:bg-zinc-850 text-white rounded-xl transition-all duration-200 shrink-0 shadow-sm"
              title="Add Shoot for this Date"
              id="add-shoot-btn-sidebar"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center text-xs text-zinc-400 border-t border-zinc-100 pt-3">
            <span>Total Shoots: <strong className="text-zinc-800 font-mono">{selectedDayShoots.length}</strong></span>
          </div>
        </div>

        {/* Shoots List Container */}
        <div className="flex-grow bg-white border border-zinc-200 rounded-2xl p-4 flex flex-col min-h-[300px]">
          <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-3">Shoot Entries</h4>

          {selectedDayShoots.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-6 border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
              <CalendarIcon className="w-8 h-8 text-zinc-300 mb-2" />
              <p className="text-zinc-500 text-xs">No shoots booked for this date.</p>
              <button
                onClick={() => onAddShoot(selectedDateStr)}
                className="mt-3 px-3 py-1.5 bg-zinc-100 border border-zinc-200 hover:border-zinc-300 text-zinc-800 text-xs font-medium rounded-lg transition"
              >
                Quick Book
              </button>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[420px] pr-1">
              {selectedDayShoots.map(shoot => (
                <div
                  key={shoot.id}
                  onClick={() => onSelectShoot(shoot)}
                  className={`border p-4 rounded-xl cursor-pointer transition-all duration-200 hover:bg-zinc-50 hover:translate-x-1 group relative overflow-hidden ${
                    shoot.isCompleted 
                      ? 'border-emerald-200 bg-emerald-50/40' 
                      : shoot.shootType === 'Photography' 
                        ? 'border-blue-200 bg-blue-50/40' 
                        : shoot.shootType === 'Videography' 
                          ? 'border-red-200 bg-red-50/40' 
                          : 'border-purple-200 bg-purple-50/40'
                  }`}
                  id={`day-shoot-item-${shoot.id}`}
                >
                  {/* Category Side-glow */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    shoot.isCompleted ? 'bg-emerald-500' :
                    shoot.shootType === 'Photography' ? 'bg-blue-500' :
                    shoot.shootType === 'Videography' ? 'bg-red-500' :
                    'bg-purple-500'
                  }`} />

                  <div className="flex justify-between items-start gap-2">
                    <h5 className="text-sm font-semibold text-zinc-850 group-hover:text-zinc-950 transition-colors duration-150 line-clamp-1">
                      {shoot.title}
                    </h5>
                    
                    {shoot.isCompleted && (
                      <span className="flex items-center text-[10px] text-emerald-800 font-mono bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                        <CheckCircle className="w-2.5 h-2.5 mr-1 text-emerald-600" /> Done
                      </span>
                    )}
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-zinc-600">
                    <div className="flex items-center">
                      <Clock className="w-3.5 h-3.5 text-zinc-400 mr-2 shrink-0" />
                      <span>{formatTime(shoot.shootTime)}</span>
                    </div>
                    {shoot.address && (
                      <div className="flex items-center">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 mr-2 shrink-0" />
                        <span className="line-clamp-1">{shoot.address}</span>
                      </div>
                    )}
                    {shoot.clientName && (
                      <div className="flex items-center">
                        <User className="w-3.5 h-3.5 text-zinc-400 mr-2 shrink-0" />
                        <span>Client: {shoot.clientName}</span>
                      </div>
                    )}
                  </div>

                  {/* Badges row */}
                  <div className="mt-3 flex items-center justify-start gap-1 border-t border-zinc-100 pt-2 text-[10px] font-mono">
                    <span className="text-zinc-400">
                      Team: {shoot.teamMembers.length}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
