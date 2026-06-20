const fs = require('fs');

// types.ts
fs.writeFileSync('src/types.ts', `export type EquipmentStatus = 'available' | 'hired' | 'maintenance';

export interface Equipment {
  machine_id: string;
  name: string;
  category: string;
  job_fit: string;
  access_width_mm: number;
  day_rate: number;
  delivery_rate: number;
  availability_status: EquipmentStatus;
  compliance_expiry: string;
  image_url: string;
  notes: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';

export interface Customer {
  name: string;
  phone: string;
  email: string;
}

export interface Booking {
  id: string;
  machine_id: string;
  customer: Customer;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  status: BookingStatus;
  totalCost: number;
  deliveryNeeded: boolean;
  deliveryAddress?: string;
  createdAt: string;
}`);

// mockData.ts
fs.writeFileSync('src/mockData.ts', `import { Equipment, Booking } from './types';

export const INITIAL_EQUIPMENT: Equipment[] = [
  {
    machine_id: 'EX-015',
    name: '1.5 Tonne Mini Digger',
    category: 'Excavators',
    job_fit: 'Driveways, small footings, landscaping',
    access_width_mm: 990,
    day_rate: 75,
    delivery_rate: 30,
    availability_status: 'available',
    compliance_expiry: '2027-05-10',
    image_url: 'https://images.unsplash.com/photo-1596541570776-857bdcb094bc?auto=format&fit=crop&q=80&w=400',
    notes: 'Tracks extendable. Comes with 3 buckets.'
  },
  {
    machine_id: 'EX-030',
    name: '3 Tonne Digger',
    category: 'Excavators',
    job_fit: 'Foundations, large extensions',
    access_width_mm: 1550,
    day_rate: 110,
    delivery_rate: 45,
    availability_status: 'hired',
    compliance_expiry: '2027-01-15',
    image_url: 'https://images.unsplash.com/photo-1620612140660-fcd865beebfa?auto=format&fit=crop&q=80&w=400',
    notes: 'Cabbed, quick hitch. Check track tension.'
  },
  {
    machine_id: 'DM-100',
    name: '1 Tonne Hi-Tip Dumper',
    category: 'Dumpers',
    job_fit: 'Moving spoil into skips, tight access',
    access_width_mm: 1120,
    day_rate: 60,
    delivery_rate: 30,
    availability_status: 'available',
    compliance_expiry: '2026-11-20',
    image_url: 'https://images.unsplash.com/photo-1647427017260-2565651ee173?auto=format&fit=crop&q=80&w=400',
    notes: 'Hydrostatic drive. Wash skip before return.'
  },
  {
    machine_id: 'CP-035',
    name: 'Wacker Plate (350mm)',
    category: 'Compaction',
    job_fit: 'Patio & block paving preparation',
    access_width_mm: 350,
    day_rate: 25,
    delivery_rate: 15,
    availability_status: 'maintenance',
    compliance_expiry: '2026-08-05',
    image_url: 'https://images.unsplash.com/photo-1563514787948-4e891ddba41c?auto=format&fit=crop&q=80&w=400',
    notes: 'Petrol, pull start needs checking. Include rubber mat.'
  },
  {
    machine_id: 'TR-015',
    name: 'Trencher Walk-Behind',
    category: 'Groundcare',
    job_fit: 'Laying cables, water pipes, drainage',
    access_width_mm: 700,
    day_rate: 90,
    delivery_rate: 35,
    availability_status: 'available',
    compliance_expiry: '2027-03-12',
    image_url: 'https://images.unsplash.com/photo-1605336676150-5bf064104996?auto=format&fit=crop&q=80&w=400',
    notes: 'Cuts up to 600mm deep. Check chain sharpness.'
  }
];

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);

const formatDate = (date: Date) => date.toISOString().split('T')[0];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bk-1',
    machine_id: 'EX-030',
    customer: {
      name: 'John Smith',
      phone: '07700 900123',
      email: 'john@example.com'
    },
    startDate: formatDate(today),
    endDate: formatDate(tomorrow),
    status: 'active',
    totalCost: 220,
    deliveryNeeded: true,
    deliveryAddress: '12 High St, London',
    createdAt: new Date(today.getTime() - 86400000).toISOString()
  },
  {
    id: 'bk-2',
    machine_id: 'EX-015',
    customer: {
      name: 'Sarah Jones',
      phone: '07700 900456',
      email: 'sarah.j@example.com'
    },
    startDate: formatDate(tomorrow),
    endDate: formatDate(new Date(tomorrow.getTime() + 86400000 * 2)),
    status: 'confirmed',
    totalCost: 225,
    deliveryNeeded: false,
    createdAt: formatDate(today)
  }
];`);

// store.tsx
let storeCode = fs.readFileSync('src/store.tsx', 'utf8');
storeCode = storeCode.replace(/equipmentId/g, 'machine_id')
                     .replace(/e\.id === id/g, 'e.machine_id === id')
                     .replace(/\{ \.\.\.e, status \}/g, '{ ...e, availability_status: status }');
fs.writeFileSync('src/store.tsx', storeCode);

function replaceBulk(file, pairs) {
   if(!fs.existsSync(file)) return;
   let c = fs.readFileSync(file, 'utf8');
   pairs.forEach(p => c = c.split(p[0]).join(p[1]));
   fs.writeFileSync(file, c);
}

replaceBulk('src/pages/customer/Home.tsx', [
  ['item.id', 'item.machine_id'],
  ['item.imageUrl', 'item.image_url'],
  ["item.specs.slice(0, 2).join(' • ')", "\`${item.job_fit} • ${item.access_width_mm}mm wide\`"],
  ['item.dailyRate', 'item.day_rate']
]);

replaceBulk('src/pages/customer/EquipmentDetails.tsx', [
  ['e.id === id', 'e.machine_id === id'],
  ['item.imageUrl', 'item.image_url'],
  ['item.id', 'item.machine_id'],
  ['item.code', 'item.machine_id'],
  ['item.specs.map((spec, i) => (', '[item.job_fit, `Access Width: ${item.access_width_mm}mm`, `Compliance Expires: ${new Date(item.compliance_expiry).toLocaleDateString()}`, `Notes: ${item.notes}`].map((spec, i) => ('],
  ['item.dailyRate', 'item.day_rate']
]);

replaceBulk('src/pages/customer/BookingSuccess.tsx', [
  ['equipment.imageUrl', 'equipment.image_url']
]);

replaceBulk('src/pages/operator/Dashboard.tsx', [
  ['e.id === id', 'e.machine_id === id'],
  ['b.equipmentId', 'b.machine_id']
]);

replaceBulk('src/pages/operator/HiresList.tsx', [
  ['e.id === id', 'e.machine_id === id'],
  ['b.equipmentId', 'b.machine_id']
]);

replaceBulk('src/pages/operator/HireDetails.tsx', [
  ['booking.equipmentId', 'booking.machine_id'],
  ['item.imageUrl', 'item.image_url'],
  ['item.code', 'item.machine_id']
]);

replaceBulk('src/pages/operator/FleetList.tsx', [
  ['item.id', 'item.machine_id'],
  ['item.imageUrl', 'item.image_url'],
  ['item.code', 'item.machine_id'],
  ['item.status', 'item.availability_status']
]);
