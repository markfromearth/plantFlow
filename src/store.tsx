import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Equipment, Booking, EquipmentStatus, BookingStatus } from './types';
import { INITIAL_EQUIPMENT, INITIAL_BOOKINGS } from './mockData';
import { addEquipment as dbAddEquipment, updateEquipmentStatus as dbUpdateEquipmentStatus, listEquipment as dbListEquipment } from './equipmentService';
import { createBooking as dbCreateBooking, updateBookingStatus as dbUpdateBookingStatus, listBookings as dbListBookings } from './bookingService';

interface StoreState {
  equipment: Equipment[];
  bookings: Booking[];
  highVisMode: boolean;
  isLoadingEquipment: boolean;
  isLoadingBookings: boolean;
  errorEquipment: string | null;
  errorBookings: string | null;
}

interface StoreContextType extends StoreState {
  addBooking: (booking: Booking) => Promise<void>;
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  updateEquipmentStatus: (id: string, status: EquipmentStatus) => void;
  addEquipment: (equipment: Equipment) => void;
  startHire: (id: string) => void;
  endHire: (id: string) => void;
  toggleHighVisMode: () => void;
  init: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [equipment, setEquipment] = useState<Equipment[]>(INITIAL_EQUIPMENT);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [highVisMode, setHighVisMode] = useState(false);
  const [isLoadingEquipment, setIsLoadingEquipment] = useState(false);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [errorEquipment, setErrorEquipment] = useState<string | null>(null);
  const [errorBookings, setErrorBookings] = useState<string | null>(null);

  const init = async () => {
    setIsLoadingEquipment(true);
    setIsLoadingBookings(true);
    setErrorEquipment(null);
    setErrorBookings(null);

    try {
      const equips = await dbListEquipment();
      if (equips.length > 0) {
        setEquipment(equips);
      }
    } catch (e: any) {
      console.warn("Firebase list equipment failed, falling back to local data.", e.message);
      // We don't set errorEquipment so the UI doesn't show an error state
    } finally {
      setIsLoadingEquipment(false);
    }

    try {
      const dbBookings = await dbListBookings();
      if (dbBookings.length > 0) {
        setBookings(dbBookings);
      }
    } catch (e: any) {
      console.warn("Firebase list bookings failed, falling back to local data.", e.message);
      // We don't set errorBookings so the UI doesn't show an error state
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const toggleHighVisMode = () => setHighVisMode(prev => !prev);


  const addBooking = async (booking: Booking) => {
    setIsLoadingBookings(true);
    setErrorBookings(null);
    try {
      const payload: Omit<Booking, 'booking_id' | 'timestamp_created'> = {
        machine_id: booking.machine_id,
        hirer_name: booking.hirer_name,
        hirer_phone: booking.hirer_phone,
        hirer_email: booking.hirer_email,
        site_address: booking.site_address,
        start_date: booking.start_date,
        end_date: booking.end_date,
        delivery_window: booking.delivery_window,
        status: booking.status,
        qr_start_code: booking.qr_start_code,
        qr_end_code: booking.qr_end_code,
        totalCost: booking.totalCost,
        deliveryNeeded: booking.deliveryNeeded
      };
      
      const newBooking = await dbCreateBooking(payload);
      setBookings(prev => [...prev, newBooking]);
    } catch (e: any) {
      console.error("Firebase add booking failed:", e.message);
      setErrorBookings(e.message || "Failed to add booking");
      throw e;
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const updateBookingStatus = async (id: string, status: BookingStatus) => {
    setIsLoadingBookings(true);
    setErrorBookings(null);
    try {
      await dbUpdateBookingStatus(id, status);
    } catch (e: any) {
      console.warn("Firebase update booking status failed, updating local state only.", e.message);
    } finally {
      setBookings(prev => prev.map(b => b.booking_id === id ? { ...b, status } : b));
      setIsLoadingBookings(false);
    }
  };

  const updateEquipmentStatus = async (id: string, status: EquipmentStatus) => {
    setIsLoadingEquipment(true);
    setErrorEquipment(null);
    try {
      await dbUpdateEquipmentStatus(id, status);
    } catch (e: any) {
      console.warn("Firebase update equipment status failed, updating local state only.", e.message);
    } finally {
      setEquipment(prev => prev.map(e => e.machine_id === id ? { ...e, availability_status: status } : e));
      setIsLoadingEquipment(false);
    }
  };

  const addEquipment = async (equipment: Equipment) => {
    setIsLoadingEquipment(true);
    setErrorEquipment(null);
    try {
      const payload: Omit<Equipment, 'machine_id'> = {
        name: equipment.name,
        category: equipment.category,
        job_fit: equipment.job_fit,
        access_width_mm: equipment.access_width_mm,
        day_rate: equipment.day_rate,
        delivery_rate: equipment.delivery_rate,
        availability_status: equipment.availability_status,
        compliance_expiry: equipment.compliance_expiry,
        image_url: equipment.image_url,
        notes: equipment.notes
      };
      
      const newEquip = await dbAddEquipment(payload);
      setEquipment(prev => [...prev, newEquip]);
    } catch (e: any) {
      console.warn("Firebase add equipment failed, falling back to local state.", e.message);
      const newEquip: Equipment = {
        ...equipment,
        machine_id: `mock-equip-${Date.now()}`,
      };
      setEquipment(prev => [...prev, newEquip]);
    } finally {
      setIsLoadingEquipment(false);
    }
  };

  const startHire = async (id: string) => {
    const booking = bookings.find(b => b.booking_id === id);
    if (!booking) return;
    
    setIsLoadingBookings(true);
    setErrorBookings(null);
    try {
      await dbUpdateBookingStatus(id, 'active');
      await dbUpdateEquipmentStatus(booking.machine_id, 'hired');
    } catch (e: any) {
      console.warn("Firebase start hire failed, updating local state only.", e.message);
    } finally {
      setBookings(prev => prev.map(b => b.booking_id === id ? { ...b, status: 'active' } : b));
      setEquipment(prev => prev.map(e => e.machine_id === booking.machine_id ? { ...e, availability_status: 'hired' } : e));
      setIsLoadingBookings(false);
    }
  };

  const endHire = async (id: string) => {
    const booking = bookings.find(b => b.booking_id === id);
    if (!booking) return;
    
    setIsLoadingBookings(true);
    setErrorBookings(null);
    try {
      await dbUpdateBookingStatus(id, 'completed');
      await dbUpdateEquipmentStatus(booking.machine_id, 'available');
    } catch (e: any) {
      console.warn("Firebase end hire failed, updating local state only.", e.message);
    } finally {
      setBookings(prev => prev.map(b => b.booking_id === id ? { ...b, status: 'completed' } : b));
      setEquipment(prev => prev.map(e => e.machine_id === booking.machine_id ? { ...e, availability_status: 'available' } : e));
      setIsLoadingBookings(false);
    }
  };

  return (
    <StoreContext.Provider value={{
      equipment,
      bookings,
      highVisMode,
      isLoadingEquipment,
      isLoadingBookings,
      errorEquipment,
      errorBookings,
      addBooking,
      updateBookingStatus,
      updateEquipmentStatus,
      addEquipment,
      startHire,
      endHire,
      toggleHighVisMode,
      init
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
