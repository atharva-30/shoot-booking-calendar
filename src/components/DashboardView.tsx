import React from 'react';
import { Shoot, AppStats } from '../types';
import { formatTime, formatDateString } from '../utils';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  Camera, 
  Video, 
  Layers,
  Users,
  MapPin,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

interface DashboardViewProps {
  shoots: Shoot[];
  stats: AppStats;
  onSelectShoot: (shoot: Shoot) => void;
  onNavigateToCalendar: () => void;
  onNavigateToUpcoming: () => void;
  onNavigateToCompleted: () => void;
}

export default function DashboardView({
  shoots,
  stats,
  onSelectShoot,
  onNavigateToCalendar,
  onNavigateToUpcoming,
  onNavigateToCompleted
}: DashboardViewProps) {
  
  // Calculate breakdown for visual representation
  const photographyCount = shoots.filter(s => s.shootType === 'Photography').length;
  const videographyCount = shoots.filter(s => s.shootType === 'Videography').length;
  const bothCount = shoots.filter(s => s.shootType === 'Reels').length;
  const total = shoots.length || 1;

  // Get next 3 upcoming shoots
  const todayStr = '2026-07-16'; // Sync with system time
  const upcomingShoots = [...shoots]
    .filter(s => !s.isCompleted && s.date >= todayStr)
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.shootTime.localeCompare(b.shootTime);
    })
    .slice(0, 3);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-sans font-bold tracking-tight text-zinc-900 mb-2">
          Studio Overview
        </h1>
        <p className="text-sm text-zinc-500">
          Real-time statistics and action items for your creative business.
        </p>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div 
          onClick={onNavigateToUpcoming}
          className="bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-sm p-5 rounded-2xl cursor-pointer transition-all duration-300 hover:translate-y-[-2px] group"
          id="stat-upcoming"
        >
          <div className="flex justify-between items-start">
            <span className="text-zinc-500 text-xs font-mono tracking-wider uppercase">Upcoming Shoots</span>
            <div className="p-2 rounded-lg bg-zinc-100 text-zinc-800 group-hover:bg-zinc-900 group-hover:text-white transition-colors duration-300">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-zinc-900 tracking-tight">{stats.upcomingCount}</h3>
            <p className="text-xs text-zinc-400 mt-1">Ready for assignment</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div 
          onClick={onNavigateToCalendar}
          className="bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-sm p-5 rounded-2xl cursor-pointer transition-all duration-300 hover:translate-y-[-2px] group"
          id="stat-today"
        >
          <div className="flex justify-between items-start">
            <span className="text-zinc-500 text-xs font-mono tracking-wider uppercase">Today's Shoots</span>
            <div className="p-2 rounded-lg bg-zinc-100 text-zinc-800 group-hover:bg-zinc-900 group-hover:text-white transition-colors duration-300">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-zinc-900 tracking-tight">{stats.todayCount}</h3>
            <p className="text-xs text-zinc-400 mt-1">Happening today</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div 
          onClick={onNavigateToCompleted}
          className="bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-sm p-5 rounded-2xl cursor-pointer transition-all duration-300 hover:translate-y-[-2px] group"
          id="stat-completed"
        >
          <div className="flex justify-between items-start">
            <span className="text-zinc-500 text-xs font-mono tracking-wider uppercase">Completed Shoots</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 group-hover:bg-zinc-900 group-hover:text-white transition-colors duration-300">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-zinc-900 tracking-tight">{stats.completedCount}</h3>
            <p className="text-xs text-zinc-400 mt-1">Portfolio built</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div 
          className="bg-white border border-zinc-200 p-5 rounded-2xl transition-all duration-300"
          id="stat-deliveries"
        >
          <div className="flex justify-between items-start">
            <span className="text-zinc-500 text-xs font-mono tracking-wider uppercase">Pending Deliveries</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-800">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-zinc-900 tracking-tight">{stats.pendingDeliveriesCount}</h3>
            <p className="text-xs text-zinc-400 mt-1">Awaiting client submission</p>
          </div>
        </div>
      </div>

      {/* Visual Analytics & Next Shoots Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Charts (8 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-zinc-200 p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center">
              <TrendingUp className="w-4 h-4 text-zinc-700 mr-2" />
              Service Distribution
            </h3>

            {/* Shoot Type breakdown bar chart */}
            <div className="space-y-4">
              {/* Photo */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-700 flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
                    Photography
                  </span>
                  <span className="text-zinc-500 font-mono">{photographyCount} shoots ({Math.round(photographyCount / total * 100)}%)</span>
                </div>
                <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                    style={{ width: `${(photographyCount / total) * 100}%` }}
                  />
                </div>
              </div>

              {/* Video */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-700 flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 mr-2 animate-pulse"></span>
                    Videography
                  </span>
                  <span className="text-zinc-500 font-mono">{videographyCount} shoots ({Math.round(videographyCount / total * 100)}%)</span>
                </div>
                <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 rounded-full transition-all duration-500" 
                    style={{ width: `${(videographyCount / total) * 100}%` }}
                  />
                </div>
              </div>

              {/* Both */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-700 flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 mr-2 animate-pulse"></span>
                    Reels
                  </span>
                  <span className="text-zinc-500 font-mono">{bothCount} shoots ({Math.round(bothCount / total * 100)}%)</span>
                </div>
                <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full transition-all duration-500" 
                    style={{ width: `${(bothCount / total) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Next Assignments (5 Cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-zinc-200 p-6 rounded-2xl h-full flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center justify-between">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 text-zinc-700 mr-2" />
                  Upcoming Agenda
                </span>
                <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full font-mono">
                  Next 3 Shoots
                </span>
              </h3>

              {upcomingShoots.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
                  <p className="text-zinc-500 text-sm">No upcoming shoots scheduled.</p>
                  <button 
                    onClick={onNavigateToCalendar}
                    className="mt-3 text-xs text-zinc-900 hover:underline"
                  >
                    Schedule one now →
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingShoots.map(shoot => (
                    <div 
                      key={shoot.id}
                      onClick={() => onSelectShoot(shoot)}
                      className="bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 p-4 rounded-xl cursor-pointer transition-all duration-200 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold text-zinc-800 group-hover:text-zinc-950 transition-colors duration-150 line-clamp-1">
                          {shoot.title}
                        </h4>
                        <span className={`text-[10px] font-medium font-mono px-2 py-0.5 rounded-full shrink-0 ${
                          shoot.shootType === 'Photography' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          shoot.shootType === 'Videography' ? 'bg-red-50 text-red-700 border border-red-100' :
                          'bg-purple-50 text-purple-700 border border-purple-100'
                        }`}>
                          {shoot.shootType}
                        </span>
                      </div>

                      <div className="mt-3 space-y-1.5 text-xs text-zinc-600">
                        <div className="flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-2 text-zinc-400 shrink-0" />
                          <span>{formatDateString(shoot.date)} • {formatTime(shoot.shootTime)}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-2 text-zinc-400 shrink-0" />
                          <span className="line-clamp-1">{shoot.address || 'Location TBD'}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-3.5 h-3.5 mr-2 text-zinc-400 shrink-0" />
                          <span>{shoot.teamMembers.length > 0 ? shoot.teamMembers.join(', ') : 'Solo Shoot'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-100">
              <button
                onClick={onNavigateToCalendar}
                className="w-full text-center py-2.5 bg-zinc-900 hover:bg-zinc-850 text-white text-xs font-medium rounded-xl border border-zinc-900 transition-all duration-200 shadow-sm"
              >
                Go to Master Calendar →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
