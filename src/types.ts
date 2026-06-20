export type EquipmentStatus = 'available' | 'hired' | 'maintenance';

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

export interface Booking {
  booking_id: string;
  machine_id: string;
  hirer_name: string;
  hirer_phone: string;
  hirer_email: string;
  site_address: string;
  start_date: string;
  end_date: string;
  delivery_window: string;
  status: BookingStatus;
  qr_start_code: string;
  qr_end_code: string;
  timestamp_created: string;
  totalCost: number;
  deliveryNeeded: boolean;
}