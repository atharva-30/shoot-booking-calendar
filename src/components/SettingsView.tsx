import React, { useState } from 'react';
import { Shoot } from '../types';
import { exportToCSV, getMockShoots } from '../utils';
import { 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw, 
  Settings, 
  Sliders, 
  CheckCircle,
  AlertTriangle,
  Camera,
  Info
} from 'lucide-react';

interface SettingsViewProps {
  shoots: Shoot[];
  onImportData: (importedShoots: Shoot[]) => void;
  onClearData: () => void;
  onResetToMock: () => void;
  customGearList: string[];
  onUpdateDefaultGearList: (newList: string[]) => void;
}

export default function SettingsView({
  shoots,
  onImportData,
  onClearData,
  onResetToMock,
  customGearList,
  onUpdateDefaultGearList
}: SettingsViewProps) {
  const [successMsg, setSuccessMsg] = useState('');
  const [newGearItem, setNewGearItem] = useState('');


  const triggerAlert = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Export database as JSON backup
  const handleExportJSON = () => {
    const backupStr = JSON.stringify(shoots, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(backupStr);
    
    const exportFileDefaultName = `photographer_calendar_backup_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    triggerAlert('Database exported successfully as JSON!');
  };

  // Import database from JSON backup file
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportData(parsed as Shoot[]);
          triggerAlert('Studio schedule restored from backup successfully!');
        } else {
          alert('Invalid backup format. Expected an array of shoots.');
        }
      } catch (err) {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // Add global default gear item
  const handleAddDefaultGear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGearItem.trim()) return;
    const updated = [...customGearList, newGearItem.trim()];
    onUpdateDefaultGearList(updated);
    setNewGearItem('');
    triggerAlert('Equipment template updated!');
  };

  // Delete global default gear item
  const handleRemoveDefaultGear = (idx: number) => {
    const updated = customGearList.filter((_, i) => i !== idx);
    onUpdateDefaultGearList(updated);
    triggerAlert('Equipment template item removed!');
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-sans font-bold tracking-tight text-zinc-900 mb-2">
          Studio Configurations
        </h1>
        <p className="text-sm text-zinc-500">
          Manage system databases, export sheets, backup records, and configure equipment templates.
        </p>
      </div>

      {/* Success Alert Banner */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center text-emerald-800 text-xs animate-scale-up font-mono shadow-sm">
          <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Data Backups (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Backup Panel */}
          <div className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-5">
            <h3 className="text-lg font-bold text-zinc-900 flex items-center">
              <RefreshCw className="w-4.5 h-4.5 text-zinc-700 mr-2.5" />
              Backup & Synchronization
            </h3>

            <p className="text-zinc-500 text-xs leading-relaxed">
              Ensure you never lose client appointments. Export your complete data records as a secure JSON snapshot or format to CSV Spreadsheet to share with accountants or partners.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* JSON Backup Download */}
              <button
                onClick={handleExportJSON}
                className="flex items-center justify-center py-3 px-4 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 hover:text-zinc-900 rounded-xl text-xs font-semibold transition shadow-sm"
              >
                <Download className="w-4 h-4 mr-2 text-zinc-700" />
                Export JSON Backup
              </button>

              {/* CSV Spreadsheet Download */}
              <button
                onClick={() => exportToCSV(shoots)}
                className="flex items-center justify-center py-3 px-4 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 hover:text-zinc-900 rounded-xl text-xs font-semibold transition shadow-sm"
              >
                <Download className="w-4 h-4 mr-2 text-zinc-700" />
                Export Excel/CSV Sheet
              </button>

              {/* JSON Restore Upload */}
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <button
                  type="button"
                  className="w-full flex items-center justify-center py-3 px-4 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 hover:text-zinc-900 rounded-xl text-xs font-semibold transition shadow-sm"
                >
                  <Upload className="w-4 h-4 mr-2 text-zinc-700" />
                  Restore JSON Backup
                </button>
              </div>

              {/* Auto Cloud Sync Mock */}
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] text-zinc-400 font-mono">Google Drive Sync</p>
                  <p className="text-xs text-zinc-700 font-medium truncate">Auto-Sync Enabled</p>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              </div>
            </div>
          </div>

          {/* Database Diagnostics */}
          <div className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-5">
            <h3 className="text-lg font-bold text-zinc-900 flex items-center">
              <AlertTriangle className="w-4.5 h-4.5 text-zinc-700 mr-2.5" />
              Database Diagnostics & Hazards
            </h3>

            <p className="text-zinc-500 text-xs leading-relaxed">
              Reset database elements if you're preparing for a new season or want to purge simulated items.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              {/* Reset to Mock Data */}
              <button
                onClick={() => {
                  if (confirm('Restore the default studio workspace data? This will append professional sample shootings.')) {
                    onResetToMock();
                    triggerAlert('Studio schedule reset to sample records successfully.');
                  }
                }}
                className="flex items-center px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 rounded-xl text-xs font-semibold transition"
              >
                <RefreshCw className="w-4 h-4 mr-2 text-zinc-700" />
                Inject Sample Shoots
              </button>

              {/* Wipe all data */}
              <button
                onClick={() => {
                  if (confirm('WARNING: Are you absolutely sure you want to delete ALL booking data permanently? This cannot be undone.')) {
                    onClearData();
                    triggerAlert('Studio database wiped completely.');
                  }
                }}
                className="flex items-center px-4 py-2.5 bg-red-50 hover:bg-red-105 text-red-700 border border-red-200 hover:border-red-300 rounded-xl text-xs font-semibold transition"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Purge All Data
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Global Defaults (5 Columns) */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-zinc-200 p-6 rounded-2xl h-full flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 mb-4 flex items-center">
                <Sliders className="w-4.5 h-4.5 text-zinc-700 mr-2.5" />
                Global Gear Template
              </h3>
              
              <p className="text-zinc-500 text-xs leading-relaxed mb-4">
                Configure the default equipment checklists automatically assigned when booking any new photography or videography assignment.
              </p>

              {/* List of default items */}
              <div className="space-y-1.5 max-h-[250px] overflow-y-auto pr-1 mb-4">
                {customGearList.map((item, index) => (
                  <div 
                    key={index}
                    className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-100 flex items-center justify-between text-xs text-zinc-700"
                  >
                    <span className="flex items-center">
                      <Camera className="w-3.5 h-3.5 text-zinc-500 mr-2 shrink-0" />
                      {item}
                    </span>
                    <button
                      onClick={() => handleRemoveDefaultGear(index)}
                      className="p-1 text-zinc-400 hover:text-red-600 transition"
                      title="Delete default gear"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Form to add default gear */}
            <form onSubmit={handleAddDefaultGear} className="border-t border-zinc-100 pt-4 flex gap-2">
              <input
                type="text"
                placeholder="New gear template item..."
                value={newGearItem}
                onChange={(e) => setNewGearItem(e.target.value)}
                className="flex-grow bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-900 text-white rounded-xl text-xs font-semibold shrink-0 shadow-sm"
              >
                Add Item
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
