import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Equipment, Booking, EquipmentStatus, BookingStatus } from './types';
import { INITIAL_EQUIPMENT, INITIAL_BOOKINGS } from './mockData';
import { addEquipment as dbAddEquipment, updateEquipmentStatus as dbUpdateEquipmentStatus, listEquipment as dbListEquipment } from './equipmentService';
import { createBooking as dbCreateBooking, updateBookingStatus as dbUpdateBookingStatus, listBookings as dbListBookings } from './bookingService';
import { Equipment as ModelEquipment, Booking as ModelBooking } from './models';

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
  addBooking: (booking: Booking) => void;
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
      const modelEquips = await dbListEquipment();
      if (modelEquips.length > 0) {
        const uiEquips: Equipment[] = modelEquips.map(e => ({
          machine_id: e.id,
          name: e.name,
          category: e.category,
          job_fit: 'General Use',
          access_width_mm: 1000,
          day_rate: e.dailyRate,
          delivery_rate: 50,
          availability_status: e.status as EquipmentStatus,
          compliance_expiry: new Date().toISOString(),
          image_url: e.imageUrl,
          notes: ''
        }));
        setEquipment(uiEquips);
      }
    } catch (e: any) {
      console.error("Failed to list equipment", e);
      setErrorEquipment(e.message || "Failed to load equipment");
    } finally {
      setIsLoadingEquipment(false);
    }

    try {
      const modelBookings = await dbListBookings();
      if (modelBookings.length > 0) {
        const uiBookings: Booking[] = modelBookings.map(b => ({
          booking_id: b.id,
          machine_id: b.equipmentId,
          hirer_name: b.customerName,
          hirer_phone: '',
          hirer_email: '',
          site_address: b.siteAddress,
          start_date: b.startDate,
          end_date: b.endDate,
          delivery_window: 'AM',
          status: b.status as BookingStatus,
          qr_start_code: `qr-start-${b.id}`,
          qr_end_code: `qr-end-${b.id}`,
          timestamp_created: b.createdAt,
          totalCost: 0,
          deliveryNeeded: false
        }));
        setBookings(uiBookings);
      }
    } catch (e: any) {
      console.error("Failed to list bookings", e);
      setErrorBookings(e.message || "Failed to load bookings");
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const toggleHighVisMode = () => setHighVisMode(prev => !prev);


  const addBooking = async (booking: Booking) => {
    setIsLoadingBookings(true);
    setErrorBookings(null);
    try {
      const payload: Omit<ModelBooking, 'id' | 'createdAt'> = {
        equipmentId: booking.machine_id,
        customerName: booking.hirer_name,
        siteAddress: booking.site_address,
        startDate: booking.start_date,
        endDate: booking.end_date,
        status: booking.status as any,
      };
      
      const newModelBooking = await dbCreateBooking(payload);
      
      const newBooking: Booking = {
        ...booking,
        booking_id: newModelBooking.id,
        timestamp_created: newModelBooking.createdAt,
      };
      
      setBookings(prev => [...prev, newBooking]);
    } catch (e: any) {
      console.error("Failed to add booking", e);
      setErrorBookings(e.message || "Failed to add booking");
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const updateBookingStatus = async (id: string, status: BookingStatus) => {
    setIsLoadingBookings(true);
    setErrorBookings(null);
    try {
      await dbUpdateBookingStatus(id, status as any);
      setBookings(prev => prev.map(b => b.booking_id === id ? { ...b, status } : b));
    } catch (e: any) {
      console.error("Failed to update booking status", e);
      setErrorBookings(e.message || "Failed to update booking status");
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const updateEquipmentStatus = async (id: string, status: EquipmentStatus) => {
    setIsLoadingEquipment(true);
    setErrorEquipment(null);
    try {
      await dbUpdateEquipmentStatus(id, status as any);
      setEquipment(prev => prev.map(e => e.machine_id === id ? { ...e, availability_status: status } : e));
    } catch (e: any) {
      console.error("Failed to update equipment status", e);
      setErrorEquipment(e.message || "Failed to update equipment status");
    } finally {
      setIsLoadingEquipment(false);
    }
  };

  const addEquipment = async (equipment: Equipment) => {
    setIsLoadingEquipment(true);
    setErrorEquipment(null);
    try {
      const payload: Omit<ModelEquipment, 'id'> = {
        name: equipment.name,
        make: 'Unknown',
        model: 'Unknown',
        category: equipment.category,
        dailyRate: equipment.day_rate,
        imageUrl: equipment.image_url,
        status: equipment.availability_status as any,
      };
      
      const newModelEquip = await dbAddEquipment(payload);
      
      const newEquip: Equipment = {
        ...equipment,
        machine_id: newModelEquip.id,
      };
      
      setEquipment(prev => [...prev, newEquip]);
    } catch (e: any) {
      console.error("Failed to add equipment", e);
      setErrorEquipment(e.message || "Failed to add equipment");
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
      await updateBookingStatus(id, 'active');
      await updateEquipmentStatus(booking.machine_id, 'hired');
    } catch (e: any) {
      console.error("Failed to start hire", e);
      setErrorBookings(e.message || "Failed to start hire");
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const endHire = async (id: string) => {
    const booking = bookings.find(b => b.booking_id === id);
    if (!booking) return;
    
    setIsLoadingBookings(true);
    setErrorBookings(null);
    try {
      await updateBookingStatus(id, 'completed');
      await updateEquipmentStatus(booking.machine_id, 'available');
    } catch (e: any) {
      console.error("Failed to end hire", e);
      setErrorBookings(e.message || "Failed to end hire");
    } finally {
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
