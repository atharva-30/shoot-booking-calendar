import React, { useState, useEffect, useMemo } from 'react';
import { Shoot, AppStats, ViewMode } from './types';
import { exportToCSV, getMockShoots } from './utils';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

// Import View Components
import DashboardView from './components/DashboardView';
import CalendarView from './components/CalendarView';
import ShootList from './components/ShootList';
import SettingsView from './components/SettingsView';
import NotificationCenter from './components/NotificationCenter';

// Import Modals
import ShootDetailModal from './components/ShootDetailModal';
import ShootFormModal from './components/ShootFormModal';

// Import Icons
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  Settings, 
  LayoutDashboard, 
  Bell, 
  Aperture,
  Menu,
  X,
  FileText
} from 'lucide-react';


export default function App() {
  // --- Persistent Storage Logic ---
  // Load initial shoots from localStorage or fall back to high-fidelity mocks immediately
  const [shoots, setShoots] = useState<Shoot[]>([]);

  // Load initial default gear checklist from localStorage or fall back to standard list
  const [defaultGearList, setDefaultGearList] = useState<string[]>(() => {
    const saved = localStorage.getItem('default_gear_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error('Failed to parse saved default gear list', err);
      }
    }
    return [
      'Camera (Primary)',
      'Camera (Backup)',
      'Lens 24-70mm f/2.8',
      'Lens 50mm f/1.2',
      'Drone + Controller',
      'Gimbal (Ronin)',
      'Tripod',
      'LED Lights & Stands',
      'Batteries (Fully Charged)',
      'Memory Cards (Formatted)'
    ];
  });

  // Sync shoots with Firestore when available, fall back to localStorage on permissions/connection errors
