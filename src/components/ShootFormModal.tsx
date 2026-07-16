import React, { useState, useEffect } from 'react';
import { Shoot, ShootType, PaymentStatus, RecurrenceType } from '../types';
import { getInitialGearChecklist } from '../utils';
import { X, Plus, Trash2, Calendar, Clock, MapPin, Phone, User, Users, Info } from 'lucide-react';

interface ShootFormModalProps {
  initialShoot?: Shoot; // For editing
  initialDate?: string; // Pre-filled date
  onClose: () => void;
  onSave: (shoot: Shoot) => void;
  defaultGearList: string[];
}

export default function ShootFormModal({
  initialShoot,
  initialDate,
  onClose,
  onSave,
  defaultGearList
}: ShootFormModalProps) {
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [shootTime, setShootTime] = useState('12:00');
  const [shootType, setShootType] = useState<ShootType>('Photography');
  const [submissionDate, setSubmissionDate] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Pending');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('none');
  const [date, setDate] = useState('2026-07-16');

  // Team member local state
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [newTeamMember, setNewTeamMember] = useState('');

  // Reminders local state
  const [oneWeekBefore, setOneWeekBefore] = useState(true);
  const [oneDayBefore, setOneDayBefore] = useState(true);
  const [twoHoursBefore, setTwoHoursBefore] = useState(true);

  // Initialize form if editing
  useEffect(() => {
    if (initialShoot) {
      setTitle(initialShoot.title);
      setAddress(initialShoot.address);
      setShootTime(initialShoot.shootTime);
      setShootType(initialShoot.shootType);
      setSubmissionDate(initialShoot.submissionDate);
      setClientName(initialShoot.clientName);
      setClientContact(initialShoot.clientContact);
      setNotes(initialShoot.notes);
      setPaymentStatus(initialShoot.paymentStatus);
      setIsRecurring(initialShoot.isRecurring);
      setRecurrenceType(initialShoot.recurrenceType);
      setDate(initialShoot.date);
      setTeamMembers(initialShoot.teamMembers);
      setOneWeekBefore(initialShoot.reminders.oneWeekBefore);
      setOneDayBefore(initialShoot.reminders.oneDayBefore);
      setTwoHoursBefore(initialShoot.reminders.twoHoursBefore);
    } else if (initialDate) {
      setDate(initialDate);
      // Pre-fill submission date as 14 days later by default
      try {
        const [y, m, d] = initialDate.split('-').map(Number);
        const subDate = new Date(y, m - 1, d + 14);
        const yyyy = subDate.getFullYear();
        const mm = String(subDate.getMonth() + 1).padStart(2, '0');
        const dd = String(subDate.getDate()).padStart(2, '0');
        setSubmissionDate(`${yyyy}-${mm}-${dd}`);
      } catch (err) {
        setSubmissionDate(initialDate);
      }
    } else {
      setDate('2026-07-16');
      setSubmissionDate('2026-07-30');
    }
  }, [initialShoot, initialDate]);

  const handleAddTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamMember.trim()) return;
    if (teamMembers.includes(newTeamMember.trim())) return;
    setTeamMembers([...teamMembers, newTeamMember.trim()]);
    setNewTeamMember('');
  };

  const handleRemoveTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Shoot title is required');
      return;
    }

    const savedShoot: Shoot = {
      id: initialShoot?.id || `shoot-${Date.now()}`,
      title: title.trim(),
      address: address.trim(),
      shootTime,
      shootType,
      submissionDate,
      clientName: clientName.trim(),
      clientContact: clientContact.trim(),
      teamMembers,
      date,
      notes: notes.trim(),
      gearChecklist: initialShoot?.gearChecklist || defaultGearList.map((name, idx) => ({
        id: `gear-${idx}-${Date.now()}`,
        name,
        checked: false
      })),
      paymentStatus,
      isCompleted: initialShoot?.isCompleted || false,
      reminders: {
        oneWeekBefore,
        oneDayBefore,
        twoHoursBefore
      },
      attachments: initialShoot?.attachments || [],
      isRecurring,
      recurrenceType: isRecurring ? recurrenceType : 'none',
      createdAt: initialShoot?.createdAt || new Date().toISOString()
    };

    onSave(savedShoot);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl bg-white border border-zinc-250 rounded-3xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col animate-scale-up"
        id="shoot-form-modal"
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-150 bg-zinc-50/50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight font-sans">
              {initialShoot ? 'Edit Shoot Details' : 'Book New Shoot Assignment'}
            </h2>
            <p className="text-xs text-zinc-500">Configure parameters for the production schedule.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 border border-zinc-200 hover:border-zinc-300 text-zinc-500 hover:text-zinc-800 rounded-xl transition"
            id="close-form-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-6">
          
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono text-zinc-800 font-bold uppercase tracking-wider border-b border-zinc-100 pb-1.5">1. Basic Assignment</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Shoot Title */}
              <div className="md:col-span-8">
                <label className="block text-xs text-zinc-650 font-medium mb-1">Shoot Title / Client Booking <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wedding - Rahul & Priya or Corporate Portfolio"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 transition-colors"
                  id="form-shoot-title"
                />
              </div>

              {/* Shoot Type */}
              <div className="md:col-span-4">
                <label className="block text-xs text-zinc-650 font-medium mb-1">Type of Assignment</label>
                <select
                  value={shootType}
                  onChange={(e) => setShootType(e.target.value as ShootType)}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2 text-sm text-zinc-800 focus:outline-none focus:border-zinc-500"
                  id="form-shoot-type"
                >
                  <option value="Photography">Photography</option>
                  <option value="Videography">Videography</option>
                  <option value="Reels">Reels</option>
                </select>
              </div>

              {/* Shoot Date */}
              <div className="md:col-span-4">
                <label className="block text-xs text-zinc-650 font-medium mb-1">Shoot Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl py-2 pl-10 pr-3.5 text-sm text-zinc-800 focus:outline-none focus:border-zinc-500"
                    id="form-shoot-date"
                  />
                </div>
              </div>

              {/* Shoot Time */}
              <div className="md:col-span-4">
                <label className="block text-xs text-zinc-650 font-medium mb-1">Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  <input
                    type="time"
                    required
                    value={shootTime}
                    onChange={(e) => setShootTime(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl py-2 pl-10 pr-3.5 text-sm text-zinc-800 focus:outline-none focus:border-zinc-500"
                    id="form-shoot-time"
                  />
                </div>
              </div>

              {/* Submission Date */}
              <div className="md:col-span-4">
                <label className="block text-xs text-zinc-650 font-medium mb-1">Submission Deadline</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  <input
                    type="date"
                    value={submissionDate}
                    onChange={(e) => setSubmissionDate(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl py-2 pl-10 pr-3.5 text-sm text-zinc-800 focus:outline-none focus:border-zinc-500"
                    id="form-submission-date"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="md:col-span-12">
                <label className="block text-xs text-zinc-650 font-medium mb-1">Shoot Location Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g. Grand Hyatt Ballroom, Mumbai or outdoor scenic viewpoint"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl py-2 pl-10 pr-3.5 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-500"
                    id="form-shoot-address"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Section 2: Client Profile */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono text-zinc-800 font-bold uppercase tracking-wider border-b border-zinc-100 pb-1.5">2. Client Profile</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Client Name */}
              <div className="md:col-span-6">
                <label className="block text-xs text-zinc-650 font-medium mb-1">Client Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g. Sameer Kapoor"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl py-2 pl-10 pr-3.5 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-500"
                    id="form-client-name"
                  />
                </div>
              </div>

              {/* Client Contact */}
              <div className="md:col-span-6">
                <label className="block text-xs text-zinc-650 font-medium mb-1">Client Contact Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={clientContact}
                    onChange={(e) => setClientContact(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl py-2 pl-10 pr-3.5 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-500"
                    id="form-client-phone"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Team Assignments */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono text-zinc-800 font-bold uppercase tracking-wider border-b border-zinc-100 pb-1.5">3. Production Crew</h3>
            
            <div className="space-y-3">
              <label className="block text-xs text-zinc-650 font-medium mb-1">Assign Team Members coming on the shoot</label>
              
              {/* Mini Form to add member */}
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Enter name (e.g. Atharva, Om, Rohit, Vishal)"
                    value={newTeamMember}
                    onChange={(e) => setNewTeamMember(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl py-2 pl-10 pr-3.5 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddTeamMember}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-white border border-zinc-900 rounded-xl text-xs font-semibold shadow-sm transition"
                >
                  Add Crew
                </button>
              </div>

              {/* Members chip container */}
              {teamMembers.length === 0 ? (
                <p className="text-zinc-400 text-xs italic font-sans">No production crew assigned yet (Solo Assignment).</p>
              ) : (
                <div className="flex flex-wrap gap-2 pt-1">
                  {teamMembers.map((member, idx) => (
                    <span 
                      key={idx}
                      className="inline-flex items-center px-3 py-1 bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 rounded-lg group"
                    >
                      {member}
                      <button
                        type="button"
                        onClick={() => handleRemoveTeamMember(idx)}
                        className="ml-2 hover:text-red-650 text-zinc-400"
                        title="Remove member"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Reminders & Notes */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono text-zinc-800 font-bold uppercase tracking-wider border-b border-zinc-100 pb-1.5">4. Alerts & Special Directives</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Reminder checkboxes */}
              <div className="md:col-span-5 space-y-2.5">
                <span className="block text-xs text-zinc-650 font-medium mb-1.5">Configure Shoot Reminders</span>
                
                <label className="flex items-center text-xs text-zinc-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={oneWeekBefore}
                    onChange={(e) => setOneWeekBefore(e.target.checked)}
                    className="accent-zinc-900 mr-2.5 h-4.5 w-4.5 rounded border-zinc-300"
                  />
                  One Week Before
                </label>

                <label className="flex items-center text-xs text-zinc-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={oneDayBefore}
                    onChange={(e) => setOneDayBefore(e.target.checked)}
                    className="accent-zinc-900 mr-2.5 h-4.5 w-4.5 rounded border-zinc-300"
                  />
                  One Day Before
                </label>

                <label className="flex items-center text-xs text-zinc-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={twoHoursBefore}
                    onChange={(e) => setTwoHoursBefore(e.target.checked)}
                    className="accent-zinc-900 mr-2.5 h-4.5 w-4.5 rounded border-zinc-300"
                  />
                  Two Hours Before
                </label>
              </div>

              {/* Recurrence Setup */}
              <div className="md:col-span-7 space-y-2">
                <span className="block text-xs text-zinc-650 font-medium mb-1">Recurrence Routine</span>
                
                <div className="flex items-center space-x-3 mb-1">
                  <label className="flex items-center text-xs text-zinc-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      className="accent-zinc-900 mr-2.5 h-4.5 w-4.5 rounded border-zinc-300"
                    />
                    Is Recurring Event?
                  </label>
                </div>

                {isRecurring && (
                  <select
                    value={recurrenceType}
                    onChange={(e) => setRecurrenceType(e.target.value as RecurrenceType)}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-800 focus:outline-none focus:border-zinc-500"
                  >
                    <option value="weekly">Weekly Shoot Appointment</option>
                    <option value="monthly">Monthly Shoot Appointment</option>
                  </select>
                )}

                <div className="text-[10px] text-zinc-500 leading-snug flex items-start gap-1.5 mt-2 bg-zinc-50 border border-zinc-150 p-2.5 rounded-lg">
                  <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                  <span>Checking recurrence creates standard placeholder shoots automatically according to selected frequency pattern.</span>
                </div>
              </div>

              {/* Notes */}
              <div className="md:col-span-12">
                <label className="block text-xs text-zinc-650 font-medium mb-1">Production Details / Gear Guidelines / Instructions</label>
                <textarea
                  placeholder="e.g. Bring drone for high angles, focus heavily on candid portraits of guests, check lighting conditions in the hall..."
                  value={notes}
                  rows={4}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 transition-colors"
                  id="form-shoot-notes"
                />
              </div>

            </div>
          </div>

        </form>

        {/* Footer buttons */}
        <div className="p-5 border-t border-zinc-150 bg-zinc-50 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 rounded-xl text-xs font-semibold shadow-sm transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-white text-xs font-bold rounded-xl shadow-sm transition"
            id="save-shoot-form-btn"
          >
            {initialShoot ? 'Save Changes' : 'Confirm Assignment Booking'}
          </button>
        </div>
      </div>
    </div>
  );
}
