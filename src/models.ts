export type EquipmentStatus = 'available' | 'hired' | 'maintenance';

export interface Equipment {
  id: string;
  name: string;
  make: string;
  model: string;
  category: string;
  dailyRate: number;
  imageUrl: string;
  status: EquipmentStatus;
}

export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  equipmentId: string;
  customerName: string;
  siteAddress: string;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  createdAt: string;
}
