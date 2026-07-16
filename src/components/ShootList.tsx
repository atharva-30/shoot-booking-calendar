import React, { useState, useMemo } from 'react';
import { Shoot, ShootType } from '../types';
import { formatDateString, formatTime } from '../utils';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Users, 
  ChevronRight, 
  CheckCircle, 
  AlertCircle,
  FileSpreadsheet,
  ArrowUpDown,
  User,
  Calendar
} from 'lucide-react';

interface ShootListProps {
  shoots: Shoot[];
  type: 'upcoming' | 'completed' | 'all';
  onSelectShoot: (shoot: Shoot) => void;
  onAddShoot: () => void;
  exportCSV: () => void;
}

export default function ShootList({
  shoots,
  type,
  onSelectShoot,
  onAddShoot,
  exportCSV
}: ShootListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<ShootType | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Completed' | 'Pending'>('All');
  const [sortBy, setSortBy] = useState<'date-asc' | 'date-desc' | 'title-asc' | 'sub-date'>('date-asc');

  // Filter based on page navigation context
  const filteredByNav = useMemo(() => {
    const todayStr = '2026-07-16'; // Syncing with system date
    if (type === 'upcoming') {
      return shoots.filter(s => !s.isCompleted);
    } else if (type === 'completed') {
      return shoots.filter(s => s.isCompleted);
    }
    return shoots;
  }, [shoots, type]);

  // Combined filtering & searching logic
  const filteredAndSearchedShoots = useMemo(() => {
    return filteredByNav.filter(shoot => {
      // Search text match
      const text = searchTerm.toLowerCase();
      const titleMatch = shoot.title.toLowerCase().includes(text);
      const clientMatch = shoot.clientName.toLowerCase().includes(text);
      const addressMatch = shoot.address.toLowerCase().includes(text);
      const teamMatch = shoot.teamMembers.some(member => member.toLowerCase().includes(text));
      
      const searchMatch = titleMatch || clientMatch || addressMatch || teamMatch;

      // Type match
      const typeMatch = selectedType === 'All' || shoot.shootType === selectedType;

      // Status match
      let statusMatch = true;
      if (selectedStatus === 'Completed') statusMatch = shoot.isCompleted;
      if (selectedStatus === 'Pending') statusMatch = !shoot.isCompleted;

      return searchMatch && typeMatch && statusMatch;
    }).sort((a, b) => {
      // Sorting
      if (sortBy === 'date-asc') {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.shootTime.localeCompare(b.shootTime);
      }
      if (sortBy === 'date-desc') {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return b.shootTime.localeCompare(a.shootTime);
      }
      if (sortBy === 'title-asc') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'sub-date') {
        return a.submissionDate.localeCompare(b.submissionDate);
      }
      return 0;
    });
  }, [filteredByNav, searchTerm, selectedType, selectedStatus, sortBy]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title & Actions Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight capitalize flex items-center">
            {type === 'all' ? 'All Bookings' : `${type} Assignments`}
            <span className="ml-3 text-xs bg-zinc-100 text-zinc-600 px-2.5 py-0.5 rounded-full font-mono font-normal">
              {filteredAndSearchedShoots.length} Shoots
            </span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Browse, search and filter your shoot schedule effortlessly.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={exportCSV}
            className="flex items-center px-4 py-2 bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 text-xs font-semibold rounded-xl transition duration-200"
            title="Export Excel/CSV"
            id="export-shoots-csv-btn"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2 text-zinc-700" />
            Export Data
          </button>
          
          <button
            onClick={onAddShoot}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-white text-xs font-semibold rounded-xl transition-all duration-200 shadow-sm"
            id="book-new-shoot-btn"
          >
            Book New Shoot
          </button>
        </div>
      </div>

      {/* Search & Complex Filters Panel */}
      <div className="bg-white border border-zinc-200 p-5 rounded-2xl space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by Title, Client, Location, Team Member..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded-xl py-2.5 pl-11 pr-4 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 transition-colors"
            id="shoot-search-input"
          />
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Filter 1: Shoot Type */}
          <div>
            <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">Shoot Type</label>
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as ShootType | 'All')}
                className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-800 focus:outline-none focus:border-zinc-500"
              >
                <option value="All">All Types</option>
                <option value="Photography">Photography</option>
                <option value="Videography">Videography</option>
                <option value="Reels">Reels</option>
              </select>
            </div>
          </div>

          {/* Filter 2: Completion Status */}
          {type === 'all' ? (
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">Status</label>
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as 'All' | 'Completed' | 'Pending')}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-800 focus:outline-none focus:border-zinc-500"
                >
                  <option value="All">All Shoots</option>
                  <option value="Pending">Pending / Active</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          ) : null}

          {/* Filter 3: Sorter */}
          <div className={type !== 'all' ? 'sm:col-span-2' : ''}>
            <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">Sort Assignments</label>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-800 focus:outline-none focus:border-zinc-500"
              >
                <option value="date-asc">Date (Earliest First)</option>
                <option value="date-desc">Date (Latest First)</option>
                <option value="title-asc">Shoot Title (A-Z)</option>
                <option value="sub-date">Submission Date</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Shoots Grid/List Results */}
      {filteredAndSearchedShoots.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
          <AlertCircle className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
          <h3 className="text-zinc-800 font-semibold">No shoots found</h3>
          <p className="text-zinc-500 text-xs mt-1">Try resetting filters or typing a different search query.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedType('All');
              setSelectedStatus('All');
              setSortBy('date-asc');
            }}
            className="mt-4 px-4 py-2 bg-zinc-100 border border-zinc-200 text-xs text-zinc-800 rounded-xl transition"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAndSearchedShoots.map(shoot => {
            const isToday = shoot.date === '2026-07-16';
            
            return (
              <div
                key={shoot.id}
                onClick={() => onSelectShoot(shoot)}
                className={`bg-white hover:bg-zinc-50 border hover:border-zinc-300 p-5 rounded-2xl cursor-pointer transition-all duration-300 hover:translate-y-[-2px] group relative overflow-hidden flex flex-col justify-between ${
                  shoot.isCompleted 
                    ? 'border-emerald-200' 
                    : shoot.shootType === 'Photography' 
                      ? 'border-blue-200' 
                      : shoot.shootType === 'Videography' 
                        ? 'border-red-200' 
                        : 'border-purple-200'
                }`}
                id={`shoot-card-${shoot.id}`}
              >
                {/* Visual Category line */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  shoot.isCompleted ? 'bg-emerald-500' :
                  shoot.shootType === 'Photography' ? 'bg-blue-500' :
                  shoot.shootType === 'Videography' ? 'bg-red-500' :
                  'bg-purple-500'
                }`} />

                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="font-bold text-zinc-800 group-hover:text-zinc-950 transition-colors duration-200 text-base leading-snug line-clamp-1">
                      {shoot.title}
                    </h3>
                    
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-semibold shrink-0 ${
                      shoot.shootType === 'Photography' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                      shoot.shootType === 'Videography' ? 'bg-red-50 text-red-700 border border-red-100' :
                      'bg-purple-50 text-purple-700 border border-purple-100'
                    }`}>
                      {shoot.shootType}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-zinc-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-zinc-400 mr-2.5 shrink-0" />
                      <span className={isToday ? 'text-zinc-900 font-semibold animate-pulse' : ''}>
                        {formatDateString(shoot.date)} {isToday ? '(Today)' : ''}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-zinc-400 mr-2.5 shrink-0" />
                      <span>{formatTime(shoot.shootTime)}</span>
                    </div>

                    {shoot.address && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-zinc-400 mr-2.5 shrink-0" />
                        <span className="line-clamp-1">{shoot.address}</span>
                      </div>
                    )}

                    {shoot.clientName && (
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-zinc-400 mr-2.5 shrink-0" />
                        <span>Client: {shoot.clientName}</span>
                      </div>
                    )}

                    {shoot.teamMembers.length > 0 && (
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-zinc-400 mr-2.5 shrink-0" />
                        <span className="line-clamp-1">Crew: {shoot.teamMembers.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Section */}
                <div className="mt-5 pt-3.5 border-t border-zinc-100 flex items-center justify-end text-[11px] font-mono">
                  <span className="text-zinc-500 hover:text-zinc-900 flex items-center transition-colors">
                    View Studio Details
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
