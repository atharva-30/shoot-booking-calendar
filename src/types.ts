export type ShootType = 'Photography' | 'Videography' | 'Reels';
export type PaymentStatus = 'Pending' | 'Advance Received' | 'Fully Paid';
export type RecurrenceType = 'none' | 'weekly' | 'monthly';

export interface GearItem {
  id: string;
  name: string;
  checked: boolean;
}

export interface AttachmentItem {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
  dataUrl?: string; // Storing base64 for persistent attachments
}

export interface ShootReminder {
  oneWeekBefore: boolean;
  oneDayBefore: boolean;
  twoHoursBefore: boolean;
}

export interface Shoot {
  id: string;
  title: string;
  address: string;
  shootTime: string; // HH:MM format
  shootType: ShootType;
  submissionDate: string; // YYYY-MM-DD format
  clientName: string;
  clientContact: string;
  teamMembers: string[];
  date: string; // YYYY-MM-DD format
  notes: string;
  gearChecklist: GearItem[];
  paymentStatus: PaymentStatus;
  isCompleted: boolean;
  reminders: ShootReminder;
  attachments: AttachmentItem[];
  isRecurring: boolean;
  recurrenceType: RecurrenceType;
  createdAt: string;
}

export interface AppStats {
  upcomingCount: number;
  todayCount: number;
  completedCount: number;
  pendingDeliveriesCount: number;
}

export type ViewMode = 'calendar' | 'upcoming' | 'completed' | 'dashboard' | 'settings';
