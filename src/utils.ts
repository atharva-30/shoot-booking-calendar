import { Shoot, GearItem } from './types';

export const DEFAULT_GEAR_LIST = [
  'Sony A7S3',
  'Sony A7M3',
  'Lens 24-50mm G f/2.8',
  'Lens 35mm GM f/1.4',
  'Avata 2',
  'Gimbal',
  'Batteries (Fully Charged)',
  'Memory Cards (Formatted)',
];

export function getInitialGearChecklist(): GearItem[] {
  return DEFAULT_GEAR_LIST.map((name, idx) => ({
    id: `gear-${idx}-${Date.now()}`,
    name,
    checked: false
  }));
}

export function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  const [hourStr, minStr] = timeStr.split(':');
  const hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minStr} ${ampm}`;
}

export function formatDateString(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Generates high-fidelity mock data relative to 2026-07-16
export function getMockShoots(): Shoot[] {
  const baseDate = '2026-07-16'; // Local time context
  
  return [
    {
      id: 'shoot-1',
      title: 'Wedding - Rahul & Priya',
      address: 'Grand Hyatt, Regency Ballroom, Mumbai',
      shootTime: '09:00',
      shootType: 'Reels',
      submissionDate: '2026-08-16',
      clientName: 'Rahul Sharma',
      clientContact: '+919876543210',
      teamMembers: ['Atharva', 'Om', 'Rohit', 'Vishal'],
      date: '2026-07-20', // Matches user prompt's "20 July: Wedding - Rahul"
      notes: 'Traditional wedding shoot. High emphasis on bridal entrance and varmala. Drone permitted outside only.',
      gearChecklist: [
        { id: 'g1', name: 'Camera (Primary)', checked: true },
        { id: 'g2', name: 'Camera (Backup)', checked: true },
        { id: 'g3', name: 'Lens 24-70mm f/2.8', checked: true },
        { id: 'g4', name: 'Drone + Controller', checked: false },
        { id: 'g5', name: 'Gimbal (Ronin)', checked: true },
        { id: 'g6', name: 'Memory Cards (Formatted)', checked: true }
      ],
      paymentStatus: 'Advance Received',
      isCompleted: false,
      reminders: { oneWeekBefore: true, oneDayBefore: true, twoHoursBefore: true },
      attachments: [
        { id: 'att-1', name: 'Wedding_Moodboard.jpg', size: '1.2 MB', type: 'image/jpeg' },
        { id: 'att-2', name: 'Contract_Signed.pdf', size: '450 KB', type: 'application/pdf' }
      ],
      isRecurring: false,
      recurrenceType: 'none',
      createdAt: new Date().toISOString()
    },
    {
      id: 'shoot-2',
      title: 'Birthday - Aryan 1st Birthday',
      address: 'Villa 45, Palm Beach Road, Sanpada',
      shootTime: '17:30',
      shootType: 'Photography',
      submissionDate: '2026-07-30',
      clientName: 'Aryan Kapoor',
      clientContact: '+919988776655',
      teamMembers: ['Atharva', 'Om'],
      date: '2026-07-20', // Matches user prompt's "20 July: Birthday - Aryan"
      notes: 'Kids birthday party. Capture candid moments of kids playing and cake cutting. Soft lighting setup needed.',
      gearChecklist: [
        { id: 'g1', name: 'Camera (Primary)', checked: true },
        { id: 'g3', name: 'Lens 50mm f/1.2', checked: true },
        { id: 'g7', name: 'LED Lights & Stands', checked: false },
        { id: 'g8', name: 'Batteries (Fully Charged)', checked: true }
      ],
      paymentStatus: 'Fully Paid',
      isCompleted: false,
      reminders: { oneWeekBefore: false, oneDayBefore: true, twoHoursBefore: true },
      attachments: [],
      isRecurring: false,
      recurrenceType: 'none',
      createdAt: new Date().toISOString()
    },
    {
      id: 'shoot-3',
      title: 'Corporate Shoot - Infosys Campus',
      address: 'Infosys DC, Phase II, Hinjewadi, Pune',
      shootTime: '11:00',
      shootType: 'Videography',
      submissionDate: '2026-08-05',
      clientName: 'Infosys PR Team',
      clientContact: '+919123456789',
      teamMembers: ['Rohit', 'Vishal'],
      date: '2026-07-20', // Matches user prompt's "20 July: Corporate Shoot - Infosys"
      notes: 'B-roll of campus architecture, employee interactions and executive interviews. High dynamic range profile.',
      gearChecklist: [
        { id: 'g1', name: 'Camera (Primary)', checked: true },
        { id: 'g4', name: 'Drone + Controller', checked: true },
        { id: 'g5', name: 'Gimbal (Ronin)', checked: true },
        { id: 'g9', name: 'Wireless Mics (Rode Link)', checked: true }
      ],
      paymentStatus: 'Pending',
      isCompleted: false,
      reminders: { oneWeekBefore: true, oneDayBefore: true, twoHoursBefore: false },
      attachments: [],
      isRecurring: false,
      recurrenceType: 'none',
      createdAt: new Date().toISOString()
    },
    // Today's shoots (July 16, 2026)
    {
      id: 'shoot-4',
      title: 'Maternity Shoot - Riya & Sameer',
      address: 'Sanjay Gandhi National Park, Borivali',
      shootTime: '07:00',
      shootType: 'Photography',
      submissionDate: '2026-07-26',
      clientName: 'Sameer Mehta',
      clientContact: '+919811223344',
      teamMembers: ['Atharva', 'Rohit'],
      date: '2026-07-16', // Today
      notes: 'Early morning golden hour shoot. Focus on serene, natural forest background. Bring warm clothes for client.',
      gearChecklist: [
        { id: 'g1', name: 'Camera (Primary)', checked: true },
        { id: 'g2', name: 'Lens 50mm f/1.2', checked: true },
        { id: 'g3', name: 'Memory Cards (Formatted)', checked: true }
      ],
      paymentStatus: 'Advance Received',
      isCompleted: false,
      reminders: { oneWeekBefore: true, oneDayBefore: true, twoHoursBefore: true },
      attachments: [],
      isRecurring: false,
      recurrenceType: 'none',
      createdAt: new Date().toISOString()
    },
    {
      id: 'shoot-5',
      title: 'Fashion Editorial - Neon Streets',
      address: 'Carter Road Promenade, Bandra West',
      shootTime: '19:00',
      shootType: 'Reels',
      submissionDate: '2026-07-28',
      clientName: 'ZARA Designer Team',
      clientContact: '+919944556677',
      teamMembers: ['Om', 'Vishal'],
      date: '2026-07-16', // Today
      notes: 'Cyberpunk styled neon fashion shoot. Fast lenses essential. Use portable tube lights to add dramatic colors.',
      gearChecklist: [
        { id: 'g1', name: 'Camera (Primary)', checked: true },
        { id: 'g2', name: 'Lens 50mm f/1.2', checked: true },
        { id: 'g3', name: 'LED Lights & Stands', checked: true },
        { id: 'g4', name: 'Batteries (Fully Charged)', checked: true }
      ],
      paymentStatus: 'Advance Received',
      isCompleted: false,
      reminders: { oneWeekBefore: false, oneDayBefore: true, twoHoursBefore: true },
      attachments: [],
      isRecurring: false,
      recurrenceType: 'none',
      createdAt: new Date().toISOString()
    },
    // Completed shoots (Past shoots)
    {
      id: 'shoot-6',
      title: 'Pre-Wedding Shoot - Sneha & Kunal',
      address: 'Lonavala Valley View Point',
      shootTime: '06:30',
      shootType: 'Reels',
      submissionDate: '2026-07-20',
      clientName: 'Kunal Deshmukh',
      clientContact: '+919765432109',
      teamMembers: ['Atharva', 'Om', 'Rohit'],
      date: '2026-07-10', // Past
      notes: 'Mist and hills background. Gorgeous shots. Submission date pending, need to deliver final album.',
      gearChecklist: [],
      paymentStatus: 'Fully Paid',
      isCompleted: true, // Completed!
      reminders: { oneWeekBefore: false, oneDayBefore: false, twoHoursBefore: false },
      attachments: [],
      isRecurring: false,
      recurrenceType: 'none',
      createdAt: new Date().toISOString()
    },
    {
      id: 'shoot-7',
      title: 'Real Estate Portfolio - Lodha Luxury',
      address: 'Lodha World Towers, Lower Parel',
      shootTime: '14:00',
      shootType: 'Photography',
      submissionDate: '2026-07-18',
      clientName: 'Lodha Marketing',
      clientContact: '+919001122334',
      teamMembers: ['Vishal'],
      date: '2026-07-12', // Past
      notes: 'Super-wide angle lenses used. Ultra-premium interior styling.',
      gearChecklist: [],
      paymentStatus: 'Fully Paid',
      isCompleted: true, // Completed!
      reminders: { oneWeekBefore: false, oneDayBefore: false, twoHoursBefore: false },
      attachments: [],
      isRecurring: false,
      recurrenceType: 'none',
      createdAt: new Date().toISOString()
    },
    // Future upcoming shoot
    {
      id: 'shoot-8',
      title: 'Music Video - "Aashiyana"',
      address: 'Film City, Studio 4, Goregaon',
      shootTime: '08:00',
      shootType: 'Videography',
      submissionDate: '2026-08-10',
      clientName: 'Sony Music India',
      clientContact: '+919554433221',
      teamMembers: ['Atharva', 'Om', 'Rohit', 'Vishal'],
      date: '2026-07-28', // Future
      notes: 'Big setup. High contrast lighting. Red Helium or Arri Alexa camera rental. Bring high-speed memory cards.',
      gearChecklist: [
        { id: 'g1', name: 'Camera (Primary)', checked: false },
        { id: 'g2', name: 'Gimbal (Ronin)', checked: false },
        { id: 'g3', name: 'Batteries (Fully Charged)', checked: false }
      ],
      paymentStatus: 'Advance Received',
      isCompleted: false,
      reminders: { oneWeekBefore: true, oneDayBefore: true, twoHoursBefore: true },
      attachments: [],
      isRecurring: false,
      recurrenceType: 'none',
      createdAt: new Date().toISOString()
    }
  ];
}

export function exportToCSV(shoots: Shoot[]): void {
  const headers = ['Shoot Title', 'Date', 'Time', 'Type', 'Location', 'Client Name', 'Client Phone', 'Team Members', 'Status', 'Submission Date', 'Notes'];
  const rows = shoots.map(s => [
    `"${s.title.replace(/"/g, '""')}"`,
    s.date,
    s.shootTime,
    s.shootType,
    `"${s.address.replace(/"/g, '""')}"`,
    `"${s.clientName.replace(/"/g, '""')}"`,
    `"${s.clientContact}"`,
    `"${s.teamMembers.join(', ')}"`,
    s.isCompleted ? 'Completed' : 'Pending',
    s.submissionDate,
    `"${(s.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' 
    + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `photographer_shoots_backup_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateWhatsAppShareText(shoot: Shoot): string {
  const teamList = shoot.teamMembers.length > 0 ? shoot.teamMembers.map(t => `• ${t}`).join('%0A') : 'None';
  const gearList = shoot.gearChecklist.length > 0 ? shoot.gearChecklist.map(g => `${g.checked ? '✓' : '☐'} ${g.name}`).join('%0A') : 'None';
  
  const text = `*📸 SHOOT ASSIGNMENT DETAILS* %0A%0A` +
    `*Title:* ${shoot.title}%0A` +
    `*Date:* ${formatDateString(shoot.date)}%0A` +
    `*Time:* ${formatTime(shoot.shootTime)}%0A` +
    `*Type:* ${shoot.shootType}%0A` +
    `*Location:* ${shoot.address}%0A%0A` +
    `*Client:* ${shoot.clientName} (${shoot.clientContact})%0A` +
    `*Submission Deadline:* ${formatDateString(shoot.submissionDate)}%0A%0A` +
    `*👥 Assigned Team:* %0A${teamList}%0A%0A` +
    `*⚙️ Equipment Checklist:* %0A${gearList}%0A%0A` +
    `*📝 Special Notes:* %0A${shoot.notes || 'None'}`;
    
  return `https://wa.me/?text=${text}`;
}
