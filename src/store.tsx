import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Equipment, Booking, EquipmentStatus, BookingStatus } from './types';
import { INITIAL_EQUIPMENT, INITIAL_BOOKINGS } from './mockData';

interface StoreState {
  equipment: Equipment[];
  bookings: Booking[];
  highVisMode: boolean;
}

interface StoreContextType extends StoreState {
  addBooking: (booking: Booking) => void;
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  updateEquipmentStatus: (id: string, status: EquipmentStatus) => void;
  addEquipment: (equipment: Equipment) => void;
  startHire: (id: string) => void;
  endHire: (id: string) => void;
  toggleHighVisMode: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [equipment, setEquipment] = useState<Equipment[]>(INITIAL_EQUIPMENT);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [highVisMode, setHighVisMode] = useState(false);

  const toggleHighVisMode = () => setHighVisMode(prev => !prev);

  const addBooking = (booking: Booking) => {
    setBookings(prev => [...prev, booking]);
    // Also reserve equipment temporarily if not active yet
    // updateEquipmentStatus(booking.machine_id, 'hired'); // Could do if it's right away
  };

  const updateBookingStatus = (id: string, status: BookingStatus) => {
    setBookings(prev => prev.map(b => b.booking_id === id ? { ...b, status } : b));
  };

  const updateEquipmentStatus = (id: string, status: EquipmentStatus) => {
    setEquipment(prev => prev.map(e => e.machine_id === id ? { ...e, availability_status: status } : e));
  };

  const addEquipment = (equipment: Equipment) => {
    setEquipment(prev => [...prev, equipment]);
  };

  const startHire = (id: string) => {
    const booking = bookings.find(b => b.booking_id === id);
    if (!booking) return;
    
    updateBookingStatus(id, 'active');
    updateEquipmentStatus(booking.machine_id, 'hired');
  };

  const endHire = (id: string) => {
    const booking = bookings.find(b => b.booking_id === id);
    if (!booking) return;
    
    updateBookingStatus(id, 'completed');
    updateEquipmentStatus(booking.machine_id, 'available');
  };

  return (
    <StoreContext.Provider value={{
      equipment,
      bookings,
      highVisMode,
      addBooking,
      updateBookingStatus,
      updateEquipmentStatus,
      addEquipment,
      startHire,
      endHire,
      toggleHighVisMode
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
