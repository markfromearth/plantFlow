import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { QrCode, ArrowLeft } from 'lucide-react';
import { Booking, Equipment } from '../../types';

export default function QrDisplay() {
  const location = useLocation();
  const state = location.state as { booking: Booking; equipment: Equipment; action: 'start' | 'end' } | null;

  if (!state || !state.booking) {
    return <Navigate to="/customer" replace />;
  }

  const { booking, equipment, action } = state;
  const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(booking.booking_id)}&size=300&margin=1`;
  const isStart = action === 'start';

  return (
    <div className="max-w-md mx-auto pt-8">
      <Link to="/customer/booking-success" state={{ booking, equipment }} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-6 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Booking
      </Link>

      <div className="bg-white rounded-3xl p-8 text-center shadow-xl border border-slate-100 flex flex-col items-center">
        <div className={`p-4 rounded-full mb-4 ${isStart ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
          <QrCode className="w-8 h-8" />
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 mb-2">
          {isStart ? 'Start Hire QR' : 'End Hire QR'}
        </h1>
        <p className="text-slate-500 mb-8 max-w-sm">
          Show this code to the delivery driver or depot staff to {isStart ? 'receive' : 'return'} your {equipment.name}.
        </p>

        <div className="bg-white p-4 rounded-2xl mb-8 shadow-inner border border-slate-200">
          <img src={qrUrl} alt="Booking QR Code" className="w-[250px] h-[250px] object-contain" />
        </div>

        <div className="w-full bg-slate-50 rounded-xl p-4 border border-slate-100">
          <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase mb-1">Booking ID</h3>
          <p className="font-mono text-lg text-slate-900 font-bold tracking-widest">
            {booking.booking_id}
          </p>
        </div>
      </div>
    </div>
  );
}
