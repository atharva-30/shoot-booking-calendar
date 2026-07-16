import React, { useState } from 'react';
import { Shoot, GearItem, AttachmentItem } from '../types';
import { formatTime, formatDateString, generateWhatsAppShareText } from '../utils';
import { 
  X, 
  MapPin, 
  Clock, 
  Calendar, 
  Phone, 
  User, 
  Users, 
  CheckSquare, 
  Square, 
  CheckCircle, 
  Trash2, 
  Edit3, 
  Copy, 
  Share2, 
  FileText, 
  Paperclip, 
  Plus, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface ShootDetailModalProps {
  shoot: Shoot;
  onClose: () => void;
  onEdit: (shoot: Shoot) => void;
  onDelete: (shootId: string) => void;
  onDuplicate: (shoot: Shoot) => void;
  onToggleComplete: (shootId: string) => void;
  onUpdateShoot: (updatedShoot: Shoot) => void;
}

export default function ShootDetailModal({
  shoot,
  onClose,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleComplete,
  onUpdateShoot
}: ShootDetailModalProps) {
  const [newGearItem, setNewGearItem] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Toggle checklist item
  const handleToggleGear = (itemId: string) => {
    const updatedChecklist = shoot.gearChecklist.map(item => 
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    onUpdateShoot({
      ...shoot,
      gearChecklist: updatedChecklist
    });
  };

  // Add customized gear item
  const handleAddGear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGearItem.trim()) return;
    
    const newItem: GearItem = {
      id: `gear-${Date.now()}`,
      name: newGearItem.trim(),
      checked: false
    };

    onUpdateShoot({
      ...shoot,
      gearChecklist: [...shoot.gearChecklist, newItem]
    });
    setNewGearItem('');
  };

  // Delete checklist item
  const handleDeleteGear = (itemId: string) => {
    onUpdateShoot({
      ...shoot,
      gearChecklist: shoot.gearChecklist.filter(item => item.id !== itemId)
    });
  };

  // Simulate file upload (converts file to base64 dataUrl for localstorage permanence!)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const newAttachment: AttachmentItem = {
        id: `att-${Date.now()}`,
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type,
        dataUrl
      };

      onUpdateShoot({
        ...shoot,
        attachments: [...shoot.attachments, newAttachment]
      });
      setIsUploading(false);
    };

    reader.onerror = () => {
      setIsUploading(false);
      alert('Error reading attachment file');
    };

    reader.readAsDataURL(file);
  };

  // Delete file attachment
  const handleDeleteAttachment = (attachmentId: string) => {
    onUpdateShoot({
      ...shoot,
      attachments: shoot.attachments.filter(att => att.id !== attachmentId)
    });
  };

  // Map link generator
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shoot.address)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-white border border-zinc-250 rounded-3xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col animate-scale-up"
        id="shoot-detail-modal"
      >
        
        {/* Banner/Header */}
        <div className={`p-6 border-b border-zinc-150 flex justify-between items-start gap-4 ${
          shoot.isCompleted 
            ? 'bg-emerald-50/40' 
            : shoot.shootType === 'Photography' 
              ? 'bg-blue-50/40' 
              : shoot.shootType === 'Videography' 
                ? 'bg-red-50/40' 
                : 'bg-purple-50/40'
        }`}>
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <span className={`text-[10px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full ${
                shoot.shootType === 'Photography' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                shoot.shootType === 'Videography' ? 'bg-red-50 text-red-700 border border-red-100' :
                'bg-purple-50 text-purple-700 border border-purple-100'
              }`}>
                {shoot.shootType}
              </span>

              {shoot.isCompleted && (
                <span className="text-[10px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" /> COMPLETED
                </span>
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight leading-tight mt-1 font-sans">
              {shoot.title}
            </h2>
          </div>

          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 border border-zinc-200 hover:border-zinc-300 text-zinc-500 hover:text-zinc-800 rounded-xl transition"
            id="close-detail-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="flex-grow p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Main Details Column (7 Columns) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Shoot Specifications Card */}
              <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Shoot Parameters</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-zinc-700">
                  <div className="flex items-start">
                    <Calendar className="w-4 h-4 text-zinc-400 mr-2.5 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-zinc-400 font-mono">Date</p>
                      <p className="font-semibold text-zinc-800 mt-0.5">{formatDateString(shoot.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Clock className="w-4 h-4 text-zinc-400 mr-2.5 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-zinc-400 font-mono">Time</p>
                      <p className="font-semibold text-zinc-800 mt-0.5">{formatTime(shoot.shootTime)}</p>
                    </div>
                  </div>

                  <div className="flex items-start sm:col-span-2">
                    <MapPin className="w-4 h-4 text-zinc-400 mr-2.5 shrink-0 mt-0.5" />
                    <div className="flex-grow">
                      <p className="text-xs text-zinc-400 font-mono">Location Address</p>
                      <p className="font-semibold text-zinc-800 mt-0.5 line-clamp-2">{shoot.address || 'No Location Provided'}</p>
                      {shoot.address && (
                        <a 
                          href={mapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center text-xs text-zinc-700 hover:text-zinc-950 hover:underline mt-1.5 font-medium"
                        >
                          <ExternalLink className="w-3.5 h-3.5 mr-1" />
                          One-Tap Google Maps Navigation
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start sm:col-span-2 border-t border-zinc-200 pt-3 mt-1">
                    <Calendar className="w-4 h-4 text-zinc-400 mr-2.5 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-zinc-400 font-mono">Submission / Delivery Deadline</p>
                      <p className="font-medium text-zinc-800 mt-0.5">{formatDateString(shoot.submissionDate) || 'TBD'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Contact Profile */}
              <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl">
                <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-3">Client Information</h3>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-zinc-200 text-zinc-850 rounded-full flex items-center justify-center font-bold font-sans">
                      {(shoot.clientName || 'C')[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-800">{shoot.clientName || 'N/A'}</h4>
                      <p className="text-xs text-zinc-500 font-mono">{shoot.clientContact || 'No contact'}</p>
                    </div>
                  </div>

                  {shoot.clientContact && (
                    <a 
                      href={`tel:${shoot.clientContact}`}
                      className="inline-flex items-center justify-center px-4 py-2 bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 rounded-xl text-xs font-semibold transition shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5 mr-2 text-emerald-600" />
                      Call Client
                    </a>
                  )}
                </div>
              </div>

              {/* Assigned Team Section */}
              <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl">
                <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-3">Assigned Production Team</h3>
                
                {shoot.teamMembers.length === 0 ? (
                  <p className="text-zinc-500 text-xs">Solo shoot. No team members assigned.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {shoot.teamMembers.map((member, i) => (
                      <span 
                        key={i}
                        className="inline-flex items-center px-3.5 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-700 font-medium"
                      >
                        <User className="w-3 h-3 text-zinc-400 mr-2" />
                        {member}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Special Instructions/Notes */}
              <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl space-y-2">
                <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Special Shoot Notes</h3>
                <div className="text-sm text-zinc-700 leading-relaxed bg-white p-4 border border-zinc-200 rounded-xl font-sans whitespace-pre-wrap">
                  {shoot.notes || 'No special notes or production instructions.'}
                </div>
              </div>
            </div>

            {/* Right Interactive Column (5 Columns) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Equipment Gear Checklist */}
              <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                    <span>Gear Checklist</span>
                    <span className="text-[10px] bg-zinc-200 text-zinc-600 px-2 py-0.5 rounded font-normal font-mono">
                      {shoot.gearChecklist.filter(g => g.checked).length}/{shoot.gearChecklist.length} Packed
                    </span>
                  </h3>

                  {shoot.gearChecklist.length === 0 ? (
                    <p className="text-zinc-500 text-xs py-4 text-center">No checklist items. Add gear needed below.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                      {shoot.gearChecklist.map(item => (
                        <div 
                          key={item.id}
                          className="flex items-center justify-between group py-1 border-b border-zinc-200 last:border-0"
                        >
                          <button
                            onClick={() => handleToggleGear(item.id)}
                            className="flex items-center text-left text-xs text-zinc-700 hover:text-zinc-900 transition-colors"
                          >
                            {item.checked ? (
                              <CheckSquare className="w-4 h-4 mr-2.5 text-zinc-900 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 mr-2.5 text-zinc-400 shrink-0" />
                            )}
                            <span className={item.checked ? 'line-through text-zinc-400' : ''}>
                              {item.name}
                            </span>
                          </button>

                          <button
                            onClick={() => handleDeleteGear(item.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-600 text-zinc-400 transition"
                            title="Remove item"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add Custom Gear Input */}
                <form onSubmit={handleAddGear} className="flex mt-4 border-t border-zinc-200 pt-3 gap-2">
                  <input
                    type="text"
                    placeholder="Add custom gear..."
                    value={newGearItem}
                    onChange={(e) => setNewGearItem(e.target.value)}
                    className="flex-grow bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-500"
                  />
                  <button
                    type="submit"
                    className="p-1.5 bg-zinc-900 hover:bg-zinc-850 text-white rounded-lg border border-zinc-900 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Production Contract / Invoice Attachments */}
              <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl">
                <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-3">Contracts & Moodboards</h3>
                
                {shoot.attachments.length === 0 ? (
                  <p className="text-zinc-500 text-xs mb-3">No documents attached.</p>
                ) : (
                  <div className="space-y-2 mb-3">
                    {shoot.attachments.map(att => (
                      <div 
                        key={att.id}
                        className="bg-white p-2.5 rounded-xl border border-zinc-200 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-2 min-w-0">
                          <FileText className="w-4 h-4 text-zinc-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-zinc-800 truncate">{att.name}</p>
                            <p className="text-[10px] text-zinc-400 font-mono">{att.size}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          {att.dataUrl && (
                            <a 
                              href={att.dataUrl}
                              download={att.name}
                              className="p-1.5 hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800 rounded transition"
                              title="Download document"
                            >
                              <Paperclip className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => handleDeleteAttachment(att.id)}
                            className="p-1.5 hover:bg-zinc-100 text-zinc-500 hover:text-red-650 rounded transition"
                            title="Delete file"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Attach File Button */}
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    disabled={isUploading}
                    id="attachment-upload-input"
                  />
                  <button
                    type="button"
                    className="w-full text-center py-2 bg-white hover:bg-zinc-50 text-zinc-650 hover:text-zinc-900 border border-dashed border-zinc-200 hover:border-zinc-350 rounded-xl text-xs font-medium transition"
                  >
                    {isUploading ? 'Encrypting file...' : '+ Attach Contract or Image'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-zinc-150 bg-zinc-50 flex flex-wrap items-center justify-between gap-3">
          
          {/* Delete Action (Left aligned) */}
          <button
            onClick={() => {
              if (confirm('Are you absolutely sure you want to delete this shoot assignment?')) {
                onDelete(shoot.id);
              }
            }}
            className="flex items-center text-xs text-red-700 bg-red-50 hover:bg-red-100 hover:text-red-800 px-3.5 py-2 rounded-xl border border-red-100 shadow-sm transition-all duration-200"
            id="delete-shoot-btn"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            Delete Shoot
          </button>

          {/* Core Operations (Right aligned) */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Share details via WhatsApp */}
            <a
              href={generateWhatsAppShareText(shoot)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center px-3.5 py-2 bg-white hover:bg-zinc-50 text-zinc-750 border border-zinc-200 text-xs font-semibold rounded-xl transition shadow-sm"
              id="share-shoot-whatsapp"
            >
              <Share2 className="w-4 h-4 mr-1.5 text-zinc-500" />
              Share Shoot
            </a>

            {/* Duplicate Shoot */}
            <button
              onClick={() => onDuplicate(shoot)}
              className="inline-flex items-center px-3.5 py-2 bg-white hover:bg-zinc-50 text-zinc-750 border border-zinc-200 text-xs font-semibold rounded-xl transition shadow-sm"
              id="duplicate-shoot-btn"
            >
              <Copy className="w-4 h-4 mr-1.5 text-zinc-500" />
              Duplicate
            </button>

            {/* Edit details */}
            <button
              onClick={() => onEdit(shoot)}
              className="inline-flex items-center px-3.5 py-2 bg-white hover:bg-zinc-50 text-zinc-750 border border-zinc-200 text-xs font-semibold rounded-xl transition shadow-sm"
              id="edit-shoot-btn"
            >
              <Edit3 className="w-4 h-4 mr-1.5 text-zinc-500" />
              Edit Details
            </button>

            {/* Completion Toggle */}
            <button
              onClick={() => onToggleComplete(shoot.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition duration-200 shadow-sm ${
                shoot.isCompleted 
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                  : 'bg-zinc-900 hover:bg-zinc-850 text-white'
              }`}
              id="toggle-complete-btn"
            >
              {shoot.isCompleted ? 'Mark Pending' : 'Mark as Completed'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
