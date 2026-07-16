import React, { useMemo } from 'react';
import { Shoot } from '../types';
import { formatDateString, formatTime } from '../utils';
import { Bell, Clock, MapPin, AlertCircle, Info, Calendar } from 'lucide-react';

interface NotificationCenterProps {
  shoots: Shoot[];
  onSelectShoot: (shoot: Shoot) => void;
}

interface ShootAlert {
  id: string;
  shoot: Shoot;
  type: 'one-week' | 'one-day' | 'two-hours';
  title: string;
  triggerTimeStr: string;
}

export default function NotificationCenter({ shoots, onSelectShoot }: NotificationCenterProps) {
  const todayStr = '2026-07-16'; // System standard context time
  const todayDate = new Date(2026, 6, 16);

  // Derive notifications
  const alerts: ShootAlert[] = useMemo(() => {
    const list: ShootAlert[] = [];
    
    shoots.forEach(shoot => {
      if (shoot.isCompleted) return;

      const [y, m, d] = shoot.date.split('-').map(Number);
      const shootDate = new Date(y, m - 1, d);
      const diffTime = shootDate.getTime() - todayDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // 1. One week before reminder (Triggered if shoot is within next 7 days)
      if (shoot.reminders.oneWeekBefore && diffDays > 0 && diffDays <= 7) {
        list.push({
          id: `alert-week-${shoot.id}`,
          shoot,
          type: 'one-week',
          title: `Upcoming in ${diffDays} days: ${shoot.title}`,
          triggerTimeStr: `${diffDays} days left • Preparing checklists & crew`
        });
      }

      // 2. One day before reminder (Triggered if shoot is tomorrow)
      if (shoot.reminders.oneDayBefore && diffDays === 1) {
        list.push({
          id: `alert-day-${shoot.id}`,
          shoot,
          type: 'one-day',
          title: `Shooting Tomorrow: ${shoot.title}`,
          triggerTimeStr: `Tomorrow at ${formatTime(shoot.shootTime)} • Charge batteries!`
        });
      }

      // 3. Two hours before reminder (Triggered if shoot is today)
      if (shoot.reminders.twoHoursBefore && diffDays === 0) {
        list.push({
          id: `alert-hours-${shoot.id}`,
          shoot,
          type: 'two-hours',
          title: `Shoot Commencing Today: ${shoot.title}`,
          triggerTimeStr: `Today at ${formatTime(shoot.shootTime)} • Ensure equipment is packed`
        });
      }
    });

    // Sort by type priority (two-hours -> one-day -> one-week)
    return list.sort((a, b) => {
      const priorityMap = { 'two-hours': 1, 'one-day': 2, 'one-week': 3 };
      return priorityMap[a.type] - priorityMap[b.type];
    });
  }, [shoots]);

  return (
    <div className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-zinc-900 flex items-center">
          <Bell className="w-5 h-5 text-zinc-700 mr-2.5" />
          Production Alert Center
        </h3>
        <span className="text-[10px] bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full font-mono font-bold">
          {alerts.length} Active Alerts
        </span>
      </div>

      <div className="text-[11px] text-zinc-600 bg-zinc-50 p-3 rounded-xl border border-zinc-200 flex items-start gap-2">
        <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
        <p className="leading-normal">
          Reminders are generated in real-time according to configured shoot times, dates, and setup parameters relative to local time (July 16, 2026).
        </p>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
          <Bell className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
          <p className="text-zinc-500 text-xs font-sans">No production alerts currently active.</p>
          <p className="text-[10px] text-zinc-450 font-sans mt-1">Book upcoming shoots to see alerts.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => (
            <div 
              key={alert.id}
              onClick={() => onSelectShoot(alert.shoot)}
              className={`p-4 rounded-xl border text-left cursor-pointer transition-all duration-250 hover:bg-zinc-50/50 hover:translate-x-1 flex flex-col justify-between gap-3 ${
                alert.type === 'two-hours' 
                  ? 'border-red-200 bg-red-50/30 hover:border-red-300' 
                  : alert.type === 'one-day' 
                    ? 'border-amber-200 bg-amber-50/30 hover:border-amber-300' 
                    : 'border-blue-200 bg-blue-50/30 hover:border-blue-300'
              }`}
              id={`alert-card-${alert.id}`}
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-semibold text-zinc-800 leading-tight">
                  {alert.title}
                </h4>
                <span className={`text-[9px] font-mono font-semibold uppercase px-2 py-0.5 rounded ${
                  alert.type === 'two-hours' ? 'bg-red-50 text-red-750 border border-red-100' :
                  alert.type === 'one-day' ? 'bg-amber-50 text-amber-750 border border-amber-100' :
                  'bg-blue-50 text-blue-750 border border-blue-100'
                }`}>
                  {alert.type === 'two-hours' ? '2 Hours Left' : alert.type === 'one-day' ? '1 Day Left' : '1 Week Left'}
                </span>
              </div>

              <div className="space-y-1 text-xs text-zinc-600">
                <div className="flex items-center text-zinc-700 font-mono text-[11px] font-semibold">
                  <Clock className="w-3.5 h-3.5 mr-2 shrink-0 text-zinc-500" />
                  <span>{alert.triggerTimeStr}</span>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400 mr-2 shrink-0" />
                  <span>{formatDateString(alert.shoot.date)} at {formatTime(alert.shoot.shootTime)}</span>
                </div>

                {alert.shoot.address && (
                  <div className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 mr-2 shrink-0" />
                    <span className="line-clamp-1">{alert.shoot.address}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