// Sync shoots with Firestore
useEffect(() => {
  const q = collection(db, 'shoots');

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const list: Shoot[] = [];

      snapshot.forEach((docSnap) => {
        list.push({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Shoot, 'id'>),
        });
      });

      setShoots(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'shoots', false);
    }
  );

  return () => unsubscribe();
}, []);
  // Sync default gear checklist template with Firestore when available
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'gear'), (docSnap) => {
      if (docSnap.exists()) {
        const items = docSnap.data().items || [];
        setDefaultGearList(items);
        localStorage.setItem('default_gear_list', JSON.stringify(items));
      } else {
        setDoc(doc(db, 'settings', 'gear'), {
          items: defaultGearList
        }).catch(err => handleFirestoreError(err, OperationType.WRITE, 'settings/gear', false));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'settings/gear', false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateDefaultGearList = async (newList: string[]) => {
    // Instantly save locally
    setDefaultGearList(newList);
    localStorage.setItem('default_gear_list', JSON.stringify(newList));
    // Try cloud write
    try {
      await setDoc(doc(db, 'settings', 'gear'), { items: newList });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/gear', false);
    }
  };

  // --- Layout & View Navigation State ---
  const [activeView, setActiveView] = useState<ViewMode>('calendar');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar toggle
  const [isAlertPanelOpen, setIsAlertPanelOpen] = useState(false); // Quick alerts side panel

  // --- Modals State ---
  const [selectedShoot, setSelectedShoot] = useState<Shoot | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formPreFillDate, setFormPreFillDate] = useState<string | undefined>(undefined);
  const [editingShoot, setEditingShoot] = useState<Shoot | undefined>(undefined);

  // --- Statistics Calculation ---
  const stats: AppStats = useMemo(() => {
    const todayStr = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Kolkata',
}).format(new Date());
    
    const upcomingCount = shoots.filter(s => !s.isCompleted && s.date >= todayStr).length;
    const todayCount = shoots.filter(s => s.date === todayStr).length;
    const completedCount = shoots.filter(s => s.isCompleted).length;
    
    // Pending deliveries: shoots completed but without final file/invoice settled or submissionDate not met
    const pendingDeliveriesCount = shoots.filter(s => !s.isCompleted && s.submissionDate && s.submissionDate >= todayStr).length;

    return {
      upcomingCount,
      todayCount,
      completedCount,
      pendingDeliveriesCount
    };
  }, [shoots]);

  // Alert Badge Count
  const alertCount = useMemo(() => {
    const todayDate = new Date(
  new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata',
  })
);
    return shoots.filter(shoot => {
      if (shoot.isCompleted) return false;
      const [y, m, d] = shoot.date.split('-').map(Number);
      const shootDate = new Date(y, m - 1, d);
      const diffTime = shootDate.getTime() - todayDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const weekAlert = shoot.reminders.oneWeekBefore && diffDays > 0 && diffDays <= 7;
      const dayAlert = shoot.reminders.oneDayBefore && diffDays === 1;
      const hourAlert = shoot.reminders.twoHoursBefore && diffDays === 0;

      return weekAlert || dayAlert || hourAlert;
    }).length;
  }, [shoots]);

  // --- CRUD Event Handlers ---
  
  // Book new shoot
  const handleSaveShoot = async (savedShoot: Shoot) => {
    // Generate potential recurring shoots first
    const generatedShoots: Shoot[] = [];
    if (!editingShoot && savedShoot.isRecurring && savedShoot.recurrenceType !== 'none') {
      const [y, m, d] = savedShoot.date.split('-').map(Number);
      const baseDate = new Date(y, m - 1, d);

      // Generate 3 repeating shoots
      for (let i = 1; i <= 3; i++) {
        const repeatDate = new Date(baseDate);
        if (savedShoot.recurrenceType === 'weekly') {
          repeatDate.setDate(baseDate.getDate() + (i * 7));
        } else if (savedShoot.recurrenceType === 'monthly') {
          repeatDate.setMonth(baseDate.getMonth() + i);
        }

        const yyyy = repeatDate.getFullYear();
        const mm = String(repeatDate.getMonth() + 1).padStart(2, '0');
        const dd = String(repeatDate.getDate()).padStart(2, '0');
        const repeatDateStr = `${yyyy}-${mm}-${dd}`;

        const recurringShoot: Shoot = {
          ...savedShoot,
          id: `${savedShoot.id}-recurring-${i}`,
          date: repeatDateStr,
          isRecurring: false, // Don't chain infinitely
          recurrenceType: 'none',
          createdAt: new Date().toISOString()
        };
        generatedShoots.push(recurringShoot);
      }
    }

    // 1. Update state & localStorage instantly
    setShoots(prev => {
      let updatedList: Shoot[];
      if (editingShoot) {
        updatedList = prev.map(s => s.id === savedShoot.id ? savedShoot : s);
      } else {
        updatedList = [...prev, savedShoot, ...generatedShoots];
      }
      localStorage.setItem('photographer_shoots_v1', JSON.stringify(updatedList));
      return updatedList;
    });

    setIsFormOpen(false);
    setEditingShoot(undefined);
    setFormPreFillDate(undefined);
    
    // If we're updating a shoot that is currently selected in detailed view, update selected view as well
    if (selectedShoot && selectedShoot.id === savedShoot.id) {
      setSelectedShoot(savedShoot);
    }

    // 2. Try Firestore write
    try {
      await setDoc(doc(db, 'shoots', savedShoot.id), savedShoot);
      for (const s of generatedShoots) {
        await setDoc(doc(db, 'shoots', s.id), s);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `shoots/${savedShoot.id}`, false);
    }
  };

  // Delete shoot
  const handleDeleteShoot = async (shootId: string) => {
    // 1. Update state & localStorage instantly
    setShoots(prev => {
      const updatedList = prev.filter(s => s.id !== shootId);
      localStorage.setItem('photographer_shoots_v1', JSON.stringify(updatedList));
      return updatedList;
    });
    setSelectedShoot(null);

    // 2. Try Firestore delete
    try {
      await deleteDoc(doc(db, 'shoots', shootId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `shoots/${shootId}`, false);
    }
  };

  // Duplicate shoot
  const handleDuplicateShoot = async (shootToDuplicate: Shoot) => {
    const duplicated: Shoot = {
      ...shootToDuplicate,
      id: `shoot-dup-${Date.now()}`,
      title: `${shootToDuplicate.title} (Copy)`,
      isCompleted: false, // Reset completed
      attachments: [], // Clear attachments on copy
      createdAt: new Date().toISOString()
    };

    // 1. Update state & localStorage instantly
    setShoots(prev => {
      const updatedList = [...prev, duplicated];
      localStorage.setItem('photographer_shoots_v1', JSON.stringify(updatedList));
      return updatedList;
    });
    setSelectedShoot(duplicated); // Open detail for the copied item

    // 2. Try Firestore write
    try {
      await setDoc(doc(db, 'shoots', duplicated.id), duplicated);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `shoots/${duplicated.id}`, false);
    }
  };

  // Toggle complete state
  const handleToggleComplete = async (shootId: string) => {
    const currentShoot = shoots.find(s => s.id === shootId);
    if (!currentShoot) return;

    const updated = { ...currentShoot, isCompleted: !currentShoot.isCompleted };

    // 1. Update state & localStorage instantly
    setShoots(prev => {
      const updatedList = prev.map(s => s.id === shootId ? updated : s);
      localStorage.setItem('photographer_shoots_v1', JSON.stringify(updatedList));
      return updatedList;
    });
    if (selectedShoot && selectedShoot.id === shootId) {
      setSelectedShoot(updated);
    }

    // 2. Try Firestore write
    try {
      await setDoc(doc(db, 'shoots', shootId), updated);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `shoots/${shootId}`, false);
    }
  };

  // Update shoot checklist, notes, or files on the fly
  const handleUpdateShootOnTheFly = async (updatedShoot: Shoot) => {
    // 1. Update state & localStorage instantly
    setShoots(prev => {
      const updatedList = prev.map(s => s.id === updatedShoot.id ? updatedShoot : s);
      localStorage.setItem('photographer_shoots_v1', JSON.stringify(updatedList));
      return updatedList;
    });
    setSelectedShoot(updatedShoot);

    // 2. Try Firestore write
    try {
      await setDoc(doc(db, 'shoots', updatedShoot.id), updatedShoot);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `shoots/${updatedShoot.id}`, false);
    }
  };

  // Navigation click helpers
  const handleNavigate = (view: ViewMode) => {
    setActiveView(view);
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-800 flex flex-col font-sans antialiased selection:bg-zinc-200 selection:text-zinc-900">
      
      {/* Top Navigation Bar (Mobile Header) */}
      <header className="lg:hidden bg-white border-b border-zinc-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <Aperture className="w-6 h-6 text-zinc-800 animate-spin-slow" />
          <span className="text-sm font-sans font-bold tracking-tight text-zinc-900 uppercase">
            Aperture Studio
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          {/* Alerts Bell */}
          <button 
            onClick={() => setIsAlertPanelOpen(!isAlertPanelOpen)}
            className="p-2 bg-zinc-100 text-zinc-600 hover:text-zinc-900 rounded-xl relative border border-zinc-200"
            title="Alert center"
          >
            <Bell className="w-4 h-4" />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-zinc-900 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {alertCount}
              </span>
            )}
          </button>

          {/* Hamburger Menu */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 bg-zinc-100 text-zinc-600 hover:text-zinc-900 rounded-xl border border-zinc-200"
            id="mobile-menu-toggle"
          >
            {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Structural Body */}
      <div className="flex-grow flex relative">
        
        {/* SIDE NAVIGATION (Desktop rail & Mobile Drawer) */}
        <nav className={`
          fixed lg:sticky top-0 bottom-0 left-0 z-40
          w-64 bg-white border-r border-zinc-200 p-6 flex flex-col justify-between
          transition-transform duration-300 lg:translate-x-0
          h-[100vh] lg:h-auto
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `} id="main-navigation">
          
          <div className="space-y-8">
            {/* Desktop Brand Banner */}
            <div className="hidden lg:flex items-center space-x-3 pb-4 border-b border-zinc-200">
              <div className="p-2 bg-zinc-900 rounded-xl text-white shadow-sm">
                <Aperture className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <h1 className="text-sm font-sans font-bold tracking-tight text-zinc-900 uppercase leading-none">
                  Aperture Studio
                </h1>
                <p className="text-[10px] text-zinc-400 font-mono tracking-widest mt-1">PRODUCTION DESK</p>
              </div>
            </div>

            {/* Menu Items Links */}
            <div className="space-y-1.5">
              <span className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-3 px-2">Menu Console</span>
              
              {/* Dashboard Link */}
              <button
                onClick={() => handleNavigate('dashboard')}
                className={`w-full flex items-center px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition duration-200 group ${
                  activeView === 'dashboard' 
                    ? 'bg-zinc-900 text-white shadow-sm' 
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
                id="nav-dashboard"
              >
                <LayoutDashboard className="w-4 h-4 mr-3 shrink-0" />
                Studio Overview
              </button>

              {/* Calendar Link */}
              <button
                onClick={() => handleNavigate('calendar')}
                className={`w-full flex items-center px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition duration-200 group ${
                  activeView === 'calendar' 
                    ? 'bg-zinc-900 text-white shadow-sm' 
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
                id="nav-calendar"
              >
                <Calendar className="w-4 h-4 mr-3 shrink-0" />
                Master Calendar
              </button>

              {/* Upcoming Shoots Link */}
              <button
                onClick={() => handleNavigate('upcoming')}
                className={`w-full flex items-center px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition duration-200 group ${
                  activeView === 'upcoming' 
                    ? 'bg-zinc-900 text-white shadow-sm' 
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
                id="nav-upcoming"
              >
                <Clock className="w-4 h-4 mr-3 shrink-0" />
                Upcoming Shoots
              </button>

              {/* Completed Shoots Link */}
              <button
                onClick={() => handleNavigate('completed')}
                className={`w-full flex items-center px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition duration-200 group ${
                  activeView === 'completed' 
                    ? 'bg-zinc-900 text-white shadow-sm' 
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
                id="nav-completed"
              >
                <CheckCircle className="w-4 h-4 mr-3 shrink-0" />
                Completed Shoots
              </button>

              {/* Settings Link */}
              <button
                onClick={() => handleNavigate('settings')}
                className={`w-full flex items-center px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition duration-200 group ${
                  activeView === 'settings' 
                    ? 'bg-zinc-900 text-white shadow-sm' 
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
                id="nav-settings"
              >
                <Settings className="w-4 h-4 mr-3 shrink-0" />
                Settings & Database
              </button>
            </div>
          </div>

          {/* Desktop Footer Alert Bell Quick Toggle */}
          <div className="pt-6 border-t border-zinc-200">
            <button
              onClick={() => setIsAlertPanelOpen(!isAlertPanelOpen)}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
                isAlertPanelOpen 
                  ? 'bg-zinc-100 border-zinc-300 text-zinc-900' 
                  : 'bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <span className="flex items-center text-xs font-semibold">
                <Bell className="w-4 h-4 mr-2.5" />
                Alert Drawer
              </span>
              {alertCount > 0 && (
                <span className="bg-zinc-900 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {alertCount}
                </span>
              )}
            </button>
          </div>

        </nav>

        {/* MAIN WORKSPACE SCREEN (Scrollable content core) */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto space-y-6">
          
          {/* Render Views Dynamically */}
          {activeView === 'dashboard' && (
            <DashboardView 
              shoots={shoots}
              stats={stats}
              onSelectShoot={setSelectedShoot}
              onNavigateToCalendar={() => handleNavigate('calendar')}
              onNavigateToUpcoming={() => handleNavigate('upcoming')}
              onNavigateToCompleted={() => handleNavigate('completed')}
            />
          )}

          {activeView === 'calendar' && (
            <CalendarView 
              shoots={shoots}
              onSelectShoot={setSelectedShoot}
              onAddShoot={(dateStr) => {
                setFormPreFillDate(dateStr);
                setEditingShoot(undefined);
                setIsFormOpen(true);
              }}
            />
          )}

          {(activeView === 'upcoming' || activeView === 'completed') && (
            <ShootList 
              shoots={shoots}
              type={activeView}
              onSelectShoot={setSelectedShoot}
              onAddShoot={() => {
                setEditingShoot(undefined);
                setFormPreFillDate(undefined);
                setIsFormOpen(true);
              }}
              exportCSV={() => exportToCSV(shoots)}
            />
          )}

          {activeView === 'settings' && (
            <SettingsView 
              shoots={shoots}
              onImportData={async (importedShoots) => {
                // 1. Update state & localStorage instantly
                setShoots(prev => {
                  const next = [...prev, ...importedShoots];
                  localStorage.setItem('photographer_shoots_v1', JSON.stringify(next));
                  return next;
                });
                
                // 2. Try Firestore sync
                const batch = writeBatch(db);
                importedShoots.forEach((s) => {
                  batch.set(doc(db, 'shoots', s.id), s);
                });
                try {
                  await batch.commit();
                } catch (err) {
                  handleFirestoreError(err, OperationType.WRITE, 'shoots/batch', false);
                }
              }}
              onClearData={async () => {
                const currentShoots = [...shoots];
                // 1. Update state & localStorage instantly
                setShoots([]);
                localStorage.setItem('photographer_shoots_v1', JSON.stringify([]));

                // 2. Try Firestore sync
                const batch = writeBatch(db);
                currentShoots.forEach((s) => {
                  batch.delete(doc(db, 'shoots', s.id));
                });
                try {
                  await batch.commit();
                } catch (err) {
                  handleFirestoreError(err, OperationType.DELETE, 'shoots/batch', false);
                }
              }}
              onResetToMock={async () => {
                const currentShoots = [...shoots];
                const mocks = getMockShoots();
                // 1. Update state & localStorage instantly
                setShoots(mocks);
                

                // 2. Try Firestore sync
                const batch = writeBatch(db);
                // First delete all existing in Firestore
                currentShoots.forEach((s) => {
                  batch.delete(doc(db, 'shoots', s.id));
                });
                // Then set the mock shoots in Firestore
                mocks.forEach((s) => {
                  batch.set(doc(db, 'shoots', s.id), s);
                });
                try {
                  await batch.commit();
                } catch (err) {
                  handleFirestoreError(err, OperationType.WRITE, 'shoots/batch', false);
                }
              }}
              customGearList={defaultGearList}
              onUpdateDefaultGearList={handleUpdateDefaultGearList}
            />
          )}

        </main>

        {/* RIGHT ALIGNED COLLAPSIBLE ALERT DRAWER */}
        {isAlertPanelOpen && (
          <aside className="fixed inset-y-0 right-0 z-45 w-full sm:w-96 bg-white border-l border-zinc-200 p-6 shadow-2xl animate-slide-left overflow-y-auto flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <span className="text-sm font-bold text-zinc-900 tracking-tight flex items-center">
                  <Bell className="w-4 h-4 text-zinc-700 mr-2 shrink-0" />
                  Upcoming Reminders
                </span>
                <button
                  onClick={() => setIsAlertPanelOpen(false)}
                  className="p-1.5 hover:bg-zinc-50 border border-zinc-200 text-zinc-500 hover:text-zinc-900 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <NotificationCenter 
                shoots={shoots}
                onSelectShoot={(shoot) => {
                  setSelectedShoot(shoot);
                  setIsAlertPanelOpen(false);
                }}
              />
            </div>

            <div className="pt-6 border-t border-zinc-100 mt-6 text-center">
              <p className="text-[10px] text-zinc-400 font-mono">Aperture Studio • Production v1.0</p>
            </div>
          </aside>
        )}

      </div>

      {/* --- BACKDROP FOR MOBILE SIDEBARS --- */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* --- MODAL DIALOGS --- */}

      {/* Shoot Detailed Workspace Sheet */}
      {selectedShoot && (
        <ShootDetailModal 
          shoot={selectedShoot}
          onClose={() => setSelectedShoot(null)}
          onEdit={(shoot) => {
            setEditingShoot(shoot);
            setIsFormOpen(true);
          }}
          onDelete={handleDeleteShoot}
          onDuplicate={handleDuplicateShoot}
          onToggleComplete={handleToggleComplete}
          onUpdateShoot={handleUpdateShootOnTheFly}
        />
      )}

      {/* Shoot Booking & Edit Form Dialog */}
      {isFormOpen && (
        <ShootFormModal 
          initialShoot={editingShoot}
          initialDate={formPreFillDate}
          onClose={() => {
            setIsFormOpen(false);
            setEditingShoot(undefined);
            setFormPreFillDate(undefined);
          }}
          onSave={handleSaveShoot}
          defaultGearList={defaultGearList}
        />
      )}

    </div>
  );
}
